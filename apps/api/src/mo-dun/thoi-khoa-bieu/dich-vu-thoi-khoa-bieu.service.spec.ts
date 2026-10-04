import { Test, TestingModule } from '@nestjs/testing';
import { DichVuThoiKhoaBieuService } from './dich-vu-thoi-khoa-bieu.service';
import { KhoThoiKhoaBieuRepository } from './kho-thoi-khoa-bieu.repository';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { ConflictException } from '@nestjs/common';

describe('DichVuThoiKhoaBieuService', () => {
  let dichVu: DichVuThoiKhoaBieuService;
  let khoMock: any;
  let prismaMock: any;

  beforeEach(async () => {
    khoMock = {
      layThoiKhoaBieuTheoLop: jest.fn(),
      timThoiKhoaBieuTheoId: jest.fn(),
      kiemTraXungDotPhong: jest.fn(),
      kiemTraXungDotGiaoVien: jest.fn(),
      taoThoiKhoaBieu: jest.fn(),
      capNhatThoiKhoaBieu: jest.fn(),
      xoaThoiKhoaBieu: jest.fn(),
      layDanhSachBuoiHocTheoLop: jest.fn(),
      timBuoiHocTheoId: jest.fn(),
      taoBuoiHoc: jest.fn(),
      capNhatBuoiHoc: jest.fn(),
      xoaBuoiHoc: jest.fn(),
      layThoiKhoaBieuGiaoVien: jest.fn(),
      layThoiKhoaBieuHocSinh: jest.fn(),
    };

    prismaMock = {
      lopHocPhan: {
        findUnique: jest.fn(),
      },
      buoiHoc: {
        createMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DichVuThoiKhoaBieuService,
        { provide: KhoThoiKhoaBieuRepository, useValue: khoMock },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    dichVu = module.get<DichVuThoiKhoaBieuService>(DichVuThoiKhoaBieuService);
  });

  describe('Tạo thời khóa biểu & kiểm tra xung đột', () => {
    it('tạo thời khóa biểu thành công khi phòng và giáo viên đều rảnh', async () => {
      prismaMock.lopHocPhan.findUnique.mockResolvedValue({
        id: 'lhp-1',
        idHocKy: 'hk-1',
        idGiaoVien: 'gv-1',
        tenLopHocPhan: 'Toán 10',
      });
      khoMock.kiemTraXungDotPhong.mockResolvedValue(null);
      khoMock.kiemTraXungDotGiaoVien.mockResolvedValue(null);
      khoMock.taoThoiKhoaBieu.mockResolvedValue({
        id: 'tkb-1',
        thuTrongTuan: 2,
        tietBatDau: 1,
        soTiet: 3,
        phongHoc: 'P101',
      });

      const ketQua = await dichVu.taoThoiKhoaBieu('lhp-1', {
        thuTrongTuan: 2,
        tietBatDau: 1,
        soTiet: 3,
        phongHoc: 'P101',
      });

      expect(ketQua).toBeDefined();
      expect(ketQua.phongHoc).toBe('P101');
    });

    it('phải ném ConflictException khi phòng học đã có lớp khác sử dụng cùng khung giờ', async () => {
      prismaMock.lopHocPhan.findUnique.mockResolvedValue({
        id: 'lhp-1',
        idHocKy: 'hk-1',
        idGiaoVien: 'gv-1',
        tenLopHocPhan: 'Toán 10',
      });
      // Giả lập phát hiện phòng bị trùng:
      khoMock.kiemTraXungDotPhong.mockResolvedValue({
        thuTrongTuan: 2,
        tietBatDau: 2,
        lopHocPhan: { tenLopHocPhan: 'Văn 10' },
      });

      await expect(
        dichVu.taoThoiKhoaBieu('lhp-1', {
          thuTrongTuan: 2,
          tietBatDau: 1,
          soTiet: 3,
          phongHoc: 'P101',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('phải ném ConflictException khi giáo viên đã có lịch dạy ở lớp khác trong cùng khung giờ', async () => {
      prismaMock.lopHocPhan.findUnique.mockResolvedValue({
        id: 'lhp-1',
        idHocKy: 'hk-1',
        idGiaoVien: 'gv-1',
        tenLopHocPhan: 'Toán 10',
      });
      khoMock.kiemTraXungDotPhong.mockResolvedValue(null);
      // Giả lập giáo viên bị trùng lịch dạy:
      khoMock.kiemTraXungDotGiaoVien.mockResolvedValue({
        thuTrongTuan: 2,
        tietBatDau: 1,
        lopHocPhan: { tenLopHocPhan: 'Toán 11' },
      });

      await expect(
        dichVu.taoThoiKhoaBieu('lhp-1', {
          thuTrongTuan: 2,
          tietBatDau: 1,
          soTiet: 3,
          phongHoc: 'P102',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('Tự động sinh buổi học theo thời khóa biểu', () => {
    it('phải tính toán các buổi học trong khoảng thời gian học kỳ chính xác', async () => {
      prismaMock.lopHocPhan.findUnique.mockResolvedValue({
        id: 'lhp-1',
        tenLopHocPhan: 'Toán 10',
        hocKy: {
          ngayBatDau: new Date('2026-09-01'),
          ngayKetThuc: new Date('2026-09-15'), // 2 tuần
        },
        cacThoiKhoaBieu: [
          { thuTrongTuan: 2, tietBatDau: 1, soTiet: 2 }, // Thứ 2
        ],
      });
      prismaMock.buoiHoc.createMany.mockResolvedValue({ count: 2 });

      const ketQua = await dichVu.sinhBuoiHocTheoThoiKhoaBieu('lhp-1');

      expect(ketQua).toBeDefined();
      expect(ketQua.tongSoBuoi).toBeGreaterThan(0);
      expect(prismaMock.buoiHoc.createMany).toHaveBeenCalled();
    });
  });
});
