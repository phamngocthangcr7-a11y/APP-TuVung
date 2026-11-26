import React, { useState } from 'react';
import EntryDialog from './EntryDialog';
import { cardError } from '../utils/cardEntry';

const key = 'toeic_personal_decks_v1';
const fields = ['word', 'meaning', 'example', 'exampleTranslation', 'partOfSpeech', 'pronunciation'];

export function readStudyDecks() {
  try {
    const decks = JSON.parse(localStorage.getItem(key));
    return Array.isArray(decks) ? decks : [];
  } catch {
    return [];
  }
}

export function saveStudyDeck(title, words, imported = false) {
  const id = crypto.randomUUID();
  const deck = {
    id, title,
    words: words.map((word, i) => {
      const card = Object.fromEntries(fields.map(field => [field, typeof word[field] === 'string' ? word[field].trim() : '']));
      return { ...card, id: imported ? 'shared_' + id + '_' + i : word.id };
    })
  };
  const decks = [deck, ...readStudyDecks()];
  localStorage.setItem(key, JSON.stringify(decks));
  return decks;
}

export default function StudyDecks({ decks, words, onCreate, onStudy, onClose }) {
  const [title, setTitle] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState('');
  const visible = words.filter(word => word.word.toLowerCase().includes(query.toLowerCase()));
  const resolve = deck => deck.words.map(word => words.find(current => current.id === word.id) || word);
  const share = deck => {
    const cards = resolve(deck).map(word => Object.fromEntries(fields.map(field => [field, word[field] || ''])));
    const file = new Blob([JSON.stringify({ format: 'vocab-toeic-deck-1', title: deck.title, cards }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bo-tu-' + deck.title.replace(/[^\p{L}\p{N}]+/gu, '-').slice(0, 80) + '.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const importDeck = async event => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    try {
      if (file.size > 2_000_000) throw Error('Tệp vượt quá 2 MB.');
      const data = JSON.parse(await file.text());
      if (data.format !== 'vocab-toeic-deck-1' || typeof data.title !== 'string' ||
          !data.title.trim() || !Array.isArray(data.cards) || !data.cards.length ||
          data.cards.some(card => !card || fields.some(f => card[f] != null && typeof card[f] !== 'string') || cardError(card))) {
        throw Error('Tệp bộ học không hợp lệ hoặc có thẻ thiếu nội dung.');
      }
      onCreate(data.title.trim().slice(0, 80), data.cards, true);
      setMessage('Đã nhận bộ học.');
    } catch (error) { setMessage(error.message || 'Chưa đọc được tệp.'); }
  };

  return <EntryDialog title="Bộ học riêng" onClose={onClose} wide>
    <div className="entry-body">
      <label>Nhận bộ học của bạn bè<input type="file" accept=".json,application/json" onChange={importDeck}/></label>
      {decks.map(deck => <div className="entry-row p-3 mt-2" key={deck.id}>
        <strong>{deck.title}</strong><p>{deck.words.length} thẻ</p>
        <div className="entry-actions">
          <button className="entry-primary" onClick={() => onStudy(resolve(deck), deck.title)}>Học bộ này</button>
          <button className="entry-secondary" onClick={() => share(deck)}>Tải tệp chia sẻ</button>
        </div>
      </div>)}
      <form className="entry-details" onSubmit={event => {
        event.preventDefault();
        try {
          onCreate(title.trim(), words.filter(word => selected.includes(word.id)));
          setSelected([]); setTitle(''); setMessage('Đã lưu bộ học.');
        } catch (error) { setMessage(error.message); }
      }}>
        <h3>Tạo bộ từ sổ của tôi</h3>
        <label>Tên bộ học<input required maxLength={80} value={title} onChange={event => setTitle(event.target.value)}/></label>
        <label>Tìm từ<input type="search" value={query} onChange={event => setQuery(event.target.value)}/></label>
        <div className="max-h-44 overflow-auto">
          {visible.map(word => <div className="flex items-center gap-2 py-1" key={word.id}>
            <input id={'deck-' + word.id} type="checkbox" className="!w-auto" disabled={!!cardError(word)} checked={selected.includes(word.id)}
              onChange={event => setSelected(prev => event.target.checked ? [...prev, word.id] : prev.filter(id => id !== word.id))}/>
            <label htmlFor={'deck-' + word.id}>{word.word}{cardError(word) ? ' · cần bổ sung nội dung trong sổ' : ''}</label>
          </div>)}
        </div>
        <button className="entry-primary" disabled={!title.trim() || !selected.length}>Lưu bộ học ({selected.length} từ)</button>
      </form>
      {message && <p role="status" className="entry-status">{message}</p>}
    </div>
  </EntryDialog>;
}
