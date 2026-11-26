import { getCommonSenses } from '../data/commonSenses';
import { batchExamples } from '../data/batchExamples';
import { BUILTIN_SETS } from '../data/defaultVocab';
import { CURATED_TOEIC_EXAMPLES, correctVietnameseSpelling, isBadTemplateSentence, lookupEnglishWord } from './dictionary';

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

const knownWords = [...new Set([...batchExamples.keys(), ...Object.keys(CURATED_TOEIC_EXAMPLES), ...library.keys()])];

function oneEditApart(input, candidate) {
  if (Math.abs(input.length - candidate.length) > 1) return false;
  let i = 0;
  while (i < input.length && input[i] === candidate[i]) i++;
  if (input.length === candidate.length) {
    return input.slice(i + 1) === candidate.slice(i + 1) ||
      (input[i] === candidate[i + 1] && input[i + 1] === candidate[i] &&
       input.slice(i + 2) === candidate.slice(i + 2));
  }
  return input.length > candidate.length
    ? input.slice(i + 1) === candidate.slice(i)
    : input.slice(i) === candidate.slice(i + 1);
}

export const meaningParts = text => (text || '').split(/[,;/]/).map(wordKey).filter(Boolean);

export function reviewBatchCard(card) {
  const key = wordKey(card.word);
  const local = localSuggestion(key);
  const known = Boolean(local.meaning || getCommonSenses(key).length);
  const spellings = !known && !card.reference?.meaning && /^[a-z][a-z -]{3,}$/i.test(key)
    ? knownWords.filter(word => oneEditApart(key, word)).slice(0, 3) : [];
  const senses = getCommonSenses(key);
  const included = new Set(senses.flatMap(item => meaningParts(item.meaning)));
  for (const meaning of [local.meaning, ...(card.reference?.allMeanings || []), card.reference?.meaning]) {
    if (!meaning || meaningParts(meaning).every(part => included.has(part))) continue;
    senses.push({ meaning });
    meaningParts(meaning).forEach(part => included.add(part));
  }
  const entered = meaningParts(card.meaning);
  const unmatched = entered.filter(part => !included.has(part));
  const viSpelling = correctVietnameseSpelling(card.meaning);
  return {
    spellings, senses, known,
    different: Boolean(included.size && entered.length && unmatched.length),
    viSpelling: viSpelling && wordKey(viSpelling) !== wordKey(card.meaning) ? viSpelling : ''
  };
}

export async function lookupBatchCard(card, signal) {
  const local = fillMissing(card, localSuggestion(card.word));
  if (!cardError(local) && reviewBatchCard(local).known) return local;
  const reference = await lookupEnglishWord(card.word, signal);
  return { ...fillMissing(local, { ...reference, pronunciation: reference.phonetic }), reference };
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
    const correctedMeaning = knownMeaning instanceof RegExp && knownMeaning.test(meaning);
    return fillMissing({
      word: corrected, meaning: correctedMeaning ? '' : meaning, example, exampleTranslation,
      originalWord: corrected !== word ? word : '',
      originalMeaning: correctedMeaning ? meaning : ''
    }, localSuggestion(corrected));
  });
}
