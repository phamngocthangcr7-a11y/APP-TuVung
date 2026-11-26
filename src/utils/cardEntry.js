import { batchExamples } from '../data/batchExamples';
import { BUILTIN_SETS } from '../data/defaultVocab';
import { CURATED_TOEIC_EXAMPLES, isBadTemplateSentence, lookupEnglishWord } from './dictionary';

export const wordKey = text => (text || '').trim().normalize('NFC').replace(/\s+/g, ' ').toLowerCase();

const library = new Map(BUILTIN_SETS.flatMap(set => set.words).map(card => [wordKey(card.word), card]));
const posNames = { n: 'noun', v: 'verb', adjective: 'adj', adverb: 'adv', phrase: 'phr' };
export const normalizePos = pos => posNames[pos] || pos || '';

export function localSuggestion(word) {
  const key = wordKey(word);
  if (batchExamples.has(key)) return batchExamples.get(key);
  const entry = Object.hasOwn(CURATED_TOEIC_EXAMPLES, key) ? CURATED_TOEIC_EXAMPLES[key] : null;
  if (entry) return { ...entry, exampleTranslation: entry.translation, partOfSpeech: normalizePos(entry.partOfSpeech) };
  const card = library.get(key);
  if (!card) return {};
  // Built-in decks also contain Vietnamese pronunciation hints, which are not IPA.
  return { meaning: card.meaning, example: card.example, exampleTranslation: card.exampleTranslation,
    partOfSpeech: card.partOfSpeech === 'phr' ? 'phr' : '' };
}

export function fillMissing(card, suggestion) {
  const result = { ...card };
  for (const field of ['meaning', 'partOfSpeech', 'pronunciation', 'example']) {
    if (!result[field]?.trim() && suggestion[field]) result[field] = suggestion[field];
  }
  if (!result.exampleTranslation?.trim() && result.example?.trim() === suggestion.example?.trim()) {
    result.exampleTranslation = suggestion.exampleTranslation || '';
  }
  return result;
}

export async function suggestCard(card, signal) {
  const local = fillMissing(card, localSuggestion(card.word));
  if (!cardError(local)) return local;
  const found = await lookupEnglishWord(card.word, signal);
  return fillMissing(local, { ...found, pronunciation: found.phonetic });
}

export function cardError(card) {
  if (!/[a-z]/i.test(card.word)) return 'Nhập từ hoặc cụm từ tiếng Anh.';
  if (!card.meaning?.trim() || /^\(Từ mới(?: chưa dịch)?\)$/i.test(card.meaning.trim())) return 'Bổ sung nghĩa tiếng Việt.';
  if (!card.example?.trim()) return 'Bổ sung câu ví dụ tiếng Anh.';
  if (!card.exampleTranslation?.trim()) return 'Bổ sung bản dịch của câu ví dụ.';
  if (isBadTemplateSentence(card.example, card.exampleTranslation)) return 'Thay câu mẫu cũ bằng một ví dụ theo ngữ cảnh.';
  return '';
}

export function parseBatch(text) {
  return text.split(/\r?\n/).map(line => line.replace(/^ +| +$/g, '')).filter(line => line.trim() && !/^(?:#|\/\/)/.test(line)).map(line => {
    const clean = line.replace(/^(?:\d+[./):]|[•*+-]|\[\d+\])\s+/, '');
    const colon = clean.indexOf(':');
    const separator = clean.includes('\t') ? '\t' : clean.includes('|') ? '|' : /\s+[-–—]\s+|\s*(?:=>|->|→|=|:|;|\/)\s*|\s{2,}/;
    let fields = (!clean.includes('|') && !clean.includes('\t') && colon > 0
      ? [clean.slice(0, colon), clean.slice(colon + 1)] : clean.split(separator)).map(value => value.trim());
    if (fields.length === 1 && clean.includes(',')) {
      const comma = clean.indexOf(',');
      fields = [clean.slice(0, comma).trim(), clean.slice(comma + 1).trim()];
    }
    const [word, meaning = '', example = '', exampleTranslation = ''] = fields;
    const corrected = wordKey(word) === 'alteranative' ? 'alternative' : word;
    const key = wordKey(corrected);
    const knownMeaning = { nevertheless: /^mặc dù$/i, rarely: /^hiến khi$/i,
      troubleshoot: /sữa lỗi/i, portable: /^đi động/i }[key];
    return fillMissing({ word: corrected, meaning: knownMeaning instanceof RegExp && knownMeaning.test(meaning) ? '' : meaning,
      example, exampleTranslation }, localSuggestion(corrected));
  });
}
