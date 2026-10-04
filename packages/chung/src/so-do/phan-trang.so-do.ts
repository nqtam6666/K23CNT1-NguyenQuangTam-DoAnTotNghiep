import { z } from 'zod';

/**
 * Schema Zod cho tham số truy vấn phân trang, tìm kiếm và sắp xếp chung
 */
export const truyVanPhanTrangSchema = z.object({
  trang: z.coerce.number().int().min(1).default(1),
  kichThuoc: z.coerce.number().int().min(1).max(100).default(10),
  tuKhoa: z.string().trim().optional(),
  sapXepTheo: z.string().trim().default('ngayTao'),
  thuTu: z.enum(['asc', 'desc']).default('desc'),
});

export type TruyVanPhanTrangDto = z.infer<typeof truyVanPhanTrangSchema>;
