import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import DailyJournal from './components/DailyJournal';
import SmartCards from './components/SmartCards';
import QuizMode from './components/QuizMode';
import DictationMode from './components/DictationMode';
import MatchGame from './components/MatchGame';
import WordModal from './components/WordModal';
import BatchImportModal from './components/BatchImportModal';
import SettingsModal from './components/SettingsModal';

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
  getWeekNumber
} from './utils/storage';
import { getTodayDateString, isDueForReview, calculateSRSStats } from './utils/srs';
import { 
  CheckCircle2, 
  Layers, 
  PenTool, 
  Gamepad2, 
  ArrowLeft 
} from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'journal', 'smartcards', 'practice'
  const [practiceSubTab, setPracticeSubTab] = useState('quiz'); // 'quiz', 'dictation', 'match'
  const [journalFilter, setJournalFilter] = useState('all');

  // Study Target State
  const [studyWordsList, setStudyWordsList] = useState(null);
  const [studyMode, setStudyMode] = useState('due');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // App Data State
  const [customWords, setCustomWords] = useState(() => getCustomWords());
  const [srsProgress, setSrsProgress] = useState(() => getWordSrsProgress());
  const [favoriteIds, setFavoriteIds] = useState(() => getFavoriteIds());
  const [streakInfo, setStreakInfo] = useState(() => getStreakInfo());
  const [settings, setSettings] = useState(() => getAppSettings());

  const todayStr = getTodayDateString();

  // Seed sample initial custom words if completely empty on first launch
  useEffect(() => {
    if (customWords.length === 0) {
      const sampleWords = [
        {
          id: 'usr_sample_1',
          word: 'significantly',
          pronunciation: 'sig-NIF-i-kơnt-li',
          partOfSpeech: 'adv',
          meaning: 'đáng kể, một cách rõ rệt',
          example: 'Profits grew significantly after the marketing campaign.',
          exampleTranslation: 'Lợi nhuận đã tăng trưởng đáng kể sau chiến dịch tiếp thị.',
          note: 'Từ then chốt thường gặp trong TOEIC Part 5 & 7',
          tags: ['Hôm nay', 'TOEIC Part 5'],
          addedDate: todayStr,
          weekNumber: getWeekNumber(new Date()),
          year: new Date().getFullYear(),
          srs: { repetitions: 0, interval: 0, easeFactor: 2.5, nextReviewDate: todayStr, state: 'new' }
        },
        {
          id: 'usr_sample_2',
          word: 'accommodate',
          pronunciation: 'ơ-KOM-ơ-đêit',
          partOfSpeech: 'verb',
          meaning: 'đáp ứng, cung cấp chỗ ở / chỗ ngồi',
          example: 'The conference room can accommodate up to 200 participants.',
          exampleTranslation: 'Phòng hội nghị có thể đáp ứng tối đa 200 người tham gia.',
          note: 'Collocation: accommodate requests / accommodate needs',
          tags: ['Hôm nay', 'Business TOEIC'],
          addedDate: todayStr,
          weekNumber: getWeekNumber(new Date()),
          year: new Date().getFullYear(),
          srs: { repetitions: 0, interval: 0, easeFactor: 2.5, nextReviewDate: todayStr, state: 'new' }
        },
        {
          id: 'usr_sample_3',
          word: 'ahead of schedule',
          pronunciation: 'ơ-HED ov SKED-juul',
          partOfSpeech: 'phr',
          meaning: 'trước thời hạn, sớm hơn kế hoạch',
          example: 'The engineering team completed the project ahead of schedule.',
          exampleTranslation: 'Đội ngũ kỹ thuật đã hoàn thành dự án trước thời hạn.',
          note: 'Cụm từ rất hay xuất hiện trong TOEIC Listening Part 3 & 4',
          tags: ['Hôm nay', 'TOEIC Phrases'],
          addedDate: todayStr,
          weekNumber: getWeekNumber(new Date()),
          year: new Date().getFullYear(),
          srs: { repetitions: 0, interval: 0, easeFactor: 2.5, nextReviewDate: todayStr, state: 'new' }
        }
      ];
      saveCustomWords(sampleWords);
      setCustomWords(sampleWords);
    }
  }, [customWords.length, todayStr]);

  // Combined all words (built-in sets + custom words with latest SRS applied)
  const allWords = useMemo(() => {
    const list = [];

    // 1. Custom Words
    customWords.forEach(w => {
      const liveSrs = srsProgress[w.id] || w.srs || {
        repetitions: 0,
        interval: 0,
        easeFactor: 2.5,
        nextReviewDate: w.addedDate || todayStr,
        state: 'new'
      };
      list.push({ ...w, srs: liveSrs });
    });

    // 2. Built-in Sets Words
    BUILTIN_SETS.forEach(set => {
      set.words.forEach(w => {
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

  // Words added today
  const todayWords = useMemo(() => {
    return customWords.filter(w => w.addedDate === todayStr);
  }, [customWords, todayStr]);

  // Words added in current week (last 7 days)
  const weekWords = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    return customWords.filter(w => (w.addedDate || '') >= weekAgoStr);
  }, [customWords]);

  // Words due for Spaced Repetition review today
  const dueWords = useMemo(() => {
    return allWords.filter(w => isDueForReview(w, todayStr));
  }, [allWords, todayStr]);

  // Overall SRS Stats
  const srsStats = useMemo(() => {
    return calculateSRSStats(allWords, todayStr);
  }, [allWords, todayStr]);

  // Handlers
  const handleAddWord = (wordData) => {
    const newWord = addCustomWord(wordData);
    setCustomWords(prev => [newWord, ...prev]);
  };

  const handleBatchSave = (batchList) => {
    const created = addBatchCustomWords(batchList);
    setCustomWords(prev => [...created, ...prev]);
  };

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
    }
  };

  const handleUpdateWordSrs = useCallback((wordId, newSrs) => {
    saveWordSrsProgress(wordId, newSrs);
    setSrsProgress(prev => ({ ...prev, [wordId]: newSrs }));
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
  const handleStartSmartCards = (target) => {
    if (Array.isArray(target)) {
      setStudyWordsList(target);
      setStudyMode('custom_list');
    } else {
      setStudyWordsList(null);
      setStudyMode(target || 'due');
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

  const handleStartDictation = () => {
    setStudyWordsList(null);
    setPracticeSubTab('dictation');
    setActiveTab('practice');
  };

  const handleStartMatch = () => {
    setStudyWordsList(null);
    setPracticeSubTab('match');
    setActiveTab('practice');
  };

  const handleNavigateToJournal = (filter = 'all') => {
    setJournalFilter(filter);
    setActiveTab('journal');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        streakInfo={streakInfo}
        dueTodayCount={dueWords.length}
        onOpenAddModal={() => {
          setEditingWord(null);
          setIsAddModalOpen(true);
        }}
        onOpenBatchModal={() => setIsBatchModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6">
        
        {/* 1. Dashboard View */}
        {activeTab === 'dashboard' && (
          <Dashboard
            allWords={allWords}
            customWords={customWords}
            todayWords={todayWords}
            weekWords={weekWords}
            dueWords={dueWords}
            srsStats={srsStats}
            streakInfo={streakInfo}
            onStartSmartCards={handleStartSmartCards}
            onStartQuiz={handleStartQuiz}
            onStartDictation={handleStartDictation}
            onStartMatch={handleStartMatch}
            onOpenAddModal={() => {
              setEditingWord(null);
              setIsAddModalOpen(true);
            }}
            onOpenBatchModal={() => setIsBatchModalOpen(true)}
            onNavigateToJournal={handleNavigateToJournal}
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
            initialFilter={journalFilter}
          />
        )}

        {/* 3. Smart Cards (SRS) View */}
        {activeTab === 'smartcards' && (
          <SmartCards
            allWords={allWords}
            customWords={customWords}
            builtInSets={BUILTIN_SETS}
            onUpdateWordSrs={handleUpdateWordSrs}
            onRecordStudySession={handleRecordSession}
            initialWords={studyWordsList}
            initialMode={studyMode}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {/* 4. Practice Modes (Quiz, Dictation, Match) */}
        {activeTab === 'practice' && (
          <div className="space-y-6">
            
            {/* Sub navigation for practice */}
            <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs max-w-md mx-auto">
              <button
                onClick={() => setPracticeSubTab('quiz')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  practiceSubTab === 'quiz'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Trắc nghiệm (Quiz)</span>
              </button>

              <button
                onClick={() => setPracticeSubTab('dictation')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  practiceSubTab === 'dictation'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PenTool className="w-4 h-4" />
                <span>Luyện gõ</span>
              </button>

              <button
                onClick={() => setPracticeSubTab('match')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  practiceSubTab === 'match'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Ghép từ</span>
              </button>
            </div>

            {/* Practice sub-components */}
            {practiceSubTab === 'quiz' && (
              <QuizMode
                allWords={allWords}
                customWords={customWords}
                builtInSets={BUILTIN_SETS}
                initialWords={studyWordsList}
                onRecordStudySession={handleRecordSession}
                onBackToDashboard={() => setActiveTab('dashboard')}
              />
            )}

            {practiceSubTab === 'dictation' && (
              <DictationMode
                allWords={allWords}
                customWords={customWords}
                builtInSets={BUILTIN_SETS}
                initialWords={studyWordsList}
                onRecordStudySession={handleRecordSession}
                onBackToDashboard={() => setActiveTab('dashboard')}
              />
            )}

            {practiceSubTab === 'match' && (
              <MatchGame
                allWords={allWords}
                customWords={customWords}
                builtInSets={BUILTIN_SETS}
                onRecordStudySession={handleRecordSession}
                onBackToDashboard={() => setActiveTab('dashboard')}
              />
            )}

          </div>
        )}

      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dueTodayCount={dueWords.length}
        onOpenAddModal={() => {
          setEditingWord(null);
          setIsAddModalOpen(true);
        }}
      />

      {/* Add / Edit Word Modal */}
      <WordModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingWord(null);
        }}
        onSave={editingWord ? handleEditWord : handleAddWord}
        editingWord={editingWord}
      />

      {/* Batch Import Words Modal */}
      <BatchImportModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onBatchSave={handleBatchSave}
      />

      {/* Settings Modal */}
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

    </div>
  );
}
