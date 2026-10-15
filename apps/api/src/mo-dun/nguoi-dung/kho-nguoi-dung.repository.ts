import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { Prisma, NguoiDung, PhienDangNhap } from '@prisma/client';
import { TruyVanNguoiDungDto, VaiTro } from '@lms/chung';

export interface CauHinhBaoMatHeThong {
  choPhepTuDangKy: boolean;
  thoiGianPhienGiay: number;
  soLanSaiToiDa: number;
  cuaSoDemSaiPhut: number;
  thoiGianKhoaTamPhut: number;
  gioiHanDangNhapTheoIp: number;
  cuaSoGioiHanIpPhut: number;
  doDaiMatKhauToiThieu: number;
  matKhauBatBuocChuVaSo: boolean;
}

@Injectable()
export class KhoNguoiDung {
  constructor(private readonly prisma: PrismaService) {}

  async timTheoId(id: string, kemHoSo = false): Promise<any | null> {
    return this.prisma.nguoiDung.findUnique({
      where: { id },
      include: kemHoSo
        ? {
            hoSoHocSinh: {
              include: {
                lopHanhChinh: true,
              },
            },
            hoSoGiaoVien: true,
            lienKetPhuHuynh: {
              include: {
                hocSinh: {
                  include: {
                    nguoiDung: {
                      select: {
                        id: true,
                        hoTen: true,
                        email: true,
                        anhDaiDien: true,
                      },
                    },
                    lopHanhChinh: true,
                  },
                },
              },
            },
          }
        : undefined,
    });
  }

  async timTheoEmail(email: string): Promise<NguoiDung | null> {
    return this.prisma.nguoiDung.findUnique({
      where: { email },
    });
  }

  async timDanhSachPhanTrang(thamSo: TruyVanNguoiDungDto) {
    const { trang = 1, kichThuoc = 10, tuKhoa, vaiTro, kichHoat } = thamSo;
    const boQua = (trang - 1) * kichThuoc;

    const dieuKienLoc: Prisma.NguoiDungWhereInput = {
      ngayXoa: null, // Chỉ lấy người dùng chưa bị xóa mềm
      ...(vaiTro ? { vaiTro: vaiTro as VaiTro } : {}),
      ...(kichHoat !== undefined ? { kichHoat } : {}),
      ...(tuKhoa
        ? {
            OR: [
              { hoTen: { contains: tuKhoa, mode: 'insensitive' } },
              { email: { contains: tuKhoa, mode: 'insensitive' } },
              { soDienThoai: { contains: tuKhoa } },
            ],
          }
        : {}),
    };

    const [danhSach, tongSo] = await Promise.all([
      this.prisma.nguoiDung.findMany({
        where: dieuKienLoc,
        skip: boQua,
        take: kichThuoc,
        orderBy: { ngayTao: 'desc' },
        select: {
          id: true,
          email: true,
          hoTen: true,
          soDienThoai: true,
          anhDaiDien: true,
          vaiTro: true,
          kichHoat: true,
          ngayTao: true,
          ngayCapNhat: true,
        },
      }),
      this.prisma.nguoiDung.count({ where: dieuKienLoc }),
    ]);

    return {
      danhSach,
      tongSo,
      trangHienTai: trang,
      kichThuocTrang: kichThuoc,
      tongSoTrang: Math.ceil(tongSo / kichThuoc),
    };
  }

  async taoNguoiDung(duLieu: Prisma.NguoiDungCreateInput): Promise<NguoiDung> {
    return this.prisma.nguoiDung.create({
      data: duLieu,
    });
  }

  async capNhatNguoiDung(id: string, duLieu: Prisma.NguoiDungUpdateInput): Promise<NguoiDung> {
    return this.prisma.nguoiDung.update({
      where: { id },
      data: duLieu,
    });
  }

  async chuyenTrangThai(id: string, kichHoat: boolean): Promise<NguoiDung> {
    return this.prisma.nguoiDung.update({
      where: { id },
      data: { kichHoat },
    });
  }

  async xoaMem(id: string): Promise<NguoiDung> {
    return this.prisma.nguoiDung.update({
      where: { id },
      data: { ngayXoa: new Date(), kichHoat: false },
    });
  }

  async taoPhienDangNhap(duLieu: Prisma.PhienDangNhapCreateInput): Promise<PhienDangNhap> {
    return this.prisma.phienDangNhap.create({
      data: duLieu,
    });
  }

  async capNhatPhienDangNhap(
    id: string,
    duLieu: Prisma.PhienDangNhapUpdateInput,
  ): Promise<PhienDangNhap> {
    return this.prisma.phienDangNhap.update({
      where: { id },
      data: duLieu,
    });
  }

  async timPhienTheoId(id: string): Promise<PhienDangNhap | null> {
    return this.prisma.phienDangNhap.findUnique({
      where: { id },
    });
  }

