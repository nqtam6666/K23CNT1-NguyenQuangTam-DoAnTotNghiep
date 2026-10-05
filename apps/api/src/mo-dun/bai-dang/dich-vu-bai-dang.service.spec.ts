import { Test, TestingModule } from '@nestjs/testing';
import { DichVuBaiDangService } from './dich-vu-bai-dang.service';
import { KhoBaiDangRepository } from './kho-bai-dang.repository';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { VaiTro, PayloadJwt } from '@lms/chung';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('DichVuBaiDangService', () => {
  let service: DichVuBaiDangService;
  let mockKho: any;
  let mockPrisma: any;

  const mockAdmin: PayloadJwt = {
    sub: 'user-admin',
    id: 'user-admin',
    hoTen: 'Quản trị viên',
    email: 'admin@lms.vn',
    vaiTro: VaiTro.QUAN_TRI_VIEN,
  };

  const mockGiaoVien: PayloadJwt = {
    sub: 'user-gv',
    id: 'user-gv',
    hoTen: 'Nguyễn Văn Giáo Viên',
    email: 'gv@lms.vn',
    vaiTro: VaiTro.GIAO_VIEN,
  };

  const mockHocSinh: PayloadJwt = {
    sub: 'user-hs',
    id: 'user-hs',
    hoTen: 'Trần Thị Học Sinh',
    email: 'hs@lms.vn',
    vaiTro: VaiTro.HOC_SINH,
  };

  beforeEach(async () => {
    mockKho = {
      layDanhSachTheoLop: jest.fn(),
      timTheoId: jest.fn(),
      taoBaiDang: jest.fn(),
      xoaBaiDang: jest.fn(),
      taoBinhLuan: jest.fn(),
      timBinhLuanTheoId: jest.fn(),
      xoaBinhLuan: jest.fn(),
    };

    mockPrisma = {
      lopHocPhan: {
        findUnique: jest.fn(),
      },
      hoSoGiaoVien: {
        findUnique: jest.fn(),
      },
      hoSoHocSinh: {
        findUnique: jest.fn(),
      },
      ghiDanh: {
        findFirst: jest.fn(),
      },
      phuHuynhHocSinh: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DichVuBaiDangService,
        { provide: KhoBaiDangRepository, useValue: mockKho },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DichVuBaiDangService>(DichVuBaiDangService);
  });

  it('nên được khởi tạo thành công', () => {
    expect(service).toBeDefined();
  });

  describe('layDanhSachBaiDang', () => {
    it('cho phép quản trị viên lấy danh sách bài đăng của lớp', async () => {
      mockPrisma.lopHocPhan.findUnique.mockResolvedValue({ id: 'lop-1', idGiaoVien: 'gv-1' });
      mockKho.layDanhSachTheoLop.mockResolvedValue([{ id: 'bd-1', noiDung: 'Chào cả lớp' }]);

      const ketQua = await service.layDanhSachBaiDang('lop-1', mockAdmin);
      expect(ketQua).toHaveLength(1);
      expect(mockKho.layDanhSachTheoLop).toHaveBeenCalledWith('lop-1');
    });

    it('ném lỗi Forbidden nếu học sinh chưa ghi danh vào lớp', async () => {
      mockPrisma.lopHocPhan.findUnique.mockResolvedValue({ id: 'lop-1', idGiaoVien: 'gv-1' });
      mockPrisma.hoSoHocSinh.findUnique.mockResolvedValue({ id: 'hs-profile-1' });
      mockPrisma.ghiDanh.findFirst.mockResolvedValue(null);

      await expect(service.layDanhSachBaiDang('lop-1', mockHocSinh)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('taoBaiDang', () => {
    it('cho phép giáo viên tạo bài đăng và ghim đầu trang', async () => {
      mockPrisma.lopHocPhan.findUnique.mockResolvedValue({ id: 'lop-1', idGiaoVien: 'gv-1' });
      mockPrisma.hoSoGiaoVien.findUnique.mockResolvedValue({ id: 'gv-1' });
      mockKho.taoBaiDang.mockResolvedValue({ id: 'bd-1', noiDung: 'Bài mới', ghimDauTrang: true });

      const ketQua = await service.taoBaiDang(
        'lop-1',
        { noiDung: 'Bài mới', ghimDauTrang: true },
        mockGiaoVien,
      );

      expect(ketQua.ghimDauTrang).toBe(true);
      expect(mockKho.taoBaiDang).toHaveBeenCalledWith(
        expect.objectContaining({
          idLopHocPhan: 'lop-1',
          idNguoiDung: 'user-gv',
          ghimDauTrang: true,
        }),
      );
    });

    it('không cho phép học sinh ghim bài đầu trang dù có truyền ghimDauTrang: true', async () => {
      mockPrisma.lopHocPhan.findUnique.mockResolvedValue({ id: 'lop-1', idGiaoVien: 'gv-1' });
      mockPrisma.hoSoHocSinh.findUnique.mockResolvedValue({ id: 'hs-profile-1' });
      mockPrisma.ghiDanh.findFirst.mockResolvedValue({ id: 'gd-1' });
      mockKho.taoBaiDang.mockResolvedValue({ id: 'bd-2', noiDung: 'Thắc mắc', ghimDauTrang: false });

      await service.taoBaiDang(
        'lop-1',
        { noiDung: 'Thắc mắc', ghimDauTrang: true },
        mockHocSinh,
      );

      expect(mockKho.taoBaiDang).toHaveBeenCalledWith(
        expect.objectContaining({
          ghimDauTrang: false,
        }),
      );
    });
  });

  describe('xoaBaiDang', () => {
    it('cho phép người đăng tự xóa bài của mình', async () => {
      mockKho.timTheoId.mockResolvedValue({
        id: 'bd-1',
        idNguoiDung: 'user-hs',
        lopHocPhan: { id: 'lop-1', idGiaoVien: 'gv-1' },
      });
      mockKho.xoaBaiDang.mockResolvedValue({ id: 'bd-1' });

      const ketQua = await service.xoaBaiDang('bd-1', mockHocSinh);
      expect(ketQua.thanhCong).toBe(true);
    });

    it('chặn học sinh khác xóa bài đăng không phải của mình', async () => {
      mockKho.timTheoId.mockResolvedValue({
        id: 'bd-1',
        idNguoiDung: 'user-hs-khac',
        lopHocPhan: { id: 'lop-1', idGiaoVien: 'gv-1' },
      });

      await expect(service.xoaBaiDang('bd-1', mockHocSinh)).rejects.toThrow(ForbiddenException);
    });
  });
});
