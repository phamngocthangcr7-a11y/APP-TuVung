import DeckLibrary from './DeckLibrary';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Volume2, Star, Award, ArrowLeft } from 'lucide-react';
import { speakEnglish, sound, stopSpeaking, unlockMobileAudio } from '../utils/sound';
import { calculateNextSrs, SRS_RATING, isDueForReview, getTodayDateString, getDeckProgress, buildStudyQueue } from '../utils/srs';
import { TOEIC_CORE_DECKS } from '../data/defaultVocab';
import { CURATED_TOEIC_EXAMPLES, isBadTemplateSentence } from '../utils/dictionary';
import './study.css';

// Sanitize and filter valid words helper (pure function at module scope)
const sanitizeWords = (list) => {
  if (!Array.isArray(list)) return [];
  return list.filter(w => w && typeof w === 'object' && w.word && String(w.word).trim() !== '' && String(w.word).trim() !== '-');
};

export default function SmartCards({
  allWords = [],
  onUpdateWordSrs,
  onRecordStudySession,
  initialWords = null,
  initialTitle = '',
  onOpenStudyDecks,
  onTransferData,
  onOpenAddModal,
  onOpenBatchModal,
  favoriteIds = [],
  onToggleFavorite,
  streakInfo = {},
  onStartQuiz,
  settings = {},
  onUpdateSettings,
  onDeepRecovery
}) {
  // Navigation View Modes: 'decks' (Dashboard Image 2), 'study' (Review Mode Image 3/4), 'recall_check' (Active Typing), 'summary' (Victory)
  const [viewMode, setViewMode] = useState(() => {
    if (initialWords && initialWords.length > 0) return 'study';
    return 'decks';
  });

  const [activeDeck, setActiveDeck] = useState(null);
  const [sessionSize, setSessionSize] = useState(10);
  const [studyModeType, setStudyModeType] = useState('due_first'); // 'new_first' (Học từ mới tiếp theo), 'due_first' (Ôn từ đến hạn), 'mixed' (Kết hợp)
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [selectedDeckForSession, setSelectedDeckForSession] = useState(null);

  // Review Queue State (Phase 1)
  const [activeQueue, setActiveQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const autoPlayAudio = settings.autoPlayAudio ?? true;
  const [audioError, setAudioError] = useState('');
  const playEnglish = useCallback(async (text) => {
    setAudioError('');
    if (await speakEnglish(text, settings.speechRate) === 'unavailable') {
      setAudioError('Chưa phát được giọng đọc. Hãy kiểm tra mạng và bấm nút nghe để thử lại.');
    }
  }, [settings.speechRate]);
  const [sessionTargetWords, setSessionTargetWords] = useState([]); // Danh sách gốc N từ của phiên học

  // Active Recall State (Phase 2 - Luyện gõ củng cố sau khi học)
  const [recallQueue, setRecallQueue] = useState([]);
  const [recallIndex, setRecallIndex] = useState(0);
  const [recallInput, setRecallInput] = useState('');
  const [recallFeedback, setRecallFeedback] = useState(null); // 'correct', 'incorrect', 'revealed'
  const [revealedHint, setRevealedHint] = useState(false);
  const missedRecall = useRef(new Set());
  const recallInputRef = useRef(null);

  const [toastMessage, setToastMessage] = useState('');


  const todayStr = getTodayDateString();

  // Handle dynamically passed words (e.g. from Batch Import or Daily Journal)
  useEffect(() => {
    if (initialWords && Array.isArray(initialWords) && initialWords.length > 0) {
      const clean = sanitizeWords(initialWords);
      if (clean.length > 0) {
        setSessionTargetWords(clean);
        setActiveQueue(clean);
        setCurrentIndex(0);
        setIsFlipped(false);
        setViewMode('study');
        setActiveDeck({ id: 'custom_session', title: initialTitle || 'Phiên học đã chọn', code: 'CUS' });
      }
    }
  }, [initialWords, initialTitle]);

  // Using sanitizeWords from module scope

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 1800);
  };

  const handleTriggerDeepRecovery = async () => {
    if (!window.confirm('Thêm lại các từ còn thiếu từ bản sao lưu cũ vào Bộ của tôi?')) return;
    try {
      const count = await onDeepRecovery?.();
      showToast(count ? `Đã khôi phục ${count} từ.` : 'Không có từ cần bổ sung từ bản sao lưu.');
    } catch (error) { showToast(error.message); }
  };

  // Helper: Filter words by deck
  const getWordsForDeck = useCallback((deckId) => {
    const cleanAll = sanitizeWords(allWords);
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
      return cleanAll.filter(w => w.isCustom || String(w.id || '').startsWith('usr_'));
    }
    return cleanAll;
  }, [allWords]);

  // Unified List of All Decks (Including "Bộ Của Tôi" prominently as Card #1)
  const displayDecks = useMemo(() => {
    const cleanAll = sanitizeWords(allWords);
    const customList = cleanAll.filter(w => w.isCustom || String(w.id || '').startsWith('usr_'));

    const myDeck = {
      id: 'deck_custom',
      code: 'ME',
      badgeColor: 'bg-indigo-600 text-white',
      title: 'Bộ Của Tôi',
      subtitle: customList.length > 0 
        ? `${customList.length} từ vựng bạn tự nạp & học hàng ngày.` 
        : 'Sổ tay từ vựng do bạn tự thêm và lưu lại.',
      isCustom: true
    };

    return [myDeck, ...TOEIC_CORE_DECKS];
  }, [allWords]);

  const deckStats = useMemo(() => Object.fromEntries(displayDecks.map(deck =>
    [deck.id, getDeckProgress(getWordsForDeck(deck.id), todayStr)]
  )), [displayDecks, getWordsForDeck, todayStr]);

  // Overall Global Stats for Top Bar (Image 2)
  const overallStats = useMemo(() => {
    const cleanAll = sanitizeWords(allWords);
    let hardCards = [];

    cleanAll.forEach(w => {
      const srs = w.srs || {};
      if (srs.state === 'learning' || w.mistakeCount > 0 || (srs.easeFactor && srs.easeFactor < 2.2)) {
        hardCards.push(w);
      }
    });

    return {
      todayCount: streakInfo.history?.[todayStr] || 0,
      currentStreak: streakInfo.currentStreak || 0,
      longestStreak: streakInfo.longestStreak || 0,
      savedCount: (favoriteIds || []).length,
      hardCount: hardCards.length,
      hardCards
    };
  }, [allWords, streakInfo, favoriteIds, todayStr]);

  // START STUDY SESSION: Hỗ trợ chia phiên 30 từ hôm nay, mai học 30 từ tiếp theo, không bị lặp!
  const startSession = (deck, targetCount = 30, mode = studyModeType) => {
    unlockMobileAudio();
    let words = [];

    if (deck === 'saved') {
      words = sanitizeWords(allWords).filter(w => (favoriteIds || []).includes(w.id));
      setActiveDeck({ id: 'saved', title: 'Từ Vựng Đã Lưu (⭐)', code: 'SAVED' });
    } else if (deck === 'hard') {
      words = overallStats.hardCards;
      setActiveDeck({ id: 'hard', title: 'Top Thẻ Khó & Cần Ôn', code: 'HARD' });
    } else {
      words = getWordsForDeck(deck.id);
      setActiveDeck(deck);
    }

    if (words.length === 0) {
      if (deck === 'saved') {
        showToast('⭐ Bạn chưa lưu từ vựng nào vào mục Yêu thích.');
      } else if (deck === 'hard') {
        showToast('🎯 Hiện tại không có thẻ khó nào cần ôn.');
      } else if (deck?.id === 'deck_custom') {
        showToast('💡 Bạn chưa có từ nào trong "Bộ Của Tôi". Hãy bấm "Dán nhiều từ" để thêm nhé!');
        onOpenBatchModal?.();
      } else {
        showToast('⚠️ Bộ từ vựng này hiện chưa có từ nào để học.');
      }
      return;
    }

    const selectionMode = deck === 'saved' || deck === 'hard' ? 'free' : mode;
    const selected = buildStudyQueue(words, targetCount, selectionMode, todayStr);
    if (!selected.length) {
      setIsSizeModalOpen(false);
      showToast('Bạn đã ôn xong bộ này hôm nay.');
      return;
    }

    setSessionTargetWords(selected);
    setActiveQueue([...selected]);
    setCurrentIndex(0);
    setIsFlipped(false);
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

  useEffect(() => {
    setAudioError('');
    if (viewMode === 'study' && currentWord && autoPlayAudio) playEnglish(currentWord.word);
    return stopSpeaking;
  }, [currentWord, currentIndex, recallIndex, autoPlayAudio, viewMode, playEnglish]);

  // 1. NÚT CHƯA NHỚ (Lặp lại ở cuối phiên)
  const handleUnremembered = useCallback(() => {
    if (!currentWord || !isFlipped) return;
    unlockMobileAudio();
    sound.playIncorrect();
    showToast('🔁 Chưa nhớ: Từ này sẽ lặp lại ở cuối phiên học!');

    const nextSrs = calculateNextSrs(currentWord.srs, SRS_RATING.AGAIN);
    if (onUpdateWordSrs) onUpdateWordSrs(currentWord.id, nextSrs);

    // Xếp từ xuống cuối hàng đợi để người dùng buộc phải nhớ
    setActiveQueue(prev => {
      const copy = [...prev];
      const item = copy.splice(currentIndex, 1)[0];
      copy.push({ ...item, srs: nextSrs });
      return copy;
    });

    setIsFlipped(false);
  }, [currentWord, currentIndex, onUpdateWordSrs, isFlipped]);

  // 2. NÚT ĐÃ NHỚ (Chuyển sang từ tiếp theo)
  const handleRemembered = useCallback(() => {
    if (!currentWord || !isFlipped) return;
    unlockMobileAudio();
    sound.playCorrect();
    showToast('✨ Đã nhớ! Xuất sắc!');

    const nextSrs = !currentWord.srs?.state || currentWord.srs.state === 'new' || isDueForReview(currentWord, todayStr)
      ? calculateNextSrs(currentWord.srs, SRS_RATING.GOOD)
      : { ...currentWord.srs, lastReviewedDate: todayStr };
    const updatedQueue = activeQueue.map((word, index) =>
      index === currentIndex ? { ...word, srs: nextSrs } : word);
    setActiveQueue(updatedQueue);
    if (onUpdateWordSrs) onUpdateWordSrs(currentWord.id, nextSrs);

    // Kiểm tra xem đã hoàn thành hết các thẻ trong activeQueue chưa
    if (currentIndex + 1 >= activeQueue.length) {
      // CHUYỂN SANG VÒNG 2: ACTIVE RECALL (VIẾT LẠI TỪ VỰNG VỪA HỌC)
      sound.playFlip();
      const recallList = [...updatedQueue];
      setRecallQueue(recallList.sort(() => 0.5 - Math.random()));
      missedRecall.current.clear();
      setRecallIndex(0);
      setRecallInput('');
      setRecallFeedback(null);
      setRevealedHint(false);
      setViewMode('recall_check');
    } else {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  }, [currentWord, currentIndex, activeQueue, todayStr, onUpdateWordSrs, isFlipped]);

  // Lật thẻ
  const handleFlipToggle = () => {
    unlockMobileAudio();
    sound.playFlip();
    setIsFlipped(prev => !prev);
  };

  // Keyboard Shortcuts (Image 2 & 3: 1 Chưa nhớ, 2 Đã nhớ, Space Lật, A Phát âm)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || e.target.closest?.('input, textarea, select, [role=dialog]') || document.querySelector('[role=dialog]')) return;
      if (e.target.closest?.('button') && (e.code === 'Space' || e.code === 'Enter')) return;

      if (viewMode === 'study') {
        if (e.key === '1') {
          e.preventDefault();
          handleUnremembered();
        } else if (e.key === '2') {
          e.preventDefault();
          handleRemembered();
        } else if (e.key.toLowerCase() === 'a' || e.key.toLowerCase() === 'r') {
          e.preventDefault();
          if (currentWord?.word) playEnglish(currentWord.word);
        } else if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          handleFlipToggle();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUnremembered, handleRemembered, currentWord, viewMode, playEnglish]);

  const curated = CURATED_TOEIC_EXAMPLES[currentWord?.word?.trim().toLowerCase()];
  const effectivePronunciation = currentWord?.pronunciation || curated?.pronunciation || '';
  const effectivePos = currentWord?.partOfSpeech || curated?.partOfSpeech || '';
  const displayMeaning = currentWord?.meaning || curated?.meaning || '';
  const useStoredExample = currentWord?.example && !isBadTemplateSentence(currentWord.example, currentWord.exampleTranslation);
  const example = useStoredExample ? currentWord.example : curated?.example;
  const translation = useStoredExample ? currentWord.exampleTranslation : curated?.translation;

  // =========================================================================
  // LOGIC VÒNG 2: ACTIVE RECALL (VIẾT LẠI TỪ VỰNG VỪA HỌC)
  // =========================================================================
  const currentRecallWord = recallQueue[recallIndex];

  // Helper: Normalize answer for forgiving comparison
  const isMatchAnswer = (userInput, targetWord) => {
    if (!userInput || !targetWord) return false;
    const cleanUser = userInput.toLowerCase().trim().replace(/['"`]/g, '');
    const cleanTarget = targetWord.toLowerCase().trim().replace(/['"`]/g, '');

    // 1. Khớp chính xác
    if (cleanUser === cleanTarget) return true;

    // 2. Cho phép bỏ qua tiền tố "to " hoặc "be "
    const noPrefixTarget = cleanTarget.replace(/^(to|be)\s+/i, '');
    if (cleanUser === noPrefixTarget) return true;
    if (cleanUser.replace(/^(to|be)\s+/i, '') === noPrefixTarget) return true;

    // 3. Cho phép bỏ qua dấu câu / khoảng trắng
    if (cleanUser.replace(/[^a-z0-9]/gi, '') === cleanTarget.replace(/[^a-z0-9]/gi, '')) return true;

    // 4. Bỏ qua ghi chú trong ngoặc đơn như "(n)", "(v)", "(someone)"
    const noParenTarget = cleanTarget.replace(/\([^)]*\)/g, '').trim();
    if (cleanUser === noParenTarget || cleanUser === noParenTarget.replace(/^(to|be)\s+/i, '')) return true;

    // 5. Nếu từ có nhiều nghĩa/cụm phân cách bằng '/', ',', ';'
    const alternatives = cleanTarget.split(/[/;,]/).map(s => s.trim().replace(/\([^)]*\)/g, '').trim()).filter(Boolean);
    if (alternatives.length > 1) {
      for (const alt of alternatives) {
        if (cleanUser === alt || cleanUser === alt.replace(/^(to|be)\s+/i, '')) return true;
        if (cleanUser.replace(/[^a-z0-9]/gi, '') === alt.replace(/[^a-z0-9]/gi, '')) return true;
      }
    }

    return false;
  };

  const advanceRecall = () => {
    if (recallIndex + 1 >= recallQueue.length) {
      onRecordStudySession?.(sessionTargetWords.length);
      sound.playVictory();
      setViewMode('summary');
      return;
    }
    setRecallIndex(i => i + 1);
    setRecallInput('');
    setRecallFeedback(null);
    setRevealedHint(false);
    recallInputRef.current?.focus();
  };

  const markRecallForReview = () => {
    if (missedRecall.current.has(currentRecallWord.id)) return;
    missedRecall.current.add(currentRecallWord.id);
    onUpdateWordSrs?.(currentRecallWord.id, calculateNextSrs(currentRecallWord.srs, SRS_RATING.AGAIN));
  };

  const handleCheckRecall = (event) => {
    event.preventDefault();
    if (!currentRecallWord) return;
    if (recallFeedback === 'revealed') {
      setRecallFeedback(null);
      requestAnimationFrame(() => recallInputRef.current?.focus());
    } else if (recallFeedback === 'correct') {
      advanceRecall();
    } else if (isMatchAnswer(recallInput, currentRecallWord.word)) {
      sound.playCorrect();
      setRecallFeedback('correct');
    } else {
      sound.playIncorrect();
      markRecallForReview();
      setRecallFeedback('incorrect');
    }
  };

  const handleShowHint = () => setRevealedHint(true);

  const handleRevealAnswer = () => {
    if (!currentRecallWord) return;
    markRecallForReview();
    setRecallInput('');
    setRecallFeedback('revealed');
  };

  // =========================================================================
  // VIEW 1: DECKS OVERVIEW (Dashboard chuẩn The MVP TOEIC - Image 2)
  // =========================================================================
  if (viewMode === 'decks') {
    return (
      <div>
        <DeckLibrary decks={displayDecks} stats={deckStats} overall={overallStats} start={startSession}
          open={handleOpenDeck} add={onOpenAddModal} openStudyDecks={onOpenStudyDecks} transferData={onTransferData} recover={handleTriggerDeepRecovery} />
        {toastMessage && <p className="study-notice" role="status">{toastMessage}</p>}
        {isSizeModalOpen && selectedDeckForSession && (
          <div className="study-overlay" onClick={() => setIsSizeModalOpen(false)}>
            <section className="study-sheet study-setup" role="dialog" aria-modal="true" aria-labelledby="session-title" onKeyDown={e => { if (e.key === 'Escape') setIsSizeModalOpen(false); }} onClick={e => e.stopPropagation()}>
              <h2 id="session-title">{selectedDeckForSession.title}</h2>
              <p>{deckStats[selectedDeckForSession.id].dueCount} thẻ đến hạn · {deckStats[selectedDeckForSession.id].newCount} thẻ mới</p>
              <label>Thứ tự học<select autoFocus value={studyModeType} onChange={e => setStudyModeType(e.target.value)}>
                <option value="due_first">Xen từ mới và từ cần ôn</option>
                <option value="new_first">Học thẻ mới trước</option>
                <option value="free">Luyện tự do cả bộ</option>
              </select></label>
              <label>Số thẻ tối đa<select value={sessionSize} onChange={e => setSessionSize(Number(e.target.value))}>
                {[5,10,20,30].map(n => <option key={n} value={n}>{n} thẻ</option>)}
              </select></label>
              <div className="study-actions"><button onClick={() => setIsSizeModalOpen(false)}>Quay lại</button>
                <button className="study-primary" onClick={() => startSession(selectedDeckForSession, sessionSize, studyModeType)}>Bắt đầu học</button></div>
            </section>
          </div>)}
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: ACTIVE RECALL (VÒNG 2 - GÕ LẠI TỪ VỰNG ĐỂ KHẮC SÂU TRÍ NHỚ)
  // =========================================================================
  const leaveSession = () => setViewMode('decks');
  if (viewMode === 'summary') {
    return <section className="study-sheet study-summary">
      <Award size={38} /><h1>Hoàn thành phiên học</h1>
      <p>Bạn đã ôn {sessionTargetWords.length} từ trong {activeDeck?.title || 'bộ đã chọn'}.</p>
      <ul>{sessionTargetWords.map(w => <li key={w.id}><b lang="en">{w.word}</b><span>{w.meaning}</span></li>)}</ul>
      <div className="study-actions"><button onClick={leaveSession}>Về bộ thẻ</button>
        {onStartQuiz && <button className="study-primary" onClick={() => onStartQuiz(sessionTargetWords)}>Luyện trắc nghiệm</button>}</div>
    </section>;
  }

  const isRecall = viewMode === 'recall_check';
  const item = isRecall ? currentRecallWord : currentWord;
  if (!item) return <section className="study-sheet"><h2>Chưa có thẻ để học</h2><button onClick={leaveSession}>Về bộ thẻ</button></section>;
  const index = isRecall ? recallIndex : currentIndex;
  const total = isRecall ? recallQueue.length : activeQueue.length;
  const done = recallFeedback === 'correct';
  const isFavorited = favoriteIds.includes(item.id);
  return <section className="study-session">
    <div className="study-line"><button onClick={leaveSession}><ArrowLeft size={16}/> Bộ thẻ</button><strong>{activeDeck?.title}</strong><span>{index + 1} / {total}</span></div>
    <progress aria-label="Tiến độ vòng học" value={index} max={total}/>
    <article className="study-sheet">
      <header className="study-line"><span className="study-phase">{isRecall ? 'Vòng 2 · Viết lại từ' : 'Vòng 1 · Nhớ nghĩa'}</span>
        <button aria-label={isFavorited ? 'Bỏ lưu từ' : 'Lưu từ'} aria-pressed={isFavorited} onClick={() => onToggleFavorite?.(item.id)}><Star size={18} fill={isFavorited ? 'currentColor' : 'none'}/></button></header>
      {toastMessage && !isRecall && <p className="study-notice" role="status">{toastMessage}</p>}
      <div className="study-prompt">
        <h1 lang={isRecall ? 'vi' : 'en'}>{isRecall ? item.meaning : item.word}</h1>
        {!isRecall && (effectivePos || effectivePronunciation) && <p>{[effectivePos, effectivePronunciation].filter(Boolean).join(' · ')}</p>}
        <button className="study-audio" onClick={() => playEnglish(item.word)}><Volume2 size={18}/>{isRecall ? 'Nghe gợi ý' : 'Nghe từ'}</button>
      </div>
      {audioError && <p role="status">{audioError}</p>}
      {isRecall ? <form className="study-recall" onSubmit={handleCheckRecall}>
        <label htmlFor="recall-answer">Từ hoặc cụm từ tiếng Anh</label>
        <input id="recall-answer" lang="en" ref={recallInputRef} autoFocus autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} readOnly={done || recallFeedback === 'revealed'} value={recallInput} onChange={e => {setRecallInput(e.target.value); setRecallFeedback(null);}}/>
        <div aria-live="polite">{recallFeedback === 'incorrect' ? 'Chưa đúng. Bạn có thể thử lại hoặc xem gợi ý.' : recallFeedback === 'correct' ? 'Chính xác!' : recallFeedback === 'revealed' ? <>Đáp án <strong lang="en">{item.word}</strong>. Bấm Ẩn đáp án rồi gõ lại.</> : revealedHint ? 'Bắt đầu bằng ' + item.word.slice(0, item.word.length > 3 ? 2 : 1) + '…' : ''}</div>
        <div className="study-actions">{!done && recallFeedback !== 'revealed' && <><button type="button" onClick={handleShowHint}>Gợi ý chữ cái</button><button type="button" onClick={handleRevealAnswer}>Xem đáp án</button></>}
          <button className="study-primary" disabled={recallFeedback !== 'revealed' && !recallInput.trim()}>{recallFeedback === 'revealed' ? 'Ẩn đáp án và gõ lại' : done ? index + 1 === total ? 'Hoàn thành' : 'Từ tiếp theo' : 'Kiểm tra'}</button></div>
      </form> : <>
        {isFlipped ? <div className="study-details">
          <h2>Nghĩa tiếng Việt</h2><p>{displayMeaning}</p>
          {example && <><div className="study-line"><h2>Câu ví dụ</h2><button className="study-audio" onClick={() => playEnglish(example)}><Volume2 size={16}/> Nghe câu</button></div><blockquote lang="en">{example}</blockquote>{translation && <p className="study-translation">{translation}</p>}</>}
          {!example && <p className="study-translation">Thẻ này chưa có câu ví dụ.</p>}
          {item.note && <p>Ghi chú · {item.note}</p>}
          <div className="study-actions"><button onClick={handleUnremembered}>Học lại cuối phiên</button><button className="study-primary" onClick={handleRemembered}>Đã nhớ</button></div>
        </div> : <div className="study-reveal"><p>Hãy thử nhớ nghĩa của từ.</p><button className="study-primary" onClick={handleFlipToggle}>Xem nghĩa và ví dụ</button></div>}
        <label className="study-auto"><input type="checkbox" checked={autoPlayAudio} onChange={e => onUpdateSettings?.({...settings, autoPlayAudio:e.target.checked})}/> Tự động phát âm từ</label>
      </>}
    </article>
  </section>;
}
