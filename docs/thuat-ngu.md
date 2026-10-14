# BẢNG THUẬT NGỮ CHUẨN HỆ THỐNG LMS (SINGLE SOURCE OF TRUTH)

Tài liệu này là nguồn chuẩn duy nhất (Single Source of Truth) định nghĩa toàn bộ danh từ, động từ và trạng thái nghiệp vụ cho hệ thống Quản lý Học tập (LMS).
Toàn bộ mã nguồn (Prisma Schema, DTO, Service, Repository, Controller, Route, Component, Biến, Khóa i18n, Bảng cơ sở dữ liệu) **BẮT BUỘC** sử dụng các thuật ngữ tiếng Việt không dấu được quy định trong tài liệu này.

---

## 1. NGUYÊN TẮC CỐT LÕI
1. **Thuần nhất tiếng Việt không dấu cho định danh nghiệp vụ**: Tuyệt đối không pha trộn tiếng Anh và tiếng Việt trong định danh nghiệp vụ.
   - ❌ SAI: `getDanhSachLop`, `UserHocSinh`, `baiTapDto`, `LopHocResponse`, `classId`
   - ✅ ĐÚNG: `layDanhSachLop`, `HocSinh`, `DtoBaiTap`, `PhanHoiLopHoc`, `lopHocId`
2. **Kỹ thuật giữ nguyên chuẩn quốc tế**: Các định danh hạ tầng, giao thức, thư viện giữ nguyên chuẩn quốc tế (ví dụ: `id`, `uuid`, `ngayTao`, `ngayCapNhat`, `ngayXoa`, `jwt`, `http`, `stream`, `socket`, `bullmq`, `casl`, `DATABASE_URL`, `LIVEKIT_API_KEY`).
3. **Quy tắc bổ sung thuật ngữ**: Khi phát sinh một khái niệm nghiệp vụ mới chưa có trong bảng này:
   - **BƯỚC 1**: Đề xuất thuật ngữ tiếng Việt không dấu phù hợp (danh từ, hành động, trạng thái).
   - **BƯỚC 2**: Ghi nhận vào tài liệu `docs/thuat-ngu.md`.
   - **BƯỚC 3**: Chỉ sau khi được cập nhật vào bảng mới được phép dùng trong mã nguồn.

---

## 2. BẢNG THUẬT NGỮ CHUẨN TOÀN HỆ THỐNG

### 2.1. Người dùng, Hồ sơ & Phân quyền
| Khái niệm tiếng Anh | Tên chuẩn trong Code | Giải thích nghiệp vụ |
| :--- | :--- | :--- |
| User | `NguoiDung` | Thực thể người dùng hệ thống |
| Role | `VaiTro` | Enum vai trò: `QUAN_TRI_VIEN`, `BAN_GIAM_HIEU`, `GIAO_VU`, `GIAO_VIEN`, `HOC_SINH`, `PHU_HUYNH` |
| Permission | `QuyenHan` | Quyền hạn CASL (action: `manage`, `read`, `create`, `update`, `delete`) |
| Student / Student profile | `HocSinh` / `HoSoHocSinh` | Học sinh / Sinh viên và hồ sơ chi tiết (ngày sinh, mã số, khối) |
| Teacher / Teacher profile | `GiaoVien` / `HoSoGiaoVien` | Giáo viên / Giảng viên và hồ sơ chuyên môn (học vị, bộ môn) |
| Parent | `PhuHuynh` | Phụ huynh học sinh |
| Parent–Student link | `PhuHuynhHocSinh` | Bảng liên kết giữa phụ huynh và học sinh |
| Academic staff | `GiaoVu` | Nhân viên phòng giáo vụ quản lý đào tạo |
| Group of students | `NhomHocSinh` | Nhóm học sinh trong lớp học |

