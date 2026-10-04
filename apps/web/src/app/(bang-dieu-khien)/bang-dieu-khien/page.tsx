'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, GraduationCap, School, BookOpen, ShieldCheck, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { mayKhachApi } from '../../../tien-ich/may-khach-api';

export default function TrangBangDieuKhien() {
  const { data: hoSo } = useQuery({
    queryKey: ['hoSoHienTai'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/ho-so/ca-nhan');
      return res.data?.duLieu;
    },
  });

  const { data: duLieuNguoiDung } = useQuery({
    queryKey: ['danhSachNguoiDungTongQuan'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/nguoi-dung?kichThuoc=5');
      return res.data?.duLieu;
    },
    enabled: hoSo?.vaiTro === 'QUAN_TRI_VIEN' || hoSo?.vaiTro === 'GIAO_VU',
  });

  return (
    <div className="space-y-6">
      {/* Banner Chào Mừng */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-sm">
        <h2 className="text-2xl font-bold">
          Xin chào, {hoSo?.hoTen || 'Thành viên'} 👋
        </h2>
        <p className="mt-1 text-blue-100 text-sm max-w-2xl">
          Chào mừng bạn đến với Hệ thống Quản lý Học tập LMS Trường học. Vai trò hiện tại của bạn là{' '}
          <span className="font-semibold text-white underline decoration-blue-300">
            {hoSo?.vaiTro || 'Đang tải...'}
          </span>
          .
        </p>
      </div>

      {/* Thẻ Thống kê nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tổng Người Dùng
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {duLieuNguoiDung?.tongSo ?? '1'}
          </p>
          <span className="text-xs text-slate-400 mt-1 inline-block">Hệ thống đang hoạt động</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Học Sinh & Sinh Viên
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">Sẵn sàng</p>
          <span className="text-xs text-emerald-600 mt-1 inline-block">Niên khóa 2025-2026</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Bảo Mật CASL
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">RBAC + ABAC</p>
          <span className="text-xs text-indigo-600 mt-1 inline-block">Chống lỗi IDOR</span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cơ sở dữ liệu
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <School className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">PostgreSQL 16</p>
          <span className="text-xs text-purple-600 mt-1 inline-block">pgvector Active</span>
        </div>
      </div>

      {/* Lối tắt tác vụ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <h3 className="font-semibold text-slate-900 text-base mb-4">Lối tắt Quản lý</h3>
          <div className="space-y-3">
            <Link
              href="/nguoi-dung"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">Quản lý danh sách Người dùng</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </Link>

            <Link
              href="/ho-so"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-slate-700">Cập nhật Hồ sơ cá nhân</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <h3 className="font-semibold text-slate-900 text-base mb-2">Thông tin Hệ thống Đồ án</h3>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Đồ án Tốt nghiệp chuyên ngành CNTT trường Đại học - Sinh viên thực hiện: Nguyễn Quang Tâm (K23CNT1 - MSSV: 2310900093).
          </p>
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs text-slate-600 space-y-1">
            <p><strong>Kiến trúc:</strong> NestJS 10, Next.js 15, PostgreSQL 16 (pgvector), Redis 7, MinIO.</p>
            <p><strong>Phân quyền:</strong> CASL Ability Factory (6 vai trò trường học: Quản trị, Ban giám hiệu, Giáo vụ, Giáo viên, Học sinh, Phụ huynh).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
