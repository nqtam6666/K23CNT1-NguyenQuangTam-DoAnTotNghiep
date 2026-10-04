import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DichVuCaiDatService } from './dich-vu-cai-dat.service';
import { KhoCaiDatRepository } from './kho-cai-dat.repository';

describe('DichVuCaiDatService (Unit Test)', () => {
  let dichVu: DichVuCaiDatService;
  let mockKhoCaiDat: Partial<KhoCaiDatRepository>;

  const danhSachMau = [
    {
      id: '1',
      khoa: 'TEN_HE_THONG',
      giaTri: 'Hệ thống Quản lý Học tập LMS',
      nhom: 'chung',
      moTa: 'Tên hệ thống hiển thị',
      kieuDuLieu: 'chuoi',
      congKhai: true,
      ngayTao: new Date(),
      ngayCapNhat: new Date(),
    },
    {
      id: '2',
      khoa: 'EMAIL_LIEN_HE',
      giaTri: 'lienhe@truong.edu.vn',
      nhom: 'lien_he',
      moTa: 'Email hỗ trợ',
      kieuDuLieu: 'chuoi',
      congKhai: true,
      ngayTao: new Date(),
      ngayCapNhat: new Date(),
    },
    {
      id: '3',
      khoa: 'KHOA_BI_MAT_NOI_BO',
      giaTri: 'secret_123',
      nhom: 'bao_mat',
      moTa: 'Cấu hình nhạy cảm',
      kieuDuLieu: 'chuoi',
      congKhai: false,
      ngayTao: new Date(),
      ngayCapNhat: new Date(),
    },
  ];

  beforeEach(async () => {
    mockKhoCaiDat = {
      layDanhSach: jest.fn().mockResolvedValue(danhSachMau),
      layDanhSachCongKhai: jest.fn().mockResolvedValue(danhSachMau.filter((c) => c.congKhai)),
      layTheoKhoa: jest.fn(),
      capNhat: jest.fn(),
      capNhatNhieu: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [DichVuCaiDatService, { provide: KhoCaiDatRepository, useValue: mockKhoCaiDat }],
    }).compile();

    dichVu = module.get<DichVuCaiDatService>(DichVuCaiDatService);
  });

  describe('layDanhSachCaiDat', () => {
    it('phải trả về toàn bộ danh sách cài đặt cho admin', async () => {
      const ketQua = await dichVu.layDanhSachCaiDat();
      expect(ketQua).toHaveLength(3);
      expect(mockKhoCaiDat.layDanhSach).toHaveBeenCalledTimes(1);
    });
  });

  describe('layBanDoCaiDatCongKhai', () => {
    it('phải trả về bản đồ key-value các cài đặt công khai', async () => {
      const ketQua = await dichVu.layBanDoCaiDatCongKhai();
      expect(ketQua).toEqual({
        TEN_HE_THONG: 'Hệ thống Quản lý Học tập LMS',
        EMAIL_LIEN_HE: 'lienhe@truong.edu.vn',
      });
      expect(ketQua.KHOA_BI_MAT_NOI_BO).toBeUndefined();
      expect(mockKhoCaiDat.layDanhSachCongKhai).toHaveBeenCalledTimes(1);
    });
  });

  describe('layTheoKhoa', () => {
    it('phải ném NotFoundException nếu khóa không tồn tại', async () => {
      (mockKhoCaiDat.layTheoKhoa as jest.Mock).mockResolvedValue(null);

      await expect(dichVu.layTheoKhoa('KHOA_KHONG_CO')).rejects.toThrow(NotFoundException);
    });

    it('phải trả về cài đặt nếu tìm thấy khóa', async () => {
      (mockKhoCaiDat.layTheoKhoa as jest.Mock).mockResolvedValue(danhSachMau[0]);

      const ketQua = await dichVu.layTheoKhoa('TEN_HE_THONG');
      expect(ketQua.khoa).toBe('TEN_HE_THONG');
      expect(ketQua.giaTri).toBe('Hệ thống Quản lý Học tập LMS');
    });
  });

  describe('capNhatNhieu', () => {
    it('phải cập nhật nhiều khóa và trả về số lượng thành công', async () => {
      (mockKhoCaiDat.capNhatNhieu as jest.Mock).mockResolvedValue(2);

      const ketQua = await dichVu.capNhatNhieu([
        { khoa: 'TEN_HE_THONG', giaTri: 'Tên mới' },
        { khoa: 'EMAIL_LIEN_HE', giaTri: 'admin@truong.edu.vn' },
      ]);

      expect(ketQua.soLuong).toBe(2);
      expect(mockKhoCaiDat.capNhatNhieu).toHaveBeenCalledWith([
        { khoa: 'TEN_HE_THONG', giaTri: 'Tên mới' },
        { khoa: 'EMAIL_LIEN_HE', giaTri: 'admin@truong.edu.vn' },
      ]);
    });
  });

  describe('capNhatMot', () => {
    it('phải cập nhật giá trị của một khóa', async () => {
      (mockKhoCaiDat.capNhat as jest.Mock).mockResolvedValue({
        ...danhSachMau[0],
        giaTri: 'Giá trị cập nhật',
      });

      const ketQua = await dichVu.capNhatMot('TEN_HE_THONG', 'Giá trị cập nhật');
      expect(ketQua.giaTri).toBe('Giá trị cập nhật');
      expect(mockKhoCaiDat.capNhat).toHaveBeenCalledWith('TEN_HE_THONG', 'Giá trị cập nhật');
    });
  });
});
