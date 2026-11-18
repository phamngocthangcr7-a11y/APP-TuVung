// =========================================================================
// QUẢN LÝ DỮ LIỆU TỪ VỰNG & LOCAL STORAGE
// Hỗ trợ lưu từ vựng hàng ngày, phân loại theo tuần, sao lưu & phục hồi
// =========================================================================

import { getTodayDateString } from './srs';
import { MASTER_PRESET_WORDS } from '../data/masterPresetWords';
import { 
  CURATED_TOEIC_EXAMPLES, 
  isBadTemplateSentence, 
  inferPartOfSpeech, 
  fetchAuthenticSentence,
  lookupEnglishPronunciation,
  correctVietnameseSpelling,
  getToeicExampleFallback
} from './dictionary';

const STORAGE_KEYS = {
  CUSTOM_WORDS: 'toeic_custom_words_v2',
  CUSTOM_WORDS_BACKUP: 'toeic_custom_words_v2_backup',
  MASTER_VAULT: 'toeic_custom_words_master_vault', // Kho lưu trữ bất biến (Bảo vệ tuyệt đối - Chỉ gộp thêm, không bao giờ xóa mất từ)
  BATCH_HISTORY: 'toeic_batch_import_history_v2', // Lịch sử lưu lại các đợt dán từ vựng (chống mất văn bản đã dán)
  CUSTOM_FOLDERS: 'toeic_custom_folders_v2',
  WORD_SRS_PROGRESS: 'toeic_word_srs_progress_v2',
  STREAK_INFO: 'toeic_study_streak_v2',
  FAVORITES: 'toeic_favorite_ids_v2',
  SETTINGS: 'toeic_app_settings_v2',
  BATCH_DRAFT: 'toeic_batch_import_draft'
};

/**
 * Quản lý lịch sử các đợt dán từ vựng hàng loạt (Lưu giữ tối đa 15 đợt dán gần nhất)
 */
export const getBatchHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BATCH_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
};

export const saveBatchHistory = (rawText, words = []) => {
  try {
    if (!rawText || !rawText.trim()) return;
    const raw = localStorage.getItem(STORAGE_KEYS.BATCH_HISTORY);
    let history = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(history)) history = [];

    const cleanSample = (words || []).slice(0, 6).map(w => w?.word || '').filter(Boolean);
    const count = words.length > 0 ? words.length : rawText.split(/\r?\n/).filter(l => l.trim()).length;

    const newEntry = {
      id: 'batch_' + Date.now(),
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      text: rawText,
      count,
      sampleWords: cleanSample
    };

    // Kiểm tra xem nội dung này đã được lưu gần nhất chưa để tránh trùng lặp
    if (history.length > 0 && history[0].text.trim() === rawText.trim()) {
      return;
    }

    history.unshift(newEntry);
    if (history.length > 15) history = history.slice(0, 15);
    localStorage.setItem(STORAGE_KEYS.BATCH_HISTORY, JSON.stringify(history));
  } catch (e) {
    console.warn('Lỗi lưu lịch sử nạp từ:', e);
  }
};

/**
 * Gộp hai danh sách từ vựng thông minh (Deduplication + Giữ nguyên dữ liệu tốt nhất)
 * Tuyệt đối không bao giờ làm mất từ vựng đã có.
 */
