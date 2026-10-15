'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Layers } from 'lucide-react';
import { mayKhachApi } from '../../../tien-ich/may-khach-api';
import { PayloadJwt, PhanHoiBangDieuKhien } from '@lms/chung';
import { KhungXuongTongQuan, KhungXuong } from '../../../thanh-phan/khung-xuong';
import { BannerChao } from '../../../thanh-phan/bang-dieu-khien/banner-chao';
import { TheThongKeComponent } from '../../../thanh-phan/bang-dieu-khien/the-thong-ke';
import { HoatDongGanDayComponent } from '../../../thanh-phan/bang-dieu-khien/hoat-dong-gan-day';
import { ViecCanXuLyComponent } from '../../../thanh-phan/bang-dieu-khien/viec-can-xu-ly';
import { LoiTatTacVu } from '../../../thanh-phan/bang-dieu-khien/loi-tat-tac-vu';
import { HopThongBao } from '../../../thanh-phan/hop-thong-bao';
import { NutBam } from '../../../thanh-phan/nut-bam';
import { TrangThaiRong } from '../../../thanh-phan/bang-du-lieu';

// Lazy-load Recharts để giảm hơn 1.2MB JS đồng bộ khi F5 trang Tổng quan
const BieuDoChuyenCan = dynamic(
  () =>
    import('../../../thanh-phan/bang-dieu-khien/bieu-do-chuyen-can').then(
      (mod) => mod.BieuDoChuyenCan,
    ),
  {
    ssr: false,
    loading: () => <KhungXuong className="h-[340px] w-full" />,
  },
);

const BieuDoVaiTro = dynamic(
  () =>
    import('../../../thanh-phan/bang-dieu-khien/bieu-do-vai-tro').then(
      (mod) => mod.BieuDoVaiTro,
    ),
  {
    ssr: false,
    loading: () => <KhungXuong className="h-[340px] w-full" />,
  },
);

