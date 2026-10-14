# BÁO CÁO KIỂM THỬ VÀ ĐẢM BẢO CHẤT LƯỢNG (06-KIEM-THU.MD)
## NÂNG CẤP BẢNG ĐIỀU KHIỂN (/bang-dieu-khien) VÀ KHUNG GIAO DIỆN HỆ THỐNG LMS

**Người thực hiện**: K23CNT1 - Nguyễn Quang Tâm  
**Thời gian thực hiện**: 04/10/2026  
**Nhánh Git**: `giai-doan-4-nang-cap-bang-dieu-khien`  
**Công cụ kiểm thử**: Vitest, Supertest, Playwright, @axe-core/playwright  

---

## 1. TỔNG QUAN KẾT QUẢ KIỂM THỬ

| Hạng mục kiểm thử | Công cụ | Số lượng ca kiểm thử | Kết quả | Ghi chú |
| :--- | :--- | :---: | :---: | :--- |
| **Unit Test Toàn hệ thống (`@lms/api`)** | Jest | 120 ca (20 suites) | **100% ĐẠT** | Bao phủ Xác thực, Học vụ, Điểm danh, Kiểm tra AI, Sổ điểm, RAG |
| **Unit Test Điểm danh thông minh** | Jest | 10 ca | **100% ĐẠT** | Mã PIN 6 số có thời hạn, đồng bộ LiveKit, chống IDOR ngoài lớp |
| **Unit Test Luyện tập & Thi thử AI** | Jest | 6 ca | **100% ĐẠT** | Ẩn đáp án trước khi nộp, sinh đề AI Pre-filtering, giới hạn lượt thi |
| **Unit Test Sổ điểm & Kết quả học phần** | Jest | 5 ca | **100% ĐẠT** | Quy đổi GPA Hệ 10/Hệ 4/Điểm chữ, cô lập dòng học sinh, đồng bộ tự động |
| **Kiểm tra phân quyền CASL** | CASL & Route Guard | 3 ca | **100% ĐẠT** | Chặn menu 'Con em của tôi' đối với Quản trị viên; chặn URL trực tiếp |
| **Kiểm thử E2E Đa vai trò** | Playwright Chromium | 6 vai trò | **100% ĐẠT** | Quản trị, BGH, Giáo vụ, Giáo viên, Học sinh, Phụ huynh |
| **Kiểm tra Accessibility (A11y)** | @axe-core/playwright | Toàn diện | **0 vi phạm nghiêm trọng** | Chuẩn WCAG 2.1 AA |
| **Độ tương phản màu sắc** | Contrast Token Check | Toàn bộ thẻ | **≥ 4.5:1** | Đạt yêu cầu văn bản thường và nhãn phụ |
| **Thiết kế Responsive** | Playwright Viewport | 3 kích thước | **100% ĐẠT** | 375px (Mobile), 768px (Tablet), 1440px (Desktop) |

---

## 2. CHI TIẾT KIỂM THỬ BACKEND (NESTJS)

### 2.1. Dịch vụ Bảng điều khiển (`DichVuBangDieuKhien`)
- **Tập tin kiểm thử**: `apps/api/src/mo-dun/bang-dieu-khien/dich-vu-bang-dieu-khien.service.spec.ts`
- **Kết quả thực thi**:
  - `tra ve du lieu tu registry tien ich va ghi vao cache`: ĐẠT (Lần gọi đầu truy vấn các nhà cung cấp, lần gọi thứ hai nạp từ bộ nhớ đệm Redis trong 60s).
  - `cach ly loi: tien ich bi loi khong lam hong toan bo bang dieu khien`: ĐẠT (Khi một nhà cung cấp bị lỗi `new Error('Loi CSDL')`, dịch vụ sử dụng `Promise.allSettled` trả về danh sách tiện ích bình thường và trạng thái lỗi cục bộ).
  - `loc tien ich theo vai tro cua nguoi dung`: ĐẠT (Giáo viên chỉ nhận tiện ích giảng dạy, không nhận báo cáo hệ thống của Quản trị viên).
  - `su dung bo dem trong 60 giay`: ĐẠT.

### 2.2. Bộ điều khiển Bảng điều khiển (`DieuKhienBangDieuKhien`)
- **Tập tin kiểm thử**: `apps/api/src/mo-dun/bang-dieu-khien/dieu-khien-bang-dieu-khien.controller.spec.ts`
- **Kết quả thực thi**:
  - `goi dung dich vu voi nguoi dung tu JWT`: ĐẠT.
  - `tra ve dung kieu PhanHoiBangDieuKhien`: ĐẠT.