  async layDanhSachPhienDangNhap(idNguoiDung: string) {
    return this.prisma.phienDangNhap.findMany({
      where: {
        idNguoiDung,
        daThuHoi: false,
        hetHanLuc: { gt: new Date() },
      },
      orderBy: { ngayCapNhat: 'desc' },
      select: {
        id: true,
        thongTinThietBi: true,
        diaChiIp: true,
        hetHanLuc: true,
        ngayTao: true,
        ngayCapNhat: true,
      },
    });
  }

  async thuHoiPhien(id: string): Promise<PhienDangNhap> {
    return this.prisma.phienDangNhap.update({
      where: { id },
      data: { daThuHoi: true },
    });
  }

  async thuHoiPhienCuaNguoiDung(idPhien: string, idNguoiDung: string): Promise<number> {
    const ketQua = await this.prisma.phienDangNhap.updateMany({
      where: { id: idPhien, idNguoiDung, daThuHoi: false },
      data: { daThuHoi: true },
    });
    return ketQua.count;
  }

  async thuHoiTatCaPhienCuaNguoiDung(
    idNguoiDung: string,
    idPhienGiuLai?: string,
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.phienDangNhap.updateMany({
      where: {
        idNguoiDung,
        daThuHoi: false,
        ...(idPhienGiuLai ? { id: { not: idPhienGiuLai } } : {}),
      },
      data: { daThuHoi: true },
    });
  }

  async layThoiGianPhienGiay(): Promise<number> {
    const cauHinh = await this.layCauHinhBaoMat();
    return cauHinh.thoiGianPhienGiay;
  }

  async layCauHinhBaoMat(): Promise<CauHinhBaoMatHeThong> {
    const macDinh: CauHinhBaoMatHeThong = {
      choPhepTuDangKy: true,
      thoiGianPhienGiay: 86400,
      soLanSaiToiDa: 5,
      cuaSoDemSaiPhut: 15,
      thoiGianKhoaTamPhut: 15,
      gioiHanDangNhapTheoIp: 100,
      cuaSoGioiHanIpPhut: 15,
      doDaiMatKhauToiThieu: 8,
      matKhauBatBuocChuVaSo: true,
    };

    try {
      const danhSach = await this.prisma.caiDatHeThong.findMany({
        where: {
          khoa: {
            in: [
              'bao_mat.cho_phep_tu_dang_ky',
              'CHO_PHEP_DANG_KY',
              'bao_mat.thoi_gian_phien_giay',
              'THOI_GIAN_PHIEN_GIAY',
              'bao_mat.so_lan_sai_toi_da',
              'bao_mat.cua_so_dem_sai_phut',
              'bao_mat.thoi_gian_khoa_tam_phut',
              'bao_mat.gioi_han_dang_nhap_theo_ip',
              'bao_mat.cua_so_gioi_han_ip_phut',
              'bao_mat.do_dai_mat_khau_toi_thieu',
              'bao_mat.mat_khau_bat_buoc_chu_va_so',
            ],
          },
        },
      });

      const banDo: Record<string, string> = {};
      for (const item of danhSach) {
        banDo[item.khoa] = item.giaTri;
      }

      const rawChoPhep =
        banDo['bao_mat.cho_phep_tu_dang_ky'] ?? banDo['CHO_PHEP_DANG_KY'] ?? 'true';
      const rawPhien =
        banDo['bao_mat.thoi_gian_phien_giay'] ?? banDo['THOI_GIAN_PHIEN_GIAY'] ?? '86400';

      const docSo = (khoa: string, def: number, min: number, max: number) => {
        const v = parseInt(banDo[khoa] ?? String(def), 10);
        if (Number.isNaN(v)) return def;
        return Math.min(max, Math.max(min, v));
      };

      const soGiayPhien = parseInt(rawPhien, 10);

      return {
        choPhepTuDangKy: rawChoPhep === 'true',
        thoiGianPhienGiay:
          Number.isNaN(soGiayPhien) || soGiayPhien < 60
            ? 86400
            : Math.min(soGiayPhien, 31536000),
        soLanSaiToiDa: docSo('bao_mat.so_lan_sai_toi_da', 5, 3, 20),
        cuaSoDemSaiPhut: docSo('bao_mat.cua_so_dem_sai_phut', 15, 5, 120),
        thoiGianKhoaTamPhut: docSo('bao_mat.thoi_gian_khoa_tam_phut', 15, 5, 1440),
        gioiHanDangNhapTheoIp: docSo('bao_mat.gioi_han_dang_nhap_theo_ip', 100, 20, 1000),
        cuaSoGioiHanIpPhut: docSo('bao_mat.cua_so_gioi_han_ip_phut', 15, 1, 60),
        doDaiMatKhauToiThieu: docSo('bao_mat.do_dai_mat_khau_toi_thieu', 8, 6, 32),
        matKhauBatBuocChuVaSo:
          (banDo['bao_mat.mat_khau_bat_buoc_chu_va_so'] ?? 'true') === 'true',
      };
    } catch {
      return macDinh;
    }
  }
}