export const mergeWordLists = (existingList = [], incomingList = []) => {
  const map = new Map();

  const addOrUpdate = (w) => {
    if (!w || !w.word || typeof w !== 'object') return;
    const cleanWord = String(w.word).trim();
    if (!cleanWord || cleanWord === '-') return;
    const key = cleanWord.toLowerCase();

    if (!map.has(key)) {
      map.set(key, { ...w, word: cleanWord });
    } else {
      const prev = map.get(key);
      const prevEx = (prev.example || '').trim();
      const newEx = (w.example || '').trim();

      const betterExample = (newEx.length > prevEx.length && !isBadTemplateSentence(newEx))
        ? newEx
        : prevEx;
      const betterTranslation = (betterExample === newEx)
        ? (w.exampleTranslation || prev.exampleTranslation || '')
        : (prev.exampleTranslation || w.exampleTranslation || '');

      const prevMeaning = (prev.meaning || '').trim();
      const newMeaning = (w.meaning || '').trim();
      const betterMeaning = newMeaning.length > prevMeaning.length ? newMeaning : prevMeaning;

      const betterPron = (w.pronunciation && String(w.pronunciation).trim() !== '')
        ? w.pronunciation
        : (prev.pronunciation || '');

      const betterPos = (w.partOfSpeech && w.partOfSpeech !== 'noun')
        ? w.partOfSpeech
        : (prev.partOfSpeech || 'noun');

      const prevReps = prev.srs?.repetitions || 0;
      const newReps = w.srs?.repetitions || 0;
      const betterSrs = newReps > prevReps ? w.srs : prev.srs;

      map.set(key, {
        ...prev,
        ...w,
        word: cleanWord,
        meaning: betterMeaning || prevMeaning,
        example: betterExample || prevEx,
        exampleTranslation: betterTranslation,
        pronunciation: betterPron,
        partOfSpeech: betterPos,
        srs: betterSrs || prev.srs || {
          repetitions: 0,
          interval: 0,
          easeFactor: 2.5,
          nextReviewDate: prev.addedDate || getTodayDateString(),
          state: 'new'
        },
        id: prev.id || w.id
      });
    }
  };

  (existingList || []).forEach(addOrUpdate);
  (incomingList || []).forEach(addOrUpdate);

  return Array.from(map.values());
};

/**
 * QUÉT SÂU TOÀN DIỆN & PHỤC HỒI TỪ VỰNG TỪ MỌI NGUỒN LƯU TRỮ (DEEP RECOVERY)
 * Quét Master Vault, Backup, Draft, Lịch sử, Legacy Keys, và quét từng key trong localStorage/sessionStorage.
 */
