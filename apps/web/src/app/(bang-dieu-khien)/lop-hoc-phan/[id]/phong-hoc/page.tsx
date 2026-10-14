'use client';

import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ThanhPhanPhongHocLiveKit = dynamic(() => import('./thanh-phan-phong-hoc'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex flex-col items-center justify-center space-y-3 bg-surface text-muted">
      <Loader2 className="w-8 h-8 animate-spin text-accent" />
      <p className="text-sm font-medium">Đang tải giao diện phòng học LiveKit...</p>
    </div>
  ),
});
import {
  ArrowLeft,
  Video,
  Radio,
  Users,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Calendar,
  Clock,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { mayKhachApi } from '../../../../../tien-ich/may-khach-api';
import { thongBao } from '../../../../../tien-ich/thong-bao';
import { KetQuaTokenLiveKit, LopHocPhan, PayloadJwt, VaiTro } from '@lms/chung';

export default function TrangPhongHocTrucTuyen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [moNhatKy, setMoNhatKy] = useState(false);

  // 1. Lấy thông tin lớp học phần
  const {
    data: lopHocPhan,
    isLoading: dangTaiLop,
    error: loiLop,
  } = useQuery<LopHocPhan>({
    queryKey: ['chi-tiet-lop', id],
    queryFn: async () => {
      const res = await mayKhachApi.get(`/lop-hoc-phan/${id}`);
      return res.data.duLieu;
    },
    retry: false,
  });

  // 2. Lấy hồ sơ người dùng hiện tại (Dùng chung cache 0ms)
  const { data: nguoiDungHienTai } = useQuery<PayloadJwt>({
    queryKey: ['ho-so-hien-tai'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/xac-thuc/ho-so-hien-tai');
      return res.data?.duLieu;
    },
    staleTime: 5 * 60 * 1000,
  });

  // 3. Lấy AccessToken LiveKit từ Backend (Có kiểm tra quyền CASL & chống IDOR)
  const {
    data: duLieuToken,
    isLoading: dangCapToken,
    error: loiCapToken,
    refetch: layLaiToken,
  } = useQuery<KetQuaTokenLiveKit>({
    queryKey: ['livekit-token', id],
    queryFn: async () => {
      const res = await mayKhachApi.post(`/phong-hoc-truc-tuyen/lop/${id}/token`);
      return res.data.duLieu;
    },
    retry: false,
    enabled: !!lopHocPhan,
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  // 4. Lấy danh sách điểm danh buổi học nếu mở bảng nhật ký
  const { data: baoCaoDiemDanh } = useQuery({
    queryKey: ['nhat-ky-phong-hoc', id],
    queryFn: async () => {
      // Lấy buổi học hiện tại của lớp
      const resBuoiHoc = await mayKhachApi.get(`/thoi-khoa-bieu/buoi-hoc/lop/${id}`);
      const danhSachBuoi = resBuoiHoc.data?.duLieu || [];
      if (danhSachBuoi.length === 0) return null;
      const buoiGanNhat = danhSachBuoi[0];
      const resBaoCao = await mayKhachApi.get(
        `/phong-hoc-truc-tuyen/lop/${id}/buoi-hoc/${buoiGanNhat.id}/bao-cao`,
      );
      return resBaoCao.data?.duLieu;
    },
    enabled: moNhatKy,
  });

  const xuLyRoiPhong = () => {
    thongBao.thanhCong('Đã rời khỏi phòng học trực tuyến');
    router.push(`/lop-hoc-phan/${id}`);
  };

  // Trạng thái đang tải dữ liệu
  if (dangTaiLop || dangCapToken) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
        <div className="text-center">
          <p className="text-base font-semibold text-text">
            Đang khởi tạo kết nối Phòng học trực tuyến...
          </p>
          <p className="text-xs text-muted mt-1">
            Đang xác thực thông tin thành viên và thiết lập đường truyền an toàn...
          </p>
        </div>
      </div>
    );
  }

  // Trạng thái lỗi phân quyền hoặc không thể truy cập
  if (loiLop || loiCapToken || !duLieuToken) {
    const thongDiepLoi =
      (loiCapToken as any)?.response?.data?.thongDiep ||
      (loiLop as any)?.response?.data?.thongDiep ||
      'Bạn không có quyền tham gia phòng học trực tuyến của lớp này. Vui lòng kiểm tra lại tài khoản hoặc liên hệ giảng viên.';

    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-surface rounded shadow-sm border border-border text-center space-y-5">
        <div className="w-16 h-16 bg-danger-soft text-danger rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-text">Truy cập phòng học bị từ chối</h3>
          <p className="text-sm text-muted mt-2 leading-relaxed">{thongDiepLoi}</p>
        </div>
        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={() => layLaiToken()}
            className="w-full px-4 py-2.5 bg-accent hover:bg-accent text-white rounded text-sm font-semibold transition-colors shadow-sm"
          >
            Thử lại kết nối
          </button>
          <Link
            href={`/lop-hoc-phan/${id}`}
            className="w-full px-4 py-2.5 bg-active-bg hover:bg-active-bg text-text rounded text-sm font-medium transition-colors"
          >
            Quay lại thông tin lớp học
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] bg-surface text-text rounded overflow-hidden border border-border">
      {/* THANH ĐIỀU KHIỂN ĐẦU PHÒNG HỌC */}
      <header className="px-5 py-3 bg-surface border-b border-border flex items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={xuLyRoiPhong}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-active-bg text-muted hover:text-text rounded-lg text-xs font-medium transition-colors"
            title="Quay lại lớp học"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Rời phòng</span>
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base text-text truncate">
                {lopHocPhan?.tenLopHocPhan || 'Lớp học phần'}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-accent/10 text-accent border border-accent">
                <span className="w-2 h-2 rounded-full bg-accent-soft animate-pulse" />
                Trực tiếp
              </span>
            </div>
            <p className="text-xs text-muted truncate hidden sm:block">
              Mã phòng: <span className="font-mono text-muted">{duLieuToken.tenPhong}</span>
            </p>
          </div>
        </div>

        {/* Thông tin vai trò & Tiện ích */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="text-right hidden md:block">
            <span className="text-xs text-muted">Tham gia với vai trò:</span>
            <p className="text-xs font-semibold text-accent">
              {duLieuToken.vaiTroTrongPhong === 'CHU_TRI'
                ? 'Chủ trì (Giáo viên)'
                : 'Học sinh (Thành viên)'}
            </p>
          </div>

          <button
            onClick={() => setMoNhatKy(!moNhatKy)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              moNhatKy
                ? 'bg-accent text-white border-accent'
                : 'bg-surface text-muted border-border hover:bg-active-bg hover:text-text'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Nhật ký điểm danh</span>
          </button>
        </div>
      </header>

      {/* KHÔNG GIAN PHÒNG HỌC LIVEKIT ROOM */}
      <div className="flex-1 relative flex overflow-hidden">
        <div className="flex-1 h-full w-full">
          <ThanhPhanPhongHocLiveKit
            urlMayChuLiveKit={duLieuToken.urlMayChuLiveKit}
            token={duLieuToken.token}
            onLeaveRoom={xuLyRoiPhong}
            onReloadToken={() => layLaiToken()}
          />
        </div>

        {/* SIDEBAR NHẬT KÝ ĐIỂM DANH */}
        {moNhatKy && (
          <aside className="w-80 sm:w-96 bg-surface border-l border-border flex flex-col h-full z-10">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-sm text-text flex items-center gap-2">
                <Users className="w-4 h-4 text-accent" />
                Nhật ký có mặt & Điểm danh
              </h3>
              <button
                onClick={() => setMoNhatKy(false)}
                className="text-muted hover:text-text text-xs"
              >
                Đóng
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div>
                <p className="text-muted font-medium mb-2">Thành viên có mặt gần nhất:</p>
                {baoCaoDiemDanh?.danhSachNhatKy && baoCaoDiemDanh.danhSachNhatKy.length > 0 ? (
                  <div className="space-y-2">
                    {baoCaoDiemDanh.danhSachNhatKy.map((nk: any) => (
                      <div
                        key={nk.id}
                        className="p-2.5 rounded-lg bg-surface border border-border flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-text">
                            {nk.idNguoiDung === nguoiDungHienTai?.id
                              ? `${nguoiDungHienTai?.hoTen} (Bạn)`
                              : nk.idNguoiDung}
                          </p>
                          <span className="text-[11px] text-muted">
                            Vào lúc: {new Date(nk.thoiGianVao).toLocaleTimeString('vi-VN')}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-accent/20 text-accent border border-accent">
                          {nk.thoiGianRa ? 'Đã rời' : 'Đang trong phòng'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-surface border border-border text-center text-muted">
                    Chưa có nhật ký tham gia được ghi nhận
                  </div>
                )}
              </div>

              <div>
                <p className="text-muted font-medium mb-2">Danh sách điểm danh tự động:</p>
                {baoCaoDiemDanh?.danhSachDiemDanh && baoCaoDiemDanh.danhSachDiemDanh.length > 0 ? (
                  <div className="space-y-2">
                    {baoCaoDiemDanh.danhSachDiemDanh.map((dd: any) => (
                      <div
                        key={dd.id}
                        className="p-2.5 rounded-lg bg-surface border border-border flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-text">
                            {dd.hocSinh?.nguoiDung?.hoTen || 'Học sinh'}
                          </p>
                          <p className="text-[11px] text-muted font-mono">
                            {dd.hocSinh?.maHocSinh}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-accent/20 text-accent border border-accent">
                          {dd.trangThai === 'CO_MAT' ? 'Có mặt' : dd.trangThai}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-center py-2">Chưa có bản ghi điểm danh</p>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
