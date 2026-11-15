import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Clock, Award, Sparkles, Gamepad2, ArrowRight } from 'lucide-react';
import { speakEnglish, sound } from '../utils/sound';

export default function MatchGame({
  allWords = [],
  customWords = [],
  builtInSets = [],
  onRecordStudySession,
  onBackToDashboard
}) {
  const [selectedSource, setSelectedSource] = useState('all');
  const [cards, setCards] = useState([]);
  const [selectedFirst, setSelectedFirst] = useState(null);
  const [selectedSecond, setSelectedSecond] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Initialize Game
  const startNewGame = useCallback((source) => {
    let list = [];
    if (source === 'today') {
      const today = new Date().toISOString().split('T')[0];
      list = customWords.filter(w => w.addedDate === today);
      if (list.length < 6) list = allWords.slice(0, 10);
    } else if (source === 'custom') {
      list = customWords.length >= 6 ? customWords : allWords.slice(0, 10);
    } else if (source.startsWith('set_')) {
      const set = builtInSets.find(s => s.id === source);
      list = set ? set.words : allWords.slice(0, 10);
    } else {
      list = allWords;
    }

    // Pick 6 random words
    const picked = [...list].sort(() => 0.5 - Math.random()).slice(0, 6);

    // Create 12 cards
    const cardItems = [];
    picked.forEach(w => {
      cardItems.push({
        id: `en_${w.id}`,
        wordId: w.id,
        text: w.word,
        lang: 'en'
      });
      cardItems.push({
        id: `vi_${w.id}`,
        wordId: w.id,
        text: w.meaning,
        lang: 'vi'
      });
    });

    const shuffled = cardItems.sort(() => 0.5 - Math.random());
    setCards(shuffled);
    setMatchedIds([]);
    setSelectedFirst(null);
    setSelectedSecond(null);
    setTimer(0);
    setIsTimerRunning(true);
    setIsCompleted(false);
  }, [allWords, customWords, builtInSets]);

  useEffect(() => {
    startNewGame(selectedSource);
  }, [selectedSource, startNewGame]);

  // Timer interval
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Handle card click
  const handleCardClick = (card) => {
    if (matchedIds.includes(card.wordId)) return;
    if (selectedFirst && selectedFirst.id === card.id) return;
    if (selectedFirst && selectedSecond) return; // Busy checking

    if (card.lang === 'en') {
      speakEnglish(card.text, 1.0);
    }

    if (!selectedFirst) {
      setSelectedFirst(card);
    } else {
      setSelectedSecond(card);

      // Check match
      if (selectedFirst.wordId === card.wordId && selectedFirst.lang !== card.lang) {
        sound.playCorrect();
        setTimeout(() => {
          setMatchedIds(prev => {
            const updated = [...prev, card.wordId];
            if (updated.length === 6) {
              sound.playVictory();
              setIsTimerRunning(false);
              setIsCompleted(true);
              onRecordStudySession(6);
            }
            return updated;
          });
          setSelectedFirst(null);
          setSelectedSecond(null);
        }, 300);
      } else {
        sound.playIncorrect();
        setTimeout(() => {
          setSelectedFirst(null);
          setSelectedSecond(null);
        }, 800);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (isCompleted) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-lg space-y-6">
          <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <Award className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
              Hoàn thành xuất sắc!
            </h2>
            <p className="text-sm text-slate-500">
              Bạn đã ghép thành công 6 cặp từ trong thời gian: <strong className="text-blue-600 text-base">{formatTime(timer)}</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => startNewGame(selectedSource)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition-all"
            >
              Chơi ván mới
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
          <Gamepad2 className="w-5 h-5 text-amber-500" />
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

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>{formatTime(timer)}</span>
          </div>

          <button
            onClick={() => startNewGame(selectedSource)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Làm mới game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of 12 Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {cards.map(card => {
          const isMatched = matchedIds.includes(card.wordId);
          const isSelected = (selectedFirst && selectedFirst.id === card.id) || (selectedSecond && selectedSecond.id === card.id);
          const isWrong = selectedSecond && isSelected && selectedFirst.wordId !== selectedSecond.wordId;

          if (isMatched) {
            return (
              <div 
                key={card.id} 
                className="h-24 sm:h-28 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 opacity-40 flex items-center justify-center pointer-events-none"
              >
                <span className="text-xs text-slate-400 font-semibold">✓ Đã ghép</span>
              </div>
            );
          }

          let style = 'bg-white text-slate-800 border-slate-200/90 hover:border-blue-300 hover:shadow-md';
          if (isSelected) {
            style = isWrong 
              ? 'bg-rose-50 border-rose-400 text-rose-800 shadow-md animate-shake' 
              : 'bg-blue-600 text-white border-blue-600 shadow-lg scale-102';
          }

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`h-24 sm:h-28 rounded-2xl p-3 border font-bold text-xs sm:text-sm flex items-center justify-center text-center transition-all transform active:scale-95 shadow-xs select-none ${style}`}
            >
              <span className="leading-snug line-clamp-3">{card.text}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
