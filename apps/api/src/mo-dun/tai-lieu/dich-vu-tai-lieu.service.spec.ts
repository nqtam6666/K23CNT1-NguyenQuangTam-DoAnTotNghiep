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
      capNhatTaiLieu: jest.fn(),
      xoaTaiLieu: jest.fn(),
    };

    mockPrisma = {
      lopHocPhan: { findUnique: jest.fn() },
      hoSoGiaoVien: { findUnique: jest.fn() },
      hoSoHocSinh: { findUnique: jest.fn() },
      ghiDanh: { findFirst: jest.fn() },
      phuHuynhHocSinh: { findMany: jest.fn() },
      nhatKyHeThong: {
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue({ id: 'nk-1' }),
      },
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

  describe('danhGiaTaiLieu', () => {
    it('cho phép sinh viên trong lớp đánh giá học liệu từ 1-5 sao và tính điểm trung bình', async () => {
      mockKho.timTheoId.mockResolvedValue({
        id: 'tl-1',
        idLopHocPhan: 'lop-1',
        tieuDe: 'Giáo trình Chương 1',
      });
      mockPrisma.lopHocPhan.findUnique.mockResolvedValue({ id: 'lop-1', idGiaoVien: 'gv-1' });
      mockPrisma.hoSoHocSinh.findUnique.mockResolvedValue({ id: 'hs-1' });
      mockPrisma.ghiDanh.findFirst.mockResolvedValue({ id: 'gd-1' });

      const ketQua = await service.danhGiaTaiLieu(
        'tl-1',
        { soSao: 5, nhanXet: 'Tài liệu trình bày rất dễ hiểu' },
        mockHocSinh,
      );

      expect(ketQua.diemDanhGiaTrungBinh).toBe(5);
      expect(ketQua.tongSoDanhGia).toBe(1);
      expect(ketQua.danhGiaCuaToi.soSao).toBe(5);
    });
  });

  describe('capNhatPhienBanTaiLieu & khoiPhucPhienBan', () => {
    it('cho phép giảng viên cập nhật phiên bản mới (v2) và khôi phục lại phiên bản gốc (v1)', async () => {
      mockKho.timTheoId.mockResolvedValue({
        id: 'tl-1',
        idLopHocPhan: 'lop-1',
        tieuDe: 'Slide Chương 1',
        duongDanTep: '/uploads/tai-lieu/ban-goc.pdf',
        kichThuocTep: 1024,
        ngayTao: new Date().toISOString(),
        lopHocPhan: { id: 'lop-1', idGiaoVien: 'gv-1' },
      });
      mockPrisma.lopHocPhan.findUnique.mockResolvedValue({ id: 'lop-1', idGiaoVien: 'gv-1' });
      mockPrisma.hoSoGiaoVien.findUnique.mockResolvedValue({ id: 'gv-1' });
      mockKho.capNhatTaiLieu.mockImplementation(async (_id: string, duLieu: any) => ({
        id: 'tl-1',
        ...duLieu,
      }));

      const mockTepMoi: any = {
        originalname: 'slide-v2.pdf',
        buffer: Buffer.from('pdf-v2'),
        size: 2048,
      };

      const capNhat = await service.capNhatPhienBanTaiLieu(
        'tl-1',
        { ghiChuThayDoi: 'Bổ sung bài tập thực hành cuối chương' },
        mockTepMoi,
        mockGiaoVien,
      );

      expect(capNhat.soPhienBanHienTai).toBe(2);
      expect(capNhat.ghiChuPhienBanMoiNhat).toBe('Bổ sung bài tập thực hành cuối chương');

      const lichSu = await service.layLichSuPhienBan('tl-1', mockGiaoVien);
      expect(lichSu.tongSoPhienBan).toBe(2);

      const khoiPhuc = await service.khoiPhucPhienBan(
        'tl-1',
        { soPhienBan: 1 },
        mockGiaoVien,
      );
      expect(khoiPhuc.soPhienBanKhoiPhuc).toBe(1);
      expect(khoiPhuc.duongDanTep).toBe('/uploads/tai-lieu/ban-goc.pdf');
    });
  });
});
