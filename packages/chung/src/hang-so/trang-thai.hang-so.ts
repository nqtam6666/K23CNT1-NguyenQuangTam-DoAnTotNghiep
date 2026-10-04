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
