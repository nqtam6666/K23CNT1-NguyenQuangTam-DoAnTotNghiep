import {
  Users,
  UserCheck,
  BookOpen,
  Calendar,
  Video,
  Settings,
  GraduationCap,
  HeartHandshake,
  Info,
  Sparkles,
  LucideIcon,
} from 'lucide-react';
import { VaiTro, DoiTuong, HanhDong } from '@lms/chung';

export type NhomMenu = 'QUAN_TRI' | 'HOC_TAP' | 'CA_NHAN';

export interface MucMenuCauHinh {
  id: string;
  tieuDe: string; // Chữ hoa đầu câu theo chuẩn
  duongDan: string;
  bieuTuong: LucideIcon;
  nhom: NhomMenu;
  vaiTroChoPhep: VaiTro[];
  quyenYeuCau?: {
    hanhDong: HanhDong;
    doiTuong: DoiTuong;
  };
  huyHieu?: number | string;
}

export const NHOM_MENU_INFO: Record<NhomMenu, { tenNhom: string }> = {
  QUAN_TRI: { tenNhom: 'Quản trị' },
  HOC_TAP: { tenNhom: 'Học tập' },
  CA_NHAN: { tenNhom: 'Cá nhân' },
};

export const DANH_MUC_MENU_CAU_HINH: MucMenuCauHinh[] = [
  // Nhóm Cá nhân & Tổng quan
  {
    id: 'bang-dieu-khien',
    tieuDe: 'Tổng quan',
    duongDan: '/bang-dieu-khien',
    bieuTuong: BookOpen,
    nhom: 'CA_NHAN',
    vaiTroChoPhep: [
      VaiTro.QUAN_TRI_VIEN,
      VaiTro.BAN_GIAM_HIEU,
      VaiTro.GIAO_VU,
      VaiTro.GIAO_VIEN,
      VaiTro.HOC_SINH,
      VaiTro.PHU_HUYNH,
    ],
  },
  {
    id: 'ho-so',
    tieuDe: 'Hồ sơ cá nhân',
    duongDan: '/ho-so',
    bieuTuong: UserCheck,
    nhom: 'CA_NHAN',
    vaiTroChoPhep: [
      VaiTro.QUAN_TRI_VIEN,
      VaiTro.BAN_GIAM_HIEU,
      VaiTro.GIAO_VU,
      VaiTro.GIAO_VIEN,
      VaiTro.HOC_SINH,
      VaiTro.PHU_HUYNH,
    ],
  },
  {
    id: 'gioi-thieu',
    tieuDe: 'Giới thiệu hệ thống',
    duongDan: '/gioi-thieu',
    bieuTuong: Info,
    nhom: 'CA_NHAN',
    vaiTroChoPhep: [
      VaiTro.QUAN_TRI_VIEN,
      VaiTro.BAN_GIAM_HIEU,
      VaiTro.GIAO_VU,
      VaiTro.GIAO_VIEN,
      VaiTro.HOC_SINH,
      VaiTro.PHU_HUYNH,
    ],
  },

  // Nhóm Học tập
  {
    id: 'lop-hoc-phan',
    tieuDe: 'Lớp học phần',
    duongDan: '/lop-hoc-phan',
    bieuTuong: Video,
    nhom: 'HOC_TAP',
    vaiTroChoPhep: [
      VaiTro.QUAN_TRI_VIEN,
      VaiTro.BAN_GIAM_HIEU,
      VaiTro.GIAO_VU,
      VaiTro.GIAO_VIEN,
      VaiTro.HOC_SINH,
      VaiTro.PHU_HUYNH,
    ],
  },
  {
    id: 'thoi-khoa-bieu',
    tieuDe: 'Thời khóa biểu',
    duongDan: '/thoi-khoa-bieu',
    bieuTuong: Calendar,
    nhom: 'HOC_TAP',
    vaiTroChoPhep: [
      VaiTro.QUAN_TRI_VIEN,
      VaiTro.BAN_GIAM_HIEU,
      VaiTro.GIAO_VU,
      VaiTro.GIAO_VIEN,
      VaiTro.HOC_SINH,
      VaiTro.PHU_HUYNH,
    ],
  },
  {
    id: 'tro-ly-ai',
    tieuDe: 'Trợ lý học tập',
    duongDan: '/tro-ly-ai',
    bieuTuong: Sparkles,
    nhom: 'HOC_TAP',
    vaiTroChoPhep: [
      VaiTro.QUAN_TRI_VIEN,
      VaiTro.BAN_GIAM_HIEU,
      VaiTro.GIAO_VU,
      VaiTro.GIAO_VIEN,
      VaiTro.HOC_SINH,
    ],
  },
  {
    id: 'con-em',
    tieuDe: 'Con em của tôi',
    duongDan: '/phu-huynh/con-em',
    bieuTuong: HeartHandshake,
    nhom: 'HOC_TAP',
    // QUẢN TRỊ VIÊN TUYỆT ĐỐI KHÔNG ĐƯỢC XEM MỤC NÀY
    vaiTroChoPhep: [VaiTro.PHU_HUYNH],
    quyenYeuCau: {
      hanhDong: HanhDong.Doc,
      doiTuong: DoiTuong.PhuHuynhHocSinh,
    },
  },

  // Nhóm Quản trị
  {
    id: 'nguoi-dung',
    tieuDe: 'Quản lý người dùng',
    duongDan: '/nguoi-dung',
    bieuTuong: Users,
    nhom: 'QUAN_TRI',
    vaiTroChoPhep: [VaiTro.QUAN_TRI_VIEN, VaiTro.GIAO_VU],
    quyenYeuCau: {
      hanhDong: HanhDong.Doc,
      doiTuong: DoiTuong.NguoiDung,
    },
  },
  {
    id: 'hoc-vu',
    tieuDe: 'Học vụ và đào tạo',
    duongDan: '/hoc-vu',
    bieuTuong: GraduationCap,
    nhom: 'QUAN_TRI',
    vaiTroChoPhep: [VaiTro.QUAN_TRI_VIEN, VaiTro.BAN_GIAM_HIEU, VaiTro.GIAO_VU],
    quyenYeuCau: {
      hanhDong: HanhDong.Doc,
      doiTuong: DoiTuong.NamHoc,
    },
  },
  {
    id: 'cai-dat',
    tieuDe: 'Cài đặt hệ thống',
    duongDan: '/cai-dat',
    bieuTuong: Settings,
    nhom: 'QUAN_TRI',
    vaiTroChoPhep: [VaiTro.QUAN_TRI_VIEN],
    quyenYeuCau: {
      hanhDong: HanhDong.QuanLy,
      doiTuong: DoiTuong.CaiDatHeThong,
    },
  },
];

/**
 * Lọc danh sách menu theo vai trò người dùng hiện tại
 * Đảm bảo: Quản trị viên không thấy "Con em của tôi"
 */
export function locMenuTheoVaiTro(vaiTro: VaiTro | string): MucMenuCauHinh[] {
  return DANH_MUC_MENU_CAU_HINH.filter((item) => {
    // Nếu là mục Con em của tôi: CHỈ cho phép Phụ huynh
    if (item.id === 'con-em') {
      return vaiTro === VaiTro.PHU_HUYNH;
    }
    return item.vaiTroChoPhep.includes(vaiTro as VaiTro);
  });
}