export const deepRecoverCustomWords = () => {
  const candidates = [];

  // 1. Kho bất biến Master Vault
  try {
    const rawVault = localStorage.getItem(STORAGE_KEYS.MASTER_VAULT);
    if (rawVault) {
      const parsed = JSON.parse(rawVault);
      if (Array.isArray(parsed)) candidates.push(...parsed);
    }
  } catch (_) {}

  // 2. Khóa chính
  try {
    const rawCustom = localStorage.getItem(STORAGE_KEYS.CUSTOM_WORDS);
    if (rawCustom) {
      const parsed = JSON.parse(rawCustom);
      if (Array.isArray(parsed)) candidates.push(...parsed);
    }
  } catch (_) {}

  // 3. Khóa sao lưu dự phòng
  try {
    const rawBackup = localStorage.getItem(STORAGE_KEYS.CUSTOM_WORDS_BACKUP);
    if (rawBackup) {
      const parsed = JSON.parse(rawBackup);
      if (Array.isArray(parsed)) candidates.push(...parsed);
    }
  } catch (_) {}

  // 4. Lịch sử các lần dán từ
  try {
    const rawHistory = localStorage.getItem(STORAGE_KEYS.BATCH_HISTORY);
    if (rawHistory) {
      const parsedHistory = JSON.parse(rawHistory);
      if (Array.isArray(parsedHistory)) {
        parsedHistory.forEach(item => {
          if (item?.text) {
            const lines = item.text.split(/\r?\n/);
            lines.forEach(l => {
              const line = l.trim().replace(/^(\d+[\.\/\)\-\:]|\*|\•|\-|\+|\[\d+\]|\(\d+\))\s*/, '').trim();
              if (!line || line.startsWith('//') || line.startsWith('#')) return;
              const parts = line.split(/[|\t\-–—:;]/).map(p => p.trim());
              const w = parts[0]?.replace(/^['"`]+|['"`]+$/g, '').trim();
              if (w && w !== '-' && w.length >= 2) {
                candidates.push({
                  id: 'usr_rec_' + Math.random().toString(36).substring(2, 7),
                  word: w,
                  meaning: parts[1] || '',
                  example: parts[2] || '',
                  exampleTranslation: parts[3] || '',
                  addedDate: getTodayDateString()
                });
              }
            });
          }
        });
      }
    }
  } catch (_) {}

  // 5. Bản nháp dán từ
  try {
    const draft = localStorage.getItem(STORAGE_KEYS.BATCH_DRAFT);
    if (draft && draft.trim()) {
      const lines = draft.split(/\r?\n/);
      lines.forEach(l => {
        const line = l.trim().replace(/^(\d+[\.\/\)\-\:]|\*|\•|\-|\+|\[\d+\]|\(\d+\))\s*/, '').trim();
        if (!line || line.startsWith('//') || line.startsWith('#')) return;
        const parts = line.split(/[|\t\-–—:;]/).map(p => p.trim());
        const w = parts[0]?.replace(/^['"`]+|['"`]+$/g, '').trim();
        if (w && w !== '-' && w.length >= 2) {
          candidates.push({
            id: 'usr_draft_' + Math.random().toString(36).substring(2, 7),
            word: w,
            meaning: parts[1] || '',
            example: parts[2] || '',
            exampleTranslation: parts[3] || '',
            addedDate: getTodayDateString()
          });
        }
      });
    }
  } catch (_) {}

  // 6. Các khóa cũ trong các phiên bản trước (Legacy Keys)
  const legacyKeys = [
    'toeic_custom_words',
    'custom_words',
    'toeic_words',
    'toeic_user_words',
    'toeic_words_list',
    'toeic_vocab_user',
    'toeic_app_data',
    'toeic_custom_backup'
  ];
  legacyKeys.forEach(k => {
    try {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) candidates.push(...parsed);
        else if (parsed && Array.isArray(parsed.customWords)) candidates.push(...parsed.customWords);
      }
    } catch (_) {}
  });

  // 7. Quét toàn bộ mọi khóa có trong localStorage
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if ([STORAGE_KEYS.SETTINGS, STORAGE_KEYS.STREAK_INFO, STORAGE_KEYS.FAVORITES].includes(key)) continue;
      const val = localStorage.getItem(key);
      if (val && (val.includes('"word"') || val.includes('"meaning"'))) {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) {
            parsed.forEach(item => {
              if (item && item.word && typeof item.word === 'string') {
                candidates.push(item);
              }
            });
          } else if (parsed && typeof parsed === 'object') {
            if (Array.isArray(parsed.words)) candidates.push(...parsed.words);
            if (Array.isArray(parsed.customWords)) candidates.push(...parsed.customWords);
          }
        } catch (_) {}
      }
    }
  } catch (_) {}

  // 8. Quét cả sessionStorage nếu có
  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (!key) continue;
      const val = sessionStorage.getItem(key);
      if (val && val.includes('"word"')) {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) candidates.push(...parsed);
        } catch (_) {}
      }
    }
  } catch (_) {}

  // 9. Kho từ gốc 298 từ ETS đã phục hồi từ hệ thống (Bảo vệ tối thượng - Chống mất vĩnh viễn)
  if (Array.isArray(MASTER_PRESET_WORDS) && MASTER_PRESET_WORDS.length > 0) {
    candidates.push(...MASTER_PRESET_WORDS);
  }

  // Gộp tất cả các từ tìm được
  const merged = mergeWordLists([], candidates);

  // Đồng bộ và bảo vệ vào tất cả các khóa kho lưu trữ
  if (merged.length > 0) {
    try {
      localStorage.setItem(STORAGE_KEYS.MASTER_VAULT, JSON.stringify(merged));
      localStorage.setItem(STORAGE_KEYS.CUSTOM_WORDS, JSON.stringify(merged));
      localStorage.setItem(STORAGE_KEYS.CUSTOM_WORDS_BACKUP, JSON.stringify(merged));
    } catch (e) {
      console.warn('Lỗi ghi dữ liệu khôi phục:', e);
    }
  }

  return merged;
};