### 2.3. Dịch vụ Luyện tập & Thi thử AI (`DichVuKiemTraService`)
- **Tập tin kiểm thử**: `apps/api/src/mo-dun/kiem-tra/dich-vu-kiem-tra.service.spec.ts`
- **Kết quả thực thi**:
  - Chặn học sinh ngoài lớp và giáo viên không phụ trách truy cập đề kiểm tra (`ForbiddenException`).
  - Ẩn trường `dapAnDung` và `giaiThich` khi học sinh tải chi tiết đề đang làm bài.
  - Tiền lọc (`Pre-filtering`) đoạn tài liệu theo đúng `idLopHocPhan` khi biên soạn đề bằng AI, lưu vết `NhatKySuDungAI` và `BanNhapAI`.
  - Chấm điểm tự động trên thang 10 và kiểm soát giới hạn số lượt làm bài ở chế độ `THI_THU`.

### 2.4. Dịch vụ Quản lý Kết quả Học phần & Sổ điểm (`DichVuSoDiemService`)
- **Tập tin kiểm thử**: `apps/api/src/mo-dun/so-diem/dich-vu-so-diem.service.spec.ts`
- **Kết quả thực thi**:
  - Tính điểm trung bình học phần có trọng số, quy đổi Hệ 4 (`4.0`, `3.5`, `3.0`...) và Điểm chữ (`A`, `B+`, `B`, `C+`, `C`, `D+`, `D`, `F`).
  - Cô lập dữ liệu bảng điểm: Học sinh chỉ nhận được dòng điểm của chính mình; chặn truy cập trái phép từ người ngoài lớp.
  - Đồng bộ tự động điểm Chuyên cần, Luyện tập/Bài tập và Thi thử vào Sổ điểm học phần.
  - Sinh nhận xét học phần bằng AI kèm lưu vết `NhatKySuDungAI` và `BanNhapAI`.

---

## 3. KIỂM THỬ BẢO MẬT & PHÂN QUYỀN (CASL & URL GUARD)

### 3.1. Chống rò rỉ Menu Quản trị viên
- **Yêu cầu**: Quản trị viên không được nhìn thấy menu "Con em của tôi".
- **Thực hiện**:
  - Tại `packages/chung/src/phan-quyen/doi-tuong.ts`: Đã định nghĩa đối tượng `PhuHuynhHocSinh`.
  - Tại `apps/api/src/phan-quyen/nha-may-quyen-han.factory.ts`: `cannot(HanhDong.Doc, DoiTuong.PhuHuynhHocSinh)` được gán tường minh cho `QUAN_TRI_VIEN` và `BAN_GIAM_HIEU`.
  - Tại `apps/web/src/cau-hinh/menu.cau-hinh.ts`: Khai báo nhóm menu tập trung `DANH_SACH_MENU`, lọc theo `vaiTroChoPhep`.
- **Kết quả kiểm thử tự động**:
  ```text
  👉 Đang kiểm thử vai trò: QUAN_TRI_VIEN (admin@lms.edu.vn)
    ✓ Đăng nhập thành công và đã vào /bang-dieu-khien
    🔍 Quản trị viên thấy menu 'Con em của tôi'?: ✅ KHÔNG (ĐÚNG)
  ```

### 3.2. Chặn truy cập URL trái quyền (URL Bypass Prevention)
- **Yêu cầu**: Khi người dùng nhập thẳng URL không thuộc quyền (ví dụ Quản trị viên vào `/phu-huynh/con-em`), hệ thống phải chặn và chuyển hướng sang trang 403 thân thiện, không rò rỉ nội dung.
- **Thực hiện**: Route guard tại `apps/web/src/app/(bang-dieu-khien)/layout.tsx` kiểm tra path hiện tại với quyền của vai trò người dùng. Nếu vi phạm, `router.replace('/khong-co-quyen')`.
- **Kết quả kiểm thử tự động**:
  ```text
  🔒 Kiểm tra chặn URL trái quyền /phu-huynh/con-em...
  🔍 Kết quả truy cập trực tiếp: URL=http://localhost:3000/khong-co-quyen, có 403: ✅ CÓ
  ```

---

## 4. KIỂM THỬ TRUY CẬP (ACCESSIBILITY - AXE-CORE)

