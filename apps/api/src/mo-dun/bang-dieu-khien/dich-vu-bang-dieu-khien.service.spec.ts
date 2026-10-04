import { Test, TestingModule } from '@nestjs/testing';
import { DichVuBangDieuKhien } from './dich-vu-bang-dieu-khien.service';
import { SoDangKyTienIch } from './so-dang-ky-tien-ich.registry';
import { DichVuBoNhoDem } from './dich-vu-bo-nho-dem.service';
import { TienIchTongQuanProvider } from './cung-cap-tien-ich/tien-ich-tong-quan.provider';
import { TienIchGiaoVuProvider } from './cung-cap-tien-ich/tien-ich-giao-vu.provider';
import { TienIchGiaoVienProvider } from './cung-cap-tien-ich/tien-ich-giao-vien.provider';
import { TienIchHocSinhProvider } from './cung-cap-tien-ich/tien-ich-hoc-sinh.provider';
import { TienIchPhuHuynhProvider } from './cung-cap-tien-ich/tien-ich-phu-huynh.provider';
import { TienIchNhatKyProvider } from './cung-cap-tien-ich/tien-ich-nhat-ky.provider';
import { VaiTro, PayloadJwt, TienIchBangDieuKhien } from '@lms/chung';

describe('DichVuBangDieuKhien (Dashboard Service)', () => {
  let dichVu: DichVuBangDieuKhien;
  let soDangKy: SoDangKyTienIch;
  let boNhoDem: DichVuBoNhoDem;

  const mockBoNhoDem = {
    lay: jest.fn(),
    luu: jest.fn(),
    xoa: jest.fn(),
  };

  const mockProviderTongQuan = {
    id: 'tong-quan-he-thong',
    vaiTroPhuHop: (vaiTro: VaiTro) =>
      vaiTro === VaiTro.QUAN_TRI_VIEN || vaiTro === VaiTro.BAN_GIAM_HIEU,
    cungCapTienIch: jest.fn().mockResolvedValue([
      {
        id: 'the-tong-nguoi-dung',
        loai: 'THE_THONG_KE',
        tieuDe: 'Tổng người dùng',
        trangThai: 'THANH_CONG',
        duLieu: { giaTri: 100 },
      },
    ] as TienIchBangDieuKhien[]),
  };

  const mockProviderGiaoVien = {
    id: 'giang-day-giao-vien',
    vaiTroPhuHop: (vaiTro: VaiTro) => vaiTro === VaiTro.GIAO_VIEN,
    cungCapTienIch: jest.fn().mockResolvedValue([
      {
        id: 'the-buoi-day-hom-nay',
        loai: 'THE_THONG_KE',
        tieuDe: 'Buổi dạy hôm nay',
        trangThai: 'THANH_CONG',
        duLieu: { giaTri: 3 },
      },
    ] as TienIchBangDieuKhien[]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DichVuBangDieuKhien,
        SoDangKyTienIch,
        { provide: DichVuBoNhoDem, useValue: mockBoNhoDem },
        { provide: TienIchTongQuanProvider, useValue: mockProviderTongQuan },
        {
          provide: TienIchGiaoVuProvider,
          useValue: {
            id: 'hoc-vu-giao-vu',
            vaiTroPhuHop: (v: VaiTro) => v === VaiTro.GIAO_VU,
            cungCapTienIch: jest.fn().mockResolvedValue([]),
          },
        },
        { provide: TienIchGiaoVienProvider, useValue: mockProviderGiaoVien },
        {
          provide: TienIchHocSinhProvider,
          useValue: {
            id: 'hoc-tap-hoc-sinh',
            vaiTroPhuHop: (v: VaiTro) => v === VaiTro.HOC_SINH,
            cungCapTienIch: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: TienIchPhuHuynhProvider,
          useValue: {
            id: 'theo-doi-phu-huynh',
            vaiTroPhuHop: (v: VaiTro) => v === VaiTro.PHU_HUYNH,
            cungCapTienIch: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: TienIchNhatKyProvider,
          useValue: {
            id: 'nhat-ky-he-thong',
            vaiTroPhuHop: (v: VaiTro) =>
              v === VaiTro.QUAN_TRI_VIEN || v === VaiTro.BAN_GIAM_HIEU,
            cungCapTienIch: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    dichVu = module.get<DichVuBangDieuKhien>(DichVuBangDieuKhien);
    soDangKy = module.get<SoDangKyTienIch>(SoDangKyTienIch);
    boNhoDem = module.get<DichVuBoNhoDem>(DichVuBoNhoDem);

    dichVu.onModuleInit();
    jest.clearAllMocks();
  });

  it('1. Phải trả về dữ liệu cache nếu có (Cache Hit)', async () => {
    const nguoiDung: PayloadJwt = {
      sub: 'user-admin-1',
      id: 'user-admin-1',
      email: 'admin@lms.edu.vn',
      vaiTro: VaiTro.QUAN_TRI_VIEN,
      hoTen: 'Quản trị viên',
    };

    const duLieuSan = {
      tienIch: [
        {
          id: 'the-tong-nguoi-dung',
          loai: 'THE_THONG_KE' as const,
          tieuDe: 'Tổng người dùng',
          trangThai: 'THANH_CONG' as const,
          duLieu: { giaTri: 50 },
        },
      ],
      thoiGianTao: '2026-10-04T00:00:00.000Z',
    };

    mockBoNhoDem.lay.mockResolvedValueOnce(duLieuSan);

    const ketQua = await dichVu.layDuLieuBangDieuKhien(nguoiDung);

    expect(ketQua).toEqual(duLieuSan);
    expect(mockBoNhoDem.lay).toHaveBeenCalledWith(
      `bang-dieu-khien:${VaiTro.QUAN_TRI_VIEN}:user-admin-1`,
    );
    expect(mockProviderTongQuan.cungCapTienIch).not.toHaveBeenCalled();
  });

  it('2. Phải gọi provider tương ứng và lưu cache 60s khi cache miss', async () => {
    const nguoiDung: PayloadJwt = {
      sub: 'user-admin-1',
      id: 'user-admin-1',
      email: 'admin@lms.edu.vn',
      vaiTro: VaiTro.QUAN_TRI_VIEN,
      hoTen: 'Quản trị viên',
    };

    mockBoNhoDem.lay.mockResolvedValueOnce(null);

    const ketQua = await dichVu.layDuLieuBangDieuKhien(nguoiDung);

    expect(ketQua.tienIch.length).toBeGreaterThan(0);
    expect(ketQua.tienIch[0].id).toBe('the-tong-nguoi-dung');
    expect(mockBoNhoDem.luu).toHaveBeenCalledWith(
      `bang-dieu-khien:${VaiTro.QUAN_TRI_VIEN}:user-admin-1`,
      expect.objectContaining({
        tienIch: expect.any(Array),
      }),
      60,
    );
  });

  it('3. Cách ly lỗi: Lỗi từ một provider không làm sập toàn trang', async () => {
    const nguoiDung: PayloadJwt = {
      sub: 'user-admin-1',
      id: 'user-admin-1',
      email: 'admin@lms.edu.vn',
      vaiTro: VaiTro.QUAN_TRI_VIEN,
      hoTen: 'Quản trị viên',
    };

    mockBoNhoDem.lay.mockResolvedValueOnce(null);
    mockProviderTongQuan.cungCapTienIch.mockRejectedValueOnce(
      new Error('Mất kết nối cơ sở dữ liệu tạm thời'),
    );

    const ketQua = await dichVu.layDuLieuBangDieuKhien(nguoiDung);

    expect(ketQua.tienIch.length).toBeGreaterThan(0);
    const tienIchLoi = ketQua.tienIch.find((t) => t.trangThai === 'LOI');
    expect(tienIchLoi).toBeDefined();
    expect(tienIchLoi?.thongDiepLoi).toContain('Không thể tải dữ liệu');
  });

  it('4. Phân quyền vai trò: Giáo viên không nhận tiện ích quản trị tổng quan', async () => {
    const nguoiDungGiaoVien: PayloadJwt = {
      sub: 'user-gv-1',
      id: 'user-gv-1',
      email: 'giaovien@lms.edu.vn',
      vaiTro: VaiTro.GIAO_VIEN,
      hoTen: 'Trần Văn Giáo Viên',
    };

    mockBoNhoDem.lay.mockResolvedValueOnce(null);

    const ketQua = await dichVu.layDuLieuBangDieuKhien(nguoiDungGiaoVien);

    expect(mockProviderTongQuan.cungCapTienIch).not.toHaveBeenCalled();
    expect(mockProviderGiaoVien.cungCapTienIch).toHaveBeenCalled();
    expect(ketQua.tienIch.some((t) => t.id === 'the-buoi-day-hom-nay')).toBe(true);
    expect(ketQua.tienIch.some((t) => t.id === 'the-tong-nguoi-dung')).toBe(false);
  });
});
