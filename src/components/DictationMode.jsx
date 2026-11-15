import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Volume2, 
  RotateCcw, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  Award, 
  Sparkles, 
  Lightbulb,
  Headphones,
  Check
} from 'lucide-react';
import { speakEnglish, sound } from '../utils/sound';

export default function DictationMode({
  allWords = [],
  customWords = [],
  builtInSets = [],
  initialWords = null,
  onRecordStudySession,
  onBackToDashboard
}) {
  const [selectedSource, setSelectedSource] = useState('all');
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const inputRef = useRef(null);

  // Initialize Queue
  const initQueue = useCallback((source) => {
    let list = [];
    if (Array.isArray(initialWords) && initialWords.length > 0) {
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

    const shuffled = [...list].sort(() => 0.5 - Math.random()).slice(0, 15);
    setQueue(shuffled);
    setCurrentIndex(0);
    setInputVal('');
    setIsAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
    setScore(0);
    setIsCompleted(false);
  }, [allWords, customWords, builtInSets, initialWords]);

  useEffect(() => {
    initQueue(selectedSource);
  }, [selectedSource, initQueue]);

  const currentWord = queue[currentIndex];

  // Auto focus input and speak word on question load
  useEffect(() => {
    if (currentWord) {
      speakEnglish(currentWord.word, 0.9);
      setInputVal('');
      setIsAnswered(false);
      setIsCorrect(false);
      setShowHint(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [currentWord, currentIndex]);

  // Clean string for comparison (ignore cases and leading/trailing spaces)
  const normalize = (str) => {
    return (str || '').trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
  };

  // Submit Answer
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!currentWord || isAnswered) return;

    const userWord = normalize(inputVal);
    const targetWord = normalize(currentWord.word);

    const correct = userWord === targetWord;
    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      sound.playCorrect();
      setScore(prev => prev + 1);
    } else {
      sound.playIncorrect();
    }

    onRecordStudySession(1);
  };

  // Next Question
  const handleNext = () => {
    if (currentIndex + 1 >= queue.length) {
      sound.playVictory();
      setIsCompleted(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  // First letter hint
  const getHintDisplay = () => {
    if (!currentWord) return '';
    return currentWord.word
      .split('')
      .map((char, i) => (i === 0 || char === ' ' ? char : '_'))
      .join(' ');
  };

  if (isCompleted) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-lg space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
              Hoàn thành bài Luyện gõ & Chính tả!
            </h2>
            <p className="text-sm text-slate-500">
              Đúng {score} / {queue.length} từ ({Math.round((score / queue.length) * 100)}%)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => initQueue(selectedSource)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition-all"
            >
              Luyện gõ lượt mới
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
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-8">
      
      {/* Top Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
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
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">
            Từ {currentIndex + 1} / {queue.length}
          </span>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Điểm: {score}
          </span>
        </div>
      </div>

      {/* Dictation Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl space-y-6">
        
        {/* Header Audio & Hint */}
        <div className="text-center space-y-4">
          
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => speakEnglish(currentWord.word, 0.9)}
              className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 hover:scale-105 transition-transform"
              title="Phát âm tiếng Anh"
            >
              <Volume2 className="w-8 h-8" />
            </button>

            <button
              onClick={() => speakEnglish(currentWord.word, 0.65)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Nghe tốc độ chậm"
            >
              Nghe chậm (0.65x)
            </button>
          </div>

          {/* Vietnamese meaning guide */}
          <div className="space-y-1">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Nghĩa tiếng Việt
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800">
              "{currentWord.meaning}"
            </h3>
          </div>

          {/* Optional hint */}
          {showHint && (
            <div className="text-sm font-mono tracking-widest text-indigo-600 bg-indigo-50 py-2 px-4 rounded-xl border border-indigo-200 inline-block">
              {getHintDisplay()}
            </div>
          )}

        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
          
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              disabled={isAnswered}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Gõ từ vựng tiếng Anh vào đây..."
              className={`w-full px-5 py-4 text-center text-lg sm:text-xl font-bold rounded-2xl border transition-all focus:outline-none ${
                isAnswered
                  ? isCorrect
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                    : 'bg-rose-50 border-rose-400 text-rose-800'
                  : 'bg-slate-50 border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10'
              }`}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            {!showHint && !isAnswered && (
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-semibold"
              >
                <Lightbulb className="w-4 h-4" />
                Gợi ý chữ cái đầu
              </button>
            )}

            {!isAnswered ? (
              <button
                type="submit"
                disabled={!inputVal.trim()}
                className="ml-auto px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-sm transition-all"
              >
                Kiểm tra (Enter)
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span>{currentIndex + 1 >= queue.length ? 'Xem kết quả' : 'Từ tiếp theo'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </form>

        {/* Answer Reveal when answered */}
        {isAnswered && (
          <div className={`p-4 rounded-2xl border text-xs sm:text-sm text-center space-y-2 animate-fadeIn ${
            isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <p className="font-bold text-base">
              {isCorrect ? '🎉 Tuyệt vời! Bạn đã gõ hoàn toàn chính xác!' : `❌ Chưa chính xác. Đáp án đúng là: ${currentWord.word}`}
            </p>
            {currentWord.example && (
              <p className="text-slate-600 italic">
                "{currentWord.example}"
              </p>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
