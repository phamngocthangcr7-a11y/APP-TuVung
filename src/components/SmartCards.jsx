import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Volume2, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Layers, 
  Sparkles, 
  Award, 
  ChevronLeft, 
  ChevronRight,
  BookOpen
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
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [rememberedCount, setRememberedCount] = useState(0);
  const [forgottenCount, setForgottenCount] = useState(0);
  const [toastMessage, setToastMessage] = useState('');

  // Sanitize and filter valid words
  const sanitizeWordList = (list) => {
    if (!Array.isArray(list)) return [];
    return list.filter(w => w && typeof w === 'object' && w.word && String(w.word).trim() !== '' && String(w.word).trim() !== '-');
  };

  // Load study queue based on source
  const loadQueue = useCallback((source) => {
    let list = [];

    if (Array.isArray(initialWords) && initialWords.length > 0 && source === 'custom_list') {
      list = [...initialWords];
    } else if (source === 'due') {
      list = allWords.filter(w => isDueForReview(w));
      if (list.length === 0) list = allWords.slice(0, 25);
    } else if (source === 'today') {
      const today = new Date().toISOString().split('T')[0];
      list = customWords.filter(w => w.addedDate === today);
      if (list.length === 0) list = customWords.slice(0, 25);
    } else if (source === 'all_custom') {
      list = [...customWords];
    } else if (typeof source === 'string' && source.startsWith('set_')) {
      const set = builtInSets.find(s => s.id === source);
      list = set ? [...set.words] : [];
    } else {
      list = [...allWords];
    }

    const cleanList = sanitizeWordList(list);

    // If completely empty, fall back to built-in sets
    if (cleanList.length === 0 && builtInSets[0]?.words) {
      cleanList.push(...sanitizeWordList(builtInSets[0].words));
    }

    // Shuffle queue
    const shuffled = cleanList.sort(() => 0.5 - Math.random());
    setActiveQueue(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
    setRememberedCount(0);
    setForgottenCount(0);
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

  // Auto speak on card change
  useEffect(() => {
    if (currentWord && currentWord.word && !isFlipped) {
      speakEnglish(currentWord.word, 0.9);
    }
  }, [currentWord, currentIndex]);

  // Flip card
  const handleFlip = useCallback(() => {
    sound.playFlip();
    setIsFlipped(prev => !prev);
  }, []);

  // Show quick toast notification
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 1600);
  };

  // 1. NÚT "CHƯA NHỚ" (Đưa từ xuống cuối hàng đợi để lát nữa lặp lại)
  const handleUnremembered = useCallback(() => {
    if (!currentWord) return;

    sound.playIncorrect();
    setForgottenCount(prev => prev + 1);
    showToast('🔁 Chưa nhớ: Từ này sẽ lặp lại ở cuối phiên học!');

    // Cập nhật SRS trạng thái cần học lại
    const nextSrs = calculateNextSrs(currentWord.srs, SRS_RATING.AGAIN);
    onUpdateWordSrs(currentWord.id, nextSrs);
    onRecordStudySession(1);

    // Đẩy từ này xuống cuối hàng đợi để lát nữa lặp lại
    setActiveQueue(prev => {
      const copy = [...prev];
      const item = copy.splice(currentIndex, 1)[0];
      copy.push(item);
      return copy;
    });

    setIsFlipped(false);
  }, [currentWord, currentIndex, onUpdateWordSrs, onRecordStudySession]);

  // 2. NÚT "ĐÃ NHỚ" (Ghi nhận đã thuộc, chuyển sang từ tiếp theo)
  const handleRemembered = useCallback(() => {
    if (!currentWord) return;

    sound.playCorrect();
    setRememberedCount(prev => prev + 1);
    showToast('✨ Đã nhớ! Tuyệt vời!');

    // Cập nhật SRS trạng thái ghi nhớ tốt
    const nextSrs = calculateNextSrs(currentWord.srs, SRS_RATING.GOOD);
    onUpdateWordSrs(currentWord.id, nextSrs);
    onRecordStudySession(1);

    if (currentIndex + 1 >= activeQueue.length) {
      sound.playVictory();
      setSessionCompleted(true);
    } else {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  }, [currentWord, currentIndex, activeQueue.length, onUpdateWordSrs, onRecordStudySession]);

  // Phím tắt bàn phím
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === '1' || e.code === 'ArrowLeft') {
        e.preventDefault();
        handleUnremembered();
      } else if (e.key === '2' || e.code === 'ArrowRight') {
        e.preventDefault();
        handleRemembered();
      } else if (e.key.toLowerCase() === 'r') {
        if (currentWord?.word) speakEnglish(currentWord.word, 0.9);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleUnremembered, handleRemembered, currentWord]);

  // Cloze hint mask
  const clozeExample = useMemo(() => {
    if (!currentWord || !currentWord.example || !currentWord.word) return '';
    try {
      const regex = new RegExp(String(currentWord.word).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      return currentWord.example.replace(regex, '[ ______ ]');
    } catch (e) {
      return currentWord.example;
    }
  }, [currentWord]);

  // Màn hình hoàn thành phiên học
  if (sessionCompleted || !currentWord) {
    return (
      <div className="max-w-lg mx-auto py-10 px-4 text-center">
        <div className="bg-[#FFFDF9] rounded-3xl p-8 border border-[#EBE5DA] shadow-md space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-[#2C2A29]">
              Hoàn thành phiên học SmartCards!
            </h2>
            <p className="text-xs sm:text-sm text-[#736E65]">
              Bạn đã ôn tập xong tất cả các từ trong bộ này.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-[#F7F4EB] p-4 rounded-2xl border border-[#E8E1D5]">
            <div>
              <div className="text-2xl font-black text-emerald-600">{rememberedCount}</div>
              <div className="text-xs text-[#736E65] font-semibold">Từ đã nhớ</div>
            </div>
            <div>
              <div className="text-2xl font-black text-amber-600">{forgottenCount}</div>
              <div className="text-xs text-[#736E65] font-semibold">Lần cần lặp lại</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => loadQueue(selectedSource)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#2B4C7E] hover:bg-[#1E365B] text-white shadow-sm transition-all"
            >
              Học lại bộ này
            </button>
            <button
              onClick={onBackToDashboard}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-[#EFECE4] hover:bg-[#E3DFD5] text-[#2C2A29] transition-colors"
            >
              Về Trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-16">
      
      {/* Top Source Selector & Progress Bar */}
      <div className="bg-[#FFFDF9] rounded-2xl p-3 sm:p-4 border border-[#EAE5DC] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Source Dropdown */}
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#2B4C7E]" />
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="text-xs sm:text-sm font-bold text-[#2C2A29] bg-[#F7F4EB] border border-[#E0D9CC] rounded-xl px-3 py-1.5 focus:outline-none"
          >
            <option value="all">📚 Tất cả từ vựng ({allWords.length})</option>
            <option value="today">📅 Từ nạp hôm nay</option>
            <option value="due">⏰ Từ cần ôn hôm nay (SRS)</option>
            <option value="all_custom">📝 Toàn bộ từ tự thêm ({customWords.length})</option>
            <optgroup label="Bộ từ TOEIC có sẵn">
              {builtInSets.map(s => (
                <option key={s.id} value={s.id}>{s.title} ({s.words?.length} từ)</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Counter & Progress */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs font-bold text-[#736E65]">
          <span>Thẻ {currentIndex + 1} / {activeQueue.length}</span>
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            ✓ Đã nhớ: {rememberedCount}
          </span>
          <button
            onClick={() => loadQueue(selectedSource)}
            title="Xáo trộn lại"
            className="p-1.5 rounded-lg text-[#8C867A] hover:text-[#2C2A29] hover:bg-[#F2EFE8] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="p-2.5 rounded-xl bg-amber-100/90 border border-amber-300 text-amber-900 text-xs font-bold text-center shadow-xs animate-fadeIn">
          {toastMessage}
        </div>
      )}

      {/* FLASHCARD */}
      <div 
        onClick={handleFlip}
        className={`min-h-[340px] sm:min-h-[380px] rounded-3xl p-6 sm:p-8 cursor-pointer shadow-md select-none border transition-all duration-300 flex flex-col justify-between ${
          isFlipped 
            ? 'bg-[#FFFDF7] border-blue-300 shadow-blue-500/5' 
            : 'bg-[#FFFDF9] border-[#E8E2D6] hover:border-[#2B4C7E]/40 hover:shadow-lg'
        }`}
      >
        
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#EAE5DC] text-[#4A453E] uppercase tracking-wider">
            {currentWord.partOfSpeech || 'TOEIC'}
          </span>

          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8C867A] bg-[#F7F4EB] px-3 py-1 rounded-full border border-[#EAE5DC]">
            {isFlipped ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {isFlipped ? 'Xem lại mặt trước' : 'Bấm để lật thẻ (Space)'}
          </span>
        </div>

        {/* Card Body */}
        <div className="my-auto py-4 text-center space-y-4">
          
          {/* MẶT TRƯỚC: TỪ TIẾNG ANH & PHÁT ÂM */}
          {!isFlipped ? (
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-5xl font-black text-[#1E293B] tracking-tight leading-tight">
                {currentWord.word}
              </h2>

              {/* Pronunciation & Audio */}
              <div className="flex items-center justify-center gap-2 pt-1">
                {currentWord.pronunciation && (
                  <span className="text-sm font-mono text-[#5A6E85] font-semibold bg-[#F1F5F9] px-3 py-1 rounded-lg">
                    /{currentWord.pronunciation}/
                  </span>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakEnglish(currentWord.word, 0.9);
                  }}
                  className="p-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
                  title="Phát âm tiếng Anh"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Cloze Hint */}
              {currentWord.example && (
                <div className="max-w-lg mx-auto p-3.5 rounded-2xl bg-[#F8F6F0] border border-[#EAE5DC] text-xs sm:text-sm text-[#4A453E] leading-relaxed italic">
                  "{clozeExample}"
                </div>
              )}
            </div>
          ) : (
            /* MẶT SAU: NGHĨA TIẾNG VIỆT & VÍ DỤ */
            <div className="space-y-4">
              
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B]">
                  {currentWord.word}
                </h3>
                {currentWord.pronunciation && (
                  <p className="text-xs font-mono text-[#5A6E85] mt-0.5">
                    /{currentWord.pronunciation}/
                  </p>
                )}
              </div>

              {/* Meaning Box */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#2B4C7E] text-white shadow-md">
                <p className="text-lg sm:text-xl font-bold">
                  {currentWord.meaning}
                </p>
              </div>

              {/* Full Example & Translation */}
              {currentWord.example && (
                <div className="max-w-lg mx-auto p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D6] text-xs sm:text-sm space-y-1 text-left">
                  <p className="font-semibold text-[#1E293B]">
                    💬 {currentWord.example}
                  </p>
                  {currentWord.exampleTranslation && (
                    <p className="text-[#64748B] italic">
                      👉 {currentWord.exampleTranslation}
                    </p>
                  )}
                </div>
              )}

              {/* Note / Collocation */}
              {currentWord.note && (
                <div className="inline-block text-xs text-amber-900 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                  💡 <strong>Lưu ý:</strong> {currentWord.note}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Card Footer prompt */}
        <div className="text-center text-xs text-[#8C867A] font-medium">
          {!isFlipped 
            ? 'Bấm vào thẻ hoặc phím Space để xem nghĩa tiếng Việt' 
            : 'Chọn "Chưa nhớ" hoặc "Đã nhớ" ở bên dưới'}
        </div>

      </div>

      {/* 2 NÚT TO RÕ DỄ BẤM: CHƯA NHỚ & ĐÃ NHỚ */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        
        {/* NÚT CHƯA NHỚ */}
        <button
          onClick={handleUnremembered}
          className="flex flex-col items-center justify-center py-4 px-4 rounded-2xl bg-[#FFF1F0] hover:bg-[#FFE4E2] border-2 border-[#FFA39E] text-[#CF1322] shadow-xs transition-all active:scale-98 group"
        >
          <div className="flex items-center gap-2 font-black text-base sm:text-lg">
            <XCircle className="w-5 h-5 text-[#CF1322] group-hover:rotate-45 transition-transform" />
            <span>Chưa nhớ</span>
          </div>
          <span className="text-[11px] font-semibold text-[#FF4D4F] mt-0.5">
            Lát nữa sẽ lặp lại (Phím 1)
          </span>
        </button>

        {/* NÚT ĐÃ NHỚ */}
        <button
          onClick={handleRemembered}
          className="flex flex-col items-center justify-center py-4 px-4 rounded-2xl bg-[#F6FFED] hover:bg-[#E8FFD5] border-2 border-[#B7EB8F] text-[#389E0D] shadow-xs transition-all active:scale-98 group"
        >
          <div className="flex items-center gap-2 font-black text-base sm:text-lg">
            <CheckCircle2 className="w-5 h-5 text-[#389E0D] group-hover:scale-110 transition-transform" />
            <span>Đã nhớ</span>
          </div>
          <span className="text-[11px] font-semibold text-[#52C41A] mt-0.5">
            Chuyển từ tiếp theo (Phím 2)
          </span>
        </button>

      </div>

      {/* Hotkeys Prompt */}
      <div className="text-center text-[11px] text-[#8C867A] pt-1">
        Phím tắt: <kbd className="px-1.5 py-0.5 rounded bg-[#EAE5DC] text-[#4A453E] font-mono">Space</kbd> lật thẻ • <kbd className="px-1.5 py-0.5 rounded bg-[#EAE5DC] text-[#4A453E] font-mono">1</kbd> Chưa nhớ • <kbd className="px-1.5 py-0.5 rounded bg-[#EAE5DC] text-[#4A453E] font-mono">2</kbd> Đã nhớ • <kbd className="px-1.5 py-0.5 rounded bg-[#EAE5DC] text-[#4A453E] font-mono">R</kbd> Nghe đọc
      </div>

    </div>
  );
}
