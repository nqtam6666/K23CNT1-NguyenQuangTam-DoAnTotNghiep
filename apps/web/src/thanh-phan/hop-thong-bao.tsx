'use client';

import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  LucideIcon,
  Bell,
  CheckCheck,
  RefreshCw,
  ArrowUpRight,
  BookOpen,
  Calendar,
  GraduationCap,
  ClipboardCheck,
  ShieldAlert,
  Monitor,
  Mail,
  Send,
  Settings2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  MucThongBaoThucTe,
  PhanHoiThongBaoBangDieuKhien,
  PhanLoaiThongBao,
  KetQuaGuiThuThongBaoDaKenh,
  TuyChonCaNhan,
  TUY_CHON_CA_NHAN_MAC_DINH,
} from '@lms/chung';
import { cn } from '../lib/utils';
import { HopThoai } from './hop-thoai';
import { NutBam } from './nut-bam';
import { useCaiDatHeThong } from '../tien-ich/use-cai-dat';
import { mayKhachApi } from '../tien-ich/may-khach-api';
import AnimatedBackground from '../components/ui/animated-tabs';

export type LoaiThongBao = 'info' | 'success' | 'warning' | 'danger';

export interface ThuocTinhHopThongBao {
  loai?: LoaiThongBao;
  eyebrow?: string;
  tieuDe: string;
  thoiGian?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  hanhDong?: ReactNode;
}

const CAU_HINH_LOAI: Record<
  LoaiThongBao,
  {
    vien: string;
    nenIcon: string;
    mauIcon: string;
    iconMacDinh: LucideIcon;
    nhanMacDinh: string;
  }
> = {
  info: {
    vien: 'border-[var(--info)]',
    nenIcon: 'bg-[var(--info-soft)]',
    mauIcon: 'text-[var(--info)]',
    iconMacDinh: Info,
    nhanMacDinh: 'THÔNG BÁO HỆ THỐNG',
  },
  success: {
    vien: 'border-[var(--accent)]',
    nenIcon: 'bg-[var(--accent-soft)]',
    mauIcon: 'text-[var(--accent)]',
    iconMacDinh: CheckCircle2,
    nhanMacDinh: 'CẬP NHẬT HOÀN TẤT',
  },
  warning: {
    vien: 'border-[var(--warning)]',
    nenIcon: 'bg-[var(--warning-soft)]',
    mauIcon: 'text-[var(--warning)]',
    iconMacDinh: AlertTriangle,
    nhanMacDinh: 'LƯU Ý HỌC VỤ',
  },
  danger: {
    vien: 'border-[var(--danger)]',
    nenIcon: 'bg-[var(--danger-soft)]',
    mauIcon: 'text-[var(--danger)]',
    iconMacDinh: AlertOctagon,
    nhanMacDinh: 'CẢNH BÁO QUAN TRỌNG',
  },
};

const ICON_PHAN_LOAI: Record<PhanLoaiThongBao, LucideIcon> = {
  CAN_XU_LY: AlertTriangle,
  LOP_HOC: Calendar,
  BAI_TAP: BookOpen,
  DIEM_SO: GraduationCap,
  DIEM_DANH: ClipboardCheck,
  HE_THONG: ShieldAlert,
};

export function dinhDangThoiGianThucTe(isoString?: string | null): string {
  if (!isoString) return '';
  const ngay = new Date(isoString);
  if (Number.isNaN(ngay.getTime())) return isoString;

  const chenhLechGiay = Math.floor((Date.now() - ngay.getTime()) / 1000);
  const ngayGioCuThe = ngay.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  if (chenhLechGiay < 0) {
    return ngayGioCuThe;
  }
  if (chenhLechGiay < 60) {
    return `Vừa xong · ${ngayGioCuThe}`;
  }
  const phut = Math.floor(chenhLechGiay / 60);
  if (phut < 60) {
    return `${phut} phút trước · ${ngayGioCuThe}`;
  }
  const gio = Math.floor(phut / 60);
  if (gio < 24) {
    return `${gio} giờ trước · ${ngayGioCuThe}`;
  }
  const soNgay = Math.floor(gio / 24);
  if (soNgay <= 7) {
    return `${soNgay} ngày trước · ${ngayGioCuThe}`;
  }
  return ngayGioCuThe;
}

/**
 * Phát thông báo gốc của hệ điều hành Windows / Desktop thông qua Web Notification API
 */
