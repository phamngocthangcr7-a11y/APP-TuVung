// =========================================================================
// TIỆN ÍCH ÂM THANH & PHÁT ÂM (AUDIO & TEXT-TO-SPEECH)
// =========================================================================

/**
 * Phát âm từ vựng hoặc câu tiếng Anh bằng Web Speech API
 */
export const speakEnglish = (text, rate = 0.9, lang = 'en-US') => {
  if (!('speechSynthesis' in window)) {
    console.warn('Trình duyệt không hỗ trợ Web Speech API');
    return;
  }

  // Hủy âm thanh đang phát trước đó
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.lang = lang;

  // Cố gắng chọn giọng đọc tiếng Anh tự nhiên (Google US English hoặc Microsoft Zira)
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => 
    (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Jenny')))
  ) || voices.find(v => v.lang.startsWith('en'));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.speak(utterance);
};

/**
 * Tạo hiệu ứng âm thanh nhẹ bằng Web Audio API (không phụ thuộc file mp3 ngoài)
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
        this.ctx.resume();
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
    } catch (e) {
      // Audio context error ignore
    }
  }

  // Âm thanh khi trả lời đúng
  playCorrect() {
    this.playTone(523.25, 'sine', 0.1, 0);     // C5
    this.playTone(659.25, 'sine', 0.15, 0.08); // E5
    this.playTone(783.99, 'sine', 0.25, 0.16); // G5
  }

  // Âm thanh khi trả lời sai
  playIncorrect() {
    this.playTone(330, 'triangle', 0.15, 0);
    this.playTone(280, 'triangle', 0.25, 0.12);
  }

  // Âm thanh lật thẻ
  playFlip() {
    this.playTone(400, 'sine', 0.05, 0);
  }

  // Âm thanh hoàn thành phiên học
  playVictory() {
    this.playTone(523.25, 'sine', 0.1, 0);
    this.playTone(659.25, 'sine', 0.1, 0.1);
    this.playTone(783.99, 'sine', 0.1, 0.2);
    this.playTone(1046.50, 'sine', 0.4, 0.3);
  }
}

export const sound = new SoundEffects();
