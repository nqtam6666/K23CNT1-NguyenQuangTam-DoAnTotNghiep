/**
 * Danh mục Enum trạng thái nghiệp vụ
 * Nguồn chuẩn: docs/thuat-ngu.md
 */

export enum TrangThaiDiemDanh {
  CO_MAT = 'CO_MAT',
  VANG_CO_PHEP = 'VANG_CO_PHEP',
  VANG_KHONG_PHEP = 'VANG_KHONG_PHEP',
  DI_MUON = 'DI_MUON',
}

export enum TrangThaiBaiNop {
  CHUA_NOP = 'CHUA_NOP',
  DA_NOP = 'DA_NOP',
  NOP_MUON = 'NOP_MUON',
  DA_CHAM = 'DA_CHAM',
  DA_TRA = 'DA_TRA',
}

export enum TrangThaiDonXinNghi {
  CHO_DUYET = 'CHO_DUYET',
  DA_DUYET = 'DA_DUYET',
  TU_CHOI = 'TU_CHOI',
}

export enum LoaiBanNhapAI {
  CAU_HOI = 'CAU_HOI',
  NHAN_XET = 'NHAN_XET',
  BAI_TAP = 'BAI_TAP',
  TOM_TAT = 'TOM_TAT',
}

export enum TrangThaiBanNhapAI {
  CHO_DUYET = 'CHO_DUYET',
  DA_DUYET = 'DA_DUYET',
  TU_CHOI = 'TU_CHOI',
}

export enum TrangThaiBuoiHoc {
  CHUA_BAT_DAU = 'CHUA_BAT_DAU',
  DANG_DIEN_RA = 'DANG_DIEN_RA',
  DA_KET_THUC = 'DA_KET_THUC',
  DA_HUY = 'DA_HUY',
}

export enum LoaiTaiLieu {
  GIAO_TRINH = 'GIAO_TRINH',
  BAI_GIANG = 'BAI_GIANG',
  SLIDE = 'SLIDE',
  TAI_LIEU_THAM_KHAO = 'TAI_LIEU_THAM_KHAO',
}

export enum HinhThucNop {
  TEP_TIN = 'TEP_TIN',
  VAN_BAN = 'VAN_BAN',
  LIEN_KET = 'LIEN_KET',
}

export enum LoaiCauHoi {
  TRAC_NGHIEM_MOT_DAP_AN = 'TRAC_NGHIEM_MOT_DAP_AN',
  TRAC_NGHIEM_NHIEU_DAP_AN = 'TRAC_NGHIEM_NHIEU_DAP_AN',
  DUNG_SAI = 'DUNG_SAI',
  TU_LUAN = 'TU_LUAN',
}

export enum LoaiThongBao {
  HE_THONG = 'HE_THONG',
  LOP_HOC = 'LOP_HOC',
  BAI_TAP = 'BAI_TAP',
  DIEM_SO = 'DIEM_SO',
  DIEM_DANH = 'DIEM_DANH',
  NHAC_NHO = 'NHAC_NHO',
}

export enum LoaiBaoLoiDongGop {
  BAO_LOI = 'BAO_LOI',
  DONG_GOP_Y_KIEN = 'DONG_GOP_Y_KIEN',
  HO_TRO_KY_THUAT = 'HO_TRO_KY_THUAT',
}

export enum MucDoUuTienBaoLoi {
  THAP = 'THAP',
  TRUNG_BINH = 'TRUNG_BINH',
  CAO = 'CAO',
  KHAN_CAP = 'KHAN_CAP',
}

export enum TrangThaiBaoLoi {
  CHO_TIEP_NHAN = 'CHO_TIEP_NHAN',
  DANG_XU_LY = 'DANG_XU_LY',
  DA_XU_LY = 'DA_XU_LY',
  TU_CHOI = 'TU_CHOI',
}

export enum CheDoKiemTra {
  LUYEN_TAP = 'LUYEN_TAP',
  THI_THU = 'THI_THU',
}

export enum TrangThaiBaiKiemTra {
  BAN_NHAP = 'BAN_NHAP',
  DANG_MO = 'DANG_MO',
  DA_DONG = 'DA_DONG',
}

export enum TrangThaiLuotLam {
  DANG_LAM = 'DANG_LAM',
  DA_NOP = 'DA_NOP',
  DA_CHAM = 'DA_CHAM',
}

export enum MucDoGiaiThich {
  CO_BAN = 'CO_BAN',
  TRUNG_BINH = 'TRUNG_BINH',
  NANG_CAO = 'NANG_CAO',
}

export enum MucDoKho {
  DE = 'DE',
  TRUNG_BINH = 'TRUNG_BINH',
  KHO = 'KHO',
}

export enum MucDoCanhBao {
  NGHIEM_TRONG = 'NGHIEM_TRONG',
  CAN_LUU_Y = 'CAN_LUU_Y',
  ON_DINH = 'ON_DINH',
}

export enum ChuDeBaiDang {
  THONG_BAO = 'THONG_BAO',
  HOI_DAP_BAI_HOC = 'HOI_DAP_BAI_HOC',
  THAO_LUAN_BAI_TAP = 'THAO_LUAN_BAI_TAP',
  ON_THI = 'ON_THI',
  CHIA_SE_TAI_LIEU = 'CHIA_SE_TAI_LIEU',
}
