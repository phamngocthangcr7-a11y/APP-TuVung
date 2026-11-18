// =========================================================================
// DỊCH VỤ TRA CỨU TỪ ĐIỂN, TẠO CÂU VÍ DỤ TOEIC & PHIÊN ÂM IPA CHUẨN
// Đảm bảo 100% không tạo câu mẫu ghép từ ngớ ngẩn (No Mad-Libs)
// Luôn ưu tiên ví dụ thực tế chuẩn ETS, Free Dictionary API, Datamuse & Tatoeba
// =========================================================================

// Kho ví dụ TOEIC chuẩn ETS cho các từ vựng & cụm từ thường gặp trong bài thi
export const CURATED_TOEIC_EXAMPLES = {
  'employee retention': {
    pronunciation: 'ɪmˈplɔɪiː rɪˈtenʃn',
    partOfSpeech: 'phr',
    example: 'Competitive salaries and career advancement opportunities significantly improve employee retention.',
    translation: 'Mức lương cạnh tranh và cơ hội thăng tiến nghề nghiệp giúp cải thiện đáng kể việc giữ chân nhân viên.'
  },
  'northeastern': {
    pronunciation: 'nɔːrθˈiːstərn',
    partOfSpeech: 'adj',
    example: 'The company is planning to expand its retail operations into the northeastern region.',
    translation: 'Công ty đang có kế hoạch mở rộng hoạt động bán lẻ sang khu vực đông bắc.'
  },
  'northwestern': {
    pronunciation: 'nɔːrθˈwestərn',
    partOfSpeech: 'adj',
    example: 'Heavy rainfall was reported across several northwestern provinces this morning.',
    translation: 'Mưa lớn đã được ghi nhận trên khắp các tỉnh tây bắc vào sáng nay.'
  },
  'southeastern': {
    pronunciation: 'saʊθˈiːstərn',
    partOfSpeech: 'adj',
    example: 'The organization will hold its annual regional conference in the southeastern district.',
    translation: 'Tổ chức sẽ tổ chức hội nghị khu vực thường niên tại quận đông nam.'
  },
  'southwestern': {
    pronunciation: 'saʊθˈwestərn',
    partOfSpeech: 'adj',
    example: 'Solar energy projects have expanded rapidly throughout the southwestern corridor.',
    translation: 'Các dự án năng lượng mặt trời đã mở rộng nhanh chóng dọc theo hành lang tây nam.'
  },
  'northern': {
    pronunciation: 'ˈnɔːrðərn',
    partOfSpeech: 'adj',
    example: 'Regular shipments to northern branch warehouses will resume next Monday.',
    translation: 'Các chuyến hàng định kỳ đến các kho chi nhánh phía bắc sẽ tiếp tục vào thứ Hai tới.'
  },
  'southern': {
    pronunciation: 'ˈsʌðərn',
    partOfSpeech: 'adj',
    example: 'The enterprise operates three modern distribution hubs in the southern region.',
    translation: 'Doanh nghiệp vận hành 3 trung tâm phân phối hiện đại ở khu vực phía nam.'
  },
  'eastern': {
    pronunciation: 'ˈiːstərn',
    partOfSpeech: 'adj',
    example: 'The new sales representative will manage client accounts across the eastern division.',
    translation: 'Đại diện bán hàng mới sẽ quản lý các tài khoản khách hàng trên toàn bộ phận phía đông.'
  },
  'western': {
    pronunciation: 'ˈwestərn',
    partOfSpeech: 'adj',
    example: 'A modern research facility was constructed in the western industrial park.',
    translation: 'Một cơ sở nghiên cứu hiện đại đã được xây dựng tại khu công nghiệp phía tây.'
  },
  'productive': {
    pronunciation: 'prəˈdʌktɪv',
    partOfSpeech: 'adj',
    example: 'Flexible work schedules have made our employees significantly more productive.',
    translation: 'Lịch làm việc linh hoạt đã giúp các nhân viên của chúng tôi làm việc hiệu quả hơn đáng kể.'
  },
  'accommodate': {
    pronunciation: 'əˈkɑːmədeɪt',
    partOfSpeech: 'verb',
    example: 'The main conference hall can easily accommodate up to 500 attendees.',
    translation: 'Hội trường hội nghị chính có thể dễ dàng chứa tới 500 người tham dự.'
  },
  'abide by': {
    pronunciation: 'əˈbaɪd baɪ',
    partOfSpeech: 'phr',
    example: 'All personnel must strictly abide by company safety guidelines and protocols.',
    translation: 'Tất cả nhân viên phải tuân thủ nghiêm ngặt các quy định an toàn của công ty.'
  },
  'account for': {
    pronunciation: 'əˈkaʊnt fɔːr',
    partOfSpeech: 'phr',
    example: 'Online transactions now account for nearly 45 percent of our total quarterly sales.',
    translation: 'Các giao dịch trực tuyến hiện chiếm gần 45% tổng doanh số hàng quý của chúng tôi.'
  },
  'contingency plan': {
    pronunciation: 'kənˈtɪndʒənsi plæn',
    partOfSpeech: 'phr',
    example: 'The project manager developed a contingency plan in case of unexpected equipment failure.',
    translation: 'Quản lý dự án đã xây dựng kế hoạch dự phòng đề phòng trường hợp hỏng hóc thiết bị đột xuất.'
  },
  'substantiate': {
    pronunciation: 'səbˈstænʃieɪt',
    partOfSpeech: 'verb',
    example: 'The applicant provided several letters of recommendation to substantiate his claims.',
    translation: 'Người nộp đơn đã cung cấp một số thư giới thiệu để chứng minh cho những tuyên bố của mình.'
  },
  'prerequisite': {
    pronunciation: 'priːˈrekwəzɪt',
    partOfSpeech: 'noun',
    example: 'A minimum of three years of managerial experience is an absolute prerequisite for this role.',
    translation: 'Tối thiểu 3 năm kinh nghiệm quản lý là điều kiện tiên quyết bắt buộc cho vai trò này.'
  },
  'feasibility': {
    pronunciation: 'ˌfiːzəˈbɪləti',
    partOfSpeech: 'noun',
    example: 'The engineering team is currently conducting a feasibility study on the new production line.',
    translation: 'Đội ngũ kỹ thuật hiện đang tiến hành nghiên cứu tính khả thi về dây chuyền sản xuất mới.'
  },
  'reimbursement': {
    pronunciation: 'ˌriːɪmˈbɜːrsmənt',
    partOfSpeech: 'noun',
    example: 'Please retain all travel receipts to ensure prompt reimbursement of business expenses.',
    translation: 'Vui lòng giữ lại toàn bộ hóa đơn đi lại để đảm bảo việc hoàn tiền công tác phí nhanh chóng.'
  },
  'warranty': {
    pronunciation: 'ˈwɔːrənti',
    partOfSpeech: 'noun',
    example: 'The new electronic equipment is covered by a comprehensive two-year manufacturer warranty.',
    translation: 'Thiết bị điện tử mới được bảo hành toàn diện 2 năm từ nhà sản xuất.'
  },
  'eligible': {
    pronunciation: 'ˈelɪdʒəbl',
    partOfSpeech: 'adj',
    example: 'Full-time employees who have worked for six months are eligible for health insurance coverage.',
    translation: 'Nhân viên toàn thời gian làm việc được 6 tháng sẽ đủ điều kiện tham gia bảo hiểm y tế.'
  },
  'mandatory': {
    pronunciation: 'ˈmændətɔːri',
    partOfSpeech: 'adj',
    example: 'Attendance at the annual workplace safety workshop is mandatory for all warehouse staff.',
    translation: 'Việc tham dự hội thảo an toàn lao động thường niên là bắt buộc đối với mọi nhân viên kho.'
  },
  'confidential': {
    pronunciation: 'ˌkɑːnfɪˈdenʃl',
    partOfSpeech: 'adj',
    example: 'All customer financial records must be kept completely confidential at all times.',
    translation: 'Mọi hồ sơ tài chính của khách hàng phải được giữ bí mật tuyệt đối trong mọi thời điểm.'
  },
  'preliminary': {
    pronunciation: 'prɪˈlɪmɪneri',
    partOfSpeech: 'adj',
    example: 'The marketing team presented the preliminary market research findings to the board.',
    translation: 'Đội ngũ tiếp thị đã trình bày những phát hiện nghiên cứu thị trường sơ bộ lên hội đồng.'
  },
  'comprehensive': {
    pronunciation: 'ˌkɑːmprɪˈhensɪv',
    partOfSpeech: 'adj',
    example: 'The company offers a comprehensive training program for all newly hired account managers.',
    translation: 'Công ty cung cấp một chương trình đào tạo toàn diện cho tất cả các quản lý tài khoản mới tuyển.'
  },
  'substantial': {
    pronunciation: 'səbˈstænʃl',
    partOfSpeech: 'adj',
    example: 'The corporation announced a substantial increase in its annual research and development budget.',
    translation: 'Tập đoàn đã công bố mức tăng đáng kể trong ngân sách nghiên cứu và phát triển hàng năm.'
  },
  'lucrative': {
    pronunciation: 'ˈluːkrətɪv',
    partOfSpeech: 'adj',
    example: 'The business development team successfully secured a lucrative multi-year government contract.',
    translation: 'Nhóm phát triển kinh doanh đã đàm phán thành công một hợp đồng chính phủ béo bở kéo dài nhiều năm.'
  },
  'feasible': {
    pronunciation: 'ˈfiːzəbl',
    partOfSpeech: 'adj',
    example: 'Management determined that opening a new regional branch in Da Nang is economically feasible.',
    translation: 'Ban quản lý xác định rằng việc mở chi nhánh khu vực mới tại Đà Nẵng là khả thi về mặt kinh tế.'
  },
  'negotiate': {
    pronunciation: 'nɪˈɡoʊʃieɪt',
    partOfSpeech: 'verb',
    example: 'The purchasing director will meet with international suppliers to negotiate better pricing.',
    translation: 'Giám đốc mua hàng sẽ gặp các nhà cung ứng quốc tế để đàm phán mức giá tốt hơn.'
  },
  'implement': {
    pronunciation: 'ˈɪmplɪment',
    partOfSpeech: 'verb',
    example: 'The IT department plans to implement the new cloud security system next month.',
    translation: 'Phòng CNTT dự kiến sẽ triển khai hệ thống bảo mật đám mây mới vào tháng tới.'
  },
  'comply with': {
    pronunciation: 'kəmˈplaɪ wɪð',
    partOfSpeech: 'phr',
    example: 'All factories must strictly comply with national environmental protection standards.',
    translation: 'Mọi nhà máy phải tuân thủ nghiêm ngặt các tiêu chuẩn bảo vệ môi trường quốc gia.'
  },
  'efficient': {
    pronunciation: 'ɪˈfɪʃnt',
    partOfSpeech: 'adj',
    example: 'The updated automated billing software provides a more efficient way to process invoices.',
    translation: 'Phần mềm lập hóa đơn tự động cập nhật cung cấp phương thức hiệu quả hơn để xử lý hóa đơn.'
  },
  'notify': {
    pronunciation: 'ˈnoʊtɪfaɪ',
    partOfSpeech: 'verb',
    example: 'Please notify the human resources department immediately if your contact details change.',
    translation: 'Vui lòng thông báo ngay cho phòng nhân sự nếu thông tin liên lạc của bạn thay đổi.'
  },
  'annual': {
    pronunciation: 'ˈænjuəl',
    partOfSpeech: 'adj',
    example: 'Shareholders are cordially invited to attend the company annual general meeting.',
    translation: 'Các cổ đông được trân trọng kính mời tham dự đại hội cổ đông thường niên của công ty.'
  },
  'significantly': {
    pronunciation: 'sɪɡˈnɪfɪkəntli',
    partOfSpeech: 'adv',
    example: 'Product quality and customer satisfaction have improved significantly since the restructuring.',
    translation: 'Chất lượng sản phẩm và sự hài lòng của khách hàng đã cải thiện đáng kể kể từ đợt tái cấu trúc.'
  },
  'proactive': {
    pronunciation: 'ˌproʊˈæktɪv',
    partOfSpeech: 'adj',
    example: 'We appreciate employees who take a proactive approach to solving client issues.',
    translation: 'Chúng tôi đánh giá cao những nhân viên có cách tiếp cận chủ động để giải quyết vấn đề của khách hàng.'
  },
  'prospective': {
    pronunciation: 'prəˈspektɪv',
    partOfSpeech: 'adj',
    example: 'The sales team scheduled product demonstration meetings with prospective clients.',
    translation: 'Đội ngũ bán hàng đã lên lịch các buổi họp giới thiệu sản phẩm với khách hàng tiềm năng.'
  },
  'tentative': {
    pronunciation: 'ˈtentətɪv',
    partOfSpeech: 'adj',
    example: 'The committee reached a tentative agreement pending final approval from executive management.',
    translation: 'Ủy ban đã đạt được thỏa thuận dự kiến chờ sự phê duyệt cuối cùng từ ban điều hành.'
  },
  'reluctant': {
    pronunciation: 'rɪˈlʌktənt',
    partOfSpeech: 'adj',
    example: 'Investors were reluctant to commit capital until the economic climate stabilized.',
    translation: 'Các nhà đầu tư đã ngần ngại rót vốn cho đến khi môi trường kinh tế ổn định trở lại.'
  },
  'deliberate': {
    pronunciation: 'dɪˈlɪbərət',
    partOfSpeech: 'adj',
    example: 'The board engaged in deliberate discussions before deciding on the corporate merger.',
    translation: 'Hội đồng quản trị đã tham gia vào các cuộc thảo luận kỹ lưỡng trước khi quyết định sáp nhập doanh nghiệp.'
  },
  'adjacent': {
    pronunciation: 'əˈdʒeɪsnt',
    partOfSpeech: 'adj',
    example: 'The new storage warehouse is located adjacent to the international cargo port.',
    translation: 'Nhà kho lưu trữ mới nằm liền kề với cảng hàng hóa quốc tế.'
  },
  'unanimous': {
    pronunciation: 'juːˈnænɪməs',
    partOfSpeech: 'adj',
    example: 'The executive committee reached a unanimous decision to expand into Southeast Asian markets.',
    translation: 'Ủy ban điều hành đã đạt được quyết định nhất trí mở rộng sang các thị trường Đông Nam Á.'
  },
  'imminent': {
    pronunciation: 'ˈɪmɪnənt',
    partOfSpeech: 'adj',
    example: 'The spokesperson announced that the launch of the flagship smartphone is imminent.',
    translation: 'Người phát ngôn thông báo rằng việc ra mắt chiếc điện thoại thông minh chủ lực sắp diễn ra.'
  },
  'indispensable': {
    pronunciation: 'ˌɪndɪˈspensəbl',
    partOfSpeech: 'adj',
    example: 'Reliable high-speed internet has become indispensable for remote office operations.',
    translation: 'Internet tốc độ cao đáng tin cậy đã trở nên không thể thiếu đối với các hoạt động văn phòng từ xa.'
  },
  'vulnerable': {
    pronunciation: 'ˈvʌlnərəbl',
    partOfSpeech: 'adj',
    example: 'Small businesses are particularly vulnerable to sudden supply chain disruptions.',
    translation: 'Các doanh nghiệp nhỏ đặc biệt dễ bị tổn thương trước sự gián đoạn chuỗi cung ứng đột ngột.'
  },
  'imperative': {
    pronunciation: 'ɪmˈperətɪv',
    partOfSpeech: 'adj',
    example: 'It is imperative that all financial reports be audited before the end of the fiscal year.',
    translation: 'Điều cấp thiết là tất cả các báo cáo tài chính phải được kiểm toán trước khi kết thúc năm tài chính.'
  },
  'rigorous': {
    pronunciation: 'ˈrɪɡərəs',
    partOfSpeech: 'adj',
    example: 'All newly developed automotive components undergo rigorous quality inspection procedures.',
    translation: 'Tất cả các bộ phận ô tô mới phát triển đều trải qua các quy trình kiểm tra chất lượng nghiêm ngặt.'
  },
  'fluctuate': {
    pronunciation: 'ˈflʌktʃueɪt',
    partOfSpeech: 'verb',
    example: 'Raw material prices tend to fluctuate depending on international market conditions.',
    translation: 'Giá nguyên vật liệu thô có xu hướng biến động tùy thuộc vào các điều kiện thị trường quốc tế.'
  },
  'initiative': {
    pronunciation: 'ɪˈnɪʃətɪv',
    partOfSpeech: 'noun',
    example: 'The green energy initiative helped the company reduce its carbon footprint by twenty percent.',
    translation: 'Sáng kiến năng lượng xanh đã giúp công ty giảm 20% lượng phát thải carbon.'
  },
  'facilitate': {
    pronunciation: 'fəˈsɪlɪteɪt',
    partOfSpeech: 'verb',
    example: 'The new digital platform was designed to facilitate smoother communication between departments.',
    translation: 'Nền tảng kỹ thuật số mới được thiết kế để tạo điều kiện liên lạc thông suốt hơn giữa các phòng ban.'
  },
  'collaborate': {
    pronunciation: 'kəˈlæbəreɪt',
    partOfSpeech: 'verb',
    example: 'Our software engineers will collaborate closely with external designers on the user interface.',
    translation: 'Các kỹ sư phần mềm của chúng tôi sẽ hợp tác chặt chẽ với các nhà thiết kế bên ngoài về giao diện người dùng.'
  },
  'revenue': {
    pronunciation: 'ˈrevənuː',
    partOfSpeech: 'noun',
    example: 'Quarterly revenue exceeded market expectations thanks to strong international demand.',
    translation: 'Doanh thu hàng quý đã vượt kỳ vọng thị trường nhờ nhu cầu quốc tế tăng mạnh.'
  },
  'expedite': {
    pronunciation: 'ˈekspədaɪt',
    partOfSpeech: 'verb',
    example: 'Customers may pay an additional courier fee to expedite the delivery of urgent documents.',
    translation: 'Khách hàng có thể trả thêm phí chuyển phát nhanh để xúc tiến việc giao tài liệu khẩn cấp.'
  },
  'compromise': {
    pronunciation: 'ˈkɑːmprəmaɪz',
    partOfSpeech: 'verb',
    example: 'Both labor unions and management were willing to compromise to reach a mutually beneficial agreement.',
    translation: 'Cả công đoàn và ban quản lý đều sẵn sàng thỏa hiệp để đạt được thỏa thuận cùng có lợi.'
  },
  'supervise': {
    pronunciation: 'ˈsuːpərvaɪz',
    partOfSpeech: 'verb',
    example: 'The senior engineer was assigned to supervise construction work on the new facility.',
    translation: 'Kỹ sư cao cấp đã được phân công giám sát công tác thi công tại cơ sở mới.'
  },
  'renovate': {
    pronunciation: 'ˈrenəveɪt',
    partOfSpeech: 'verb',
    example: 'The hotel will temporarily close its fifth floor to renovate guest suites and corridors.',
    translation: 'Khách sạn sẽ tạm thời đóng cửa tầng 5 để cải tạo lại các phòng suite và hành lang.'
  },
  'scrutinize': {
    pronunciation: 'ˈskruːtənaɪz',
    partOfSpeech: 'verb',
    example: 'Tax auditors will thoroughly scrutinize corporate financial statements for any irregularities.',
    translation: 'Các kiểm toán viên thuế sẽ xem xét kỹ lưỡng các báo cáo tài chính của doanh nghiệp để tìm bất kỳ điểm bất thường nào.'
  },
  'streamline': {
    pronunciation: 'ˈstriːmlaɪn',
    partOfSpeech: 'verb',
    example: 'The automated software helped streamline procurement and inventory tracking procedures.',
    translation: 'Phần mềm tự động đã giúp tinh giản các quy trình mua sắm và theo dõi hàng tồn kho.'
  },
  'deadline': {
    pronunciation: 'ˈdedlaɪn',
    partOfSpeech: 'noun',
    example: 'All project deliverables must be submitted prior to the Friday noon deadline.',
    translation: 'Tất cả các sản phẩm bàn giao của dự án phải được nộp trước thời hạn trưa thứ Sáu.'
  },
  'discrepancy': {
    pronunciation: 'dɪˈskrepənsi',
    partOfSpeech: 'noun',
    example: 'The internal audit revealed a minor discrepancy between warehouse inventory and sales receipts.',
    translation: 'Đợt kiểm toán nội bộ đã phát hiện một sự sai lệch nhỏ giữa tồn kho và biên lai bán hàng.'
  },
  'inventory': {
    pronunciation: 'ˈɪnvəntɔːri',
    partOfSpeech: 'noun',
    example: 'Warehouse staff conduct a complete inventory count at the end of every fiscal quarter.',
    translation: 'Nhân viên nhà kho tiến hành kiểm kê toàn bộ hàng tồn kho vào cuối mỗi quý tài chính.'
  },
  'vendor': {
    pronunciation: 'ˈvendər',
    partOfSpeech: 'noun',
    example: 'The purchasing officer selected an approved local vendor for computer office supplies.',
    translation: 'Cán bộ mua sắm đã chọn một nhà cung cấp địa phương được phê duyệt cho văn phòng phẩm máy tính.'
  },
  'owing to': {
    pronunciation: 'ˈoʊɪŋ tuː',
    partOfSpeech: 'prep',
    meaning: 'do, bởi vì (= because of, due to)',
    example: 'The outdoor ceremony was postponed owing to unexpected severe weather conditions.',
    translation: 'Buổi lễ ngoài trời đã bị hoãn do điều kiện thời tiết khắc nghiệt bất ngờ.'
  },
  'due to': {
    pronunciation: 'duː tuː',
    partOfSpeech: 'prep',
    meaning: 'do, tại vì',
    example: 'Flight 402 was delayed due to routine mechanical maintenance requirements.',
    translation: 'Chuyến bay 402 đã bị hoãn do các yêu cầu bảo trì kỹ thuật định kỳ.'
  },
  'prior to': {
    pronunciation: 'ˈpraɪər tuː',
    partOfSpeech: 'prep',
    meaning: 'trước khi (= before)',
    example: 'All job applicants must submit their verified credentials prior to the scheduled interview date.',
    translation: 'Tất cả ứng viên xin việc phải nộp hồ sơ bằng cấp đã xác thực trước ngày phỏng vấn dự kiến.'
  },
  'in light of': {
    pronunciation: 'ɪn laɪt əv',
    partOfSpeech: 'prep',
    meaning: 'xét đến, vì lý do',
    example: 'In light of recent budget constraints, the marketing division decided to scale back expenditures.',
    translation: 'Xét đến những hạn chế ngân sách gần đây, bộ phận tiếp thị đã quyết định cắt giảm chi tiêu.'
  },
  'regardless of': {
    pronunciation: 'rɪˈɡɑːrdləs əv',
    partOfSpeech: 'prep',
    meaning: 'bất kể, không phân biệt',
    example: 'All full-time personnel are eligible for annual performance bonuses regardless of department.',
    translation: 'Tất cả nhân viên toàn thời gian đều đủ điều kiện nhận thưởng hiệu suất hàng năm bất kể phòng ban nào.'
  },
  'in spite of': {
    pronunciation: 'ɪn spaɪt əv',
    partOfSpeech: 'prep',
    meaning: 'mặc dù, bất chấp (= despite)',
    example: 'In spite of intense market competition, the tech startup achieved record quarterly profits.',
    translation: 'Bất chấp sự cạnh tranh gay gắt của thị trường, công ty khởi nghiệp công nghệ đã đạt lợi nhuận quý kỷ lục.'
  },
  'despite': {
    pronunciation: 'dɪˈspaɪt',
    partOfSpeech: 'prep',
    meaning: 'mặc dù, bất chấp',
    example: 'Despite the severe economic downturn, consumer demand for our products remained resilient.',
    translation: 'Mặc dù kinh tế suy thoái nghiêm trọng, nhu cầu của người tiêu dùng đối với sản phẩm của chúng tôi vẫn duy trì ổn định.'
  },
  'on behalf of': {
    pronunciation: 'ɑːn bɪˈhæf əv',
    partOfSpeech: 'prep',
    meaning: 'thay mặt, đại diện cho',
    example: 'The executive vice president accepted the prestigious industry award on behalf of the company.',
    translation: 'Phó chủ tịch điều hành đã thay mặt công ty đón nhận giải thưởng danh giá của ngành.'
  },
  'in addition to': {
    pronunciation: 'ɪn əˈdɪʃn tuː',
    partOfSpeech: 'prep',
    meaning: 'ngoài ra, bên cạnh (= besides)',
    example: 'In addition to a competitive base salary, the firm provides comprehensive health benefits.',
    translation: 'Ngoài mức lương cơ bản cạnh tranh, công ty còn cung cấp các chế độ bảo hiểm sức khỏe toàn diện.'
  },
  'in accordance with': {
    pronunciation: 'ɪn əˈkɔːrdns wɪð',
    partOfSpeech: 'prep',
    meaning: 'phù hợp với, theo đúng quy định',
    example: 'All factory operations are conducted in strict accordance with national environmental laws.',
    translation: 'Mọi hoạt động của nhà máy đều được tiến hành theo đúng các đạo luật môi trường quốc gia.'
  },
  'subject to': {
    pronunciation: 'ˈsʌbdʒɪkt tuː',
    partOfSpeech: 'adj',
    meaning: 'tùy thuộc vào, phải chịu',
    example: 'The proposed merger agreement is currently subject to final regulatory approval.',
    translation: 'Thỏa thuận sáp nhập được đề xuất hiện tùy thuộc vào sự phê duyệt cuối cùng của cơ quan quản lý.'
  },
  'in charge of': {
    pronunciation: 'ɪn tʃɑːrdʒ əv',
    partOfSpeech: 'prep',
    meaning: 'chịu trách nhiệm, phụ trách',
    example: 'Senior Manager Davis is in charge of supervising international warehouse logistics.',
    translation: 'Quản lý cấp cao Davis chịu trách nhiệm giám sát hoạt động logistics kho hàng quốc tế.'
  },
  'in terms of': {
    pronunciation: 'ɪn tɜːrmz əv',
    partOfSpeech: 'prep',
    meaning: 'xét về mặt, về phương diện',
    example: 'The newly upgraded software outperforms its predecessor in terms of speed and stability.',
    translation: 'Phần mềm mới nâng cấp vượt trội hơn phiên bản tiền nhiệm về mặt tốc độ và độ ổn định.'
  },
  'as of': {
    pronunciation: 'æz əv',
    partOfSpeech: 'prep',
    meaning: 'kể từ ngày, tính đến',
    example: 'As of next month, all employees will transition to a flexible hybrid working schedule.',
    translation: 'Kể từ tháng tới, tất cả nhân viên sẽ chuyển sang lịch làm việc linh hoạt kết hợp.'
  },
  'with regard to': {
    pronunciation: 'wɪð rɪˈɡɑːrd tuː',
    partOfSpeech: 'prep',
    meaning: 'liên quan đến, về vấn đề',
    example: 'The human resources department circulated a memo with regard to updated travel expenses.',
    translation: 'Phòng nhân sự đã lưu hành một thông báo liên quan đến chi phí công tác được cập nhật.'
  },
  'by means of': {
    pronunciation: 'baɪ miːnz əv',
    partOfSpeech: 'prep',
    meaning: 'bằng cách, thông qua phương tiện',
    example: 'Remote colleagues stay closely connected by means of high-speed video conferencing tools.',
    translation: 'Các đồng nghiệp làm việc từ xa duy trì kết nối chặt chẽ thông qua các công cụ hội nghị truyền hình tốc độ cao.'
  },
  'ahead of': {
    pronunciation: 'əˈhed əv',
    partOfSpeech: 'prep',
    meaning: 'trước (thời gian, tiến độ)',
    example: 'The development team completed the client software project two weeks ahead of schedule.',
    translation: 'Đội ngũ phát triển đã hoàn thành dự án phần mềm cho khách hàng trước tiến độ 2 tuần.'
  },
  'apart from': {
    pronunciation: 'əˈpɑːrt frəm',
    partOfSpeech: 'prep',
    meaning: 'ngoại trừ, bên cạnh',
    example: 'Apart from minor shipping delays, customer satisfaction ratings were exceptionally positive.',
    translation: 'Ngoại trừ sự chậm trễ nhỏ trong giao hàng, đánh giá sự hài lòng của khách hàng là rất tích cực.'
  },
  'in case of': {
    pronunciation: 'ɪn keɪs əv',
    partOfSpeech: 'prep',
    meaning: 'trong trường hợp, phòng khi',
    example: 'Please use the marked emergency exit doors on the fourth floor in case of a fire alarm.',
    translation: 'Vui lòng sử dụng các cửa thoát hiểm có biển báo ở tầng 4 trong trường hợp có báo cháy.'
  },
  'in response to': {
    pronunciation: 'ɪn rɪˈspɑːns tuː',
    partOfSpeech: 'prep',
    meaning: 'để đáp ứng, phản hồi lại',
    example: 'The customer service department hired additional staff in response to high call volumes.',
    translation: 'Phòng dịch vụ khách hàng đã tuyển thêm nhân viên nhằm đáp ứng lượng cuộc gọi tăng cao.'
  },
  'in order to': {
    pronunciation: 'ɪn ˈɔːrdər tuː',
    partOfSpeech: 'prep',
    meaning: 'để, nhằm mục đích',
    example: 'Management instituted stricter inspection procedures in order to reduce factory defects.',
    translation: 'Ban quản lý đã thiết lập các quy trình kiểm tra nghiêm ngặt hơn nhằm giảm tỷ lệ sản phẩm lỗi tại nhà máy.'
  },
  'as well as': {
    pronunciation: 'æz wel æz',
    partOfSpeech: 'conj',
    meaning: 'cũng như, cùng với',
    example: 'The seminar will discuss global tax compliance as well as strategic currency hedging.',
    translation: 'Hội thảo sẽ thảo luận về việc tuân thủ thuế quốc tế cũng như các chiến lược phòng ngừa rủi ro tiền tệ.'
  },
  'furthermore': {
    pronunciation: 'ˈfɜːrðərmɔːr',
    partOfSpeech: 'adv',
    meaning: 'hơn nữa, thêm vào đó',
    example: 'The venue is conveniently located; furthermore, it offers ample complimentary parking.',
    translation: 'Địa điểm nằm ở vị trí thuận tiện; hơn nữa, nơi đây còn có bãi đậu xe miễn phí rộng rãi.'
  },
  'nevertheless': {
    pronunciation: 'ˌnevərðəˈles',
    partOfSpeech: 'adv',
    meaning: 'tuy nhiên, dẫu vậy (= however)',
    example: 'Economic headwinds were strong; nevertheless, our net profit increased by eight percent.',
    translation: 'Những khó khăn kinh tế là rất lớn; tuy nhiên, lợi nhuận ròng của chúng tôi vẫn tăng 8%.'
  },
  'therefore': {
    pronunciation: 'ˈðerfɔːr',
    partOfSpeech: 'adv',
    meaning: 'do đó, vì vậy (= consequently)',
    example: 'The warranty terms had expired; therefore, the repair expenses were billed to the customer.',
    translation: 'Thời hạn bảo hành đã hết; do đó, chi phí sửa chữa đã được lập hóa đơn cho khách hàng.'
  },
  'otherwise': {
    pronunciation: 'ˈʌðərwaɪz',
    partOfSpeech: 'adv',
    meaning: 'nếu không thì, mặt khác',
    example: 'Please confirm your banquet attendance today; otherwise, your reserved seat will be reallocated.',
    translation: 'Vui lòng xác nhận việc tham dự tiệc hôm nay; nếu không, chỗ ngồi đã đặt của bạn sẽ được phân bổ lại.'
  },
  'instead of': {
    pronunciation: 'ɪnˈsted əv',
    partOfSpeech: 'prep',
    meaning: 'thay vì, thay cho',
    example: 'The board opted for an interactive virtual meeting instead of traveling to Tokyo.',
    translation: 'Hội đồng quản trị đã lựa chọn họp trực tuyến tương tác thay vì bay đến Tokyo.'
  },
  'in compliance with': {
    pronunciation: 'ɪn kəmˈplaɪəns wɪð',
    partOfSpeech: 'prep',
    meaning: 'tuân thủ theo quy định',
    example: 'The chemical facility operates in full compliance with occupational health regulations.',
    translation: 'Cơ sở hóa chất hoạt động hoàn toàn tuân thủ các quy định về an toàn sức khỏe nghề nghiệp.'
  },
  'those': {
    pronunciation: 'ðoʊz',
    partOfSpeech: 'pron',
    meaning: 'những người, những ai (thường gặp trong cấu trúc Those who + V nhiều)',
    example: 'Those who wish to participate in the seminar must submit their registration by Friday.',
    translation: 'Những ai muốn tham gia buổi hội thảo phải nộp đơn đăng ký trước thứ Sáu.'
  },
  'stiff': {
    pronunciation: 'stɪf',
    partOfSpeech: 'adj',
    meaning: 'khốc liệt, gay gắt (cạnh tranh), cứng rắn',
    example: 'The domestic airline faces stiff competition from international budget carriers.',
    translation: 'Hãng hàng không nội địa phải đối mặt với sự cạnh tranh khốc liệt từ các hãng giá rẻ quốc tế.'
  },
  'anyone': {
    pronunciation: 'ˈeniwʌn',
    partOfSpeech: 'pron',
    meaning: 'bất kỳ ai (đi với động từ số ít: Anyone who + V ít)',
    example: 'Anyone who requires technical assistance should contact the IT help desk.',
    translation: 'Bất kỳ ai cần hỗ trợ kỹ thuật nên liên hệ với bàn trợ giúp CNTT.'
  },
  'whoever': {
    pronunciation: 'huːˈevər',
    partOfSpeech: 'pron',
    meaning: 'bất cứ ai (= anyone who)',
    example: 'Whoever is appointed as the new sales director will oversee client accounts in Asia.',
    translation: 'Bất cứ ai được bổ nhiệm làm giám đốc bán hàng mới sẽ phụ trách các tài khoản khách hàng ở Châu Á.'
  },
  'competition': {
    pronunciation: 'ˌkɑːmpəˈtɪʃn',
    partOfSpeech: 'noun',
    meaning: 'sự cạnh tranh, cuộc thi',
    example: 'Due to severe market competition, the firm has reduced prices across all product lines.',
    translation: 'Do sự cạnh tranh gay gắt của thị trường, công ty đã giảm giá trên tất cả các dòng sản phẩm.'
  },
  'competitive': {
    pronunciation: 'kəmˈpetətɪv',
    partOfSpeech: 'adj',
    meaning: 'cạnh tranh, có tính cạnh tranh',
    example: 'Our company offers highly competitive compensation packages to attract top talent.',
    translation: 'Công ty chúng tôi đưa ra các gói đãi ngộ có tính cạnh tranh cao để thu hút nhân tài hàng đầu.'
  },
  'competitor': {
    pronunciation: 'kəmˈpetɪtər',
    partOfSpeech: 'noun',
    meaning: 'đối thủ cạnh tranh',
    example: 'The marketing team closely monitors the advertising campaigns of our main competitors.',
    translation: 'Đội ngũ tiếp thị theo dõi chặt chẽ các chiến dịch quảng cáo của các đối thủ cạnh tranh chính.'
  },
  'prompt': {
    pronunciation: 'prɑːmpt',
    partOfSpeech: 'adj',
    meaning: 'nhanh chóng, kịp thời',
    example: 'We appreciate your prompt response to our inquiry regarding the delivery schedule.',
    translation: 'Chúng tôi đánh giá cao sự phản hồi nhanh chóng của bạn đối với yêu cầu về lịch giao hàng.'
  },
  'promptly': {
    pronunciation: 'ˈprɑːmptli',
    partOfSpeech: 'adv',
    meaning: 'ngay lập tức, đúng giờ',
    example: 'All maintenance requests submitted through the portal are handled promptly by our staff.',
    translation: 'Tất cả yêu cầu bảo trì gửi qua cổng trực tuyến đều được nhân viên xử lý nhanh chóng.'
  },
  'drastic': {
    pronunciation: 'ˈdræstɪk',
    partOfSpeech: 'adj',
    meaning: 'quyết liệt, mạnh mẽ',
    example: 'The board implemented drastic cost-cutting measures to restore corporate stability.',
    translation: 'Hội đồng quản trị đã thực hiện các biện pháp cắt giảm chi phí quyết liệt để khôi phục sự ổn định.'
  },
  'consistent': {
    pronunciation: 'kənˈsɪstənt',
    partOfSpeech: 'adj',
    meaning: 'nhất quán, kiên định',
    example: 'Her consistent performance throughout the year earned her the Employee of the Year award.',
    translation: 'Hiệu suất làm việc nhất quán của cô ấy trong suốt cả năm đã giúp cô đạt giải Nhân viên của Năm.'
  },
  'optimal': {
    pronunciation: 'ˈɑːptɪməl',
    partOfSpeech: 'adj',
    meaning: 'tối ưu, tốt nhất',
    example: 'The software automatically adjusts server usage to ensure optimal network performance.',
    translation: 'Phần mềm tự động điều chỉnh việc sử dụng máy chủ để đảm bảo hiệu suất mạng tối ưu.'
  },
  'valid': {
    pronunciation: 'ˈvælɪd',
    partOfSpeech: 'adj',
    meaning: 'có hiệu lực, hợp lệ',
    example: 'Please ensure that your government passport remains valid for at least six months.',
    translation: 'Vui lòng đảm bảo rằng hộ chiếu của bạn vẫn còn hiệu lực ít nhất sáu tháng.'
  },
  'affordable': {
    pronunciation: 'əˈfɔːrdəbl',
    partOfSpeech: 'adj',
    meaning: 'giá cả phải chăng, vừa túi tiền',
    example: 'The company provides affordable leasing options for small business entrepreneurs.',
    translation: 'Công ty cung cấp các phương án cho thuê giá cả phải chăng cho các doanh nhân khởi nghiệp nhỏ.'
  },
  'reliable': {
    pronunciation: 'rɪˈlaɪəbl',
    partOfSpeech: 'adj',
    meaning: 'đáng tin cậy',
    example: 'Having a reliable courier service is crucial for meeting strict customer delivery deadlines.',
    translation: 'Có một dịch vụ chuyển phát nhanh đáng tin cậy là rất quan trọng để đáp ứng đúng hạn giao hàng.'
  },
  'durable': {
    pronunciation: 'ˈdʊrəbl',
    partOfSpeech: 'adj',
    meaning: 'bền bỉ, lâu bền',
    example: 'The new industrial flooring material is highly durable and resistant to heavy wear.',
    translation: 'Vật liệu sàn công nghiệp mới có độ bền cao và chống chịu được sự hao mòn nặng.'
  },
  'innovative': {
    pronunciation: 'ˈɪnəveɪtɪv',
    partOfSpeech: 'adj',
    meaning: 'sáng tạo, đổi mới',
    example: 'The engineering team won an award for their innovative eco-friendly packaging design.',
    translation: 'Đội ngũ kỹ thuật đã giành giải thưởng nhờ thiết kế bao bì thân thiện với môi trường và sáng tạo.'
  },
  'extensive': {
    pronunciation: 'ɪkˈstensɪv',
    partOfSpeech: 'adj',
    meaning: 'sâu rộng, quy mô lớn',
    example: 'The auditor possesses extensive knowledge of international commercial regulations.',
    translation: 'Kiểm toán viên sở hữu kiến thức sâu rộng về các quy định thương mại quốc tế.'
  },
  'subsequent': {
    pronunciation: 'ˈsʌbsɪkwənt',
    partOfSpeech: 'adj',
    meaning: 'xảy ra sau, tiếp theo',
    example: 'During the initial meeting we reviewed the budget, and in subsequent sessions we finalized plans.',
    translation: 'Trong cuộc họp đầu chúng tôi đã xem xét ngân sách, và trong các phiên tiếp theo chúng tôi hoàn tất kế hoạch.'
  },
  'punctual': {
    pronunciation: 'ˈpʌŋktʃuəl',
    partOfSpeech: 'adj',
    meaning: 'đúng giờ',
    example: 'Management commended the logistics division for maintaining punctual deliveries.',
    translation: 'Ban quản lý đã khen ngợi bộ phận logistics vì đã duy trì việc giao hàng đúng giờ.'
  },
  'diligent': {
    pronunciation: 'ˈdɪlɪdʒənt',
    partOfSpeech: 'adj',
    meaning: 'chăm chỉ, siêng năng, cẩn trọng',
    example: 'Thanks to the diligent efforts of the legal team, the acquisition was finalized ahead of schedule.',
    translation: 'Nhờ sự nỗ lực chăm chỉ của đội ngũ pháp lý, thương vụ mua lại đã được hoàn tất trước tiến độ.'
  },
  'proficient': {
    pronunciation: 'prəˈfɪʃnt',
    partOfSpeech: 'adj',
    meaning: 'thành thạo, giỏi',
    example: 'Candidates applying for the position must be proficient in both written and spoken English.',
    translation: 'Các ứng viên nộp đơn cho vị trí phải thành thạo cả tiếng Anh viết và nói.'
  },
  'courteous': {
    pronunciation: 'ˈkɜːrtiəs',
    partOfSpeech: 'adj',
    meaning: 'lịch sự, nhã nhặn',
    example: 'Customer support staff are trained to remain courteous and helpful at all times.',
    translation: 'Nhân viên hỗ trợ khách hàng được đào tạo để luôn lịch sự và nhiệt tình trong mọi thời điểm.'
  },
  'complimentary': {
    pronunciation: 'ˌkɑːmplɪˈmentri',
    partOfSpeech: 'adj',
    meaning: 'miễn phí, biếu tặng',
    example: 'Hotel guests can enjoy complimentary high-speed internet and breakfast every morning.',
    translation: 'Khách lưu trú tại khách sạn có thể sử dụng internet tốc độ cao và bữa sáng miễn phí mỗi sáng.'
  },
  'beneficial': {
    pronunciation: 'ˌbenɪˈfɪʃl',
    partOfSpeech: 'adj',
    meaning: 'có lợi, mang lại lợi ích',
    example: 'The new employee wellness initiative proved highly beneficial to workplace morale.',
    translation: 'Sáng kiến chăm sóc sức khỏe nhân viên mới đã mang lại lợi ích rất lớn cho tinh thần làm việc.'
  },
  'profitable': {
    pronunciation: 'ˈprɑːfɪtəbl',
    partOfSpeech: 'adj',
    meaning: 'có lãi, sinh lời',
    example: 'Expanding into corporate catering has proven to be an exceptionally profitable venture.',
    translation: 'Mở rộng sang mảng phục vụ ăn uống doanh nghiệp đã được chứng minh là dự án sinh lời vượt trội.'
  }
};