/**
 * Quản lý bản nháp nhập từ hàng loạt để không bao giờ bị mất chữ khi đang gõ
 */
export const getBatchDraft = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.BATCH_DRAFT) || '';
  } catch (_) {
    return '';
  }
};

export const saveBatchDraft = (text) => {
  try {
    if (text) {
      localStorage.setItem(STORAGE_KEYS.BATCH_DRAFT, text);
    } else {
      localStorage.removeItem(STORAGE_KEYS.BATCH_DRAFT);
    }
  } catch (_) {}
};

export const clearBatchDraft = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.BATCH_DRAFT);
  } catch (_) {}
};

/**
 * Lấy số tuần trong năm (ISO Week Number)
 */
export const getWeekNumber = (d = new Date()) => {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target) / 604800000);
};

/**
 * Lấy danh sách từ người dùng tự thêm (Bảo vệ 3 lớp chống mất dữ liệu + Tự động phục hồi Master Vault)
 */
export const getCustomWords = () => {
  try {
    let raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_WORDS);
    let list = raw ? JSON.parse(raw) : [];

    let vaultRaw = localStorage.getItem(STORAGE_KEYS.MASTER_VAULT);
    let vaultList = vaultRaw ? JSON.parse(vaultRaw) : [];

    // LỚP 1: Nếu danh sách chính bị giảm hoặc ít hơn Master Vault hoặc ít hơn kho gốc (226+ từ) -> Deep Recovery & Merge ngay!
    const minThreshold = Array.isArray(MASTER_PRESET_WORDS) ? MASTER_PRESET_WORDS.length : 226;
    if (!Array.isArray(list) || list.length < minThreshold || (Array.isArray(vaultList) && list.length < vaultList.length)) {
      list = deepRecoverCustomWords();
    }

    // LỚP 2: Nếu vẫn trống, tìm bản sao lưu dự phòng
    if (!Array.isArray(list) || list.length === 0) {
      const backupRaw = localStorage.getItem(STORAGE_KEYS.CUSTOM_WORDS_BACKUP);
      if (backupRaw) {
        try {
          const backupList = JSON.parse(backupRaw);
          if (Array.isArray(backupList) && backupList.length > 0) {
            list = backupList;
            localStorage.setItem(STORAGE_KEYS.CUSTOM_WORDS, JSON.stringify(list));
            localStorage.setItem(STORAGE_KEYS.MASTER_VAULT, JSON.stringify(list));
            console.log('🔄 Đã tự động khôi phục từ vựng từ bản sao lưu dự phòng!');
          }
        } catch (e) {
          console.warn('Lỗi đọc bản sao lưu:', e);
        }
      }
    }

    if (!Array.isArray(list)) list = [];
    let modified = false;

    const enriched = list.map(w => {
      if (!w || !w.word) return w;
      const item = { ...w };
      const lower = (item.word || '').trim().toLowerCase();

      // 1. Tẩy sạch triệt để câu ghép từ lỗi Mad-libs (VD: "The committee submitted a report on the...")
      if (isBadTemplateSentence(item.example, item.exampleTranslation)) {
        item.example = '';
        item.exampleTranslation = '';
        modified = true;
      }

      // 2. Tự động kiểm tra và sửa lỗi chính tả tiếng Việt trong nghĩa (VD: "bởi vị" -> "do, bởi vì")
      const cleanedMeaning = correctVietnameseSpelling(item.meaning);
      if (cleanedMeaning && cleanedMeaning !== item.meaning) {
        item.meaning = cleanedMeaning;
        modified = true;
      }

      // Bổ sung nghĩa chuẩn từ kho ETS nếu từ chưa có nghĩa
      if ((!item.meaning || item.meaning.trim() === '') && CURATED_TOEIC_EXAMPLES[lower]?.meaning) {
        item.meaning = CURATED_TOEIC_EXAMPLES[lower].meaning;
        modified = true;
      }

      // 3. Tự động bổ sung câu ví dụ chuẩn ETS hoặc câu ngữ cảnh thực tế (ĐẢM BẢO 100% CÓ CÂU VÍ DỤ VÀ DỊCH)
      if (!item.example || String(item.example).trim() === '') {
        const fallback = getToeicExampleFallback(item.word, item.partOfSpeech, item.meaning);
        if (fallback.example) {
          item.example = fallback.example;
          item.exampleTranslation = fallback.translation;
          modified = true;
        }
      }

      // 4. Tự động bổ sung phiên âm chuẩn nếu chưa có
      if ((!item.pronunciation || String(item.pronunciation).trim() === '') && CURATED_TOEIC_EXAMPLES[lower]?.pronunciation) {
        item.pronunciation = CURATED_TOEIC_EXAMPLES[lower].pronunciation;
        modified = true;
      }

      // 5. Chuẩn hóa lại loại từ nếu bị gán mặc định là noun (như "owing to" là prep, "northeastern" là adj)
      const correctPos = CURATED_TOEIC_EXAMPLES[lower]?.partOfSpeech || inferPartOfSpeech(item.word);
      if (correctPos && correctPos !== item.partOfSpeech) {
        item.partOfSpeech = correctPos;
        modified = true;
      }

      return item;
    });

    if (modified) {
      saveCustomWords(enriched);
    }
    return enriched;
  } catch (err) {
    console.error('Error reading custom words:', err);
    return [];
  }
};

