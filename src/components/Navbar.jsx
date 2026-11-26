import React from 'react';
import { BookOpen, Layers, Gamepad2, Plus, Settings, ListPlus } from 'lucide-react';

export const sections = [
  ['smartcards', 'Thẻ học', Layers],
  ['journal', 'Sổ từ vựng', BookOpen],
  ['practice', 'Tự luyện', Gamepad2]
];

export default function Navbar({ activeTab, setActiveTab, onOpenAddModal, onOpenBatchModal, onOpenSettings }) {
  return <header className="main-nav"><div className="nav-inner">
    <button className="brand" onClick={() => setActiveTab('smartcards')} aria-label="Vocab TOEIC, trang học"><span className="brand-icon"><Layers /></span>Vocab<span>TOEIC</span></button>
    <nav className="desktop-tabs" aria-label="Điều hướng chính">{sections.map(([id, label, Icon]) =>
      <button key={id} aria-current={activeTab === id ? 'page' : undefined} onClick={() => setActiveTab(id)}><Icon size={17}/>{label}</button>)}</nav>
    <div className="nav-tools"><button onClick={onOpenBatchModal} aria-label="Nhập nhiều từ"><ListPlus/><span>Nhập nhiều từ</span></button><button className="nav-add" onClick={onOpenAddModal}><Plus size={16}/>Thêm từ</button><button aria-label="Cài đặt và sao lưu" onClick={onOpenSettings}><Settings/></button></div>
  </div></header>;
}
