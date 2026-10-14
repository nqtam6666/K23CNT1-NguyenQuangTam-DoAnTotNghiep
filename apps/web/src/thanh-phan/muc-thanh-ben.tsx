'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export interface ThuocTinhMucThanhBen {
  href?: string;
  onClick?: () => void;
  active?: boolean;
  icon: LucideIcon;
  danger?: boolean;
  laTongQuan?: boolean;
  thuGon?: boolean;
  huyHieu?: string;
  title?: string;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Thành phần <MucThanhBen> (tương đương <x-sidebar-item :active :icon :danger>)
 * - Mặc định: màu muted, border-left: 3px solid transparent, padding 11px 18px, gap 12px.
 * - Hover: chữ chuyển sang màu text.
 * - Active: nền accent-soft, chữ accent, viền trái 3px accent, kèm chấm tròn 6px accent bên phải.
 * - Mục "Tổng quan" khi được chọn dùng nền active-bg (kem đậm), không dùng accent.
 * - Danger (Đăng xuất): nền danger-soft, chữ và viền trái màu danger.
 * - Dưới 720px (md) hoặc khi thuGon=true: thu về 64px chỉ hiển thị icon 18px.
 */
export function MucThanhBen({
  href,
  onClick,
  active = false,
  icon: BieuTuong,
  danger = false,
  laTongQuan = false,
  thuGon = false,
  huyHieu,
  title,
  disabled = false,
  children,
  className,
}: ThuocTinhMucThanhBen) {
  const nhanAria = typeof children === 'string' ? children : title;

  const lopPhongCach = cn(
    'group relative w-full flex items-center font-mono text-[14px] leading-snug transition-colors duration-150 select-none cursor-pointer rounded-r-[var(--radius)] border-l-[3px]',
    thuGon
      ? 'justify-center px-0 py-[11px]'
      : 'justify-center px-0 py-[11px] md:justify-start md:gap-[10px] md:py-[11px] md:pl-[16px] md:pr-[14px]',
    danger
      ? 'bg-[var(--danger-soft)] text-[var(--danger)] border-l-[var(--danger)] hover:brightness-95 font-medium'
      : active
        ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-l-[var(--accent)] font-medium'
        : 'border-l-transparent text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--active-bg)]/60 font-normal',
    disabled && 'opacity-55 cursor-not-allowed pointer-events-none',
    className,
  );

  const noiDung = (
    <>
      <BieuTuong
        strokeWidth={1.5}
        className={cn(
          'w-[18px] h-[18px] shrink-0 transition-colors',
          danger
            ? 'text-[var(--danger)]'
            : active
              ? 'text-[var(--accent)]'
              : 'text-[var(--muted)] group-hover:text-[var(--text)]',
        )}
      />

      <span
        className={cn(
          'whitespace-nowrap truncate min-w-0',
          thuGon ? 'sr-only' : 'hidden md:inline-block',
        )}
      >
        {children}
      </span>

      {!thuGon && huyHieu && !active && (
        <span className="hidden md:inline-flex ml-auto px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] shrink-0">
          {huyHieu}
        </span>
      )}

      {/* Chấm tròn 6px accent bên phải cho mọi mục active (trừ Danger) */}
      {!thuGon && active && !danger && (
        <span
          aria-hidden="true"
          className="hidden md:inline-block ml-auto w-[6px] h-[6px] rounded-full bg-[var(--accent)] shrink-0"
        />
      )}
    </>
  );

  if (href && !onClick) {
    return (
      <Link
        href={href}
        prefetch={true}
        aria-current={active ? 'page' : undefined}
        aria-label={nhanAria}
        title={nhanAria}
        className={lopPhongCach}
      >
        {noiDung}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-current={active ? 'page' : undefined}
      aria-label={nhanAria}
      title={nhanAria}
      className={lopPhongCach}
    >
      {noiDung}
    </button>
  );
}
