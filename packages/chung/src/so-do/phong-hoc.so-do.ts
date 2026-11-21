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

export const taoMaDiemDanhSchema = z.object({
  thoiHanPhut: z.number().int().min(1, 'Tối thiểu 1 phút').max(120, 'Tối đa 120 phút').default(10),
});

export type TaoMaDiemDanhInput = z.infer<typeof taoMaDiemDanhSchema>;

export const diemDanhBangMaSchema = z.object({
  maDiemDanh: z
    .string()
    .trim()
    .min(4, 'Mã điểm danh phải từ 4 đến 10 ký tự')
    .max(10, 'Mã điểm danh tối đa 10 ký tự'),
});

export type DiemDanhBangMaInput = z.infer<typeof diemDanhBangMaSchema>;

export const diemDanhHangLoatSchema = z.object({
  danhSachDiemDanh: z
    .array(
      z.object({
        idHocSinh: z.string().uuid('ID học sinh không hợp lệ'),
        trangThai: z.enum(['CO_MAT', 'VANG_CO_PHEP', 'VANG_KHONG_PHEP', 'DI_MUON']),
        ghiChu: z.string().max(255).optional(),
      }),
    )
    .min(1, 'Danh sách điểm danh không được rỗng'),
});

export type DiemDanhHangLoatInput = z.infer<typeof diemDanhHangLoatSchema>;

export const taoDonXinNghiSchema = z.object({
  idBuoiHoc: z.string().uuid('Vui lòng chọn buổi học cần xin nghỉ'),
  lyDo: z.string().trim().min(5, 'Lý do xin nghỉ tối thiểu 5 ký tự').max(1000),
  minhChung: z.string().max(500).optional(),
});

export type TaoDonXinNghiInput = z.infer<typeof taoDonXinNghiSchema>;

export const duyetDonXinNghiSchema = z.object({
  trangThai: z.enum(['DA_DUYET', 'TU_CHOI']),
  phanHoi: z.string().max(255).optional(),
});

export type DuyetDonXinNghiInput = z.infer<typeof duyetDonXinNghiSchema>;

// ==========================================
// ĐIỂM DANH BẰNG KHUÔN MẶT
// ==========================================

export const vectorKhuonMatSchema = z
  .array(z.number().finite('Giá trị vector đặc trưng phải là số hữu hạn').min(-10).max(10))
  .length(128, 'Vector đặc trưng khuôn mặt phải có đúng 128 chiều');

export const dangKyKhuonMatSchema = z.object({
  vectorKhuonMat: vectorKhuonMatSchema,
  soMauChup: z.number().int().min(1).max(10).default(3),
  diemChatLuong: z.number().finite().min(0.4, 'Chất lượng ảnh khuôn mặt quá thấp').max(1).default(0.85),
  daXacThucNguoiThat: z.boolean().default(true),
});

export type DangKyKhuonMatInput = z.infer<typeof dangKyKhuonMatSchema>;

export const batTatDiemDanhKhuonMatSchema = z.object({
  batDiemDanhKhuonMat: z.boolean(),
  thoiHanPhut: z.number().int().min(1).max(180).default(15),
});

export type BatTatDiemDanhKhuonMatInput = z.infer<typeof batTatDiemDanhKhuonMatSchema>;

export const diemDanhKhuonMatSchema = z.object({
  vectorKhuonMat: vectorKhuonMatSchema,
  diemChatLuong: z.number().finite().min(0.4).max(1).default(0.85),
  daXacThucNguoiThat: z.boolean().refine((v) => v === true, {
    message: 'Cần hoàn tất bước xác thực người thật trên camera trước khi điểm danh',
  }),
});

export type DiemDanhKhuonMatInput = z.infer<typeof diemDanhKhuonMatSchema>;

export const diemDanhKhuonMatLopSchema = z.object({
  danhSachNhanDien: z
    .array(
      z.object({
        idHocSinh: z.string().uuid('ID học sinh không hợp lệ'),
        doTinCay: z.number().finite().min(0.5).max(1),
      }),
    )
    .min(1, 'Cần ít nhất 1 sinh viên được nhận diện để lưu điểm danh'),
});

export type DiemDanhKhuonMatLopInput = z.infer<typeof diemDanhKhuonMatLopSchema>;

