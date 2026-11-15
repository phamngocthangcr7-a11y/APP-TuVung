import React from 'react';
import { 
  Flame, 
  Plus, 
  Settings, 
  BookOpen, 
  Layers, 
  Gamepad2, 
  FileSpreadsheet,
  Brain
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
    <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#EAE5DC] shadow-2xs transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-15">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('smartcards')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#2B4C7E] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#1E293B]">
                  Sổ tay Từ Vựng
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                  TOEIC
                </span>
              </div>
            </div>
          </div>

          {/* Clean 3 Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F5F2EA] p-1 rounded-xl border border-[#E5E0D4]">
            
            <button
              onClick={() => setActiveTab('smartcards')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all relative ${
                activeTab === 'smartcards'
                  ? 'bg-white text-[#2B4C7E] shadow-2xs'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Học SmartCards</span>
            </button>

            <button
              onClick={() => setActiveTab('journal')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'journal'
                  ? 'bg-white text-[#2B4C7E] shadow-2xs'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Sổ từ vựng</span>
            </button>

            <button
              onClick={() => setActiveTab('practice')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'practice'
                  ? 'bg-white text-[#2B4C7E] shadow-2xs'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Luyện tập</span>
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2">
            
            {/* Streak */}
            <div 
              title={`Chuỗi học: ${streakInfo.currentStreak || 1} ngày liên tục!`}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{streakInfo.currentStreak || 1} ngày</span>
            </div>

            {/* Quick Add Word Button with AI Check */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#2B4C7E] hover:bg-[#1E365B] shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Thêm từ mới</span>
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              title="Cài đặt & Sao lưu"
              className="p-2 rounded-xl text-[#64748B] hover:text-[#1E293B] hover:bg-[#F2EFE8] transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
