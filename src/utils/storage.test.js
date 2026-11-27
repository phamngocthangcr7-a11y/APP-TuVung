import { exportAllDataAsJSON, getCustomWords, getWordSrsProgress, importDataFromJSON, readStudyDecks, STUDY_DECKS_KEY } from './storage';

test('merges a phone restore without removing local cards, progress or custom decks', () => {
  localStorage.clear();
  localStorage.setItem('toeic_custom_words_v2', JSON.stringify([{ id: 'phone', word: 'phone' }, { id: 'local', word: 'bank', meaning: 'bờ sông' }]));
  localStorage.setItem('toeic_word_srs_progress_v2', JSON.stringify({ phone: { repetitions: 1 } }));
  localStorage.setItem(STUDY_DECKS_KEY, JSON.stringify([{ id: 'local-deck', title: 'Điện thoại', words: [] }]));
  const result = importDataFromJSON(JSON.stringify({
    customWords: [{ id: 'computer', word: 'bank', meaning: 'ngân hàng' }, { id: 'new', word: 'balance' }],
    srsProgress: { computer: { repetitions: 3, lastReviewedDate: '2026-11-25' } },
    studyDecks: [{ id: 'imported-deck', title: 'Máy tính', words: [{ word: 'bank', id: 'computer' }] }]
  }));
  expect(result).toMatchObject({ success: true, total: 3 });
  expect(getCustomWords().map(word => word.word)).toEqual(['phone','bank','balance']);
  expect(getCustomWords()[1].meaning).toBe('bờ sông');
  expect(getWordSrsProgress()).toMatchObject({ phone: { repetitions: 1 }, local: { repetitions: 3 } });
  expect(readStudyDecks()[1].words[0].id).toBe('local');
  expect(JSON.parse(exportAllDataAsJSON()).studyDecks).toHaveLength(2);
});