/**
 * Lưu danh sách từ người dùng tự thêm (Bảo vệ Master Vault: Luôn gộp, không bao giờ làm co ngắn kho từ)
 */
export const saveCustomWords = (words) => {
  try {
    if (!Array.isArray(words)) return;
    const clean = words.filter(w => w && typeof w === 'object' && w.word && String(w.word).trim() !== '' && String(w.word).trim() !== '-');

    // Luôn lấy Master Vault hiện tại và GỘP lại, KHÔNG BAO GIỜ để kho từ vựng bị bốc hơi
    let vault = [];
    try {
      const rawVault = localStorage.getItem(STORAGE_KEYS.MASTER_VAULT);
      if (rawVault) vault = JSON.parse(rawVault) || [];
    } catch (_) {}

    // Gộp danh sách mới vào Master Vault
    const mergedVault = mergeWordLists(vault, clean);

    // Luôn ghi vào Master Vault
    localStorage.setItem(STORAGE_KEYS.MASTER_VAULT, JSON.stringify(mergedVault));

    // Nếu clean ít từ hơn mergedVault rõ rệt (ví dụ clean chỉ có vài từ trong khi vault có hàng trăm từ),
    // ta ghi mergedVault vào CUSTOM_WORDS để bảo toàn kho từ cho người dùng!
    const toSave = (clean.length < mergedVault.length && (clean.length <= 15 || mergedVault.length > 30)) ? mergedVault : clean;
    localStorage.setItem(STORAGE_KEYS.CUSTOM_WORDS, JSON.stringify(toSave));

    // Khóa Backup luôn lưu giữ phiên bản có nhiều từ nhất
    let currentBackup = [];
    try {
      const bRaw = localStorage.getItem(STORAGE_KEYS.CUSTOM_WORDS_BACKUP);
      if (bRaw) currentBackup = JSON.parse(bRaw) || [];
    } catch (_) {}

    if (mergedVault.length >= currentBackup.length) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_WORDS_BACKUP, JSON.stringify(mergedVault));
    }
  } catch (err) {
    console.error('Error saving custom words:', err);
  }
};