export default function TrangBangDieuKhien() {
  const queryClient = useQueryClient();

  // Khôi phục nhanh dữ liệu từ sessionStorage ngay sau khi hydrate (tránh lỗi Hydration #418)
  useEffect(() => {
    try {
      const rawHoSo = sessionStorage.getItem('lms_cache_ho_so');
      if (rawHoSo && !queryClient.getQueryData(['ho-so-hien-tai'])) {
        queryClient.setQueryData(['ho-so-hien-tai'], JSON.parse(rawHoSo) as PayloadJwt);
      }
      const rawBangDieuKhien = sessionStorage.getItem('lms_cache_bang_dieu_khien');
      if (rawBangDieuKhien && !queryClient.getQueryData(['du-lieu-bang-dieu-khien'])) {
        queryClient.setQueryData(
          ['du-lieu-bang-dieu-khien'],
          JSON.parse(rawBangDieuKhien) as PhanHoiBangDieuKhien,
        );
      }
    } catch {
      // Bỏ qua lỗi đọc sessionStorage
    }
  }, [queryClient]);

  // 1. Hồ sơ người dùng hiện tại
  const { data: nguoiDung, isLoading: dangTaiHoSo } = useQuery<PayloadJwt>({
    queryKey: ['ho-so-hien-tai'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/xac-thuc/ho-so-hien-tai');
      const duLieu = res.data?.duLieu || res.data;
      try {
        sessionStorage.setItem('lms_cache_ho_so', JSON.stringify(duLieu));
      } catch {
        // Bỏ qua
      }
      return duLieu;
    },
    staleTime: 60 * 1000,
  });

  // 2. Dữ liệu tiện ích bảng điều khiển từ Registry API
  const {
    data: phanHoiBangDieuKhien,
    isLoading: dangTaiTienIch,
    isError,
    refetch,
    isFetching,
  } = useQuery<PhanHoiBangDieuKhien>({
    queryKey: ['du-lieu-bang-dieu-khien'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/bang-dieu-khien');
      const duLieu = res.data?.duLieu || res.data;
      try {
        sessionStorage.setItem('lms_cache_bang_dieu_khien', JSON.stringify(duLieu));
      } catch {
        // Bỏ qua
      }
      return duLieu;
    },
    staleTime: 60 * 1000,
  });

  // Trạng thái 1: Đang tải khung xương (chỉ hiện lần đầu tiên khi chưa có cache)
  if ((dangTaiHoSo || dangTaiTienIch) && !phanHoiBangDieuKhien) {
    return <KhungXuongTongQuan />;
  }

  // Trạng thái 2: Lỗi tải dữ liệu có nút thử lại
  if (isError && !phanHoiBangDieuKhien) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <HopThongBao
            loai="danger"
            eyebrow="TRẠNG THÁI KẾT NỐI"
            tieuDe="Không thể tải dữ liệu bảng điều khiển"
            hanhDong={
              <NutBam
                variant="primary"
                onClick={() => refetch()}
                dangTai={isFetching}
                icon={<RefreshCw strokeWidth={1.5} className="w-4 h-4" />}
              >
                Thử lại ngay
              </NutBam>
            }
          >
            Đã có lỗi xảy ra trong quá trình tổng hợp số liệu từ máy chủ. Vui lòng kiểm tra lại kết
            nối mạng hoặc thử lại sau.
          </HopThongBao>
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
        <TrangThaiRong
          icon={Layers}
          tieuDe="Chưa có dữ liệu thống kê"
          moTa="Hệ thống chưa ghi nhận các hoạt động của bạn. Hãy bắt đầu khám phá các tính năng theo vai trò được cấp phép."
        />
        <LoiTatTacVu vaiTro={nguoiDung?.vaiTro} />
      </div>
    );
  }

  // Trạng thái 4: Hiển thị đầy đủ số liệu thực tế
  return (
    <div className="space-y-6">
      {/* 1. Banner chào mừng */}
      <BannerChao hoTen={nguoiDung?.hoTen} vaiTro={nguoiDung?.vaiTro} />

      {/* 2. Lưới thẻ thống kê số liệu (<x-stat-card>) */}
      {cacTheThongKe.length > 0 && (
        <section aria-label="Số liệu thống kê tổng quan" className="space-y-2.5">
          <p className="eyebrow">CHỈ SỐ HỌC VỤ TRỌNG TÂM</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cacTheThongKe.map((the) => (
              <TheThongKeComponent key={the.id} duLieu={the.duLieu} />
            ))}
          </div>
        </section>
      )}

      {/* 3. Phần biểu đồ trực quan Recharts (tải bất đồng bộ) */}
      {(bieuDoChuyenCan || bieuDoVaiTro) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {bieuDoChuyenCan && (
            <div className={bieuDoVaiTro ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <BieuDoChuyenCan
                tieuDe={bieuDoChuyenCan.tieuDe}
                duLieu={bieuDoChuyenCan.duLieu || []}
              />
            </div>
          )}

          {bieuDoVaiTro && (
            <div className={bieuDoChuyenCan ? 'lg:col-span-1' : 'lg:col-span-3'}>
              <BieuDoVaiTro tieuDe={bieuDoVaiTro.tieuDe} duLieu={bieuDoVaiTro.duLieu || []} />
            </div>
          )}
        </div>
      )}

      {/* 4. Phần Việc cần xử lý & Hoạt động gần đây */}
      {(viecCanXuLy || hoatDongGanDay) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {viecCanXuLy && <ViecCanXuLyComponent danhSach={viecCanXuLy.duLieu || []} />}
          {hoatDongGanDay && <HoatDongGanDayComponent danhSach={hoatDongGanDay.duLieu || []} />}
        </div>
      )}

      {/* 5. Lối tắt tác vụ nhanh theo vai trò */}
      <LoiTatTacVu vaiTro={nguoiDung?.vaiTro} />
    </div>
  );
}
