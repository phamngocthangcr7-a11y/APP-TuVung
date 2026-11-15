import React from 'react';
import { 
  Flame, 
  Layers, 
  BookOpen, 
  Plus, 
  FileSpreadsheet, 
  Gamepad2, 
  Brain, 
  Volume2, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  Calendar,
  Award,
  PenTool
} from 'lucide-react';
import { speakEnglish } from '../utils/sound';

export default function Dashboard({
  allWords = [],
  customWords = [],
  todayWords = [],
  weekWords = [],
  dueWords = [],
  srsStats = {},
  streakInfo = {},
  onStartSmartCards,
  onStartQuiz,
  onStartDictation,
  onStartMatch,
  onOpenAddModal,
  onOpenBatchModal,
  onNavigateToJournal
}) {
  const todayDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 sm:p-8 shadow-xl shadow-blue-900/20">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-blue-100 text-xs font-semibold mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Hệ thống học thông minh TOEIC Master SRS</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
            Chinh phục TOEIC cùng Sổ tay Từ vựng & MVP SmartCards
          </h1>

          <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed">
            Hôm nay là <span className="font-semibold text-white capitalize">{todayDate}</span>. Hãy ghi chép từ vựng mới bạn gặp hàng ngày và ôn tập đúng lịch Spaced Repetition để không bao giờ quên!
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onStartSmartCards(dueWords.length > 0 ? 'due' : 'all')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-white text-blue-800 hover:bg-blue-50 shadow-md shadow-black/10 transition-all transform active:scale-95"
            >
              <Layers className="w-4 h-4 text-blue-600" />
              <span>{dueWords.length > 0 ? `Ôn tập ${dueWords.length} thẻ đến hạn (SRS)` : 'Học Smart Cards ngay'}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nạp từ mới hôm nay</span>
            </button>
          </div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute right-12 top-6 opacity-15 hidden lg:block pointer-events-none">
          <Brain className="w-56 h-56 text-white" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Streak */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-800">
              {streakInfo.currentStreak || 1} <span className="text-xs font-normal text-slate-500">ngày</span>
            </div>
            <div className="text-xs font-medium text-slate-500">Chuỗi học liên tục</div>
          </div>
        </div>

        {/* Due Today (SRS) */}
        <div 
          onClick={() => onStartSmartCards('due')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5 cursor-pointer hover:border-blue-300 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-blue-600 flex items-center gap-1.5">
              {dueWords.length}
              {dueWords.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              )}
            </div>
            <div className="text-xs font-medium text-slate-500">Thẻ cần ôn hôm nay</div>
          </div>
        </div>

        {/* Daily Added Words */}
        <div 
          onClick={() => onNavigateToJournal('today')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5 cursor-pointer hover:border-emerald-300 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Calendar className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600">
              {todayWords.length} <span className="text-xs font-normal text-slate-500">từ</span>
            </div>
            <div className="text-xs font-medium text-slate-500">Đã nạp hôm nay</div>
          </div>
        </div>

        {/* Mastered Words */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-indigo-600">
              {srsStats.masteredCount || 0} <span className="text-xs font-normal text-slate-500">/ {allWords.length}</span>
            </div>
            <div className="text-xs font-medium text-slate-500">Đã thuộc thành thạo</div>
          </div>
        </div>

      </div>

      {/* Learning Modes & Features Grid */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            Phương pháp học tập & Luyện thi TOEIC
          </h2>
          <span className="text-xs font-medium text-slate-500">Chọn chế độ rèn luyện</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. MVP SmartCards */}
          <div 
            onClick={() => onStartSmartCards('all')}
            className="group relative bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-base group-hover:text-blue-600 transition-colors">
                MVP SmartCards (SRS)
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Ứng dụng thuật toán SM-2 lặp lại ngắt quãng, tự động tính chu kỳ ôn tập giúp nhớ từ vựng vĩnh viễn.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
              Bắt đầu học thẻ <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* 2. Dictation & Spelling */}
          <div 
            onClick={onStartDictation}
            className="group relative bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <PenTool className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-base group-hover:text-emerald-600 transition-colors">
                Nghe chép chính tả (Dictation)
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Phương pháp chuẩn Đậu TOEIC: nghe phát âm bản xứ và gõ lại chuẩn xác, luyện tai và nhớ chính tả.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
              Luyện gõ ngay <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* 3. TOEIC Quiz */}
          <div 
            onClick={onStartQuiz}
            className="group relative bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-purple-400 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-purple-100/70 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-base group-hover:text-purple-600 transition-colors">
                Trắc nghiệm 4 đáp án (Quiz)
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Rèn luyện phản xạ Part 5 & 6 với các dạng câu hỏi trắc nghiệm nghĩa, điền ngữ cảnh và nghe chọn từ.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
              Làm trắc nghiệm <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* 4. Match Game */}
          <div 
            onClick={onStartMatch}
            className="group relative bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-amber-100/70 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 text-base group-hover:text-amber-600 transition-colors">
                Ghép từ thần tốc (Match)
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Trò chơi ghép nhanh từ tiếng Anh với nghĩa tiếng Việt dưới áp lực thời gian để tăng tốc độ nhận diện từ.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
              Chơi game nối từ <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

        </div>
      </div>

      {/* Daily Vocabulary Section & Quick Add Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Today & Recent Words */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Từ vựng nạp hôm nay ({todayWords.length})
              </h3>
              <p className="text-xs text-slate-500">Các từ bạn ghi nhận trong ngày để tổng hợp ôn tập</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm từ
              </button>
              <button
                onClick={() => onNavigateToJournal('today')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Xem tất cả
              </button>
            </div>
          </div>

          <div className="mt-4">
            {todayWords.length === 0 ? (
              <div className="text-center py-10 px-4 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-700 text-sm">Hôm nay bạn chưa nạp từ vựng nào</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Khi giải đề TOEIC, đọc tài liệu hoặc gặp từ mới ngoài đời, hãy bấm nút dưới đây để ghi lại ngay nhé!
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    onClick={onOpenAddModal}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm từ mới ngay
                  </button>
                  <button
                    onClick={onOpenBatchModal}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    Dán nhiều từ
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
                {todayWords.slice(0, 5).map((w) => (
                  <div key={w.id} className="py-3 flex items-center justify-between group hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-sm sm:text-base">{w.word}</span>
                        {w.pronunciation && (
                          <span className="text-xs text-slate-500 font-mono">/{w.pronunciation}/</span>
                        )}
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                          {w.partOfSpeech || 'n/v'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{w.meaning}</p>
                      {w.example && (
                        <p className="text-[11px] text-slate-500 italic line-clamp-1">"{w.example}"</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => speakEnglish(w.word)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Phát âm"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Weekly Summary & Tips */}
        <div className="space-y-4">
          
          {/* Weekly Summary Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-5 border border-indigo-100/80">
            <h4 className="font-bold text-indigo-900 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Tổng hợp tuần này
            </h4>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-indigo-700">{weekWords.length}</span>
              <span className="text-xs text-indigo-600 font-medium">từ vựng mới đã nạp</span>
            </div>
            <p className="text-xs text-indigo-800/80 mt-2 leading-relaxed">
              Duy trì nạp từ đều đặn 10-15 từ mỗi ngày sẽ giúp bạn tích lũy hơn 300 từ TOEIC chất lượng mỗi tháng!
            </p>
            <button
              onClick={() => onNavigateToJournal('week')}
              className="mt-3 w-full py-2 px-3 rounded-xl bg-white text-indigo-700 font-semibold text-xs border border-indigo-200/60 hover:bg-indigo-50 shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              Xem danh sách tuần này <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* TOEIC Tips Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Mẹo học TOEIC hiệu quả
            </h4>
            <ul className="mt-3 text-xs text-slate-600 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span><strong>Học theo cụm (Collocations):</strong> Đề thi Part 5 thường kiểm tra cụm từ cố định hơn là từ đơn lẻ.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span><strong>Lắng nghe phát âm:</strong> Luôn bấm nút loa để tai làm quen với cách phát âm nối âm bản xứ.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span><strong>Tuân thủ Spaced Repetition:</strong> Ôn các thẻ đến hạn (Due) ngay khi có thông báo.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
