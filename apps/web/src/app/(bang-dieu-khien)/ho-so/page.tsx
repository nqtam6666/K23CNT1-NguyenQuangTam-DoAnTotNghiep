'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User,
  Key,
  GraduationCap,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  School,
  Camera,
  Sliders,
  Bot,
  Monitor,
  Smartphone,
  LogOut,
  Trash2,
  Shield,
  Video,
  Bell,
  Sun,
  Moon,
  Laptop,
  RefreshCw,
  Mail,
  Send,
} from 'lucide-react';
import {
  capNhatHoSoSchema,
  doiMatKhauSchema,
  CapNhatHoSoDto,
  DoiMatKhauDto,
  layNhanVaiTro,
  TuyChonCaNhan,
  TUY_CHON_CA_NHAN_MAC_DINH,
  KetQuaGuiThuThongBaoDaKenh,
} from '@lms/chung';
import { mayKhachApi } from '../../../tien-ich/may-khach-api';
import { thongBao } from '../../../tien-ich/thong-bao';
import { KhungXuongHoSo } from '../../../thanh-phan/khung-xuong';
import { AnhDaiDien } from '../../../thanh-phan/anh-dai-dien';
import { HopThoaiDoiAnhDaiDien } from '../../../thanh-phan/hop-thoai-doi-anh-dai-dien';
import { HopThoai } from '../../../thanh-phan/hop-thoai';
import { CongTac } from '../../../thanh-phan/cong-tac';
import { phatThongBaoManHinhWindows } from '../../../thanh-phan/hop-thong-bao';
import { AnimatedBackground } from '@/components/ui/animated-tabs';

type TabHoSo = 'thong-tin' | 'doi-mat-khau' | 'tuy-chon' | 'quyen-rieng-tu-ai';

interface PhienDangNhapItem {
  id: string;
  thongTinTrinhDuyet?: string | null;
  diaChiIp?: string | null;
  ngayTao: string;
  ngayHetHan: string;
}

function phanTichThietBi(userAgent?: string | null): {
  tenThietBi: string;
  laDiDong: boolean;
} {
  if (!userAgent) {
    return { tenThietBi: 'Trình duyệt Web', laDiDong: false };
  }
  const ua = userAgent.toLowerCase();
  const laDiDong = ua.includes('mobile') || ua.includes('android') || ua.includes('iphone');

  let trinhDuyet = 'Trình duyệt';
  if (ua.includes('edg/')) trinhDuyet = 'Microsoft Edge';
  else if (ua.includes('chrome/')) trinhDuyet = 'Google Chrome';
  else if (ua.includes('firefox/')) trinhDuyet = 'Mozilla Firefox';
  else if (ua.includes('safari/') && !ua.includes('chrome/')) trinhDuyet = 'Apple Safari';

  let heDieuHanh = '';
  if (ua.includes('windows')) heDieuHanh = 'Windows';
  else if (ua.includes('mac os')) heDieuHanh = 'macOS';
  else if (ua.includes('android')) heDieuHanh = 'Android';
  else if (ua.includes('iphone') || ua.includes('ipad')) heDieuHanh = 'iOS';
  else if (ua.includes('linux')) heDieuHanh = 'Linux';

  return {
    tenThietBi: heDieuHanh ? `${trinhDuyet} trên ${heDieuHanh}` : trinhDuyet,
    laDiDong,
  };
}

function apDungGiaoDienTrucTiep(tuyChon: TuyChonCaNhan) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('lms_tuy_chon_ca_nhan', JSON.stringify(tuyChon));
    localStorage.setItem('lms_sidebar_thu_gon', String(tuyChon.thuGonThanhBenMacDinh));

    if (tuyChon.cheDoGiaoDien === 'he_thong') {
      localStorage.removeItem('lms_theme');
      const heThongToi = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', heThongToi);
      document.documentElement.setAttribute('data-theme', heThongToi ? 'dark' : 'light');
    } else {
      const laToi = tuyChon.cheDoGiaoDien === 'toi';
      localStorage.setItem('lms_theme', laToi ? 'toi' : 'sang');
      document.documentElement.classList.toggle('dark', laToi);
      document.documentElement.setAttribute('data-theme', laToi ? 'dark' : 'light');
    }
  } catch {
    // Bỏ qua nếu trình duyệt chặn localStorage
  }
}

