import { notebookStorage, setNotebookAccount, withGuestNotebook } from './notebookStorage';
import { applyNotebookPatch, diffNotebook, syncNotebook } from './notebookSync';

const wordKey = 'toeic_custom_words_v2';
const word = id => ({ id, word: id });
beforeEach(() => { localStorage.clear(); setNotebookAccount(null); });
afterEach(() => setNotebookAccount(null));

test('keeps guest data and both account notebooks isolated on the same browser', () => {
  notebookStorage.setItem(wordKey, JSON.stringify([word('guest')]));
  setNotebookAccount('alice');
  expect(notebookStorage.getItem(wordKey)).toBeNull();
  notebookStorage.setItem(wordKey, JSON.stringify([word('alice')]));
  expect(withGuestNotebook(() => JSON.parse(notebookStorage.getItem(wordKey)))).toEqual([word('guest')]);
  expect(JSON.parse(notebookStorage.getItem(wordKey))).toEqual([word('alice')]);
  setNotebookAccount('bob');
  expect(notebookStorage.getItem(wordKey)).toBeNull();
});

test('merges separate device changes without discarding edits made while syncing', async () => {
  setNotebookAccount('alice');
  notebookStorage.setItem(wordKey, JSON.stringify([word('first')]));
  let receive;
  const remote = { words: { otherDevice: word('otherDevice') } };
  const client = { rpc: jest.fn((_fn, { changes }) => new Promise(resolve => {
    receive = () => resolve({ data: applyNotebookPatch(remote, changes) });
  })) };
  const request = syncNotebook(client, 'alice');
  notebookStorage.setItem(wordKey, JSON.stringify([word('first'), word('duringSync')]));
  receive();
  await request;
  expect(JSON.parse(notebookStorage.getItem(wordKey)).map(item => item.id).sort())
    .toEqual(['duringSync', 'first', 'otherDevice']);
  expect(diffNotebook({ words: { old: word('old') } }, { words: {} })).toEqual({ words: { old: null } });
});

test('does not write a late account response after signing out', async () => {
  setNotebookAccount('alice');
  const client = { rpc: async () => ({ data: { words: { alice: word('alice') } } }) };
  const request = syncNotebook(client, 'alice', () => false);
  setNotebookAccount(null);
  await request;
  expect(localStorage.length).toBe(0);
});
