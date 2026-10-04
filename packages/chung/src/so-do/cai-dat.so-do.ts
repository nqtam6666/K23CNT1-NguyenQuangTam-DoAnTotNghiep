import { z } from 'zod';

export const soDoCapNhatCaiDat = z.object({
  danhSachCaiDat: z.array(
    z.object({
      khoa: z.string().min(1, 'Khóa cài đặt không được để trống'),
      giaTri: z.string(),
    }),
  ),
});

export const soDoCapNhatMotCaiDat = z.object({
  giaTri: z.string(),
});
