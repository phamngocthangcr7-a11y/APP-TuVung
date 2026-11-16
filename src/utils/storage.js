// =========================================================================
// QUẢN LÝ DỮ LIỆU TỪ VỰNG & LOCAL STORAGE
// Hỗ trợ lưu từ vựng hàng ngày, phân loại theo tuần, sao lưu & phục hồi
// =========================================================================

import { getTodayDateString } from './srs';
import { getToeicExampleFallback } from './dictionary';

const STORAGE_KEYS = {
  CUSTOM_WORDS: 'toeic_custom_words_v2',
  CUSTOM_FOLDERS: 'toeic_custom_folders_v2',
  WORD_SRS_PROGRESS: 'toeic_word_srs_progress_v2',
  STREAK_INFO: 'toeic_study_streak_v2',
  FAVORITES: 'toeic_favorite_ids_v2',
  SETTINGS: 'toeic_app_settings_v2'
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
 * Lấy danh sách từ người dùng tự thêm
 */
export const getCustomWords = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_WORDS);
    const list = raw ? JSON.parse(raw) : [];
    let modified = false;
    const enriched = list.map(w => {
      if (!w || !w.word) return w;
      if (!w.example || String(w.example).trim() === '') {
        const fallback = getToeicExampleFallback(w.word, w.partOfSpeech, w.meaning);
        modified = true;
        return {
          ...w,
          example: fallback.example,
          exampleTranslation: w.exampleTranslation || fallback.translation
        };
      }
      return w;
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
 * Lưu danh sách từ người dùng tự thêm
 */
export const saveCustomWords = (words) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_WORDS, JSON.stringify(words));
  } catch (err) {
    console.error('Error saving custom words:', err);
  }
};

/**
 * Thêm một từ mới
 */
export const addCustomWord = (wordData) => {
  const words = getCustomWords();
  const today = getTodayDateString();
  const weekNum = getWeekNumber(new Date());
  const fallback = getToeicExampleFallback(wordData.word, wordData.partOfSpeech, wordData.meaning);

  const newWord = {
    id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    word: (wordData.word || '').trim(),
    pronunciation: (wordData.pronunciation || '').trim(),
    meaning: (wordData.meaning || '').trim(),
    partOfSpeech: wordData.partOfSpeech || 'noun',
    example: (wordData.example || '').trim() || fallback.example,
    exampleTranslation: (wordData.exampleTranslation || '').trim() || fallback.translation,
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
    const fallback = getToeicExampleFallback(w.word, w.partOfSpeech, w.meaning);
    return {
      id: 'usr_' + (Date.now() + index) + '_' + Math.random().toString(36).substring(2, 6),
      word: (w.word || '').trim(),
      pronunciation: (w.pronunciation || '').trim(),
      meaning: (w.meaning || '').trim(),
      partOfSpeech: w.partOfSpeech || 'noun',
      example: (w.example || '').trim() || fallback.example,
      exampleTranslation: (w.exampleTranslation || '').trim() || fallback.translation,
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

  const updated = [...formattedWords, ...currentWords];
  saveCustomWords(updated);
  return formattedWords;
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
 * Xóa một từ
 */
export const deleteCustomWord = (wordId) => {
  const words = getCustomWords();
  const filtered = words.filter(w => w.id !== wordId);
  saveCustomWords(filtered);
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
