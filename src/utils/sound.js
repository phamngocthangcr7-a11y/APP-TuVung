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

/**
 * Nhận diện thiết bị di động
 */
const isMobileDevice = () => {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Phát âm tiếng Anh tự nhiên (Studio Native English)
 * Đồng bộ, không bị trễ trên điện thoại
 */
export const speakEnglish = (rawText, rate = 0.95) => {
  if (!rawText) return;
  const text = String(rawText).trim();
  if (!text || text === '-' || text === '[ ______ ]') return;

  // Dừng âm thanh đang phát trước đó nếu có
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {}
  }

  // Trên Mobile, Web Speech API là giải pháp nhanh nhất, không bị lỗi CORS/403 trên mạng 4G/Wifi
  if (isMobileDevice() && 'speechSynthesis' in window) {
    speakWithWebSpeech(text, rate);
    return;
  }

  // Thử phát qua Google TTS Studio Audio Stream (giọng đọc chuẩn Mỹ tự nhiên)
  try {
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en-US&client=tw-ob`;
    const audio = new Audio(audioUrl);
    audio.playbackRate = rate;
    currentAudio = audio;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Fallback tức thì sang Web Speech API nếu trình duyệt chặn stream
        speakWithWebSpeech(text, rate);
      });
    }
  } catch (err) {
    speakWithWebSpeech(text, rate);
  }
};

/**
 * Phát âm qua Web Speech API (chọn giọng đọc bản xứ chuẩn nhất của hệ điều hành)
 */
export const speakWithWebSpeech = (text, rate = 0.95) => {
  if (!('speechSynthesis' in window)) return;

  try {
    // Nếu speechSynthesis đang bị treo (lỗi phổ biến trên Chrome/Android), resume trước
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices() || [];
    // Ưu tiên các giọng đọc cao cấp tự nhiên
    const naturalVoice = voices.find(v => 
      v.lang.startsWith('en') && (
        v.name.includes('Natural') || 
        v.name.includes('Google') || 
        v.name.includes('Samantha') || 
        v.name.includes('Siri') ||
        v.name.includes('Jenny') ||
        v.name.includes('Guy') ||
        v.name.includes('Ava')
      )
    ) || voices.find(v => v.lang.startsWith('en-US')) || voices.find(v => v.lang.startsWith('en'));

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
