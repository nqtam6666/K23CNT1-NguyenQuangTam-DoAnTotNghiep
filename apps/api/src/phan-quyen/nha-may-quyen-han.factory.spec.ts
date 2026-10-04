import { NhaMayQuyenHan } from './nha-may-quyen-han.factory';
import { HanhDong, DoiTuong, VaiTro, PayloadJwt } from '@lms/chung';

describe('NhaMayQuyenHan (CASL Factory Unit Test)', () => {
  let nhaMayQuyenHan: NhaMayQuyenHan;

  beforeEach(() => {
    nhaMayQuyenHan = new NhaMayQuyenHan();
  });

  it('QUAN_TRI_VIEN phải có toàn quyền quản lý mọi đối tượng', () => {
    const admin: PayloadJwt = {
      sub: 'admin-id',
      id: 'admin-id',
      email: 'admin@school.edu.vn',
      hoTen: 'Quản Trị Viên',
      vaiTro: VaiTro.QUAN_TRI_VIEN,
    };

    const khaNang = nhaMayQuyenHan.taoQuyenChoNguoiDung(admin);

    expect(khaNang.can(HanhDong.QuanLy, DoiTuong.TatCa)).toBe(true);
    expect(khaNang.can(HanhDong.Xoa, DoiTuong.NguoiDung)).toBe(true);
    expect(khaNang.can(HanhDong.ChamDiem, DoiTuong.BaiNop)).toBe(true);
  });

  it('HOC_SINH không được phép tạo bài tập hoặc chấm điểm', () => {
    const hocSinh: PayloadJwt = {
      sub: 'student-id',
      id: 'student-id',
      email: 'student@school.edu.vn',
      hoTen: 'Nguyễn Văn Học Sinh',
      vaiTro: VaiTro.HOC_SINH,
    };

    const khaNang = nhaMayQuyenHan.taoQuyenChoNguoiDung(hocSinh);

    expect(khaNang.can(HanhDong.Tao, DoiTuong.BaiTap)).toBe(false);
    expect(khaNang.can(HanhDong.ChamDiem, DoiTuong.BaiNop)).toBe(false);
    expect(khaNang.can(HanhDong.Doc, DoiTuong.LopHocPhan)).toBe(true);
    expect(khaNang.can(HanhDong.Tao, DoiTuong.BaiNop)).toBe(true);
  });

  it('GIAO_VIEN phải có quyền tạo bài tập và chấm điểm bài nộp', () => {
    const giaoVien: PayloadJwt = {
      sub: 'teacher-id',
      id: 'teacher-id',
      email: 'teacher@school.edu.vn',
      hoTen: 'Trần Thị Giáo Viên',
      vaiTro: VaiTro.GIAO_VIEN,
    };

    const khaNang = nhaMayQuyenHan.taoQuyenChoNguoiDung(giaoVien);

    expect(khaNang.can(HanhDong.Tao, DoiTuong.BaiTap)).toBe(true);
    expect(khaNang.can(HanhDong.ChamDiem, DoiTuong.BaiNop)).toBe(true);
    expect(khaNang.can(HanhDong.DiemDanh, DoiTuong.BanGhiDiemDanh)).toBe(true);
  });
});
