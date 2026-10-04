import { SetMetadata } from '@nestjs/common';
import { HanhDong, DoiTuong } from '@lms/chung';

export interface YeuCauQuyenHan {
  hanhDong: HanhDong;
  doiTuong: DoiTuong;
}

export const KHOA_QUYEN_HAN = 'yeu_cau_quyen_han';
export const KiemTraQuyen = (hanhDong: HanhDong, doiTuong: DoiTuong) =>
  SetMetadata(KHOA_QUYEN_HAN, { hanhDong, doiTuong } as YeuCauQuyenHan);
