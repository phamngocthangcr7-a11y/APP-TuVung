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
  RefreshCw,
  FolderOpen,
  Sparkles,
  Trash2
} from 'lucide-react';

/* =========================================================================
   HÀM TỰ ĐỘNG CHUẨN HÓA UNICODE VIỆT NAM (SỬA TẤT CẢ LỖI HỞ DẤU TỰ ĐỘNG)
   ========================================================================= */
const fixVietnamese = (text) => {
  if (!text) return '';
  return text.normalize('NFC');
};

/* =========================================================================
   DANH SÁCH BỘ TỪ VỰNG TỔNG HỢP
   ========================================================================= */
const RAW_VOCAB_SETS = [
  {
    id: 1,
    title: "1. Từ vựng ảnh của bạn (13 từ)",
    words: [
      { id: 101, word: "significantly", meaning: "đáng kể, một cách đáng kể", pronunciation: "sig-NIF-i-cần-li", example: "Sales increased significantly this quarter.", exampleTranslation: "Doanh số đã tăng đáng kể trong quý này." },
      { id: 102, word: "persuasively", meaning: "một cách thuyết phục", pronunciation: "pờ-SUÂY-siv-li", example: "She spoke persuasively during the meeting.", exampleTranslation: "Cô ấy nói chuyện một cách thuyết phục trong cuộc họp." },
      { id: 103, word: "proficiently", meaning: "một cách thành thạo", pronunciation: "pờ-FI-shần-li", example: "He uses the software proficiently.", exampleTranslation: "Anh ấy sử dụng phần mềm một cách thành thạo." },
      { id: 104, word: "gladly", meaning: "vui lòng, sẵn lòng", pronunciation: "GLAD-li", example: "I would gladly help you with this project.", exampleTranslation: "Tôi rất sẵn lòng giúp bạn dự án này." },
      { id: 105, word: "administrative", meaning: "thuộc về hành chính", pronunciation: "ợd-MIN-ờ-strây-tiv", example: "She handles administrative tasks.", exampleTranslation: "Cô ấy đảm nhận các công việc hành chính." },
      { id: 106, word: "establish", meaning: "thành lập, thiết lập", pronunciation: "i-STAB-lish", example: "They want to establish a new company.", exampleTranslation: "Họ muốn thành lập một công ty mới." },
      { id: 107, word: "explicit policies", meaning: "các chính sách rõ ràng/cụ thể", pronunciation: "ik-SPLI-sịt PO-lờ-siz", example: "The company has explicit policies regarding attendance.", exampleTranslation: "Công ty có các chính sách rõ ràng liên quan đến việc đi làm." },
      { id: 108, word: "diligently", meaning: "siêng năng, chăm chỉ", pronunciation: "DIL-i-jần-li", example: "He worked diligently to complete the report.", exampleTranslation: "Anh ấy làm việc chăm chỉ để hoàn thành báo cáo." },
      { id: 109, word: "curiously", meaning: "một cách tò mò", pronunciation: "KYUR-i-ợs-li", example: "The child looked curiously at the package.", exampleTranslation: "Đứa trẻ nhìn gói hàng một cách tò mò." },
      { id: 110, word: "extremely", meaning: "cực kỳ, vô cùng", pronunciation: "ik-STRIIM-li", example: "This task is extremely important.", exampleTranslation: "Nhiệm vụ này cực kỳ quan trọng." },
      { id: 111, word: "grown", meaning: "đã lớn, phát triển", pronunciation: "grôun", example: "The market has grown rapidly.", exampleTranslation: "Thị trường đã phát triển nhanh chóng." },
      { id: 112, word: "industry", meaning: "ngành công nghiệp", pronunciation: "IN-dờ-stri", example: "Technology is a fast-growing industry.", exampleTranslation: "Công nghệ là một ngành công nghiệp phát triển nhanh." },
      { id: 113, word: "rapidly", meaning: "nhanh chóng", pronunciation: "RAP-id-li", example: "The population is expanding rapidly.", exampleTranslation: "Dân số đang tăng trưởng nhanh chóng." }
    ]
  },
  {
    id: 4,
    title: "4. Từ vựng TOEIC Part 5 (68 từ)",
    words: [
      { id: 401, word: "prospect", meaning: "triển vọng, viễn cảnh", pronunciation: "PROS-pekt", example: "Job prospects are good in IT.", exampleTranslation: "Triển vọng nghề nghiệp trong ngành IT rất tốt." },
      { id: 402, word: "showroom", meaning: "phòng trưng bày", pronunciation: "SHOU-ruum", example: "We visited the car showroom.", exampleTranslation: "Chúng tôi đã đến thăm phòng trưng bày ô tô." },
      { id: 403, word: "space", meaning: "khoảng trống, không gian", pronunciation: "speis", example: "There is enough space for a desk.", exampleTranslation: "Có đủ không gian cho một cái bàn." },
      { id: 404, word: "paperwork", meaning: "giấy tờ, hồ sơ", pronunciation: "PEI-pơ-wơrk", example: "I need to complete the paperwork.", exampleTranslation: "Tôi cần hoàn thành hồ sơ giấy tờ." },
      { id: 405, word: "assistance", meaning: "sự trợ giúp, hỗ trợ", pronunciation: "ơ-SIS-tơns", example: "Thank you for your assistance.", exampleTranslation: "Cảm ơn sự hỗ trợ của bạn." },
      { id: 406, word: "billing statement", meaning: "bảng sao kê, hóa đơn thanh toán", pronunciation: "BIL-ing STEIT-mơnt", example: "Check your monthly billing statement.", exampleTranslation: "Hãy kiểm tra bảng sao kê hàng tháng của bạn." },
      { id: 407, word: "discount offers", meaning: "các ưu đãi giảm giá", pronunciation: "DIS-kaunt OF-ơrz", example: "Check out our special discount offers.", exampleTranslation: "Hãy xem các ưu đãi giảm giá đặc biệt của chúng tôi." },
      { id: 408, word: "work shifts", meaning: "các ca làm việc", pronunciation: "wơrk shifts", example: "Employees work in three shifts.", exampleTranslation: "Nhân viên làm việc theo 3 ca." },
      { id: 409, word: "reduce energy use", meaning: "giảm sử dụng năng lượng", pronunciation: "ri-DJUUS EN-ơ-ji juus", example: "Turn off lights to reduce energy use.", exampleTranslation: "Tắt đèn để giảm sử dụng năng lượng." },
      { id: 410, word: "parking permits", meaning: "giấy phép đỗ xe", pronunciation: "PAAR-king PER-mits", example: "Staff must apply for parking permits.", exampleTranslation: "Nhân viên phải đăng ký giấy phép đỗ xe." },
      { id: 411, word: "facility", meaning: "cơ sở vật chất, trang thiết bị", pronunciation: "fơ-SIL-ơ-ti", example: "The fitness facility is open 24/7.", exampleTranslation: "Cơ sở thể hình mở cửa 24/7." },
      { id: 412, word: "suitable", meaning: "phù hợp, thích hợp", pronunciation: "SUU-tơ-bơl", example: "This venue is suitable for weddings.", exampleTranslation: "Địa điểm này phù hợp cho đám cưới." },
      { id: 413, word: "occasion", meaning: "dịp, cơ hội", pronunciation: "ơ-KEI-zhơn", example: "Wear formal dress on this occasion.", exampleTranslation: "Hãy mặc đồ trang trọng vào dịp này." },
      { id: 414, word: "formal dinner", meaning: "bữa tối trang trọng", pronunciation: "FOR-mơl DIN-ơ", example: "He invited us to a formal dinner.", exampleTranslation: "Anh ấy đã mời chúng tôi đến một bữa tối trang trọng." },
      { id: 415, word: "department store", meaning: "cửa hàng bách hóa", pronunciation: "di-PAART-mơnt stor", example: "I bought this jacket at a department store.", exampleTranslation: "Tôi đã mua chiếc áo khoác này ở cửa hàng bách hóa." },
      { id: 416, word: "jewelry", meaning: "đồ trang sức", pronunciation: "DJU-ơl-ri", example: "Gold jewelry is very valuable.", exampleTranslation: "Trang sức bằng vàng rất có giá trị." },
      { id: 417, word: "sincere", meaning: "chân thành", pronunciation: "sin-SIƠ", example: "Please accept my sincere apologies.", exampleTranslation: "Xin hãy chấp nhận lời xin lỗi chân thành của tôi." },
      { id: 418, word: "interest", meaning: "sự quan tâm, thích thú, lãi suất", pronunciation: "IN-trơst", example: "She expressed interest in the job.", exampleTranslation: "Cô ấy thể hiện sự quan tâm đến công việc." },
      { id: 419, word: "long-term career", meaning: "sự nghiệp lâu dài", pronunciation: "long-tơrm kơ-RIƠ", example: "He wants a long-term career in banking.", exampleTranslation: "Anh ấy muốn một sự nghiệp lâu dài trong ngành ngân hàng." },
      { id: 420, word: "carpet", meaning: "tấm thảm", pronunciation: "PAAR-pơt", example: "The office floor is covered with carpet.", exampleTranslation: "Sàn văn phòng được trải thảm." },
      { id: 421, word: "material", meaning: "vật liệu, chất liệu", pronunciation: "mơ-TIƠ-ri-ơl", example: "Cotton is a comfortable material.", exampleTranslation: "Bông là một chất liệu thoải mái." },
      { id: 422, word: "maintain", meaning: "bảo trì, duy trì", pronunciation: "mein-TEIN", example: "We must maintain quality standards.", exampleTranslation: "Chúng ta phải duy trì các tiêu chuẩn chất lượng." },
      { id: 423, word: "publication", meaning: "ấn phẩm, sự xuất bản", pronunciation: "pab-li-KEI-shơn", example: "His latest publication sold out quickly.", exampleTranslation: "Ấn phẩm mới nhất của ông đã bán hết nhanh chóng." },
      { id: 424, word: "correct", meaning: "sửa chữa, đúng đắn", pronunciation: "kơ-REKT", example: "Please correct the spelling errors.", exampleTranslation: "Vui lòng sửa các lỗi chính tả." },
      { id: 425, word: "minor flaws", meaning: "những lỗi nhỏ, khuyết điểm nhỏ", pronunciation: "MAI-nơ florz", example: "The report has only minor flaws.", exampleTranslation: "Báo cáo chỉ có những lỗi nhỏ." },
      { id: 426, word: "drilling systems", meaning: "hệ thống khoan", pronunciation: "DRIL-ing SIS-tơmz", example: "They engineered advanced drilling systems.", exampleTranslation: "Họ đã chế tạo các hệ thống khoan tiên tiến." },
      { id: 427, word: "manufacturer", meaning: "nhà sản xuất", pronunciation: "man-juh-FAK-chơ-rơ", example: "Contact the manufacturer for repairs.", exampleTranslation: "Liên hệ với nhà sản xuất để sửa chữa." },
      { id: 428, word: "plumbing problem", meaning: "vấn đề về đường ống nước", pronunciation: "PLAM-ing PROB-lơm", example: "Call a plumber for this plumbing problem.", exampleTranslation: "Hãy gọi thợ sửa nước cho vấn đề đường ống này." },
      { id: 429, word: "persist", meaning: "tiếp diễn, kiên trì", pronunciation: "pơ-SIST", example: "If symptoms persist, see a doctor.", exampleTranslation: "Nếu các triệu chứng tiếp diễn, hãy đi khám bác sĩ." },
      { id: 430, word: "verifying", meaning: "xác nhận, kiểm tra", pronunciation: "VER-i-fai-ing", example: "We are verifying your account details.", exampleTranslation: "Chúng tôi đang xác nhận chi tiết tài khoản của bạn." },
      { id: 431, word: "maintenance costs", meaning: "chi phí bảo trì", pronunciation: "MEIN-tơ-nơns kosts", example: "Regular care reduces maintenance costs.", exampleTranslation: "Chăm sóc thường xuyên giúp giảm chi phí bảo trì." },
      { id: 432, word: "earlier", meaning: "sớm hơn", pronunciation: "Ơ-li-ơ", example: "He arrived earlier than usual.", exampleTranslation: "Anh ấy đến sớm hơn thường lệ." },
      { id: 433, word: "usual", meaning: "thường lệ, thông thường", pronunciation: "JUU-zhu-ơl", example: "She sat in her usual seat.", exampleTranslation: "Cô ấy ngồi vào chỗ ngồi thường lệ của mình." },
      { id: 434, word: "against", meaning: "chống lại, dựa vào", pronunciation: "ơ-GEINST", example: "They voted against the proposal.", exampleTranslation: "Họ đã bỏ phiếu chống lại đề xuất." },
      { id: 435, word: "along", meaning: "dọc theo", pronunciation: "ơ-LONG", example: "Trees were planted along the road.", exampleTranslation: "Cây xanh được trồng dọc theo con đường." },
      { id: 436, word: "sensitively", meaning: "một cách nhạy cảm, tinh tế", pronunciation: "SEN-si-tiv-li", example: "Handle the delicate topic sensitively.", exampleTranslation: "Xử lý chủ đề nhạy cảm một cách tinh tế." },
      { id: 437, word: "immediately", meaning: "ngay lập tức", pronunciation: "i-MII-di-ơt-li", example: "Please respond immediately.", exampleTranslation: "Vui lòng phản hồi ngay lập tức." },
      { id: 438, word: "informative", meaning: "cung cấp nhiều thông tin bổ ích", pronunciation: "in-FOR-mơ-tiv", example: "The workshop was very informative.", exampleTranslation: "Buổi hội thảo cung cấp rất nhiều thông tin bổ ích." },
      { id: 439, word: "cautious", meaning: "cẩn trọng, thận trọng", pronunciation: "KO-shơs", example: "Be cautious when driving in rain.", exampleTranslation: "Hãy thận trọng khi lái xe trong mưa." },
      { id: 440, word: "sponsor", meaning: "nhà tài trợ, tài trợ", pronunciation: "SPON-sơ", example: "The company will sponsor the event.", exampleTranslation: "Công ty sẽ tài trợ cho sự kiện." },
      { id: 441, word: "margin", meaning: "số dư, biên độ, lề", pronunciation: "MAAR-djin", example: "Profit margin increased by 5%.", exampleTranslation: "Biên lợi nhuận đã tăng 5%." },
      { id: 442, word: "compactly", meaning: "một cách gọn gàng, nhỏ gọn", pronunciation: "kơm-PAKT-li", example: "Pack your clothes compactly.", exampleTranslation: "Hãy đóng gói quần áo của bạn một cách gọn gàng." },
      { id: 443, word: "fortunate", meaning: "may mắn", pronunciation: "FOR-chơ-nơt", example: "We were fortunate to secure tickets.", exampleTranslation: "Chúng tôi đã may mắn mua được vé." },
      { id: 444, word: "possible", meaning: "có thể", pronunciation: "POS-ơ-bơl", example: "Please reply as soon as possible.", exampleTranslation: "Vui lòng trả lời càng sớm càng tốt." },
      { id: 445, word: "senseless", meaning: "vô nghĩa, ngớ ngẩn", pronunciation: "SEN-slơs", example: "It was a senseless argument.", exampleTranslation: "Đó là một cuộc tranh cãi vô nghĩa." },
      { id: 446, word: "above", meaning: "ở trên, phía trên", pronunciation: "ơ-BAV", example: "See the chart shown above.", exampleTranslation: "Xem biểu đồ được hiển thị ở trên." },
      { id: 447, word: "in order that", meaning: "để mà (liên từ)", pronunciation: "in OR-dơ đăt", example: "Study hard in order that you pass.", exampleTranslation: "Hãy học chăm chỉ để mà bạn vượt qua kỳ thi." },
      { id: 448, word: "such as", meaning: "chẳng hạn như, ví dụ như", pronunciation: "sach az", example: "Fruits such as apples are healthy.", exampleTranslation: "Các loại trái cây như táo rất tốt cho sức khỏe." },
      { id: 449, word: "in case", meaning: "phòng khi, trong trường hợp", pronunciation: "in keis", example: "Take an umbrella in case it rains.", exampleTranslation: "Hãy mang theo ô phòng khi trời mưa." },
      { id: 450, word: "as long as", meaning: "miễn là", pronunciation: "az long az", example: "You can stay as long as you want.", exampleTranslation: "Bạn có thể ở lại miễn là bạn muốn." },
      { id: 451, word: "manufactured", meaning: "đã được sản xuất", pronunciation: "man-juh-FAK-chơrd", example: "Goods manufactured locally are cheaper.", exampleTranslation: "Hàng hóa được sản xuất tại địa phương rẻ hơn." },
      { id: 452, word: "exclusively", meaning: "dành riêng, độc quyền", pronunciation: "ik-SKLUU-siv-li", example: "Sold exclusively on our site.", exampleTranslation: "Được bán độc quyền trên trang web của chúng tôi." },
      { id: 453, word: "sign up", meaning: "đăng ký", pronunciation: "sain ap", example: "Sign up for our free newsletter.", exampleTranslation: "Đăng ký nhận bản tin miễn phí của chúng tôi." },
      { id: 454, word: "financially", meaning: "về mặt tài chính", pronunciation: "fai-NAN-shơ-li", example: "The project is financially viable.", exampleTranslation: "Dự án khả thi về mặt tài chính." },
      { id: 455, word: "relatively", meaning: "tương đối", pronunciation: "REL-ơ-tiv-li", example: "The test was relatively easy.", exampleTranslation: "Bài kiểm tra tương đối dễ." },
      { id: 456, word: "productively", meaning: "một cách hiệu quả/năng suất", pronunciation: "prơ-DAK-tiv-li", example: "Work productively to hit targets.", exampleTranslation: "Làm việc hiệu quả để đạt mục tiêu." },
      { id: 457, word: "sold", meaning: "được bán, đã bán", pronunciation: "sould", example: "Tickets are sold out.", exampleTranslation: "Vé đã được bán hết." },
      { id: 458, word: "equivalent", meaning: "tương đương", pronunciation: "i-KWIV-ơ-lơnt", example: "100 USD is equivalent to 2.5 million VND.", exampleTranslation: "100 USD tương đương 2.5 triệu VND." },
      { id: 459, word: "associates", meaning: "các đồng nghiệp, nhân viên", pronunciation: "ơ-SOU-shi-ơts", example: "Greet customers and fellow associates.", exampleTranslation: "Chào hỏi khách hàng và các đồng nghiệp." },
      { id: 460, word: "commission", meaning: "tiền hoa hồng", pronunciation: "kơ-MISH-ơn", example: "Earn a 10% commission on sales.", exampleTranslation: "Nhận 10% tiền hoa hồng trên doanh số." },
      { id: 461, word: "based on", meaning: "dựa trên", pronunciation: "beist on", example: "Decisions based on facts are reliable.", exampleTranslation: "Quyết định dựa trên thực tế thì đáng tin cậy." },
      { id: 462, word: "percentage", meaning: "tỷ lệ phần trăm", pronunciation: "pơ-SEN-tidj", example: "What percentage of goals were met?", exampleTranslation: "Tỷ lệ phần trăm mục tiêu đã đạt được là bao nhiêu?" },
      { id: 463, word: "promotion", meaning: "sự thăng chức, khuyến mãi", pronunciation: "prơ-MOU-shơn", example: "He got a promotion to Manager.", exampleTranslation: "Anh ấy đã nhận được sự thăng chức lên Quản lý." },
      { id: 464, word: "donation", meaning: "khoản quyên góp, sự tặng", pronunciation: "dou-NEI-shơn", example: "Thank you for your generous donation.", exampleTranslation: "Cảm ơn sự quyên góp hào phóng của bạn." },
      { id: 465, word: "guarantees delivery", meaning: "đảm bảo giao hàng", pronunciation: "gar-ơn-TIIz di-LIV-ơ-ri", example: "Express shipping guarantees delivery tomorrow.", exampleTranslation: "Giao hàng chuyển phát nhanh đảm bảo giao hàng vào ngày mai." },
      { id: 466, word: "merchandise", meaning: "hàng hóa", pronunciation: "MƠ-chơn-daiz", example: "Inspect incoming merchandise carefully.", exampleTranslation: "Kiểm tra hàng hóa nhập về cẩn thận." },
      { id: 467, word: "beside", meaning: "bên cạnh", pronunciation: "bi-SAID", example: "Sit beside me during lunch.", exampleTranslation: "Hãy ngồi bên cạnh tôi trong giờ ăn trưa." },
      { id: 468, word: "whenever", meaning: "bất cứ khi nào", pronunciation: "when-EV-ơ", example: "Call me whenever you need help.", exampleTranslation: "Gọi cho tôi bất cứ khi nào bạn cần giúp đỡ." },
      { id: 469, word: "misunderstandings", meaning: "những sự hiểu lầm", pronunciation: "mis-an-đơ-STAN-dingz", example: "Clear communication avoids misunderstandings.", exampleTranslation: "Giao tiếp rõ ràng giúp tránh những hiểu lầm." },
      { id: 470, word: "surrounding", meaning: "xung quanh", pronunciation: "sơ-RAUN-ding", example: "Explore the surrounding area.", exampleTranslation: "Khám phá khu vực xung quanh." },
      { id: 471, word: "clear up", meaning: "làm rõ, giải quyết", pronunciation: "kliơ ap", example: "Let's clear up this confusion.", exampleTranslation: "Hãy làm rõ sự nhầm lẫn này." },
      { id: 472, word: "look out", meaning: "coi chừng, cẩn thận", pronunciation: "luk aut", example: "Look out for falling rocks!", exampleTranslation: "Coi chừng đá rơi!" },
      { id: 473, word: "take off", meaning: "cởi ra, cất cánh", pronunciation: "teik of", example: "The plane will take off soon.", exampleTranslation: "Máy bay sẽ cất cánh sớm." },
      { id: 474, word: "website enhancements", meaning: "những cải tiến trang web", pronunciation: "WEB-sait en-HANS-mơnts", example: "We made user-friendly website enhancements.", exampleTranslation: "Chúng tôi đã thực hiện những cải tiến trang web thân thiện với người dùng." },
      { id: 475, word: "summary", meaning: "bản tóm tắt", pronunciation: "SAM-ơ-ri", example: "Read the executive summary first.", exampleTranslation: "Hãy đọc bản tóm tắt điều hành trước." },
      { id: 476, word: "coupon", meaning: "phiếu giảm giá", pronunciation: "KUU-pon", example: "Use this coupon for 20% off.", exampleTranslation: "Sử dụng phiếu giảm giá này để được giảm 20%." },
      { id: 477, word: "medications", meaning: "thuốc, dược phẩm", pronunciation: "med-i-KEI-shơnz", example: "Take your medications as prescribed.", exampleTranslation: "Hãy uống thuốc theo đúng đơn chỉ định." },
      { id: 478, word: "travel agency", meaning: "đại lý du lịch", pronunciation: "TRAV-ơl EI-jơn-si", example: "Book tours through a travel agency.", exampleTranslation: "Đặt chuyến đi thông qua một đại lý du lịch." },
      { id: 479, word: "memorable", meaning: "đáng nhớ", pronunciation: "MEM-ơ-rơ-bơl", example: "It was a memorable vacation.", exampleTranslation: "Đó là một kỳ nghỉ đáng nhớ." },
      { id: 480, word: "adventures", meaning: "những cuộc phiêu lưu", pronunciation: "ơd-VEN-chơrz", example: "She loves outdoor adventures.", exampleTranslation: "Cô ấy thích những cuộc phiêu lưu ngoài trời." }
    ]
  },
  {
    id: 2,
    title: "2. TOEIC Công sở & Doanh nghiệp (20 từ)",
    words: [
      { id: 201, word: "implement", meaning: "thực thi, áp dụng", pronunciation: "IM-plơ-mơnt", example: "We need to implement the new safety rules.", exampleTranslation: "Chúng ta cần áp dụng quy tắc an toàn mới." },
      { id: 202, word: "accommodate", meaning: "đáp ứng, cung cấp chỗ ở", pronunciation: "ơ-KOM-ơ-đêit", example: "The hotel can accommodate 500 guests.", exampleTranslation: "Khách sạn có thể đáp ứng cho 500 khách." },
      { id: 203, word: "prospective", meaning: "tiềm năng (khách hàng)", pronunciation: "prơ-SPEK-tiv", example: "We sent brochures to prospective clients.", exampleTranslation: "Chúng tôi gửi tờ rơi đến khách hàng tiềm năng." },
      { id: 204, word: "mandatory", meaning: "bắt buộc", pronunciation: "MAN-đơ-tơ-ri", example: "Attendance at the orientation is mandatory.", exampleTranslation: "Việc tham gia buổi định hướng là bắt buộc." },
      { id: 205, word: "reluctant", meaning: "lưỡng lự, miễn cưỡng", pronunciation: "ri-LAK-tơnt", example: "He was reluctant to sign the contract.", exampleTranslation: "Anh ấy đã lưỡng lự khi ký hợp đồng." },
      { id: 206, word: "designate", meaning: "chỉ định, dành riêng", pronunciation: "ĐEZ-ig-nêit", example: "This area is designated for non-smokers.", exampleTranslation: "Khu vực này được dành riêng cho người không hút thuốc." },
      { id: 207, word: "negotiate", meaning: "đàm phán, thương lượng", pronunciation: "ni-GÔ-shi-êit", example: "They are negotiating a higher salary.", exampleTranslation: "Họ đang thương lượng mức lương cao hơn." },
      { id: 208, word: "incentive", meaning: "sự khuyến khích, phần thưởng", pronunciation: "in-SEN-tiv", example: "The company offers financial incentives.", exampleTranslation: "Công ty đưa ra các khoản tiền thưởng kích thích." },
      { id: 209, word: "confidential", meaning: "bảo mật, bí mật", pronunciation: "kon-fi-ĐEN-shơl", example: "These documents contain confidential info.", exampleTranslation: "Các tài liệu này chứa thông tin bảo mật." },
      { id: 210, word: "compensation", meaning: "tiền bồi thường, thù lao", pronunciation: "kom-pen-SÊI-shơl", example: "Victims received financial compensation.", exampleTranslation: "Các nạn nhân đã nhận được tiền bồi thường." },
      { id: 211, word: "collaborate", meaning: "hợp tác", pronunciation: "kơ-LAB-ơ-rêit", example: "Two departments collaborated on this project.", exampleTranslation: "Hai phòng ban đã hợp tác trong dự án này." },
      { id: 212, word: "substantial", meaning: "đáng kể, lớn", pronunciation: "sơb-STAN-shơl", example: "There was a substantial increase in profits.", exampleTranslation: "Đã có sự gia tăng đáng kể về lợi nhuận." },
      { id: 213, word: "comply with", meaning: "tuân thủ (luật/quy định)", pronunciation: "kơm-PLAI width", example: "All products must comply with safety standards.", exampleTranslation: "Tất cả sản phẩm phải tuân thủ tiêu chuẩn an toàn." },
      { id: 214, word: "inconvenience", meaning: "sự bất tiện", pronunciation: "in-kơn-VI-ni-ơns", example: "We apologize for any inconvenience caused.", exampleTranslation: "Chúng tôi xin lỗi vì bất kỳ sự bất tiện nào." },
      { id: 215, word: "inquiry", meaning: "câu hỏi, thắc mắc", pronunciation: "in-KWAI-ơ-ri", example: "Please send us your inquiries.", exampleTranslation: "Vui lòng gửi cho chúng tôi các thắc mắc của bạn." },
      { id: 216, word: "promote", meaning: "thăng chức, quảng bá", pronunciation: "prơ-MÔUT", example: "She was promoted to Senior Manager.", exampleTranslation: "Cô ấy đã được thăng chức lên Quản lý cấp cao." },
      { id: 217, word: "renovate", meaning: "cải tạo, sửa chữa", pronunciation: "REN-ơ-vêit", example: "The restaurant is closed for renovation.", exampleTranslation: "Nhà hàng đang đóng cửa để cải tạo." },
      { id: 218, word: "schedule", meaning: "lịch trình, lên lịch", pronunciation: "SKED-ju-ơl", example: "The meeting is scheduled for tomorrow.", exampleTranslation: "Cuộc họp được lên lịch vào ngày mai." },
      { id: 219, word: "evaluate", meaning: "đánh giá", pronunciation: "i-VAL-ju-êit", example: "Managers evaluate employee performance.", exampleTranslation: "Cấp quản lý đánh giá hiệu suất nhân viên." },
      { id: 220, word: "temporarily", meaning: "tạm thời", pronunciation: "tem-pơ-RER-ơ-li", example: "The office is temporarily closed.", exampleTranslation: "Văn phòng tạm thời đóng cửa." }
    ]
  },
  {
    id: 3,
    title: "3. Giao tiếp & Đời sống hàng ngày (17 từ)",
    words: [
      { id: 301, word: "appreciate", meaning: "trân trọng, cảm kích", pronunciation: "ơ-PRI-shi-êit", example: "I really appreciate your help.", exampleTranslation: "Tôi thực sự cảm kích sự giúp đỡ của bạn." },
      { id: 302, word: "apparently", meaning: "hình như, dường như", pronunciation: "ơ-PAR-ơnt-li", example: "Apparently, the flight has been delayed.", exampleTranslation: "Hình như chuyến bay đã bị hoãn." },
      { id: 303, word: "crucial", meaning: "cực kỳ quan trọng", pronunciation: "KRU-shơl", example: "Sleep is crucial for good health.", exampleTranslation: "Giấc ngủ cực kỳ quan trọng đối với sức khỏe." },
      { id: 304, word: "exhausted", meaning: "kiệt sức, mệt mỏi", pronunciation: "ig-ZO-stid", example: "I was completely exhausted after work.", exampleTranslation: "Tôi hoàn toàn kiệt sức sau giờ làm." },
      { id: 305, word: "hesitate", meaning: "ngập ngừng, do dự", pronunciation: "HEZ-i-têit", example: "Don't hesitate to contact me.", exampleTranslation: "Đừng ngần ngại liên hệ với tôi." },
      { id: 306, word: "flexible", meaning: "linh hoạt", pronunciation: "FLEK-sơ-bơl", example: "My working hours are quite flexible.", exampleTranslation: "Giờ làm việc của tôi khá linh hoạt." },
      { id: 307, word: "apologize", meaning: "xin lỗi", pronunciation: "ơ-POL-ơ-jaiz", example: "You should apologize for being late.", exampleTranslation: "Bạn nên xin lỗi vì đã đến muộn." },
      { id: 308, word: "recommendation", meaning: "lời gợi ý, đề xuất", pronunciation: "re-kơ-men-ĐÊI-shơn", example: "Do you have any restaurant recommendations?", exampleTranslation: "Bạn có gợi ý nhà hàng nào không?" },
      { id: 309, word: "obvious", meaning: "rõ ràng, hiển nhiên", pronunciation: "OB-vi-ơs", example: "It is obvious that he likes you.", exampleTranslation: "Rõ ràng là anh ấy thích bạn." },
      { id: 310, word: "unfortunate", meaning: "không may, đáng tiếc", pronunciation: "an-FOR-chơ-nơt", example: "It was an unfortunate accident.", exampleTranslation: "Đó là một tai nạn không may." },
      { id: 311, word: "familiar", meaning: "quen thuộc", pronunciation: "fơ-MIL-i-ơ", example: "Her voice sounds very familiar.", exampleTranslation: "Giọng của cô ấy nghe rất quen." },
      { id: 312, word: "option", meaning: "sự lựa chọn", pronunciation: "OP-shơn", example: "We have several options to choose.", exampleTranslation: "Chúng tôi có một vài sự lựa chọn." },
      { id: 313, word: "punctual", meaning: "đúng giờ", pronunciation: "PANK-chơ-ơl", example: "Please try to be punctual.", exampleTranslation: "Hãy cố gắng đến đúng giờ." },
      { id: 314, word: "incredible", meaning: "tuyệt vời, đáng kinh ngạc", pronunciation: "in-KRED-ơ-bơl", example: "The food here is incredible!", exampleTranslation: "Đồ ăn ở đây ngon tuyệt vời!" },
      { id: 315, word: "consider", meaning: "cân nhắc, suy xét", pronunciation: "kơn-SI-đơ", example: "I am considering buying a new car.", exampleTranslation: "Tôi đang cân nhắc mua một chiếc xe mới." },
      { id: 316, word: "take advantage of", meaning: "tận dụng, khai thác", pronunciation: "têik ơd-VAN-tij ov", example: "Take advantage of this special discount.", exampleTranslation: "Hãy tận dụng đợt giảm giá đặc biệt này." },
      { id: 317, word: "figure out", meaning: "tìm ra, hiểu ra giải pháp", pronunciation: "FIG-jơ aut", example: "I can't figure out how to solve this.", exampleTranslation: "Tôi không thể tìm ra cách giải quyết việc này." }
    ]
  }
];

