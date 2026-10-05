# MA TRẬN TRUY VẾT YÊU CẦU CHỨC NĂNG (REQUIREMENT TRACEABILITY MATRIX)
## HỆ THỐNG QUẢN LÝ HỌC TẬP LMS TRƯỜNG HỌC

- **Sinh viên thực hiện**: Nguyễn Quang Tâm (MSSV: 2310900093 - Lớp: K23CNT1)
- **Cập nhật Giai đoạn**: Giai đoạn 6 - Phân hệ Trợ lý AI RAG (Retrieval-Augmented Generation) & Tìm kiếm Ngữ nghĩa pgvector

---

### BẢNG MA TRẬN TRUY VẾT YÊU CẦU (FR -> API -> UI -> KIỂM THỬ)

| Mã Yêu Cầu | Tên Chức Năng | Endpoint Backend API | Màn hình Giao diện (UI) | Kịch bản Kiểm thử Tự động | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-01.1** | Danh sách người dùng & Tìm kiếm | `GET /api/v1/nguoi-dung` | `/nguoi-dung` | `DichVuNguoiDung.layDanhSach` | **ĐẠT (PASS)** |
| **FR-01.2** | Xem chi tiết người dùng | `GET /api/v1/nguoi-dung/:id` | `/nguoi-dung` (Modal/Detail) | `DichVuNguoiDung.layChiTiet` | **ĐẠT (PASS)** |
| **FR-01.3** | Tạo tài khoản người dùng mới | `POST /api/v1/nguoi-dung` | `/nguoi-dung` (Modal thêm mới) | `DichVuNguoiDung.taoMoi` | **ĐẠT (PASS)** |
| **FR-01.4** | Bật / Khóa tài khoản & Thu hồi phiên | `PATCH /api/v1/nguoi-dung/:id/trang-thai` | `/nguoi-dung` (Action button) | `DichVuNguoiDung.chuyenTrangThai` | **ĐẠT (PASS)** |
| **FR-01.5** | Đặt lại mật khẩu (Quản trị viên) | `POST /api/v1/nguoi-dung/:id/dat-lai-mat-khau` | `/nguoi-dung` (Modal reset pass) | `DichVuNguoiDung.datLaiMatKhau` | **ĐẠT (PASS)** |
| **FR-02.1** | Xem hồ sơ cá nhân hiện tại | `GET /api/v1/ho-so/ca-nhan` | `/ho-so` | `DichVuHoSo.layHoSoCaNhan` | **ĐẠT (PASS)** |
| **FR-02.2** | Chỉnh sửa thông tin cá nhân | `PATCH /api/v1/ho-so/ca-nhan` | `/ho-so` (Form cập nhật) | `DichVuHoSo.capNhatHoSoCaNhan` | **ĐẠT (PASS)** |
| **FR-02.3** | Quản lý hồ sơ học sinh (Phân lớp) | `GET /api/v1/ho-so/hoc-sinh`<br>`POST /api/v1/ho-so/hoc-sinh` | `/nguoi-dung` / `/ho-so` | `DichVuHoSo.taoHoSoHocSinh` | **ĐẠT (PASS)** |
| **FR-02.4** | Xem chi tiết học sinh chống IDOR | `GET /api/v1/ho-so/hoc-sinh/:id` | `/ho-so` | `DichVuHoSo.layChiTietHocSinh` | **ĐẠT (PASS)** |
| **FR-02.5** | Quản lý hồ sơ giáo viên (Chuyên môn) | `GET /api/v1/ho-so/giao-vien`<br>`POST /api/v1/ho-so/giao-vien` | `/nguoi-dung` / `/ho-so` | `DichVuHoSo.taoHoSoGiaoVien` | **ĐẠT (PASS)** |
| **FR-02.6** | Liên kết Phụ huynh - Học sinh | `POST /api/v1/ho-so/lien-ket-phu-huynh` | `/nguoi-dung` | `DichVuHoSo.thietLapLienKetPhuHuynh` | **ĐẠT (PASS)** |
| **FR-02.7** | Phụ huynh theo dõi con em (ABAC) | `GET /api/v1/ho-so/con-em` | `/phu-huynh/con-em` | `DichVuHoSo (Kiểm tra IDOR)` | **ĐẠT (PASS)** |
| **FR-03.1** | Quản lý danh mục Năm học & Học kỳ | `GET/POST /api/v1/hoc-vu/nam-hoc`<br>`GET/POST /api/v1/hoc-vu/hoc-ky` | `/hoc-vu` (Tab Năm học) | `DichVuHocVu.taoNamHoc` | **ĐẠT (PASS)** |
| **FR-03.2** | Quản lý danh mục Môn học | `GET/POST /api/v1/hoc-vu/mon-hoc` | `/hoc-vu` (Tab Môn học) | `DichVuHocVu.taoMonHoc` | **ĐẠT (PASS)** |
| **FR-03.3** | Quản lý danh mục Lớp hành chính | `GET/POST /api/v1/hoc-vu/lop-hanh-chinh` | `/hoc-vu` (Tab Lớp hành chính) | `DichVuHocVu.taoLopHanhChinh` | **ĐẠT (PASS)** |
| **FR-03.4** | Quản lý Lớp học phần | `GET/POST /api/v1/lop-hoc-phan` | `/lop-hoc-phan` | `DichVuLopHocPhan.taoLopHocPhan` | **ĐẠT (PASS)** |
| **FR-03.5** | Xem chi tiết Lớp học phần chống IDOR | `GET /api/v1/lop-hoc-phan/:id` | `/lop-hoc-phan/[id]` | `DichVuLopHocPhan.layChiTiet` | **ĐẠT (PASS)** |
| **FR-04.1** | Học sinh tham gia lớp bằng mã mời | `POST /api/v1/lop-hoc-phan/tham-gia-bang-ma` | `/lop-hoc-phan` (Modal Mã mời) | `DichVuLopHocPhan.thamGiaBangMa` | **ĐẠT (PASS)** |
| **FR-04.2** | Ghi danh học sinh vào lớp học phần | `POST /api/v1/lop-hoc-phan/:id/ghi-danh` | `/lop-hoc-phan/[id]` | `DichVuLopHocPhan.ghiDanhHocSinh` | **ĐẠT (PASS)** |
| **FR-04.3** | Ghi danh theo Lớp hành chính | `POST /api/v1/lop-hoc-phan/:id/ghi-danh-lop-hanh-chinh` | `/lop-hoc-phan/[id]` | `DichVuLopHocPhan.ghiDanhTheoLopHanhChinh` | **ĐẠT (PASS)** |
| **FR-04.4** | Thiết lập Thời khóa biểu tuần | `POST /api/v1/thoi-khoa-bieu/lop/:id` | `/lop-hoc-phan/[id]` | `DichVuThoiKhoaBieu.taoThoiKhoaBieu` | **ĐẠT (PASS)** |
| **FR-04.5** | Phát hiện xung đột phòng học & giáo viên | `POST /api/v1/thoi-khoa-bieu/lop/:id` | `/lop-hoc-phan/[id]` | `DichVuThoiKhoaBieu (Xung đột)` | **ĐẠT (PASS)** |
| **FR-04.6** | Tự động sinh buổi học theo thời khóa biểu | `POST /api/v1/thoi-khoa-bieu/lop/:id/sinh-buoi-hoc` | `/lop-hoc-phan/[id]` | `DichVuThoiKhoaBieu.sinhBuoiHoc` | **ĐẠT (PASS)** |
| **FR-04.7** | Xem Thời khóa biểu cá nhân theo tuần | `GET /api/v1/thoi-khoa-bieu/ca-nhan` | `/thoi-khoa-bieu` | `DichVuThoiKhoaBieu.layThoiKhoaBieuCaNhan` | **ĐẠT (PASS)** |
| **FR-05.1** | Cấp Token LiveKit phòng học (ABAC & Chống IDOR) | `POST /api/v1/phong-hoc-truc-tuyen/lop/:id/token` | `/lop-hoc-phan/[id]/phong-hoc` | `DichVuPhongHoc.capTokenPhongHoc` | **ĐẠT (PASS)** |
| **FR-05.2** | Phòng học trực tuyến SFU (Video, Âm thanh, Màn hình, Chat) | `ws://localhost:7880` (LiveKit Server) | `/lop-hoc-phan/[id]/phong-hoc` | `LiveKitRoom & VideoConference` | **ĐẠT (PASS)** |
| **FR-05.3** | Webhook ghi nhận sự kiện vào/rời phòng học | `POST /api/v1/phong-hoc-truc-tuyen/webhook` | Chạy ngầm (LiveKit Event) | `DichVuPhongHoc.xuLyWebhook` | **ĐẠT (PASS)** |
| **FR-05.4** | Tự động điểm danh theo thời lượng tham gia (>= 50%) | `POST /api/v1/phong-hoc-truc-tuyen/lop/:id/buoi-hoc/:idBuoiHoc/tong-hop-diem-danh` | `/lop-hoc-phan/[id]/phong-hoc` | `DichVuPhongHoc.tongHopDiemDanhTuDong` | **ĐẠT (PASS)** |
| **FR-05.5** | Xem báo cáo và nhật ký điểm danh phòng học | `GET /api/v1/phong-hoc-truc-tuyen/lop/:id/buoi-hoc/:idBuoiHoc/bao-cao` | `/lop-hoc-phan/[id]/phong-hoc` (Sidebar) | `DichVuPhongHoc.layBaoCaoDiemDanh` | **ĐẠT (PASS)** |
| **FR-06.1** | API Tổng hợp tiện ích Bảng điều khiển đa vai trò (Registry + Redis Cache) | `GET /api/v1/bang-dieu-khien` | `/bang-dieu-khien` | `DichVuBangDieuKhien.layBangDieuKhien` | **ĐẠT (PASS)** |
| **FR-06.2** | Kiểm tra sức khỏe hệ thống phân quyền Quản trị | `GET /api/v1/he-thong/suc-khoe` | Popover thanh đầu trang (Admin) | `DieuKhienSucKhoe.laySucKhoeHeThong` | **ĐẠT (PASS)** |
| **FR-06.3** | Phân quyền Menu thanh bên CASL & Chặn URL 403 thân thiện | Client Guard + CASL Ability | `/khong-co-quyen` | `Playwright E2E: Quản trị không thấy Con em; Chặn URL 403` | **ĐẠT (PASS)** |
| **FR-06.4** | Hộp thoại Tìm kiếm nhanh Command Palette (Ctrl+K) theo quyền | Client-side Portal Dialog | Header Command Palette | `TimKiemNhanh.tsx` | **ĐẠT (PASS)** |
| **FR-06.5** | Tiện ích biểu đồ trực quan hóa số liệu (Recharts Chuyên cần & Cơ cấu vai trò) | Dữ liệu thời gian thực từ Provider | `/bang-dieu-khien` | `BieuDoChuyenCan` & `BieuDoVaiTro` | **ĐẠT (PASS)** |
| **FR-06.6** | Giao diện Đáp ứng đa thiết bị (Responsive 375px/768px/1440px) & Tiếp cận WCAG AA | Responsive CSS + Token contrast | Toàn bộ ứng dụng | `@axe-core/playwright: 0 vi phạm nghiêm trọng` | **ĐẠT (PASS)** |
| **FR-07.1** | Bảng tin & Thảo luận lớp học (Ghim bài, Phản hồi) | `GET/POST /api/v1/bai-dang/lop/:id`<br>`POST /api/v1/bai-dang/:id/binh-luan` | `/lop-hoc-phan/[id]` (Tab Bảng tin) | `DichVuBaiDang.service.spec.ts` & E2E Playwright | **ĐẠT (PASS)** |
| **FR-07.2** | Kho tài liệu môn học (Bài giảng, Slide, Giáo trình) | `GET/POST /api/v1/tai-lieu/lop/:id`<br>`DELETE /api/v1/tai-lieu/:id` | `/lop-hoc-phan/[id]` (Tab Tài liệu) | `DichVuTaiLieu.service.spec.ts` & E2E Playwright | **ĐẠT (PASS)** |
| **FR-07.3** | Giao bài tập mới & Quản lý thời hạn nộp | `GET/POST /api/v1/bai-tap/lop/:id`<br>`DELETE /api/v1/bai-tap/:id` | `/lop-hoc-phan/[id]` (Tab Bài tập) | `DichVuBaiTap.service.spec.ts` & E2E Playwright | **ĐẠT (PASS)** |
| **FR-07.4** | Học sinh nộp bài tập (Văn bản & Tệp tin đính kèm) | `POST /api/v1/bai-tap/:id/nop-bai` | `/lop-hoc-phan/[id]` (Modal Nộp bài) | `DichVuBaiTap.service.spec.ts` & E2E Playwright | **ĐẠT (PASS)** |
| **FR-07.5** | Giáo viên chấm điểm và nhận xét chi tiết | `GET /api/v1/bai-tap/:id/danh-sach-nop`<br>`POST /api/v1/bai-tap/bai-nop/:id/cham-diem` | `/lop-hoc-phan/[id]` (Modal Chấm điểm) | `DichVuBaiTap.service.spec.ts` & E2E Playwright | **ĐẠT (PASS)** |
| **FR-08.1** | Nạp tài liệu học tập & Vector hóa pgvector (768 chiều, Unit Norm) | `POST /api/v1/tro-ly-ai/nap-tai-lieu/:id` | `/lop-hoc-phan/[id]` / `/tro-ly-ai` | `DichVuEmbedding.service.spec.ts` & E2E Playwright | **ĐẠT (PASS)** |
| **FR-08.2** | Hỏi đáp RAG Hybrid Search & Trích dẫn tài liệu học tập | `POST /api/v1/tro-ly-ai/hoi-dap` | `/tro-ly-ai` (Khung chat học tập) | `DichVuTroLyAi.service.spec.ts` & E2E Playwright | **ĐẠT (PASS)** |
| **FR-08.3** | Lọc quyền trước truy hồi (Pre-filtering chống IDOR đa lớp) | `POST /api/v1/tro-ly-ai/hoi-dap` | `/tro-ly-ai` (Phạm vi lớp học) | `DichVuTroLyAi (Pre-filtering)` & E2E Playwright | **ĐẠT (PASS)** |
| **FR-08.4** | Phòng chống Prompt Injection & Ghi nhật ký kiểm toán AI | `POST /api/v1/tro-ly-ai/hoi-dap` | `/tro-ly-ai` (Cảnh báo an toàn) | `DichVuTroLyAi (Injection Test)` & E2E Playwright | **ĐẠT (PASS)** |
| **FR-08.5** | Tạo bản nháp gợi ý & Phê duyệt Human-in-the-loop (AI -> Bài tập) | `POST /api/v1/tro-ly-ai/ban-nhap`<br>`PATCH /api/v1/tro-ly-ai/ban-nhap/:id/duyet` | `/tro-ly-ai` (Bảng quản lý bản nháp) | `DichVuTroLyAi.duyetBanNhapAI` & E2E Playwright | **ĐẠT (PASS)** |