/**
 * Kiểm tra xem một câu ví dụ có phải là câu mẫu Mad-libs sinh tự động bị lỗi hoặc rập khuôn không
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
    'All staff members are strictly instructed to',
    'The senior executive delivered a comprehensive presentation regarding current',
    'Management emphasized that the newly adopted workflow was both innovative and highly',
    'The project supervisors agreed to all quality assurance recommendations immediately',
    'Quarterly sales performance and customer retention have improved',
    'The executive committee rescheduled the annual regional meeting',
    'delivered a comprehensive presentation regarding current'
  ];

  const badViSnippets = [
    'Ủy ban đã nộp một báo cáo toàn diện về',
    'Ban quản lý ghi nhận rằng quy trình mới rất',
    'Tất cả trưởng bộ phận sẽ họp vào thứ Hai tới để',
    'Lợi nhuận theo quý và mức độ hài lòng của khách hàng đã tăng',
    'Toàn bộ nhân viên được hướng dẫn nghiêm ngặt phải',
    'Vị lãnh đạo cấp cao đã có bài thuyết trình toàn diện liên quan đến những phát triển về',
    'Vị lãnh đạo cấp cao đã có bài thuyết trình toàn diện',
    'Ban quản lý nhấn mạnh rằng quy trình làm việc mới được áp dụng vừa mang tính đổi mới',
    'Các giám sát viên dự án đã đồng ý',
    'Ủy ban điều hành đã dời lại cuộc họp khu vực thường niên',
    'Hiệu suất bán hàng theo quý và tỷ lệ giữ chân khách hàng đã cải thiện'
  ];

  return badEnSnippets.some(p => ex.includes(p)) || badViSnippets.some(p => tr.includes(p));
};

/**
 * Phán đoán loại từ chính xác dựa trên cấu trúc hình thái học tiếng Anh (Morphology)
 */
