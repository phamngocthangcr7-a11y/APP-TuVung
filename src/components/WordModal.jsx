import React, { useEffect, useRef, useState } from 'react';
import { Search, Volume2 } from 'lucide-react';
import EntryDialog from './EntryDialog';
import { getTodayDateString } from '../utils/srs';
import { speakEnglish, stopSpeaking } from '../utils/sound';
import { cardError, normalizePos, suggestCard, wordKey } from '../utils/cardEntry';

const parts = { noun: 'Danh từ', verb: 'Động từ', adj: 'Tính từ', adv: 'Trạng từ', phr: 'Cụm từ', prep: 'Giới từ', pron: 'Đại từ', conj: 'Liên từ', det: 'Từ hạn định' };
export default function WordModal({ isOpen, onClose, onSave, editingWord, existingWords = [] }) {
  const [card, setCard] = useState(() => {
    const editable = {};
    for (const field of ['word', 'meaning', 'example', 'exampleTranslation', 'pronunciation', 'note']) {
      editable[field] = editingWord?.[field] || '';
    }
    return { ...editable, addedDate: editingWord?.addedDate || getTodayDateString(), partOfSpeech: normalizePos(editingWord?.partOfSpeech) };
  });
  const [tags, setTags] = useState((editingWord?.tags || ['TOEIC']).join(', '));
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const request = useRef(null);
  const suggestedFields = useRef({});
  useEffect(() => () => { request.current?.abort(); stopSpeaking(); }, []);
  if (!isOpen) return null;
  const change = field => event => {
    const value = event.target.value;
    if (field === 'word' && wordKey(value) !== wordKey(card.word)) {
      const next = { ...card, word: value };
      for (const [key, previous] of Object.entries(suggestedFields.current)) {
        if (next[key] === previous) next[key] = '';
      }
      suggestedFields.current = {};
      setCard(next);
    } else {
      delete suggestedFields.current[field];
      setCard(prev => ({ ...prev, [field]: value }));
    }
    setError(''); setStatus('');
  };
  const duplicate = existingWords.some(w => w.id !== editingWord?.id && wordKey(w.word) === wordKey(card.word));
  const lookup = async () => {
    const controller = new AbortController();
    request.current = controller;
    setBusy(true); setStatus('Đang tìm trong kho từ và từ điển…'); setError('');
    try {
      const suggestion = await suggestCard(card, controller.signal);
      if (controller.signal.aborted) return;
      for (const [key, value] of Object.entries(suggestion)) {
        if (!card[key] && value) suggestedFields.current[key] = value;
      }
      setCard(suggestion);
      setStatus(cardError(suggestion) ? 'Hãy điền các mục còn thiếu và kiểm tra lại ngữ cảnh.' : 'Kiểm tra nghĩa và câu ví dụ trước khi lưu thẻ.');
    } catch {
      if (!controller.signal.aborted) setStatus('Chưa tra được từ. Bạn có thể nhập nội dung trực tiếp.');
    } finally { if (!controller.signal.aborted) setBusy(false); }
  };
  const listen = async () => {
    setStatus('Đang phát âm…');
    const result = await speakEnglish(card.word);
    if (result === 'ended') setStatus('');
    if (result === 'unavailable') setStatus('Chưa phát được âm thanh. Hãy kiểm tra kết nối và giọng tiếng Anh trên thiết bị.');
  };
  const save = event => {
    event.preventDefault();
    const message = cardError(card) || (duplicate ? 'Từ này đã có trong sổ. Bạn có thể sửa thẻ hiện có.' : '');
    if (message) { setError(message); return; }
    try {
      const payload = Object.fromEntries(Object.entries(card).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]));
      onSave({ ...payload, tags: [...new Set(tags.split(',').map(tag => tag.trim().replace(/^#/, '')).filter(Boolean))] });
      onClose();
    } catch (err) { setError(err.message || 'Chưa lưu được thẻ. Hãy thử lại.'); }
  };
  return <EntryDialog title={editingWord ? 'Chỉnh sửa thẻ từ' : 'Thêm thẻ vào sổ từ'} onClose={onClose}>
    <form onSubmit={save}>
      <div className="entry-body"><fieldset disabled={busy}>
        <label>Từ hoặc cụm từ tiếng Anh *<input autoFocus required lang="en" value={card.word} onChange={change('word')} placeholder="Ví dụ: accommodate"/></label>
        <div className="entry-actions">
          <button type="button" className="entry-secondary" disabled={!card.word.trim()} onClick={lookup}><Search size={16}/>Tra cứu và điền gợi ý</button>
          <button type="button" className="entry-secondary" disabled={!card.word.trim()} onClick={listen}><Volume2 size={16}/>Nghe từ</button>
        </div>
        {duplicate && <p className="entry-error">Từ này đã có trong sổ từ của bạn.</p>}
        <label>Nghĩa tiếng Việt *<input required value={card.meaning} onChange={change('meaning')} placeholder="Có đủ chỗ cho"/></label>
        <div className="entry-split">
          <label>Loại từ<select value={card.partOfSpeech} onChange={change('partOfSpeech')}><option value="">Chọn loại từ</option>
            {card.partOfSpeech && !parts[card.partOfSpeech] && <option>{card.partOfSpeech}</option>}
            {Object.entries(parts).map(([value, title]) => <option key={value} value={value}>{title}</option>)}
          </select></label>
          <label>Phiên âm<input value={card.pronunciation} onChange={change('pronunciation')} placeholder="/əˈkɒmədeɪt/"/></label>
        </div>
        <label>Câu ví dụ tiếng Anh *<textarea rows={2} required lang="en" value={card.example} onChange={change('example')} placeholder="The room can accommodate ten people."/></label>
        <label>Bản dịch câu ví dụ *<textarea rows={2} required value={card.exampleTranslation} onChange={change('exampleTranslation')} placeholder="Căn phòng có đủ chỗ cho mười người."/></label>
        <details><summary>Ghi chú và phân loại</summary><div className="entry-details">
          <label>Ghi chú<textarea rows={2} value={card.note} onChange={change('note')}/></label>
          <div className="entry-split"><label>Nhãn (cách nhau bằng dấu phẩy)<input value={tags} onChange={e => setTags(e.target.value)}/></label>
          <label>Ngày thêm<input type="date" value={card.addedDate} onChange={change('addedDate')}/></label></div>
        </div></details>
      </fieldset>
      {status && <p className="entry-status" role="status">{status}</p>}
      {error && <p className="entry-error" role="alert">{error}</p>}</div>
      <footer className="entry-footer"><button type="button" className="entry-secondary" onClick={onClose}>Hủy</button><button className="entry-primary" disabled={busy || duplicate}>Lưu thẻ</button></footer>
    </form>
  </EntryDialog>;
}
