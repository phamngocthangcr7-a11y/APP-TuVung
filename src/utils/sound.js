import { getAppSettings } from './storage';

let activePlayback = null;

export function stopSpeaking() {
  if (activePlayback) activePlayback.cancel();
}

export function unlockMobileAudio() {
  sound.init();
  if (sound.ctx?.state === 'suspended') sound.ctx.resume().catch(() => {});
}

const speechCache = new Map();

async function fetchSpeech(text, speed, context, signal) {
  const cacheKey = JSON.stringify([text, speed]);
  if (speechCache.has(cacheKey)) return speechCache.get(cacheKey);
  const response = await fetch('/api/pronounce', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, speed }),
    signal
  });
  if (!response.ok || !response.headers.get('content-type')?.startsWith('audio/')) {
    throw new Error('Pronunciation unavailable');
  }
  const audio = await context.decodeAudioData(await response.arrayBuffer());
  speechCache.set(cacheKey, audio);
  if (speechCache.size > 24) speechCache.delete(speechCache.keys().next().value);
  return audio;
}

// Start from a gesture when needed and keep the audio engine open during the download.
export function speakEnglish(rawText, rate = getAppSettings().speechRate || 0.9) {
  stopSpeaking();
  const text = String(rawText || '').trim().replace(/\s+/g, ' ');
  if (!text || text.length > 500) return Promise.resolve('unavailable');
  const speed = Number.isFinite(rate) ? Number(Math.min(1.2, Math.max(0.6, rate)).toFixed(2)) : 0.9;

  sound.init();
  const context = sound.ctx;
  if (!context) return Promise.resolve('unavailable');
  const controller = new AbortController();
  // Calling resume immediately preserves the mobile user gesture.
  const resume = context.state === 'running' ? Promise.resolve() : context.resume();

  return new Promise(resolve => {
    let source;
    let settled = false;
    const finish = result => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      controller.abort();
      if (source) {
        source.onended = null;
        if (result !== 'ended') {
          try { source.stop(); } catch { /* Source may have failed before starting. */ }
        }
        source.disconnect();
      }
      activePlayback = null;
      resolve(result);
    };
    const timeout = setTimeout(() => finish('unavailable'), 35_000);
    activePlayback = { cancel: () => finish('cancelled') };

    Promise.all([resume, fetchSpeech(text, speed, context, controller.signal)]).then(([, audio]) => {
      if (settled) return;
      source = context.createBufferSource();
      source.buffer = audio;
      source.connect(context.destination);
      source.onended = () => finish('ended');
      source.start();
      clearTimeout(timeout);
    }).catch(() => finish('unavailable'));
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
