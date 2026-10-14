'use client';

import React from 'react';

/**
 * Khung xương nguyên tử cơ bản (Atomic Skeleton)
 */
export function KhungXuong({
  className = '',
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={style}
      className={`animate-pulse bg-[var(--active-bg)] border border-[var(--border)]/60 rounded-[var(--radius)] select-none pointer-events-none ${className}`}
    />
  );
}

/**
 * Khung xương thẻ thống kê nhanh (Dashboard Stat Cards)
 */
export function KhungXuongThongKe({ soLuong = 4 }: { soLuong?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: soLuong }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] space-y-3"
        >
          <div className="flex items-center justify-between">
            <KhungXuong className="h-3 w-28" />
            <KhungXuong className="w-9 h-9 rounded-[var(--radius)]" />
          </div>
          <KhungXuong className="h-7 w-20" />
          <KhungXuong className="h-2.5 w-36" />
        </div>
      ))}
    </div>
  );
}

/**
 * Khung xương lưới thẻ (Grid Cards - dùng cho Lớp học phần, Học kỳ, v.v.)
 */
export function KhungXuongThe({ soLuong = 6 }: { soLuong?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: soLuong }).map((_, i) => (
        <div
          key={i}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden flex flex-col"
        >
          <div className="p-5 bg-[var(--bg)] border-b border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between">
              <KhungXuong className="h-5 w-20" />
              <KhungXuong className="h-4 w-16" />
            </div>
            <KhungXuong className="h-6 w-3/4" />
            <KhungXuong className="h-3.5 w-1/2" />
          </div>

          <div className="p-5 space-y-3.5 flex-1">
            <div className="flex justify-between items-center">
              <KhungXuong className="h-3 w-20" />
              <KhungXuong className="h-3.5 w-24" />
            </div>
            <div className="flex justify-between items-center">
              <KhungXuong className="h-3 w-16" />
              <KhungXuong className="h-3.5 w-20" />
            </div>
            <div className="pt-3 border-t border-[var(--border)] flex items-center gap-2.5">
              <KhungXuong className="w-7 h-7 rounded-[var(--radius)]" />
              <div className="space-y-1.5 flex-1">
                <KhungXuong className="h-3 w-28" />
                <KhungXuong className="h-2.5 w-20" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Khung xương dạng bảng dữ liệu (Table Skeleton)
 */
export function KhungXuongBang({
  soDong = 5,
  soCot = 5,
}: {
  soDong?: number;
  soCot?: number;
}) {
  return (
    <div className="w-full space-y-3 p-4">
      <div className="flex items-center gap-4 pb-3 border-b border-[var(--border)]">
        {Array.from({ length: soCot }).map((_, i) => (
          <KhungXuong
            key={i}
            className="h-4"
            style={{ width: `${100 / soCot - 2}%` }}
          />
        ))}
      </div>

      {Array.from({ length: soDong }).map((_, r) => (
        <div
          key={r}
          className="flex items-center gap-4 py-3 border-b border-[var(--border)] last:border-0"
        >
          {Array.from({ length: soCot }).map((_, c) => (
            <div key={c} style={{ width: `${100 / soCot - 2}%` }}>
              {c === 0 ? (
                <div className="flex items-center gap-2.5">
                  <KhungXuong className="w-8 h-8 rounded-[var(--radius)] shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <KhungXuong className="h-3.5 w-24" />
                    <KhungXuong className="h-2.5 w-32" />
                  </div>
                </div>
              ) : c === soCot - 1 ? (
                <div className="flex justify-end gap-1.5">
                  <KhungXuong className="w-7 h-7" />
                  <KhungXuong className="w-7 h-7" />
                </div>
              ) : (
                <KhungXuong
                  className="h-3.5"
                  style={{ width: `${50 + ((r + c) % 4) * 12}%` }}
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Khung xương trang hồ sơ cá nhân
 */
export function KhungXuongHoSo() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <KhungXuong className="h-7 w-48" />
        <KhungXuong className="h-4 w-96" />
      </div>

      <div className="p-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] flex flex-col sm:flex-row items-center gap-6">
        <KhungXuong className="w-20 h-20 rounded-[var(--radius)] shrink-0" />
        <div className="space-y-2.5 text-center sm:text-left flex-1">
          <KhungXuong className="h-6 w-44 mx-auto sm:mx-0" />
          <KhungXuong className="h-4 w-60 mx-auto sm:mx-0" />
          <div className="flex gap-2 justify-center sm:justify-start">
            <KhungXuong className="h-5 w-24" />
            <KhungXuong className="h-5 w-28" />
          </div>
        </div>
      </div>

      <div className="p-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <KhungXuong className="h-3.5 w-24" />
            <KhungXuong className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <KhungXuong className="h-3.5 w-24" />
            <KhungXuong className="h-10 w-full" />
          </div>
        </div>
        <div className="space-y-2">
          <KhungXuong className="h-3.5 w-32" />
          <KhungXuong className="h-10 w-full" />
        </div>
        <div className="pt-3 flex justify-end">
          <KhungXuong className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}

/**
 * Khung xương trang tổng quan (Dashboard Overview)
 */
export function KhungXuongTongQuan() {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] space-y-3">
        <KhungXuong className="h-7 w-64" />
        <KhungXuong className="h-4 w-96" />
      </div>

      <KhungXuongThongKe soLuong={4} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] space-y-4">
          <div className="flex items-center justify-between">
            <KhungXuong className="h-5 w-40" />
            <KhungXuong className="h-4 w-20" />
          </div>
          <KhungXuongBang soDong={4} soCot={4} />
        </div>

        <div className="p-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] space-y-4">
          <KhungXuong className="h-5 w-36" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-[var(--radius)] bg-[var(--bg)]">
                <KhungXuong className="w-10 h-10 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <KhungXuong className="h-3.5 w-3/4" />
                  <KhungXuong className="h-2.5 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
