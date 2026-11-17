// =========================================================================
// DỊCH VỤ TRA CỨU TỪ ĐIỂN, TẠO CÂU VÍ DỤ TOEIC & KIỂM TRA ĐỐI CHIẾU NGHĨA
// Đảm bảo 100% không tạo câu mẫu ghép từ ngớ ngẩn (No Mad-Libs)
// Luôn ưu tiên ví dụ thực tế chuẩn ETS, Free Dictionary API & Tatoeba
// =========================================================================

// Kho ví dụ TOEIC chuẩn ETS cho các từ vựng thường gặp trong bài thi
export const CURATED_TOEIC_EXAMPLES = {
  'northeastern': {
    partOfSpeech: 'adj',
    example: 'The company is planning to expand its retail operations into the northeastern region.',
    translation: 'Công ty đang có kế hoạch mở rộng hoạt động bán lẻ sang khu vực đông bắc.'
  },
  'northwestern': {
    partOfSpeech: 'adj',
    example: 'Heavy rainfall was reported across several northwestern provinces this morning.',
    translation: 'Mưa lớn đã được ghi nhận trên khắp các tỉnh tây bắc vào sáng nay.'
  },
  'southeastern': {
    partOfSpeech: 'adj',
    example: 'The organization will hold its annual regional conference in the southeastern district.',
    translation: 'Tổ chức sẽ tổ chức hội nghị khu vực thường niên tại quận đông nam.'
  },
  'southwestern': {
    partOfSpeech: 'adj',
    example: 'Solar energy projects have expanded rapidly throughout the southwestern corridor.',
    translation: 'Các dự án năng lượng mặt trời đã mở rộng nhanh chóng dọc theo hành lang tây nam.'
  },
  'northern': {
    partOfSpeech: 'adj',
    example: 'Regular shipments to northern branch warehouses will resume next Monday.',
    translation: 'Các chuyến hàng định kỳ đến các kho chi nhánh phía bắc sẽ tiếp tục vào thứ Hai tới.'
  },
  'southern': {
    partOfSpeech: 'adj',
    example: 'The enterprise operates three modern distribution hubs in the southern region.',
    translation: 'Doanh nghiệp vận hành 3 trung tâm phân phối hiện đại ở khu vực phía nam.'
  },
  'eastern': {
    partOfSpeech: 'adj',
    example: 'The new sales representative will manage client accounts across the eastern division.',
    translation: 'Đại diện bán hàng mới sẽ quản lý các tài khoản khách hàng trên toàn bộ phận phía đông.'
  },
  'western': {
    partOfSpeech: 'adj',
    example: 'A modern research facility was constructed in the western industrial park.',
    translation: 'Một cơ sở nghiên cứu hiện đại đã được xây dựng tại khu công nghiệp phía tây.'
  },
  'productive': {
    partOfSpeech: 'adj',
    example: 'Flexible work schedules have made our employees significantly more productive.',
    translation: 'Lịch làm việc linh hoạt đã giúp các nhân viên của chúng tôi làm việc hiệu quả hơn đáng kể.'
  },
  'accommodate': {
    partOfSpeech: 'verb',
    example: 'The main conference hall can easily accommodate up to 500 attendees.',
    translation: 'Hội trường hội nghị chính có thể dễ dàng chứa tới 500 người tham dự.'
  },
  'abide by': {
    partOfSpeech: 'phr',
    example: 'All personnel must strictly abide by company safety guidelines and protocols.',
    translation: 'Tất cả nhân viên phải tuân thủ nghiêm ngặt các quy định an toàn của công ty.'
  },
  'account for': {
    partOfSpeech: 'phr',
    example: 'Online transactions now account for nearly 45 percent of our total quarterly sales.',
    translation: 'Các giao dịch trực tuyến hiện chiếm gần 45% tổng doanh số hàng quý của chúng tôi.'
  },
  'contingency plan': {
    partOfSpeech: 'phr',
    example: 'The project manager developed a contingency plan in case of unexpected equipment failure.',
    translation: 'Quản lý dự án đã xây dựng kế hoạch dự phòng đề phòng trường hợp hỏng hóc thiết bị đột xuất.'
  },
  'substantiate': {
    partOfSpeech: 'verb',
    example: 'The applicant provided several letters of recommendation to substantiate his claims.',
    translation: 'Người nộp đơn đã cung cấp một số thư giới thiệu để chứng minh cho những tuyên bố của mình.'
  },
  'prerequisite': {
    partOfSpeech: 'noun',
    example: 'A minimum of three years of managerial experience is an absolute prerequisite for this role.',
    translation: 'Tối thiểu 3 năm kinh nghiệm quản lý là điều kiện tiên quyết bắt buộc cho vai trò này.'
  },
  'feasibility': {
    partOfSpeech: 'noun',
    example: 'The engineering team is currently conducting a feasibility study on the new production line.',
    translation: 'Đội ngũ kỹ thuật hiện đang tiến hành nghiên cứu tính khả thi về dây chuyền sản xuất mới.'
  },
  'reimbursement': {
    partOfSpeech: 'noun',
    example: 'Please retain all travel receipts to ensure prompt reimbursement of business expenses.',
    translation: 'Vui lòng giữ lại toàn bộ hóa đơn đi lại để đảm bảo việc hoàn tiền công tác phí nhanh chóng.'
  },
  'warranty': {
    partOfSpeech: 'noun',
    example: 'The new electronic equipment is covered by a comprehensive two-year manufacturer warranty.',
    translation: 'Thiết bị điện tử mới được bảo hành toàn diện 2 năm từ nhà sản xuất.'
  },
  'eligible': {
    partOfSpeech: 'adj',
    example: 'Full-time employees who have worked for six months are eligible for health insurance coverage.',
    translation: 'Nhân viên toàn thời gian làm việc được 6 tháng sẽ đủ điều kiện tham gia bảo hiểm y tế.'
  },
  'mandatory': {
    partOfSpeech: 'adj',
    example: 'Attendance at the annual workplace safety workshop is mandatory for all warehouse staff.',
    translation: 'Việc tham dự hội thảo an toàn lao động thường niên là bắt buộc đối với mọi nhân viên kho.'
  },
  'confidential': {
    partOfSpeech: 'adj',
    example: 'All customer financial records must be kept completely confidential at all times.',
    translation: 'Mọi hồ sơ tài chính của khách hàng phải được giữ bí mật tuyệt đối trong mọi thời điểm.'
  },
  'preliminary': {
    partOfSpeech: 'adj',
    example: 'The marketing team presented the preliminary market research findings to the board.',
    translation: 'Đội ngũ tiếp thị đã trình bày những phát hiện nghiên cứu thị trường sơ bộ lên hội đồng.'
  },
  'comprehensive': {
    partOfSpeech: 'adj',
    example: 'The company offers a comprehensive training program for all newly hired account managers.',
    translation: 'Công ty cung cấp một chương trình đào tạo toàn diện cho tất cả các quản lý tài khoản mới tuyển.'
  },
  'substantial': {
    partOfSpeech: 'adj',
    example: 'The corporation announced a substantial increase in its annual research and development budget.',
    translation: 'Tập đoàn đã công bố mức tăng đáng kể trong ngân sách nghiên cứu và phát triển hàng năm.'
  },
  'lucrative': {
    partOfSpeech: 'adj',
    example: 'The business development team successfully secured a lucrative multi-year government contract.',
    translation: 'Nhóm phát triển kinh doanh đã đàm phán thành công một hợp đồng chính phủ béo bở kéo dài nhiều năm.'
  },
  'feasible': {
    partOfSpeech: 'adj',
    example: 'Management determined that opening a new regional branch in Da Nang is economically feasible.',
    translation: 'Ban quản lý xác định rằng việc mở chi nhánh khu vực mới tại Đà Nẵng là khả thi về mặt kinh tế.'
  },
  'negotiate': {
    partOfSpeech: 'verb',
    example: 'The purchasing director will meet with international suppliers to negotiate better pricing.',
    translation: 'Giám đốc mua hàng sẽ gặp các nhà cung ứng quốc tế để đàm phán mức giá tốt hơn.'
  },
  'implement': {
    partOfSpeech: 'verb',
    example: 'The IT department plans to implement the new cloud security system next month.',
    translation: 'Phòng CNTT dự kiến sẽ triển khai hệ thống bảo mật đám mây mới vào tháng tới.'
  },
  'comply with': {
    partOfSpeech: 'phr',
    example: 'All factories must strictly comply with national environmental protection standards.',
    translation: 'Mọi nhà máy phải tuân thủ nghiêm ngặt các tiêu chuẩn bảo vệ môi trường quốc gia.'
  },
  'efficient': {
    partOfSpeech: 'adj',
    example: 'The updated automated billing software provides a more efficient way to process invoices.',
    translation: 'Phần mềm lập hóa đơn tự động cập nhật cung cấp phương thức hiệu quả hơn để xử lý hóa đơn.'
  },
  'notify': {
    partOfSpeech: 'verb',
    example: 'Please notify the human resources department immediately if your contact details change.',
    translation: 'Vui lòng thông báo ngay cho phòng nhân sự nếu thông tin liên lạc của bạn thay đổi.'
  },
  'annual': {
    partOfSpeech: 'adj',
    example: 'Shareholders are cordially invited to attend the company annual general meeting.',
    translation: 'Các cổ đông được trân trọng kính mời tham dự đại hội cổ đông thường niên của công ty.'
  },
  'significantly': {
    partOfSpeech: 'adv',
    example: 'Product quality and customer satisfaction have improved significantly since the restructuring.',
    translation: 'Chất lượng sản phẩm và sự hài lòng của khách hàng đã cải thiện đáng kể kể từ đợt tái cấu trúc.'
  },
  'proactive': {
    partOfSpeech: 'adj',
    example: 'We appreciate employees who take a proactive approach to solving client issues.',
    translation: 'Chúng tôi đánh giá cao những nhân viên có cách tiếp cận chủ động để giải quyết vấn đề của khách hàng.'
  },
  'prospective': {
    partOfSpeech: 'adj',
    example: 'The sales team scheduled product demonstration meetings with prospective clients.',
    translation: 'Đội ngũ bán hàng đã lên lịch các buổi họp giới thiệu sản phẩm với khách hàng tiềm năng.'
  },
  'tentative': {
    partOfSpeech: 'adj',
    example: 'The committee reached a tentative agreement pending final approval from executive management.',
    translation: 'Ủy ban đã đạt được thỏa thuận dự kiến chờ sự phê duyệt cuối cùng từ ban điều hành.'
  },
  'reluctant': {
    partOfSpeech: 'adj',
    example: 'Investors were reluctant to commit capital until the economic climate stabilized.',
    translation: 'Các nhà đầu tư đã ngần ngại rót vốn cho đến khi môi trường kinh tế ổn định trở lại.'
  },
  'deliberate': {
    partOfSpeech: 'adj',
    example: 'The board engaged in deliberate discussions before deciding on the corporate merger.',
    translation: 'Hội đồng quản trị đã tham gia vào các cuộc thảo luận kỹ lưỡng trước khi quyết định sáp nhập doanh nghiệp.'
  },
  'adjacent': {
    partOfSpeech: 'adj',
    example: 'The new storage warehouse is located adjacent to the international cargo port.',
    translation: 'Nhà kho lưu trữ mới nằm liền kề với cảng hàng hóa quốc tế.'
  },
  'unanimous': {
    partOfSpeech: 'adj',
    example: 'The executive committee reached a unanimous decision to expand into Southeast Asian markets.',
    translation: 'Ủy ban điều hành đã đạt được quyết định nhất trí mở rộng sang các thị trường Đông Nam Á.'
  },
  'imminent': {
    partOfSpeech: 'adj',
    example: 'The spokesperson announced that the launch of the flagship smartphone is imminent.',
    translation: 'Người phát ngôn thông báo rằng việc ra mắt chiếc điện thoại thông minh chủ lực sắp diễn ra.'
  },
  'indispensable': {
    partOfSpeech: 'adj',
    example: 'Reliable high-speed internet has become indispensable for remote office operations.',
    translation: 'Internet tốc độ cao đáng tin cậy đã trở nên không thể thiếu đối với các hoạt động văn phòng từ xa.'
  },
  'vulnerable': {
    partOfSpeech: 'adj',
    example: 'Small businesses are particularly vulnerable to sudden supply chain disruptions.',
    translation: 'Các doanh nghiệp nhỏ đặc biệt dễ bị tổn thương trước sự gián đoạn chuỗi cung ứng đột ngột.'
  },
  'imperative': {
    partOfSpeech: 'adj',
    example: 'It is imperative that all financial reports be audited before the end of the fiscal year.',
    translation: 'Điều cấp thiết là tất cả các báo cáo tài chính phải được kiểm toán trước khi kết thúc năm tài chính.'
  },
  'rigorous': {
    partOfSpeech: 'adj',
    example: 'All newly developed automotive components undergo rigorous quality inspection procedures.',
    translation: 'Tất cả các bộ phận ô tô mới phát triển đều trải qua các quy trình kiểm tra chất lượng nghiêm ngặt.'
  },
  'fluctuate': {
    partOfSpeech: 'verb',
    example: 'Raw material prices tend to fluctuate depending on international market conditions.',
    translation: 'Giá nguyên vật liệu thô có xu hướng biến động tùy thuộc vào các điều kiện thị trường quốc tế.'
  },
  'initiative': {
    partOfSpeech: 'noun',
    example: 'The green energy initiative helped the company reduce its carbon footprint by twenty percent.',
    translation: 'Sáng kiến năng lượng xanh đã giúp công ty giảm 20% lượng phát thải carbon.'
  },
  'facilitate': {
    partOfSpeech: 'verb',
    example: 'The new digital platform was designed to facilitate smoother communication between departments.',
    translation: 'Nền tảng kỹ thuật số mới được thiết kế để tạo điều kiện liên lạc thông suốt hơn giữa các phòng ban.'
  },
  'collaborate': {
    partOfSpeech: 'verb',
    example: 'Our software engineers will collaborate closely with external designers on the user interface.',
    translation: 'Các kỹ sư phần mềm của chúng tôi sẽ hợp tác chặt chẽ với các nhà thiết kế bên ngoài về giao diện người dùng.'
  },
  'revenue': {
    partOfSpeech: 'noun',
    example: 'Quarterly revenue exceeded market expectations thanks to strong international demand.',
    translation: 'Doanh thu hàng quý đã vượt kỳ vọng thị trường nhờ nhu cầu quốc tế tăng mạnh.'
  },
  'expedite': {
    partOfSpeech: 'verb',
    example: 'Customers may pay an additional courier fee to expedite the delivery of urgent documents.',
    translation: 'Khách hàng có thể trả thêm phí chuyển phát nhanh để xúc tiến việc giao tài liệu khẩn cấp.'
  },
  'compromise': {
    partOfSpeech: 'verb',
    example: 'Both labor unions and management were willing to compromise to reach a mutually beneficial agreement.',
    translation: 'Cả công đoàn và ban quản lý đều sẵn sàng thỏa hiệp để đạt được thỏa thuận cùng có lợi.'
  },
  'supervise': {
    partOfSpeech: 'verb',
    example: 'The senior engineer was assigned to supervise construction work on the new facility.',
    translation: 'Kỹ sư cao cấp đã được phân công giám sát công tác thi công tại cơ sở mới.'
  },
  'renovate': {
    partOfSpeech: 'verb',
    example: 'The hotel will temporarily close its fifth floor to renovate guest suites and corridors.',
    translation: 'Khách sạn sẽ tạm thời đóng cửa tầng 5 để cải tạo lại các phòng suite và hành lang.'
  },
  'scrutinize': {
    partOfSpeech: 'verb',
    example: 'Tax auditors will thoroughly scrutinize corporate financial statements for any irregularities.',
    translation: 'Các kiểm toán viên thuế sẽ xem xét kỹ lưỡng các báo cáo tài chính của doanh nghiệp để tìm bất kỳ điểm bất thường nào.'
  },
  'streamline': {
    partOfSpeech: 'verb',
    example: 'The automated software helped streamline procurement and inventory tracking procedures.',
    translation: 'Phần mềm tự động đã giúp tinh giản các quy trình mua sắm và theo dõi hàng tồn kho.'
  },
  'deadline': {
    partOfSpeech: 'noun',
    example: 'All project deliverables must be submitted prior to the Friday noon deadline.',
    translation: 'Tất cả các sản phẩm bàn giao của dự án phải được nộp trước thời hạn trưa thứ Sáu.'
  },
  'discrepancy': {
    partOfSpeech: 'noun',
    example: 'The internal audit revealed a minor discrepancy between warehouse inventory and sales receipts.',
    translation: 'Đợt kiểm toán nội bộ đã phát hiện một sự sai lệch nhỏ giữa tồn kho và biên lai bán hàng.'
  },
  'inventory': {
    partOfSpeech: 'noun',
    example: 'Warehouse staff conduct a complete inventory count at the end of every fiscal quarter.',
    translation: 'Nhân viên nhà kho tiến hành kiểm kê toàn bộ hàng tồn kho vào cuối mỗi quý tài chính.'
  },
  'vendor': {
    partOfSpeech: 'noun',
    example: 'The purchasing officer selected an approved local vendor for computer office supplies.',
    translation: 'Cán bộ mua sắm đã chọn một nhà cung cấp địa phương được phê duyệt cho văn phòng phẩm máy tính.'
  }
};

