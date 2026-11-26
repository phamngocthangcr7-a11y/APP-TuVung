import { buildStudyQueue, calculateNextSrs, getDeckProgress, SRS_RATING } from './srs';

const fresh = index => ({ id: 'new-' + index, srs: { state: 'new' } });
const reviewed = (id, nextReviewDate, lastReviewedDate) => ({
  id, srs: { state: 'review', repetitions: 2, nextReviewDate, lastReviewedDate }
});

test('keeps learned progress after a mistake and never counts an unfinished new card', () => {
  const attempted = calculateNextSrs({}, SRS_RATING.AGAIN);
  const completed = calculateNextSrs(attempted, SRS_RATING.GOOD);
  const forgotten = calculateNextSrs(completed, SRS_RATING.AGAIN);
  const deck = [{ srs: attempted }, { srs: forgotten }, fresh(0)];
  expect(getDeckProgress(deck, completed.firstLearnedDate)).toMatchObject({
    total: 3, learnedCount: 1, learnedToday: 1, newCount: 1
  });
});

test('mixes old cards into new ones without recycling same-day cards ahead of schedule', () => {
  const today = '2026-11-26';
  const overdue = reviewed('overdue', '2026-11-24', '2026-11-21');
  const early = reviewed('early', '2026-11-29', '2026-11-24');
  const justSeen = reviewed('just-seen', '2026-11-27', today);
  const words = [...Array.from({ length: 30 }, (_, index) => fresh(index)), justSeen, early, overdue];
  const queue = buildStudyQueue(words, 10, 'due_first', today);
  expect(queue).toHaveLength(10);
  expect(queue[4]).toBe(overdue);
  expect(queue[9]).toBe(early);
  expect(queue).not.toContain(justSeen);
  expect(buildStudyQueue([justSeen, overdue], 10, 'due_first', today)).toEqual([overdue]);
});
