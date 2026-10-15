export interface CaiDatHeThong {
  id: string;
  khoa: string;
  giaTri: string;
  nhom: string;
  moTa?: string | null;
  kieuDuLieu: string;
  congKhai: boolean;
  ngayTao: string | Date;
  ngayCapNhat: string | Date;
}

export type BanDoCaiDat = Record<string, string>;

export interface CapNhatCaiDatInput {
  danhSachCaiDat: Array<{
    khoa: string;
    giaTri: string;
  }>;
}

export interface CapNhatMotCaiDatInput {
  giaTri: string;
}

export interface KhoiPhucCaiDatInput {
  nhom?: string;
  danhSachKhoa?: string[];
}

export interface KiemTraKetNoiSmtpInput {
  mayChuSmtp?: string;
  congSmtp?: number;
  taiKhoanSmtp?: string;
  matKhauUngDungSmtp?: string;
  emailNguoiGui?: string;
  tenHienThiNguoiGui?: string;
  emailNhanThuNghiem?: string;
}

export interface TuyChonCaNhan {
  cheDoGiaoDien: 'sang' | 'toi' | 'he_thong';
  thuGonThanhBenMacDinh: boolean;
  anThongTinLienHeVoiLop: boolean;
  thongBao: {
    baiTapVaHanNop: boolean;
    diemSoVaKetQua: boolean;
    diemDanhVaChuyenCan: boolean;
    lichHocVaPhongTrucTuyen: boolean;
    amThanhThongBao: boolean;
    kenhNenTang: boolean;
    kenhWindows: boolean;
    kenhGmail: boolean;
    emailNhanThongBao?: string;
  };
  troLyAi: {
    luuLichSuHoiThoai: boolean;
    doChiTietPhanHoi: 'ngan_gon' | 'can_bang' | 'chi_tiet';
  };
  phongHoc: {
    batMicroKhiVaoPhong: boolean;
    batCameraKhiVaoPhong: boolean;
  };
}

export const TUY_CHON_CA_NHAN_MAC_DINH: TuyChonCaNhan = {
  cheDoGiaoDien: 'sang',
  thuGonThanhBenMacDinh: false,
  anThongTinLienHeVoiLop: false,
  thongBao: {
    baiTapVaHanNop: true,
    diemSoVaKetQua: true,
    diemDanhVaChuyenCan: true,
    lichHocVaPhongTrucTuyen: true,
    amThanhThongBao: true,
    kenhNenTang: true,
    kenhWindows: true,
    kenhGmail: true,
    emailNhanThongBao: '',
  },
  troLyAi: {
    luuLichSuHoiThoai: true,
    doChiTietPhanHoi: 'can_bang',
  },
  phongHoc: {
    batMicroKhiVaoPhong: false,
    batCameraKhiVaoPhong: false,
  },
};

export type MaNhomCaiDat =
  | 'chung'
  | 'giao_dien'
  | 'hoc_vu'
  | 'diem_danh'
  | 'phong_hoc'
  | 'bai_tap'
  | 'tro_ly_ai'
  | 'thong_bao'
  | 'bao_mat'
  | 'email'
  | 'khac';

export type KieuDieuKhienCaiDat =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'select'
  | 'password'
  | 'file-anh'
  | 'json'
  | 'color';

export interface MauChuDaoChuan {
  maHex: string;
  maHexToi: string;
  nenNhatSang: string;
  nenNhatToi: string;
  ten: string;
  moTaNgan: string;
}

/**
 * Bảng màu nhấn chủ đạo chuẩn Warm Minimal (tuyệt đối không có màu tím/indigo/violet/fuchsia)
 */
export const DANH_SACH_MAU_CHU_DAO_CHUAN: MauChuDaoChuan[] = [
  {
    maHex: '#059669',
    maHexToi: '#34D399',
    nenNhatSang: '#E6F6EF',
    nenNhatToi: '#12372B',
    ten: 'Xanh ngọc lục bảo',
    moTaNgan: 'Chuẩn mặc định',
  },
  {
    maHex: '#0D9488',
    maHexToi: '#2DD4BF',
    nenNhatSang: '#E6F7F5',
    nenNhatToi: '#113634',
    ten: 'Xanh cổ vịt trầm',
    moTaNgan: 'Điềm tĩnh, kỹ thuật',
  },
  {
    maHex: '#0284C7',
    maHexToi: '#38BDF8',
    nenNhatSang: '#E6F4FB',
    nenNhatToi: '#112F42',
    ten: 'Xanh dương học thuật',
    moTaNgan: 'Rõ ràng, hiện đại',
  },
  {
    maHex: '#15803D',
    maHexToi: '#4ADE80',
    nenNhatSang: '#E8F6EC',
    nenNhatToi: '#133522',
    ten: 'Xanh rừng tùng',
    moTaNgan: 'Cổ điển, học đường',
  },
  {
    maHex: '#B45309',
    maHexToi: '#FBBF24',
    nenNhatSang: '#FDF3E6',
    nenNhatToi: '#3B2610',
    ten: 'Hổ phách cổ điển',
    moTaNgan: 'Ấm áp, biên tập',
  },
  {
    maHex: '#C2410C',
    maHexToi: '#FB923C',
    nenNhatSang: '#FCEEE8',
    nenNhatToi: '#3D1F14',
    ten: 'Đất nung ấm',
    moTaNgan: 'Nổi bật, thủ công',
  },
  {
    maHex: '#374151',
    maHexToi: '#9CA3AF',
    nenNhatSang: '#EFECE6',
    nenNhatToi: '#2B2D31',
    ten: 'Than chì tối giản',
    moTaNgan: 'Đơn sắc, tập trung',
  },
];

/**
 * Kiểm tra mã màu HEX hợp lệ và chặn dải màu tím / indigo / violet / fuchsia (Hue 245° - 335°)
 */