const VOCAB_SETS = RAW_VOCAB_SETS.map(set => ({
  ...set,
  title: fixVietnamese(set.title),
  words: set.words.map(w => ({
    ...w,
    meaning: fixVietnamese(w.meaning),
    exampleTranslation: fixVietnamese(w.exampleTranslation)
  }))
}));

export default function VocabApp() {
  const [selectedSetIndex, setSelectedSetIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('flashcard');

  // Lấy dữ liệu đã nhớ từ LocalStorage
  const [rememberedIds, setRememberedIds] = useState(() => {
    const saved = localStorage.getItem('vocab_remembered_ids');
    return saved ? JSON.parse(saved) : [];
  });

  const currentSet = VOCAB_SETS[selectedSetIndex];

  // Danh sách từ hiện tại của bộ (được lọc các từ ĐÃ NHỚ)
  const [activeQueue, setActiveQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // State Trắc nghiệm
  const [quizOptions, setQuizOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  // State Gõ từ
  const [typeQueue, setTypeQueue] = useState([]);
  const [typeIndex, setTypeIndex] = useState(0);
  const [typedInput, setTypedInput] = useState('');
  const [typeResult, setTypeResult] = useState(null);

  // Lưu progress vào localStorage
  useEffect(() => {
    localStorage.setItem('vocab_remembered_ids', JSON.stringify(rememberedIds));
  }, [rememberedIds]);

  // Khởi tạo vòng lặp cho Flashcard mỗi khi chọn bộ từ hoặc danh sách Đã nhớ thay đổi
  useEffect(() => {
    const unrememberedWords = currentSet.words.filter(w => !rememberedIds.includes(w.id));
    setActiveQueue(unrememberedWords);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedSetIndex, rememberedIds]);

  // Khởi tạo hàng chờ cho chế độ Gõ Từ
  const initTypeQueue = () => {
    const unremembered = currentSet.words.filter(w => !rememberedIds.includes(w.id));
    // Nếu đã nhớ hết thì cho luyện gõ lại toàn bộ
    const queueToUse = unremembered.length > 0 ? unremembered : currentSet.words;
    setTypeQueue(queueToUse);
    setTypeIndex(0);
    setTypedInput('');
    setTypeResult(null);
  };

  useEffect(() => {
    if (activeTab === 'type') {
      initTypeQueue();
    }
  }, [activeTab, selectedSetIndex]);

  const currentWord = activeQueue[currentIndex];
  const currentTypeWord = typeQueue[typeIndex];

  const handleSpeak = (e, text) => {
    e?.stopPropagation();
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Bấm ĐÃ NHỚ: Lưu id vào danh sách ĐÃ NHỚ -> Từ sẽ tự động ẩn khỏi danh sách lặp!
  const handleMarkRemembered = () => {
    if (!currentWord) return;
    setRememberedIds(prev => [...prev, currentWord.id]);
    setIsFlipped(false);
  };

  // Bấm CHƯA NHỚ: Đưa từ này xuống cuối danh sách chờ lặp lại!
  const handleMarkUnremembered = () => {
    if (!currentWord || activeQueue.length <= 1) {
      setIsFlipped(false);
      return;
    }
    const updated = [...activeQueue];
    const item = updated.splice(currentIndex, 1)[0];
    updated.push(item);
    setActiveQueue(updated);
    setIsFlipped(false);
  };

  // Reset lại toàn bộ tiến độ bộ từ hiện tại
  const handleResetSetProgress = () => {
    const currentWordIds = currentSet.words.map(w => w.id);
    setRememberedIds(prev => prev.filter(id => !currentWordIds.includes(id)));
  };

  // Trắc nghiệm generator
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
  }, [currentIndex, activeTab, selectedSetIndex, currentWord]);

  // Kiểm tra gõ từ
  const handleCheckType = (e) => {
    e.preventDefault();
    if (!typedInput.trim() || !currentTypeWord) return;

    const isCorrect = typedInput.trim().toLowerCase() === currentTypeWord.word.toLowerCase();

    if (isCorrect) {
      setTypeResult('correct');
      handleSpeak(null, currentTypeWord.word);
    } else {
      setTypeResult('incorrect');
      if (!typeQueue.slice(typeIndex + 1).some(item => item.id === currentTypeWord.id)) {
        setTypeQueue(prev => [...prev, currentTypeWord]);
      }
    }
  };

  const handleNextTypeWord = () => {
    setTypedInput('');
    setTypeResult(null);
    setTypeIndex(prev => prev + 1);
  };

  // Đếm tổng số từ đã thuộc trong bộ
  const currentSetRememberedCount = currentSet.words.filter(w => rememberedIds.includes(w.id)).length;

  return (
    <div className="min-h-screen bg-[#18181B] text-[#E4E4E7] p-4 md:p-8 font-sans selection:bg-[#27272A]">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header & Chọn bộ từ */}
        <header className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                Sổ tay từ vựng <Sparkles size={22} className="text-emerald-400" />
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                Đang học: <strong className="text-emerald-400">{currentSet.title}</strong>
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-3 py-1 rounded-full">
                Đã nhớ {currentSetRememberedCount} / {currentSet.words.length} TỪ
              </span>
              {currentSetRememberedCount > 0 && (
                <button 
                  onClick={handleResetSetProgress}
                  className="text-[11px] text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors pt-0.5"
                  title="Học lại từ đầu bộ này"
                >
                  <Trash2 size={12} /> Reset tiến độ bộ này
                </button>
              )}
            </div>
          </div>

          {/* Selector Chọn Bộ Bài Học */}
          <div className="bg-[#27272A]/80 p-3 rounded-2xl border border-zinc-800 space-y-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <FolderOpen size={14} className="text-emerald-400" /> Chọn bộ bài học:
            </span>
            <div className="flex flex-wrap gap-2">
              {VOCAB_SETS.map((set, idx) => {
                const count = set.words.filter(w => rememberedIds.includes(w.id)).length;
                const isDone = count === set.words.length;

                return (
                  <button
                    key={set.id}
                    onClick={() => setSelectedSetIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      selectedSetIndex === idx 
                        ? 'bg-emerald-500 text-zinc-950 shadow-md font-bold' 
                        : 'bg-zinc-800/90 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    <span>{set.title}</span>
                    {isDone && <CheckCircle2 size={14} className="text-emerald-900" />}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* Tabs Chế độ học */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-800">
          <button 
            onClick={() => { setActiveTab('flashcard'); setIsFlipped(false); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'flashcard' ? 'bg-zinc-800 text-emerald-400 border border-zinc-700 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BookOpen size={18} /> Lật thẻ
          </button>
          
          <button 
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'quiz' ? 'bg-zinc-800 text-emerald-400 border border-zinc-700 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Brain size={18} /> Trắc nghiệm
          </button>

          <button 
            onClick={() => setActiveTab('type')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'type' ? 'bg-zinc-800 text-emerald-400 border border-zinc-700 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <PenTool size={18} /> Gõ từ
          </button>
        </div>

        {/* MODE 1: LẬT THẺ */}
        {activeTab === 'flashcard' && (
          <div>
            {currentWord ? (
              <div className="space-y-4">
                <div 
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="cursor-pointer bg-[#27272A] rounded-3xl p-8 md:p-10 text-center shadow-lg border border-zinc-700/80 min-h-[280px] flex flex-col justify-center items-center relative transition-all hover:border-zinc-500"
                >
                  <span className="absolute top-4 right-4 text-xs font-semibold text-zinc-500 flex items-center gap-1">
                    <Eye size={14} /> {isFlipped ? 'Chạm để xem từ tiếng Anh' : 'Chạm để xem nghĩa & ví dụ'}
                  </span>

                  {!isFlipped ? (
                    <div className="space-y-3">
                      <h2 className="text-3xl md:text-4xl font-bold text-white tracking-wide">
                        {currentWord.word}
                      </h2>
                      {currentWord.pronunciation && (
                        <div className="flex items-center justify-center gap-2 pt-1">
                          <span className="text-xs bg-zinc-800 text-emerald-400 border border-zinc-700 px-3 py-1 rounded-full font-mono">
                            /{currentWord.pronunciation}/
                          </span>
                          <button 
                            onClick={(e) => handleSpeak(e, currentWord.word)} 
                            className="p-1.5 hover:bg-zinc-700 rounded-full transition-colors text-zinc-300"
                          >
                            <Volume2 size={20} />
                          </button>
                        </div>
                      )}
                      <p className="text-xs text-zinc-500 pt-4">(Bấm vào thẻ để lật xem mặt sau)</p>
                    </div>
                  ) : (
                    <div className="space-y-4 w-full max-w-xl animate-fadeIn">
                      <h2 className="text-2xl md:text-3xl font-bold text-emerald-400">
                        {currentWord.meaning}
                      </h2>
                      
                      {currentWord.example && (
                        <div className="space-y-1.5 pt-2 text-left bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800">
                          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">Ví dụ minh họa:</span>
                          <p className="text-sm md:text-base italic text-zinc-200 flex items-center justify-between gap-2">
                            <span>"{currentWord.example}"</span>
                            <button 
                              onClick={(e) => handleSpeak(e, currentWord.example)} 
                              className="p-1 hover:bg-zinc-800 rounded-full shrink-0 text-zinc-400"
                            >
                              <Volume2 size={16} />
                            </button>
                          </p>
                          <p className="text-xs md:text-sm text-zinc-400">→ {currentWord.exampleTranslation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Thanh Nút Tương Tác */}
                <div className="flex items-center justify-between px-2 pt-2">
                  <button 
                    onClick={handleMarkUnremembered} 
                    className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all"
                  >
                    <RotateCcw size={16} /> Chưa nhớ (Lặp lại sau)
                  </button>

                  <span className="text-xs text-zinc-500 font-semibold">
                    Còn lại {activeQueue.length} từ chưa nhớ
                  </span>

                  <button 
                    onClick={handleMarkRemembered} 
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-6 py-2.5 rounded-2xl text-sm font-bold shadow-md transition-all"
                  >
                    <Check size={18} /> Đã nhớ (Ẩn đi)
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#27272A] rounded-3xl p-10 text-center border border-zinc-800 space-y-4">
                <CheckCircle2 size={52} className="text-emerald-400 mx-auto" />
                <h2 className="text-2xl font-bold text-white">Xuất sắc! Bạn đã thuộc hết từ vựng bộ này!</h2>
                <p className="text-sm text-zinc-400">Tất cả từ đã được đánh dấu "Đã nhớ". Bạn có thể chuyển sang bộ khác hoặc reset để ôn lại.</p>
                <button 
                  onClick={handleResetSetProgress}
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-6 py-2.5 rounded-xl text-sm transition-all"
                >
                  <RefreshCw size={16} /> Ôn tập lại bộ này từ đầu
                </button>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: TRẮC NGHIỆM */}
        {activeTab === 'quiz' && (
          <div>
            {currentWord ? (
              <div className="space-y-6">
                <div className="bg-[#27272A] rounded-3xl p-6 text-center border border-zinc-800 space-y-2">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Từ cần chọn nghĩa:</span>
                  <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
                    {currentWord.word}
                    <button onClick={(e) => handleSpeak(e, currentWord.word)} className="p-1 hover:bg-zinc-700 rounded-full text-zinc-400">
                      <Volume2 size={20} />
                    </button>
                  </h2>
                  <p className="text-xs font-mono text-emerald-400">/{currentWord.pronunciation}/</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {quizOptions.map((opt) => {
                    const isSelected = selectedOption === opt.id;
                    const isCorrect = opt.id === currentWord.id;

                    let btnStyle = "bg-[#27272A] border-zinc-800 text-zinc-200 hover:border-zinc-600";
                    if (selectedOption !== null) {
                      if (isCorrect) btnStyle = "bg-emerald-950 border-emerald-500 text-emerald-200 font-bold";
                      else if (isSelected) btnStyle = "bg-red-950 border-red-500 text-red-200";
                    }

                    return (
                      <button
                        key={opt.id}
                        disabled={selectedOption !== null}
                        onClick={() => setSelectedOption(opt.id)}
                        className={`p-4 rounded-2xl border text-left text-sm md:text-base transition-all flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt.meaning}</span>
                        {selectedOption !== null && isCorrect && <CheckCircle2 className="text-emerald-400" size={20} />}
                        {selectedOption !== null && isSelected && !isCorrect && <XCircle className="text-red-400" size={20} />}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={handleMarkRemembered}
                    className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-6 py-2.5 rounded-xl text-sm font-bold"
                  >
                    Câu tiếp theo <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#27272A] rounded-3xl p-8 text-center border border-zinc-800 text-zinc-400">
                Bạn đã nhớ hết các từ trong bộ này!
              </div>
            )}
          </div>
        )}

        {/* MODE 3: GÕ TỪ */}
        {activeTab === 'type' && (
          <div>
            {typeIndex < typeQueue.length ? (
              <div className="space-y-6">
                <div className="bg-[#27272A] rounded-3xl p-8 text-center border border-zinc-800 space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold text-zinc-500">
                    <span>Lượt gõ: {typeIndex + 1} / {typeQueue.length}</span>
                    <span className="text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800">
                      Gõ chính xác để qua bài
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block pt-2">Nghĩa tiếng Việt:</span>
                  <h2 className="text-2xl md:text-3xl font-bold text-emerald-400">
                    {currentTypeWord.meaning}
                  </h2>
                  {currentTypeWord.pronunciation && (
                    <span className="inline-block text-xs bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full font-mono">
                      Gợi ý phiên âm: /{currentTypeWord.pronunciation}/
                    </span>
                  )}
                </div>

                <form onSubmit={handleCheckType} className="space-y-4">
                  <div className="relative">
                    <input 
                      type="text"
                      value={typedInput}
                      onChange={(e) => { setTypedInput(e.target.value); setTypeResult(null); }}
                      placeholder="Gõ từ tiếng Anh tương ứng vào đây..."
                      className={`w-full p-4 rounded-2xl border text-lg outline-none transition-all ${
                        typeResult === 'correct' 
                          ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200 font-bold' 
                          : typeResult === 'incorrect' 
                          ? 'border-red-500 bg-red-950/40 text-red-200' 
                          : 'border-zinc-700 bg-[#27272A] focus:border-emerald-400 text-white'
                      }`}
                    />
                    {typeResult === null && (
                      <button 
                        type="submit"
                        className="absolute right-2 top-2 bottom-2 bg-emerald-500 text-zinc-950 px-5 rounded-xl text-sm font-bold hover:bg-emerald-400 transition-colors"
                      >
                        Kiểm tra
                      </button>
                    )}
                  </div>

                  {typeResult === 'correct' && (
                    <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-700 text-emerald-200 text-sm flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                        <span>Chính xác! Từ là: <strong>{currentTypeWord.word}</strong></span>
                      </div>
                      <button 
                        type="button"
                        onClick={handleNextTypeWord}
                        className="bg-emerald-500 text-zinc-950 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-400"
                      >
                        Từ tiếp theo →
                      </button>
                    </div>
                  )}

                  {typeResult === 'incorrect' && (
                    <div className="p-4 rounded-2xl bg-red-950/60 border border-red-700 text-red-200 text-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <XCircle size={18} className="text-red-400 shrink-0" />
                          <span>Chưa đúng! Từ này sẽ được cho gõ lại ở cuối bài.</span>
                        </div>
                        <button 
                          type="button"
                          onClick={handleNextTypeWord}
                          className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600"
                        >
                          Đã hiểu, tiếp tục →
                        </button>
                      </div>
                      <p className="text-xs text-red-300 pl-6">Đáp án đúng: <strong>{currentTypeWord.word}</strong></p>
                    </div>
                  )}
                </form>
              </div>
            ) : (
              <div className="bg-[#27272A] rounded-3xl p-8 text-center border border-zinc-800 space-y-4">
                <CheckCircle2 size={48} className="text-emerald-400 mx-auto" />
                <h2 className="text-2xl font-bold text-white">Hoàn thành bài gõ từ!</h2>
                <p className="text-sm text-zinc-400">Bạn đã gõ chính xác toàn bộ các từ trong danh sách.</p>
                <button 
                  onClick={initTypeQueue}
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-6 py-2.5 rounded-xl text-sm font-bold"
                >
                  <RefreshCw size={16} /> Luyện gõ lại bộ này
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
