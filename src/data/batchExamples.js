const entries = [
  ['practical', 'thiết thực, thực tế', 'adj', 'The workshop offers practical advice for new managers.', 'Buổi hội thảo đưa ra lời khuyên thiết thực cho các quản lý mới.'],
  ['synthetic', 'tổng hợp, nhân tạo', 'adj', 'The gloves are made of synthetic rubber.', 'Đôi găng tay được làm từ cao su tổng hợp.'],
  ['interior design', 'thiết kế nội thất', 'noun', 'She studied interior design before opening her own studio.', 'Cô ấy học thiết kế nội thất trước khi mở xưởng thiết kế riêng.'],
  ['alternative', 'phương án khác, lựa chọn thay thế', 'noun', 'The train is a cheaper alternative to flying.', 'Đi tàu là một phương án thay thế rẻ hơn đi máy bay.'],
  ['nevertheless', 'tuy vậy, dù vậy', 'adv', 'The deadline was tight. Nevertheless, the team finished on time.', 'Hạn chót khá gấp. Tuy vậy, nhóm vẫn hoàn thành đúng hạn.'],
  ['countless', 'vô số', 'adj', 'We received countless requests for the new product.', 'Chúng tôi nhận được vô số yêu cầu về sản phẩm mới.'],
  ['produce', 'tạo ra, sản xuất', 'verb', 'The factory can produce 500 units per day.', 'Nhà máy có thể sản xuất 500 sản phẩm mỗi ngày.'],
  ['captivating', 'cuốn hút, hấp dẫn', 'adj', 'The guide told a captivating story about the building.', 'Hướng dẫn viên kể một câu chuyện cuốn hút về tòa nhà.'],
  ['streamlined', 'tinh gọn', 'adj', 'The streamlined checkout process saves customers time.', 'Quy trình thanh toán tinh gọn giúp khách hàng tiết kiệm thời gian.'],
  ['portfolio', 'danh mục, hồ sơ năng lực', 'noun', 'Please include a portfolio of your design work.', 'Vui lòng gửi kèm danh mục các dự án thiết kế của bạn.'],
  ['in contrast', 'trái lại, trái ngược lại', 'phr', 'The old office was noisy. In contrast, the new one is very quiet.', 'Văn phòng cũ rất ồn. Trái lại, văn phòng mới rất yên tĩnh.'],
  ['substantially', 'một cách đáng kể', 'adv', 'Shipping costs fell substantially last year.', 'Chi phí vận chuyển đã giảm đáng kể vào năm ngoái.'],
  ['national park', 'công viên quốc gia', 'noun', 'We booked a guided tour of the national park.', 'Chúng tôi đã đặt một chuyến tham quan có hướng dẫn tại công viên quốc gia.'],
  ['redeem', 'đổi, quy đổi', 'verb', 'You can redeem your points for a free ticket.', 'Bạn có thể đổi điểm lấy một vé miễn phí.'],
  ['adventure', 'chuyến phiêu lưu', 'noun', 'Their adventure began with a hike through the mountains.', 'Chuyến phiêu lưu của họ bắt đầu bằng một chuyến đi bộ xuyên qua vùng núi.'],
  ['troubleshoot', 'khắc phục sự cố, sửa lỗi', 'verb', 'Our team can help you troubleshoot the printer.', 'Nhóm chúng tôi có thể giúp bạn khắc phục sự cố máy in.'],
  ['rarely', 'hiếm khi', 'adv', 'Our office rarely closes before five.', 'Văn phòng của chúng tôi hiếm khi đóng cửa trước năm giờ.'],
  ['portable', 'di động, dễ mang theo', 'adj', 'Take a portable charger with you on the trip.', 'Hãy mang theo một bộ sạc di động trong chuyến đi.']
];

export const batchExamples = new Map(entries.map(([word, meaning, partOfSpeech, example, exampleTranslation]) =>
  [word, { meaning, partOfSpeech, example, exampleTranslation }]));