### 2.2. Học vụ, Lớp học & Thời khóa biểu
| Khái niệm tiếng Anh | Tên chuẩn trong Code | Giải thích nghiệp vụ |
| :--- | :--- | :--- |
| Academic year | `NamHoc` | Năm học (ví dụ: 2025-2026) |
| Term / Semester | `HocKy` | Học kỳ (HocKy1, HocKy2, HocKyHe) |
| Grade level | `Khoi` | Khối lớp (Khối 10, Khối 11, Khối 12 hoặc Niên khóa) |
| Subject | `MonHoc` | Môn học (Toán, Lý, Lập trình Web,...) |
| Homeroom class | `LopHanhChinh` | Lớp sinh hoạt cố định theo niên khóa |
| Course section | `LopHocPhan` | Lớp môn học theo tín chỉ/học phần cụ thể |
| Class (chung cho trang lớp) | `LopHoc` | Không gian lớp học trực tuyến trên giao diện |
| Enrollment | `GhiDanh` | Việc học sinh tham gia vào một lớp học |
| Schedule / Timetable | `ThoiKhoaBieu` | Lịch trình học tập theo tuần/kỳ |
| Session (buổi học) | `BuoiHoc` | Một buổi học cụ thể sinh ra từ thời khóa biểu |
| Physical classroom | `PhongHoc` | Phòng học vật lý trong trường |
| Online room (LiveKit) | `PhongTrucTuyen` | Phòng học ảo trên nền tảng LiveKit |

### 2.3. Tương tác Lớp học, Bài tập & Học liệu
| Khái niệm tiếng Anh | Tên chuẩn trong Code | Giải thích nghiệp vụ |
| :--- | :--- | :--- |
| Post / Stream | `BaiDang` | Bài đăng trên bảng tin lớp học |
| Comment | `BinhLuan` | Ý kiến bình luận dưới bài đăng |
| Material / Document | `TaiLieu` | Giáo trình, bài đọc, slide bài giảng |
| File / Attachment | `TepTin` | Tệp tin đính kèm tải lên hệ thống |
| Assignment | `BaiTap` | Bài tập giao cho học sinh |
| Submission | `BaiNop` | Bài làm do học sinh nộp lên |
| Submission file | `TepBaiNop` | File đính kèm trong bài nộp của học sinh |
| Rubric | `TieuChiChamDiem` | Bộ tiêu chí đánh giá cho bài tập |

### 2.4. Điểm danh & Trực tuyến
| Khái niệm tiếng Anh | Tên chuẩn trong Code | Giải thích nghiệp vụ |
| :--- | :--- | :--- |
| Attendance record | `BanGhiDiemDanh` | Bản ghi trạng thái điểm danh buổi học |
| Attendance log (join/leave) | `NhatKyThamGia` | Lịch sử vào/ra phòng LiveKit tính thời lượng |
| Leave request | `DonXinNghi` | Đơn xin nghỉ phép của học sinh/phụ huynh |
| Recording | `BanGhiHinh` | Video ghi hình buổi học qua LiveKit Egress |

### 2.5. Kiểm tra & Sổ điểm
| Khái niệm tiếng Anh | Tên chuẩn trong Code | Giải thích nghiệp vụ |
| :--- | :--- | :--- |
| Quiz / Exam | `BaiKiemTra` | Đề kiểm tra trắc nghiệm / tự luận |
| Question | `CauHoi` | Câu hỏi trong đề thi / ngân hàng đề |
| Question option | `PhuongAn` | Phương án lựa chọn (A, B, C, D) |
| Question bank | `NganHangCauHoi` | Kho lưu trữ câu hỏi theo môn học/chương |
| Quiz attempt | `LuotLamBai` | Một lần làm bài kiểm tra của học sinh |
| Quiz answer | `CauTraLoi` | Câu trả lời của học sinh cho từng câu |
| Grade column | `CotDiem` | Cột điểm (Thường xuyên, Giữa kỳ, Cuối kỳ) |
| Grade entry | `DiemSo` | Điểm số đạt được của học sinh |
| Gradebook | `SoDiem` | Sổ điểm tổng hợp của lớp học |

### 2.6. Trợ lý AI (TroLyAI) & RAG
| Khái niệm tiếng Anh | Tên chuẩn trong Code | Giải thích nghiệp vụ |
| :--- | :--- | :--- |
| AI assistant | `TroLyAI` | Module trợ lý ảo học tập thông minh |
| AI chat session | `PhienTroLy` | Phiên trò chuyện giữa người dùng và AI |
| AI chat message | `TinNhanTroLy` | Tin nhắn hỏi/đáp trong phiên trợ lý |
| Document chunk | `DoanTaiLieu` | Đoạn văn bản sau khi chia nhỏ có chồng lấn |
| Embedding | `NhungVector` | Vector đặc trưng ngữ nghĩa (pgvector) |
| AI-generated draft | `BanNhapAI` | Bản nháp do AI sinh ra (chờ duyệt) |
| AI usage log | `NhatKySuDungAI` | Nhật ký chi phí, token, độ trễ dùng AI |
| Prompt version | `PhienBanPrompt` | Quản lý phiên bản câu lệnh hệ thống |
| AI feedback | `PhanHoiAI` | Đánh giá 👍/👎 của người dùng về câu trả lời AI |

