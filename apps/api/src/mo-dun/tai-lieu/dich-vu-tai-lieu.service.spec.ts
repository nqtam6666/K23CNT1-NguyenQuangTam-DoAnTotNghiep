import { Test, TestingModule } from '@nestjs/testing';
import { DichVuTaiLieuService } from './dich-vu-tai-lieu.service';
import { KhoTaiLieuRepository } from './kho-tai-lieu.repository';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { VaiTro, PayloadJwt, LoaiTaiLieu } from '@lms/chung';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

describe('DichVuTaiLieuService', () => {
  let service: DichVuTaiLieuService;
  let mockKho: any;
  let mockPrisma: any;

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
      taoTaiLieu: jest.fn(),
      xoaTaiLieu: jest.fn(),
    };

    mockPrisma = {
      lopHocPhan: { findUnique: jest.fn() },
      hoSoGiaoVien: { findUnique: jest.fn() },
      hoSoHocSinh: { findUnique: jest.fn() },
      ghiDanh: { findFirst: jest.fn() },
      phuHuynhHocSinh: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DichVuTaiLieuService,
        { provide: KhoTaiLieuRepository, useValue: mockKho },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DichVuTaiLieuService>(DichVuTaiLieuService);
  });

  it('nên được khởi tạo thành công', () => {
    expect(service).toBeDefined();
  });

  describe('taiLenTaiLieu', () => {
    it('chặn học sinh tải tài liệu môn học', async () => {
      mockPrisma.lopHocPhan.findUnique.mockResolvedValue({ id: 'lop-1', idGiaoVien: 'gv-1' });
      mockPrisma.hoSoHocSinh.findUnique.mockResolvedValue({ id: 'hs-1' });
      mockPrisma.ghiDanh.findFirst.mockResolvedValue({ id: 'gd-1' });

      await expect(
        service.taiLenTaiLieu(
          'lop-1',
          { tieuDe: 'Slide bài giảng', loaiTaiLieu: LoaiTaiLieu.SLIDE },
          undefined,
          mockHocSinh,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('chặn tệp có định dạng thực thi nguy hiểm (.exe)', async () => {
      mockPrisma.lopHocPhan.findUnique.mockResolvedValue({ id: 'lop-1', idGiaoVien: 'gv-1' });
      mockPrisma.hoSoGiaoVien.findUnique.mockResolvedValue({ id: 'gv-1' });

      const mockTep: any = {
        originalname: 'virus.exe',
        buffer: Buffer.from('test'),
        size: 100,
      };

      await expect(
        service.taiLenTaiLieu(
          'lop-1',
          { tieuDe: 'Slide bài giảng', loaiTaiLieu: LoaiTaiLieu.SLIDE },
          mockTep,
          mockGiaoVien,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
