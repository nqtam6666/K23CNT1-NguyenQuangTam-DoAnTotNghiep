'use client';

import React, { ReactNode } from 'react';
import { cn } from '../lib/utils';

export type LoaiHuyHieu = 'accent' | 'danger' | 'info' | 'warning' | 'muted';

export interface ThuocTinhHuyHieu {
  loai?: LoaiHuyHieu;
  children: ReactNode;
  className?: string;
}

const LOP_HUY_HIEU: Record<LoaiHuyHieu, string> = {
  accent: 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/25',
  danger: 'bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger)]/25',
  info: 'bg-[var(--info-soft)] text-[var(--info)] border-[var(--info)]/25',
  warning: 'bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning)]/25',
  muted: 'bg-[var(--active-bg)] text-[var(--muted)] border-[var(--border)]',
};

/**
 * Thành phần <HuyHieu> (tương đương <x-badge> cho trạng thái)
 * - Soft background + chữ đậm cùng tông, font mono 11px, radius 4px
 */
export function HuyHieu({ loai = 'accent', children, className }: ThuocTinhHuyHieu) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[11px] font-semibold rounded-[var(--radius)] border whitespace-nowrap',
        LOP_HUY_HIEU[loai],
        className,
      )}
    >
      {children}
    </span>
  );
}
