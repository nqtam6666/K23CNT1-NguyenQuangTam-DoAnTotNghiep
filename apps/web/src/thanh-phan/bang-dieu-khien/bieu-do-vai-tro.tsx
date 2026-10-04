'use client';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

interface Props {
  tieuDe?: string;
  duLieu: Array<{ ten: string; giaTri: number; vaiTro?: string }>;
}

const BANG_MAU = ['#2563eb', '#10b981', '#6366f1', '#f59e0b', '#8b5cf6', '#ec4899'];

export function BieuDoVaiTro({ tieuDe = 'Cơ cấu người dùng theo vai trò', duLieu }: Props) {
  if (!duLieu || duLieu.length === 0) {
    return null;
  }

  const tongSo = duLieu.reduce((tong, d) => tong + d.giaTri, 0);

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-slate-900 text-sm sm:text-base">{tieuDe}</h3>
        <p className="text-xs text-slate-500 mt-0.5">Tổng số {tongSo} tài khoản trong hệ thống</p>
      </div>

      <div className="h-56 sm:h-64 w-full relative my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={duLieu}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
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
                    <div className="bg-slate-900 text-white text-xs rounded-xl p-2.5 shadow-xl">
                      <p className="font-semibold">{item.ten}</p>
                      <p className="text-blue-300 font-bold mt-0.5">
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
          <span className="text-2xl font-bold text-slate-900 leading-none">{tongSo}</span>
          <span className="text-[11px] text-slate-500 mt-0.5">Thành viên</span>
        </div>
      </div>

      {/* Chú giải bảng màu */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
        {duLieu.map((item, idx) => (
          <div key={item.ten} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: BANG_MAU[idx % BANG_MAU.length] }}
            />
            <span className="text-slate-600 truncate">{item.ten}:</span>
            <span className="font-semibold text-slate-900">{item.giaTri}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
