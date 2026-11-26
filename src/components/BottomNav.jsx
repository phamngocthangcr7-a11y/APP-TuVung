import React from 'react';
import { sections } from './Navbar';

export default function BottomNav({ activeTab, setActiveTab }) {
  return <nav className="mobile-tabs" aria-label="Điều hướng di động">{sections.map(([id, label, Icon]) =>
    <button key={id} aria-current={activeTab === id ? 'page' : undefined} onClick={() => setActiveTab(id)}><Icon size={20}/>{label}</button>)}</nav>;
}
