import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { DichVuXacThuc } from './dich-vu-xac-thuc.service';
import { KhoNguoiDung } from './kho-nguoi-dung.repository';
import { VaiTro } from '@lms/chung';

describe('DichVuXacThuc (Unit Test)', () => {
  let dichVu: DichVuXacThuc;
  let mockKhoNguoiDung: Partial<KhoNguoiDung>;
  let mockJwtService: Partial<JwtService>;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(async () => {
    mockKhoNguoiDung = {
      timTheoEmail: jest.fn(),
      timTheoId: jest.fn(),
      taoNguoiDung: jest.fn(),
      capNhatNguoiDung: jest.fn(),
      taoPhienDangNhap: jest.fn(),
      timPhienTheoId: jest.fn(),
      thuHoiPhien: jest.fn(),
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

  describe('dangNhap', () => {
    it('phải ném UnauthorizedException nếu không tìm thấy email', async () => {
      (mockKhoNguoiDung.timTheoEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        dichVu.dangNhap({
          email: 'khongtontai@example.com',
          matKhau: 'MatKhau123456',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('phải ném UnauthorizedException nếu mật khẩu sai', async () => {
      const matKhauBăm = await argon2.hash('DungMatKhau123');
      (mockKhoNguoiDung.timTheoEmail as jest.Mock).mockResolvedValue({
        id: 'uuid-123',
        email: 'test@example.com',
        matKhau: matKhauBăm,
        kichHoat: true,
      });

      await expect(
        dichVu.dangNhap({
          email: 'test@example.com',
          matKhau: 'SaiMatKhau123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
