import { preloadEnglish, sound, speakEnglish, stopSpeaking } from './sound';

const context = {
  state: 'suspended',
  resume: jest.fn(async () => {}),
  decodeAudioData: jest.fn(async () => ({ duration: 1 })),
  destination: {},
  createBufferSource: jest.fn()
};

beforeEach(() => {
  context.resume.mockResolvedValue();
  context.decodeAudioData.mockResolvedValue({ duration: 1 });
  sound.ctx = context;
});
afterEach(() => { stopSpeaking(); sound.ctx = null; jest.restoreAllMocks(); });

test('requests synthesis at the chosen speed without shifting playback pitch', async () => {
  const source = { playbackRate: { value: 1 }, connect: jest.fn(), start: jest.fn(), stop: jest.fn(), disconnect: jest.fn() };
  context.createBufferSource.mockReturnValue(source);
  const oldFetch = global.fetch;
  global.fetch = jest.fn(async () => ({
    ok: true, headers: new Map([['content-type', 'audio/wav']]), arrayBuffer: async () => new ArrayBuffer(2)
  }));
  try {
    const playback = speakEnglish('The team will review your request.', 0.85);
    expect(context.resume).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith('/api/pronounce', expect.objectContaining({
      method: 'POST', body: JSON.stringify({ text: 'The team will review your request.', speed: 0.85 })
    }));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(source.playbackRate.value).toBe(1);
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

test('a tap during autoplay joins the pending download and plays once', async () => {
  let respond;
  const source = { connect: jest.fn(), start: jest.fn(), stop: jest.fn(), disconnect: jest.fn() };
  context.createBufferSource.mockReturnValue(source);
  const oldFetch = global.fetch;
  global.fetch = jest.fn(() => new Promise(resolve => { respond = resolve; }));
  try {
    const automatic = speakEnglish('shipping estimate');
    const onStart = jest.fn();
    const manual = speakEnglish('shipping estimate', undefined, onStart);
    expect(manual).toBe(automatic);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch.mock.calls[0][1].signal.aborted).toBe(false);
    respond({ ok: true, headers: new Map([['content-type', 'audio/wav']]), arrayBuffer: async () => new ArrayBuffer(2) });
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(source.start).toHaveBeenCalledTimes(1);
    expect(onStart).toHaveBeenCalledTimes(1);
    source.onended();
    await expect(manual).resolves.toBe('ended');
  } finally { global.fetch = oldFetch; }
});

test('starts playback with a prefetched card without making a second request', async () => {
  const source = { connect: jest.fn(), start: jest.fn(), stop: jest.fn(), disconnect: jest.fn() };
  context.createBufferSource.mockReturnValue(source);
  const oldFetch = global.fetch;
  global.fetch = jest.fn(async () => ({
    ok: true, headers: new Map([['content-type', 'audio/wav']]), arrayBuffer: async () => new ArrayBuffer(2)
  }));
  try {
    preloadEnglish('warehouse receipt', 0.9);
    const playback = speakEnglish('warehouse receipt', 0.9);
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(source.start).toHaveBeenCalledTimes(1);
    source.onended();
    await expect(playback).resolves.toBe('ended');
  } finally { global.fetch = oldFetch; }
});