/**
 * Thêm một từ mới (Ưu tiên ví dụ chuẩn, không bao giờ tự sinh câu ghép từ lỗi)
 */
export const addCustomWord = (wordData) => {
  const words = getCustomWords();
  const today = getTodayDateString();
  const weekNum = getWeekNumber(new Date());

  const cleanWord = (wordData.word || '').trim();
  const lower = cleanWord.toLowerCase();
  const curated = CURATED_TOEIC_EXAMPLES[lower];

  const cleanedMeaning = correctVietnameseSpelling(wordData.meaning || curated?.meaning || '');

  let example = (wordData.example || '').trim();
  let exampleTranslation = (wordData.exampleTranslation || '').trim();

  // Tẩy rửa nếu người dùng hoặc hệ thống lưu câu mẫu mad-libs
  if (isBadTemplateSentence(example, exampleTranslation)) {
    example = '';
    exampleTranslation = '';
  }

  const determinedPos = wordData.partOfSpeech && wordData.partOfSpeech !== 'noun'
    ? wordData.partOfSpeech
    : (curated?.partOfSpeech || inferPartOfSpeech(cleanWord));

  // Tự động lấy câu mẫu chuẩn nếu từ chưa có ví dụ
  if (!example) {
    if (curated?.example) {
      example = curated.example;
      exampleTranslation = curated.translation;
    } else {
      const fallback = getToeicExampleFallback(cleanWord, determinedPos, cleanedMeaning);
      example = fallback.example;
      exampleTranslation = fallback.translation;
    }
  }

  const newWord = {
    id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    word: cleanWord,
    pronunciation: (wordData.pronunciation || '').trim() || (curated?.pronunciation || ''),
    meaning: cleanedMeaning || '(Từ mới)',
    partOfSpeech: determinedPos,
    example,
    exampleTranslation,
    note: (wordData.note || '').trim(),
    tags: Array.isArray(wordData.tags) ? wordData.tags : (wordData.tags ? [wordData.tags] : []),
    folderId: wordData.folderId || 'daily',
    addedDate: wordData.addedDate || today,
    weekNumber: wordData.weekNumber || weekNum,
    year: new Date().getFullYear(),
    isFavorite: false,
    mistakeCount: 0,
    srs: {
      repetitions: 0,
      interval: 0,
      easeFactor: 2.5,
      nextReviewDate: today,
      state: 'new'
    }
  };

  words.unshift(newWord);
  saveCustomWords(words);
  return newWord;
};

/**
 * Thêm nhiều từ cùng lúc (Batch Import)
 */
export const addBatchCustomWords = (wordsList) => {
  const currentWords = getCustomWords();
  const today = getTodayDateString();
  const weekNum = getWeekNumber(new Date());

  const formattedWords = wordsList.map((w, index) => {
    const cleanWord = (w.word || '').trim();
    const lower = cleanWord.toLowerCase();
    const curated = CURATED_TOEIC_EXAMPLES[lower];

    const cleanedMeaning = correctVietnameseSpelling(w.meaning || curated?.meaning || '');

    let example = (w.example || '').trim();
    let exampleTranslation = (w.exampleTranslation || '').trim();

    if (isBadTemplateSentence(example, exampleTranslation)) {
      example = '';
      exampleTranslation = '';
    }

    const determinedPos = w.partOfSpeech && w.partOfSpeech !== 'noun'
      ? w.partOfSpeech
      : (curated?.partOfSpeech || inferPartOfSpeech(cleanWord));

    if (!example) {
      if (curated?.example) {
        example = curated.example;
        exampleTranslation = curated.translation;
      } else {
        const fallback = getToeicExampleFallback(cleanWord, determinedPos, cleanedMeaning);
        example = fallback.example;
        exampleTranslation = fallback.translation;
      }
    }

    return {
      id: 'usr_' + (Date.now() + index) + '_' + Math.random().toString(36).substring(2, 6),
      word: cleanWord,
      pronunciation: (w.pronunciation || '').trim() || (curated?.pronunciation || ''),
      meaning: cleanedMeaning || '(Từ mới)',
      partOfSpeech: determinedPos,
      example,
      exampleTranslation,
      note: (w.note || '').trim(),
      tags: Array.isArray(w.tags) ? w.tags : (w.tags ? [w.tags] : ['Nhập hàng loạt']),
      folderId: w.folderId || 'daily',
      addedDate: w.addedDate || today,
      weekNumber: weekNum,
      year: new Date().getFullYear(),
      isFavorite: false,
      mistakeCount: 0,
      srs: {
        repetitions: 0,
        interval: 0,
        easeFactor: 2.5,
        nextReviewDate: today,
        state: 'new'
      }
    };
  });

  const updated = mergeWordLists(currentWords, formattedWords);
  saveCustomWords(updated);
  return formattedWords;
};

