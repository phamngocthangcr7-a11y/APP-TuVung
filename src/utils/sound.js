import { getAppSettings } from './storage';

let activePlayback = null;

export function stopSpeaking() {
  if (activePlayback) activePlayback.cancel();
}

export function unlockMobileAudio() {
  sound.init();
  if (sound.ctx?.state === 'suspended') sound.ctx.resume().catch(() => {});
}

// A new request cancels the previous word, sentence, or recording fallback.
export function speakEnglish(rawText, rate = getAppSettings().speechRate || 0.9) {
  stopSpeaking();
  const text = String(rawText || '').trim();
  if (!text || typeof window === 'undefined') return Promise.resolve('unavailable');
  return new Promise(resolve => {
    let audio;
    let utterance;
    let recordingTimeout;
    let settled = false;
    const synth = window.speechSynthesis;
    function finish(result) {
      if (settled) return;
      settled = true;
      clearTimeout(recordingTimeout);
      if (utterance) utterance.onend = utterance.onerror = null;
      if (audio) {
        audio.onended = audio.onerror = null;
        audio.pause();
      }
      activePlayback = null;
      resolve(result);
    }
    activePlayback = { cancel() {
      finish('cancelled');
      if (utterance) synth?.cancel();
    } };
    function playRecording() {
      if (settled) return;
      if (!/^[a-z]+$/i.test(text)) {
        finish('unavailable');
        return;
      }
      try {
        audio = new Audio('https://ssl.gstatic.com/dictionary/static/sounds/20200429/' + text.toLowerCase() + '--_us_1.mp3');
        audio.playbackRate = rate;
        recordingTimeout = setTimeout(() => finish('unavailable'), 7000);
        audio.onplaying = () => clearTimeout(recordingTimeout);
        audio.onended = () => finish('ended');
        audio.onerror = () => finish('unavailable');
        audio.play().catch(() => finish('unavailable'));
      } catch {
        finish('unavailable');
      }
    }
    if (!synth || !window.SpeechSynthesisUtterance) {
      playRecording();
      return;
    }
    try {
      utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = rate;
      const voices = synth.getVoices();
      const voice = voices.find(v => /^en[-_]US$/i.test(v.lang)) || voices.find(v => /^en\b/i.test(v.lang));
      if (voice) utterance.voice = voice;
      utterance.onend = () => finish('ended');
      utterance.onerror = playRecording;
      if (synth.paused) synth.resume();
      synth.speak(utterance);
    } catch {
      playRecording();
    }
  });
}

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
