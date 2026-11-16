import React, { useState, useMemo } from 'react';
import { X, FileSpreadsheet, Check, AlertCircle, Sparkles } from 'lucide-react';
import { getTodayDateString } from '../utils/srs';

export default function BatchImportModal({
  isOpen,
  onClose,
  onBatchSave
}) {
  const [inputText, setInputText] = useState('');
  const [defaultTag, setDefaultTag] = useState('Nạp hàng ngày');
  const [targetDate, setTargetDate] = useState(getTodayDateString());

  // Parser
  const parsedWords = useMemo(() => {
    if (!inputText.trim()) return [];

    const lines = inputText.split('\n');
    const result = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) return;

      let word = '';
      let meaning = '';
      let example = '';
      let exampleTranslation = '';

      if (trimmed.includes('\t')) {
        // Tab-separated (Excel / Google Sheets)
        const parts = trimmed.split('\t');
        word = parts[0]?.trim();
        meaning = parts[1]?.trim();
        example = parts[2]?.trim() || '';
        exampleTranslation = parts[3]?.trim() || '';
      } else if (trimmed.includes('|')) {
        // Pipe separated
        const parts = trimmed.split('|');
        word = parts[0]?.trim();
        meaning = parts[1]?.trim();
        example = parts[2]?.trim() || '';
        exampleTranslation = parts[3]?.trim() || '';
      } else if (trimmed.includes(' - ')) {
        // Dash separated
        const parts = trimmed.split(' - ');
        word = parts[0]?.trim();
        meaning = parts[1]?.trim();
      } else if (trimmed.includes(': ')) {
        // Colon separated
        const parts = trimmed.split(': ');
        word = parts[0]?.trim();
        meaning = parts[1]?.trim();
      }

      if (word && meaning) {
        result.push({
          word,
          meaning,
          example,
          exampleTranslation,
          partOfSpeech: word.includes(' ') ? 'phr' : 'noun',
          tags: [defaultTag || 'Nạp hàng ngày'],
          addedDate: targetDate
        });
      }
    });

    return result;
  }, [inputText, defaultTag, targetDate]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (parsedWords.length === 0) return;
    onBatchSave(parsedWords);
    setInputText('');
    onClose();
  };

  const sampleExample = `significantly | một cách đáng kể | Sales increased significantly. | Doanh số tăng đáng kể.
accommodate | đáp ứng, chứa được | The hall can accommodate 500 guests. | Hội trường chứa được 500 khách.
abide by - tuân thủ, tuân theo
account for : giải thích, chiếm tỉ lệ`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-7 shadow-2xl border border-slate-200 space-y-4 m-auto overscroll-contain">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-800">
                Nhập từ vựng hàng loạt (Batch Import)
              </h3>
              <p className="text-xs text-slate-500">
                Dán danh sách từ từ Excel, Quizlet, tài liệu TOEIC hoặc ghi chú nhanh
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

        {/* Instructions */}
        <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-100 text-xs text-blue-900 space-y-1.5">
          <p className="font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Định dạng hỗ trợ (Mỗi từ 1 dòng):
          </p>
          <ul className="list-disc pl-4 space-y-0.5 text-blue-800/90 font-mono text-[11px]">
            <li>Từ | Nghĩa | Ví dụ | Dịch câu (khuyên dùng)</li>
            <li>Từ - Nghĩa</li>
            <li>Từ : Nghĩa</li>
            <li>Copy & Paste trực tiếp từ cột Excel / Google Sheets</li>
          </ul>
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
                placeholder="e.g. Test 1 Part 5"
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
              <label className="text-xs font-bold text-slate-700">
                Dán nội dung vào đây:
              </label>
              <button
                type="button"
                onClick={() => setInputText(sampleExample)}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
              >
                Chèn dữ liệu mẫu
              </button>
            </div>
            <textarea
              rows="7"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Dán các từ vựng vào đây..."
              className="w-full p-3.5 rounded-2xl text-xs sm:text-sm font-mono bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            ></textarea>
          </div>
        </div>

        {/* Real-time Preview Table */}
        {parsedWords.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              Đã nhận diện thành công: {parsedWords.length} từ vựng
            </div>

            <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100 text-xs">
              {parsedWords.slice(0, 10).map((pw, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                  <div className="font-bold text-slate-800">{pw.word}</div>
                  <div className="text-slate-600 max-w-xs truncate">{pw.meaning}</div>
                </div>
              ))}
              {parsedWords.length > 10 && (
                <div className="p-2 text-center text-slate-400 text-xs font-medium bg-slate-50">
                  ... và {parsedWords.length - 10} từ nữa
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={parsedWords.length === 0}
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 shadow-md shadow-emerald-500/25 transition-all"
          >
            Lưu {parsedWords.length} từ vào Sổ tay
          </button>
        </div>

      </div>
    </div>
  );
}
