'use client';

import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export type BienTheNutBam = 'primary' | 'secondary' | 'danger';

export interface ThuocTinhNutBam extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BienTheNutBam;
  dangTai?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

/**
 * Thành phần <NutBam> (tương đương <x-button variant="primary|secondary|danger">)
 * - primary: nền accent, chữ trắng, bóng nhẹ màu accent (30% opacity)
 * - secondary: nền surface, viền border, chữ muted (hover chữ text)
 * - danger: nền danger, chữ trắng (hoặc dùng cho hành động nguy hiểm)
 * - Padding 11px 20px, font Be Vietnam Pro 13px weight 600, radius 4px
 * - Hover brightness(.96), disabled giảm opacity và cursor-not-allowed
 */
export function NutBam({
  variant = 'primary',
  dangTai = false,
  icon,
  disabled,
  className,
  children,
  ...props
}: ThuocTinhNutBam) {
  const biKhoa = disabled || dangTai;

  const lopBienThe: Record<BienTheNutBam, string> = {
    primary:
      'bg-[var(--accent)] text-[var(--primary-foreground)] border border-[var(--accent)] shadow-accent',
    secondary:
      'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)] hover:bg-[var(--active-bg)]',
    danger:
      'bg-[var(--danger)] text-white border border-[var(--danger)]',
  };

  return (
    <button
      disabled={biKhoa}
      className={cn(
        'inline-flex items-center justify-center gap-2 py-[11px] px-[20px] font-sans text-[13px] font-semibold leading-none rounded-[var(--radius)] transition-all duration-150 cursor-pointer select-none whitespace-nowrap',
        'hover:brightness-96 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
        'disabled:opacity-55 disabled:cursor-not-allowed',
        lopBienThe[variant],
        className,
      )}
      {...props}
    >
      {dangTai ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        icon && <span className="shrink-0 flex items-center">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
}
