import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import EntryDialog from './EntryDialog';
import { cardError, parseBatch, lookupBatchCard, localSuggestion, fillMissing, meaningParts, reviewBatchCard, wordKey } from '../utils/cardEntry';
import { getBatchDraft, saveBatchDraft, clearBatchDraft, getBatchHistory, saveBatchHistory } from '../utils/storage';
import { getTodayDateString } from '../utils/srs';

const sample = '- practical : thiết thực, thực tế\n- portable : dễ mang theo';
const labels = { word: 'Từ tiếng Anh', meaning: 'Nghĩa tiếng Việt', example: 'Câu ví dụ tiếng Anh', exampleTranslation: 'Bản dịch câu ví dụ' };
export default function BatchImportModal({ isOpen, onClose, onBatchSave, existingWords = [] }) {
  const [text, setText] = useState(() => getBatchDraft() || '');
  const [rows, setRows] = useState(() => parseBatch(text));
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
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
  const reviews = useMemo(() => rows.map(reviewBatchCard), [rows]);
  if (!isOpen) return null;
  const missing = problems.filter(Boolean).length;
  const flagged = reviews.filter((review, index) => !known.has(wordKey(rows[index].word)) &&
    (review.different || review.spellings.length || review.viSpelling)).length;
  const updateText = value => {
    clearTimeout(autoLookup.current);
    const parsed = parseBatch(value);
    setText(value); setRows(parsed); saveBatchDraft(value); setError(''); setReviewConfirmed(false);
    if (parsed.some(row => needsLookup(row, true))) {
      autoLookup.current = setTimeout(() => lookup(parsed, true), 900);
    }
  };
  const updateRows = next => {
    clearTimeout(autoLookup.current);
    const serialized = next.map(row => Object.keys(labels).map(key => (row[key] || '').replace(/[\r\n\t]+/g, ' ')).join('\t')).join('\n');
    setRows(next); setText(serialized); saveBatchDraft(serialized); setError('');
  };
  const needsLookup = (row, automatic) => {
    if (known.has(wordKey(row.word)) ||
        row.reference || !/[a-z]/i.test(row.word)) return false;
    const review = reviewBatchCard(row);
    return automatic && review.spellings.length ? false : Boolean(cardError(row) || !review.known);
  };
  const patchRow = (index, update) => {
    setReviewConfirmed(false);
    updateRows(rows.map((item, i) => i === index ? update(item) : item));
  };
  const replaceWord = (row, word) => fillMissing({
    word, meaning: row.meaning, originalWord: row.originalWord || row.word, example: '', exampleTranslation: ''
  }, localSuggestion(word));
  const applyMeaning = (index, meaning, append) => patchRow(index, row => {
    const existing = new Set(meaningParts(row.meaning));
    const extra = meaning.split(/[,;/]/).map(part => part.trim()).filter(part => !existing.has(wordKey(part)));
    const value = append ? [row.meaning.trim(), extra.join(', ')].filter(Boolean).join('; ') : meaning;
    return { ...row, meaning: value };
  });
  const lookup = async (source = rows, automatic = false) => {
    clearTimeout(autoLookup.current);
    const controller = new AbortController();
    request.current = controller;
    const next = [...source];
    const pending = source.flatMap((row, index) => needsLookup(row, automatic) ? [index] : []);
    try {
      for (let offset = 0; offset < pending.length; offset += 4) {
        setProgress(`Đang tra từ điển · ${Math.min(offset + 4, pending.length)}/${pending.length} thẻ`);
        await Promise.all(pending.slice(offset, offset + 4).map(async index => {
          next[index] = await lookupBatchCard(source[index], controller.signal);
        }));
        if (controller.signal.aborted) return;
        updateRows([...next]);
      }
    } catch { if (!controller.signal.aborted) setError('Tra cứu bị gián đoạn. Bạn có thể điền các mục còn thiếu.'); }
    finally { if (!controller.signal.aborted) setProgress(''); }
  };
  const save = study => {
    if (!rows.length || missing || progress || (flagged && !reviewConfirmed)) return;
    const words = rows.map(({ originalWord, originalMeaning, reference, ...row }) => ({ ...row, addedDate: date || getTodayDateString(), tags: [tag.trim() || 'Nạp hàng ngày'] }));
    try {
      onBatchSave(words, study ? 'study' : null, deckTitle.trim());
      saveBatchHistory(text, words); clearBatchDraft(); onClose();
    } catch (err) { setError(err.message || 'Chưa lưu được danh sách. Hãy thử lại.'); }
  };
  return <EntryDialog title="Nhập nhiều thẻ từ" onClose={onClose} wide>
    <div className="entry-body"><fieldset disabled={!!progress}>
      <label>Danh sách từ<textarea autoFocus rows={4} value={text} onChange={event => updateText(event.target.value)} placeholder={sample}/></label>
      <p className="entry-hint">Dán mỗi dòng một từ tiếng Anh hoặc theo mẫu từ : nghĩa. Ứng dụng tự tra nghĩa và ví dụ song ngữ. Mở từng thẻ để xem gợi ý.</p>
      {history?.length > 0 && <label>Lần nhập trước<select defaultValue="" onChange={e => { if (e.target.value) updateText(history.find(item => item.id === e.target.value).text); e.target.value = ''; }}><option value="">Chọn danh sách đã lưu</option>
        {history.map(item => <option key={item.id} value={item.id}>{item.dateStr} · {item.count} từ</option>)}</select></label>}
      {rows.length > 0 && <>
        <div className="entry-actions"><strong>{rows.length} thẻ · {missing ? missing + ' thiếu nội dung' : flagged ? flagged + ' cần đối chiếu' : 'Sẵn sàng lưu'}</strong>
        {rows.some(item => needsLookup(item, false)) && <button type="button" className="entry-secondary" onClick={() => lookup()}><Search size={16}/>Tra từ điển</button>}</div>
        <div className="entry-preview">{rows.map((row, index) => {
          const review = reviews[index];
          const saved = known.has(wordKey(row.word));
          const note = review.spellings.length ? 'Kiểm tra chính tả' : review.different || review.viSpelling
            ? 'Đối chiếu nghĩa' : row.originalWord || row.originalMeaning ? 'Đã gợi ý sửa'
            : !review.senses.length ? 'Chưa có nghĩa đối chiếu' : '';
          const entered = new Set(meaningParts(row.meaning));
          return <details className="entry-row" key={index}>
            <summary><span>{index + 1}. {row.word || '(Chưa có từ)'}</span>
              <small className={problems[index] || (!saved && note) ? 'entry-error' : ''}>
                {saved && !problems[index] ? 'Dùng thẻ đã lưu' : [problems[index], note].filter(Boolean).join(' · ') || 'Đủ nội dung'}
              </small></summary>
            <div className="entry-details">
              {Object.entries(labels).map(([field, label]) => <label key={field}>{label}<input value={row[field] || ''}
                onChange={e => patchRow(index, item => field === 'word' ? replaceWord(item, e.target.value)
                  : { ...item, [field]: e.target.value })}/></label>)}
              {!saved && <div className="entry-review">
                {row.originalWord && <p>Đã sửa từ bạn nhập: <b>{row.originalWord}</b>.</p>}
                {row.originalMeaning && <p>Nghĩa ban đầu: <b>{row.originalMeaning}</b>.</p>}
                {!!review.spellings.length && <div className="entry-actions"><span>Có phải bạn muốn viết</span>
                  {review.spellings.map(word => <button type="button" key={word} className="entry-secondary"
                    onClick={() => patchRow(index, item => replaceWord(item, word))}>{word}</button>)}</div>}
                {review.viSpelling && <button type="button" className="entry-secondary"
                  onClick={() => applyMeaning(index, review.viSpelling, false)}>Sửa nghĩa thành “{review.viSpelling}”</button>}
                {review.different && <p>Nghĩa đã nhập khác mục tham khảo. Hãy đối chiếu theo ngữ cảnh.</p>}
                {!!review.senses.length && <><strong>Nghĩa tham khảo</strong><ul>{review.senses.map(({ type, meaning }) => {
                  const hasMeaning = meaningParts(meaning).every(part => entered.has(part));
                  return <li key={meaning}><span>{type && <b>{type} · </b>}{meaning}</span>
                    {!hasMeaning && <div className="entry-actions">
                      <button type="button" className="entry-secondary" onClick={() => applyMeaning(index, meaning, false)}>Dùng nghĩa này</button>
                      <button type="button" className="entry-secondary" onClick={() => applyMeaning(index, meaning, true)}>Thêm nghĩa</button>
                    </div>}</li>;
                })}</ul><p className="entry-hint">Đối chiếu câu ví dụ với nghĩa bạn chọn. Mỗi câu chỉ minh họa một cách dùng.</p></>}
                {!review.senses.length && <p>Chưa có nghĩa tham khảo. Hãy kiểm tra nội dung trước khi lưu.</p>}
              </div>}
              <button type="button" className="entry-secondary" onClick={() => updateRows(rows.filter((_, i) => i !== index))}><Trash2 size={15}/>Bỏ dòng này</button>
            </div>
          </details>;
        })}</div>
        {!!flagged && <label className="entry-confirm"><input type="checkbox" checked={reviewConfirmed}
          onChange={e => setReviewConfirmed(e.target.checked)}/>Tôi đã kiểm tra các mục được đánh dấu.</label>}
        <label>Tên bộ học riêng (tùy chọn)<input maxLength={80} value={deckTitle} onChange={e => setDeckTitle(e.target.value)}/></label>
        <div className="entry-split"><label>Nhãn chung<input value={tag} onChange={e => setTag(e.target.value)}/></label><label>Ngày thêm<input type="date" value={date} onChange={e => setDate(e.target.value)}/></label></div>
      </>}
    </fieldset>
    {progress && <div className="entry-actions"><p role="status" className="entry-status">{progress}</p>
      <button className="entry-secondary" onClick={() => { request.current?.abort(); setProgress(''); }}>Dừng tra cứu</button></div>}
    {error && <p role="alert" className="entry-error">{error}</p>}</div>
    <footer className="entry-footer"><button className="entry-secondary" onClick={() => save(false)} disabled={!rows.length || !!missing || !!progress || (!!flagged && !reviewConfirmed)}>Lưu vào sổ</button>
    <button className="entry-primary" disabled={!rows.length || !!missing || !!progress || (!!flagged && !reviewConfirmed)} onClick={() => save(true)}>Lưu và học ngay</button></footer>
  </EntryDialog>;
}
