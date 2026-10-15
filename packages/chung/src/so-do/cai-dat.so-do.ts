import { z } from 'zod';

export const soDoCapNhatCaiDat = z.object({
  danhSachCaiDat: z.array(
    z.object({
      khoa: z.string().min(1, 'Khóa cài đặt không được để trống').max(120),
      giaTri: z.string().max(10000, 'Giá trị cài đặt vượt quá độ dài cho phép'),
    }),
  ),
});

export const soDoCapNhatMotCaiDat = z.object({
  giaTri: z.string().max(10000, 'Giá trị cài đặt vượt quá độ dài cho phép'),
});

export const soDoKhoiPhucCaiDat = z.object({
  nhom: z.string().max(50).optional(),
  danhSachKhoa: z.array(z.string().min(1).max(120)).optional(),
});

export const soDoKiemTraKetNoiSmtp = z.object({
  mayChuSmtp: z.string().max(255).optional(),
  congSmtp: z.coerce.number().int().min(1).max(65535).optional(),
  taiKhoanSmtp: z.string().max(255).optional(),
  matKhauUngDungSmtp: z.string().max(255).optional(),
  emailNguoiGui: z.string().max(255).optional(),
  tenHienThiNguoiGui: z.string().max(255).optional(),
  emailNhanThuNghiem: z.string().email('Địa chỉ email nhận thử nghiệm không hợp lệ').optional(),
});

export const soDoTuyChonCaNhan = z.object({
  cheDoGiaoDien: z.enum(['sang', 'toi', 'he_thong']).optional(),
  thuGonThanhBenMacDinh: z.boolean().optional(),
  anThongTinLienHeVoiLop: z.boolean().optional(),
  thongBao: z
    .object({
      baiTapVaHanNop: z.boolean().optional(),
      diemSoVaKetQua: z.boolean().optional(),
      diemDanhVaChuyenCan: z.boolean().optional(),
      lichHocVaPhongTrucTuyen: z.boolean().optional(),
      amThanhThongBao: z.boolean().optional(),
      kenhNenTang: z.boolean().optional(),
      kenhWindows: z.boolean().optional(),
      kenhGmail: z.boolean().optional(),
      emailNhanThongBao: z.string().max(255).optional(),
    })
    .optional(),
  troLyAi: z
    .object({
      luuLichSuHoiThoai: z.boolean().optional(),
      doChiTietPhanHoi: z.enum(['ngan_gon', 'can_bang', 'chi_tiet']).optional(),
    })
    .optional(),
  phongHoc: z
    .object({
      batMicroKhiVaoPhong: z.boolean().optional(),
      batCameraKhiVaoPhong: z.boolean().optional(),
    })
    .optional(),
});
