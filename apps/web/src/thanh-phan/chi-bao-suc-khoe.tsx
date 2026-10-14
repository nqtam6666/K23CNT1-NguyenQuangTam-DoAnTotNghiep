'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Database,
  Cpu,
  HardDrive,
  Video,
  X,
  RefreshCw,
} from 'lucide-react';
import { mayKhachApi } from '../tien-ich/may-khach-api';
import { SucKhoeHeThong, VaiTro } from '@lms/chung';

interface Props {
  vaiTroNguoiDung?: string;
}

export function ChiBaoSucKhoe({ vaiTroNguoiDung }: Props) {
  const [moPopover, setMoPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // CHỈ hiển thị cho Quản trị viên và Ban giám hiệu
  const laQuanTri =
    vaiTroNguoiDung === VaiTro.QUAN_TRI_VIEN || vaiTroNguoiDung === VaiTro.BAN_GIAM_HIEU;

  const {
    data: sucKhoe,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<SucKhoeHeThong>({
    queryKey: ['suc-khoe-he-thong'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/he-thong/suc-khoe');
      return res.data?.duLieu || res.data;
    },
    enabled: laQuanTri,
    refetchInterval: 30 * 1000,
    staleTime: 15 * 1000,
  });

  useEffect(() => {
    const xuLyNhanNgoai = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setMoPopover(false);
      }
    };

    const xuLyPhimEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoPopover(false);
      }
    };

    if (moPopover) {
      document.addEventListener('mousedown', xuLyNhanNgoai);
      document.addEventListener('keydown', xuLyPhimEsc);
    }

    return () => {
      document.removeEventListener('mousedown', xuLyNhanNgoai);
      document.removeEventListener('keydown', xuLyPhimEsc);
    };
  }, [moPopover]);

  if (!laQuanTri) {
    return null;
  }

  const trangThaiTong = isError
    ? 'GAP_SU_CO'
    : isLoading
      ? 'DANG_TAI'
      : sucKhoe?.trangThai || 'HOAT_DONG_TOT';

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Huy hiệu hiển thị trên Header */}
      <button
        type="button"
        onClick={() => setMoPopover(!moPopover)}
        title="Bấm để xem trạng thái sức khỏe chi tiết của hạ tầng hệ thống"
        aria-label="Trạng thái sức khỏe hệ thống"
        aria-expanded={moPopover}
        className={`hidden sm:inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-[var(--radius)] font-mono text-xs font-semibold cursor-pointer transition-colors border whitespace-nowrap shrink-0 ${
          trangThaiTong === 'HOAT_DONG_TOT'
            ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/30'
            : trangThaiTong === 'CANH_BAO'
              ? 'bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning)]/30'
              : 'bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger)]/30'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            trangThaiTong === 'HOAT_DONG_TOT'
              ? 'bg-[var(--accent)]'
              : trangThaiTong === 'CANH_BAO'
                ? 'bg-[var(--warning)]'
                : 'bg-[var(--danger)]'
          }`}
        />
        <span className="hidden xl:inline whitespace-nowrap">
          {trangThaiTong === 'HOAT_DONG_TOT'
            ? 'Hệ thống: Bình thường'
            : trangThaiTong === 'CANH_BAO'
              ? 'Hệ thống: Cảnh báo'
              : 'Hệ thống: Sự cố'}
        </span>
        <span className="hidden md:inline xl:hidden whitespace-nowrap">
          {trangThaiTong === 'HOAT_DONG_TOT'
            ? 'Bình thường'
            : trangThaiTong === 'CANH_BAO'
              ? 'Cảnh báo'
              : 'Sự cố'}
        </span>
        <Activity strokeWidth={1.5} className="w-3.5 h-3.5 opacity-80 shrink-0" />
      </button>

      {/* Popover chi tiết */}
      {moPopover && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[var(--surface)] text-[var(--text)] rounded-[var(--radius)] border border-[var(--border)] z-50 p-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Activity strokeWidth={1.5} className="w-4 h-4 text-[var(--accent)]" />
              <h4 className="font-mono font-bold text-[var(--text)] text-xs uppercase tracking-wider">
                Trạng thái hạ tầng máy chủ
              </h4>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                title="Làm mới trạng thái"
                aria-label="Làm mới trạng thái"
                className="p-1 text-[var(--muted)] hover:text-[var(--text)] rounded-[var(--radius)] hover:bg-[var(--active-bg)] transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  strokeWidth={1.5}
                  className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`}
                />
              </button>
              <button
                type="button"
                onClick={() => setMoPopover(false)}
                title="Đóng bảng trạng thái"
                aria-label="Đóng bảng trạng thái"
                className="p-1 text-[var(--muted)] hover:text-[var(--text)] rounded-[var(--radius)] hover:bg-[var(--active-bg)] transition-colors"
              >
                <X strokeWidth={1.5} className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="py-3 space-y-2">
            {/* Cơ sở dữ liệu trung tâm */}
            <div className="flex items-center justify-between p-2.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <Database strokeWidth={1.5} className="w-4 h-4 text-[var(--muted)]" />
                <div>
                  <p className="font-mono text-xs font-semibold text-[var(--text)]">
                    Cơ sở dữ liệu trung tâm
                  </p>
                  <p className="text-[11px] text-[var(--muted)]">Dịch vụ dữ liệu học vụ</p>
                </div>
              </div>
              {sucKhoe?.dichVu?.coSoDuLieu === 'SAN_SANG' ? (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-[var(--radius)]">
                  <CheckCircle2 strokeWidth={1.5} className="w-3 h-3" />
                  Sẵn sàng
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[var(--danger)] bg-[var(--danger-soft)] px-2 py-0.5 rounded-[var(--radius)]">
                  <XCircle strokeWidth={1.5} className="w-3 h-3" />
                  Lỗi kết nối
                </span>
              )}
            </div>

            {/* Bộ nhớ đệm */}
            <div className="flex items-center justify-between p-2.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <Cpu strokeWidth={1.5} className="w-4 h-4 text-[var(--muted)]" />
                <div>
                  <p className="font-mono text-xs font-semibold text-[var(--text)]">
                    Hệ thống bộ nhớ đệm
                  </p>
                  <p className="text-[11px] text-[var(--muted)]">Dịch vụ tăng tốc truy xuất</p>
                </div>
              </div>
              {sucKhoe?.dichVu?.boNhoDemRedis === 'SAN_SANG' ? (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-[var(--radius)]">
                  <CheckCircle2 strokeWidth={1.5} className="w-3 h-3" />
                  Sẵn sàng
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[var(--warning)] bg-[var(--warning-soft)] px-2 py-0.5 rounded-[var(--radius)]">
                  <AlertTriangle strokeWidth={1.5} className="w-3 h-3" />
                  Ngoại tuyến
                </span>
              )}
            </div>

            {/* Lưu trữ tệp tin */}
            <div className="flex items-center justify-between p-2.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <HardDrive strokeWidth={1.5} className="w-4 h-4 text-[var(--muted)]" />
                <div>
                  <p className="font-mono text-xs font-semibold text-[var(--text)]">
                    Hệ thống lưu trữ tệp tin
                  </p>
                  <p className="text-[11px] text-[var(--muted)]">Dịch vụ tài liệu học tập</p>
                </div>
              </div>
              {sucKhoe?.dichVu?.luuTruMinIO === 'SAN_SANG' ? (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-[var(--radius)]">
                  <CheckCircle2 strokeWidth={1.5} className="w-3 h-3" />
                  Sẵn sàng
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[var(--warning)] bg-[var(--warning-soft)] px-2 py-0.5 rounded-[var(--radius)]">
                  <AlertTriangle strokeWidth={1.5} className="w-3 h-3" />
                  Ngoại tuyến
                </span>
              )}
            </div>

            {/* Phòng học trực tuyến */}
            <div className="flex items-center justify-between p-2.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <Video strokeWidth={1.5} className="w-4 h-4 text-[var(--muted)]" />
                <div>
                  <p className="font-mono text-xs font-semibold text-[var(--text)]">
                    Hệ thống phòng học trực tuyến
                  </p>
                  <p className="text-[11px] text-[var(--muted)]">
                    Dịch vụ truyền phát âm thanh - hình ảnh
                  </p>
                </div>
              </div>
              {sucKhoe?.dichVu?.phongHocLiveKit === 'SAN_SANG' ? (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-[var(--radius)]">
                  <CheckCircle2 strokeWidth={1.5} className="w-3 h-3" />
                  Sẵn sàng
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[var(--warning)] bg-[var(--warning-soft)] px-2 py-0.5 rounded-[var(--radius)]">
                  <AlertTriangle strokeWidth={1.5} className="w-3 h-3" />
                  Ngoại tuyến
                </span>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between font-mono text-[11px] text-[var(--muted)]">
            <span>Đồng bộ: 30s</span>
            <span>
              Cập nhật:{' '}
              {sucKhoe?.thoiGian ? new Date(sucKhoe.thoiGian).toLocaleTimeString('vi-VN') : 'Đang tải'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