export default function TrangHoSoCaNhan() {
  const queryClient = useQueryClient();
  const [tabHienTai, setTabHienTai] = useState<TabHoSo>('thong-tin');
  const [moModalDoiAnh, setMoModalDoiAnh] = useState(false);
  const [thongBaoThanhCong, setThongBaoThanhCong] = useState<string | null>(null);
  const [thongBaoLoi, setThongBaoLoi] = useState<string | null>(null);

  // Trạng thái tùy chọn cá nhân
  const [tuyChon, setTuyChon] = useState<TuyChonCaNhan>(TUY_CHON_CA_NHAN_MAC_DINH);
  const [moXacNhanXoaLichSuAi, setMoXacNhanXoaLichSuAi] = useState(false);
  const [moXacNhanDangXuatTatCa, setMoXacNhanDangXuatTatCa] = useState(false);

  // 1. Lấy hồ sơ cá nhân
  const { data: hoSo, isLoading } = useQuery({
    queryKey: ['hoSoCaNhan'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/ho-so/ca-nhan');
      return res.data?.duLieu;
    },
  });

  // 2. Lấy tùy chọn cài đặt cá nhân từ máy chủ
  const { data: duLieuTuyChon } = useQuery<TuyChonCaNhan>({
    queryKey: ['tuy-chon-ca-nhan'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/ho-so/tuy-chon-ca-nhan');
      return res.data?.duLieu || TUY_CHON_CA_NHAN_MAC_DINH;
    },
  });

  useEffect(() => {
    if (duLieuTuyChon) {
      setTuyChon({
        ...TUY_CHON_CA_NHAN_MAC_DINH,
        ...duLieuTuyChon,
        thongBao: {
          ...TUY_CHON_CA_NHAN_MAC_DINH.thongBao,
          ...(duLieuTuyChon.thongBao || {}),
        },
        troLyAi: {
          ...TUY_CHON_CA_NHAN_MAC_DINH.troLyAi,
          ...(duLieuTuyChon.troLyAi || {}),
        },
        phongHoc: {
          ...TUY_CHON_CA_NHAN_MAC_DINH.phongHoc,
          ...(duLieuTuyChon.phongHoc || {}),
        },
      });
    }
  }, [duLieuTuyChon]);

  // 3. Lấy danh sách phiên đăng nhập đang hoạt động (khi ở tab Bảo mật)
  const {
    data: danhSachPhien = [],
    isLoading: dangTaiPhien,
    refetch: taiLaiPhien,
  } = useQuery<PhienDangNhapItem[]>({
    queryKey: ['phien-dang-nhap-ca-nhan'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/xac-thuc/phien-dang-nhap');
      return res.data?.duLieu || [];
    },
    enabled: tabHienTai === 'doi-mat-khau',
  });

  // 4. Form cập nhật thông tin cá nhân
  const {
    register: dangKyThongTin,
    handleSubmit: xuLyCapNhatThongTin,
    formState: { isSubmitting: dangLuuThongTin },
  } = useForm<CapNhatHoSoDto>({
    resolver: zodResolver(capNhatHoSoSchema),
    values: {
      hoTen: hoSo?.hoTen || '',
      soDienThoai: hoSo?.soDienThoai || '',
      anhDaiDien: hoSo?.anhDaiDien || '',
    },
  });

  const capNhatThongTin = async (duLieu: CapNhatHoSoDto) => {
    setThongBaoThanhCong(null);
    setThongBaoLoi(null);
    try {
      await mayKhachApi.patch('/ho-so/ca-nhan', duLieu);
      queryClient.invalidateQueries({ queryKey: ['hoSoCaNhan'] });
      queryClient.invalidateQueries({ queryKey: ['ho-so-hien-tai'] });
      setThongBaoThanhCong('Cập nhật thông tin thành công.');
      thongBao.thanhCong(
        'Cập nhật hồ sơ thành công',
        'Thông tin cá nhân đã được lưu vào hệ thống.',
      );
    } catch (loi: any) {
      const msg = loi.response?.data?.thongDiep || 'Không thể cập nhật hồ sơ';
      setThongBaoLoi(msg);
      thongBao.loiHeThong(loi, 'Không thể cập nhật hồ sơ');
    }
  };

  // 5. Form đổi mật khẩu
  const {
    register: dangKyDoiMatKhau,
    handleSubmit: xuLyDoiMatKhau,
    reset: resetFormDoiMatKhau,
    formState: { errors: loiDoiMatKhau, isSubmitting: dangDoiMatKhau },
  } = useForm<DoiMatKhauDto>({
    resolver: zodResolver(doiMatKhauSchema),
  });

  const doiMatKhau = async (duLieu: DoiMatKhauDto) => {
    setThongBaoThanhCong(null);
    setThongBaoLoi(null);
    try {
      await mayKhachApi.post('/xac-thuc/doi-mat-khau', duLieu);
      setThongBaoThanhCong('Đổi mật khẩu thành công.');
      resetFormDoiMatKhau();
      thongBao.thanhCong(
        'Đổi mật khẩu thành công',
        'Mật khẩu bảo vệ tài khoản của bạn đã được thay đổi.',
      );
    } catch (loi: any) {
      const msg = loi.response?.data?.thongDiep || 'Không thể đổi mật khẩu';
      setThongBaoLoi(msg);
      thongBao.loiHeThong(loi, 'Không thể đổi mật khẩu');
    }
  };

  // 6. Mutation lưu tùy chọn cá nhân
  const dotLuuTuyChon = useMutation({
    mutationFn: async (duLieuMoi: Partial<TuyChonCaNhan>) => {
      const res = await mayKhachApi.patch('/ho-so/tuy-chon-ca-nhan', duLieuMoi);
      return res.data?.duLieu as TuyChonCaNhan;
    },
    onSuccess: (ketQua) => {
      const tuyChonChuan = ketQua || tuyChon;
      setTuyChon(tuyChonChuan);
      apDungGiaoDienTrucTiep(tuyChonChuan);
      queryClient.invalidateQueries({ queryKey: ['tuy-chon-ca-nhan'] });
      thongBao.thanhCong(
        'Đã lưu tùy chọn cá nhân',
        'Thiết lập giao diện và quyền riêng tư của bạn đã được đồng bộ.',
      );
    },
    onError: (loi: any) => {
      thongBao.loiHeThong(loi, 'Không thể lưu tùy chọn cá nhân');
    },
  });

  // 7. Mutation thu hồi 1 phiên đăng nhập
  const dotThuHoiPhien = useMutation({
    mutationFn: async (phienId: string) => {
      await mayKhachApi.delete(`/xac-thuc/phien-dang-nhap/${phienId}`);
    },
    onSuccess: () => {
      thongBao.thanhCong('Đã thu hồi phiên đăng nhập', 'Thiết bị được chọn đã bị đăng xuất.');
      taiLaiPhien();
    },
    onError: (loi: any) => {
      thongBao.loiHeThong(loi, 'Không thể thu hồi phiên đăng nhập');
    },
  });

  // 8. Mutation đăng xuất tất cả thiết bị
  const dotDangXuatTatCa = useMutation({
    mutationFn: async () => {
      await mayKhachApi.post('/xac-thuc/dang-xuat-tat-ca');
    },
    onSuccess: () => {
      setMoXacNhanDangXuatTatCa(false);
      thongBao.thanhCong(
        'Đã thu hồi tất cả phiên đăng nhập',
        'Toàn bộ phiên đăng nhập trên các thiết bị khác đã bị vô hiệu hóa.',
      );
      taiLaiPhien();
    },
    onError: (loi: any) => {
      thongBao.loiHeThong(loi, 'Không thể đăng xuất các thiết bị khác');
    },
  });

  // 9. Mutation xóa toàn bộ lịch sử trò chuyện AI
  const dotXoaLichSuAi = useMutation({
    mutationFn: async () => {
      const res = await mayKhachApi.delete('/tro-ly-ai/phien');
      return res.data;
    },
    onSuccess: (res) => {
      setMoXacNhanXoaLichSuAi(false);
      const thongDiep =
        res?.duLieu?.thongDiep || 'Toàn bộ lịch sử hội thoại AI của bạn đã được xóa.';
      thongBao.thanhCong('Đã xóa lịch sử hội thoại AI', thongDiep);
      queryClient.invalidateQueries({ queryKey: ['danh-sach-phien-ai'] });
    },
    onError: (loi: any) => {
      thongBao.loiHeThong(loi, 'Không thể xóa lịch sử hội thoại AI');
    },
  });

  if (isLoading) {
    return <KhungXuongHoSo />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Tiêu đề trang */}
      <div>
        <p className="eyebrow mb-1">TÀI KHOẢN & TÙY CHỌN CÁ NHÂN</p>
        <h1 className="text-[22px] font-mono font-bold text-[var(--text)] tracking-tight">
          Hồ sơ & Cài đặt Cá nhân
        </h1>
        <p className="text-[14px] text-[var(--muted)] mt-1">
          Quản lý thông tin định danh, mật khẩu, phiên thiết bị, giao diện làm việc và quyền riêng tư
        </p>
      </div>

      {/* Thông báo kết quả */}
      {thongBaoThanhCong && (
        <div className="p-3.5 rounded-[var(--radius)] bg-[var(--accent-soft)] border border-[var(--accent)] text-[var(--accent)] text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-[var(--accent)] stroke-[1.5]" />
          <span>{thongBaoThanhCong}</span>
        </div>
      )}
      {thongBaoLoi && (
        <div className="p-3.5 rounded-[var(--radius)] bg-[var(--danger-soft)] border border-[var(--danger)] text-[var(--danger)] text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-[var(--danger)] stroke-[1.5]" />
          <span>{thongBaoLoi}</span>
        </div>
      )}

      {/* Thẻ Hồ sơ tóm tắt */}
      <div className="p-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] flex flex-col sm:flex-row items-center gap-6">
        <div
          onClick={() => setMoModalDoiAnh(true)}
          title="Nhấp để thay đổi ảnh đại diện"
          className="relative group cursor-pointer shrink-0"
        >
          <AnhDaiDien
            url={hoSo?.anhDaiDien}
            hoTen={hoSo?.hoTen}
            kichThuoc="xl"
            className="ring-2 ring-[var(--border)] transition-colors duration-150 group-hover:ring-[var(--accent)]"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMoModalDoiAnh(true);
            }}
            title="Đổi ảnh đại diện"
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[var(--accent)] text-white ring-2 ring-[var(--surface)] flex items-center justify-center p-0 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 shrink-0 stroke-[1.5]" />
          </button>
        </div>

        <div className="text-center sm:text-left flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-mono font-bold text-[var(--text)] truncate">
                {hoSo?.hoTen}
              </h2>
              <p className="text-sm text-[var(--muted)] truncate">{hoSo?.email}</p>
            </div>
            <button
              type="button"
              onClick={() => setMoModalDoiAnh(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--accent)] bg-[var(--accent-soft)] border border-[var(--accent)] rounded-[var(--radius)] transition-colors cursor-pointer self-center sm:self-auto"
            >
              <Camera className="w-3.5 h-3.5 stroke-[1.5]" />
              Đổi ảnh đại diện
            </button>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2 justify-center sm:justify-start">
            <span className="px-2.5 py-0.5 rounded-[var(--radius)] text-xs font-mono font-semibold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]">
              {layNhanVaiTro(hoSo?.vaiTro)}
            </span>
            <span className="px-2.5 py-0.5 rounded-[var(--radius)] text-xs font-mono bg-[var(--bg)] text-[var(--muted)] border border-[var(--border)]">
              Đang hoạt động
            </span>
          </div>
        </div>
      </div>

      {/* Thanh chuyển đổi 4 Tab cài đặt cá nhân */}
      <div className="border-b border-[var(--border)] flex flex-wrap gap-1">
        <AnimatedBackground
          defaultValue={tabHienTai}
          className="rounded-t-[var(--radius)] bg-[var(--accent-soft)]"
          transition={{ type: 'spring', bounce: 0.15, duration: 0.25 }}
        >
          <button
            data-id="thong-tin"
            type="button"
            onClick={() => {
              setTabHienTai('thong-tin');
              setThongBaoThanhCong(null);
              setThongBaoLoi(null);
            }}
            className={`px-4 py-2.5 text-xs sm:text-sm font-mono border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              tabHienTai === 'thong-tin'
                ? 'border-[var(--accent)] text-[var(--accent)] font-bold'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <User className="w-4 h-4 stroke-[1.5]" />
            <span>Thông tin cơ bản</span>
          </button>

          <button
            data-id="doi-mat-khau"
            type="button"
            onClick={() => {
              setTabHienTai('doi-mat-khau');
              setThongBaoThanhCong(null);
              setThongBaoLoi(null);
            }}
            className={`px-4 py-2.5 text-xs sm:text-sm font-mono border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              tabHienTai === 'doi-mat-khau'
                ? 'border-[var(--accent)] text-[var(--accent)] font-bold'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <Key className="w-4 h-4 stroke-[1.5]" />
            <span>Mật khẩu & Phiên thiết bị</span>
          </button>

          <button
            data-id="tuy-chon"
            type="button"
            onClick={() => {
              setTabHienTai('tuy-chon');
              setThongBaoThanhCong(null);
              setThongBaoLoi(null);
            }}
            className={`px-4 py-2.5 text-xs sm:text-sm font-mono border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              tabHienTai === 'tuy-chon'
                ? 'border-[var(--accent)] text-[var(--accent)] font-bold'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <Sliders className="w-4 h-4 stroke-[1.5]" />
            <span>Giao diện & Thông báo</span>
          </button>

          <button
            data-id="quyen-rieng-tu-ai"
            type="button"
            onClick={() => {
              setTabHienTai('quyen-rieng-tu-ai');
              setThongBaoThanhCong(null);
              setThongBaoLoi(null);
            }}
            className={`px-4 py-2.5 text-xs sm:text-sm font-mono border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
              tabHienTai === 'quyen-rieng-tu-ai'
                ? 'border-[var(--accent)] text-[var(--accent)] font-bold'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            <Bot className="w-4 h-4 stroke-[1.5]" />
            <span>Quyền riêng tư & Trợ lý AI</span>
          </button>
        </AnimatedBackground>
      </div>

      {/* TAB 1: THÔNG TIN CƠ BẢN & HỒ SƠ HỌC VỤ */}
      {tabHienTai === 'thong-tin' && (
        <div className="space-y-6">
          <form
            onSubmit={xuLyCapNhatThongTin(capNhatThongTin)}
            className="p-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] space-y-4"
          >
            <div>
              <p className="eyebrow mb-0.5">THÔNG TIN LIÊN HỆ</p>
              <h3 className="font-mono font-bold text-[var(--text)] text-base">
                Chỉnh sửa thông tin cá nhân
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  {...dangKyThongTin('hoTen')}
                  className="w-full px-3.5 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  {...dangKyThongTin('soDienThoai')}
                  className="w-full px-3.5 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                Địa chỉ Email (Cố định theo tài khoản trường cấp)
              </label>
              <input
                type="email"
                disabled
                value={hoSo?.email || ''}
                className="w-full px-3.5 py-2 border border-[var(--border)] bg-[var(--bg)] text-[var(--muted)] rounded-[var(--radius)] text-sm cursor-not-allowed"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={dangLuuThongTin}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-[var(--radius)] text-xs font-semibold transition-opacity hover:opacity-95 disabled:opacity-50 cursor-pointer"
              >
                {dangLuuThongTin ? (
                  <Loader2 className="w-4 h-4 animate-spin stroke-[1.5]" />
                ) : (
                  <Save className="w-4 h-4 stroke-[1.5]" />
                )}
                Lưu thay đổi
              </button>
            </div>
          </form>

          {/* Thông tin học vụ Học sinh */}
          {hoSo?.hoSoHocSinh && (
            <div className="p-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)]">
              <h3 className="font-mono font-bold text-[var(--text)] text-base mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[var(--accent)] stroke-[1.5]" />
                Hồ sơ Học vụ Học sinh
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-[var(--muted)]">Mã học sinh:</span>
                  <p className="font-mono font-semibold text-[var(--text)]">
                    {hoSo.hoSoHocSinh.maHocSinh}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-[var(--muted)]">Lớp hành chính:</span>
                  <p className="font-semibold text-[var(--text)]">
                    {hoSo.hoSoHocSinh.lopHanhChinh?.tenLop || 'Chưa phân lớp'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-[var(--muted)]">Ngày sinh:</span>
                  <p className="font-mono font-semibold text-[var(--text)]">
                    {hoSo.hoSoHocSinh.ngaySinh
                      ? new Date(hoSo.hoSoHocSinh.ngaySinh).toLocaleDateString('vi-VN')
                      : 'Chưa cập nhật'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-[var(--muted)]">Địa chỉ:</span>
                  <p className="font-semibold text-[var(--text)]">
                    {hoSo.hoSoHocSinh.diaChi || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Thông tin chuyên môn Giáo viên */}
          {hoSo?.hoSoGiaoVien && (
            <div className="p-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)]">
              <h3 className="font-mono font-bold text-[var(--text)] text-base mb-4 flex items-center gap-2">
                <School className="w-5 h-5 text-[var(--accent)] stroke-[1.5]" />
                Hồ sơ Chuyên môn Giảng viên
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-[var(--muted)]">Mã giáo viên:</span>
                  <p className="font-mono font-semibold text-[var(--text)]">
                    {hoSo.hoSoGiaoVien.maGiaoVien}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-[var(--muted)]">Học vị:</span>
                  <p className="font-semibold text-[var(--text)]">
                    {hoSo.hoSoGiaoVien.hocVi || 'Chưa cập nhật'}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-xs text-[var(--muted)]">Bộ môn chuyên môn:</span>
                  <p className="font-semibold text-[var(--text)]">
                    {hoSo.hoSoGiaoVien.chuyenMon || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ĐỔI MẬT KHẨU & QUẢN LÝ PHIÊN THIẾT BỊ */}
      {tabHienTai === 'doi-mat-khau' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Cột đổi mật khẩu */}
          <form
            onSubmit={xuLyDoiMatKhau(doiMatKhau)}
            className="lg:col-span-5 p-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] space-y-4"
          >
            <div>
              <p className="eyebrow mb-0.5">MẬT KHẨU TÀI KHOẢN</p>
              <h3 className="font-mono font-bold text-[var(--text)] text-base">
                Đổi mật khẩu bảo mật
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                Mật khẩu hiện tại *
              </label>
              <input
                type="password"
                {...dangKyDoiMatKhau('matKhauHienTai')}
                className="w-full px-3.5 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
              />
              {loiDoiMatKhau.matKhauHienTai && (
                <p className="mt-1 text-xs text-[var(--danger)]">
                  {loiDoiMatKhau.matKhauHienTai.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                Mật khẩu mới *
              </label>
              <input
                type="password"
                {...dangKyDoiMatKhau('matKhauMoi')}
                placeholder="Tối thiểu 8 ký tự, gồm chữ và số"
                className="w-full px-3.5 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
              />
              {loiDoiMatKhau.matKhauMoi && (
                <p className="mt-1 text-xs text-[var(--danger)]">
                  {loiDoiMatKhau.matKhauMoi.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                Xác nhận mật khẩu mới *
              </label>
              <input
                type="password"
                {...dangKyDoiMatKhau('xacNhanMatKhauMoi')}
                className="w-full px-3.5 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
              />
              {loiDoiMatKhau.xacNhanMatKhauMoi && (
                <p className="mt-1 text-xs text-[var(--danger)]">
                  {loiDoiMatKhau.xacNhanMatKhauMoi.message}
                </p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={dangDoiMatKhau}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-[var(--radius)] text-xs font-semibold transition-opacity hover:opacity-95 disabled:opacity-50 cursor-pointer"
              >
                {dangDoiMatKhau && <Loader2 className="w-4 h-4 animate-spin stroke-[1.5]" />}
                Cập nhật mật khẩu
              </button>
            </div>
          </form>

          {/* Cột quản lý phiên thiết bị đăng nhập */}
          <div className="lg:col-span-7 p-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
              <div>
                <p className="eyebrow mb-0.5">QUẢN LÝ PHIÊN LÀM VIỆC</p>
                <h3 className="font-mono font-bold text-[var(--text)] text-base">
                  Thiết bị đang đăng nhập ({danhSachPhien.length})
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Kiểm tra và thu hồi phiên đăng nhập nếu bạn quên thoát trên máy tính phòng thực hành.
                </p>
              </div>

              {danhSachPhien.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMoXacNhanDangXuatTatCa(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--danger)] bg-[var(--surface)] border border-[var(--danger)] rounded-[var(--radius)] hover:bg-[var(--danger-soft)] transition-colors shrink-0 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>Thu hồi tất cả phiên</span>
                </button>
              )}
            </div>

            {dangTaiPhien ? (
              <div className="py-8 flex items-center justify-center text-xs text-[var(--muted)] gap-2">
                <Loader2 className="w-4 h-4 animate-spin stroke-[1.5]" />
                <span>Đang tải danh sách thiết bị...</span>
              </div>
            ) : danhSachPhien.length === 0 ? (
              <div className="p-6 text-center rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--muted)]">
                Hiện không có phiên làm việc phụ nào đang lưu.
              </div>
            ) : (
              <div className="space-y-2.5">
                {danhSachPhien.map((phien, idx) => {
                  const { tenThietBi, laDiDong } = phanTichThietBi(phien.thongTinTrinhDuyet);
                  return (
                    <div
                      key={phien.id}
                      className="p-3.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] text-[var(--accent)] flex items-center justify-center shrink-0">
                          {laDiDong ? (
                            <Smartphone className="w-4 h-4 stroke-[1.5]" />
                          ) : (
                            <Monitor className="w-4 h-4 stroke-[1.5]" />
                          )}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-[var(--text)]">
                              {tenThietBi}
                            </span>
                            {idx === 0 && (
                              <span className="px-1.5 py-0.5 text-[10px] font-mono bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)] rounded-[var(--radius)]">
                                Gần nhất
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] font-mono text-[var(--muted)]">
                            <span>IP: {phien.diaChiIp || 'Nội bộ'}</span>
                            <span>
                              Đăng nhập:{' '}
                              {new Date(phien.ngayTao).toLocaleString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => dotThuHoiPhien.mutate(phien.id)}
                        disabled={dotThuHoiPhien.isPending}
                        className="px-2.5 py-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--danger)] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--danger)] rounded-[var(--radius)] transition-colors shrink-0 cursor-pointer"
                      >
                        Thu hồi
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TÙY CHỌN GIAO DIỆN, PHÒNG HỌC & THÔNG BÁO */}
      {tabHienTai === 'tuy-chon' && (
        <div className="space-y-5">
          {/* Thẻ 1: Giao diện & Bố cục */}
          <section className="p-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] space-y-4">
            <div>
              <p className="eyebrow mb-0.5">KHÔNG GIAN LÀM VIỆC</p>
              <h3 className="font-mono font-bold text-[var(--text)] text-base">
                Chế độ Giao diện & Thanh điều hướng
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <AnimatedBackground
                defaultValue={tuyChon.cheDoGiaoDien}
                className="rounded-[var(--radius)] bg-[var(--accent-soft)] border border-[var(--accent)]"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.25 }}
              >
                {[
                  {
                    ma: 'sang' as const,
                    nhan: 'Giao diện Sáng',
                    moTa: 'Nền giấy ấm dịu mắt ban ngày',
                    icon: Sun,
                  },
                  {
                    ma: 'toi' as const,
                    nhan: 'Giao diện Tối',
                    moTa: 'Giảm chói khi học ban đêm',
                    icon: Moon,
                  },
                  {
                    ma: 'he_thong' as const,
                    nhan: 'Theo thiết bị',
                    moTa: 'Tự động đồng bộ theo hệ điều hành',
                    icon: Laptop,
                  },
                ].map((item) => {
                  const dangChon = tuyChon.cheDoGiaoDien === item.ma;
                  const BieuTuong = item.icon;
                  return (
                    <button
                      key={item.ma}
                      data-id={item.ma}
                      type="button"
                      onClick={() =>
                        setTuyChon((truoc) => ({ ...truoc, cheDoGiaoDien: item.ma }))
                      }
                      className={`p-3.5 rounded-[var(--radius)] border text-left transition-colors cursor-pointer ${
                        dangChon
                          ? 'border-[var(--accent)] text-[var(--text)]'
                          : 'bg-[var(--bg)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-1.5">
                          <BieuTuong
                            className={`w-4 h-4 stroke-[1.5] ${
                              dangChon ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
                            }`}
                          />
                          {dangChon && (
                            <span className="text-[10px] font-mono font-bold text-[var(--accent)]">
                              ĐANG CHỌN
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-[var(--text)]">{item.nhan}</p>
                        <p className="text-[11px] text-[var(--muted)] mt-0.5">{item.moTa}</p>
                      </div>
                    </button>
                  );
                })}
              </AnimatedBackground>
            </div>

            <div className="pt-2 flex items-center justify-between p-3.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)]">
              <div className="pr-3">
                <p className="text-xs font-semibold text-[var(--text)]">
                  Mặc định thu gọn thanh bên điều hướng (Sidebar)
                </p>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">
                  Mở rộng diện tích bảng điểm, lịch dạy và nội dung lớp học phần.
                </p>
              </div>
              <CongTac
                checked={tuyChon.thuGonThanhBenMacDinh}
                ariaLabel="Mặc định thu gọn thanh bên điều hướng (Sidebar)"
                onChange={(checked) =>
                  setTuyChon((truoc) => ({
                    ...truoc,
                    thuGonThanhBenMacDinh: checked,
                  }))
                }
              />
            </div>
          </section>

          {/* Thẻ 2: Thiết bị mặc định khi vào phòng học trực tuyến */}
          <section className="p-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] space-y-4">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-[var(--accent)] stroke-[1.5]" />
              <div>
                <p className="eyebrow">PHÒNG HỌC TRỰC TUYẾN</p>
                <h3 className="font-mono font-bold text-[var(--text)] text-base">
                  Trạng thái Thiết bị Nghe nhìn Mặc định
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)]">
                <div className="pr-3">
                  <p className="text-xs font-semibold text-[var(--text)]">
                    Tự động bật Micro khi vào phòng
                  </p>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">
                    Khuyên tắt để tránh gây tiếng ồn khi mới vào lớp.
                  </p>
                </div>
                <CongTac
                  checked={tuyChon.phongHoc.batMicroKhiVaoPhong}
                  ariaLabel="Tự động bật Micro khi vào phòng"
                  onChange={(checked) =>
                    setTuyChon((truoc) => ({
                      ...truoc,
                      phongHoc: {
                        ...truoc.phongHoc,
                        batMicroKhiVaoPhong: checked,
                      },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)]">
                <div className="pr-3">
                  <p className="text-xs font-semibold text-[var(--text)]">
                    Tự động bật Camera khi vào phòng
                  </p>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">
                    Khuyên tắt để bạn chủ động bật Camera khi đã sẵn sàng.
                  </p>
                </div>
                <CongTac
                  checked={tuyChon.phongHoc.batCameraKhiVaoPhong}
                  ariaLabel="Tự động bật Camera khi vào phòng"
                  onChange={(checked) =>
                    setTuyChon((truoc) => ({
                      ...truoc,
                      phongHoc: {
                        ...truoc.phongHoc,
                        batCameraKhiVaoPhong: checked,
                      },
                    }))
                  }
                />
              </div>
            </div>
          </section>

          {/* Thẻ 3: Kênh nhận thông báo (Nền tảng · Windows · Gmail) & Sự kiện học vụ */}
          <section className="p-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[var(--accent)] stroke-[1.5]" />
                <div>
                  <p className="eyebrow">KÊNH THÔNG BÁO ĐA NỀN TẢNG</p>
                  <h3 className="font-mono font-bold text-[var(--text)] text-base">
                    Thông báo Nền tảng, Màn hình Windows &amp; Hộp thư Gmail
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  try {
                    if (
                      typeof window !== 'undefined' &&
                      'Notification' in window &&
                      window.Notification.permission === 'default'
                    ) {
                      await window.Notification.requestPermission();
                    }
                    const res = await mayKhachApi.post('/bang-dieu-khien/thong-bao/gui-thu');
                    const kq = (res.data?.duLieu || res.data) as KetQuaGuiThuThongBaoDaKenh;
                    if (kq?.thongBaoMoi && tuyChon.thongBao.kenhWindows !== false) {
                      phatThongBaoManHinhWindows({
                        id: kq.thongBaoMoi.id,
                        tieuDe: kq.thongBaoMoi.tieuDe,
                        noiDung: kq.thongBaoMoi.noiDung,
                        duongDan: kq.thongBaoMoi.duongDan,
                      });
                    }
                    queryClient.invalidateQueries({ queryKey: ['thong-bao-thuc-te'] });
                    thongBao.thanhCong(
                      'Đã phát thông báo thử nghiệm đa kênh',
                      kq?.thongDiep ||
                        'Đã đồng bộ thông báo trên Nền tảng, Windows và kênh Gmail.',
                    );
                  } catch (loi: any) {
                    thongBao.loiHeThong(loi, 'Không thể gửi thử thông báo đa kênh');
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius)] border border-[var(--accent)] bg-[var(--accent-soft)] font-mono text-xs font-bold text-[var(--accent)] hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>Gửi thử thông báo (3 kênh)</span>
              </button>
            </div>

            {/* Khối 1: 3 Kênh chuyển phát thông báo */}
            <div className="space-y-2.5">
              <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--muted)]">
                1. KÊNH CHUYỂN TIẾP THÔNG BÁO CỦA TÀI KHOẢN
              </p>

              {/* Kênh Nền tảng */}
              <div className="flex items-center justify-between p-3.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)]">
                <div className="flex items-start gap-2.5 pr-3">
                  <Bell className="w-4 h-4 text-[var(--accent)] stroke-[1.5] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-[var(--text)]">
                      Kênh Nền tảng LMS (Chuông thông báo &amp; Băng thông báo nhanh)
                    </p>
                    <p className="text-[11px] text-[var(--muted)] mt-0.5">
                      Lưu trữ trực tiếp vào hộp thông báo cá nhân trên thanh công cụ và hiển thị thông báo nổi khi đang trực tuyến.
                    </p>
                  </div>
                </div>
                <CongTac
                  checked={tuyChon.thongBao.kenhNenTang !== false}
                  ariaLabel="Kênh Nền tảng LMS"
                  onChange={(checked) =>
                    setTuyChon((truoc) => ({
                      ...truoc,
                      thongBao: {
                        ...truoc.thongBao,
                        kenhNenTang: checked,
                      },
                    }))
                  }
                />
              </div>

              {/* Kênh Windows / Hệ điều hành */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)]">
                <div className="flex items-start gap-2.5 pr-3">
                  <Monitor className="w-4 h-4 text-[var(--info)] stroke-[1.5] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-[var(--text)]">
                      Kênh Màn hình Windows / Hệ điều hành (Desktop Notification)
                    </p>
                    <p className="text-[11px] text-[var(--muted)] mt-0.5">
                      Đẩy hộp thông báo gốc xuống góc phải màn hình Windows ngay cả khi bạn đang thu nhỏ trình duyệt hoặc làm việc ở ứng dụng khác.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={async () => {
                      if (typeof window === 'undefined' || !('Notification' in window)) {
                        thongBao.canhBao(
                          'Không hỗ trợ',
                          'Trình duyệt hiện tại không hỗ trợ Web Notification API.',
                        );
                        return;
                      }
                      const quyen = await window.Notification.requestPermission();
                      if (quyen === 'granted') {
                        phatThongBaoManHinhWindows({
                          tieuDe: 'Thông báo màn hình Windows đã sẵn sàng',
                          noiDung:
                            'Tài khoản của bạn sẽ nhận thông báo trực tiếp trên màn hình Windows khi có bài tập hoặc thông báo mới.',
                          duongDan: '/ho-so',
                        });
                        thongBao.thanhCong(
                          'Đã cấp quyền thông báo Windows',
                          'Hộp thông báo gốc của hệ điều hành Windows đã được kích hoạt.',
                        );
                      } else {
                        thongBao.canhBao(
                          'Chưa cấp quyền thông báo Windows',
                          'Vui lòng cho phép quyền Thông báo (Notifications) trên thanh địa chỉ trình duyệt.',
                        );
                      }
                    }}
                    className="px-2.5 py-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--active-bg)] font-mono text-[11px] text-[var(--text)] transition-colors cursor-pointer"
                  >
                    Cấp quyền Windows
                  </button>
                  <CongTac
                    checked={tuyChon.thongBao.kenhWindows !== false}
                    ariaLabel="Kênh Màn hình Windows"
                    onChange={(checked) =>
                      setTuyChon((truoc) => ({
                        ...truoc,
                        thongBao: {
                          ...truoc.thongBao,
                          kenhWindows: checked,
                        },
                      }))
                    }
                  />
                </div>
              </div>

              {/* Kênh Gmail / Thư điện tử */}
              <div className="p-3.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5 pr-3">
                    <Mail className="w-4 h-4 text-[var(--accent)] stroke-[1.5] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[var(--text)]">
                        Kênh Hộp thư Gmail / Email tự động (SMTP)
                      </p>
                      <p className="text-[11px] text-[var(--muted)] mt-0.5">
                        Tự động gửi thư điện tử tới địa chỉ Gmail của bạn khi có thông báo lớp học mới, bài tập mới, bài kiểm tra mới hoặc kết quả chấm điểm.
                      </p>
                    </div>
                  </div>
                  <CongTac
                    checked={tuyChon.thongBao.kenhGmail !== false}
                    ariaLabel="Kênh Gmail"
                    onChange={(checked) =>
                      setTuyChon((truoc) => ({
                        ...truoc,
                        thongBao: {
                          ...truoc.thongBao,
                          kenhGmail: checked,
                        },
                      }))
                    }
                  />
                </div>

                <div className="pl-6 pt-1 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center gap-2.5">
                  <label className="font-mono text-[11px] text-[var(--muted)] shrink-0">
                    Địa chỉ Gmail nhận thông báo (để trống sẽ dùng email tài khoản{' '}
                    <span className="text-[var(--text)] font-bold">{hoSo?.email}</span>):
                  </label>
                  <input
                    type="email"
                    value={tuyChon.thongBao.emailNhanThongBao || ''}
                    onChange={(e) =>
                      setTuyChon((truoc) => ({
                        ...truoc,
                        thongBao: {
                          ...truoc.thongBao,
                          emailNhanThongBao: e.target.value,
                        },
                      }))
                    }
                    placeholder={hoSo?.email || 'ten-cua-ban@gmail.com'}
                    className="flex-1 px-3 py-1.5 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] font-mono text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>
            </div>

            {/* Khối 2: Các loại sự kiện học vụ */}
            <div className="space-y-2.5 pt-2">
              <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--muted)]">
                2. LOẠI SỰ KIỆN HỌC VỤ CẦN THÔNG BÁO
              </p>
              {[
                {
                  khoa: 'baiTapVaHanNop' as const,
                  nhan: 'Bài tập mới, Đề kiểm tra mới & Nhắc hạn nộp bài',
                  moTa: 'Nhận thông báo khi giảng viên giao bài tập mới, mở đề thi thử hoặc sắp đến hạn nộp.',
                },
                {
                  khoa: 'diemSoVaKetQua' as const,
                  nhan: 'Cập nhật Điểm số & Nhận xét bài làm',
                  moTa: 'Nhận thông báo khi bài nộp được chấm điểm hoặc bảng điểm học phần cập nhật.',
                },
                {
                  khoa: 'diemDanhVaChuyenCan' as const,
                  nhan: 'Điểm danh, Đơn xin nghỉ & Cảnh báo chuyên cần',
                  moTa: 'Nhận thông báo khi mở phiên điểm danh PIN hoặc phản hồi đơn xin nghỉ phép.',
                },
                {
                  khoa: 'lichHocVaPhongTrucTuyen' as const,
                  nhan: 'Thông báo lớp học, Lịch học & Phòng học trực tuyến',
                  moTa: 'Nhận thông báo khi có bài đăng mới trong lớp học phần hoặc buổi học trực tuyến bắt đầu.',
                },
              ].map((muc) => {
                const dangBat = tuyChon.thongBao[muc.khoa];
                return (
                  <div
                    key={muc.khoa}
                    className="flex items-center justify-between p-3.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)]"
                  >
                    <div className="pr-3">
                      <p className="text-xs font-semibold text-[var(--text)]">{muc.nhan}</p>
                      <p className="text-[11px] text-[var(--muted)] mt-0.5">{muc.moTa}</p>
                    </div>
                    <CongTac
                      checked={dangBat}
                      ariaLabel={muc.nhan}
                      onChange={(checked) =>
                        setTuyChon((truoc) => ({
                          ...truoc,
                          thongBao: {
                            ...truoc.thongBao,
                            [muc.khoa]: checked,
                          },
                        }))
                      }
                    />
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => dotLuuTuyChon.mutate(tuyChon)}
                disabled={dotLuuTuyChon.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-[var(--radius)] text-xs font-semibold transition-opacity hover:opacity-95 disabled:opacity-50 cursor-pointer"
              >
                {dotLuuTuyChon.isPending ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin stroke-[1.5]" />
                ) : (
                  <Save className="w-3.5 h-3.5 stroke-[1.5]" />
                )}
                <span>Lưu tùy chọn giao diện &amp; kênh thông báo</span>
              </button>
            </div>
          </section>
        </div>
      )}

      {/* TAB 4: QUYỀN RIÊNG TƯ & TRỢ LÝ AI */}
      {tabHienTai === 'quyen-rieng-tu-ai' && (
        <div className="space-y-5">
          {/* Thẻ 1: Quyền riêng tư trong lớp học */}
          <section className="p-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--accent)] stroke-[1.5]" />
              <div>
                <p className="eyebrow">QUYỀN RIÊNG TƯ LỚP HỌC</p>
                <h3 className="font-mono font-bold text-[var(--text)] text-base">
                  Hiển thị Thông tin Cá nhân
                </h3>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)]">
              <div className="pr-4 space-y-1">
                <p className="text-xs font-semibold text-[var(--text)]">
                  Ẩn số điện thoại cá nhân với danh sách học sinh cùng lớp
                </p>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  Khi bật, số điện thoại của bạn được ẩn trên danh sách thành viên lớp học phần. Giảng viên phụ trách lớp và Phòng Đào tạo vẫn xem được để liên hệ học vụ khi cần.
                </p>
              </div>
              <CongTac
                checked={tuyChon.anThongTinLienHeVoiLop}
                ariaLabel="Ẩn số điện thoại cá nhân với danh sách học sinh cùng lớp"
                onChange={(checked) =>
                  setTuyChon((truoc) => ({
                    ...truoc,
                    anThongTinLienHeVoiLop: checked,
                  }))
                }
              />
            </div>
          </section>

          {/* Thẻ 2: Tùy chọn cá nhân hóa Trợ lý AI */}
          <section className="p-6 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] space-y-4">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-[var(--accent)] stroke-[1.5]" />
              <div>
                <p className="eyebrow">TRỢ LÝ HỌC TẬP AI</p>
                <h3 className="font-mono font-bold text-[var(--text)] text-base">
                  Phong cách Giải đáp & Lịch sử Hội thoại
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-[var(--text)]">
                Độ chi tiết câu trả lời mong muốn
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    ma: 'ngan_gon' as const,
                    nhan: 'Ngắn gọn, trọng tâm',
                    moTa: 'Đi thẳng vào công thức, định nghĩa chính',
                  },
                  {
                    ma: 'can_bang' as const,
                    nhan: 'Cân bằng (Mặc định)',
                    moTa: 'Giải thích vừa đủ kèm ví dụ minh họa',
                  },
                  {
                    ma: 'chi_tiet' as const,
                    nhan: 'Diễn giải từng bước',
                    moTa: 'Phân tích sâu từng bước giải và mở rộng',
                  },
                ].map((muc) => {
                  const dangChon = tuyChon.troLyAi.doChiTietPhanHoi === muc.ma;
                  return (
                    <button
                      key={muc.ma}
                      type="button"
                      onClick={() =>
                        setTuyChon((truoc) => ({
                          ...truoc,
                          troLyAi: { ...truoc.troLyAi, doChiTietPhanHoi: muc.ma },
                        }))
                      }
                      className={`p-3.5 rounded-[var(--radius)] border text-left transition-colors cursor-pointer ${
                        dangChon
                          ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--text)]'
                          : 'bg-[var(--bg)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      <p className="text-xs font-bold text-[var(--text)]">{muc.nhan}</p>
                      <p className="text-[11px] text-[var(--muted)] mt-1">{muc.moTa}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)]">
              <div className="pr-4 space-y-1">
                <p className="text-xs font-semibold text-[var(--text)]">
                  Tự động lưu lịch sử các cuộc hội thoại học tập
                </p>
                <p className="text-[11px] text-[var(--muted)]">
                  Giúp bạn tra cứu lại các phần giải thích bài giảng của những buổi học trước.
                </p>
              </div>
              <CongTac
                checked={tuyChon.troLyAi.luuLichSuHoiThoai}
                ariaLabel="Tự động lưu lịch sử các cuộc hội thoại học tập"
                onChange={(checked) =>
                  setTuyChon((truoc) => ({
                    ...truoc,
                    troLyAi: {
                      ...truoc.troLyAi,
                      luuLichSuHoiThoai: checked,
                    },
                  }))
                }
              />
            </div>

            {/* Khu vực xóa toàn bộ lịch sử trò chuyện AI */}
            <div className="p-4 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[var(--text)]">
                  Dọn dẹp toàn bộ lịch sử hội thoại Trợ lý AI
                </p>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">
                  Xóa vĩnh viễn tất cả các phiên hỏi đáp của bạn với Trợ lý AI học thuật.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMoXacNhanXoaLichSuAi(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[var(--danger)] bg-[var(--surface)] border border-[var(--danger)] rounded-[var(--radius)] hover:bg-[var(--danger-soft)] transition-colors shrink-0 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>Xóa lịch sử trò chuyện</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => dotLuuTuyChon.mutate(tuyChon)}
                disabled={dotLuuTuyChon.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-[var(--radius)] text-xs font-semibold transition-opacity hover:opacity-95 disabled:opacity-50 cursor-pointer"
              >
                {dotLuuTuyChon.isPending ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin stroke-[1.5]" />
                ) : (
                  <Save className="w-3.5 h-3.5 stroke-[1.5]" />
                )}
                <span>Lưu tùy chọn quyền riêng tư & AI</span>
              </button>
            </div>
          </section>
        </div>
      )}

      {/* HỘP THOẠI THAY ĐỔI ẢNH ĐẠI DIỆN */}
      <HopThoaiDoiAnhDaiDien
        mo={moModalDoiAnh}
        onDong={() => setMoModalDoiAnh(false)}
        anhDaiDienHienTai={hoSo?.anhDaiDien}
        hoTen={hoSo?.hoTen}
      />

      {/* HỘP THOẠI XÁC NHẬN THU HỒI TẤT CẢ PHIÊN ĐĂNG NHẬP */}
      <HopThoai
        mo={moXacNhanDangXuatTatCa}
        onDong={() => setMoXacNhanDangXuatTatCa(false)}
        eyebrow="AN TOÀN TÀI KHOẢN"
        tieuDe="Thu hồi tất cả phiên đăng nhập"
        moTa="Toàn bộ các phiên làm việc đang lưu trên các thiết bị khác sẽ bị vô hiệu hóa ngay lập tức."
        kichThuoc="nho"
      >
        <div className="space-y-4">
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Bạn có chắc chắn muốn thu hồi toàn bộ phiên đăng nhập của tài khoản{' '}
            <strong className="text-[var(--text)]">{hoSo?.email}</strong>?
          </p>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setMoXacNhanDangXuatTatCa(false)}
              className="px-4 py-2 text-xs font-semibold text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] hover:bg-[var(--active-bg)] transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => dotDangXuatTatCa.mutate()}
              disabled={dotDangXuatTatCa.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[var(--danger)] rounded-[var(--radius)] hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {dotDangXuatTatCa.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Xác nhận thu hồi</span>
            </button>
          </div>
        </div>
      </HopThoai>

      {/* HỘP THOẠI XÁC NHẬN XÓA LỊCH SỬ TRỢ LÝ AI */}
      <HopThoai
        mo={moXacNhanXoaLichSuAi}
        onDong={() => setMoXacNhanXoaLichSuAi(false)}
        eyebrow="DỌN DẸP DỮ LIỆU CÁ NHÂN"
        tieuDe="Xóa toàn bộ lịch sử hội thoại AI"
        moTa="Thao tác này sẽ xóa vĩnh viễn tất cả các phiên trò chuyện và câu hỏi trước đây của bạn với Trợ lý AI."
        kichThuoc="nho"
      >
        <div className="space-y-4">
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Dữ liệu hội thoại sau khi xóa không thể khôi phục lại. Bạn có chắc chắn muốn tiếp tục?
          </p>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setMoXacNhanXoaLichSuAi(false)}
              className="px-4 py-2 text-xs font-semibold text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] hover:bg-[var(--active-bg)] transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => dotXoaLichSuAi.mutate()}
              disabled={dotXoaLichSuAi.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[var(--danger)] rounded-[var(--radius)] hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {dotXoaLichSuAi.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Xóa toàn bộ lịch sử</span>
            </button>
          </div>
        </div>
      </HopThoai>
    </div>
  );
}