### 2.7. Thông báo & Giám sát Hệ thống
| Khái niệm tiếng Anh | Tên chuẩn trong Code | Giải thích nghiệp vụ |
| :--- | :--- | :--- |
| Notification | `ThongBao` | Thông báo realtime trong app & email |
| Audit log | `NhatKyHeThong` | Nhật ký kiểm toán hệ thống (ai, làm gì, khi nào) |

### 2.8. Cài đặt & Cấu hình Hệ thống
| Khái niệm tiếng Anh | Tên chuẩn trong Code | Giải thích nghiệp vụ |
| :--- | :--- | :--- |
| System setting | `CaiDatHeThong` | Bảng lưu trữ cấu hình tham số hệ thống dùng chung |
| Setting key | `khoa` | Mã định danh tham số cấu hình (duy nhất) |
| Setting value | `giaTri` | Giá trị thiết lập của tham số cấu hình |
| Setting group | `nhom` | Nhóm phân loại cấu hình (CHUNG, GIAO_DIEN, LIEN_HE, HOC_VU) |
| Setting description | `moTa` | Mô tả giải thích ý nghĩa tham số cho Quản trị viên |
| Data type | `kieuDuLieu` | Kiểu dữ liệu lưu trữ (CHUOI, SO, LOGIC, JSON) |
| Is public | `congKhai` | Cờ cho phép trang khách (chưa đăng nhập) đọc tham số |

### 2.9. Bảng điều khiển & Giao diện Khung
| Khái niệm tiếng Anh | Tên chuẩn trong Code | Giải thích nghiệp vụ |
| :--- | :--- | :--- |
| Statistic card | `TheThongKe` | Thẻ hiển thị số liệu thống kê tổng quan trên bảng điều khiển |
| Dashboard widget | `TienIchBangDieuKhien` | Tiện ích thống kê và dữ liệu trực quan theo vai trò đăng ký vào bảng điều khiển |
| Recent activity | `HoatDongGanDay` | Khối hiển thị danh sách nhật ký hoạt động gần đây của hệ thống |
| Action item / Pending task | `ViecCanXuLy` | Khối danh sách các tác vụ cần người dùng xử lý (chấm điểm, duyệt đơn, nộp bài) |
| Quick search / Command palette | `TimKiemNhanh` | Thanh công cụ tìm kiếm nhanh toàn hệ thống theo phím tắt Ctrl+K |

### 2.10. Báo lỗi & Đóng góp ý kiến (BaoLoiDongGop)
| Khái niệm tiếng Anh | Tên chuẩn trong Code | Giải thích nghiệp vụ |
| :--- | :--- | :--- |
| Bug report / Feedback / Contribution | `BaoLoiDongGop` | Bản ghi báo lỗi hệ thống hoặc đóng góp ý kiến cải tiến tính năng |
| Feedback type | `loaiPhanHoi` / `LoaiBaoLoiDongGop` | Phân loại: `BAO_LOI`, `DONG_GOP_Y_KIEN`, `HO_TRO_KY_THUAT` |
| Priority level | `mucDoUuTien` / `MucDoUuTienBaoLoi` | Mức độ ưu tiên: `THAP`, `TRUNG_BINH`, `CAO`, `KHAN_CAP` |
| Feedback status | `trangThai` / `TrangThaiBaoLoi` | Trạng thái xử lý: `CHO_TIEP_NHAN`, `DANG_XU_LY`, `DA_XU_LY`, `TU_CHOI` |
| Resolution / Admin response | `phanHoiXuLy` | Lời phản hồi, giải đáp hoặc hướng khắc phục từ Quản trị viên |
| Resolved by | `idNguoiXuLy` | Mã định danh Quản trị viên tiếp nhận và xử lý |
| Attachment screenshot | `anhDinhKem` | Đường dẫn ảnh chụp màn hình minh chứng lỗi |
| Browser / Environment info | `thongTinTrinhDuyet` | Chuỗi thông tin User-Agent, URL, độ phân giải màn hình |

---

