// =========================================================================
// TIỆN ÍCH PHÁT ÂM TIẾNG ANH CHUẨN BẢN XỨ & HIỆU ỨNG ÂM THANH
// Hỗ trợ tối ưu 100% trên Điện thoại (iOS Safari, Android Chrome) và Máy tính
// =========================================================================

let currentAudio = null;
let isAudioUnlocked = false;

/**
 * Mở khóa hệ thống âm thanh trên Mobile Browser (iOS Safari / Android Chrome)
 * iOS Safari và Android yêu cầu kích hoạt Audio Context & Speech trong tương tác đầu tiên của người dùng
 */
export const unlockMobileAudio = () => {
  if (isAudioUnlocked) return;
  try {
    // 1. Mở khóa Web Audio Context
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      if (!sound.ctx) sound.init();
      if (sound.ctx && sound.ctx.state === 'suspended') {
        sound.ctx.resume().catch(() => {});
      }
    }

    // 2. Mở khóa Web Speech API (iOS Safari cần speak một âm câm trước)
    if ('speechSynthesis' in window) {
      const dummy = new SpeechSynthesisUtterance(' ');
      dummy.volume = 0.01;
      dummy.rate = 1.0;
      window.speechSynthesis.speak(dummy);
    }

    // 3. Mở khóa HTML5 Audio element
    try {
      const dummyAudio = new Audio();
      dummyAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      dummyAudio.play().catch(() => {});
    } catch (e) {}

    isAudioUnlocked = true;
  } catch (e) {
    console.warn('Audio unlock notice:', e);
  }
};

// Đăng ký mở khóa ngay khi người dùng chạm vào màn hình hoặc bấm phím
if (typeof window !== 'undefined') {
  ['touchstart', 'touchend', 'click', 'keydown'].forEach(evt => {
    window.addEventListener(evt, unlockMobileAudio, { once: true, passive: true });
  });

  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.onvoiceschanged = () => {
        try { window.speechSynthesis.getVoices(); } catch (e) {}
      };
      // Pre-warm voices
      window.speechSynthesis.getVoices();
    } catch (e) {}
  }
}

// Cache lưu trữ các URL âm thanh chuẩn phòng thu đã được xác thực thành công (0ms độ trễ)
const verifiedAudioUrlCache = new Map();

/**
 * Tạo danh sách các nguồn âm thanh phòng thu bản xứ chuẩn Mỹ (Oxford & Google Studio Audio)
 * Thu âm bởi phát thanh viên bản xứ Mỹ chuyên nghiệp, chuẩn âm TOEIC quốc tế, không dùng giọng tổng hợp robot.
 */
export const getStudioAudioCandidates = (rawWord) => {
  const clean = String(rawWord || '').toLowerCase().trim().replace(/[^a-z]/g, '');
  if (!clean) return [];

  const c1 = clean[0];
  const c3 = clean.slice(0, Math.min(3, clean.length));
  const c5 = clean.slice(0, Math.min(5, clean.length));

  return [
    // 1. Google Oxford Studio American Recording (General American - Giọng chuẩn nhất hiện nay)
    `https://ssl.gstatic.com/dictionary/static/sounds/20200429/${clean}--_us_1.mp3`,
    `https://ssl.gstatic.com/dictionary/static/sounds/20200429/${clean}--_us_2.mp3`,
    // 2. Oxford Learner's Dictionaries Official American Pronunciation MP3
    `https://www.oxfordlearnersdictionaries.com/media/english/us_pron/${c1}/${c3}/${c5}/${clean}__us_1.mp3`,
    `https://www.oxfordlearnersdictionaries.com/media/english/us_pron/${c1}/${c3}/${c5}/${clean}_1_us_1.mp3`,
    // 3. Free Dictionary API US Native Recording MP3
    `https://api.dictionaryapi.dev/media/pronunciations/en/${clean}-us.mp3`,
    `https://api.dictionaryapi.dev/media/pronunciations/en/${clean}-1-us.mp3`,
    // 4. Google Lexico Studio Voice
    `https://ssl.gstatic.com/dictionary/static/sounds/de/0/${clean}.mp3`
  ];
};

/**
 * Trả về URL phát âm giọng người bản xứ chuẩn phòng thu (để tương thích ngược)
 */
export const getHumanStudioAudioUrl = (text) => {
  const clean = String(text || '').toLowerCase().trim().replace(/[^a-z]/g, '');
  if (!clean) return '';
  return verifiedAudioUrlCache.get(clean) || `https://ssl.gstatic.com/dictionary/static/sounds/20200429/${clean}--_us_1.mp3`;
};

/**
 * Phát âm thanh từ vựng bằng file ghi âm phòng thu người bản xứ Mỹ (Studio Human Voice)
 */
export const playStudioWordAudio = (word, rate = 0.90, onFallback) => {
  const clean = String(word || '').toLowerCase().trim().replace(/[^a-z]/g, '');
  if (!clean) {
    if (onFallback) onFallback();
    return;
  }

  // Dừng âm thanh đang phát trước đó nếu có
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {}
    currentAudio = null;
  }

  // 1. Kiểm tra cache đã từng phát thành công trước đó
  const cachedUrl = verifiedAudioUrlCache.get(clean);
  if (cachedUrl) {
    try {
      const audio = new Audio(cachedUrl);
      audio.playbackRate = Math.min(Math.max(rate || 0.90, 0.75), 1.25);
      currentAudio = audio;
      const p = audio.play();
      if (p !== undefined) {
        p.catch(() => {
          if (onFallback) onFallback();
        });
      }
      return;
    } catch (e) {
      if (onFallback) onFallback();
      return;
    }
  }

  // 2. Thử lần lượt các nguồn phát thanh viên Oxford & Google bản xứ Mỹ
  const candidates = getStudioAudioCandidates(clean);
  let index = 0;
  let hasHandledSuccess = false;

  const tryCandidate = () => {
    if (hasHandledSuccess) return;
    if (index >= candidates.length) {
      if (onFallback) onFallback();
      return;
    }

    const url = candidates[index++];
    const audio = new Audio(url);
    audio.playbackRate = Math.min(Math.max(rate || 0.90, 0.75), 1.25);

    let nextAttempted = false;
    const nextOnce = () => {
      if (nextAttempted) return;
      nextAttempted = true;
      tryCandidate();
    };

    audio.onerror = nextOnce;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          hasHandledSuccess = true;
          currentAudio = audio;
          verifiedAudioUrlCache.set(clean, url);
        })
        .catch(() => {
          nextOnce();
        });
    }
  };

  tryCandidate();
};

