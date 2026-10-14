import { z } from 'zod';

export const taoCotDiemSchema = z.object({
  tenCotDiem: z
    .string()
    .trim()
    .min(2, 'Tên cột điểm tối thiểu 2 ký tự')
    .max(100, 'Tên cột điểm tối đa 100 ký tự'),
  heSo: z.number().min(0.5, 'Hệ số tối thiểu 0.5').max(10, 'Hệ số tối đa 10').default(1.0),
});

export type TaoCotDiemInput = z.infer<typeof taoCotDiemSchema>;

export const capNhatDiemSoSchema = z.object({
  idCotDiem: z.string().uuid('ID cột điểm không hợp lệ'),
  idHocSinh: z.string().uuid('ID học sinh không hợp lệ'),
  giaTri: z.number().min(0, 'Điểm tối thiểu là 0').max(10, 'Điểm tối đa là 10'),
  ghiChu: z.string().max(255).optional(),
});

export type CapNhatDiemSoInput = z.infer<typeof capNhatDiemSoSchema>;

export const luuBangDiemHangLoatSchema = z.object({
  danhSachDiem: z
    .array(capNhatDiemSoSchema)
    .min(1, 'Danh sách điểm cần lưu không được trống'),
});

export type LuuBangDiemHangLoatInput = z.infer<typeof luuBangDiemHangLoatSchema>;
