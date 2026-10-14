'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mayKhachApi } from './may-khach-api';
import { BanDoCaiDat } from '@lms/chung';

export const GIA_TRI_MAC_DINH: BanDoCaiDat = {
  TEN_HE_THONG: 'SmartClass AI',
  KHAU_HIEU: 'Hệ thống Lớp học số tích hợp Trí tuệ nhân tạo',
  TEN_TRUONG: 'Trường Đại học Nguyễn Trãi',
  TAC_GIA: 'Nguyễn Quang Tâm',
  MA_LOP_KHOA: 'K23CNT1',
  MSSV: '2310900093',
  EMAIL_LIEN_HE: 'nguyenquangtam179@gmail.com',
  SO_DIEN_THOAI: '0987654321',
  BANNER_TIEU_DE: 'SmartClass AI – Hệ thống Lớp học số tích hợp Trí tuệ nhân tạo',
  BANNER_MO_TA:
    'Nghiên cứu, thiết kế và phát triển hệ thống lớp học số tích hợp trí tuệ nhân tạo SmartClass AI: Điểm danh thông minh, luyện tập, thi thử và quản lý kết quả học phần (K23CNT1 - Nguyễn Quang Tâm).',
  CHO_PHEP_DANG_KY: 'true',
  THONG_BAO_CHUNG:
    'Chào mừng bạn đến với Hệ thống Lớp học số tích hợp Trí tuệ nhân tạo SmartClass AI!',
  URL_LOGO: '',
  URL_FAVICON: '',
  URL_ICON: '',
};

export function useCaiDatHeThong() {
  const { data, isLoading, refetch } = useQuery<BanDoCaiDat>({
    queryKey: ['cai-dat-cong-khai'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/cai-dat/cong-khai');
      return res.data?.duLieu || {};
    },
    staleTime: 60 * 1000, // 1 phút
  });

  const caiDat: BanDoCaiDat = {
    ...GIA_TRI_MAC_DINH,
    ...(data || {}),
  };

  const layGiaTri = (khoa: string, macDinh = ''): string => {
    const val = caiDat[khoa] ?? macDinh;
    // Tự động bảo vệ chống hiển thị lỗi font chứa ký tự '?' nếu cache cũ còn sót
    if (typeof val === 'string' && val.includes('?') && GIA_TRI_MAC_DINH[khoa]) {
      return GIA_TRI_MAC_DINH[khoa];
    }
    return val;
  };

  // Lấy đúng Favicon đã cấu hình trong Cài đặt hệ thống (URL_FAVICON -> URL_ICON -> URL_LOGO)
  const urlFaviconTuCaiDat =
    caiDat.URL_FAVICON || caiDat.URL_ICON || caiDat.URL_LOGO || '';

  // Đồng bộ Favicon từ Cài đặt hệ thống lên thanh tab trình duyệt ở tất cả các trang (kể cả /dang-nhap)
  useEffect(() => {
    if (typeof document === 'undefined') return;

    let hrefFavicon = urlFaviconTuCaiDat;
    try {
      if (hrefFavicon) {
        localStorage.setItem('lms_favicon', hrefFavicon);
      } else {
        hrefFavicon = localStorage.getItem('lms_favicon') || '';
      }
    } catch {
      // Bỏ qua nếu trình duyệt chặn localStorage
    }

    if (!hrefFavicon) return;

    // Xóa các thẻ icon tĩnh mặc định nếu khác đường dẫn cài đặt để trình duyệt luôn ưu tiên Favicon từ Cài đặt
    const cacTheCu = document.querySelectorAll("link[rel*='icon']");
    let daCoTheChuan = false;

    cacTheCu.forEach((the) => {
      const linkEl = the as HTMLLinkElement;
      if (linkEl.getAttribute('href') === hrefFavicon) {
        daCoTheChuan = true;
      } else {
        linkEl.parentNode?.removeChild(linkEl);
      }
    });

    if (!daCoTheChuan) {
      const linkIcon = document.createElement('link');
      linkIcon.rel = 'icon';
      linkIcon.href = hrefFavicon;
      document.head.appendChild(linkIcon);

      const linkShortcut = document.createElement('link');
      linkShortcut.rel = 'shortcut icon';
      linkShortcut.href = hrefFavicon;
      document.head.appendChild(linkShortcut);
    }
  }, [urlFaviconTuCaiDat]);

  const choPhepDangKy = caiDat.CHO_PHEP_DANG_KY === 'true';

  return {
    caiDat,
    layGiaTri,
    choPhepDangKy,
    isLoading,
    refetch,
  };
}
