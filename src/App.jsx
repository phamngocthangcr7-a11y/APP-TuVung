import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Brain, 
  PenTool,
  RotateCcw, 
  Volume2, 
  ChevronRight, 
  ChevronLeft, 
  Check,
  Eye,
  XCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

/* =========================================================================
   KHU VỰC DỮ LIỆU TỪ VỰNG
   ========================================================================= */
const VOCAB_SETS = [
  {
    id: 1,
    title: "Từ vựng thông dụng & Phiên âm",
    words: [
      { 
        id: 1, 
        word: "significantly", 
        meaning: "đáng kể, một cách đáng kể", 
        pronunciation: "sig-NIF-i-cần-li", 
        examples: [
          { en: "Sales increased significantly this quarter.", vi: "Doanh số đã tăng đáng kể trong quý này." },
          { en: "The new policy significantly changed our workflow.", vi: "Chính sách mới đã thay đổi đáng kể quy trình làm việc của chúng tôi." }
        ]
      },
      { 
        id: 2, 
        word: "persuasively", 
        meaning: "một cách thuyết phục", 
        pronunciation: "pờ-SUÂY-siv-li", 
        examples: [
          { en: "She spoke persuasively during the meeting.", vi: "Cô ấy nói chuyện một cách thuyết phục trong cuộc họp." },
          { en: "He argued persuasively for the proposal.", vi: "Anh ấy đã lập luận một cách thuyết phục cho đề xuất này." }
        ]
      },
      { 
        id: 3, 
        word: "proficiently", 
        meaning: "một cách thành thạo", 
        pronunciation: "pờ-FI-shần-li", 
        examples: [
          { en: "He uses the software proficiently.", vi: "Anh ấy sử dụng phần mềm một cách thành thạo." },
          { en: "She speaks three languages proficiently.", vi: "Cô ấy nói thành thạo ba ngôn ngữ." }
        ]
      },
      { 
        id: 4, 
        word: "gladly", 
        meaning: "vui lòng, sẵn lòng", 
        pronunciation: "GLAD-li", 
        examples: [
          { en: "I would gladly help you with this project.", vi: "Tôi rất sẵn lòng giúp bạn dự án này." },
          { en: "They gladly accepted our invitation.", vi: "Họ đã vui vẻ chấp nhận lời mời của chúng tôi." }
        ]
      },
      { 
        id: 5, 
        word: "administrative", 
        meaning: "thuộc về hành chính", 
        pronunciation: "ợd-MIN-ờ-strây-tiv", 
        examples: [
          { en: "She handles administrative tasks.", vi: "Cô ấy đảm nhận các công việc hành chính." },
          { en: "The company reduced administrative expenses.", vi: "Công ty đã cắt giảm chi phí hành chính." }
        ]
      },
      { 
        id: 6, 
        word: "establish", 
        meaning: "thành lập, thiết lập", 
        pronunciation: "i-STAB-lish", 
        examples: [
          { en: "They want to establish a new company.", vi: "Họ muốn thành lập một công ty mới." },
          { en: "We need to establish clear rules.", vi: "Chúng ta cần thiết lập các quy tắc rõ ràng." }
        ]
      },
      { 
        id: 7, 
        word: "explicit policies", 
        meaning: "các chính sách rõ ràng/cụ thể", 
        pronunciation: "ik-SPLI-sịt PO-lờ-siz", 
        examples: [
          { en: "The company has explicit policies regarding attendance.", vi: "Công ty có các chính sách rõ ràng liên quan đến việc đi làm." },
          { en: "You must follow the explicit policies of the firm.", vi: "Bạn phải tuân thủ các chính sách cụ thể của công ty." }
        ]
      },
      { 
        id: 8, 
        word: "diligently", 
        meaning: "siêng năng, chăm chỉ", 
        pronunciation: "DIL-i-jần-li", 
        examples: [
          { en: "He worked diligently to complete the report.", vi: "Anh ấy làm việc chăm chỉ để hoàn thành báo cáo." },
          { en: "She studies diligently for her final exams.", vi: "Cô ấy học tập chăm chỉ cho kỳ thi cuối kỳ." }
        ]
      },
      { 
        id: 9, 
        word: "curiously", 
        meaning: "một cách tò mò", 
        pronunciation: "KYUR-i-ợs-li", 
        examples: [
          { en: "The child looked curiously at the package.", vi: "Đứa trẻ nhìn gói hàng một cách tò mò." },
          { en: "Everyone listened curiously to his story.", vi: "Mọi người tò mò lắng nghe câu chuyện của anh ấy." }
        ]
      },
      { 
        id: 10, 
        word: "extremely", 
        meaning: "cực kỳ, vô cùng", 
        pronunciation: "ik-STRIIM-li", 
        examples: [
          { en: "This task is extremely important.", vi: "Nhiệm vụ này cực kỳ quan trọng." },
          { en: "The weather was extremely hot yesterday.", vi: "Thời tiết hôm qua vô cùng nóng." }
        ]
      },
      { 
        id: 11, 
        word: "grown", 
        meaning: "đã lớn, phát triển", 
        pronunciation: "grôun", 
        examples: [
          { en: "The market has grown rapidly.", vi: "Thị trường đã phát triển nhanh chóng." },
          { en: "She has grown into a confident professional.", vi: "Cô ấy đã trở thành một chuyên gia tự tin." }
        ]
      },
      { 
        id: 12, 
        word: "industry", 
        meaning: "ngành công nghiệp", 
        pronunciation: "IN-dờ-stri", 
        examples: [
          { en: "Technology is a fast-growing industry.", vi: "Công nghệ là một ngành công nghiệp phát triển nhanh." },
          { en: "He has worked in the tech industry for 10 years.", vi: "Anh ấy đã làm việc trong ngành công nghệ 10 năm." }
        ]
      },
      { 
        id: 13, 
        word: "rapidly", 
        meaning: "nhanh chóng", 
        pronunciation: "RAP-id-li", 
        examples: [
          { en: "The population is expanding rapidly.", vi: "Dân số đang tăng trưởng nhanh chóng." },
          { en: "Business costs are rising rapidly.", vi: "Chi phí kinh doanh đang tăng nhanh chóng." }
        ]
      }
    ]
  }
];

