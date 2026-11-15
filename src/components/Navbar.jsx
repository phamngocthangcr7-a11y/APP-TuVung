import React from 'react';
import { 
  Flame, 
  Plus, 
  Settings, 
  BookOpen, 
  Brain, 
  Sparkles, 
  Gamepad2, 
  FileSpreadsheet,
  Layers
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  streakInfo, 
  onOpenAddModal, 
  onOpenBatchModal, 
  onOpenSettings,
  dueTodayCount = 0
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Brain className="w-5 h-5 text-white animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 bg-clip-text text-transparent">
                  TOEIC Master
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-wider">
                  SRS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Sổ tay từ vựng & MVP SmartCards</p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Tổng quan
            </button>

            <button
              onClick={() => setActiveTab('journal')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'journal'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Sổ từ vựng
            </button>

            <button
              onClick={() => setActiveTab('smartcards')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all relative ${
                activeTab === 'smartcards'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              Smart Cards
              {dueTodayCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[11px] font-bold leading-none text-white bg-amber-500 rounded-full animate-bounce">
                  {dueTodayCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('practice')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'practice'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              Luyện tập
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2">
            
            {/* Streak counter */}
            <div 
              title={`Chuỗi học: ${streakInfo.currentStreak || 1} ngày liên tục! Hãy duy trì mỗi ngày.`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 font-bold text-xs shadow-xs"
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
              <span>{streakInfo.currentStreak || 1} ngày</span>
            </div>

            {/* Quick Batch Import Button */}
            <button
              onClick={onOpenBatchModal}
              title="Dán nhanh nhiều từ vựng (Batch Import)"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200/60"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Dán nhiều từ
            </button>

            {/* Quick Add Word Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm shadow-blue-500/25 transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Thêm từ mới</span>
              <span className="sm:hidden">Thêm</span>
            </button>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              title="Cài đặt & Dữ liệu"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
