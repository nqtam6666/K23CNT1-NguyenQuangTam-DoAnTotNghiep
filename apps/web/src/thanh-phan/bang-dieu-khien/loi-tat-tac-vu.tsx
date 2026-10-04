'use client';

import Link from 'next/link';
import {
  Users,
  Settings,
  BookOpen,
  Calendar,
  Video,
  FileSpreadsheet,
  GraduationCap,
  HeartHandshake,
  UserCheck,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { VaiTro } from '@lms/chung';

interface Props {
  vaiTro?: string;
}

export function LoiTatTacVu({ vaiTro }: Props) {
  const layDanhSachLoiTat = () => {
    switch (vaiTro) {
      case VaiTro.QUAN_TRI_VIEN:
        return [
          {
            tieuDe: 'Thêm người dùng',
            moTa: 'Tạo tài khoản giáo viên, học sinh mới',
            duongDan: '/nguoi-dung',
            bieuTuong: Users,
            mauSac: 'bg-blue-50 text-blue-600',
          },
          {
            tieuDe: 'Cài đặt hệ thống',
            moTa: 'Tùy biến tham số, cấu hình chung',
            duongDan: '/cai-dat',
            bieuTuong: Settings,
            mauSac: 'bg-purple-50 text-purple-600',
          },
          {
            tieuDe: 'Học vụ và đào tạo',
            moTa: 'Quản lý năm học, học kỳ, môn học',
            duongDan: '/hoc-vu',
            bieuTuong: GraduationCap,
            mauSac: 'bg-emerald-50 text-emerald-600',
          },
        ];

      case VaiTro.GIAO_VU:
        return [
          {
            tieuDe: 'Thêm người dùng',
            moTa: 'Tạo tài khoản giáo viên, học sinh mới',
            duongDan: '/nguoi-dung',
            bieuTuong: Users,
            mauSac: 'bg-blue-50 text-blue-600',
          },
          {
            tieuDe: 'Quản lý học vụ',
            moTa: 'Năm học, môn học, lớp hành chính',
            duongDan: '/hoc-vu',
            bieuTuong: GraduationCap,
            mauSac: 'bg-emerald-50 text-emerald-600',
          },
          {
            tieuDe: 'Tạo lớp học phần',
            moTa: 'Mở lớp mới và phân công giảng viên',
            duongDan: '/lop-hoc-phan',
            bieuTuong: Video,
            mauSac: 'bg-purple-50 text-purple-600',
          },
          {
            tieuDe: 'Xếp thời khóa biểu',
            moTa: 'Bố trí phòng học và lịch giảng dạy',
            duongDan: '/thoi-khoa-bieu',
            bieuTuong: Calendar,
            mauSac: 'bg-amber-50 text-amber-600',
          },
        ];

      case VaiTro.GIAO_VIEN:
        return [
          {
            tieuDe: 'Lớp học phần phụ trách',
            moTa: 'Vào lớp giảng dạy, tài liệu, bài tập',
            duongDan: '/lop-hoc-phan',
            bieuTuong: Video,
            mauSac: 'bg-blue-50 text-blue-600',
          },
          {
            tieuDe: 'Thời khóa biểu giảng dạy',
            moTa: 'Xem lịch tuần và phòng học trực tuyến',
            duongDan: '/thoi-khoa-bieu',
            bieuTuong: Calendar,
            mauSac: 'bg-emerald-50 text-emerald-600',
          },
          {
            tieuDe: 'Cập nhật hồ sơ cá nhân',
            moTa: 'Học vị, chuyên môn và thông tin liên hệ',
            duongDan: '/ho-so',
            bieuTuong: UserCheck,
            mauSac: 'bg-purple-50 text-purple-600',
          },
        ];

      case VaiTro.HOC_SINH:
        return [
          {
            tieuDe: 'Lớp học của tôi',
            moTa: 'Xem bài giảng, nộp bài tập và thảo luận',
            duongDan: '/lop-hoc-phan',
            bieuTuong: Video,
            mauSac: 'bg-blue-50 text-blue-600',
          },
          {
            tieuDe: 'Thời khóa biểu học tập',
            moTa: 'Theo dõi lịch học trong tuần',
            duongDan: '/thoi-khoa-bieu',
            bieuTuong: Calendar,
            mauSac: 'bg-emerald-50 text-emerald-600',
          },
          {
            tieuDe: 'Hồ sơ học sinh',
            moTa: 'Thông tin cá nhân, kết quả học tập',
            duongDan: '/ho-so',
            bieuTuong: UserCheck,
            mauSac: 'bg-purple-50 text-purple-600',
          },
        ];

      case VaiTro.PHU_HUYNH:
        return [
          {
            tieuDe: 'Theo dõi con em',
            moTa: 'Xem chuyên cần và kết quả học tập của con',
            duongDan: '/phu-huynh/con-em',
            bieuTuong: HeartHandshake,
            mauSac: 'bg-blue-50 text-blue-600',
          },
          {
            tieuDe: 'Thời khóa biểu con em',
            moTa: 'Xem lịch học các môn của con',
            duongDan: '/thoi-khoa-bieu',
            bieuTuong: Calendar,
            mauSac: 'bg-emerald-50 text-emerald-600',
          },
          {
            tieuDe: 'Hồ sơ cá nhân',
            moTa: 'Cập nhật số điện thoại và thông tin liên lạc',
            duongDan: '/ho-so',
            bieuTuong: UserCheck,
            mauSac: 'bg-purple-50 text-purple-600',
          },
        ];

      default:
        return [
          {
            tieuDe: 'Hồ sơ cá nhân',
            moTa: 'Xem và cập nhật thông tin cá nhân',
            duongDan: '/ho-so',
            bieuTuong: UserCheck,
            mauSac: 'bg-blue-50 text-blue-600',
          },
        ];
    }
  };

  const danhSach = layDanhSachLoiTat();

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-blue-600" />
        <h3 className="font-bold text-slate-900 text-sm sm:text-base">Lối tắt thao tác nhanh</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {danhSach.map((item) => {
          const BieuTuong = item.bieuTuong;
          return (
            <Link
              key={item.tieuDe}
              href={item.duongDan}
              prefetch={true}
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${item.mauSac}`}
                >
                  <BieuTuong className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-900 truncate">{item.tieuDe}</p>
                  <p className="text-[11px] text-slate-500 truncate">{item.moTa}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
