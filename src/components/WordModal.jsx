import React, { useState, useEffect } from 'react';
import { X, Volume2, Plus, Check, Sparkles } from 'lucide-react';
import { speakEnglish } from '../utils/sound';
import { getTodayDateString } from '../utils/srs';

export default function WordModal({
  isOpen,
  onClose,
  onSave,
  editingWord = null
}) {
  const [word, setWord] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState('noun');
  const [meaning, setMeaning] = useState('');
  const [example, setExample] = useState('');
  const [exampleTranslation, setExampleTranslation] = useState('');
  const [note, setNote] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(['TOEIC']);
  const [addedDate, setAddedDate] = useState(getTodayDateString());

  useEffect(() => {
    if (editingWord) {
      setWord(editingWord.word || '');
      setPronunciation(editingWord.pronunciation || '');
      setPartOfSpeech(editingWord.partOfSpeech || 'noun');
      setMeaning(editingWord.meaning || '');
      setExample(editingWord.example || '');
      setExampleTranslation(editingWord.exampleTranslation || '');
      setNote(editingWord.note || '');
      setTags(editingWord.tags || ['TOEIC']);
      setAddedDate(editingWord.addedDate || getTodayDateString());
    } else {
      setWord('');
      setPronunciation('');
      setPartOfSpeech('noun');
      setMeaning('');
      setExample('');
      setExampleTranslation('');
      setNote('');
      setTags(['Hôm nay', 'TOEIC']);
      setAddedDate(getTodayDateString());
    }
  }, [editingWord, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!word.trim() || !meaning.trim()) return;

    onSave({
      word: word.trim(),
      pronunciation: pronunciation.trim(),
      partOfSpeech,
      meaning: meaning.trim(),
      example: example.trim(),
      exampleTranslation: exampleTranslation.trim(),
      note: note.trim(),
      tags,
      addedDate
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-800">
                {editingWord ? 'Chỉnh sửa từ vựng' : 'Thêm từ vựng mới'}
              </h3>
              <p className="text-xs text-slate-500">
                {editingWord ? 'Cập nhật nội dung thẻ' : 'Ghi chép từ vựng gặp trong đề thi hoặc đời sống'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Word & Pronunciation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Từ vựng / Cụm từ tiếng Anh <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder="e.g. accommodate"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                />
                {word && (
                  <button
                    type="button"
                    onClick={() => speakEnglish(word)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 p-1"
                    title="Nghe thử"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phiên âm (IPA)
              </label>
              <input
                type="text"
                value={pronunciation}
                onChange={(e) => setPronunciation(e.target.value)}
                placeholder="e.g. ơ-KOM-ơ-đêit hoặc /əˈkɑːmədeɪt/"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Part of Speech & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Loại từ
              </label>
              <select
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              >
                <option value="noun">Danh từ (noun)</option>
                <option value="verb">Động từ (verb)</option>
                <option value="adj">Tính từ (adjective)</option>
                <option value="adv">Trạng từ (adverb)</option>
                <option value="phr">Cụm từ / Collocation (phrase)</option>
                <option value="idiom">Thành ngữ (idiom)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày gặp từ
              </label>
              <input
                type="date"
                value={addedDate}
                onChange={(e) => setAddedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Vietnamese Meaning */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nghĩa tiếng Việt <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="e.g. đáp ứng, cung cấp chỗ ở"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-800"
            />
          </div>

          {/* Example Sentence & Translation */}
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Câu ví dụ thực tế (TOEIC Context)
              </label>
              <textarea
                rows="2"
                value={example}
                onChange={(e) => setExample(e.target.value)}
                placeholder="e.g. The hotel can accommodate up to 500 guests."
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Dịch câu ví dụ sang tiếng Việt
              </label>
              <input
                type="text"
                value={exampleTranslation}
                onChange={(e) => setExampleTranslation(e.target.value)}
                placeholder="e.g. Khách sạn có thể đáp ứng cho tối đa 500 khách."
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Notes / Collocation */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ghi chú thêm (Collocation / Bẫy Part 5)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. accommodate a request / accommodate needs"
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Thẻ / Phân loại (Nhấn Enter để thêm)
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Thêm thẻ (Part 5, Test 1...)"
                className="flex-1 min-w-[120px] text-xs bg-transparent focus:outline-none text-slate-700"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all"
            >
              {editingWord ? 'Lưu thay đổi' : 'Thêm vào sổ từ'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
