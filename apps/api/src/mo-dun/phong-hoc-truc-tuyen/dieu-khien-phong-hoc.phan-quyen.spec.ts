import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { DieuKhienPhongHoc } from './dieu-khien-phong-hoc.controller';
import { DichVuPhongHoc } from './dich-vu-phong-hoc.service';
import { KhoPhongHoc } from './kho-phong-hoc.repository';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { DichVuCaiDatService } from '../cai-dat/dich-vu-cai-dat.service';
import { NhaMayQuyenHan } from '../../phan-quyen/nha-may-quyen-han.factory';
import { PhanQuyenCaslGuard } from '../../phan-quyen/phan-quyen-casl.guard';
import { XacThucJwtGuard } from '../xac-thuc/ve-si/jwt-auth.guard';
import { PayloadJwt, VaiTro, TrangThaiDiemDanh } from '@lms/chung';

const UUID_LOP = '11111111-1111-4111-8111-111111111111';
const UUID_BUOI = '22222222-2222-4222-8222-222222222222';
const UUID_HS_TRONG_LOP = '33333333-3333-4333-8333-333333333333';

function taoVectorDonVi(viTri = 0): number[] {
  const vec = new Array<number>(128).fill(0);
  vec[viTri] = 1;
  return vec;
}

describe('DieuKhienPhongHoc (Supertest Ma trận Phân quyền CASL & Anti-IDOR)', () => {
  let app: INestApplication;
  let prismaMock: any;
  let khoMock: any;

  const nguoiDungGiaLap: Record<string, PayloadJwt> = {
    QUAN_TRI_VIEN: {
      sub: 'user-admin',
      id: 'user-admin',
      email: 'admin@lms.edu.vn',
      hoTen: 'Quản trị viên',
      vaiTro: VaiTro.QUAN_TRI_VIEN,
    },
    GIAO_VIEN_LOP: {
      sub: 'user-gv-1',
      id: 'user-gv-1',
      email: 'gv1@lms.edu.vn',
      hoTen: 'Giáo viên phụ trách',
      vaiTro: VaiTro.GIAO_VIEN,
    },
    GIAO_VIEN_LA: {
      sub: 'user-gv-2',
      id: 'user-gv-2',
      email: 'gv2@lms.edu.vn',
      hoTen: 'Giáo viên lớp khác',
      vaiTro: VaiTro.GIAO_VIEN,
    },
    HOC_SINH_LOP: {
      sub: 'user-hs-1',
      id: 'user-hs-1',
      email: 'hs1@lms.edu.vn',
      hoTen: 'Học sinh trong lớp',
      vaiTro: VaiTro.HOC_SINH,
    },
    HOC_SINH_NGOAI_LOP: {
      sub: 'user-hs-2',
      id: 'user-hs-2',
      email: 'hs2@lms.edu.vn',
      hoTen: 'Học sinh ngoài lớp',
      vaiTro: VaiTro.HOC_SINH,
    },
    PHU_HUYNH: {
      sub: 'user-ph-1',
      id: 'user-ph-1',
      email: 'ph1@lms.edu.vn',
      hoTen: 'Phụ huynh',
      vaiTro: VaiTro.PHU_HUYNH,
    },
    BAN_GIAM_HIEU: {
      sub: 'user-bgh-1',
      id: 'user-bgh-1',
      email: 'bgh@lms.edu.vn',
      hoTen: 'Ban giám hiệu',
      vaiTro: VaiTro.BAN_GIAM_HIEU,
    },
  };

  const lopMock = {
    id: UUID_LOP,
    maLopHocPhan: 'TOAN10_01',
    giaoVien: {
      id: 'gv-profile-1',
      idNguoiDung: 'user-gv-1',
    },
    cacBuoiHoc: [],
    danhSachGhiDanh: [
      {
        idHocSinh: UUID_HS_TRONG_LOP,
        hocSinh: {
          id: UUID_HS_TRONG_LOP,
          maHocSinh: 'HS001',
          nguoiDung: {
            id: 'user-hs-1',
            hoTen: 'Học sinh trong lớp',
            email: 'hs1@lms.edu.vn',
            anhDaiDien: null,
          },
          lopHanhChinh: null,
        },
      },
    ],
  };

  beforeAll(async () => {
    prismaMock = {
      lopHocPhan: {
        findUnique: jest.fn(),
      },
      hoSoHocSinh: {
        findUnique: jest.fn(),
      },
      ghiDanh: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
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

    khoMock = {
      timBuoiHocTheoId: jest.fn(),
      capNhatTrangThaiDiemDanhKhuonMat: jest.fn(),
      timDuLieuKhuonMatTheoNguoiDung: jest.fn(),
      luuDuLieuKhuonMat: jest.fn(),
      xoaDuLieuKhuonMat: jest.fn(),
      layDanhSachKhuonMatTheoLop: jest.fn(),
      diemDanhHocSinh: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [DieuKhienPhongHoc],
      providers: [
        DichVuPhongHoc,
        NhaMayQuyenHan,
        PhanQuyenCaslGuard,
        Reflector,
        { provide: PrismaService, useValue: prismaMock },
        { provide: KhoPhongHoc, useValue: khoMock },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('mock') },
        },
        {
          provide: DichVuCaiDatService,
          useValue: {
            layGiaTriSo: jest.fn(async (_: string, macDinh: number) => macDinh),
          },
        },
      ],
    })
      .overrideGuard(XacThucJwtGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest();
          const key = req.headers['x-vai-tro-test'] as string | undefined;
          if (!key || !nguoiDungGiaLap[key]) {
            throw new UnauthorizedException({
              thanhCong: false,
              thongDiep: 'Yêu cầu đăng nhập',
            });
          }
          req.user = nguoiDungGiaLap[key];
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.lopHocPhan.findUnique.mockResolvedValue(lopMock);
    prismaMock.hoSoHocSinh.findUnique.mockImplementation(async ({ where }: any) => {
      if (where?.idNguoiDung === 'user-hs-1') {
        return { id: UUID_HS_TRONG_LOP };
      }
      return { id: '44444444-4444-4444-8444-444444444444' };
    });
    prismaMock.ghiDanh.findUnique.mockImplementation(async ({ where }: any) => {
      if (where?.idLopHocPhan_idHocSinh?.idHocSinh === UUID_HS_TRONG_LOP) {
        return { idLopHocPhan: UUID_LOP, idHocSinh: UUID_HS_TRONG_LOP };
      }
      return null;
    });
    prismaMock.ghiDanh.findMany.mockResolvedValue([{ idHocSinh: UUID_HS_TRONG_LOP }]);
    khoMock.timBuoiHocTheoId.mockResolvedValue({
      id: UUID_BUOI,
      idLopHocPhan: UUID_LOP,
      thoiGianBD: new Date(Date.now() - 5 * 60 * 1000),
      batDiemDanhKhuonMat: true,
      hanDiemDanhKhuonMat: new Date(Date.now() + 10 * 60 * 1000),
      lopHocPhan: lopMock,
    });
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('GET /khuon-mat/ho-so: chặn chưa đăng nhập (401), chặn Phụ huynh (403), cho Học sinh đọc (200)', async () => {
    await request(app.getHttpServer())
      .get('/phong-hoc-truc-tuyen/khuon-mat/ho-so')
      .expect(401);

    await request(app.getHttpServer())
      .get('/phong-hoc-truc-tuyen/khuon-mat/ho-so')
      .set('x-vai-tro-test', 'PHU_HUYNH')
      .expect(403);

    khoMock.timDuLieuKhuonMatTheoNguoiDung.mockResolvedValue(null);
    const res = await request(app.getHttpServer())
      .get('/phong-hoc-truc-tuyen/khuon-mat/ho-so')
      .set('x-vai-tro-test', 'HOC_SINH_LOP')
      .expect(200);

    expect(res.body.thanhCong).toBe(true);
    expect(res.body.duLieu.daDangKy).toBe(false);
  });

  it('POST /khuon-mat/dang-ky: kiểm tra Zod (400), chặn BGH/Phụ huynh (403), Học sinh đăng ký thành công (201)', async () => {
    await request(app.getHttpServer())
      .post('/phong-hoc-truc-tuyen/khuon-mat/dang-ky')
      .set('x-vai-tro-test', 'BAN_GIAM_HIEU')
      .send({ vectorKhuonMat: taoVectorDonVi(0) })
      .expect(403);

    await request(app.getHttpServer())
      .post('/phong-hoc-truc-tuyen/khuon-mat/dang-ky')
      .set('x-vai-tro-test', 'HOC_SINH_LOP')
      .send({ vectorKhuonMat: [0.1, 0.2] })
      .expect(400);

    khoMock.luuDuLieuKhuonMat.mockResolvedValue({
      id: 'km-new',
      soMauChup: 3,
      diemChatLuong: 0.9,
      kichHoat: true,
      ngayDangKy: new Date(),
      ngayCapNhat: new Date(),
    });

    const res = await request(app.getHttpServer())
      .post('/phong-hoc-truc-tuyen/khuon-mat/dang-ky')
      .set('x-vai-tro-test', 'HOC_SINH_LOP')
      .send({
        vectorKhuonMat: taoVectorDonVi(0),
        soMauChup: 3,
        diemChatLuong: 0.9,
        daXacThucNguoiThat: true,
      })
      .expect(201);

    expect(res.body.thanhCong).toBe(true);
    expect(res.body.duLieu.daDangKy).toBe(true);
  });

  it('PATCH /buoi-hoc/:id/khuon-mat: chặn Học sinh & GV lớp khác (403), GV phụ trách mở phiên thành công (200)', async () => {
    await request(app.getHttpServer())
      .patch(`/phong-hoc-truc-tuyen/buoi-hoc/${UUID_BUOI}/khuon-mat`)
      .set('x-vai-tro-test', 'HOC_SINH_LOP')
      .send({ batDiemDanhKhuonMat: true, thoiHanPhut: 15 })
      .expect(403);

    await request(app.getHttpServer())
      .patch(`/phong-hoc-truc-tuyen/buoi-hoc/${UUID_BUOI}/khuon-mat`)
      .set('x-vai-tro-test', 'GIAO_VIEN_LA')
      .send({ batDiemDanhKhuonMat: true, thoiHanPhut: 15 })
      .expect(403);

    khoMock.capNhatTrangThaiDiemDanhKhuonMat.mockResolvedValue({
      id: UUID_BUOI,
      batDiemDanhKhuonMat: true,
    });

    const res = await request(app.getHttpServer())
      .patch(`/phong-hoc-truc-tuyen/buoi-hoc/${UUID_BUOI}/khuon-mat`)
      .set('x-vai-tro-test', 'GIAO_VIEN_LOP')
      .send({ batDiemDanhKhuonMat: true, thoiHanPhut: 15 })
      .expect(200);

    expect(res.body.thanhCong).toBe(true);
    expect(res.body.duLieu.batDiemDanhKhuonMat).toBe(true);
  });

  it('POST /buoi-hoc/:id/diem-danh-khuon-mat: chặn chưa xác thực người thật (400), chặn HS ngoài lớp (403), HS trong lớp khớp mặt (201)', async () => {
    await request(app.getHttpServer())
      .post(`/phong-hoc-truc-tuyen/buoi-hoc/${UUID_BUOI}/diem-danh-khuon-mat`)
      .set('x-vai-tro-test', 'HOC_SINH_LOP')
      .send({
        vectorKhuonMat: taoVectorDonVi(0),
        diemChatLuong: 0.9,
        daXacThucNguoiThat: false,
      })
      .expect(400);

    await request(app.getHttpServer())
      .post(`/phong-hoc-truc-tuyen/buoi-hoc/${UUID_BUOI}/diem-danh-khuon-mat`)
      .set('x-vai-tro-test', 'HOC_SINH_NGOAI_LOP')
      .send({
        vectorKhuonMat: taoVectorDonVi(0),
        diemChatLuong: 0.9,
        daXacThucNguoiThat: true,
      })
      .expect(403);

    khoMock.timDuLieuKhuonMatTheoNguoiDung.mockResolvedValue({
      id: 'km-1',
      kichHoat: true,
      vectorDacTrung: taoVectorDonVi(0),
    });
    khoMock.diemDanhHocSinh.mockResolvedValue({
      id: 'dd-km-1',
      idBuoiHoc: UUID_BUOI,
      idHocSinh: UUID_HS_TRONG_LOP,
      trangThai: TrangThaiDiemDanh.CO_MAT,
    });

    const res = await request(app.getHttpServer())
      .post(`/phong-hoc-truc-tuyen/buoi-hoc/${UUID_BUOI}/diem-danh-khuon-mat`)
      .set('x-vai-tro-test', 'HOC_SINH_LOP')
      .send({
        vectorKhuonMat: taoVectorDonVi(0),
        diemChatLuong: 0.9,
        daXacThucNguoiThat: true,
      })
      .expect(201);

    expect(res.body.thanhCong).toBe(true);
    expect(res.body.duLieu.trangThai).toBe(TrangThaiDiemDanh.CO_MAT);
    expect(res.body.duLieu.doTuongDong).toBe(1);
  });

  it('GET /lop/:id/du-lieu-khuon-mat & POST /buoi-hoc/:id/diem-danh-khuon-mat-lop: chỉ GV phụ trách hoặc Quản trị viên mới được phép', async () => {
    await request(app.getHttpServer())
      .get(`/phong-hoc-truc-tuyen/lop/${UUID_LOP}/du-lieu-khuon-mat`)
      .set('x-vai-tro-test', 'HOC_SINH_LOP')
      .expect(403);

    await request(app.getHttpServer())
      .get(`/phong-hoc-truc-tuyen/lop/${UUID_LOP}/du-lieu-khuon-mat`)
      .set('x-vai-tro-test', 'GIAO_VIEN_LA')
      .expect(403);

    khoMock.layDanhSachKhuonMatTheoLop.mockResolvedValue([
      {
        hocSinh: {
          id: UUID_HS_TRONG_LOP,
          maHocSinh: 'HS001',
          nguoiDung: {
            id: 'user-hs-1',
            hoTen: 'Học sinh trong lớp',
            anhDaiDien: null,
            duLieuKhuonMat: { vectorDacTrung: taoVectorDonVi(0) },
          },
        },
      },
    ]);

    const resDanhSach = await request(app.getHttpServer())
      .get(`/phong-hoc-truc-tuyen/lop/${UUID_LOP}/du-lieu-khuon-mat`)
      .set('x-vai-tro-test', 'GIAO_VIEN_LOP')
      .expect(200);
    expect(resDanhSach.body.duLieu).toHaveLength(1);

    khoMock.diemDanhHocSinh.mockResolvedValue({ id: 'dd-1' });
    const resLuu = await request(app.getHttpServer())
      .post(`/phong-hoc-truc-tuyen/buoi-hoc/${UUID_BUOI}/diem-danh-khuon-mat-lop`)
      .set('x-vai-tro-test', 'GIAO_VIEN_LOP')
      .send({
        danhSachNhanDien: [{ idHocSinh: UUID_HS_TRONG_LOP, doTinCay: 0.94 }],
      })
      .expect(201);
    expect(resLuu.body.duLieu.soLuongCapNhat).toBe(1);
  });

  it('POST /buoi-hoc/:id/diem-danh (Thủ công) & GET /lop/:id/thong-ke-chuyen-can: chống IDOR & kiểm Zod', async () => {
    await request(app.getHttpServer())
      .post(`/phong-hoc-truc-tuyen/buoi-hoc/${UUID_BUOI}/diem-danh`)
      .set('x-vai-tro-test', 'GIAO_VIEN_LA')
      .send({ idHocSinh: UUID_HS_TRONG_LOP, trangThai: 'CO_MAT' })
      .expect(403);

    await request(app.getHttpServer())
      .post(`/phong-hoc-truc-tuyen/buoi-hoc/${UUID_BUOI}/diem-danh`)
      .set('x-vai-tro-test', 'GIAO_VIEN_LOP')
      .send({ idHocSinh: 'khong-phai-uuid', trangThai: 'CO_MAT' })
      .expect(400);

    await request(app.getHttpServer())
      .get(`/phong-hoc-truc-tuyen/lop/${UUID_LOP}/thong-ke-chuyen-can`)
      .set('x-vai-tro-test', 'HOC_SINH_NGOAI_LOP')
      .expect(403);

    const resHs = await request(app.getHttpServer())
      .get(`/phong-hoc-truc-tuyen/lop/${UUID_LOP}/thong-ke-chuyen-can`)
      .set('x-vai-tro-test', 'HOC_SINH_LOP')
      .expect(200);
    expect(resHs.body.duLieu.danhSachHocSinh).toHaveLength(1);
  });
});