/**
 * Tự động tìm câu ví dụ thực tế ngầm dưới nền cho các từ chưa có câu ví dụ
 */
let isAutoEnriching = false;
export const autoEnrichCustomWords = async (onUpdated) => {
  if (isAutoEnriching) return;
  try {
    const words = getCustomWords();
    const missingExampleOrPron = words.filter(w => !w.example || w.example.trim() === '' || !w.pronunciation || w.pronunciation.trim() === '');
    if (missingExampleOrPron.length === 0) return;

    isAutoEnriching = true;
    let anyUpdated = false;

    for (const w of missingExampleOrPron.slice(0, 5)) {
      const updates = {};
      if (!w.example || w.example.trim() === '') {
        const res = await fetchAuthenticSentence(w.word);
        if (res && res.example) {
          updates.example = res.example;
          updates.exampleTranslation = res.translation;
        }
      }
      if (!w.pronunciation || w.pronunciation.trim() === '') {
        const ipa = await lookupEnglishPronunciation(w.word);
        if (ipa) {
          updates.pronunciation = ipa;
        }
      }
      if (Object.keys(updates).length > 0) {
        updateCustomWord(w.id, updates);
        anyUpdated = true;
      }
    }

    if (anyUpdated && typeof onUpdated === 'function') {
      onUpdated(getCustomWords());
    }
  } catch (err) {
    console.warn('Auto enrich words error:', err);
  } finally {
    isAutoEnriching = false;
  }
};

/**
 * Cập nhật một từ
 */
export const updateCustomWord = (wordId, updates) => {
  const words = getCustomWords();
  const index = words.findIndex(w => w.id === wordId);
  if (index !== -1) {
    words[index] = { ...words[index], ...updates };
    saveCustomWords(words);
    return words[index];
  }
  return null;
};

/**
 * Xóa một từ (Đồng bộ cả bản chính, Master Vault và bản dự phòng)
 */
export const deleteCustomWord = (wordId) => {
  const words = getCustomWords();
  const filtered = words.filter(w => w.id !== wordId);
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_WORDS, JSON.stringify(filtered));
    localStorage.setItem(STORAGE_KEYS.MASTER_VAULT, JSON.stringify(filtered));
    localStorage.setItem(STORAGE_KEYS.CUSTOM_WORDS_BACKUP, JSON.stringify(filtered));
  } catch (err) {
    console.error('Error deleting word:', err);
  }
  return filtered;
};

/**
 * Lấy tiến độ SRS của các từ (bao gồm cả từ có sẵn)
 */
export const getWordSrsProgress = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WORD_SRS_PROGRESS);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    return {};
  }
};

/**
 * Cập nhật tiến độ SRS cho một từ (bất kể là từ có sẵn hay người dùng tạo)
 */
