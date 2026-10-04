'use client';

import {
  GraduationCap,
  Layers,
  ShieldCheck,
  Server,
  Database,
  Cpu,
  Video,
  FileCode2,
  ExternalLink,
} from 'lucide-react';
import { useCaiDatHeThong } from '../../../tien-ich/use-cai-dat';

export default function TrangGioiThieu() {
  const { layGiaTri } = useCaiDatHeThong();
  const tenHeThong = layGiaTri('TEN_HE_THONG', 'Hệ thống Quản lý Học tập LMS Trường học');
  const tenTruong = layGiaTri('TEN_TRUONG', 'Trường Đại học Công nghệ');
  const tacGia = layGiaTri('TAC_GIA', 'Nguyễn Quang Tâm');
  const maLop = layGiaTri('MA_LOP_KHOA', 'K23CNT1');
  const mssv = layGiaTri('MSSV', '2310900093');

  return (
    <div className="space-y-6">
      {/* Banner đầu trang */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-800 text-white shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/10 rounded-xl backdrop-blur-xs">
            <GraduationCap className="w-6 h-6 text-blue-200" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
            Đồ án tốt nghiệp đại học
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold">{tenHeThong}</h1>
        <p className="mt-2 text-sm text-blue-100 max-w-3xl leading-relaxed">
          Nền tảng Quản lý Học tập Thế hệ mới tích hợp phòng học trực tuyến LiveKit SFU và Trợ lý AI
          RAG (Retrieval-Augmented Generation) trên nền tảng PostgreSQL pgvector.
        </p>
      </div>

      {/* Thông tin tác giả & Khóa luận */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Thông tin thực hiện đồ án
          </h2>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="font-medium text-slate-700">Sinh viên thực hiện:</span>
              <span className="font-semibold text-slate-900">{tacGia}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="font-medium text-slate-700">Mã số sinh viên:</span>
              <span className="font-semibold text-slate-900">{mssv}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="font-medium text-slate-700">Lớp sinh hoạt / Khóa:</span>
              <span className="font-semibold text-slate-900">{maLop}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="font-medium text-slate-700">Đơn vị đào tạo:</span>
              <span className="font-semibold text-slate-900">{tenTruong}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="font-medium text-slate-700">Năm học bảo vệ:</span>
              <span className="font-semibold text-slate-900">2025 - 2026</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Kiến trúc phân quyền và An toàn
          </h2>
          <div className="space-y-3 text-sm text-slate-600">
            <p className="leading-relaxed">
              Hệ thống áp dụng mô hình phân quyền kết hợp <strong>RBAC</strong> (Role-Based Access
              Control) và <strong>ABAC</strong> (Attribute-Based Access Control) thông qua thư viện
              chuẩn quốc tế <strong>@casl/ability</strong>.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60 font-medium text-slate-700">
                ✓ Chống lỗ hổng IDOR 100%
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60 font-medium text-slate-700">
                ✓ 6 vai trò trường học chuẩn
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60 font-medium text-slate-700">
                ✓ Phân quyền URL và API
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60 font-medium text-slate-700">
                ✓ Kiểm toán NhatKyHeThong
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chi tiết hạ tầng công nghệ */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-indigo-600" />
          Hạ tầng công nghệ cốt lõi
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileCode2 className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Giao diện (Frontend)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Next.js 15 App Router, React 19, Tailwind CSS v4, Lucide Icons, Recharts, Sonner toast.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Máy chủ API (Backend)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              NestJS 10 phân tầng Controller - Service - Repository, CASL, JWT HTTP-only cookies, Redis 7 cache.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Cơ sở dữ liệu (Database)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              PostgreSQL 16 với pgvector extension phục vụ tìm kiếm ngữ nghĩa RAG, Prisma ORM 6.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Trực tuyến & AI</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              LiveKit SFU cho phòng học ảo và điểm danh tự động; Google Gemini cho Trợ lý học tập RAG.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
