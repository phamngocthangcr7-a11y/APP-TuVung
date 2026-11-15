import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Volume2, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight, 
  Award, 
  Lightbulb,
  Headphones,
  Gamepad2
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

  const sanitize = (list) => {
    if (!Array.isArray(list)) return [];
    return list.filter(w => w && typeof w === 'object' && w.word && String(w.word).trim() !== '' && String(w.word).trim() !== '-');
  };

  const initQueue = useCallback((source) => {
    let list = [];
    if (Array.isArray(initialWords) && initialWords.length > 0) {
      list = [...initialWords];
    } else if (source === 'today') {
      const today = new Date().toISOString().split('T')[0];
      list = (customWords || []).filter(w => w && w.addedDate === today);
      if (list.length === 0) list = allWords.slice(0, 15);
    } else if (source === 'custom') {
      list = (customWords || []).length > 0 ? customWords : allWords.slice(0, 15);
    } else if (typeof source === 'string' && source.startsWith('set_')) {
      const set = (builtInSets || []).find(s => s.id === source);
      list = set && set.words ? set.words : allWords.slice(0, 15);
    } else {
      list = allWords;
    }

    const clean = sanitize(list);
    const shuffled = clean.sort(() => 0.5 - Math.random()).slice(0, 15);
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

  useEffect(() => {
    if (currentWord && currentWord.word) {
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

  const normalize = (str) => {
    return (str || '').trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
  };

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

    if (onRecordStudySession) {
      onRecordStudySession(1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= queue.length) {
      sound.playVictory();
      setIsCompleted(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const getHintDisplay = () => {
    if (!currentWord || !currentWord.word) return '';
    return String(currentWord.word)
      .split('')
      .map((char, i) => (i === 0 || char === ' ' ? char : '_'))
      .join(' ');
  };

  if (isCompleted) {
    return (
      <div className="max-w-lg mx-auto py-10 px-4 text-center">
        <div className="bg-[#FFFDF9] rounded-3xl p-8 border border-[#EAE5DC] shadow-md space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-[#1E293B]">
              Hoàn thành bài Luyện gõ chính tả!
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Đúng {score} / {queue.length} từ ({queue.length > 0 ? Math.round((score / queue.length) * 100) : 0}%)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <button
              onClick={() => initQueue(selectedSource)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-[#2B4C7E] hover:bg-[#1E365B] text-white shadow-xs transition-all"
            >
              Luyện gõ lượt mới
            </button>
            <button
              onClick={onBackToDashboard}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold text-xs bg-[#EFECE4] text-[#1E293B] hover:bg-[#E3DFD5] transition-colors"
            >
              Về SmartCards
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentWord || queue.length === 0) {
    return (
      <div className="max-w-md mx-auto my-8 p-6 bg-[#FFFDF9] rounded-3xl border border-[#EAE5DC] text-center space-y-3">
        <Gamepad2 className="w-8 h-8 text-[#64748B] mx-auto" />
        <h3 className="font-bold text-sm text-[#1E293B]">Đang tải từ vựng luyện gõ...</h3>
        <p className="text-xs text-[#64748B]">Vui lòng đợi giây lát hoặc chọn bộ từ khác.</p>
        <button
          onClick={() => initQueue('all')}
          className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#2B4C7E]"
        >
          Tải lại bài luyện gõ
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-16">
      
      {/* Top Toolbar */}
      <div className="bg-[#FFFDF9] rounded-2xl p-3 sm:p-4 border border-[#EAE5DC] shadow-xs flex items-center justify-between">
        <select
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
          className="text-xs font-bold text-[#1E293B] bg-[#F7F4EB] border border-[#E0D9CC] rounded-xl px-2.5 py-1.5 focus:outline-none"
        >
          <option value="all">📚 Tất cả từ vựng</option>
          <option value="today">📅 Từ nạp hôm nay</option>
          <option value="custom">📝 Toàn bộ từ tự thêm</option>
          <optgroup label="Bộ từ TOEIC có sẵn">
            {(builtInSets || []).map(s => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </optgroup>
        </select>

        <div className="flex items-center gap-2 text-xs font-bold text-[#64748B]">
          <span>Từ {currentIndex + 1} / {queue.length}</span>
          <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Điểm: {score}
          </span>
        </div>
      </div>

      {/* Dictation Box */}
      <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border border-[#EAE5DC] shadow-md space-y-5">
        
        <div className="text-center space-y-3">
          
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => speakEnglish(currentWord.word, 0.9)}
              className="w-14 h-14 rounded-2xl bg-[#2B4C7E] text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform"
              title="Phát âm tiếng Anh"
            >
              <Volume2 className="w-7 h-7" />
            </button>

            <button
              onClick={() => speakEnglish(currentWord.word, 0.65)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[#F7F4EB] hover:bg-[#EAE5DC] text-[#4A453E] border border-[#E0D9CC]"
              title="Nghe chậm"
            >
              Nghe chậm (0.65x)
            </button>
          </div>

          <div className="space-y-0.5">
            <p className="text-[11px] font-bold text-[#2B4C7E] uppercase tracking-wider">
              Nghĩa tiếng Việt
            </p>
            <h3 className="text-lg sm:text-2xl font-black text-[#1E293B]">
              "{currentWord.meaning}"
            </h3>
          </div>

          {showHint && (
            <div className="text-sm font-mono tracking-widest text-[#2B4C7E] bg-blue-50 py-1.5 px-3 rounded-xl border border-blue-200 inline-block">
              {getHintDisplay()}
            </div>
          )}

        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3 max-w-sm mx-auto">
          
          <input
            ref={inputRef}
            type="text"
            disabled={isAnswered}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Gõ từ vựng tiếng Anh..."
            className={`w-full px-4 py-3 text-center text-lg font-bold rounded-2xl border transition-all focus:outline-none ${
              isAnswered
                ? isCorrect
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                  : 'bg-rose-50 border-rose-400 text-rose-900'
                : 'bg-[#F7F4EB] border-[#DCD6C9] focus:bg-white focus:border-[#2B4C7E]'
            }`}
          />

          <div className="flex items-center justify-between gap-2">
            {!showHint && !isAnswered && (
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="flex items-center gap-1 text-xs text-amber-700 hover:underline font-semibold"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                Gợi ý
              </button>
            )}

            {!isAnswered ? (
              <button
                type="submit"
                disabled={!inputVal.trim()}
                className="ml-auto px-5 py-2 rounded-xl font-bold text-xs bg-[#2B4C7E] hover:bg-[#1E365B] disabled:opacity-50 text-white shadow-xs transition-all"
              >
                Kiểm tra (Enter)
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#2B4C7E] hover:bg-[#1E365B] text-white shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <span>{currentIndex + 1 >= queue.length ? 'Xem kết quả' : 'Từ tiếp theo'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </form>

        {isAnswered && (
          <div className={`p-3 rounded-2xl border text-xs text-center space-y-1 animate-fadeIn ${
            isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}>
            <p className="font-bold text-sm">
              {isCorrect ? '🎉 Tuyệt vời! Bạn đã gõ đúng!' : `❌ Đáp án đúng là: ${currentWord.word}`}
            </p>
            {currentWord.example && (
              <p className="text-[#64748B] italic">"{currentWord.example}"</p>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
