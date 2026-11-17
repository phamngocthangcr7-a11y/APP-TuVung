import React, { useState, useEffect } from 'react';
import { X, Volume2, Sparkles, Check, AlertCircle, Search, Loader2, ArrowRight } from 'lucide-react';
import { speakEnglish } from '../utils/sound';
import { getTodayDateString } from '../utils/srs';
import { 
  lookupEnglishWord, 
  checkUserMeaningAccuracy, 
  CURATED_TOEIC_EXAMPLES, 
  isBadTemplateSentence, 
  inferPartOfSpeech, 
  fetchAuthenticSentence 
} from '../utils/dictionary';

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

  // Dictionary check state
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [dictData, setDictData] = useState(null);

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
    setCheckResult(null);
    setDictData(null);
  }, [editingWord, isOpen]);

  if (!isOpen) return null;

  // Tra cứu & Kiểm tra nghĩa tự động
  const handleCheckMeaning = async () => {
    const cleanWord = word.trim();
    if (!cleanWord || cleanWord === '-') {
      alert('Vui lòng nhập từ vựng tiếng Anh trước khi kiểm tra!');
      return;
    }

    setIsChecking(true);
    setCheckResult(null);

    try {
      const data = await lookupEnglishWord(cleanWord);
      setDictData(data);

      if (data.found) {
        // Tự động điền phiên âm nếu chưa có
        if (!pronunciation && data.phonetic) {
          setPronunciation(data.phonetic);
        }

        // Tự động điền loại từ nếu chưa chọn chuẩn
        if (data.partOfSpeech) {
          setPartOfSpeech(data.partOfSpeech);
        }

        // Tự động gợi ý câu ví dụ nếu chưa có
        if (!example && data.example) {
          setExample(data.example);
          if (data.exampleTranslation) {
            setExampleTranslation(data.exampleTranslation);
          }
        }

        // Kiểm tra đối chiếu nghĩa người dùng đã nhập
        if (meaning.trim()) {
          const accuracy = checkUserMeaningAccuracy(meaning, data);
          setCheckResult(accuracy);
        } else {
          // Người dùng chưa nhập nghĩa -> tự động gợi ý nghĩa
          setMeaning(data.meaning);
          setCheckResult({
            status: 'good',
            message: `Đã tự động lấy nghĩa từ điển chuẩn: "${data.meaning}". Bạn có thể chỉnh sửa lại theo ý mình.`,
            isAccurate: true,
            suggestedMeaning: data.meaning
          });
        }
      } else {
        setCheckResult({
          status: 'warning',
          message: 'Không tìm thấy trong từ điển trực tuyến, bạn có thể tự nhập nghĩa theo ngữ cảnh đề bài.',
          isAccurate: false
        });
      }
    } catch (err) {
      console.error(err);
      setCheckResult({
        status: 'warning',
        message: 'Lỗi kết nối khi tra nghĩa, bạn có thể tự nhập nghĩa bình thường.',
        isAccurate: false
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleApplyDictSuggestion = () => {
    if (!dictData) return;
    if (dictData.meaning) setMeaning(dictData.meaning);
    if (dictData.phonetic) setPronunciation(dictData.phonetic);
    if (dictData.partOfSpeech) setPartOfSpeech(dictData.partOfSpeech);
    if (dictData.example) setExample(dictData.example);
    if (dictData.exampleTranslation) setExampleTranslation(dictData.exampleTranslation);
    setCheckResult({
      status: 'good',
      message: 'Đã áp dụng toàn bộ gợi ý chuẩn từ từ điển!',
      isAccurate: true
    });
  };

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

  const [isGeneratingExample, setIsGeneratingExample] = useState(false);

  const handleGenerateExample = async () => {
    const cleanWord = word.trim();
    if (!cleanWord) {
      alert('Vui lòng nhập từ vựng tiếng Anh trước!');
      return;
    }
    setIsGeneratingExample(true);
    try {
      const res = await fetchAuthenticSentence(cleanWord);
      if (res && res.example) {
        setExample(res.example);
        setExampleTranslation(res.translation);
      } else {
        alert('Chưa tìm thấy câu ví dụ mẫu phù hợp trong từ điển cho từ này. Bạn có thể tự gõ ví dụ hoặc để trống nhé!');
      }
    } catch (e) {
      console.warn('Generate example error:', e);
    } finally {
      setIsGeneratingExample(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanWord = word.trim();
    const cleanMeaning = meaning.trim();

    if (!cleanWord || cleanWord === '-' || !cleanMeaning) {
      alert('Vui lòng nhập đầy đủ Từ tiếng Anh và Nghĩa tiếng Việt hợp lệ!');
      return;
    }

    const lower = cleanWord.toLowerCase();
    const curated = CURATED_TOEIC_EXAMPLES[lower];

    let finalExample = example.trim();
    let finalExampleTranslation = exampleTranslation.trim();

    // Tẩy rửa nếu từ đang dính câu ghép mad-libs lỗi
    if (isBadTemplateSentence(finalExample, finalExampleTranslation)) {
      finalExample = '';
      finalExampleTranslation = '';
    }

    // Nếu để trống câu ví dụ và có trong kho tinh tuyển, nạp tự động
    if (!finalExample && curated) {
      finalExample = curated.example;
      finalExampleTranslation = curated.translation;
    }

    const determinedPos = partOfSpeech && partOfSpeech !== 'noun'
      ? partOfSpeech
      : (curated?.partOfSpeech || inferPartOfSpeech(cleanWord));

    onSave({
      word: cleanWord,
      pronunciation: pronunciation.trim() || (curated?.pronunciation || ''),
      partOfSpeech: determinedPos,
      meaning: cleanMeaning,
      example: finalExample,
      exampleTranslation: finalExampleTranslation,
      note: note.trim(),
      tags: tags.length > 0 ? tags : ['TOEIC'],
      addedDate
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FFFDF9] rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-7 shadow-2xl border border-[#EBE5DA] space-y-4 m-auto overscroll-contain">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EAE5DC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#2C2A29]">
                {editingWord ? 'Chỉnh sửa từ vựng' : 'Thêm từ vựng & Check nghĩa'}
              </h3>
              <p className="text-xs text-[#736E65]">
                Tự động kiểm tra nghĩa tiếng Việt chuẩn xác trước khi đưa vào bộ học
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-xl text-[#8C867A] hover:text-[#2C2A29] hover:bg-[#F2EFE8] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* Word Input & Auto Check Button */}
          <div>
            <label className="block text-xs font-bold text-[#2C2A29] mb-1">
              Từ vựng / Cụm từ tiếng Anh <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  value={word}
                  onChange={(e) => {
                    setWord(e.target.value);
                    setCheckResult(null);
                  }}
                  placeholder="e.g. accommodate, significantly..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white border border-[#DCD6C9] focus:outline-none focus:ring-2 focus:ring-[#2B4C7E]/20 focus:border-[#2B4C7E] font-bold text-[#1E293B]"
                />
                {word && (
                  <button
                    type="button"
                    onClick={() => speakEnglish(word)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 p-1"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* CHECK NGHĨA BUTTON */}
              <button
                type="button"
                disabled={isChecking || !word.trim()}
                onClick={handleCheckMeaning}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#2B4C7E] hover:bg-[#1E365B] disabled:opacity-50 shadow-xs transition-all shrink-0"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang tra...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Check nghĩa</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* CHECK RESULT BANNER */}
          {checkResult && (
            <div className={`p-3 rounded-2xl border text-xs space-y-1.5 animate-fadeIn ${
              checkResult.status === 'good'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}>
              <div className="flex items-start gap-2 font-bold">
                {checkResult.status === 'good' ? (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <span>{checkResult.message}</span>
                </div>
              </div>

              {dictData && dictData.meaning && dictData.meaning !== meaning && (
                <div className="pt-1 flex items-center justify-between border-t border-amber-200/60 mt-1">
                  <span className="text-[11px] text-[#736E65]">
                    Gợi ý từ điển: <strong>{dictData.meaning}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleApplyDictSuggestion}
                    className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1"
                  >
                    Dùng gợi ý này <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Meaning Input */}
          <div>
            <label className="block text-xs font-bold text-[#2C2A29] mb-1">
              Nghĩa tiếng Việt <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="e.g. đáp ứng, cung cấp chỗ ở..."
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white border border-[#DCD6C9] focus:outline-none focus:ring-2 focus:ring-[#2B4C7E]/20 focus:border-[#2B4C7E] font-semibold text-[#1E293B]"
            />
          </div>

          {/* Pronunciation & Part of Speech */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2C2A29] mb-1">
                Phiên âm (IPA)
              </label>
              <input
                type="text"
                value={pronunciation}
                onChange={(e) => setPronunciation(e.target.value)}
                placeholder="/əˈkɑːmədeɪt/"
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white border border-[#DCD6C9] font-mono focus:outline-none focus:ring-2 focus:ring-[#2B4C7E]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C2A29] mb-1">
                Loại từ
              </label>
              <select
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white border border-[#DCD6C9] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2B4C7E]/20"
              >
                <option value="noun">Danh từ (noun)</option>
                <option value="verb">Động từ (verb)</option>
                <option value="adj">Tính từ (adjective)</option>
                <option value="adv">Trạng từ (adverb)</option>
                <option value="phr">Cụm từ (phrase)</option>
              </select>
            </div>
          </div>

          {/* Example Sentence & Translation */}
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#2C2A29]">
                  Câu ví dụ TOEIC
                </label>
                <button
                  type="button"
                  onClick={handleGenerateExample}
                  disabled={isGeneratingExample}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingExample ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Đang tra câu chuẩn...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      <span>Tra câu ví dụ chuẩn</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                rows="2"
                value={example}
                onChange={(e) => setExample(e.target.value)}
                placeholder="The hotel can accommodate up to 500 guests."
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white border border-[#DCD6C9] focus:outline-none focus:ring-2 focus:ring-[#2B4C7E]/20"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C2A29] mb-1">
                Dịch câu ví dụ
              </label>
              <input
                type="text"
                value={exampleTranslation}
                onChange={(e) => setExampleTranslation(e.target.value)}
                placeholder="Khách sạn có thể đáp ứng cho tối đa 500 khách."
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white border border-[#DCD6C9] focus:outline-none focus:ring-2 focus:ring-[#2B4C7E]/20"
              />
            </div>
          </div>

          {/* Date & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2C2A29] mb-1">
                Ngày gặp từ
              </label>
              <input
                type="date"
                value={addedDate}
                onChange={(e) => setAddedDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white border border-[#DCD6C9] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C2A29] mb-1">
                Gắn thẻ phân loại
              </label>
              <div className="flex flex-wrap items-center gap-1 p-1.5 rounded-xl bg-white border border-[#DCD6C9]">
                {tags.map((t, idx) => (
                  <span key={idx} className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#F7F4EB] text-[#2C2A29] border border-[#EAE5DC]">
                    #{t}
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="+ Thẻ..."
                  className="flex-1 min-w-[70px] text-xs bg-transparent focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#EAE5DC]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#736E65] hover:bg-[#F2EFE8] transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#2B4C7E] hover:bg-[#1E365B] shadow-sm transition-all"
            >
              {editingWord ? 'Lưu thay đổi' : 'Lưu vào bộ từ để học'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
