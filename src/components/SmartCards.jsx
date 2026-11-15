import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Volume2, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  Pause, 
  Sparkles, 
  Award, 
  Flame, 
  Shuffle, 
  HelpCircle,
  ArrowRight,
  Layers
} from 'lucide-react';
import { speakEnglish, sound } from '../utils/sound';
import { calculateNextSrs, getEstimatedIntervalText, SRS_RATING, isDueForReview } from '../utils/srs';

export default function SmartCards({
  allWords = [],
  customWords = [],
  builtInSets = [],
  onUpdateWordSrs,
  onRecordStudySession,
  initialWords = null,
  initialMode = 'due', // 'due', 'today', 'all', 'set_xxx'
  onBackToDashboard
}) {
  const [selectedSource, setSelectedSource] = useState(initialMode);
  const [activeQueue, setActiveQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showClozeHint, setShowClozeHint] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [stats, setStats] = useState({ remembered: 0, forgotten: 0, total: 0 });

  // Initialize Queue based on source
  const loadQueue = useCallback((source) => {
    let list = [];

    if (Array.isArray(initialWords) && initialWords.length > 0 && source === 'custom_list') {
      list = [...initialWords];
    } else if (source === 'due') {
      list = allWords.filter(w => isDueForReview(w));
      if (list.length === 0) list = allWords.slice(0, 20); // Fallback if none due
    } else if (source === 'today') {
      const today = new Date().toISOString().split('T')[0];
      list = customWords.filter(w => w.addedDate === today);
      if (list.length === 0) list = customWords.slice(0, 20);
    } else if (source === 'all_custom') {
      list = [...customWords];
    } else if (source.startsWith('set_')) {
      const set = builtInSets.find(s => s.id === source);
      list = set ? [...set.words] : [];
    } else {
      list = [...allWords];
    }

    // Shuffle queue
    const shuffled = [...list].sort(() => 0.5 - Math.random());
    setActiveQueue(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
    setStats({ remembered: 0, forgotten: 0, total: shuffled.length });
  }, [allWords, customWords, builtInSets, initialWords]);

  useEffect(() => {
    if (initialWords && initialWords.length > 0) {
      loadQueue('custom_list');
    } else {
      loadQueue(selectedSource);
    }
  }, [selectedSource, loadQueue, initialWords]);

  const currentWord = activeQueue[currentIndex];

  // Auto-play speaker when card changes
  useEffect(() => {
    if (currentWord && !isFlipped) {
      speakEnglish(currentWord.word, 0.9);
    }
  }, [currentWord, currentIndex]);

  // Handle Flip
  const handleFlip = useCallback(() => {
    sound.playFlip();
    setIsFlipped(prev => !prev);
  }, []);

  // Handle SRS Rating (1: Again, 2: Hard, 3: Good, 4: Easy)
  const handleRate = useCallback((rating) => {
    if (!currentWord) return;

    const nextSrs = calculateNextSrs(currentWord.srs, rating);
    onUpdateWordSrs(currentWord.id, nextSrs);
    onRecordStudySession(1);

    if (rating === SRS_RATING.AGAIN) {
      sound.playIncorrect();
      setStats(prev => ({ ...prev, forgotten: prev.forgotten + 1 }));
      // Re-insert card at end of queue so user encounters it again in this session
      setActiveQueue(prev => {
        const copy = [...prev];
        const item = copy.splice(currentIndex, 1)[0];
        copy.push(item);
        return copy;
      });
      setIsFlipped(false);
    } else {
      sound.playCorrect();
      setStats(prev => ({ ...prev, remembered: prev.remembered + 1 }));

      if (currentIndex + 1 >= activeQueue.length) {
        sound.playVictory();
        setSessionCompleted(true);
      } else {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false);
      }
    }
  }, [currentWord, currentIndex, activeQueue.length, onUpdateWordSrs, onRecordStudySession]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === '1' && isFlipped) {
        handleRate(SRS_RATING.AGAIN);
      } else if (e.key === '2' && isFlipped) {
        handleRate(SRS_RATING.HARD);
      } else if (e.key === '3' && isFlipped) {
        handleRate(SRS_RATING.GOOD);
      } else if (e.key === '4' && isFlipped) {
        handleRate(SRS_RATING.EASY);
      } else if (e.key.toLowerCase() === 'r') {
        if (currentWord) speakEnglish(currentWord.word, 0.9);
      } else if (e.key.toLowerCase() === 's') {
        if (currentWord) speakEnglish(currentWord.word, 0.7);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleRate, isFlipped, currentWord]);

  // Mask word in example for cloze test on front of card
  const clozeExample = useMemo(() => {
    if (!currentWord || !currentWord.example) return '';
    try {
      const regex = new RegExp(currentWord.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      return currentWord.example.replace(regex, '[ ______ ]');
    } catch (e) {
      return currentWord.example;
    }
  }, [currentWord]);

  // If completed
  if (sessionCompleted || activeQueue.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-lg space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
              Xuất sắc! Bạn đã hoàn thành phiên học!
            </h2>
            <p className="text-sm text-slate-500">
              Thuật toán Spaced Repetition đã ghi nhận tiến độ và lên lịch ôn tập tối ưu cho bạn.
            </p>
          </div>

          {/* Stats recap */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <div className="text-2xl font-black text-slate-800">{stats.total}</div>
              <div className="text-xs text-slate-500 font-medium">Tổng số thẻ</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-600">{stats.remembered}</div>
              <div className="text-xs text-emerald-600 font-medium">Đã ghi nhớ</div>
            </div>
            <div>
              <div className="text-2xl font-black text-amber-600">{stats.forgotten}</div>
              <div className="text-xs text-amber-600 font-medium">Lặp lại để thuộc</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => loadQueue(selectedSource)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition-all"
            >
              Ôn tiếp bộ này
            </button>
            <button
              onClick={onBackToDashboard}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Về Trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-8">
      
      {/* Top Controller Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Source Selector */}
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="text-xs sm:text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="due">⏰ Thẻ cần ôn hôm nay (SRS)</option>
            <option value="today">📅 Từ nạp hôm nay</option>
            <option value="all_custom">📝 Toàn bộ từ tự thêm</option>
            <option value="all">📚 Tất cả từ vựng trong kho</option>
            <optgroup label="Bộ từ TOEIC có sẵn">
              {builtInSets.map(s => (
                <option key={s.id} value={s.id}>{s.title} ({s.words?.length} từ)</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-slate-600">
            Thẻ {currentIndex + 1} / {activeQueue.length}
          </div>

          <div className="w-24 sm:w-32 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / activeQueue.length) * 100}%` }}
            ></div>
          </div>

          <button
            onClick={() => loadQueue(selectedSource)}
            title="Xáo trộn lại"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* SMART FLASHCARD CONTAINER */}
      <div className="perspective-1000">
        <div 
          onClick={handleFlip}
          className={`relative min-h-[380px] sm:min-h-[420px] rounded-3xl p-6 sm:p-10 cursor-pointer shadow-xl transition-all duration-500 select-none border flex flex-col justify-between ${
            isFlipped 
              ? 'bg-gradient-to-br from-white via-blue-50/40 to-slate-50 border-blue-200 shadow-blue-500/10' 
              : 'bg-gradient-to-br from-white to-slate-50 border-slate-200/90 hover:border-blue-300 hover:shadow-2xl'
          }`}
        >

          {/* Top Indicator & Badges */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-wider">
                {currentWord.partOfSpeech || 'Word'}
              </span>
              {currentWord.srs?.state && (
                <span className="text-[10px] font-medium text-slate-400 capitalize">
                  SRS: {currentWord.srs.state}
                </span>
              )}
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              {isFlipped ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {isFlipped ? 'Nhấn để xem mặt trước' : 'Bấm để lật thẻ (Space)'}
            </span>
          </div>

          {/* Card Body */}
          <div className="my-auto py-6 text-center space-y-4">
            
            {/* FRONT OF CARD */}
            {!isFlipped ? (
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  {currentWord.word}
                </h2>

                {/* Pronunciation & Audio Buttons */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakEnglish(currentWord.word, 0.9);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200/60 shadow-xs"
                  >
                    <Volume2 className="w-4 h-4 text-blue-600" />
                    <span>Phát âm (R)</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakEnglish(currentWord.word, 0.7);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <span>0.75x (S)</span>
                  </button>
                </div>

                {/* Cloze test hint */}
                {currentWord.example && (
                  <div className="max-w-xl mx-auto mt-4 p-4 rounded-2xl bg-slate-100/70 border border-slate-200/70 text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                    "{clozeExample}"
                  </div>
                )}
              </div>
            ) : (
              /* BACK OF CARD */
              <div className="space-y-5 text-center">
                
                {/* Word & IPA */}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {currentWord.word}
                  </h2>
                  {currentWord.pronunciation && (
                    <p className="text-sm font-mono text-blue-600 mt-1 font-semibold">
                      /{currentWord.pronunciation}/
                    </p>
                  )}
                </div>

                {/* Vietnamese Meaning (Prominent Box) */}
                <div className="max-w-md mx-auto p-4 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                  <p className="text-lg sm:text-xl font-bold tracking-wide">
                    {currentWord.meaning}
                  </p>
                </div>

                {/* Full Example with Highlight */}
                {currentWord.example && (
                  <div className="max-w-xl mx-auto p-4 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-1.5 text-left shadow-xs">
                    <p className="font-semibold text-slate-900 leading-relaxed">
                      💬 {currentWord.example}
                    </p>
                    {currentWord.exampleTranslation && (
                      <p className="text-slate-500 italic">
                        👉 {currentWord.exampleTranslation}
                      </p>
                    )}
                  </div>
                )}

                {/* Collocation / Note */}
                {currentWord.note && (
                  <div className="inline-block text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                    💡 <strong>Lưu ý TOEIC:</strong> {currentWord.note}
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Bottom Prompt when not flipped */}
          {!isFlipped && (
            <div className="text-center text-xs font-semibold text-slate-400">
              Nhấn thẻ hoặc bấm <kbd className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">Space</kbd> để kiểm tra đáp án
            </div>
          )}

          {/* Bottom Flip status indicator */}
          {isFlipped && (
            <div className="text-center text-xs text-slate-400">
              Đánh giá mức độ nhớ của bạn bên dưới
            </div>
          )}

        </div>
      </div>

      {/* 4 SPACED REPETITION (SM-2) RATING BUTTONS */}
      {isFlipped ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          
          {/* 1. AGAIN (< 10 mins) */}
          <button
            onClick={() => handleRate(SRS_RATING.AGAIN)}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 transition-all active:scale-95 group shadow-xs"
          >
            <div className="flex items-center gap-1.5 font-black text-sm sm:text-base">
              <span>Quên (1)</span>
            </div>
            <span className="text-[11px] font-semibold text-rose-500 mt-0.5">
              {getEstimatedIntervalText(currentWord.srs, SRS_RATING.AGAIN)}
            </span>
          </button>

          {/* 2. HARD (1-2 days) */}
          <button
            onClick={() => handleRate(SRS_RATING.HARD)}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 transition-all active:scale-95 group shadow-xs"
          >
            <div className="flex items-center gap-1.5 font-black text-sm sm:text-base">
              <span>Khó (2)</span>
            </div>
            <span className="text-[11px] font-semibold text-amber-500 mt-0.5">
              {getEstimatedIntervalText(currentWord.srs, SRS_RATING.HARD)}
            </span>
          </button>

          {/* 3. GOOD (3-6 days) */}
          <button
            onClick={() => handleRate(SRS_RATING.GOOD)}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 transition-all active:scale-95 group shadow-xs"
          >
            <div className="flex items-center gap-1.5 font-black text-sm sm:text-base">
              <span>Nhớ tốt (3)</span>
            </div>
            <span className="text-[11px] font-semibold text-blue-500 mt-0.5">
              {getEstimatedIntervalText(currentWord.srs, SRS_RATING.GOOD)}
            </span>
          </button>

          {/* 4. EASY (7+ days) */}
          <button
            onClick={() => handleRate(SRS_RATING.EASY)}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 transition-all active:scale-95 group shadow-xs"
          >
            <div className="flex items-center gap-1.5 font-black text-sm sm:text-base">
              <span>Rất dễ (4)</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-500 mt-0.5">
              {getEstimatedIntervalText(currentWord.srs, SRS_RATING.EASY)}
            </span>
          </button>

        </div>
      ) : (
        <div className="flex items-center justify-center">
          <button
            onClick={handleFlip}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25 transition-all transform active:scale-98"
          >
            Xem đáp án & Đánh giá (Space)
          </button>
        </div>
      )}

      {/* Helpful Shortcuts Bar */}
      <div className="hidden sm:flex items-center justify-center gap-4 text-[11px] text-slate-400 font-mono">
        <span>Space: Lật thẻ</span>
        <span>•</span>
        <span>Phím 1-4: Đánh giá SRS</span>
        <span>•</span>
        <span>R: Nghe đọc</span>
        <span>•</span>
        <span>S: Đọc chậm</span>
      </div>

    </div>
  );
}
