import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { CaiDatHeThong } from '@prisma/client';
import {
  BAN_DO_DINH_NGHIA_CAI_DAT,
  DANH_MUC_CAI_DAT_HE_THONG,
  ANH_XA_KHOA_CU_SANG_MOI,
  ANH_XA_KHOA_MOI_SANG_CU,
} from '@lms/chung';

@Injectable()
export class KhoCaiDatRepository {
  constructor(private readonly prisma: PrismaService) {}

  async layDanhSach(): Promise<CaiDatHeThong[]> {
    const danhSachDb = await this.prisma.caiDatHeThong.findMany({
      where: {
        NOT: {
          khoa: { startsWith: 'ca_nhan.' },
        },
      },
      orderBy: [{ nhom: 'asc' }, { khoa: 'asc' }],
    });

    const banDoDb = new Map<string, CaiDatHeThong>();
    for (const item of danhSachDb) {
      banDoDb.set(item.khoa, item);
    }

    const ketQua: CaiDatHeThong[] = [...danhSachDb];
    const bayGio = new Date();

    // Bổ sung các khóa chuẩn trong danh mục nếu chưa tồn tại trong CSDL (kế thừa giá trị từ khóa cũ nếu có)
    for (const dinhNghia of DANH_MUC_CAI_DAT_HE_THONG) {
      const banGhiMoi = banDoDb.get(dinhNghia.khoa);
      const banGhiCu = dinhNghia.khoaCu ? banDoDb.get(dinhNghia.khoaCu) : undefined;

      if (!banGhiMoi) {
        const giaTriKeThua = banGhiCu ? banGhiCu.giaTri : dinhNghia.macDinh;
        const ao: CaiDatHeThong = {
          id: `mac-dinh-${dinhNghia.khoa}`,
          khoa: dinhNghia.khoa,
          giaTri: giaTriKeThua,
          nhom: dinhNghia.nhom.toUpperCase(),
          moTa: dinhNghia.moTa,
          kieuDuLieu: dinhNghia.kieuDuLieuDb,
          congKhai: dinhNghia.congKhai,
          ngayTao: banGhiCu?.ngayTao || bayGio,
          ngayCapNhat: banGhiCu?.ngayCapNhat || bayGio,
        };
        ketQua.push(ao);
        banDoDb.set(dinhNghia.khoa, ao);
      }

      // Đảm bảo khóa tương thích ngược (nếu có) cũng có mặt cho các màn hình cũ
      if (dinhNghia.khoaCu && !banGhiCu) {
        const giaTriHienCo = banGhiMoi ? banGhiMoi.giaTri : dinhNghia.macDinh;
        const aoCu: CaiDatHeThong = {
          id: `mac-dinh-${dinhNghia.khoaCu}`,
          khoa: dinhNghia.khoaCu,
          giaTri: giaTriHienCo,
          nhom: dinhNghia.nhom.toUpperCase(),
          moTa: dinhNghia.moTa,
          kieuDuLieu: dinhNghia.kieuDuLieuDb,
          congKhai: dinhNghia.congKhai,
          ngayTao: banGhiMoi?.ngayTao || bayGio,
          ngayCapNhat: banGhiMoi?.ngayCapNhat || bayGio,
        };
        ketQua.push(aoCu);
        banDoDb.set(dinhNghia.khoaCu, aoCu);
      }
    }

    return ketQua;
  }

  async layDanhSachCongKhai(): Promise<CaiDatHeThong[]> {
    const danhSachDb = await this.prisma.caiDatHeThong.findMany({
      where: {
        congKhai: true,
        NOT: {
          khoa: { startsWith: 'ca_nhan.' },
        },
      },
      orderBy: [{ nhom: 'asc' }, { khoa: 'asc' }],
    });

    const banDo = new Map<string, CaiDatHeThong>();
    for (const item of danhSachDb) {
      const dinhNghia = BAN_DO_DINH_NGHIA_CAI_DAT[item.khoa];
      // Chặn tuyệt đối các khóa bí mật dù cột congKhai trong DB bị sửa nhầm
      if (dinhNghia?.biMat) continue;
      banDo.set(item.khoa, item);
    }

    const bayGio = new Date();
    for (const dinhNghia of DANH_MUC_CAI_DAT_HE_THONG) {
      if (!dinhNghia.congKhai || dinhNghia.biMat) continue;
      const tuMoi = banDo.get(dinhNghia.khoa);
      const tuCu = dinhNghia.khoaCu ? banDo.get(dinhNghia.khoaCu) : undefined;
      const giaTriChuan = tuMoi?.giaTri ?? tuCu?.giaTri ?? dinhNghia.macDinh;

      if (!tuMoi) {
        banDo.set(dinhNghia.khoa, {
          id: `cong-khai-${dinhNghia.khoa}`,
          khoa: dinhNghia.khoa,
          giaTri: giaTriChuan,
          nhom: dinhNghia.nhom.toUpperCase(),
          moTa: dinhNghia.moTa,
          kieuDuLieu: dinhNghia.kieuDuLieuDb,
          congKhai: true,
          ngayTao: bayGio,
          ngayCapNhat: bayGio,
        });
      }
      if (dinhNghia.khoaCu && !tuCu) {
        banDo.set(dinhNghia.khoaCu, {
          id: `cong-khai-${dinhNghia.khoaCu}`,
          khoa: dinhNghia.khoaCu,
          giaTri: giaTriChuan,
          nhom: dinhNghia.nhom.toUpperCase(),
          moTa: dinhNghia.moTa,
          kieuDuLieu: dinhNghia.kieuDuLieuDb,
          congKhai: true,
          ngayTao: bayGio,
          ngayCapNhat: bayGio,
        });
      }
    }

    return Array.from(banDo.values());
  }

