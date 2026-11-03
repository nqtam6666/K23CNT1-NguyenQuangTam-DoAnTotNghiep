import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { KhoBaiDangRepository } from './kho-bai-dang.repository';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { DichVuCaiDatService } from '../cai-dat/dich-vu-cai-dat.service';
import {
  PayloadJwt,
  VaiTro,
  ChuDeBaiDang,
  TaoBaiDangInput,
  TaoBinhLuanInput,
  DanhDauGiaiDapInput,
  MaLoiNghiepVu,
} from '@lms/chung';

interface MetaBaiDangDienDan {
  tieuDe?: string | null;
  chuDe?: ChuDeBaiDang;
  nhanChuong?: string | null;
  daGiaiDap?: boolean;
  idBinhLuanGiaiDap?: string | null;
}

@Injectable()
export class DichVuBaiDangService {
  private readonly boNhoMetaBaiDang = new Map<string, MetaBaiDangDienDan>();

  constructor(
    private readonly khoBaiDang: KhoBaiDangRepository,
    private readonly prisma: PrismaService,
    @Optional() private readonly dichVuCaiDat?: DichVuCaiDatService,
  ) {}

  /**
   * Kiểm tra quyền truy cập lớp học phần chống IDOR
   */
  async kiemTraQuyenTruyCapLop(idLopHocPhan: string, nguoiDung: PayloadJwt) {
    const lop = await this.prisma.lopHocPhan.findUnique({
      where: { id: idLopHocPhan },
    });

    if (!lop) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy lớp học phần',
      });
    }

    if (
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN ||
      nguoiDung.vaiTro === VaiTro.BAN_GIAM_HIEU ||
      nguoiDung.vaiTro === VaiTro.GIAO_VU
    ) {
      return lop;
    }

    if (nguoiDung.vaiTro === VaiTro.GIAO_VIEN) {
      const hoSo = await this.prisma.hoSoGiaoVien.findUnique({
        where: { idNguoiDung: nguoiDung.sub },
      });
      if (!hoSo || lop.idGiaoVien !== hoSo.id) {
        throw new ForbiddenException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
          thongDiep: 'Bạn không được phân công giảng dạy lớp học phần này',
        });
      }
      return lop;
    }

    if (nguoiDung.vaiTro === VaiTro.HOC_SINH) {
      const hoSo = await this.prisma.hoSoHocSinh.findUnique({
        where: { idNguoiDung: nguoiDung.sub },
      });
      if (!hoSo) {
        throw new ForbiddenException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
          thongDiep: 'Không tìm thấy hồ sơ học sinh của bạn',
        });
      }
      const ghiDanh = await this.prisma.ghiDanh.findFirst({
        where: { idLopHocPhan, idHocSinh: hoSo.id },
      });
      if (!ghiDanh) {
        throw new ForbiddenException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
          thongDiep: 'Bạn chưa được ghi danh vào lớp học phần này',
        });
      }
      return lop;
    }

    if (nguoiDung.vaiTro === VaiTro.PHU_HUYNH) {
      const lienKet = await this.prisma.phuHuynhHocSinh.findMany({
        where: { idPhuHuynh: nguoiDung.sub },
        select: { idHocSinh: true },
      });
      const danhSachIdCon = lienKet.map((lk) => lk.idHocSinh);
      const coConHoc = await this.prisma.ghiDanh.findFirst({
        where: {
          idLopHocPhan,
          idHocSinh: { in: danhSachIdCon },
        },
      });
      if (!coConHoc) {
        throw new ForbiddenException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
          thongDiep: 'Con em của bạn không học lớp học phần này',
        });
      }
      return lop;
    }

    throw new ForbiddenException({
      thanhCong: false,
      maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
      thongDiep: 'Không có quyền truy cập lớp học phần này',
    });
  }

  private suyLuanChuDeMacDinh(baiDang: any): MetaBaiDangDienDan {
    const noiDung = String(baiDang.noiDung || '');
    if (noiDung.startsWith('[Kế hoạch bài giảng')) {
      return {
        tieuDe: 'Kế hoạch bài giảng & Nội dung ôn tập',
        chuDe: ChuDeBaiDang.CHIA_SE_TAI_LIEU,
        nhanChuong: null,
        daGiaiDap: false,
        idBinhLuanGiaiDap: null,
      };
    }
    if (baiDang.ghimDauTrang || baiDang.nguoiDang?.vaiTro === VaiTro.GIAO_VIEN) {
      return {
        tieuDe: null,
        chuDe: ChuDeBaiDang.THONG_BAO,
        nhanChuong: null,
        daGiaiDap: false,
        idBinhLuanGiaiDap: null,
      };
    }
    if (noiDung.includes('?')) {
      return {
        tieuDe: null,
        chuDe: ChuDeBaiDang.HOI_DAP_BAI_HOC,
        nhanChuong: null,
        daGiaiDap: false,
        idBinhLuanGiaiDap: null,
      };
    }
    return {
      tieuDe: null,
      chuDe: ChuDeBaiDang.THAO_LUAN_BAI_TAP,
      nhanChuong: null,
      daGiaiDap: false,
      idBinhLuanGiaiDap: null,
    };
  }

  // ==========================================
  // BÀI ĐĂNG & DIỄN ĐÀN HỎI ĐÁP PHÂN LOẠI CHỦ ĐỀ
  // ==========================================

  async layDanhSachBaiDang(idLopHocPhan: string, nguoiDung: PayloadJwt) {
    await this.kiemTraQuyenTruyCapLop(idLopHocPhan, nguoiDung);
    const danhSach = await this.khoBaiDang.layDanhSachTheoLop(idLopHocPhan);
    if (!danhSach || danhSach.length === 0) {
      return [];
    }

    const danhSachId = danhSach.map((b: any) => b.id);
    const banDoMeta = new Map<string, MetaBaiDangDienDan>();

    for (const [id, meta] of this.boNhoMetaBaiDang.entries()) {
      if (danhSachId.includes(id)) {
        banDoMeta.set(id, { ...meta });
      }
    }

    if ((this.prisma as any).nhatKyHeThong?.findMany) {
      const cacBanGhiMeta = await (this.prisma as any).nhatKyHeThong.findMany({
        where: {
          thucThe: 'BaiDang',
          idThucThe: { in: danhSachId },
          hanhDong: { in: ['TAO_BAI_DANG_DIEN_DAN', 'CAP_NHAT_GIAI_DAP_BAI_DANG'] },
        },
        orderBy: { ngayTao: 'asc' },
      });

      for (const bg of cacBanGhiMeta) {
        if (!bg.idThucThe || !bg.chiTiet) continue;
        const hienTai = banDoMeta.get(bg.idThucThe) || {};
        const chiTiet = bg.chiTiet as Record<string, any>;
        banDoMeta.set(bg.idThucThe, {
          ...hienTai,
          ...(chiTiet.tieuDe !== undefined ? { tieuDe: chiTiet.tieuDe } : {}),
          ...(chiTiet.chuDe !== undefined ? { chuDe: chiTiet.chuDe } : {}),
          ...(chiTiet.nhanChuong !== undefined ? { nhanChuong: chiTiet.nhanChuong } : {}),
          ...(chiTiet.daGiaiDap !== undefined ? { daGiaiDap: Boolean(chiTiet.daGiaiDap) } : {}),
          ...(chiTiet.idBinhLuanGiaiDap !== undefined
            ? { idBinhLuanGiaiDap: chiTiet.idBinhLuanGiaiDap }
            : {}),
        });
      }
    }

    return danhSach.map((bai: any) => {
      const macDinh = this.suyLuanChuDeMacDinh(bai);
      const meta = {
        ...macDinh,
        ...(banDoMeta.get(bai.id) || {}),
      };

      const cacBinhLuan = Array.isArray(bai.cacBinhLuan)
        ? bai.cacBinhLuan.map((bl: any) => ({
            ...bl,
            laCauTraLoiChapNhan: Boolean(
              meta.idBinhLuanGiaiDap && bl.id === meta.idBinhLuanGiaiDap,
            ),
          }))
        : bai.cacBinhLuan;

      return {
        ...bai,
        tieuDe: meta.tieuDe ?? null,
        chuDe: meta.chuDe || ChuDeBaiDang.THONG_BAO,
        nhanChuong: meta.nhanChuong ?? null,
        daGiaiDap: Boolean(meta.daGiaiDap),
        idBinhLuanGiaiDap: meta.idBinhLuanGiaiDap ?? null,
        cacBinhLuan,
      };
    });
  }

  async taoBaiDang(
    idLopHocPhan: string,
    duLieu: TaoBaiDangInput,
    nguoiDung: PayloadJwt,
  ) {
    const lop = await this.kiemTraQuyenTruyCapLop(idLopHocPhan, nguoiDung);

    // Học sinh không thể ghim bài đầu trang, chỉ giáo viên hoặc admin
    let ghimDauTrang = duLieu.ghimDauTrang || false;
    if (nguoiDung.vaiTro === VaiTro.HOC_SINH) {
      ghimDauTrang = false;
    }

    const chuDe =
      duLieu.chuDe ||
      (nguoiDung.vaiTro === VaiTro.HOC_SINH
        ? ChuDeBaiDang.HOI_DAP_BAI_HOC
        : ChuDeBaiDang.THONG_BAO);
    const tieuDe = duLieu.tieuDe?.trim() || null;
    const nhanChuong = duLieu.nhanChuong?.trim() || null;

    const baiDangMoi = await this.khoBaiDang.taoBaiDang({
      idLopHocPhan,
      idNguoiDung: nguoiDung.sub,
      noiDung: duLieu.noiDung.trim(),
      ghimDauTrang,
    });

    const meta: MetaBaiDangDienDan = {
      tieuDe,
      chuDe,
      nhanChuong,
      daGiaiDap: false,
      idBinhLuanGiaiDap: null,
    };
    this.boNhoMetaBaiDang.set(baiDangMoi.id, meta);

    if ((this.prisma as any).nhatKyHeThong?.create) {
      await (this.prisma as any).nhatKyHeThong.create({
        data: {
          idNguoiDung: nguoiDung.sub,
          hanhDong: 'TAO_BAI_DANG_DIEN_DAN',
          thucThe: 'BaiDang',
          idThucThe: baiDangMoi.id,
          chiTiet: meta as any,
        },
      });
    }

    const tomTat =
      duLieu.noiDung.trim().length > 160
        ? `${duLieu.noiDung.trim().slice(0, 157)}...`
        : duLieu.noiDung.trim();

    void this.dichVuCaiDat?.phatThongBaoChoLopHocPhan({
      idLopHocPhan,
      idNguoiTao: nguoiDung.sub,
      tieuDe: ghimDauTrang
        ? `Thông báo ghim mới · ${lop.tenLopHocPhan}`
        : tieuDe
          ? `${tieuDe} · ${lop.tenLopHocPhan}`
          : `Thảo luận mới · ${lop.tenLopHocPhan}`,
      noiDung: tomTat,
      duongDan: `/lop-hoc-phan/${idLopHocPhan}`,
      loaiSuKien: 'BAI_DANG',
    });

    return {
      ...baiDangMoi,
      ...meta,
    };
  }

  async danhDauGiaiDap(
    idBaiDang: string,
    duLieu: DanhDauGiaiDapInput,
    nguoiDung: PayloadJwt,
  ) {
    const baiDang = await this.khoBaiDang.timTheoId(idBaiDang);
    if (!baiDang) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy bài đăng câu hỏi',
      });
    }

    const laAdmin =
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN ||
      nguoiDung.vaiTro === VaiTro.BAN_GIAM_HIEU;
    const laNguoiDang = baiDang.idNguoiDung === nguoiDung.sub;

    let laGiaoVienLop = false;
    if (nguoiDung.vaiTro === VaiTro.GIAO_VIEN) {
      const hoSo = await this.prisma.hoSoGiaoVien.findUnique({
        where: { idNguoiDung: nguoiDung.sub },
      });
      laGiaoVienLop = !!hoSo && baiDang.lopHocPhan.idGiaoVien === hoSo.id;
    }

    if (!laAdmin && !laNguoiDang && !laGiaoVienLop) {
      throw new ForbiddenException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
        thongDiep: 'Chỉ giảng viên phụ trách hoặc người đặt câu hỏi mới có quyền xác nhận câu trả lời đã giải đáp',
      });
    }

    if (duLieu.idBinhLuanGiaiDap) {
      const binhLuanHopLe = (baiDang as any).cacBinhLuan?.some(
        (bl: any) => bl.id === duLieu.idBinhLuanGiaiDap,
      );
      if ((baiDang as any).cacBinhLuan && !binhLuanHopLe) {
        throw new BadRequestException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
          thongDiep: 'Bình luận được chọn không thuộc về bài đăng này',
        });
      }
    }

    const hienTai = this.boNhoMetaBaiDang.get(idBaiDang) || {};
    const capNhat: MetaBaiDangDienDan = {
      ...hienTai,
      daGiaiDap: duLieu.daGiaiDap,
      idBinhLuanGiaiDap: duLieu.daGiaiDap ? (duLieu.idBinhLuanGiaiDap ?? null) : null,
    };
    this.boNhoMetaBaiDang.set(idBaiDang, capNhat);

    if ((this.prisma as any).nhatKyHeThong?.create) {
      await (this.prisma as any).nhatKyHeThong.create({
        data: {
          idNguoiDung: nguoiDung.sub,
          hanhDong: 'CAP_NHAT_GIAI_DAP_BAI_DANG',
          thucThe: 'BaiDang',
          idThucThe: idBaiDang,
          chiTiet: {
            daGiaiDap: capNhat.daGiaiDap,
            idBinhLuanGiaiDap: capNhat.idBinhLuanGiaiDap,
          },
        },
      });
    }

    return {
      id: idBaiDang,
      daGiaiDap: capNhat.daGiaiDap,
      idBinhLuanGiaiDap: capNhat.idBinhLuanGiaiDap,
    };
  }

  async xoaBaiDang(idBaiDang: string, nguoiDung: PayloadJwt) {
    const baiDang = await this.khoBaiDang.timTheoId(idBaiDang);
    if (!baiDang) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy bài đăng',
      });
    }

    // Kiểm tra quyền xóa:
    // - Quản trị viên / Ban giám hiệu: xóa bất kỳ
    // - Giáo viên chủ nhiệm lớp: xóa bất kỳ bài nào trong lớp mình
    // - Người đăng bài: xóa bài của chính mình
    const laAdmin =
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN ||
      nguoiDung.vaiTro === VaiTro.BAN_GIAM_HIEU;

    const laNguoiDang = baiDang.idNguoiDung === nguoiDung.sub;

    let laGiaoVienLop = false;
    if (nguoiDung.vaiTro === VaiTro.GIAO_VIEN) {
      const hoSo = await this.prisma.hoSoGiaoVien.findUnique({
        where: { idNguoiDung: nguoiDung.sub },
      });
      laGiaoVienLop = !!hoSo && baiDang.lopHocPhan.idGiaoVien === hoSo.id;
    }

    if (!laAdmin && !laNguoiDang && !laGiaoVienLop) {
      throw new ForbiddenException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
        thongDiep: 'Bạn không có quyền xóa bài đăng này',
      });
    }

    await this.khoBaiDang.xoaBaiDang(idBaiDang);
    this.boNhoMetaBaiDang.delete(idBaiDang);
    return { thanhCong: true, thongDiep: 'Đã xóa bài đăng thành công' };
  }

  // ==========================================
  // BÌNH LUẬN
  // ==========================================

  async taoBinhLuan(
    idBaiDang: string,
    duLieu: TaoBinhLuanInput,
    nguoiDung: PayloadJwt,
  ) {
    const baiDang = await this.khoBaiDang.timTheoId(idBaiDang);
    if (!baiDang) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy bài đăng để bình luận',
      });
    }

    // Kiểm tra quyền truy cập lớp của bài đăng
    await this.kiemTraQuyenTruyCapLop(baiDang.idLopHocPhan, nguoiDung);

    return this.khoBaiDang.taoBinhLuan({
      idBaiDang,
      idNguoiDung: nguoiDung.sub,
      noiDung: duLieu.noiDung.trim(),
    });
  }

  async xoaBinhLuan(idBinhLuan: string, nguoiDung: PayloadJwt) {
    const binhLuan = await this.khoBaiDang.timBinhLuanTheoId(idBinhLuan);
    if (!binhLuan) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy bình luận',
      });
    }

    const laAdmin =
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN ||
      nguoiDung.vaiTro === VaiTro.BAN_GIAM_HIEU;

    const laNguoiBinhLuan = binhLuan.idNguoiDung === nguoiDung.sub;

    let laGiaoVienLop = false;
    if (nguoiDung.vaiTro === VaiTro.GIAO_VIEN) {
      const hoSo = await this.prisma.hoSoGiaoVien.findUnique({
        where: { idNguoiDung: nguoiDung.sub },
      });
      laGiaoVienLop =
        !!hoSo && binhLuan.baiDang.lopHocPhan.idGiaoVien === hoSo.id;
    }

    if (!laAdmin && !laNguoiBinhLuan && !laGiaoVienLop) {
      throw new ForbiddenException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
        thongDiep: 'Bạn không có quyền xóa bình luận này',
      });
    }

    await this.khoBaiDang.xoaBinhLuan(idBinhLuan);
    return { thanhCong: true, thongDiep: 'Đã xóa bình luận thành công' };
  }
}
