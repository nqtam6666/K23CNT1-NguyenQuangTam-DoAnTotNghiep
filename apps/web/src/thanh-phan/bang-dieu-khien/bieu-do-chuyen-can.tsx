'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { TheKhung } from '../the-khung';
import { HuyHieu } from '../huy-hieu';

interface Props {
  tieuDe?: string;
  duLieu: Array<{ ngay: string; tyLe: number; tongSo?: number; coMat?: number }>;
}

export function BieuDoChuyenCan({ tieuDe = 'Tỷ lệ chuyên cần 7 ngày gần nhất', duLieu }: Props) {
  if (!duLieu || duLieu.length === 0) {
    return null;
  }

  return (
    <TheKhung
      icon={TrendingUp}
      eyebrow="THỐNG KÊ CHUYÊN CẦN"
      tieuDe={tieuDe}
      moTa="Theo dõi tỷ lệ sinh viên có mặt theo ngày"
      hanhDong={
        <HuyHieu loai="accent">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
          Thời gian thực
        </HuyHieu>
      }
    >
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={duLieu} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="ngay"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-[var(--radius)] p-3 text-xs">
                      <p className="font-mono font-semibold text-[var(--muted)]">Ngày {item.ngay}</p>
                      <p className="mt-1 font-mono text-[var(--accent)] font-bold text-sm">
                        Tỷ lệ: {item.tyLe}%
                      </p>
                      {item.tongSo !== undefined && (
                        <p className="font-mono text-[11px] text-[var(--muted)] mt-0.5">
                          Có mặt: {item.coMat}/{item.tongSo} sinh viên
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="tyLe"
              stroke="var(--accent)"
              strokeWidth={2}
              fillOpacity={1}
              fill="var(--accent-soft)"
              dot={{ r: 3, fill: 'var(--accent)', strokeWidth: 1.5, stroke: 'var(--surface)' }}
              activeDot={{ r: 5, fill: 'var(--accent)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </TheKhung>
  );
}
