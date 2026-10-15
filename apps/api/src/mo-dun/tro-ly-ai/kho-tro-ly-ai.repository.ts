import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import {
  LoaiBanNhapAI,
  TrangThaiBanNhapAI,
  NguonTrichDan,
} from '@lms/chung';

export interface KetQuaTruyHoiDoan {
  id: string;
  idTaiLieu: string;
  idLopHocPhan: string;
  soThuTu: number;
  noiDung: string;
  tieuDeTaiLieu: string;
  loaiTaiLieu: string;
  doTuongDong: number;
}

@Injectable()
export class KhoTroLyAiRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // PHIÊN & TIN NHẮN TRỢ LÝ
  // ==========================================

  async layDanhSachPhienTheoNguoiDung(idNguoiDung: string) {
    return this.prisma.phienTroLy.findMany({
      where: { idNguoiDung },
      include: {
        _count: {
          select: { cacTinNhan: true },
        },
      },
      orderBy: { ngayTao: 'desc' },
    });
  }

  async timPhienTheoId(idPhien: string, idNguoiDung: string) {
    return this.prisma.phienTroLy.findFirst({
      where: { id: idPhien, idNguoiDung },
      include: {
        cacTinNhan: {
          orderBy: { ngayTao: 'asc' },
        },
      },
    });
  }

  async taoPhien(idNguoiDung: string, tieuDe: string) {
    return this.prisma.phienTroLy.create({
      data: {
        idNguoiDung,
        tieuDe,
      },
    });
  }

  async xoaPhien(idPhien: string, idNguoiDung: string) {
    return this.prisma.phienTroLy.deleteMany({
      where: { id: idPhien, idNguoiDung },
    });
  }

  async xoaTatCaPhienCuaNguoiDung(idNguoiDung: string) {
    return this.prisma.phienTroLy.deleteMany({
      where: { idNguoiDung },
    });
  }

  async demSoLuotHoiTrongNgay(idNguoiDung: string): Promise<number> {
    const dauNgay = new Date();
    dauNgay.setHours(0, 0, 0, 0);
    return this.prisma.nhatKySuDungAI.count({
      where: {
        idNguoiDung,
        ngayTao: { gte: dauNgay },
      },
    });
  }

  async taoTinNhan(duLieu: {
    idPhien: string;
    vaiTro: 'user' | 'assistant' | 'system';
    noiDung: string;
    trichDan?: NguonTrichDan[];
  }) {
    return this.prisma.tinNhanTroLy.create({
      data: {
        idPhien: duLieu.idPhien,
        vaiTro: duLieu.vaiTro,
        noiDung: duLieu.noiDung,
        trichDan: duLieu.trichDan ? JSON.parse(JSON.stringify(duLieu.trichDan)) : undefined,
      },
    });
  }

  // ==========================================
  // ĐOẠN TÀI LIỆU & TÌM KIẾM VECTOR (PGVECTOR)
  // ==========================================

  async xoaDoanTheoTaiLieu(idTaiLieu: string) {
    return this.prisma.doanTaiLieu.deleteMany({
      where: { idTaiLieu },
    });
  }

  async luuDoanTaiLieuKiemVector(duLieu: {
    idTaiLieu: string;
    idLopHocPhan: string;
    soThuTu: number;
    noiDung: string;
    vector: number[];
  }) {
    const chuoiVector = `[${duLieu.vector.join(',')}]`;
    return this.prisma.$executeRawUnsafe(
      `INSERT INTO doan_tai_lieu (id, id_tai_lieu, id_lop_hoc_phan, so_thu_tu, noi_dung, vector_nhung, ngay_tao)
       VALUES (gen_random_uuid(), $1::uuid, $2::uuid, $3, $4, $5::vector, NOW())`,
      duLieu.idTaiLieu,
      duLieu.idLopHocPhan,
      duLieu.soThuTu,
      duLieu.noiDung,
      chuoiVector,
    );
  }

  /**
   * Truy hồi ngữ cảnh tương đồng qua toán tử cosine pgvector
   * TUÂN THỦ RULE 04: Bắt buộc Pre-filtering theo danhSachIdLop (id_lop_hoc_phan = ANY(...))
   */
  async truyHoiDoanTuongDong(
    vectorCauHoi: number[],
    danhSachIdLop: string[],
    gioiHan: number = 5,
  ): Promise<KetQuaTruyHoiDoan[]> {
    if (!danhSachIdLop || danhSachIdLop.length === 0) {
      return [];
    }

    const chuoiVector = `[${vectorCauHoi.join(',')}]`;
    const formatIds = `{${danhSachIdLop.join(',')}}`;

    const ketQua = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT d.id, d.id_tai_lieu AS "idTaiLieu", d.id_lop_hoc_phan AS "idLopHocPhan",
              d.so_thu_tu AS "soThuTu", d.noi_dung AS "noiDung",
              t.tieu_de AS "tieuDeTaiLieu", t.loai_tai_lieu AS "loaiTaiLieu",
              ROUND((1 - (d.vector_nhung <=> $1::vector))::numeric, 4)::float AS "doTuongDong"
       FROM doan_tai_lieu d
       JOIN tai_lieu t ON d.id_tai_lieu = t.id
       WHERE d.id_lop_hoc_phan = ANY($2::uuid[])
         AND d.vector_nhung IS NOT NULL
       ORDER BY d.vector_nhung <=> $1::vector ASC
       LIMIT $3`,
      chuoiVector,
      formatIds,
      gioiHan,
    );

    return ketQua.map((item) => ({
      id: item.id,
      idTaiLieu: item.idTaiLieu,
      idLopHocPhan: item.idLopHocPhan,
      soThuTu: Number(item.soThuTu),
      noiDung: item.noiDung,
      tieuDeTaiLieu: item.tieuDeTaiLieu,
      loaiTaiLieu: item.loaiTaiLieu,
      doTuongDong: Number(item.doTuongDong),
    }));
  }

  // ==========================================
  // BẢN NHÁP AI (RULE 04: CHỈ TẠO BẢN NHÁP)
  // ==========================================

  async taoBanNhap(duLieu: {
    idLopHocPhan: string;
    idGiaoVien: string;
    loaiBanNhap: LoaiBanNhapAI;
    tieuDe: string;
    duLieuJson: any;
  }) {
    return this.prisma.banNhapAI.create({
      data: {
        idLopHocPhan: duLieu.idLopHocPhan,
        idGiaoVien: duLieu.idGiaoVien,
        loaiBanNhap: duLieu.loaiBanNhap,
        tieuDe: duLieu.tieuDe,
        duLieuJson: duLieu.duLieuJson,
        trangThai: TrangThaiBanNhapAI.CHO_DUYET,
      },
      include: {
        lopHocPhan: {
          select: {
            id: true,
            maLopHocPhan: true,
            tenLopHocPhan: true,
          },
        },
      },
    });
  }

  async layDanhSachBanNhapTheoLop(idLopHocPhan: string, idGiaoVien?: string) {
    const where: any = { idLopHocPhan };
    if (idGiaoVien) where.idGiaoVien = idGiaoVien;

    return this.prisma.banNhapAI.findMany({
      where,
      orderBy: { ngayTao: 'desc' },
      include: {
        lopHocPhan: {
          select: {
            id: true,
            maLopHocPhan: true,
            tenLopHocPhan: true,
          },
        },
      },
    });
  }

  async timBanNhapTheoId(id: string) {
    return this.prisma.banNhapAI.findUnique({
      where: { id },
      include: {
        lopHocPhan: true,
        giaoVien: true,
      },
    });
  }

  async capNhatTrangThaiBanNhap(id: string, trangThai: TrangThaiBanNhapAI) {
    return this.prisma.banNhapAI.update({
      where: { id },
      data: { trangThai },
    });
  }

  // ==========================================
  // NHẬT KÝ SỬ DỤNG AI (AUDIT LOGGING)
  // ==========================================

  async ghiNhatKy(duLieu: {
    idNguoiDung: string;
    loaiTacVu: string;
    soLuongToken: number;
    doTreMs: number;
  }) {
    return this.prisma.nhatKySuDungAI.create({
      data: duLieu,
    });
  }
}
