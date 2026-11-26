import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Volume2, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Award, 
  Headphones, 
  Sparkles,
  Gamepad2
} from 'lucide-react';
import { speakEnglish, sound, stopSpeaking } from '../utils/sound';
import { CURATED_TOEIC_EXAMPLES, isBadTemplateSentence } from '../utils/dictionary';

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

  // Sanitize word list
  const sanitize = (list) => {
    if (!Array.isArray(list)) return [];
    return list.filter(w => w && typeof w === 'object' && w.word && String(w.word).trim() !== '' && String(w.word).trim() !== '-');
  };

  // Initialize Quiz Queue
  const initQuiz = useCallback((source, wordsToUse = null) => {
    let list = [];

    if (wordsToUse && wordsToUse.length > 0) {
      list = [...wordsToUse];
    } else if (Array.isArray(initialWords) && initialWords.length > 0) {
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

    let clean = sanitize(list);

    // Nếu ít hơn 4 từ, bù thêm từ allWords để có đủ 4 lựa chọn
    if (clean.length < 4 && allWords.length >= 4) {
      const extra = sanitize(allWords).filter(w => !clean.some(item => item.id === w.id));
      clean = [...clean, ...extra.slice(0, 4 - clean.length)];
    }

    const shuffled = clean.sort(() => 0.5 - Math.random()).slice(0, 20);
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
    if (!currentWord || quizQueue.length === 0) {
      setOptions([]);
      return;
    }

    const cleanAll = sanitize(allWords);
    const wrongOptions = cleanAll
      .filter(w => w && w.id !== currentWord.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const fullOptions = [...wrongOptions, currentWord].sort(() => 0.5 - Math.random());
    setOptions(fullOptions);
    setSelectedOption(null);
    setIsAnswered(false);

    if (quizType === 'listening' && currentWord?.word) {
      speakEnglish(currentWord.word);
    }
    return stopSpeaking;
  }, [currentWord, allWords, quizType, quizQueue.length]);

  // Handle Option Selection
  const handleSelectOption = (opt) => {
    if (isAnswered || !currentWord || !opt) return;

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

    if (onRecordStudySession) {
      onRecordStudySession(1);
    }
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

  // Helper function to safely blank out word in sentence for cloze test
  const getClozeData = (wordObj) => {
    if (!wordObj) return { sentence: '', translation: '' };
    const rawWord = String(wordObj.word || '').trim();
    let example = String(wordObj.example || '').trim();
    let translation = wordObj.exampleTranslation || wordObj.meaning || '';

    if (isBadTemplateSentence(example, translation)) {
      example = '';
      translation = wordObj.meaning || '';
    }

    if (!example) {
      const curated = CURATED_TOEIC_EXAMPLES[rawWord.toLowerCase()];
      if (curated) {
        example = curated.example;
        if (!wordObj.exampleTranslation) translation = curated.translation;
      }
    }

    const escapeReg = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // 1. Check if word starts with "be " (e.g. "be accustomed to", "be aware of")
    if (/^be\s+/i.test(rawWord)) {
      const core = rawWord.replace(/^be\s+/i, '').trim();
      const beRegex = new RegExp(`\\b(be|am|is|are|was|were|been|being)\\s+${escapeReg(core)}\\b`, 'gi');
      if (beRegex.test(example)) {
        return {
          sentence: example.replace(beRegex, (m, verb) => `${verb} [ ______ ]`),
          translation
        };
      }
      const coreRegex = new RegExp(`\\b${escapeReg(core)}\\b`, 'gi');
      if (coreRegex.test(example)) {
        return {
          sentence: example.replace(coreRegex, '[ ______ ]'),
          translation
        };
      }
    }

    // 2. Check if word starts with "to "
    if (/^to\s+/i.test(rawWord)) {
      const core = rawWord.replace(/^to\s+/i, '').trim();
      const coreRegex = new RegExp(`\\b${escapeReg(core)}\\b`, 'gi');
      if (coreRegex.test(example)) {
        return {
          sentence: example.replace(coreRegex, '[ ______ ]'),
          translation
        };
      }
    }

    // 3. Direct match with word boundaries
    const exactRegex = new RegExp(`\\b${escapeReg(rawWord)}\\b`, 'gi');
    if (exactRegex.test(example)) {
      return {
        sentence: example.replace(exactRegex, '[ ______ ]'),
        translation
      };
    }

    // 4. Loose match
    const looseRegex = new RegExp(escapeReg(rawWord), 'gi');
    if (looseRegex.test(example)) {
      return {
        sentence: example.replace(looseRegex, '[ ______ ]'),
        translation
      };
    }

    // 5. Match tokens/stems for compound phrases or inflections
    const tokens = rawWord.split(/\s+/).filter(t => t.length >= 4);
    for (const token of tokens) {
      const tokenRegex = new RegExp(`\\b${escapeReg(token)}[a-z]*\\b`, 'gi');
      if (tokenRegex.test(example)) {
        return {
          sentence: example.replace(tokenRegex, '[ ______ ]'),
          translation
        };
      }
    }

    // Fallback: Never display the sentence with target word visible
    return {
      sentence: `Điền từ còn thiếu: " [ ______ ] "`,
      translation
    };
  };

  // Render question
  const renderQuestion = () => {
    if (!currentWord) return null;

    if (quizType === 'listening') {
      return (
        <div className="text-center py-4 space-y-3">
          <button
            onClick={() => speakEnglish(currentWord.word)}
            className="w-16 h-16 rounded-2xl bg-[#2B4C7E] text-white flex items-center justify-center mx-auto shadow-md transition-all active:scale-95 group"
          >
            <Headphones className="w-8 h-8 group-hover:scale-110 transition-transform" />
          </button>
          <p className="text-xs sm:text-sm font-semibold text-[#64748B]">
            Bấm vào tai nghe để nghe phát âm và chọn nghĩa tiếng Việt đúng
          </p>
        </div>
      );
    }

    if (quizType === 'meaning_to_word') {
      return (
        <div className="text-center py-4 space-y-2">
          <span className="text-xs font-bold text-[#2B4C7E] bg-blue-50 px-3 py-1 rounded-full">
            Chọn từ tiếng Anh phù hợp với nghĩa:
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1E293B] mt-2">
            "{currentWord.meaning}"
          </h2>
          {currentWord.exampleTranslation && (
            <p className="text-xs text-[#64748B] italic max-w-md mx-auto">
              Ngữ cảnh: {currentWord.exampleTranslation}
            </p>
          )}
        </div>
      );
    }

    if (quizType === 'cloze') {
      const cloze = getClozeData(currentWord);
      return (
        <div className="text-center py-4 space-y-2">
          <span className="text-xs font-bold text-[#2B4C7E] bg-blue-50 px-3 py-1 rounded-full">
            Điền từ còn thiếu vào câu TOEIC:
          </span>
          <p className="text-base sm:text-lg font-bold text-[#1E293B] leading-relaxed max-w-lg mx-auto">
            "{cloze.sentence}"
          </p>
          <p className="text-xs text-[#64748B] italic">
            Nghĩa câu: {cloze.translation}
          </p>
        </div>
      );
    }

    // Default: word_to_meaning
    return (
      <div className="text-center py-4 space-y-2">
        <span className="text-xs font-bold text-[#2B4C7E] bg-blue-50 px-3 py-1 rounded-full">
          Nghĩa của từ vựng này là gì?
        </span>
        <div className="flex items-center justify-center gap-2 mt-2">
          <h2 className="text-3xl sm:text-4xl font-black text-[#1E293B]">
            {currentWord.word}
          </h2>
          <button
            onClick={() => speakEnglish(currentWord.word)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
        {currentWord.pronunciation && (
          <p className="text-xs text-[#64748B] font-mono">/{currentWord.pronunciation}/</p>
        )}
      </div>
    );
  };

  // Màn hình kết quả khi hoàn thành
  if (isCompleted) {
    const percentage = quizQueue.length > 0 ? Math.round((score / quizQueue.length) * 100) : 0;

    return (
      <div className="max-w-lg mx-auto py-10 px-4 text-center">
        <div className="bg-[#FFFDF9] rounded-3xl p-8 border border-[#EAE5DC] shadow-md space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-[#1E293B]">
              Kết quả bài luyện tập Quiz
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Đúng {score} / {quizQueue.length} câu ({percentage}%)
            </p>
          </div>

          <div className="w-full bg-[#EAE5DC] rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-[#2B4C7E] h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          {mistakes.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-left">
              <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-1.5">
                Các từ cần ôn lại ({mistakes.length} từ):
              </h4>
              <div className="flex flex-wrap gap-1">
                {mistakes.map(w => (
                  <span key={w.id} className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-white text-rose-700 border border-rose-200">
                    {w.word}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            {mistakes.length > 0 && (
              <button
                onClick={handleRetryMistakes}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all"
              >
                Làm lại câu sai ({mistakes.length})
              </button>
            )}
            <button
              onClick={() => initQuiz(selectedSource)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs bg-[#2B4C7E] hover:bg-[#1E365B] text-white shadow-xs transition-all"
            >
              Làm bài kiểm tra mới
            </button>
            <button
              onClick={onBackToDashboard}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold text-xs bg-[#EFECE4] text-[#1E293B] hover:bg-[#E3DFD5] transition-colors"
            >
              Về SmartCards
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Nếu chưa có từ nào
  if (!currentWord || quizQueue.length === 0) {
    return (
      <div className="max-w-md mx-auto my-8 p-6 bg-[#FFFDF9] rounded-3xl border border-[#EAE5DC] text-center space-y-3">
        <Gamepad2 className="w-8 h-8 text-[#64748B] mx-auto" />
        <h3 className="font-bold text-sm text-[#1E293B]">Đang chuẩn bị câu hỏi trắc nghiệm...</h3>
        <p className="text-xs text-[#64748B]">Vui lòng đợi trong giây lát hoặc chọn một bộ từ khác.</p>
        <button
          onClick={() => initQuiz('all')}
          className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#2B4C7E]"
        >
          Tải lại bài trắc nghiệm
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-28 sm:pb-16">
      
      {/* Top Toolbar */}
      <div className="bg-[#FFFDF9] rounded-2xl p-3 sm:p-4 border border-[#EAE5DC] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        
        <div className="flex flex-wrap items-center gap-2">
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

          <select
            value={quizType}
            onChange={(e) => setQuizType(e.target.value)}
            className="text-xs font-bold text-[#1E293B] bg-[#F7F4EB] border border-[#E0D9CC] rounded-xl px-2.5 py-1.5 focus:outline-none"
          >
            <option value="word_to_meaning">Từ -> Nghĩa tiếng Việt</option>
            <option value="meaning_to_word">Nghĩa -> Chọn từ tiếng Anh</option>
            <option value="listening">Luyện nghe (Listening Quiz)</option>
            <option value="cloze">Điền vào câu TOEIC</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-[#64748B]">
          <span>Câu {currentIndex + 1} / {quizQueue.length}</span>
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Điểm: {score}
          </span>
        </div>

      </div>

      {/* QUESTION CARD */}
      <div className="bg-[#FFFDF9] rounded-3xl p-5 sm:p-7 border border-[#EAE5DC] shadow-md space-y-5">
        
        {renderQuestion()}

        {/* 4 MULTIPLE CHOICE OPTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {options.map((opt, index) => {
            if (!opt) return null;
            const isSelected = selectedOption === opt.id;
            const isCorrect = opt.id === currentWord.id;

            let buttonClass = 'bg-[#FAF8F5] hover:bg-[#F2EFE8] text-[#1E293B] border-[#E8E2D6]';

            if (isAnswered) {
              if (isCorrect) {
                buttonClass = 'bg-emerald-50 text-emerald-900 border-emerald-400 font-bold';
              } else if (isSelected) {
                buttonClass = 'bg-rose-50 text-rose-900 border-rose-400 font-bold';
              } else {
                buttonClass = 'bg-[#FAF8F5] text-slate-400 border-[#E8E2D6] opacity-60';
              }
            }

            const label = ['A', 'B', 'C', 'D'][index];
            const isEnglishOption = quizType === 'meaning_to_word' || quizType === 'cloze';
            const textToDisplay = isEnglishOption ? opt.word : opt.meaning;

            return (
              <button
                key={opt.id}
                disabled={isAnswered}
                onClick={() => handleSelectOption(opt)}
                className={`flex items-center gap-2.5 p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all shadow-xs ${buttonClass}`}
              >
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                  isAnswered && isCorrect 
                    ? 'bg-emerald-600 text-white' 
                    : isAnswered && isSelected 
                    ? 'bg-rose-600 text-white' 
                    : 'bg-white text-[#1E293B] border border-[#E0D9CC]'
                }`}>
                  {label}
                </span>
                <span className="flex-1 leading-snug">{textToDisplay}</span>
              </button>
            );
          })}
        </div>

        {/* FEEDBACK BOX */}
        {isAnswered && (
          <div className={`p-3.5 rounded-2xl border text-xs space-y-1.5 animate-fadeIn ${
            selectedOption === currentWord.id 
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900' 
              : 'bg-rose-50/80 border-rose-300 text-rose-900'
          }`}>
            <div className="flex items-center gap-1.5 font-bold">
              {selectedOption === currentWord.id ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Chính xác! Làm rất tốt!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Chưa đúng! Đáp án đúng là: <strong>{(quizType === 'meaning_to_word' || quizType === 'cloze') ? currentWord.word : currentWord.meaning}</strong></span>
                </>
              )}
            </div>

            {currentWord.example && (
              <div className="pt-1 text-[#2C2A29] bg-white/70 p-2 rounded-xl border border-slate-200/50">
                <p className="font-semibold">💬 {currentWord.example}</p>
                {currentWord.exampleTranslation && (
                  <p className="text-[#64748B] italic mt-0.5">👉 {currentWord.exampleTranslation}</p>
                )}
              </div>
            )}

            <div className="pt-1 flex justify-end">
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2B4C7E] hover:bg-[#1E365B] shadow-xs"
              >
                <span>{currentIndex + 1 >= quizQueue.length ? 'Xem kết quả' : 'Câu tiếp theo'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