export function kiemTraMauChuDaoHopLe(maHex: string): { hopLe: boolean; thongDiep?: string } {
  const chuan = (maHex || '').trim().toUpperCase();
  if (!/^#[0-9A-F]{6}$/.test(chuan)) {
    return { hopLe: false, thongDiep: 'Mã màu phải có định dạng #RRGGBB (ví dụ: #059669).' };
  }
  const r = parseInt(chuan.slice(1, 3), 16) / 255;
  const g = parseInt(chuan.slice(3, 5), 16) / 255;
  const b = parseInt(chuan.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  // Chặn dải màu tím, indigo, violet, fuchsia (245° -> 335° với độ bão hòa > 15%)
  if (s > 0.15 && h >= 245 && h <= 335) {
    return {
      hopLe: false,
      thongDiep:
        'Bảng màu hệ thống không cho phép tông màu tím / violet / indigo. Vui lòng chọn tông xanh ngọc, xanh dương, hổ phách hoặc than chì.',
    };
  }

  if (l > 0.82) {
    return {
      hopLe: false,
      thongDiep: 'Màu quá sáng, không đủ độ tương phản chữ trên nền sáng.',
    };
  }

  return { hopLe: true };
}

/**
 * Nội suy bộ 4 biến màu (--accent sáng/tối và --accent-soft sáng/tối) từ mã HEX màu chủ đạo
 */
export function tinhBangMauChuDaoTuHex(maHex?: string | null): {
  maHex: string;
  maHexToi: string;
  nenNhatSang: string;
  nenNhatToi: string;
} {
  const macDinh = DANH_SACH_MAU_CHU_DAO_CHUAN[0];
  const chuan = (maHex || '').trim().toUpperCase();
  const mauCoSan = DANH_SACH_MAU_CHU_DAO_CHUAN.find((m) => m.maHex.toUpperCase() === chuan);
  if (mauCoSan) {
    return {
      maHex: mauCoSan.maHex,
      maHexToi: mauCoSan.maHexToi,
      nenNhatSang: mauCoSan.nenNhatSang,
      nenNhatToi: mauCoSan.nenNhatToi,
    };
  }

  if (!kiemTraMauChuDaoHopLe(chuan).hopLe) {
    return {
      maHex: macDinh.maHex,
      maHexToi: macDinh.maHexToi,
      nenNhatSang: macDinh.nenNhatSang,
      nenNhatToi: macDinh.nenNhatToi,
    };
  }

  const r = parseInt(chuan.slice(1, 3), 16);
  const g = parseInt(chuan.slice(3, 5), 16);
  const b = parseInt(chuan.slice(5, 7), 16);

  const phaMau = (
    r1: number,
    g1: number,
    b1: number,
    r2: number,
    g2: number,
    b2: number,
    tyLe1: number,
  ) => {
    const rm = Math.round(r1 * tyLe1 + r2 * (1 - tyLe1));
    const gm = Math.round(g1 * tyLe1 + g2 * (1 - tyLe1));
    const bm = Math.round(b1 * tyLe1 + b2 * (1 - tyLe1));
    return `#${rm.toString(16).padStart(2, '0')}${gm.toString(16).padStart(2, '0')}${bm.toString(16).padStart(2, '0')}`.toUpperCase();
  };

  return {
    maHex: chuan,
    maHexToi: phaMau(r, g, b, 255, 255, 255, 0.62),
    nenNhatSang: phaMau(r, g, b, 250, 248, 245, 0.12),
    nenNhatToi: phaMau(r, g, b, 24, 27, 30, 0.24),
  };
}

export interface DinhNghiaKhoaCaiDat {
  khoa: string;
  khoaCu?: string;
  nhan: string;
  moTa: string;
  nhom: MaNhomCaiDat;
  phanNhom: string;
  tieuDePhanNhom: string;
  moTaPhanNhom?: string;
  kieu: KieuDieuKhienCaiDat;
  kieuDuLieuDb: 'CHUOI' | 'SO' | 'LOGIC' | 'BOOLEAN' | 'JSON';
  macDinh: string;
  congKhai: boolean;
  biMat?: boolean;
  nguyHiem?: boolean;
  canhBaoNguyHiem?: string;
  mucUuTien: 'BAT_BUOC' | 'NEN_CO' | 'TUY_CHON';
  placeholder?: string;
  donVi?: string;
  min?: number;
  max?: number;
  buocNhay?: number;
  dinhDangChoPhep?: string;
  khuyenNghi?: string;
  tuyChonSelect?: Array<{ giaTri: string; nhan: string }>;
  luaChon?: Array<{ giaTri: string; nhan: string }>;
  goiYNhanh?: Array<{ giaTri: string; nhan: string }>;
}

/**
 * Danh mục chuẩn toàn bộ khóa cài đặt hệ thống (Đợt 1 + Đợt 2 tinh gọn)
 * Quy ước đặt tên: nhom.ten_khoa (tiếng Việt không dấu, snake_case)
 */
export const DANH_MUC_CAI_DAT_HE_THONG: DinhNghiaKhoaCaiDat[] = [
  // =========================================================================
  // 1. NHÓM CHUNG (TRƯỜNG HỌC, NHẬN DIỆN & THÔNG TIN ĐỒ ÁN)
  // =========================================================================
  {
    khoa: 'chung.ten_he_thong',
    khoaCu: 'TEN_HE_THONG',
    nhan: 'Tên hệ thống LMS',
    moTa: 'Tên hiển thị chính thức của hệ thống trên thanh điều hướng, tiêu đề trang và thông báo.',
    nhom: 'chung',
    phanNhom: 'dinh-danh-truong',
    tieuDePhanNhom: 'Định danh trường học',
    moTaPhanNhom: 'Tên gọi chính thức và khẩu hiệu đào tạo xuất hiện xuyên suốt ứng dụng.',
    kieu: 'text',
    kieuDuLieuDb: 'CHUOI',
    macDinh: 'SmartClass AI',
    congKhai: true,
    mucUuTien: 'BAT_BUOC',
    placeholder: 'Ví dụ: SmartClass AI',
  },
  {
    khoa: 'chung.ten_truong',
    khoaCu: 'TEN_TRUONG',
    nhan: 'Tên trường / Cơ sở đào tạo',
    moTa: 'Tên đơn vị giáo dục chủ quản vận hành hệ thống quản lý học tập.',
    nhom: 'chung',
    phanNhom: 'dinh-danh-truong',
    tieuDePhanNhom: 'Định danh trường học',
    kieu: 'text',
    kieuDuLieuDb: 'CHUOI',
    macDinh: 'Trường Đại học Nguyễn Trãi',
    congKhai: true,
    mucUuTien: 'BAT_BUOC',
    placeholder: 'Ví dụ: Trường Đại học Nguyễn Trãi',
  },
  {
    khoa: 'chung.khau_hieu',
    khoaCu: 'KHAU_HIEU',
    nhan: 'Khẩu hiệu đào tạo',
    moTa: 'Thông điệp ngắn hiển thị tại màn hình đăng nhập, trang cổng thông tin và chân trang.',
    nhom: 'chung',
    phanNhom: 'dinh-danh-truong',
    tieuDePhanNhom: 'Định danh trường học',
    kieu: 'text',
    kieuDuLieuDb: 'CHUOI',
    macDinh: 'Hệ thống Lớp học số tích hợp Trí tuệ nhân tạo',
    congKhai: true,
    mucUuTien: 'BAT_BUOC',
    placeholder: 'Ví dụ: Hệ thống Lớp học số tích hợp Trí tuệ nhân tạo',
  },
  {
    khoa: 'chung.url_logo',
    khoaCu: 'URL_LOGO',
    nhan: 'Logo chính thức của trường',
    moTa: 'Hình ảnh đại diện thương hiệu hiển thị trên thanh bên điều hướng và màn hình đăng nhập.',
    nhom: 'chung',
    phanNhom: 'bieu-trung-hinh-anh',
    tieuDePhanNhom: 'Biểu trưng & Hình ảnh',
    moTaPhanNhom: 'Tải lên tệp ảnh từ máy tính (kiểm tra định dạng nhị phân an toàn, tối đa 5MB).',
    kieu: 'file-anh',
    kieuDuLieuDb: 'CHUOI',
    macDinh: '',
    congKhai: true,
    mucUuTien: 'BAT_BUOC',
    dinhDangChoPhep: '.png,.jpg,.jpeg,.svg,.webp',
    khuyenNghi: 'Khuyên dùng PNG hoặc SVG nền trong suốt, kích thước vuông hoặc ngang (tối đa 5MB)',
  },
  {
    khoa: 'chung.url_favicon',
    khoaCu: 'URL_FAVICON',
    nhan: 'Biểu tượng tab trình duyệt (Favicon)',
    moTa: 'Biểu tượng nhỏ hiển thị trên thanh tab của trình duyệt web.',
    nhom: 'chung',
    phanNhom: 'bieu-trung-hinh-anh',
    tieuDePhanNhom: 'Biểu trưng & Hình ảnh',
    kieu: 'file-anh',
    kieuDuLieuDb: 'CHUOI',
    macDinh: '',
    congKhai: true,
    mucUuTien: 'BAT_BUOC',
    dinhDangChoPhep: '.ico,.png,.svg',
    khuyenNghi: 'Khuyên dùng ICO hoặc PNG vuông tỷ lệ 1:1 (32x32px hoặc 48x48px)',
  },
  {
    khoa: 'chung.url_bieu_tuong_thu_gon',
    khoaCu: 'URL_ICON',
    nhan: 'Biểu tượng thanh bên thu gọn',
    moTa: 'Biểu tượng vuông dự phòng khi thanh bên thu gọn hoặc chưa tải lên Logo chính thức.',
    nhom: 'chung',
    phanNhom: 'bieu-trung-hinh-anh',
    tieuDePhanNhom: 'Biểu trưng & Hình ảnh',
    kieu: 'file-anh',
    kieuDuLieuDb: 'CHUOI',
    macDinh: '',
    congKhai: true,
    mucUuTien: 'NEN_CO',
    dinhDangChoPhep: '.png,.jpg,.jpeg,.svg,.webp',
    khuyenNghi: 'Khuyên dùng PNG hoặc SVG vuông tỷ lệ 1:1 (64x64px)',
  },
  {
    khoa: 'chung.banner_tieu_de',
    khoaCu: 'BANNER_TIEU_DE',
    nhan: 'Tiêu đề giới thiệu trang chủ',
    moTa: 'Dòng tiêu đề chính hiển thị trên trang cổng thông tin trường học.',
    nhom: 'chung',
    phanNhom: 'cong-thong-tin',
    tieuDePhanNhom: 'Cổng thông tin & Liên hệ',
    moTaPhanNhom: 'Thông điệp giới thiệu và kênh liên hệ hỗ trợ học vụ cho giảng viên, học sinh.',
    kieu: 'text',
    kieuDuLieuDb: 'CHUOI',
    macDinh: 'SmartClass AI – Hệ thống Lớp học số tích hợp Trí tuệ nhân tạo',
    congKhai: true,
    mucUuTien: 'NEN_CO',
  },
  {
    khoa: 'chung.banner_mo_ta',
    khoaCu: 'BANNER_MO_TA',
    nhan: 'Mô tả giới thiệu trang chủ',
    moTa: 'Đoạn văn tóm tắt chức năng cốt lõi của hệ thống đào tạo trên trang cổng thông tin.',
    nhom: 'chung',
    phanNhom: 'cong-thong-tin',
    tieuDePhanNhom: 'Cổng thông tin & Liên hệ',
    kieu: 'textarea',
    kieuDuLieuDb: 'CHUOI',
    macDinh:
      'Nghiên cứu, thiết kế và phát triển hệ thống lớp học số tích hợp trí tuệ nhân tạo SmartClass AI: Điểm danh thông minh, luyện tập, thi thử và quản lý kết quả học phần (K23CNT1 - Nguyễn Quang Tâm).',
    congKhai: true,
    mucUuTien: 'NEN_CO',
  },
  {
    khoa: 'chung.email_lien_he',
    khoaCu: 'EMAIL_LIEN_HE',
    nhan: 'Email hỗ trợ học vụ',
    moTa: 'Địa chỉ email tiếp nhận yêu cầu hỗ trợ kỹ thuật và giải đáp học vụ.',
    nhom: 'chung',
    phanNhom: 'cong-thong-tin',
    tieuDePhanNhom: 'Cổng thông tin & Liên hệ',
    kieu: 'text',
    kieuDuLieuDb: 'CHUOI',
    macDinh: 'nguyenquangtam179@gmail.com',
    congKhai: true,
    mucUuTien: 'BAT_BUOC',
    placeholder: 'daotao@truong.edu.vn',
  },
  {
    khoa: 'chung.so_dien_thoai_lien_he',
    khoaCu: 'SO_DIEN_THOAI',
    nhan: 'Số điện thoại trực ban',
    moTa: 'Số điện thoại liên hệ phòng đào tạo hoặc bộ phận hỗ trợ kỹ thuật.',
    nhom: 'chung',
    phanNhom: 'cong-thong-tin',
    tieuDePhanNhom: 'Cổng thông tin & Liên hệ',
    kieu: 'text',
    kieuDuLieuDb: 'CHUOI',
    macDinh: '0987654321',
    congKhai: true,
    mucUuTien: 'BAT_BUOC',
    placeholder: '0987654321',
  },
  {
    khoa: 'chung.tac_gia_do_an',
    khoaCu: 'TAC_GIA',
    nhan: 'Họ và tên tác giả đồ án',
    moTa: 'Sinh viên thực hiện đề tài đồ án tốt nghiệp.',
    nhom: 'chung',
    phanNhom: 'thong-tin-do-an',
    tieuDePhanNhom: 'Thông tin đồ án',
    moTaPhanNhom: 'Thông tin định danh sinh viên nghiên cứu và phát triển hệ thống.',
    kieu: 'text',
    kieuDuLieuDb: 'CHUOI',
    macDinh: 'Nguyễn Quang Tâm',
    congKhai: true,
    mucUuTien: 'NEN_CO',
  },
  {
    khoa: 'chung.ma_so_sinh_vien',
    khoaCu: 'MSSV',
    nhan: 'Mã số sinh viên (MSSV)',
    moTa: 'Mã định danh sinh viên thực hiện đề tài.',
    nhom: 'chung',
    phanNhom: 'thong-tin-do-an',
    tieuDePhanNhom: 'Thông tin đồ án',
    kieu: 'text',
    kieuDuLieuDb: 'CHUOI',
    macDinh: '2310900093',
    congKhai: true,
    mucUuTien: 'NEN_CO',
  },
  {
    khoa: 'chung.ma_lop_khoa',
    khoaCu: 'MA_LOP_KHOA',
    nhan: 'Lớp hành chính / Khóa đào tạo',
    moTa: 'Mã lớp chuyên ngành và khóa đào tạo của sinh viên.',
    nhom: 'chung',
    phanNhom: 'thong-tin-do-an',
    tieuDePhanNhom: 'Thông tin đồ án',
    kieu: 'text',
    kieuDuLieuDb: 'CHUOI',
    macDinh: 'K23CNT1',
    congKhai: true,
    mucUuTien: 'NEN_CO',
  },

  // =========================================================================
  // 1B. NHÓM GIAO DIỆN & HIỂN THỊ (MÀU CHỦ ĐẠO, SÁNG/TỐI, BÔI ĐEN, BỐ CỤC)
  // =========================================================================
  {
    khoa: 'giao_dien.che_do_sang_toi_mac_dinh',
    nhan: 'Chế độ Sáng / Tối mặc định',
    moTa: 'Chế độ hiển thị mặc định cho người dùng truy cập lần đầu hoặc chưa tự chọn giao diện cá nhân.',
    nhom: 'giao_dien',
    phanNhom: 'bang-mau-va-che-do',
    tieuDePhanNhom: 'Bảng màu & Chế độ Sáng / Tối',
    moTaPhanNhom:
      'Quản lý chế độ nền Sáng/Tối mặc định, bảng màu nhấn chủ đạo chuẩn Warm Minimal và kiểu tô sáng văn bản toàn hệ thống.',
    kieu: 'select',
    kieuDuLieuDb: 'CHUOI',
    macDinh: 'sang',
    congKhai: true,
    mucUuTien: 'BAT_BUOC',
    luaChon: [
      { giaTri: 'sang', nhan: 'Giao diện Sáng (Nền giấy ấm #FAF8F5)' },
      { giaTri: 'toi', nhan: 'Giao diện Tối (Nền than ấm #111315)' },
      { giaTri: 'he_thong', nhan: 'Tự động theo cài đặt Hệ điều hành' },
    ],
  },
  {
    khoa: 'giao_dien.cho_phep_doi_che_do_sang_toi',
    nhan: 'Cho phép người dùng tự chuyển đổi Sáng / Tối',
    moTa: 'Khi tắt, nút chuyển đổi Sáng/Tối trên thanh đầu trang sẽ ẩn và toàn bộ người dùng cố định theo chế độ mặc định của trường.',
    nhom: 'giao_dien',
    phanNhom: 'bang-mau-va-che-do',
    tieuDePhanNhom: 'Bảng màu & Chế độ Sáng / Tối',
    kieu: 'boolean',
    kieuDuLieuDb: 'BOOLEAN',
    macDinh: 'true',
    congKhai: true,
    mucUuTien: 'NEN_CO',
  },
  {
    khoa: 'giao_dien.mau_chu_dao',
    khoaCu: 'MAU_CHU_DAO',
    nhan: 'Màu nhấn chủ đạo toàn hệ thống (Accent Color)',
    moTa: 'Áp dụng tức thì cho nút chính, viền đang chọn, thanh điều hướng, huy hiệu trạng thái và điểm nhấn số liệu (chặn tông màu tím/indigo theo quy chuẩn thiết kế).',
    nhom: 'giao_dien',
    phanNhom: 'bang-mau-va-che-do',
    tieuDePhanNhom: 'Bảng màu & Chế độ Sáng / Tối',
    kieu: 'color',
    kieuDuLieuDb: 'CHUOI',
    macDinh: '#059669',
    congKhai: true,
    mucUuTien: 'BAT_BUOC',
    placeholder: '#059669',
  },
  {
    khoa: 'giao_dien.mau_boi_den_van_ban',
    nhan: 'Kiểu tô sáng khi bôi đen văn bản (Text Selection)',
    moTa: 'Phong cách màu nền và chữ khi người dùng quét chuột chọn văn bản, mã nguồn hoặc tài liệu bài giảng.',
    nhom: 'giao_dien',
    phanNhom: 'bang-mau-va-che-do',
    tieuDePhanNhom: 'Bảng màu & Chế độ Sáng / Tối',
    kieu: 'select',
    kieuDuLieuDb: 'CHUOI',
    macDinh: 'dam',
    congKhai: true,
    mucUuTien: 'NEN_CO',
    luaChon: [
      { giaTri: 'dam', nhan: 'Sắc nét — Nền màu chủ đạo đậm, chữ trắng nổi bật' },
      { giaTri: 'diu', nhan: 'Dịu mắt — Nền màu chủ đạo pha trong suốt 26%, giữ nguyên màu chữ' },
      { giaTri: 'than_am', nhan: 'Biên tập cổ điển — Nền than ấm tương phản cao (#1C1917)' },
    ],
  },
  {
    khoa: 'giao_dien.co_chu_co_ban_px',
    nhan: 'Cỡ chữ nội dung cơ bản (Base Font Size)',
    moTa: 'Kích thước chữ mặc định của toàn bộ văn bản và bảng biểu (JetBrains Mono & Be Vietnam Pro).',
    nhom: 'giao_dien',
    phanNhom: 'bo-cuc-va-co-chu',
    tieuDePhanNhom: 'Bố cục, Thanh bên & Cỡ chữ',
    moTaPhanNhom:
      'Tinh chỉnh kích thước chữ, mật độ khoảng cách dòng trong bảng dữ liệu, trạng thái thanh điều hướng bên trái và độ bo góc.',
    kieu: 'select',
    kieuDuLieuDb: 'CHUOI',
    macDinh: '14',
    congKhai: true,
    mucUuTien: 'NEN_CO',
    donVi: 'px',
    luaChon: [
      { giaTri: '13.5', nhan: '13.5px — Gọn gàng, tối ưu mật độ thông tin kỹ thuật' },
      { giaTri: '14', nhan: '14px — Chuẩn mực, cân bằng độ dễ đọc (Khuyên dùng)' },
      { giaTri: '15', nhan: '15px — Rõ nét, thoải mái cho màn hình độ phân giải cao' },
    ],
  },
  {
    khoa: 'giao_dien.mat_do_hien_thi',
    nhan: 'Mật độ hiển thị bảng và danh sách (UI Density)',
    moTa: 'Điều chỉnh khoảng đệm (padding) của các hàng dữ liệu, danh sách lớp học, bảng điểm và thẻ thông tin.',
    nhom: 'giao_dien',
    phanNhom: 'bo-cuc-va-co-chu',
    tieuDePhanNhom: 'Bố cục, Thanh bên & Cỡ chữ',
    kieu: 'select',
    kieuDuLieuDb: 'CHUOI',
    macDinh: 'chuan',
    congKhai: true,
    mucUuTien: 'NEN_CO',
    luaChon: [
      { giaTri: 'gon', nhan: 'Thu gọn (Compact) — Hiển thị được nhiều dòng dữ liệu hơn' },
      { giaTri: 'chuan', nhan: 'Tiêu chuẩn (Default) — Khoảng cách cân đối' },
      { giaTri: 'thoang', nhan: 'Thoáng đãng (Comfortable) — Rộng rãi, dễ quan sát' },
    ],
  },
  {
    khoa: 'giao_dien.thu_gon_thanh_ben_mac_dinh',
    nhan: 'Thu gọn thanh điều hướng bên trái mặc định',
    moTa: 'Khi bật, thanh bên (Sidebar) sẽ ở trạng thái thu gọn chỉ hiện biểu tượng cho người dùng mới mở trang.',
    nhom: 'giao_dien',
    phanNhom: 'bo-cuc-va-co-chu',
    tieuDePhanNhom: 'Bố cục, Thanh bên & Cỡ chữ',
    kieu: 'boolean',
    kieuDuLieuDb: 'BOOLEAN',
    macDinh: 'false',
    congKhai: true,
    mucUuTien: 'TUY_CHON',
  },
  {
    khoa: 'giao_dien.do_bo_goc_px',
    nhan: 'Độ bo góc khung thẻ và nút bấm (Border Radius)',
    moTa: 'Bán kính bo góc áp dụng cho toàn bộ khung thẻ, nút bấm, hộp thoại và ô nhập liệu (chuẩn thiết kế kỹ thuật tối đa 6px).',
    nhom: 'giao_dien',
    phanNhom: 'bo-cuc-va-co-chu',
    tieuDePhanNhom: 'Bố cục, Thanh bên & Cỡ chữ',
    kieu: 'select',
    kieuDuLieuDb: 'CHUOI',
    macDinh: '4',
    congKhai: true,
    mucUuTien: 'TUY_CHON',
    donVi: 'px',
    luaChon: [
      { giaTri: '0', nhan: '0px — Vuông sắc cạnh (Brutalist / Terminal)' },
      { giaTri: '2', nhan: '2px — Bo viền siêu mảnh' },
      { giaTri: '4', nhan: '4px — Chuẩn kỹ thuật Warm Minimal (Mặc định)' },
      { giaTri: '6', nhan: '6px — Bo nhẹ mềm mại' },
    ],
  },
  {
    khoa: 'giao_dien.hien_thi_thanh_tien_trinh_chuyen_trang',
    nhan: 'Hiển thị thanh tiến trình trên cùng khi chuyển trang',
    moTa: 'Thanh mảnh màu chủ đạo chạy ngang sát mép trên màn hình khi chuyển đổi giữa các phân hệ.',
    nhom: 'giao_dien',
    phanNhom: 'thanh-cong-cu-dau-trang',
    tieuDePhanNhom: 'Thanh công cụ & Tiện ích Đầu trang',
    moTaPhanNhom: 'Tùy chọn bật/tắt các thành phần chỉ báo trạng thái trên thanh công cụ đầu trang.',
    kieu: 'boolean',
    kieuDuLieuDb: 'BOOLEAN',
    macDinh: 'true',
    congKhai: true,
    mucUuTien: 'TUY_CHON',
  },
  {
    khoa: 'giao_dien.hien_thi_chi_bao_suc_khoe_he_thong',
    nhan: 'Hiển thị đèn báo trạng thái kết nối máy chủ trên Header',
    moTa: 'Hiển thị chấm trạng thái kết nối thời gian thực với máy chủ API trên thanh đầu trang.',
    nhom: 'giao_dien',
    phanNhom: 'thanh-cong-cu-dau-trang',
    tieuDePhanNhom: 'Thanh công cụ & Tiện ích Đầu trang',
    kieu: 'boolean',
    kieuDuLieuDb: 'BOOLEAN',
    macDinh: 'true',
    congKhai: true,
    mucUuTien: 'TUY_CHON',
  },

  // =========================================================================
  // 2. NHÓM HỌC VỤ & ĐÀO TẠO (THANG ĐIỂM, QUY ĐỔI & SỔ ĐIỂM)
  // =========================================================================
  {
    khoa: 'hoc_vu.diem_dat_toi_thieu_he_10',
    nhan: 'Điểm tổng kết đạt tối thiểu',
    moTa: 'Ngưỡng điểm tổng kết hệ 10 để học sinh được tính đạt qua môn (mặc định 4.0 tương đương điểm D).',
    nhom: 'hoc_vu',
    phanNhom: 'quy-che-diem-so',
    tieuDePhanNhom: 'Quy chế xét đạt & Làm tròn',
    moTaPhanNhom: 'Áp dụng trực tiếp khi tính điểm trung bình học phần, xếp loại chữ (A-F) và xét qua môn.',
    kieu: 'number',
    kieuDuLieuDb: 'SO',
    macDinh: '4.0',
    congKhai: false,
    nguyHiem: true,
    canhBaoNguyHiem:
      'Thay đổi ngưỡng điểm đạt tối thiểu sẽ ảnh hưởng trực tiếp đến kết quả xét qua môn/học lại trên sổ điểm toàn trường.',
    mucUuTien: 'BAT_BUOC',
    min: 0,
    max: 10,
    buocNhay: 0.5,
    donVi: 'điểm',
    goiYNhanh: [
      { giaTri: '4.0', nhan: '4.0 (Tín chỉ - Điểm D)' },
      { giaTri: '5.0', nhan: '5.0 (Niên chế - Điểm TB)' },
    ],
  },
  {
    khoa: 'hoc_vu.so_chu_so_lam_tron_diem',
    nhan: 'Số chữ số thập phân làm tròn điểm',
    moTa: 'Số chữ số sau dấu phẩy khi tính điểm trung bình học phần trên sổ điểm.',
    nhom: 'hoc_vu',
    phanNhom: 'quy-che-diem-so',
    tieuDePhanNhom: 'Quy chế xét đạt & Làm tròn',
    kieu: 'select',
    kieuDuLieuDb: 'SO',
    macDinh: '2',
    congKhai: false,
    nguyHiem: true,
    canhBaoNguyHiem:
      'Thay đổi quy tắc làm tròn chữ số thập phân sẽ làm thay đổi điểm trung bình tích lũy và xếp loại học lực trên sổ điểm.',
    mucUuTien: 'BAT_BUOC',
    donVi: 'chữ số',
    tuyChonSelect: [
      { giaTri: '1', nhan: '1 chữ số thập phân (7.5)' },
      { giaTri: '2', nhan: '2 chữ số thập phân (7.55)' },
    ],
  },
  {
    khoa: 'hoc_vu.si_so_lop_hoc_phan_toi_da',
    nhan: 'Sĩ số lớp học phần tối đa',
    moTa: 'Giới hạn số lượng học sinh tối đa khuyến nghị khi mở lớp học phần mới.',
    nhom: 'hoc_vu',
    phanNhom: 'to-chuc-lop-hoc',
    tieuDePhanNhom: 'Tổ chức lớp & Cột điểm',
    moTaPhanNhom: 'Thiết lập quy mô lớp học và mẫu cột điểm tự động khởi tạo cho các lớp học phần mới.',
    kieu: 'number',
    kieuDuLieuDb: 'SO',
    macDinh: '60',
    congKhai: false,
    mucUuTien: 'NEN_CO',
    min: 10,
    max: 500,
    buocNhay: 5,
    donVi: 'học sinh',
  },
  {
    khoa: 'hoc_vu.mau_cot_diem_mac_dinh',
    nhan: 'Cấu trúc cột điểm khởi tạo mặc định',
    moTa: 'Danh sách các cột điểm và hệ số trọng số được tạo tự động khi lớp học phần mở sổ điểm lần đầu.',
    nhom: 'hoc_vu',
    phanNhom: 'to-chuc-lop-hoc',
    tieuDePhanNhom: 'Tổ chức lớp & Cột điểm',
    kieu: 'json',
    kieuDuLieuDb: 'JSON',
    macDinh: JSON.stringify([
      { tenCotDiem: 'Chuyên cần', heSo: 1.0 },
      { tenCotDiem: 'Luyện tập & Bài tập', heSo: 2.0 },
      { tenCotDiem: 'Giữa kỳ (Thi thử)', heSo: 2.0 },
      { tenCotDiem: 'Cuối kỳ', heSo: 5.0 },
    ]),
    congKhai: false,
    nguyHiem: true,
    canhBaoNguyHiem:
      'Thay đổi mẫu cột điểm mặc định sẽ áp dụng trọng số mới cho tất cả các lớp học phần khởi tạo sổ điểm sau thời điểm này.',
    mucUuTien: 'NEN_CO',
  },

  // =========================================================================
  // 3. NHÓM ĐIỂM DANH & CHUYÊN CẦN
  // =========================================================================
  {
    khoa: 'diem_danh.so_phut_tinh_di_muon',
    nhan: 'Số phút tính là đi muộn',
    moTa: 'Học sinh vào phòng trực tuyến hoặc điểm danh sau mốc này (tính từ giờ bắt đầu buổi học) sẽ tự động ghi nhận trạng thái Đi muộn.',
    nhom: 'diem_danh',
    phanNhom: 'di-muon',
    tieuDePhanNhom: 'Đi muộn',
    moTaPhanNhom: 'Ngưỡng thời gian cho phép trễ đầu buổi học trước khi tính đi muộn.',
    kieu: 'number',
    kieuDuLieuDb: 'SO',
    macDinh: '15',
    congKhai: false,
    mucUuTien: 'BAT_BUOC',
    min: 1,
    max: 60,
    buocNhay: 1,
    donVi: 'phút',
    goiYNhanh: [
      { giaTri: '10', nhan: '10 phút' },
      { giaTri: '15', nhan: '15 phút' },
      { giaTri: '20', nhan: '20 phút' },
      { giaTri: '30', nhan: '30 phút' },
    ],
  },
  {
    khoa: 'diem_danh.thoi_han_ma_pin_phut',
    nhan: 'Thời hạn hiệu lực mã PIN điểm danh',
    moTa: 'Số phút hiệu lực mặc định khi giáo viên phát mã PIN điểm danh trên lớp.',
    nhom: 'diem_danh',
    phanNhom: 'ma-pin',
    tieuDePhanNhom: 'Mã PIN',
    moTaPhanNhom: 'Thời gian mở cổng nhập mã PIN điểm danh cho mỗi phiên.',
    kieu: 'number',
    kieuDuLieuDb: 'SO',
    macDinh: '10',
    congKhai: false,
    mucUuTien: 'NEN_CO',
    min: 1,
    max: 60,
    buocNhay: 1,
    donVi: 'phút',
  },
  {
    khoa: 'diem_danh.nguong_buoi_vang_cam_thi',
    nhan: 'Số buổi vắng không phép cảnh báo cấm thi',
    moTa: 'Khi học sinh có số buổi vắng không phép từ mức này trở lên, hệ thống gắn nhãn cảnh báo nguy cơ cấm thi.',
    nhom: 'diem_danh',
    phanNhom: 'canh-bao-cam-thi',
    tieuDePhanNhom: 'Cảnh báo cấm thi',
    moTaPhanNhom: 'Ngưỡng đánh giá điều kiện chuyên cần đủ tư cách dự thi kết thúc học phần.',
    kieu: 'number',
    kieuDuLieuDb: 'SO',
    macDinh: '3',
    congKhai: false,
    nguyHiem: true,
    canhBaoNguyHiem:
      'Thay đổi ngưỡng buổi vắng cấm thi sẽ làm thay đổi danh sách học sinh thuộc diện cảnh báo học vụ.',
    mucUuTien: 'BAT_BUOC',
    min: 1,
    max: 15,
    buocNhay: 1,
    donVi: 'buổi',
  },
  {
    khoa: 'diem_danh.nguong_phan_tram_chuyen_can_cam_thi',
    nhan: 'Tỷ lệ chuyên cần tối thiểu dự thi',
    moTa: 'Học sinh có tỷ lệ chuyên cần thấp hơn ngưỡng này (sau tối thiểu 3 buổi học) sẽ bị cảnh báo nguy cơ cấm thi.',
    nhom: 'diem_danh',
    phanNhom: 'canh-bao-cam-thi',
    tieuDePhanNhom: 'Cảnh báo cấm thi',
    kieu: 'number',
    kieuDuLieuDb: 'SO',
    macDinh: '70',
    congKhai: false,
    nguyHiem: true,
    canhBaoNguyHiem:
      'Thay đổi tỷ lệ chuyên cần tối thiểu sẽ cập nhật lại trạng thái cảnh báo cấm thi của toàn bộ lớp học phần.',
    mucUuTien: 'BAT_BUOC',
    min: 50,
    max: 100,
    buocNhay: 5,
    donVi: '%',
    goiYNhanh: [
      { giaTri: '70', nhan: '70%' },
      { giaTri: '75', nhan: '75%' },
      { giaTri: '80', nhan: '80%' },
    ],
  },
  {
    khoa: 'diem_danh.diem_tru_vang_khong_phep',
    nhan: 'Điểm trừ mỗi buổi vắng không phép',
    moTa: 'Số điểm trừ vào cột Chuyên cần (thang 10) cho mỗi buổi vắng mặt không có đơn xin phép được duyệt.',
    nhom: 'diem_danh',
    phanNhom: 'tru-diem-chuyen-can',
    tieuDePhanNhom: 'Trừ điểm chuyên cần',
    moTaPhanNhom: 'Mức khấu trừ điểm chuyên cần tự động theo trạng thái tham gia buổi học.',
    kieu: 'number',
    kieuDuLieuDb: 'SO',
    macDinh: '2.0',
    congKhai: false,
    nguyHiem: true,
    canhBaoNguyHiem:
      'Thay đổi mức điểm trừ vắng không phép sẽ làm thay đổi kết quả tính điểm chuyên cần của học sinh.',
    mucUuTien: 'NEN_CO',
    min: 0,
    max: 10,
    buocNhay: 0.5,
    donVi: 'điểm',
  },
  {
    khoa: 'diem_danh.diem_tru_di_muon_hoac_co_phep',
    nhan: 'Điểm trừ mỗi buổi đi muộn / có phép',
    moTa: 'Số điểm trừ vào cột Chuyên cần (thang 10) cho mỗi buổi đi muộn hoặc nghỉ có phép.',
    nhom: 'diem_danh',
    phanNhom: 'tru-diem-chuyen-can',
    tieuDePhanNhom: 'Trừ điểm chuyên cần',
    kieu: 'number',
    kieuDuLieuDb: 'SO',
    macDinh: '0.5',
    congKhai: false,
    nguyHiem: true,
    canhBaoNguyHiem:
      'Thay đổi mức điểm trừ đi muộn/có phép sẽ làm thay đổi kết quả tính điểm chuyên cần của học sinh.',
    mucUuTien: 'NEN_CO',
    min: 0,
    max: 5,
    buocNhay: 0.25,
    donVi: 'điểm',
  },

  // =========================================================================
  // 4. NHÓM PHÒNG HỌC TRỰC TUYẾN
  // =========================================================================
  {
    khoa: 'phong_hoc.tat_micro_khi_vao_phong',
    nhan: 'Mặc định tắt Micro khi mới vào phòng',
    moTa: 'Tự động tắt thu âm Micro của người tham gia ngay khi kết nối phòng học trực tuyến để tránh ồn lớp.',
    nhom: 'phong_hoc',
    phanNhom: 'thiet-bi-mac-dinh',
    tieuDePhanNhom: 'Thiết bị mặc định khi vào phòng',
    moTaPhanNhom: 'Kiểm soát trạng thái Micro và Camera ban đầu khi người dùng tham gia phòng học.',
    kieu: 'boolean',
    kieuDuLieuDb: 'LOGIC',
    macDinh: 'true',
    congKhai: true,
    mucUuTien: 'BAT_BUOC',
  },
  {
    khoa: 'phong_hoc.tat_camera_khi_vao_phong',
    nhan: 'Mặc định tắt Camera khi mới vào phòng',
    moTa: 'Không tự động bật Camera khi vừa mở phòng trực tuyến; người dùng chủ động bật khi sẵn sàng.',
    nhom: 'phong_hoc',
    phanNhom: 'thiet-bi-mac-dinh',
    tieuDePhanNhom: 'Thiết bị mặc định khi vào phòng',
    kieu: 'boolean',
    kieuDuLieuDb: 'LOGIC',
    macDinh: 'true',
    congKhai: true,
    mucUuTien: 'BAT_BUOC',
  },
  {
    khoa: 'phong_hoc.thoi_han_token_phut',
    nhan: 'Thời hạn phiên kết nối phòng học',
    moTa: 'Thời gian hiệu lực tối đa của mã xác thực phiên phòng học trực tuyến mỗi lần tham gia.',
    nhom: 'phong_hoc',
    phanNhom: 'phien-va-trinh-chieu',
    tieuDePhanNhom: 'Thời hạn phiên & Trình chiếu',
    moTaPhanNhom: 'Quy định thời lượng tối đa của phiên kết nối và quyền chia sẻ màn hình.',
    kieu: 'number',
    kieuDuLieuDb: 'SO',
    macDinh: '120',
    congKhai: false,
    mucUuTien: 'NEN_CO',
    min: 30,
    max: 360,
    buocNhay: 15,
    donVi: 'phút',
    goiYNhanh: [
      { giaTri: '60', nhan: '60 phút' },
      { giaTri: '120', nhan: '120 phút' },
      { giaTri: '180', nhan: '180 phút' },
      { giaTri: '240', nhan: '240 phút' },
    ],
  },
  {
    khoa: 'phong_hoc.cho_phep_hoc_sinh_chia_se_man_hinh',
    nhan: 'Cho phép học sinh chia sẻ màn hình',
    moTa: 'Khi bật, học sinh có thể chia sẻ màn hình để báo cáo bài tập hoặc thuyết trình nhóm trong phòng học.',
    nhom: 'phong_hoc',
    phanNhom: 'phien-va-trinh-chieu',
    tieuDePhanNhom: 'Thời hạn phiên & Trình chiếu',
    kieu: 'boolean',
    kieuDuLieuDb: 'LOGIC',
    macDinh: 'true',
    congKhai: true,
    mucUuTien: 'NEN_CO',
  },

  // =========================================================================
  // 5. NHÓM BÀI TẬP, KIỂM TRA & TÀI LIỆU
  // =========================================================================
  {
    khoa: 'bai_tap.dung_luong_tep_nop_toi_da_mb',
    nhan: 'Dung lượng tệp nộp bài tối đa',
    moTa: 'Giới hạn kích thước tối đa cho mỗi tệp đính kèm khi học sinh nộp bài tập trên lớp học phần.',
    nhom: 'bai_tap',
    phanNhom: 'gioi-han-tep-tin',
    tieuDePhanNhom: 'Giới hạn dung lượng & Định dạng tệp',
    moTaPhanNhom: 'Kiểm soát dung lượng lưu trữ máy chủ và chặn các định dạng tệp thực thi không an toàn.',
    kieu: 'number',
    kieuDuLieuDb: 'SO',
    macDinh: '15',
    congKhai: true,
    mucUuTien: 'BAT_BUOC',
    min: 1,
    max: 50,
    buocNhay: 1,
    donVi: 'MB',
    goiYNhanh: [
      { giaTri: '5', nhan: '5 MB' },
      { giaTri: '10', nhan: '10 MB' },
      { giaTri: '15', nhan: '15 MB' },
      { giaTri: '25', nhan: '25 MB' },
      { giaTri: '50', nhan: '50 MB' },
    ],
  },
  {
    khoa: 'bai_tap.dung_luong_tai_lieu_toi_da_mb',
    nhan: 'Dung lượng tài liệu bài giảng tối đa',
    moTa: 'Giới hạn kích thước tối đa khi giáo viên tải lên giáo trình, slide hoặc học liệu môn học.',
    nhom: 'bai_tap',
    phanNhom: 'gioi-han-tep-tin',
    tieuDePhanNhom: 'Giới hạn dung lượng & Định dạng tệp',
    kieu: 'number',
    kieuDuLieuDb: 'SO',
    macDinh: '25',
    congKhai: true,
    mucUuTien: 'BAT_BUOC',
    min: 5,
    max: 100,
    buocNhay: 5,
    donVi: 'MB',
    goiYNhanh: [
      { giaTri: '15', nhan: '15 MB' },
      { giaTri: '25', nhan: '25 MB' },
      { giaTri: '50', nhan: '50 MB' },
      { giaTri: '100', nhan: '100 MB' },
    ],
  },
  {
    khoa: 'bai_tap.dinh_dang_tep_cho_phep',
    nhan: 'Danh sách đuôi tệp cho phép tải lên',
    moTa: 'Các định dạng tệp hợp lệ (phân tách bằng dấu phẩy). Máy chủ tự động chặn cứng các tệp thực thi (.exe, .sh, .php, .js, .bat, .html...).',
    nhom: 'bai_tap',
    phanNhom: 'gioi-han-tep-tin',
    tieuDePhanNhom: 'Giới hạn dung lượng & Định dạng tệp',
    kieu: 'text',
    kieuDuLieuDb: 'CHUOI',
    macDinh: 'pdf,doc,docx,xls,xlsx,ppt,pptx,txt,zip,rar,png,jpg,jpeg,mp4',
    congKhai: true,
    mucUuTien: 'BAT_BUOC',
    placeholder: 'pdf,doc,docx,xls,xlsx,ppt,pptx,txt,zip,rar,png,jpg,jpeg',
  },
  {
    khoa: 'bai_tap.cho_phep_nop_muon_mac_dinh',
    nhan: 'Cho phép nộp bài sau hạn chót',
    moTa: 'Khi bật, học sinh vẫn có thể gửi bài sau thời điểm hạn nộp nhưng bị đánh dấu Nộp muộn. Khi tắt, hệ thống khóa nút nộp bài ngay khi quá hạn.',
    nhom: 'bai_tap',
    phanNhom: 'quy-tac-nop-bai',
    tieuDePhanNhom: 'Quy tắc nộp bài',
    moTaPhanNhom: 'Quy định xử lý các bài làm gửi sau thời điểm hết hạn.',
    kieu: 'boolean',
    kieuDuLieuDb: 'LOGIC',
    macDinh: 'true',
    congKhai: true,
    nguyHiem: true,
    canhBaoNguyHiem:
      'Khi tắt tùy chọn này, học sinh trên toàn hệ thống sẽ không thể gửi tệp bài làm ngay khi quá thời hạn nộp.',
    mucUuTien: 'NEN_CO',
  },

  // =========================================================================
  // 6. NHÓM TRỢ LÝ AI HỌC THUẬT
  // =========================================================================
  {
    khoa: 'tro_ly_ai.kich_hoat',
    nhan: 'Bật Trợ lý AI học thuật toàn trường',
    moTa: 'Công tắc tổng cho phép sử dụng Trợ lý AI hỏi đáp học liệu và gợi ý bản nháp bài tập.',
    nhom: 'tro_ly_ai',
    phanNhom: 'ket-noi-mo-hinh',
    tieuDePhanNhom: 'Kết nối mô hình & Khóa API',
    moTaPhanNhom: 'Cấu hình nhà cung cấp mô hình ngôn ngữ và mã khóa xác thực trên máy chủ.',
    kieu: 'boolean',
    kieuDuLieuDb: 'LOGIC',
    macDinh: 'true',
    congKhai: true,
    nguyHiem: true,
    canhBaoNguyHiem:
      'Khi tắt công tắc này, tính năng hỏi đáp Trợ lý AI của toàn bộ giảng viên và học sinh sẽ tạm dừng hoạt động.',
    mucUuTien: 'BAT_BUOC',
  },
  {
    khoa: 'tro_ly_ai.nha_cung_cap',
    khoaCu: 'AI_NHA_CUNG_CAP',
    nhan: 'Nhà cung cấp dịch vụ AI',
    moTa: 'Chọn nền tảng cung cấp mô hình ngôn ngữ (Google Gemini, Groq Cloud, OpenAI, Ollama nội bộ hoặc API tương thích).',
    nhom: 'tro_ly_ai',
    phanNhom: 'ket-noi-mo-hinh',
    tieuDePhanNhom: 'Kết nối mô hình & Khóa API',
    kieu: 'select',
    kieuDuLieuDb: 'CHUOI',
    macDinh: 'gemini',
    congKhai: false,
    mucUuTien: 'BAT_BUOC',
    tuyChonSelect: [
      { giaTri: 'gemini', nhan: 'Google Gemini (Miễn phí 15 RPM / Khuyên dùng)' },
      { giaTri: 'groq', nhan: 'Groq Cloud (Miễn phí 14,400 RPD / Tốc độ cao)' },
      { giaTri: 'openai', nhan: 'OpenAI (GPT-4o Mini / GPT-4o)' },
      { giaTri: 'ollama', nhan: 'Ollama (Chạy cục bộ máy chủ riêng)' },
      { giaTri: 'tuy_chon', nhan: 'API tương thích OpenAI (DeepSeek, OpenRouter...)' },
    ],
  },
  {
    khoa: 'tro_ly_ai.khoa_bi_mat_api',
    khoaCu: 'AI_API_KEY',
    nhan: 'Mã khóa kết nối API (API Key)',
    moTa: 'Mã khóa xác thực từ nhà cung cấp AI. Được bảo vệ ở tầng lưu trữ và luôn ẩn dưới dạng mặt nạ khi hiển thị.',
    nhom: 'tro_ly_ai',
    phanNhom: 'ket-noi-mo-hinh',
    tieuDePhanNhom: 'Kết nối mô hình & Khóa API',
    kieu: 'password',
    kieuDuLieuDb: 'CHUOI',
    macDinh: '',
    congKhai: false,
    biMat: true,
    mucUuTien: 'BAT_BUOC',
    placeholder: 'Nhập mã khóa mới để thay đổi (để trống nếu giữ nguyên)...',
  },
  {
    khoa: 'tro_ly_ai.ten_mo_hinh',
    khoaCu: 'AI_MODEL',
    nhan: 'Tên định danh mô hình (Model)',
    moTa: 'Tên mô hình cụ thể sẽ được gọi khi sinh câu trả lời.',
    nhom: 'tro_ly_ai',
    phanNhom: 'ket-noi-mo-hinh',
    tieuDePhanNhom: 'Kết nối mô hình & Khóa API',
    kieu: 'text',
    kieuDuLieuDb: 'CHUOI',
    macDinh: 'gemini-1.5-flash',
    congKhai: false,
    mucUuTien: 'BAT_BUOC',
    placeholder: 'Ví dụ: gemini-1.5-flash',
    goiYNhanh: [
      { giaTri: 'gemini-1.5-flash', nhan: 'gemini-1.5-flash' },
      { giaTri: 'gemini-2.0-flash', nhan: 'gemini-2.0-flash' },
      { giaTri: 'llama-3.3-70b-versatile', nhan: 'llama-3.3-70b-versatile' },
      { giaTri: 'gpt-4o-mini', nhan: 'gpt-4o-mini' },
      { giaTri: 'deepseek-chat', nhan: 'deepseek-chat' },
    ],
  },
  {
    khoa: 'tro_ly_ai.url_may_chu_tuy_chinh',
    khoaCu: 'AI_BASE_URL',
    nhan: 'Địa chỉ máy chủ API tùy chỉnh',
    moTa: 'Đường dẫn máy chủ API riêng (để trống nếu dùng mặc định của Google Gemini).',
    nhom: 'tro_ly_ai',
    phanNhom: 'ket-noi-mo-hinh',
    tieuDePhanNhom: 'Kết nối mô hình & Khóa API',
    kieu: 'text',
    kieuDuLieuDb: 'CHUOI',
    macDinh: '',
    congKhai: false,
    mucUuTien: 'NEN_CO',
    placeholder: 'Ví dụ: http://localhost:11434 hoặc https://api.groq.com/openai',
  },
  {
    khoa: 'tro_ly_ai.chi_dan_he_thong',
    khoaCu: 'AI_PROMPT_HE_THONG',
    nhan: 'Chỉ dẫn sư phạm gốc cho Trợ lý AI',
    moTa: 'Chỉ thị định hình phong cách sư phạm, văn phong tiếng Việt chuẩn mực và nguyên tắc học thuật của Trợ lý AI.',
    nhom: 'tro_ly_ai',
    phanNhom: 'tham-so-sinh-phan-hoi',
    tieuDePhanNhom: 'Tham số sinh phản hồi',
    moTaPhanNhom: 'Định hình văn phong sư phạm, độ linh hoạt và độ dài câu trả lời.',
    kieu: 'textarea',
    kieuDuLieuDb: 'CHUOI',
    macDinh:
      'Bạn là Trợ lý AI học thuật thông minh của Hệ thống LMS Trường học. Hãy hỗ trợ người học lịch sự, sư phạm, chính xác bằng tiếng Việt chuẩn mực.',
    congKhai: false,
    mucUuTien: 'BAT_BUOC',
  },
  {
    khoa: 'tro_ly_ai.nhiet_do_sang_tao',
    khoaCu: 'AI_NHIET_DO',
    nhan: 'Độ linh hoạt câu trả lời (Temperature)',
    moTa: '0.2 cho câu trả lời bám sát giáo trình nhất; 0.7 cho diễn đạt linh hoạt, tự nhiên.',
    nhom: 'tro_ly_ai',
    phanNhom: 'tham-so-sinh-phan-hoi',
    tieuDePhanNhom: 'Tham số sinh phản hồi',
    kieu: 'number',
    kieuDuLieuDb: 'SO',
    macDinh: '0.7',
    congKhai: false,
    mucUuTien: 'BAT_BUOC',
    min: 0,
    max: 1,
    buocNhay: 0.1,
    donVi: 'mức',
    goiYNhanh: [
      { giaTri: '0.2', nhan: '0.2 (Chính xác)' },
      { giaTri: '0.5', nhan: '0.5 (Cân bằng)' },
      { giaTri: '0.7', nhan: '0.7 (Tự nhiên)' },
    ],
  },
  {
    khoa: 'tro_ly_ai.so_token_phan_hoi_toi_da',
    khoaCu: 'AI_TOKEN_TOI_DA',
    nhan: 'Độ dài phản hồi tối đa',
    moTa: 'Số lượng đơn vị từ (token) tối đa cho mỗi câu trả lời của Trợ lý AI (từ 256 đến 4096).',
    nhom: 'tro_ly_ai',
    phanNhom: 'tham-so-sinh-phan-hoi',
    tieuDePhanNhom: 'Tham số sinh phản hồi',
    kieu: 'number',
    kieuDuLieuDb: 'SO',
    macDinh: '1024',
    congKhai: false,
    mucUuTien: 'BAT_BUOC',
    min: 256,
    max: 4096,
    buocNhay: 128,
    donVi: 'token',
    goiYNhanh: [
      { giaTri: '512', nhan: '512 token' },
      { giaTri: '1024', nhan: '1024 token' },
      { giaTri: '2048', nhan: '2048 token' },
    ],
  },
  {
    khoa: 'tro_ly_ai.gioi_han_luot_hoi_ngay_hoc_sinh',
    nhan: 'Hạn mức câu hỏi mỗi ngày của Học sinh',
    moTa: 'Số lượt gửi câu hỏi tối đa tới Trợ lý AI trong 1 ngày đối với vai trò Học sinh.',
    nhom: 'tro_ly_ai',
    phanNhom: 'han-muc-su-dung',
    tieuDePhanNhom: 'Hạn mức sử dụng & Truy hồi tài liệu',
    moTaPhanNhom: 'Giới hạn số lượt hỏi mỗi ngày theo vai trò và số đoạn học liệu trích xuất.',
    kieu: 'number',
    kieuDuLieuDb: 'SO',
    macDinh: '30',
    congKhai: false,
    mucUuTien: 'BAT_BUOC',
    min: 5,
    max: 500,
    buocNhay: 5,
    donVi: 'lượt',
  },
  {
    khoa: 'tro_ly_ai.gioi_han_luot_hoi_ngay_giao_vien',
    nhan: 'Hạn mức sử dụng mỗi ngày của Giáo viên',
    moTa: 'Số lượt hỏi đáp và tạo bản nháp tối đa trong 1 ngày đối với vai trò Giáo viên.',
    nhom: 'tro_ly_ai',
    phanNhom: 'han-muc-su-dung',
    tieuDePhanNhom: 'Hạn mức sử dụng & Truy hồi tài liệu',
    kieu: 'number',
    kieuDuLieuDb: 'SO',
    macDinh: '100',
    congKhai: false,
    mucUuTien: 'BAT_BUOC',
    min: 10,
    max: 1000,
    buocNhay: 10,
    donVi: 'lượt',
  },
  {
    khoa: 'tro_ly_ai.so_doan_tai_lieu_truy_hoi_rag',
    nhan: 'Số đoạn tài liệu trích xuất mỗi câu hỏi',
    moTa: 'Số đoạn học liệu liên quan nhất được trích xuất từ kho tài liệu môn học để tổng hợp câu trả lời.',
    nhom: 'tro_ly_ai',
    phanNhom: 'han-muc-su-dung',
    tieuDePhanNhom: 'Hạn mức sử dụng & Truy hồi tài liệu',
    kieu: 'number',
    kieuDuLieuDb: 'SO',
    macDinh: '4',
    congKhai: false,
    mucUuTien: 'NEN_CO',
    min: 1,
    max: 10,
    buocNhay: 1,
    donVi: 'đoạn',
  },

  // =========================================================================
  // 7. NHÓM THÔNG BÁO & BẢN TIN HỌC VỤ
  // =========================================================================
  {
    khoa: 'thong_bao.thong_bao_chung_toan_truong',
    khoaCu: 'THONG_BAO_CHUNG',
    nhan: 'Thông báo ghim nổi bật toàn trường',
    moTa: 'Nội dung thông báo ngắn hiển thị trên bảng điều khiển cho toàn bộ giảng viên và học sinh.',
    nhom: 'thong_bao',
    phanNhom: 'thong-bao-ghim',
    tieuDePhanNhom: 'Thông báo ghim toàn trường',
    moTaPhanNhom: 'Dòng thông báo hiển thị cố định trên đầu bảng điều khiển.',
    kieu: 'textarea',
    kieuDuLieuDb: 'CHUOI',
    macDinh:
      'Chào mừng bạn đến với Hệ thống Lớp học số tích hợp Trí tuệ nhân tạo SmartClass AI!',
    congKhai: true,
    mucUuTien: 'BAT_BUOC',
  },
  {
    khoa: 'thong_bao.bat_hop_thoai_thong_bao_he_thong',
    nhan: 'Tự động mở hộp thoại Bản tin học vụ',
    moTa: 'Khi bật, người dùng sẽ thấy hộp thoại thông báo học vụ khi truy cập bảng điều khiển (có nút Tắt trong 24h).',
    nhom: 'thong_bao',
    phanNhom: 'hop-thoai-ban-tin',
    tieuDePhanNhom: 'Hộp thoại bản tin học vụ',
    moTaPhanNhom: 'Thiết lập tiêu đề, nội dung và sắc thái của hộp thoại bản tin học kỳ.',
    kieu: 'boolean',
    kieuDuLieuDb: 'LOGIC',
    macDinh: 'true',
    congKhai: true,
    mucUuTien: 'NEN_CO',
  },
  {
    khoa: 'thong_bao.tieu_de_hop_thoai_he_thong',
    nhan: 'Tiêu đề hộp thoại Bản tin học vụ',
    moTa: 'Tiêu đề chính của hộp thoại thông báo vận hành học kỳ.',
    nhom: 'thong_bao',
    phanNhom: 'hop-thoai-ban-tin',
    tieuDePhanNhom: 'Hộp thoại bản tin học vụ',
    kieu: 'text',
    kieuDuLieuDb: 'CHUOI',
    macDinh: 'Đồng bộ dữ liệu chuyên cần & Lịch thi học kỳ',
    congKhai: true,
    mucUuTien: 'NEN_CO',
  },
  {
    khoa: 'thong_bao.noi_dung_hop_thoai_he_thong',
    nhan: 'Nội dung chi tiết Bản tin học vụ',
    moTa: 'Nội dung văn bản hiển thị bên trong hộp thoại thông báo học vụ.',
    nhom: 'thong_bao',
    phanNhom: 'hop-thoai-ban-tin',
    tieuDePhanNhom: 'Hộp thoại bản tin học vụ',
    kieu: 'textarea',
    kieuDuLieuDb: 'CHUOI',
    macDinh:
      'Vui lòng kiểm tra kỹ danh sách lớp học phần, lịch giảng dạy hàng tuần và hạn nộp bài tập trực tuyến. Các thông tin cập nhật về điểm số sẽ được đồng bộ trực tiếp trong sổ điểm của từng lớp học phần.',
    congKhai: true,
    mucUuTien: 'NEN_CO',
  },
  {
    khoa: 'thong_bao.loai_hop_thoai_he_thong',
    nhan: 'Sắc thái hiển thị Bản tin học vụ',
    moTa: 'Chọn mức độ nhấn mạnh của hộp thông báo (Thông tin, Cập nhật hoàn tất, Lưu ý học vụ hoặc Cảnh báo quan trọng).',
    nhom: 'thong_bao',
    phanNhom: 'hop-thoai-ban-tin',
    tieuDePhanNhom: 'Hộp thoại bản tin học vụ',
    kieu: 'select',
    kieuDuLieuDb: 'CHUOI',
    macDinh: 'info',
    congKhai: true,
    mucUuTien: 'NEN_CO',
    tuyChonSelect: [
      { giaTri: 'info', nhan: 'Thông báo hệ thống (Màu xanh thông tin)' },
      { giaTri: 'success', nhan: 'Cập nhật hoàn tất (Màu xanh ngọc)' },
      { giaTri: 'warning', nhan: 'Lưu ý học vụ (Màu vàng cảnh báo)' },
      { giaTri: 'danger', nhan: 'Cảnh báo quan trọng (Màu đỏ khẩn cấp)' },
    ],
  },

  // =========================================================================
  // 8. NHÓM BẢO MẬT, ĐĂNG NHẬP & CHỐNG TẤN CÔNG
  // =========================================================================
  {
    khoa: 'bao_mat.cho_phep_tu_dang_ky',
    khoaCu: 'CHO_PHEP_DANG_KY',
    nhan: 'Mở cổng tự đăng ký tài khoản học sinh',
    moTa: 'Cho phép người học tự tạo tài khoản mới tại màn hình đăng nhập. Khi tắt, chỉ Quản trị viên mới được cấp tài khoản.',
    nhom: 'bao_mat',
    phanNhom: 'dang-ky-va-phien',
    tieuDePhanNhom: 'Đăng ký & Thời hạn phiên',
    moTaPhanNhom: 'Kiểm soát quyền tự mở tài khoản và thời gian duy trì phiên làm việc.',
    kieu: 'boolean',
    kieuDuLieuDb: 'LOGIC',
    macDinh: 'true',
    congKhai: true,
    nguyHiem: true,
    canhBaoNguyHiem:
      'Thay đổi trạng thái cổng tự đăng ký sẽ mở hoặc khóa ngay lập tức chức năng tạo tài khoản mới tại trang đăng nhập.',
    mucUuTien: 'BAT_BUOC',
  },
  {
    khoa: 'bao_mat.thoi_gian_phien_giay',
    khoaCu: 'THOI_GIAN_PHIEN_GIAY',
    nhan: 'Thời lượng duy trì phiên đăng nhập',
    moTa: 'Thời hạn hiệu lực của phiên làm việc trước khi tự động làm mới hoặc yêu cầu đăng nhập lại.',
    nhom: 'bao_mat',
    phanNhom: 'dang-ky-va-phien',
    tieuDePhanNhom: 'Đăng ký & Thời hạn phiên',
    kieu: 'number',
    kieuDuLieuDb: 'SO',
    macDinh: '86400',
    congKhai: true,
    nguyHiem: true,
    canhBaoNguyHiem:
      'Thay đổi thời gian phiên đăng nhập sẽ áp dụng cho tất cả lượt đăng nhập và gia hạn phiên mới trên toàn hệ thống.',
    mucUuTien: 'BAT_BUOC',
    min: 300,
    max: 2592000,
    buocNhay: 60,
    donVi: 'giây',
    goiYNhanh: [
      { giaTri: '900', nhan: '15 phút' },
      { giaTri: '1800', nhan: '30 phút' },
      { giaTri: '3600', nhan: '1 giờ' },
      { giaTri: '14400', nhan: '4 giờ' },
      { giaTri: '43200', nhan: '12 giờ' },
      { giaTri: '86400', nhan: '1 ngày' },
      { giaTri: '604800', nhan: '7 ngày' },
    ],
  },
  {
    khoa: 'bao_mat.so_lan_sai_toi_da',
    nhan: 'Số lần nhập sai mật khẩu tối đa',
    moTa: 'Khóa tạm thời tính năng đăng nhập của tài khoản nếu nhập sai mật khẩu liên tiếp vượt ngưỡng này.',
    nhom: 'bao_mat',
    phanNhom: 'chong-quet-mat-khau',
    tieuDePhanNhom: 'Chống dò mật khẩu & Giới hạn IP',
    moTaPhanNhom: 'Tách biệt khóa tạm theo từng tài khoản và giới hạn tần suất theo địa chỉ IP phòng máy trường học.',
    kieu: 'number',
    kieuDuLieuDb: 'SO',
    macDinh: '5',
    congKhai: false,
    nguyHiem: true,
    canhBaoNguyHiem:
      'Đặt số lần nhập sai quá thấp có thể khiến học sinh quên mật khẩu bị khóa tạm thời nhanh hơn.',
    mucUuTien: 'BAT_BUOC',
    min: 3,
    max: 20,
    buocNhay: 1,
    donVi: 'lần',
  },
  {
    khoa: 'bao_mat.cua_so_dem_sai_phut',
    nhan: 'Khoảng thời gian đếm lần sai mật khẩu',
    moTa: 'Khoảng thời gian theo dõi các lần đăng nhập thất bại liên tiếp của cùng một tài khoản.',
    nhom: 'bao_mat',
    phanNhom: 'chong-quet-mat-khau',
    tieuDePhanNhom: 'Chống dò mật khẩu & Giới hạn IP',
    kieu: 'number',
    kieuDuLieuDb: 'SO',
    macDinh: '15',
    congKhai: false,
    mucUuTien: 'BAT_BUOC',
    min: 5,
    max: 120,
    buocNhay: 5,
    donVi: 'phút',
  },
  {
    khoa: 'bao_mat.thoi_gian_khoa_tam_phut',
    nhan: 'Thời gian khóa tài khoản tạm thời',
    moTa: 'Thời gian tài khoản bị tạm dừng đăng nhập sau khi vượt quá số lần thử mật khẩu sai.',
    nhom: 'bao_mat',
    phanNhom: 'chong-quet-mat-khau',
    tieuDePhanNhom: 'Chống dò mật khẩu & Giới hạn IP',
    kieu: 'number',
    kieuDuLieuDb: 'SO',
    macDinh: '15',
    congKhai: false,
    nguyHiem: true,
    canhBaoNguyHiem:
      'Thay đổi thời gian khóa tạm thời ảnh hưởng trực tiếp đến thời gian chờ mở khóa tự động của người dùng.',
    mucUuTien: 'BAT_BUOC',
    min: 5,
    max: 1440,
    buocNhay: 5,
    donVi: 'phút',
  },
  {
    khoa: 'bao_mat.gioi_han_dang_nhap_theo_ip',
    nhan: 'Giới hạn lượt đăng nhập mỗi địa chỉ IP',
    moTa: 'Đặt ngưỡng đủ cao (mặc định 100 lượt) để cả lớp học trong cùng phòng máy thực hành của trường đăng nhập đồng thời không bị chặn nhầm.',
    nhom: 'bao_mat',
    phanNhom: 'chong-quet-mat-khau',
    tieuDePhanNhom: 'Chống dò mật khẩu & Giới hạn IP',
    kieu: 'number',
    kieuDuLieuDb: 'SO',
    macDinh: '100',
    congKhai: false,
    nguyHiem: true,
    canhBaoNguyHiem:
      'Cảnh báo: Không đặt giới hạn IP dưới 50 nếu trường học có phòng máy tính dùng chung mạng nội bộ.',
    mucUuTien: 'BAT_BUOC',
    min: 20,
    max: 1000,
    buocNhay: 10,
    donVi: 'lượt',
    goiYNhanh: [
      { giaTri: '50', nhan: '50 lượt' },
      { giaTri: '100', nhan: '100 lượt (Phòng máy)' },
      { giaTri: '250', nhan: '250 lượt (Hội trường)' },
    ],
  },
  {
    khoa: 'bao_mat.cua_so_gioi_han_ip_phut',
    nhan: 'Chu kỳ làm mới bộ đếm IP',
    moTa: 'Khoảng thời gian làm mới bộ đếm lượt thử đăng nhập theo địa chỉ IP.',
    nhom: 'bao_mat',
    phanNhom: 'chong-quet-mat-khau',
    tieuDePhanNhom: 'Chống dò mật khẩu & Giới hạn IP',
    kieu: 'number',
    kieuDuLieuDb: 'SO',
    macDinh: '15',
    congKhai: false,
    mucUuTien: 'BAT_BUOC',
    min: 1,
    max: 60,
    buocNhay: 5,
    donVi: 'phút',
  },
  {
    khoa: 'bao_mat.do_dai_mat_khau_toi_thieu',
    nhan: 'Độ dài mật khẩu tối thiểu',
    moTa: 'Số ký tự tối thiểu bắt buộc khi tạo mới hoặc đổi mật khẩu người dùng.',
    nhom: 'bao_mat',
    phanNhom: 'chinh-sach-mat-khau',
    tieuDePhanNhom: 'Chính sách mật khẩu & Nhật ký',
    moTaPhanNhom: 'Quy định tiêu chuẩn mật khẩu và thời gian lưu vết kiểm toán hệ thống.',
    kieu: 'number',
    kieuDuLieuDb: 'SO',
    macDinh: '8',
    congKhai: true,
    mucUuTien: 'BAT_BUOC',
    min: 6,
    max: 32,
    buocNhay: 1,
    donVi: 'ký tự',
  },
  {
    khoa: 'bao_mat.mat_khau_bat_buoc_chu_va_so',
    nhan: 'Bắt buộc mật khẩu có cả chữ và số',
    moTa: 'Yêu cầu mật khẩu mới phải kết hợp ít nhất một chữ cái và một chữ số để chống mật khẩu yếu.',
    nhom: 'bao_mat',
    phanNhom: 'chinh-sach-mat-khau',
    tieuDePhanNhom: 'Chính sách mật khẩu & Nhật ký',
    kieu: 'boolean',
    kieuDuLieuDb: 'LOGIC',
    macDinh: 'true',
    congKhai: true,
    mucUuTien: 'BAT_BUOC',
  },
  {
    khoa: 'bao_mat.so_ngay_luu_nhat_ky_he_thong',
    nhan: 'Thời hạn lưu trữ nhật ký hệ thống',
    moTa: 'Số ngày lưu trữ bản ghi trong bảng Nhật ký hệ thống và lịch sử phiên đăng nhập đã thu hồi.',
    nhom: 'bao_mat',
    phanNhom: 'chinh-sach-mat-khau',
    tieuDePhanNhom: 'Chính sách mật khẩu & Nhật ký',
    kieu: 'number',
    kieuDuLieuDb: 'SO',
    macDinh: '90',
    congKhai: false,
    mucUuTien: 'NEN_CO',
    min: 7,
    max: 365,
    buocNhay: 15,
    donVi: 'ngày',
  },

  // =========================================================================
  // 9. NHÓM MÁY CHỦ GỬI THƯ (SMTP EMAIL)
  // =========================================================================
  {
    khoa: 'email.kich_hoat_smtp',
    nhan: 'Bật gửi thư thông báo tự động',
    moTa: 'Cho phép hệ thống gửi email thông báo học vụ, cảnh báo chuyên cần và đặt lại mật khẩu.',
    nhom: 'email',
    phanNhom: 'ket-noi-smtp',
    tieuDePhanNhom: 'Kết nối máy chủ SMTP',
    moTaPhanNhom: 'Cấu hình kết nối máy chủ gửi thư điện tử và tài khoản xác thực.',
    kieu: 'boolean',
    kieuDuLieuDb: 'LOGIC',
    macDinh: 'false',
    congKhai: false,
    mucUuTien: 'NEN_CO',
  },
  {
    khoa: 'email.may_chu_smtp',
    nhan: 'Địa chỉ máy chủ SMTP (Host)',
    moTa: 'Tên miền máy chủ gửi thư (chỉ chấp nhận tên miền hợp lệ, chặn địa chỉ nội bộ localhost/127.0.0.1).',
    nhom: 'email',
    phanNhom: 'ket-noi-smtp',
    tieuDePhanNhom: 'Kết nối máy chủ SMTP',
    kieu: 'text',
    kieuDuLieuDb: 'CHUOI',
    macDinh: 'smtp.gmail.com',
    congKhai: false,
    mucUuTien: 'NEN_CO',
    placeholder: 'smtp.gmail.com',
  },
  {
    khoa: 'email.cong_smtp',
    nhan: 'Cổng kết nối SMTP (Port)',
    moTa: 'Cổng giao tiếp chuẩn của máy chủ gửi thư.',
    nhom: 'email',
    phanNhom: 'ket-noi-smtp',
    tieuDePhanNhom: 'Kết nối máy chủ SMTP',
    kieu: 'select',
    kieuDuLieuDb: 'SO',
    macDinh: '587',
    congKhai: false,
    mucUuTien: 'NEN_CO',
    donVi: 'cổng',
    tuyChonSelect: [
      { giaTri: '587', nhan: '587 (STARTTLS - Khuyên dùng)' },
      { giaTri: '465', nhan: '465 (SSL/TLS)' },
      { giaTri: '2525', nhan: '2525 (Dịch vụ Relay)' },
    ],
  },
  {
    khoa: 'email.tai_khoan_smtp',
    nhan: 'Tài khoản đăng nhập SMTP',
    moTa: 'Địa chỉ email hoặc tên tài khoản xác thực với máy chủ SMTP.',
    nhom: 'email',
    phanNhom: 'ket-noi-smtp',
    tieuDePhanNhom: 'Kết nối máy chủ SMTP',
    kieu: 'text',
    kieuDuLieuDb: 'CHUOI',
    macDinh: '',
    congKhai: false,
    mucUuTien: 'NEN_CO',
    placeholder: 'hethong.lms@truong.edu.vn',
  },
  {
    khoa: 'email.mat_khau_ung_dung_smtp',
    nhan: 'Mật khẩu ứng dụng SMTP',
    moTa: 'Mật khẩu ứng dụng 16 ký tự (App Password) hoặc khóa xác thực SMTP. Được mã hóa trên máy chủ và luôn che mặt nạ.',
    nhom: 'email',
    phanNhom: 'ket-noi-smtp',
    tieuDePhanNhom: 'Kết nối máy chủ SMTP',
    kieu: 'password',
    kieuDuLieuDb: 'CHUOI',
    macDinh: '',
    congKhai: false,
    biMat: true,
    mucUuTien: 'NEN_CO',
    placeholder: 'Nhập mật khẩu ứng dụng mới (để trống nếu giữ nguyên)...',
  },
  {
    khoa: 'email.email_nguoi_gui',
    nhan: 'Địa chỉ email hiển thị người gửi',
    moTa: 'Địa chỉ email xuất hiện ở mục Người gửi khi học sinh và giảng viên nhận thư.',
    nhom: 'email',
    phanNhom: 'dinh-danh-nguoi-gui',
    tieuDePhanNhom: 'Định danh người gửi',
    moTaPhanNhom: 'Thông tin tên đơn vị và địa chỉ hòm thư hiển thị cho người nhận.',
    kieu: 'text',
    kieuDuLieuDb: 'CHUOI',
    macDinh: 'no-reply@truong.edu.vn',
    congKhai: false,
    mucUuTien: 'NEN_CO',
    placeholder: 'no-reply@truong.edu.vn',
  },
  {
    khoa: 'email.ten_hien_thi_nguoi_gui',
    nhan: 'Tên đơn vị hiển thị khi gửi thư',
    moTa: 'Tên đơn vị đào tạo hiển thị kèm địa chỉ email gửi đi.',
    nhom: 'email',
    phanNhom: 'dinh-danh-nguoi-gui',
    tieuDePhanNhom: 'Định danh người gửi',
    kieu: 'text',
    kieuDuLieuDb: 'CHUOI',
    macDinh: 'Phòng Đào tạo - SmartClass AI',
    congKhai: false,
    mucUuTien: 'NEN_CO',
    placeholder: 'Phòng Đào tạo - SmartClass AI',
  },
];

/**
 * Bản đồ tra cứu nhanh từ khóa cũ (UPPER_SNAKE_CASE) sang khóa chuẩn mới (nhom.ten_khoa)
 */
export const ANH_XA_KHOA_CU_SANG_MOI: Record<string, string> = {};
export const ANH_XA_KHOA_MOI_SANG_CU: Record<string, string> = {};
export const BAN_DO_DINH_NGHIA_CAI_DAT: Record<string, DinhNghiaKhoaCaiDat> = {};

for (const muc of DANH_MUC_CAI_DAT_HE_THONG) {
  BAN_DO_DINH_NGHIA_CAI_DAT[muc.khoa] = muc;
  if (muc.khoaCu) {
    ANH_XA_KHOA_CU_SANG_MOI[muc.khoaCu] = muc.khoa;
    ANH_XA_KHOA_MOI_SANG_CU[muc.khoa] = muc.khoaCu;
    BAN_DO_DINH_NGHIA_CAI_DAT[muc.khoaCu] = muc;
  }
}

/**
 * Chuẩn hóa khóa cài đặt về định dạng mới (nhom.ten_khoa)
 */
export function chuanHoaKhoaCaiDat(khoa: string): string {
  return ANH_XA_KHOA_CU_SANG_MOI[khoa] || khoa;
}

/**
 * Sinh nhãn tạm dễ đọc từ tên khóa kỹ thuật khi khóa chưa có nhãn trong siêu dữ liệu:
 * bỏ tiền tố nhóm (nhom.), thay '_' bằng khoảng trắng, viết hoa chữ cái đầu.
 */
export function taoNhanTamTuKhoa(khoa: string): string {
  const dinhNghia = BAN_DO_DINH_NGHIA_CAI_DAT[khoa];
  if (dinhNghia?.nhan) return dinhNghia.nhan;
  const boTienTo = khoa.includes('.') ? khoa.split('.').slice(1).join(' ') : khoa;
  const chuoiSach = boTienTo
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  if (!chuoiSach) return khoa;
  return chuoiSach.charAt(0).toUpperCase() + chuoiSach.slice(1);
}

/**
 * Chuỗi mặt nạ cố định dùng để che giá trị bí mật khi trả về phía trình duyệt
 */
export const MAT_NA_KHOA_BI_MAT = '••••••••••••••••';

