'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings,
  Save,
  RefreshCw,
  Building2,
  GraduationCap,
  ClipboardCheck,
  Video,
  FileText,
  Bot,
  Bell,
  Shield,
  Mail,
  Search,
  RotateCcw,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Zap,
  AlertTriangle,
  Plus,
  Trash2,
  Lock,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronRight,
  Minus,
  Palette,
  Check,
} from 'lucide-react';
import {
  CaiDatHeThong,
  DANH_MUC_CAI_DAT_HE_THONG,
  BAN_DO_DINH_NGHIA_CAI_DAT,
  ANH_XA_KHOA_CU_SANG_MOI,
  ANH_XA_KHOA_MOI_SANG_CU,
  DinhNghiaKhoaCaiDat,
  MaNhomCaiDat,
  MAT_NA_KHOA_BI_MAT,
  taoNhanTamTuKhoa,
  DANH_SACH_MAU_CHU_DAO_CHUAN,
  kiemTraMauChuDaoHopLe,
} from '@lms/chung';
import { mayKhachApi } from '../../../tien-ich/may-khach-api';
import { thongBao } from '../../../tien-ich/thong-bao';
import { apDungCauHinhGiaoDienVaoDom } from '../../../tien-ich/use-cai-dat';
import { KhungXuong } from '../../../thanh-phan/khung-xuong';
import { HopThoai } from '../../../thanh-phan/hop-thoai';
import { HopThongBao, LoaiThongBao } from '../../../thanh-phan/hop-thong-bao';
import { CongTac } from '../../../thanh-phan/cong-tac';
import { ThanhPhanTaiLenAnhCaiDat } from './thanh-phan-tai-len-anh';
import { ColorPicker } from '@/components/ui/color-picker';

interface ThongTinNhomCaiDat {
  ma: MaNhomCaiDat;
  ten: string;
  eyebrow: string;
  moTa: string;
  bieuTuong: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const DANH_SACH_NHOM: ThongTinNhomCaiDat[] = [
  {
    ma: 'chung',
    ten: 'Thông tin trường & Thương hiệu',
    eyebrow: 'NHÓM 01 · TRƯỜNG HỌC & THƯƠNG HIỆU',
    moTa: 'Định danh trường học, biểu trưng giao diện, cổng thông tin liên hệ và thông tin đồ án.',
    bieuTuong: Building2,
  },
  {
    ma: 'giao_dien',
    ten: 'Giao diện & Hiển thị',
    eyebrow: 'NHÓM 02 · MÀU CHỦ ĐẠO, SÁNG/TỐI & BỐ CỤC',
    moTa: 'Màu nhấn chủ đạo toàn hệ thống, chế độ Sáng/Tối mặc định, kiểu bôi đen văn bản, cỡ chữ, mật độ bảng và độ bo góc.',
    bieuTuong: Palette,
  },
  {
    ma: 'hoc_vu',
    ten: 'Học vụ & Thang điểm',
    eyebrow: 'NHÓM 03 · HỌC VỤ & SỔ ĐIỂM',
    moTa: 'Quy chế điểm đạt tối thiểu, làm tròn chữ số thập phân, sĩ số lớp và mẫu cột điểm.',
    bieuTuong: GraduationCap,
  },
  {
    ma: 'diem_danh',
    ten: 'Điểm danh & Chuyên cần',
    eyebrow: 'NHÓM 04 · ĐIỂM DANH & CHUYÊN CẦN',
    moTa: 'Ngưỡng phút tính đi muộn, thời hạn mã PIN, cảnh báo cấm thi và mức trừ điểm chuyên cần.',
    bieuTuong: ClipboardCheck,
  },
  {
    ma: 'phong_hoc',
    ten: 'Phòng học trực tuyến',
    eyebrow: 'NHÓM 05 · PHÒNG HỌC TRỰC TUYẾN',
    moTa: 'Trạng thái Micro, Camera mặc định khi vào phòng, thời hạn phiên và quyền chia sẻ màn hình.',
    bieuTuong: Video,
  },
  {
    ma: 'bai_tap',
    ten: 'Bài tập & Tài liệu',
    eyebrow: 'NHÓM 06 · BÀI TẬP & TÀI LIỆU',
    moTa: 'Giới hạn dung lượng tệp nộp bài, tài liệu bài giảng, đuôi tệp cho phép và quy tắc nộp muộn.',
    bieuTuong: FileText,
  },
  {
    ma: 'tro_ly_ai',
    ten: 'Trợ lý AI học thuật',
    eyebrow: 'NHÓM 07 · TRỢ LÝ AI HỌC THUẬT',
    moTa: 'Nhà cung cấp mô hình ngôn ngữ, khóa kết nối API, chỉ dẫn sư phạm và hạn mức theo vai trò.',
    bieuTuong: Bot,
  },
  {
    ma: 'thong_bao',
    ten: 'Thông báo & Bản tin',
    eyebrow: 'NHÓM 08 · THÔNG BÁO & BẢN TIN',
    moTa: 'Thông báo ghim trên bảng điều khiển và hộp thoại bản tin học vụ định kỳ.',
    bieuTuong: Bell,
  },
  {
    ma: 'bao_mat',
    ten: 'Bảo mật & Đăng nhập',
    eyebrow: 'NHÓM 09 · BẢO MẬT & VẬN HÀNH',
    moTa: 'Cổng tự đăng ký, thời lượng phiên, khóa tạm khi sai mật khẩu và giới hạn theo IP phòng máy.',
    bieuTuong: Shield,
  },
  {
    ma: 'email',
    ten: 'Máy chủ gửi thư (SMTP)',
    eyebrow: 'NHÓM 10 · MÁY CHỦ GỬI THƯ',
    moTa: 'Cấu hình kết nối máy chủ gửi thư điện tử thông báo học vụ và kiểm tra đường truyền.',
    bieuTuong: Mail,
  },
  {
    ma: 'khac',
    ten: 'Cấu hình khác',
    eyebrow: 'NHÓM DỰ PHÒNG · CẤU HÌNH KHÁC',
    moTa: 'Các thông số mở rộng phát sinh trong cơ sở dữ liệu chưa thuộc 10 phân hệ chính.',
    bieuTuong: SlidersHorizontal,
  },
];

const KHOA_LUU_TRANG_THAI_NHOM_CON = 'lms_cai_dat_nhom_con_dong';
const KHOA_LUU_NHOM_DANG_CHON = 'lms_cai_dat_nhom_dang_chon';
const TAP_MA_NHOM_HOP_LE = new Set<string>(DANH_SACH_NHOM.map((n) => n.ma));

interface MauCotDiemItem {
  tenCotDiem: string;
  heSo: number;
}

function boDauTiengViet(chuoi: string): string {
  return chuoi
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

function doiGiaySangChuoiThoiGian(raw: string): string {
  const s = parseInt(raw, 10);
  if (Number.isNaN(s) || s < 60) return 'Tối thiểu 60 giây';
  const ngay = Math.floor(s / 86400);
  const gio = Math.floor((s % 86400) / 3600);
  const phut = Math.floor((s % 3600) / 60);
  const giayLe = s % 60;
  const phan: string[] = [];
  if (ngay > 0) phan.push(`${ngay} ngày`);
  if (gio > 0) phan.push(`${gio} giờ`);
  if (phut > 0) phan.push(`${phut} phút`);
  if (giayLe > 0) phan.push(`${giayLe} giây`);
  return phan.join(' ') || `${s} giây`;
}

function dinhDangGiaTriMacDinhHienThi(dinhNghia: DinhNghiaKhoaCaiDat): string {
  if (dinhNghia.biMat || dinhNghia.kieu === 'password') return 'Bảo mật';
  if (dinhNghia.kieu === 'boolean') {
    return dinhNghia.macDinh === 'true' ? 'Bật' : 'Tắt';
  }
  if (dinhNghia.kieu === 'color') {
    const mau = DANH_SACH_MAU_CHU_DAO_CHUAN.find(
      (m) => m.maHex.toUpperCase() === dinhNghia.macDinh.toUpperCase(),
    );
    return mau ? `${mau.ten} (${mau.maHex})` : dinhNghia.macDinh;
  }
  const danhSachTuyChon = dinhNghia.tuyChonSelect || dinhNghia.luaChon;
  if (dinhNghia.kieu === 'select' && danhSachTuyChon) {
    const khop = danhSachTuyChon.find((tc) => tc.giaTri === dinhNghia.macDinh);
    return khop ? khop.nhan : dinhNghia.macDinh;
  }
  if (dinhNghia.kieu === 'file-anh') {
    return dinhNghia.macDinh ? dinhNghia.macDinh : 'Trống';
  }
  if (dinhNghia.kieu === 'json') {
    return '4 cột chuẩn';
  }
  if (dinhNghia.kieu === 'textarea') {
    return dinhNghia.macDinh.length > 36
      ? `${dinhNghia.macDinh.slice(0, 36)}...`
      : dinhNghia.macDinh;
  }
  if (!dinhNghia.macDinh) return 'Trống';
  return dinhNghia.donVi ? `${dinhNghia.macDinh} ${dinhNghia.donVi}` : dinhNghia.macDinh;
}

function kiemTraHopLeTruong(dinhNghia: DinhNghiaKhoaCaiDat, giaTri: string): string | null {
  const chuoi = (giaTri ?? '').trim();

  if (dinhNghia.kieu === 'color') {
    const kqMau = kiemTraMauChuDaoHopLe(chuoi);
    if (!kqMau.hopLe) {
      return kqMau.thongDiep || 'Mã màu HEX không hợp lệ.';
    }
    return null;
  }

  if (dinhNghia.kieu === 'number') {
    if (chuoi === '') {
      return 'Vui lòng nhập giá trị số.';
    }
    const so = Number(chuoi);
    if (Number.isNaN(so)) {
      return 'Giá trị phải là số hợp lệ.';
    }
    if (dinhNghia.min !== undefined && so < dinhNghia.min) {
      return `Tối thiểu là ${dinhNghia.min}${dinhNghia.donVi ? ` ${dinhNghia.donVi}` : ''}.`;
    }
    if (dinhNghia.max !== undefined && so > dinhNghia.max) {
      return `Tối đa là ${dinhNghia.max}${dinhNghia.donVi ? ` ${dinhNghia.donVi}` : ''}.`;
    }
  }

  if (
    (dinhNghia.khoa === 'chung.email_lien_he' || dinhNghia.khoa === 'email.email_nguoi_gui') &&
    chuoi.length > 0
  ) {
    const bieuThucEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!bieuThucEmail.test(chuoi)) {
      return 'Địa chỉ email không đúng định dạng.';
    }
  }

  if (dinhNghia.khoa === 'chung.ten_he_thong' && chuoi.length === 0) {
    return 'Tên hệ thống không được để trống.';
  }

  if (dinhNghia.khoa === 'chung.ten_truong' && chuoi.length === 0) {
    return 'Tên trường không được để trống.';
  }

  return null;
}

const TAP_DUOI_TEP_THUC_THI_BI_CHAN = new Set([
  'exe',
  'bat',
  'cmd',
  'sh',
  'msi',
  'com',
  'scr',
  'vbs',
  'ps1',
  'jar',
]);

function laKhoaDanhSachDuoiTep(khoa: string): boolean {
  return (
    khoa === 'bai_tap.dinh_dang_tep_cho_phep' ||
    khoa.includes('duoi_tep_cho_phep') ||
    khoa.includes('dinh_dang_tep_cho_phep')
  );
}

function tachDanhSachDuoiTep(chuoi: string): string[] {
  if (!chuoi) return [];
  const ketQua: string[] = [];
  const daCo = new Set<string>();
  for (const phan of chuoi.split(/[,;\s]+/)) {
    const chuan = phan.trim().toLowerCase().replace(/^\.+/, '');
    if (chuan && !daCo.has(chuan)) {
      daCo.add(chuan);
      ketQua.push(chuan);
    }
  }
  return ketQua;
}

/**
 * Hiển thị mô tả tối đa 2 dòng và chỉ hiện nút "Xem thêm" khi văn bản thực sự bị cắt (scrollHeight > clientHeight)
 */
function MoTaCaiDatCoThuGon({
  moTa,
  dangMoRong,
  onDoiMoRong,
}: {
  moTa: string;
  dangMoRong: boolean;
  onDoiMoRong: () => void;
}) {
  const doanVanRef = useRef<HTMLParagraphElement>(null);
  const [biCatThucSu, setBiCatThucSu] = useState(false);

  useEffect(() => {
    const el = doanVanRef.current;
    if (!el) return;

    const doKichThuoc = () => {
      if (!doanVanRef.current || dangMoRong) return;
      const biTran = doanVanRef.current.scrollHeight - doanVanRef.current.clientHeight > 2;
      setBiCatThucSu(biTran);
    };

    doKichThuoc();

    if (typeof ResizeObserver !== 'undefined') {
      const boQuanSat = new ResizeObserver(() => doKichThuoc());
      boQuanSat.observe(el);
      return () => boQuanSat.disconnect();
    }
    return undefined;
  }, [moTa, dangMoRong]);

  return (
    <div className="text-xs text-[var(--muted)] leading-relaxed">
      <p ref={doanVanRef} className={dangMoRong ? '' : 'line-clamp-2'}>
        {moTa}
      </p>
      {(biCatThucSu || dangMoRong) && (
        <button
          type="button"
          onClick={onDoiMoRong}
          className="text-xs font-semibold text-[var(--accent)] hover:underline mt-0.5 cursor-pointer"
        >
          {dangMoRong ? 'Thu gọn' : 'Xem thêm'}
        </button>
      )}
    </div>
  );
}

/**
 * Ô nhập danh sách đuôi tệp dạng thẻ (Chip / Tag Input):
 * - Mỗi đuôi tệp là một thẻ có nút xóa
 * - Gõ rồi ấn Enter (hoặc dấu phẩy) để thêm
 * - Tự động chuẩn hóa chữ thường, bỏ dấu chấm đầu, kiểm tra hợp lệ và báo trùng
 */
function BoNhapTheDuoiTep({
  khoa,
  giaTri,
  loiTruong,
  onChange,
}: {
  khoa: string;
  giaTri: string;
  loiTruong?: string;
  onChange: (giaTriMoi: string) => void;
}) {
  const [giaTriGo, setGiaTriGo] = useState('');
  const [phanHoiNoiBo, setPhanHoiNoiBo] = useState<{
    loai: 'canh_bao' | 'loi';
    thongDiep: string;
  } | null>(null);
  const [duoiBiTrung, setDuoiBiTrung] = useState<string | null>(null);
  const oNhapRef = useRef<HTMLInputElement>(null);

  const danhSachDuoi = useMemo(() => tachDanhSachDuoiTep(giaTri), [giaTri]);

  const xuLyThemDuoi = (chuoiTho: string) => {
    const cacPhan = chuoiTho
      .split(/[,;\s]+/)
      .map((s) => s.trim().toLowerCase().replace(/^\.+/, ''))
      .filter(Boolean);

    if (cacPhan.length === 0) return;

    const danhSachMoi = [...danhSachDuoi];
    const tapHienTai = new Set(danhSachDuoi);
    let coThayDoi = false;

    for (const duoi of cacPhan) {
      if (!/^[a-z0-9]{1,12}$/.test(duoi)) {
        setPhanHoiNoiBo({
          loai: 'loi',
          thongDiep: `Đuôi tệp "${duoi}" không hợp lệ (chỉ gồm chữ cái thường a–z và chữ số 0–9, tối đa 12 ký tự).`,
        });
        return;
      }

      if (TAP_DUOI_TEP_THUC_THI_BI_CHAN.has(duoi)) {
        setPhanHoiNoiBo({
          loai: 'loi',
          thongDiep: `Đuôi tệp thực thi ".${duoi}" bị chặn vì lý do an toàn hệ thống.`,
        });
        return;
      }

      if (tapHienTai.has(duoi)) {
        setDuoiBiTrung(duoi);
        setPhanHoiNoiBo({
          loai: 'canh_bao',
          thongDiep: `Đuôi tệp ".${duoi}" đã tồn tại trong danh sách.`,
        });
        window.setTimeout(() => {
          setDuoiBiTrung((hienTai) => (hienTai === duoi ? null : hienTai));
        }, 2200);
        setGiaTriGo('');
        return;
      }

      tapHienTai.add(duoi);
      danhSachMoi.push(duoi);
      coThayDoi = true;
    }

    if (coThayDoi) {
      setPhanHoiNoiBo(null);
      setDuoiBiTrung(null);
      onChange(danhSachMoi.join(','));
      setGiaTriGo('');
    }
  };

  const xuLyXoaDuoi = (duoiCanXoa: string) => {
    const conLai = danhSachDuoi.filter((d) => d !== duoiCanXoa);
    setPhanHoiNoiBo(null);
    onChange(conLai.join(','));
  };

  return (
    <div className="w-full space-y-1.5">
      <div
        onClick={() => oNhapRef.current?.focus()}
        className={`w-full p-2 rounded-[var(--radius)] border bg-[var(--bg)] flex flex-wrap items-center gap-1.5 transition-colors cursor-text ${
          loiTruong
            ? 'border-[var(--danger)]'
            : 'border-[var(--border)] focus-within:border-[var(--accent)]'
        }`}
      >
        {danhSachDuoi.map((duoi) => {
          const dangNhayTrung = duoiBiTrung === duoi;
          return (
            <span
              key={duoi}
              className={`inline-flex items-center gap-1 pl-2 pr-1 py-0.5 text-xs font-mono rounded-[var(--radius)] border transition-colors ${
                dangNhayTrung
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)] font-bold ring-1 ring-[var(--accent)]'
                  : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border)]'
              }`}
            >
              <span>.{duoi}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  xuLyXoaDuoi(duoi);
                }}
                aria-label={`Xóa đuôi tệp .${duoi}`}
                title={`Xóa .${duoi}`}
                className="p-0.5 text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] rounded-[var(--radius)] transition-colors cursor-pointer"
              >
                <X className="w-3 h-3 stroke-[1.5]" />
              </button>
            </span>
          );
        })}

