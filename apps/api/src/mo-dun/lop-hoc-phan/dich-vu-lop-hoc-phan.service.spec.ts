import { Test, TestingModule } from '@nestjs/testing';
import { DichVuLopHocPhanService } from './dich-vu-lop-hoc-phan.service';
import { KhoLopHocPhanRepository } from './kho-lop-hoc-phan.repository';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { VaiTro, PayloadJwt } from '@lms/chung';

describe('DichVuLopHocPhanService', () => {
  let dichVu: DichVuLopHocPhanService;
  let khoMock: any;
  let prismaMock: any;

  beforeEach(async () => {
    khoMock = {
      layDanhSachLopHocPhan: jest.fn(),
      timLopHocPhanTheoId: jest.fn(),
      timLopHocPhanTheoMa: jest.fn(),
      timLopHocPhanTheoMaThamGia: jest.fn(),
      taoLopHocPhan: jest.fn(),
      capNhatLopHocPhan: jest.fn(),
      xoaLopHocPhan: jest.fn(),
      layLopHocPhanTheoGiaoVien: jest.fn(),
      layLopHocPhanTheoHocSinh: jest.fn(),
      layDanhSachGhiDanh: jest.fn(),
      kiemTraGhiDanh: jest.fn(),
      taoGhiDanh: jest.fn(),
      taoGhiDanhNhieu: jest.fn(),
      xoaGhiDanh: jest.fn(),
      layDanhSachHocSinhTheoLopHanhChinh: jest.fn(),
    };

    prismaMock = {
      hoSoHocSinh: {
        findUnique: jest.fn(),
      },
      hoSoGiaoVien: {
        findUnique: jest.fn(),
      },
      phuHuynhHocSinh: {
        findMany: jest.fn(),
      },
      ghiDanh: {
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DichVuLopHocPhanService,
        { provide: KhoLopHocPhanRepository, useValue: khoMock },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    dichVu = module.get<DichVuLopHocPhanService>(DichVuLopHocPhanService);
  });

  describe('Tạo Lớp học phần', () => {
    it('phải tạo lớp học phần thành công và sinh mã tham gia ngẫu nhiên', async () => {
      khoMock.timLopHocPhanTheoMa.mockResolvedValue(null);
      khoMock.timLopHocPhanTheoMaThamGia.mockResolvedValue(null);
      khoMock.taoLopHocPhan.mockImplementation((data: any) =>
        Promise.resolve({ id: 'lhp-1', ...data }),
      );

      const input = {
        maLopHocPhan: 'LHP_TOAN_10A',
        tenLopHocPhan: 'Toán 10 Nâng cao',
        idMonHoc: 'mh-1',
        idHocKy: 'hk-1',
        idGiaoVien: 'gv-1',
      };

      const ketQua = await dichVu.taoLopHocPhan(input);

      expect(ketQua).toBeDefined();
      expect(ketQua.maLopHocPhan).toBe('LHP_TOAN_10A');
      expect(khoMock.taoLopHocPhan).toHaveBeenCalledWith(
        expect.objectContaining({
          maThamGia: expect.any(String),
        }),
      );
    });

    it('phải ném ConflictException khi mã lớp học phần đã tồn tại', async () => {
      khoMock.timLopHocPhanTheoMa.mockResolvedValue({ id: 'lhp-1', maLopHocPhan: 'LHP_TOAN_10A' });

      await expect(
        dichVu.taoLopHocPhan({
          maLopHocPhan: 'LHP_TOAN_10A',
          tenLopHocPhan: 'Toán 10 Nâng cao',
          idMonHoc: 'mh-1',
          idHocKy: 'hk-1',
          idGiaoVien: 'gv-1',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('Phân quyền ABAC chống IDOR khi xem chi tiết lớp học phần', () => {
    const nguoiDungHocSinh: PayloadJwt = {
      id: 'user-hs-1',
      sub: 'user-hs-1',
      hoTen: 'Nguyễn Văn Học Sinh',
      email: 'hs1@lms.edu.vn',
      vaiTro: VaiTro.HOC_SINH,
    };

    it('học sinh đã ghi danh được phép xem chi tiết lớp học phần', async () => {
      khoMock.timLopHocPhanTheoId.mockResolvedValue({
        id: 'lhp-1',
        tenLopHocPhan: 'Toán 10',
      });
      prismaMock.hoSoHocSinh.findUnique.mockResolvedValue({
        id: 'hs-profile-1',
        idNguoiDung: 'user-hs-1',
      });
      khoMock.kiemTraGhiDanh.mockResolvedValue({
        id: 'gd-1',
        idLopHocPhan: 'lhp-1',
        idHocSinh: 'hs-profile-1',
      });

      const ketQua = await dichVu.layChiTietLopHocPhan('lhp-1', nguoiDungHocSinh);
      expect(ketQua).toBeDefined();
      expect(ketQua.id).toBe('lhp-1');
    });

    it('học sinh CHƯA ghi danh xem lớp học phần khác phải bị chặn 403 ForbiddenException (Chống IDOR)', async () => {
      khoMock.timLopHocPhanTheoId.mockResolvedValue({
        id: 'lhp-2',
        tenLopHocPhan: 'Lý 10',
      });
      prismaMock.hoSoHocSinh.findUnique.mockResolvedValue({
        id: 'hs-profile-1',
        idNguoiDung: 'user-hs-1',
      });
      // Giả lập chưa ghi danh:
      khoMock.kiemTraGhiDanh.mockResolvedValue(null);

      await expect(dichVu.layChiTietLopHocPhan('lhp-2', nguoiDungHocSinh)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('phụ huynh xem lớp học phần mà con em không học phải bị chặn 403 ForbiddenException', async () => {
      const nguoiDungPhuHuynh: PayloadJwt = {
        id: 'user-ph-1',
        sub: 'user-ph-1',
        hoTen: 'Nguyễn Phụ Huynh',
        email: 'ph1@lms.edu.vn',
        vaiTro: VaiTro.PHU_HUYNH,
      };

      khoMock.timLopHocPhanTheoId.mockResolvedValue({ id: 'lhp-3' });
      prismaMock.phuHuynhHocSinh.findMany.mockResolvedValue([{ idHocSinh: 'hs-con-1' }]);
      prismaMock.ghiDanh.findFirst.mockResolvedValue(null); // Con không học lớp này

      await expect(dichVu.layChiTietLopHocPhan('lhp-3', nguoiDungPhuHuynh)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('Ghi danh học sinh', () => {
    it('phải ghi danh thành công khi học sinh chưa có trong lớp', async () => {
      khoMock.timLopHocPhanTheoId.mockResolvedValue({ id: 'lhp-1' });
      khoMock.kiemTraGhiDanh.mockResolvedValue(null);
      khoMock.taoGhiDanh.mockResolvedValue({ id: 'gd-1', idLopHocPhan: 'lhp-1', idHocSinh: 'hs-1' });

      const ketQua = await dichVu.ghiDanhHocSinh('lhp-1', 'hs-1');
      expect(ketQua).toBeDefined();
      expect(khoMock.taoGhiDanh).toHaveBeenCalledWith('lhp-1', 'hs-1');
    });

    it('phải ném ConflictException khi ghi danh trùng lặp học sinh vào lớp', async () => {
      khoMock.timLopHocPhanTheoId.mockResolvedValue({ id: 'lhp-1' });
      khoMock.kiemTraGhiDanh.mockResolvedValue({ id: 'gd-1' }); // Đã tồn tại

      await expect(dichVu.ghiDanhHocSinh('lhp-1', 'hs-1')).rejects.toThrow(ConflictException);
    });
  });

  describe('Tham gia lớp học phần bằng mã mời', () => {
    it('học sinh tham gia thành công khi mã hợp lệ', async () => {
      const nguoiDung: PayloadJwt = {
        id: 'user-hs-1',
        sub: 'user-hs-1',
        hoTen: 'Nguyễn Văn Học Sinh',
        email: 'hs1@lms.edu.vn',
        vaiTro: VaiTro.HOC_SINH,
      };

      prismaMock.hoSoHocSinh.findUnique.mockResolvedValue({ id: 'hs-1', idNguoiDung: 'user-hs-1' });
      khoMock.timLopHocPhanTheoMaThamGia.mockResolvedValue({
        id: 'lhp-1',
        tenLopHocPhan: 'Văn 10',
        kichHoat: true,
      });
      khoMock.kiemTraGhiDanh.mockResolvedValue(null);
      khoMock.taoGhiDanh.mockResolvedValue({ id: 'gd-1' });

      const ketQua = await dichVu.thamGiaBangMa('ABC123', nguoiDung);
      expect(ketQua).toBeDefined();
      expect(khoMock.taoGhiDanh).toHaveBeenCalledWith('lhp-1', 'hs-1');
    });
  });
});
