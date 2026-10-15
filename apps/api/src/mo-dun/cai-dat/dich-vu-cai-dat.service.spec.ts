import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DichVuCaiDatService } from './dich-vu-cai-dat.service';
import { KhoCaiDatRepository } from './kho-cai-dat.repository';
import { MAT_NA_KHOA_BI_MAT } from '@lms/chung';

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
      ghiNhatKyHeThong: jest.fn().mockResolvedValue(undefined),
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

    it('phải che mặt nạ các khóa bí mật (API Key, mật khẩu SMTP) khi trả về cho trình duyệt', async () => {
      const giaTriMaHoa = dichVu.maHoaGiaTriBiMat('AIzaSySecretKey123456');
      (mockKhoCaiDat.layDanhSach as jest.Mock).mockResolvedValueOnce([
        {
          id: '99',
          khoa: 'tro_ly_ai.khoa_bi_mat_api',
          giaTri: giaTriMaHoa,
          nhom: 'tro_ly_ai',
          kieuDuLieu: 'CHUOI',
          congKhai: false,
          ngayTao: new Date(),
          ngayCapNhat: new Date(),
        },
      ]);

      const ketQua = await dichVu.layDanhSachCaiDat();
      expect(ketQua[0].giaTri).toBe(MAT_NA_KHOA_BI_MAT);
    });
  });

  describe('maHoaGiaTriBiMat & giaiMaGiaTriBiMat', () => {
    it('phải mã hóa AES-256-GCM và giải mã chính xác về giá trị gốc', () => {
      const goc = 'gsk_SuperSecretGroqKey987654321';
      const banMa = dichVu.maHoaGiaTriBiMat(goc);
      expect(banMa).toMatch(/^enc:v1:/);
      expect(banMa).not.toContain(goc);
      expect(dichVu.giaiMaGiaTriBiMat(banMa)).toBe(goc);
    });
  });

  describe('layBanDoCaiDatCongKhai', () => {
    it('phải trả về bản đồ key-value các cài đặt công khai và loại bỏ khóa bí mật', async () => {
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

  describe('capNhatNhieu & kiểm tra an toàn đầu vào', () => {
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

    it('phải bỏ qua không ghi đè nếu trình duyệt gửi lại chuỗi mặt nạ của khóa bí mật', async () => {
      (mockKhoCaiDat.capNhatNhieu as jest.Mock).mockResolvedValue(1);

      await dichVu.capNhatNhieu([
        { khoa: 'tro_ly_ai.khoa_bi_mat_api', giaTri: MAT_NA_KHOA_BI_MAT },
        { khoa: 'chung.ten_he_thong', giaTri: 'SmartClass AI Mới' },
      ]);

      expect(mockKhoCaiDat.capNhatNhieu).toHaveBeenCalledWith([
        { khoa: 'chung.ten_he_thong', giaTri: 'SmartClass AI Mới' },
      ]);
    });

    it('phải chặn địa chỉ nội bộ (SSRF) đối với máy chủ SMTP', async () => {
      await expect(
        dichVu.capNhatNhieu([{ khoa: 'email.may_chu_smtp', giaTri: '127.0.0.1' }]),
      ).rejects.toThrow(BadRequestException);

      await expect(
        dichVu.capNhatNhieu([{ khoa: 'email.may_chu_smtp', giaTri: '169.254.169.254' }]),
      ).rejects.toThrow(BadRequestException);
    });

    it('phải chặn giá trị số vượt ngoài khoảng min - max cho phép', async () => {
      await expect(
        dichVu.capNhatNhieu([{ khoa: 'hoc_vu.diem_dat_toi_thieu_he_10', giaTri: '15' }]),
      ).rejects.toThrow(BadRequestException);
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

  describe('layTuyChonCaNhan & capNhatTuyChonCaNhan', () => {
    it('phải trả về tùy chọn cá nhân mặc định nếu người dùng chưa từng lưu', async () => {
      (mockKhoCaiDat.layTheoKhoa as jest.Mock).mockResolvedValue(null);

      const tuyChon = await dichVu.layTuyChonCaNhan('user-123');
      expect(tuyChon.cheDoGiaoDien).toBe('sang');
      expect(tuyChon.phongHoc.batCameraKhiVaoPhong).toBe(false);
    });

    it('phải hợp nhất và lưu tùy chọn cá nhân cho người dùng', async () => {
      (mockKhoCaiDat.layTheoKhoa as jest.Mock).mockResolvedValue(null);
      (mockKhoCaiDat.capNhat as jest.Mock).mockResolvedValue({});

      const ketQua = await dichVu.capNhatTuyChonCaNhan('user-123', {
        cheDoGiaoDien: 'toi',
        anThongTinLienHeVoiLop: true,
      });

      expect(ketQua.cheDoGiaoDien).toBe('toi');
      expect(ketQua.anThongTinLienHeVoiLop).toBe(true);
      expect(mockKhoCaiDat.capNhat).toHaveBeenCalledTimes(1);
    });
  });

  describe('Kiểm thử phân quyền máy chủ (NhaMayQuyenHan) và nhãn dự phòng (taoNhanTamTuKhoa)', () => {
    it('chỉ cho phép QUAN_TRI_VIEN đọc và sửa CaiDatHeThong, từ chối BAN_GIAM_HIEU, GIAO_VU, GIAO_VIEN, HOC_SINH', () => {
      const { NhaMayQuyenHan } = require('../../phan-quyen/nha-may-quyen-han.factory');
      const { VaiTro, HanhDong, DoiTuong } = require('@lms/chung');
      const nhaMay = new NhaMayQuyenHan();

      const quyenAdmin = nhaMay.taoQuyenChoNguoiDung({
        sub: 'admin-1',
        email: 'admin@truong.edu.vn',
        vaiTro: VaiTro.QUAN_TRI_VIEN,
      });
      expect(quyenAdmin.can(HanhDong.Doc, DoiTuong.CaiDatHeThong)).toBe(true);
      expect(quyenAdmin.can(HanhDong.Sua, DoiTuong.CaiDatHeThong)).toBe(true);

      for (const vaiTroKhac of [
        VaiTro.BAN_GIAM_HIEU,
        VaiTro.GIAO_VU,
        VaiTro.GIAO_VIEN,
        VaiTro.HOC_SINH,
      ]) {
        const quyen = nhaMay.taoQuyenChoNguoiDung({
          sub: 'u-1',
          email: 'u@truong.edu.vn',
          vaiTro: vaiTroKhac,
        });
        expect(quyen.can(HanhDong.Doc, DoiTuong.CaiDatHeThong)).toBe(false);
        expect(quyen.can(HanhDong.Sua, DoiTuong.CaiDatHeThong)).toBe(false);
      }
    });

    it('taoNhanTamTuKhoa sinh nhãn tiếng Việt dễ đọc khi gặp khóa mới chưa định nghĩa', () => {
      const { taoNhanTamTuKhoa } = require('@lms/chung');
      expect(taoNhanTamTuKhoa('diem_danh.so_phut_tinh_di_muon')).toBe('Số phút tính là đi muộn');
      expect(taoNhanTamTuKhoa('nhom_moi.cau_hinh_thu_nghiem')).toBe('Cau hinh thu nghiem');
    });

    it('cho phép màu chủ đạo chuẩn Warm Minimal và chặn dải màu tím / indigo', async () => {
      (mockKhoCaiDat.capNhatNhieu as jest.Mock).mockResolvedValue([]);

      await expect(
        dichVu.capNhatNhieu(
          [{ khoa: 'giao_dien.mau_chu_dao', giaTri: '#0D9488' }],
          'admin-1',
        ),
      ).resolves.toBeDefined();

      await expect(
        dichVu.capNhatNhieu(
          [{ khoa: 'giao_dien.mau_chu_dao', giaTri: '#7C3AED' }],
          'admin-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});


