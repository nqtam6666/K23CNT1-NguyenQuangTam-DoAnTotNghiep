import { AbilityBuilder, PureAbility, AbilityClass, ExtractSubjectType } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { HanhDong, DoiTuong, VaiTro, PayloadJwt } from '@lms/chung';

export type QuyenHanApp = PureAbility<[HanhDong, DoiTuong | any]>;
export const QuyenHanApp = PureAbility as AbilityClass<QuyenHanApp>;

@Injectable()
export class NhaMayQuyenHan {
  taoQuyenChoNguoiDung(nguoiDung: PayloadJwt): QuyenHanApp {
    const { can, cannot, build } = new AbilityBuilder<QuyenHanApp>(QuyenHanApp);

    if (nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN) {
      // Quản trị viên tối cao: Toàn quyền trên mọi đối tượng
      can(HanhDong.QuanLy, DoiTuong.TatCa);
    } else if (nguoiDung.vaiTro === VaiTro.BAN_GIAM_HIEU) {
      // Ban giám hiệu: Xem toàn bộ hệ thống và xuất báo cáo
      can(HanhDong.Doc, DoiTuong.TatCa);
      can(HanhDong.XuatBaoCao, DoiTuong.TatCa);
    } else if (nguoiDung.vaiTro === VaiTro.GIAO_VU) {
      // Giáo vụ: Quản lý chương trình học vụ, lớp học phần, phòng học, thời khóa biểu
      can(HanhDong.QuanLy, [
        DoiTuong.LopHocPhan,
        DoiTuong.LopHanhChinh,
        DoiTuong.ThoiKhoaBieu,
        DoiTuong.BuoiHoc,
        DoiTuong.GhiDanh,
      ]);
      can(HanhDong.Doc, DoiTuong.NguoiDung);
      can(HanhDong.Doc, DoiTuong.TatCa);
    } else if (nguoiDung.vaiTro === VaiTro.GIAO_VIEN) {
      // Giáo viên: Quản lý bài tập, bài giảng, điểm danh, chấm điểm, trợ lý AI
      can(HanhDong.Doc, DoiTuong.LopHocPhan);
      can(HanhDong.Doc, DoiTuong.BuoiHoc);
      can(HanhDong.Tao, [
        DoiTuong.BaiDang,
        DoiTuong.BinhLuan,
        DoiTuong.TaiLieu,
        DoiTuong.BaiTap,
        DoiTuong.CotDiem,
        DoiTuong.BanNhapAI,
        DoiTuong.PhienTroLy,
      ]);
      can(HanhDong.Sua, [
        DoiTuong.BaiDang,
        DoiTuong.BinhLuan,
        DoiTuong.TaiLieu,
        DoiTuong.BaiTap,
        DoiTuong.CotDiem,
        DoiTuong.BanNhapAI,
      ]);
      can(HanhDong.Xoa, [
        DoiTuong.BaiDang,
        DoiTuong.BinhLuan,
        DoiTuong.TaiLieu,
        DoiTuong.BaiTap,
        DoiTuong.BanNhapAI,
      ]);
      can(HanhDong.ChamDiem, [DoiTuong.BaiNop, DoiTuong.DiemSo]);
      can(HanhDong.DiemDanh, DoiTuong.BanGhiDiemDanh);
      can(HanhDong.Duyet, [DoiTuong.DonXinNghi, DoiTuong.BanNhapAI]);
      can(HanhDong.ThamGia, DoiTuong.PhongTrucTuyen);
      can([HanhDong.Doc, HanhDong.Sua], DoiTuong.NguoiDung);
    } else if (nguoiDung.vaiTro === VaiTro.HOC_SINH) {
      // Học sinh: Tham gia lớp, nộp bài, xem điểm, hỏi trợ lý AI, làm đơn nghỉ
      can(HanhDong.Doc, [
        DoiTuong.LopHocPhan,
        DoiTuong.BaiDang,
        DoiTuong.BinhLuan,
        DoiTuong.TaiLieu,
        DoiTuong.BaiTap,
        DoiTuong.BuoiHoc,
        DoiTuong.ThongBao,
        DoiTuong.BanGhiDiemDanh,
        DoiTuong.DiemSo,
      ]);
      can(HanhDong.Tao, [
        DoiTuong.BinhLuan,
        DoiTuong.BaiNop,
        DoiTuong.DonXinNghi,
        DoiTuong.PhienTroLy,
      ]);
      can(HanhDong.Sua, DoiTuong.BaiNop);
      can(HanhDong.ThamGia, DoiTuong.PhongTrucTuyen);
      can([HanhDong.Doc, HanhDong.Sua], DoiTuong.NguoiDung);
    } else if (nguoiDung.vaiTro === VaiTro.PHU_HUYNH) {
      // Phụ huynh: Theo dõi điểm danh, điểm số con em, nộp đơn xin nghỉ
      can(HanhDong.Doc, [
        DoiTuong.BanGhiDiemDanh,
        DoiTuong.DiemSo,
        DoiTuong.ThongBao,
        DoiTuong.ThoiKhoaBieu,
      ]);
      can(HanhDong.Tao, DoiTuong.DonXinNghi);
      can([HanhDong.Doc, HanhDong.Sua], DoiTuong.NguoiDung);
    }

    return build({
      detectSubjectType: (item) => {
        if (typeof item === 'string') return item as DoiTuong;
        return (item.constructor as ExtractSubjectType<any>).name as DoiTuong;
      },
    });
  }
}
