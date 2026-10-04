'use client';

import Link from 'next/link';
import {
  Users,
  BookOpen,
  Calendar,
  Video,
  Clock,
  Bot,
  GraduationCap,
  UserCheck,
  FileSpreadsheet,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  LucideIcon,
} from 'lucide-react';
import { TheThongKe as ITheThongKe } from '@lms/chung';

const BAN_DO_BIEU_TUONG: Record<string, LucideIcon> = {
  Users,
  BookOpen,
  Calendar,
  Video,
  Clock,
  Bot,
  GraduationCap,
  UserCheck,
  FileSpreadsheet,
};

interface Props {
  duLieu: ITheThongKe;
}

export function TheThongKeComponent({ duLieu }: Props) {
  const BieuTuong = BAN_DO_BIEU_TUONG[duLieu.bieuTuong] || BookOpen;

  const mauSacStyles = {
    xanh_duong: {
      bgIcon: 'bg-blue-50 text-blue-600',
      borderHover: 'hover:border-blue-300',
      textHighlight: 'text-blue-600',
    },
    xanh_la: {
      bgIcon: 'bg-emerald-50 text-emerald-600',
      borderHover: 'hover:border-emerald-300',
      textHighlight: 'text-emerald-600',
    },
    tim: {
      bgIcon: 'bg-purple-50 text-purple-600',
      borderHover: 'hover:border-purple-300',
      textHighlight: 'text-purple-600',
    },
    cam: {
      bgIcon: 'bg-amber-50 text-amber-600',
      borderHover: 'hover:border-amber-300',
      textHighlight: 'text-amber-600',
    },
    do: {
      bgIcon: 'bg-red-50 text-red-600',
      borderHover: 'hover:border-red-300',
      textHighlight: 'text-red-600',
    },
  }[duLieu.mauSac || 'xanh_duong'];

  const NoiDungThe = (
    <div
      className={`p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs transition-all duration-200 ${
        duLieu.duongDanChiTiet ? `${mauSacStyles.borderHover} hover:shadow-xs group cursor-pointer` : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
          {duLieu.tieuDe}
        </span>
        <div className="flex items-center gap-1.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${mauSacStyles.bgIcon}`}
          >
            <BieuTuong className="w-4 h-4" />
          </div>
          {duLieu.duongDanChiTiet && (
            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100" />
          )}
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {duLieu.giaTri}
        </span>
        {duLieu.donVi && (
          <span className="text-xs font-medium text-slate-500">{duLieu.donVi}</span>
        )}
      </div>

      {duLieu.moTa && (
        <p className="mt-1 text-xs text-slate-600 leading-normal line-clamp-1">{duLieu.moTa}</p>
      )}

      {duLieu.xuHuong && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          {duLieu.xuHuong.huong === 'TANG' ? (
            <span className="inline-flex items-center gap-0.5 text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              {duLieu.xuHuong.giaTriPhanTram ? `+${duLieu.xuHuong.giaTriPhanTram}%` : 'Tăng'}
            </span>
          ) : duLieu.xuHuong.huong === 'GIAM' ? (
            <span className="inline-flex items-center gap-0.5 text-red-700 font-medium bg-red-50 px-1.5 py-0.5 rounded">
              <TrendingDown className="w-3 h-3 text-red-600" />
              {duLieu.xuHuong.giaTriPhanTram ? `-${duLieu.xuHuong.giaTriPhanTram}%` : 'Giảm'}
            </span>
          ) : null}
          {duLieu.xuHuong.moTa && (
            <span className="text-slate-500 text-[11px]">{duLieu.xuHuong.moTa}</span>
          )}
        </div>
      )}
    </div>
  );

  if (duLieu.duongDanChiTiet) {
    return (
      <Link href={duLieu.duongDanChiTiet} prefetch={true} className="block select-none">
        {NoiDungThe}
      </Link>
    );
  }

  return NoiDungThe;
}