  async layTheoKhoa(khoa: string): Promise<CaiDatHeThong | null> {
    const trucTiep = await this.prisma.caiDatHeThong.findUnique({
      where: { khoa },
    });
    if (trucTiep) return trucTiep;

    // Kiểm tra khóa ánh xạ tương đương (mới <-> cũ)
    const khoaTuongDuong = ANH_XA_KHOA_CU_SANG_MOI[khoa] || ANH_XA_KHOA_MOI_SANG_CU[khoa];
    if (khoaTuongDuong) {
      const banGhiTuongDuong = await this.prisma.caiDatHeThong.findUnique({
        where: { khoa: khoaTuongDuong },
      });
      if (banGhiTuongDuong) {
        return {
          ...banGhiTuongDuong,
          khoa,
        };
      }
    }

    // Nếu thuộc danh mục chuẩn nhưng chưa ghi vào DB thì trả về bản ghi mặc định
    const dinhNghia = BAN_DO_DINH_NGHIA_CAI_DAT[khoa];
    if (dinhNghia) {
      const bayGio = new Date();
      return {
        id: `mac-dinh-${khoa}`,
        khoa,
        giaTri: dinhNghia.macDinh,
        nhom: dinhNghia.nhom.toUpperCase(),
        moTa: dinhNghia.moTa,
        kieuDuLieu: dinhNghia.kieuDuLieuDb,
        congKhai: dinhNghia.congKhai,
        ngayTao: bayGio,
        ngayCapNhat: bayGio,
      };
    }

    return null;
  }

  async capNhat(khoa: string, giaTri: string): Promise<CaiDatHeThong> {
    const dinhNghia = BAN_DO_DINH_NGHIA_CAI_DAT[khoa];
    const nhom = dinhNghia ? dinhNghia.nhom.toUpperCase() : 'CHUNG';
    const kieuDuLieu = dinhNghia ? dinhNghia.kieuDuLieuDb : 'CHUOI';
    const congKhai = dinhNghia ? Boolean(dinhNghia.congKhai && !dinhNghia.biMat) : false;
    const moTa = dinhNghia?.moTa ?? null;

    const ketQua = await this.prisma.caiDatHeThong.upsert({
      where: { khoa },
      update: {
        giaTri,
        congKhai,
      },
      create: {
        khoa,
        giaTri,
        nhom,
        moTa,
        kieuDuLieu,
        congKhai,
      },
    });

    // Đồng bộ hai chiều giữa khóa chuẩn mới (nhom.ten_khoa) và khóa cũ (UPPER_SNAKE_CASE)
    const khoaDongBo = ANH_XA_KHOA_CU_SANG_MOI[khoa] || ANH_XA_KHOA_MOI_SANG_CU[khoa];
    if (khoaDongBo && khoaDongBo !== khoa) {
      await this.prisma.caiDatHeThong.upsert({
        where: { khoa: khoaDongBo },
        update: {
          giaTri,
          congKhai,
        },
        create: {
          khoa: khoaDongBo,
          giaTri,
          nhom,
          moTa,
          kieuDuLieu,
          congKhai,
        },
      });
    }

    return ketQua;
  }

  async capNhatNhieu(danhSach: Array<{ khoa: string; giaTri: string }>): Promise<number> {
    return this.prisma.$transaction(async (tx) => {
      let dem = 0;
      for (const item of danhSach) {
        const dinhNghia = BAN_DO_DINH_NGHIA_CAI_DAT[item.khoa];
        const nhom = dinhNghia ? dinhNghia.nhom.toUpperCase() : 'CHUNG';
        const kieuDuLieu = dinhNghia ? dinhNghia.kieuDuLieuDb : 'CHUOI';
        const congKhai = dinhNghia ? Boolean(dinhNghia.congKhai && !dinhNghia.biMat) : false;
        const moTa = dinhNghia?.moTa ?? null;

        await tx.caiDatHeThong.upsert({
          where: { khoa: item.khoa },
          update: {
            giaTri: item.giaTri,
            congKhai,
          },
          create: {
            khoa: item.khoa,
            giaTri: item.giaTri,
            nhom,
            moTa,
            kieuDuLieu,
            congKhai,
          },
        });

        const khoaDongBo =
          ANH_XA_KHOA_CU_SANG_MOI[item.khoa] || ANH_XA_KHOA_MOI_SANG_CU[item.khoa];
        if (khoaDongBo && khoaDongBo !== item.khoa) {
          await tx.caiDatHeThong.upsert({
            where: { khoa: khoaDongBo },
            update: {
              giaTri: item.giaTri,
              congKhai,
            },
            create: {
              khoa: khoaDongBo,
              giaTri: item.giaTri,
              nhom,
              moTa,
              kieuDuLieu,
              congKhai,
            },
          });
        }
        dem++;
      }
      return dem;
    });
  }

  async ghiNhatKyHeThong(duLieu: {
    idNguoiDung?: string | null;
    hanhDong: string;
    thucThe?: string;
    idThucThe?: string | null;
    diaChiIp?: string | null;
    chiTiet?: any;
  }) {
    try {
      await this.prisma.nhatKyHeThong.create({
        data: {
          idNguoiDung: duLieu.idNguoiDung || null,
          hanhDong: duLieu.hanhDong,
          thucThe: duLieu.thucThe || 'CaiDatHeThong',
          idThucThe: duLieu.idThucThe || null,
          diaChiIp: duLieu.diaChiIp || null,
          chiTiet: duLieu.chiTiet ? JSON.parse(JSON.stringify(duLieu.chiTiet)) : undefined,
        },
      });
    } catch {
      // Không làm gián đoạn luồng chính nếu bảng nhật ký gặp sự cố
    }
  }
}
