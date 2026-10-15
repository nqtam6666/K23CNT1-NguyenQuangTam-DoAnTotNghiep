'use client';

import Link from 'next/link';
import {
  Users,
  Settings,
  Calendar,
  Video,
  GraduationCap,
  HeartHandshake,
  UserCheck,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { VaiTro } from '@lms/chung';
import { TheKhung } from '../the-khung';
import { AnimatedBackground } from '@/components/ui/animated-tabs';

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
          },
          {
            tieuDe: 'Cài đặt hệ thống',
            moTa: 'Tùy biến tham số, cấu hình chung',
            duongDan: '/cai-dat',
            bieuTuong: Settings,
          },
          {
            tieuDe: 'Học vụ và đào tạo',
            moTa: 'Quản lý năm học, học kỳ, môn học',
            duongDan: '/hoc-vu',
            bieuTuong: GraduationCap,
          },
        ];

      case VaiTro.GIAO_VU:
        return [
          {
            tieuDe: 'Thêm người dùng',
            moTa: 'Tạo tài khoản giáo viên, học sinh mới',
            duongDan: '/nguoi-dung',
            bieuTuong: Users,
          },
          {
            tieuDe: 'Quản lý học vụ',
            moTa: 'Năm học, môn học, lớp hành chính',
            duongDan: '/hoc-vu',
            bieuTuong: GraduationCap,
          },
          {
            tieuDe: 'Tạo lớp học phần',
            moTa: 'Mở lớp mới và phân công giảng viên',
            duongDan: '/lop-hoc-phan',
            bieuTuong: Video,
          },
          {
            tieuDe: 'Xếp thời khóa biểu',
            moTa: 'Bố trí phòng học và lịch giảng dạy',
            duongDan: '/thoi-khoa-bieu',
            bieuTuong: Calendar,
          },
        ];

      case VaiTro.GIAO_VIEN:
        return [
          {
            tieuDe: 'Lớp học phần phụ trách',
            moTa: 'Vào lớp giảng dạy, tài liệu, bài tập',
            duongDan: '/lop-hoc-phan',
            bieuTuong: Video,
          },
          {
            tieuDe: 'Thời khóa biểu giảng dạy',
            moTa: 'Xem lịch tuần và phòng học trực tuyến',
            duongDan: '/thoi-khoa-bieu',
            bieuTuong: Calendar,
          },
          {
            tieuDe: 'Cập nhật hồ sơ cá nhân',
            moTa: 'Học vị, chuyên môn và thông tin liên hệ',
            duongDan: '/ho-so',
            bieuTuong: UserCheck,
          },
        ];

      case VaiTro.HOC_SINH:
        return [
          {
            tieuDe: 'Lớp học của tôi',
            moTa: 'Xem bài giảng, nộp bài tập và thảo luận',
            duongDan: '/lop-hoc-phan',
            bieuTuong: Video,
          },
          {
            tieuDe: 'Thời khóa biểu học tập',
            moTa: 'Theo dõi lịch học trong tuần',
            duongDan: '/thoi-khoa-bieu',
            bieuTuong: Calendar,
          },
          {
            tieuDe: 'Hồ sơ học sinh',
            moTa: 'Thông tin cá nhân, kết quả học tập',
            duongDan: '/ho-so',
            bieuTuong: UserCheck,
          },
        ];

      case VaiTro.PHU_HUYNH:
        return [
          {
            tieuDe: 'Theo dõi con em',
            moTa: 'Xem chuyên cần và kết quả học tập của con',
            duongDan: '/phu-huynh/con-em',
            bieuTuong: HeartHandshake,
          },
          {
            tieuDe: 'Thời khóa biểu con em',
            moTa: 'Xem lịch học các môn của con',
            duongDan: '/thoi-khoa-bieu',
            bieuTuong: Calendar,
          },
          {
            tieuDe: 'Hồ sơ cá nhân',
            moTa: 'Cập nhật số điện thoại và thông tin liên lạc',
            duongDan: '/ho-so',
            bieuTuong: UserCheck,
          },
        ];

      default:
        return [
          {
            tieuDe: 'Hồ sơ cá nhân',
            moTa: 'Xem và cập nhật thông tin cá nhân',
            duongDan: '/ho-so',
            bieuTuong: UserCheck,
          },
        ];
    }
  };

  const danhSach = layDanhSachLoiTat();

  return (
    <TheKhung
      icon={Zap}
      eyebrow="ĐIỀU HƯỚNG NHANH"
      tieuDe="Lối tắt thao tác nhanh"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatedBackground
          enableHover
          className="rounded-[var(--radius)] bg-[var(--active-bg)]"
          transition={{ type: 'spring', bounce: 0.15, duration: 0.25 }}
        >
          {danhSach.map((item) => {
            const BieuTuong = item.bieuTuong;
            return (
              <Link
                key={item.tieuDe}
                data-id={item.tieuDe}
                href={item.duongDan}
                prefetch={true}
                className="flex items-center justify-between p-3.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--accent)] transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] flex items-center justify-center shrink-0">
                    <BieuTuong strokeWidth={1.5} className="w-[20px] h-[20px]" />
                  </div>
                  <div className="truncate">
                    <p className="font-mono text-xs font-semibold text-[var(--text)] truncate">
                      {item.tieuDe}
                    </p>
                    <p className="text-[11px] text-[var(--muted)] truncate">{item.moTa}</p>
                  </div>
                </div>
                <ArrowRight
                  strokeWidth={1.5}
                  className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all shrink-0 ml-2"
                />
              </Link>
            );
          })}
        </AnimatedBackground>
      </div>
    </TheKhung>
  );
}