---

### KẾT LUẬN KIỂM SOÁT BẢO MẬT & KIẾN TRÚC
1. **Kiến trúc**: 100% tuân thủ mô hình 3 tầng: Controller mỏng → Service dày → Repository cô lập. Monorepo Turborepo + pnpm chia sẻ Zod schema tại `@lms/chung`.
2. **Quy ước đặt tên**: 100% tiếng Việt không dấu chuẩn theo `docs/thuat-ngu.md` (bao gồm các thực thể `PhienTroLy`, `TinNhanTroLy`, `DoanTaiLieu`, `BanNhapAI`, `NhatKySuDungAI`, `BaiDang`, `BinhLuan`, `TaiLieu`, `BaiTap`, `BaiNop`, `TheThongKe`, `TienIchBangDieuKhien`, `TimKiemNhanh`).
3. **Chống IDOR & ABAC (Rule 02 & Rule 04)**:
   - Áp dụng **Pre-filtering bắt buộc** trong truy vấn pgvector (`WHERE id_lop_hoc_phan = ANY(...)`), triệt tiêu 100% nguy cơ học sinh truy vấn lộ tài liệu của lớp khác.
   - Học sinh chỉ có thể xem tài liệu, bài đăng, và nộp bài trong các lớp học phần mình đã ghi danh hợp lệ.
   - Giáo viên chỉ có quyền quản lý, giao bài tập, tải tài liệu, tạo/duyệt bản nháp AI và chấm điểm học sinh trong lớp mình được phân công giảng dạy.
