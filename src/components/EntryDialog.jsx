import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import './entry.css';

export default function EntryDialog({ title, onClose, children, wide }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  return <dialog ref={dialog} aria-labelledby="entry-title" className={'entry-dialog' + (wide ? ' entry-wide' : '')}
    onCancel={event => { event.preventDefault(); onClose(); }}>
    <header className="entry-header"><h2 id="entry-title">{title}</h2><button type="button" aria-label="Đóng" className="entry-icon" onClick={onClose}><X size={20}/></button></header>
    {children}
  </dialog>;
}
