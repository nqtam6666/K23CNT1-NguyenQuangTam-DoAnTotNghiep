import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { DichVuXacThuc } from './dich-vu-xac-thuc.service';
import { KhoNguoiDung, CauHinhBaoMatHeThong } from '../nguoi-dung/kho-nguoi-dung.repository';
import { VaiTro } from '@lms/chung';

describe('DichVuXacThuc (Unit Test)', () => {
  let dichVu: DichVuXacThuc;
  let mockKhoNguoiDung: Partial<KhoNguoiDung>;
  let mockJwtService: Partial<JwtService>;
  let mockConfigService: Partial<ConfigService>;
  let cauHinhBaoMatMock: CauHinhBaoMatHeThong;

  beforeEach(async () => {
    cauHinhBaoMatMock = {
      choPhepTuDangKy: true,
      thoiGianPhienGiay: 86400,
      soLanSaiToiDa: 3,
      cuaSoDemSaiPhut: 15,
      thoiGianKhoaTamPhut: 15,
      gioiHanDangNhapTheoIp: 100,
      cuaSoGioiHanIpPhut: 15,
      doDaiMatKhauToiThieu: 8,
      matKhauBatBuocChuVaSo: true,
    };

    mockKhoNguoiDung = {
      timTheoEmail: jest.fn(),
      timTheoId: jest.fn(),
      taoNguoiDung: jest.fn(),
      capNhatNguoiDung: jest.fn(),
      taoPhienDangNhap: jest.fn(),
      timPhienTheoId: jest.fn(),
      thuHoiPhien: jest.fn(),
      layDanhSachPhienDangNhap: jest.fn(),
      thuHoiPhienCuaNguoiDung: jest.fn(),
      thuHoiTatCaPhienCuaNguoiDung: jest.fn(),
      layCauHinhBaoMat: jest.fn().mockImplementation(async () => cauHinhBaoMatMock),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock_token_jwt_123'),
      verify: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn().mockImplementation((khoa: string) => {
        if (khoa === 'JWT_ACCESS_SECRET') return 'secret_access';
        if (khoa === 'JWT_REFRESH_SECRET') return 'secret_refresh';
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DichVuXacThuc,
        { provide: KhoNguoiDung, useValue: mockKhoNguoiDung },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    dichVu = module.get<DichVuXacThuc>(DichVuXacThuc);
  });

  describe('dangKy', () => {
    it('phải chặn đăng ký (ForbiddenException) khi bao_mat.cho_phep_tu_dang_ky bị tắt', async () => {
      cauHinhBaoMatMock.choPhepTuDangKy = false;

      await expect(
        dichVu.dangKy({
          email: 'hocsinhmoi@example.com',
          matKhau: 'MatKhau123456',
          hoTen: 'Nguyễn Văn B',
          vaiTro: VaiTro.HOC_SINH,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('phải kiểm tra độ mạnh mật khẩu theo chính sách bao_mat', async () => {
      await expect(
        dichVu.dangKy({
          email: 'hocsinhmoi@example.com',
          matKhau: 'chicochucai',
          hoTen: 'Nguyễn Văn B',
          vaiTro: VaiTro.HOC_SINH,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('phải ném ConflictException nếu email đã tồn tại', async () => {
      (mockKhoNguoiDung.timTheoEmail as jest.Mock).mockResolvedValue({
        id: '123',
        email: 'test@example.com',
      });

      await expect(
        dichVu.dangKy({
          email: 'test@example.com',
          matKhau: 'MatKhau123456',
          hoTen: 'Nguyễn Văn A',
          vaiTro: VaiTro.HOC_SINH,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('phải tạo người dùng thành công và trả về cặp token', async () => {
      (mockKhoNguoiDung.timTheoEmail as jest.Mock).mockResolvedValue(null);
      (mockKhoNguoiDung.taoNguoiDung as jest.Mock).mockResolvedValue({
        id: 'uuid-123',
        email: 'nguyenvana@example.com',
        hoTen: 'Nguyễn Văn A',
        vaiTro: VaiTro.HOC_SINH,
      });
      (mockKhoNguoiDung.taoPhienDangNhap as jest.Mock).mockResolvedValue({
        id: 'phien-123',
      });

      const ketQua = await dichVu.dangKy({
        email: 'nguyenvana@example.com',
        matKhau: 'MatKhau123456',
        hoTen: 'Nguyễn Văn A',
        vaiTro: VaiTro.HOC_SINH,
      });

      expect(ketQua).toBeDefined();
      expect(ketQua.accessToken).toBe('mock_token_jwt_123');
      expect(ketQua.nguoiDung.email).toBe('nguyenvana@example.com');
    });
  });

  describe('dangNhap & chống dò mật khẩu', () => {
    it('phải ném UnauthorizedException nếu không tìm thấy email', async () => {
      (mockKhoNguoiDung.timTheoEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        dichVu.dangNhap({
          email: 'khongtontai@example.com',
          matKhau: 'MatKhau123456',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('phải ném UnauthorizedException nếu mật khẩu sai và khóa tạm sau khi vượt ngưỡng so_lan_sai_toi_da', async () => {
      const matKhauBam = await argon2.hash('DungMatKhau123');
      (mockKhoNguoiDung.timTheoEmail as jest.Mock).mockResolvedValue({
        id: 'uuid-123',
        email: 'test@example.com',
        matKhau: matKhauBam,
        kichHoat: true,
      });

      // Sai lần 1, 2, 3 (ngưỡng soLanSaiToiDa = 3)
      for (let i = 0; i < 3; i++) {
        await expect(
          dichVu.dangNhap({
            email: 'test@example.com',
            matKhau: 'SaiMatKhau123',
          }),
        ).rejects.toThrow(UnauthorizedException);
      }

      // Lần thứ 4: kể cả nhập đúng mật khẩu vẫn bị từ chối ngay trước khi truy vấn CSDL vì tài khoản đang bị khóa tạm thời
      (mockKhoNguoiDung.timTheoEmail as jest.Mock).mockClear();
      await expect(
        dichVu.dangNhap({
          email: 'test@example.com',
          matKhau: 'DungMatKhau123',
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockKhoNguoiDung.timTheoEmail).not.toHaveBeenCalled();
    });
  });

  describe('quản lý phiên đăng nhập cá nhân', () => {
    it('phải cho phép người dùng thu hồi toàn bộ phiên đăng nhập', async () => {
      (mockKhoNguoiDung.thuHoiTatCaPhienCuaNguoiDung as jest.Mock).mockResolvedValue({ count: 3 });

      const ketQua = await dichVu.dangXuatTatCaThietBiKhac('uuid-123');
      expect(ketQua.soLuongThuHoi).toBe(3);
      expect(mockKhoNguoiDung.thuHoiTatCaPhienCuaNguoiDung).toHaveBeenCalledWith(
        'uuid-123',
        undefined,
      );
    });
  });
});


