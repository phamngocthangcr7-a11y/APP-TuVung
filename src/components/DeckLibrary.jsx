import React, { useState } from 'react';
import { Layers, BookMarked, BookOpen, BriefcaseBusiness, GraduationCap, MessagesSquare, Star, Zap, Flame, RotateCcw, Play, CheckCircle2, CalendarDays } from 'lucide-react';

const covers = {
  deck_custom: [BookMarked, 'Bộ của tôi', 'Những từ bạn đã thêm vào sổ.'],
  deck_basic: [BookOpen, 'Cơ bản', 'Xây nền tảng với các từ thông dụng.'],
  deck_intermediate: [BriefcaseBusiness, 'Trung cấp', 'Từ vựng trong công việc và đề TOEIC.'],
  deck_advanced: [GraduationCap, 'Nâng cao', 'Mở rộng vốn từ và kết hợp từ.'],
  deck_phrases: [MessagesSquare, 'Cụm từ', 'Học cách diễn đạt theo cụm.']
};

export default function DeckLibrary({ decks, stats, overall, start, open, add, recover, openStudyDecks }) {
  const [flipped, setFlipped] = useState(false);
  const next = decks.find(d => stats[d.id].dueCount > 0) || decks.find(d => stats[d.id].newCount > 0);
  const due = Object.values(stats).reduce((sum, deck) => sum + deck.dueCount, 0);
  return <div className="library">
    <section className="learn-hero">
      <div><div className="hero-date"><CalendarDays size={16}/>{new Intl.DateTimeFormat('vi-VN', { weekday:'long', day:'numeric', month:'long' }).format(new Date())}</div>
      <h1>Học từ vựng TOEIC</h1>
      <p>{due ? `Bạn có ${due} thẻ đến lịch ôn hôm nay.` : 'Hôm nay bạn đã ôn hết thẻ đến hạn.'} {next ? 'Bắt đầu một phiên học ngắn theo bộ từ của bạn.' : 'Bạn có thể tự luyện hoặc thêm từ mới.'}</p>
      <button className="hero-action" onClick={() => next ? start(next, 10, 'due_first') : add()}><Play size={16}/>{next ? 'Học ngay' : 'Thêm từ mới'}</button></div>
      <div className="hero-art"><button className="sample-card" aria-label="Lật thẻ mẫu achievement" onClick={() => setFlipped(v => !v)}><small><Layers size={14}/> THẺ MẪU</small><strong lang={flipped ? 'vi' : 'en'}>{flipped ? 'thành tựu' : 'achievement'}</strong><span>{flipped ? 'danh từ' : '/əˈtʃiːv.mənt/'}</span><i><RotateCcw size={13}/> Lật thẻ</i></button></div>
    </section>
    <div className="study-metrics"><span><Flame/ ><b>{overall.currentStreak} ngày</b> liên tiếp</span><span><CalendarDays/><b>{due}</b> đến hạn</span><span><CheckCircle2/><b>{overall.totalMastered}</b> đã thuộc</span></div>
    <section><div className="collection-heading"><div><h2>Thư viện thẻ học</h2><p>Chọn bộ từ để học hoặc ôn tập.</p></div><div className="filters"><button onClick={openStudyDecks}><BookMarked/> Bộ học riêng</button><button disabled={!overall.savedCount} onClick={() => start('saved', 30, 'mixed')}><Star/> Đã lưu · {overall.savedCount}</button><button disabled={!overall.hardCount} onClick={() => start('hard', 30, 'mixed')}><Zap/> Thẻ khó · {overall.hardCount}</button></div></div>
    <div className="collection-grid">{decks.map(deck => {
      const [Icon, title, subtitle] = covers[deck.id];
      const info = stats[deck.id];
      return <article className={'deck-tile ' + deck.id} key={deck.id}>
        <div className="tile-top"><div className="deck-emblem"><Icon/></div><span>{deck.isCustom ? 'Cá nhân' : deck.code}</span></div>
        <h3>{title}</h3><p>{subtitle}</p><div className="deck-counts"><span>{info.total} từ</span><span>{info.dueCount ? info.dueCount + ' đến hạn' : info.newCount + ' thẻ mới'}</span></div>
        <progress aria-label={'Tiến độ bộ ' + title} max="100" value={info.progressPercent}/>
        <button onClick={() => info.total ? open(deck) : add()}>{info.total ? 'Mở bộ thẻ' : 'Thêm từ đầu tiên'}</button>
      </article>;
    })}</div></section><button className="recover-link" onClick={recover}><RotateCcw size={14}/> Khôi phục kho từ cũ</button>
  </div>;
}
