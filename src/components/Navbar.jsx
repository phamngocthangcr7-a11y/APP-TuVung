import React from 'react';
import { 
  Flame, 
  Plus, 
  Settings, 
  BookOpen, 
  Layers, 
  Gamepad2, 
  Brain,
  FileSpreadsheet
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  streakInfo, 
  onOpenAddModal, 
  onOpenBatchModal,
  onOpenSettings,
  dueTodayCount = 0,
  customWordsCount = 0
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#0B132B] text-white shadow-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand (The MVP TOEIC style) */}
          <div 
            onClick={() => setActiveTab('smartcards')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="font-black text-xl tracking-tight text-white flex items-center gap-1.5">
              <span className="text-white">MVP</span>
              <span className="text-blue-400">TOEIC</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase ml-1">
                SMART-CARDS
              </span>
            </div>
          </div>

          {/* Navigation Links (The MVP TOEIC style) */}
          <nav className="hidden md:flex items-center gap-2">
            
            <button
              onClick={() => setActiveTab('smartcards')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all relative ${
                activeTab === 'smartcards'
                  ? 'bg-[#1E3A8A] text-white shadow-inner ring-1 ring-blue-400/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <Layers className="w-4 h-4" />
              <span>Smart Cards</span>
            </button>

            <button
              onClick={() => setActiveTab('journal')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'journal'
                  ? 'bg-[#1E3A8A] text-white shadow-inner ring-1 ring-blue-400/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Sổ Từ Vựng</span>
              {customWordsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  {customWordsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('practice')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'practice'
                  ? 'bg-[#1E3A8A] text-white shadow-inner ring-1 ring-blue-400/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Tự Luyện (Quiz)</span>
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            
            {/* Streak */}
            <div 
              title={`Chuỗi học: ${streakInfo.currentStreak || 1} ngày liên tục!`}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 font-bold text-xs"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{streakInfo.currentStreak || 1} ngày</span>
            </div>

            {/* Dán nhiều từ button */}
            <button
              onClick={onOpenBatchModal}
              title="Dán nhiều từ từ Excel hoặc văn bản"
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm font-bold text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Dán nhiều từ</span>
            </button>

            {/* Bright Yellow Action Button (Like 'Nâng cấp tài khoản' in Image 2 & 3) */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-black text-[#0B132B] bg-[#FFCC00] hover:bg-[#FFD633] shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Thêm từ mới</span>
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              title="Cài đặt & Sao lưu"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
