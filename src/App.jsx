import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Brain, 
  PenTool, 
  RotateCcw, 
  Volume2, 
  ChevronRight, 
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
   HÀM TỰ ĐỘNG CHUẨN HÓA UNICODE VIỆT NAM
   ========================================================================= */
const fixVietnamese = (text) => {
  if (!text) return '';
  return text.normalize('NFC');
};

/* =========================================================================
   DANH SÁCH BỘ TỪ VỰNG TỔNG HỢP (FULL 61 CỤM TỪ TỪ 6 TRANG SÁCH ANHLE)
   ========================================================================= */
const RAW_VOCAB_SETS = [
  {
    id: 5,
    title: "5. TOEIC Phrase Collection (61 phrases)",
    words: [
      { id: 501, word: "currently available", meaning: "hiện đang có sẵn", pronunciation: "KUR-ơnt-li ơ-VEI-lơ-bơl", example: "The book is currently available.", exampleTranslation: "Cuốn sách hiện đang có sẵn." },
      { id: 502, word: "ahead of schedule", meaning: "trước thời hạn", pronunciation: "ơ-HED ov SKED-juul", example: "Complete the construction ahead of schedule.", exampleTranslation: "Hoàn thành việc xây dựng trước thời hạn." },
      { id: 503, word: "in person", meaning: "trực tiếp (mặt đối mặt)", pronunciation: "in PUR-sơn", example: "Deliver the packet in person.", exampleTranslation: "Giao gói hàng tận nơi trực tiếp." },
      { id: 504, word: "a variety of", meaning: "nhiều, đa dạng", pronunciation: "ơ vơ-RAI-ơ-ti ov", example: "A wide variety of dishes.", exampleTranslation: "Nhiều món ăn đa dạng." },
      { id: 505, word: "at least", meaning: "ít nhất", pronunciation: "at liist", example: "At least 100 attendees.", exampleTranslation: "Ít nhất 100 người tham gia." },
      { id: 506, word: "promising candidate", meaning: "ứng cử viên triển vọng", pronunciation: "PRO-mi-sing KAN-di-deit", example: "Be selected from among promising candidates.", exampleTranslation: "Được lựa chọn trong số các ứng cử viên đầy triển vọng." },
      { id: 507, word: "later this year", meaning: "vào cuối năm nay", pronunciation: "LEI-tơ đis jiơ", example: "Later this year, additional employees will be hired.", exampleTranslation: "Cuối năm nay, nhân viên bổ sung sẽ được thuê." },
      { id: 508, word: "conduct a survey", meaning: "tiến hành khảo sát", pronunciation: "kơn-DAKT ơ SUR-vei", example: "Regularly conduct a customer satisfaction survey.", exampleTranslation: "Thường xuyên thực hiện khảo sát về sự hài lòng của khách hàng." },
      { id: 509, word: "in advance", meaning: "trước", pronunciation: "in ơd-VANS", example: "Book in advance.", exampleTranslation: "Đặt trước." },
      { id: 510, word: "so far", meaning: "cho tới nay", pronunciation: "sou faar", example: "The project has been successful so far.", exampleTranslation: "Dự án đã thành công cho đến nay." },
      { id: 511, word: "for further information", meaning: "để biết thêm thông tin", pronunciation: "for FUR-đơ in-fơ-MEI-shơn", example: "Please refer to the handbook for further information.", exampleTranslation: "Vui lòng tham khảo sổ tay nhân viên để biết thêm thông tin." },
      { id: 512, word: "business expenses", meaning: "chi phí kinh doanh", pronunciation: "BIZ-nis ik-SPEN-siz", example: "Increase profits by lowering business expenses.", exampleTranslation: "Tăng lợi nhuận bằng cách giảm chi phí kinh doanh." },
      { id: 513, word: "have a good reputation for", meaning: "có danh tiếng tốt về", pronunciation: "hav ơ gud rep-ju-TEI-shơn for", example: "As a CEO, Mr. Na maintains a good reputation for his energy.", exampleTranslation: "Là một CEO, ông Na duy trì danh tiếng tốt về năng lực của mình." },
      { id: 514, word: "issue a statement", meaning: "đưa ra một tuyên bố", pronunciation: "ISH-uu ơ STEIT-mơnt", example: "Will issue a statement officially.", exampleTranslation: "Sẽ ban hành một tuyên bố chính thức." },
      { id: 515, word: "day/night shift", meaning: "ca ngày / ca đêm", pronunciation: "dei/nait shift", example: "Day shift on weekdays from 10:00 a.m. to 5:00 p.m.", exampleTranslation: "Ca ngày làm việc trong tuần từ 10:00 sáng đến 5:00 chiều." },
      { id: 516, word: "out of service", meaning: "hỏng hóc, ngưng hoạt động", pronunciation: "aut ov SUR-vis", example: "The printer is currently out of service.", exampleTranslation: "Máy in hiện đang ngưng hoạt động." },
      { id: 517, word: "access to the data", meaning: "truy cập vào dữ liệu", pronunciation: "AK-ses tu đơ DEI-tơ", example: "Access to the data is strictly restricted to authorized personnel.", exampleTranslation: "Truy cập dữ liệu chỉ được giới hạn cho nhân viên có thẩm quyền." },
      { id: 518, word: "in a timely manner", meaning: "đúng lúc, kịp thời", pronunciation: "in ơ TAIM-li MAN-ơ", example: "Any complaints from customers will be dealt with in a timely manner.", exampleTranslation: "Bất kỳ khiếu nại từ khách hàng sẽ được xử lý kịp thời." },
      { id: 519, word: "keynote speaker", meaning: "diễn giả chính", pronunciation: "KII-nout SPII-kơ", example: "Arrange for the keynote speaker.", exampleTranslation: "Sắp xếp cho diễn giả chính." },
      { id: 520, word: "make a revision", meaning: "sửa lại, chỉnh sửa", pronunciation: "meik ơ ri-VI-zhơn", example: "Make a revision to the event schedule.", exampleTranslation: "Sửa đổi lịch trình sự kiện." },
      { id: 521, word: "out of stock", meaning: "hết hàng", pronunciation: "aut ov stok", example: "The item is temporarily out of stock.", exampleTranslation: "Các mặt hàng tạm thời hết hàng." },
      { id: 522, word: "play a role in", meaning: "đóng vai trò trong", pronunciation: "plei ơ roul in", example: "Play a role in the company's success.", exampleTranslation: "Đóng vai trò trong sự thành công của công ty." },
      { id: 523, word: "raw materials", meaning: "nguyên liệu thô", pronunciation: "ro mơ-TIƠ-ri-ơlz", example: "Lower import taxes for raw materials.", exampleTranslation: "Giảm thuế nhập khẩu nguyên liệu thô." },
      { id: 524, word: "recommendation letter", meaning: "thư giới thiệu", pronunciation: "rek-ơ-men-DEI-shơn LET-ơ", example: "Write recommendation letters.", exampleTranslation: "Viết thư giới thiệu." },
      { id: 525, word: "under pressure", meaning: "chịu áp lực", pronunciation: "AN-đơ PRE-shơ", example: "All the workers are under pressure.", exampleTranslation: "Tất cả công nhân đều chịu áp lực." },
      { id: 526, word: "job performance", meaning: "hiệu suất công việc", pronunciation: "djob pơ-FOR-mơns", example: "Complain about his job performance.", exampleTranslation: "Phàn nàn về hiệu suất công việc của anh ấy." },
      { id: 527, word: "without consent", meaning: "không có sự đồng ý", pronunciation: "wiđ-AUT kơn-SENT", example: "Without your prior written consent, we do not release...", exampleTranslation: "Nếu không có sự đồng ý trước bằng văn bản của bạn, chúng tôi sẽ không phát hành..." },
      { id: 528, word: "seating capacity", meaning: "sức chứa chỗ ngồi", pronunciation: "SII-ting kơ-PAS-ơ-ti", example: "An auditorium with a seating capacity of 500.", exampleTranslation: "Khán phòng có sức chứa 500 người." },
      { id: 529, word: "increasing demand", meaning: "nhu cầu ngày càng tăng", pronunciation: "in-KRII-sing di-MAND", example: "There is an increasing demand in cars.", exampleTranslation: "Có một sự gia tăng nhu cầu mua xe." },
      { id: 530, word: "customs official", meaning: "cán bộ hải quan", pronunciation: "KAS-tơmz ơ-FISH-ơl", example: "The customs official checked the package.", exampleTranslation: "Các quan chức hải quan kiểm tra các gói hàng." },
      { id: 531, word: "under construction", meaning: "đang thi công, xây dựng", pronunciation: "AN-đơ kơn-STRAK-shơn", example: "The museum is under construction.", exampleTranslation: "Bảo tàng đang được xây dựng." },
      { id: 532, word: "safety procedures", meaning: "quy trình an toàn", pronunciation: "SEIF-ti prơ-SII-djơrz", example: "Review the safety procedures.", exampleTranslation: "Xem lại các quy trình an toàn." },
      { id: 533, word: "be committed to", meaning: "tận tụy, cam kết", pronunciation: "bii kơm-MIT-id tu", example: "Be committed to satisfying customers.", exampleTranslation: "Cam kết làm hài lòng khách hàng." },
      { id: 534, word: "be scheduled to", meaning: "được lên lịch vào", pronunciation: "bii SKED-juuld tu", example: "The speech is scheduled to begin at 7 am.", exampleTranslation: "Bài phát biểu được lên lịch để bắt đầu lúc 7 am." },
      { id: 535, word: "engage in", meaning: "tham gia vào", pronunciation: "en-GEIDJ in", example: "Engage in online sales.", exampleTranslation: "Tham gia bán hàng trực tuyến." },
      { id: 536, word: "comply with", meaning: "tuân theo, làm theo", pronunciation: "kơm-PLAI wiđ", example: "Comply with the legal requirements.", exampleTranslation: "Tuân thủ các yêu cầu pháp lý." },
      { id: 537, word: "contribute to", meaning: "đóng góp, góp phần", pronunciation: "kơn-TRI-bjuut tu", example: "Contribute to the project.", exampleTranslation: "Đóng góp cho dự án." },
      { id: 538, word: "deal with", meaning: "giải quyết", pronunciation: "diil wiđ", example: "Deal with a problem.", exampleTranslation: "Giải quyết 1 vấn đề." },
      { id: 539, word: "with the exception of", meaning: "ngoại trừ", pronunciation: "wiđ đơ ik-SEP-shơn ov", example: "With the exception of personal matters.", exampleTranslation: "Ngoại trừ các vấn đề cá nhân." },
      { id: 540, word: "be acquainted with", meaning: "làm quen với", pronunciation: "bii ơ-KWEIN-tid wiđ", example: "Be well acquainted with photo software.", exampleTranslation: "Làm quen với phần mềm ảnh." },
      { id: 541, word: "be associated with", meaning: "kết hợp với, liên quan đến", pronunciation: "bii ơ-SOU-si-ei-tid wiđ", example: "The problem is associated with financial restraints.", exampleTranslation: "Vấn đề liên quan đến các hạn chế tài chính." },
      { id: 542, word: "be aware of", meaning: "biết về, nhận thức về", pronunciation: "bii ơ-WEƠ ov", example: "I am fully aware of the fact that...", exampleTranslation: "Tôi hoàn toàn nhận thức được sự thật rằng..." },
      { id: 543, word: "be accustomed to", meaning: "quen với", pronunciation: "bii ơ-KAS-tơmd tu", example: "New employees are accustomed to working overtime.", exampleTranslation: "Nhân viên mới đã quen với việc làm thêm giờ." },
      { id: 544, word: "be eager about", meaning: "háo hức về việc gì", pronunciation: "bii II-gơ ơ-BAUT", example: "He is always eager about huge tasks.", exampleTranslation: "Anh ấy luôn háo hức với những nhiệm vụ lớn." },
      { id: 545, word: "be eligible for", meaning: "đủ điều kiện cho", pronunciation: "bii EL-i-djơ-bơl for", example: "Ms Kim is eligible for the promotion.", exampleTranslation: "Cô Kim đủ điều kiện nhận thăng chức." },
      { id: 546, word: "be concerned about", meaning: "lo lắng về vấn đề gì", pronunciation: "bii kơn-SURND ơ-BAUT", example: "We are concerned about the financial status.", exampleTranslation: "Chúng tôi lo ngại về tình trạng tài chính." },
      { id: 547, word: "be entitled to", meaning: "được quyền, đủ điều kiện", pronunciation: "bii in-TAI-tơld tu", example: "All the customers are entitled to a full refund.", exampleTranslation: "Tất cả khách hàng đều được hưởng khoản hoàn tiền đầy đủ." },
      { id: 548, word: "be equipped with", meaning: "được trang bị với", pronunciation: "bii i-KWIPT wiđ", example: "The conference room is equipped with visual aids.", exampleTranslation: "Phòng hội nghị được trang bị các phương tiện trực quan." },
      { id: 549, word: "be dedicated to", meaning: "cống hiến cho", pronunciation: "bii DED-i-kei-tid tu", example: "Professor Moon has been dedicated to this university.", exampleTranslation: "Giáo sư Moon đã cống hiến cho trường đại học này." },
      { id: 550, word: "be prepared for", meaning: "chuẩn bị để làm gì", pronunciation: "bii pri-PEƠD for", example: "Be prepared to speak at the meeting.", exampleTranslation: "Hãy chuẩn bị để phát biểu tại cuộc họp." },
      { id: 551, word: "be responsible for", meaning: "chịu trách nhiệm cho", pronunciation: "bii ri-SPON-sơ-bơl for", example: "The manager is responsible for supervising assemblers.", exampleTranslation: "Người quản lý có trách nhiệm giám sát các nhà lắp ráp." },
      { id: 552, word: "be faced with", meaning: "đối mặt với", pronunciation: "bii FEIST wiđ", example: "The company is currently faced with financial difficulties.", exampleTranslation: "Công ty hiện đang phải đối mặt với những khó khăn tài chính." },
      { id: 553, word: "be satisfied with", meaning: "thỏa mãn với, hài lòng với", pronunciation: "bii SAT-is-faid wiđ", example: "I was satisfied with the results.", exampleTranslation: "Tôi hài lòng với kết quả." },
      { id: 554, word: "be similar to", meaning: "tương tự như", pronunciation: "bii SIM-i-lơ tu", example: "Be similar to other towns.", exampleTranslation: "Tương tự như các thị trấn khác." },
      { id: 555, word: "be subject to", meaning: "phải trải qua, tùy thuộc vào", pronunciation: "bii SAB-djikt tu", example: "The schedule is subject to change without prior notice.", exampleTranslation: "Lịch trình có thể thay đổi mà không cần thông báo trước." },
      { id: 556, word: "be in charge of", meaning: "chịu trách nhiệm, phụ trách", pronunciation: "bii in CHAARDJ ov", example: "Ms Hamilton is currently in charge of the Marketing Division.", exampleTranslation: "Bà Hamilton hiện đang phụ trách Bộ phận Tiếp thị." },
      { id: 557, word: "be suitable for", meaning: "phù hợp với", pronunciation: "bii SUU-tơ-bơl for", example: "He is suitable for the position.", exampleTranslation: "Anh ta phù hợp với vị trí này." },
      { id: 558, word: "apart from", meaning: "ngoại trừ", pronunciation: "ơ-PAART frơm", example: "Apart from a few minor errors.", exampleTranslation: "Ngoại trừ một vài lỗi nhỏ." },
      { id: 559, word: "as a result of", meaning: "vì vậy, vì lý do đó...nên", pronunciation: "az ơ ri-ZALT ov", example: "As a result of the recent merger, we canceled the appointment.", exampleTranslation: "Do đợt sáp nhập gần đây, chúng tôi đã hủy cuộc hẹn." },
      { id: 560, word: "due to", meaning: "bởi vì", pronunciation: "djuu tu", example: "Due to malfunction.", exampleTranslation: "Bởi vì trục trặc." },
      { id: 561, word: "in addition to", meaning: "ngoài ra, bên cạnh đó", pronunciation: "in ơ-DISH-ơn tu", example: "In addition to being helped.", exampleTranslation: "Ngoài việc được giúp đỡ." }
    ]
  },
  {
    id: 1,
    title: "1. Your Image Words (13 words)",
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
    title: "4. TOEIC Part 5 Vocabulary (68 words)",
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
    title: "2. Business TOEIC (20 words)",
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
    title: "3. Daily Communication (17 words)",
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

  const [rememberedIds, setRememberedIds] = useState(() => {
    const saved = localStorage.getItem('vocab_remembered_ids');
    return saved ? JSON.parse(saved) : [];
  });

  const currentSet = VOCAB_SETS[selectedSetIndex];

  const [activeQueue, setActiveQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [quizOptions, setQuizOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  const [typeQueue, setTypeQueue] = useState([]);
  const [typeIndex, setTypeIndex] = useState(0);
  const [typedInput, setTypedInput] = useState('');
  const [typeResult, setTypeResult] = useState(null);

  useEffect(() => {
    localStorage.setItem('vocab_remembered_ids', JSON.stringify(rememberedIds));
  }, [rememberedIds]);

  useEffect(() => {
    const unrememberedWords = currentSet.words.filter(w => !rememberedIds.includes(w.id));
    setActiveQueue(unrememberedWords);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedSetIndex, rememberedIds]);

  const initTypeQueue = () => {
    const unremembered = currentSet.words.filter(w => !rememberedIds.includes(w.id));
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

  const handleMarkRemembered = () => {
    if (!currentWord) return;
    setRememberedIds(prev => [...prev, currentWord.id]);
    setIsFlipped(false);
  };

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

  const handleResetSetProgress = () => {
    const currentWordIds = currentSet.words.map(w => w.id);
    setRememberedIds(prev => prev.filter(id => !currentWordIds.includes(id)));
  };

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

  const handleQuizSelect = (optId) => {
    if (selectedOption !== null) return;
    setSelectedOption(optId);

    const isCorrect = optId === currentWord.id;
    if (isCorrect) {
      handleSpeak(null, currentWord.word);
    }
  };

  const handleQuizNext = () => {
    if (!currentWord) return;

    if (selectedOption === currentWord.id) {
      setRememberedIds(prev => [...prev, currentWord.id]);
    } else {
      if (activeQueue.length > 1) {
        const updated = [...activeQueue];
        const item = updated.splice(currentIndex, 1)[0];
        updated.push(item);
        setActiveQueue(updated);
      }
    }
    setSelectedOption(null);
  };

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

  const currentSetRememberedCount = currentSet.words.filter(w => rememberedIds.includes(w.id)).length;

  return (
    <div className="min-h-screen bg-[#0F1117] text-[#E2E8F0] p-4 md:p-8 font-sans selection:bg-blue-500/20 selection:text-blue-300">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Main Frame Container */}
        <div className="bg-[#161922] border border-zinc-800/80 rounded-3xl p-5 md:p-8 shadow-2xl space-y-6 backdrop-blur-xl">
          
          {/* Header & Deck Selector */}
          <header className="space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  Vocabulary Notebook <Sparkles size={20} className="text-blue-400 animate-pulse" />
                </h1>
                <p className="text-xs md:text-sm text-zinc-400 mt-1">
                  Currently Learning: <strong className="text-blue-400 font-semibold">{currentSet.title}</strong>
                </p>
              </div>
              
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1 rounded-full shadow-sm">
                  Mastered {currentSetRememberedCount} / {currentSet.words.length} Words
                </span>
                {currentSetRememberedCount > 0 && (
                  <button 
                    onClick={handleResetSetProgress}
                    className="text-[11px] text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors pt-0.5"
                    title="Reset deck progress"
                  >
                    <Trash2 size={12} /> Reset Deck
                  </button>
                )}
              </div>
            </div>

            {/* Deck Selector Box */}
            <div className="bg-[#1E222D] p-3.5 rounded-2xl border border-zinc-800 space-y-2.5">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <FolderOpen size={14} className="text-blue-400" /> Select Word Deck:
              </span>
              <div className="flex flex-wrap gap-2">
                {VOCAB_SETS.map((set, idx) => {
                  const count = set.words.filter(w => rememberedIds.includes(w.id)).length;
                  const isDone = count === set.words.length;

                  return (
                    <button
                      key={set.id}
                      onClick={() => setSelectedSetIndex(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                        selectedSetIndex === idx 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold border border-blue-400/30' 
                          : 'bg-[#272D3D] text-zinc-300 hover:bg-[#32394E] border border-transparent'
                      }`}
                    >
                      <span>{set.title}</span>
                      {isDone && <CheckCircle2 size={14} className="text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </header>

          {/* Learning Mode Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-zinc-800">
            <button 
              onClick={() => { setActiveTab('flashcard'); setIsFlipped(false); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                activeTab === 'flashcard' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 border border-blue-400/40' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <BookOpen size={16} /> Flashcards
            </button>
            
            <button 
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                activeTab === 'quiz' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 border border-blue-400/40' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Brain size={16} /> Quiz
            </button>

            <button 
              onClick={() => setActiveTab('type')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                activeTab === 'type' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 border border-blue-400/40' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <PenTool size={16} /> Typing Practice
            </button>
          </div>

          {/* MODE 1: FLASHCARDS */}
          {activeTab === 'flashcard' && (
            <div>
              {currentWord ? (
                <div className="space-y-4">
                  <div 
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="cursor-pointer bg-gradient-to-b from-[#1C212E] to-[#141722] rounded-3xl p-8 md:p-10 text-center shadow-xl border border-zinc-700/60 min-h-[290px] flex flex-col justify-center items-center relative transition-all hover:border-blue-500/50 group"
                  >
                    <span className="absolute top-4 right-4 text-xs font-medium text-zinc-400 flex items-center gap-1 bg-zinc-800/60 px-3 py-1 rounded-full border border-zinc-700/50">
                      <Eye size={13} /> {isFlipped ? 'Tap to show English' : 'Tap to show meaning'}
                    </span>

                    {!isFlipped ? (
                      <div className="space-y-3">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-wide group-hover:scale-105 transition-transform">
                          {currentWord.word}
                        </h2>
                        {currentWord.pronunciation && (
                          <div className="flex items-center justify-center gap-2 pt-1">
                            <span className="text-xs bg-zinc-800/90 text-blue-400 border border-zinc-700/80 px-3 py-1 rounded-full font-mono">
                              /{currentWord.pronunciation}/
                            </span>
                            <button 
                              onClick={(e) => handleSpeak(e, currentWord.word)} 
                              className="p-1.5 hover:bg-zinc-700 rounded-full transition-colors text-zinc-300"
                            >
                              <Volume2 size={18} />
                            </button>
                          </div>
                        )}
                        <p className="text-[11px] text-zinc-500 pt-4">(Click card to flip)</p>
                      </div>
                    ) : (
                      <div className="space-y-4 w-full max-w-xl animate-fadeIn">
                        <h2 className="text-2xl md:text-3xl font-bold text-blue-400">
                          {currentWord.meaning}
                        </h2>
                        
                        {currentWord.example && (
                          <div className="space-y-1.5 pt-2 text-left bg-[#0F1117]/80 p-4 rounded-2xl border border-zinc-800">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Example:</span>
                            <p className="text-xs md:text-sm italic text-zinc-200 flex items-center justify-between gap-2">
                              <span>"{currentWord.example}"</span>
                              <button 
                                onClick={(e) => handleSpeak(e, currentWord.example)} 
                                className="p-1 hover:bg-zinc-800 rounded-full shrink-0 text-zinc-400"
                              >
                                <Volume2 size={16} />
                              </button>
                            </p>
                            <p className="text-xs text-zinc-400">→ {currentWord.exampleTranslation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Interactive Controls */}
                  <div className="flex items-center justify-between px-1 pt-1">
                    <button 
                      onClick={handleMarkUnremembered} 
                      className="flex items-center gap-2 bg-[#272D3D] hover:bg-[#32394E] text-zinc-200 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all border border-zinc-700/50"
                    >
                      <RotateCcw size={15} /> Still Learning (Review later)
                    </button>

                    <span className="text-xs text-zinc-500 font-semibold hidden md:inline">
                      {activeQueue.length} unmastered left
                    </span>

                    <button 
                      onClick={handleMarkRemembered} 
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all"
                    >
                      <Check size={16} /> Mastered (Hide)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#1C212E] rounded-3xl p-10 text-center border border-zinc-800 space-y-4">
                  <CheckCircle2 size={48} className="text-emerald-400 mx-auto" />
                  <h2 className="text-xl font-bold text-white">Awesome! You've mastered all words in this deck!</h2>
                  <p className="text-xs text-zinc-400">All words are marked as "Mastered". Switch decks or reset to study again.</p>
                  <button 
                    onClick={handleResetSetProgress}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-blue-600/30"
                  >
                    <RefreshCw size={15} /> Review Deck From Scratch
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MODE 2: QUIZ */}
          {activeTab === 'quiz' && (
            <div>
              {currentWord ? (
                <div className="space-y-5">
                  <div className="bg-gradient-to-b from-[#1C212E] to-[#141722] rounded-3xl p-6 text-center border border-zinc-700/60 space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold text-zinc-500 px-2">
                      <span>Remaining: {activeQueue.length}</span>
                      <span>Mastered: {currentSetRememberedCount}</span>
                    </div>
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block pt-1">Select the correct meaning:</span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white flex items-center justify-center gap-2">
                      {currentWord.word}
                      <button onClick={(e) => handleSpeak(e, currentWord.word)} className="p-1 hover:bg-zinc-700 rounded-full text-zinc-400">
                        <Volume2 size={18} />
                      </button>
                    </h2>
                    <p className="text-xs font-mono text-blue-400">/{currentWord.pronunciation}/</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {quizOptions.map((opt) => {
                      const isSelected = selectedOption === opt.id;
                      const isCorrect = opt.id === currentWord.id;

                      let btnStyle = "bg-[#1E222D] border-zinc-800 text-zinc-200 hover:border-blue-500/50 hover:bg-[#252B3A]";
                      if (selectedOption !== null) {
                        if (isCorrect) btnStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold shadow-lg shadow-emerald-950/50";
                        else if (isSelected) btnStyle = "bg-red-950/80 border-red-500 text-red-200 shadow-lg shadow-red-950/50";
                      }

                      return (
                        <button
                          key={opt.id}
                          disabled={selectedOption !== null}
                          onClick={() => handleQuizSelect(opt.id)}
                          className={`p-4 rounded-2xl border text-left text-xs md:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt.meaning}</span>
                          {selectedOption !== null && isCorrect && <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />}
                          {selectedOption !== null && isSelected && !isCorrect && <XCircle className="text-red-400 shrink-0" size={18} />}
                        </button>
                      );
                    })}
                  </div>

                  {selectedOption !== null && (
                    <div className="flex justify-end pt-2">
                      <button 
                        onClick={handleQuizNext}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all"
                      >
                        {selectedOption === currentWord.id ? 'Mastered! Next Word →' : 'Wrong! Review Later →'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#1C212E] rounded-3xl p-10 text-center border border-zinc-800 space-y-4">
                  <CheckCircle2 size={48} className="text-emerald-400 mx-auto" />
                  <h2 className="text-xl font-bold text-white">Quiz Completed!</h2>
                  <p className="text-xs text-zinc-400">You answered correctly and mastered all words in this deck.</p>
                  <button 
                    onClick={handleResetSetProgress}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-blue-600/30"
                  >
                    <RefreshCw size={15} /> Reset & Play Quiz Again
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MODE 3: TYPING PRACTICE */}
          {activeTab === 'type' && (
            <div>
              {typeIndex < typeQueue.length ? (
                <div className="space-y-5">
                  <div className="bg-gradient-to-b from-[#1C212E] to-[#141722] rounded-3xl p-6 text-center border border-zinc-700/60 space-y-3">
                    <div className="flex justify-between items-center text-xs font-semibold text-zinc-500">
                      <span>Progress: {typeIndex + 1} / {typeQueue.length}</span>
                      <span className="text-blue-400 bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-800/80">
                        Type correctly to proceed
                      </span>
                    </div>

                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block pt-1">Vietnamese Meaning:</span>
                    <h2 className="text-xl md:text-2xl font-bold text-blue-400">
                      {currentTypeWord.meaning}
                    </h2>
                    {currentTypeWord.pronunciation && (
                      <span className="inline-block text-xs bg-zinc-800/80 text-zinc-300 px-3 py-1 rounded-full font-mono border border-zinc-700/50">
                        Phonetic hint: /{currentTypeWord.pronunciation}/
                      </span>
                    )}
                  </div>

                  <form onSubmit={handleCheckType} className="space-y-4">
                    <div className="relative">
                      <input 
                        type="text"
                        value={typedInput}
                        onChange={(e) => { setTypedInput(e.target.value); setTypeResult(null); }}
                        placeholder="Type English word here..."
                        className={`w-full p-4 rounded-2xl border text-base md:text-lg outline-none transition-all ${
                          typeResult === 'correct' 
                            ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200 font-bold' 
                            : typeResult === 'incorrect' 
                            ? 'border-red-500 bg-red-950/40 text-red-200' 
                            : 'border-zinc-700/80 bg-[#191D28] focus:border-blue-500 text-white'
                        }`}
                      />
                      {typeResult === null && (
                        <button 
                          type="submit"
                          className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-5 rounded-xl text-xs font-bold hover:bg-blue-500 transition-colors shadow-md shadow-blue-600/30"
                        >
                          Check
                        </button>
                      )}
                    </div>

                    {typeResult === 'correct' && (
                      <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-700 text-emerald-200 text-xs md:text-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                          <span>Correct! The word is: <strong>{currentTypeWord.word}</strong></span>
                        </div>
                        <button 
                          type="button"
                          onClick={handleNextTypeWord}
                          className="bg-emerald-500 text-zinc-950 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-400"
                        >
                          Next Word →
                        </button>
                      </div>
                    )}

                    {typeResult === 'incorrect' && (
                      <div className="p-4 rounded-2xl bg-red-950/60 border border-red-700 text-red-200 text-xs md:text-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <XCircle size={18} className="text-red-400 shrink-0" />
                            <span>Incorrect! This word will repeat at the end.</span>
                          </div>
                          <button 
                            type="button"
                            onClick={handleNextTypeWord}
                            className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600"
                          >
                            Got it, Continue →
                          </button>
                        </div>
                        <p className="text-xs text-red-300 pl-6">Correct Answer: <strong>{currentTypeWord.word}</strong></p>
                      </div>
                    )}
                  </form>
                </div>
              ) : (
                <div className="bg-[#1C212E] rounded-3xl p-8 text-center border border-zinc-800 space-y-4">
                  <CheckCircle2 size={48} className="text-emerald-400 mx-auto" />
                  <h2 className="text-xl font-bold text-white">Typing Practice Complete!</h2>
                  <p className="text-xs text-zinc-400">You typed all words in this deck correctly.</p>
                  <button 
                    onClick={initTypeQueue}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-blue-600/30"
                  >
                    <RefreshCw size={15} /> Practice Typing Again
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
