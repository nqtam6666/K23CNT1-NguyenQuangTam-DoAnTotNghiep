'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export interface ThuocTinhMucThanhBen {
  href?: string;
  onClick?: (e?: React.MouseEvent) => void;
  onMouseEnter?: (e?: React.MouseEvent) => void;
  onMouseLeave?: (e?: React.MouseEvent) => void;
  'data-id'?: string;
  'data-checked'?: string;
  'aria-selected'?: boolean;
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
 * - Hỗ trợ bọc trong <AnimatedBackground> (NenTabDong) để hiệu ứng nền trượt mượt giữa các mục.
 * - Danger (Đăng xuất): nền danger-soft, chữ và viền trái màu danger.
 * - Dưới 720px (md) hoặc khi thuGon=true: thu về 64px chỉ hiển thị icon 18px.
 */
export function MucThanhBen({
  href,
  onClick,
  onMouseEnter,
  onMouseLeave,
  'data-id': dataId,
  'data-checked': dataChecked,
  'aria-selected': ariaSelected,
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
  const dungNenDong = dataChecked !== undefined && !danger;
  const dangKichHoat = active || dataChecked === 'true';

  const lopPhongCach = cn(
    'group relative w-full flex items-center font-mono text-[14px] leading-snug transition-colors duration-150 select-none cursor-pointer rounded-r-[var(--radius)]',
    dungNenDong ? 'border-l-0' : 'border-l-[3px]',
    thuGon
      ? 'justify-center px-0 py-[11px]'
      : dungNenDong
        ? 'justify-center px-0 py-[11px] md:justify-start md:gap-[10px] md:py-[11px] md:pl-[19px] md:pr-[14px]'
        : 'justify-center px-0 py-[11px] md:justify-start md:gap-[10px] md:py-[11px] md:pl-[16px] md:pr-[14px]',
    dungNenDong &&
      (thuGon
        ? '[&_[data-slot=animated-tab-label]]:sr-only'
        : '[&_[data-slot=animated-tab-label]]:hidden md:[&_[data-slot=animated-tab-label]]:inline-flex md:[&_[data-slot=animated-tab-label]]:truncate'),
    danger
      ? 'bg-[var(--danger-soft)] text-[var(--danger)] border-l-[var(--danger)] hover:brightness-95 font-medium'
      : dungNenDong
        ? dangKichHoat
          ? 'text-[var(--accent)] font-medium'
          : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--active-bg)]/60 font-normal'
        : dangKichHoat
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
          'relative z-10 w-[18px] h-[18px] shrink-0 transition-colors',
          danger
            ? 'text-[var(--danger)]'
            : dangKichHoat
              ? 'text-[var(--accent)]'
              : 'text-[var(--muted)] group-hover:text-[var(--text)]',
        )}
      />

      {dungNenDong ? (
        children
      ) : (
        <span
          className={cn(
            'relative z-10 whitespace-nowrap truncate min-w-0',
            thuGon ? 'sr-only' : 'hidden md:inline-block',
          )}
        >
          {children}
        </span>
      )}

      {!thuGon && huyHieu && !dangKichHoat && (
        <span className="relative z-10 hidden md:inline-flex ml-auto px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] shrink-0">
          {huyHieu}
        </span>
      )}

      {/* Chấm tròn 6px accent bên phải cho mọi mục active (trừ Danger) */}
      {!thuGon && dangKichHoat && !danger && (
        <span
          aria-hidden="true"
          className="relative z-10 hidden md:inline-block ml-auto w-[6px] h-[6px] rounded-full bg-[var(--accent)] shrink-0"
        />
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        prefetch={true}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        data-id={dataId}
        data-checked={dataChecked}
        aria-selected={ariaSelected}
        aria-current={dangKichHoat ? 'page' : undefined}
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
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-id={dataId}
      data-checked={dataChecked}
      aria-selected={ariaSelected}
      disabled={disabled}
      aria-current={dangKichHoat ? 'page' : undefined}
      aria-label={nhanAria}
      title={nhanAria}
      className={lopPhongCach}
    >
      {noiDung}
    </button>
  );
}