## 3. DANH MỤC ENUM VÀ TRẠNG THÁI CHUẨN

```prisma
enum VaiTro {
  QUAN_TRI_VIEN
  BAN_GIAM_HIEU
  GIAO_VU
  GIAO_VIEN
  HOC_SINH
  PHU_HUYNH
}

enum TrangThaiDiemDanh {
  CO_MAT
  VANG_CO_PHEP
  VANG_KHONG_PHEP
  DI_MUON
}

enum TrangThaiBaiNop {
  CHUA_NOP
  DA_NOP
  NOP_MUON
  DA_CHAM
  DA_TRA
}

enum TrangThaiDonXinNghi {
  CHO_DUYET
  DA_DUYET
  TU_CHOI
}

enum LoaiBanNhapAI {
  CAU_HOI
  NHAN_XET
}

enum TrangThaiBanNhapAI {
  CHO_DUYET
  DA_DUYET
  TU_CHOI
}

enum TrangThaiBuoiHoc {
  CHUA_BAT_DAU
  DANG_DIEN_RA
  DA_KET_THUC
  DA_HUY
}

enum LoaiBaoLoiDongGop {
  BAO_LOI
  DONG_GOP_Y_KIEN
  HO_TRO_KY_THUAT
}

enum MucDoUuTienBaoLoi {
  THAP
  TRUNG_BINH
  CAO
  KHAN_CAP
}

enum TrangThaiBaoLoi {
  CHO_TIEP_NHAN
  DANG_XU_LY
  DA_XU_LY
  TU_CHOI
}

enum CheDoKiemTra {
  LUYEN_TAP
  THI_THU
}

enum TrangThaiBaiKiemTra {
  BAN_NHAP
  DANG_MO
  DA_DONG
}

enum TrangThaiLuotLam {
  DANG_LAM
  DA_NOP
  DA_CHAM
}
```

---

## 4. QUY TẮC ĐỘNG TỪ CHUẨN (CAMELCASE TIẾNG VIỆT)

| Động từ | Ý nghĩa | Ví dụ trong Code |
| :--- | :--- | :--- |
| `lay` / `layDanhSach` | Lấy 1 bản ghi / Lấy danh sách | `layNguoiDungTheoId`, `layDanhSachLopTheoGiaoVien` |
| `tao` | Tạo mới bản ghi | `taoLopHoc`, `taoBaiTap` |
| `capNhat` | Cập nhật bản ghi | `capNhatHoSo`, `capNhatDiemSo` |
| `xoa` | Xóa (mềm hoặc cứng) | `xoaTaiLieu`, `xoaBuoiHoc` |
| `tim` | Tìm kiếm | `timKiemTaiLieu`, `timNguoiDung` |
| `kiemTra` | Xác thực / validate | `kiemTraQuyenLop`, `kiemTraTrungLich` |
| `guiDi` | Gửi tin nhắn / email / thông báo | `guiEmailThongBao`, `guiDonXinNghi` |
| `nop` | Nộp bài tập | `nopBaiTap`, `nopLaiBaiTap` |
| `cham` | Chấm điểm bài nộp | `chamDiemBaiNop`, `chamDiemHangLoat` |
| `duyet` / `tuChoi` | Duyệt / Từ chối | `duyetDonXinNghi`, `tuChoiBanNhapAI` |
| `diemDanh` | Thao tác điểm danh | `diemDanhThuCong`, `diemDanhTuDongLiveKit` |
| `ghiDanh` | Ghi danh học sinh vào lớp | `ghiDanhHocSinh`, `ghiDanhHangLoatExcel` |
| `nhap` / `xuat` | Import / Export file | `nhapExcelHocSinh`, `xuatSoDiemExcel` |
| `dongBo` | Đồng bộ dữ liệu | `dongBoDiemVaoSoDiem`, `dongBoLiveKitParticipant` |
| `tinhToan` | Tính toán số liệu | `tinhDiemTrungBinh`, `tinhTyLeChuyenCan` |
| `khoa` / `moKhoa` | Khóa / Mở khóa | `khoaSODiemHocKy`, `khoaPhongHoc` |
| `hoiDap` | Hỏi đáp AI | `hoiDapTheoTaiLieu`, `hoiSoLieuThongKe` |
| `truyHoi` | Truy hồi vector RAG | `truyHoiDoanTaiLieu`, `truyHoiLaiVectorTuKhoa` |
