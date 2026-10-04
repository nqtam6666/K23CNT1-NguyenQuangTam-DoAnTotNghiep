import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { DichVuNguoiDung } from './dich-vu-nguoi-dung.service';
import { KhoNguoiDung } from './kho-nguoi-dung.repository';
import { VaiTro } from '@lms/chung';

describe('DichVuNguoiDung (Unit Test)', () => {
  let dichVu: DichVuNguoiDung;
  let mockKhoNguoiDung: Partial<KhoNguoiDung>;

  beforeEach(async () => {
    mockKhoNguoiDung = {
      timDanhSachPhanTrang: jest.fn(),
      timTheoId: jest.fn(),
      timTheoEmail: jest.fn(),
      taoNguoiDung: jest.fn(),
      capNhatNguoiDung: jest.fn(),
      chuyenTrangThai: jest.fn(),
      xoaMem: jest.fn(),
      thuHoiTatCaPhienCuaNguoiDung: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [DichVuNguoiDung, { provide: KhoNguoiDung, useValue: mockKhoNguoiDung }],
    }).compile();

    dichVu = module.get<DichVuNguoiDung>(DichVuNguoiDung);
  });

  describe('layChiTiet', () => {
    it('phải ném NotFoundException nếu người dùng không tồn tại', async () => {
      (mockKhoNguoiDung.timTheoId as jest.Mock).mockResolvedValue(null);

      await expect(dichVu.layChiTiet('id-khong-ton-tai')).rejects.toThrow(NotFoundException);
    });

    it('phải trả về thông tin người dùng không chứa mật khẩu', async () => {
      (mockKhoNguoiDung.timTheoId as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: 'user1@lms.edu.vn',
        matKhau: 'hash_secret_123',
        hoTen: 'Người dùng 1',
        vaiTro: VaiTro.HOC_SINH,
      });

      const ketQua = await dichVu.layChiTiet('user-1');
      expect(ketQua).toBeDefined();
      expect(ketQua.email).toBe('user1@lms.edu.vn');
      expect((ketQua as any).matKhau).toBeUndefined();
    });
  });

  describe('taoMoi', () => {
    it('phải ném ConflictException nếu email đã tồn tại', async () => {
      (mockKhoNguoiDung.timTheoEmail as jest.Mock).mockResolvedValue({
        id: 'existing-id',
        email: 'trung@lms.edu.vn',
      });

      await expect(
        dichVu.taoMoi({
          email: 'trung@lms.edu.vn',
          matKhau: 'MatKhau123',
          hoTen: 'Trần Văn Trùng',
          vaiTro: VaiTro.GIAO_VIEN,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('phải tạo người dùng thành công và ẩn mật khẩu', async () => {
      (mockKhoNguoiDung.timTheoEmail as jest.Mock).mockResolvedValue(null);
      (mockKhoNguoiDung.taoNguoiDung as jest.Mock).mockResolvedValue({
        id: 'new-id',
        email: 'moi@lms.edu.vn',
        matKhau: 'hashed_password',
        hoTen: 'Lê Văn Mới',
        vaiTro: VaiTro.GIAO_VIEN,
        kichHoat: true,
      });

      const ketQua = await dichVu.taoMoi({
        email: 'moi@lms.edu.vn',
        matKhau: 'MatKhau123',
        hoTen: 'Lê Văn Mới',
        vaiTro: VaiTro.GIAO_VIEN,
      });

      expect(ketQua.id).toBe('new-id');
      expect((ketQua as any).matKhau).toBeUndefined();
    });
  });

  describe('chuyenTrangThai', () => {
    it('phải cấm người dùng tự khóa tài khoản của chính mình', async () => {
      await expect(
        dichVu.chuyenTrangThai('admin-1', { kichHoat: false }, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('phải khóa tài khoản và thu hồi toàn bộ phiên làm việc', async () => {
      (mockKhoNguoiDung.timTheoId as jest.Mock).mockResolvedValue({
        id: 'target-user',
        email: 'target@lms.edu.vn',
        matKhau: 'hash',
        kichHoat: true,
      });
      (mockKhoNguoiDung.chuyenTrangThai as jest.Mock).mockResolvedValue({
        id: 'target-user',
        email: 'target@lms.edu.vn',
        matKhau: 'hash',
        kichHoat: false,
      });

      const ketQua = await dichVu.chuyenTrangThai('target-user', { kichHoat: false }, 'admin-1');

      expect(ketQua.kichHoat).toBe(false);
      expect(mockKhoNguoiDung.thuHoiTatCaPhienCuaNguoiDung).toHaveBeenCalledWith('target-user');
    });
  });
});
