import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DichVuSoDiemService } from './dich-vu-so-diem.service';
import { KhoSoDiemRepository } from './kho-so-diem.repository';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { DichVuLlmService } from '../tro-ly-ai/dich-vu-llm.service';
import {
  VaiTro,
  TrangThaiDiemDanh,
  CheDoKiemTra,
  PayloadJwt,
} from '@lms/chung';

describe('DichVuSoDiemService (Kiểm thử Unit & Chống IDOR Quản lý Kết quả Học phần)', () => {
  let service: DichVuSoDiemService;

  const mockKhoSoDiem = {
    layCotDiemTheoLop: jest.fn(),
    timCotDiemTheoId: jest.fn(),
    taoCotDiem: jest.fn(),
    xoaCotDiem: jest.fn(),
    luuDiemHangLoat: jest.fn(),
  };

  const mockPrisma = {
    lopHocPhan: {
      findUnique: jest.fn(),
    },
    hoSoHocSinh: {
      findUnique: jest.fn(),
    },
    cotDiem: {
      create: jest.fn(),
    },
    nhatKySuDungAI: {
      create: jest.fn(),
    },
    banNhapAI: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockDichVuLlm = {
    sinhVanBan: jest.fn(),
  };

  const gvPhuTrach: PayloadJwt = {
    id: 'user-gv-1',
    sub: 'user-gv-1',
    email: 'gv1@lms.edu.vn',
    hoTen: 'Giáo viên Phụ trách',
    vaiTro: VaiTro.GIAO_VIEN,
  };

  const gvKhacLop: PayloadJwt = {
    id: 'user-gv-2',
    sub: 'user-gv-2',
    email: 'gv2@lms.edu.vn',
    hoTen: 'Giáo viên Khác lớp',
    vaiTro: VaiTro.GIAO_VIEN,
  };

  const hs1: PayloadJwt = {
    id: 'user-hs-1',
    sub: 'user-hs-1',
    email: 'hs1@lms.edu.vn',
    hoTen: 'Nguyễn Văn An',
    vaiTro: VaiTro.HOC_SINH,
  };

  const hsNgoaiLop: PayloadJwt = {
    id: 'user-hs-ngoai',
    sub: 'user-hs-ngoai',
    email: 'hsngoai@lms.edu.vn',
    hoTen: 'Trần Văn Ngoài',
    vaiTro: VaiTro.HOC_SINH,
  };

  const cotDiemMau = [
    {
      id: 'cot-cc',
      idLopHocPhan: 'lop-1',
      tenCotDiem: 'Chuyên cần',
      heSo: 1,
      ngayTao: new Date(),
      danhSachDiem: [
        { id: 'd-1', idHocSinh: 'hs-1', giaTri: 9.0, ghiChu: null },
        { id: 'd-2', idHocSinh: 'hs-2', giaTri: 6.0, ghiChu: null },
      ],
    },
    {
      id: 'cot-ck',
      idLopHocPhan: 'lop-1',
      tenCotDiem: 'Cuối kỳ',
      heSo: 3,
      ngayTao: new Date(),
      danhSachDiem: [
        { id: 'd-3', idHocSinh: 'hs-1', giaTri: 8.5, ghiChu: null },
        { id: 'd-4', idHocSinh: 'hs-2', giaTri: 3.0, ghiChu: null },
      ],
    },
  ];

  const lopDayDuMau = {
    id: 'lop-1',
    maLopHocPhan: 'AI-K23-01',
    tenLopHocPhan: 'Trí tuệ nhân tạo - K23CNT1',
    idGiaoVien: 'hoso-gv-1',
    monHoc: { soTinChi: 3 },
    giaoVien: { id: 'hoso-gv-1', idNguoiDung: 'user-gv-1' },
    cacBuoiHoc: [
      {
        id: 'buoi-1',
        banGhiDiemDanh: [
          { idHocSinh: 'hs-1', trangThai: TrangThaiDiemDanh.CO_MAT },
          { idHocSinh: 'hs-2', trangThai: TrangThaiDiemDanh.VANG_KHONG_PHEP },
        ],
      },
    ],
    danhSachGhiDanh: [
      {
        hocSinh: {
          id: 'hs-1',
          idNguoiDung: 'user-hs-1',
          maHocSinh: '2310900001',
          nguoiDung: {
            id: 'user-hs-1',
            hoTen: 'Nguyễn Văn An',
            email: 'hs1@lms.edu.vn',
            anhDaiDien: null,
          },
          lopHanhChinh: { maLop: 'K23CNT1', tenLop: 'K23 Công nghệ thông tin 1' },
        },
      },
      {
        hocSinh: {
          id: 'hs-2',
          idNguoiDung: 'user-hs-2',
          maHocSinh: '2310900002',
          nguoiDung: {
            id: 'user-hs-2',
            hoTen: 'Lê Thị Bình',
            email: 'hs2@lms.edu.vn',
            anhDaiDien: null,
          },
          lopHanhChinh: { maLop: 'K23CNT1', tenLop: 'K23 Công nghệ thông tin 1' },
        },
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DichVuSoDiemService,
        { provide: KhoSoDiemRepository, useValue: mockKhoSoDiem },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: DichVuLlmService, useValue: mockDichVuLlm },
      ],
    }).compile();

    service = module.get<DichVuSoDiemService>(DichVuSoDiemService);
    jest.clearAllMocks();
  });

  describe('1. Tính điểm học phần (Hệ 10, Hệ 4, Điểm chữ) & Bảo mật chống IDOR', () => {
    it('Giáo viên phụ trách xem được toàn bộ bảng điểm lớp kèm thống kê quy đổi GPA chính xác', async () => {
      mockPrisma.lopHocPhan.findUnique.mockResolvedValue(lopDayDuMau);
      mockKhoSoDiem.layCotDiemTheoLop.mockResolvedValue(cotDiemMau);

      const bangDiem = await service.layBangDiemLopHocPhan('lop-1', gvPhuTrach);

      expect(bangDiem.danhSachHocSinh).toHaveLength(2);
      // Học sinh 1: (9.0*1 + 8.5*3)/4 = 8.63 -> Điểm A, Hệ 4 = 4.0, Qua môn
      expect(bangDiem.danhSachHocSinh[0].diemTrungBinhHe10).toBe(8.63);
      expect(bangDiem.danhSachHocSinh[0].diemChu).toBe('A');
      expect(bangDiem.danhSachHocSinh[0].diemTrungBinhHe4).toBe(4.0);
      expect(bangDiem.danhSachHocSinh[0].datQuaMon).toBe(true);

      // Học sinh 2: (6.0*1 + 3.0*3)/4 = 3.75 -> Điểm F, Hệ 4 = 0.0, Không đạt
      expect(bangDiem.danhSachHocSinh[1].diemTrungBinhHe10).toBe(3.75);
      expect(bangDiem.danhSachHocSinh[1].diemChu).toBe('F');
      expect(bangDiem.danhSachHocSinh[1].datQuaMon).toBe(false);
    });

    it('Học sinh trong lớp chỉ nhìn thấy duy nhất dòng điểm của chính mình (Chống lộ điểm cá nhân)', async () => {
      mockPrisma.lopHocPhan.findUnique.mockResolvedValue(lopDayDuMau);
      mockPrisma.hoSoHocSinh.findUnique.mockResolvedValue({
        id: 'hs-1',
        idNguoiDung: 'user-hs-1',
      });
      mockKhoSoDiem.layCotDiemTheoLop.mockResolvedValue(cotDiemMau);

      const bangDiem = await service.layBangDiemLopHocPhan('lop-1', hs1);

      expect(bangDiem.danhSachHocSinh).toHaveLength(1);
      expect(bangDiem.danhSachHocSinh[0].idHocSinh).toBe('hs-1');
    });

    it('Chặn học sinh ngoài lớp và giáo viên không phụ trách truy cập sổ điểm (Anti-IDOR)', async () => {
      mockPrisma.lopHocPhan.findUnique.mockResolvedValue(lopDayDuMau);
      mockPrisma.hoSoHocSinh.findUnique.mockResolvedValue({
        id: 'hs-ngoai',
        idNguoiDung: 'user-hs-ngoai',
      });

      await expect(service.layBangDiemLopHocPhan('lop-1', hsNgoaiLop)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.layBangDiemLopHocPhan('lop-1', gvKhacLop)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('2. Đồng bộ tự động điểm Chuyên cần, Luyện tập và Thi thử vào Sổ điểm', () => {
    it('Tổng hợp chính xác điểm từ Điểm danh, Bài nộp và Lượt làm bài kiểm tra', async () => {
      mockPrisma.lopHocPhan.findUnique.mockResolvedValue({
        ...lopDayDuMau,
        danhSachGhiDanh: [lopDayDuMau.danhSachGhiDanh[0]],
        cacBaiTap: [
          {
            id: 'bt-1',
            diemToiDa: 10,
            cacBaiNop: [{ idNguoiDung: 'user-hs-1', diemSo: 8.0 }],
          },
        ],
        cacBaiKiemTra: [
          {
            id: 'kt-lt',
            cheDo: CheDoKiemTra.LUYEN_TAP,
            diemToiDa: 10,
            cacLuotLam: [{ idHocSinh: 'hs-1', diemSo: 9.0 }],
          },
          {
            id: 'kt-tt',
            cheDo: CheDoKiemTra.THI_THU,
            diemToiDa: 10,
            cacLuotLam: [{ idHocSinh: 'hs-1', diemSo: 8.5 }],
          },
        ],
      });

      mockKhoSoDiem.layCotDiemTheoLop.mockResolvedValue([
        { id: 'cot-cc', tenCotDiem: 'Chuyên cần', heSo: 1, danhSachDiem: [] },
        { id: 'cot-qt', tenCotDiem: 'Luyện tập & Bài tập', heSo: 2, danhSachDiem: [] },
        { id: 'cot-gk', tenCotDiem: 'Giữa kỳ (Thi thử)', heSo: 2, danhSachDiem: [] },
      ]);
      mockKhoSoDiem.luuDiemHangLoat.mockResolvedValue([]);

      const ketQua = await service.dongBoDiemTuDong('lop-1', gvPhuTrach);

      expect(ketQua.soLuongDongBo).toBe(3);
      expect(mockKhoSoDiem.luuDiemHangLoat).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ idCotDiem: 'cot-cc', idHocSinh: 'hs-1', giaTri: 10 }),
          expect.objectContaining({ idCotDiem: 'cot-qt', idHocSinh: 'hs-1', giaTri: 8.5 }),
          expect.objectContaining({ idCotDiem: 'cot-gk', idHocSinh: 'hs-1', giaTri: 8.5 }),
        ]),
      );
    });
  });

  describe('3. Nhận xét học phần bằng AI & Lưu vết BanNhapAI (Rule 04)', () => {
    it('Sinh nhận xét học thuật, lưu NhatKySuDungAI và tạo BanNhapAI ở trạng thái CHO_DUYET', async () => {
      mockPrisma.lopHocPhan.findUnique.mockResolvedValue(lopDayDuMau);
      mockKhoSoDiem.layCotDiemTheoLop.mockResolvedValue(cotDiemMau);

      const nhanXet = await service.sinhNhanXetHocPhanAI('lop-1', 'hs-1', gvPhuTrach);

      expect(nhanXet.hoTen).toBe('Nguyễn Văn An');
      expect(nhanXet.diemChu).toBe('A');
      expect(nhanXet.diemManh.length).toBeGreaterThan(0);
      expect(mockPrisma.nhatKySuDungAI.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            idNguoiDung: 'user-gv-1',
            loaiTacVu: 'NHAN_XET_KET_QUA_HOC_PHAN',
          }),
        }),
      );
      expect(mockPrisma.banNhapAI.create).toHaveBeenCalled();
    });
  });
});
