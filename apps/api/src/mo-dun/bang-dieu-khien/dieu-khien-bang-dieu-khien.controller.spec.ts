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
});
