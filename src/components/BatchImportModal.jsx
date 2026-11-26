import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import EntryDialog from './EntryDialog';
import { cardError, parseBatch, suggestCard, wordKey } from '../utils/cardEntry';
import { getBatchDraft, saveBatchDraft, clearBatchDraft, getBatchHistory, saveBatchHistory } from '../utils/storage';
import { getTodayDateString } from '../utils/srs';

const sample = '- practical : thiết thực, thực tế\n- portable : dễ mang theo';
const labels = { word: 'Từ tiếng Anh', meaning: 'Nghĩa tiếng Việt', example: 'Câu ví dụ tiếng Anh', exampleTranslation: 'Bản dịch câu ví dụ' };
export default function BatchImportModal({ isOpen, onClose, onBatchSave, existingWords = [] }) {
  const [text, setText] = useState(() => getBatchDraft() || '');
  const [rows, setRows] = useState(() => parseBatch(text));
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [deckTitle, setDeckTitle] = useState('');
  const [tag, setTag] = useState('Nạp hàng ngày');
  const [date, setDate] = useState(getTodayDateString);
  const [history] = useState(getBatchHistory);
  const request = useRef(null);
  const autoLookup = useRef(null);
  useEffect(() => () => {
    request.current?.abort();
    clearTimeout(autoLookup.current);
  }, []);
  const known = useMemo(() => new Map(existingWords.map(item => [wordKey(item.word), item])), [existingWords]);
  const problems = useMemo(() => {
    const seen = new Set();
    return rows.map(row => {
      const key = wordKey(row.word);
      const saved = known.get(key);
      const issue = seen.has(key) ? 'Trùng với dòng phía trên.'
        : saved ? (cardError(saved) ? 'Hãy hoàn thiện thẻ này trong sổ trước.' : '') : cardError(row);
      seen.add(key);
      return issue;
    });
  }, [rows, known]);
  if (!isOpen) return null;
  const missing = problems.filter(Boolean).length;
  const updateText = value => {
    clearTimeout(autoLookup.current);
    const parsed = parseBatch(value);
    setText(value); setRows(parsed); saveBatchDraft(value); setError('');
    if (parsed.some(row => row.meaning && cardError(row))) {
      autoLookup.current = setTimeout(() => lookup(parsed, true), 900);
    }
  };
  const updateRows = next => {
    clearTimeout(autoLookup.current);
    const serialized = next.map(row => Object.keys(labels).map(key => (row[key] || '').replace(/[\r\n\t]+/g, ' ')).join('\t')).join('\n');
    setRows(next); setText(serialized); saveBatchDraft(serialized); setError('');
  };
  const lookup = async (source = rows, onlyWithMeaning = false) => {
    clearTimeout(autoLookup.current);
    const controller = new AbortController();
    request.current = controller;
    const next = [...source];
    try {
      for (let index = 0; index < next.length; index++) {
        if ((onlyWithMeaning && !next[index].meaning) || known.has(wordKey(next[index].word)) || !cardError(next[index]) || !/[a-z]/i.test(next[index].word)) continue;
        setProgress('Đang tra ' + (index + 1) + '/' + next.length + ' · ' + next[index].word);
        next[index] = await suggestCard(next[index], controller.signal);
        if (controller.signal.aborted) return;
        updateRows([...next]);
      }
    } catch { if (!controller.signal.aborted) setError('Tra cứu bị gián đoạn. Bạn có thể điền các mục còn thiếu.'); }
    finally { if (!controller.signal.aborted) setProgress(''); }
  };
  const save = study => {
    if (!rows.length || missing || progress) return;
    const words = rows.map(row => ({ ...row, addedDate: date || getTodayDateString(), tags: [tag.trim() || 'Nạp hàng ngày'] }));
    try {
      onBatchSave(words, study ? 'study' : null, deckTitle.trim());
      saveBatchHistory(text, words); clearBatchDraft(); onClose();
    } catch (err) { setError(err.message || 'Chưa lưu được danh sách. Hãy thử lại.'); }
  };
  return <EntryDialog title="Nhập nhiều thẻ từ" onClose={onClose} wide>
    <div className="entry-body"><fieldset disabled={!!progress}>
      <label>Danh sách từ<textarea autoFocus rows={4} value={text} onChange={event => updateText(event.target.value)} placeholder={sample}/></label>
      <p className="entry-hint">Dán mỗi dòng theo mẫu từ : nghĩa. Ứng dụng tự gợi ý ví dụ song ngữ. Bạn cũng có thể dán bốn cột từ Excel để dùng ví dụ của mình.</p>
      {history?.length > 0 && <label>Lần nhập trước<select defaultValue="" onChange={e => { if (e.target.value) updateText(history.find(item => item.id === e.target.value).text); e.target.value = ''; }}><option value="">Chọn danh sách đã lưu</option>
        {history.map(item => <option key={item.id} value={item.id}>{item.dateStr} · {item.count} từ</option>)}</select></label>}
      {rows.length > 0 && <>
        <div className="entry-actions"><strong>{rows.length} thẻ · {missing ? missing + ' cần kiểm tra' : 'Sẵn sàng lưu'}</strong>
        {rows.some(item => cardError(item)) && <button type="button" className="entry-secondary" onClick={() => lookup()}><Search size={16}/>Tra các mục còn thiếu</button>}</div>
        <div className="entry-preview">{rows.map((row, index) => <details className="entry-row" key={index}>
          <summary><span>{index + 1}. {row.word || '(Chưa có từ)'}</span><small className={problems[index] ? 'entry-error' : ''}>{problems[index] || (known.has(wordKey(row.word)) ? 'Dùng thẻ đã lưu' : 'Đủ nội dung')}</small></summary>
          <div className="entry-details">{Object.entries(labels).map(([field, label]) => <label key={field}>{label}<input value={row[field] || ''} onChange={e => updateRows(rows.map((item, i) => i === index ? { ...item, [field]: e.target.value } : item))}/></label>)}
          <button className="entry-secondary" onClick={() => updateRows(rows.filter((_, i) => i !== index))}><Trash2 size={15}/>Bỏ dòng này</button></div>
        </details>)}</div>
        <label>Tên bộ học riêng (tùy chọn)<input maxLength={80} value={deckTitle} onChange={e => setDeckTitle(e.target.value)}/></label>
        <div className="entry-split"><label>Nhãn chung<input value={tag} onChange={e => setTag(e.target.value)}/></label><label>Ngày thêm<input type="date" value={date} onChange={e => setDate(e.target.value)}/></label></div>
      </>}
    </fieldset>
    {progress && <div className="entry-actions"><p role="status" className="entry-status">{progress}</p>
      <button className="entry-secondary" onClick={() => { request.current?.abort(); setProgress(''); }}>Dừng tra cứu</button></div>}
    {error && <p role="alert" className="entry-error">{error}</p>}</div>
    <footer className="entry-footer"><button className="entry-secondary" onClick={() => save(false)} disabled={!rows.length || !!missing || !!progress}>Lưu vào sổ</button>
    <button className="entry-primary" disabled={!rows.length || !!missing || !!progress} onClick={() => save(true)}>Lưu và học ngay</button></footer>
  </EntryDialog>;
}