export default function VocabApp() {
  const [activeTab, setActiveTab] = useState('flashcard');
  const [selectedSetIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [rememberedCount, setRememberedCount] = useState(0);

  // State Trắc nghiệm
  const [quizOptions, setQuizOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  // State Gõ từ (Hàng chờ lặp lại khi gõ sai)
  const currentSet = VOCAB_SETS[selectedSetIndex];
  const [typeQueue, setTypeQueue] = useState([]);
  const [typeIndex, setTypeIndex] = useState(0);
  const [typedInput, setTypedInput] = useState('');
  const [typeResult, setTypeResult] = useState(null); // 'correct' | 'incorrect' | null
  const [reviewCount, setReviewCount] = useState(0);

  const currentWord = currentSet.words[currentIndex] || currentSet.words[0];
  const currentTypeWord = typeQueue[typeIndex];

  // Khởi tạo hàng chờ gõ từ
  const initTypeQueue = () => {
    setTypeQueue([...currentSet.words]);
    setTypeIndex(0);
    setTypedInput('');
    setTypeResult(null);
    setReviewCount(0);
  };

  const handleSpeak = (e, text) => {
    e?.stopPropagation();
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setSelectedOption(null);
    if (currentIndex < currentSet.words.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setSelectedOption(null);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Trắc nghiệm
  useEffect(() => {
    if (activeTab === 'quiz' && currentWord) {
      const wrongWords = currentSet.words
        .filter(w => w.id !== currentWord.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      
      const options = [...wrongWords, currentWord].sort(() => 0.5 - Math.random());
      setQuizOptions(options);
      setSelectedOption(null);
    }
  }, [currentIndex, activeTab, selectedSetIndex]);

  // Xử lý kiểm tra gõ từ
  const handleCheckType = (e) => {
    e.preventDefault();
    if (!typedInput.trim() || !currentTypeWord) return;

    const isCorrect = typedInput.trim().toLowerCase() === currentTypeWord.word.toLowerCase();

    if (isCorrect) {
      setTypeResult('correct');
      handleSpeak(null, currentTypeWord.word);
    } else {
      setTypeResult('incorrect');
      // Đưa từ bị gõ sai vào cuối hàng chờ để lặp lại sau!
      if (!typeQueue.slice(typeIndex + 1).some(item => item.id === currentTypeWord.id)) {
        setTypeQueue(prev => [...prev, currentTypeWord]);
        setReviewCount(prev => prev + 1);
      }
    }
  };

  const handleNextTypeWord = () => {
    setTypedInput('');
    setTypeResult(null);
    setTypeIndex(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#F7F4EB] text-[#2C2A29] p-4 md:p-8 font-sans selection:bg-[#E2DBC8]">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#1C1A19]">Sổ tay từ vựng</h1>
            <p className="text-sm text-gray-600 mt-1">
              Bộ {selectedSetIndex + 1}/{VOCAB_SETS.length}: {currentSet.title}
            </p>
          </div>
          <span className="text-sm font-semibold text-gray-500 whitespace-nowrap">
            {currentSet.words.length} TỪ
          </span>
        </header>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-300">
          <button 
            onClick={() => { setActiveTab('flashcard'); setIsFlipped(false); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'flashcard' ? 'bg-[#EFEAD8] text-black shadow-sm font-bold' : 'text-gray-600'
            }`}
          >
            <BookOpen size={18} /> Lật thẻ
          </button>
          
          <button 
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'quiz' ? 'bg-[#EFEAD8] text-black shadow-sm font-bold' : 'text-gray-600'
            }`}
          >
            <Brain size={18} /> Trắc nghiệm (4 đáp án)
          </button>

          <button 
            onClick={() => { setActiveTab('type'); initTypeQueue(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'type' ? 'bg-[#EFEAD8] text-black shadow-sm font-bold' : 'text-gray-600'
            }`}
          >
            <PenTool size={18} /> Gõ từ (Có lặp lại từ sai)
          </button>
        </div>

        {/* MODE 1: LẬT THẺ */}
        {activeTab === 'flashcard' && currentWord && (
          <div className="space-y-4">
            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className="cursor-pointer bg-[#EFEAD8]/70 rounded-3xl p-8 md:p-10 text-center shadow-sm border border-[#E0D8C3] min-h-[300px] flex flex-col justify-center items-center relative transition-all hover:border-gray-400"
            >
              <span className="absolute top-4 right-4 text-xs font-semibold text-gray-400 flex items-center gap-1">
                <Eye size={14} /> Chạm để {isFlipped ? 'ẩn' : 'lật mặt sau'}
              </span>

              {!isFlipped ? (
                <div className="space-y-3">
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">
                    {currentWord.word}
                  </h2>
                  {currentWord.pronunciation && (
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm bg-[#E0D8C3] text-gray-800 px-3 py-1 rounded-full font-medium">
                        /{currentWord.pronunciation}/
                      </span>
                      <button 
                        onClick={(e) => handleSpeak(e, currentWord.word)} 
                        className="p-1.5 hover:bg-[#E0D8C3] rounded-full transition-colors"
                      >
                        <Volume2 size={20} className="text-gray-700" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 pt-4">(Nhấp vào thẻ để xem nghĩa & ví dụ)</p>
                </div>
              ) : (
                <div className="space-y-4 w-full max-w-xl animate-fadeIn">
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-green-800">
                    {currentWord.meaning}
                  </h2>
                  
                  <div className="space-y-3 pt-2 text-left bg-white/50 p-4 rounded-2xl border border-[#E0D8C3]">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Ví dụ minh họa:</span>
                    {currentWord.examples.map((ex, idx) => (
                      <div key={idx} className="space-y-0.5 border-b border-gray-200/60 pb-2 last:border-none last:pb-0">
                        <p className="text-sm md:text-base italic text-gray-800 flex items-center justify-between gap-2">
                          <span>"{ex.en}"</span>
                          <button 
                            onClick={(e) => handleSpeak(e, ex.en)} 
                            className="p-1 hover:bg-[#E0D8C3] rounded-full shrink-0"
                          >
                            <Volume2 size={16} className="text-gray-600" />
                          </button>
                        </p>
                        <p className="text-xs md:text-sm text-gray-600">→ {ex.vi}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-4">
              <button onClick={handlePrev} disabled={currentIndex === 0} className="p-2 disabled:opacity-30 hover:bg-[#EFEAD8] rounded-full">
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-6">
                <button onClick={handleNext} className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <RotateCcw size={16} /> Chưa nhớ
                </button>
                <button onClick={() => { setRememberedCount(prev => Math.min(prev + 1, currentSet.words.length)); handleNext(); }} className="flex items-center gap-1.5 text-sm font-medium text-green-700 font-bold">
                  <Check size={16} /> Đã nhớ
                </button>
              </div>
              <button onClick={handleNext} disabled={currentIndex === currentSet.words.length - 1} className="p-2 disabled:opacity-30 hover:bg-[#EFEAD8] rounded-full">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* MODE 2: TRẮC NGHIỆM */}
        {activeTab === 'quiz' && currentWord && (
          <div className="space-y-6">
            <div className="bg-[#EFEAD8]/60 rounded-3xl p-6 text-center border border-[#E0D8C3] space-y-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Từ cần chọn nghĩa:</span>
              <h2 className="text-3xl font-serif font-bold text-gray-900 flex items-center justify-center gap-2">
                {currentWord.word}
                <button onClick={(e) => handleSpeak(e, currentWord.word)} className="p-1 hover:bg-[#E0D8C3] rounded-full">
                  <Volume2 size={20} />
                </button>
              </h2>
              <p className="text-sm text-gray-600">/{currentWord.pronunciation}/</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quizOptions.map((opt) => {
                const isSelected = selectedOption === opt.id;
                const isCorrect = opt.id === currentWord.id;

                let btnStyle = "bg-white border-[#E0D8C3] hover:border-gray-400";
                if (selectedOption !== null) {
                  if (isCorrect) btnStyle = "bg-green-100 border-green-500 text-green-900 font-bold";
                  else if (isSelected) btnStyle = "bg-red-100 border-red-500 text-red-900";
                }

                return (
                  <button
                    key={opt.id}
                    disabled={selectedOption !== null}
                    onClick={() => setSelectedOption(opt.id)}
                    className={`p-4 rounded-2xl border text-left text-sm md:text-base transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt.meaning}</span>
                    {selectedOption !== null && isCorrect && <CheckCircle2 className="text-green-600" size={20} />}
                    {selectedOption !== null && isSelected && !isCorrect && <XCircle className="text-red-500" size={20} />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button 
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="flex items-center gap-1.5 bg-gray-200 text-gray-800 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-300 disabled:opacity-40"
              >
                <ChevronLeft size={16} /> Câu trước
              </button>

              <button 
                onClick={handleNext}
                disabled={currentIndex === currentSet.words.length - 1}
                className="flex items-center gap-1.5 bg-black text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-40"
              >
                Câu tiếp theo <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* MODE 3: GÕ TỪ (CÓ LẶP LẠI TỪ SAI) */}
        {activeTab === 'type' && (
          <div>
            {typeIndex < typeQueue.length ? (
              <div className="space-y-6">
                <div className="bg-[#EFEAD8]/60 rounded-3xl p-8 text-center border border-[#E0D8C3] space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
                    <span>Lượt gõ: {typeIndex + 1} / {typeQueue.length}</span>
                    {reviewCount > 0 && (
                      <span className="text-orange-600 bg-orange-100 px-2.5 py-0.5 rounded-full">
                        Cần ôn lại: {reviewCount} từ
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block pt-2">Nghĩa tiếng Việt:</span>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
                    {currentTypeWord.meaning}
                  </h2>
                  {currentTypeWord.pronunciation && (
                    <span className="inline-block text-xs bg-[#E0D8C3] text-gray-700 px-3 py-1 rounded-full font-medium">
                      Gợi ý phiên âm: /{currentTypeWord.pronunciation}/
                    </span>
                  )}
                </div>

                {/* Ô nhập từ */}
                <form onSubmit={handleCheckType} className="space-y-4">
                  <div className="relative">
                    <input 
                      type="text"
                      value={typedInput}
                      onChange={(e) => { setTypedInput(e.target.value); setTypeResult(null); }}
                      placeholder="Gõ từ tiếng Anh tương ứng vào đây..."
                      className={`w-full p-4 rounded-2xl border text-lg outline-none transition-all ${
                        typeResult === 'correct' 
                          ? 'border-green-500 bg-green-50 text-green-900 font-bold' 
                          : typeResult === 'incorrect' 
                          ? 'border-red-500 bg-red-50 text-red-900' 
                          : 'border-gray-300 focus:border-black bg-white'
                      }`}
                    />
                    {typeResult === null && (
                      <button 
                        type="submit"
                        className="absolute right-2 top-2 bottom-2 bg-black text-white px-5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                      >
                        Kiểm tra
                      </button>
                    )}
                  </div>

                  {/* Thông báo kết quả gõ */}
                  {typeResult === 'correct' && (
                    <div className="p-4 rounded-2xl bg-green-100 border border-green-300 text-green-800 text-sm flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                        <span>Chính xác 100%! Từ là: <strong>{currentTypeWord.word}</strong></span>
                      </div>
                      <button 
                        type="button"
                        onClick={handleNextTypeWord}
                        className="bg-green-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-green-800"
                      >
                        Từ tiếp theo →
                      </button>
                    </div>
                  )}

                  {typeResult === 'incorrect' && (
                    <div className="p-4 rounded-2xl bg-red-100 border border-red-300 text-red-800 text-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <XCircle size={18} className="text-red-600 shrink-0" />
                          <span>Chưa chính xác! (Từ này sẽ lặp lại ở cuối bài)</span>
                        </div>
                        <button 
                          type="button"
                          onClick={handleNextTypeWord}
                          className="bg-red-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-red-800"
                        >
                          Đã hiểu, tiếp tục →
                        </button>
                      </div>
                      <p className="text-xs text-red-700 pl-6">Đáp án chuẩn: <strong>{currentTypeWord.word}</strong></p>
                    </div>
                  )}
                </form>
              </div>
            ) : (
              /* Hoàn thành danh sách gõ */
              <div className="bg-[#EFEAD8]/80 rounded-3xl p-8 text-center border border-[#E0D8C3] space-y-4">
                <CheckCircle2 size={48} className="text-green-600 mx-auto" />
                <h2 className="text-2xl font-bold text-gray-900">Chúc mừng! Bạn đã gõ chính xác toàn bộ từ vựng!</h2>
                <p className="text-sm text-gray-600">Tất cả các từ gõ sai đều đã được ôn tập và hoàn thành xuất sắc.</p>
                <button 
                  onClick={initTypeQueue}
                  className="inline-flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800"
                >
                  <RefreshCw size={16} /> Luyện tập lại bộ này
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tiến độ */}
        <div className="flex justify-between items-center text-xs font-semibold text-gray-500 px-2 pt-2 border-t border-gray-300">
          <span>Tiến độ: {currentIndex + 1} / {currentSet.words.length} từ</span>
          <span>Đã ghi nhớ: {rememberedCount} từ</span>
        </div>

      </div>
    </div>
  );
}