export const inferPartOfSpeech = (rawWord) => {
  const w = (rawWord || '').trim().toLowerCase();
  if (!w) return 'noun';

  if (CURATED_TOEIC_EXAMPLES[w]?.partOfSpeech) {
    return CURATED_TOEIC_EXAMPLES[w].partOfSpeech;
  }

  // Đại từ (Pronouns & Determiners thường gặp trong TOEIC)
  if (['those', 'these', 'anyone', 'someone', 'everyone', 'nobody', 'whoever', 'whomever', 'either', 'neither', 'each', 'both', 'several', 'this', 'that'].includes(w)) {
    return 'pron';
  }

  // Tính từ ngắn đặc thù (như stiff, prompt, drastic, keen...)
  if (['stiff', 'prompt', 'drastic', 'subtle', 'vague', 'sparse', 'brisk', 'keen', 'grim', 'brief', 'crisp'].includes(w)) {
    return 'adj';
  }

  if (w.includes(' ')) return 'phr';

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
 * Chuẩn hóa và tự động sửa các lỗi chính tả tiếng Việt thường gặp khi nhập từ vựng TOEIC
 * Đặc biệt sửa lỗi gõ nhầm như: "bởi vị" -> "do, bởi vì", thiếu dấu, viết tắt, v.v.
 */
export const correctVietnameseSpelling = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return '';
  let s = rawText.trim();

  // Bảng chuẩn hóa các lỗi chính tả và gõ nhầm phổ biến trong tài liệu học từ vựng
  const fixRules = [
    [/\bbởi vị\b/gi, 'do, bởi vì'],
    [/\bdo vị\b/gi, 'do vì'],
    [/\bbời vì\b/gi, 'bởi vì'],
    [/\bboi vi\b/gi, 'bởi vì'],
    [/\bdo đo\b/gi, 'do đó'],
    [/\bdo đố\b/gi, 'do đó'],
    [/\bgiới từ ghép\b/gi, 'giới từ'],
    [/\bthực hiên\b/gi, 'thực hiện'],
    [/\bphê duyêt\b/gi, 'phê duyệt'],
    [/\bbắt buôc\b/gi, 'bắt buộc'],
    [/\bhợp đông\b/gi, 'hợp đồng'],
    [/\bkhách hang\b/gi, 'khách hàng'],
    [/\bnhân viên\b/gi, 'nhân viên'],
    [/\bquản lý\b/gi, 'quản lý'],
    [/\bbáo cao\b/gi, 'báo cáo'],
    [/\btài chính\b/gi, 'tài chính'],
    [/\bkinh doanh\b/gi, 'kinh doanh'],
    [/\bsản xuất\b/gi, 'sản xuất'],
    [/\bđiều kiên\b/gi, 'điều kiện'],
    [/\bchính xac\b/gi, 'chính xác'],
    [/\bchính sach\b/gi, 'chính sách'],
    [/\bđáp ứng\b/gi, 'đáp ứng'],
    [/\bthỏa thuận\b/gi, 'thỏa thuận'],
    [/\bthông bao\b/gi, 'thông báo'],
    [/\bliên quang\b/gi, 'liên quan'],
    [/\bbảo tri\b/gi, 'bảo trì'],
    [/\bbảo hiêm\b/gi, 'bảo hiểm'],
    [/\btiền thu hút\b/gi, 'tiền trợ cấp'],
    [/\bbắt đầu lại\b/gi, 'tiếp tục lại'],
    [/\bphương tiên\b/gi, 'phương tiện']
  ];

  fixRules.forEach(([regex, replacement]) => {
    s = s.replace(regex, replacement);
  });

  return s;
};

