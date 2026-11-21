import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DichVuPhongHoc } from './dich-vu-phong-hoc.service';
import { KhoPhongHoc } from './kho-phong-hoc.repository';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { DichVuCaiDatService } from '../cai-dat/dich-vu-cai-dat.service';
import { VaiTro, PayloadJwt, TrangThaiDiemDanh, PhuongThucDiemDanh } from '@lms/chung';

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
      phuHuynhHocSinh: {
        findMany: jest.fn(),
      },
      donXinNghi: {
        count: jest.fn().mockResolvedValue(0),
      },
      nhatKyHeThong: {
        create: jest.fn().mockResolvedValue({}),
      },
    };

    khoPhongHoc = {
      timPhongTheoLop: jest.fn(),
      taoPhong: jest.fn(),
      capNhatTrangThai: jest.fn(),
      timBuoiHocTheoId: jest.fn(),
      timBuoiHocHienTai: jest.fn(),
      capNhatTrangThaiBuoiHoc: jest.fn(),
      ghiNhatKyVao: jest.fn(),
      ghiNhatKyRoi: jest.fn(),
      diemDanhHocSinh: jest.fn(),
      layNhatKyTheoBuoi: jest.fn(),
      layDanhSachDiemDanh: jest.fn(),
      taoDonXinNghi: jest.fn(),
      capNhatTrangThaiDiemDanhKhuonMat: jest.fn(),
      timDuLieuKhuonMatTheoNguoiDung: jest.fn(),
      luuDuLieuKhuonMat: jest.fn(),
      xoaDuLieuKhuonMat: jest.fn(),
      layDanhSachKhuonMatTheoLop: jest.fn(),
    };

    configService = {
      get: jest.fn((key: string) => {
        if (key === 'LIVEKIT_API_KEY') return 'devkey';
        if (key === 'LIVEKIT_API_SECRET') return 'secret_key_livekit_lms_2026';
        if (key === 'LIVEKIT_URL') return 'ws://localhost:7880';
        return null;
      }),
    };

    const dichVuCaiDatMock = {
      layGiaTriSo: jest.fn(async (khoa: string, macDinh: number) => macDinh),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DichVuPhongHoc,
        { provide: PrismaService, useValue: prisma },
        { provide: KhoPhongHoc, useValue: khoPhongHoc },
        { provide: ConfigService, useValue: configService },
        { provide: DichVuCaiDatService, useValue: dichVuCaiDatMock },
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

      await expect(service.taoTokenTruyCap('lop-1', mockOtherTeacherPayload)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('3. Chống IDOR: Học sinh chưa ghi danh vào lớp bị từ chối cấp token', async () => {
      prisma.lopHocPhan.findUnique.mockResolvedValue(mockClassSection);
      prisma.hoSoHocSinh.findUnique.mockResolvedValue({ id: 'hs-profile-2' });
      prisma.ghiDanh.findUnique.mockResolvedValue(null); // Chưa ghi danh

      await expect(service.taoTokenTruyCap('lop-1', mockOtherStudentPayload)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('4. Phụ huynh không được phép tham gia phòng học trực tuyến', async () => {
      prisma.lopHocPhan.findUnique.mockResolvedValue(mockClassSection);

      await expect(service.taoTokenTruyCap('lop-1', mockParentPayload)).rejects.toThrow(
        ForbiddenException,
      );
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

      await expect(service.batTatPhongHoc('lop-1', true, mockOtherTeacherPayload)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('diemDanhThongMinh (Mã PIN 6 số & Đồng bộ tự động)', () => {
    it('9. Giáo viên phụ trách mở được mã điểm danh 6 chữ số có thời hạn, chặn giáo viên lạ (Anti-IDOR)', async () => {
      khoPhongHoc.timBuoiHocTheoId = jest.fn().mockResolvedValue({
        id: 'buoi-1',
        idLopHocPhan: 'lop-1',
        lopHocPhan: mockClassSection,
      });
      khoPhongHoc.capNhatMaDiemDanh = jest.fn().mockImplementation(async (id, ma, han) => ({
        id,
        maDiemDanh: ma,
        hanMaDiemDanh: han,
      }));

      await expect(
        service.moMaDiemDanhThongMinh('buoi-1', 5, mockOtherTeacherPayload),
      ).rejects.toThrow(ForbiddenException);

      const ketQua = await service.moMaDiemDanhThongMinh('buoi-1', 5, mockTeacherPayload);
      expect(ketQua.maDiemDanh).toMatch(/^\d{6}$/);
      expect(ketQua.hanMaDiemDanh).toBeInstanceOf(Date);
    });

    it('10. Học sinh trong lớp tự điểm danh thành công bằng mã PIN còn hạn, chặn học sinh ngoài lớp', async () => {
      khoPhongHoc.timBuoiHocTheoId = jest.fn().mockResolvedValue({
        id: 'buoi-1',
        idLopHocPhan: 'lop-1',
        maDiemDanh: '654321',
        hanMaDiemDanh: new Date(Date.now() + 5 * 60 * 1000),
      });
      prisma.hoSoHocSinh.findUnique.mockResolvedValue({ id: 'hs-profile-1' });
      prisma.ghiDanh.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.diemDanhBangMaThongMinh('buoi-1', '654321', mockOtherStudentPayload),
      ).rejects.toThrow(ForbiddenException);

      prisma.ghiDanh.findUnique.mockResolvedValueOnce({
        idLopHocPhan: 'lop-1',
        idHocSinh: 'hs-profile-1',
      });
      khoPhongHoc.diemDanhHocSinh.mockResolvedValue({
        idBuoiHoc: 'buoi-1',
        idHocSinh: 'hs-profile-1',
        trangThai: 'CO_MAT',
      });

      const ketQua = await service.diemDanhBangMaThongMinh(
        'buoi-1',
        '654321',
        mockStudentPayload,
      );
      expect(ketQua.trangThai).toBe('CO_MAT');
    });
  });

  describe('diemDanhKhuonMat (Đăng ký & Điểm danh bằng khuôn mặt + Anti-IDOR)', () => {
    const taoVector = (viTri = 0) => {
      const vec = new Array<number>(128).fill(0);
      vec[viTri] = 1;
      return vec;
    };

    it('11. Học sinh đăng ký khuôn mặt chuẩn hóa vector và không trả về vector thô khi xem hồ sơ', async () => {
      const vectorTho = new Array<number>(128).fill(2);
      khoPhongHoc.luuDuLieuKhuonMat.mockResolvedValue({
        id: 'km-1',
        idNguoiDung: mockStudentPayload.sub,
        vectorDacTrung: vectorTho,
        soMauChup: 3,
        diemChatLuong: 0.91,
        kichHoat: true,
        ngayDangKy: new Date('2026-11-14T00:00:00Z'),
        ngayCapNhat: new Date('2026-11-14T00:00:00Z'),
      });

      const ketQua = await service.dangKyKhuonMat(
        {
          vectorKhuonMat: vectorTho,
          soMauChup: 3,
          diemChatLuong: 0.91,
          daXacThucNguoiThat: true,
        },
        mockStudentPayload,
      );

      expect(khoPhongHoc.luuDuLieuKhuonMat).toHaveBeenCalledTimes(1);
      const vectorDaLuu = khoPhongHoc.luuDuLieuKhuonMat.mock.calls[0][1] as number[];
      const chuanL2 = Math.sqrt(vectorDaLuu.reduce((a, b) => a + b * b, 0));
      expect(chuanL2).toBeCloseTo(1, 4);
      expect(ketQua.daDangKy).toBe(true);
      expect((ketQua as any).vectorDacTrung).toBeUndefined();

      khoPhongHoc.timDuLieuKhuonMatTheoNguoiDung.mockResolvedValue({
        id: 'km-1',
        kichHoat: true,
        soMauChup: 3,
        diemChatLuong: 0.91,
        ngayDangKy: new Date('2026-11-14T00:00:00Z'),
        ngayCapNhat: new Date('2026-11-14T00:00:00Z'),
      });
      const hoSo = await service.layHoSoKhuonMatCaNhan(mockStudentPayload);
      expect(hoSo.daDangKy).toBe(true);
      expect((hoSo as any).vectorDacTrung).toBeUndefined();
    });

    it('12. Giáo viên phụ trách bật tắt được phiên khuôn mặt; giáo viên lạ bị chặn ForbiddenException', async () => {
      khoPhongHoc.timBuoiHocTheoId.mockResolvedValue({
        id: 'buoi-1',
        idLopHocPhan: 'lop-1',
        lopHocPhan: mockClassSection,
      });
      khoPhongHoc.capNhatTrangThaiDiemDanhKhuonMat.mockResolvedValue({
        id: 'buoi-1',
        batDiemDanhKhuonMat: true,
      });

      await expect(
        service.batTatDiemDanhKhuonMat(
          'buoi-1',
          { batDiemDanhKhuonMat: true, thoiHanPhut: 15 },
          mockOtherTeacherPayload,
        ),
      ).rejects.toThrow(ForbiddenException);

      const res = await service.batTatDiemDanhKhuonMat(
        'buoi-1',
        { batDiemDanhKhuonMat: true, thoiHanPhut: 15 },
        mockTeacherPayload,
      );
      expect(res.batDiemDanhKhuonMat).toBe(true);
    });

    it('13. Học sinh tự điểm danh khuôn mặt đúng giờ -> CO_MAT, đi muộn >15p -> DI_MUON, lệch mặt -> BadRequest', async () => {
      const vectorMau = taoVector(0);
      const vectorKhac = taoVector(5);

      prisma.hoSoHocSinh.findUnique.mockResolvedValue({ id: 'hs-profile-1' });
      prisma.ghiDanh.findUnique.mockResolvedValue({
        idLopHocPhan: 'lop-1',
        idHocSinh: 'hs-profile-1',
      });
      khoPhongHoc.timDuLieuKhuonMatTheoNguoiDung.mockResolvedValue({
        id: 'km-1',
        kichHoat: true,
        vectorDacTrung: vectorMau,
      });
      khoPhongHoc.diemDanhHocSinh.mockImplementation(
        async (idBuoiHoc, idHocSinh, trangThai, ghiChu, phuongThuc, doTinCay) => ({
          id: 'dd-1',
          idBuoiHoc,
          idHocSinh,
          trangThai,
          ghiChu,
          phuongThuc,
          doTinCay,
          ngayDiemDanh: new Date(),
        }),
      );

      // Trường hợp 1: Đúng giờ -> CO_MAT
      khoPhongHoc.timBuoiHocTheoId.mockResolvedValueOnce({
        id: 'buoi-1',
        idLopHocPhan: 'lop-1',
        thoiGianBD: new Date(Date.now() - 5 * 60 * 1000),
        batDiemDanhKhuonMat: true,
        hanDiemDanhKhuonMat: new Date(Date.now() + 10 * 60 * 1000),
      });

      const kqDungGio = await service.diemDanhBangKhuonMat(
        'buoi-1',
        { vectorKhuonMat: vectorMau, diemChatLuong: 0.9, daXacThucNguoiThat: true },
        mockStudentPayload,
      );
      expect(kqDungGio.trangThai).toBe(TrangThaiDiemDanh.CO_MAT);
      expect(kqDungGio.doTuongDong).toBe(1);
      expect(khoPhongHoc.diemDanhHocSinh).toHaveBeenCalledWith(
        'buoi-1',
        'hs-profile-1',
        TrangThaiDiemDanh.CO_MAT,
        expect.any(String),
        PhuongThucDiemDanh.KHUON_MAT,
        1,
      );

      // Trường hợp 2: Quá 15 phút -> DI_MUON
      khoPhongHoc.timBuoiHocTheoId.mockResolvedValueOnce({
        id: 'buoi-1',
        idLopHocPhan: 'lop-1',
        thoiGianBD: new Date(Date.now() - 25 * 60 * 1000),
        batDiemDanhKhuonMat: true,
        hanDiemDanhKhuonMat: new Date(Date.now() + 10 * 60 * 1000),
      });
      const kqDiMuon = await service.diemDanhBangKhuonMat(
        'buoi-1',
        { vectorKhuonMat: vectorMau, diemChatLuong: 0.9, daXacThucNguoiThat: true },
        mockStudentPayload,
      );
      expect(kqDiMuon.trangThai).toBe(TrangThaiDiemDanh.DI_MUON);

      // Trường hợp 3: Khuôn mặt không khớp -> BadRequestException
      khoPhongHoc.timBuoiHocTheoId.mockResolvedValueOnce({
        id: 'buoi-1',
        idLopHocPhan: 'lop-1',
        thoiGianBD: new Date(Date.now() - 5 * 60 * 1000),
        batDiemDanhKhuonMat: true,
        hanDiemDanhKhuonMat: new Date(Date.now() + 10 * 60 * 1000),
      });
      await expect(
        service.diemDanhBangKhuonMat(
          'buoi-1',
          { vectorKhuonMat: vectorKhac, diemChatLuong: 0.9, daXacThucNguoiThat: true },
          mockStudentPayload,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('14. Camera lớp học lọc học sinh hợp lệ theo ngưỡng và chặn giáo viên lạ lấy dữ liệu khuôn mặt lớp', async () => {
      prisma.lopHocPhan.findUnique.mockResolvedValue(mockClassSection);
      await expect(
        service.layDanhSachKhuonMatLop('lop-1', mockOtherTeacherPayload),
      ).rejects.toThrow(ForbiddenException);

      khoPhongHoc.layDanhSachKhuonMatTheoLop.mockResolvedValue([
        {
          hocSinh: {
            id: 'hs-1',
            maHocSinh: 'HS001',
            nguoiDung: {
              id: 'user-hs-1',
              hoTen: 'Lê Hoàng Học Sinh',
              anhDaiDien: null,
              duLieuKhuonMat: { vectorDacTrung: taoVector(0) },
            },
          },
        },
        {
          hocSinh: {
            id: 'hs-2',
            maHocSinh: 'HS002',
            nguoiDung: {
              id: 'user-hs-2',
              hoTen: 'Chưa đăng ký',
              anhDaiDien: null,
              duLieuKhuonMat: null,
            },
          },
        },
      ]);

      const dsLop = await service.layDanhSachKhuonMatLop('lop-1', mockTeacherPayload);
      expect(dsLop).toHaveLength(1);
      expect(dsLop[0].idHocSinh).toBe('hs-1');

      khoPhongHoc.timBuoiHocTheoId.mockResolvedValue({
        id: 'buoi-1',
        idLopHocPhan: 'lop-1',
        thoiGianBD: new Date(),
        lopHocPhan: mockClassSection,
      });
      prisma.ghiDanh.findMany = jest.fn().mockResolvedValue([{ idHocSinh: 'hs-1' }]);
      khoPhongHoc.diemDanhHocSinh.mockResolvedValue({ id: 'dd-batch-1' });

      const kqLop = await service.diemDanhKhuonMatTheoLop(
        'buoi-1',
        {
          danhSachNhanDien: [
            { idHocSinh: 'hs-1', doTinCay: 0.92 },
            { idHocSinh: 'hs-la-ngoai-lop', doTinCay: 0.99 },
          ],
        },
        mockTeacherPayload,
      );
      expect(kqLop.soLuongCapNhat).toBe(1);
      expect(khoPhongHoc.diemDanhHocSinh).toHaveBeenCalledWith(
        'buoi-1',
        'hs-1',
        TrangThaiDiemDanh.CO_MAT,
        expect.any(String),
        PhuongThucDiemDanh.KHUON_MAT,
        0.92,
      );
    });
  });

  describe('BaoVeAntiIDOR (Khắc phục lỗ hổng kiểm quyền điểm danh & chuyên cần)', () => {
    it('15. diemDanhThuCong chặn giáo viên không phụ trách lớp và học sinh ngoài lớp', async () => {
      khoPhongHoc.timBuoiHocTheoId.mockResolvedValue({
        id: 'buoi-1',
        idLopHocPhan: 'lop-1',
        lopHocPhan: mockClassSection,
      });

      await expect(
        service.diemDanhThuCong(
          'buoi-1',
          'hs-1',
          TrangThaiDiemDanh.CO_MAT,
          undefined,
          mockOtherTeacherPayload,
        ),
      ).rejects.toThrow(ForbiddenException);

      prisma.ghiDanh.findUnique.mockResolvedValue(null);
      await expect(
        service.diemDanhThuCong(
          'buoi-1',
          'hs-ngoai-lop',
          TrangThaiDiemDanh.CO_MAT,
          undefined,
          mockTeacherPayload,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('16. layThongKeChuyenCanLop chặn giáo viên lạ, học sinh ngoài lớp và chỉ trả dòng của chính học sinh đó', async () => {
      prisma.lopHocPhan.findUnique.mockResolvedValue({
        ...mockClassSection,
        cacBuoiHoc: [],
        danhSachGhiDanh: [
          {
            idHocSinh: 'hs-profile-1',
            hocSinh: {
              id: 'hs-profile-1',
              maHocSinh: 'HS001',
              nguoiDung: { id: 'user-hs-1', hoTen: 'HS 1', email: 'hs1@lms.vn', anhDaiDien: null },
              lopHanhChinh: null,
            },
          },
          {
            idHocSinh: 'hs-profile-2',
            hocSinh: {
              id: 'hs-profile-2',
              maHocSinh: 'HS002',
              nguoiDung: { id: 'user-hs-2', hoTen: 'HS 2', email: 'hs2@lms.vn', anhDaiDien: null },
              lopHanhChinh: null,
            },
          },
        ],
      });

      await expect(
        service.layThongKeChuyenCanLop('lop-1', mockOtherTeacherPayload),
      ).rejects.toThrow(ForbiddenException);

      prisma.hoSoHocSinh.findUnique.mockResolvedValue({ id: 'hs-profile-1' });
      const thongKeHs = await service.layThongKeChuyenCanLop('lop-1', mockStudentPayload);
      expect(thongKeHs.danhSachHocSinh).toHaveLength(1);
      expect(thongKeHs.danhSachHocSinh[0].idHocSinh).toBe('hs-profile-1');

      prisma.hoSoHocSinh.findUnique.mockResolvedValue({ id: 'hs-profile-999' });
      await expect(
        service.layThongKeChuyenCanLop('lop-1', mockOtherStudentPayload),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
