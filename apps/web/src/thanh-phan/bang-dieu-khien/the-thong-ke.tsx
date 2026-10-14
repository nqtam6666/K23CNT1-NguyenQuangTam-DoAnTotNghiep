'use client';

import Link from 'next/link';
import {
  Users,
  BookOpen,
  Calendar,
  Video,
  Clock,
  Bot,
  GraduationCap,
  UserCheck,
  FileSpreadsheet,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  LucideIcon,
} from 'lucide-react';
import { TheThongKe as ITheThongKe } from '@lms/chung';

const BAN_DO_BIEU_TUONG: Record<string, LucideIcon> = {
  Users,
  BookOpen,
  Calendar,
  Video,
  Clock,
  Bot,
  GraduationCap,
  UserCheck,
  FileSpreadsheet,
};

interface Props {
  duLieu: ITheThongKe;
}

/**
 * Thành phần <TheThongKeComponent> (tương đương <x-stat-card>)
 * - Eyebrow (mono 11px uppercase letter-spacing 0.12em màu muted)
 * - Số liệu lớn mono 20-24px màu accent
 * - Icon Lucide 20px stroke 1.5px trong ô viền 1px
 */
export function TheThongKeComponent({ duLieu }: Props) {
  const BieuTuong = BAN_DO_BIEU_TUONG[duLieu.bieuTuong] || BookOpen;

  const NoiDungThe = (
    <div
      className={`p-5 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] transition-colors duration-150 ${
        duLieu.duongDanChiTiet
          ? 'hover:border-[var(--accent)] hover:bg-[var(--active-bg)]/40 group cursor-pointer'
          : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="eyebrow">{duLieu.tieuDe}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-9 h-9 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] text-[var(--accent)] flex items-center justify-center">
            <BieuTuong strokeWidth={1.5} className="w-[20px] h-[20px]" />
          </div>
          {duLieu.duongDanChiTiet && (
            <ArrowUpRight
              strokeWidth={1.5}
              className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors"
            />
          )}
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-mono text-[22px] sm:text-[24px] font-bold text-[var(--accent)] tracking-tight leading-none">
          {duLieu.giaTri}
        </span>
        {duLieu.donVi && (
          <span className="font-mono text-xs font-medium text-[var(--muted)]">{duLieu.donVi}</span>
        )}
      </div>

      {duLieu.moTa && (
        <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed line-clamp-1">
          {duLieu.moTa}
        </p>
      )}

      {duLieu.xuHuong && (
        <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex items-center gap-2 text-xs">
          {duLieu.xuHuong.huong === 'TANG' ? (
            <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold bg-[var(--accent-soft)] text-[var(--accent)] px-2 py-0.5 rounded-[var(--radius)]">
              <TrendingUp strokeWidth={1.5} className="w-3 h-3" />
              {duLieu.xuHuong.giaTriPhanTram ? `+${duLieu.xuHuong.giaTriPhanTram}%` : 'Tăng'}
            </span>
          ) : duLieu.xuHuong.huong === 'GIAM' ? (
            <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold bg-[var(--danger-soft)] text-[var(--danger)] px-2 py-0.5 rounded-[var(--radius)]">
              <TrendingDown strokeWidth={1.5} className="w-3 h-3" />
              {duLieu.xuHuong.giaTriPhanTram ? `-${duLieu.xuHuong.giaTriPhanTram}%` : 'Giảm'}
            </span>
          ) : null}
          {duLieu.xuHuong.moTa && (
            <span className="text-[var(--muted)] text-[11px] truncate">{duLieu.xuHuong.moTa}</span>
          )}
        </div>
      )}
    </div>
  );

  if (duLieu.duongDanChiTiet) {
    return (
      <Link href={duLieu.duongDanChiTiet} prefetch={true} className="block select-none">
        {NoiDungThe}
      </Link>
    );
  }

  return NoiDungThe;
}
