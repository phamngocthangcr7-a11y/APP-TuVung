// =========================================================================
// THUẬT TOÁN LẶP LẠI NGẮT QUÃNG (SPACED REPETITION - SM2 ALGORITHM)
// Tương tự hệ thống SmartCards của The MVP TOEIC & Anki
// =========================================================================

export const SRS_RATING = {
  AGAIN: 1, // Quên / Chưa nhớ (< 10 phút, ôn lại ngay)
  HARD: 2,  // Khó nhớ (ôn lại sau 1-2 ngày)
  GOOD: 3,  // Nhớ tốt (tăng khoảng cách chuẩn)
  EASY: 4   // Rất dễ (tăng khoảng cách nhanh)
};

/**
 * Lấy ngày hôm nay dưới dạng YYYY-MM-DD
 */
export const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Cộng thêm ngày vào chuỗi YYYY-MM-DD
 */
export const addDaysToDate = (dateString, days) => {
  const [yearPart, monthPart, dayPart] = (dateString || getTodayDateString()).split('-').map(Number);
  const date = new Date(yearPart, monthPart - 1, dayPart);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Tính toán trạng thái SRS tiếp theo cho một từ vựng
 * @param {Object} currentSrs - { repetitions, interval, easeFactor, nextReviewDate, state }
 * @param {Number} rating - 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
 */
export const calculateNextSrs = (currentSrs = {}, rating = SRS_RATING.GOOD) => {
  let repetitions = currentSrs.repetitions || 0;
  let interval = currentSrs.interval || 0;
  let easeFactor = currentSrs.easeFactor || 2.5;
  const today = getTodayDateString();

  let nextInterval = 0;
  let nextRepetitions = repetitions;
  let nextEaseFactor = easeFactor;
  let nextState = 'learning';

  switch (rating) {
    case SRS_RATING.AGAIN:
      // Quên: reset khoảng cách, ôn lại hôm nay
      nextRepetitions = 0;
      nextInterval = 0;
      nextEaseFactor = Math.max(1.3, easeFactor - 0.2);
      nextState = 'learning';
      break;

    case SRS_RATING.HARD:
      // Khó: tăng khoảng cách chậm
      if (repetitions === 0) {
        nextInterval = 1;
      } else {
        nextInterval = Math.max(1, Math.round(interval * 1.2));
      }
      nextRepetitions = repetitions + 1;
      nextEaseFactor = Math.max(1.3, easeFactor - 0.15);
      nextState = 'learning';
      break;

    case SRS_RATING.GOOD:
      // Tốt: công thức SM-2 chuẩn
      if (repetitions === 0) {
        nextInterval = 1;
      } else if (repetitions === 1) {
        nextInterval = 3;
      } else {
        nextInterval = Math.round(interval * easeFactor);
      }
      nextRepetitions = repetitions + 1;
      nextState = nextInterval >= 21 ? 'mastered' : 'review';
      break;

    case SRS_RATING.EASY:
      // Rất dễ: nhảy vọt khoảng cách ôn tập
      if (repetitions === 0) {
        nextInterval = 3;
      } else if (repetitions === 1) {
        nextInterval = 6;
      } else {
        nextInterval = Math.round(interval * easeFactor * 1.3);
      }
      nextRepetitions = repetitions + 1;
      nextEaseFactor = Math.min(3.0, easeFactor + 0.15);
      nextState = nextInterval >= 14 ? 'mastered' : 'review';
      break;

    default:
      nextInterval = 1;
  }

  const nextReviewDate = addDaysToDate(today, nextInterval);

  return {
    repetitions: nextRepetitions,
    interval: nextInterval,
    easeFactor: Number(nextEaseFactor.toFixed(2)),
    nextReviewDate,
    lastReviewedDate: today,
    firstLearnedDate: currentSrs.firstLearnedDate || (currentSrs.repetitions > 0
      ? currentSrs.lastReviewedDate || today : nextRepetitions > 0 ? today : undefined),
    state: nextState
  };
};

/**
 * Kiểm tra xem từ đã đến hạn ôn tập hôm nay chưa
 */
export const isDueForReview = (word, today = getTodayDateString()) => {
  if (!word || !word.srs) return true;
  if (!word.srs.nextReviewDate) return true;
  return word.srs.nextReviewDate <= today;
};

/**
 * Định dạng khoảng thời gian dễ đọc cho các nút đánh giá
 */
export const getEstimatedIntervalText = (currentSrs = {}, rating) => {
  const sample = calculateNextSrs(currentSrs, rating);
  if (sample.interval === 0) return '< 10 phút';
  if (sample.interval === 1) return '1 ngày';
  if (sample.interval < 30) return `${sample.interval} ngày`;
  const months = Math.round(sample.interval / 30);
  return `${months} tháng`;
};

/**
 * Thống kê tổng hợp số lượng thẻ theo trạng thái
 */
export const calculateSRSStats = (words = [], today = getTodayDateString()) => {
  const stats = {
    total: words.length,
    newCount: 0,
    learningCount: 0,
    reviewCount: 0,
    masteredCount: 0,
    dueTodayCount: 0
  };

  words.forEach(w => {
    const srs = w.srs || {};
    const state = srs.state || 'new';

    if (state === 'new' || !srs.nextReviewDate) {
      stats.newCount++;
    } else if (state === 'learning') {
      stats.learningCount++;
    } else if (state === 'mastered') {
      stats.masteredCount++;
    } else {
      stats.reviewCount++;
    }

    if (isDueForReview(w, today)) {
      stats.dueTodayCount++;
    }
  });

  return stats;
};

export const hasLearnedWord = ({ srs } = {}) => Boolean(
  srs?.firstLearnedDate || srs?.repetitions > 0 || srs?.state === 'review' || srs?.state === 'mastered'
);

export function getDeckProgress(words, today = getTodayDateString()) {
  return {
    total: words.length,
    learnedCount: words.filter(hasLearnedWord).length,
    learnedToday: words.filter(word => word.srs?.firstLearnedDate === today).length,
    newCount: words.filter(word => !word.srs?.state || word.srs.state === 'new').length,
    dueCount: words.filter(word => word.srs?.state && word.srs.state !== 'new' && isDueForReview(word, today)).length
  };
}

export function buildStudyQueue(words, limit, mode, today = getTodayDateString()) {
  if (mode === 'free') return words.slice(0, limit);
  const fresh = words.filter(word => !word.srs?.state || word.srs.state === 'new');
  const previous = words.filter(word => word.srs?.state && word.srs.state !== 'new');
  const due = previous.filter(word => isDueForReview(word, today));
  due.sort((a, b) => (a.srs.nextReviewDate || '').localeCompare(b.srs.nextReviewDate || ''));
  if (mode === 'new_first') return [...fresh, ...due].slice(0, limit);
  if (!fresh.length) return due.slice(0, limit);

  // Use the whole session for due reviews when they fill it.
  if (due.length >= limit) return due.slice(0, limit);
  const early = previous.filter(word => !isDueForReview(word, today) &&
    word.srs.lastReviewedDate && word.srs.lastReviewedDate < today);
  early.sort((a, b) => a.srs.lastReviewedDate.localeCompare(b.srs.lastReviewedDate));
  const extraCount = Math.max(0, Math.min(Math.floor(limit / 5) - due.length, limit - due.length - 1));
  const review = [...due, ...early.slice(0, extraCount)];
  const newWords = fresh.slice(0, limit - review.length);
  const queue = [];
  let nextReview = 0;
  for (const word of newWords) {
    queue.push(word);
    if (queue.length % 5 === 4 && nextReview < review.length) queue.push(review[nextReview++]);
  }
  return [...queue, ...review.slice(nextReview)];
}
