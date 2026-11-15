import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Volume2, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Award, 
  HelpCircle, 
  Headphones, 
  Sparkles,
  Gamepad2
} from 'lucide-react';
import { speakEnglish, sound } from '../utils/sound';

export default function QuizMode({
  allWords = [],
  customWords = [],
  builtInSets = [],
  initialWords = null,
  onRecordStudySession,
  onBackToDashboard
}) {
  const [selectedSource, setSelectedSource] = useState('all');
  const [quizQueue, setQuizQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [quizType, setQuizType] = useState('word_to_meaning'); // 'word_to_meaning', 'meaning_to_word', 'listening', 'cloze'

  // Initialize Quiz Queue
  const initQuiz = useCallback((source, wordsToUse = null) => {
    let list = [];

    if (wordsToUse && wordsToUse.length > 0) {
      list = [...wordsToUse];
    } else if (Array.isArray(initialWords) && initialWords.length > 0) {
      list = [...initialWords];
    } else if (source === 'today') {
      const today = new Date().toISOString().split('T')[0];
      list = customWords.filter(w => w.addedDate === today);
      if (list.length === 0) list = allWords.slice(0, 15);
    } else if (source === 'custom') {
      list = customWords.length > 0 ? [...customWords] : allWords.slice(0, 15);
    } else if (source.startsWith('set_')) {
      const set = builtInSets.find(s => s.id === source);
      list = set ? [...set.words] : allWords.slice(0, 15);
    } else {
      list = [...allWords];
    }

    if (list.length < 4) {
      // Pad with words from allWords to ensure at least 4 options
      const extra = allWords.filter(w => !list.some(item => item.id === w.id));
      list = [...list, ...extra.slice(0, 4 - list.length)];
    }

    const shuffled = [...list].sort(() => 0.5 - Math.random()).slice(0, 20); // 20 questions max per quiz
    setQuizQueue(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setMistakes([]);
    setIsAnswered(false);
    setSelectedOption(null);
    setIsCompleted(false);
  }, [allWords, customWords, builtInSets, initialWords]);

  useEffect(() => {
    initQuiz(selectedSource);
  }, [selectedSource, initQuiz]);

  const currentWord = quizQueue[currentIndex];

  // Generate 4 options whenever currentWord changes
  useEffect(() => {
    if (!currentWord || quizQueue.length === 0) return;

    // Pick 3 wrong options from allWords
    const wrongOptions = allWords
      .filter(w => w.id !== currentWord.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const fullOptions = [...wrongOptions, currentWord].sort(() => 0.5 - Math.random());
    setOptions(fullOptions);
    setSelectedOption(null);
    setIsAnswered(false);

    // If listening quiz, auto speak
    if (quizType === 'listening') {
      speakEnglish(currentWord.word, 0.9);
    }
  }, [currentWord, allWords, quizType]);

  // Handle Option Selection
  const handleSelectOption = (opt) => {
    if (isAnswered) return;

    const isCorrect = opt.id === currentWord.id;
    setSelectedOption(opt.id);
    setIsAnswered(true);

    if (isCorrect) {
      sound.playCorrect();
      setScore(prev => prev + 1);
    } else {
      sound.playIncorrect();
      setMistakes(prev => [...prev, currentWord]);
    }

    onRecordStudySession(1);
  };

  // Next Question
  const handleNext = () => {
    if (currentIndex + 1 >= quizQueue.length) {
      sound.playVictory();
      setIsCompleted(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  // Review mistakes
  const handleRetryMistakes = () => {
    if (mistakes.length === 0) return;
    initQuiz(selectedSource, mistakes);
  };

  // Render question content
  const renderQuestion = () => {
    if (!currentWord) return null;

    if (quizType === 'listening') {
      return (
        <div className="text-center py-6 space-y-3">
          <button
            onClick={() => speakEnglish(currentWord.word, 0.9)}
            className="w-20 h-20 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-md transition-all active:scale-95 group"
          >
            <Headphones className="w-10 h-10 group-hover:scale-110 transition-transform" />
          </button>
          <p className="text-sm font-semibold text-slate-600">
            Bấm vào tai nghe để nghe lại phát âm và chọn nghĩa tiếng Việt tương ứng
          </p>
        </div>
      );
    }

    if (quizType === 'meaning_to_word') {
      return (
        <div className="text-center py-4 space-y-2">
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            Chọn từ tiếng Anh phù hợp với nghĩa:
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            "{currentWord.meaning}"
          </h2>
          {currentWord.exampleTranslation && (
            <p className="text-xs text-slate-500 italic max-w-md mx-auto">
              Ngữ cảnh: {currentWord.exampleTranslation}
            </p>
          )}
        </div>
      );
    }

    if (quizType === 'cloze' && currentWord.example) {
      const clozeText = currentWord.example.replace(
        new RegExp(currentWord.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
        '[ ______ ]'
      );
      return (
        <div className="text-center py-4 space-y-3">
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            Điền từ còn thiếu vào câu TOEIC:
          </span>
          <p className="text-base sm:text-xl font-bold text-slate-900 leading-relaxed max-w-xl mx-auto">
            "{clozeText}"
          </p>
          <p className="text-xs text-slate-500 italic">
            Nghĩa tiếng Việt câu: {currentWord.exampleTranslation || currentWord.meaning}
          </p>
        </div>
      );
    }

    // Default: word_to_meaning
    return (
      <div className="text-center py-4 space-y-2">
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
          Nghĩa của từ vựng này là gì?
        </span>
        <div className="flex items-center justify-center gap-2 mt-2">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
            {currentWord.word}
          </h2>
          <button
            onClick={() => speakEnglish(currentWord.word, 0.9)}
            className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
        {currentWord.pronunciation && (
          <p className="text-xs text-slate-500 font-mono">/{currentWord.pronunciation}/</p>
        )}
      </div>
    );
  };

  // Completion Screen
  if (isCompleted) {
    const percentage = Math.round((score / quizQueue.length) * 100);

    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-lg space-y-6">
          <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
              Kết quả bài luyện tập Quiz
            </h2>
            <p className="text-sm text-slate-500">
              Đúng {score} / {quizQueue.length} câu ({percentage}%)
            </p>
          </div>

          {/* Score percentage circle / bar */}
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                percentage >= 80 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-blue-500' : 'bg-amber-500'
              }`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          {mistakes.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-left">
              <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-2">
                Các từ cần ôn lại ({mistakes.length} từ):
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {mistakes.map(w => (
                  <span key={w.id} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white text-rose-700 border border-rose-200 shadow-2xs">
                    {w.word}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {mistakes.length > 0 && (
              <button
                onClick={handleRetryMistakes}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all"
              >
                Làm lại các câu sai ({mistakes.length})
              </button>
            )}
            <button
              onClick={() => initQuiz(selectedSource)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
            >
              Làm bài kiểm tra mới
            </button>
            <button
              onClick={onBackToDashboard}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Về Trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-8">
      
      {/* Quiz Top Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Source & Type Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none"
          >
            <option value="all">📚 Tất cả từ vựng</option>
            <option value="today">📅 Từ nạp hôm nay</option>
            <option value="custom">📝 Toàn bộ từ tự thêm</option>
            <optgroup label="Bộ từ TOEIC có sẵn">
              {builtInSets.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </optgroup>
          </select>

          <select
            value={quizType}
            onChange={(e) => setQuizType(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none"
          >
            <option value="word_to_meaning">Từ -> Nghĩa tiếng Việt</option>
            <option value="meaning_to_word">Nghĩa -> Chọn từ tiếng Anh</option>
            <option value="listening">Luyện nghe (Listening Quiz)</option>
            <option value="cloze">Điền vào câu TOEIC</option>
          </select>
        </div>

        {/* Question Counter */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-600">
            Câu {currentIndex + 1} / {quizQueue.length}
          </span>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Điểm: {score}
          </span>
        </div>

      </div>

      {/* QUESTION CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-lg space-y-6">
        
        {/* Render question based on type */}
        {renderQuestion()}

        {/* 4 MULTIPLE CHOICE OPTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {options.map((opt, index) => {
            const isSelected = selectedOption === opt.id;
            const isCorrect = opt.id === currentWord.id;

            let buttonClass = 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/90';

            if (isAnswered) {
              if (isCorrect) {
                buttonClass = 'bg-emerald-50 text-emerald-800 border-emerald-400 font-bold ring-2 ring-emerald-400/20';
              } else if (isSelected) {
                buttonClass = 'bg-rose-50 text-rose-800 border-rose-400 font-bold ring-2 ring-rose-400/20';
              } else {
                buttonClass = 'bg-slate-50 text-slate-400 border-slate-200 opacity-60';
              }
            }

            const label = ['A', 'B', 'C', 'D'][index];
            const textToDisplay = quizType === 'meaning_to_word' ? opt.word : opt.meaning;

            return (
              <button
                key={opt.id}
                disabled={isAnswered}
                onClick={() => handleSelectOption(opt)}
                className={`flex items-center gap-3 p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all transform active:scale-98 shadow-xs ${buttonClass}`}
              >
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                  isAnswered && isCorrect 
                    ? 'bg-emerald-600 text-white' 
                    : isAnswered && isSelected 
                    ? 'bg-rose-600 text-white' 
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}>
                  {label}
                </span>
                <span className="flex-1 leading-snug">{textToDisplay}</span>
              </button>
            );
          })}
        </div>

        {/* EXPLANATION / FEEDBACK BOX */}
        {isAnswered && (
          <div className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-2 animate-fadeIn ${
            selectedOption === currentWord.id 
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
              : 'bg-rose-50/70 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-2 font-bold">
              {selectedOption === currentWord.id ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Chính xác! Làm rất tốt!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span>Chưa đúng! Đáp án đúng là: <strong>{quizType === 'meaning_to_word' ? currentWord.word : currentWord.meaning}</strong></span>
                </>
              )}
            </div>

            {currentWord.example && (
              <div className="pt-1 text-slate-700 bg-white/60 p-2.5 rounded-xl border border-slate-200/50">
                <p className="font-semibold text-slate-900">💬 {currentWord.example}</p>
                {currentWord.exampleTranslation && (
                  <p className="text-slate-500 italic mt-0.5">👉 {currentWord.exampleTranslation}</p>
                )}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all transform active:scale-95"
              >
                <span>{currentIndex + 1 >= quizQueue.length ? 'Xem kết quả' : 'Câu tiếp theo'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
