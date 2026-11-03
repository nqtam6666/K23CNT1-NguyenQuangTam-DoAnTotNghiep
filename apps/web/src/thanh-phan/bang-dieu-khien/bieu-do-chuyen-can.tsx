'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface Props {
  tieuDe?: string;
  duLieu: Array<{ ngay: string; tyLe: number; tongSo?: number; coMat?: number }>;
}

/**
 * Biểu đồ cột chuyên cần 7 ngày: một chuỗi, một màu (accent), có tooltip khi rê chuột.
 */
export function BieuDoChuyenCan({ tieuDe = 'Chuyên cần 7 ngày', duLieu }: Props) {
  if (!duLieu || duLieu.length === 0) {
    return null;
  }

  // Ngày không có buổi học (tongSo = 0) không được vẽ thành cột 100%
  const duLieuVe = duLieu.map((d) => ({ ...d, giaTriVe: d.tongSo === 0 ? 0 : d.tyLe }));
  const ngayCoDuLieu = duLieu.filter((d) => d.tongSo === undefined || d.tongSo > 0);
  const trungBinh =
    ngayCoDuLieu.length > 0
      ? `TB ${Math.round(ngayCoDuLieu.reduce((t, d) => t + d.tyLe, 0) / ngayCoDuLieu.length)}%`
      : 'Chưa có buổi học';

  return (
    <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-xs">
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-[var(--border)]">
        <div>
          <h2 className="text-[15px] font-semibold text-[var(--text)]">{tieuDe}</h2>
          <p className="font-mono text-[11px] text-[var(--muted)]">Tỷ lệ có mặt toàn trường</p>
        </div>
        <span className="font-mono text-[11px] text-[var(--muted)]">{trungBinh}</span>
      </div>
      <div className="h-[240px] w-full px-2 pt-4 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={duLieuVe} margin={{ top: 4, right: 12, left: -12, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="ngay"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 50, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              cursor={{ fill: 'var(--active-bg)' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const muc = payload[0].payload;
                if (muc.tongSo === 0) {
                  return (
                    <div className="bg-[var(--text)] text-[var(--bg)] rounded-[4px] px-2 py-1.5 text-xs">
                      <p className="font-mono">{muc.ngay} · Không có buổi học</p>
                    </div>
                  );
                }
                return (
                  <div className="bg-[var(--text)] text-[var(--bg)] rounded-[4px] px-2 py-1.5 text-xs">
                    <p className="font-mono">
                      {muc.ngay} · {muc.tyLe}%
                    </p>
                    {muc.tongSo !== undefined && (
                      <p className="font-mono opacity-80">
                        Có mặt {muc.coMat}/{muc.tongSo}
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <Bar dataKey="giaTriVe" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={34} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
