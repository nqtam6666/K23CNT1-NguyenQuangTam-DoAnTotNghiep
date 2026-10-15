'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mayKhachApi } from './may-khach-api';
import {
  BanDoCaiDat,
  DANH_MUC_CAI_DAT_HE_THONG,
  ANH_XA_KHOA_CU_SANG_MOI,
  ANH_XA_KHOA_MOI_SANG_CU,
  tinhBangMauChuDaoTuHex,
} from '@lms/chung';

const MAC_DINH_TU_DANH_MUC: BanDoCaiDat = {};
for (const muc of DANH_MUC_CAI_DAT_HE_THONG) {
  if (muc.congKhai) {
    MAC_DINH_TU_DANH_MUC[muc.khoa] = muc.macDinh;
    if (muc.khoaCu) {
      MAC_DINH_TU_DANH_MUC[muc.khoaCu] = muc.macDinh;
    }
  }
}

export const GIA_TRI_MAC_DINH: BanDoCaiDat = {
  ...MAC_DINH_TU_DANH_MUC,
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
  MAU_CHU_DAO: '#059669',
};

/**
 * Áp dụng tức thì các cài đặt Giao diện & Hiển thị (giao_dien.*) vào biến CSS và thuộc tính HTML
 */
export function apDungCauHinhGiaoDienVaoDom(
  banDo: Record<string, string | undefined>,
  luuBoNhoTam = true,
) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  const mauChuDao =
    banDo['giao_dien.mau_chu_dao'] || banDo['MAU_CHU_DAO'] || '#059669';
  const bangMau = tinhBangMauChuDaoTuHex(mauChuDao);

  root.style.setProperty('--custom-accent-light', bangMau.maHex);
  root.style.setProperty('--custom-accent-dark', bangMau.maHexToi);
  root.style.setProperty('--custom-accent-soft-light', bangMau.nenNhatSang);
  root.style.setProperty('--custom-accent-soft-dark', bangMau.nenNhatToi);

  const doBoGoc = banDo['giao_dien.do_bo_goc_px'] || '4';
  const radiusHopLe = ['0', '2', '4', '6'].includes(String(doBoGoc)) ? String(doBoGoc) : '4';
  root.style.setProperty('--radius', `${radiusHopLe}px`);

  const coChu = banDo['giao_dien.co_chu_co_ban_px'] || '14';
  const coChuHopLe = ['13.5', '14', '15'].includes(String(coChu)) ? String(coChu) : '14';
  if (document.body) {
    document.body.style.fontSize = `${coChuHopLe}px`;
  }

  const mauBoiDen = banDo['giao_dien.mau_boi_den_van_ban'] || 'dam';
  root.setAttribute(
    'data-selection-style',
    ['dam', 'diu', 'than_am'].includes(mauBoiDen) ? mauBoiDen : 'dam',
  );

  const matDo = banDo['giao_dien.mat_do_hien_thi'] || 'chuan';
  root.setAttribute(
    'data-density',
    ['gon', 'chuan', 'thoang'].includes(matDo) ? matDo : 'chuan',
  );

  const hienThiTienTrinh = banDo['giao_dien.hien_thi_thanh_tien_trinh_chuyen_trang'] ?? 'true';
  root.setAttribute('data-top-progress', hienThiTienTrinh === 'false' ? 'false' : 'true');

  const cheDoMacDinh = banDo['giao_dien.che_do_sang_toi_mac_dinh'] || 'sang';
  const choPhepDoiCheDo = banDo['giao_dien.cho_phep_doi_che_do_sang_toi'] ?? 'true';

  try {
    const nguoiDungTuChon = localStorage.getItem('lms_user_theme_override') === 'true';
    if (choPhepDoiCheDo === 'false' || !nguoiDungTuChon) {
      const heThongToi =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      const laToi =
        cheDoMacDinh === 'toi' || (cheDoMacDinh === 'he_thong' && heThongToi);
      root.classList.toggle('dark', laToi);
      root.setAttribute('data-theme', laToi ? 'dark' : 'light');
      localStorage.setItem('lms_theme', laToi ? 'toi' : 'sang');
    }

    if (luuBoNhoTam) {
      localStorage.setItem(
        'lms_ui_config',
        JSON.stringify({
          accentLight: bangMau.maHex,
          accentDark: bangMau.maHexToi,
          accentSoftLight: bangMau.nenNhatSang,
          accentSoftDark: bangMau.nenNhatToi,
          radius: `${radiusHopLe}px`,
          fontSize: `${coChuHopLe}px`,
          selectionStyle: ['dam', 'diu', 'than_am'].includes(mauBoiDen) ? mauBoiDen : 'dam',
          density: ['gon', 'chuan', 'thoang'].includes(matDo) ? matDo : 'chuan',
          topProgress: hienThiTienTrinh === 'false' ? 'false' : 'true',
          defaultTheme: cheDoMacDinh,
          allowThemeToggle: choPhepDoiCheDo !== 'false',
        }),
      );
    }
  } catch {
    // Bỏ qua nếu trình duyệt chặn localStorage
  }
}

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
    const khoaMoi = ANH_XA_KHOA_CU_SANG_MOI[khoa];
    const khoaCu = ANH_XA_KHOA_MOI_SANG_CU[khoa];
    const val =
      caiDat[khoa] ??
      (khoaMoi ? caiDat[khoaMoi] : undefined) ??
      (khoaCu ? caiDat[khoaCu] : undefined) ??
      macDinh;

    // Tự động bảo vệ chống hiển thị lỗi font chứa ký tự '?' nếu cache cũ còn sót
    if (typeof val === 'string' && val.includes('?') && GIA_TRI_MAC_DINH[khoa]) {
      return GIA_TRI_MAC_DINH[khoa];
    }
    return val;
  };

  // Lấy đúng Favicon đã cấu hình trong Cài đặt hệ thống (URL_FAVICON -> URL_ICON -> URL_LOGO)
  const urlFaviconTuCaiDat =
    layGiaTri('chung.url_favicon') ||
    layGiaTri('chung.url_bieu_tuong_thu_gon') ||
    layGiaTri('chung.url_logo') ||
    '';

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

    const cacTheCu = document.querySelectorAll("link[rel*='icon']");
    if (cacTheCu.length > 0) {
      cacTheCu.forEach((the) => {
        const linkEl = the as HTMLLinkElement;
        if (linkEl.getAttribute('href') !== hrefFavicon) {
          linkEl.setAttribute('href', hrefFavicon);
        }
      });
    } else {
      const linkIcon = document.createElement('link');
      linkIcon.rel = 'icon';
      linkIcon.href = hrefFavicon;
      document.head.appendChild(linkIcon);
    }
  }, [urlFaviconTuCaiDat]);

  const mauChuDao = layGiaTri('giao_dien.mau_chu_dao', '#059669');
  const mauBoiDen = layGiaTri('giao_dien.mau_boi_den_van_ban', 'dam');
  const coChuCoBan = layGiaTri('giao_dien.co_chu_co_ban_px', '14');
  const matDoHienThi = layGiaTri('giao_dien.mat_do_hien_thi', 'chuan');
  const doBoGoc = layGiaTri('giao_dien.do_bo_goc_px', '4');
  const hienThiTienTrinh = layGiaTri('giao_dien.hien_thi_thanh_tien_trinh_chuyen_trang', 'true');
  const cheDoSangToiMacDinh = layGiaTri('giao_dien.che_do_sang_toi_mac_dinh', 'sang');
  const choPhepDoiCheDo = layGiaTri('giao_dien.cho_phep_doi_che_do_sang_toi', 'true');

  // Đồng bộ các cài đặt Giao diện & Hiển thị vào biến CSS toàn cục
  useEffect(() => {
    apDungCauHinhGiaoDienVaoDom({
      'giao_dien.mau_chu_dao': mauChuDao,
      'giao_dien.mau_boi_den_van_ban': mauBoiDen,
      'giao_dien.co_chu_co_ban_px': coChuCoBan,
      'giao_dien.mat_do_hien_thi': matDoHienThi,
      'giao_dien.do_bo_goc_px': doBoGoc,
      'giao_dien.hien_thi_thanh_tien_trinh_chuyen_trang': hienThiTienTrinh,
      'giao_dien.che_do_sang_toi_mac_dinh': cheDoSangToiMacDinh,
      'giao_dien.cho_phep_doi_che_do_sang_toi': choPhepDoiCheDo,
    });
  }, [
    mauChuDao,
    mauBoiDen,
    coChuCoBan,
    matDoHienThi,
    doBoGoc,
    hienThiTienTrinh,
    cheDoSangToiMacDinh,
    choPhepDoiCheDo,
  ]);

  const choPhepDangKy = layGiaTri('bao_mat.cho_phep_tu_dang_ky', 'true') !== 'false';

  return {
    caiDat,
    layGiaTri,
    choPhepDangKy,
    isLoading,
    refetch,
  };
}

