import { Test, TestingModule } from '@nestjs/testing';
import { DichVuBaoLoiDongGopService } from './dich-vu-bao-loi-dong-gop.service';
import { KhoBaoLoiDongGopRepository } from './kho-bao-loi-dong-gop.repository';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import {
  VaiTro,
  LoaiBaoLoiDongGop,
  MucDoUuTienBaoLoi,
  TrangThaiBaoLoi,
  PayloadJwt,
} from '@lms/chung';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('DichVuBaoLoiDongGopService', () => {
  let service: DichVuBaoLoiDongGopService;
  let mockKho: any;
  let mockPrisma: any;

  const mockAdmin: PayloadJwt = {
    sub: 'admin-uuid',
    id: 'admin-uuid',
    email: 'admin@lms.edu.vn',
    hoTen: 'Quản Trị Viên',
    vaiTro: VaiTro.QUAN_TRI_VIEN,
  };

  const mockHocSinh: PayloadJwt = {
    sub: 'hocsinh-uuid',
    id: 'hocsinh-uuid',
    email: 'hocsinh1@lms.edu.vn',
    hoTen: 'Lê Hoàng Học Sinh',
    vaiTro: VaiTro.HOC_SINH,
  };

  const mockNguoiDungKhac: PayloadJwt = {
    sub: 'khac-uuid',
    id: 'khac-uuid',
    email: 'khac@lms.edu.vn',
    hoTen: 'Người Dùng Khác',
    vaiTro: VaiTro.HOC_SINH,
  };

  const mockBanGhi = {
    id: 'baoloi-uuid',
    idNguoiDung: 'hocsinh-uuid',
    tieuDe: 'Lỗi không bật được camera khi vào phòng học',
    noiDung: 'Khi bấm nút bật camera trên trình duyệt Chrome, hệ thống báo thiết bị bận.',
    loaiPhanHoi: LoaiBaoLoiDongGop.BAO_LOI,
    mucDoUuTien: MucDoUuTienBaoLoi.CAO,
    trangThai: TrangThaiBaoLoi.CHO_TIEP_NHAN,
    ngayTao: new Date(),
    ngayCapNhat: new Date(),
  };

  beforeEach(async () => {
    mockKho = {
      tao: jest.fn().mockResolvedValue(mockBanGhi),
      timTheoId: jest.fn().mockImplementation((id: string) => {
        if (id === 'baoloi-uuid') return Promise.resolve(mockBanGhi);
        return Promise.resolve(null);
      }),
      layDanhSach: jest.fn().mockResolvedValue([mockBanGhi]),
      dem: jest.fn().mockResolvedValue(1),
      layThongKe: jest.fn().mockResolvedValue({
        tongSo: 1,
        choTiepNhan: 1,
        dangXuLy: 0,
        daXuLy: 0,
        tuChoi: 0,
      }),
      capNhatXuLy: jest.fn().mockResolvedValue({
        ...mockBanGhi,
        trangThai: TrangThaiBaoLoi.DA_XU_LY,
        phanHoiXuLy: 'Đã cập nhật cấu hình WebRTC',
      }),
      xoa: jest.fn().mockResolvedValue(mockBanGhi),
    };

    mockPrisma = {
      nhatKyHeThong: {
        create: jest.fn().mockResolvedValue({ id: 'log-uuid' }),
      },
      thongBao: {
        create: jest.fn().mockResolvedValue({ id: 'thongbao-uuid' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DichVuBaoLoiDongGopService,
        { provide: KhoBaoLoiDongGopRepository, useValue: mockKho },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DichVuBaoLoiDongGopService>(DichVuBaoLoiDongGopService);
  });

  it('nên được khởi tạo thành công', () => {
    expect(service).toBeDefined();
  });

  describe('taoBaoLoi', () => {
    it('học sinh gửi báo lỗi thành công và ghi nhật ký hệ thống', async () => {
      const ketQua = await service.taoBaoLoi(
        {
          tieuDe: 'Lỗi không bật được camera khi vào phòng học',
          noiDung: 'Khi bấm nút bật camera trên trình duyệt Chrome, hệ thống báo thiết bị bận.',
          loaiPhanHoi: LoaiBaoLoiDongGop.BAO_LOI,
          mucDoUuTien: MucDoUuTienBaoLoi.CAO,
        },
        mockHocSinh,
      );

      expect(ketQua).toEqual(mockBanGhi);
      expect(mockKho.tao).toHaveBeenCalledWith('hocsinh-uuid', expect.any(Object));
      expect(mockPrisma.nhatKyHeThong.create).toHaveBeenCalled();
    });
  });

  describe('layDanhSach & Anti-IDOR', () => {
    it('Quản trị viên có thể xem danh sách toàn bộ báo lỗi', async () => {
      const boLoc = { trang: 1, kichThuoc: 10 };
      const ketQua = await service.layDanhSach(boLoc, mockAdmin);

      expect(ketQua.danhSach).toHaveLength(1);
      expect(mockKho.layDanhSach).toHaveBeenCalledWith(boLoc, undefined);
    });

    it('Học sinh chỉ được xem danh sách của chính mình (chống IDOR)', async () => {
      const boLoc = { trang: 1, kichThuoc: 10 };
      await service.layDanhSach(boLoc, mockHocSinh);

      expect(mockKho.layDanhSach).toHaveBeenCalledWith(boLoc, 'hocsinh-uuid');
    });
  });

  describe('layChiTiet & Anti-IDOR', () => {
    it('Người tạo báo lỗi xem được chi tiết bản ghi của mình', async () => {
      const ketQua = await service.layChiTiet('baoloi-uuid', mockHocSinh);
      expect(ketQua.id).toBe('baoloi-uuid');
    });

    it('Quản trị viên có thể xem chi tiết bất kỳ bản ghi nào', async () => {
      const ketQua = await service.layChiTiet('baoloi-uuid', mockAdmin);
      expect(ketQua.id).toBe('baoloi-uuid');
    });

    it('Người dùng khác xem bản ghi sẽ bị chặn 403 Forbidden (chống IDOR)', async () => {
      await expect(service.layChiTiet('baoloi-uuid', mockNguoiDungKhac)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('Ném lỗi 404 NotFound nếu bản ghi không tồn tại', async () => {
      await expect(service.layChiTiet('khong-ton-tai', mockAdmin)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('xuLyBaoLoi', () => {
    it('Quản trị viên xử lý báo lỗi thành công và gửi thông báo cho tác giả', async () => {
      const ketQua = await service.xuLyBaoLoi(
        'baoloi-uuid',
        {
          trangThai: TrangThaiBaoLoi.DA_XU_LY,
          phanHoiXuLy: 'Đã cập nhật cấu hình WebRTC',
        },
        mockAdmin,
      );

      expect(ketQua.trangThai).toBe(TrangThaiBaoLoi.DA_XU_LY);
      expect(mockPrisma.thongBao.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            idNguoiDung: 'hocsinh-uuid',
          }),
        }),
      );
    });

    it('Học sinh không có quyền xử lý báo lỗi (403 Forbidden)', async () => {
      await expect(
        service.xuLyBaoLoi(
          'baoloi-uuid',
          {
            trangThai: TrangThaiBaoLoi.DA_XU_LY,
            phanHoiXuLy: 'Tự xử lý',
          },
          mockHocSinh,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('xoa & Anti-IDOR', () => {
    it('Người tạo báo lỗi có thể xóa bản ghi của mình', async () => {
      const ketQua = await service.xoa('baoloi-uuid', mockHocSinh);
      expect(ketQua.thanhCong).toBe(true);
      expect(mockKho.xoa).toHaveBeenCalledWith('baoloi-uuid');
    });

    it('Quản trị viên có thể xóa bất kỳ bản ghi nào', async () => {
      const ketQua = await service.xoa('baoloi-uuid', mockAdmin);
      expect(ketQua.thanhCong).toBe(true);
    });

    it('Người dùng khác không thể xóa bản ghi (403 Forbidden)', async () => {
      await expect(service.xoa('baoloi-uuid', mockNguoiDungKhac)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
