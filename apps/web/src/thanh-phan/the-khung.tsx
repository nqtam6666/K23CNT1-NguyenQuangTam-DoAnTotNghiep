'use client';

import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export interface ThuocTinhTheKhung {
  eyebrow?: string;
  tieuDe?: string;
  moTa?: string;
  icon?: LucideIcon;
  hanhDong?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  khongPaddingBody?: boolean;
}

/**
 * Thành phần <TheKhung> (tương đương <x-card>)
 * - Nền surface, viền 1px border, bo góc 4px, không đổ bóng
 * - Slot header: ô icon 44x44 viền 1px + eyebrow + tiêu đề, ngăn cách body bằng border-bottom
 * - Slot body: vùng nội dung chính
 */
export function TheKhung({
  eyebrow,
  tieuDe,
  moTa,
  icon: BieuTuong,
  hanhDong,
  children,
  className,
  bodyClassName,
  khongPaddingBody = false,
}: ThuocTinhTheKhung) {
  const coHeader = Boolean(tieuDe || eyebrow || BieuTuong || hanhDong);

  return (
    <section
      className={cn(
        'bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden',
        className,
      )}
    >
      {coHeader && (
        <header className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[var(--border)] flex-wrap">
          <div className="flex items-center gap-3.5 min-w-0">
            {BieuTuong && (
              <div className="w-[44px] h-[44px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] flex items-center justify-center text-[var(--accent)] shrink-0">
                <BieuTuong strokeWidth={1.5} className="w-[20px] h-[20px]" />
              </div>
            )}
            <div className="min-w-0 space-y-0.5">
              {eyebrow && <p className="eyebrow">{eyebrow}</p>}
              {tieuDe && (
                <h2 className="font-mono text-[16px] sm:text-[17px] font-bold text-[var(--text)] truncate">
                  {tieuDe}
                </h2>
              )}
              {moTa && (
                <p className="text-xs text-[var(--muted)] leading-relaxed truncate">{moTa}</p>
              )}
            </div>
          </div>

          {hanhDong && <div className="flex items-center gap-2 shrink-0">{hanhDong}</div>}
        </header>
      )}

      <div className={cn(!khongPaddingBody && 'p-5 sm:p-6', bodyClassName)}>{children}</div>
    </section>
  );
}
