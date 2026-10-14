# BÁO CÁO RÀ SOÁT BẢO MẬT TRƯỚC KHI GỘP PR (GIAI ĐOẠN 8)

- **Nhánh kiểm tra**: `giai-doan-8-smartclass-ai`
- **Người thực hiện**: Antigravity Pair Programmer
- **Thời điểm**: 14/10/2026
- **Kết luận**: **ĐẠT YÊU CẦU**

---

### 1. Bảng Tổng Hợp Rủi Ro
| Mức độ rủi ro | Số lượng | Vấn đề phát hiện | Trạng thái xử lý |
| :--- | :---: | :--- | :--- |
| **Nghiêm trọng (Critical)** | 0 | Không phát hiện | - |
| **Cao (High)** | 2 | Lỗ hổng IDOR tiềm ẩn khi Giáo viên khác lớp truy vấn đề kiểm tra hoặc sổ điểm | Đã bổ sung kiểm tra `lop.giaoVien?.idNguoiDung === idNguoiDung` |
| **Trung bình (Medium)** | 1 | Truy vấn UUID rỗng trong `TienIchGiaoVuProvider` | Đã sửa thành `lopHanhChinh.count({ where: { idGiaoVienCN: null } })` |
| **Thấp (Low)** | 1 | Trình duyệt tự động điền mật khẩu vào ô tìm kiếm trên `/nguoi-dung` | Đã khóa autofill bằng `type="search"`, `readOnly` khi mở hộp thoại và hidden trap input |

---

### 2. Chi Tiết Phát Hiện & Biện Pháp Khắc Phục
- **Vấn đề 1 (Anti-IDOR Phân hệ Kiểm tra)**: Trong `DichVuKiemTraService.kiemTraQuyenLop`, cần chặn giáo viên không phụ trách lớp học phần truy cập danh sách đề và chi tiết câu hỏi/đáp án.
  - *Biện pháp*: Đã bổ sung kiểm tra sở hữu `lop.giaoVien?.idNguoiDung !== idNguoiDung` trả về `403 ForbiddenException`.
- **Vấn đề 2 (Anti-IDOR Phân hệ Sổ điểm)**: Trong `DichVuSoDiemService.layBangDiemLopHocPhan`, cần chặn học sinh ngoài lớp và giáo viên không phụ trách xem thống kê bảng điểm của lớp học phần.
  - *Biện pháp*: Đã kiểm tra ghi danh của học sinh và quyền giảng dạy của giáo viên trước khi trả về dữ liệu; cô lập học sinh chỉ thấy duy nhất dòng điểm của chính mình.
- **Vấn đề 3 (An toàn AI - Rule 04)**: Kiểm tra quy trình biên soạn câu hỏi trắc nghiệm bằng AI và nhận xét kết quả học phần.
  - *Biện pháp*: Thực hiện `Pre-filtering` tài liệu theo `idLopHocPhan`, ghi nhận đầy đủ `NhatKySuDungAI` và tạo bản ghi `BanNhapAI`.

---

### 3. Checklist Phê Duyệt An Toàn
- [x] Không có secret hoặc thông tin nhạy cảm trong git diff.
- [x] 100% endpoint được bảo vệ bởi `JwtXacThucGuard`, `PhanQuyenCaslGuard` và kiểm tra quan hệ sở hữu (Anti-IDOR).
- [x] Không có câu lệnh SQL raw không an toàn.
- [x] Giao diện tuân thủ 100% quy tắc Warm Minimal + Monospace (0 vi phạm màu cấm/gradient/shadow nặng).
- [x] Toàn bộ 20/20 test suites (`120/120` unit tests) và `typecheck` cả 3 package đều đạt 100%.
