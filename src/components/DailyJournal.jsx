import { getNotebookAccount } from '../utils/notebookStorage';
import React, { useState, useMemo, useRef } from 'react';
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
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Gamepad2,
  FolderOpen,
  Download,
  Upload,
  ShieldCheck
} from 'lucide-react';
import { speakEnglish } from '../utils/sound';
import { getTodayDateString } from '../utils/srs';
import { exportAllDataAsJSON, importDataFromJSON, deepRecoverCustomWords } from '../utils/storage';

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
  initialFilter = 'all',
  onDataImported
}) {
  const [activeView, setActiveView] = useState(initialFilter); // 'today', 'week', 'custom', 'builtin', 'favorites'
  const [selectedBuiltInSetId, setSelectedBuiltInSetId] = useState(builtInSets[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [partOfSpeechFilter, setPartOfSpeechFilter] = useState('all');
  const fileInputRef = useRef(null);

  const todayStr = getTodayDateString();

  // 1-Click Xuất file sao lưu (JSON) để lưu trữ an toàn hoặc chuyển sang điện thoại
  const handleExportBackup = () => {
    const jsonStr = exportAllDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toeic_tuvung_backup_${todayStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 1-Click Phục hồi từ file sao lưu
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const account = getNotebookAccount();
    const reader = new FileReader();
    reader.onload = (event) => {
      if (getNotebookAccount() !== account) return;
      const content = event.target?.result;
      if (typeof content === 'string') {
        const result = importDataFromJSON(content);
        if (result.success) {
          alert(`✅ Đã khôi phục thành công ${result.count} từ vựng và tiến độ học!`);
          if (onDataImported) onDataImported();
          else window.location.reload();
        } else {
          alert(`❌ Khôi phục thất bại: ${result.error}`);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 1-Click Quét sâu & Phục hồi toàn bộ từ vựng từ Master Vault và mọi nguồn sao lưu
  const handleDeepRecovery = () => {
    const recovered = deepRecoverCustomWords();
    alert(`🎉 Đã quét toàn bộ kho lưu trữ Master Vault và khôi phục thành công ${recovered.length} từ vựng vào Sổ tay của bạn!`);
    if (onDataImported) onDataImported();
    else window.location.reload();
  };

  // Filter words based on active view with full null-safety
  const filteredWords = useMemo(() => {
    let list = [];

    if (activeView === 'today') {
      list = customWords.filter(w => w && w.addedDate === todayStr);
    } else if (activeView === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];
      list = customWords.filter(w => w && (w.addedDate || '') >= weekAgoStr);
    } else if (activeView === 'custom') {
      list = customWords;
    } else if (activeView === 'builtin') {
      const set = builtInSets.find(s => s.id === selectedBuiltInSetId) || builtInSets[0];
      list = set && set.words ? set.words : [];
    } else if (activeView === 'favorites') {
      list = allWords.filter(w => w && favoriteIds.includes(w.id));
    } else {
      list = allWords;
    }

    // Clean out invalid words
    let clean = (list || []).filter(w => 
      w && typeof w === 'object' && w.word && String(w.word).trim() !== '' && String(w.word).trim() !== '-'
    );

    // Apply Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      clean = clean.filter(w => 
        (w.word && String(w.word).toLowerCase().includes(q)) ||
        (w.meaning && String(w.meaning).toLowerCase().includes(q)) ||
        (w.example && String(w.example).toLowerCase().includes(q)) ||
        (Array.isArray(w.tags) && w.tags.some(t => t && String(t).toLowerCase().includes(q)))
      );
    }

    // Apply Part of Speech Filter
    if (partOfSpeechFilter !== 'all') {
      clean = clean.filter(w => (w.partOfSpeech || '').toLowerCase() === partOfSpeechFilter.toLowerCase());
    }

    return clean;
  }, [activeView, customWords, allWords, builtInSets, selectedBuiltInSetId, favoriteIds, searchQuery, partOfSpeechFilter, todayStr]);

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

  return (
    <div className="space-y-4 pb-28 sm:pb-16">
      
      {/* Header Bar */}
      <div className="bg-[#FFFDF9] rounded-2xl p-4 sm:p-5 border border-[#EAE5DC] shadow-xs space-y-3">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-black text-[#1E293B] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#2B4C7E]" />
              Sổ tay từ vựng ({filteredWords.length} từ)
            </h1>
            <p className="text-xs text-[#736E65]">
              Tổng hợp từ vựng gặp hàng ngày, đối chiếu nghĩa và quản lý các bộ từ TOEIC
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />

            <button
              onClick={handleExportBackup}
              title="Tải file JSON sao lưu từ vựng về máy để lưu trữ hoặc chuyển sang điện thoại"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Sao lưu (JSON)</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              title="Khôi phục từ vựng từ file sao lưu JSON"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-amber-600" />
              <span>Phục hồi (File)</span>
            </button>

            <button
              onClick={handleDeepRecovery}
              title="Quét phục hồi lại toàn bộ từ vựng đã nạp từ Master Vault và các bản sao lưu"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors cursor-pointer shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Khôi phục kho từ</span>
            </button>

            <button
              onClick={onOpenBatchModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#4A453E] bg-[#F7F4EB] hover:bg-[#EDE8DC] border border-[#DCD6C9] transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Dán nhiều từ</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#2B4C7E] hover:bg-[#1E365B] shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm từ mới</span>
            </button>
          </div>
        </div>

        {/* Persistence Reassurance Banner */}
        <div className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50/90 px-3 py-1.5 rounded-xl border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <b>Dữ liệu an toàn:</b> Toàn bộ từ vựng & tiến độ học được tự động lưu 2 lớp vào trình duyệt máy này. Bấm <b>Sao lưu (JSON)</b> khi muốn đồng bộ sang điện thoại!
          </span>
        </div>

        {/* View selection tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#EAE5DC]">
          
          <button
            onClick={() => setActiveView('today')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeView === 'today'
                ? 'bg-[#2B4C7E] text-white shadow-2xs'
                : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#F7F4EB]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Hôm nay ({customWords.filter(w => w && w.addedDate === todayStr).length})
          </button>

          <button
            onClick={() => setActiveView('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeView === 'week'
                ? 'bg-[#2B4C7E] text-white shadow-2xs'
                : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#F7F4EB]'
            }`}
          >
            Tuần này
          </button>

          <button
            onClick={() => setActiveView('custom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeView === 'custom'
                ? 'bg-[#2B4C7E] text-white shadow-2xs'
                : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#F7F4EB]'
            }`}
          >
            Từ tự thêm ({customWords.length})
          </button>

          <button
            onClick={() => setActiveView('builtin')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeView === 'builtin'
                ? 'bg-[#2B4C7E] text-white shadow-2xs'
                : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#F7F4EB]'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Bộ từ TOEIC có sẵn
          </button>

          <button
            onClick={() => setActiveView('favorites')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeView === 'favorites'
                ? 'bg-[#2B4C7E] text-white shadow-2xs'
                : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#F7F4EB]'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            Yêu thích ({favoriteIds.length})
          </button>

        </div>

        {/* Built-in set sub-buttons */}
        {activeView === 'builtin' && (
          <div className="pt-1 flex flex-wrap items-center gap-1.5">
            {builtInSets.map(set => (
              <button
                key={set.id}
                onClick={() => setSelectedBuiltInSetId(set.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedBuiltInSetId === set.id
                    ? 'bg-[#1E365B] text-white shadow-2xs'
                    : 'bg-[#F2EFE8] text-[#4A453E] hover:bg-[#EAE5DC]'
                }`}
              >
                {set.title} ({set.words?.length})
              </button>
            ))}
          </div>
        )}

        {/* Search & Actions Bar */}
        <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8C867A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm từ tiếng Anh, nghĩa tiếng Việt, câu ví dụ..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-[#F7F4EB] border border-[#DCD6C9] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2B4C7E]/20"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C867A]"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={partOfSpeechFilter}
              onChange={(e) => setPartOfSpeechFilter(e.target.value)}
              className="px-2.5 py-2 rounded-xl text-xs bg-[#F7F4EB] border border-[#DCD6C9] text-[#4A453E] focus:outline-none"
            >
              <option value="all">Tất cả loại từ</option>
              <option value="noun">Danh từ (n)</option>
              <option value="verb">Động từ (v)</option>
              <option value="adj">Tính từ (adj)</option>
              <option value="adv">Trạng từ (adv)</option>
              <option value="phr">Cụm từ (phr)</option>
            </select>

            {filteredWords.length > 0 && (
              <button
                onClick={() => onStartSmartCards(filteredWords)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#2B4C7E] hover:bg-[#1E365B] shadow-2xs shrink-0"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Học bộ này</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Words List */}
      {filteredWords.length === 0 ? (
        <div className="bg-[#FFFDF9] rounded-2xl p-10 text-center border border-[#EAE5DC] shadow-xs max-w-md mx-auto">
          <BookOpen className="w-10 h-10 text-[#8C867A] mx-auto mb-2" />
          <h3 className="font-bold text-[#2C2A29] text-sm">Chưa có từ vựng nào trong mục này</h3>
          <p className="text-xs text-[#736E65] mt-1">
            Bấm nút dưới đây để nạp từ mới và hệ thống sẽ tự động check nghĩa cho bạn!
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2B4C7E] hover:bg-[#1E365B]"
          >
            + Thêm từ mới
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map(dateKey => {
            const wordsInDate = groupedByDate[dateKey] || [];
            const isToday = dateKey === todayStr;
            const displayDate = isToday 
              ? 'Hôm nay (' + dateKey + ')' 
              : dateKey === 'Khác' ? 'Bộ từ TOEIC' : `Ngày ${dateKey}`;

            return (
              <div key={dateKey} className="space-y-2.5">
                
                {/* Date header */}
                <div className="flex items-center gap-2 px-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                    isToday ? 'bg-[#2B4C7E] text-white' : 'bg-[#EAE5DC] text-[#4A453E]'
                  }`}>
                    {displayDate}
                  </span>
                  <span className="text-xs text-[#8C867A]">({wordsInDate.length} từ)</span>
                  <div className="flex-1 h-px bg-[#E5E0D4]"></div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {wordsInDate.map(word => {
                    const isFav = favoriteIds.includes(word.id);
                    const isCustom = word.isCustom || customWords.some(item => item.id === word.id);

                    return (
                      <div 
                        key={word.id}
                        className="bg-[#FFFDF9] rounded-2xl p-4 border border-[#E8E2D6] shadow-2xs hover:border-[#2B4C7E]/40 hover:shadow-xs transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          
                          {/* Header of Word Card */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base sm:text-lg font-black text-[#1E293B]">
                                  {word.word}
                                </h3>
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#EAE5DC] text-[#4A453E] uppercase">
                                  {word.partOfSpeech || 'word'}
                                </span>
                              </div>
                              
                              {word.pronunciation && (
                                <p className="text-xs text-[#5A6E85] font-mono mt-0.5">
                                  /{word.pronunciation}/
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => speakEnglish(word.word)}
                                className="p-1.5 rounded-lg text-[#8C867A] hover:text-[#2B4C7E] hover:bg-[#F2EFE8] transition-colors"
                                title="Phát âm"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => onToggleFavorite(word.id)}
                                className="p-1.5 rounded-lg transition-colors text-amber-500 hover:bg-[#F2EFE8]"
                                title="Yêu thích"
                              >
                                <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : 'text-[#8C867A]'}`} />
                              </button>
                            </div>
                          </div>

                          {/* Vietnamese Meaning */}
                          <div className="text-xs sm:text-sm font-bold text-[#1E3A5F] bg-[#F1F5F9] p-2 rounded-xl">
                            {word.meaning}
                          </div>

                          {/* Example */}
                          {(() => {
                            const ex = word.example?.trim();
                            const trans = word.exampleTranslation?.trim();
                            if (!ex) return null;
                            return (
                              <div className="text-xs text-[#4A453E] bg-[#FAF8F5] p-2 rounded-xl border border-[#EAE5DC] space-y-0.5">
                                <p className="font-medium text-[#1E293B] leading-relaxed">
                                  {ex}
                                </p>
                                {trans && (
                                  <p className="text-[#64748B] italic">
                                    {trans}
                                  </p>
                                )}
                              </div>
                            );
                          })()}

                        </div>

                        {/* Footer for custom words */}
                        {isCustom && (
                          <div className="mt-3 pt-2 border-t border-[#EAE5DC] flex items-center justify-between text-[11px] text-[#8C867A]">
                            <span>Ngày {word.addedDate}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onEditWord(word)}
                                className="flex items-center gap-1 text-[#2B4C7E] font-bold hover:underline"
                              >
                                <Edit3 className="w-3 h-3" /> Sửa
                              </button>
                              <button
                                onClick={() => onDeleteWord(word.id)}
                                className="flex items-center gap-1 text-rose-600 font-bold hover:underline"
                              >
                                <Trash2 className="w-3 h-3" /> Xóa
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
