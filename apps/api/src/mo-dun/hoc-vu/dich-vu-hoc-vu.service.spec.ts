import { Test, TestingModule } from '@nestjs/testing';
import { DichVuHocVuService } from './dich-vu-hoc-vu.service';
import { KhoHocVuRepository } from './kho-hoc-vu.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('DichVuHocVuService', () => {
  let dichVu: DichVuHocVuService;
  let khoMock: any;

  beforeEach(async () => {
    khoMock = {
      layDanhSachNamHoc: jest.fn(),
      timNamHocTheoId: jest.fn(),
      timNamHocTheoTen: jest.fn(),
      taoNamHoc: jest.fn(),
      capNhatNamHoc: jest.fn(),
      xoaNamHoc: jest.fn(),

      layDanhSachHocKyTheoNam: jest.fn(),
      timHocKyTheoId: jest.fn(),
      taoHocKy: jest.fn(),
      capNhatHocKy: jest.fn(),
      xoaHocKy: jest.fn(),

      layDanhSachMonHoc: jest.fn(),
      timMonHocTheoId: jest.fn(),
      timMonHocTheoMa: jest.fn(),
      taoMonHoc: jest.fn(),
      capNhatMonHoc: jest.fn(),
      xoaMonHoc: jest.fn(),

      layDanhSachLopHanhChinh: jest.fn(),
      timLopHanhChinhTheoId: jest.fn(),
      timLopHanhChinhTheoMa: jest.fn(),
      taoLopHanhChinh: jest.fn(),
      capNhatLopHanhChinh: jest.fn(),
      xoaLopHanhChinh: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [DichVuHocVuService, { provide: KhoHocVuRepository, useValue: khoMock }],
    }).compile();

    dichVu = module.get<DichVuHocVuService>(DichVuHocVuService);
  });

  describe('Quản lý Năm học', () => {
    it('phải tạo năm học thành công khi chưa tồn tại', async () => {
      khoMock.timNamHocTheoTen.mockResolvedValue(null);
      khoMock.taoNamHoc.mockResolvedValue({ id: 'nh-1', tenNamHoc: '2025-2026', hienTai: true });

      const ketQua = await dichVu.taoNamHoc({ tenNamHoc: '2025-2026', hienTai: true });
      expect(ketQua).toBeDefined();
      expect(ketQua.tenNamHoc).toBe('2025-2026');
      expect(khoMock.taoNamHoc).toHaveBeenCalledWith({ tenNamHoc: '2025-2026', hienTai: true });
    });

    it('phải ném ConflictException khi năm học đã tồn tại', async () => {
      khoMock.timNamHocTheoTen.mockResolvedValue({ id: 'nh-1', tenNamHoc: '2025-2026' });

      await expect(dichVu.taoNamHoc({ tenNamHoc: '2025-2026', hienTai: false })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('Quản lý Môn học', () => {
    it('phải tạo môn học thành công khi mã môn chưa tồn tại', async () => {
      khoMock.timMonHocTheoMa.mockResolvedValue(null);
      khoMock.taoMonHoc.mockResolvedValue({
        id: 'mh-1',
        maMonHoc: 'TOAN10',
        tenMonHoc: 'Toán học 10',
        soTinChi: 3,
      });

      const ketQua = await dichVu.taoMonHoc({
        maMonHoc: 'TOAN10',
        tenMonHoc: 'Toán học 10',
        soTinChi: 3,
      });

      expect(ketQua).toBeDefined();
      expect(ketQua.maMonHoc).toBe('TOAN10');
    });

    it('phải ném ConflictException khi mã môn học bị trùng', async () => {
      khoMock.timMonHocTheoMa.mockResolvedValue({ id: 'mh-1', maMonHoc: 'TOAN10' });

      await expect(
        dichVu.taoMonHoc({
          maMonHoc: 'TOAN10',
          tenMonHoc: 'Toán học 10',
          soTinChi: 3,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('Quản lý Lớp hành chính', () => {
    it('phải tạo lớp hành chính thành công', async () => {
      khoMock.timLopHanhChinhTheoMa.mockResolvedValue(null);
      khoMock.taoLopHanhChinh.mockResolvedValue({
        id: 'lhc-1',
        maLop: '10A1',
        tenLop: 'Lớp 10A1',
        khoiLop: 10,
      });

      const ketQua = await dichVu.taoLopHanhChinh({
        maLop: '10A1',
        tenLop: 'Lớp 10A1',
        khoiLop: 10,
      });

      expect(ketQua.maLop).toBe('10A1');
    });

    it('phải ném ConflictException khi mã lớp hành chính bị trùng', async () => {
      khoMock.timLopHanhChinhTheoMa.mockResolvedValue({ id: 'lhc-1', maLop: '10A1' });

      await expect(
        dichVu.taoLopHanhChinh({
          maLop: '10A1',
          tenLop: 'Lớp 10A1',
          khoiLop: 10,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
