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

export const NHAN_VAI_TRO: Record<VaiTro, string> = {
  [VaiTro.QUAN_TRI_VIEN]: 'Quản trị viên',
  [VaiTro.BAN_GIAM_HIEU]: 'Ban giám hiệu',
  [VaiTro.GIAO_VU]: 'Giáo vụ',
  [VaiTro.GIAO_VIEN]: 'Giáo viên',
  [VaiTro.HOC_SINH]: 'Học sinh',
  [VaiTro.PHU_HUYNH]: 'Phụ huynh',
};

export function layNhanVaiTro(vaiTro?: string | null): string {
  if (!vaiTro) return '';
  return NHAN_VAI_TRO[vaiTro as VaiTro] || vaiTro;
}