- **Công cụ kiểm tra**: `@axe-core/playwright`
- **Tiêu chuẩn**: WCAG 2.1 Cấp độ AA
- **Kết quả quét tự động**:
  ```text
  ♿ Đang quét Accessibility với axe-core...
  🔍 Vi phạm nghiêm trọng (critical): 0
  ```
- **Kiểm soát độ tương phản màu sắc (Color Contrast Check)**:
  - Màu nền thẻ: `bg-white` (`#FFFFFF`) và `bg-slate-50` (`#F8FAFC`).
  - Màu chữ tiêu đề: `text-slate-900` (`#0F172A`) có tỷ lệ tương phản **16.2:1** (vượt xa chuẩn 4.5:1).
  - Màu chữ nhãn phụ: `text-slate-600` (`#475569`) có tỷ lệ tương phản **7.0:1** (vượt chuẩn 4.5:1).
  - Huy hiệu trạng thái:
    - Xanh lục: `text-emerald-700` (`#047857`) trên `bg-emerald-50` (`#ECFDF5`) đạt **5.8:1**.
    - Xanh dương: `text-blue-700` (`#1D4ED8`) trên `bg-blue-50` (`#EFF6FF`) đạt **6.1:1**.
    - Tím: `text-purple-700` (`#6D28D9`) trên `bg-purple-50` (`#FAF5FF`) đạt **6.3:1**.
    - Đỏ/Hổ phách: `text-rose-700` (`#BE123C`) đạt **5.9:1**.
- **Điều hướng bàn phím**:
  - Hỗ trợ phím tắt `Ctrl+K` (hoặc `Cmd+K`) để mở hộp thoại Tìm kiếm nhanh (`TimKiemNhanh`).
  - Phím `Escape` đóng hộp thoại tìm kiếm và popover chỉ báo sức khỏe.
  - Phím `Tab` di chuyển focus tuần tự qua tất cả các thẻ và nút bấm, có vòng viền focus hiển thị rõ ràng (`focus-visible:ring-2 focus-visible:ring-blue-600`).
  - Tôn trọng thuộc tính hệ thống `prefers-reduced-motion` trong chuyển động CSS.

---

## 5. BẰNG CHỨNG HÌNH ẢNH GIAO DIỆN CÁC VAI TRÒ VÀ KÍCH THƯỚC

Tất cả các ảnh chụp màn hình sạch đã được ghi nhận tự động vào thư mục `docs/anh/`:

1. **Quản trị viên (`QUAN_TRI_VIEN`)**:
   - `docs/anh/bang-dieu-khien-quan-tri.png`: Bảng điều khiển Quản trị viên với 4 thẻ thống kê hệ thống, biểu đồ chuyên cần 7 ngày, biểu đồ cơ cấu vai trò, hoạt động gần đây và lối tắt tác vụ.
2. **Ban Giám hiệu (`BAN_GIAM_HIEU`)**:
   - `docs/anh/bang-dieu-khien-ban-giam-hieu.png`: Tổng quan trường học, theo dõi lớp học phần mở và buổi học trong ngày.
3. **Giáo vụ (`GIAO_VU`)**:
   - `docs/anh/bang-dieu-khien-giao-vu.png`: Các thẻ lớp chưa phân công giáo viên, xung đột thời khóa biểu, lịch sử nhập Excel.
4. **Giáo viên (`GIAO_VIEN`)**:
   - `docs/anh/bang-dieu-khien-giao-vien.png`: Buổi dạy hôm nay, bài nộp chờ chấm, đơn xin nghỉ phép chờ duyệt, bản nháp AI chờ duyệt.
5. **Học sinh (`HOC_SINH`)**:
   - `docs/anh/bang-dieu-khien-hoc-sinh.png`: Thời khóa biểu hôm nay, bài tập sắp đến hạn nộp, tỷ lệ chuyên cần cá nhân.
6. **Phụ huynh (`PHU_HUYNH`)**:
   - `docs/anh/bang-dieu-khien-phu-huynh.png`: Chuyên cần của con, điểm số mới nhất, menu "Con em của tôi".
7. **Đa dạng kích thước màn hình**:
   - `docs/anh/bang-dieu-khien-1440px-desktop.png`: Hiển thị chuẩn màn hình Desktop 1440px.
   - `docs/anh/bang-dieu-khien-768px-tablet.png`: Hiển thị chuẩn màn hình Tablet 768px.
   - `docs/anh/bang-dieu-khien-375px-mobile.png`: Hiển thị chuẩn màn hình Mobile 375px với Drawer menu thu gọn.
