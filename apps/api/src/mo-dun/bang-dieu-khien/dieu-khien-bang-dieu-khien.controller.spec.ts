import { Test, TestingModule } from '@nestjs/testing';
import { DieuKhienBangDieuKhien } from './dieu-khien-bang-dieu-khien.controller';
import { DichVuBangDieuKhien } from './dich-vu-bang-dieu-khien.service';
import { VaiTro, PayloadJwt } from '@lms/chung';

describe('DieuKhienBangDieuKhien (Controller)', () => {
  let controller: DieuKhienBangDieuKhien;
  let dichVu: DichVuBangDieuKhien;

  const mockDichVu = {
    layDuLieuBangDieuKhien: jest.fn().mockImplementation((nguoiDung: PayloadJwt) => {
      if (nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN) {
        return Promise.resolve({
          tienIch: [
            { id: 'the-tong-nguoi-dung', loai: 'THE_THONG_KE', tieuDe: 'Tổng người dùng' },
            { id: 'hoat-dong-gan-day', loai: 'HOAT_DONG_GAN_DAY', tieuDe: 'Hoạt động gần đây' },
          ],
          thoiGianTao: '2026-10-04T00:00:00.000Z',
        });
      }
      if (nguoiDung.vaiTro === VaiTro.GIAO_VIEN) {
        return Promise.resolve({
          tienIch: [
            { id: 'the-buoi-day-hom-nay', loai: 'THE_THONG_KE', tieuDe: 'Buổi dạy hôm nay' },
            { id: 'the-bai-nop-cho-cham', loai: 'THE_THONG_KE', tieuDe: 'Bài nộp chờ chấm' },
          ],
          thoiGianTao: '2026-10-04T00:00:00.000Z',
        });
      }
      return Promise.resolve({
        tienIch: [],
        thoiGianTao: '2026-10-04T00:00:00.000Z',
      });
    }),
    layDanhSachThongBaoThucTe: jest.fn().mockImplementation((nguoiDung: PayloadJwt) =>
      Promise.resolve({
        hocKyHienTai: {
          tenHocKy: 'Học kỳ 1 (2025-2026)',
          tenNamHoc: '2025-2026',
          ngayBatDau: '2025-09-05T00:00:00.000Z',
          ngayKetThuc: '2026-01-15T00:00:00.000Z',
          soLopThamGia: 2,
          soBuoiHocHomNay: 1,
          soViecCanXuLy: 1,
        },
        banTinToanTruong: {
          tieuDe: 'Vận hành Học kỳ 1 (2025-2026)',
          noiDung: `Thông báo thực tế cho ${nguoiDung.hoTen}`,
          loai: 'info' as const,
          thoiGianCapNhat: '2026-10-14T12:00:00.000Z',
        },
        danhSachThongBao: [
          {
            id: '00000000-0000-4000-a000-000000000001',
            loai: 'warning' as const,
            phanLoai: 'CAN_XU_LY' as const,
            eyebrow: 'BÀI TẬP CẦN NỘP · LHP-TOAN10-01',
            tieuDe: 'Bài tập tuần 4: Bất phương trình bậc nhất và bậc hai',
            noiDung: 'Lớp Toán học 10 - Nhóm 01',
            thoiGian: '2026-10-14T10:00:00.000Z',
            daDoc: false,
            duongDan: '/lop-hoc-phan/lhp-1',
          },
        ],
        tongSoChuaDoc: 1,
        thoiGianDongBo: '2026-10-14T12:00:00.000Z',
      }),
    ),
    danhDauDaDocThongBao: jest.fn().mockResolvedValue({ thanhCong: true }),
    danhDauDocTatCaThongBao: jest
      .fn()
      .mockResolvedValue({ thanhCong: true, soLuongCapNhat: 3 }),
    guiThuThongBaoDaKenh: jest.fn().mockImplementation((nguoiDung: PayloadJwt) =>
      Promise.resolve({
        thanhCong: true,
        thongDiep: `Đã phát thông báo tới Nền tảng, Windows và gửi thư Gmail tới ${nguoiDung.email}.`,
        chiTietKenh: {
          nenTang: { daGhiNhan: true, thongDiep: 'Đã lưu vào Hộp thông báo Nền tảng' },
          windows: { kichHoat: true, thongDiep: 'Đã phát tín hiệu thông báo màn hình Windows OS' },
          gmail: { daGui: true, emailDich: nguoiDung.email, thongDiep: 'Đã gửi Gmail' },
        },
        thongBaoMoi: {
          id: '00000000-0000-4000-a000-000000000099',
          loai: 'success' as const,
          phanLoai: 'HE_THONG' as const,
          eyebrow: 'ĐỒNG BỘ ĐA KÊNH · NỀN TẢNG · WINDOWS · GMAIL',
          tieuDe: 'Kiểm tra thông báo đa kênh (Nền tảng · Windows · Gmail)',
          noiDung: 'Nội dung kiểm tra đa kênh',
          thoiGian: '2026-10-15T00:00:00.000Z',
          daDoc: false,
          duongDan: '/ho-so',
        },
      }),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DieuKhienBangDieuKhien],
      providers: [{ provide: DichVuBangDieuKhien, useValue: mockDichVu }],
    }).compile();

    controller = module.get<DieuKhienBangDieuKhien>(DieuKhienBangDieuKhien);
    dichVu = module.get<DichVuBangDieuKhien>(DichVuBangDieuKhien);
  });

  it('1. Quản trị viên chỉ nhận tiện ích quản trị và nhật ký hệ thống', async () => {
    const nguoiDungAdmin: PayloadJwt = {
      sub: 'admin-id',
      id: 'admin-id',
      email: 'admin@lms.edu.vn',
      vaiTro: VaiTro.QUAN_TRI_VIEN,
      hoTen: 'Quản trị viên',
    };

    const res = await controller.layDuLieuBangDieuKhien(nguoiDungAdmin);

    expect(res.tienIch.some((t) => t.id === 'the-tong-nguoi-dung')).toBe(true);
    expect(res.tienIch.some((t) => t.id === 'the-buoi-day-hom-nay')).toBe(false);
  });

  it('2. Giáo viên chỉ nhận tiện ích giảng dạy, không có tiện ích quản trị', async () => {
    const nguoiDungGiaoVien: PayloadJwt = {
      sub: 'gv-id',
      id: 'gv-id',
      email: 'giaovien@lms.edu.vn',
      vaiTro: VaiTro.GIAO_VIEN,
      hoTen: 'Giáo viên 1',
    };

    const res = await controller.layDuLieuBangDieuKhien(nguoiDungGiaoVien);

    expect(res.tienIch.some((t) => t.id === 'the-buoi-day-hom-nay')).toBe(true);
    expect(res.tienIch.some((t) => t.id === 'the-tong-nguoi-dung')).toBe(false);
  });

  it('3. Lấy danh sách thông báo thực tế theo người dùng hiện tại', async () => {
    const nguoiDungHocSinh: PayloadJwt = {
      sub: 'hs-id',
      id: 'hs-id',
      email: 'hocsinh1@lms.edu.vn',
      vaiTro: VaiTro.HOC_SINH,
      hoTen: 'Lê Hoàng Học Sinh',
    };

    const res = await controller.layDanhSachThongBaoThucTe(nguoiDungHocSinh);

    expect(res.hocKyHienTai?.tenHocKy).toBe('Học kỳ 1 (2025-2026)');
    expect(res.tongSoChuaDoc).toBe(1);
    expect(res.danhSachThongBao.length).toBe(1);
    expect(dichVu.layDanhSachThongBaoThucTe).toHaveBeenCalledWith(nguoiDungHocSinh);
  });

  it('4. Đánh dấu đã đọc 1 thông báo và đọc tất cả thông báo của chính người dùng', async () => {
    const nguoiDungHocSinh: PayloadJwt = {
      sub: 'hs-id',
      id: 'hs-id',
      email: 'hocsinh1@lms.edu.vn',
      vaiTro: VaiTro.HOC_SINH,
      hoTen: 'Lê Hoàng Học Sinh',
    };
    const idTb = '00000000-0000-4000-a000-000000000001';

    const kqDon = await controller.danhDauDaDocThongBao(idTb, nguoiDungHocSinh);
    expect(kqDon.thanhCong).toBe(true);
    expect(dichVu.danhDauDaDocThongBao).toHaveBeenCalledWith(idTb, nguoiDungHocSinh);

    const kqTatCa = await controller.danhDauDocTatCaThongBao(nguoiDungHocSinh);
    expect(kqTatCa.thanhCong).toBe(true);
    expect(kqTatCa.soLuongCapNhat).toBe(3);
    expect(dichVu.danhDauDocTatCaThongBao).toHaveBeenCalledWith(nguoiDungHocSinh);
  });

  it('5. Phát thông báo thử nghiệm đa kênh (Nền tảng, Windows, Gmail) cho người dùng', async () => {
    const nguoiDungHocSinh: PayloadJwt = {
      sub: 'hs-id',
      id: 'hs-id',
      email: 'hocsinh1@lms.edu.vn',
      vaiTro: VaiTro.HOC_SINH,
      hoTen: 'Lê Hoàng Học Sinh',
    };

    const kq = await controller.guiThuThongBaoDaKenh(nguoiDungHocSinh);
    expect(kq.thanhCong).toBe(true);
    expect(kq.chiTietKenh.nenTang.daGhiNhan).toBe(true);
    expect(kq.chiTietKenh.windows.kichHoat).toBe(true);
    expect(kq.chiTietKenh.gmail.emailDich).toBe('hocsinh1@lms.edu.vn');
    expect(dichVu.guiThuThongBaoDaKenh).toHaveBeenCalledWith(nguoiDungHocSinh);
  });
});

