import React, { useState, useMemo } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Search, 
  Trash2, 
  Loader2, 
  ArrowRight,
  BookOpen,
  Layers
} from 'lucide-react';
import { getTodayDateString } from '../utils/srs';
import { 
  lookupEnglishWord, 
  CURATED_TOEIC_EXAMPLES, 
  isBadTemplateSentence, 
  inferPartOfSpeech,
  correctVietnameseSpelling,
  getToeicExampleFallback
} from '../utils/dictionary';
import { getBatchDraft, saveBatchDraft, clearBatchDraft } from '../utils/storage';

export default function BatchImportModal({
  isOpen,
  onClose,
  onBatchSave
}) {
  const [inputText, setInputText] = useState(() => getBatchDraft());
  const [defaultTag, setDefaultTag] = useState('Nạp hàng ngày');
  const [targetDate, setTargetDate] = useState(getTodayDateString());
  const [isAutoTranslating, setIsAutoTranslating] = useState(false);
  const [translateProgress, setTranslateProgress] = useState({ current: 0, total: 0, currentWord: '' });
  const [manualParsedWords, setManualParsedWords] = useState(null);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState('');

  // 1. SMART MULTI-FORMAT PARSER
  const autoParsedWords = useMemo(() => {
    if (!inputText.trim()) return [];

    const lines = inputText.split(/\r?\n/);
    const result = [];

    lines.forEach(rawLine => {
      let line = rawLine.trim();
      if (!line || line.startsWith('//') || line.startsWith('#')) return;

      // Xóa số thứ tự đầu dòng (ví dụ: "1. ", "1/ ", "1) ", "• ", "- ", "* ", "[1] ")
      line = line.replace(/^(\d+[\.\/\)\-\:]|\*|\•|\-|\+|\[\d+\]|\(\d+\))\s*/, '').trim();
      if (!line) return;

      let word = '';
      let meaning = '';
      let example = '';
      let exampleTranslation = '';

      // Thử các loại phân cách phổ biến
      if (line.includes('\t')) {
        // Tab-separated (từ Excel, Google Sheets, Quizlet)
        const parts = line.split('\t').map(p => p.trim());
        word = parts[0] || '';
        meaning = parts[1] || '';
        example = parts[2] || '';
        exampleTranslation = parts[3] || '';
      } else if (line.includes('|')) {
        // Pipe separated (từ | nghĩa | ví dụ | dịch)
        const parts = line.split('|').map(p => p.trim());
        word = parts[0] || '';
        meaning = parts[1] || '';
        example = parts[2] || '';
        exampleTranslation = parts[3] || '';
      } else if (/(\s*[-–—]\s*)/.test(line)) {
        // Dấu gạch ngang, en-dash, em-dash (kể cả có hoặc không có khoảng trắng)
        const parts = line.split(/\s*[-–—]\s*/);
        word = parts[0]?.trim() || '';
        meaning = parts[1]?.trim() || '';
        example = parts[2]?.trim() || '';
        exampleTranslation = parts[3]?.trim() || '';
      } else if (line.includes(':')) {
        // Dấu hai chấm (word: meaning)
        const parts = line.split(/\s*:\s*/);
        word = parts[0]?.trim() || '';
        meaning = parts.slice(1).join(': ').trim();
      } else if (/(\s*(=>|->|→|=)\s*)/.test(line)) {
        // Dấu mũi tên hoặc dấu bằng (word -> meaning)
        const parts = line.split(/\s*(=>|->|→|=)\s*/);
        word = parts[0]?.trim() || '';
        meaning = parts[parts.length - 1]?.trim() || '';
      } else if (line.includes(';')) {
        // Dấu chấm phẩy
        const parts = line.split(/\s*;\s*/);
        word = parts[0]?.trim() || '';
        meaning = parts[1]?.trim() || '';
      } else if (line.includes(',')) {
        // Dấu phẩy (CSV hoặc word, meaning)
        const parts = line.split(/\s*,\s*/);
        word = parts[0]?.trim() || '';
        meaning = parts.slice(1).join(', ').trim();
      } else if (/\s{2,}/.test(line)) {
        // Khoảng trắng kép (copy từ cột không có tab)
        const parts = line.split(/\s{2,}/);
        word = parts[0]?.trim() || '';
        meaning = parts.slice(1).join(' ').trim();
      } else if (line.includes('/')) {
        // Dấu gạch chéo
        const parts = line.split(/\s*\/\s*/);
        word = parts[0]?.trim() || '';
        meaning = parts.slice(1).join(' / ').trim();
      } else {
        // Chỉ có từ tiếng Anh đơn thuần (không có dấu phân cách)
        word = line.trim();
        meaning = '';
      }

      // Xóa dấu nháy đơn/kép thừa nếu có
      word = word.trim().replace(/^['"`]+|['"`]+$/g, '');

      if (word && word !== '-') {
        const lower = word.toLowerCase();
        const curated = CURATED_TOEIC_EXAMPLES[lower];
        const determinedPos = curated?.partOfSpeech || inferPartOfSpeech(word);

        // Chuẩn hóa và sửa lỗi chính tả tiếng Việt trong nghĩa người dùng nhập (VD: "bởi vị" -> "do, bởi vì")
        let cleanedMeaning = correctVietnameseSpelling(meaning);
        if (!cleanedMeaning && curated?.meaning) {
          cleanedMeaning = curated.meaning;
        }

        let initialExample = example || (curated?.example || '');
        let initialExTranslation = exampleTranslation || (curated?.translation || '');

        if (isBadTemplateSentence(initialExample, initialExTranslation)) {
          initialExample = curated?.example || '';
          initialExTranslation = curated?.translation || '';
        }

        // Đảm bảo 100% luôn có câu ví dụ TOEIC chuẩn và dịch
        if (!initialExample) {
          const fallback = getToeicExampleFallback(word, determinedPos, cleanedMeaning);
          initialExample = fallback.example;
          initialExTranslation = fallback.translation;
        }

        result.push({
          word,
          pronunciation: curated?.pronunciation || '',
          meaning: cleanedMeaning || '',
          example: initialExample,
          exampleTranslation: initialExTranslation,
          partOfSpeech: determinedPos,
          tags: [defaultTag || 'Nạp hàng ngày'],
          addedDate: targetDate || getTodayDateString()
        });
      }
    });

    return result;
  }, [inputText, defaultTag, targetDate]);

  // Use manualParsedWords if user triggered auto-translate or edited
  const activeWords = manualParsedWords || autoParsedWords;

  // Reset manual state when input text changes & auto-save draft to prevent loss
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);
    saveBatchDraft(val);
    setManualParsedWords(null);
    setSavedSuccessMessage('');
  };

  // 2. AUTO AI / DICTIONARY TRANSLATE & MEANING VERIFICATION BUTTON
  const handleAutoTranslate = async () => {
    if (activeWords.length === 0) return;

    setIsAutoTranslating(true);
    const updated = [...activeWords];
    const total = updated.length;

    for (let i = 0; i < total; i++) {
      const item = updated[i];
      const lower = (item.word || '').toLowerCase();
      const curated = CURATED_TOEIC_EXAMPLES[lower];

      // 1. Luôn sửa lỗi chính tả tiếng Việt trong nghĩa người dùng (VD: "bởi vị" -> "do, bởi vì")
      let cleanMeaning = correctVietnameseSpelling(item.meaning);
      if (!cleanMeaning && curated?.meaning) {
        cleanMeaning = curated.meaning;
      }
      item.meaning = cleanMeaning;

      if (curated) {
        if (!item.pronunciation && curated.pronunciation) item.pronunciation = curated.pronunciation;
        if (curated.partOfSpeech) item.partOfSpeech = curated.partOfSpeech;
        if (!item.example || isBadTemplateSentence(item.example, item.exampleTranslation)) {
          item.example = curated.example;
          item.exampleTranslation = curated.translation;
        }
      }

      const needsMeaning = !item.meaning || item.meaning.trim() === '';
      const needsExample = !item.example || item.example.trim() === '' || isBadTemplateSentence(item.example, item.exampleTranslation);

      if (needsMeaning || needsExample || !item.pronunciation) {
        setTranslateProgress({ current: i + 1, total, currentWord: item.word });
        try {
          const dictRes = await lookupEnglishWord(item.word);
          if (dictRes.found || dictRes.meaning) {
            if (needsMeaning && dictRes.meaning) item.meaning = dictRes.meaning;
            if (dictRes.partOfSpeech) item.partOfSpeech = dictRes.partOfSpeech;
            if (dictRes.phonetic && !item.pronunciation) item.pronunciation = dictRes.phonetic;
            if (needsExample && dictRes.example) {
              item.example = dictRes.example;
              item.exampleTranslation = dictRes.exampleTranslation || '';
            }
          }
        } catch (e) {
          console.warn('Translate error:', e);
        }
      }

      // Đảm bảo 100% không bao giờ để trống câu ví dụ
      if (!item.example || isBadTemplateSentence(item.example, item.exampleTranslation)) {
        const fallback = getToeicExampleFallback(item.word, item.partOfSpeech, item.meaning);
        item.example = fallback.example;
        item.exampleTranslation = fallback.translation;
      }
    }

    setManualParsedWords(updated);
    setIsAutoTranslating(false);
    setTranslateProgress({ current: 0, total: 0, currentWord: '' });
  };

  // Delete a parsed word from preview
  const handleDeleteWord = (index) => {
    const list = [...activeWords];
    list.splice(index, 1);
    setManualParsedWords(list);
  };

  // Update a parsed word inline
  const handleUpdateMeaning = (index, newMeaning) => {
    const list = [...activeWords];
    list[index] = { ...list[index], meaning: correctVietnameseSpelling(newMeaning) };
    setManualParsedWords(list);
  };

  // Save words (Đảm bảo 100% nghĩa chuẩn chính tả, câu ví dụ chuẩn ETS, không bao giờ để trống)
  const handleSave = (andStudy = false) => {
    if (activeWords.length === 0) return;

    const validWords = activeWords.map(w => {
      const lower = (w.word || '').toLowerCase();
      const curated = CURATED_TOEIC_EXAMPLES[lower];

      // Tự động sửa lỗi chính tả tiếng Việt trong nghĩa (VD: "bởi vị" -> "do, bởi vì")
      let cleanMeaning = correctVietnameseSpelling(w.meaning);
      if (!cleanMeaning && curated?.meaning) {
        cleanMeaning = curated.meaning;
      }

      const determinedPos = w.partOfSpeech && w.partOfSpeech !== 'noun'
        ? w.partOfSpeech
        : (curated?.partOfSpeech || inferPartOfSpeech(w.word));

      let ex = (w.example && w.example.trim()) ? w.example.trim() : (curated?.example || '');
      let exTrans = (w.exampleTranslation && w.exampleTranslation.trim()) ? w.exampleTranslation.trim() : (curated?.translation || '');

      if (isBadTemplateSentence(ex, exTrans)) {
        ex = curated?.example || '';
        exTrans = curated?.translation || '';
      }

      // Đảm bảo 100% luôn có câu ví dụ TOEIC chuẩn xác
      if (!ex) {
        const fallback = getToeicExampleFallback(w.word, determinedPos, cleanMeaning);
        ex = fallback.example;
        exTrans = fallback.translation;
      }

      return {
        ...w,
        pronunciation: (w.pronunciation || '').trim() || (curated?.pronunciation || ''),
        meaning: cleanMeaning && cleanMeaning.trim() !== '' ? cleanMeaning.trim() : '(Từ mới chưa dịch)',
        example: ex,
        exampleTranslation: exTrans,
        partOfSpeech: determinedPos,
        tags: [defaultTag || 'Nạp hàng ngày'],
        addedDate: targetDate || getTodayDateString()
      };
    });

    onBatchSave(validWords, andStudy ? 'study' : null);
    clearBatchDraft();
    setSavedSuccessMessage(`🎉 Đã lưu thành công ${validWords.length} từ vựng vào Sổ tay của bạn!`);

    setTimeout(() => {
      setInputText('');
      setManualParsedWords(null);
      setSavedSuccessMessage('');
      onClose();
    }, 900);
  };

  if (!isOpen) return null;

  const sampleExample = `significantly | một cách đáng kể | Sales increased significantly. | Doanh số tăng đáng kể.
accommodate | đáp ứng, chứa được | The hall can accommodate 500 guests. | Hội trường chứa được 500 khách.
abide by - tuân thủ, tuân theo
account for : giải thích, chiếm tỉ lệ
contingency plan = kế hoạch dự phòng
substantiate, chứng minh, xác thực
prerequisite
feasibility`;

  const missingMeaningsCount = activeWords.filter(w => !w.meaning || w.meaning.trim() === '').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-7 shadow-2xl border border-slate-200 space-y-4 m-auto overscroll-contain">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-800">
                Nhập từ vựng hàng loạt (Batch Import)
              </h3>
              <p className="text-xs text-slate-500">
                Dán danh sách từ từ Excel, Quizlet, website hoặc ghi chú TOEIC hàng ngày
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {savedSuccessMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs sm:text-sm font-bold flex items-center gap-2 animate-fadeIn">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{savedSuccessMessage}</span>
          </div>
        )}

        {/* Instructions Guide */}
        <div className="bg-blue-50/80 p-3 sm:p-3.5 rounded-2xl border border-blue-200 text-xs text-blue-900 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Hỗ trợ tất cả định dạng (Mỗi từ 1 dòng, không bắt buộc dấu gạch):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-blue-800 font-mono pt-1">
            <div>• Từ | Nghĩa | Ví dụ | Dịch</div>
            <div>• Từ - Nghĩa  hoặc  Từ : Nghĩa</div>
            <div>• Copy từ cột Excel / Google Sheets</div>
            <div>• Chỉ cần dán từ tiếng Anh (có nút tự dịch AI)</div>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Gắn thẻ phân loại (Tag)
              </label>
              <input
                type="text"
                value={defaultTag}
                onChange={(e) => setDefaultTag(e.target.value)}
                placeholder="e.g. Từ vựng ngày 16/11"
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày ghi nhận
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>Dán nội dung từ vựng vào đây:</span>
                <span className="text-[10px] font-normal text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Tự lưu nháp
                </span>
              </label>
              <div className="flex items-center gap-2">
                {inputText.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputText('');
                      clearBatchDraft();
                      setManualParsedWords(null);
                    }}
                    className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                  >
                    Xóa trắng
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setInputText(sampleExample);
                    saveBatchDraft(sampleExample);
                    setManualParsedWords(null);
                  }}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  Chèn dữ liệu mẫu
                </button>
              </div>
            </div>
            <textarea
              rows="6"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Dán danh sách từ của bạn vào đây (ví dụ: &#10;1. accommodate - đáp ứng &#10;2. significant: đáng kể &#10;3. prerequisite)..."
              className="w-full p-3.5 rounded-2xl text-xs sm:text-sm font-mono bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            ></textarea>
          </div>
        </div>

        {/* Real-time Preview & AI Auto Translate */}
        {activeWords.length > 0 && (
          <div className="space-y-2 pt-1 border-t border-slate-100">
            
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Đã nhận diện: {activeWords.length} từ vựng</span>
                {missingMeaningsCount > 0 && (
                  <span className="text-amber-600 font-semibold">
                    ({missingMeaningsCount} từ chưa có nghĩa)
                  </span>
                )}
              </div>

              {/* Auto Translate & Meaning Check Button */}
              {activeWords.length > 0 && (
                <button
                  type="button"
                  disabled={isAutoTranslating}
                  onClick={handleAutoTranslate}
                  title="Kiểm tra đối chiếu từ điển, tự động sửa lỗi chính tả tiếng Việt và điền ví dụ chuẩn"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isAutoTranslating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang kiểm tra ({translateProgress.current}/{translateProgress.total})...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>⚡ Kiểm tra nghĩa & Chuẩn hóa chính tả AI</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Words Table Preview */}
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100 text-xs">
              {activeWords.map((pw, idx) => (
                <div key={idx} className="p-2 sm:p-2.5 flex items-center justify-between gap-2 hover:bg-slate-50">
                  <div className="w-1/3 font-bold text-[#C52243] truncate" title={pw.word}>
                    {pw.word}
                  </div>

                  <div className="flex-1">
                    <input
                      type="text"
                      value={pw.meaning}
                      onChange={(e) => handleUpdateMeaning(idx, e.target.value)}
                      placeholder="Nhập nghĩa tiếng Việt..."
                      className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteWord(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Xóa dòng này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-3 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Hủy
          </button>

          <button
            type="button"
            disabled={activeWords.length === 0 || isAutoTranslating}
            onClick={() => handleSave(false)}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 shadow-md shadow-emerald-500/25 transition-all cursor-pointer"
          >
            Lưu {activeWords.length} từ vào Sổ tay
          </button>

          <button
            type="button"
            disabled={activeWords.length === 0 || isAutoTranslating}
            onClick={() => handleSave(true)}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 shadow-md shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Lưu & Học SmartCards ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
