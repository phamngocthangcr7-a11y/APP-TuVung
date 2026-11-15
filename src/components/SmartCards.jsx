import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Volume2, 
  RotateCcw, 
  Trash2, 
  Star, 
  Check, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Layers, 
  Award,
  BookOpen,
  Image as ImageIcon
} from 'lucide-react';
import { speakEnglish, sound } from '../utils/sound';
import { calculateNextSrs, SRS_RATING, isDueForReview } from '../utils/srs';

export default function SmartCards({
  allWords = [],
  customWords = [],
  builtInSets = [],
  onUpdateWordSrs,
  onRecordStudySession,
  initialWords = null,
  initialMode = 'all',
  onBackToDashboard,
  onOpenAddModal
}) {
  const [selectedSource, setSelectedSource] = useState(initialMode || 'all');
  const [activeQueue, setActiveQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(true); // MVP TOEIC shows meaning directly or flip toggle
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [rememberedCount, setRememberedCount] = useState(0);
  const [forgottenCount, setForgottenCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Sanitize and filter valid words
  const sanitize = (list) => {
    if (!Array.isArray(list)) return [];
    return list.filter(w => w && typeof w === 'object' && w.word && String(w.word).trim() !== '' && String(w.word).trim() !== '-');
  };

  // Load study queue
  const loadQueue = useCallback((source) => {
    let list = [];

    if (Array.isArray(initialWords) && initialWords.length > 0 && source === 'custom_list') {
      list = [...initialWords];
    } else if (source === 'due') {
      list = allWords.filter(w => isDueForReview(w));
      if (list.length === 0) list = allWords.slice(0, 30);
    } else if (source === 'today') {
      const today = new Date().toISOString().split('T')[0];
      list = (customWords || []).filter(w => w && w.addedDate === today);
      if (list.length === 0) list = allWords.slice(0, 30);
    } else if (source === 'all_custom') {
      list = [...customWords];
    } else if (typeof source === 'string' && source.startsWith('set_')) {
      const set = (builtInSets || []).find(s => s.id === source);
      list = set && set.words ? set.words : [];
    } else {
      list = allWords;
    }

    const clean = sanitize(list);
    if (clean.length === 0 && builtInSets[0]?.words) {
      clean.push(...sanitize(builtInSets[0].words));
    }

    const shuffled = clean.sort(() => 0.5 - Math.random());
    setActiveQueue(shuffled);
    setCurrentIndex(0);
    setIsFlipped(true); // Hiển thị đầy đủ như MVP SmartCards
    setSessionCompleted(false);
    setRememberedCount(0);
    setForgottenCount(0);
    setIsSaved(false);
    setToastMessage('');
  }, [allWords, customWords, builtInSets, initialWords]);

  useEffect(() => {
    if (initialWords && initialWords.length > 0) {
      loadQueue('custom_list');
    } else {
      loadQueue(selectedSource);
    }
  }, [selectedSource, loadQueue, initialWords]);

  const currentWord = activeQueue[currentIndex];

  // Auto speak on card change if autoPlayAudio is enabled
  useEffect(() => {
    if (currentWord && currentWord.word && autoPlayAudio) {
      speakEnglish(currentWord.word, 0.9);
    }
  }, [currentWord, currentIndex, autoPlayAudio]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 1500);
  };

  // 1. NÚT CHƯA NHỚ (Lặp lại ở cuối phiên)
  const handleUnremembered = useCallback(() => {
    if (!currentWord) return;

    sound.playIncorrect();
    setForgottenCount(prev => prev + 1);
    showToast('🔁 Chưa nhớ: Từ này sẽ lặp lại ở cuối phiên học!');

    const nextSrs = calculateNextSrs(currentWord.srs, SRS_RATING.AGAIN);
    if (onUpdateWordSrs) onUpdateWordSrs(currentWord.id, nextSrs);
    if (onRecordStudySession) onRecordStudySession(1);

    // Xếp từ xuống cuối hàng đợi
    setActiveQueue(prev => {
      const copy = [...prev];
      const item = copy.splice(currentIndex, 1)[0];
      copy.push(item);
      return copy;
    });

    setIsSaved(false);
  }, [currentWord, currentIndex, onUpdateWordSrs, onRecordStudySession]);

  // 2. NÚT ĐÃ NHỚ (Chuyển sang từ tiếp theo)
  const handleRemembered = useCallback(() => {
    if (!currentWord) return;

    sound.playCorrect();
    setRememberedCount(prev => prev + 1);
    showToast('✨ Đã nhớ! Tuyệt vời!');

    const nextSrs = calculateNextSrs(currentWord.srs, SRS_RATING.GOOD);
    if (onUpdateWordSrs) onUpdateWordSrs(currentWord.id, nextSrs);
    if (onRecordStudySession) onRecordStudySession(1);

    if (currentIndex + 1 >= activeQueue.length) {
      sound.playVictory();
      setSessionCompleted(true);
    } else {
      setCurrentIndex(prev => prev + 1);
      setIsSaved(false);
    }
  }, [currentWord, currentIndex, activeQueue.length, onUpdateWordSrs, onRecordStudySession]);

  // Phím tắt theo chuẩn The MVP TOEIC (Image 2 & 3)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === '1') {
        e.preventDefault();
        handleUnremembered();
      } else if (e.key === '2') {
        e.preventDefault();
        handleRemembered();
      } else if (e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (currentWord?.word) speakEnglish(currentWord.word, 0.9);
      } else if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUnremembered, handleRemembered, currentWord]);

  // Highlight target word in example
  const formattedExample = useMemo(() => {
    if (!currentWord || !currentWord.example || !currentWord.word) return '';
    try {
      const parts = currentWord.example.split(new RegExp(`(${currentWord.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
      return parts.map((part, i) => 
        part.toLowerCase() === currentWord.word.toLowerCase() 
          ? <strong key={i} className="font-extrabold text-[#0F172A]">{part}</strong> 
          : part
      );
    } catch (e) {
      return currentWord.example;
    }
  }, [currentWord]);

  // Màn hình hoàn thành
  if (sessionCompleted || !currentWord) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-[#0B132B]">
              Hoàn thành phiên học SmartCards!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Bạn đã ôn tập xong tất cả {activeQueue.length} thẻ trong phiên này.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <div className="text-2xl font-black text-emerald-600">{rememberedCount}</div>
              <div className="text-xs text-slate-500 font-semibold">Đã nhớ</div>
            </div>
            <div>
              <div className="text-2xl font-black text-amber-600">{forgottenCount}</div>
              <div className="text-xs text-slate-500 font-semibold">Lặp lại để thuộc</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => loadQueue(selectedSource)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#0B132B] hover:bg-[#1E293B] text-white shadow-sm transition-all"
            >
              Ôn lại bộ này
            </button>
            <button
              onClick={onBackToDashboard}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Về Sổ từ vựng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-16">
      
      {/* Sub-Header Bar (Exact style of The MVP TOEIC in Image 2 & 3) */}
      <div className="bg-white rounded-2xl px-5 py-3 border border-slate-200/80 shadow-xs flex items-center justify-between">
        
        {/* Left: Source select / Back */}
        <div className="flex items-center gap-3">
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="text-xs sm:text-sm font-bold text-[#0B132B] bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none"
          >
            <option value="all">📚 Cơ Bản • Review Mode ({allWords.length} thẻ)</option>
            <option value="today">📅 Từ nạp hôm nay</option>
            <option value="due">⏰ Từ cần ôn hôm nay (SRS)</option>
            <option value="all_custom">📝 Toàn bộ từ tự thêm ({customWords.length})</option>
            <optgroup label="Bộ từ TOEIC có sẵn">
              {(builtInSets || []).map(s => (
                <option key={s.id} value={s.id}>{s.title} ({s.words?.length} từ)</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Center Title & Progress */}
        <div className="text-center hidden sm:block">
          <div className="text-sm font-extrabold text-[#0B132B]">
            Cơ Bản • Review Mode
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Đã học {currentIndex} / {activeQueue.length} thẻ
          </div>
        </div>

        {/* Right Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadQueue(selectedSource)}
            title="Xáo trộn lại"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Blue Progress Bar Line */}
      <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-blue-600 h-1.5 transition-all duration-300 rounded-full"
          style={{ width: `${((currentIndex + 1) / activeQueue.length) * 100}%` }}
        ></div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold text-center shadow-xs animate-fadeIn">
          {toastMessage}
        </div>
      )}

      {/* MAIN CARD WORKSPACE (3 Columns like The MVP TOEIC Image 2 & 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* LEFT COLUMN: Phím tắt (Desktop) */}
        <div className="hidden lg:block lg:col-span-2">
          <div className="bg-[#F0F7FF] rounded-2xl p-4 border border-blue-100/80 shadow-xs space-y-3">
            <h4 className="font-bold text-xs text-[#0B132B]">
              Phím tắt:
            </h4>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="leading-snug">
                <kbd className="px-1.5 py-0.5 rounded bg-white text-slate-800 font-mono border border-slate-200 shadow-2xs font-bold">Space</kbd>
                <span className="ml-1 text-[11px]">để lật thẻ</span>
              </div>
              <div className="leading-snug flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-white text-slate-800 font-mono border border-slate-200 shadow-2xs font-bold">1</kbd>
                <span className="text-[11px] font-semibold text-rose-600">Chưa nhớ</span>
              </div>
              <div className="leading-snug flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-white text-slate-800 font-mono border border-slate-200 shadow-2xs font-bold">2</kbd>
                <span className="text-[11px] font-semibold text-emerald-600">Đã nhớ</span>
              </div>
              <div className="leading-snug flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-white text-slate-800 font-mono border border-slate-200 shadow-2xs font-bold">A</kbd>
                <span className="text-[11px]">Phát audio</span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: THE MAIN MVP SMARTCARD */}
        <div className="lg:col-span-8 space-y-4">
          
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl select-none cursor-pointer hover:shadow-2xl transition-all duration-300 relative flex flex-col justify-between min-h-[420px]"
          >
            
            {/* Top Star/Save button */}
            <div className="flex items-center justify-between">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSaved(!isSaved);
                  showToast(isSaved ? 'Đã bỏ lưu từ này' : '⭐ Đã lưu từ vào mục yêu thích');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  isSaved 
                    ? 'bg-amber-50 text-amber-700 border-amber-300' 
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>{isSaved ? 'Đã lưu' : '☆ Lưu'}</span>
              </button>

              <span className="text-[11px] font-medium text-slate-400">
                {isFlipped ? 'Chạm để che bớt nghĩa' : 'Chạm để xem đầy đủ'}
              </span>
            </div>

            {/* Card Content (EXACT MVP TOEIC TYPOGRAPHY & COLORS) */}
            <div className="my-auto py-4 text-center space-y-3.5">
              
              {/* Part of Speech & IPA */}
              <div className="space-y-0.5">
                <span className="text-sm font-extrabold text-[#DC2626]">
                  ({currentWord.partOfSpeech || 'v/n'})
                </span>
                {currentWord.pronunciation && (
                  <p className="text-xs font-mono text-slate-400 font-medium">
                    /{currentWord.pronunciation}/
                  </p>
                )}
              </div>

              {/* WORD: HUGE, BOLD, ROUNDED CRIMSON FONT (EXACT MATCH TO IMAGE 2 & 3) */}
              <div>
                <h2 className="text-4xl sm:text-6xl font-black font-mvp-word text-[#C52243] tracking-tight leading-none py-1">
                  {currentWord.word}
                </h2>
              </div>

              {/* VIETNAMESE MEANING: BOLD EMERALD GREEN (EXACT MATCH TO IMAGE 2 & 3) */}
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#059669] tracking-tight">
                  {currentWord.meaning}
                </h3>
              </div>

              {/* CONTEXT EXAMPLE PILL BOX */}
              {currentWord.example && (
                <div className="max-w-xl mx-auto p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 text-xs sm:text-sm text-slate-800 space-y-1 shadow-2xs text-center">
                  <p className="font-semibold text-slate-800 leading-relaxed text-sm sm:text-base">
                    {formattedExample}
                  </p>
                  {currentWord.exampleTranslation && (
                    <p className="text-slate-500 italic text-xs">
                      {currentWord.exampleTranslation}
                    </p>
                  )}
                </div>
              )}

              {/* Note / Collocation if present */}
              {currentWord.note && (
                <div className="inline-block text-xs text-amber-900 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                  💡 <strong>Ghi chú:</strong> {currentWord.note}
                </div>
              )}

            </div>

            {/* Bottom Card Prompt */}
            <div className="text-center text-[11px] text-slate-400 font-medium">
              Nhấn Space để lật thẻ • Bấm 1 để chọn Chưa nhớ • Bấm 2 để chọn Đã nhớ
            </div>

          </div>

          {/* 2 ACTION BUTTONS (EXACT DESIGN OF THE MVP TOEIC IMAGE 2 & 3) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            
            {/* 1. NÚT CHƯA NHỚ (Vivid Red #E5252A) */}
            <button
              onClick={handleUnremembered}
              className="flex flex-col items-center justify-center py-4 px-4 rounded-2xl bg-[#E5252A] hover:bg-[#D01F24] text-white shadow-md shadow-rose-600/20 transition-all active:scale-98 group cursor-pointer"
            >
              <span className="font-black text-base sm:text-lg tracking-wide">
                Chưa nhớ
              </span>
              <span className="text-[11px] font-medium text-rose-100 mt-0.5">
                Xem lại trong phiên
              </span>
            </button>

            {/* 2. NÚT ĐÃ NHỚ (Vivid Emerald Green #059669) */}
            <button
              onClick={handleRemembered}
              className="flex flex-col items-center justify-center py-4 px-4 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white shadow-md shadow-emerald-600/20 transition-all active:scale-98 group cursor-pointer"
            >
              <span className="font-black text-base sm:text-lg tracking-wide">
                Đã nhớ
              </span>
              <span className="text-[11px] font-medium text-emerald-100 mt-0.5">
                Hoàn tất • ôn sau 2 ngày
              </span>
            </button>

          </div>

        </div>

        {/* RIGHT COLUMN: Controls & Audio (Desktop) */}
        <div className="hidden lg:block lg:col-span-2 space-y-3">
          
          {/* Big Speaker Audio Box (Image 2 & 3) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs text-center space-y-3">
            <button
              onClick={() => speakEnglish(currentWord.word, 0.9)}
              className="w-16 h-16 rounded-2xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 flex items-center justify-center mx-auto transition-transform active:scale-95 group shadow-xs"
              title="Phát âm tiếng Anh chuẩn bản xứ (Phím A)"
            >
              <Volume2 className="w-8 h-8 group-hover:scale-110 transition-transform" />
            </button>

            <label className="flex items-center justify-center gap-1.5 text-xs text-slate-600 font-semibold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoPlayAudio}
                onChange={(e) => setAutoPlayAudio(e.target.checked)}
                className="w-3.5 h-3.5 accent-blue-600 rounded cursor-pointer"
              />
              <span>Tự động phát</span>
            </label>
          </div>

          {/* Quick Action Buttons */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs space-y-2">
            <button
              onClick={() => {
                if (window.confirm(`Bạn có muốn tạm ẩn từ "${currentWord.word}" khỏi lượt học này không?`)) {
                  handleRemembered();
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Bỏ qua từ này</span>
            </button>

            <button
              onClick={() => loadQueue(selectedSource)}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Khôi phục lượt học</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
