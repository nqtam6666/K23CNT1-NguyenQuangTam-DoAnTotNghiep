'use client';

import React, { ReactNode } from 'react';
import { Inbox, LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export interface ThuocTinhBangDuLieu {
  headers?: ReactNode[];
  children: ReactNode;
  className?: string;
  tableClassName?: string;
}

/**
 * Thành phần <BangDuLieu> (tương đương <x-table>)
 * - Header mono uppercase 11px
 * - Hàng kẻ 1px, hover hàng nền active-bg
 * - Hỗ trợ cuộn ngang trên mobile (overflow-x: auto)
 */
export function BangDuLieu({
  headers,
  children,
  className,
  tableClassName,
}: ThuocTinhBangDuLieu) {
  return (
    <div
      className={cn(
        'w-full overflow-x-auto border border-[var(--border)] rounded-[var(--radius)] bg-[var(--surface)]',
        className,
      )}
    >
      <table className={cn('w-full text-left border-collapse text-sm', tableClassName)}>
        {headers && headers.length > 0 && (
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-[var(--border)]">{children}</tbody>
      </table>
    </div>
  );
}

export interface ThuocTinhTrangThaiRong {
  icon?: LucideIcon;
  tieuDe?: string;
  moTa: string;
  hanhDong?: ReactNode;
  className?: string;
}

/**
 * Thành phần <TrangThaiRong> (Empty State chuẩn UX)
 * - Icon + một dòng mô tả + nút hành động
 */
export function TrangThaiRong({
  icon: BieuTuong = Inbox,
  tieuDe,
  moTa,
  hanhDong,
  className,
}: ThuocTinhTrangThaiRong) {
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center justify-center text-center py-10 px-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)]',
        className,
      )}
    >
      <div className="w-11 h-11 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] flex items-center justify-center text-[var(--muted)] mb-3">
        <BieuTuong strokeWidth={1.5} className="w-5 h-5" />
      </div>
      {tieuDe && (
        <h3 className="font-mono text-sm font-bold text-[var(--text)] mb-1">{tieuDe}</h3>
      )}
      <p className="text-xs text-[var(--muted)] max-w-md leading-relaxed">{moTa}</p>
      {hanhDong && <div className="mt-4">{hanhDong}</div>}
    </div>
  );
}
