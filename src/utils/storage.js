// =========================================================================
// QUẢN LÝ DỮ LIỆU TỪ VỰNG & LOCAL STORAGE
// Hỗ trợ lưu từ vựng hàng ngày, phân loại theo tuần, sao lưu & phục hồi
// =========================================================================

import { getTodayDateString } from './srs';
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

function readStoredWords(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    const list = Array.isArray(value) ? value : value?.customWords;
    if (!Array.isArray(list)) return null;
    return list.filter(w => typeof w?.word === 'string' && w.word.trim() && w.word.trim() !== '-');
  } catch {
    return null;
  }
}

const wordKey = word => word.trim().normalize('NFC').replace(/\s+/g, ' ').toLowerCase();
const newWordId = () => 'usr_' + (globalThis.crypto?.randomUUID?.() || Date.now() + '_' + Math.random().toString(36).slice(2));

/** Recover only previously saved records when the learner requests recovery. */
export function deepRecoverCustomWords(snapshot = []) {
  const current = getCustomWords();
  const ids = new Set(current.map(w => w.id).filter(Boolean));
  const names = new Set(current.map(w => wordKey(w.word)));
  const recovered = [...current];
  const keys = [
    STORAGE_KEYS.MASTER_VAULT, STORAGE_KEYS.CUSTOM_WORDS_BACKUP,
    'toeic_custom_words', 'custom_words', 'toeic_words', 'toeic_user_words',
    'toeic_words_list', 'toeic_vocab_user', 'toeic_app_data', 'toeic_custom_backup'
  ];
  const archives = [...keys.map(key => readStoredWords(key) || []), snapshot];
  for (const archive of archives) {
    for (const word of archive) {
      if (typeof word?.word !== 'string' || !word.word.trim()) continue;
      const name = wordKey(word.word);
      if (ids.has(word.id) || names.has(name)) continue;
      const id = word.id || newWordId();
      ids.add(id);
      names.add(name);
      recovered.push({ ...word, id, isCustom: true });
    }
  }
  if (recovered.length !== current.length) saveCustomWords(recovered);
  return recovered;
}

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

export function getCustomWords() {
  // An empty primary list is a valid notebook, including after the last deletion.
  return readStoredWords(STORAGE_KEYS.CUSTOM_WORDS)
    ?? readStoredWords(STORAGE_KEYS.CUSTOM_WORDS_BACKUP)
    ?? readStoredWords(STORAGE_KEYS.MASTER_VAULT)
    ?? [];
}

export function saveCustomWords(words) {
  const serialized = JSON.stringify(words);
  const previous = getCustomWords();
  const previousIds = new Set(previous.map(w => w.id).filter(Boolean));
  const previousNames = new Set(previous.map(w => wordKey(w.word)));
  const names = new Set(words.map(w => wordKey(w.word)));
  const ids = new Set(words.map(w => w.id).filter(Boolean));
  // Keep legacy records that exist only in the vault available for explicit recovery.
  const archive = [];
  for (const key of [STORAGE_KEYS.MASTER_VAULT, STORAGE_KEYS.CUSTOM_WORDS_BACKUP]) {
    for (const word of readStoredWords(key) || []) {
      const name = wordKey(word.word);
      if (previousIds.has(word.id) || previousNames.has(name) || ids.has(word.id) || names.has(name)) continue;
      archive.push(word);
      if (word.id) ids.add(word.id);
      names.add(name);
    }
  }
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_WORDS, serialized);
  } catch {
    throw new Error('Không thể lưu vào trình duyệt. Hãy kiểm tra dung lượng và thử lại.');
  }
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_WORDS_BACKUP, serialized);
    localStorage.setItem(STORAGE_KEYS.MASTER_VAULT, JSON.stringify([...words, ...archive]));
  } catch (error) {
    console.warn('Không thể cập nhật bản sao dự phòng.', error);
  }
}

function createCustomWord(data, today, isBatch) {
  const addedDate = data.addedDate || today;
  const date = new Date(addedDate + 'T12:00:00');
  return {
    ...data,
    word: data.word.trim(),
    id: newWordId(),
    isCustom: true,
    tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : isBatch ? ['Nhập hàng loạt'] : [],
    folderId: data.folderId || 'daily',
    addedDate,
    weekNumber: getWeekNumber(date),
    year: date.getFullYear(),
    isFavorite: false,
    mistakeCount: 0,
    srs: { repetitions: 0, interval: 0, easeFactor: 2.5, nextReviewDate: today, state: 'new' }
  };
}

function insertWords(data, isBatch) {
  const current = getCustomWords();
  const names = new Set(current.map(w => wordKey(w.word)));
  const today = getTodayDateString();
  const created = data.map(item => {
    const key = wordKey(item.word);
    if (names.has(key)) throw new Error('Từ “' + item.word + '” đã có trong sổ.');
    names.add(key);
    return createCustomWord(item, today, isBatch);
  });
  saveCustomWords([...created, ...current]);
  return created;
}

export const addCustomWord = data => insertWords([data], false)[0];
export const addBatchCustomWords = list => insertWords(list, true);

/**
 * Cập nhật một từ
 */
export const updateCustomWord = (wordId, updates) => {
  const words = getCustomWords();
  const index = words.findIndex(w => w.id === wordId);
  if (index !== -1) {
    if (updates.word && words.some(w => w.id !== wordId && wordKey(w.word) === wordKey(updates.word))) {
      throw new Error('Tên từ này đã có trong sổ.');
    }
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
  saveCustomWords(filtered);
  const favorites = getFavoriteIds().filter(id => id !== wordId);
  const progress = getWordSrsProgress();
  delete progress[wordId];
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  localStorage.setItem(STORAGE_KEYS.WORD_SRS_PROGRESS, JSON.stringify(progress));
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
  const empty = { currentStreak: 0, longestStreak: 0, lastStudiedDate: null, history: {} };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.STREAK_INFO));
    if (!saved?.lastStudiedDate) return empty;
    const today = getTodayDateString();
    const yesterday = new Date(today + 'T12:00:00');
    yesterday.setDate(yesterday.getDate() - 1);
    const lastDate = new Date(saved.lastStudiedDate + 'T12:00:00');
    return { ...empty, ...saved, currentStreak: lastDate < yesterday ? 0 : saved.currentStreak };
  } catch {
    return empty;
  }
};

export const recordStudySession = (count = 1) => {
  const streakInfo = getStreakInfo();
  if (!Number.isFinite(count) || count <= 0) return streakInfo;
  const today = getTodayDateString();
  const history = { ...streakInfo.history, [today]: (Number(streakInfo.history?.[today]) || 0) + count };
  const currentStreak = streakInfo.lastStudiedDate === today
    ? Math.max(1, streakInfo.currentStreak)
    : streakInfo.currentStreak + 1;
  const longestStreak = Math.max(streakInfo.longestStreak, currentStreak);

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