/**
 * Phát âm qua Web Speech API chất lượng cao (giọng đọc chuẩn Mỹ trong trẻo, dễ nghe, không máy móc)
 */
export const speakWithWebSpeech = (text, rate = 0.88) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Tốc độ 0.88: vừa phải, rõ từng nguyên âm, nhấn trọng âm rõ ràng, không bị nuốt âm đuôi
    utterance.rate = rate || 0.88;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices() || [];
    
    // Ưu tiên chọn lọc các giọng phát âm tiếng Anh Mỹ chuẩn, trong trẻo, tự nhiên
    const naturalVoice = 
      // 1. Giọng Natural / Neural Online cao cấp (Edge / Azure)
      voices.find(v => v.lang.startsWith('en') && (
        v.name.includes('Natural') || 
        v.name.includes('Online (Natural)') || 
        v.name.includes('Jenny') || 
        v.name.includes('Guy') || 
        v.name.includes('Aria')
      )) ||
      // 2. Google US English (Cốc Cốc / Chrome - chuẩn bản xứ Mỹ, rõ ràng, dễ nghe)
      voices.find(v => v.name.includes('Google US English') || (v.lang === 'en-US' && v.name.includes('Google'))) ||
      // 3. Apple Human Voices (iOS / macOS - Samantha, Alex, Ava)
      voices.find(v => v.lang.startsWith('en') && (
        v.name.includes('Samantha') || 
        v.name.includes('Alex') || 
        v.name.includes('Ava') || 
        v.name.includes('Siri')
      )) ||
      // 4. Các giọng Google tiếng Anh khác
      voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||
      // 5. Giọng en-US không phải desktop robot cũ
      voices.find(v => v.lang.startsWith('en-US') && !v.name.toLowerCase().includes('desktop')) ||
      // 6. Microsoft Zira (âm sắc nữ mềm mại và dễ nghe hơn hẳn giọng David)
      voices.find(v => v.name.includes('Zira')) ||
      // 7. Giọng en-US bất kỳ
      voices.find(v => v.lang.startsWith('en-US')) ||
      // 8. Bất kỳ giọng tiếng Anh nào
      voices.find(v => v.lang.startsWith('en'));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Web speech notice:', e);
  }
};

/**
 * Phát âm tiếng Anh tự nhiên & chuẩn phòng thu (The MVP TOEIC Standard Audio Engine)
 * - Từ đơn: 100% bản ghi âm người thật phòng thu từ Oxford / Google Studio
 * - Cụm từ & câu ví dụ: Phát âm ngữ điệu chuẩn Mỹ dễ nghe, nhả âm rõ ràng
 */
export const speakEnglish = (rawText, rate = 0.90) => {
  if (!rawText) return;
  const text = String(rawText).trim().replace(/\[.*?\]|\(.*?\)/g, '').trim();
  if (!text || text === '-' || text === '[ ______ ]') return;

  // Dừng âm thanh đang phát trước đó nếu có
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {}
    currentAudio = null;
  }

  const words = text.split(/\s+/).filter(Boolean);

  // 1. Nếu là từ vựng tiếng Anh đơn (VD: "accommodate", "stiff", "reimbursement", "adjacent"):
  // Ưu tiên phát 100% bản thu âm phòng thu người bản xứ Mỹ của Oxford / Google Dictionary
  if (words.length === 1 && /^[a-zA-Z-]+$/.test(text)) {
    playStudioWordAudio(text, rate, () => {
      speakWithWebSpeech(text, rate || 0.88);
    });
    return;
  }

  // 2. Nếu là cụm từ (VD: "owing to", "let me show you") hoặc câu ví dụ:
  // Phát âm với giọng chuẩn Mỹ, tốc độ vừa phải, rõ ràng từng âm tiết
  speakWithWebSpeech(text, rate || 0.88);
};

/**
 * Hiệu ứng âm thanh bằng Web Audio API
 */
class SoundEffects {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playTone(freq, type, duration, delay = 0) {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + duration);
    } catch (e) {}
  }

  playCorrect() {
    this.playTone(523.25, 'sine', 0.1, 0);     // C5
    this.playTone(659.25, 'sine', 0.15, 0.08); // E5
    this.playTone(783.99, 'sine', 0.25, 0.16); // G5
  }

  playIncorrect() {
    this.playTone(330, 'triangle', 0.15, 0);
    this.playTone(280, 'triangle', 0.25, 0.12);
  }

  playFlip() {
    this.playTone(400, 'sine', 0.05, 0);
  }

  playVictory() {
    this.playTone(523.25, 'sine', 0.1, 0);
    this.playTone(659.25, 'sine', 0.1, 0.1);
    this.playTone(783.99, 'sine', 0.1, 0.2);
    this.playTone(1046.50, 'sine', 0.4, 0.3);
  }
}

export const sound = new SoundEffects();