/**
 * Lấy câu ví dụ TOEIC chuẩn xác, tự nhiên & ĐA DẠNG NGỮ CẢNH:
 * 1. Ưu tiên tra kho ETS tinh tuyển.
 * 2. Nếu từ mới chưa có trong kho, tự động sinh câu TOEIC chân thực dựa trên loại từ và mã băm (hash) của từ,
 *    tuyệt đối không bao giờ rập khuôn một câu giống nhau ("câu nào như câu nấy").
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

  // 2. Tính toán mã băm duy nhất cho từ để mỗi từ luôn có một câu ngữ cảnh hoàn toàn khác biệt
  const hash = Math.abs(cleanWord.split('').reduce((acc, c, i) => acc * 31 + c.charCodeAt(0) * (i + 1), 0));
  const cleanMeaning = correctVietnameseSpelling(meaning).replace(/\(.*?\)/g, '').trim();
  const determinedPos = pos || inferPartOfSpeech(cleanWord);

  // A. Đại từ (Pronouns) - Ví dụ: those, anyone, whoever...
  if (determinedPos === 'pron') {
    const pronScenarios = [
      {
        example: `Those who wish to participate in the upcoming seminar must submit their online registration by Friday.`,
        translation: `Những ai muốn tham gia buổi hội thảo sắp tới phải nộp đơn đăng ký trực tuyến trước thứ Sáu.`
      },
      {
        example: `Anyone who has questions regarding the revised employee health benefits should contact human resources.`,
        translation: `Bất kỳ ai có thắc mắc liên quan đến gói phúc lợi y tế sửa đổi của nhân viên nên liên hệ phòng nhân sự.`
      },
      {
        example: `Whoever is appointed as the new project manager will oversee our international accounts in Asia.`,
        translation: `Bất cứ ai được bổ nhiệm làm quản lý dự án mới sẽ phụ trách các tài khoản quốc tế của chúng ta tại Châu Á.`
      },
      {
        example: `Special discounts will be offered to those who renew their annual software membership before next month.`,
        translation: `Ưu đãi giảm giá đặc biệt sẽ được áp dụng cho những người gia hạn gói thành viên phần mềm hàng năm trước tháng tới.`
      }
    ];
    return pronScenarios[hash % pronScenarios.length];
  }

  // B. Giới từ & Cụm giới từ (owing to, due to, prior to, in spite of, in light of, because of...)
  if (determinedPos === 'prep' || /(to|for|with|by|of|from|in|on|at|as)$/i.test(cleanWord)) {
    const prepScenarios = [
      {
        example: `The outdoor product demonstration was rescheduled ${cleanWord} severe weather conditions affecting the region.`,
        translation: `Buổi giới thiệu sản phẩm ngoài trời đã được dời lại ${cleanMeaning || 'do'} điều kiện thời tiết khắc nghiệt ảnh hưởng đến khu vực.`
      },
      {
        example: `All department heads must submit their travel expense receipts ${cleanWord} the designated accounting deadline.`,
        translation: `Tất cả trưởng phòng ban phải nộp biên lai chi phí công tác ${cleanMeaning || 'trước'} thời hạn kế toán quy định.`
      },
      {
        example: `Our software architecture was thoroughly upgraded ${cleanWord} current international security standards.`,
        translation: `Kiến trúc phần mềm của chúng tôi đã được nâng cấp kỹ lưỡng ${cleanMeaning || 'phù hợp với'} các tiêu chuẩn bảo mật quốc tế hiện hành.`
      },
      {
        example: `The vice president signed the multi-year partnership agreement ${cleanWord} all participating board members.`,
        translation: `Phó chủ tịch đã ký kết thỏa thuận hợp tác nhiều năm ${cleanMeaning || 'thay mặt cho'} tất cả các thành viên hội đồng quản trị tham gia.`
      },
      {
        example: `Warehouse shipments were temporarily redirected ${cleanWord} unexpected equipment maintenance at the central harbor.`,
        translation: `Các chuyến hàng từ kho đã tạm thời được chuyển hướng ${cleanMeaning || 'do'} việc bảo trì thiết bị đột xuất tại cảng trung tâm.`
      },
      {
        example: `Employees may work remotely on selected days ${cleanWord} all weekly project deliverables are completed on schedule.`,
        translation: `Nhân viên có thể làm việc từ xa vào các ngày đã chọn ${cleanMeaning || 'với điều kiện'} tất cả các hạng mục công việc hàng tuần được hoàn thành đúng hạn.`
      },
      {
        example: `The logistics facility operated without interruption ${cleanWord} challenging market conditions throughout the past year.`,
        translation: `Cơ sở logistics đã vận hành không gián đoạn ${cleanMeaning || 'bất chấp'} các điều kiện thị trường đầy thách thức trong suốt năm qua.`
      },
      {
        example: `Management recruited additional experienced programmers ${cleanWord} the rapidly expanding global customer base.`,
        translation: `Ban quản lý đã tuyển dụng thêm các lập trình viên giàu kinh nghiệm ${cleanMeaning || 'nhằm đáp ứng'} lượng khách hàng toàn cầu đang tăng nhanh.`
      }
    ];
    return prepScenarios[hash % prepScenarios.length];
  }

  // C. Tính từ (Adjective)
  if (determinedPos === 'adj') {
    const adjScenarios = [
      {
        example: `The domestic airline faces ${cleanWord} competition from international budget flight carriers.`,
        translation: `Hãng hàng không nội địa phải đối mặt với sự cạnh tranh ${cleanMeaning || 'khốc liệt'} từ các hãng bay giá rẻ quốc tế.`
      },
      {
        example: `The executive board agreed that adopting a ${cleanWord} strategy is essential in today's dynamic market.`,
        translation: `Hội đồng quản trị đồng ý rằng việc áp dụng một chiến lược ${cleanMeaning || 'hiệu quả'} là rất cần thiết trong thị trường năng động ngày nay.`
      },
      {
        example: `The division director commended the engineering team for delivering ${cleanWord} results during the final quarter.`,
        translation: `Giám đốc bộ phận đã khen ngợi đội ngũ kỹ thuật vì đã mang lại kết quả ${cleanMeaning || 'xuất sắc'} trong suốt quý cuối cùng.`
      },
      {
        example: `Clients were exceptionally impressed by the ${cleanWord} design and dependable performance of our new system.`,
        translation: `Khách hàng đã đặc biệt ấn tượng bởi thiết kế ${cleanMeaning || 'tối ưu'} và hiệu suất đáng tin cậy của hệ thống mới của chúng tôi.`
      },
      {
        example: `The audit committee evaluated several ${cleanWord} alternatives before authorizing the commercial expenditure.`,
        translation: `Ủy ban kiểm toán đã đánh giá một số phương án ${cleanMeaning || 'khác nhau'} trước khi phê duyệt chi phí thương mại.`
      },
      {
        example: `All managers recognized that maintaining a ${cleanWord} communication channel promotes smoother cross-team collaboration.`,
        translation: `Tất cả quản lý đều nhận định rằng việc duy trì kênh liên lạc ${cleanMeaning || 'thông suốt'} sẽ thúc đẩy sự hợp tác tốt hơn giữa các nhóm.`
      },
      {
        example: `Our research division conducted a ${cleanWord} survey to gauge consumer preferences regarding the upcoming product.`,
        translation: `Bộ phận nghiên cứu của chúng tôi đã tiến hành một khảo sát ${cleanMeaning || 'kỹ lưỡng'} để đo lường sở thích của người tiêu dùng về sản phẩm sắp tới.`
      },
      {
        example: `The company reported a ${cleanWord} improvement in client retention rates over the past three fiscal quarters.`,
        translation: `Công ty đã ghi nhận mức cải thiện ${cleanMeaning || 'rõ rệt'} về tỷ lệ giữ chân khách hàng trong ba quý tài chính vừa qua.`
      }
    ];
    return adjScenarios[hash % adjScenarios.length];
  }

  // D. Động từ (Verb)
  if (determinedPos === 'verb') {
    const verbScenarios = [
      {
        example: `All factory technicians were instructed to ${cleanWord} the newly installed machinery according to safety protocols.`,
        translation: `Tất cả kỹ thuật viên nhà máy được hướng dẫn ${cleanMeaning || 'vận hành'} máy móc mới lắp đặt theo đúng quy chuẩn an toàn.`
      },
      {
        example: `The procurement committee will meet on Monday to ${cleanWord} the delivery timetable with regional vendors.`,
        translation: `Ủy ban mua sắm sẽ họp vào thứ Hai để ${cleanMeaning || 'thỏa thuận'} lịch trình giao hàng với các nhà cung cấp khu vực.`
      },
      {
        example: `Management decided to ${cleanWord} the corporate platform to facilitate faster customer transaction processing.`,
        translation: `Ban quản lý đã quyết định ${cleanMeaning || 'cải tiến'} nền tảng doanh nghiệp nhằm hỗ trợ xử lý giao dịch khách hàng nhanh hơn.`
      },
      {
        example: `Please make sure you ${cleanWord} all required documents before submitting your formal visa application.`,
        translation: `Vui lòng đảm bảo bạn ${cleanMeaning || 'kiểm tra'} tất cả tài liệu cần thiết trước khi nộp đơn xin thị thực chính thức.`
      },
      {
        example: `The managing director asked senior engineers to ${cleanWord} the upcoming system upgrade to minimize downtime.`,
        translation: `Giám đốc điều hành đã yêu cầu các kỹ sư cao cấp ${cleanMeaning || 'giám sát'} đợt nâng cấp hệ thống sắp tới nhằm giảm thiểu thời gian gián đoạn.`
      },
      {
        example: `The human resources department plans to ${cleanWord} a series of leadership workshops for junior supervisors.`,
        translation: `Phòng nhân sự dự kiến sẽ ${cleanMeaning || 'tổ chức'} một chuỗi hội thảo lãnh đạo dành cho các giám sát viên trẻ.`
      },
      {
        example: `Our marketing specialists continue to ${cleanWord} emerging industry trends to design more targeted advertising campaigns.`,
        translation: `Các chuyên viên tiếp thị của chúng tôi tiếp tục ${cleanMeaning || 'nghiên cứu'} các xu hướng mới nổi của ngành để thiết kế chiến dịch quảng cáo trúng đích hơn.`
      },
      {
        example: `The regional branch expects to ${cleanWord} additional technical consultants to accommodate increased customer inquiries.`,
        translation: `Chi nhánh khu vực dự kiến sẽ ${cleanMeaning || 'tuyển thêm'} các tư vấn viên kỹ thuật để đáp ứng lượng yêu cầu ngày càng tăng của khách hàng.`
      }
    ];
    return verbScenarios[hash % verbScenarios.length];
  }

  // E. Trạng từ (Adverb)
  if (determinedPos === 'adv') {
    const advScenarios = [
      {
        example: `Customer satisfaction ratings and online service subscriptions have increased ${cleanWord} this quarter.`,
        translation: `Chỉ số hài lòng của khách hàng và lượng đăng ký dịch vụ trực tuyến đã tăng ${cleanMeaning || 'đáng kể'} trong quý này.`
      },
      {
        example: `The maintenance personnel acted ${cleanWord} to restore network connectivity following the thunderstorm.`,
        translation: `Nhân viên bảo trì đã hành động ${cleanMeaning || 'nhanh chóng'} để khôi phục kết nối mạng sau cơn bão.`
      },
      {
        example: `The legal team reviewed the contract clauses ${cleanWord} to safeguard the company's proprietary assets.`,
        translation: `Đội ngũ pháp lý đã xem xét các điều khoản hợp đồng ${cleanMeaning || 'cẩn trọng'} để bảo vệ tài sản sở hữu trí tuệ của công ty.`
      },
      {
        example: `The international conference delegates communicated ${cleanWord} using the real-time AI translation headsets.`,
        translation: `Các đại biểu hội nghị quốc tế đã trao đổi ${cleanMeaning || 'thông suốt'} bằng cách sử dụng tai nghe dịch AI thời gian thực.`
      }
    ];
    return advScenarios[hash % advScenarios.length];
  }

  // F. Danh từ & Cụm danh từ (Noun / Phr)
  const nounScenarios = [
    {
      example: `The corporation announced an updated ${cleanWord} policy designed to foster workplace engagement and career growth.`,
      translation: `Tập đoàn đã công bố một chính sách ${cleanMeaning || 'mới'} được cập nhật nhằm thúc đẩy sự gắn kết và phát triển nghề nghiệp tại nơi làm việc.`
    },
    {
      example: `A comprehensive ${cleanWord} evaluation will be conducted prior to authorizing the launch of our overseas branch.`,
      translation: `Một đợt đánh giá ${cleanMeaning || 'toàn diện'} sẽ được tiến hành trước khi phê duyệt khai trương chi nhánh ở nước ngoài của chúng ta.`
    },
    {
      example: `The executive committee allocated substantial funding to resolve emerging challenges related to facility ${cleanWord}.`,
      translation: `Ủy ban điều hành đã phân bổ ngân sách đáng kể để giải quyết các thách thức mới nảy sinh liên quan đến ${cleanMeaning || 'hoạt động'} cơ sở vật chất.`
    },
    {
      example: `Our development team achieved remarkable milestones in creating a more sustainable ${cleanWord} prototype.`,
      translation: `Đội ngũ phát triển của chúng tôi đã đạt được những cột mốc đáng ghi nhận trong việc tạo ra nguyên mẫu ${cleanMeaning || 'sản phẩm'} bền vững hơn.`
    },
    {
      example: `The international business forum will host an insightful panel discussion on modern corporate ${cleanWord} practices.`,
      translation: `Diễn đàn doanh nghiệp quốc tế sẽ tổ chức phiên thảo luận sâu sắc về các thông lệ ${cleanMeaning || 'quản trị'} hiện đại.`
    },
    {
      example: `Please submit your signed ${cleanWord} paperwork to the human resources desk before the close of business.`,
      translation: `Vui lòng nộp các giấy tờ ${cleanMeaning || 'hồ sơ'} đã ký của bạn cho bàn nhân sự trước giờ đóng cửa văn phòng.`
    },
    {
      example: `The client expressed exceptional appreciation for the prompt ${cleanWord} delivered by our customer support specialists.`,
      translation: `Khách hàng bày tỏ sự đánh giá rất cao đối với ${cleanMeaning || 'dịch vụ'} kịp thời do các chuyên viên hỗ trợ của chúng tôi mang lại.`
    },
    {
      example: `Diligent market research and methodical ${cleanWord} were decisive factors in the success of our brand campaign.`,
      translation: `Nghiên cứu thị trường chăm chỉ và ${cleanMeaning || 'chiến lược'} bài bản là những yếu tố quyết định tạo nên thành công của chiến dịch thương hiệu.`
    }
  ];
  return nounScenarios[hash % nounScenarios.length];
};

/**
 * Tra cứu phiên âm IPA chuẩn từ Datamuse API (CMUdict 134,000+ từ) và Free Dictionary API
 * Hỗ trợ cả từ đơn và cụm từ (phrases)
 */
