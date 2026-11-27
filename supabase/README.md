# Bật tài khoản trên Vercel

1. Tạo hoặc chọn một dự án Supabase thuộc quyền quản lý của chủ ứng dụng.
2. Chạy migration trong thư mục migrations bằng Supabase SQL Editor hoặc Supabase CLI.
3. Trong Supabase Authentication, bật Email và đặt Site URL thành https://app-tu-vung-weld.vercel.app. Cho phép URL này trong danh sách chuyển hướng khi cần.
4. Trong Vercel, thiết lập `REACT_APP_SUPABASE_URL` và `REACT_APP_SUPABASE_PUBLISHABLE_KEY` cho Production, rồi triển khai lại. Dùng khóa publishable; khóa secret hoặc service_role không dùng trong trình duyệt.
5. Mở ứng dụng trên trình duyệt đang có dữ liệu, đăng nhập bằng liên kết trong email, rồi chọn **Tài khoản → Đưa sổ cũ trên trình duyệt này vào tài khoản**. Mở cùng tài khoản trên thiết bị thứ hai để kiểm tra sổ từ, bộ học riêng và tiến độ.

Khi thiếu cấu hình, ứng dụng tiếp tục dùng sổ từ cục bộ.


Nếu liên kết trong email bị dùng trước khi người học bấm, mở **Authentication → Emails** và đổi nội dung của cả **Confirm signup** lẫn **Magic Link** sang mã xác nhận. Dùng nội dung sau cho mỗi mẫu:

```html
<h2>Mã đăng nhập Vocab TOEIC</h2>
<p>Nhập mã này trong mục Đăng nhập trên Vocab TOEIC:</p>
<p><strong>{{ .Token }}</strong></p>
```

Trong app, gửi email đăng nhập rồi chọn **Nhập mã từ email**.
