const commonSenses = {
  book: [['danh từ', 'sách'], ['động từ', 'đặt chỗ, đặt trước']],
  bank: [['danh từ', 'ngân hàng'], ['danh từ', 'bờ sông'], ['động từ', 'gửi tiền vào ngân hàng']],
  charge: [['động từ', 'tính phí'], ['động từ', 'sạc pin'], ['động từ', 'buộc tội'], ['danh từ', 'khoản phí']],
  fine: [['tính từ', 'tốt, ổn'], ['tính từ', 'mịn, tinh xảo'], ['danh từ', 'tiền phạt'], ['động từ', 'phạt tiền']],
  issue: [['danh từ', 'vấn đề'], ['danh từ', 'số báo, số tạp chí'], ['động từ', 'phát hành, cấp']],
  light: [['danh từ', 'ánh sáng, đèn'], ['tính từ', 'nhẹ'], ['động từ', 'thắp sáng, châm lửa']],
  present: [['danh từ', 'món quà'], ['tính từ', 'có mặt, hiện tại'], ['động từ', 'trình bày, trao tặng']],
  produce: [['động từ', 'tạo ra, sản xuất'], ['danh từ', 'nông sản, rau củ quả']],
  run: [['động từ', 'chạy'], ['động từ', 'điều hành, vận hành']],
  portfolio: [['danh từ', 'danh mục, hồ sơ năng lực'], ['danh từ', 'danh mục đầu tư']],
  redeem: [['động từ', 'đổi, quy đổi'], ['động từ', 'chuộc lại']],
  practical: [['tính từ', 'thiết thực, thực tế'], ['tính từ', 'thực hành, ứng dụng']]
};

export const getCommonSenses = word => Object.hasOwn(commonSenses, word)
  ? commonSenses[word].map(([type, meaning]) => ({ type, meaning })) : [];
