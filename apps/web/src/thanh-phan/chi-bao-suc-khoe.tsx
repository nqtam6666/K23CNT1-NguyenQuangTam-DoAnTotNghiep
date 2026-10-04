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
    refetchInterval: 30 * 1000, // Cập nhật mỗi 30 giây
    staleTime: 15 * 1000,
  });

  // Đóng popover khi click ngoài hoặc nhấn Esc
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
        onClick={() => setMoPopover(!moPopover)}
        title="Bấm để xem trạng thái chi tiết của hạ tầng hệ thống"
        aria-label="Trạng thái sức khỏe hệ thống"
        aria-expanded={moPopover}
        className={`hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all border ${
          trangThaiTong === 'HOAT_DONG_TOT'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70'
            : trangThaiTong === 'CANH_BAO'
              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/70'
              : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100/70'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            trangThaiTong === 'HOAT_DONG_TOT'
              ? 'bg-emerald-500 animate-pulse'
              : trangThaiTong === 'CANH_BAO'
                ? 'bg-amber-500 animate-pulse'
                : 'bg-red-500'
          }`}
        />
        <span>
          {trangThaiTong === 'HOAT_DONG_TOT'
            ? 'Hệ thống: Bình thường'
            : trangThaiTong === 'CANH_BAO'
              ? 'Hệ thống: Cảnh báo'
              : 'Hệ thống: Sự cố'}
        </span>
        <Activity className="w-3.5 h-3.5 opacity-70" />
      </button>

      {/* Popover chi tiết */}
      {moPopover && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-4 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <h4 className="font-bold text-slate-900 text-sm">Trạng thái hạ tầng máy chủ</h4>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                title="Làm mới trạng thái"
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setMoPopover(false)}
                title="Đóng bảng trạng thái"
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="py-3 space-y-2.5">
            {/* Cơ sở dữ liệu trung tâm */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-slate-600" />
                <div>
                  <p className="text-xs font-semibold text-slate-800">Cơ sở dữ liệu trung tâm</p>
                  <p className="text-[11px] text-slate-500">Dịch vụ dữ liệu học vụ</p>
                </div>
              </div>
              {sucKhoe?.dichVu?.coSoDuLieu === 'SAN_SANG' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Sẵn sàng
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                  <XCircle className="w-3 h-3 text-red-600" />
                  Lỗi kết nối
                </span>
              )}
            </div>

            {/* Bộ nhớ đệm */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-4 h-4 text-slate-600" />
                <div>
                  <p className="text-xs font-semibold text-slate-800">Hệ thống bộ nhớ đệm</p>
                  <p className="text-[11px] text-slate-500">Dịch vụ tăng tốc truy xuất</p>
                </div>
              </div>
              {sucKhoe?.dichVu?.boNhoDemRedis === 'SAN_SANG' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Sẵn sàng
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  Ngoại tuyến
                </span>
              )}
            </div>

            {/* Lưu trữ tệp tin */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <HardDrive className="w-4 h-4 text-slate-600" />
                <div>
                  <p className="text-xs font-semibold text-slate-800">Hệ thống lưu trữ tệp tin</p>
                  <p className="text-[11px] text-slate-500">Dịch vụ tài liệu học tập</p>
                </div>
              </div>
              {sucKhoe?.dichVu?.luuTruMinIO === 'SAN_SANG' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Sẵn sàng
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  Ngoại tuyến
                </span>
              )}
            </div>

            {/* Phòng học trực tuyến */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Video className="w-4 h-4 text-slate-600" />
                <div>
                  <p className="text-xs font-semibold text-slate-800">Hệ thống phòng học trực tuyến</p>
                  <p className="text-[11px] text-slate-500">Dịch vụ truyền phát âm thanh - hình ảnh</p>
                </div>
              </div>
              {sucKhoe?.dichVu?.phongHocLiveKit === 'SAN_SANG' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Sẵn sàng
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  Ngoại tuyến
                </span>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Đồng bộ tự động: 30s</span>
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
