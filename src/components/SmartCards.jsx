import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Volume2, 
  RotateCcw, 
  Trash2, 
  Star, 
  Layers, 
  Award,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Flame,
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Gamepad2,
  Check,
  Zap,
  Bookmark
} from 'lucide-react';
import { speakEnglish, sound, unlockMobileAudio } from '../utils/sound';
import { calculateNextSrs, SRS_RATING, isDueForReview, getTodayDateString } from '../utils/srs';
import { TOEIC_CORE_DECKS } from '../data/defaultVocab';

export default function SmartCards({
  allWords = [],
  customWords = [],
  builtInSets = [],
  onUpdateWordSrs,
  onRecordStudySession,
  initialWords = null,
  initialMode = 'decks',
  onBackToDashboard,
  onOpenAddModal,
  favoriteIds = [],
  onToggleFavorite,
  streakInfo = {},
  onStartQuiz
}) {
  // Navigation View Modes: 'decks' (Dashboard Image 2), 'study' (Review Mode Image 3/4), 'recall_check' (Active Typing), 'summary' (Victory)
  const [viewMode, setViewMode] = useState(() => {
    if (initialWords && initialWords.length > 0) return 'study';
    if (initialMode && initialMode !== 'decks' && initialMode !== 'all') return 'study';
    return 'decks';
  });

  const [activeDeck, setActiveDeck] = useState(null);
  const [sessionSize, setSessionSize] = useState(30); // Khuyên dùng 30 từ như yêu cầu người dùng
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [selectedDeckForSession, setSelectedDeckForSession] = useState(null);

  // Review Queue State (Phase 1)
  const [activeQueue, setActiveQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [rememberedCount, setRememberedCount] = useState(0);
  const [forgottenCount, setForgottenCount] = useState(0);
  const [sessionTargetWords, setSessionTargetWords] = useState([]); // Danh sách gốc N từ của phiên học

  // Active Recall State (Phase 2 - Luyện gõ củng cố sau khi học)
  const [recallQueue, setRecallQueue] = useState([]);
  const [recallIndex, setRecallIndex] = useState(0);
  const [recallInput, setRecallInput] = useState('');
  const [recallFeedback, setRecallFeedback] = useState(null); // 'correct', 'incorrect', 'revealed'
  const [revealedHint, setRevealedHint] = useState(false);
  const recallInputRef = useRef(null);

  // Filter mode for Saved / Hard cards
  const [toastMessage, setToastMessage] = useState('');

  // Mobile Touch Swipe Handling
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);

  const todayStr = getTodayDateString();

  // Sanitize and filter valid words
  const sanitize = useCallback((list) => {
    if (!Array.isArray(list)) return [];
    return list.filter(w => w && typeof w === 'object' && w.word && String(w.word).trim() !== '' && String(w.word).trim() !== '-');
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 1800);
  };

  // Helper: Filter words by deck
  const getWordsForDeck = useCallback((deckId) => {
    const cleanAll = sanitize(allWords);
    if (deckId === 'deck_basic') {
      return cleanAll.filter(w => ['builtin_101', 'builtin_102', 'builtin_103', 'builtin_104', 'builtin_105', 'builtin_106', 'builtin_107', 'builtin_108', 'builtin_109', 'builtin_110', 'builtin_111', 'builtin_112', 'builtin_113', 'builtin_201', 'builtin_202', 'builtin_203', 'builtin_204', 'builtin_205', 'builtin_206', 'builtin_207', 'builtin_208', 'builtin_209', 'builtin_210', 'builtin_211', 'builtin_212', 'builtin_213', 'builtin_214', 'builtin_215', 'builtin_216', 'builtin_217', 'builtin_218', 'builtin_219', 'builtin_220', 'builtin_301', 'builtin_302', 'builtin_303', 'builtin_304', 'builtin_305', 'builtin_306', 'builtin_307', 'builtin_308', 'builtin_309', 'builtin_310', 'builtin_311', 'builtin_312', 'builtin_313', 'builtin_314', 'builtin_315', 'builtin_316', 'builtin_317'].includes(w.id));
    }
    if (deckId === 'deck_intermediate') {
      return cleanAll.filter(w => String(w.id).startsWith('builtin_4'));
    }
    if (deckId === 'deck_advanced') {
      return cleanAll.filter(w => String(w.id).startsWith('builtin_7'));
    }
    if (deckId === 'deck_phrases') {
      return cleanAll.filter(w => String(w.id).startsWith('builtin_5') || String(w.id).startsWith('builtin_6'));
    }
    if (deckId === 'deck_custom') {
      return sanitize(customWords);
    }
    return cleanAll;
  }, [allWords, customWords, sanitize]);

  // Real Deck Stats Calculation
  const deckStats = useMemo(() => {
    const stats = {};
    const decksList = [...TOEIC_CORE_DECKS, { id: 'deck_custom', title: 'Sổ Tay Của Tôi', subtitle: 'Từ vựng bạn tự nạp hàng ngày.', code: 'USR' }];

    decksList.forEach(deck => {
      const words = getWordsForDeck(deck.id);
      let newCount = 0;
      let learningCount = 0;
      let masteredCount = 0;
      let dueCount = 0;

      words.forEach(w => {
        const srs = w.srs || {};
        const state = srs.state || 'new';
        const reps = srs.repetitions || 0;
        const interval = srs.interval || 0;

        if (reps === 0 || state === 'new') {
          newCount++;
        } else if (state === 'mastered' || interval >= 3) {
          masteredCount++;
        } else {
          learningCount++;
        }

        if (isDueForReview(w, todayStr)) {
          dueCount++;
        }
      });

      const total = words.length;
      const progressPercent = total > 0 ? Math.round((masteredCount / total) * 100) : 0;

      stats[deck.id] = {
        total,
        newCount,
        learningCount,
        masteredCount,
        dueCount: dueCount > 0 ? dueCount : newCount,
        progressPercent
      };
    });

    return stats;
  }, [getWordsForDeck, todayStr]);

  // Overall Global Stats for Top Bar (Image 2)
  const overallStats = useMemo(() => {
    const cleanAll = sanitize(allWords);
    let totalMastered = 0;
    let hardCards = [];

    cleanAll.forEach(w => {
      const srs = w.srs || {};
      if (srs.state === 'mastered' || (srs.interval && srs.interval >= 3)) {
        totalMastered++;
      }
      if (w.mistakeCount > 0 || (srs.easeFactor && srs.easeFactor < 2.2)) {
        hardCards.push(w);
      }
    });

    return {
      totalMastered,
      currentStreak: streakInfo.currentStreak || 1,
      longestStreak: streakInfo.longestStreak || 1,
      savedCount: (favoriteIds || []).length,
      hardCount: hardCards.length,
      hardCards
    };
  }, [allWords, sanitize, streakInfo, favoriteIds]);

  // Start study session for a deck
  const startSession = (deck, targetCount = 30) => {
    unlockMobileAudio();
    let words = [];

    if (deck === 'saved') {
      words = sanitize(allWords).filter(w => (favoriteIds || []).includes(w.id));
      setActiveDeck({ id: 'saved', title: 'Từ Vựng Đã Lưu (⭐)', code: 'SAVED' });
    } else if (deck === 'hard') {
      words = overallStats.hardCards;
      if (words.length === 0) words = sanitize(allWords).slice(0, targetCount);
      setActiveDeck({ id: 'hard', title: 'Top Thẻ Khó & Cần Ôn', code: 'HARD' });
    } else {
      words = getWordsForDeck(deck.id);
      setActiveDeck(deck);
    }

    if (words.length === 0) {
      words = sanitize(allWords).slice(0, targetCount);
    }

    // Prioritize cards due for review, then new cards
    const dueList = words.filter(w => isDueForReview(w, todayStr));
    const notDueList = words.filter(w => !isDueForReview(w, todayStr));
    const sorted = [...dueList, ...notDueList];

    // Pick targetCount words and shuffle
    const selected = sorted.slice(0, targetCount).sort(() => 0.5 - Math.random());

    setSessionTargetWords(selected);
    setActiveQueue([...selected]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setRememberedCount(0);
    setForgottenCount(0);
    setViewMode('study');
    setIsSizeModalOpen(false);
  };

  // Open session size selection modal
  const handleOpenDeck = (deck) => {
    unlockMobileAudio();
    setSelectedDeckForSession(deck);
    setIsSizeModalOpen(true);
  };

  const currentWord = activeQueue[currentIndex];

  // Auto-speak English when card loads if enabled
  useEffect(() => {
    if (viewMode === 'study' && currentWord && currentWord.word && autoPlayAudio) {
      speakEnglish(currentWord.word, 0.95);
    }
  }, [currentWord, currentIndex, autoPlayAudio, viewMode]);

  // 1. NÚT CHƯA NHỚ (Lặp lại ở cuối phiên)
  const handleUnremembered = useCallback(() => {
    if (!currentWord) return;
    unlockMobileAudio();
    sound.playIncorrect();
    setForgottenCount(prev => prev + 1);
    showToast('🔁 Chưa nhớ: Từ này sẽ lặp lại ở cuối phiên học!');

    const nextSrs = calculateNextSrs(currentWord.srs, SRS_RATING.AGAIN);
    if (onUpdateWordSrs) onUpdateWordSrs(currentWord.id, nextSrs);

    // Xếp từ xuống cuối hàng đợi để người dùng buộc phải nhớ
    setActiveQueue(prev => {
      const copy = [...prev];
      const item = copy.splice(currentIndex, 1)[0];
      copy.push(item);
      return copy;
    });

    setIsFlipped(false);
  }, [currentWord, currentIndex, onUpdateWordSrs]);

  // 2. NÚT ĐÃ NHỚ (Chuyển sang từ tiếp theo)
  const handleRemembered = useCallback(() => {
    if (!currentWord) return;
    unlockMobileAudio();
    sound.playCorrect();
    setRememberedCount(prev => prev + 1);
    showToast('✨ Đã nhớ! Xuất sắc!');

    const nextSrs = calculateNextSrs(currentWord.srs, SRS_RATING.GOOD);
    if (onUpdateWordSrs) onUpdateWordSrs(currentWord.id, nextSrs);

    // Kiểm tra xem đã hoàn thành hết các thẻ trong activeQueue chưa
    if (currentIndex + 1 >= activeQueue.length) {
      // CHUYỂN SANG VÒNG 2: ACTIVE RECALL (VIẾT LẠI TỪ VỰNG VỪA HỌC)
      sound.playFlip();
      const recallList = sessionTargetWords.length > 0 ? [...sessionTargetWords] : activeQueue;
      setRecallQueue(recallList.sort(() => 0.5 - Math.random()));
      setRecallIndex(0);
      setRecallInput('');
      setRecallFeedback(null);
      setRevealedHint(false);
      setViewMode('recall_check');
    } else {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  }, [currentWord, currentIndex, activeQueue, sessionTargetWords, onUpdateWordSrs]);

  // Lật thẻ
  const handleFlipToggle = () => {
    unlockMobileAudio();
    sound.playFlip();
    setIsFlipped(prev => !prev);
  };

  // Keyboard Shortcuts (Image 2 & 3: 1 Chưa nhớ, 2 Đã nhớ, Space Lật, A Phát âm)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (viewMode === 'study') {
        if (e.key === '1') {
          e.preventDefault();
          handleUnremembered();
        } else if (e.key === '2') {
          e.preventDefault();
          handleRemembered();
        } else if (e.key.toLowerCase() === 'a' || e.key.toLowerCase() === 'r') {
          e.preventDefault();
          if (currentWord?.word) speakEnglish(currentWord.word, 0.95);
        } else if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          handleFlipToggle();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUnremembered, handleRemembered, currentWord, viewMode]);

  // Touch Swipe on Mobile
  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      setTouchStartX(e.touches[0].clientX);
      setTouchStartY(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null || touchStartY === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX;
    const diffY = e.changedTouches[0].clientY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX < 0) {
        handleUnremembered(); // Swiped Left -> Chưa nhớ
      } else {
        handleRemembered();   // Swiped Right -> Đã nhớ
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Responsive font size for word so it never overflows
  const wordFontSize = useMemo(() => {
    if (!currentWord || !currentWord.word) return 'text-2xl sm:text-4xl';
    const len = currentWord.word.length;
    if (len > 24) return 'text-lg sm:text-2xl';
    if (len > 15) return 'text-xl sm:text-3xl';
    return 'text-2xl sm:text-4xl lg:text-5xl';
  }, [currentWord]);

  // Formatted example with bold word
  const formattedExample = useMemo(() => {
    if (!currentWord || !currentWord.example || !currentWord.word) return '';
    try {
      const parts = currentWord.example.split(new RegExp(`(${currentWord.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
      return parts.map((part, i) => 
        part.toLowerCase() === currentWord.word.toLowerCase() 
          ? <strong key={i} className="font-extrabold text-[#0B132B]">{part}</strong> 
          : part
      );
    } catch (e) {
      return currentWord.example;
    }
  }, [currentWord]);

  // Cloze hint for front card
  const clozeHintExample = useMemo(() => {
    if (!currentWord || !currentWord.example || !currentWord.word) return '';
    try {
      const reg = new RegExp(String(currentWord.word).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      return currentWord.example.replace(reg, '[ ______ ]');
    } catch (e) {
      return currentWord.example;
    }
  }, [currentWord]);

  // =========================================================================
  // LOGIC VÒNG 2: ACTIVE RECALL (VIẾT LẠI TỪ VỰNG VỪA HỌC)
  // =========================================================================
  const currentRecallWord = recallQueue[recallIndex];

  // Helper: Normalize answer for forgiving comparison
  const isMatchAnswer = (userInput, targetWord) => {
    if (!userInput || !targetWord) return false;
    const cleanUser = userInput.toLowerCase().trim().replace(/['"`]/g, '');
    const cleanTarget = targetWord.toLowerCase().trim().replace(/['"`]/g, '');

    if (cleanUser === cleanTarget) return true;

    // Cho phép bỏ qua tiền tố "to " hoặc "be "
    const noPrefixTarget = cleanTarget.replace(/^(to|be)\s+/i, '');
    if (cleanUser === noPrefixTarget) return true;

    // Cho phép bỏ qua dấu câu
    if (cleanUser.replace(/[^a-z0-9]/gi, '') === cleanTarget.replace(/[^a-z0-9]/gi, '')) return true;

    return false;
  };

  const handleCheckRecall = (e) => {
    if (e) e.preventDefault();
    if (!currentRecallWord) return;

    unlockMobileAudio();

    if (isMatchAnswer(recallInput, currentRecallWord.word)) {
      // Đúng!
      sound.playCorrect();
      setRecallFeedback('correct');

      setTimeout(() => {
        if (recallIndex + 1 >= recallQueue.length) {
          // HOÀN THÀNH TOÀN BỘ PHIÊN HỌC CẢ 2 VÒNG!
          // GHI NHẬN TIẾN ĐỘ THẬT VÀO LOCALSTORAGE
          if (onRecordStudySession) {
            onRecordStudySession(sessionTargetWords.length || 1);
          }
          // Cập nhật SRS trạng thái mastered cho toàn bộ từ trong phiên
          (sessionTargetWords || []).forEach(w => {
            const nextSrs = calculateNextSrs(w.srs, SRS_RATING.GOOD);
            if (onUpdateWordSrs) onUpdateWordSrs(w.id, nextSrs);
          });

          sound.playVictory();
          setViewMode('summary');
        } else {
          setRecallIndex(prev => prev + 1);
          setRecallInput('');
          setRecallFeedback(null);
          setRevealedHint(false);
          if (recallInputRef.current) recallInputRef.current.focus();
        }
      }, 700);
    } else {
      sound.playIncorrect();
      setRecallFeedback('incorrect');
    }
  };

  const handleShowHint = () => {
    setRevealedHint(true);
    if (!currentRecallWord) return;
    const w = currentRecallWord.word;
    const hint = w.length > 3 ? `${w.substring(0, 2)}...` : `${w[0]}...`;
    showToast(`💡 Gợi ý chữ cái bắt đầu: "${hint}"`);
  };

  const handleRevealAnswer = () => {
    if (!currentRecallWord) return;
    setRecallInput(currentRecallWord.word);
    setRecallFeedback('revealed');
  };

  // =========================================================================
  // VIEW 1: DECKS OVERVIEW (Dashboard chuẩn The MVP TOEIC - Image 2)
  // =========================================================================
  if (viewMode === 'decks') {
    return (
      <div className="max-w-5xl mx-auto space-y-5 pb-24 sm:pb-16 px-3 sm:px-4">
        
        {/* TOP STATS BAR (Image 2) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Chuỗi học */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-bold">
              <Flame className="w-4 h-4 text-emerald-600 fill-emerald-500" />
              <span>Chuỗi học: {overallStats.currentStreak} ngày</span>
            </div>

            {/* Kỷ lục */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs sm:text-sm font-bold">
              <Trophy className="w-4 h-4 text-blue-600" />
              <span>Kỷ lục: {overallStats.longestStreak} ngày</span>
            </div>

            {/* Từ đã học */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300 text-xs sm:text-sm font-bold">
              <BookOpen className="w-4 h-4 text-slate-600" />
              <span>{overallStats.totalMastered} từ đã học</span>
            </div>
          </div>

          {/* Right Action Filters */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => startSession('saved', 30)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 hover:border-amber-400 bg-white hover:bg-amber-50 text-xs font-bold text-slate-700 transition-all shadow-2xs cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Đã lưu ({overallStats.savedCount})</span>
            </button>

            <button
              onClick={() => startSession('hard', 30)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 hover:border-rose-400 bg-white hover:bg-rose-50 text-xs font-bold text-slate-700 transition-all shadow-2xs cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>Top thẻ khó ({overallStats.hardCount})</span>
            </button>
          </div>

        </div>

        {/* SECTION TITLE */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0B132B] tracking-tight">
              Các Bộ Từ Vựng TOEIC Trọng Tâm
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Chọn một bộ thẻ để bắt đầu phiên học SmartCards & kiểm tra gõ từ củng cố
            </p>
          </div>
        </div>

        {/* 4 CORE TOEIC DECKS GRID (Image 2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {TOEIC_CORE_DECKS.map((deck) => {
            const stats = deckStats[deck.id] || { total: 0, newCount: 0, learningCount: 0, masteredCount: 0, dueCount: 0, progressPercent: 0 };

            return (
              <div 
                key={deck.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between space-y-4 group"
              >
                {/* Card Header: Badge & Status */}
                <div className="flex items-center justify-between">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${deck.badgeColor} shadow-xs`}>
                    {deck.code}
                  </span>

                  {stats.dueCount > 0 ? (
                    <span className="text-xs font-extrabold text-[#C52243] bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                      {stats.dueCount} cần ôn
                    </span>
                  ) : (
                    <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      PRO
                    </span>
                  )}
                </div>

                {/* Card Title & Subtitle */}
                <div>
                  <h3 className="text-xl font-black text-[#0B132B] group-hover:text-blue-600 transition-colors">
                    {deck.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px] line-clamp-2">
                    {deck.subtitle}
                  </p>
                </div>

                {/* Stats List */}
                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">Thẻ mới</span>
                    <span className="font-bold text-slate-800">{stats.newCount}</span>
                  </div>

                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">Đang học</span>
                    <span className="font-bold text-amber-600">{stats.learningCount}</span>
                  </div>

                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">Đã học</span>
                    <span className="font-bold text-emerald-600">{stats.masteredCount} / {stats.total}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(stats.progressPercent, 4)}%` }}
                    />
                  </div>
                </div>

                {/* Big Action Button "Học ngay" */}
                <button
                  onClick={() => handleOpenDeck(deck)}
                  className="w-full py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm text-white bg-[#2563EB] hover:bg-[#1D4ED8] shadow-md shadow-blue-600/20 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Học ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}

        </div>

        {/* 5th CARD: SỔ TAY TỪ VỰNG CÁ NHÂN (Nếu có từ tự thêm) */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-3xl p-5 border border-indigo-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-indigo-600 text-white font-black text-xs">
                USR
              </span>
              <h3 className="font-black text-base sm:text-lg text-[#0B132B]">
                Sổ Tay Từ Vựng Hàng Ngày ({customWords.length} từ)
              </h3>
            </div>
            <p className="text-xs text-slate-600 max-w-xl">
              Tất cả các từ mới bạn tự thêm mỗi ngày hoặc nhập từ file Excel. Học ngay bằng thuật toán ngắt quãng SRS!
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleOpenDeck({ id: 'deck_custom', title: 'Sổ Tay Từ Vựng Của Tôi', code: 'USR' })}
              className="flex-1 sm:flex-none py-2.5 px-5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all text-center cursor-pointer"
            >
              Ôn luyện ({customWords.length} từ)
            </button>
            <button
              onClick={onOpenAddModal}
              className="py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 transition-all cursor-pointer"
            >
              + Thêm từ mới
            </button>
          </div>
        </div>

        {/* MODAL CHỌN SỐ LƯỢNG TỪ CHO PHIÊN HỌC */}
        {isSizeModalOpen && selectedDeckForSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  Mục tiêu phiên học
                </span>
                <h3 className="text-xl font-black text-[#0B132B]">
                  {selectedDeckForSession.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Chọn số lượng từ bạn muốn học và viết lại hôm nay:
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-1">
                {[10, 20, 30].map(size => (
                  <button
                    key={size}
                    onClick={() => {
                      setSessionSize(size);
                      startSession(selectedDeckForSession, size);
                    }}
                    className={`py-3 px-4 rounded-2xl border text-left font-bold text-xs sm:text-sm flex items-center justify-between transition-all cursor-pointer ${
                      sessionSize === size 
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs' 
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div>Học {size} từ {size === 30 && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full ml-1 font-bold">Khuyên dùng TOEIC</span>}</div>
                      <div className="text-[11px] font-normal text-slate-500">~{size / 2} phút • Gồm 2 vòng (Lật thẻ & Gõ lại)</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                  </button>
                ))}

                <button
                  onClick={() => {
                    setSessionSize(50);
                    startSession(selectedDeckForSession, 50);
                  }}
                  className="py-2.5 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-between cursor-pointer"
                >
                  <span>Tất cả thẻ cần ôn trong bộ này</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <button
                onClick={() => setIsSizeModalOpen(false)}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        )}

      </div>
    );
  }

  // =========================================================================
  // VIEW 3: ACTIVE RECALL (VÒNG 2 - GÕ LẠI TỪ VỰNG ĐỂ KHẮC SÂU TRÍ NHỚ)
  // =========================================================================
  if (viewMode === 'recall_check') {
    const totalRecall = recallQueue.length;
    const progressPercent = totalRecall > 0 ? Math.round(((recallIndex + 1) / totalRecall) * 100) : 0;

    return (
      <div className="max-w-2xl mx-auto space-y-4 pb-28 sm:pb-16 px-3 sm:px-4">
        
        {/* Top Header */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-xs flex items-center justify-between">
          <button
            onClick={() => setViewMode('decks')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Thoát ra Decks</span>
          </button>

          <div className="text-center">
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Vòng 2: Gõ lại {totalRecall} từ vừa học
            </span>
          </div>

          <div className="text-xs font-bold text-slate-600">
            Câu {recallIndex + 1} / {totalRecall}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Active Recall Card */}
        {currentRecallWord && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-5 text-center">
            
            {/* Word Part of Speech */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                ({currentRecallWord.partOfSpeech || 'v/n'})
              </span>
              <button
                onClick={() => {
                  unlockMobileAudio();
                  speakEnglish(currentRecallWord.word, 0.95);
                }}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                title="Nghe phát âm gợi ý"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Target Meaning in Bold Emerald */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400">Nghĩa tiếng Việt cần viết lại:</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#059669] tracking-tight">
                "{currentRecallWord.meaning}"
              </h2>
            </div>

            {/* Context sentence with cloze */}
            {currentRecallWord.example && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-700 italic max-w-lg mx-auto">
                "{currentRecallWord.example.replace(new RegExp(currentRecallWord.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '[ ______ ]')}"
              </div>
            )}

            {/* Typing Form */}
            <form onSubmit={handleCheckRecall} className="max-w-md mx-auto space-y-3 pt-2">
              <div className="relative">
                <input
                  ref={recallInputRef}
                  type="text"
                  autoFocus
                  value={recallInput}
                  onChange={(e) => {
                    setRecallInput(e.target.value);
                    if (recallFeedback === 'incorrect') setRecallFeedback(null);
                  }}
                  placeholder="Nhập từ tiếng Anh tương ứng..."
                  className={`w-full py-3.5 px-4 rounded-2xl border-2 text-center text-base sm:text-lg font-bold tracking-wide focus:outline-none transition-all shadow-inner ${
                    recallFeedback === 'correct' 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-4 ring-emerald-200' 
                      : recallFeedback === 'incorrect' 
                      ? 'border-rose-500 bg-rose-50 text-rose-900 ring-4 ring-rose-200 animate-shake' 
                      : 'border-slate-300 focus:border-blue-600 bg-white text-slate-900'
                  }`}
                />
              </div>

              {/* Feedback Alert */}
              {recallFeedback === 'correct' && (
                <div className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Chính xác! Chuẩn bị chuyển sang từ tiếp theo...</span>
                </div>
              )}

              {recallFeedback === 'incorrect' && (
                <div className="text-xs font-bold text-rose-700 flex items-center justify-center gap-1 animate-fadeIn">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Chưa đúng, hãy thử lại hoặc bấm "Gợi ý"!</span>
                </div>
              )}

              {recallFeedback === 'revealed' && (
                <div className="text-xs font-bold text-blue-700 animate-fadeIn">
                  👉 Hãy nhìn đáp án trên và bấm Enter để tiếp tục!
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleShowHint}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  💡 Gợi ý chữ cái
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-[#059669] hover:bg-[#047857] shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Kiểm tra (Enter)
                </button>

                <button
                  type="button"
                  onClick={handleRevealAnswer}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  👀 Xem đáp án
                </button>
              </div>

            </form>

          </div>
        )}

      </div>
    );
  }

  // =========================================================================
  // VIEW 4: SUMMARY & CELEBRATION (Hoàn thành trọn vẹn cả 2 vòng)
  // =========================================================================
  if (viewMode === 'summary') {
    const count = sessionTargetWords.length || 30;

    return (
      <div className="max-w-lg mx-auto py-8 px-4 text-center pb-28 sm:pb-16 space-y-5">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md space-y-6">
          
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-9 h-9" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B132B]">
              Xuất sắc! Đã làm chủ {count} từ!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Bạn đã hoàn thành cả 2 vòng: <strong>Nhận biết flashcards</strong> và <strong>Viết lại chính xác từ vựng</strong>. Tiến độ đã được lưu vào hệ thống!
            </p>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
              <div className="text-lg font-black text-emerald-700">+{count}</div>
              <div className="text-[11px] font-bold text-emerald-600">Từ đã ghi nhớ hôm nay</div>
            </div>

            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-center">
              <div className="text-lg font-black text-blue-700">{overallStats.currentStreak} ngày</div>
              <div className="text-[11px] font-bold text-blue-600">Chuỗi học liên tục</div>
            </div>
          </div>

          {/* Word list summary preview */}
          <div className="text-left space-y-2 border-t border-slate-100 pt-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Các từ vừa hoàn thành:
            </h4>
            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              {sessionTargetWords.map((w, idx) => (
                <div key={w.id || idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="font-bold text-[#C52243]">{w.word}</div>
                  <div className="text-slate-600 italic truncate max-w-[180px]">{w.meaning}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={() => setViewMode('decks')}
              className="flex-1 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm text-white bg-[#2563EB] hover:bg-[#1D4ED8] shadow-md transition-all cursor-pointer"
            >
              Học tiếp bộ khác
            </button>

            {onStartQuiz && (
              <button
                onClick={() => onStartQuiz(sessionTargetWords)}
                className="flex-1 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Làm trắc nghiệm Quiz
              </button>
            )}
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: FLASHCARD REVIEW MODE (VÒNG 1 - The MVP TOEIC Card Layout)
  // =========================================================================
  if (!currentWord || activeQueue.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
        <Layers className="w-8 h-8 text-blue-600 mx-auto" />
        <h3 className="font-bold text-sm text-[#0B132B]">Đang chuẩn bị thẻ học...</h3>
        <p className="text-xs text-slate-500">Vui lòng chờ trong giây lát hoặc quay lại danh sách bộ.</p>
        <button
          onClick={() => setViewMode('decks')}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 cursor-pointer"
        >
          Về danh sách bộ
        </button>
      </div>
    );
  }

  const isFavorited = (favoriteIds || []).includes(currentWord.id);

  return (
    <div className="max-w-4xl mx-auto space-y-3 pb-24 sm:pb-16 px-2 sm:px-4">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0B132B]/95 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-md animate-fadeIn border border-slate-700">
          {toastMessage}
        </div>
      )}

      {/* TOP HEADER (Image 4) */}
      <div className="bg-white rounded-2xl p-2.5 sm:p-3.5 border border-slate-200/90 shadow-xs flex items-center justify-between gap-2">
        
        {/* Nút Quay Lại */}
        <button
          onClick={() => setViewMode('decks')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>

        {/* Tiêu đề & Tiến độ */}
        <div className="text-center">
          <div className="text-xs sm:text-sm font-black text-[#0B132B]">
            {activeDeck?.title || 'TOEIC SmartCards'} • Review Mode
          </div>
          <div className="text-[11px] font-semibold text-slate-500">
            Thẻ {currentIndex + 1} / {activeQueue.length}
          </div>
        </div>

        {/* Nút Khôi Phục */}
        <button
          onClick={() => {
            if (activeDeck) startSession(activeDeck, sessionSize);
          }}
          className="p-1.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Tải lại lượt học"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

      </div>

      {/* PROGRESS BAR */}
      <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
        <div 
          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${Math.round(((currentIndex + 1) / activeQueue.length) * 100)}%` }}
        />
      </div>

      {/* MAIN FLASHCARD WORKSPACE (The MVP TOEIC Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        
        {/* LEFT COLUMN: Shortcuts Pill (Desktop) */}
        <div className="hidden lg:block lg:col-span-2 space-y-2">
          <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs space-y-2 text-xs">
            <div className="font-bold text-slate-700">Phím tắt:</div>
            <div className="space-y-1 text-slate-600 text-[11px]">
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-100 border font-mono">Space</kbd> Lật thẻ</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-100 border font-mono">1</kbd> Chưa nhớ</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-100 border font-mono">2</kbd> Đã nhớ</div>
              <div><kbd className="px-1.5 py-0.5 rounded bg-slate-100 border font-mono">A</kbd> Phát âm</div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: The Card & Big Action Buttons */}
        <div className="lg:col-span-8 space-y-3">
          
          {/* THE FLASHCARD CONTAINER */}
          <div
            onClick={handleFlipToggle}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className={`w-full min-h-[300px] sm:min-h-[360px] bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-md flex flex-col justify-between cursor-pointer transition-all select-none relative ${
              isFlipped ? 'ring-2 ring-emerald-500/20' : 'hover:border-slate-300'
            }`}
          >
            {/* Top Bar inside Card */}
            <div className="flex items-center justify-between">
              
              {/* Star Bookmark */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  unlockMobileAudio();
                  if (onToggleFavorite) onToggleFavorite(currentWord.id);
                  showToast(isFavorited ? 'Đã bỏ lưu từ' : '⭐ Đã lưu vào mục yêu thích');
                }}
                className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                  isFavorited 
                    ? 'border-amber-300 bg-amber-50 text-amber-500' 
                    : 'border-slate-200 text-slate-400 hover:text-amber-500'
                }`}
                title="Lưu từ vào sổ tay yêu thích"
              >
                <Star className={`w-4 h-4 ${isFavorited ? 'fill-amber-500' : ''}`} />
              </button>

              {/* Status Hint */}
              <span className="text-[11px] font-semibold text-slate-400">
                {isFlipped ? 'Chạm để che bớt nghĩa' : 'Chạm để lật thẻ (Space)'}
              </span>

            </div>

            {/* Core Word Content */}
            <div className="text-center space-y-3 py-2">
              
              {/* Part of Speech & Phonetic */}
              <div className="space-y-0.5">
                <span className="text-xs sm:text-sm font-bold text-[#C52243]">
                  ({currentWord.partOfSpeech || 'phr'})
                </span>
                {currentWord.pronunciation && (
                  <p className="text-xs font-mono text-slate-400 font-medium">
                    /{currentWord.pronunciation}/
                  </p>
                )}
              </div>

              {/* WORD: CRIMSON FONT (#C52243) */}
              <div>
                <h2 className={`${wordFontSize} font-black font-mvp-word text-[#C52243] tracking-tight leading-tight py-0.5 px-2`}>
                  {currentWord.word}
                </h2>
              </div>

              {/* MẶT TRƯỚC: CHƯA LẬT THẺ -> NGHĨA BỊ ẨN, HIỆN CÂU VÍ DỤ CHE TỪ */}
              {!isFlipped ? (
                <div className="space-y-2 pt-1">
                  {currentWord.example && (
                    <div className="max-w-lg mx-auto p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 text-xs sm:text-sm text-slate-700 italic">
                      "{clozeHintExample}"
                    </div>
                  )}

                  <div className="text-xs font-bold text-blue-600 animate-pulse">
                    👉 Hãy nhớ lại nghĩa tiếng Việt, sau đó chạm vào thẻ để kiểm tra!
                  </div>
                </div>
              ) : (
                /* MẶT SAU: ĐÃ LẬT THẺ -> HIỆN ĐẦY ĐỦ NGHĨA XANH EMERALD & VÍ DỤ */
                <div className="space-y-2.5 pt-1 animate-fadeIn">
                  
                  {/* VIETNAMESE MEANING: BOLD EMERALD GREEN (#059669) */}
                  <div>
                    <h3 className="text-xl sm:text-3xl font-extrabold text-[#059669] tracking-tight">
                      {currentWord.meaning}
                    </h3>
                  </div>

                  {/* CONTEXT EXAMPLE PILL BOX */}
                  {currentWord.example && (
                    <div className="max-w-lg mx-auto p-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 text-xs sm:text-sm text-slate-800 space-y-0.5 text-center">
                      <p className="font-semibold text-slate-800 leading-relaxed">
                        {formattedExample}
                      </p>
                      {currentWord.exampleTranslation && (
                        <p className="text-slate-500 italic text-[11px] sm:text-xs">
                          {currentWord.exampleTranslation}
                        </p>
                      )}
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Bottom Prompt */}
            <div className="text-center text-[11px] text-slate-400 font-medium">
              {!isFlipped 
                ? 'Nhấn Space để lật thẻ • Bấm 1 để chọn Chưa nhớ • Bấm 2 để chọn Đã nhớ' 
                : 'Bấm 1 (Chưa nhớ) để lặp lại cuối phiên • Bấm 2 (Đã nhớ) để qua từ tiếp'}
            </div>

          </div>

          {/* 2 ACTION BUTTONS (The MVP TOEIC Layout) */}
          <div className="grid grid-cols-2 gap-2.5 pt-0.5">
            
            {/* 1. NÚT CHƯA NHỚ (Vivid Red #E5252A) */}
            <button
              onClick={handleUnremembered}
              className="flex flex-col items-center justify-center py-3.5 px-3 rounded-2xl bg-[#E5252A] hover:bg-[#D01F24] text-white shadow-md shadow-rose-600/20 transition-all active:scale-98 group cursor-pointer min-h-[52px]"
            >
              <span className="font-black text-sm sm:text-base tracking-wide">
                Chưa nhớ
              </span>
              <span className="text-[10px] font-medium text-rose-100">
                Xem lại trong phiên
              </span>
            </button>

            {/* 2. NÚT ĐÃ NHỚ (Vivid Emerald Green #059669) */}
            <button
              onClick={handleRemembered}
              className="flex flex-col items-center justify-center py-3.5 px-3 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white shadow-md shadow-emerald-600/20 transition-all active:scale-98 group cursor-pointer min-h-[52px]"
            >
              <span className="font-black text-sm sm:text-base tracking-wide">
                Đã nhớ
              </span>
              <span className="text-[10px] font-medium text-emerald-100">
                Hoàn tất • ôn sau 2 ngày
              </span>
            </button>

          </div>

          {/* Mobile Swipe Hint */}
          <div className="sm:hidden text-center text-[10px] text-slate-400 pt-1">
            💡 Mẹo: Vuốt Trái (Chưa nhớ) • Vuốt Phải (Đã nhớ) • Chạm thẻ (Lật)
          </div>

        </div>

        {/* RIGHT COLUMN: Audio Controls (Desktop & Mobile accessible) */}
        <div className="hidden lg:block lg:col-span-2 space-y-2.5">
          
          {/* Speaker Audio Box */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs text-center space-y-2.5">
            <button
              onClick={() => {
                unlockMobileAudio();
                speakEnglish(currentWord.word, 0.95);
              }}
              className="w-14 h-14 rounded-2xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 flex items-center justify-center mx-auto transition-transform active:scale-95 group shadow-xs cursor-pointer"
              title="Phát âm tiếng Anh chuẩn bản xứ (Phím A)"
            >
              <Volume2 className="w-7 h-7 group-hover:scale-110 transition-transform" />
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

        </div>

      </div>

    </div>
  );
}