/**
 * Kiểm tra xem một câu ví dụ có phải là câu mẫu Mad-libs sinh tự động bị lỗi không
 */
export const isBadTemplateSentence = (exampleStr, translationStr = '') => {
  if (!exampleStr && !translationStr) return false;
  const ex = String(exampleStr || '');
  const tr = String(translationStr || '');

  const badEnSnippets = [
    'The committee submitted a comprehensive report on the',
    'The management recognized that the new procedure was highly',
    'All department heads will meet next Monday to',
    'Quarterly profits and customer satisfaction rates have increased',
    'All staff members are strictly instructed to'
  ];

  const badViSnippets = [
    'Ủy ban đã nộp một báo cáo toàn diện về',
    'Ban quản lý ghi nhận rằng quy trình mới rất',
    'Tất cả trưởng bộ phận sẽ họp vào thứ Hai tới để',
    'Lợi nhuận theo quý và mức độ hài lòng của khách hàng đã tăng',
    'Toàn bộ nhân viên được hướng dẫn nghiêm ngặt phải'
  ];

  return badEnSnippets.some(p => ex.includes(p)) || badViSnippets.some(p => tr.includes(p));
};

/**
 * Phán đoán loại từ chính xác dựa trên cấu trúc hình thái học tiếng Anh (Morphology)
 */
