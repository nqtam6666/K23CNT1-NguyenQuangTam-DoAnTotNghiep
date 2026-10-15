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
  TaoBaiDangInput,
  TaoBinhLuanInput,
  MaLoiNghiepVu,
} from '@lms/chung';

@Injectable()
export class DichVuBaiDangService {
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

  // ==========================================
  // BÀI ĐĂNG
  // ==========================================

  async layDanhSachBaiDang(idLopHocPhan: string, nguoiDung: PayloadJwt) {
    await this.kiemTraQuyenTruyCapLop(idLopHocPhan, nguoiDung);
    return this.khoBaiDang.layDanhSachTheoLop(idLopHocPhan);
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

    const baiDangMoi = await this.khoBaiDang.taoBaiDang({
      idLopHocPhan,
      idNguoiDung: nguoiDung.sub,
      noiDung: duLieu.noiDung.trim(),
      ghimDauTrang,
    });

    const tomTat =
      duLieu.noiDung.trim().length > 160
        ? `${duLieu.noiDung.trim().slice(0, 157)}...`
        : duLieu.noiDung.trim();

    void this.dichVuCaiDat?.phatThongBaoChoLopHocPhan({
      idLopHocPhan,
      idNguoiTao: nguoiDung.sub,
      tieuDe: ghimDauTrang
        ? `Thông báo ghim mới · ${lop.tenLopHocPhan}`
        : `Thông báo mới · ${lop.tenLopHocPhan}`,
      noiDung: tomTat,
      duongDan: `/lop-hoc/${idLopHocPhan}`,
      loaiSuKien: 'BAI_DANG',
    });

    return baiDangMoi;
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
