import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  FileSpreadsheet, 
  Layers, 
  Volume2, 
  Star, 
  Trash2, 
  Edit3, 
  Calendar, 
  Filter, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Tag, 
  ChevronDown,
  Sparkles,
  Gamepad2,
  FolderOpen
} from 'lucide-react';
import { speakEnglish } from '../utils/sound';
import { getTodayDateString } from '../utils/srs';

export default function DailyJournal({
  allWords = [],
  customWords = [],
  builtInSets = [],
  favoriteIds = [],
  onToggleFavorite,
  onOpenAddModal,
  onOpenBatchModal,
  onEditWord,
  onDeleteWord,
  onStartSmartCards,
  onStartQuiz,
  initialFilter = 'all'
}) {
  const [activeView, setActiveView] = useState(initialFilter); // 'today', 'week', 'custom', 'builtin', 'due', 'favorites'
  const [selectedBuiltInSetId, setSelectedBuiltInSetId] = useState(builtInSets[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [partOfSpeechFilter, setPartOfSpeechFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const todayStr = getTodayDateString();

  // Filter words based on active view
  const filteredWords = useMemo(() => {
    let list = [];

    if (activeView === 'today') {
      list = customWords.filter(w => w.addedDate === todayStr);
    } else if (activeView === 'week') {
      // 7 days ago
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];
      list = customWords.filter(w => (w.addedDate || '') >= weekAgoStr);
    } else if (activeView === 'custom') {
      list = customWords;
    } else if (activeView === 'builtin') {
      const set = builtInSets.find(s => s.id === selectedBuiltInSetId) || builtInSets[0];
      list = set ? set.words : [];
    } else if (activeView === 'due') {
      list = allWords.filter(w => !w.srs?.nextReviewDate || w.srs.nextReviewDate <= todayStr);
    } else if (activeView === 'favorites') {
      list = allWords.filter(w => favoriteIds.includes(w.id));
    } else {
      list = allWords;
    }

    // Apply Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(w => 
        (w.word && w.word.toLowerCase().includes(q)) ||
        (w.meaning && w.meaning.toLowerCase().includes(q)) ||
        (w.example && w.example.toLowerCase().includes(q)) ||
        (w.tags && w.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    // Apply Part of Speech Filter
    if (partOfSpeechFilter !== 'all') {
      list = list.filter(w => (w.partOfSpeech || '').toLowerCase() === partOfSpeechFilter.toLowerCase());
    }

    // Apply Date Filter
    if (dateFilter) {
      list = list.filter(w => w.addedDate === dateFilter);
    }

    return list;
  }, [activeView, customWords, allWords, builtInSets, selectedBuiltInSetId, favoriteIds, searchQuery, partOfSpeechFilter, dateFilter, todayStr]);

  // Group by Date helper
  const groupedByDate = useMemo(() => {
    const map = {};
    filteredWords.forEach(w => {
      const dateKey = w.addedDate || 'Khác';
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(w);
    });
    return map;
  }, [filteredWords]);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => (b > a ? 1 : -1));

  // Helper for SRS Badge
  const renderSrsBadge = (srs = {}) => {
    const state = srs.state || 'new';
    const interval = srs.interval || 0;

    if (state === 'mastered') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Thành thạo ({interval}d)
        </span>
      );
    }
    if (state === 'review') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
          <Clock className="w-3 h-3 text-blue-600" />
          Ôn tập ({interval}d)
        </span>
      );
    }
    if (state === 'learning') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
          Đang học
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
        Từ mới
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Top Header & Navigation Tabs */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              Sổ tay Từ vựng Hàng ngày & TOEIC Sets
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Tổng hợp từ vựng gặp mỗi ngày, phân loại theo tuần và kho từ vựng TOEIC trọng tâm
            </p>
          </div>

          {/* Quick Add & Batch Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenBatchModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Dán nhiều từ</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm từ mới</span>
            </button>
          </div>
        </div>

        {/* View Selection Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100">
          
          <button
            onClick={() => setActiveView('today')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeView === 'today'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Hôm nay ({customWords.filter(w => w.addedDate === todayStr).length})
          </button>

          <button
            onClick={() => setActiveView('week')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeView === 'week'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Tuần này</span>
          </button>

          <button
            onClick={() => setActiveView('custom')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeView === 'custom'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Tất cả từ tự thêm ({customWords.length})</span>
          </button>

          <button
            onClick={() => setActiveView('builtin')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeView === 'builtin'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            Bộ từ TOEIC có sẵn
          </button>

          <button
            onClick={() => setActiveView('due')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeView === 'due'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            Cần ôn hôm nay (SRS)
          </button>

          <button
            onClick={() => setActiveView('favorites')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeView === 'favorites'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            Yêu thích ({favoriteIds.length})
          </button>

        </div>

        {/* Built-in sets selector when in 'builtin' view */}
        {activeView === 'builtin' && (
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Chọn bộ TOEIC:</span>
            {builtInSets.map(set => (
              <button
                key={set.id}
                onClick={() => setSelectedBuiltInSetId(set.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedBuiltInSetId === set.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {set.title} ({set.words?.length})
              </button>
            ))}
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm từ tiếng Anh, nghĩa tiếng Việt, câu ví dụ..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter options */}
          <div className="flex items-center gap-2">
            <select
              value={partOfSpeechFilter}
              onChange={(e) => setPartOfSpeechFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Tất cả loại từ</option>
              <option value="noun">Danh từ (n)</option>
              <option value="verb">Động từ (v)</option>
              <option value="adj">Tính từ (adj)</option>
              <option value="adv">Trạng từ (adv)</option>
              <option value="phr">Cụm từ (phrase)</option>
            </select>

            {/* Action buttons on current list */}
            {filteredWords.length > 0 && (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onStartSmartCards(filteredWords)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
                  title="Học danh sách này với Flashcard SRS"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Học SmartCards</span>
                </button>

                <button
                  onClick={() => onStartQuiz(filteredWords)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                  title="Làm trắc nghiệm với danh sách này"
                >
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span>Quiz</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Words List Header */}
      <div className="flex items-center justify-between px-2">
        <div className="text-xs sm:text-sm font-semibold text-slate-600">
          Hiển thị <span className="font-bold text-slate-900">{filteredWords.length}</span> từ vựng
        </div>
      </div>

      {/* Words List Rendering */}
      {filteredWords.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Không tìm thấy từ vựng nào</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery 
              ? `Không có kết quả khớp với "${searchQuery}". Hãy thử từ khóa khác.`
              : 'Chưa có từ vựng nào trong danh mục này. Bạn có thể thêm từ mới ngay bây giờ!'}
          </p>
          <div className="mt-5 flex items-center justify-center gap-2">
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
            >
              + Thêm từ mới
            </button>
            <button
              onClick={onOpenBatchModal}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
            >
              Dán nhiều từ
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map(dateKey => {
            const wordsInDate = groupedByDate[dateKey] || [];
            const isToday = dateKey === todayStr;
            const displayDate = isToday 
              ? 'Hôm nay (' + dateKey + ')' 
              : dateKey === 'Khác' ? 'Từ vựng có sẵn' : `Ngày ${dateKey}`;

            return (
              <div key={dateKey} className="space-y-3">
                
                {/* Date separator header */}
                <div className="flex items-center gap-2 px-1">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                    isToday 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {displayDate}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">({wordsInDate.length} từ)</span>
                  <div className="flex-1 h-px bg-slate-200"></div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {wordsInDate.map(word => {
                    const isFav = favoriteIds.includes(word.id);
                    const isCustom = word.id.startsWith('usr_');

                    return (
                      <div 
                        key={word.id}
                        className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group"
                      >
                        <div className="space-y-2">
                          
                          {/* Header of Word Card */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                                  {word.word}
                                </h3>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                                  {word.partOfSpeech || 'n/v'}
                                </span>
                                {renderSrsBadge(word.srs)}
                              </div>
                              
                              {word.pronunciation && (
                                <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1.5">
                                  <span>/{word.pronunciation}/</span>
                                </div>
                              )}
                            </div>

                            {/* Speaker & Favorite buttons */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => speakEnglish(word.word)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Phát âm tiếng Anh"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => onToggleFavorite(word.id)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isFav 
                                    ? 'text-amber-500 hover:bg-amber-50' 
                                    : 'text-slate-300 hover:text-amber-500 hover:bg-slate-50'
                                }`}
                                title={isFav ? 'Bỏ yêu thích' : 'Lưu yêu thích'}
                              >
                                <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                              </button>
                            </div>
                          </div>

                          {/* Vietnamese Meaning */}
                          <div className="text-sm sm:text-base font-semibold text-blue-900 bg-blue-50/60 p-2.5 rounded-xl border border-blue-100/80">
                            {word.meaning}
                          </div>

                          {/* Example Sentence */}
                          {word.example && (
                            <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <p className="font-medium text-slate-800 leading-relaxed">
                                {word.example}
                              </p>
                              {word.exampleTranslation && (
                                <p className="text-slate-500 italic">
                                  {word.exampleTranslation}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Notes & Tags */}
                          {(word.note || (word.tags && word.tags.length > 0)) && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              {word.note && (
                                <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  💡 {word.note}
                                </span>
                              )}
                              {word.tags && word.tags.map((tag, idx) => (
                                <span key={idx} className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                        </div>

                        {/* Footer with Edit / Delete for custom words */}
                        {isCustom && (
                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                            <span>Thêm ngày {word.addedDate}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onEditWord(word)}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                              >
                                <Edit3 className="w-3.5 h-3.5" /> Sửa
                              </button>
                              <button
                                onClick={() => onDeleteWord(word.id)}
                                className="flex items-center gap-1 text-rose-500 hover:text-rose-700 font-medium"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Xóa
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
