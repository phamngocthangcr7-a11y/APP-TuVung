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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-t border-[#EAE5DC] px-2 py-1 shadow-md">
      <div className="flex items-center justify-around max-w-sm mx-auto">
        
        {/* SmartCards Tab */}
        <button
          onClick={() => setActiveTab('smartcards')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all ${
            activeTab === 'smartcards'
              ? 'text-[#2B4C7E] font-bold'
              : 'text-[#64748B] hover:text-[#1E293B]'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Smart Cards</span>
        </button>

        {/* Center Add Button */}
        <button
          onClick={onOpenAddModal}
          className="flex flex-col items-center -mt-4"
          title="Thêm từ mới"
        >
          <div className="w-11 h-11 rounded-full bg-[#2B4C7E] text-white flex items-center justify-center shadow-md shadow-[#2B4C7E]/25 transform active:scale-95 transition-transform">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-[#2B4C7E] mt-0.5">+ Từ mới</span>
        </button>

        {/* Journal Tab */}
        <button
          onClick={() => setActiveTab('journal')}
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all ${
            activeTab === 'journal'
              ? 'text-[#2B4C7E] font-bold'
              : 'text-[#64748B] hover:text-[#1E293B]'
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
              ? 'text-[#2B4C7E] font-bold'
              : 'text-[#64748B] hover:text-[#1E293B]'
          }`}
        >
          <Gamepad2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Luyện tập</span>
        </button>

      </div>
    </div>
  );
}
