/**
 * Danh mục vai trò người dùng trong hệ thống LMS
 * Nguồn chuẩn: docs/thuat-ngu.md
 */
export enum VaiTro {
  QUAN_TRI_VIEN = 'QUAN_TRI_VIEN',
  BAN_GIAM_HIEU = 'BAN_GIAM_HIEU',
  GIAO_VU = 'GIAO_VU',
  GIAO_VIEN = 'GIAO_VIEN',
  HOC_SINH = 'HOC_SINH',
  PHU_HUYNH = 'PHU_HUYNH',
}

export const DANH_SACH_VAI_TRO = [
  VaiTro.QUAN_TRI_VIEN,
  VaiTro.BAN_GIAM_HIEU,
  VaiTro.GIAO_VU,
  VaiTro.GIAO_VIEN,
  VaiTro.HOC_SINH,
  VaiTro.PHU_HUYNH,
] as const;
