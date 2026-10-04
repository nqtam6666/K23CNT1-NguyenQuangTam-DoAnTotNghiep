'use client';

import { useQuery } from '@tanstack/react-query';
import { mayKhachApi } from './may-khach-api';
import { BanDoCaiDat } from '@lms/chung';

export const GIA_TRI_MAC_DINH: BanDoCaiDat = {
  TEN_HE_THONG: 'LMS Trường Học',
  KHAU_HIEU: 'Hệ thống Quản lý Học tập Thế hệ Mới',
  TEN_TRUONG: 'Trường Đại học Công nghệ',
  TAC_GIA: 'Nguyễn Quang Tâm',
  MA_LOP_KHOA: 'K23CNT1',
  MSSV: '2310900093',
  EMAIL_LIEN_HE: 'nguyenquangtam179@gmail.com',
  SO_DIEN_THOAI: '0987654321',
  BANNER_TIEU_DE: 'Nền tảng Học tập Toàn diện Tích hợp Phòng học LiveKit & Trợ lý AI',
  BANNER_MO_TA:
    'Đồ án tốt nghiệp chuyên ngành Công nghệ Thông tin. Tối ưu hóa trải nghiệm giảng dạy trực tuyến, quản lý học vụ và hỗ trợ học tập thông minh.',
  CHO_PHEP_DANG_KY: 'true',
  THONG_BAO_CHUNG: 'Chào mừng bạn đến với Hệ thống Quản lý Học tập LMS Trường học!',
};

export function useCaiDatHeThong() {
  const { data, isLoading, refetch } = useQuery<BanDoCaiDat>({
    queryKey: ['cai-dat-cong-khai'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/cai-dat/cong-khai');
      return res.data?.duLieu || {};
    },
    staleTime: 10 * 60 * 1000, // 10 phút
  });

  const caiDat: BanDoCaiDat = {
    ...GIA_TRI_MAC_DINH,
    ...(data || {}),
  };

  const layGiaTri = (khoa: string, macDinh = ''): string => {
    return caiDat[khoa] ?? macDinh;
  };

  const choPhepDangKy = caiDat.CHO_PHEP_DANG_KY === 'true';

  return {
    caiDat,
    layGiaTri,
    choPhepDangKy,
    isLoading,
    refetch,
  };
}
