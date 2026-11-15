import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Clock, Award, Gamepad2 } from 'lucide-react';
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

  const sanitize = (list) => {
    if (!Array.isArray(list)) return [];
    return list.filter(w => w && typeof w === 'object' && w.word && String(w.word).trim() !== '' && String(w.word).trim() !== '-');
  };

  const startNewGame = useCallback((source) => {
    let list = [];
    if (source === 'today') {
      const today = new Date().toISOString().split('T')[0];
      list = (customWords || []).filter(w => w && w.addedDate === today);
      if (list.length < 6) list = allWords.slice(0, 10);
    } else if (source === 'custom') {
      list = (customWords || []).length >= 6 ? customWords : allWords.slice(0, 10);
    } else if (typeof source === 'string' && source.startsWith('set_')) {
      const set = (builtInSets || []).find(s => s.id === source);
      list = set && set.words ? set.words : allWords.slice(0, 10);
    } else {
      list = allWords;
    }

    const clean = sanitize(list);
    const picked = clean.sort(() => 0.5 - Math.random()).slice(0, 6);

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
    setIsTimerRunning(cardItems.length > 0);
    setIsCompleted(false);
  }, [allWords, customWords, builtInSets]);

  useEffect(() => {
    startNewGame(selectedSource);
  }, [selectedSource, startNewGame]);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleCardClick = (card) => {
    if (!card || matchedIds.includes(card.wordId)) return;
    if (selectedFirst && selectedFirst.id === card.id) return;
    if (selectedFirst && selectedSecond) return;

    if (card.lang === 'en') {
      speakEnglish(card.text, 1.0);
    }

    if (!selectedFirst) {
      setSelectedFirst(card);
    } else {
      setSelectedSecond(card);

      if (selectedFirst.wordId === card.wordId && selectedFirst.lang !== card.lang) {
        sound.playCorrect();
        setTimeout(() => {
          setMatchedIds(prev => {
            const updated = [...prev, card.wordId];
            if (updated.length === 6) {
              sound.playVictory();
              setIsTimerRunning(false);
              setIsCompleted(true);
              if (onRecordStudySession) onRecordStudySession(6);
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
        }, 700);
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
      <div className="max-w-lg mx-auto py-10 px-4 text-center">
        <div className="bg-[#FFFDF9] rounded-3xl p-8 border border-[#EAE5DC] shadow-md space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-[#1E293B]">
              Ghép từ hoàn thành!
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Thời gian: <strong className="text-[#2B4C7E] text-base">{formatTime(timer)}</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <button
              onClick={() => startNewGame(selectedSource)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-[#2B4C7E] hover:bg-[#1E365B] text-white shadow-xs transition-all"
            >
              Chơi ván mới
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

  if (cards.length === 0) {
    return (
      <div className="max-w-md mx-auto my-8 p-6 bg-[#FFFDF9] rounded-3xl border border-[#EAE5DC] text-center space-y-3">
        <Gamepad2 className="w-8 h-8 text-[#64748B] mx-auto" />
        <h3 className="font-bold text-sm text-[#1E293B]">Đang tải trò chơi ghép từ...</h3>
        <button
          onClick={() => startNewGame('all')}
          className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#2B4C7E]"
        >
          Bắt đầu chơi
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

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs font-bold text-[#1E293B] bg-[#F7F4EB] px-2.5 py-1 rounded-xl border border-[#E0D9CC]">
            <Clock className="w-3.5 h-3.5 text-[#64748B]" />
            <span>{formatTime(timer)}</span>
          </div>

          <button
            onClick={() => startNewGame(selectedSource)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#1E293B] hover:bg-[#F2EFE8] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of 12 Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {cards.map(card => {
          const isMatched = matchedIds.includes(card.wordId);
          const isSelected = (selectedFirst && selectedFirst.id === card.id) || (selectedSecond && selectedSecond.id === card.id);
          const isWrong = selectedSecond && isSelected && selectedFirst.wordId !== selectedSecond.wordId;

          if (isMatched) {
            return (
              <div 
                key={card.id} 
                className="h-20 sm:h-24 rounded-2xl border border-dashed border-[#EAE5DC] bg-[#FAF8F5]/60 opacity-30 flex items-center justify-center pointer-events-none"
              >
                <span className="text-xs text-[#8C867A] font-bold">✓ Đã ghép</span>
              </div>
            );
          }

          let style = 'bg-[#FFFDF9] text-[#1E293B] border-[#E8E2D6] hover:border-[#2B4C7E]/40';
          if (isSelected) {
            style = isWrong 
              ? 'bg-rose-50 border-rose-400 text-rose-900 shadow-md animate-shake' 
              : 'bg-[#2B4C7E] text-white border-[#2B4C7E] shadow-md scale-102';
          }

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`h-20 sm:h-24 rounded-2xl p-2.5 border font-bold text-xs sm:text-sm flex items-center justify-center text-center transition-all transform active:scale-95 shadow-2xs select-none ${style}`}
            >
              <span className="leading-snug line-clamp-3">{card.text}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
