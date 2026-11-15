import React from 'react';
import { 
  BookOpen, 
  Layers, 
  Gamepad2, 
  Plus
} from 'lucide-react';

export default function BottomNav({ 
  activeTab, 
  setActiveTab, 
  onOpenAddModal 
}) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B132B]/95 backdrop-blur-md border-t border-slate-800 px-2 py-1 shadow-lg text-white">
      <div className="flex items-center justify-around max-w-sm mx-auto">
        
        {/* SmartCards Tab */}
        <button
          onClick={() => setActiveTab('smartcards')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all ${
            activeTab === 'smartcards'
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">SmartCards</span>
        </button>

        {/* Center Yellow Add Button */}
        <button
          onClick={onOpenAddModal}
          className="flex flex-col items-center -mt-4"
          title="Thêm từ mới"
        >
          <div className="w-12 h-12 rounded-full bg-[#FFCC00] text-[#0B132B] flex items-center justify-center shadow-lg shadow-amber-500/30 transform active:scale-95 transition-transform">
            <Plus className="w-6 h-6 stroke-[3]" />
          </div>
          <span className="text-[10px] font-bold text-[#FFCC00] mt-0.5">+ Từ mới</span>
        </button>

        {/* Journal Tab */}
        <button
          onClick={() => setActiveTab('journal')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all ${
            activeTab === 'journal'
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Sổ từ</span>
        </button>

        {/* Practice Mode */}
        <button
          onClick={() => setActiveTab('practice')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all ${
            activeTab === 'practice'
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Gamepad2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Tự luyện</span>
        </button>

      </div>
    </div>
  );
}