export const saveWordSrsProgress = (wordId, newSrs) => {
  try {
    const progress = getWordSrsProgress();
    progress[wordId] = newSrs;
    localStorage.setItem(STORAGE_KEYS.WORD_SRS_PROGRESS, JSON.stringify(progress));

    // Nếu là từ người dùng tạo, cập nhật trực tiếp vào custom words
    if (wordId.startsWith('usr_')) {
      updateCustomWord(wordId, { srs: newSrs });
    }
  } catch (err) {
    console.error('Error saving SRS progress:', err);
  }
};

/**
 * Lấy danh sách ID từ yêu thích
 */
export const getFavoriteIds = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
};

/**
 * Toggle trạng thái yêu thích
 */
export const toggleFavoriteId = (wordId) => {
  const favs = getFavoriteIds();
  const exists = favs.includes(wordId);
  const updated = exists ? favs.filter(id => id !== wordId) : [...favs, wordId];
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
  return updated;
};

/**
 * Quản lý Streak (chuỗi ngày học liên tục)
 */
export const getStreakInfo = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STREAK_INFO);
    const defaultStreak = {
      currentStreak: 1,
      longestStreak: 1,
      lastStudiedDate: getTodayDateString(),
      history: { [getTodayDateString()]: 1 }
    };
    if (!raw) return defaultStreak;
    return JSON.parse(raw);
  } catch (err) {
    return { currentStreak: 1, longestStreak: 1, lastStudiedDate: getTodayDateString(), history: {} };
  }
};

/**
 * Ghi nhận một phiên học để cập nhật Streak
 */
export const recordStudySession = (count = 1) => {
  const streakInfo = getStreakInfo();
  const today = getTodayDateString();
  const history = streakInfo.history || {};

  history[today] = (history[today] || 0) + count;

  let currentStreak = streakInfo.currentStreak || 0;
  let longestStreak = streakInfo.longestStreak || 0;

  if (streakInfo.lastStudiedDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (streakInfo.lastStudiedDate === yesterdayStr) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
  }

  const updated = {
    currentStreak,
    longestStreak,
    lastStudiedDate: today,
    history
  };

  localStorage.setItem(STORAGE_KEYS.STREAK_INFO, JSON.stringify(updated));
  return updated;
};

/**
 * Quản lý cài đặt ứng dụng
 */
export const getAppSettings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const defaults = {
      soundEnabled: true,
      speechRate: 0.9,
      voiceLang: 'en-US',
      autoPlayAudio: true,
      cardFlippedByDefault: false,
      theme: 'light' // 'light' or 'dark'
    };
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch (err) {
    return { soundEnabled: true, speechRate: 0.9, voiceLang: 'en-US', autoPlayAudio: true, theme: 'light' };
  }
};

export const saveAppSettings = (settings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

/**
 * Xuất toàn bộ dữ liệu ra JSON để người dùng sao lưu
 */
export const exportAllDataAsJSON = () => {
  const data = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    customWords: getCustomWords(),
    srsProgress: getWordSrsProgress(),
    streakInfo: getStreakInfo(),
    favorites: getFavoriteIds(),
    settings: getAppSettings()
  };
  return JSON.stringify(data, null, 2);
};

/**
 * Nhập dữ liệu từ file JSON sao lưu
 */
export const importDataFromJSON = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    if (data.customWords && Array.isArray(data.customWords)) {
      saveCustomWords(data.customWords);
    }
    if (data.srsProgress && typeof data.srsProgress === 'object') {
      localStorage.setItem(STORAGE_KEYS.WORD_SRS_PROGRESS, JSON.stringify(data.srsProgress));
    }
    if (data.streakInfo) {
      localStorage.setItem(STORAGE_KEYS.STREAK_INFO, JSON.stringify(data.streakInfo));
    }
    if (data.favorites && Array.isArray(data.favorites)) {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(data.favorites));
    }
    return { success: true, count: data.customWords?.length || 0 };
  } catch (err) {
    console.error('Import failed:', err);
    return { success: false, error: err.message };
  }
};