        <div className="inline-flex items-center gap-1.5 flex-1 min-w-[180px]">
          <input
            ref={oNhapRef}
            type="text"
            data-input-khoa={khoa}
            value={giaTriGo}
            onChange={(e) => {
              const val = e.target.value;
              if (phanHoiNoiBo) setPhanHoiNoiBo(null);
              if (val.endsWith(',') || val.endsWith(';')) {
                xuLyThemDuoi(val.slice(0, -1));
              } else {
                setGiaTriGo(val);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (giaTriGo.trim()) {
                  xuLyThemDuoi(giaTriGo);
                }
              } else if (e.key === 'Backspace' && !giaTriGo && danhSachDuoi.length > 0) {
                e.preventDefault();
                xuLyXoaDuoi(danhSachDuoi[danhSachDuoi.length - 1]);
              }
            }}
            placeholder="Nhập đuôi tệp rồi ấn Enter (vd: pdf, py)..."
            aria-label="Thêm đuôi tệp cho phép"
            className="flex-1 min-w-[140px] px-1.5 py-0.5 text-xs font-mono bg-transparent text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none"
          />

          {giaTriGo.trim().length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                xuLyThemDuoi(giaTriGo);
              }}
              className="px-2 py-0.5 text-xs font-semibold text-[var(--accent)] bg-[var(--accent-soft)] border border-[var(--accent)] rounded-[var(--radius)] hover:opacity-90 transition-opacity cursor-pointer shrink-0"
            >
              + Thêm
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-mono text-[var(--muted)] tabular-nums">
          Đang cho phép {danhSachDuoi.length} định dạng · Tự động chuẩn hóa chữ thường và bỏ dấu chấm đầu
        </span>

        {(loiTruong || phanHoiNoiBo) && (
          <span
            className={`font-medium ${
              loiTruong || phanHoiNoiBo?.loai === 'loi'
                ? 'text-[var(--danger)]'
                : 'text-[var(--warning)]'
            }`}
          >
            {loiTruong || phanHoiNoiBo?.thongDiep}
          </span>
        )}
      </div>
    </div>
  );
}

