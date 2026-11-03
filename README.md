# 🎓 Hệ Thống Thiệp Mời Tốt Nghiệp — Hà Minh Dũng (Zunzun)

Bộ mã nguồn đã được chuẩn hóa gọn nhẹ để đẩy lên **GitHub**, triển khai lên **Vercel** và lưu trữ dữ liệu trực tuyến trên **Supabase**.

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
thiep-tot-nghiep-ha-minh-dung/
├── index.html              # Trang thiệp mời chính gửi cho khách (/?to=Tên+Khách)
├── quan-ly-thiep.html      # Trang Quản Lý & Tự Tạo Link Thiệp (/quan-ly hoặc /admin)
├── loi-chuc-zunzun.html    # Trang riêng xem Đôi lời thầm kín gửi Zunzun (/loi-chuc)
├── assets/
│   ├── config.js           # Nơi cấu hình SUPABASE_URL, SUPABASE_ANON_KEY & API đồng bộ
│   ├── card1.webp          # Ảnh thiệp gốc 1 (Đeo Sash)
│   ├── card2.webp          # Ảnh thiệp gốc 2 (Cầm Bằng Đỏ)
│   └── map-tang-g.webp     # Ảnh sơ đồ Tầng G ĐH FPT TP.HCM
├── supabase_schema.sql     # Câu lệnh SQL tạo bảng trên Supabase (chạy 1 lần)
├── vercel.json             # Cấu hình đường dẫn rút gọn cho Vercel
└── .gitignore
```

---

## 🚀 Hướng Dẫn Cài Đặt Supabase & Deploy Lên Vercel (3 Bước)

### Bước 1: Tạo Database trên Supabase (1 phút)
1. Đăng nhập [Supabase Dashboard](https://supabase.com/dashboard) và tạo một Project mới (miễn phí).
2. Vào mục **SQL Editor** (biểu tượng bên trái) $ightarrow$ bấm **New Query**.
3. Mở file [`supabase_schema.sql`](./supabase_schema.sql), copy toàn bộ nội dung dán vào SQL Editor rồi bấm **Run** (sẽ tạo 3 bảng: `guests`, `wishes`, `app_settings`).
4. Vào **Project Settings** $ightarrow$ **API**:
   - Copy **Project URL** (ví dụ: `https://xyzcompany.supabase.co`)
   - Copy **Project API Keys (`anon` / `public`)**

### Bước 2: Điền Key vào `assets/config.js`
Mở file [`assets/config.js`](./assets/config.js) và dán 2 thông số vừa copy vào:
```javascript
window.APP_CONFIG = {
  SUPABASE_URL: "https://xyzcompany.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  DEFAULT_PHOTO_DRIVE_URL: ""
};
```
*(Hoặc bạn có thể nhập trực tiếp trên tab **☁️ Cấu Hình Supabase & Link Ảnh** trong trang `/quan-ly`).*

### Bước 3: Push lên GitHub & Deploy Vercel
```bash
git init
git add .
git commit -m "Initialize Graduation Invitation Web System"
git branch -M main
git remote add origin https://github.com/<username>/<repo-name>.git
git push -u origin main
```
Sau đó vào [Vercel](https://vercel.com/new) $ightarrow$ **Import Git Repository** $ightarrow$ bấm **Deploy** là xong!

---

## 🔗 Các Đường Dẫn Sau Khi Deploy Lên Vercel
- **Trang thiệp gửi khách**: `https://<ten-mien>.vercel.app/?to=Bạn%20Minh%20Anh`
- **Trang tự tạo & quản lý link thiệp (Chỉ mình bạn dùng)**: `https://<ten-mien>.vercel.app/quan-ly`
- **Trang xem lời chúc riêng (Chỉ mình bạn dùng)**: `https://<ten-mien>.vercel.app/loi-chuc`
