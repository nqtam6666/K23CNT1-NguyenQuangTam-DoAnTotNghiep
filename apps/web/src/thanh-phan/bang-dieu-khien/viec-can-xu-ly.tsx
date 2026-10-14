'use client';

import Link from 'next/link';
import { CheckCircle, ArrowRight, ListTodo } from 'lucide-react';
import { ViecCanXuLy as IViecCanXuLy } from '@lms/chung';
import { TheKhung } from '../the-khung';
import { HuyHieu } from '../huy-hieu';
import { TrangThaiRong } from '../bang-du-lieu';

interface Props {
  danhSach: IViecCanXuLy[];
}

export function ViecCanXuLyComponent({ danhSach }: Props) {
  const layBadgeUuTien = (mucDo: string) => {
    switch (mucDo) {
      case 'CAO':
        return <HuyHieu loai="danger">Ưu tiên cao</HuyHieu>;
      case 'TRUNG_BINH':
        return <HuyHieu loai="warning">Trung bình</HuyHieu>;
      default:
        return <HuyHieu loai="muted">Thông thường</HuyHieu>;
    }
  };

  return (
    <TheKhung
      icon={ListTodo}
      eyebrow="DANH SÁCH CÔNG VIỆC"
      tieuDe="Việc cần xử lý"
      moTa="Các tác vụ cần giải quyết theo vai trò"
      hanhDong={
        danhSach && danhSach.length > 0 ? (
          <HuyHieu loai="accent">{danhSach.length} việc</HuyHieu>
        ) : undefined
      }
    >
      {!danhSach || danhSach.length === 0 ? (
        <TrangThaiRong
          icon={CheckCircle}
          tieuDe="Đã hoàn tất công việc"
          moTa="Không có tác vụ nào đang chờ xử lý."
          className="border-none py-6"
        />
      ) : (
        <div className="divide-y divide-[var(--border)]">
          {danhSach.map((item) => (
            <div
              key={item.id}
              className="py-3 flex items-start justify-between gap-3 first:pt-0 last:pb-0"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-semibold text-[var(--text)] truncate">
                    {item.tieuDe}
                  </span>
                  {layBadgeUuTien(item.mucDoUuTien)}
                </div>
                <p className="text-xs text-[var(--muted)] line-clamp-2 leading-relaxed">
                  {item.moTa}
                </p>
              </div>

              <Link
                href={item.duongDan}
                prefetch={true}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius)] font-mono text-xs font-semibold bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] transition-colors border border-[var(--border)]"
              >
                <span>Xử lý</span>
                <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </TheKhung>
  );
}
