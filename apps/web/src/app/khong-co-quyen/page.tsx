import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Home, UserCheck } from 'lucide-react';

export default function TrangKhongCoQuyen() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-5 ring-8 ring-amber-50/50">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          403 - Không có quyền truy cập
        </h1>

        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Tài khoản của bạn không được phân quyền để truy cập trang này. Mọi thao tác đều được kiểm
          soát chặt chẽ theo chính sách an toàn thông tin của hệ thống.
        </p>

        <div className="mt-6 p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-500 text-left space-y-1">
          <p>
            <strong>Gợi ý:</strong> Nếu bạn cho rằng đây là một sự nhầm lẫn, vui lòng liên hệ quản trị
            viên hoặc kiểm tra vai trò hiện tại trong hồ sơ cá nhân.
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/bang-dieu-khien"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors shadow-xs"
          >
            <Home className="w-4 h-4" />
            Về bảng điều khiển
          </Link>

          <Link
            href="/ho-so"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"
          >
            <UserCheck className="w-4 h-4" />
            Xem hồ sơ cá nhân
          </Link>
        </div>
      </div>
    </div>
  );
}
