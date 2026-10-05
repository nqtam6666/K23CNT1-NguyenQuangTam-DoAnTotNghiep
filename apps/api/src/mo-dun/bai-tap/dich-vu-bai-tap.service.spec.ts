import { Test, TestingModule } from '@nestjs/testing';
import { DichVuBaiTapService } from './dich-vu-bai-tap.service';
import { KhoBaiTapRepository } from './kho-bai-tap.repository';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import {
  VaiTro,
  PayloadJwt,
  TrangThaiBaiNop,
  HinhThucNop,
} from '@lms/chung';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

describe('DichVuBaiTapService', () => {
  let service: DichVuBaiTapService;
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
      taoBaiTap: jest.fn(),
      xoaBaiTap: jest.fn(),
      timBaiNopCuaHocSinh: jest.fn(),
      luuBaiNop: jest.fn(),
      layDanhSachBaiNopTheoBaiTap: jest.fn(),
      timBaiNopTheoId: jest.fn(),
      chamDiemBaiNop: jest.fn(),
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
        DichVuBaiTapService,
        { provide: KhoBaiTapRepository, useValue: mockKho },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DichVuBaiTapService>(DichVuBaiTapService);
  });

  it('nên được khởi tạo thành công', () => {
    expect(service).toBeDefined();
  });

  describe('taoBaiTap', () => {
    it('cho phép giáo viên giao bài tập mới', async () => {
      mockPrisma.lopHocPhan.findUnique.mockResolvedValue({ id: 'lop-1', idGiaoVien: 'gv-1' });
      mockPrisma.hoSoGiaoVien.findUnique.mockResolvedValue({ id: 'gv-1' });
      mockKho.taoBaiTap.mockResolvedValue({ id: 'bt-1', tieuDe: 'Bài 1' });

      const ketQua = await service.taoBaiTap(
        'lop-1',
        {
          tieuDe: 'Bài tập 1',
          noiDung: 'Làm bài 1',
          hanNop: new Date(Date.now() + 86400000).toISOString(),
          diemToiDa: 10,
          hinhThucNop: HinhThucNop.TEP_TIN,
        },
        mockGiaoVien,
      );

      expect(ketQua).toBeDefined();
      expect(mockKho.taoBaiTap).toHaveBeenCalled();
    });

    it('chặn học sinh tạo bài tập', async () => {
      mockPrisma.lopHocPhan.findUnique.mockResolvedValue({ id: 'lop-1', idGiaoVien: 'gv-1' });
      mockPrisma.hoSoHocSinh.findUnique.mockResolvedValue({ id: 'hs-1' });
      mockPrisma.ghiDanh.findFirst.mockResolvedValue({ id: 'gd-1' });

      await expect(
        service.taoBaiTap(
          'lop-1',
          {
            tieuDe: 'Bài tập',
            noiDung: 'Làm bài',
            hanNop: new Date().toISOString(),
            diemToiDa: 10,
            hinhThucNop: HinhThucNop.TEP_TIN,
          },
          mockHocSinh,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('chamDiem', () => {
    it('chặn nhập điểm số lớn hơn điểm tối đa của bài tập', async () => {
      mockKho.timBaiNopTheoId.mockResolvedValue({
        id: 'bn-1',
        baiTap: {
          diemToiDa: 10,
          lopHocPhan: { idGiaoVien: 'gv-1' },
        },
      });
      mockPrisma.hoSoGiaoVien.findUnique.mockResolvedValue({ id: 'gv-1' });

      await expect(
        service.chamDiem('bn-1', { diemSo: 11, nhanXet: 'Tốt' }, mockGiaoVien),
      ).rejects.toThrow(BadRequestException);
    });

    it('chấm điểm thành công cho bài nộp hợp lệ', async () => {
      mockKho.timBaiNopTheoId.mockResolvedValue({
        id: 'bn-1',
        baiTap: {
          diemToiDa: 10,
          lopHocPhan: { idGiaoVien: 'gv-1' },
        },
      });
      mockPrisma.hoSoGiaoVien.findUnique.mockResolvedValue({ id: 'gv-1' });
      mockKho.chamDiemBaiNop.mockResolvedValue({
        id: 'bn-1',
        diemSo: 9.5,
        trangThai: TrangThaiBaiNop.DA_CHAM,
      });

      const ketQua = await service.chamDiem(
        'bn-1',
        { diemSo: 9.5, nhanXet: 'Làm rất tốt' },
        mockGiaoVien,
      );

      expect(ketQua.diemSo).toBe(9.5);
      expect(mockKho.chamDiemBaiNop).toHaveBeenCalledWith('bn-1', 9.5, 'Làm rất tốt');
    });
  });
});
