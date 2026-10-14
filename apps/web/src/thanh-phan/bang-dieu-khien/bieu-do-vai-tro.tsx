'use client';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { Users } from 'lucide-react';
import { TheKhung } from '../the-khung';

interface Props {
  tieuDe?: string;
  duLieu: Array<{ ten: string; giaTri: number; vaiTro?: string }>;
}

const BANG_MAU = [
  'var(--accent)',
  'var(--info)',
  'var(--warning)',
  'var(--muted)',
  'var(--text)',
  'var(--danger)',
];

export function BieuDoVaiTro({ tieuDe = 'Cơ cấu người dùng theo vai trò', duLieu }: Props) {
  if (!duLieu || duLieu.length === 0) {
    return null;
  }

  const tongSo = duLieu.reduce((tong, d) => tong + d.giaTri, 0);

  return (
    <TheKhung
      icon={Users}
      eyebrow="PHÂN BỔ VAI TRÒ"
      tieuDe={tieuDe}
      moTa={`Tổng số ${tongSo} tài khoản trong hệ thống`}
      className="flex flex-col justify-between"
    >
      <div className="h-56 sm:h-60 w-full relative my-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={duLieu}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="giaTri"
            >
              {duLieu.map((_, index) => (
                <Cell key={`cell-${index}`} fill={BANG_MAU[index % BANG_MAU.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  const phanTram = tongSo > 0 ? Math.round((item.giaTri / tongSo) * 100) : 0;
                  return (
                    <div className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] text-xs rounded-[var(--radius)] p-2.5">
                      <p className="font-mono font-semibold">{item.ten}</p>
                      <p className="font-mono text-[var(--accent)] font-bold mt-0.5">
                        {item.giaTri} người dùng ({phanTram}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Số đếm trung tâm Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-mono text-2xl font-bold text-[var(--accent)] leading-none">
            {tongSo}
          </span>
          <span className="font-mono text-[11px] text-[var(--muted)] mt-1 uppercase">
            Thành viên
          </span>
        </div>
      </div>

      {/* Chú giải bảng màu */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[var(--border)] text-xs">
        {duLieu.map((item, idx) => (
          <div key={item.ten} className="flex items-center gap-2 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-[2px] shrink-0"
              style={{ backgroundColor: BANG_MAU[idx % BANG_MAU.length] }}
            />
            <span className="text-[var(--muted)] truncate">{item.ten}:</span>
            <span className="font-mono font-semibold text-[var(--text)] ml-auto">
              {item.giaTri}
            </span>
          </div>
        ))}
      </div>
    </TheKhung>
  );
}
