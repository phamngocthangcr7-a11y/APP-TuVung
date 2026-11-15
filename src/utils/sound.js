// =========================================================================
// TIỆN ÍCH PHÁT ÂM TIẾNG ANH CHUẨN BẢN XỨ & HIỆU ỨNG ÂM THANH
// Sử dụng Audio Stream chất lượng cao thay vì giọng đọc máy mặc định
// =========================================================================

let currentAudio = null;

/**
 * Phát âm tiếng Anh tự nhiên (Studio Native English)
 */
export const speakEnglish = (rawText, rate = 1.0) => {
  if (!rawText) return;
  const text = String(rawText).trim();
  if (!text || text === '-') return;

  // Dừng âm thanh đang phát trước đó nếu có
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {}
  }

  // 1. Thử phát qua Google TTS Studio Audio Stream (giọng đọc chuẩn Mỹ tự nhiên, rõ ràng)
  try {
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en-US&client=tw-ob`;
    const audio = new Audio(audioUrl);
    audio.playbackRate = rate;
    currentAudio = audio;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Fallback sang Web Speech API nếu trình duyệt chặn stream
        speakWithWebSpeech(text, rate);
      });
    }
  } catch (err) {
    speakWithWebSpeech(text, rate);
  }
};

/**
 * Fallback Web Speech API chọn giọng đọc tự nhiên nhất
 */
const speakWithWebSpeech = (text, rate = 1.0) => {
  if (!('speechSynthesis' in window)) return;

  try {
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
        v.name.includes('Jenny') ||
        v.name.includes('Guy')
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
