import { z } from 'zod';

export const yeuCauTokenLiveKitSchema = z.object({
  idBuoiHoc: z.string().uuid('ID buổi học không hợp lệ').optional(),
});

export type YeuCauTokenLiveKitInput = z.infer<typeof yeuCauTokenLiveKitSchema>;

export const batDauKetThucPhongHocSchema = z.object({
  dangMo: z.boolean(),
});

export type BatDauKetThucPhongHocInput = z.infer<typeof batDauKetThucPhongHocSchema>;

export const diemDanhThuCongSchema = z.object({
  idHocSinh: z.string().uuid('ID học sinh không hợp lệ'),
  trangThai: z.enum(['CO_MAT', 'VANG_CO_PHEP', 'VANG_KHONG_PHEP', 'DI_MUON']),
  ghiChu: z.string().max(255).optional(),
});

export type DiemDanhThuCongInput = z.infer<typeof diemDanhThuCongSchema>;
