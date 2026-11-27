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
const pendingSpeech = new Map();
let preloading = null;

function getSpeechClip(rawText, rate) {
  const text = String(rawText || '').trim().replace(/\s+/g, ' ');
  if (!text || text.length > 500) return null;
  const speed = Number.isFinite(rate) ? Number(Math.min(1.2, Math.max(0.6, rate)).toFixed(2)) : 0.9;
  return { text, speed, key: JSON.stringify([text, speed]) };
}

async function fetchSpeech(clip, context, signal) {
  const response = await fetch('/api/pronounce', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: clip.text, speed: clip.speed }),
    signal
  });
  if (!response.ok || !response.headers.get('content-type')?.startsWith('audio/')) {
    throw new Error('Pronunciation unavailable');
  }
  const audio = await context.decodeAudioData(await response.arrayBuffer());
  if (!signal.aborted) {
    speechCache.set(clip.key, audio);
    if (speechCache.size > 24) speechCache.delete(speechCache.keys().next().value);
  }
  return audio;
}

function requestSpeech(clip, context) {
  if (speechCache.has(clip.key)) return { audio: Promise.resolve(speechCache.get(clip.key)), release() {} };

  let pending = pendingSpeech.get(clip.key);
  if (!pending) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    pending = { controller, listeners: 0 };
    pending.audio = fetchSpeech(clip, context, controller.signal).finally(() => {
      clearTimeout(timeout);
      if (pendingSpeech.get(clip.key) === pending) pendingSpeech.delete(clip.key);
    });
    pendingSpeech.set(clip.key, pending);
  }

  pending.listeners++;
  return {
    audio: pending.audio,
    release() {
      pending.listeners--;
      if (!pending.listeners && pendingSpeech.get(clip.key) === pending) {
        pendingSpeech.delete(clip.key);
        pending.controller.abort();
      }
    }
  };
}

// Keep at most one upcoming card loading. Playback can join that same download.
export function preloadEnglish(rawText, rate) {
  const clip = getSpeechClip(rawText, rate);
  if (!clip || !sound.ctx || speechCache.has(clip.key) || preloading?.key === clip.key) return;
  preloading?.cancel();
  const request = requestSpeech(clip, sound.ctx);
  preloading = { key: clip.key, cancel: request.release };
  request.audio.catch(() => {}).finally(() => {
    if (preloading?.cancel === request.release) {
      preloading = null;
      request.release();
    }
  });
}

export function speakEnglish(rawText, rate = getAppSettings().speechRate || 0.9, onStart) {
  const clip = getSpeechClip(rawText, rate);
  if (!clip) return Promise.resolve('unavailable');
  sound.init();
  const context = sound.ctx;
  if (!context) return Promise.resolve('unavailable');

  // A tap may unlock audio after autoplay. Keep the same download in flight.
  const resume = context.state === 'running' ? Promise.resolve() : context.resume();
  if (activePlayback?.key === clip.key && !activePlayback.started) {
    activePlayback.onStart = onStart || activePlayback.onStart;
    resume.catch(() => {});
    return activePlayback.result;
  }

  stopSpeaking();
  const request = requestSpeech(clip, context);
  const playback = { key: clip.key, started: false, onStart };
  activePlayback = playback;
  playback.result = new Promise(resolve => {
    let source;
    let settled = false;
    const finish = result => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      request.release();
      if (source) {
        source.onended = null;
        if (result !== 'ended') {
          try { source.stop(); } catch { /* Source may have failed before starting. */ }
        }
        source.disconnect();
      }
      if (activePlayback === playback) activePlayback = null;
      resolve(result);
    };
    const timeout = setTimeout(() => finish('unavailable'), 35_000);
    playback.cancel = () => finish('cancelled');

    Promise.all([resume, request.audio]).then(([, audio]) => {
      if (settled) return;
      source = context.createBufferSource();
      source.buffer = audio;
      source.connect(context.destination);
      source.onended = () => finish('ended');
      source.start();
      playback.started = true;
      clearTimeout(timeout);
      playback.onStart?.();
    }).catch(() => finish('unavailable'));
  });
  return playback.result;
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