export const inferPartOfSpeech = (rawWord) => {
  const w = (rawWord || '').trim().toLowerCase();
  if (!w) return 'noun';
  if (w.includes(' ')) return 'phr';

  if (CURATED_TOEIC_EXAMPLES[w]?.partOfSpeech) {
    return CURATED_TOEIC_EXAMPLES[w].partOfSpeech;
  }

  // Hậu tố tính từ (Adjective suffixes)
  if (/(ern|able|ible|ful|less|ous|ive|ic|al|ish|ent|ant)$/i.test(w)) return 'adj';

  // Hậu tố trạng từ (Adverb suffixes)
  if (/(ly)$/i.test(w) && !/(family|friendly|lovely|silly|ugly|lonely|orderly|costly)$/i.test(w)) return 'adv';

  // Hậu tố danh từ (Noun suffixes)
  if (/(tion|sion|ment|ness|ity|ance|ence|ship|hood|dom|ism|ist|er|or|ee|logy)$/i.test(w)) return 'noun';

  // Hậu tố động từ (Verb suffixes)
  if (/(ize|ise|ify|ate|en)$/i.test(w)) return 'verb';

  return 'noun';
};

/**
 * Lấy câu ví dụ TOEIC: CHỈ lấy từ kho ETS tinh tuyển.
 * TUYỆT ĐỐI KHÔNG sinh câu ghép từ giả tạo (No synthetic mad-libs).
 */
