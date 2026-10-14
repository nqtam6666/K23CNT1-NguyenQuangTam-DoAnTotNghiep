import Link from 'next/link';
import { ShieldAlert, Home, UserCheck } from 'lucide-react';

export default function TrangKhongCoQuyen() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-lg w-full bg-[var(--surface)] rounded-[var(--radius)] border border-[var(--border)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center gap-3.5">
          <div className="w-[44px] h-[44px] rounded-[var(--radius)] border border-[var(--danger)]/40 bg-[var(--danger-soft)] text-[var(--danger)] flex items-center justify-center shrink-0">
            <ShieldAlert strokeWidth={1.5} className="w-[20px] h-[20px]" />
          </div>
          <div>
            <p className="eyebrow">PHÂN QUYỀN TRUY CẬP</p>
            <h1 className="font-mono text-[20px] font-bold text-[var(--text)] tracking-tight">
              403 - Không có quyền truy cập
            </h1>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            Tài khoản của bạn không được phân quyền để truy cập trang này. Mọi thao tác đều được
            kiểm soát theo chính sách phân quyền vai trò của hệ thống đào tạo.
          </p>

          <div className="p-3.5 bg-[var(--bg)] rounded-[var(--radius)] border border-[var(--border)] text-xs text-[var(--muted)] leading-relaxed">
            <strong className="font-mono text-[var(--text)]">Gợi ý:</strong> Nếu bạn cho rằng đây
            là một sự nhầm lẫn, vui lòng liên hệ phòng đào tạo hoặc kiểm tra vai trò hiện tại trong
            hồ sơ cá nhân.
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2 border-t border-[var(--border)]">
            <Link
              href="/ho-so"
              className="inline-flex items-center justify-center gap-2 py-[11px] px-[20px] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--active-bg)] text-[var(--muted)] hover:text-[var(--text)] text-[13px] font-semibold transition-colors"
            >
              <UserCheck strokeWidth={1.5} className="w-4 h-4" />
              Xem hồ sơ cá nhân
            </Link>

            <Link
              href="/bang-dieu-khien"
              className="inline-flex items-center justify-center gap-2 py-[11px] px-[20px] rounded-[var(--radius)] bg-[var(--accent)] text-[var(--primary-foreground)] shadow-accent text-[13px] font-semibold transition-all hover:brightness-96"
            >
              <Home strokeWidth={1.5} className="w-4 h-4" />
              Về bảng điều khiển
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
