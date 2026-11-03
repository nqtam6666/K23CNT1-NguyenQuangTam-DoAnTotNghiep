'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  Bot,
  KeyRound,
  Plus,
  RefreshCw,
  Send,
  Settings,
  Video,
} from 'lucide-react';
import {
  PayloadJwt,
  PhanHoiBangDieuKhien,
  PhanHoiThongBaoBangDieuKhien,
  VaiTro,
  TheThongKe,
  ViecCanXuLy,
  HoatDongGanDay,
  BuoiHocHomNay,
  TomTatLopHocPhan,
  CanhBaoSinhVien,
  HangChoXuLyGiangVien,
  TienIchBangDieuKhien,
} from '@lms/chung';
import { mayKhachApi } from '../../../tien-ich/may-khach-api';
import { KhungXuongTongQuan, KhungXuong } from '../../../thanh-phan/khung-xuong';
import { HopThongBao } from '../../../thanh-phan/hop-thong-bao';
import { NutBam } from '../../../thanh-phan/nut-bam';
import { LoiTatTacVu } from '../../../thanh-phan/bang-dieu-khien/loi-tat-tac-vu';

// Tải Recharts bất đồng bộ để không làm nặng lần tải đầu
const BieuDoChuyenCan = dynamic(
  () => import('../../../thanh-phan/bang-dieu-khien/bieu-do-chuyen-can').then((m) => m.BieuDoChuyenCan),
  { ssr: false, loading: () => <KhungXuong className="h-[300px] w-full" /> },
);
const BieuDoVaiTro = dynamic(
  () => import('../../../thanh-phan/bang-dieu-khien/bieu-do-vai-tro').then((m) => m.BieuDoVaiTro),
  { ssr: false, loading: () => <KhungXuong className="h-[300px] w-full" /> },
);

interface ThongKeTroLy {
  soLuotCaNhanHomNay?: number;
  gioiHanCaNhanNgay?: number;
  conLaiHomNay?: number;
  tongLuotHomNay?: number;
  tongLuot7Ngay?: number;
  tongTokenHomNay?: number;
  chiPhiHomNayVnd?: number;
  doTreTrungBinhMs?: number;
}

/* ---------------------------- Tiện ích hiển thị ---------------------------- */

const dinhDangGio = (iso: string) =>
  new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });

const dinhDangNgay = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const NHAN_HANH_DONG: Record<string, string> = {
  DANG_NHAP_THANH_CONG: 'Đăng nhập',
  DANG_NHAP_THAT_BAI: 'Đăng nhập thất bại',
  DANG_XUAT: 'Đăng xuất',
  DANG_KY: 'Đăng ký tài khoản',
  CAP_NHAT_CAI_DAT_HE_THONG: 'Đổi cài đặt hệ thống',
  KHOI_PHUC_CAI_DAT: 'Khôi phục cài đặt',
  NHAP_EXCEL_GHI_DANH: 'Nhập danh sách ghi danh',
  TAO_BAI_TAP: 'Tạo bài tập',
  CHAM_DIEM: 'Chấm điểm bài nộp',
  DUYET_DON: 'Duyệt đơn xin nghỉ',
  DIEM_DANH: 'Điểm danh',
  TAO_BAO_LOI_DONG_GOP: 'Gửi báo lỗi',
  TAO_NGUOI_DUNG: 'Tạo người dùng',
  CAP_NHAT_NGUOI_DUNG: 'Cập nhật người dùng',
  KHOA_TAI_KHOAN: 'Khóa tài khoản',
  TAO_LOP_HOC_PHAN: 'Tạo lớp học phần',
};

const NHAN_THUC_THE: Record<string, string> = {
  CaiDatHeThong: 'Cài đặt hệ thống',
  BaoLoiDongGop: 'Báo lỗi và đóng góp',
  BaiTap: 'Bài tập',
  BaiNop: 'Bài nộp',
  GhiDanh: 'Ghi danh',
  NguoiDung: 'Người dùng',
  LopHocPhan: 'Lớp học phần',
  BuoiHoc: 'Buổi học',
  DonXinNghi: 'Đơn xin nghỉ',
  TaiLieu: 'Tài liệu',
  BanNhapAI: 'Bản nháp trợ lý',
};

/** Đổi mã kỹ thuật dạng HANH_DONG hoặc ThucThe thành chữ đọc được khi chưa có nhãn */
function docMa(ma: string, banDo: Record<string, string>) {
  if (banDo[ma]) return banDo[ma];
  const chu = ma.includes('_')
    ? ma.toLowerCase().replace(/_/g, ' ')
    : ma.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  return chu.charAt(0).toUpperCase() + chu.slice(1);
}

