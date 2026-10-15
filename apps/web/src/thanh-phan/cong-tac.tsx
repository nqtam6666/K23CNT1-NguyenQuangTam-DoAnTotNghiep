'use client';

import React, { useId } from 'react';

export interface ThuocTinhCongTac {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
  dataInputKhoa?: string;
  className?: string;
}

export function CongTac({
  id,
  checked,
  onChange,
  disabled = false,
  ariaLabel,
  dataInputKhoa,
  className = '',
}: ThuocTinhCongTac) {
  const idTuDong = useId();
  const idInput = id || `cong-tac-${idTuDong}`;

  return (
    <label
      htmlFor={idInput}
      title={`${ariaLabel ? `${ariaLabel}: ` : ''}${checked ? 'Đang bật' : 'Đang tắt'}`}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border p-0.5 transition-colors duration-150 [-webkit-tap-highlight-color:transparent] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--accent)] has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[var(--surface)] ${
        checked
          ? 'bg-[var(--accent)] border-[var(--accent)]'
          : 'bg-[var(--border)] border-[var(--muted)]/40'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <input
        type="checkbox"
        role="switch"
        id={idInput}
        checked={checked}
        disabled={disabled}
        aria-checked={checked}
        aria-label={ariaLabel}
        data-input-khoa={dataInputKhoa}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />

      <span
        className={`pointer-events-none block h-[18px] w-[18px] rounded-full bg-white shadow-xs transition-transform duration-150 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </label>
  );
}