export default function TrangCaiDatHeThong() {
  const queryClient = useQueryClient();
  const oTimKiemRef = useRef<HTMLInputElement>(null);

  const [nhomHienTai, setNhomHienTai] = useState<MaNhomCaiDat>('chung');
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState<string>('');
  const [giaTriGoc, setGiaTriGoc] = useState<Record<string, string>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  // Trạng thái thu gọn / mở rộng nhóm con (lưu localStorage)
  const [nhomConBiDong, setNhomConBiDong] = useState<Record<string, boolean>>({});
  // Trạng thái mở rộng mô tả dài (> 2 dòng thực tế)
  const [moRongMoTa, setMoRongMoTa] = useState<Record<string, boolean>>({});
  // Trạng thái mở rộng giá trị mặc định dài
  const [moRongMacDinh, setMoRongMacDinh] = useState<Record<string, boolean>>({});

  // Trạng thái mở ô nhập mới cho các trường mật khẩu / khóa bí mật
  const [dangNhapKhoaBiMatMoi, setDangNhapKhoaBiMatMoi] = useState<Record<string, boolean>>({});
  const [hienThiKhoaBiMat, setHienThiKhoaBiMat] = useState<Record<string, boolean>>({});
  // Khóa chống trình duyệt tự động điền (autofill) tài khoản/mật khẩu đã lưu vào SMTP
  const [daMoKhoaNhap, setDaMoKhoaNhap] = useState<Record<string, boolean>>({});

  // Lỗi từ máy chủ gắn với khóa cụ thể
  const [loiTuMayChuTheoKhoa, setLoiTuMayChuTheoKhoa] = useState<Record<string, string>>({});

  // Trạng thái kiểm tra kết nối AI & SMTP
  const [dangKiemTraAi, setDangKiemTraAi] = useState(false);
  const [ketQuaKiemTraAi, setKetQuaKiemTraAi] = useState<{
    thanhCong: boolean;
    thongDiep: string;
    doTreMs?: number;
  } | null>(null);

  const [dangKiemTraSmtp, setDangKiemTraSmtp] = useState(false);
  const [ketQuaKiemTraSmtp, setKetQuaKiemTraSmtp] = useState<{
    thanhCong: boolean;
    thongDiep: string;
    doTreMs?: number;
  } | null>(null);

  // Các hộp thoại xác nhận
  const [moHopThoaiXacNhanNguyHiem, setMoHopThoaiXacNhanNguyHiem] = useState(false);
  const [nhomCanKhoiPhuc, setNhomCanKhoiPhuc] = useState<ThongTinNhomCaiDat | null>(null);
  const [nhomChoChuyenKhiChuaLuu, setNhomChoChuyenKhiChuaLuu] = useState<MaNhomCaiDat | null>(null);
  const [moHopThoaiTaiLaiKhiChuaLuu, setMoHopThoaiTaiLaiKhiChuaLuu] = useState(false);

  const capNhatNhomDangChon = useCallback((maNhomMoi: MaNhomCaiDat) => {
    setNhomHienTai(maNhomMoi);
    try {
      window.localStorage.setItem(KHOA_LUU_NHOM_DANG_CHON, maNhomMoi);
      const url = new URL(window.location.href);
      url.searchParams.set('nhom', maNhomMoi);
      window.history.replaceState(null, '', `${url.pathname}${url.search}`);
    } catch {
      // Bỏ qua nếu môi trường chặn localStorage hoặc history
    }
  }, []);

  // Khôi phục nhóm (tab) đang chọn và trạng thái đóng/mở nhóm con khi tải lại trang
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const nhomTuUrl = url.searchParams.get('nhom');
      const nhomTuStorage = window.localStorage.getItem(KHOA_LUU_NHOM_DANG_CHON);
      const nhomKhoiPhuc =
        nhomTuUrl && TAP_MA_NHOM_HOP_LE.has(nhomTuUrl)
          ? (nhomTuUrl as MaNhomCaiDat)
          : nhomTuStorage && TAP_MA_NHOM_HOP_LE.has(nhomTuStorage)
            ? (nhomTuStorage as MaNhomCaiDat)
            : null;

      if (nhomKhoiPhuc) {
        setNhomHienTai(nhomKhoiPhuc);
        window.localStorage.setItem(KHOA_LUU_NHOM_DANG_CHON, nhomKhoiPhuc);
        if (nhomTuUrl !== nhomKhoiPhuc) {
          url.searchParams.set('nhom', nhomKhoiPhuc);
          window.history.replaceState(null, '', `${url.pathname}${url.search}`);
        }
      }

      const daLuu = window.localStorage.getItem(KHOA_LUU_TRANG_THAI_NHOM_CON);
      if (daLuu) {
        const parsed = JSON.parse(daLuu);
        if (parsed && typeof parsed === 'object') {
          setNhomConBiDong(parsed);
        }
      }
    } catch {
      // Bỏ qua nếu localStorage bị khóa
    }
  }, []);

  const doiTrangThaiNhomCon = (maPhanNhom: string) => {
    setNhomConBiDong((truoc) => {
      const keTiep = { ...truoc, [maPhanNhom]: !truoc[maPhanNhom] };
      try {
        window.localStorage.setItem(KHOA_LUU_TRANG_THAI_NHOM_CON, JSON.stringify(keTiep));
      } catch {
        // Bỏ qua
      }
      return keTiep;
    });
  };

  // Phím tắt '/' để đưa con trỏ vào ô tìm kiếm (Mục C.13)
  useEffect(() => {
    const xuLyPhimTat = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      const phanTuDangChon = document.activeElement as HTMLElement | null;
      const the = phanTuDangChon?.tagName?.toUpperCase();
      if (
        the === 'INPUT' ||
        the === 'TEXTAREA' ||
        the === 'SELECT' ||
        phanTuDangChon?.isContentEditable
      ) {
        return;
      }
      e.preventDefault();
      oTimKiemRef.current?.focus();
    };
    window.addEventListener('keydown', xuLyPhimTat);
    return () => window.removeEventListener('keydown', xuLyPhimTat);
  }, []);

  // Truy vấn danh sách cài đặt hệ thống từ API Quản trị
  const {
    data: danhSachTuMayChu = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<CaiDatHeThong[]>({
    queryKey: ['cai-dat-he-thong'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/cai-dat');
      return res.data?.duLieu || [];
    },
    staleTime: 30 * 1000,
  });

  // Hợp nhất danh mục chuẩn 64 cài đặt + các khóa mở rộng phát sinh trong DB (nếu có)
  const danhSachDinhNghiaToanBo = useMemo<DinhNghiaKhoaCaiDat[]>(() => {
    const ketQua: DinhNghiaKhoaCaiDat[] = [...DANH_MUC_CAI_DAT_HE_THONG];
    const tapKhoaDaCo = new Set<string>();
    for (const d of DANH_MUC_CAI_DAT_HE_THONG) {
      tapKhoaDaCo.add(d.khoa);
      if (d.khoaCu) tapKhoaDaCo.add(d.khoaCu);
    }

    for (const item of danhSachTuMayChu) {
      if (
        !item.khoa ||
        item.khoa.startsWith('ca_nhan.') ||
        tapKhoaDaCo.has(item.khoa) ||
        BAN_DO_DINH_NGHIA_CAI_DAT[item.khoa] ||
        ANH_XA_KHOA_CU_SANG_MOI[item.khoa]
      ) {
        continue;
      }
      tapKhoaDaCo.add(item.khoa);
      const kieuSuyLuan =
        item.kieuDuLieu === 'LOGIC'
          ? 'boolean'
          : item.kieuDuLieu === 'SO'
            ? 'number'
            : 'text';
      ketQua.push({
        khoa: item.khoa,
        nhan: taoNhanTamTuKhoa(item.khoa),
        moTa: item.moTa || 'Thông số cấu hình bổ sung từ cơ sở dữ liệu.',
        nhom: 'khac',
        phanNhom: 'cau-hinh-bo-sung',
        tieuDePhanNhom: 'Thông số bổ sung',
        kieu: kieuSuyLuan,
        kieuDuLieuDb: (item.kieuDuLieu as 'CHUOI' | 'SO' | 'LOGIC' | 'JSON') || 'CHUOI',
        macDinh: item.giaTri ?? '',
        congKhai: Boolean(item.congKhai),
        mucUuTien: 'NEN_CO',
      });
    }

    return ketQua;
  }, [danhSachTuMayChu]);

  // Đồng bộ dữ liệu từ máy chủ vào state
  useEffect(() => {
    const TAP_EMAIL_DANG_NHAP_MAU = new Set([
      'admin@lms.edu.vn',
      'bangiamhieu@lms.edu.vn',
      'giaovu@lms.edu.vn',
      'giaovien1@lms.edu.vn',
      'hocsinh1@lms.edu.vn',
      'phuhuynh1@lms.edu.vn',
    ]);

    const banDoTuServer: Record<string, string> = {};
    for (const item of danhSachTuMayChu) {
      banDoTuServer[item.khoa] = item.giaTri;
    }

    const banDoChuan: Record<string, string> = {};
    for (const dinhNghia of danhSachDinhNghiaToanBo) {
      const giaTriMoi = banDoTuServer[dinhNghia.khoa];
      const giaTriCu = dinhNghia.khoaCu ? banDoTuServer[dinhNghia.khoaCu] : undefined;
      let giaTriChot =
        giaTriMoi !== undefined && giaTriMoi !== ''
          ? giaTriMoi
          : giaTriCu !== undefined && giaTriCu !== ''
            ? giaTriCu
            : (giaTriMoi ?? giaTriCu ?? dinhNghia.macDinh);

      // Không bao giờ tự điền tài khoản đăng nhập mẫu của hệ thống vào ô Tài khoản đăng nhập SMTP
      if (
        dinhNghia.khoa === 'email.tai_khoan_smtp' &&
        TAP_EMAIL_DANG_NHAP_MAU.has(giaTriChot.trim().toLowerCase())
      ) {
        giaTriChot = '';
      }

      banDoChuan[dinhNghia.khoa] = giaTriChot;
      if (dinhNghia.khoaCu) {
        banDoChuan[dinhNghia.khoaCu] = giaTriChot;
      }
    }

    setGiaTriGoc(banDoChuan);
    setFormValues(banDoChuan);
    setDangNhapKhoaBiMatMoi({});
    setDaMoKhoaNhap({});
    setLoiTuMayChuTheoKhoa({});
  }, [danhSachTuMayChu, danhSachDinhNghiaToanBo]);

  // Danh sách các mục đã bị chỉnh sửa so với giá trị gốc trên máy chủ
  const danhSachMucThayDoi = useMemo(() => {
    return danhSachDinhNghiaToanBo.filter((dinhNghia) => {
      const hienTai = formValues[dinhNghia.khoa] ?? dinhNghia.macDinh;
      const goc = giaTriGoc[dinhNghia.khoa] ?? dinhNghia.macDinh;
      return hienTai !== goc;
    });
  }, [formValues, giaTriGoc, danhSachDinhNghiaToanBo]);

  const dangThayDoi = danhSachMucThayDoi.length > 0;

  // Cảnh báo đóng tab trình duyệt khi còn thay đổi chưa lưu (Mục D.18)
  useEffect(() => {
    if (!dangThayDoi) return;
    const xuLyTruocKhiRoiTrang = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', xuLyTruocKhiRoiTrang);
    return () => window.removeEventListener('beforeunload', xuLyTruocKhiRoiTrang);
  }, [dangThayDoi]);

  // Bản đồ kiểm tra lỗi hợp lệ tức thời trên từng trường (Mục B.6 & D.19)
  const banDoLoiHopLe = useMemo(() => {
    const loi: Record<string, string> = {};
    for (const dinhNghia of danhSachDinhNghiaToanBo) {
      const giaTri = formValues[dinhNghia.khoa] ?? dinhNghia.macDinh;
      const thongBaoLoi =
        kiemTraHopLeTruong(dinhNghia, giaTri) || loiTuMayChuTheoKhoa[dinhNghia.khoa] || null;
      if (thongBaoLoi) {
        loi[dinhNghia.khoa] = thongBaoLoi;
      }
    }
    return loi;
  }, [formValues, danhSachDinhNghiaToanBo, loiTuMayChuTheoKhoa]);

  const danhSachKhoaBiLoi = useMemo(() => Object.keys(banDoLoiHopLe), [banDoLoiHopLe]);
  const coLoiHopLe = danhSachKhoaBiLoi.length > 0;

  // Đếm số lượng mục thực tế và số mục đang sửa theo từng nhóm (Mục A.3 & D.15)
  const soMucTheoNhom = useMemo(() => {
    const dem: Record<string, number> = {};
    for (const muc of danhSachDinhNghiaToanBo) {
      dem[muc.nhom] = (dem[muc.nhom] || 0) + 1;
    }
    return dem;
  }, [danhSachDinhNghiaToanBo]);

  // Ẩn các nhóm rỗng (ví dụ 'khac' khi có 0 mục) khỏi menu (Mục D.15)
  const danhSachNhomHienThi = useMemo(() => {
    return DANH_SACH_NHOM.filter((nhom) => (soMucTheoNhom[nhom.ma] || 0) > 0);
  }, [soMucTheoNhom]);

  const soThayDoiTheoNhom = useMemo(() => {
    const dem: Record<string, number> = {};
    for (const muc of danhSachMucThayDoi) {
      dem[muc.nhom] = (dem[muc.nhom] || 0) + 1;
    }
    return dem;
  }, [danhSachMucThayDoi]);

  // Danh sách các mục nguy hiểm đang có thay đổi (Mục E.20)
  const danhSachThayDoiNguyHiem = useMemo(() => {
    return danhSachMucThayDoi.filter((muc) => muc.nguyHiem);
  }, [danhSachMucThayDoi]);

  // Thay đổi giá trị 1 trường (đồng bộ cả khóa mới và khóa cũ nếu có)
  const thayDoiGiaTri = useCallback((khoa: string, giaTriMoi: string) => {
    const maCu = ANH_XA_KHOA_MOI_SANG_CU[khoa];
    setLoiTuMayChuTheoKhoa((truoc) => {
      if (!truoc[khoa]) return truoc;
      const banSao = { ...truoc };
      delete banSao[khoa];
      return banSao;
    });
    setFormValues((truoc) => {
      const keTiep = {
        ...truoc,
        [khoa]: giaTriMoi,
      };
      if (maCu) {
        keTiep[maCu] = giaTriMoi;
      }
      if (khoa.startsWith('giao_dien.')) {
        apDungCauHinhGiaoDienVaoDom(keTiep, false);
      }
      return keTiep;
    });
  }, []);

  // Hoàn tác 1 trường về giá trị đang lưu trên máy chủ
  const hoanTacMotTruong = (dinhNghia: DinhNghiaKhoaCaiDat) => {
    const giaTriCu = giaTriGoc[dinhNghia.khoa] ?? dinhNghia.macDinh;
    thayDoiGiaTri(dinhNghia.khoa, giaTriCu);
    if (dinhNghia.biMat) {
      setDangNhapKhoaBiMatMoi((truoc) => ({ ...truoc, [dinhNghia.khoa]: false }));
    }
  };

  // Khôi phục 1 trường về giá trị mặc định chuẩn ban đầu (Mục D.17)
  const khoiPhucMacDinhMotTruong = (dinhNghia: DinhNghiaKhoaCaiDat) => {
    thayDoiGiaTri(dinhNghia.khoa, dinhNghia.macDinh);
  };

  // Hoàn tác toàn bộ thay đổi chưa lưu
  const xuLyHoanTacTatCa = () => {
    setFormValues({ ...giaTriGoc });
    apDungCauHinhGiaoDienVaoDom(giaTriGoc, true);
    setDangNhapKhoaBiMatMoi({});
    setLoiTuMayChuTheoKhoa({});
    thongBao.thongTin(
      'Đã hoàn tác thay đổi',
      'Toàn bộ các trường đã trở về giá trị đang lưu trên máy chủ.',
    );
  };

  // Tự động chuyển về nhóm 'chung' nếu nhóm đang chọn (ví dụ 'khac') không còn mục nào
  useEffect(() => {
    if (!isLoading && nhomHienTai === 'khac' && (soMucTheoNhom['khac'] || 0) === 0) {
      capNhatNhomDangChon('chung');
    }
  }, [isLoading, nhomHienTai, soMucTheoNhom, capNhatNhomDangChon]);

  const [khoaDangNhayDen, setKhoaDangNhayDen] = useState<string | null>(null);

  // Nhảy thẳng tới một mục cài đặt cụ thể (mở đúng tab nhóm, mở nhóm con, cuộn tới dòng và tô sáng)
  const nhayToiMucCaiDat = useCallback(
    (khoaDich: string) => {
      const dinhNghia =
        danhSachDinhNghiaToanBo.find((d) => d.khoa === khoaDich || d.khoaCu === khoaDich) ||
        BAN_DO_DINH_NGHIA_CAI_DAT[khoaDich];

      const khoaChuan = dinhNghia?.khoa || khoaDich;
      setTuKhoaTimKiem('');

      if (dinhNghia) {
        capNhatNhomDangChon(dinhNghia.nhom);
        const khoaPhanNhom = `${dinhNghia.nhom}__${dinhNghia.phanNhom}`;
        setNhomConBiDong((truoc) => ({ ...truoc, [khoaPhanNhom]: false }));
      }

      setKhoaDangNhayDen(khoaChuan);
      window.setTimeout(() => {
        const phanTuDong = document.getElementById(`dong-cai-dat-${khoaChuan}`);
        if (phanTuDong) {
          phanTuDong.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        const oNhap = document.querySelector<HTMLElement>(`[data-input-khoa="${khoaChuan}"]`);
        oNhap?.focus();
      }, 100);

      window.setTimeout(() => {
        setKhoaDangNhayDen((hienTai) => (hienTai === khoaChuan ? null : hienTai));
      }, 2600);
    },
    [danhSachDinhNghiaToanBo, capNhatNhomDangChon],
  );

  // Lắng nghe tham số ?khoa=... trên URL hoặc sự kiện nhảy từ hộp tìm kiếm nhanh (Ctrl+K)
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const khoaTuUrl = url.searchParams.get('khoa');
      if (khoaTuUrl) {
        nhayToiMucCaiDat(khoaTuUrl);
        url.searchParams.delete('khoa');
        window.history.replaceState(null, '', `${url.pathname}${url.search}`);
      }
    } catch {
      // Bỏ qua
    }

    const xuLySuKienDieuHuong = (e: Event) => {
      const chiTiet = (e as CustomEvent<{ nhom?: MaNhomCaiDat; khoa?: string }>).detail;
      if (chiTiet?.khoa) {
        nhayToiMucCaiDat(chiTiet.khoa);
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete('khoa');
          window.history.replaceState(null, '', `${url.pathname}${url.search}`);
        } catch {
          // Bỏ qua
        }
      }
    };

    window.addEventListener('lms:dieu-huong-cai-dat', xuLySuKienDieuHuong);
    return () => window.removeEventListener('lms:dieu-huong-cai-dat', xuLySuKienDieuHuong);
  }, [nhayToiMucCaiDat]);

  // Cuộn tới dòng cài đặt bị lỗi đầu tiên (Mục D.19)
  const cuonToiKhoaBiLoi = useCallback(
    (khoaLoi: string) => {
      nhayToiMucCaiDat(khoaLoi);
    },
    [nhayToiMucCaiDat],
  );

  // Chuyển nhóm có kiểm tra thay đổi chưa lưu (Mục D.18)
  const xuLyChonNhom = (maNhomMoi: MaNhomCaiDat) => {
    if (maNhomMoi === nhomHienTai && !tuKhoaTimKiem.trim()) return;
    if (dangThayDoi) {
      setNhomChoChuyenKhiChuaLuu(maNhomMoi);
      return;
    }
    setTuKhoaTimKiem('');
    capNhatNhomDangChon(maNhomMoi);
  };

  const xacNhanHuyThayDoiVaChuyenNhom = () => {
    if (!nhomChoChuyenKhiChuaLuu) return;
    setFormValues({ ...giaTriGoc });
    apDungCauHinhGiaoDienVaoDom(giaTriGoc, true);
    setDangNhapKhoaBiMatMoi({});
    setLoiTuMayChuTheoKhoa({});
    setTuKhoaTimKiem('');
    capNhatNhomDangChon(nhomChoChuyenKhiChuaLuu);
    setNhomChoChuyenKhiChuaLuu(null);
  };

  // Mutation cập nhật cấu hình
  const dotCapNhat = useMutation({
    mutationFn: async (duLieu: Array<{ khoa: string; giaTri: string }>) => {
      const res = await mayKhachApi.put('/cai-dat', { danhSachCaiDat: duLieu });
      return res.data;
    },
    onSuccess: () => {
      setMoHopThoaiXacNhanNguyHiem(false);
      thongBao.thanhCong(
        'Đã lưu cài đặt hệ thống',
        'Các thông số cấu hình mới đã được áp dụng.',
      );
      queryClient.invalidateQueries({ queryKey: ['cai-dat-he-thong'] });
      queryClient.invalidateQueries({ queryKey: ['cai-dat-cong-khai'] });
    },
    onError: (loi: any) => {
      setMoHopThoaiXacNhanNguyHiem(false);
      const thongDiep =
        loi.response?.data?.thongDiep ||
        loi.response?.data?.message ||
        'Không thể lưu cấu hình. Vui lòng kiểm tra lại giá trị nhập vào.';
      thongBao.thatBai('Lưu cài đặt thất bại', thongDiep);

      // Tìm xem thông điệp lỗi từ máy chủ có nhắc tới khóa cài đặt nào không để đánh dấu và cuộn tới
      const mucLienQuan = danhSachMucThayDoi.find(
        (m) =>
          thongDiep.includes(m.khoa) ||
          (m.khoaCu && thongDiep.includes(m.khoaCu)) ||
          thongDiep.toLowerCase().includes(m.nhan.toLowerCase()),
      );
      const khoaCanCuon = mucLienQuan?.khoa || danhSachMucThayDoi[0]?.khoa;
      if (khoaCanCuon) {
        setLoiTuMayChuTheoKhoa((truoc) => ({ ...truoc, [khoaCanCuon]: thongDiep }));
        cuonToiKhoaBiLoi(khoaCanCuon);
      }
    },
  });

  // Mutation khôi phục mặc định theo nhóm
  const dotKhoiPhucNhom = useMutation({
    mutationFn: async (maNhom: string) => {
      const res = await mayKhachApi.post('/cai-dat/khoi-phuc-mac-dinh', { nhom: maNhom });
      return res.data;
    },
    onSuccess: (_duLieu, maNhom) => {
      const thongTinNhom = DANH_SACH_NHOM.find((n) => n.ma === maNhom);
      setNhomCanKhoiPhuc(null);
      thongBao.thanhCong(
        'Đã khôi phục mặc định nhóm',
        `Nhóm "${thongTinNhom?.ten || maNhom}" đã trở về thông số chuẩn ban đầu.`,
      );
      queryClient.invalidateQueries({ queryKey: ['cai-dat-he-thong'] });
      queryClient.invalidateQueries({ queryKey: ['cai-dat-cong-khai'] });
    },
    onError: (loi: any) => {
      const thongDiep =
        loi.response?.data?.thongDiep ||
        loi.response?.data?.message ||
        'Không thể khôi phục mặc định cho nhóm này.';
      thongBao.thatBai('Khôi phục thất bại', thongDiep);
    },
  });

  const thucThiLuuCapNhat = () => {
    if (dotCapNhat.isPending) return;
    const danhSachGuiLen = danhSachMucThayDoi.map((dinhNghia) => ({
      khoa: dinhNghia.khoa,
      giaTri: formValues[dinhNghia.khoa] ?? dinhNghia.macDinh,
    }));

    if (danhSachGuiLen.length === 0) return;
    dotCapNhat.mutate(danhSachGuiLen);
  };

  const xuLyBamLuuThayDoi = () => {
    if (!dangThayDoi || dotCapNhat.isPending) return;

    if (coLoiHopLe) {
      const khoaDauTien = danhSachKhoaBiLoi[0];
      const dinhNghiaLoi = danhSachDinhNghiaToanBo.find((d) => d.khoa === khoaDauTien);
      thongBao.canhBao(
        'Giá trị chưa hợp lệ',
        `Vui lòng kiểm tra mục "${dinhNghiaLoi?.nhan || khoaDauTien}": ${banDoLoiHopLe[khoaDauTien]}`,
      );
      cuonToiKhoaBiLoi(khoaDauTien);
      return;
    }

    if (danhSachThayDoiNguyHiem.length > 0) {
      setMoHopThoaiXacNhanNguyHiem(true);
      return;
    }
    thucThiLuuCapNhat();
  };

  // Xử lý bấm nút "Tải lại dữ liệu" (Mục D.16)
  const xuLyBamTaiLaiDuLieu = () => {
    if (dangThayDoi) {
      setMoHopThoaiTaiLaiKhiChuaLuu(true);
      return;
    }
    refetch();
  };

  // Kiểm tra kết nối AI
  const xuLyKiemTraKetNoiAi = async () => {
    setDangKiemTraAi(true);
    setKetQuaKiemTraAi(null);
    try {
      const apiKeyHienTai = formValues['tro_ly_ai.khoa_bi_mat_api'] || '';
      const res = await mayKhachApi.post('/tro-ly-ai/kiem-tra-ket-noi', {
        nhaCungCap: formValues['tro_ly_ai.nha_cung_cap'] || 'gemini',
        apiKey: apiKeyHienTai === MAT_NA_KHOA_BI_MAT ? undefined : apiKeyHienTai,
        model: formValues['tro_ly_ai.ten_mo_hinh'] || 'gemini-1.5-flash',
        baseUrl: formValues['tro_ly_ai.url_may_chu_tuy_chinh'] || '',
      });

      const duLieu = res.data?.duLieu || res.data;
      if (duLieu?.thanhCong) {
        setKetQuaKiemTraAi({
          thanhCong: true,
          thongDiep: duLieu.thongDiep,
          doTreMs: duLieu.doTreMs,
        });
        thongBao.thanhCong('Kết nối Trợ lý AI thành công', duLieu.thongDiep);
      } else {
        setKetQuaKiemTraAi({
          thanhCong: false,
          thongDiep: duLieu?.thongDiep || 'Không thể kết nối tới nhà cung cấp mô hình.',
          doTreMs: duLieu?.doTreMs,
        });
        thongBao.thatBai(
          'Kết nối Trợ lý AI thất bại',
          duLieu?.thongDiep || 'Vui lòng kiểm tra lại khóa kết nối hoặc tên mô hình.',
        );
      }
    } catch (err: any) {
      const thongDiepLoi =
        err.response?.data?.thongDiep ||
        err.response?.data?.message ||
        err.message ||
        'Không thể kết nối tới máy chủ mô hình ngôn ngữ';
      setKetQuaKiemTraAi({
        thanhCong: false,
        thongDiep: thongDiepLoi,
      });
      thongBao.thatBai('Lỗi kiểm tra kết nối AI', thongDiepLoi);
    } finally {
      setDangKiemTraAi(false);
    }
  };

  // Kiểm tra kết nối SMTP
  const xuLyKiemTraKetNoiSmtp = async () => {
    setDangKiemTraSmtp(true);
    setKetQuaKiemTraSmtp(null);
    try {
      const res = await mayKhachApi.post('/cai-dat/kiem-tra-smtp', {
        mayChuSmtp: formValues['email.may_chu_smtp'] || 'smtp.gmail.com',
        congSmtp: Number(formValues['email.cong_smtp'] || 587),
        taiKhoanSmtp: formValues['email.tai_khoan_smtp'] || '',
        matKhauUngDungSmtp: formValues['email.mat_khau_ung_dung_smtp'] || '',
        emailNguoiGui: formValues['email.email_nguoi_gui'] || '',
        tenHienThiNguoiGui: formValues['email.ten_hien_thi_nguoi_gui'] || '',
      });

      const duLieu = res.data?.duLieu || res.data;
      if (duLieu?.thanhCong) {
        setKetQuaKiemTraSmtp({
          thanhCong: true,
          thongDiep: duLieu.thongDiep,
          doTreMs: duLieu.doTreMs,
        });
        thongBao.thanhCong('Kết nối máy chủ gửi thư thành công', duLieu.thongDiep);
      } else {
        setKetQuaKiemTraSmtp({
          thanhCong: false,
          thongDiep: duLieu?.thongDiep || 'Không thể kết nối tới máy chủ SMTP.',
          doTreMs: duLieu?.doTreMs,
        });
        thongBao.thatBai(
          'Kiểm tra máy chủ gửi thư thất bại',
          duLieu?.thongDiep || 'Vui lòng kiểm tra địa chỉ máy chủ và cổng kết nối.',
        );
      }
    } catch (err: any) {
      const thongDiepLoi =
        err.response?.data?.thongDiep ||
        err.response?.data?.message ||
        err.message ||
        'Không thể kiểm tra kết nối máy chủ gửi thư';
      setKetQuaKiemTraSmtp({
        thanhCong: false,
        thongDiep: thongDiepLoi,
      });
      thongBao.thatBai('Lỗi kiểm tra SMTP', thongDiepLoi);
    } finally {
      setDangKiemTraSmtp(false);
    }
  };

  // Lọc danh sách mục theo từ khóa tìm kiếm (hỗ trợ cả tiếng Việt có dấu và không dấu) hoặc theo nhóm đang chọn (Mục C.13)
  const dangTimKiem = tuKhoaTimKiem.trim().length > 0;

  const danhSachMucHienThi = useMemo(() => {
    const tuKhoa = tuKhoaTimKiem.trim();
    if (tuKhoa) {
      const tuKhoaThuong = tuKhoa.toLowerCase();
      const tuKhoaKhongDau = boDauTiengViet(tuKhoa);
      return danhSachDinhNghiaToanBo.filter((muc) => {
        const nhanThuong = muc.nhan.toLowerCase();
        const moTaThuong = muc.moTa.toLowerCase();
        const khoaThuong = muc.khoa.toLowerCase();
        const phanNhomThuong = muc.tieuDePhanNhom.toLowerCase();
        const khoaCuThuong = muc.khoaCu ? muc.khoaCu.toLowerCase() : '';

        if (
          nhanThuong.includes(tuKhoaThuong) ||
          moTaThuong.includes(tuKhoaThuong) ||
          khoaThuong.includes(tuKhoaThuong) ||
          phanNhomThuong.includes(tuKhoaThuong) ||
          khoaCuThuong.includes(tuKhoaThuong)
        ) {
          return true;
        }

        return (
          boDauTiengViet(muc.nhan).includes(tuKhoaKhongDau) ||
          boDauTiengViet(muc.moTa).includes(tuKhoaKhongDau) ||
          boDauTiengViet(muc.tieuDePhanNhom).includes(tuKhoaKhongDau)
        );
      });
    }
    return danhSachDinhNghiaToanBo.filter((muc) => muc.nhom === nhomHienTai);
  }, [nhomHienTai, tuKhoaTimKiem, danhSachDinhNghiaToanBo]);

  // Gom các mục thành từng Nhóm con (Sub-groups) có tiêu đề eyebrow mono
  const danhSachPhanNhom = useMemo(() => {
    const banDo = new Map<
      string,
      {
        maPhanNhom: string;
        tieuDe: string;
        moTa?: string;
        nhom: MaNhomCaiDat;
        tenNhomLon: string;
        danhSachMuc: DinhNghiaKhoaCaiDat[];
      }
    >();

    for (const muc of danhSachMucHienThi) {
      const khoaPhanNhom = `${muc.nhom}__${muc.phanNhom}`;
      const hienCo = banDo.get(khoaPhanNhom);
      if (hienCo) {
        hienCo.danhSachMuc.push(muc);
        if (!hienCo.moTa && muc.moTaPhanNhom) {
          hienCo.moTa = muc.moTaPhanNhom;
        }
      } else {
        const nhomLon = DANH_SACH_NHOM.find((n) => n.ma === muc.nhom);
        banDo.set(khoaPhanNhom, {
          maPhanNhom: khoaPhanNhom,
          tieuDe: muc.tieuDePhanNhom,
          moTa: muc.moTaPhanNhom,
          nhom: muc.nhom,
          tenNhomLon: nhomLon?.ten || muc.nhom,
          danhSachMuc: [muc],
        });
      }
    }

    return Array.from(banDo.values());
  }, [danhSachMucHienThi]);

  const thongTinNhomHienTai =
    DANH_SACH_NHOM.find((n) => n.ma === nhomHienTai) || DANH_SACH_NHOM[0];

  // Hàm dựng bộ chỉnh sửa cấu trúc cột điểm mặc định (JSON)
  const renderBoChinhSuaCotDiem = (dinhNghia: DinhNghiaKhoaCaiDat, giaTriHienTai: string) => {
    let danhSachCot: MauCotDiemItem[] = [];
    try {
      const parsed = JSON.parse(giaTriHienTai);
      if (Array.isArray(parsed)) {
        danhSachCot = parsed.map((c) => ({
          tenCotDiem: String(c?.tenCotDiem || ''),
          heSo: Number(c?.heSo ?? 1),
        }));
      }
    } catch {
      danhSachCot = [
        { tenCotDiem: 'Chuyên cần', heSo: 1.0 },
        { tenCotDiem: 'Luyện tập & Bài tập', heSo: 2.0 },
        { tenCotDiem: 'Giữa kỳ (Thi thử)', heSo: 2.0 },
        { tenCotDiem: 'Cuối kỳ', heSo: 5.0 },
      ];
    }

    const capNhatDanhSachCot = (moi: MauCotDiemItem[]) => {
      thayDoiGiaTri(dinhNghia.khoa, JSON.stringify(moi));
    };

    const tongHeSo = danhSachCot.reduce((sum, c) => sum + (Number(c.heSo) || 0), 0);

    return (
      <div className="w-full space-y-2.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] p-3">
        <div className="flex items-center justify-between text-xs text-[var(--muted)] pb-1.5 border-b border-[var(--border)]">
          <span className="font-mono uppercase tracking-wider text-[11px]">
            MẪU CỘT ĐIỂM ({danhSachCot.length} CỘT)
          </span>
          <span className="font-mono tabular-nums text-[11px]">
            Tổng hệ số: <strong className="text-[var(--accent)]">{tongHeSo.toFixed(1)}</strong>
          </span>
        </div>

        <div className="space-y-1.5">
          {danhSachCot.map((cot, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[var(--muted)] w-5 text-right tabular-nums">
                #{idx + 1}
              </span>
              <input
                type="text"
                value={cot.tenCotDiem}
                placeholder="Tên cột điểm"
                onChange={(e) => {
                  const banSao = [...danhSachCot];
                  banSao[idx] = { ...banSao[idx], tenCotDiem: e.target.value };
                  capNhatDanhSachCot(banSao);
                }}
                className="flex-1 px-2.5 py-1 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
              />
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[11px] text-[var(--muted)]">Hệ số</span>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="10"
                  value={cot.heSo}
                  onChange={(e) => {
                    const banSao = [...danhSachCot];
                    banSao[idx] = {
                      ...banSao[idx],
                      heSo: parseFloat(e.target.value) || 1,
                    };
                    capNhatDanhSachCot(banSao);
                  }}
                  className="w-16 px-2 py-1 text-xs font-mono text-right tabular-nums bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
              <button
                type="button"
                disabled={danhSachCot.length <= 1}
                onClick={() => {
                  const banSao = danhSachCot.filter((_, i) => i !== idx);
                  capNhatDanhSachCot(banSao);
                }}
                title="Xóa cột điểm"
                className="p-1 text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] rounded-[var(--radius)] transition-colors disabled:opacity-30 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>
            </div>
          ))}
        </div>

        <div className="pt-1 flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              capNhatDanhSachCot([
                ...danhSachCot,
                { tenCotDiem: `Cột điểm ${danhSachCot.length + 1}`, heSo: 1.0 },
              ])
            }
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[var(--accent)] bg-[var(--accent-soft)] border border-[var(--accent)] rounded-[var(--radius)] hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[1.5]" />
            Thêm cột điểm
          </button>
          <span className="text-[11px] text-[var(--muted)]">
            Tự động tạo khi mở sổ điểm lớp mới
          </span>
        </div>
      </div>
    );
  };

  // Hàm dựng ô điều khiển tương ứng cho từng định nghĩa cài đặt (Mục B.6, B.7, C.9, E.21)
  const renderDieuKhien = (dinhNghia: DinhNghiaKhoaCaiDat) => {
    const giaTriHienTai = formValues[dinhNghia.khoa] ?? dinhNghia.macDinh;
    const goc = giaTriGoc[dinhNghia.khoa] ?? dinhNghia.macDinh;
    const loiTruong = banDoLoiHopLe[dinhNghia.khoa];

    if (dinhNghia.kieu === 'file-anh') {
      const khoaTaiLen = dinhNghia.khoaCu || dinhNghia.khoa;
      return (
        <ThanhPhanTaiLenAnhCaiDat
          khoa={khoaTaiLen}
          nhan={dinhNghia.nhan}
          moTa={dinhNghia.moTa}
          giaTriHienTai={giaTriHienTai}
          dinhDangChoPhep={dinhNghia.dinhDangChoPhep}
          khuyenNghi={dinhNghia.khuyenNghi}
          onCapNhat={(duongDanMoi) => thayDoiGiaTri(dinhNghia.khoa, duongDanMoi)}
          onXoa={() => thayDoiGiaTri(dinhNghia.khoa, '')}
        />
      );
    }

    if (dinhNghia.kieu === 'json' && dinhNghia.khoa === 'hoc_vu.mau_cot_diem_mac_dinh') {
      return renderBoChinhSuaCotDiem(dinhNghia, giaTriHienTai);
    }

    if (laKhoaDanhSachDuoiTep(dinhNghia.khoa)) {
      return (
        <BoNhapTheDuoiTep
          khoa={dinhNghia.khoa}
          giaTri={giaTriHienTai}
          loiTruong={loiTruong}
          onChange={(giaTriMoi) => thayDoiGiaTri(dinhNghia.khoa, giaTriMoi)}
        />
      );
    }

    if (dinhNghia.kieu === 'boolean') {
      const dangBat = giaTriHienTai === 'true';
      return (
        <CongTac
          checked={dangBat}
          ariaLabel={dinhNghia.nhan}
          dataInputKhoa={dinhNghia.khoa}
          onChange={(checked) => thayDoiGiaTri(dinhNghia.khoa, checked ? 'true' : 'false')}
        />
      );
    }

    if (dinhNghia.kieu === 'color') {
      const hexChuan = (giaTriHienTai || '#059669').trim().toUpperCase();
      return (
        <div className="w-full space-y-2.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] p-3">
          {/* Lưới 7 bảng màu chủ đạo chuẩn Warm Minimal */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {DANH_SACH_MAU_CHU_DAO_CHUAN.map((mau) => {
              const dangChon = hexChuan === mau.maHex.toUpperCase();
              return (
                <button
                  key={mau.maHex}
                  type="button"
                  onClick={() => thayDoiGiaTri(dinhNghia.khoa, mau.maHex)}
                  className={`p-2 rounded-[var(--radius)] border text-left transition-colors cursor-pointer flex flex-col gap-1.5 ${
                    dangChon
                      ? 'bg-[var(--surface)] border-[var(--accent)] ring-1 ring-[var(--accent)]'
                      : 'bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--active-bg)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className="w-5 h-5 rounded-full border border-black/15 shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: mau.maHex }}
                    >
                      {dangChon && <Check className="w-3 h-3 text-white stroke-[2]" />}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--muted)] tabular-nums">
                      {mau.maHex}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-[var(--text)] truncate">
                      {mau.ten}
                    </p>
                    <p className="text-[10px] text-[var(--muted)] truncate">{mau.moTaNgan}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bộ chọn màu chuyên sâu (ColorPicker Popover: HSV Canvas + Hue + HEX/RGB/HSL + EyeDropper) + Ô nhập mã HEX + Xem trước trực tiếp */}
          <div className="pt-2 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <ColorPicker
                value={/^#[0-9A-F]{6}$/i.test(hexChuan) ? hexChuan : '#059669'}
                onChange={(nextHex) => thayDoiGiaTri(dinhNghia.khoa, nextHex.toUpperCase())}
                triggerLabel="Bảng pha màu (HSV / RGB / HSL)"
                eyedropper={true}
                swatches={DANH_SACH_MAU_CHU_DAO_CHUAN.map((m) => m.maHex)}
              />

              <input
                type="text"
                data-input-khoa={dinhNghia.khoa}
                value={giaTriHienTai}
                maxLength={7}
                placeholder="#059669"
                onChange={(e) => thayDoiGiaTri(dinhNghia.khoa, e.target.value.toUpperCase())}
                aria-invalid={Boolean(loiTruong)}
                className={`w-[104px] h-8 px-2.5 text-xs font-mono uppercase bg-[var(--surface)] border rounded-[var(--radius)] text-[var(--text)] focus:outline-none transition-colors ${
                  loiTruong
                    ? 'border-[var(--danger)] focus:border-[var(--danger)]'
                    : 'border-[var(--border)] focus:border-[var(--accent)]'
                }`}
              />
            </div>

            {/* Xem trước tức thì nút nhấn, huy hiệu và vùng bôi đen văn bản */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2 py-0.5 font-mono text-[11px] rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)] font-medium">
                Nhãn trạng thái
              </span>
              <span className="px-2.5 py-1 rounded-[var(--radius)] bg-[var(--accent)] text-white font-semibold text-[11px]">
                Nút hành động
              </span>
              <span className="px-2 py-1 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] text-[11px] text-[var(--text)]">
                Quét chuột bôi đen thử chữ này
              </span>
            </div>
          </div>

          {loiTruong && (
            <p className="text-[11px] text-[var(--danger)] font-medium">{loiTruong}</p>
          )}
        </div>
      );
    }

    const danhSachTuyChon = dinhNghia.tuyChonSelect || dinhNghia.luaChon;
    if (dinhNghia.kieu === 'select' && danhSachTuyChon) {
      return (
        <div className="w-full sm:w-auto flex flex-col sm:items-end gap-1">
          <select
            data-input-khoa={dinhNghia.khoa}
            value={giaTriHienTai}
            onChange={(e) => thayDoiGiaTri(dinhNghia.khoa, e.target.value)}
            className="w-full sm:w-[270px] px-2.5 py-1.5 text-xs bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
          >
            {danhSachTuyChon.map((tc) => (
              <option key={tc.giaTri} value={tc.giaTri}>
                {tc.nhan}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (dinhNghia.kieu === 'password' || dinhNghia.biMat) {
      const dangCheDau =
        giaTriHienTai === MAT_NA_KHOA_BI_MAT && !dangNhapKhoaBiMatMoi[dinhNghia.khoa];
      const hienMatKhau = Boolean(hienThiKhoaBiMat[dinhNghia.khoa]);
      const daMoKhoa = Boolean(daMoKhoaNhap[dinhNghia.khoa]);

      if (dangCheDau) {
        return (
          <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)]">
            <Lock className="w-3.5 h-3.5 text-[var(--accent)] stroke-[1.5] shrink-0" />
            <span className="font-mono text-xs text-[var(--muted)] tracking-widest">
              ••••••••
            </span>
            <button
              type="button"
              onClick={() => {
                setDangNhapKhoaBiMatMoi((truoc) => ({ ...truoc, [dinhNghia.khoa]: true }));
                setDaMoKhoaNhap((truoc) => ({ ...truoc, [dinhNghia.khoa]: true }));
                thayDoiGiaTri(dinhNghia.khoa, '');
              }}
              className="px-2 py-0.5 text-xs font-semibold text-[var(--text)] bg-[var(--surface)] hover:bg-[var(--active-bg)] border border-[var(--border)] rounded-[var(--radius)] focus-visible:outline-none focus-visible:border-[var(--accent)] transition-colors cursor-pointer"
            >
              Thay đổi
            </button>
          </div>
        );
      }

      return (
        <div className="w-full sm:w-auto flex flex-col sm:items-end gap-1">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-[220px]">
              {/* Dùng type="text" + WebkitTextSecurity + readOnly trước khi focus để trình duyệt tuyệt đối không tự động điền mật khẩu đã lưu */}
              <input
                type="text"
                name={`khong_tu_dien_${dinhNghia.khoa.replace(/\./g, '_')}`}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-lpignore="true"
                data-1p-ignore="true"
                data-bwignore="true"
                data-form-type="other"
                readOnly={!daMoKhoa}
                onPointerDown={() => {
                  if (!daMoKhoa) {
                    setDaMoKhoaNhap((truoc) => ({ ...truoc, [dinhNghia.khoa]: true }));
                  }
                }}
                onFocus={() => {
                  if (!daMoKhoa) {
                    setDaMoKhoaNhap((truoc) => ({ ...truoc, [dinhNghia.khoa]: true }));
                  }
                }}
                data-input-khoa={dinhNghia.khoa}
                value={giaTriHienTai === MAT_NA_KHOA_BI_MAT ? '' : giaTriHienTai}
                placeholder="Để trống nếu giữ nguyên..."
                onChange={(e) => {
                  if (!daMoKhoa) return;
                  thayDoiGiaTri(dinhNghia.khoa, e.target.value);
                }}
                style={
                  !hienMatKhau && giaTriHienTai && giaTriHienTai !== MAT_NA_KHOA_BI_MAT
                    ? ({ WebkitTextSecurity: 'disc' } as React.CSSProperties)
                    : undefined
                }
                className="w-full pl-2.5 pr-8 py-1.5 text-xs font-mono bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
              <button
                type="button"
                onClick={() =>
                  setHienThiKhoaBiMat((truoc) => ({
                    ...truoc,
                    [dinhNghia.khoa]: !truoc[dinhNghia.khoa],
                  }))
                }
                title={hienMatKhau ? 'Ẩn ký tự' : 'Hiện ký tự'}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-[var(--muted)] hover:text-[var(--text)] rounded-[var(--radius)] cursor-pointer"
              >
                {hienMatKhau ? (
                  <EyeOff className="w-3.5 h-3.5 stroke-[1.5]" />
                ) : (
                  <Eye className="w-3.5 h-3.5 stroke-[1.5]" />
                )}
              </button>
            </div>
            {goc === MAT_NA_KHOA_BI_MAT && (
              <button
                type="button"
                onClick={() => hoanTacMotTruong(dinhNghia)}
                title="Giữ nguyên khóa đang lưu trên máy chủ"
                className="px-2 py-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] transition-colors cursor-pointer shrink-0"
              >
                Giữ nguyên
              </button>
            )}
          </div>
        </div>
      );
    }

    if (dinhNghia.kieu === 'textarea') {
      return (
        <div className="w-full sm:w-[320px] lg:w-[380px] flex flex-col gap-1">
          <textarea
            rows={2}
            data-input-khoa={dinhNghia.khoa}
            value={giaTriHienTai}
            placeholder={dinhNghia.placeholder}
            onChange={(e) => thayDoiGiaTri(dinhNghia.khoa, e.target.value)}
            className={`w-full px-2.5 py-1.5 text-xs bg-[var(--bg)] border rounded-[var(--radius)] text-[var(--text)] focus:outline-none transition-colors leading-relaxed resize-y ${
              loiTruong
                ? 'border-[var(--danger)] focus:border-[var(--danger)]'
                : 'border-[var(--border)] focus:border-[var(--accent)]'
            }`}
          />
          {loiTruong && (
            <p className="text-[11px] text-[var(--danger)] sm:text-right">{loiTruong}</p>
          )}
        </div>
      );
    }

    if (dinhNghia.kieu === 'number') {
      const buoc = dinhNghia.buocNhay ?? 1;
      const soHienTai = Number(giaTriHienTai);
      const laThoiGianPhien = dinhNghia.khoa === 'bao_mat.thoi_gian_phien_giay';

      const dieuChinhTheoBuoc = (huong: -1 | 1) => {
        const nen = Number.isNaN(soHienTai) ? Number(dinhNghia.macDinh) || 0 : soHienTai;
        let moi = Number((nen + huong * buoc).toFixed(4));
        if (dinhNghia.min !== undefined && moi < dinhNghia.min) moi = dinhNghia.min;
        if (dinhNghia.max !== undefined && moi > dinhNghia.max) moi = dinhNghia.max;
        thayDoiGiaTri(dinhNghia.khoa, String(moi));
      };

      return (
        <div className="flex flex-col sm:items-end gap-1">
          <div className="inline-flex items-center gap-1.5">
            {laThoiGianPhien && !loiTruong && (
              <span className="px-2 py-1 text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] border border-[var(--accent)] rounded-[var(--radius)] whitespace-nowrap">
                ≈ {doiGiaySangChuoiThoiGian(giaTriHienTai)}
              </span>
            )}

            <div
              className={`inline-flex items-stretch rounded-[var(--radius)] border bg-[var(--bg)] overflow-hidden transition-colors ${
                loiTruong
                  ? 'border-[var(--danger)]'
                  : 'border-[var(--border)] focus-within:border-[var(--accent)]'
              }`}
            >
              <button
                type="button"
                tabIndex={-1}
                onClick={() => dieuChinhTheoBuoc(-1)}
                disabled={dinhNghia.min !== undefined && !Number.isNaN(soHienTai) && soHienTai <= dinhNghia.min}
                title={`Giảm ${buoc}${dinhNghia.donVi ? ` ${dinhNghia.donVi}` : ''}`}
                className="px-2 py-1.5 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--active-bg)] border-r border-[var(--border)] disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Minus className="w-3 h-3 stroke-[1.5]" />
              </button>

              <input
                type="number"
                data-input-khoa={dinhNghia.khoa}
                min={dinhNghia.min}
                max={dinhNghia.max}
                step={buoc}
                value={giaTriHienTai}
                placeholder={dinhNghia.placeholder}
                onChange={(e) => thayDoiGiaTri(dinhNghia.khoa, e.target.value)}
                aria-invalid={Boolean(loiTruong)}
                className="w-[76px] px-2 py-1.5 text-xs font-mono tabular-nums text-right bg-transparent text-[var(--text)] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />

              {dinhNghia.donVi && (
                <span className="px-2 py-1.5 text-[11px] font-mono text-[var(--muted)] bg-[var(--surface)] border-l border-[var(--border)] select-none whitespace-nowrap flex items-center">
                  {dinhNghia.donVi}
                </span>
              )}

              <button
                type="button"
                tabIndex={-1}
                onClick={() => dieuChinhTheoBuoc(1)}
                disabled={dinhNghia.max !== undefined && !Number.isNaN(soHienTai) && soHienTai >= dinhNghia.max}
                title={`Tăng ${buoc}${dinhNghia.donVi ? ` ${dinhNghia.donVi}` : ''}`}
                className="px-2 py-1.5 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--active-bg)] border-l border-[var(--border)] disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3 stroke-[1.5]" />
              </button>
            </div>
          </div>

          {loiTruong ? (
            <p className="text-xs text-[var(--danger)] font-medium sm:text-right">
              {loiTruong}
            </p>
          ) : (
            dinhNghia.min !== undefined &&
            dinhNghia.max !== undefined && (
              <span className="text-xs font-mono text-[var(--muted)] tabular-nums">
                Giới hạn: {dinhNghia.min}–{dinhNghia.max} {dinhNghia.donVi || ''}
              </span>
            )
          )}
        </div>
      );
    }

    // Mặc định: kiểu text ngắn hoặc vừa (Mục C.9: thu gọn ô nhập vừa nội dung)
    const laTruongRongVua =
      dinhNghia.khoa === 'chung.khau_hieu' ||
      dinhNghia.khoa === 'chung.banner_tieu_de' ||
      dinhNghia.khoa === 'bai_tap.dinh_dang_tep_cho_phep' ||
      dinhNghia.khoa === 'tro_ly_ai.url_may_chu_tuy_chinh' ||
      dinhNghia.khoa === 'thong_bao.tieu_de_hop_thoai_he_thong';

    const laMaNgan =
      dinhNghia.khoa === 'chung.ma_so_sinh_vien' ||
      dinhNghia.khoa === 'chung.ma_lop_khoa' ||
      dinhNghia.khoa === 'chung.so_dien_thoai_lien_he';

    const lopDoRong = laMaNgan
      ? 'w-full sm:w-[160px]'
      : laTruongRongVua
        ? 'w-full sm:w-[280px]'
        : 'w-full sm:w-[210px]';

    const chanTuDien = dinhNghia.khoa === 'email.tai_khoan_smtp';
    const daMoKhoaText = !chanTuDien || Boolean(daMoKhoaNhap[dinhNghia.khoa]);

    return (
      <div className="w-full sm:w-auto flex flex-col sm:items-end gap-1">
        <input
          type="text"
          name={`khong_tu_dien_${dinhNghia.khoa.replace(/\./g, '_')}`}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          data-lpignore="true"
          data-1p-ignore="true"
          data-bwignore="true"
          data-form-type="other"
          readOnly={!daMoKhoaText}
          onPointerDown={() => {
            if (!daMoKhoaText) {
              setDaMoKhoaNhap((truoc) => ({ ...truoc, [dinhNghia.khoa]: true }));
            }
          }}
          onFocus={() => {
            if (!daMoKhoaText) {
              setDaMoKhoaNhap((truoc) => ({ ...truoc, [dinhNghia.khoa]: true }));
            }
          }}
          data-input-khoa={dinhNghia.khoa}
          value={giaTriHienTai}
          placeholder={dinhNghia.placeholder}
          onChange={(e) => {
            if (!daMoKhoaText) return;
            thayDoiGiaTri(dinhNghia.khoa, e.target.value);
          }}
          aria-invalid={Boolean(loiTruong)}
          className={`${lopDoRong} px-2.5 py-1.5 text-xs bg-[var(--bg)] border rounded-[var(--radius)] text-[var(--text)] focus:outline-none transition-colors ${
            loiTruong
              ? 'border-[var(--danger)] focus:border-[var(--danger)]'
              : 'border-[var(--border)] focus:border-[var(--accent)]'
          }`}
        />

        {loiTruong && (
          <p className="text-xs text-[var(--danger)] font-medium sm:text-right">{loiTruong}</p>
        )}

        {dinhNghia.goiYNhanh && dinhNghia.goiYNhanh.length > 0 && (
          <div className="flex flex-wrap items-center justify-end gap-1 pt-0.5">
            {dinhNghia.goiYNhanh.map((mucGoiY) => {
              const dangChon = giaTriHienTai === mucGoiY.giaTri;
              return (
                <button
                  key={mucGoiY.giaTri}
                  type="button"
                  onClick={() => thayDoiGiaTri(dinhNghia.khoa, mucGoiY.giaTri)}
                  className={`px-2 py-0.5 text-[11px] font-mono rounded-[var(--radius)] border transition-colors cursor-pointer ${
                    dangChon
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)] font-semibold'
                      : 'bg-[var(--surface)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)] hover:bg-[var(--active-bg)]'
                  }`}
                >
                  {mucGoiY.nhan}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-5 max-w-7xl mx-auto space-y-4">
      {/* ĐẦU TRANG: TIÊU ĐỀ + Ô TÌM KIẾM TOÀN CỤC + NÚT TẢI LẠI DỮ LIỆU */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3.5 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] text-[var(--accent)] flex items-center justify-center shrink-0">
            <Settings className="w-4 h-4 stroke-[1.5]" />
          </div>
          <div>
            <p className="eyebrow">QUẢN TRỊ HỆ THỐNG TRƯỜNG HỌC</p>
            <h1 className="text-[22px] font-mono font-bold tracking-tight text-[var(--text)] leading-tight">
              Cài đặt Hệ thống
            </h1>
          </div>
        </div>

        {/* Ô tìm kiếm cài đặt ở đầu trang (hỗ trợ phím tắt '/') + nút Tải lại dữ liệu */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-3.5 h-3.5 text-[var(--muted)] stroke-[1.5] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={oTimKiemRef}
              type="text"
              value={tuKhoaTimKiem}
              onChange={(e) => setTuKhoaTimKiem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && danhSachMucHienThi.length > 0) {
                  e.preventDefault();
                  nhayToiMucCaiDat(danhSachMucHienThi[0].khoa);
                } else if (e.key === 'Escape' && tuKhoaTimKiem) {
                  e.preventDefault();
                  setTuKhoaTimKiem('');
                }
              }}
              placeholder="Tìm cài đặt, khóa hoặc mô tả..."
              aria-label="Tìm kiếm cài đặt hệ thống"
              className="w-full pl-8 pr-9 py-1.5 text-xs bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
            {tuKhoaTimKiem ? (
              <button
                type="button"
                onClick={() => setTuKhoaTimKiem('')}
                title="Xóa từ khóa tìm kiếm"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--muted)] hover:text-[var(--text)] rounded-[var(--radius)] cursor-pointer"
              >
                <X className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[11px] font-mono text-[var(--muted)] bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)] pointer-events-none">
                /
              </kbd>
            )}
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Mở trang chủ cổng thông tin công khai (/)"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] hover:bg-[var(--active-bg)] focus-visible:outline-none focus-visible:border-[var(--accent)] transition-colors cursor-pointer shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5 stroke-[1.5] text-[var(--accent)]" />
            <span>Trang chủ</span>
          </a>

          <button
            type="button"
            onClick={xuLyBamTaiLaiDuLieu}
            disabled={isLoading || isRefetching}
            title="Tải lại giá trị đang lưu trên máy chủ"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] hover:bg-[var(--active-bg)] focus-visible:outline-none focus-visible:border-[var(--accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 stroke-[1.5] ${isRefetching ? 'animate-spin' : ''}`}
            />
            <span>Tải lại dữ liệu</span>
          </button>
        </div>
      </div>

      {/* CHỌN NHÓM BẰNG <SELECT> KHI MÀN HÌNH DƯỚI 960PX (MỤC C.11) */}
      <div className="min-[960px]:hidden bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-3">
        <label
          htmlFor="chon-nhom-cai-dat-di-dong"
          className="block eyebrow mb-1.5"
        >
          NHÓM CẤU HÌNH ({danhSachNhomHienThi.length})
        </label>
        <select
          id="chon-nhom-cai-dat-di-dong"
          value={nhomHienTai}
          onChange={(e) => xuLyChonNhom(e.target.value as MaNhomCaiDat)}
          className="w-full px-3 py-2 text-xs font-mono bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
        >
          {danhSachNhomHienThi.map((nhom) => {
            const soMuc = soMucTheoNhom[nhom.ma] || 0;
            const soSua = soThayDoiTheoNhom[nhom.ma] || 0;
            return (
              <option key={nhom.ma} value={nhom.ma}>
                {nhom.ten} ({soMuc} mục{soSua > 0 ? ` · ${soSua} đã sửa` : ''})
              </option>
            );
          })}
        </select>
      </div>

      {/* BỐ CỤC CHÍNH: MENU DỌC BÊN TRÁI (>= 960PX) + NỘI DUNG BÊN PHẢI */}
      <div className="flex flex-col min-[960px]:flex-row gap-5 items-start">
        {/* MENU DỌC BÊN TRÁI (MỤC C.11 & C.12) */}
        <aside className="hidden min-[960px]:block w-[320px] shrink-0 sticky top-4">
          <nav
            aria-label="Danh mục nhóm cài đặt hệ thống"
            className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] py-1.5 overflow-hidden"
          >
            <div className="px-3.5 py-1.5 border-b border-[var(--border)] flex items-center justify-between">
              <span className="eyebrow">PHÂN HỆ CẤU HÌNH</span>
              <span className="font-mono text-xs text-[var(--muted)] tabular-nums">
                {danhSachDinhNghiaToanBo.length} mục
              </span>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {danhSachNhomHienThi.map((nhom) => {
                const dangChon = !dangTimKiem && nhomHienTai === nhom.ma;
                const soMuc = soMucTheoNhom[nhom.ma] || 0;
                const soSua = soThayDoiTheoNhom[nhom.ma] || 0;
                const BieuTuong = nhom.bieuTuong;

                return (
                  <button
                    key={nhom.ma}
                    type="button"
                    data-id={nhom.ma}
                    data-tab={nhom.ma}
                    aria-current={dangChon ? 'page' : undefined}
                    onClick={() => xuLyChonNhom(nhom.ma)}
                    className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-2.5 transition-colors duration-150 focus-visible:outline-none cursor-pointer ${
                      dangChon
                        ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-medium border-l-[3px] border-l-[var(--accent)]'
                        : 'text-[var(--text)] font-normal border-l-[3px] border-l-transparent hover:bg-[var(--active-bg)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <BieuTuong
                        strokeWidth={1.5}
                        className={`w-4 h-4 shrink-0 ${
                          dangChon ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
                        }`}
                      />
                      <span className="font-mono text-[13px] leading-snug text-left">
                        {nhom.ten}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {soSua > 0 && (
                        <span
                          title={`${soSua} cài đặt đã thay đổi`}
                          className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
                        />
                      )}
                      <span
                        className={`text-xs font-mono tabular-nums text-right min-w-[20px] ${
                          dangChon ? 'text-[var(--accent)] font-medium' : 'text-[var(--muted)]'
                        }`}
                      >
                        {soMuc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* VÙNG NỘI DUNG BÊN PHẢI */}
        <main className="flex-1 min-w-0 w-full space-y-3">
          {isLoading ? (
            <div className="bg-[var(--surface)] rounded-[var(--radius)] border border-[var(--border)] p-4 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4 py-2.5 border-b border-[var(--border)] last:border-0"
                >
                  <div className="space-y-1.5 flex-1">
                    <KhungXuong className="h-4 w-48" />
                    <KhungXuong className="h-3 w-36" />
                  </div>
                  <KhungXuong className="h-8 w-36" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* KHUNG TIÊU ĐỀ NHÓM ĐANG CHỌN (ĐỒNG BỘ 100% VỚI TRẠNG THÁI NHÓM - MỤC A.1) */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] px-4 py-3.5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="eyebrow">
                      {dangTimKiem
                        ? `TÌM KIẾM TRÊN TOÀN BỘ HỆ THỐNG · ${danhSachMucHienThi.length} KẾT QUẢ`
                        : `${thongTinNhomHienTai.eyebrow} · ${danhSachMucHienThi.length} CÀI ĐẶT`}
                    </p>
                    <h2 className="font-mono text-[17px] font-bold text-[var(--text)]">
                      {dangTimKiem
                        ? `Kết quả cho "${tuKhoaTimKiem}"`
                        : thongTinNhomHienTai.ten}
                    </h2>
                    <p className="text-xs text-[var(--muted)]">
                      {dangTimKiem
                        ? 'Hiển thị các mục khớp nhãn tiếng Việt, khóa kỹ thuật hoặc mô tả.'
                        : thongTinNhomHienTai.moTa}
                    </p>
                  </div>

                  {/* Các nút thao tác đặc thù của nhóm */}
                  {!dangTimKiem && (
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {(nhomHienTai === 'chung' || nhomHienTai === 'giao_dien') && (
                        <a
                          href="/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--accent)] bg-[var(--accent-soft)] border border-[var(--accent)] rounded-[var(--radius)] hover:opacity-90 focus-visible:outline-none transition-opacity cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5 stroke-[1.5]" />
                          <span>Xem trang chủ công khai</span>
                        </a>
                      )}

                      {nhomHienTai === 'tro_ly_ai' && (
                        <button
                          type="button"
                          onClick={xuLyKiemTraKetNoiAi}
                          disabled={dangKiemTraAi}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[var(--accent)] rounded-[var(--radius)] hover:opacity-95 focus-visible:outline-none transition-opacity disabled:opacity-50 cursor-pointer"
                        >
                          {dangKiemTraAi ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin stroke-[1.5]" />
                          ) : (
                            <Zap className="w-3.5 h-3.5 stroke-[1.5]" />
                          )}
                          <span>
                            {dangKiemTraAi ? 'Đang kiểm tra...' : 'Kiểm tra kết nối AI'}
                          </span>
                        </button>
                      )}

                      {nhomHienTai === 'email' && (
                        <button
                          type="button"
                          onClick={xuLyKiemTraKetNoiSmtp}
                          disabled={dangKiemTraSmtp}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[var(--accent)] rounded-[var(--radius)] hover:opacity-95 focus-visible:outline-none transition-opacity disabled:opacity-50 cursor-pointer"
                        >
                          {dangKiemTraSmtp ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin stroke-[1.5]" />
                          ) : (
                            <Mail className="w-3.5 h-3.5 stroke-[1.5]" />
                          )}
                          <span>
                            {dangKiemTraSmtp ? 'Đang kiểm tra...' : 'Kiểm tra máy chủ thư'}
                          </span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setNhomCanKhoiPhuc(thongTinNhomHienTai)}
                        disabled={dotKhoiPhucNhom.isPending}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)] hover:bg-[var(--active-bg)] focus-visible:outline-none focus-visible:border-[var(--accent)] transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 stroke-[1.5]" />
                        <span>Khôi phục mặc định nhóm</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Kết quả kiểm tra kết nối AI */}
                {!dangTimKiem && nhomHienTai === 'tro_ly_ai' && ketQuaKiemTraAi && (
                  <div
                    className={`p-3 rounded-[var(--radius)] border flex items-start gap-2 text-xs ${
                      ketQuaKiemTraAi.thanhCong
                        ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--text)]'
                        : 'bg-[var(--danger-soft)] border-[var(--danger)] text-[var(--danger)]'
                    }`}
                  >
                    {ketQuaKiemTraAi.thanhCong ? (
                      <CheckCircle2 className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5 stroke-[1.5]" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[var(--danger)] shrink-0 mt-0.5 stroke-[1.5]" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-mono font-bold">
                        <span>
                          {ketQuaKiemTraAi.thanhCong
                            ? 'Kết nối mô hình thành công'
                            : 'Không thể kết nối mô hình'}
                        </span>
                        {ketQuaKiemTraAi.doTreMs !== undefined && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] tabular-nums">
                            {ketQuaKiemTraAi.doTreMs} ms
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5">{ketQuaKiemTraAi.thongDiep}</p>
                    </div>
                  </div>
                )}

                {/* Liên kết lấy mã khóa API miễn phí ở nhóm Trợ lý AI */}
                {!dangTimKiem && nhomHienTai === 'tro_ly_ai' && (
                  <div className="px-3 py-2 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--muted)] flex flex-wrap items-center justify-between gap-2">
                    <span>Hỗ trợ Google Gemini, Groq Cloud, OpenAI và máy chủ Ollama nội bộ.</span>
                    <div className="flex items-center gap-3 shrink-0">
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-[var(--accent)] hover:underline"
                      >
                        Khóa Google Gemini <ExternalLink className="w-3 h-3 stroke-[1.5]" />
                      </a>
                      <span>·</span>
                      <a
                        href="https://console.groq.com/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-[var(--accent)] hover:underline"
                      >
                        Khóa Groq Cloud <ExternalLink className="w-3 h-3 stroke-[1.5]" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Kết quả kiểm tra kết nối SMTP */}
                {!dangTimKiem && nhomHienTai === 'email' && ketQuaKiemTraSmtp && (
                  <div
                    className={`p-3 rounded-[var(--radius)] border flex items-start gap-2 text-xs ${
                      ketQuaKiemTraSmtp.thanhCong
                        ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--text)]'
                        : 'bg-[var(--danger-soft)] border-[var(--danger)] text-[var(--danger)]'
                    }`}
                  >
                    {ketQuaKiemTraSmtp.thanhCong ? (
                      <CheckCircle2 className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5 stroke-[1.5]" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[var(--danger)] shrink-0 mt-0.5 stroke-[1.5]" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-mono font-bold">
                        <span>
                          {ketQuaKiemTraSmtp.thanhCong
                            ? 'Máy chủ SMTP phản hồi tốt'
                            : 'Kiểm tra kết nối SMTP thất bại'}
                        </span>
                        {ketQuaKiemTraSmtp.doTreMs !== undefined && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] tabular-nums">
                            {ketQuaKiemTraSmtp.doTreMs} ms
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5">{ketQuaKiemTraSmtp.thongDiep}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* DANH SÁCH CÁC NHÓM CON (SUB-GROUPS CÓ TIÊU ĐỀ EYEBROW MONO & ĐÓNG/MỞ - MỤC C.10) */}
              {danhSachPhanNhom.length === 0 ? (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-8 text-center space-y-1.5">
                  <p className="font-mono text-sm font-bold text-[var(--text)]">
                    Không tìm thấy cài đặt phù hợp
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    Hãy thử từ khóa khác hoặc xóa bộ lọc tìm kiếm để xem toàn bộ danh mục.
                  </p>
                </div>
              ) : (
                danhSachPhanNhom.map((phanNhom) => {
                  const biThuGon = !dangTimKiem && Boolean(nhomConBiDong[phanNhom.maPhanNhom]);

                  return (
                    <section
                      key={phanNhom.maPhanNhom}
                      id={`phan-nhom-${phanNhom.maPhanNhom}`}
                      className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden"
                    >
                      {/* Thanh tiêu đề nhóm con (Eyebrow Mono) cho phép thu gọn / mở rộng */}
                      <button
                        type="button"
                        onClick={() => doiTrangThaiNhomCon(phanNhom.maPhanNhom)}
                        aria-expanded={!biThuGon}
                        className="w-full px-4 py-2.5 bg-[var(--bg)] border-b border-[var(--border)] flex items-center justify-between gap-2 text-left hover:bg-[var(--active-bg)] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {biThuGon ? (
                            <ChevronRight className="w-3.5 h-3.5 text-[var(--muted)] stroke-[1.5] shrink-0" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-[var(--muted)] stroke-[1.5] shrink-0" />
                          )}
                          <span className="eyebrow text-[var(--text)] font-medium">
                            {phanNhom.tieuDe}
                          </span>
                          {dangTimKiem && (
                            <span className="px-1.5 py-0.5 text-[10px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] border border-[var(--accent)] rounded-[var(--radius)]">
                              {phanNhom.tenNhomLon}
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] font-mono text-[var(--muted)] tabular-nums shrink-0">
                          {phanNhom.danhSachMuc.length} mục
                        </span>
                      </button>

                      {/* Danh sách các dòng cài đặt gọn (1 hàng ngang mỗi mục - Mục C.9) */}
                      {!biThuGon && (
                        <div className="divide-y divide-[var(--border)]">
                          {phanNhom.danhSachMuc.map((dinhNghia) => {
                            const giaTriHienTai = formValues[dinhNghia.khoa] ?? dinhNghia.macDinh;
                            const goc = giaTriGoc[dinhNghia.khoa] ?? dinhNghia.macDinh;
                            const daSuaSoVoiMayChu = giaTriHienTai !== goc;
                            const khacMacDinh =
                              !dinhNghia.biMat &&
                              dinhNghia.kieu !== 'password' &&
                              giaTriHienTai !== dinhNghia.macDinh;
                            const coLoiDong = Boolean(banDoLoiHopLe[dinhNghia.khoa]);
                            const dangMoRongMoTa = Boolean(moRongMoTa[dinhNghia.khoa]);
                            const dangMoRongMacDinh = Boolean(moRongMacDinh[dinhNghia.khoa]);
                            const laKieuBangJson =
                              (dinhNghia.kieu === 'json' &&
                                dinhNghia.khoa === 'hoc_vu.mau_cot_diem_mac_dinh') ||
                              dinhNghia.kieu === 'color' ||
                              laKhoaDanhSachDuoiTep(dinhNghia.khoa);

                            const chuoiMacDinh = dinhDangGiaTriMacDinhHienThi(dinhNghia);
                            const macDinhDai = chuoiMacDinh.length > 36;
                            const chuoiMacDinhRutGon = macDinhDai
                              ? laKhoaDanhSachDuoiTep(dinhNghia.khoa)
                                ? (() => {
                                    const mang = tachDanhSachDuoiTep(dinhNghia.macDinh);
                                    return mang.length > 6
                                      ? `${mang
                                          .slice(0, 6)
                                          .map((d) => `.${d}`)
                                          .join(', ')} (+${mang.length - 6} định dạng)`
                                      : chuoiMacDinh;
                                  })()
                                : `${chuoiMacDinh.slice(0, 36)}...`
                              : chuoiMacDinh;

                            const dangDuocNhayDen = khoaDangNhayDen === dinhNghia.khoa;

                            return (
                              <div
                                key={dinhNghia.khoa}
                                id={`dong-cai-dat-${dinhNghia.khoa}`}
                                className={`px-4 py-3 transition-colors scroll-mt-24 ${
                                  dangDuocNhayDen
                                    ? 'bg-[var(--accent-soft)] ring-1 ring-inset ring-[var(--accent)]'
                                    : coLoiDong
                                      ? 'bg-[var(--danger-soft)]/35'
                                      : daSuaSoVoiMayChu
                                        ? 'bg-[var(--accent-soft)]/25'
                                        : ''
                                } ${
                                  laKieuBangJson
                                    ? 'space-y-2.5'
                                    : 'flex flex-col sm:flex-row sm:items-center justify-between gap-3'
                                }`}
                              >
                                {/* Cột trái: Nhãn tiếng Việt + Chấm 6px + Khóa kỹ thuật + Mô tả 2 dòng */}
                                <div className="min-w-0 flex-1 space-y-1 pr-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {/* Chấm tròn 6px màu accent khi giá trị khác máy chủ (Mục D.17) */}
                                    {daSuaSoVoiMayChu && (
                                      <span
                                        title="Đã thay đổi so với giá trị đang lưu"
                                        className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0"
                                      />
                                    )}

                                    <label className="text-[13px] font-semibold text-[var(--text)] leading-snug">
                                      {dinhNghia.nhan || taoNhanTamTuKhoa(dinhNghia.khoa)}
                                    </label>

                                    {dangDuocNhayDen && (
                                      <span className="px-1.5 py-0.5 text-[11px] font-mono font-semibold text-[var(--accent)] bg-[var(--surface)] border border-[var(--accent)] rounded-[var(--radius)]">
                                        Đang chọn
                                      </span>
                                    )}

                                    {dangTimKiem && (
                                      <button
                                        type="button"
                                        onClick={() => nhayToiMucCaiDat(dinhNghia.khoa)}
                                        title="Chuyển tới nhóm chứa mục này và cuộn tới đúng dòng"
                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] border border-[var(--accent)]/40 hover:border-[var(--accent)] rounded-[var(--radius)] cursor-pointer transition-colors"
                                      >
                                        Đi tới mục này →
                                      </button>
                                    )}

                                    {/* Huy hiệu 'Ảnh hưởng dữ liệu' cho cài đặt nguy hiểm (Mục E.20) */}
                                    {dinhNghia.nguyHiem && (
                                      <span
                                        title={
                                          dinhNghia.canhBaoNguyHiem ||
                                          'Cài đặt ảnh hưởng tới dữ liệu hoặc quy chế vận hành'
                                        }
                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-mono text-[var(--warning)] bg-[var(--warning-soft)] border border-[var(--warning)] rounded-[var(--radius)]"
                                      >
                                        <AlertTriangle className="w-3 h-3 stroke-[1.5]" />
                                        Ảnh hưởng dữ liệu
                                      </span>
                                    )}
                                  </div>

                                  {/* Khóa kỹ thuật font mono 12px độ tương phản rõ + Giá trị mặc định & nút Khôi phục mặc định */}
                                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-mono text-[var(--muted)]">
                                    <code className="px-1.5 py-0.5 break-all text-xs font-mono text-[var(--text)]/85 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)]">
                                      {dinhNghia.khoa}
                                    </code>

                                    {!dinhNghia.biMat &&
                                      dinhNghia.kieu !== 'password' &&
                                      !macDinhDai && (
                                        <span className="inline-flex items-center gap-1 text-xs font-mono text-[var(--muted)]">
                                          <span>Mặc định:</span>
                                          <span className="text-[var(--text)]/85 font-medium">
                                            {chuoiMacDinh}
                                          </span>
                                        </span>
                                      )}

                                    {khacMacDinh && (
                                      <button
                                        type="button"
                                        onClick={() => khoiPhucMacDinhMotTruong(dinhNghia)}
                                        className="inline-flex items-center gap-1 text-xs font-sans font-semibold text-[var(--accent)] hover:underline cursor-pointer"
                                      >
                                        Khôi phục mặc định
                                      </button>
                                    )}

                                    {daSuaSoVoiMayChu && (
                                      <button
                                        type="button"
                                        onClick={() => hoanTacMotTruong(dinhNghia)}
                                        className="inline-flex items-center gap-1 text-xs font-sans font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:underline cursor-pointer"
                                      >
                                        <RotateCcw className="w-3 h-3 stroke-[1.5]" />
                                        Hoàn tác
                                      </button>
                                    )}
                                  </div>

                                  {/* Dòng Mặc định riêng cho các mục có giá trị mặc định dài (không để dấu chấm lơ lửng đầu dòng) */}
                                  {!dinhNghia.biMat &&
                                    dinhNghia.kieu !== 'password' &&
                                    macDinhDai && (
                                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-mono text-[var(--muted)]">
                                        <span>
                                          Mặc định:{' '}
                                          <span className="text-[var(--text)]/85 font-medium break-all">
                                            {dangMoRongMacDinh ? chuoiMacDinh : chuoiMacDinhRutGon}
                                          </span>
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setMoRongMacDinh((truoc) => ({
                                              ...truoc,
                                              [dinhNghia.khoa]: !truoc[dinhNghia.khoa],
                                            }))
                                          }
                                          className="text-xs font-sans font-semibold text-[var(--accent)] hover:underline cursor-pointer"
                                        >
                                          {dangMoRongMacDinh ? 'Thu gọn' : 'Xem thêm'}
                                        </button>
                                      </div>
                                    )}

                                  {/* Mô tả tối đa 2 dòng + chỉ hiện nút Xem thêm khi thật sự bị cắt (scrollHeight > clientHeight) */}
                                  <MoTaCaiDatCoThuGon
                                    moTa={dinhNghia.moTa}
                                    dangMoRong={dangMoRongMoTa}
                                    onDoiMoRong={() =>
                                      setMoRongMoTa((truoc) => ({
                                        ...truoc,
                                        [dinhNghia.khoa]: !truoc[dinhNghia.khoa],
                                      }))
                                    }
                                  />
                                </div>

                                {/* Cột phải: Ô điều khiển gọn theo đúng kiểu dữ liệu */}
                                <div className={laKieuBangJson ? 'w-full' : 'shrink-0'}>
                                  {renderDieuKhien(dinhNghia)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Xem trước Hộp thông báo học vụ ở nhóm Thông báo */}
                      {!biThuGon &&
                        phanNhom.nhom === 'thong_bao' &&
                        phanNhom.maPhanNhom.endsWith('hop-thoai-ban-tin') && (
                          <div className="px-4 py-3 bg-[var(--bg)] border-t border-[var(--border)] space-y-2">
                            <p className="eyebrow">XEM TRƯỚC HỘP THÔNG BÁO HỌC VỤ</p>
                            <HopThongBao
                              loai={
                                (['info', 'success', 'warning', 'danger'].includes(
                                  formValues['thong_bao.loai_hop_thoai_he_thong'] || 'info',
                                )
                                  ? formValues['thong_bao.loai_hop_thoai_he_thong']
                                  : 'info') as LoaiThongBao
                              }
                              eyebrow="THÔNG BÁO ĐÀO TẠO"
                              tieuDe={
                                formValues['thong_bao.tieu_de_hop_thoai_he_thong'] ||
                                'Đồng bộ dữ liệu chuyên cần & Lịch thi học kỳ'
                              }
                              thoiGian="Xem trước"
                            >
                              {formValues['thong_bao.noi_dung_hop_thoai_he_thong'] ||
                                'Nội dung thông báo học vụ sẽ hiển thị tại đây.'}
                            </HopThongBao>
                          </div>
                        )}
                    </section>
                  );
                })
              )}

              {/* THANH LƯU CỐ ĐỊNH Ở ĐÁY VÙNG NỘI DUNG (CHỈ HIỆN KHI CÓ THAY ĐỔI - MỤC D.14 & D.15) */}
              {dangThayDoi && (
                <div className="sticky bottom-4 z-20 p-3 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--accent)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-xs text-[var(--text)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0" />
                    <span>
                      <strong className="font-mono tabular-nums">
                        {danhSachMucThayDoi.length}
                      </strong>{' '}
                      cài đặt đã thay đổi
                    </span>
                    {coLoiHopLe && (
                      <span className="text-[var(--danger)] font-semibold">
                        · {danhSachKhoaBiLoi.length} mục chưa hợp lệ
                      </span>
                    )}
                    {!coLoiHopLe && danhSachThayDoiNguyHiem.length > 0 && (
                      <span className="text-[var(--warning)] font-semibold">
                        · {danhSachThayDoiNguyHiem.length} mục ảnh hưởng dữ liệu
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={xuLyHoanTacTatCa}
                      disabled={dotCapNhat.isPending}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--text)] bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)] hover:bg-[var(--active-bg)] focus-visible:outline-none focus-visible:border-[var(--accent)] transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 stroke-[1.5]" />
                      <span>Hoàn tác</span>
                    </button>

                    <button
                      type="button"
                      onClick={xuLyBamLuuThayDoi}
                      disabled={dotCapNhat.isPending || coLoiHopLe}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[var(--accent)] border border-[var(--accent)] rounded-[var(--radius)] hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] transition-opacity disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {dotCapNhat.isPending ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin stroke-[1.5]" />
                      ) : (
                        <Save className="w-3.5 h-3.5 stroke-[1.5]" />
                      )}
                      <span>{dotCapNhat.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* HỘP THOẠI XÁC NHẬN KHI LƯU CÁC CÀI ĐẶT NGUY HIỂM ('ẢNH HƯỞNG DỮ LIỆU' - MỤC E.20) */}
      <HopThoai
        mo={moHopThoaiXacNhanNguyHiem}
        onDong={() => setMoHopThoaiXacNhanNguyHiem(false)}
        eyebrow="XÁC NHẬN CÀI ĐẶT ẢNH HƯỞNG DỮ LIỆU"
        tieuDe="Xác nhận thay đổi thông số quan trọng"
        moTa="Các cài đặt dưới đây có ảnh hưởng trực tiếp tới dữ liệu điểm số, điểm danh hoặc an toàn đăng nhập. Vui lòng kiểm tra giá trị cũ và mới trước khi lưu."
        kichThuoc="vua"
      >
        <div className="space-y-4">
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {danhSachThayDoiNguyHiem.map((muc) => {
              const cu = giaTriGoc[muc.khoa] ?? muc.macDinh;
              const moi = formValues[muc.khoa] ?? muc.macDinh;
              const hienThiCu =
                muc.kieu === 'boolean' ? (cu === 'true' ? 'Bật' : 'Tắt') : `${cu} ${muc.donVi || ''}`.trim();
              const hienThiMoi =
                muc.kieu === 'boolean' ? (moi === 'true' ? 'Bật' : 'Tắt') : `${moi} ${muc.donVi || ''}`.trim();

              return (
                <div
                  key={muc.khoa}
                  className="p-3 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--warning)] space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[var(--text)]">{muc.nhan}</span>
                    <code className="text-[11px] font-mono text-[var(--muted)]">{muc.khoa}</code>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="px-2 py-0.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] text-[var(--muted)]">
                      Giá trị cũ: {hienThiCu}
                    </span>
                    <span className="text-[var(--muted)]">→</span>
                    <span className="px-2 py-0.5 bg-[var(--accent-soft)] border border-[var(--accent)] rounded-[var(--radius)] text-[var(--accent)] font-bold">
                      Giá trị mới: {hienThiMoi}
                    </span>
                  </div>
                  {muc.canhBaoNguyHiem && (
                    <p className="text-xs text-[var(--warning)] leading-relaxed">
                      {muc.canhBaoNguyHiem}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setMoHopThoaiXacNhanNguyHiem(false)}
              className="px-3.5 py-1.5 text-xs font-semibold text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] hover:bg-[var(--active-bg)] transition-colors cursor-pointer"
            >
              Kiểm tra lại
            </button>
            <button
              type="button"
              onClick={thucThiLuuCapNhat}
              disabled={dotCapNhat.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[var(--accent)] rounded-[var(--radius)] hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {dotCapNhat.isPending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>Xác nhận lưu thay đổi</span>
            </button>
          </div>
        </div>
      </HopThoai>

      {/* HỘP THOẠI CẢNH BÁO KHI CHUYỂN NHÓM MÀ CHƯA LƯU THAY ĐỔI (MỤC D.18) */}
      <HopThoai
        mo={Boolean(nhomChoChuyenKhiChuaLuu)}
        onDong={() => setNhomChoChuyenKhiChuaLuu(null)}
        eyebrow="CẢNH BÁO THAY ĐỔI CHƯA LƯU"
        tieuDe="Bạn có thay đổi chưa lưu"
        moTa={`Hiện có ${danhSachMucThayDoi.length} cài đặt đã chỉnh sửa nhưng chưa lưu. Bạn muốn lưu trước hay hủy các thay đổi để chuyển sang nhóm mới?`}
        kichThuoc="nho"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setNhomChoChuyenKhiChuaLuu(null)}
              className="px-3.5 py-1.5 text-xs font-semibold text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] hover:bg-[var(--active-bg)] transition-colors cursor-pointer"
            >
              Ở lại để lưu
            </button>
            <button
              type="button"
              onClick={xacNhanHuyThayDoiVaChuyenNhom}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[var(--danger)] rounded-[var(--radius)] hover:opacity-95 transition-opacity cursor-pointer"
            >
              Hủy thay đổi & chuyển nhóm
            </button>
          </div>
        </div>
      </HopThoai>

      {/* HỘP THOẠI XÁC NHẬN TẢI LẠI DỮ LIỆU KHI ĐANG CÓ THAY ĐỔI CHƯA LƯU (MỤC D.16) */}
      <HopThoai
        mo={moHopThoaiTaiLaiKhiChuaLuu}
        onDong={() => setMoHopThoaiTaiLaiKhiChuaLuu(false)}
        eyebrow="TẢI LẠI DỮ LIỆU TỪ MÁY CHỦ"
        tieuDe="Hủy các thay đổi chưa lưu?"
        moTa="Tải lại dữ liệu từ máy chủ sẽ ghi đè các trường bạn vừa chỉnh sửa trên màn hình bằng giá trị đang lưu trên máy chủ."
        kichThuoc="nho"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setMoHopThoaiTaiLaiKhiChuaLuu(false)}
              className="px-3.5 py-1.5 text-xs font-semibold text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] hover:bg-[var(--active-bg)] transition-colors cursor-pointer"
            >
              Giữ lại chỉnh sửa
            </button>
            <button
              type="button"
              onClick={() => {
                setMoHopThoaiTaiLaiKhiChuaLuu(false);
                refetch();
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[var(--accent)] rounded-[var(--radius)] hover:opacity-95 transition-opacity cursor-pointer"
            >
              Tải lại từ máy chủ
            </button>
          </div>
        </div>
      </HopThoai>

      {/* HỘP THOẠI XÁC NHẬN KHÔI PHỤC MẶC ĐỊNH THEO NHÓM (MỤC D.16) */}
      <HopThoai
        mo={Boolean(nhomCanKhoiPhuc)}
        onDong={() => setNhomCanKhoiPhuc(null)}
        eyebrow="KHÔI PHỤC MẶC ĐỊNH NHÓM"
        tieuDe={`Đặt lại mặc định nhóm "${nhomCanKhoiPhuc?.ten || ''}"`}
        moTa="Toàn bộ thông số thuộc nhóm này sẽ trở về giá trị chuẩn ban đầu của hệ thống (không làm mất các mã khóa bảo mật đang lưu)."
        kichThuoc="nho"
      >
        <div className="space-y-4">
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Thao tác này chỉ đặt lại các thông số trong nhóm{' '}
            <strong className="text-[var(--text)]">{nhomCanKhoiPhuc?.ten}</strong>. Các nhóm cấu hình khác không bị ảnh hưởng.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setNhomCanKhoiPhuc(null)}
              className="px-3.5 py-1.5 text-xs font-semibold text-[var(--text)] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] hover:bg-[var(--active-bg)] transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => nhomCanKhoiPhuc && dotKhoiPhucNhom.mutate(nhomCanKhoiPhuc.ma)}
              disabled={dotKhoiPhucNhom.isPending}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[var(--danger)] rounded-[var(--radius)] hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {dotKhoiPhucNhom.isPending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>Khôi phục mặc định</span>
            </button>
          </div>
        </div>
      </HopThoai>
    </div>
  );
}