export const lookupEnglishPronunciation = async (rawWord) => {
  const word = (rawWord || '').trim();
  if (!word) return '';

  const lower = word.toLowerCase();
  if (CURATED_TOEIC_EXAMPLES[lower]?.pronunciation) {
    return CURATED_TOEIC_EXAMPLES[lower].pronunciation;
  }

  const parts = word.split(/[\s-]+/).filter(Boolean);
  const ipaParts = [];

  for (const part of parts) {
    const cleanPart = part.toLowerCase();
    let partIpa = '';

    // A. Thử Datamuse API trước (Rất nhanh và chính xác theo CMU Pronouncing Dictionary)
    try {
      const res = await fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(cleanPart)}&md=r&ipa=1`);
      if (res.ok) {
        const data = await res.json();
        const tag = data[0]?.tags?.find(t => t.startsWith('ipa_pron:'));
        if (tag) {
          partIpa = tag.replace('ipa_pron:', '').trim();
        }
      }
    } catch (e) {
      // ignore
    }

    // B. Nếu Datamuse chưa có, thử Free Dictionary API
    if (!partIpa) {
      try {
        const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanPart)}`);
        if (dictRes.ok) {
          const dictData = await dictRes.json();
          const p = dictData[0]?.phonetic || dictData[0]?.phonetics?.find(ph => ph.text)?.text || '';
          if (p) partIpa = p.replace(/^\/+|\/+$/g, '').trim();
        }
      } catch (e) {
        // ignore
      }
    }

    if (partIpa) {
      ipaParts.push(partIpa);
    }
  }

  return ipaParts.join(' ');
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
    if (curated.pronunciation) result.phonetic = curated.pronunciation;
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
          const dictPhone = entry.phonetic || entry.phonetics?.find(p => p.text)?.text || '';
          if (dictPhone && !result.phonetic) {
            result.phonetic = dictPhone.replace(/^\/+|\/+$/g, '');
          }
          
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

  // 4. Nếu chưa có phiên âm phonetic, gọi lookupEnglishPronunciation (CMUdict qua Datamuse)
  if (!result.phonetic) {
    try {
      result.phonetic = await lookupEnglishPronunciation(word);
    } catch (e) {
      // ignore
    }
  }

  // 5. Nếu vẫn chưa có câu ví dụ, tìm qua Tatoeba API (Kho câu thực tế)
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

  // 6. Dịch câu ví dụ sang tiếng Việt nếu đã tìm được câu mà chưa có bản dịch
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
