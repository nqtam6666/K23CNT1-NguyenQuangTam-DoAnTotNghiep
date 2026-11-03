'use client';

interface Props {
  tieuDe?: string;
  duLieu: Array<{ ten: string; giaTri: number; vaiTro?: string }>;
}

/**
 * Phân bổ người dùng theo vai trò dạng thanh ngang: một màu (accent), xếp giảm dần,
 * số liệu căn phải. Thay cho biểu đồ vòng nhiều màu.
 */
export function BieuDoVaiTro({ tieuDe = 'Phân bổ vai trò', duLieu }: Props) {
  if (!duLieu || duLieu.length === 0) {
    return null;
  }

  const tongSo = duLieu.reduce((tong, d) => tong + d.giaTri, 0);
  const lonNhat = Math.max(...duLieu.map((d) => d.giaTri), 1);
  const sapXep = [...duLieu].sort((a, b) => b.giaTri - a.giaTri);

  return (
    <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-xs">
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-[var(--border)]">
        <h2 className="text-[15px] font-semibold text-[var(--text)]">{tieuDe}</h2>
        <span className="font-mono text-[11px] text-[var(--muted)]">
          {tongSo.toLocaleString('vi-VN')} tài khoản
        </span>
      </div>
      <div className="py-2">
        {sapXep.map((muc) => {
          const phanTram = tongSo > 0 ? Math.round((muc.giaTri / tongSo) * 100) : 0;
          return (
            <div
              key={muc.ten}
              title={`${muc.ten}: ${muc.giaTri} tài khoản (${phanTram}%)`}
              className="grid grid-cols-[104px_minmax(0,1fr)_48px] items-center gap-2.5 px-4 py-2"
            >
              <span className="text-[13px] text-[var(--text)] truncate">{muc.ten}</span>
              <span className="h-2.5 rounded-[5px] bg-[var(--active-bg)] overflow-hidden">
                <i
                  className="block h-full rounded-[5px] bg-[var(--accent)]"
                  style={{ width: `${Math.max(2, (muc.giaTri / lonNhat) * 100)}%` }}
                />
              </span>
              <span className="text-right font-mono text-[13px] tabular-nums">
                {muc.giaTri.toLocaleString('vi-VN')}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