export function phatThongBaoManHinhWindows(thamSo: {
  id?: string;
  tieuDe: string;
  noiDung: string;
  duongDan?: string;
}): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (window.Notification.permission !== 'granted') {
    return false;
  }

  try {
    const thongBaoOs = new window.Notification(thamSo.tieuDe, {
      body: thamSo.noiDung,
      tag: thamSo.id ? `lms-tb-${thamSo.id}` : `lms-tb-${Date.now()}`,
      silent: false,
    });

    thongBaoOs.onclick = () => {
      try {
        window.focus();
        if (thamSo.duongDan) {
          window.location.href = thamSo.duongDan;
        }
        thongBaoOs.close();
      } catch {
        // Bỏ qua lỗi điều hướng
      }
    };

    return true;
  } catch {
    return false;
  }
}

/**
 * Thành phần <HopThongBao> (tương đương <x-notice :type>)
 * - Hộp thông báo viền 1px màu theo type (info/success/warning/danger)
 * - Bên trái có ô icon 36x36 nền soft
 * - Bên phải gồm eyebrow, tiêu đề, thời gian (11px muted), nội dung
 */
export function HopThongBao({
  loai = 'info',
  eyebrow,
  tieuDe,
  thoiGian,
  icon,
  children,
  className,
  hanhDong,
}: ThuocTinhHopThongBao) {
  const cauHinh = CAU_HINH_LOAI[loai] || CAU_HINH_LOAI.info;
  const BieuTuong = icon || cauHinh.iconMacDinh;

  return (
    <div
      role="region"
      aria-label={tieuDe}
      className={cn(
        'flex items-start gap-3.5 p-4 rounded-[var(--radius)] bg-[var(--surface)] border',
        cauHinh.vien,
        className,
      )}
    >
      {/* Ô icon 36x36 nền soft */}
      <div
        className={cn(
          'w-9 h-9 rounded-[var(--radius)] flex items-center justify-center shrink-0',
          cauHinh.nenIcon,
          cauHinh.mauIcon,
        )}
      >
        <BieuTuong strokeWidth={1.5} className="w-5 h-5" />
      </div>

      {/* Nội dung bên phải */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="eyebrow">{eyebrow || cauHinh.nhanMacDinh}</span>
          {thoiGian && (
            <time className="font-mono text-[11px] text-[var(--muted)] tabular-nums shrink-0">
              {thoiGian}
            </time>
          )}
        </div>

        <h4 className="font-mono text-sm font-bold text-[var(--text)] leading-snug">
          {tieuDe}
        </h4>

        <div className="text-sm text-[var(--muted)] leading-relaxed">{children}</div>

        {hanhDong && <div className="pt-2">{hanhDong}</div>}
      </div>
    </div>
  );
}

const KHOA_TAT_24H = 'lms_thong_bao_tat_24h_ts';
const KHOA_DA_DOC_CUC_BO = 'lms_thong_bao_da_doc_ids_v1';
const KHOA_DA_PHAT_WINDOWS = 'lms_thong_bao_da_phat_windows_v1';
const MOT_NGAY_MS = 24 * 60 * 60 * 1000;

function docDanhSachDaDocCucBo(): Set<string> {
  try {
    if (typeof window === 'undefined') return new Set();
    const raw = localStorage.getItem(KHOA_DA_DOC_CUC_BO);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

function luuDanhSachDaDocCucBo(tapId: Set<string>) {
  try {
    if (typeof window === 'undefined') return;
    const mangGioiHan = Array.from(tapId).slice(-200);
    localStorage.setItem(KHOA_DA_DOC_CUC_BO, JSON.stringify(mangGioiHan));
  } catch {
    // Bỏ qua lỗi ghi localStorage
  }
}

/**
 * Hook truy vấn và đồng bộ thông báo thực tế từ máy chủ (`/bang-dieu-khien/thong-bao`)
 * kiêm phát thông báo tự động trên Nền tảng + Windows OS khi có thông báo mới
 */
export function useThongBaoThucTe(kichHoat = true) {
  const queryClient = useQueryClient();
  const [tapDaDocCucBo, setTapDaDocCucBo] = useState<Set<string>>(() =>
    docDanhSachDaDocCucBo(),
  );
  const [dangGuiThu, setDangGuiThu] = useState(false);

  useEffect(() => {
    setTapDaDocCucBo(docDanhSachDaDocCucBo());
  }, []);

  const { data: tuyChonCaNhan } = useQuery<TuyChonCaNhan>({
    queryKey: ['tuy-chon-ca-nhan'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/ho-so/tuy-chon-ca-nhan');
      return (res.data?.duLieu || TUY_CHON_CA_NHAN_MAC_DINH) as TuyChonCaNhan;
    },
    enabled: kichHoat,
    staleTime: 60 * 1000,
  });

  const tuyChonThongBao = useMemo(
    () => ({
      ...TUY_CHON_CA_NHAN_MAC_DINH.thongBao,
      ...(tuyChonCaNhan?.thongBao || {}),
    }),
    [tuyChonCaNhan?.thongBao],
  );

  const { data, isLoading, isFetching, refetch } =
    useQuery<PhanHoiThongBaoBangDieuKhien>({
      queryKey: ['thong-bao-thuc-te'],
      queryFn: async () => {
        const res = await mayKhachApi.get('/bang-dieu-khien/thong-bao');
        return (res.data?.duLieu || res.data) as PhanHoiThongBaoBangDieuKhien;
      },
      enabled: kichHoat,
      staleTime: 20 * 1000,
      refetchInterval: 30 * 1000,
    });

  const danhSachThongBao = useMemo<MucThongBaoThucTe[]>(() => {
    const goc = data?.danhSachThongBao || [];
    return goc.map((tb) => ({
      ...tb,
      daDoc: tb.daDoc || tapDaDocCucBo.has(tb.id),
    }));
  }, [data?.danhSachThongBao, tapDaDocCucBo]);

  // Tự động phát thông báo Nền tảng (Toast) & màn hình Windows OS khi có thông báo mới chưa đọc xuất hiện
  useEffect(() => {
    if (typeof window === 'undefined' || !danhSachThongBao.length) return;

    try {
      const raw = localStorage.getItem(KHOA_DA_PHAT_WINDOWS);
      if (!raw) {
        // Lần đầu tiên khởi tạo phiên: ghi nhận các ID hiện tại để chỉ bắn các thông báo mới phát sinh sau đó
        const khoiTao = danhSachThongBao.map((tb) => tb.id).slice(0, 150);
        localStorage.setItem(KHOA_DA_PHAT_WINDOWS, JSON.stringify(khoiTao));
        return;
      }

      const daPhat = new Set<string>(JSON.parse(raw));
      const cacThongBaoMoi = danhSachThongBao.filter(
        (tb) => !tb.daDoc && !daPhat.has(tb.id),
      );

      if (cacThongBaoMoi.length === 0) return;

      for (const tb of cacThongBaoMoi) {
        daPhat.add(tb.id);
      }
      localStorage.setItem(
        KHOA_DA_PHAT_WINDOWS,
        JSON.stringify(Array.from(daPhat).slice(-200)),
      );

      for (const tb of cacThongBaoMoi.slice(0, 2)) {
        if (tuyChonThongBao.kenhNenTang !== false) {
          toast.info(tb.tieuDe, {
            description: tb.noiDung,
          });
        }
        if (tuyChonThongBao.kenhWindows !== false) {
          phatThongBaoManHinhWindows({
            id: tb.id,
            tieuDe: tb.tieuDe,
            noiDung: tb.noiDung,
            duongDan: tb.duongDan,
          });
        }
      }
    } catch {
      // Bỏ qua lỗi đọc/ghi localStorage
    }
  }, [danhSachThongBao, tuyChonThongBao.kenhNenTang, tuyChonThongBao.kenhWindows]);

  const tongSoChuaDoc = useMemo(
    () => danhSachThongBao.filter((tb) => !tb.daDoc).length,
    [danhSachThongBao],
  );

  const soCanXuLy = useMemo(
    () => danhSachThongBao.filter((tb) => tb.phanLoai === 'CAN_XU_LY').length,
    [danhSachThongBao],
  );

  const danhDauDaDoc = useCallback(
    async (idThongBao: string) => {
      setTapDaDocCucBo((prev) => {
        const tiep = new Set(prev);
        tiep.add(idThongBao);
        luuDanhSachDaDocCucBo(tiep);
        return tiep;
      });

      try {
        await mayKhachApi.patch(`/bang-dieu-khien/thong-bao/${idThongBao}/da-doc`);
        queryClient.invalidateQueries({ queryKey: ['thong-bao-thuc-te'] });
      } catch {
        // Đã lưu trạng thái cục bộ dự phòng
      }
    },
    [queryClient],
  );

  const danhDauDocTatCa = useCallback(async () => {
    setTapDaDocCucBo((prev) => {
      const tiep = new Set(prev);
      for (const tb of danhSachThongBao) {
        tiep.add(tb.id);
      }
      luuDanhSachDaDocCucBo(tiep);
      return tiep;
    });

    try {
      await mayKhachApi.post('/bang-dieu-khien/thong-bao/doc-tat-ca');
      await queryClient.invalidateQueries({ queryKey: ['thong-bao-thuc-te'] });
    } catch {
      // Đã lưu trạng thái cục bộ dự phòng
    }
  }, [danhSachThongBao, queryClient]);

  const guiThuThongBaoDaKenh = useCallback(async () => {
    setDangGuiThu(true);
    try {
      if (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        window.Notification.permission === 'default'
      ) {
        try {
          await window.Notification.requestPermission();
        } catch {
          // Bỏ qua nếu người dùng đóng hộp thoại quyền
        }
      }

      const res = await mayKhachApi.post('/bang-dieu-khien/thong-bao/gui-thu');
      const ketQua = (res.data?.duLieu || res.data) as KetQuaGuiThuThongBaoDaKenh;

      if (ketQua?.thongBaoMoi) {
        try {
          const raw = localStorage.getItem(KHOA_DA_PHAT_WINDOWS);
          const daPhat = raw ? new Set<string>(JSON.parse(raw)) : new Set<string>();
          daPhat.add(ketQua.thongBaoMoi.id);
          localStorage.setItem(
            KHOA_DA_PHAT_WINDOWS,
            JSON.stringify(Array.from(daPhat).slice(-200)),
          );
        } catch {
          // Bỏ qua
        }

        phatThongBaoManHinhWindows({
          id: ketQua.thongBaoMoi.id,
          tieuDe: ketQua.thongBaoMoi.tieuDe,
          noiDung: ketQua.thongBaoMoi.noiDung,
          duongDan: ketQua.thongBaoMoi.duongDan,
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['thong-bao-thuc-te'] });

      toast.success('Đã phát thông báo thử nghiệm đa kênh', {
        description:
          ketQua?.thongDiep ||
          'Đã đồng bộ thông báo trên Nền tảng LMS, màn hình Windows và kênh Gmail.',
      });
      return ketQua;
    } catch (loi: any) {
      const msg =
        loi?.response?.data?.thongDiep ||
        'Không thể gửi thông báo thử nghiệm đa kênh.';
      toast.error(msg);
      return null;
    } finally {
      setDangGuiThu(false);
    }
  }, [queryClient]);

  return {
    duLieu: data,
    hocKyHienTai: data?.hocKyHienTai || null,
    banTinToanTruong: data?.banTinToanTruong || null,
    danhSachThongBao,
    tongSoChuaDoc,
    soCanXuLy,
    tuyChonThongBao,
    dangTai: isLoading,
    dangLamMoi: isFetching,
    dangGuiThu,
    lamMoi: refetch,
    danhDauDaDoc,
    danhDauDocTatCa,
    guiThuThongBaoDaKenh,
  };
}

export interface ThuocTinhHopThoaiThongBaoHeThong {
  moChuDong?: boolean;
  onDongChuDong?: () => void;
  tuDongHienThi?: boolean;
}

type BoLocThongBao = 'TAT_CA' | 'CHUA_DOC' | 'CAN_XU_LY' | 'LOP_HOC';

/**
 * Hộp thoại Bản tin học vụ & Thông báo vận hành thực tế:
 * - Tự động đồng bộ dữ liệu thực từ `/bang-dieu-khien/thong-bao` (bài tập, buổi học, điểm danh, điểm số, bài đăng lớp, nhật ký hệ thống)
 * - Hỗ trợ 3 kênh thông báo: Nền tảng (In-App), Màn hình Windows (OS Notification) và Gmail (SMTP)
 * - Hỗ trợ lọc theo phân loại, đánh dấu đã đọc từng mục / đọc tất cả, điều hướng trực tiếp tới trang đích
 */
export function HopThoaiThongBaoHeThong({
  moChuDong,
  onDongChuDong,
  tuDongHienThi = false,
}: ThuocTinhHopThoaiThongBaoHeThong) {
  const router = useRouter();
  const [moTuDong, setMoTuDong] = useState(false);
  const [boLoc, setBoLoc] = useState<BoLocThongBao>('TAT_CA');
  const [quyenWindows, setQuyenWindows] = useState<
    NotificationPermission | 'khong_ho_tro'
  >('default');
  const { layGiaTri } = useCaiDatHeThong();

  const {
    duLieu,
    hocKyHienTai,
    banTinToanTruong,
    danhSachThongBao,
    tongSoChuaDoc,
    soCanXuLy,
    tuyChonThongBao,
    dangTai,
    dangLamMoi,
    dangGuiThu,
    lamMoi,
    danhDauDaDoc,
    danhDauDocTatCa,
    guiThuThongBaoDaKenh,
  } = useThongBaoThucTe(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setQuyenWindows('khong_ho_tro');
      return;
    }
    setQuyenWindows(window.Notification.permission);
  }, [moChuDong, moTuDong]);

  const xuLyCapQuyenWindows = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast.error('Trình duyệt hiện tại không hỗ trợ thông báo màn hình Windows.');
      return;
    }
    try {
      const ketQua = await window.Notification.requestPermission();
      setQuyenWindows(ketQua);
      if (ketQua === 'granted') {
        toast.success('Đã bật thông báo màn hình Windows OS.');
        phatThongBaoManHinhWindows({
          tieuDe: 'Đã kích hoạt Thông báo Windows OS',
          noiDung:
            'Khi có thông báo lớp học, bài tập mới hoặc kết quả chấm điểm, hộp thông báo Windows sẽ tự động hiển thị.',
          duongDan: '/bang-dieu-khien',
        });
      } else {
        toast.warning(
          'Quyền thông báo Windows đang bị từ chối. Vui lòng cấp quyền trên thanh địa chỉ trình duyệt.',
        );
      }
    } catch {
      toast.error('Không thể yêu cầu quyền thông báo Windows.');
    }
  };

  const batTuDongHeThong =
    layGiaTri('thong_bao.bat_hop_thoai_thong_bao_he_thong', 'true') !== 'false';

  useEffect(() => {
    if (!tuDongHienThi || !batTuDongHeThong || dangTai) return;
    if (tongSoChuaDoc === 0) return;

    try {
      // Tránh tự động chắn màn hình trong môi trường chạy kiểm thử tự động headless
      if (typeof navigator !== 'undefined' && navigator.webdriver) {
        return;
      }

      const mocThoiGianTat = localStorage.getItem(KHOA_TAT_24H);
      if (mocThoiGianTat) {
        const daQua = Date.now() - Number(mocThoiGianTat);
        if (!Number.isNaN(daQua) && daQua < MOT_NGAY_MS) {
          return;
        }
      }
      setMoTuDong(true);
    } catch {
      // Bỏ qua nếu trình duyệt chặn localStorage
    }
  }, [tuDongHienThi, batTuDongHeThong, dangTai, tongSoChuaDoc]);

  const dangMo = moChuDong !== undefined ? moChuDong : moTuDong;

  const dongModal = () => {
    setMoTuDong(false);
    onDongChuDong?.();
  };

  const xuLyTat24Gio = () => {
    try {
      localStorage.setItem(KHOA_TAT_24H, String(Date.now()));
      toast.info('Đã tạm tắt tự động mở hộp thoại thông báo trong 24 giờ.');
    } catch {
      // Bỏ qua lỗi ghi localStorage
    }
    dongModal();
  };

  const xuLyDaHieu = () => {
    dongModal();
  };

  const xuLyDocTatCa = async () => {
    await danhDauDocTatCa();
    toast.success('Đã đánh dấu đã đọc toàn bộ thông báo.');
  };

  const xuLyLamMoi = async () => {
    await lamMoi();
    toast.success('Đã đồng bộ dữ liệu thông báo mới nhất.');
  };

  const xuLyMoLienKet = async (tb: MucThongBaoThucTe) => {
    if (!tb.daDoc) {
      await danhDauDaDoc(tb.id);
    }
    if (tb.duongDan) {
      dongModal();
      router.push(tb.duongDan);
    }
  };

  const danhSachDaLoc = useMemo(() => {
    if (boLoc === 'CHUA_DOC') {
      return danhSachThongBao.filter((tb) => !tb.daDoc);
    }
    if (boLoc === 'CAN_XU_LY') {
      return danhSachThongBao.filter((tb) => tb.phanLoai === 'CAN_XU_LY');
    }
    if (boLoc === 'LOP_HOC') {
      return danhSachThongBao.filter(
        (tb) =>
          tb.phanLoai === 'LOP_HOC' ||
          tb.phanLoai === 'BAI_TAP' ||
          tb.phanLoai === 'DIEM_SO' ||
          tb.phanLoai === 'DIEM_DANH',
      );
    }
    return danhSachThongBao;
  }, [boLoc, danhSachThongBao]);

  const tieuDeBanTin =
    banTinToanTruong?.tieuDe ||
    layGiaTri('thong_bao.tieu_de_hop_thoai_he_thong', 'Thông báo vận hành học vụ trực tuyến');
  const noiDungBanTin =
    banTinToanTruong?.noiDung ||
    layGiaTri('thong_bao.thong_bao_chung_toan_truong') ||
    layGiaTri('thong_bao.noi_dung_hop_thoai_he_thong', '');
  const loaiCauHinh =
    banTinToanTruong?.loai || layGiaTri('thong_bao.loai_hop_thoai_he_thong', 'info');
  const loaiHopLe: LoaiThongBao =
    loaiCauHinh === 'info' ||
    loaiCauHinh === 'success' ||
    loaiCauHinh === 'warning' ||
    loaiCauHinh === 'danger'
      ? loaiCauHinh
      : 'info';

  const thoiGianCapNhatBanTin = banTinToanTruong?.thoiGianCapNhat
    ? dinhDangThoiGianThucTe(banTinToanTruong.thoiGianCapNhat)
    : duLieu?.thoiGianDongBo
      ? dinhDangThoiGianThucTe(duLieu.thoiGianDongBo)
      : '';

  return (
    <HopThoai
      mo={dangMo}
      onDong={dongModal}
      eyebrow="BẢN TIN HỌC VỤ & THÔNG BÁO ĐA KÊNH"
      tieuDe="Thông báo vận hành học kỳ & Lịch học tập"
      moTa="Đồng bộ trực tiếp trên Nền tảng LMS, màn hình Windows OS và hộp thư Gmail khi có thông báo mới, bài tập mới hoặc kết quả chấm điểm."
      kichThuoc="lon"
    >
      <div className="space-y-4">
        {/* 1. Thanh chỉ số học kỳ thực tế từ CSDL */}
        {hocKyHienTai && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 p-3 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)]">
            <div className="sm:col-span-1 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-[var(--border)] pb-2 sm:pb-0 sm:pr-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
                HỌC KỲ HIỆN TẠI
              </span>
              <span className="font-mono text-xs font-bold text-[var(--text)] truncate mt-0.5">
                {hocKyHienTai.tenHocKy}
              </span>
              <span className="font-mono text-[11px] text-[var(--muted)] tabular-nums">
                {new Date(hocKyHienTai.ngayBatDau).toLocaleDateString('vi-VN')} –{' '}
                {new Date(hocKyHienTai.ngayKetThuc).toLocaleDateString('vi-VN')}
              </span>
            </div>

            <div className="sm:col-span-3 grid grid-cols-3 gap-2">
              <div className="px-2.5 py-1.5 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] flex flex-col justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
                  LỚP HỌC PHẦN
                </span>
                <span className="font-mono text-lg font-bold text-[var(--accent)] tabular-nums text-right">
                  {hocKyHienTai.soLopThamGia}
                </span>
              </div>

              <div className="px-2.5 py-1.5 rounded-[var(--surface)] bg-[var(--surface)] border border-[var(--border)] flex flex-col justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
                  CA HỌC HÔM NAY
                </span>
                <span className="font-mono text-lg font-bold text-[var(--info)] tabular-nums text-right">
                  {hocKyHienTai.soBuoiHocHomNay}
                </span>
              </div>

              <div className="px-2.5 py-1.5 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] flex flex-col justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
                  VIỆC CẦN XỬ LÝ
                </span>
                <span
                  className={cn(
                    'font-mono text-lg font-bold tabular-nums text-right',
                    hocKyHienTai.soViecCanXuLy > 0
                      ? 'text-[var(--danger)]'
                      : 'text-[var(--accent)]',
                  )}
                >
                  {hocKyHienTai.soViecCanXuLy}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. Thanh trạng thái 3 Kênh nhận thông báo: Nền tảng · Windows · Gmail */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-3 py-2.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)] mr-1">
              KÊNH NHẬN:
            </span>

            {/* Kênh 1: Nền tảng */}
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius)] border font-mono text-[11px]',
                tuyChonThongBao.kenhNenTang !== false
                  ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)]'
                  : 'bg-[var(--surface)] border-[var(--border)] text-[var(--muted)]',
              )}
            >
              <Bell strokeWidth={1.5} className="w-3 h-3" />
              <span>Nền tảng: {tuyChonThongBao.kenhNenTang !== false ? 'Bật' : 'Tắt'}</span>
            </span>

            {/* Kênh 2: Windows OS */}
            {quyenWindows === 'granted' && tuyChonThongBao.kenhWindows !== false ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius)] border bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)] font-mono text-[11px]">
                <Monitor strokeWidth={1.5} className="w-3 h-3" />
                <span>Windows: Đang bật</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={xuLyCapQuyenWindows}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius)] border bg-[var(--surface)] hover:bg-[var(--active-bg)] border-[var(--border)] text-[var(--text)] font-mono text-[11px] transition-colors cursor-pointer"
                title="Cấp quyền hiển thị hộp thông báo gốc trên màn hình Windows"
              >
                <Monitor strokeWidth={1.5} className="w-3 h-3 text-[var(--info)]" />
                <span>
                  Windows: {quyenWindows === 'denied' ? 'Bị chặn (Cấp lại)' : 'Bật thông báo OS'}
                </span>
              </button>
            )}

            {/* Kênh 3: Gmail */}
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius)] border font-mono text-[11px]',
                tuyChonThongBao.kenhGmail !== false
                  ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)]'
                  : 'bg-[var(--surface)] border-[var(--border)] text-[var(--muted)]',
              )}
            >
              <Mail strokeWidth={1.5} className="w-3 h-3" />
              <span>Gmail: {tuyChonThongBao.kenhGmail !== false ? 'Bật' : 'Tắt'}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => void guiThuThongBaoDaKenh()}
              disabled={dangGuiThu}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius)] border border-[var(--accent)] bg-[var(--accent-soft)] hover:opacity-90 font-mono text-[11px] font-bold text-[var(--accent)] transition-opacity cursor-pointer disabled:opacity-50"
              title="Phát thử 1 thông báo tới Nền tảng, màn hình Windows và hộp thư Gmail của bạn"
            >
              <Send strokeWidth={1.5} className="w-3 h-3" />
              <span>{dangGuiThu ? 'Đang gửi...' : 'Gửi thử 3 kênh'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                dongModal();
                router.push('/ho-so');
              }}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--active-bg)] font-mono text-[11px] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
              title="Tùy chỉnh kênh nhận thông báo của tài khoản"
            >
              <Settings2 strokeWidth={1.5} className="w-3 h-3" />
              <span>Cấu hình</span>
            </button>
          </div>
        </div>

        {/* 3. Bản tin điều hành học kỳ từ CSDL */}
        {noiDungBanTin && (
          <HopThongBao
            loai={loaiHopLe}
            eyebrow="THÔNG BÁO ĐÀO TẠO TOÀN TRƯỜNG"
            tieuDe={tieuDeBanTin}
            thoiGian={thoiGianCapNhatBanTin}
          >
            {noiDungBanTin}
          </HopThongBao>
        )}

        {/* 4. Thanh bộ lọc phân đoạn & thao tác nhanh */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="inline-flex items-center p-1 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)]">
            <AnimatedBackground
              defaultValue={boLoc}
              onValueChange={(val) => {
                if (val) setBoLoc(val as BoLocThongBao);
              }}
              className="rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)]"
              transition={{ type: 'spring', bounce: 0.15, duration: 0.25 }}
            >
              {[
                { id: 'TAT_CA', nhan: `Tất cả (${danhSachThongBao.length})` },
                { id: 'CHUA_DOC', nhan: `Chưa đọc (${tongSoChuaDoc})` },
                { id: 'CAN_XU_LY', nhan: `Cần xử lý (${soCanXuLy})` },
                { id: 'LOP_HOC', nhan: 'Lớp học & Điểm' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  data-id={tab.id}
                  type="button"
                  className="px-2.5 py-1 font-mono text-xs text-[var(--muted)] data-[checked=true]:text-[var(--text)] data-[checked=true]:font-bold transition-colors cursor-pointer"
                >
                  {tab.nhan}
                </button>
              ))}
            </AnimatedBackground>
          </div>

          <div className="flex items-center gap-1.5">
            {tongSoChuaDoc > 0 && (
              <button
                type="button"
                onClick={xuLyDocTatCa}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--active-bg)] font-mono text-xs text-[var(--text)] transition-colors cursor-pointer"
              >
                <CheckCheck strokeWidth={1.5} className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Đọc tất cả</span>
              </button>
            )}
            <button
              type="button"
              onClick={xuLyLamMoi}
              disabled={dangLamMoi}
              title="Đồng bộ lại từ máy chủ"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--active-bg)] font-mono text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                strokeWidth={1.5}
                className={cn('w-3.5 h-3.5', dangLamMoi && 'animate-spin')}
              />
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* 4. Danh sách thông báo thực tế */}
        <div className="max-h-[340px] overflow-y-auto space-y-2.5 pr-1">
          {dangTai ? (
            <div className="space-y-2.5 py-2">
              {[1, 2, 3].map((muc) => (
                <div
                  key={muc}
                  className="p-3.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] space-y-2"
                >
                  <div className="h-3 w-40 bg-[var(--border)] rounded-[var(--radius)]" />
                  <div className="h-4 w-3/4 bg-[var(--border)] rounded-[var(--radius)]" />
                  <div className="h-3 w-full bg-[var(--border)] rounded-[var(--radius)]" />
                </div>
              ))}
            </div>
          ) : danhSachDaLoc.length === 0 ? (
            <div className="py-8 px-4 text-center rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--bg)] space-y-1.5">
              <Bell strokeWidth={1.5} className="w-6 h-6 text-[var(--muted)] mx-auto" />
              <p className="font-mono text-xs font-bold text-[var(--text)]">
                Không có thông báo nào trong phân mục này
              </p>
              <p className="text-xs text-[var(--muted)]">
                Mọi cập nhật mới về lịch học, bài tập, điểm danh và điểm số sẽ tự động hiển thị tại đây.
              </p>
            </div>
          ) : (
            danhSachDaLoc.map((tb) => {
              const cauHinh = CAU_HINH_LOAI[tb.loai] || CAU_HINH_LOAI.info;
              const BieuTuong = ICON_PHAN_LOAI[tb.phanLoai] || cauHinh.iconMacDinh;

              return (
                <div
                  key={tb.id}
                  className={cn(
                    'flex items-start gap-3 p-3.5 rounded-[var(--radius)] border transition-colors',
                    tb.daDoc
                      ? 'bg-[var(--bg)] border-[var(--border)] opacity-85'
                      : 'bg-[var(--surface)] border-[var(--border)]',
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-[var(--radius)] flex items-center justify-center shrink-0 mt-0.5',
                      cauHinh.nenIcon,
                      cauHinh.mauIcon,
                    )}
                  >
                    <BieuTuong strokeWidth={1.5} className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {!tb.daDoc && (
                          <span
                            title="Chưa đọc"
                            className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0"
                          />
                        )}
                        <span className="eyebrow truncate">{tb.eyebrow}</span>
                      </div>
                      <time className="font-mono text-[11px] text-[var(--muted)] tabular-nums shrink-0">
                        {dinhDangThoiGianThucTe(tb.thoiGian)}
                      </time>
                    </div>

                    <h5 className="font-mono text-xs sm:text-sm font-bold text-[var(--text)] leading-snug">
                      {tb.tieuDe}
                    </h5>

                    <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                      {tb.noiDung}
                    </p>

                    <div className="flex items-center justify-between gap-2 pt-1.5">
                      {tb.duongDan ? (
                        <button
                          type="button"
                          onClick={() => xuLyMoLienKet(tb)}
                          className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[var(--accent)] hover:underline cursor-pointer"
                        >
                          <span>{tb.nhanHanhDong || 'Mở trang liên quan'}</span>
                          <ArrowUpRight strokeWidth={1.5} className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span />
                      )}

                      {!tb.daDoc && (
                        <button
                          type="button"
                          onClick={() => danhDauDaDoc(tb.id)}
                          className="font-mono text-[11px] text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                        >
                          Đánh dấu đã đọc
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 5. Chân hộp thoại */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-[var(--border)]">
          <div className="font-mono text-[11px] text-[var(--muted)] tabular-nums">
            {duLieu?.thoiGianDongBo ? (
              <span>
                Đồng bộ lúc{' '}
                {new Date(duLieu.thoiGianDongBo).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false,
                })}
                {tongSoChuaDoc > 0 ? ` · ${tongSoChuaDoc} thông báo chưa đọc` : ' · Đã đọc hết'}
              </span>
            ) : (
              <span>Đang kết nối dữ liệu học vụ...</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <NutBam variant="secondary" type="button" onClick={xuLyTat24Gio}>
              Tắt trong 24h
            </NutBam>
            <NutBam variant="primary" type="button" onClick={xuLyDaHieu}>
              Đã hiểu
            </NutBam>
          </div>
        </div>
      </div>
    </HopThoai>
  );
}

