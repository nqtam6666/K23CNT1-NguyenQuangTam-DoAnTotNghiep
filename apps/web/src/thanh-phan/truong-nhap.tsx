'use client';

import React, {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  forwardRef,
} from 'react';
import { cn } from '../lib/utils';

export interface ThuocTinhTruongNhap extends InputHTMLAttributes<HTMLInputElement> {
  nhan?: string;
  loi?: string;
  goiY?: string;
  batBuoc?: boolean;
}

/**
 * Thành phần <TruongNhap> (tương đương <x-input>)
 * - Nền surface, viền 1px, focus ring 2px màu accent
 * - Label mono 12px
 * - Thông báo lỗi màu danger hiển thị ngay dưới field
 */
export const TruongNhap = forwardRef<HTMLInputElement, ThuocTinhTruongNhap>(
  ({ nhan, loi, goiY, batBuoc, id, className, ...props }, ref) => {
    const idLoi = id ? `${id}-error` : undefined;

    return (
      <div className="space-y-1.5">
        {nhan && (
          <label
            htmlFor={id}
            className="block font-mono text-[12px] font-semibold text-[var(--text)]"
          >
            {nhan}
            {batBuoc && <span className="text-[var(--danger)] ml-1">*</span>}
          </label>
        )}

        <input
          ref={ref}
          id={id}
          aria-invalid={Boolean(loi)}
          aria-describedby={loi && idLoi ? idLoi : undefined}
          className={cn(
            'w-full px-3.5 py-2.5 text-sm bg-[var(--surface)] text-[var(--text)] border rounded-[var(--radius)] transition-colors outline-none',
            'placeholder:text-[var(--muted)]/75',
            'focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/25',
            'disabled:opacity-55 disabled:cursor-not-allowed',
            loi ? 'border-[var(--danger)]' : 'border-[var(--border)]',
            className,
          )}
          {...props}
        />

        {goiY && !loi && <p className="text-xs text-[var(--muted)]">{goiY}</p>}
        {loi && (
          <p id={idLoi} role="alert" className="text-xs text-[var(--danger)] font-medium">
            {loi}
          </p>
        )}
      </div>
    );
  },
);
TruongNhap.displayName = 'TruongNhap';

export interface ThuocTinhTruongChon extends SelectHTMLAttributes<HTMLSelectElement> {
  nhan?: string;
  loi?: string;
  goiY?: string;
  batBuoc?: boolean;
}

/**
 * Thành phần <TruongChon> (tương đương <x-select>)
 */
export const TruongChon = forwardRef<HTMLSelectElement, ThuocTinhTruongChon>(
  ({ nhan, loi, goiY, batBuoc, id, className, children, ...props }, ref) => {
    const idLoi = id ? `${id}-error` : undefined;

    return (
      <div className="space-y-1.5">
        {nhan && (
          <label
            htmlFor={id}
            className="block font-mono text-[12px] font-semibold text-[var(--text)]"
          >
            {nhan}
            {batBuoc && <span className="text-[var(--danger)] ml-1">*</span>}
          </label>
        )}

        <select
          ref={ref}
          id={id}
          aria-invalid={Boolean(loi)}
          aria-describedby={loi && idLoi ? idLoi : undefined}
          className={cn(
            'w-full px-3.5 py-2.5 text-sm bg-[var(--surface)] text-[var(--text)] border rounded-[var(--radius)] transition-colors outline-none cursor-pointer',
            'focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/25',
            'disabled:opacity-55 disabled:cursor-not-allowed',
            loi ? 'border-[var(--danger)]' : 'border-[var(--border)]',
            className,
          )}
          {...props}
        >
          {children}
        </select>

        {goiY && !loi && <p className="text-xs text-[var(--muted)]">{goiY}</p>}
        {loi && (
          <p id={idLoi} role="alert" className="text-xs text-[var(--danger)] font-medium">
            {loi}
          </p>
        )}
      </div>
    );
  },
);
TruongChon.displayName = 'TruongChon';

export interface ThuocTinhTruongVanBan extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  nhan?: string;
  loi?: string;
  goiY?: string;
  batBuoc?: boolean;
}

/**
 * Thành phần <TruongVanBan> (tương đương <x-textarea>)
 */
export const TruongVanBan = forwardRef<HTMLTextAreaElement, ThuocTinhTruongVanBan>(
  ({ nhan, loi, goiY, batBuoc, id, className, rows = 4, ...props }, ref) => {
    const idLoi = id ? `${id}-error` : undefined;

    return (
      <div className="space-y-1.5">
        {nhan && (
          <label
            htmlFor={id}
            className="block font-mono text-[12px] font-semibold text-[var(--text)]"
          >
            {nhan}
            {batBuoc && <span className="text-[var(--danger)] ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={id}
          rows={rows}
          aria-invalid={Boolean(loi)}
          aria-describedby={loi && idLoi ? idLoi : undefined}
          className={cn(
            'w-full px-3.5 py-2.5 text-sm bg-[var(--surface)] text-[var(--text)] border rounded-[var(--radius)] transition-colors outline-none',
            'placeholder:text-[var(--muted)]/75',
            'focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/25',
            'disabled:opacity-55 disabled:cursor-not-allowed',
            loi ? 'border-[var(--danger)]' : 'border-[var(--border)]',
            className,
          )}
          {...props}
        />

        {goiY && !loi && <p className="text-xs text-[var(--muted)]">{goiY}</p>}
        {loi && (
          <p id={idLoi} role="alert" className="text-xs text-[var(--danger)] font-medium">
            {loi}
          </p>
        )}
      </div>
    );
  },
);
TruongVanBan.displayName = 'TruongVanBan';
