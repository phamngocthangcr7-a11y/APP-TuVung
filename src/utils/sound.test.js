import { selectMaleEnglishVoice, speakEnglish } from './sound';

test('selects an English male voice without falling back to an unspecified English voice', () => {
  const voices = [
    { name: 'Google US English', lang: 'en-US' },
    { name: 'English Female', lang: 'en-US' },
    { name: 'Daniel', lang: 'en-GB' },
    { name: 'Microsoft Guy Online', lang: 'en-US' }
  ];
  expect(selectMaleEnglishVoice(voices)).toBe(voices[3]);
  expect(selectMaleEnglishVoice(voices.slice(0, 2))).toBeUndefined();
});

test('does not send text to speech when a device offers only an unspecified voice', async () => {
  jest.useFakeTimers();
  window.speechSynthesis = { getVoices: () => [{ name: 'English (US)', lang: 'en-US' }], speak: jest.fn() };
  window.SpeechSynthesisUtterance = jest.fn();
  try {
    const result = speakEnglish('a complete sentence');
    jest.advanceTimersByTime(700);
    await expect(result).resolves.toBe('unavailable');
    expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
  } finally {
    delete window.speechSynthesis;
    delete window.SpeechSynthesisUtterance;
    jest.useRealTimers();
  }
});
