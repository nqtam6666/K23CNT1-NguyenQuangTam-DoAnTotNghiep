'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { mayKhachApi } from '../../../tien-ich/may-khach-api';
import { PayloadJwt, PhanHoiBangDieuKhien, TienIchBangDieuKhien } from '@lms/chung';
import { KhungXuongTongQuan } from '../../../thanh-phan/khung-xuong';
import { BannerChao } from '../../../thanh-phan/bang-dieu-khien/banner-chao';
import { TheThongKeComponent } from '../../../thanh-phan/bang-dieu-khien/the-thong-ke';
import { BieuDoChuyenCan } from '../../../thanh-phan/bang-dieu-khien/bieu-do-chuyen-can';
import { BieuDoVaiTro } from '../../../thanh-phan/bang-dieu-khien/bieu-do-vai-tro';
import { HoatDongGanDayComponent } from '../../../thanh-phan/bang-dieu-khien/hoat-dong-gan-day';
import { ViecCanXuLyComponent } from '../../../thanh-phan/bang-dieu-khien/viec-can-xu-ly';
import { LoiTatTacVu } from '../../../thanh-phan/bang-dieu-khien/loi-tat-tac-vu';

export default function TrangBangDieuKhien() {
  // 1. Hồ sơ người dùng hiện tại
  const { data: nguoiDung, isLoading: dangTaiHoSo } = useQuery<PayloadJwt>({
    queryKey: ['ho-so-hien-tai'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/xac-thuc/ho-so-hien-tai');
      return res.data?.duLieu || res.data;
    },
    staleTime: 60 * 1000,
  });

  // 2. Dữ liệu tiện ích bảng điều khiển từ Registry API
  const {
    data: phanHoiBangDieuKhien,
    isLoading: dangTaiTienIch,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<PhanHoiBangDieuKhien>({
    queryKey: ['du-lieu-bang-dieu-khien'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/bang-dieu-khien');
      return res.data?.duLieu || res.data;
    },
    staleTime: 60 * 1000, // Khớp với TTL 60s phía backend Redis
  });

  // Trạng thái 1: Đang tải khung xương
  if (dangTaiHoSo || dangTaiTienIch) {
    return <KhungXuongTongQuan />;
  }

  // Trạng thái 2: Lỗi tải dữ liệu có nút thử lại
  if (isError) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white rounded-2xl border border-red-200 p-8 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Không thể tải dữ liệu bảng điều khiển</h3>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Đã có lỗi xảy ra trong quá trình tổng hợp số liệu từ máy chủ. Vui lòng kiểm tra lại kết
            nối mạng hoặc thử lại sau.
          </p>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Thử lại ngay
          </button>
        </div>
      </div>
    );
  }

  const danhSachTienIch = phanHoiBangDieuKhien?.tienIch || [];

  // Lọc tiện ích theo loại
  const cacTheThongKe = danhSachTienIch.filter((t) => t.loai === 'THE_THONG_KE' && t.duLieu);
  const bieuDoChuyenCan = danhSachTienIch.find((t) => t.id === 'bieu-do-chuyen-can-7-ngay');
  const bieuDoVaiTro = danhSachTienIch.find((t) => t.id === 'bieu-do-phan-bo-vai-tro');
  const hoatDongGanDay = danhSachTienIch.find((t) => t.loai === 'HOAT_DONG_GAN_DAY');
  const viecCanXuLy = danhSachTienIch.find((t) => t.loai === 'VIEC_CAN_XU_LY');

  // Trạng thái 3: Dữ liệu rỗng
  if (danhSachTienIch.length === 0) {
    return (
      <div className="space-y-6">
        <BannerChao hoTen={nguoiDung?.hoTen} vaiTro={nguoiDung?.vaiTro} />
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">Chưa có dữ liệu thống kê</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Hệ thống chưa ghi nhận các hoạt động của bạn. Hãy bắt đầu khám phá các tính năng theo
            vai trò được cấp phép.
          </p>
          <div className="mt-6">
            <LoiTatTacVu vaiTro={nguoiDung?.vaiTro} />
          </div>
        </div>
      </div>
    );
  }

  // Trạng thái 4: Hiển thị đầy đủ số liệu thực tế
  return (
    <div className="space-y-6">
      {/* 1. Banner chào mừng thu gọn */}
      <BannerChao hoTen={nguoiDung?.hoTen} vaiTro={nguoiDung?.vaiTro} />

      {/* 2. Lưới thẻ thống kê số liệu */}
      {cacTheThongKe.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cacTheThongKe.map((the) => (
            <TheThongKeComponent key={the.id} duLieu={the.duLieu} />
          ))}
        </div>
      )}

      {/* 3. Phần biểu đồ trực quan Recharts */}
      {(bieuDoChuyenCan || bieuDoVaiTro) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {bieuDoChuyenCan && (
            <div className={bieuDoVaiTro ? 'lg:col-span-7' : 'lg:col-span-12'}>
              <BieuDoChuyenCan
                tieuDe={bieuDoChuyenCan.tieuDe}
                duLieu={bieuDoChuyenCan.duLieu || []}
              />
            </div>
          )}

          {bieuDoVaiTro && (
            <div className={bieuDoChuyenCan ? 'lg:col-span-5' : 'lg:col-span-12'}>
              <BieuDoVaiTro tieuDe={bieuDoVaiTro.tieuDe} duLieu={bieuDoVaiTro.duLieu || []} />
            </div>
          )}
        </div>
      )}

      {/* 4. Khối Việc cần xử lý và Hoạt động gần đây */}
      {(viecCanXuLy || hoatDongGanDay) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {viecCanXuLy && <ViecCanXuLyComponent danhSach={viecCanXuLy.duLieu || []} />}
          {hoatDongGanDay && <HoatDongGanDayComponent danhSach={hoatDongGanDay.duLieu || []} />}
        </div>
      )}

      {/* 5. Lối tắt thao tác nhanh */}
      <LoiTatTacVu vaiTro={nguoiDung?.vaiTro} />
    </div>
  );
}
