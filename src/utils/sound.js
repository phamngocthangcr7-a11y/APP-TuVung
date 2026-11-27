import { getAppSettings } from './storage';

let activePlayback = null;

export function stopSpeaking() {
  if (activePlayback) activePlayback.cancel();
}

export function unlockMobileAudio() {
  sound.init();
  if (sound.ctx?.state === 'suspended') sound.ctx.resume().catch(() => {});
}

const maleVoiceNames = /\b(?:male|aaron|alex|daniel|fred|evan|oliver|arthur|reed|tom|guy|david|mark|george|ryan|james|brian|eric|brandon|christopher|steffan|roger)\b/i;

export function selectMaleEnglishVoice(voices) {
  const supported = voices.filter(voice => /^en(?:[-_]|$)/i.test(voice.lang) &&
    maleVoiceNames.test(voice.name) && !/\bfemale\b/i.test(voice.name));
  return supported.find(voice => /^en[-_]US$/i.test(voice.lang)) || supported[0];
}

// A new request cancels pending and active speech.
export function speakEnglish(rawText, rate = getAppSettings().speechRate || 0.9) {
  stopSpeaking();
  const text = String(rawText || '').trim();
  const synth = typeof window !== 'undefined' && window.speechSynthesis;
  if (!text || !synth || !window.SpeechSynthesisUtterance) return Promise.resolve('unavailable');
  return new Promise(resolve => {
    let utterance;
    let voiceTimeout;
    let settled = false;

    const finish = result => {
      if (settled) return;
      settled = true;
      clearTimeout(voiceTimeout);
      synth.removeEventListener?.('voiceschanged', speak);
      if (utterance) utterance.onend = utterance.onerror = null;
      activePlayback = null;
      resolve(result);
    };

    function speak() {
      if (settled || utterance) return;
      const voice = selectMaleEnglishVoice(synth.getVoices());
      if (!voice) return;
      clearTimeout(voiceTimeout);
      synth.removeEventListener?.('voiceschanged', speak);
      try {
        utterance = new window.SpeechSynthesisUtterance(text);
        utterance.voice = voice;
        utterance.lang = voice.lang;
        utterance.rate = rate;
        utterance.onend = () => finish('ended');
        utterance.onerror = () => finish('unavailable');
        if (synth.paused) synth.resume();
        synth.speak(utterance);
      } catch {
        finish('unavailable');
      }
    }

    activePlayback = { cancel() {
      finish('cancelled');
      if (utterance) synth.cancel();
    } };
    synth.addEventListener?.('voiceschanged', speak);
    voiceTimeout = setTimeout(() => finish('unavailable'), 700);
    speak();
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
