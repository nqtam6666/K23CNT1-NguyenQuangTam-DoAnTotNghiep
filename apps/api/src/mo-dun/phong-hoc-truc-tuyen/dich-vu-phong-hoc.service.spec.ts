import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DichVuPhongHoc } from './dich-vu-phong-hoc.service';
import { KhoPhongHoc } from './kho-phong-hoc.repository';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { VaiTro, PayloadJwt } from '@lms/chung';

describe('DichVuPhongHoc (Kiểm thử Lớp học trực tuyến LiveKit & Chống IDOR)', () => {
  let service: DichVuPhongHoc;
  let prisma: any;
  let khoPhongHoc: any;
  let configService: any;

  const mockTeacherPayload: PayloadJwt = {
    sub: 'user-gv-1',
    id: 'user-gv-1',
    email: 'giaovien1@lms.edu.vn',
    hoTen: 'Trần Văn Giáo Viên',
    vaiTro: VaiTro.GIAO_VIEN,
  };

  const mockOtherTeacherPayload: PayloadJwt = {
    sub: 'user-gv-2',
    id: 'user-gv-2',
    email: 'giaovien2@lms.edu.vn',
    hoTen: 'Nguyễn Văn Khác',
    vaiTro: VaiTro.GIAO_VIEN,
  };

  const mockStudentPayload: PayloadJwt = {
    sub: 'user-hs-1',
    id: 'user-hs-1',
    email: 'hocsinh1@lms.edu.vn',
    hoTen: 'Lê Hoàng Học Sinh',
    vaiTro: VaiTro.HOC_SINH,
  };

  const mockOtherStudentPayload: PayloadJwt = {
    sub: 'user-hs-2',
    id: 'user-hs-2',
    email: 'hocsinh2@lms.edu.vn',
    hoTen: 'Học Sinh Lạ',
    vaiTro: VaiTro.HOC_SINH,
  };

  const mockParentPayload: PayloadJwt = {
    sub: 'user-ph-1',
    id: 'user-ph-1',
    email: 'phuhuynh1@lms.edu.vn',
    hoTen: 'Phạm Văn Phụ Huynh',
    vaiTro: VaiTro.PHU_HUYNH,
  };

  const mockClassSection = {
    id: 'lop-1',
    maLopHocPhan: 'TOAN10_A1',
    tenLopHocPhan: 'Toán học 10 A1',
    idGiaoVien: 'profile-gv-1',
    giaoVien: {
      id: 'profile-gv-1',
      idNguoiDung: 'user-gv-1',
    },
    phongTrucTuyen: {
      id: 'phong-1',
      idLopHocPhan: 'lop-1',
      tenPhong: 'LHP_TOAN10_A1',
      dangMo: true,
    },
  };

  beforeEach(async () => {
    prisma = {
      lopHocPhan: {
        findUnique: jest.fn(),
      },
      hoSoHocSinh: {
        findUnique: jest.fn(),
      },
      ghiDanh: {
        findUnique: jest.fn(),
      },
      buoiHoc: {
        findUnique: jest.fn(),
      },
    };

    khoPhongHoc = {
      timPhongTheoLop: jest.fn(),
      taoPhong: jest.fn(),
      capNhatTrangThai: jest.fn(),
      timBuoiHocHienTai: jest.fn(),
      capNhatTrangThaiBuoiHoc: jest.fn(),
      ghiNhatKyVao: jest.fn(),
      ghiNhatKyRoi: jest.fn(),
      diemDanhHocSinh: jest.fn(),
      layNhatKyTheoBuoi: jest.fn(),
      layDanhSachDiemDanh: jest.fn(),
    };

    configService = {
      get: jest.fn((key: string) => {
        if (key === 'LIVEKIT_API_KEY') return 'devkey';
        if (key === 'LIVEKIT_API_SECRET') return 'secret_key_livekit_lms_2026';
        if (key === 'LIVEKIT_URL') return 'ws://localhost:7880';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DichVuPhongHoc,
        { provide: PrismaService, useValue: prisma },
        { provide: KhoPhongHoc, useValue: khoPhongHoc },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<DichVuPhongHoc>(DichVuPhongHoc);
  });

  describe('taoTokenTruyCap', () => {
    it('1. Nên báo lỗi NotFoundException nếu lớp học phần không tồn tại', async () => {
      prisma.lopHocPhan.findUnique.mockResolvedValue(null);

      await expect(
        service.taoTokenTruyCap('lop-khong-ton-tai', mockTeacherPayload),
      ).rejects.toThrow(NotFoundException);
    });

    it('2. Chống IDOR: Giáo viên lạ không được phép lấy token chủ trì của lớp học', async () => {
      prisma.lopHocPhan.findUnique.mockResolvedValue(mockClassSection);

      await expect(
        service.taoTokenTruyCap('lop-1', mockOtherTeacherPayload),
      ).rejects.toThrow(ForbiddenException);
    });

    it('3. Chống IDOR: Học sinh chưa ghi danh vào lớp bị từ chối cấp token', async () => {
      prisma.lopHocPhan.findUnique.mockResolvedValue(mockClassSection);
      prisma.hoSoHocSinh.findUnique.mockResolvedValue({ id: 'hs-profile-2' });
      prisma.ghiDanh.findUnique.mockResolvedValue(null); // Chưa ghi danh

      await expect(
        service.taoTokenTruyCap('lop-1', mockOtherStudentPayload),
      ).rejects.toThrow(ForbiddenException);
    });

    it('4. Phụ huynh không được phép tham gia phòng học trực tuyến', async () => {
      prisma.lopHocPhan.findUnique.mockResolvedValue(mockClassSection);

      await expect(
        service.taoTokenTruyCap('lop-1', mockParentPayload),
      ).rejects.toThrow(ForbiddenException);
    });

    it('5. Thành công cấp token CHU_TRI cho giáo viên phụ trách lớp', async () => {
      prisma.lopHocPhan.findUnique.mockResolvedValue(mockClassSection);

      const ketQua = await service.taoTokenTruyCap('lop-1', mockTeacherPayload);

      expect(ketQua).toBeDefined();
      expect(ketQua.vaiTroTrongPhong).toBe('CHU_TRI');
      expect(ketQua.tenPhong).toBe('LHP_TOAN10_A1');
      expect(typeof ketQua.token).toBe('string');
      expect(ketQua.urlMayChuLiveKit).toBe('ws://localhost:7880');
    });

    it('6. Thành công cấp token THAM_GIA cho học sinh đã ghi danh', async () => {
      prisma.lopHocPhan.findUnique.mockResolvedValue(mockClassSection);
      prisma.hoSoHocSinh.findUnique.mockResolvedValue({ id: 'hs-profile-1' });
      prisma.ghiDanh.findUnique.mockResolvedValue({
        id: 'gd-1',
        idLopHocPhan: 'lop-1',
        idHocSinh: 'hs-profile-1',
      });

      const ketQua = await service.taoTokenTruyCap('lop-1', mockStudentPayload);

      expect(ketQua).toBeDefined();
      expect(ketQua.vaiTroTrongPhong).toBe('THAM_GIA');
      expect(ketQua.tenPhong).toBe('LHP_TOAN10_A1');
      expect(typeof ketQua.token).toBe('string');
    });
  });

  describe('batTatPhongHoc', () => {
    it('7. Giáo viên phụ trách được phép mở hoặc đóng phòng học', async () => {
      khoPhongHoc.timPhongTheoLop.mockResolvedValue({
        id: 'phong-1',
        lopHocPhan: mockClassSection,
      });
      khoPhongHoc.capNhatTrangThai.mockResolvedValue({ id: 'phong-1', dangMo: true });

      const ketQua = await service.batTatPhongHoc('lop-1', true, mockTeacherPayload);
      expect(ketQua.dangMo).toBe(true);
      expect(khoPhongHoc.capNhatTrangThai).toHaveBeenCalledWith('phong-1', true);
    });

    it('8. Giáo viên không phụ trách lớp bị chặn khi cố mở phòng', async () => {
      khoPhongHoc.timPhongTheoLop.mockResolvedValue({
        id: 'phong-1',
        lopHocPhan: mockClassSection,
      });

      await expect(
        service.batTatPhongHoc('lop-1', true, mockOtherTeacherPayload),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
