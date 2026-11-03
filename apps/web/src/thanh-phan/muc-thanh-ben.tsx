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
 * Thành phần <MucThanhBen> theo diện mạo SOFT:
 * - Font Be Vietnam Pro (font-sans), bo góc 8px (var(--radius)), khoảng đệm thoáng dễ bấm.
 * - Active: nền accent-soft, chữ accent đậm vừa (font-semibold), chấm tròn 6px bên phải.
 * - Danger (Đăng xuất): nền danger-soft nhẹ khi hover, chữ danger.
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
    'group relative w-full flex items-center font-sans text-[13.5px] leading-snug transition-colors duration-150 select-none cursor-pointer rounded-[var(--radius)]',
    thuGon
      ? 'justify-center px-0 py-2.5'
      : 'justify-center px-0 py-2.5 md:justify-start md:gap-3 md:py-2.5 md:px-3',
    dungNenDong &&
      (thuGon
        ? '[&_[data-slot=animated-tab-label]]:sr-only'
        : '[&_[data-slot=animated-tab-label]]:hidden md:[&_[data-slot=animated-tab-label]]:inline-flex md:[&_[data-slot=animated-tab-label]]:truncate'),
    danger
      ? 'text-[var(--danger)] hover:bg-[var(--danger-soft)] font-medium'
      : dungNenDong
        ? dangKichHoat
          ? 'text-[var(--accent)] font-semibold'
          : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--active-bg)]/70 font-medium'
        : dangKichHoat
          ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
          : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--active-bg)]/70 font-medium',
    disabled && 'opacity-55 cursor-not-allowed pointer-events-none',
    className,
  );

  const noiDung = (
    <>
      <BieuTuong
        strokeWidth={1.75}
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

      {!thuGon && dangKichHoat && !danger && (
        <span
          aria-hidden="true"
          className="relative z-10 hidden md:inline-block ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0"
        />
      )}
    </>
  );

  if (href && !disabled) {
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
        aria-label={thuGon ? nhanAria : undefined}
        title={title || nhanAria}
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
      aria-label={thuGon ? nhanAria : undefined}
      title={title || nhanAria}
      className={lopPhongCach}
    >
      {noiDung}
    </button>
  );
}