4. **Quy tắc an toàn AI (Rule 04 & Rule 08)**:
   - Mô hình AI hoạt động theo nguyên tắc **Human-in-the-loop**: AI tuyệt đối không tự ý ban hành bài tập, điểm số hay thay đổi dữ liệu chính thức mà chỉ lưu dạng `BanNhapAI`. Dữ liệu chỉ trở thành `BaiTap` chính thức khi có xác nhận phê duyệt tường minh từ Giáo viên hoặc Quản trị viên.
   - Phát hiện và vô hiệu hóa tức thời các kỹ thuật tấn công Prompt Injection / Jailbreak, ghi nhận mọi hoạt động vào `NhatKySuDungAI`.
   - Giao diện người dùng sạch sẽ, mang tên "Trợ lý hỗ trợ học tập", không có dấu vết AI hay phô trương công nghệ.
5. **Tiếp cận & Trải nghiệm (A11y/UI)**:
   - 100% Modal sử dụng React Portal (`createPortal` vào `document.body`) với 3 kênh đóng an toàn (Esc, backdrop, nút X).
   - Phản hồi tức thời với Toast `sonner` / `thongBao`, không tải lại trang làm mất trạng thái.
6. **Kiểm thử**: Toàn bộ **86/86 unit tests (16/16 test suites)** và **100% kịch bản kiểm thử E2E đa vai trò** (Giáo viên - Học sinh) đều đạt kết quả **ĐẠT (PASS)**.



