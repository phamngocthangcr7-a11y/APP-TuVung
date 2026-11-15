import React from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Layers, 
  Gamepad2, 
  Plus
} from 'lucide-react';

export default function BottomNav({ 
  activeTab, 
  setActiveTab, 
  onOpenAddModal, 
  dueTodayCount = 0 
}) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all ${
            activeTab === 'dashboard'
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Tổng quan</span>
        </button>

        {/* Journal */}
        <button
          onClick={() => setActiveTab('journal')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all ${
            activeTab === 'journal'
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Sổ từ</span>
        </button>

        {/* Center Add Floating Button */}
        <button
          onClick={onOpenAddModal}
          className="flex flex-col items-center -mt-5"
          title="Thêm từ vựng mới"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/35 transform active:scale-95 transition-transform">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-blue-600 mt-0.5">Thêm từ</span>
        </button>

        {/* Smart Cards (SRS) */}
        <button
          onClick={() => setActiveTab('smartcards')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl relative transition-all ${
            activeTab === 'smartcards'
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Smart Cards</span>
          {dueTodayCount > 0 && (
            <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white"></span>
          )}
        </button>

        {/* Practice Mode */}
        <button
          onClick={() => setActiveTab('practice')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all ${
            activeTab === 'practice'
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Gamepad2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Luyện tập</span>
        </button>

      </div>
    </div>
  );
}
