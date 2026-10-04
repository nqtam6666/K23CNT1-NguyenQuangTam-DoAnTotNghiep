import { z } from 'zod';

export const loaiTienIchSchema = z.enum([
  'THE_THONG_KE',
  'BIEU_DO',
  'HOAT_DONG_GAN_DAY',
  'VIEC_CAN_XU_LY',
  'LOI_TAT',
]);

export const trangThaiTienIchSchema = z.enum(['THANH_CONG', 'LOI']);

export const theThongKeSchema = z.object({
  id: z.string(),
  tieuDe: z.string(),
  giaTri: z.union([z.number(), z.string()]),
  donVi: z.string().optional(),
  moTa: z.string().optional(),
  xuHuong: z
    .object({
      huong: z.enum(['TANG', 'GIAM', 'TRUNG_TINH']),
      giaTriPhanTram: z.number().optional(),
      moTa: z.string().optional(),
    })
    .optional(),
  bieuTuong: z.string(),
  mauSac: z.enum(['xanh_duong', 'xanh_la', 'tim', 'cam', 'do']).optional(),
  duongDanChiTiet: z.string().optional(),
});

export const hoatDongGanDaySchema = z.object({
  id: z.string(),
  hanhDong: z.string(),
  thucThe: z.string(),
  idThucThe: z.string().optional(),
  tenNguoiThucHien: z.string(),
  thoiGian: z.string(),
  chiTiet: z.record(z.any()).optional(),
});

export const viecCanXuLySchema = z.object({
  id: z.string(),
  tieuDe: z.string(),
  moTa: z.string(),
  loai: z.enum(['CHAM_DIEM', 'DUYET_DON', 'NOP_BAI', 'DUYET_AI', 'XEP_LICH', 'KHAC']),
  mucDoUuTien: z.enum(['CAO', 'TRUNG_BINH', 'THAP']),
  thoiHan: z.string().optional(),
  duongDan: z.string(),
});

export const tienIchBangDieuKhienSchema = z.object({
  id: z.string(),
  loai: loaiTienIchSchema,
  tieuDe: z.string(),
  moTa: z.string().optional(),
  duongDanChiTiet: z.string().optional(),
  duLieu: z.any(),
  trangThai: trangThaiTienIchSchema,
  thongDiepLoi: z.string().optional(),
});

export const phanHoiBangDieuKhienSchema = z.object({
  tienIch: z.array(tienIchBangDieuKhienSchema),
  thoiGianTao: z.string(),
});

export const sucKhoeHeThongSchema = z.object({
  trangThai: z.enum(['HOAT_DONG_TOT', 'CANH_BAO', 'GAP_SU_CO']),
  dichVu: z.object({
    coSoDuLieu: z.enum(['SAN_SANG', 'LOI_KET_NOI']),
    boNhoDemRedis: z.enum(['SAN_SANG', 'LOI_KET_NOI']),
    luuTruMinIO: z.enum(['SAN_SANG', 'LOI_KET_NOI']),
    phongHocLiveKit: z.enum(['SAN_SANG', 'LOI_KET_NOI']),
  }),
  thoiGian: z.string(),
});
