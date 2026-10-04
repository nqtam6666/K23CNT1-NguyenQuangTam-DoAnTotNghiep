'use client';

import Link from 'next/link';
import { CheckCircle, AlertCircle, ArrowRight, ListTodo } from 'lucide-react';
import { ViecCanXuLy as IViecCanXuLy } from '@lms/chung';

interface Props {
  danhSach: IViecCanXuLy[];
}

export function ViecCanXuLyComponent({ danhSach }: Props) {
  if (!danhSach || danhSach.length === 0) {
    return (
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-3 flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-blue-600" />
          Việc cần xử lý
        </h3>
        <div className="text-center py-8">
          <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
          <p className="text-xs text-slate-600 font-medium">Bạn đã hoàn tất tất cả công việc!</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Không có tác vụ nào đang chờ xử lý.</p>
        </div>
      </div>
    );
  }

  const layBadgeUuTien = (mucDo: string) => {
    switch (mucDo) {
      case 'CAO':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
            Ưu tiên cao
          </span>
        );
      case 'TRUNG_BINH':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Trung bình
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-200">
            Thông thường
          </span>
        );
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-blue-600" />
              Việc cần xử lý
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Các tác vụ cần giải quyết theo vai trò</p>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
            {danhSach.length} việc
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {danhSach.map((item) => (
            <div key={item.id} className="py-3 flex items-start justify-between gap-3 first:pt-0 last:pb-0">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-slate-900 truncate">
                    {item.tieuDe}
                  </span>
                  {layBadgeUuTien(item.mucDoUuTien)}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {item.moTa}
                </p>
              </div>

              <Link
                href={item.duongDan}
                prefetch={true}
                className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors border border-slate-200/60"
              >
                <span>Xử lý</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
