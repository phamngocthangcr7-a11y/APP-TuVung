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

// Audio cache lưu trữ các Audio elements đã tải để phát lại tức thì 0ms latency
const studioAudioCache = new Map();

/**
 * Trả về URL phát âm giọng người bản xứ chuẩn phòng thu (The MVP TOEIC Studio Audio)
 * Hỗ trợ từ đơn, cụm từ, phrasal verbs và câu trọn vẹn
 */
export const getHumanStudioAudioUrl = (text) => {
  const clean = String(text || '').trim().replace(/\[.*?\]|\(.*?\)/g, '').trim();
  if (!clean || clean === '-' || clean === '[ ______ ]') return '';
  // Native US American Studio Pronunciation stream
  return `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(clean)}&type=2`;
};

/**
 * Phát âm tiếng Anh chuẩn phòng thu bản xứ (The MVP TOEIC Studio Human Voice)
 * Ưu tiên:
 * 1. Giọng người thật chuẩn Mỹ thu âm phòng thu (Studio Native US Voice) qua MP3 stream
 * 2. Fallback sang Web Speech API với bộ lọc chọn lọc giọng đọc Natural/Neural cao cấp nhất
 */
export const speakEnglish = (rawText, rate = 0.95) => {
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

  // Đối với câu dài (> 5 từ hoặc > 45 ký tự), Web Speech API với giọng Natural là lựa chọn hoàn hảo nhất
  // (tránh lỗi ORB của các từ điển vốn chỉ hỗ trợ từ đơn và cụm từ ngắn)
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount > 5 || text.length > 45) {
    speakWithWebSpeech(text, rate);
    return;
  }

  // 1. Thử phát qua Studio Native Human Voice (chuẩn app The MVP TOEIC cho từ đơn & cụm từ)
  try {
    const audioUrl = getHumanStudioAudioUrl(text);
    if (!audioUrl) {
      speakWithWebSpeech(text, rate);
      return;
    }

    let audio = studioAudioCache.get(audioUrl);
    if (!audio) {
      audio = new Audio(audioUrl);
      audio.preload = 'auto';
      // Giới hạn cache 100 audio elements để tối ưu bộ nhớ
      if (studioAudioCache.size > 100) {
        const firstKey = studioAudioCache.keys().next().value;
        studioAudioCache.delete(firstKey);
      }
      studioAudioCache.set(audioUrl, audio);
    } else {
      audio.currentTime = 0;
    }

    // Tốc độ phát âm tự nhiên
    const safeRate = Math.min(Math.max(rate || 0.95, 0.7), 1.25);
    audio.playbackRate = safeRate;
    currentAudio = audio;

    let hasHandledError = false;
    const handleError = () => {
      if (hasHandledError) return;
      hasHandledError = true;
      speakWithWebSpeech(text, rate);
    };

    audio.onerror = handleError;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        handleError();
      });
    }
  } catch (err) {
    speakWithWebSpeech(text, rate);
  }
};

/**
 * Phát âm qua Web Speech API chất lượng cao (chọn lọc giọng đọc Natural / Neural của hệ điều hành)
 */
export const speakWithWebSpeech = (text, rate = 0.92) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate || 0.92;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices() || [];
    
    // Ưu tiên các giọng đọc cao cấp tự nhiên (tránh giọng robot Desktop cũ)
    const naturalVoice = 
      voices.find(v => v.lang.startsWith('en') && (
        v.name.includes('Natural') || 
        v.name.includes('Online (Natural)') ||
        v.name.includes('Jenny') ||
        v.name.includes('Guy') ||
        v.name.includes('Aria')
      )) ||
      voices.find(v => v.lang.startsWith('en-US') && v.name.includes('Google')) ||
      voices.find(v => v.lang.startsWith('en') && (
        v.name.includes('Samantha') || 
        v.name.includes('Alex') || 
        v.name.includes('Ava') || 
        v.name.includes('Siri')
      )) ||
      voices.find(v => v.lang.startsWith('en-US') && !v.name.includes('Desktop')) ||
      voices.find(v => v.lang.startsWith('en-US')) ||
      voices.find(v => v.lang.startsWith('en'));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Web speech failed:', e);
  }
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