function loiChao(gio: number) {
  if (gio < 11) return 'Chào buổi sáng';
  if (gio < 13) return 'Chào buổi trưa';
  if (gio < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

function khoangThoiGian(phut: number) {
  if (phut < 60) return `${phut} phút`;
  const gio = Math.floor(phut / 60);
  const du = phut % 60;
  return du > 0 ? `${gio} giờ ${du} phút` : `${gio} giờ`;
}

type TinhTrangBuoi = 'sap' | 'dang' | 'xong' | 'huy';

function tinhTrangBuoi(b: BuoiHocHomNay, bayGio: number): TinhTrangBuoi {
  if (b.trangThai === 'DA_HUY') return 'huy';
  const bd = new Date(b.thoiGianBD).getTime();
  const kt = new Date(b.thoiGianKT).getTime();
  if (b.trangThai === 'DA_KET_THUC' || bayGio > kt) return 'xong';
  if (b.trangThai === 'DANG_DIEN_RA' || (bayGio >= bd && bayGio <= kt)) return 'dang';
  return 'sap';
}

const MAU_DAI_LOP = ['var(--accent)', 'var(--warn)', 'var(--info)', 'var(--muted)'];

function NhanTrangThai({
  loai,
  children,
}: {
  loai: 'ok' | 'warn' | 'bad' | 'muted' | 'accent';
  children: React.ReactNode;
}) {
  const lop = {
    ok: 'bg-[var(--ok-soft)] text-[var(--ok)]',
    warn: 'bg-[var(--warn-soft)] text-[var(--warn)]',
    bad: 'bg-[var(--danger-soft)] text-[var(--danger)]',
    muted: 'bg-[var(--active-bg)] text-[var(--muted)]',
    accent: 'bg-[var(--accent-soft)] text-[var(--accent)]',
  }[loai];
  return (
    <span
      className={`inline-flex items-center h-[22px] px-2 rounded-[4px] font-mono text-[11px] font-medium whitespace-nowrap ${lop}`}
    >
      {children}
    </span>
  );
}

function The({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-xs ${className}`}
    >
      {children}
    </section>
  );
}

function DauThe({
  tieuDe,
  phu,
  phai,
}: {
  tieuDe: React.ReactNode;
  phu?: React.ReactNode;
  phai?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-[var(--border)]">
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold text-[var(--text)]">{tieuDe}</h2>
        {phu && <p className="font-mono text-[11px] text-[var(--muted)]">{phu}</p>}
      </div>
      {phai}
    </div>
  );
}

function LienKetNho({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-xs font-semibold text-[var(--accent)] hover:underline whitespace-nowrap">
      {children}
    </Link>
  );
}

const lopNutChinh =
  'inline-flex items-center gap-1.5 h-[30px] px-2.5 rounded-[var(--radius)] bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-semibold hover:brightness-95 transition-colors whitespace-nowrap';
const lopNutPhu =
  'inline-flex items-center gap-1.5 h-[30px] px-2.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors whitespace-nowrap';
const lopNutLon =
  'inline-flex items-center gap-2 h-9 px-3.5 rounded-[var(--radius)] text-[13px] font-semibold transition-colors whitespace-nowrap';

function DongTrong({ children }: { children: React.ReactNode }) {
  return <p className="px-4 py-6 text-center text-[13px] text-[var(--muted)]">{children}</p>;
}

/* ------------------------------ Lịch hôm nay ------------------------------ */

function DongBuoiHoc({
  buoi,
  chiSo,
  bayGio,
  laGiangVien,
}: {
  buoi: BuoiHocHomNay;
  chiSo: number;
  bayGio: number;
  laGiangVien: boolean;
}) {
  const tinhTrang = tinhTrangBuoi(buoi, bayGio);
  const xong = tinhTrang === 'xong' || tinhTrang === 'huy';
  const conLaiPin =
    buoi.hanMaDiemDanh ? Math.max(0, Math.floor((new Date(buoi.hanMaDiemDanh).getTime() - bayGio) / 1000)) : 0;
  const phutToi = Math.max(0, Math.round((new Date(buoi.thoiGianBD).getTime() - bayGio) / 60000));

  let nhanPhai: React.ReactNode = null;
  if (tinhTrang === 'huy') nhanPhai = <NhanTrangThai loai="muted">Đã hủy</NhanTrangThai>;
  else if (tinhTrang === 'xong') {
    if (laGiangVien) {
      nhanPhai = (
        <NhanTrangThai loai="ok">
          Có mặt {buoi.soCoMat ?? 0}/{buoi.siSo ?? 0}
        </NhanTrangThai>
      );
    } else if (buoi.trangThaiDiemDanh === 'CO_MAT' || buoi.trangThaiDiemDanh === 'DI_MUON') {
      nhanPhai = (
        <NhanTrangThai loai="ok">{buoi.trangThaiDiemDanh === 'DI_MUON' ? 'Đi muộn' : 'Có mặt'}</NhanTrangThai>
      );
    } else if (buoi.trangThaiDiemDanh === 'VANG_CO_PHEP') {
      nhanPhai = <NhanTrangThai loai="muted">Vắng có phép</NhanTrangThai>;
    } else if (buoi.trangThaiDiemDanh === 'VANG_KHONG_PHEP') {
      nhanPhai = <NhanTrangThai loai="bad">Vắng</NhanTrangThai>;
    } else {
      nhanPhai = <NhanTrangThai loai="muted">Đã kết thúc</NhanTrangThai>;
    }
  } else if (tinhTrang === 'sap') {
    nhanPhai = <NhanTrangThai loai="muted">Sau {khoangThoiGian(phutToi)}</NhanTrangThai>;
  } else {
    nhanPhai = (
      <div className="flex items-center gap-1.5">
        {laGiangVien ? (
          <Link href={`/lop-hoc-phan/${buoi.idLopHocPhan}`} className={lopNutPhu}>
            Danh sách
          </Link>
        ) : (
          !buoi.trangThaiDiemDanh && (
            <Link href={`/lop-hoc-phan/${buoi.idLopHocPhan}`} className={lopNutPhu}>
              <KeyRound className="w-3.5 h-3.5" strokeWidth={1.5} />
              Điểm danh
            </Link>
          )
        )}
        <Link href={`/lop-hoc-phan/${buoi.idLopHocPhan}/phong-hoc`} className={lopNutChinh}>
          <Video className="w-3.5 h-3.5" strokeWidth={1.5} />
          {laGiangVien ? 'Mở phòng' : 'Vào phòng'}
        </Link>
      </div>
    );
  }

  const dongPhu = laGiangVien
    ? [buoi.maLopHocPhan, buoi.chuDe, tinhTrang === 'dang' ? `Có mặt ${buoi.soCoMat ?? 0}/${buoi.siSo ?? 0}` : null]
    : [buoi.maLopHocPhan, buoi.chuDe, buoi.tenGiangVien];

  return (
    <div
      className={`grid grid-cols-[4px_56px_minmax(0,1fr)_auto] gap-3 items-center px-4 py-3 border-b border-[var(--border)] last:border-b-0 ${
        tinhTrang === 'dang' ? 'bg-[var(--accent-soft)]' : ''
      }`}
    >
      <span
        className="self-stretch rounded-[2px]"
        style={{ backgroundColor: MAU_DAI_LOP[chiSo % MAU_DAI_LOP.length] }}
      />
      <div className={`font-mono text-xs leading-[1.35] tabular-nums ${xong ? 'text-[var(--muted)]' : ''}`}>
        {dinhDangGio(buoi.thoiGianBD)}
        <span className="block text-[var(--muted)]">{dinhDangGio(buoi.thoiGianKT)}</span>
      </div>
      <div className="min-w-0">
        {tinhTrang === 'dang' && (
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--accent)]">
            Đang diễn ra
          </p>
        )}
        <p className={`text-[13px] font-semibold leading-[1.35] truncate ${xong ? 'text-[var(--muted)]' : ''}`}>
          {buoi.tenLopHocPhan}
        </p>
        <p className="font-mono text-[11px] text-[var(--muted)] truncate">
          {dongPhu.filter(Boolean).join(' · ')}
        </p>
        {laGiangVien && tinhTrang === 'dang' && buoi.maDiemDanh && (
          <div className="mt-2 inline-flex items-center gap-2.5 px-2.5 py-1.5 border border-dashed border-[var(--accent)] rounded-[var(--radius)] bg-[var(--surface)]">
            <span className="font-mono text-[11px] text-[var(--muted)]">Mã điểm danh</span>
            <b className="font-mono text-lg tracking-[0.18em] text-[var(--accent)]">
              {buoi.maDiemDanh.replace(/(\d{3})(\d{3})/, '$1 $2')}
            </b>
            <span className="font-mono text-[11px] text-[var(--muted)] tabular-nums">
              còn {String(Math.floor(conLaiPin / 60)).padStart(2, '0')}:{String(conLaiPin % 60).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>
      {nhanPhai}
    </div>
  );
}

function KhoiLichHomNay({
  danhSach,
  bayGio,
  laGiangVien,
}: {
  danhSach: BuoiHocHomNay[];
  bayGio: number;
  laGiangVien: boolean;
}) {
  return (
    <The>
      <DauThe
        tieuDe={laGiangVien ? 'Lịch dạy hôm nay' : 'Lịch học hôm nay'}
        phu={danhSach.length > 0 ? `${danhSach.length} buổi` : undefined}
        phai={<LienKetNho href="/thoi-khoa-bieu">Thời khóa biểu</LienKetNho>}
      />
      {danhSach.length === 0 ? (
        <DongTrong>{laGiangVien ? 'Hôm nay không có lịch dạy.' : 'Hôm nay không có buổi học.'}</DongTrong>
      ) : (
        danhSach.map((b, i) => (
          <DongBuoiHoc key={b.id} buoi={b} chiSo={i} bayGio={bayGio} laGiangVien={laGiangVien} />
        ))
      )}
    </The>
  );
}

/* ------------------------------- Trợ lý ------------------------------- */

function KhoiTroLy({ thongKe, laGiangVien }: { thongKe?: ThongKeTroLy; laGiangVien: boolean }) {
  const router = useRouter();
  const [cauHoi, setCauHoi] = useState('');
  const goiY = laGiangVien
    ? ['Sinh câu hỏi luyện tập theo chương và mức độ khó', 'Gợi ý nhận xét cho bài nộp mới', 'Soạn nội dung ôn tập giữa kỳ']
    : ['Ôn lại các câu sai trong bài kiểm tra gần nhất', 'Tóm tắt slide buổi học gần nhất'];

  return (
    <The className="p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[15px] font-semibold flex items-center gap-2">
          <Bot className="w-4 h-4 text-[var(--accent)]" strokeWidth={1.5} />
          {laGiangVien ? 'Trợ lý giảng dạy' : 'Trợ lý học tập'}
        </h2>
        {thongKe && (
          <NhanTrangThai loai="accent">
            {thongKe.soLuotCaNhanHomNay ?? 0}/{thongKe.gioiHanCaNhanNgay ?? 0} lượt
          </NhanTrangThai>
        )}
      </div>
      <p className="mt-2 text-[13px] text-[var(--muted)]">
        {laGiangVien
          ? 'Nội dung trợ lý tạo ra được lưu thành bản nháp, giảng viên duyệt trước khi giao cho lớp.'
          : 'Hỏi theo tài liệu của lớp, có trích dẫn nguồn.'}
      </p>
      {!laGiangVien && (
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(cauHoi.trim() ? `/tro-ly-ai?cauHoi=${encodeURIComponent(cauHoi.trim())}` : '/tro-ly-ai');
          }}
        >
          <input
            value={cauHoi}
            onChange={(e) => setCauHoi(e.target.value)}
            placeholder="Hỏi về bài học"
            className="flex-1 min-w-0 h-9 px-3 border border-[var(--border)] rounded-[var(--radius)] bg-[var(--bg)] text-[13px] outline-none focus:border-[var(--accent)] transition-colors"
          />
          <button
            type="submit"
            aria-label="Gửi câu hỏi"
            className="w-9 h-9 grid place-items-center rounded-[var(--radius)] bg-[var(--accent)] text-[var(--accent-foreground)] hover:brightness-95 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </form>
      )}
      <div className="mt-3 flex flex-col gap-1.5">
        {goiY.map((g) => (
          <Link
            key={g}
            href="/tro-ly-ai"
            className="flex items-center justify-between gap-2 px-2.5 py-2 border border-[var(--border)] rounded-[var(--radius)] bg-[var(--bg)] text-xs hover:border-[var(--accent)] transition-colors"
          >
            <span className="truncate">{g}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" strokeWidth={1.5} />
          </Link>
        ))}
      </div>
    </The>
  );
}

/* ------------------------------ Trang chính ------------------------------ */

export default function TrangBangDieuKhien() {
  const queryClient = useQueryClient();
  const [bayGio, setBayGio] = useState<number | null>(null);

  // Khôi phục nhanh dữ liệu từ bộ nhớ trình duyệt sau khi hydrate
  useEffect(() => {
    try {
      const rawHoSo = sessionStorage.getItem('lms_cache_ho_so') || localStorage.getItem('lms_cache_ho_so');
      if (rawHoSo && !queryClient.getQueryData(['ho-so-hien-tai'])) {
        queryClient.setQueryData(['ho-so-hien-tai'], JSON.parse(rawHoSo) as PayloadJwt, { updatedAt: 0 });
      }
      const rawBangDieuKhien = sessionStorage.getItem('lms_cache_bang_dieu_khien');
      if (rawBangDieuKhien && !queryClient.getQueryData(['du-lieu-bang-dieu-khien'])) {
        queryClient.setQueryData(
          ['du-lieu-bang-dieu-khien'],
          JSON.parse(rawBangDieuKhien) as PhanHoiBangDieuKhien,
          { updatedAt: 0 },
        );
      }
    } catch {
      // Bỏ qua lỗi đọc bộ nhớ trình duyệt
    }
  }, [queryClient]);

  const { data: nguoiDung, isLoading: dangTaiHoSo } = useQuery<PayloadJwt>({
    queryKey: ['ho-so-hien-tai'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/xac-thuc/ho-so-hien-tai');
      const duLieu = res.data?.duLieu || res.data;
      try {
        const chuoi = JSON.stringify(duLieu);
        sessionStorage.setItem('lms_cache_ho_so', chuoi);
        localStorage.setItem('lms_cache_ho_so', chuoi);
      } catch {
        // Bỏ qua
      }
      return duLieu;
    },
    staleTime: 15 * 1000,
  });

  const {
    data: phanHoi,
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
    staleTime: 30 * 1000,
  });

  const { data: thongBao } = useQuery<PhanHoiThongBaoBangDieuKhien>({
    queryKey: ['thong-bao-thuc-te'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/bang-dieu-khien/thong-bao');
      return (res.data?.duLieu || res.data) as PhanHoiThongBaoBangDieuKhien;
    },
    enabled: Boolean(nguoiDung),
    staleTime: 20 * 1000,
  });

  const { data: thongKeTroLy } = useQuery<ThongKeTroLy>({
    queryKey: ['thong-ke-su-dung-ai'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/tro-ly-ai/thong-ke-su-dung');
      return res.data?.duLieu || res.data;
    },
    enabled: Boolean(nguoiDung && nguoiDung.vaiTro !== VaiTro.PHU_HUYNH),
    staleTime: 15 * 1000,
  });

  const tienIch = useMemo(() => phanHoi?.tienIch || [], [phanHoi]);
  const tim = <T,>(id: string): T | undefined =>
    tienIch.find((t: TienIchBangDieuKhien) => t.id === id && t.trangThai === 'THANH_CONG')?.duLieu as T | undefined;

  const lichHomNay = tim<BuoiHocHomNay[]>('lich-hom-nay') || [];
  const coPinDangChay = lichHomNay.some((b) => b.maDiemDanh);

  // Đồng hồ hiển thị: cập nhật mỗi giây khi có mã điểm danh đang chạy, nếu không thì mỗi 30 giây
  useEffect(() => {
    setBayGio(Date.now());
    const id = window.setInterval(() => setBayGio(Date.now()), coPinDangChay ? 1000 : 30000);
    return () => window.clearInterval(id);
  }, [coPinDangChay]);

  if ((dangTaiHoSo || dangTaiTienIch) && !phanHoi) return <KhungXuongTongQuan />;

  if (isError && !phanHoi) {
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
                Thử lại
              </NutBam>
            }
          >
            Không tổng hợp được số liệu từ máy chủ. Kiểm tra kết nối mạng rồi thử lại.
          </HopThongBao>
        </div>
      </div>
    );
  }

  const vaiTro = nguoiDung?.vaiTro;
  const laSinhVien = vaiTro === VaiTro.HOC_SINH;
  const laGiangVien = vaiTro === VaiTro.GIAO_VIEN;
  const laQuanTri =
    vaiTro === VaiTro.QUAN_TRI_VIEN || vaiTro === VaiTro.BAN_GIAM_HIEU || vaiTro === VaiTro.GIAO_VU;
  const thoiDiem = bayGio ?? 0;
  const homNay = bayGio ? new Date(bayGio) : null;
  const hocKy = thongBao?.hocKyHienTai;

  const dongNgay = homNay
    ? [
        homNay.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }),
        hocKy
          ? hocKy.tenHocKy.includes(hocKy.tenNamHoc)
            ? hocKy.tenHocKy
            : `${hocKy.tenHocKy}, ${hocKy.tenNamHoc}`
          : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : '';

  const viecCanXuLy =
    (tienIch.find((t) => t.loai === 'VIEC_CAN_XU_LY')?.duLieu as ViecCanXuLy[] | undefined) || [];
  const theThongKe = tienIch
    .filter((t) => t.loai === 'THE_THONG_KE' && t.duLieu)
    .map((t) => t.duLieu as TheThongKe);

  /* ------------------------------ Đầu trang ------------------------------ */
  const DauTrang = (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-[22px] leading-[1.3] tracking-[-0.02em] font-semibold">
          {laQuanTri
            ? 'Tổng quan hệ thống'
            : `${homNay ? loiChao(homNay.getHours()) : 'Xin chào'}, ${nguoiDung?.hoTen ?? ''}`}
        </h1>
        <p className="mt-1 text-[13px] text-[var(--muted)] first-letter:uppercase">{dongNgay}</p>
      </div>
      <div className="flex gap-2">
        {laSinhVien && (
          <Link
            href={
              lichHomNay.find((b) => tinhTrangBuoi(b, thoiDiem) === 'dang')
                ? `/lop-hoc-phan/${lichHomNay.find((b) => tinhTrangBuoi(b, thoiDiem) === 'dang')!.idLopHocPhan}`
                : '/lop-hoc-phan'
            }
            className={`${lopNutLon} bg-[var(--accent)] text-[var(--accent-foreground)] hover:brightness-95`}
          >
            <KeyRound className="w-4 h-4" strokeWidth={1.5} />
            Nhập mã điểm danh
          </Link>
        )}
        {laGiangVien && (
          <>
            <Link
              href="/tro-ly-ai"
              className={`${lopNutLon} border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:text-[var(--accent)]`}
            >
              <Bot className="w-4 h-4" strokeWidth={1.5} />
              Biên soạn từ tài liệu
            </Link>
            <Link
              href="/lop-hoc-phan"
              className={`${lopNutLon} bg-[var(--accent)] text-[var(--accent-foreground)] hover:brightness-95`}
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              Giao bài tập
            </Link>
          </>
        )}
        {laQuanTri && (
          <>
            {vaiTro === VaiTro.QUAN_TRI_VIEN && (
              <Link
                href="/cai-dat"
                className={`${lopNutLon} border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:text-[var(--accent)]`}
              >
                <Settings className="w-4 h-4" strokeWidth={1.5} />
                Cài đặt hệ thống
              </Link>
            )}
            {(vaiTro === VaiTro.QUAN_TRI_VIEN || vaiTro === VaiTro.GIAO_VU) && (
              <Link
                href="/nguoi-dung"
                className={`${lopNutLon} bg-[var(--accent)] text-[var(--accent-foreground)] hover:brightness-95`}
              >
                <Plus className="w-4 h-4" strokeWidth={1.5} />
                Thêm người dùng
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );

  /* ------------------------------ Sinh viên ------------------------------ */
  if (laSinhVien) {
    const lop = tim<TomTatLopHocPhan[]>('tom-tat-lop') || [];
    const chuyenCan = tim<TheThongKe>('the-chuyen-can-cua-toi');
    const tyLe = Number(String(chuyenCan?.giaTri ?? '0').replace('%', '')) || 0;
    const tongCoMat = lop.reduce((t, l) => t + (l.soBuoiCoMat ?? 0), 0);
    const tongBuoi = lop.reduce((t, l) => t + (l.soBuoiDaDiemDanh ?? 0), 0);
    const thongBaoLop = (thongBao?.danhSachThongBao || [])
      .filter((tb) => ['LOP_HOC', 'BAI_TAP', 'DIEM_SO'].includes(tb.phanLoai))
      .slice(0, 3);
    const viecNopBai = viecCanXuLy.filter((v) => v.loai === 'NOP_BAI');

    return (
      <div>
        {DauTrang}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] gap-5 items-start">
          <div className="flex flex-col gap-5">
            <KhoiLichHomNay danhSach={lichHomNay} bayGio={thoiDiem} laGiangVien={false} />

            <The>
              <DauThe
                tieuDe="Việc cần làm"
                phu="Sắp xếp theo hạn"
                phai={viecNopBai.length > 0 && <NhanTrangThai loai="warn">{viecNopBai.length} việc</NhanTrangThai>}
              />
              {viecCanXuLy.map((v) => {
                const conNgay = v.thoiHan
                  ? Math.ceil((new Date(v.thoiHan).getTime() - thoiDiem) / 86400000)
                  : null;
                return (
                  <div
                    key={v.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--border)] last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold truncate">{v.tieuDe}</p>
                      <p className="font-mono text-[11px] text-[var(--muted)] truncate">
                        {v.thoiHan
                          ? `${v.moTa} · Hạn ${dinhDangGio(v.thoiHan)} ${dinhDangNgay(v.thoiHan)}`
                          : v.moTa}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {conNgay !== null && (
                        <NhanTrangThai loai={conNgay <= 2 ? 'warn' : 'muted'}>
                          {conNgay <= 0 ? 'Hôm nay' : `Còn ${conNgay} ngày`}
                        </NhanTrangThai>
                      )}
                      <Link href={v.duongDan} className={lopNutPhu}>
                        {v.loai === 'NOP_BAI' ? 'Nộp bài' : 'Xem'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </The>

            <The>
              <DauThe tieuDe="Lớp học phần của tôi" phai={<LienKetNho href="/lop-hoc-phan">Tất cả lớp</LienKetNho>} />
              {lop.length === 0 ? (
                <DongTrong>Bạn chưa ghi danh lớp học phần nào.</DongTrong>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-[13px]">
                    <thead>
                      <tr>
                        <th className="text-left px-4 py-2.5">Mã lớp</th>
                        <th className="text-left px-4 py-2.5">Học phần</th>
                        <th className="text-left px-4 py-2.5">Giảng viên</th>
                        <th className="text-right px-4 py-2.5">Chuyên cần</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lop.map((l) => {
                        const vang = (l.soBuoiDaDiemDanh ?? 0) - (l.soBuoiCoMat ?? 0);
                        return (
                          <tr key={l.id}>
                            <td className="px-4 py-2.5 font-mono text-[var(--accent)] whitespace-nowrap">
                              <Link href={`/lop-hoc-phan/${l.id}`} className="hover:underline">
                                {l.maLopHocPhan}
                              </Link>
                            </td>
                            <td className="px-4 py-2.5">{l.tenLopHocPhan}</td>
                            <td className="px-4 py-2.5 whitespace-nowrap">{l.tenGiangVien ?? 'Chưa phân công'}</td>
                            <td
                              className={`px-4 py-2.5 text-right font-mono tabular-nums ${vang >= 2 ? 'text-[var(--warn)]' : ''}`}
                            >
                              {l.soBuoiDaDiemDanh ? `${l.soBuoiCoMat}/${l.soBuoiDaDiemDanh}` : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </The>
          </div>

          <div className="flex flex-col gap-5">
            <The>
              <DauThe tieuDe="Học kỳ này" />
              <div className="px-4 py-3.5 border-b border-[var(--border)] flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[13px] text-[var(--muted)]">Chuyên cần</span>
                  <span className="font-mono text-xl font-bold tabular-nums">
                    {tyLe}%{' '}
                    <small className="text-xs font-medium text-[var(--muted)]">
                      {tongCoMat}/{tongBuoi} buổi
                    </small>
                  </span>
                </div>
                <div className="h-1.5 rounded-[3px] bg-[var(--active-bg)] overflow-hidden">
                  <i className="block h-full bg-[var(--accent)] rounded-[3px]" style={{ width: `${tyLe}%` }} />
                </div>
              </div>
              <div className="px-4 py-3.5 flex items-baseline justify-between gap-2">
                <span className="text-[13px] text-[var(--muted)]">Bài tập sắp đến hạn</span>
                <span className="font-mono text-xl font-bold tabular-nums">
                  {viecNopBai.length} <small className="text-xs font-medium text-[var(--muted)]">trong 7 ngày</small>
                </span>
              </div>
            </The>

            <KhoiTroLy thongKe={thongKeTroLy} laGiangVien={false} />

            {thongBaoLop.length > 0 && (
              <The>
                <DauThe tieuDe="Thông báo lớp" />
                {thongBaoLop.map((tb) => (
                  <Link
                    key={tb.id}
                    href={tb.duongDan || '/lop-hoc-phan'}
                    className="block px-4 py-3 border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--active-bg)] transition-colors"
                  >
                    <p className="text-[13px] font-semibold truncate">{tb.tieuDe}</p>
                    <p className="font-mono text-[11px] text-[var(--muted)] truncate">{tb.eyebrow}</p>
                  </Link>
                ))}
              </The>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------ Giảng viên ------------------------------ */
  if (laGiangVien) {
    return <BangGiangVien dauTrang={DauTrang} tim={tim} lichHomNay={lichHomNay} bayGio={thoiDiem} thongKeTroLy={thongKeTroLy} />;
  }

  /* ---------------------------- Quản trị / Giáo vụ ---------------------------- */
  if (laQuanTri) {
    const thuTuThe = ['the-tong-nguoi-dung', 'the-lop-hoc-phan-dang-mo', 'the-lop-chua-phan-cong', 'the-xung-dot-thoi-khoa-bieu'];
    const theChon = [
      ...thuTuThe.map((id) => theThongKe.find((t) => t.id === id)).filter(Boolean),
      ...theThongKe.filter((t) => !thuTuThe.includes(t.id)),
    ].slice(0, 4) as TheThongKe[];
    const bieuDoChuyenCan = tienIch.find((t) => t.id === 'bieu-do-chuyen-can-7-ngay');
    const bieuDoVaiTro = tienIch.find((t) => t.id === 'bieu-do-phan-bo-vai-tro');
    const hoatDong =
      (tienIch.find((t) => t.loai === 'HOAT_DONG_GAN_DAY')?.duLieu as HoatDongGanDay[] | undefined) || [];

    return (
      <div>
        {DauTrang}

        {theChon.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
            {theChon.map((t) => {
              const canhBao = t.id === 'the-lop-chua-phan-cong' && Number(t.giaTri) > 0;
              const tot = t.id === 'the-xung-dot-thoi-khoa-bieu' && Number(t.giaTri) === 0;
              return (
                <The key={t.id} className="p-4">
                  <p className="text-[13px] text-[var(--muted)]">{t.tieuDe}</p>
                  <p
                    className={`mt-1.5 font-mono text-2xl font-bold leading-[1.1] tabular-nums ${canhBao ? 'text-[var(--warn)]' : ''}`}
                  >
                    {typeof t.giaTri === 'number' ? t.giaTri.toLocaleString('vi-VN') : t.giaTri}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between gap-2 text-xs text-[var(--muted)]">
                    {tot ? (
                      <NhanTrangThai loai="ok">Không có xung đột</NhanTrangThai>
                    ) : (
                      <span className="truncate">{t.moTa}</span>
                    )}
                    {t.duongDanChiTiet && <LienKetNho href={t.duongDanChiTiet}>Xem</LienKetNho>}
                  </div>
                </The>
              );
            })}
          </div>
        )}

        {(bieuDoChuyenCan || bieuDoVaiTro) && (
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] gap-5 mb-5 items-start">
            {bieuDoChuyenCan && (
              <BieuDoChuyenCan tieuDe={bieuDoChuyenCan.tieuDe} duLieu={bieuDoChuyenCan.duLieu || []} />
            )}
            {bieuDoVaiTro && <BieuDoVaiTro tieuDe={bieuDoVaiTro.tieuDe} duLieu={bieuDoVaiTro.duLieu || []} />}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] gap-5 items-start">
          <The>
            <DauThe tieuDe="Hoạt động gần đây" />
            {hoatDong.length === 0 ? (
              <DongTrong>Chưa có hoạt động nào được ghi nhận.</DongTrong>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      <th className="text-left px-4 py-2.5">Thời gian</th>
                      <th className="text-left px-4 py-2.5">Người thực hiện</th>
                      <th className="text-left px-4 py-2.5">Hành động</th>
                      <th className="text-left px-4 py-2.5">Đối tượng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hoatDong.slice(0, 8).map((h) => (
                      <tr key={h.id}>
                        <td className="px-4 py-2.5 font-mono text-[var(--muted)] whitespace-nowrap tabular-nums">
                          {dinhDangGio(h.thoiGian)} {dinhDangNgay(h.thoiGian)}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">{h.tenNguoiThucHien}</td>
                        <td className="px-4 py-2.5 whitespace-nowrap">{docMa(h.hanhDong, NHAN_HANH_DONG)}</td>
                        <td className="px-4 py-2.5 max-w-[260px] truncate" title={h.thucThe}>
                          {docMa(h.thucThe, NHAN_THUC_THE)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </The>

          <div className="flex flex-col gap-5">
            {thongKeTroLy && (
              <The>
                <DauThe
                  tieuDe={
                    <span className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-[var(--accent)]" strokeWidth={1.5} />
                      Trợ lý học tập hôm nay
                    </span>
                  }
                  phai={<LienKetNho href="/tro-ly-ai">Chi tiết</LienKetNho>}
                />
                {[
                  ['Lượt hỏi', (thongKeTroLy.tongLuotHomNay ?? 0).toLocaleString('vi-VN'), `7 ngày: ${(thongKeTroLy.tongLuot7Ngay ?? 0).toLocaleString('vi-VN')} lượt`],
                  ['Token xử lý', (thongKeTroLy.tongTokenHomNay ?? 0).toLocaleString('vi-VN'), `Chi phí ước tính ${(thongKeTroLy.chiPhiHomNayVnd ?? 0).toLocaleString('vi-VN')} ₫`],
                  ['Độ trễ trung bình', `${(thongKeTroLy.doTreTrungBinhMs ?? 0).toLocaleString('vi-VN')} ms`, null],
                ].map(([nhan, giaTri, ghiChu]) => (
                  <div key={nhan as string} className="px-4 py-3 border-b border-[var(--border)] last:border-b-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[13px] text-[var(--muted)]">{nhan}</span>
                      <span className="font-mono text-xl font-bold tabular-nums">{giaTri}</span>
                    </div>
                    {ghiChu && <p className="text-xs text-[var(--muted)]">{ghiChu}</p>}
                  </div>
                ))}
              </The>
            )}

            {viecCanXuLy.length > 0 && (
              <The>
                <DauThe tieuDe="Việc cần xử lý" />
                {viecCanXuLy.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--border)] last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold">{v.tieuDe}</p>
                      <p className="text-xs text-[var(--muted)] truncate">{v.moTa}</p>
                    </div>
                    <Link href={v.duongDan} className={lopNutPhu}>
                      Xử lý
                    </Link>
                  </div>
                ))}
              </The>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------ Phụ huynh và vai trò khác ------------------------------ */
  return (
    <div>
      {DauTrang}
      {theThongKe.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {theThongKe.map((t) => (
            <The key={t.id} className="p-4">
              <p className="text-[13px] text-[var(--muted)]">{t.tieuDe}</p>
              <p className="mt-1.5 font-mono text-2xl font-bold tabular-nums">{t.giaTri}</p>
              {t.moTa && <p className="mt-1 text-xs text-[var(--muted)]">{t.moTa}</p>}
            </The>
          ))}
        </div>
      )}
      {viecCanXuLy.length > 0 && (
        <The className="mb-5">
          <DauThe tieuDe="Việc cần xử lý" />
          {viecCanXuLy.map((v) => (
            <div key={v.id} className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--border)] last:border-b-0">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold">{v.tieuDe}</p>
                <p className="text-xs text-[var(--muted)] truncate">{v.moTa}</p>
              </div>
              <Link href={v.duongDan} className={lopNutPhu}>
                Xem
              </Link>
            </div>
          ))}
        </The>
      )}
      <LoiTatTacVu vaiTro={vaiTro} />
    </div>
  );
}

/* ------------------------------ Bảng của giảng viên ------------------------------ */

type TabHangCho = 'chamBai' | 'donXinNghi' | 'banNhap';

function BangGiangVien({
  dauTrang,
  tim,
  lichHomNay,
  bayGio,
  thongKeTroLy,
}: {
  dauTrang: React.ReactNode;
  tim: <T>(id: string) => T | undefined;
  lichHomNay: BuoiHocHomNay[];
  bayGio: number;
  thongKeTroLy?: ThongKeTroLy;
}) {
  const [tab, setTab] = useState<TabHangCho>('chamBai');
  const hangCho = tim<HangChoXuLyGiangVien>('hang-cho-xu-ly') || { chamBai: [], donXinNghi: [], banNhap: [] };
  const lop = tim<TomTatLopHocPhan[]>('tom-tat-lop') || [];
  const canhBao = tim<CanhBaoSinhVien[]>('canh-bao-som') || [];
  const soChoCham = hangCho.chamBai.reduce((t, m) => t + m.soChoCham, 0);
  const tongViec = soChoCham + hangCho.donXinNghi.length + hangCho.banNhap.length;

  const cacTab: { ma: TabHangCho; nhan: string; so: number }[] = [
    { ma: 'chamBai', nhan: 'Chấm bài', so: soChoCham },
    { ma: 'donXinNghi', nhan: 'Đơn xin nghỉ', so: hangCho.donXinNghi.length },
    { ma: 'banNhap', nhan: 'Bản nháp trợ lý', so: hangCho.banNhap.length },
  ];

  const NHAN_LOAI_BAN_NHAP: Record<string, string> = {
    CAU_HOI: 'Câu hỏi',
    NHAN_XET: 'Nhận xét',
    BAI_TAP: 'Bài tập',
    TOM_TAT: 'Giáo án',
  };
  const NHAN_MUC_DO: Record<CanhBaoSinhVien['mucDo'], { nhan: string; loai: 'bad' | 'warn' | 'muted' }> = {
    CAO: { nhan: 'Cao', loai: 'bad' },
    VUA: { nhan: 'Vừa', loai: 'warn' },
    THAP: { nhan: 'Thấp', loai: 'muted' },
  };

  const dongHangCho = (khoa: string, tieuDe: string, phu: string, phai: React.ReactNode) => (
    <div
      key={khoa}
      className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--border)] last:border-b-0"
    >
      <div className="min-w-0">
        <p className="text-[13px] font-semibold truncate">{tieuDe}</p>
        <p className="font-mono text-[11px] text-[var(--muted)] truncate">{phu}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">{phai}</div>
    </div>
  );

  return (
    <div>
      {dauTrang}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] gap-5 items-start">
        <div className="flex flex-col gap-5">
          <KhoiLichHomNay danhSach={lichHomNay} bayGio={bayGio} laGiangVien />

          <The>
            <DauThe tieuDe="Hàng chờ xử lý" phu={`${tongViec} việc`} />
            <div role="tablist" className="flex gap-0.5 px-3 border-b border-[var(--border)] overflow-x-auto">
              {cacTab.map((t) => (
                <button
                  key={t.ma}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.ma}
                  onClick={() => setTab(t.ma)}
                  className={`h-[42px] px-2.5 -mb-px flex items-center gap-2 text-[13px] font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                    tab === t.ma
                      ? 'text-[var(--text)] border-[var(--accent)]'
                      : 'text-[var(--muted)] border-transparent hover:text-[var(--text)]'
                  }`}
                >
                  {t.nhan}
                  <span
                    className={`font-mono text-[11px] px-1.5 rounded-[4px] ${
                      tab === t.ma ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'bg-[var(--active-bg)] text-[var(--muted)]'
                    }`}
                  >
                    {t.so}
                  </span>
                </button>
              ))}
            </div>
            <div role="tabpanel">
              {tab === 'chamBai' &&
                (hangCho.chamBai.length === 0 ? (
                  <DongTrong>Không còn bài nộp chờ chấm.</DongTrong>
                ) : (
                  hangCho.chamBai.map((m) =>
                    dongHangCho(
                      m.idBaiTap,
                      m.tieuDe,
                      `${m.maLopHocPhan} · Hạn ${dinhDangNgay(m.hanNop)}`,
                      <>
                        <NhanTrangThai loai="warn">{m.soChoCham} chờ chấm</NhanTrangThai>
                        <Link href={`/lop-hoc-phan/${m.idLopHocPhan}`} className={lopNutPhu}>
                          Chấm bài
                        </Link>
                      </>,
                    ),
                  )
                ))}
              {tab === 'donXinNghi' &&
                (hangCho.donXinNghi.length === 0 ? (
                  <DongTrong>Không có đơn xin nghỉ chờ duyệt.</DongTrong>
                ) : (
                  hangCho.donXinNghi.map((d) =>
                    dongHangCho(
                      d.id,
                      `${d.hoTen} · ${d.lyDo}`,
                      `${d.maLopHocPhan} · Buổi ${dinhDangNgay(d.ngayBuoiHoc)}`,
                      <Link href={`/lop-hoc-phan/${d.idLopHocPhan}`} className={lopNutPhu}>
                        Xử lý
                      </Link>,
                    ),
                  )
                ))}
              {tab === 'banNhap' &&
                (hangCho.banNhap.length === 0 ? (
                  <DongTrong>Không có bản nháp chờ duyệt.</DongTrong>
                ) : (
                  hangCho.banNhap.map((b) =>
                    dongHangCho(
                      b.id,
                      b.tieuDe,
                      `${NHAN_LOAI_BAN_NHAP[b.loaiBanNhap] ?? b.loaiBanNhap} · ${b.maLopHocPhan}`,
                      <Link href="/tro-ly-ai" className={lopNutPhu}>
                        Xem và duyệt
                      </Link>,
                    ),
                  )
                ))}
            </div>
          </The>

          <The>
            <DauThe tieuDe="Lớp đang giảng dạy" phai={<LienKetNho href="/lop-hoc-phan">Tất cả lớp</LienKetNho>} />
            {lop.length === 0 ? (
              <DongTrong>Chưa được phân công lớp học phần nào.</DongTrong>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      <th className="text-left px-4 py-2.5">Mã lớp</th>
                      <th className="text-left px-4 py-2.5">Học phần</th>
                      <th className="text-right px-4 py-2.5">Sĩ số</th>
                      <th className="text-right px-4 py-2.5">Chuyên cần</th>
                      <th className="text-right px-4 py-2.5">Đã nộp bài</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lop.map((l) => (
                      <tr key={l.id}>
                        <td className="px-4 py-2.5 font-mono text-[var(--accent)] whitespace-nowrap">
                          <Link href={`/lop-hoc-phan/${l.id}`} className="hover:underline">
                            {l.maLopHocPhan}
                          </Link>
                        </td>
                        <td className="px-4 py-2.5">{l.tenLopHocPhan}</td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums">{l.siSo}</td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                          {l.tyLeChuyenCan == null ? '—' : `${l.tyLeChuyenCan}%`}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                          {l.tyLeNopBai == null ? '—' : `${l.tyLeNopBai}%`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </The>
        </div>

        <div className="flex flex-col gap-5">
          <The>
            <DauThe
              tieuDe="Sinh viên cần chú ý"
              phu={`Cảnh báo sớm · ${lop.length} lớp`}
              phai={canhBao.length > 0 && <NhanTrangThai loai="bad">{canhBao.length}</NhanTrangThai>}
            />
            {canhBao.length === 0 ? (
              <DongTrong>Chưa có sinh viên nào cần chú ý.</DongTrong>
            ) : (
              canhBao.map((c) => (
                <Link
                  key={`${c.idHocSinh}-${c.idLopHocPhan}`}
                  href={`/lop-hoc-phan/${c.idLopHocPhan}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--active-bg)] transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold truncate">{c.hoTen}</p>
                    <p className="font-mono text-[11px] text-[var(--muted)] truncate">
                      {c.maLopHocPhan} · {c.lyDo}
                    </p>
                  </div>
                  <NhanTrangThai loai={NHAN_MUC_DO[c.mucDo].loai}>{NHAN_MUC_DO[c.mucDo].nhan}</NhanTrangThai>
                </Link>
              ))
            )}
          </The>

          <KhoiTroLy thongKe={thongKeTroLy} laGiangVien />
        </div>
      </div>
    </div>
  );
}
