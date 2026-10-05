import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { KhoBaoLoiDongGopRepository } from './kho-bao-loi-dong-gop.repository';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import {
  TaoBaoLoiDongGopInput,
  XuLyBaoLoiDongGopInput,
  BoLocBaoLoiDongGopInput,
  PayloadJwt,
  VaiTro,
  MaLoiNghiepVu,
  LoaiThongBao,
} from '@lms/chung';

@Injectable()
export class DichVuBaoLoiDongGopService {
  private readonly nhatKy = new Logger(DichVuBaoLoiDongGopService.name);

  constructor(
    private readonly khoBaoLoi: KhoBaoLoiDongGopRepository,
    private readonly prisma: PrismaService,
  ) {}

  private laQuanTri(nguoiDung: PayloadJwt): boolean {
    return (
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN ||
      nguoiDung.vaiTro === VaiTro.BAN_GIAM_HIEU ||
      nguoiDung.vaiTro === VaiTro.GIAO_VU
    );
  }

  async taoBaoLoi(duLieu: TaoBaoLoiDongGopInput, nguoiDung: PayloadJwt) {
    const banGhi = await this.khoBaoLoi.tao(nguoiDung.sub, duLieu);

    // Ghi nhật ký hệ thống
    await this.prisma.nhatKyHeThong.create({
      data: {
        idNguoiDung: nguoiDung.sub,
        hanhDong: 'TAO_BAO_LOI_DONG_GOP',
        thucThe: 'BaoLoiDongGop',
        idThucThe: banGhi.id,
        chiTiet: {
          tieuDe: banGhi.tieuDe,
          loaiPhanHoi: banGhi.loaiPhanHoi,
          mucDoUuTien: banGhi.mucDoUuTien,
        },
      },
    });

    this.nhatKy.log(
      `Người dùng [${nguoiDung.hoTen}] đã gửi báo lỗi/đóng góp: "${banGhi.tieuDe}" (${banGhi.loaiPhanHoi})`,
    );

    return banGhi;
  }

  async layDanhSach(boLoc: BoLocBaoLoiDongGopInput, nguoiDung: PayloadJwt) {
    const laAdmin = this.laQuanTri(nguoiDung);
    // Anti-IDOR: Người dùng bình thường chỉ xem danh sách do chính mình gửi
    const idNguoiDungLoc = laAdmin ? undefined : nguoiDung.sub;

    const [danhSach, tongSo] = await Promise.all([
      this.khoBaoLoi.layDanhSach(boLoc, idNguoiDungLoc),
      this.khoBaoLoi.dem(boLoc, idNguoiDungLoc),
    ]);

    const tongSoTrang = Math.ceil(tongSo / boLoc.kichThuoc);

    return {
      danhSach,
      tongSo,
      trang: boLoc.trang,
      kichThuoc: boLoc.kichThuoc,
      tongSoTrang,
    };
  }

  async layChiTiet(id: string, nguoiDung: PayloadJwt) {
    const banGhi = await this.khoBaoLoi.timTheoId(id);
    if (!banGhi) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy bản ghi báo lỗi / đóng góp ý kiến',
      });
    }

    // Anti-IDOR: Kiểm tra quyền sở hữu nếu không phải Quản trị viên
    if (!this.laQuanTri(nguoiDung) && banGhi.idNguoiDung !== nguoiDung.sub) {
      throw new ForbiddenException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
        thongDiep: 'Bạn không có quyền xem thông tin báo lỗi này',
      });
    }

    return banGhi;
  }

  async xuLyBaoLoi(id: string, duLieu: XuLyBaoLoiDongGopInput, nguoiDung: PayloadJwt) {
    if (!this.laQuanTri(nguoiDung)) {
      throw new ForbiddenException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
        thongDiep: 'Chỉ Quản trị viên hoặc Giáo vụ mới có quyền xử lý báo lỗi / đóng góp',
      });
    }

    const banGhiHienTai = await this.khoBaoLoi.timTheoId(id);
    if (!banGhiHienTai) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy bản ghi báo lỗi / đóng góp',
      });
    }

    const banGhiCapNhat = await this.khoBaoLoi.capNhatXuLy(id, nguoiDung.sub, duLieu);

    // Gửi thông báo đến người gửi để thông tin về tiến độ xử lý
    try {
      await this.prisma.thongBao.create({
        data: {
          idNguoiDung: banGhiHienTai.idNguoiDung,
          tieuDe: `Cập nhật phản hồi: ${banGhiHienTai.tieuDe}`,
          noiDung: `Phản hồi/báo lỗi của bạn đã được chuyển sang trạng thái [${duLieu.trangThai}]. Nhận xét từ ban quản trị: "${duLieu.phanHoiXuLy}"`,
          loai: LoaiThongBao.HE_THONG,
          lienKet: '/bao-loi-dong-gop',
        },
      });
    } catch (err) {
      this.nhatKy.warn(`Không thể tạo thông báo tự động cho người dùng: ${(err as any)?.message}`);
    }

    return banGhiCapNhat;
  }

  async layThongKe(nguoiDung: PayloadJwt) {
    const laAdmin = this.laQuanTri(nguoiDung);
    const idNguoiDungLoc = laAdmin ? undefined : nguoiDung.sub;
    return this.khoBaoLoi.layThongKe(idNguoiDungLoc);
  }

  async xoa(id: string, nguoiDung: PayloadJwt) {
    const banGhi = await this.khoBaoLoi.timTheoId(id);
    if (!banGhi) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy bản ghi cần xóa',
      });
    }

    // Anti-IDOR: Chỉ tác giả hoặc Quản trị viên mới được xóa
    if (!this.laQuanTri(nguoiDung) && banGhi.idNguoiDung !== nguoiDung.sub) {
      throw new ForbiddenException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
        thongDiep: 'Bạn không có quyền xóa báo lỗi này',
      });
    }

    await this.khoBaoLoi.xoa(id);
    return { thanhCong: true, thongDiep: 'Đã xóa bản ghi báo lỗi / đóng góp thành công' };
  }
}
