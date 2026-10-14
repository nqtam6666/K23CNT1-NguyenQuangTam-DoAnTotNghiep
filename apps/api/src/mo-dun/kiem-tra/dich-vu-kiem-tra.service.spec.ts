import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { DichVuKiemTraService } from './dich-vu-kiem-tra.service';
import { KhoKiemTraRepository } from './kho-kiem-tra.repository';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { DichVuLlmService } from '../tro-ly-ai/dich-vu-llm.service';
import {
  VaiTro,
  CheDoKiemTra,
  TrangThaiBaiKiemTra,
  LoaiCauHoi,
  PayloadJwt,
} from '@lms/chung';

describe('DichVuKiemTraService (Kiểm thử Unit & Chống IDOR Luyện tập / Thi thử AI)', () => {
  let service: DichVuKiemTraService;

  const mockKhoKiemTra = {
    layDanhSachTheoLop: jest.fn(),
    timTheoId: jest.fn(),
    taoBaiKiemTra: jest.fn(),
    capNhatTrangThai: jest.fn(),
    xoaBaiKiemTra: jest.fn(),
    layLuotLamCuaHocSinh: jest.fn(),
    layTatCaLuotLamTheoBai: jest.fn(),
    layLuotLamTheoDanhSachBai: jest.fn(),
    taoLuotLamBai: jest.fn(),
  };

  const mockPrisma = {
    lopHocPhan: {
      findUnique: jest.fn(),
    },
    hoSoHocSinh: {
      findUnique: jest.fn(),
    },
    ghiDanh: {
      findUnique: jest.fn(),
    },
    doanTaiLieu: {
      findMany: jest.fn(),
    },
    nhatKySuDungAI: {
      create: jest.fn(),
    },
    banNhapAI: {
      create: jest.fn(),
    },
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
    hoTen: 'Giáo viên Lớp khác',
    vaiTro: VaiTro.GIAO_VIEN,
  };

  const hsTrongLop: PayloadJwt = {
    id: 'user-hs-1',
    sub: 'user-hs-1',
    email: 'hs1@lms.edu.vn',
    hoTen: 'Học sinh Trong lớp',
    vaiTro: VaiTro.HOC_SINH,
  };

  const hsNgoaiLop: PayloadJwt = {
    id: 'user-hs-2',
    sub: 'user-hs-2',
    email: 'hs2@lms.edu.vn',
    hoTen: 'Học sinh Ngoài lớp',
    vaiTro: VaiTro.HOC_SINH,
  };

  const lopMau = {
    id: 'lop-1',
    tenLopHocPhan: 'Trí tuệ nhân tạo - K23CNT1',
    idGiaoVien: 'hoso-gv-1',
    monHoc: { tenMonHoc: 'Trí tuệ nhân tạo' },
    giaoVien: { id: 'hoso-gv-1', idNguoiDung: 'user-gv-1' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DichVuKiemTraService,
        { provide: KhoKiemTraRepository, useValue: mockKhoKiemTra },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: DichVuLlmService, useValue: mockDichVuLlm },
      ],
    }).compile();

    service = module.get<DichVuKiemTraService>(DichVuKiemTraService);
    jest.clearAllMocks();
  });

  describe('1. Kiểm soát quyền truy cập & Chống IDOR theo lớp học phần', () => {
    it('Chặn học sinh chưa ghi danh vào lớp học phần xem danh sách bài kiểm tra (Anti-IDOR)', async () => {
      mockPrisma.lopHocPhan.findUnique.mockResolvedValue(lopMau);
      mockPrisma.hoSoHocSinh.findUnique.mockResolvedValue({ id: 'hoso-hs-2', idNguoiDung: 'user-hs-2' });
      mockPrisma.ghiDanh.findUnique.mockResolvedValue(null);

      await expect(service.layDanhSachTheoLop('lop-1', hsNgoaiLop)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('Chặn giáo viên không phụ trách lớp xem danh sách đề hoặc tạo đề trong lớp của giáo viên khác', async () => {
      mockPrisma.lopHocPhan.findUnique.mockResolvedValue(lopMau);

      await expect(service.layDanhSachTheoLop('lop-1', gvKhacLop)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(
        service.taoBaiKiemTra(
          'lop-1',
          {
            tieuDe: 'Đề kiểm tra trái phép',
            cheDo: CheDoKiemTra.LUYEN_TAP,
            trangThai: TrangThaiBaiKiemTra.DANG_MO,
            thoiGianLamPhut: 15,
            soLuotToiDa: 3,
            diemToiDa: 10,
            tronCauHoi: true,
            hienDapAnNgay: true,
            danhSachCauHoi: [],
          },
          gvKhacLop,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Ẩn đáp án đúng (dapAnDung) và lời giải (giaiThich) khi học sinh lấy chi tiết đề để làm bài', async () => {
      mockPrisma.lopHocPhan.findUnique.mockResolvedValue(lopMau);
      mockPrisma.hoSoHocSinh.findUnique.mockResolvedValue({ id: 'hoso-hs-1', idNguoiDung: 'user-hs-1' });
      mockPrisma.ghiDanh.findUnique.mockResolvedValue({ idLopHocPhan: 'lop-1', idHocSinh: 'hoso-hs-1' });
      mockKhoKiemTra.timTheoId.mockResolvedValue({
        id: 'bai-1',
        idLopHocPhan: 'lop-1',
        tieuDe: 'Đề thi thử Chương 1',
        cacCauHoi: [
          {
            id: 'ch-1',
            idBaiKiemTra: 'bai-1',
            thuTu: 1,
            noiDung: 'Thuật toán A* sử dụng hàm đánh giá nào?',
            loaiCauHoi: LoaiCauHoi.TRAC_NGHIEM_MOT_DAP_AN,
            cacPhuongAn: [
              { ma: 'A', noiDung: 'f(n) = g(n) + h(n)' },
              { ma: 'B', noiDung: 'f(n) = g(n)' },
            ],
            dapAnDung: 'A',
            giaiThich: 'Hàm f(n) kết hợp chi phí thực tế g(n) và heuristic h(n).',
            diemCau: 10,
            ngayTao: new Date(),
          },
        ],
      });
      mockKhoKiemTra.layLuotLamCuaHocSinh.mockResolvedValue([]);

      const ketQua = await service.layChiTietBaiKiemTra('bai-1', hsTrongLop);
      expect(ketQua.cacCauHoi).toHaveLength(1);
      expect((ketQua.cacCauHoi[0] as any).dapAnDung).toBeUndefined();
      expect((ketQua.cacCauHoi[0] as any).giaiThich).toBeUndefined();
    });
  });

  describe('2. Biên soạn đề Luyện tập / Thi thử tự động bằng AI (Rule 04)', () => {
    it('Pre-filtering đoạn tài liệu theo đúng idLopHocPhan, ghi NhatKySuDungAI và BanNhapAI khi sinh đề', async () => {
      mockPrisma.lopHocPhan.findUnique.mockResolvedValue(lopMau);
      mockPrisma.doanTaiLieu.findMany.mockResolvedValue([
        {
          noiDung: 'Mạng nơ-ron nhân tạo gồm tầng đầu vào, tầng ẩn và tầng đầu ra.',
          taiLieu: { tieuDe: 'Bài giảng Chương 3' },
        },
      ]);
      mockDichVuLlm.sinhVanBan.mockResolvedValue({
        vanBan: JSON.stringify([
          {
            noiDung: 'Cấu trúc cơ bản của mạng nơ-ron gồm những tầng nào?',
            cacPhuongAn: [
              { ma: 'A', noiDung: 'Tầng đầu vào, tầng ẩn và tầng đầu ra' },
              { ma: 'B', noiDung: 'Chỉ có tầng đầu vào' },
              { ma: 'C', noiDung: 'Chỉ có tầng đầu ra' },
              { ma: 'D', noiDung: 'Không có tầng nào' },
            ],
            dapAnDung: 'A',
            giaiThich: 'Theo tài liệu Chương 3.',
          },
        ]),
        soLuongTokenUocTinh: 320,
      });
      mockKhoKiemTra.taoBaiKiemTra.mockImplementation(async (_idLop, dto) => ({
        id: 'bai-ai-1',
        ...dto,
        cacCauHoi: dto.danhSachCauHoi,
      }));

      const ketQua = await service.sinhDeKiemTraBangAI(
        'lop-1',
        {
          tieuDe: 'Luyện tập Mạng nơ-ron',
          chuDe: 'Mạng nơ-ron nhân tạo',
          cheDo: CheDoKiemTra.LUYEN_TAP,
          soLuongCau: 1,
          thoiGianLamPhut: 15,
          soLuotToiDa: 5,
        },
        gvPhuTrach,
      );

      expect(mockPrisma.doanTaiLieu.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { idLopHocPhan: 'lop-1' },
        }),
      );
      expect(mockPrisma.nhatKySuDungAI.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            idNguoiDung: 'user-gv-1',
            loaiTacVu: 'TAO_DE_KIEM_TRA',
          }),
        }),
      );
      expect(mockPrisma.banNhapAI.create).toHaveBeenCalled();
      expect(ketQua.cacCauHoi).toHaveLength(1);
      expect(ketQua.cacCauHoi[0].dapAnDung).toBe('A');
    });
  });

  describe('3. Nộp bài, chấm điểm tự động & giới hạn số lượt làm bài Thi thử', () => {
    const baiThiThuMau = {
      id: 'bai-thi-1',
      idLopHocPhan: 'lop-1',
      tieuDe: 'Thi thử giữa kỳ',
      cheDo: CheDoKiemTra.THI_THU,
      trangThai: TrangThaiBaiKiemTra.DANG_MO,
      soLuotToiDa: 1,
      diemToiDa: 10,
      cacCauHoi: [
        {
          id: 'c1',
          thuTu: 1,
          noiDung: 'Câu hỏi 1',
          dapAnDung: 'A',
          diemCau: 5,
          giaiThich: 'Giải thích 1',
        },
        {
          id: 'c2',
          thuTu: 2,
          noiDung: 'Câu hỏi 2',
          dapAnDung: 'C',
          diemCau: 5,
          giaiThich: 'Giải thích 2',
        },
      ],
    };

    it('Chấm điểm chính xác trên thang 10 và sinh nhận xét hướng dẫn học tập khi nộp bài', async () => {
      mockKhoKiemTra.timTheoId.mockResolvedValue(baiThiThuMau);
      mockPrisma.lopHocPhan.findUnique.mockResolvedValue(lopMau);
      mockPrisma.hoSoHocSinh.findUnique.mockResolvedValue({ id: 'hoso-hs-1', idNguoiDung: 'user-hs-1' });
      mockPrisma.ghiDanh.findUnique.mockResolvedValue({ idLopHocPhan: 'lop-1', idHocSinh: 'hoso-hs-1' });
      mockKhoKiemTra.layLuotLamCuaHocSinh.mockResolvedValue([]);
      mockKhoKiemTra.taoLuotLamBai.mockImplementation(async (data) => ({
        id: 'luot-1',
        ...data,
      }));

      const ketQua = await service.nopBaiKiemTra(
        'bai-thi-1',
        {
          thoiLuongGiay: 180,
          danhSachTraLoi: [
            { idCauHoi: 'c1', dapAnChon: 'A' },
            { idCauHoi: 'c2', dapAnChon: 'B' },
          ],
        },
        hsTrongLop,
      );

      expect(ketQua.soCauDung).toBe(1);
      expect(ketQua.tongSoCau).toBe(2);
      expect(ketQua.diemSo).toBe(5);
      expect(ketQua.nhanXetAI).toContain('5/10');
    });

    it('Chặn học sinh nộp thêm khi đã hết số lượt cho phép của chế độ THI_THU', async () => {
      mockKhoKiemTra.timTheoId.mockResolvedValue(baiThiThuMau);
      mockPrisma.lopHocPhan.findUnique.mockResolvedValue(lopMau);
      mockPrisma.hoSoHocSinh.findUnique.mockResolvedValue({ id: 'hoso-hs-1', idNguoiDung: 'user-hs-1' });
      mockPrisma.ghiDanh.findUnique.mockResolvedValue({ idLopHocPhan: 'lop-1', idHocSinh: 'hoso-hs-1' });
      mockKhoKiemTra.layLuotLamCuaHocSinh.mockResolvedValue([{ id: 'luot-da-lam-1', diemSo: 8 }]);

      await expect(
        service.nopBaiKiemTra(
          'bai-thi-1',
          {
            thoiLuongGiay: 120,
            danhSachTraLoi: [{ idCauHoi: 'c1', dapAnChon: 'A' }],
          },
          hsTrongLop,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
