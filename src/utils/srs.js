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
