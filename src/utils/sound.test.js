import { sound, speakEnglish, stopSpeaking } from './sound';

const context = {
  state: 'suspended',
  resume: jest.fn(async () => {}),
  decodeAudioData: jest.fn(async () => ({ duration: 1 })),
  destination: {},
  createBufferSource: jest.fn()
};

beforeEach(() => { sound.ctx = context; });
afterEach(() => { stopSpeaking(); sound.ctx = null; jest.restoreAllMocks(); });

test('plays the shared server recording at the configured rate after unlocking mobile audio', async () => {
  const source = { playbackRate: {}, connect: jest.fn(), start: jest.fn(), stop: jest.fn(), disconnect: jest.fn() };
  context.createBufferSource.mockReturnValue(source);
  const oldFetch = global.fetch;
  global.fetch = jest.fn(async () => ({
    ok: true, headers: new Map([['content-type', 'audio/wav']]), arrayBuffer: async () => new ArrayBuffer(2)
  }));
  try {
    const playback = speakEnglish('The team will review your request.', 0.85);
    expect(context.resume).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith('/api/pronounce', expect.objectContaining({
      method: 'POST', body: JSON.stringify({ text: 'The team will review your request.' })
    }));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(source.playbackRate.value).toBe(0.85);
    expect(source.start).toHaveBeenCalledTimes(1);
    source.onended();
    await expect(playback).resolves.toBe('ended');
  } finally { global.fetch = oldFetch; }
});

test('cancels a pending audio download so the previous card cannot start playing', async () => {
  const oldFetch = global.fetch;
  global.fetch = jest.fn(() => new Promise(() => {}));
  try {
    const pending = speakEnglish('another term');
    const signal = global.fetch.mock.calls[0][1].signal;
    stopSpeaking();
    expect(signal.aborted).toBe(true);
    await expect(pending).resolves.toBe('cancelled');
  } finally { global.fetch = oldFetch; }
});
