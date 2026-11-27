import { addDaysToDate } from './srs';
import { notebookKey } from './notebookStorage';

const wordKey = 'toeic_custom_words_v2';
const deckKey = 'toeic_personal_decks_v1';
const progressKey = 'toeic_word_srs_progress_v2';
const favoriteKey = 'toeic_favorite_ids_v2';
const streakKey = 'toeic_study_streak_v2';
const settingsKey = 'toeic_app_settings_v2';
const baselineKey = 'notebook_sync_baseline_v1';

function read(account, key, fallback) {
  try { return JSON.parse(localStorage.getItem(notebookKey(key, account))) ?? fallback; }
  catch { return fallback; }
}

function keyed(items) {
  return Object.fromEntries(items.filter(item => item?.id).map(item => [item.id, item]));
}

function readSnapshot(account) {
  const streak = read(account, streakKey, {});
  const words = read(account, wordKey, []);
  const progress = read(account, progressKey, {});
  return {
    words: keyed(words.map(({ srs, ...word }) => word)),
    decks: keyed(read(account, deckKey, [])),
    progress: { ...Object.fromEntries(words.filter(word => word.id && word.srs).map(word => [word.id, word.srs])), ...progress },
    favorites: Object.fromEntries(read(account, favoriteKey, []).map(id => [id, true])),
    history: streak.history || {},
    settings: read(account, settingsKey, {})
  };
}

const canonical = value => JSON.stringify(value, (_key, item) =>
  item && typeof item === 'object' && !Array.isArray(item)
    ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item);

export function diffNotebook(before, after) {
  const changes = {};
  for (const collection of new Set([...Object.keys(before), ...Object.keys(after)])) {
    const old = before[collection] || {};
    const next = after[collection] || {};
    const entries = [];
    for (const id of new Set([...Object.keys(old), ...Object.keys(next)])) {
      if (!Object.hasOwn(next, id)) entries.push([id, null]);
      else if (!Object.hasOwn(old, id) || canonical(old[id]) !== canonical(next[id])) entries.push([id, next[id]]);
    }
    if (entries.length) changes[collection] = Object.fromEntries(entries);
  }
  return changes;
}

export function applyNotebookPatch(snapshot, changes) {
  const next = { ...snapshot };
  for (const [collection, changesById] of Object.entries(changes)) {
    const entries = new Map(Object.entries(next[collection] || {}));
    for (const [id, value] of Object.entries(changesById)) {
      if (value === null) entries.delete(id);
      else entries.set(id, value);
    }
    next[collection] = Object.fromEntries(entries);
  }
  return next;
}

function cacheSnapshot(account, data, current) {
  const history = data.history || {};
  const dates = Object.keys(history).filter(day => /^\d{4}-\d{2}-\d{2}$/.test(day) && history[day] > 0).sort();
  let longestStreak = 0;
  let currentStreak = 0;
  let lastStudiedDate = null;
  dates.forEach(date => {
    currentStreak = lastStudiedDate === addDaysToDate(date, -1) ? currentStreak + 1 : 1;
    longestStreak = Math.max(longestStreak, currentStreak);
    lastStudiedDate = date;
  });
  const newestFirst = group => Object.values(group || {}).sort((a, b) =>
    (b.addedDate || '').localeCompare(a.addedDate || ''));
  const values = {
    [wordKey]: newestFirst(data.words), [deckKey]: Object.values(data.decks || {}),
    [progressKey]: data.progress || {}, [favoriteKey]: Object.keys(data.favorites || {}),
    [streakKey]: { currentStreak, longestStreak, lastStudiedDate, history }, [settingsKey]: data.settings || {}
  };
  for (const [key, value] of Object.entries(values)) {
    localStorage.setItem(notebookKey(key, account), JSON.stringify(value));
  }
  if (Object.keys(diffNotebook(current, readSnapshot(account))).length) {
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
  }
}

export async function syncNotebook(client, account, active = () => true) {
  const baseline = read(account, baselineKey, {});
  const sent = readSnapshot(account);
  const { data, error } = await client.rpc('sync_vocab_notebook', {
    expected_user: account,
    changes: diffNotebook(baseline, sent)
  });
  if (error) throw error;
  if (!active()) return;
  const current = readSnapshot(account);
  const remote = data || {};
  const pending = diffNotebook(sent, current);
  cacheSnapshot(account, applyNotebookPatch(remote, pending), current);
  localStorage.setItem(notebookKey(baselineKey, account), JSON.stringify(remote));
}
