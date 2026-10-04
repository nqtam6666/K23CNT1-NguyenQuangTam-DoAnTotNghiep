/**
 * Danh mục đối tượng / chủ thể phân quyền CASL (Subjects)
 * Tương ứng với tên các thực thể trong hệ thống LMS
 */
export enum DoiTuong {
  TatCa = 'all',
  NguoiDung = 'NguoiDung',
  HoSoHocSinh = 'HoSoHocSinh',
  HoSoGiaoVien = 'HoSoGiaoVien',
  NamHoc = 'NamHoc',
  HocKy = 'HocKy',
  MonHoc = 'MonHoc',
  LopHocPhan = 'LopHocPhan',
  LopHanhChinh = 'LopHanhChinh',
  GhiDanh = 'GhiDanh',
  ThoiKhoaBieu = 'ThoiKhoaBieu',
  BuoiHoc = 'BuoiHoc',
  PhongTrucTuyen = 'PhongTrucTuyen',
  BaiDang = 'BaiDang',
  BinhLuan = 'BinhLuan',
  TaiLieu = 'TaiLieu',
  BaiTap = 'BaiTap',
  BaiNop = 'BaiNop',
  BanGhiDiemDanh = 'BanGhiDiemDanh',
  NhatKyThamGia = 'NhatKyThamGia',
  DonXinNghi = 'DonXinNghi',
  CotDiem = 'CotDiem',
  DiemSo = 'DiemSo',
  TroLyAI = 'TroLyAI',
  PhienTroLy = 'PhienTroLy',
  TinNhanTroLy = 'TinNhanTroLy',
  DoanTaiLieu = 'DoanTaiLieu',
  BanNhapAI = 'BanNhapAI',
  NhatKySuDungAI = 'NhatKySuDungAI',
  ThongBao = 'ThongBao',
  NhatKyHeThong = 'NhatKyHeThong',
  CaiDatHeThong = 'CaiDatHeThong',
}

export type LoaiDoiTuong = `${DoiTuong}`;
