import React, { useRef, useState } from 'react';
import { 
  X, 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  Volume2, 
  Check, 
  AlertCircle,
  FileSpreadsheet,
  ShieldCheck
} from 'lucide-react';
import { speakEnglish } from '../utils/sound';
import { exportAllDataAsJSON, importDataFromJSON } from '../utils/storage';

export default function SettingsModal({
  isOpen,
  onClose,
  allWords = [],
  customWords = [],
  settings = {},
  onUpdateSettings,
  onResetProgress,
  onDataImported
}) {
  const [speechRate, setSpeechRate] = useState(settings.speechRate || 0.9);
  const [autoPlayAudio, setAutoPlayAudio] = useState(settings.autoPlayAudio ?? true);
  const [importStatus, setImportStatus] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleSpeechRateChange = (val) => {
    setSpeechRate(val);
    onUpdateSettings({ ...settings, speechRate: val });
  };

  const handleAutoPlayChange = (val) => {
    setAutoPlayAudio(val);
    onUpdateSettings({ ...settings, autoPlayAudio: val });
  };

  // Export JSON
  const handleExportJSON = () => {
    const jsonStr = exportAllDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toeic_master_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV for Excel
  const handleExportCSV = () => {
    const wordsToExport = customWords.length > 0 ? customWords : allWords;
    const header = ['Từ vựng', 'Phiên âm', 'Loại từ', 'Nghĩa tiếng Việt', 'Câu ví dụ', 'Dịch ví dụ', 'Ngày thêm', 'Ghi chú'];
    const rows = wordsToExport.map(w => [
      `"${(w.word || '').replace(/"/g, '""')}"`,
      `"${(w.pronunciation || '').replace(/"/g, '""')}"`,
      `"${(w.partOfSpeech || '').replace(/"/g, '""')}"`,
      `"${(w.meaning || '').replace(/"/g, '""')}"`,
      `"${(w.example || '').replace(/"/g, '""')}"`,
      `"${(w.exampleTranslation || '').replace(/"/g, '""')}"`,
      `"${w.addedDate || ''}"`,
      `"${(w.note || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toeic_vocabulary_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON File
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const result = importDataFromJSON(content);
        if (result.success) {
          setImportStatus(`Nhập thành công ${result.count} từ vựng! Đang tải lại dữ liệu...`);
          setTimeout(() => {
            if (onDataImported) onDataImported();
            setImportStatus(null);
            onClose();
          }, 1200);
        } else {
          setImportStatus(`Lỗi khi nhập: ${result.error}`);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-800">Cài đặt & Sao lưu dữ liệu</h3>
              <p className="text-xs text-slate-500">Tùy chỉnh trải nghiệm học tập và quản lý dữ liệu an toàn</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Settings */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Âm thanh & Phát âm giọng đọc
          </h4>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs sm:text-sm font-bold text-slate-800">
                  Tốc độ phát âm: {speechRate}x
                </label>
                <p className="text-xs text-slate-500">Tùy chỉnh tốc độ đọc của Web Speech API</p>
              </div>

              <button
                type="button"
                onClick={() => speakEnglish('Accommodate your requests significantly', speechRate)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-blue-700 hover:bg-blue-50 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                Nghe thử
              </button>
            </div>

            <input
              type="range"
              min="0.6"
              max="1.2"
              step="0.05"
              value={speechRate}
              onChange={(e) => handleSpeechRateChange(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Backup & Restore */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Sao lưu & Khôi phục dữ liệu
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Export JSON */}
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Xuất file sao lưu (JSON)</div>
                <div className="text-[11px] text-slate-500">Lưu lại toàn bộ từ vựng & tiến độ</div>
              </div>
            </button>

            {/* Export CSV for Excel */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Xuất file Excel (CSV)</div>
                <div className="text-[11px] text-slate-500">Mở và in bảng từ vựng trong Excel</div>
              </div>
            </button>

            {/* Import JSON */}
            <div className="sm:col-span-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-2.5 p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Khôi phục từ file JSON</div>
                  <div className="text-[11px] text-slate-500">Tải lên file sao lưu đã xuất trước đó</div>
                </div>
              </button>
            </div>

          </div>

          {importStatus && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}
        </div>

        {/* Reset Progress */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-rose-600">Đặt lại tiến độ Spaced Repetition</div>
              <div className="text-[11px] text-slate-500">Xóa các đánh giá để học lại từ đầu (không xóa từ tự thêm)</div>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn đặt lại toàn bộ tiến độ ghi nhớ SRS không?')) {
                  onResetProgress();
                  onClose();
                }
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              Đặt lại SRS
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 text-center text-[11px] text-slate-400">
          TOEIC Master App • Phiên bản 2.0 • Tích hợp Spaced Repetition SM-2 & Đậu TOEIC
        </div>

      </div>
    </div>
  );
}
