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

interface Props {
  tieuDe?: string;
  duLieu: Array<{ ngay: string; tyLe: number; tongSo?: number; coMat?: number }>;
}

export function BieuDoChuyenCan({ tieuDe = 'Tỷ lệ chuyên cần 7 ngày gần nhất', duLieu }: Props) {
  if (!duLieu || duLieu.length === 0) {
    return null;
  }

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">{tieuDe}</h3>
          <p className="text-xs text-slate-500 mt-0.5">Theo dõi tỷ lệ sinh viên có mặt theo ngày</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Dữ liệu thời gian thực
        </span>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={duLieu} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradientChuyenCan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="ngay"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl">
                      <p className="font-semibold text-slate-200">Ngày {item.ngay}</p>
                      <p className="mt-1 text-blue-300 font-bold text-sm">
                        Tỷ lệ: {item.tyLe}%
                      </p>
                      {item.tongSo !== undefined && (
                        <p className="text-[11px] text-slate-300">
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
              stroke="#2563eb"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#gradientChuyenCan)"
              dot={{ r: 3, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 5, fill: '#1d4ed8' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
