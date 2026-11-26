import { wordKey } from './utils/cardEntry';
import StudyDecks, { readStudyDecks, saveStudyDeck } from './components/StudyDecks';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import DailyJournal from './components/DailyJournal';
import SmartCards from './components/SmartCards';
import QuizMode from './components/QuizMode';
import DictationMode from './components/DictationMode';
import MatchGame from './components/MatchGame';
import WordModal from './components/WordModal';
import BatchImportModal from './components/BatchImportModal';
import SettingsModal from './components/SettingsModal';
import ErrorBoundary from './components/ErrorBoundary';

import { BUILTIN_SETS } from './data/defaultVocab';
import { 
  getCustomWords, 
  saveCustomWords, 
  addCustomWord, 
  addBatchCustomWords, 
  updateCustomWord, 
  deleteCustomWord,
  getWordSrsProgress,
  saveWordSrsProgress,
  getFavoriteIds,
  toggleFavoriteId,
  getStreakInfo,
  recordStudySession,
  getAppSettings,
  saveAppSettings,
  deepRecoverCustomWords
} from './utils/storage';
import { getTodayDateString } from './utils/srs';


export default function App() {
  // Navigation State - Default to SmartCards for instant learning
  const [activeTab, setActiveTab] = useState('smartcards'); // 'smartcards', 'journal', 'practice'
  const [practiceSubTab, setPracticeSubTab] = useState('quiz'); // 'quiz', 'dictation', 'match'


  // Study Target State
  const [studyWordsList, setStudyWordsList] = useState(null);
  const [studyMode, setStudyMode] = useState('all');
  const [studyTitle, setStudyTitle] = useState('');
  const [studyDecks, setStudyDecks] = useState(readStudyDecks);
  const [showStudyDecks, setShowStudyDecks] = useState(false);
  const [studyKey, setStudyKey] = useState(0);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // App Data State
  const [customWords, setCustomWords] = useState(() => {
    const raw = getCustomWords();
    // Clean out any corrupted or dash words
    return (raw || []).filter(w => w && w.word && String(w.word).trim() !== '' && String(w.word).trim() !== '-');
  });
  const [srsProgress, setSrsProgress] = useState(() => getWordSrsProgress());
  const [favoriteIds, setFavoriteIds] = useState(() => getFavoriteIds());
  const [streakInfo, setStreakInfo] = useState(() => getStreakInfo());
  const [settings, setSettings] = useState(() => getAppSettings());

  // Tự động rà soát & tra cứu bổ sung câu ví dụ thực tế ngầm dưới nền + Tự động quét sâu Master Vault khi tải app
  useEffect(() => {
    // Lắng nghe sự kiện storage để đồng bộ tức thì nếu mở nhiều tab hoặc sửa dữ liệu
    const handleStorageChange = (e) => {
      if (!e.key || e.key.includes('toeic_custom_words') || e.key.includes('toeic_word_srs')) {
        const freshCustom = getCustomWords();
        setCustomWords(freshCustom.filter(w => w && w.word && String(w.word).trim() !== '' && String(w.word).trim() !== '-'));
        setSrsProgress(getWordSrsProgress());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const todayStr = getTodayDateString();

  // Combined all words (built-in sets + custom words with latest SRS applied)
  const allWords = useMemo(() => {
    const list = [];

    // 1. Custom Words
    (customWords || []).forEach(w => {
      if (!w || !w.word || String(w.word).trim() === '' || String(w.word).trim() === '-') return;
      const liveSrs = srsProgress[w.id] || w.srs || {
        repetitions: 0,
        interval: 0,
        easeFactor: 2.5,
        nextReviewDate: w.addedDate || todayStr,
        state: 'new'
      };
      list.push({ ...w, isCustom: true, srs: liveSrs });
    });

    // 2. Built-in Sets Words
    BUILTIN_SETS.forEach(set => {
      (set.words || []).forEach(w => {
        if (!w || !w.word || String(w.word).trim() === '' || String(w.word).trim() === '-') return;
        const liveSrs = srsProgress[w.id] || w.srs || {
          repetitions: 0,
          interval: 0,
          easeFactor: 2.5,
          nextReviewDate: todayStr,
          state: 'new'
        };
        list.push({ ...w, srs: liveSrs });
      });
    });

    return list;
  }, [customWords, srsProgress, todayStr]);

  // Handlers
  const handleAddWord = (wordData) => {
    if (!wordData || !wordData.word || String(wordData.word).trim() === '' || String(wordData.word).trim() === '-') return;
    const newWord = addCustomWord(wordData);
    setCustomWords(prev => [newWord, ...prev]);
  };

  const handleBatchSave = (batchList, action = null, deckTitle = '') => {
    const valid = (batchList || []).filter(w => w && w.word && String(w.word).trim() !== '' && String(w.word).trim() !== '-');
    if (valid.length === 0) return;
    const existing = new Map(getCustomWords().map(word => [wordKey(word.word), word]));
    const newWords = valid.filter(word => !existing.has(wordKey(word.word)));
    const created = newWords.length ? addBatchCustomWords(newWords) : [];
    const saved = new Map(created.map(word => [wordKey(word.word), word]));
    const deckWords = valid.map(word => existing.get(wordKey(word.word)) || saved.get(wordKey(word.word)));
    const freshWords = getCustomWords();
    setCustomWords(freshWords.filter(w => w && w.word && String(w.word).trim() !== '' && String(w.word).trim() !== '-'));

    if (deckTitle) setStudyDecks(saveStudyDeck(deckTitle, deckWords));
    if (action === 'study') handleStartSmartCards(deckWords.map(word => ({ ...word, srs: srsProgress[word.id] || word.srs })), deckTitle);


  };

  const handleDeepRecovery = useCallback(async () => {
    const before = getCustomWords().length;
    let snapshot = [];
    try {
      const response = await fetch('/toeic_master_restored.json');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) snapshot = data;
      }
    } catch {
      // Browser backups remain available offline.
    }
    const recovered = deepRecoverCustomWords(snapshot);
    const clean = (recovered || []).filter(w => w && w.word && String(w.word).trim() !== '' && String(w.word).trim() !== '-');
    setCustomWords(clean);
    setSrsProgress(getWordSrsProgress());
    return clean.length - before;
  }, []);

  const handleEditWord = (wordData) => {
    if (!editingWord) return;
    const updated = updateCustomWord(editingWord.id, wordData);
    if (updated) {
      setCustomWords(prev => prev.map(w => w.id === editingWord.id ? updated : w));
    }
    setEditingWord(null);
  };

  const handleDeleteWord = (wordId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa từ vựng này khỏi sổ tay?')) {
      const remaining = deleteCustomWord(wordId);
      setCustomWords(remaining);
      setFavoriteIds(getFavoriteIds());
      setSrsProgress(getWordSrsProgress());
    }
  };

  const handleUpdateWordSrs = useCallback((wordId, newSrs) => {
    saveWordSrsProgress(wordId, newSrs);
    setSrsProgress(prev => ({ ...prev, [wordId]: newSrs }));
    if (String(wordId).startsWith('usr_')) {
      setCustomWords(prev => prev.map(w => w.id === wordId ? { ...w, srs: newSrs } : w));
    }
  }, []);

  const handleToggleFavorite = useCallback((wordId) => {
    const updated = toggleFavoriteId(wordId);
    setFavoriteIds(updated);
  }, []);

  const handleRecordSession = useCallback((count = 1) => {
    const updatedStreak = recordStudySession(count);
    setStreakInfo(updatedStreak);
  }, []);

  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings);
    saveAppSettings(newSettings);
  };

  const handleResetProgress = () => {
    const cleared = getCustomWords().map(({ srs, ...word }) => word);
    saveCustomWords(cleared);
    setCustomWords(cleared);
    localStorage.removeItem('toeic_word_srs_progress_v2');
    setSrsProgress({});
  };

  const handleDataImported = () => {
    setCustomWords(getCustomWords());
    setSrsProgress(getWordSrsProgress());
    setStreakInfo(getStreakInfo());
    setFavoriteIds(getFavoriteIds());
    setSettings(getAppSettings());
  };

  // Quick Navigation Triggers
  const handleTabChange = (newTab) => {
    if (newTab === 'smartcards') {
      setStudyWordsList(null);
      setStudyMode('decks');
      setStudyKey(key => key + 1);
    }
    setActiveTab(newTab);
  };

  const handleStartSmartCards = (target, title = '') => {
    setStudyTitle(title);
    setStudyKey(key => key + 1);
    if (Array.isArray(target)) {
      setStudyWordsList(target);
      setStudyMode('custom_list');
    } else {
      setStudyWordsList(null);
      setStudyMode(target || 'all');
    }
    setActiveTab('smartcards');
  };

  const handleStartQuiz = (target) => {
    if (Array.isArray(target)) {
      setStudyWordsList(target);
    } else {
      setStudyWordsList(null);
    }
    setPracticeSubTab('quiz');
    setActiveTab('practice');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenAddModal={() => {
          setEditingWord(null);
          setIsAddModalOpen(true);
        }}
        onOpenBatchModal={() => setIsBatchModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Content Area wrapped in ErrorBoundary */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        
        <ErrorBoundary onReset={() => setActiveTab('smartcards')}>
          
          {/* 1. Smart Cards (SRS) View - Central Learning Tab */}
          {activeTab === 'smartcards' && (
            <SmartCards
              key={studyKey}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              allWords={allWords}
              customWords={customWords}
              builtInSets={BUILTIN_SETS}
              onUpdateWordSrs={handleUpdateWordSrs}
              onRecordStudySession={handleRecordSession}
              onOpenStudyDecks={() => setShowStudyDecks(true)}
              initialTitle={studyTitle}
              initialWords={studyWordsList}
              initialMode={studyMode}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
              streakInfo={streakInfo}
              onStartQuiz={handleStartQuiz}
              onBackToDashboard={() => setActiveTab('journal')}
              onOpenAddModal={() => {
                setEditingWord(null);
                setIsAddModalOpen(true);
              }}
              onOpenBatchModal={() => setIsBatchModalOpen(true)}
              onDeepRecovery={handleDeepRecovery}
            />
          )}

          {/* 2. Daily & Weekly Journal View */}
          {activeTab === 'journal' && (
            <DailyJournal
              allWords={allWords}
              customWords={customWords}
              builtInSets={BUILTIN_SETS}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
              onOpenAddModal={() => {
                setEditingWord(null);
                setIsAddModalOpen(true);
              }}
              onOpenBatchModal={() => setIsBatchModalOpen(true)}
              onEditWord={(word) => {
                setEditingWord(word);
                setIsAddModalOpen(true);
              }}
              onDeleteWord={handleDeleteWord}
              onStartSmartCards={handleStartSmartCards}
              onStartQuiz={handleStartQuiz}
              initialFilter="custom"
              onDataImported={handleDataImported}
              onDeepRecovery={handleDeepRecovery}
            />
          )}

          {/* 3. Practice Modes (Quiz, Dictation, Match) */}
          {activeTab === 'practice' && (
            <div className="space-y-4">
              
              {/* Clean Sub navigation for practice */}
              <div className="flex items-center justify-between bg-[#FFFDF9] p-1.5 rounded-2xl border border-[#EAE5DC] shadow-xs max-w-sm mx-auto">
                <button
                  onClick={() => setPracticeSubTab('quiz')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    practiceSubTab === 'quiz'
                      ? 'bg-[#2B4C7E] text-white shadow-2xs'
                      : 'text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  Trắc nghiệm
                </button>

                <button
                  onClick={() => setPracticeSubTab('dictation')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    practiceSubTab === 'dictation'
                      ? 'bg-[#2B4C7E] text-white shadow-2xs'
                      : 'text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  Luyện gõ
                </button>

                <button
                  onClick={() => setPracticeSubTab('match')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    practiceSubTab === 'match'
                      ? 'bg-[#2B4C7E] text-white shadow-2xs'
                      : 'text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  Ghép từ
                </button>
              </div>

              {/* Sub-components */}
              {practiceSubTab === 'quiz' && (
                <QuizMode
                  allWords={allWords}
                  customWords={customWords}
                  builtInSets={BUILTIN_SETS}
                  initialWords={studyWordsList}
                  onRecordStudySession={handleRecordSession}
                  onBackToDashboard={() => setActiveTab('smartcards')}
                />
              )}

              {practiceSubTab === 'dictation' && (
                <DictationMode
                  allWords={allWords}
                  customWords={customWords}
                  builtInSets={BUILTIN_SETS}
                  initialWords={studyWordsList}
                  onRecordStudySession={handleRecordSession}
                  onBackToDashboard={() => setActiveTab('smartcards')}
                />
              )}

              {practiceSubTab === 'match' && (
                <MatchGame
                  allWords={allWords}
                  customWords={customWords}
                  builtInSets={BUILTIN_SETS}
                  onRecordStudySession={handleRecordSession}
                  onBackToDashboard={() => setActiveTab('smartcards')}
                />
              )}

            </div>
          )}

        </ErrorBoundary>

      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        customWordsCount={customWords.length}
        onOpenAddModal={() => {
          setEditingWord(null);
          setIsAddModalOpen(true);
        }}
      />

      {showStudyDecks && <StudyDecks decks={studyDecks} words={customWords}
        onCreate={(title, words, imported) => setStudyDecks(saveStudyDeck(title, words, imported))}
        onStudy={(words, title) => {
          setShowStudyDecks(false);
          handleStartSmartCards(words.map(word => ({ ...word, srs: srsProgress[word.id] || word.srs })), title);
        }}
        onClose={() => setShowStudyDecks(false)} />}

      {/* Add / Edit Word Modal with Auto Meaning Check */}
      {isAddModalOpen && (
        <ErrorBoundary>
          <WordModal
            existingWords={customWords}
            isOpen={isAddModalOpen}
            onClose={() => {
              setIsAddModalOpen(false);
              setEditingWord(null);
            }}
            onSave={editingWord ? handleEditWord : handleAddWord}
            editingWord={editingWord}
          />
        </ErrorBoundary>
      )}

      {/* Batch Import Words Modal */}
      {isBatchModalOpen && (
        <ErrorBoundary>
          <BatchImportModal
            existingWords={customWords}
            isOpen={isBatchModalOpen}
            onClose={() => setIsBatchModalOpen(false)}
            onBatchSave={handleBatchSave}
          />
        </ErrorBoundary>
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <ErrorBoundary>
          <SettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            allWords={allWords}
            customWords={customWords}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetProgress={handleResetProgress}
            onDataImported={handleDataImported}
          />
        </ErrorBoundary>
      )}

    </div>
  );
}