export const getToeicExampleFallback = (rawWord, pos = 'noun', meaning = '') => {
  const cleanWord = (rawWord || '').trim();
  if (!cleanWord) return { example: '', translation: '' };

  const lowerWord = cleanWord.toLowerCase();

  // 1. Nếu có trong kho ETS chuẩn
  if (CURATED_TOEIC_EXAMPLES[lowerWord]) {
    return {
      example: CURATED_TOEIC_EXAMPLES[lowerWord].example,
      translation: CURATED_TOEIC_EXAMPLES[lowerWord].translation
    };
  }

  // 2. Không có câu chuẩn -> trả về rỗng để hiển thị thẻ gọn gàng hoặc tra cứu async
  return { example: '', translation: '' };
};

/**
 * Tìm kiếm câu ví dụ thực tế chuẩn xác từ các kho tri thức chuẩn (Free Dictionary API + Tatoeba Corpus)
 */
export const fetchAuthenticSentence = async (rawWord) => {
  const word = (rawWord || '').trim();
  if (!word) return { example: '', translation: '' };

  const lower = word.toLowerCase();
  if (CURATED_TOEIC_EXAMPLES[lower]) {
    return {
      example: CURATED_TOEIC_EXAMPLES[lower].example,
      translation: CURATED_TOEIC_EXAMPLES[lower].translation
    };
  }

  // 1. Thử Free Dictionary API (cho từ đơn)
  if (!word.includes(' ')) {
    try {
      const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if (dictRes.ok) {
        const dictData = await dictRes.json();
        for (const entry of dictData || []) {
          for (const m of entry.meanings || []) {
            for (const def of m.definitions || []) {
              if (def.example && def.example.length >= 15 && def.example.length <= 150) {
                const ex = def.example.trim();
                const trRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(ex)}`);
                const trData = await trRes.json();
                const tr = trData[0]?.[0]?.[0] || '';
                return { example: ex, translation: tr };
              }
            }
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // 2. Thử Tatoeba Corpus API (Kho hàng triệu câu tiếng Anh thực tế có người bản xứ kiểm duyệt)
  try {
    const tatoebaRes = await fetch(`https://tatoeba.org/en/api_v0/search?from=eng&query=${encodeURIComponent(word)}`);
    if (tatoebaRes.ok) {
      const tData = await tatoebaRes.json();
      const results = tData.results || [];
      const wordRegex = new RegExp('\\b' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
      
      // Ưu tiên câu có độ dài chuẩn (25 - 130 ký tự) và chứa chính xác từ vựng
      let candidate = results.find(r => r.text && wordRegex.test(r.text) && r.text.length >= 25 && r.text.length <= 130);
      if (!candidate) {
        candidate = results.find(r => r.text && wordRegex.test(r.text) && r.text.length <= 150);
      }
      if (!candidate && results[0]?.text) {
        candidate = results[0];
      }

      if (candidate && candidate.text) {
        const ex = candidate.text.trim();
        const trRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(ex)}`);
        const trData = await trRes.json();
        const tr = trData[0]?.[0]?.[0] || '';
        return { example: ex, translation: tr };
      }
    }
  } catch (e) {
    // ignore
  }

  return { example: '', translation: '' };
};

/**
 * Tra cứu từ vựng tiếng Anh: Phiên âm IPA, loại từ, nghĩa tiếng Việt chuẩn, và ví dụ TOEIC thực tế
 */
export const lookupEnglishWord = async (rawWord) => {
  const word = (rawWord || '').trim();
  if (!word) {
    return { found: false, error: 'Vui lòng nhập từ vựng tiếng Anh' };
  }

  const result = {
    word,
    phonetic: '',
    partOfSpeech: inferPartOfSpeech(word),
    meaning: '',
    allMeanings: [],
    example: '',
    exampleTranslation: '',
    found: false
  };

  // 1. Kiểm tra kho ví dụ TOEIC chuẩn trước
  const curated = CURATED_TOEIC_EXAMPLES[word.toLowerCase()];
  if (curated) {
    result.example = curated.example;
    result.exampleTranslation = curated.translation;
    if (curated.partOfSpeech) result.partOfSpeech = curated.partOfSpeech;
  }

  // 2. Tra nghĩa tiếng Việt & loại từ qua Google Translate Single API
  try {
    const transUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&dt=bd&q=${encodeURIComponent(word)}`;
    const transRes = await fetch(transUrl);
    if (transRes.ok) {
      const transData = await transRes.json();
      
      const primaryTrans = transData[0]?.[0]?.[0] || '';
      result.meaning = primaryTrans;

      if (transData[1] && Array.isArray(transData[1])) {
        const meaningsList = [];
        transData[1].forEach(item => {
          const pos = item[0] || '';
          if (!result.partOfSpeech || result.partOfSpeech === 'noun') {
            if (pos === 'verb') result.partOfSpeech = 'verb';
            else if (pos === 'adjective') result.partOfSpeech = 'adj';
            else if (pos === 'adverb') result.partOfSpeech = 'adv';
          }
          const wordsForPos = item[1] || [];
          meaningsList.push(...wordsForPos.slice(0, 4));
        });
        result.allMeanings = Array.from(new Set([primaryTrans, ...meaningsList])).filter(Boolean);
        if (result.allMeanings.length > 0) {
          result.meaning = result.allMeanings.slice(0, 3).join(', ');
        }
      } else {
        result.allMeanings = [primaryTrans];
      }
      result.found = true;
    }
  } catch (err) {
    console.warn('Google Translate API lookup failed:', err);
  }

  // 3. Tra phiên âm IPA và câu ví dụ từ Free Dictionary API (cho từ đơn)
  try {
    if (!word.includes(' ')) {
      const dictUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
      const dictRes = await fetch(dictUrl);
      if (dictRes.ok) {
        const dictData = await dictRes.json();
        const entry = dictData[0];
        if (entry) {
          result.phonetic = entry.phonetic || entry.phonetics?.find(p => p.text)?.text || '';
          
          const meaningObj = entry.meanings?.[0];
          if (meaningObj?.partOfSpeech) {
            const pos = meaningObj.partOfSpeech.toLowerCase();
            if (pos.includes('verb')) result.partOfSpeech = 'verb';
            else if (pos.includes('adj')) result.partOfSpeech = 'adj';
            else if (pos.includes('adv')) result.partOfSpeech = 'adv';
            else if (pos.includes('noun')) result.partOfSpeech = 'noun';
          }

          if (!result.example) {
            for (const m of entry.meanings || []) {
              for (const def of m.definitions || []) {
                if (def.example && def.example.length >= 15 && def.example.length <= 150) {
                  result.example = def.example.trim();
                  break;
                }
              }
              if (result.example) break;
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Free Dictionary API lookup failed:', err);
  }

  // 4. Nếu vẫn chưa có câu ví dụ, tìm qua Tatoeba API (Kho câu thực tế)
  if (!result.example) {
    try {
      const tatoebaUrl = `https://tatoeba.org/en/api_v0/search?from=eng&query=${encodeURIComponent(word)}`;
      const tatoebaRes = await fetch(tatoebaUrl);
      if (tatoebaRes.ok) {
        const tatoebaData = await tatoebaRes.json();
        const results = tatoebaData.results || [];
        const wordRegex = new RegExp('\\b' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
        
        let match = results.find(r => r.text && wordRegex.test(r.text) && r.text.length >= 25 && r.text.length <= 130);
        if (!match) {
          match = results.find(r => r.text && wordRegex.test(r.text) && r.text.length <= 150);
        }
        if (!match && results[0]?.text) {
          match = results[0];
        }

        if (match && match.text) {
          result.example = match.text.trim();
        }
      }
    } catch (e) {
      console.warn('Tatoeba search failed:', e);
    }
  }

  // 5. Dịch câu ví dụ sang tiếng Việt nếu đã tìm được câu mà chưa có bản dịch
  if (result.example && !result.exampleTranslation) {
    try {
      const exTransUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(result.example)}`;
      const exRes = await fetch(exTransUrl);
      if (exRes.ok) {
        const exData = await exRes.json();
        result.exampleTranslation = exData[0]?.[0]?.[0] || '';
      }
    } catch (e) {
      // ignore
    }
  }

  return result;
};

/**
 * Kiểm tra xem nghĩa người dùng nhập có khớp với nghĩa chuẩn từ điển không
 */
export const checkUserMeaningAccuracy = (userMeaning, dictionaryResult) => {
  if (!userMeaning || !userMeaning.trim()) {
    return {
      status: 'empty',
      message: 'Chưa có nghĩa để đối chiếu. Bạn có thể sử dụng nghĩa gợi ý từ điển bên dưới.',
      isAccurate: false
    };
  }

  const userWords = userMeaning.toLowerCase().replace(/[,;./]/g, ' ').split(/\s+/).filter(Boolean);
  const dictMeanings = (dictionaryResult.allMeanings || [dictionaryResult.meaning || ''])
    .map(m => m.toLowerCase());

  let matchFound = false;
  let matchedTerm = '';

  for (const dm of dictMeanings) {
    const dmClean = dm.toLowerCase();
    for (const uw of userWords) {
      if (uw.length >= 2 && dmClean.includes(uw)) {
        matchFound = true;
        matchedTerm = dm;
        break;
      }
    }
    if (matchFound) break;
  }

  if (matchFound) {
    return {
      status: 'good',
      message: `Rất chuẩn xác! Nghĩa bạn dịch khớp với từ điển: "${matchedTerm}".`,
      isAccurate: true,
      suggestedMeaning: dictionaryResult.meaning
    };
  } else {
    return {
      status: 'warning',
      message: `Nghĩa bạn nhập có thể khác với từ điển thông dụng ("${dictionaryResult.meaning}"). Hãy kiểm tra lại xem có đúng ngữ cảnh TOEIC không nhé!`,
      isAccurate: false,
      suggestedMeaning: dictionaryResult.meaning
    };
  }
};
