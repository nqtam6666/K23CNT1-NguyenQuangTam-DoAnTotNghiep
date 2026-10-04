import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { DichVuHoSo } from './dich-vu-ho-so.service';
import { KhoHoSo } from './kho-ho-so.repository';
import { KhoNguoiDung } from '../nguoi-dung/kho-nguoi-dung.repository';
import { VaiTro, PayloadJwt } from '@lms/chung';

describe('DichVuHoSo (Unit Test & Kiểm tra Chống IDOR)', () => {
  let dichVu: DichVuHoSo;
  let mockKhoHoSo: Partial<KhoHoSo>;
  let mockKhoNguoiDung: Partial<KhoNguoiDung>;

  beforeEach(async () => {
    mockKhoHoSo = {
      timHoSoHocSinhTheoId: jest.fn(),
      timHoSoHocSinhTheoIdNguoiDung: jest.fn(),
      timHoSoHocSinhTheoMa: jest.fn(),
      taoHoSoHocSinh: jest.fn(),
      capNhatHoSoHocSinh: jest.fn(),
      timDanhSachHocSinh: jest.fn(),
      timHoSoGiaoVienTheoId: jest.fn(),
      timHoSoGiaoVienTheoIdNguoiDung: jest.fn(),
      timHoSoGiaoVienTheoMa: jest.fn(),
      taoHoSoGiaoVien: jest.fn(),
      capNhatHoSoGiaoVien: jest.fn(),
      thietLapLienKetPhuHuynh: jest.fn(),
      xoaLienKetPhuHuynh: jest.fn(),
      kiemTraLienKet: jest.fn(),
      layDanhSachConEmCuaPhuHuynh: jest.fn(),
    };

    mockKhoNguoiDung = {
      timTheoId: jest.fn(),
      capNhatNguoiDung: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DichVuHoSo,
        { provide: KhoHoSo, useValue: mockKhoHoSo },
        { provide: KhoNguoiDung, useValue: mockKhoNguoiDung },
      ],
    }).compile();

    dichVu = module.get<DichVuHoSo>(DichVuHoSo);
  });

  describe('layChiTietHocSinh (Chống IDOR)', () => {
    const hoSoHocSinh = {
      id: 'ho-so-1',
      idNguoiDung: 'user-hoc-sinh-1',
      maHocSinh: 'HS0001',
      diaChi: 'Hà Nội',
    };

    it('Học sinh xem hồ sơ của chính mình -> Cho phép', async () => {
      (mockKhoHoSo.timHoSoHocSinhTheoId as jest.Mock).mockResolvedValue(hoSoHocSinh);

      const nguoiDungHocSinh: PayloadJwt = {
        sub: 'user-hoc-sinh-1',
        id: 'user-hoc-sinh-1',
        email: 'hs1@lms.edu.vn',
        hoTen: 'Học Sinh Một',
        vaiTro: VaiTro.HOC_SINH,
      };

      const ketQua = await dichVu.layChiTietHocSinh('ho-so-1', nguoiDungHocSinh);
      expect(ketQua).toBeDefined();
      expect(ketQua.id).toBe('ho-so-1');
    });

    it('Học sinh cố tình xem hồ sơ của học sinh khác -> Ném ForbiddenException (Chống IDOR)', async () => {
      (mockKhoHoSo.timHoSoHocSinhTheoId as jest.Mock).mockResolvedValue(hoSoHocSinh);

      const hackerHocSinh: PayloadJwt = {
        sub: 'user-hoc-sinh-2',
        id: 'user-hoc-sinh-2',
        email: 'hs2@lms.edu.vn',
        hoTen: 'Học Sinh Hai',
        vaiTro: VaiTro.HOC_SINH,
      };

      await expect(
        dichVu.layChiTietHocSinh('ho-so-1', hackerHocSinh),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Phụ huynh xem hồ sơ con em ĐÃ liên kết -> Cho phép', async () => {
      (mockKhoHoSo.timHoSoHocSinhTheoId as jest.Mock).mockResolvedValue(hoSoHocSinh);
      (mockKhoHoSo.kiemTraLienKet as jest.Mock).mockResolvedValue(true);

      const phuHuynh: PayloadJwt = {
        sub: 'phu-huynh-1',
        id: 'phu-huynh-1',
        email: 'ph1@lms.edu.vn',
        hoTen: 'Phụ Huynh Một',
        vaiTro: VaiTro.PHU_HUYNH,
      };

      const ketQua = await dichVu.layChiTietHocSinh('ho-so-1', phuHuynh);
      expect(ketQua).toBeDefined();
      expect(ketQua.id).toBe('ho-so-1');
    });

    it('Phụ huynh xem hồ sơ học sinh CHƯA liên kết -> Ném ForbiddenException (Chống IDOR)', async () => {
      (mockKhoHoSo.timHoSoHocSinhTheoId as jest.Mock).mockResolvedValue(hoSoHocSinh);
      (mockKhoHoSo.kiemTraLienKet as jest.Mock).mockResolvedValue(false);

      const phuHuynhKhac: PayloadJwt = {
        sub: 'phu-huynh-2',
        id: 'phu-huynh-2',
        email: 'ph2@lms.edu.vn',
        hoTen: 'Phụ Huynh Hai',
        vaiTro: VaiTro.PHU_HUYNH,
      };

      await expect(
        dichVu.layChiTietHocSinh('ho-so-1', phuHuynhKhac),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('taoHoSoHocSinh', () => {
    it('phải ném ConflictException nếu mã học sinh đã tồn tại', async () => {
      (mockKhoNguoiDung.timTheoId as jest.Mock).mockResolvedValue({
        id: 'user-hs',
        email: 'hs@lms.edu.vn',
      });
      (mockKhoHoSo.timHoSoHocSinhTheoIdNguoiDung as jest.Mock).mockResolvedValue(null);
      (mockKhoHoSo.timHoSoHocSinhTheoMa as jest.Mock).mockResolvedValue({
        id: 'existing-profile',
        maHocSinh: 'HS9999',
      });

      await expect(
        dichVu.taoHoSoHocSinh({
          idNguoiDung: 'user-hs',
          maHocSinh: 'HS9999',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
