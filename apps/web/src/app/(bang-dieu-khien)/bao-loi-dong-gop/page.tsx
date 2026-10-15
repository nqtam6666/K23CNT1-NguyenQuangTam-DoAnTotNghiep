'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LifeBuoy,
  PlusCircle,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MessageSquare,
  Send,
  Eye,
  Trash2,
  Check,
  ChevronLeft,
  ChevronRight,
  Monitor,
  User,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  LoaiBaoLoiDongGop,
  MucDoUuTienBaoLoi,
  TrangThaiBaoLoi,
  VaiTro,
  layNhanVaiTro,
  BaoLoiDongGop,
  ThongKeBaoLoi,
} from '@lms/chung';
import { mayKhachApi } from '../../../tien-ich/may-khach-api';
import { thongBao } from '../../../tien-ich/thong-bao';
import { HopThoai } from '../../../thanh-phan/hop-thoai';
import { KhungXuongBang } from '../../../thanh-phan/khung-xuong';
import { CongTac } from '../../../thanh-phan/cong-tac';
import { AnimatedBackground } from '@/components/ui/animated-tabs';

// Từ điển nhãn hiển thị tiếng Việt chuẩn
const NHAN_LOAI: Record<LoaiBaoLoiDongGop, { nhan: string; moTa: string; mauSac: string; icon: any }> = {
  [LoaiBaoLoiDongGop.BAO_LOI]: {
    nhan: 'Báo lỗi hệ thống',
    moTa: 'Sự cố chức năng, hiển thị sai hoặc lỗi kỹ thuật',
    mauSac: 'bg-danger-soft text-danger border-danger ',
    icon: AlertCircle,
  },
  [LoaiBaoLoiDongGop.DONG_GOP_Y_KIEN]: {
    nhan: 'Đóng góp ý kiến',
    moTa: 'Đề xuất cải tiến trải nghiệm hoặc chức năng mới',
    mauSac: 'bg-accent-soft text-accent border-accent ',
    icon: Sparkles,
  },
  [LoaiBaoLoiDongGop.HO_TRO_KY_THUAT]: {
    nhan: 'Hỗ trợ kỹ thuật',
    moTa: 'Trợ giúp về tài khoản, thao tác sử dụng và thiết bị',
    mauSac: 'bg-accent-soft text-accent border-accent ',
    icon: LifeBuoy,
  },
};

const NHAN_UU_TIEN: Record<MucDoUuTienBaoLoi, { nhan: string; mauSac: string }> = {
  [MucDoUuTienBaoLoi.THAP]: {
    nhan: 'Thấp',
    mauSac: 'bg-active-bg text-text border-border ',
  },
  [MucDoUuTienBaoLoi.TRUNG_BINH]: {
    nhan: 'Trung bình',
    mauSac: 'bg-info-soft text-info border-info ',
  },
  [MucDoUuTienBaoLoi.CAO]: {
    nhan: 'Cao',
    mauSac: 'bg-accent-soft text-accent border-accent ',
  },
  [MucDoUuTienBaoLoi.KHAN_CAP]: {
    nhan: 'Khẩn cấp',
    mauSac: 'bg-danger-soft text-danger border-danger font-semibold',
  },
};

const NHAN_TRANG_THAI: Record<TrangThaiBaoLoi, { nhan: string; mauSac: string; icon: any }> = {
  [TrangThaiBaoLoi.CHO_TIEP_NHAN]: {
    nhan: 'Chờ tiếp nhận',
    mauSac: 'bg-accent-soft text-accent border-accent ',
    icon: Clock,
  },
  [TrangThaiBaoLoi.DANG_XU_LY]: {
    nhan: 'Đang xử lý',
    mauSac: 'bg-accent-soft text-accent border-accent ',
    icon: RefreshCw,
  },
  [TrangThaiBaoLoi.DA_XU_LY]: {
    nhan: 'Đã giải quyết',
    mauSac: 'bg-accent-soft text-accent border-accent ',
    icon: CheckCircle2,
  },
  [TrangThaiBaoLoi.TU_CHOI]: {
    nhan: 'Từ chối',
    mauSac: 'bg-active-bg text-text border-border ',
    icon: XCircle,
  },
};

function dinhDangThoiGian(ngayStr: string | Date | undefined | null): string {
  if (!ngayStr) return '-';
  const d = new Date(ngayStr);
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TrangBaoLoiDongGop() {
  const queryClient = useQueryClient();

  // Bộ lọc danh sách
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [tuKhoa, setTuKhoa] = useState('');
  const [boLocLoai, setBoLocLoai] = useState<string>('');
  const [boLocTrangThai, setBoLocTrangThai] = useState<string>('');
  const [boLocUuTien, setBoLocUuTien] = useState<string>('');

  // Trạng thái modal
  const [modalGuiMo, setModalGuiMo] = useState(false);
  const [modalChiTietMo, setModalChiTietMo] = useState<BaoLoiDongGop | null>(null);
  const [modalXuLyMo, setModalXuLyMo] = useState<BaoLoiDongGop | null>(null);

  // Form gửi mới
  const [formGui, setFormGui] = useState({
    loaiPhanHoi: LoaiBaoLoiDongGop.BAO_LOI,
    mucDoUuTien: MucDoUuTienBaoLoi.TRUNG_BINH,
    tieuDe: '',
    noiDung: '',
    kemThongTinThietBi: true,
  });

  // Form xử lý (dành cho quản trị)
  const [formXuLy, setFormXuLy] = useState<{
    trangThai: TrangThaiBaoLoi;
    phanHoiXuLy: string;
  }>({
    trangThai: TrangThaiBaoLoi.DANG_XU_LY,
    phanHoiXuLy: '',
  });

  // 1. Lấy thông tin người dùng hiện tại
  const { data: hoSo } = useQuery({
    queryKey: ['hoSoCaNhan'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/ho-so/ca-nhan');
      return res.data?.duLieu;
    },
  });

  const laQuanTri = useMemo(() => {
    return (
      hoSo?.vaiTro === VaiTro.QUAN_TRI_VIEN ||
      hoSo?.vaiTro === VaiTro.BAN_GIAM_HIEU ||
      hoSo?.vaiTro === VaiTro.GIAO_VU
    );
  }, [hoSo?.vaiTro]);

  // 2. Lấy số liệu thống kê
  const { data: thongKe } = useQuery<ThongKeBaoLoi>({
    queryKey: ['thongKeBaoLoi'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/bao-loi-dong-gop/thong-ke');
      return res.data?.duLieu;
    },
  });

  // 3. Lấy danh sách phản ánh / báo lỗi
  const { data: ketQuaDanhSach, isLoading } = useQuery({
    queryKey: ['danhSachBaoLoi', trangHienTai, tuKhoa, boLocLoai, boLocTrangThai, boLocUuTien],
    queryFn: async () => {
      const params = new URLSearchParams({
        trang: String(trangHienTai),
        soLuong: '10',
      });
      if (tuKhoa) params.append('tuKhoa', tuKhoa);
      if (boLocLoai) params.append('loaiPhanHoi', boLocLoai);
      if (boLocTrangThai) params.append('trangThai', boLocTrangThai);
      if (boLocUuTien) params.append('mucDoUuTien', boLocUuTien);

      const res = await mayKhachApi.get(`/bao-loi-dong-gop?${params.toString()}`);
      return res.data?.duLieu;
    },
  });

  const danhSach: BaoLoiDongGop[] = ketQuaDanhSach?.danhSach || [];
  const phanTrang = ketQuaDanhSach?.phanTrang || { tongSo: 0, tongSoTrang: 1 };

  // 4. Mutation gửi báo lỗi / đóng góp mới
  const mutationGuiMoi = useMutation({
    mutationFn: async () => {
      const thongTinTrinhDuyet = formGui.kemThongTinThietBi
        ? typeof navigator !== 'undefined'
          ? navigator.userAgent.slice(0, 255)
          : undefined
        : undefined;

      const res = await mayKhachApi.post('/bao-loi-dong-gop', {
        tieuDe: formGui.tieuDe.trim(),
        loaiPhanHoi: formGui.loaiPhanHoi,
        mucDoUuTien: formGui.mucDoUuTien,
        noiDung: formGui.noiDung.trim(),
        thongTinTrinhDuyet,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['danhSachBaoLoi'] });
      queryClient.invalidateQueries({ queryKey: ['thongKeBaoLoi'] });
      thongBao.thanhCong('Gửi phản ánh thành công', 'Ý kiến của bạn đã được ghi nhận vào hệ thống.');
      setModalGuiMo(false);
      setFormGui({
        loaiPhanHoi: LoaiBaoLoiDongGop.BAO_LOI,
        mucDoUuTien: MucDoUuTienBaoLoi.TRUNG_BINH,
        tieuDe: '',
        noiDung: '',
        kemThongTinThietBi: true,
      });
    },
    onError: (loi: any) => {
      thongBao.loiHeThong(loi, 'Không thể gửi phản ánh. Vui lòng kiểm tra lại thông tin.');
    },
  });

  // 5. Mutation xử lý phản ánh (Ban quản trị)
  const mutationXuLy = useMutation({
    mutationFn: async () => {
      if (!modalXuLyMo) return;
      const res = await mayKhachApi.patch(`/bao-loi-dong-gop/${modalXuLyMo.id}/xu-ly`, {
        trangThai: formXuLy.trangThai,
        phanHoiXuLy: formXuLy.phanHoiXuLy.trim(),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['danhSachBaoLoi'] });
      queryClient.invalidateQueries({ queryKey: ['thongKeBaoLoi'] });
      thongBao.thanhCong('Cập nhật xử lý thành công', 'Trạng thái phản ánh và phản hồi đã được lưu.');
      setModalXuLyMo(null);
    },
    onError: (loi: any) => {
      thongBao.loiHeThong(loi, 'Không thể cập nhật xử lý phản ánh.');
    },
  });

  // 6. Mutation xóa phản ánh
  const mutationXoa = useMutation({
    mutationFn: async (id: string) => {
      const res = await mayKhachApi.delete(`/bao-loi-dong-gop/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['danhSachBaoLoi'] });
      queryClient.invalidateQueries({ queryKey: ['thongKeBaoLoi'] });
      thongBao.thanhCong('Đã xóa phản ánh', 'Bản ghi phản ánh đã được gỡ bỏ khỏi hệ thống.');
      if (modalChiTietMo) setModalChiTietMo(null);
    },
    onError: (loi: any) => {
      thongBao.loiHeThong(loi, 'Không thể xóa phản ánh.');
    },
  });

  const xuLyMoModalXuLy = (item: BaoLoiDongGop) => {
    setModalXuLyMo(item);
    setFormXuLy({
      trangThai: item.trangThai || TrangThaiBaoLoi.DANG_XU_LY,
      phanHoiXuLy: item.phanHoiXuLy || '',
    });
  };

  const xuLyXoa = (id: string) => {
    if (typeof window !== 'undefined' && window.confirm('Bạn có chắc chắn muốn hủy / xóa phản ánh này?')) {
      mutationXoa.mutate(id);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Trang */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <p className="eyebrow mb-1">Hỗ trợ kỹ thuật</p>
          <h1 className="text-[22px] font-mono font-bold tracking-tight text-[var(--text)] flex items-center gap-2.5">
            <LifeBuoy className="w-5 h-5 text-[var(--accent)]" strokeWidth={1.5} />
            Báo lỗi & Đóng góp ý kiến
          </h1>
          <p className="mt-1 text-[14px] text-[var(--muted)]">
            {laQuanTri
              ? 'Tiếp nhận, xử lý và phản hồi các sự cố kỹ thuật và ý kiến đóng góp từ người dùng.'
              : 'Gửi báo lỗi kỹ thuật, đóng góp ý tưởng cải tiến hoặc yêu cầu hỗ trợ trực tiếp từ ban quản trị.'}
          </p>
        </div>

        <button
          onClick={() => setModalGuiMo(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-[11px] rounded-[4px] bg-[var(--accent)] hover:brightness-95 text-white font-semibold text-[13px] shadow-[0_2px_8px_-2px_color-mix(in_srgb,var(--accent)_30%,transparent)] transition-all cursor-pointer"
        >
          <PlusCircle className="w-[18px] h-[18px]" strokeWidth={1.5} />
          <span>Gửi báo lỗi / Đóng góp mới</span>
        </button>
      </div>

      {/* 2. Thẻ số liệu thống kê */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded bg-surface border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider">
              {laQuanTri ? 'Tổng số yêu cầu' : 'Yêu cầu của bạn'}
            </p>
            <p className="text-2xl font-bold text-text mt-1">
              {thongKe?.tongSo ?? 0}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-active-bg flex items-center justify-center text-muted ">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded bg-surface border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-accent uppercase tracking-wider">
              Chờ tiếp nhận
            </p>
            <p className="text-2xl font-bold text-text mt-1">
              {thongKe?.choTiepNhan ?? 0}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center text-accent ">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded bg-surface border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-accent uppercase tracking-wider">
              Đang xử lý
            </p>
            <p className="text-2xl font-bold text-text mt-1">
              {thongKe?.dangXuLy ?? 0}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center text-accent ">
            <RefreshCw className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded bg-surface border border-border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-accent uppercase tracking-wider">
              Đã giải quyết
            </p>
            <p className="text-2xl font-bold text-text mt-1">
              {thongKe?.daXuLy ?? 0}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center text-accent ">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Thanh tìm kiếm và bộ lọc */}
      <div className="p-4 rounded bg-surface border border-border shadow-sm space-y-3">
        {/* Thanh lọc nhanh theo trạng thái (Segmented Control) */}
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)] w-fit">
          <AnimatedBackground
            defaultValue={boLocTrangThai || 'TAT_CA'}
            className="rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)]"
            transition={{ type: 'spring', bounce: 0.15, duration: 0.25 }}
          >
            {[
              { ma: 'TAT_CA', nhan: 'Tất cả trạng thái', giaTri: '' },
              { ma: TrangThaiBaoLoi.CHO_TIEP_NHAN, nhan: 'Chờ tiếp nhận', giaTri: TrangThaiBaoLoi.CHO_TIEP_NHAN },
              { ma: TrangThaiBaoLoi.DANG_XU_LY, nhan: 'Đang xử lý', giaTri: TrangThaiBaoLoi.DANG_XU_LY },
              { ma: TrangThaiBaoLoi.DA_XU_LY, nhan: 'Đã giải quyết', giaTri: TrangThaiBaoLoi.DA_XU_LY },
              { ma: TrangThaiBaoLoi.TU_CHOI, nhan: 'Từ chối', giaTri: TrangThaiBaoLoi.TU_CHOI },
            ].map((tab) => {
              const dangChon = (boLocTrangThai || '') === tab.giaTri;
              return (
                <button
                  key={tab.ma}
                  data-id={tab.ma}
                  type="button"
                  onClick={() => {
                    setBoLocTrangThai(tab.giaTri);
                    setTrangHienTai(1);
                  }}
                  className={`px-3 py-1.5 text-xs font-mono rounded-[var(--radius)] transition-colors cursor-pointer ${
                    dangChon
                      ? 'text-[var(--accent)] font-bold'
                      : 'text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {tab.nhan}
                </button>
              );
            })}
          </AnimatedBackground>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={tuKhoa}
              onChange={(e) => {
                setTuKhoa(e.target.value);
                setTrangHienTai(1);
              }}
              placeholder="Tìm kiếm theo tiêu đề, nội dung phản ánh..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-bg text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Lọc loại phản ánh */}
          <select
            value={boLocLoai}
            onChange={(e) => {
              setBoLocLoai(e.target.value);
              setTrangHienTai(1);
            }}
            className="px-3 py-2 text-sm rounded-lg border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Tất cả phân loại</option>
            <option value={LoaiBaoLoiDongGop.BAO_LOI}>Báo lỗi hệ thống</option>
            <option value={LoaiBaoLoiDongGop.DONG_GOP_Y_KIEN}>Đóng góp ý kiến</option>
            <option value={LoaiBaoLoiDongGop.HO_TRO_KY_THUAT}>Hỗ trợ kỹ thuật</option>
          </select>

          {/* Lọc trạng thái */}
          <select
            value={boLocTrangThai}
            onChange={(e) => {
              setBoLocTrangThai(e.target.value);
              setTrangHienTai(1);
            }}
            className="px-3 py-2 text-sm rounded-lg border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value={TrangThaiBaoLoi.CHO_TIEP_NHAN}>Chờ tiếp nhận</option>
            <option value={TrangThaiBaoLoi.DANG_XU_LY}>Đang xử lý</option>
            <option value={TrangThaiBaoLoi.DA_XU_LY}>Đã giải quyết</option>
            <option value={TrangThaiBaoLoi.TU_CHOI}>Từ chối</option>
          </select>

          {/* Lọc mức độ ưu tiên */}
          <select
            value={boLocUuTien}
            onChange={(e) => {
              setBoLocUuTien(e.target.value);
              setTrangHienTai(1);
            }}
            className="px-3 py-2 text-sm rounded-lg border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Tất cả mức ưu tiên</option>
            <option value={MucDoUuTienBaoLoi.THAP}>Thấp</option>
            <option value={MucDoUuTienBaoLoi.TRUNG_BINH}>Trung bình</option>
            <option value={MucDoUuTienBaoLoi.CAO}>Cao</option>
            <option value={MucDoUuTienBaoLoi.KHAN_CAP}>Khẩn cấp</option>
          </select>

          {(tuKhoa || boLocLoai || boLocTrangThai || boLocUuTien) && (
            <button
              onClick={() => {
                setTuKhoa('');
                setBoLocLoai('');
                setBoLocTrangThai('');
                setBoLocUuTien('');
                setTrangHienTai(1);
              }}
              className="px-3 py-2 text-xs font-medium text-muted hover:bg-active-bg rounded-lg transition-colors"
            >
              Đặt lại lọc
            </button>
          )}
        </div>
      </div>

      {/* 4. Danh sách phản ánh */}
      {isLoading ? (
        <KhungXuongBang soCot={5} soDong={5} />
      ) : danhSach.length === 0 ? (
        <div className="p-12 text-center rounded bg-surface border border-border shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-accent-soft flex items-center justify-center text-accent mb-4">
            <LifeBuoy className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-text ">
            Chưa có phản ánh hoặc báo lỗi nào
          </h3>
          <p className="mt-1.5 text-sm text-muted max-w-md mx-auto">
            {tuKhoa || boLocLoai || boLocTrangThai || boLocUuTien
              ? 'Không tìm thấy kết quả phù hợp với các bộ lọc hiện tại. Thử thay đổi tiêu chí tìm kiếm.'
              : 'Hệ thống đang vận hành ổn định. Nếu gặp bất kỳ vấn đề kỹ thuật nào, hãy gửi phản ánh ngay.'}
          </p>
          <button
            onClick={() => setModalGuiMo(true)}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent text-white font-medium text-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Gửi phản ánh đầu tiên</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {danhSach.map((item) => {
            const loaiCfg = NHAN_LOAI[item.loaiPhanHoi] || NHAN_LOAI[LoaiBaoLoiDongGop.BAO_LOI];
            const uuTienCfg = NHAN_UU_TIEN[item.mucDoUuTien] || NHAN_UU_TIEN[MucDoUuTienBaoLoi.TRUNG_BINH];
            const trangThaiCfg = NHAN_TRANG_THAI[item.trangThai] || NHAN_TRANG_THAI[TrangThaiBaoLoi.CHO_TIEP_NHAN];
            const LoaiIcon = loaiCfg.icon;
            const TrangThaiIcon = trangThaiCfg.icon;
            const laChuSoHuu = item.idNguoiDung === hoSo?.id;

            return (
              <div
                key={item.id}
                className="p-5 rounded bg-surface border border-border shadow-sm hover:border-accent transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Nội dung chính */}
                  <div className="flex-1 space-y-2.5">
                    {/* Hàng nhãn */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Phân loại */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${loaiCfg.mauSac}`}
                      >
                        <LoaiIcon className="w-3.5 h-3.5" />
                        {loaiCfg.nhan}
                      </span>

                      {/* Mức ưu tiên */}
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${uuTienCfg.mauSac}`}
                      >
                        Ưu tiên {uuTienCfg.nhan}
                      </span>

                      {/* Trạng thái */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${trangThaiCfg.mauSac}`}
                      >
                        <TrangThaiIcon className="w-3.5 h-3.5" />
                        {trangThaiCfg.nhan}
                      </span>
                    </div>

                    {/* Tiêu đề & Nội dung tóm tắt */}
                    <div>
                      <h4
                        onClick={() => setModalChiTietMo(item)}
                        className="text-base font-semibold text-text hover:text-accent cursor-pointer transition-colors"
                      >
                        {item.tieuDe}
                      </h4>
                      <p className="mt-1 text-sm text-muted line-clamp-2 leading-relaxed">
                        {item.noiDung}
                      </p>
                    </div>

                    {/* Phản hồi từ quản trị nếu có */}
                    {item.phanHoiXuLy && (
                      <div className="mt-2.5 p-3 rounded-lg bg-accent-soft border border-accent ">
                        <div className="flex items-center gap-2 text-xs font-semibold text-accent ">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Phản hồi từ Ban Quản trị:</span>
                          {item.nguoiXuLy?.hoTen && (
                            <span className="font-normal text-accent ">
                              ({item.nguoiXuLy.hoTen})
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-accent leading-relaxed">
                          {item.phanHoiXuLy}
                        </p>
                      </div>
                    )}

                    {/* Metadata người gửi & thời gian */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted pt-1">
                      <span>Gửi lúc: {dinhDangThoiGian(item.ngayTao)}</span>

                      {laQuanTri && item.nguoiDung && (
                        <span className="flex items-center gap-1.5 font-medium text-muted ">
                          <User className="w-3.5 h-3.5" />
                          {item.nguoiDung.hoTen} ({layNhanVaiTro(item.nguoiDung.vaiTro as any)})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nhóm nút hành động */}
                  <div className="flex items-center gap-2 pt-2 lg:pt-0 self-end lg:self-start">
                    <button
                      onClick={() => setModalChiTietMo(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-active-bg text-xs font-medium text-text transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Chi tiết</span>
                    </button>

                    {laQuanTri && (
                      <button
                        onClick={() => xuLyMoModalXuLy(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-soft hover:bg-accent-soft border border-accent text-xs font-medium text-accent transition-colors"
                        title="Cập nhật xử lý & phản hồi"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Xử lý</span>
                      </button>
                    )}

                    {(laQuanTri ||
                      (laChuSoHuu && item.trangThai === TrangThaiBaoLoi.CHO_TIEP_NHAN)) && (
                      <button
                        onClick={() => xuLyXoa(item.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-danger hover:bg-danger-soft text-xs font-medium text-danger transition-colors cursor-pointer"
                        title={laQuanTri ? 'Xóa phản ánh này' : 'Hủy phản ánh này'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="sr-only sm:not-sr-only">
                          {laQuanTri ? 'Xóa' : 'Hủy'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Điều khiển phân trang */}
      {phanTrang.tongSoTrang > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-xs text-muted ">
            Hiển thị trang <span className="font-semibold text-text ">{trangHienTai}</span> / {phanTrang.tongSoTrang} (Tổng số {phanTrang.tongSo} phản ánh)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTrangHienTai((p) => Math.max(1, p - 1))}
              disabled={trangHienTai <= 1}
              className="p-2 rounded-lg border border-border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-active-bg text-text "
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTrangHienTai((p) => Math.min(phanTrang.tongSoTrang, p + 1))}
              disabled={trangHienTai >= phanTrang.tongSoTrang}
              className="p-2 rounded-lg border border-border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-active-bg text-text "
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 6. Modal Gửi phản ánh mới */}
      <HopThoai
        mo={modalGuiMo}
        onDong={() => setModalGuiMo(false)}
        tieuDe="Gửi báo lỗi & Đóng góp ý kiến"
        moTa="Phản ánh sự cố kỹ thuật hoặc gửi ý kiến giúp hoàn thiện hệ thống tốt hơn."
        kichThuoc="lon"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!formGui.tieuDe.trim() || formGui.tieuDe.trim().length < 3) {
              thongBao.canhBao('Tiêu đề phản ánh cần tối thiểu 3 ký tự');
              return;
            }
            if (!formGui.noiDung.trim() || formGui.noiDung.trim().length < 10) {
              thongBao.canhBao('Nội dung phản ánh cần tối thiểu 10 ký tự');
              return;
            }
            mutationGuiMoi.mutate();
          }}
          className="space-y-4"
        >
          {/* Phân loại */}
          <div>
            <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2">
              Phân loại yêu cầu
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <AnimatedBackground
                defaultValue={formGui.loaiPhanHoi}
                className="rounded-[var(--radius)] bg-accent-soft border border-accent"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.25 }}
              >
                {[
                  { loai: LoaiBaoLoiDongGop.BAO_LOI, label: 'Báo lỗi hệ thống', sub: 'Chức năng lỗi, không tải được trang' },
                  { loai: LoaiBaoLoiDongGop.DONG_GOP_Y_KIEN, label: 'Đóng góp ý kiến', sub: 'Góp ý giao diện, tiện ích mới' },
                  { loai: LoaiBaoLoiDongGop.HO_TRO_KY_THUAT, label: 'Hỗ trợ kỹ thuật', sub: 'Tài khoản, quyền hạn, thiết bị' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.loai}
                    data-id={item.loai}
                    onClick={() => setFormGui((f) => ({ ...f, loaiPhanHoi: item.loai }))}
                    className={`p-3 rounded-[var(--radius)] border text-left transition-all cursor-pointer ${
                      formGui.loaiPhanHoi === item.loai
                        ? 'border-accent text-accent'
                        : 'border-border hover:border-accent'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold">{item.label}</p>
                      <p className="text-[11px] text-muted mt-0.5">{item.sub}</p>
                    </div>
                  </button>
                ))}
              </AnimatedBackground>
            </div>
          </div>

          {/* Mức độ ưu tiên */}
          <div>
            <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
              Mức độ ưu tiên
            </label>
            <div className="grid grid-cols-4 gap-2">
              <AnimatedBackground
                defaultValue={formGui.mucDoUuTien}
                className="rounded-[var(--radius)] bg-accent border border-accent"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.25 }}
              >
                {[
                  { u: MucDoUuTienBaoLoi.THAP, label: 'Thấp' },
                  { u: MucDoUuTienBaoLoi.TRUNG_BINH, label: 'Trung bình' },
                  { u: MucDoUuTienBaoLoi.CAO, label: 'Cao' },
                  { u: MucDoUuTienBaoLoi.KHAN_CAP, label: 'Khẩn cấp' },
                ].map((p) => (
                  <button
                    type="button"
                    key={p.u}
                    data-id={p.u}
                    onClick={() => setFormGui((f) => ({ ...f, mucDoUuTien: p.u }))}
                    className={`py-2 px-3 rounded-[var(--radius)] border justify-center text-center text-xs font-medium transition-all cursor-pointer ${
                      formGui.mucDoUuTien === p.u
                        ? 'border-accent text-white font-semibold'
                        : 'border-border text-text hover:bg-bg'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </AnimatedBackground>
            </div>
          </div>

          {/* Tiêu đề */}
          <div>
            <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1">
              Tiêu đề phản ánh <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              required
              value={formGui.tieuDe}
              onChange={(e) => setFormGui((f) => ({ ...f, tieuDe: e.target.value }))}
              placeholder="Tóm tắt ngắn gọn vấn đề (Ví dụ: Không thể tải bài tập PDF môn Toán)"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border bg-surface text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Chi tiết nội dung */}
          <div>
            <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1">
              Nội dung chi tiết <span className="text-danger">*</span>
            </label>
            <textarea
              required
              rows={5}
              value={formGui.noiDung}
              onChange={(e) => setFormGui((f) => ({ ...f, noiDung: e.target.value }))}
              placeholder="Mô tả cụ thể các bước bạn đã làm, thông báo lỗi xuất hiện (nếu có), hoặc đề xuất giải pháp bạn mong muốn..."
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border bg-surface text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent resize-y"
            />
            <p className="mt-1 text-right text-[11px] text-muted">
              {formGui.noiDung.length}/5000 ký tự (tối thiểu 10 ký tự)
            </p>
          </div>

          {/* Đính kèm thông tin thiết bị */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-bg border border-border ">
            <CongTac
              id="kemThongTin"
              checked={formGui.kemThongTinThietBi}
              onChange={(checked) => setFormGui((f) => ({ ...f, kemThongTinThietBi: checked }))}
            />
            <label htmlFor="kemThongTin" className="text-xs text-muted cursor-pointer">
              Tự động gửi thông tin thiết bị để bộ phận kỹ thuật hỗ trợ khắc phục nhanh nhất.
            </label>
          </div>

          {/* Nút hành động */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border ">
            <button
              type="button"
              onClick={() => setModalGuiMo(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg text-text hover:bg-active-bg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={mutationGuiMoi.isPending}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg bg-accent hover:bg-accent text-white disabled:opacity-50 transition-colors shadow-sm"
            >
              {mutationGuiMoi.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Gửi phản ánh</span>
                </>
              )}
            </button>
          </div>
        </form>
      </HopThoai>

      {/* 7. Modal Xem Chi Tiết Phản Ánh */}
      {modalChiTietMo && (
        <HopThoai
          mo={!!modalChiTietMo}
          onDong={() => setModalChiTietMo(null)}
          tieuDe="Chi tiết phản ánh"
          kichThuoc="lon"
        >
          <div className="space-y-4">
            {/* Header chi tiết */}
            <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-border ">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border ${
                  (NHAN_LOAI[modalChiTietMo.loaiPhanHoi] || NHAN_LOAI[LoaiBaoLoiDongGop.BAO_LOI]).mauSac
                }`}
              >
                {(NHAN_LOAI[modalChiTietMo.loaiPhanHoi] || NHAN_LOAI[LoaiBaoLoiDongGop.BAO_LOI]).nhan}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                  (NHAN_UU_TIEN[modalChiTietMo.mucDoUuTien] || NHAN_UU_TIEN[MucDoUuTienBaoLoi.TRUNG_BINH]).mauSac
                }`}
              >
                Ưu tiên {(NHAN_UU_TIEN[modalChiTietMo.mucDoUuTien] || NHAN_UU_TIEN[MucDoUuTienBaoLoi.TRUNG_BINH]).nhan}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  (NHAN_TRANG_THAI[modalChiTietMo.trangThai] || NHAN_TRANG_THAI[TrangThaiBaoLoi.CHO_TIEP_NHAN]).mauSac
                }`}
              >
                {(NHAN_TRANG_THAI[modalChiTietMo.trangThai] || NHAN_TRANG_THAI[TrangThaiBaoLoi.CHO_TIEP_NHAN]).nhan}
              </span>
            </div>

            {/* Tiêu đề & nội dung */}
            <div>
              <h3 className="text-lg font-bold text-text ">
                {modalChiTietMo.tieuDe}
              </h3>
              <div className="mt-3 p-4 rounded bg-bg border border-border text-sm text-text whitespace-pre-wrap leading-relaxed">
                {modalChiTietMo.noiDung}
              </div>
            </div>

            {/* Thông tin kỹ thuật đính kèm nếu có */}
            {modalChiTietMo.thongTinTrinhDuyet && (
              <div className="p-3 rounded-lg bg-active-bg text-xs text-muted space-y-1">
                <p className="flex items-start gap-2">
                  <Monitor className="w-3.5 h-3.5 text-muted mt-0.5" />
                  <span className="font-mono text-[11px] break-all">
                    {modalChiTietMo.thongTinTrinhDuyet}
                  </span>
                </p>
              </div>
            )}

            {/* Khối phản hồi từ Ban Quản trị */}
            {modalChiTietMo.phanHoiXuLy ? (
              <div className="p-4 rounded bg-accent-soft border border-accent space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-accent ">
                    <CheckCircle2 className="w-4 h-4 text-accent " />
                    <span>Phản hồi chính thức:</span>
                  </div>
                  {modalChiTietMo.ngayCapNhat && (
                    <span className="text-xs text-accent ">
                      {dinhDangThoiGian(modalChiTietMo.ngayCapNhat)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-accent whitespace-pre-wrap leading-relaxed">
                  {modalChiTietMo.phanHoiXuLy}
                </p>
                {modalChiTietMo.nguoiXuLy?.hoTen && (
                  <p className="text-xs text-accent pt-1">
                    Người phụ trách: {modalChiTietMo.nguoiXuLy.hoTen}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-lg bg-accent-soft border border-accent text-xs text-accent flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Yêu cầu này đang trong hàng đợi xử lý của ban quản trị.</span>
              </div>
            )}

            {/* Chân modal */}
            <div className="flex items-center justify-between pt-3 border-t border-border ">
              <span className="text-xs text-muted">
                Tạo lúc: {dinhDangThoiGian(modalChiTietMo.ngayTao)}
              </span>
              <div className="flex items-center gap-2">
                {laQuanTri && (
                  <button
                    onClick={() => {
                      const item = modalChiTietMo;
                      setModalChiTietMo(null);
                      xuLyMoModalXuLy(item);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent text-white text-xs font-medium transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Cập nhật xử lý</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setModalChiTietMo(null)}
                  className="px-4 py-1.5 text-xs font-medium rounded-lg text-text hover:bg-active-bg "
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </HopThoai>
      )}

      {/* 8. Modal Xử Lý & Phản Hồi (Ban Quản Trị) */}
      {modalXuLyMo && (
        <HopThoai
          mo={!!modalXuLyMo}
          onDong={() => setModalXuLyMo(null)}
          tieuDe="Xử lý phản ánh & Báo lỗi"
          moTa={`Cập nhật tiến độ và nhập thông điệp phản hồi gửi đến ${modalXuLyMo.nguoiDung?.hoTen || 'người gửi'}.`}
          kichThuoc="lon"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutationXuLy.mutate();
            }}
            className="space-y-4"
          >
            {/* Tóm tắt phản ánh */}
            <div className="p-3.5 rounded bg-bg border border-border space-y-1">
              <p className="text-xs text-muted ">Yêu cầu được chọn:</p>
              <p className="text-sm font-semibold text-text ">
                {modalXuLyMo.tieuDe}
              </p>
              <p className="text-xs text-muted line-clamp-2">
                {modalXuLyMo.noiDung}
              </p>
            </div>

            {/* Lựa chọn trạng thái mới */}
            <div>
              <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-2">
                Trạng thái xử lý <span className="text-danger">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { tt: TrangThaiBaoLoi.CHO_TIEP_NHAN, label: 'Chờ tiếp nhận', color: 'hover:border-accent' },
                  { tt: TrangThaiBaoLoi.DANG_XU_LY, label: 'Đang xử lý', color: 'hover:border-accent' },
                  { tt: TrangThaiBaoLoi.DA_XU_LY, label: 'Đã giải quyết', color: 'hover:border-accent' },
                  { tt: TrangThaiBaoLoi.TU_CHOI, label: 'Từ chối', color: 'hover:border-border' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.tt}
                    onClick={() => setFormXuLy((f) => ({ ...f, trangThai: item.tt }))}
                    className={`py-2 px-3 rounded-lg border text-center text-xs font-medium transition-all ${
                      formXuLy.trangThai === item.tt
                        ? 'border-accent bg-accent text-white font-semibold'
                        : `border-border text-text ${item.color}`
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nội dung phản hồi */}
            <div>
              <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1">
                Nội dung phản hồi tới người gửi
              </label>
              <textarea
                rows={4}
                required
                value={formXuLy.phanHoiXuLy}
                onChange={(e) => setFormXuLy((f) => ({ ...f, phanHoiXuLy: e.target.value }))}
                placeholder="Nhập thông điệp trả lời, kết quả khắc phục hoặc hướng dẫn thêm cho người gửi..."
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-border bg-surface text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <p className="mt-1 text-[11px] text-muted">
                Thông điệp này sẽ hiển thị trực tiếp trong lịch sử phản ánh của người gửi và gửi thông báo chuông tới họ.
              </p>
            </div>

            {/* Nút hành động */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border ">
              <button
                type="button"
                onClick={() => setModalXuLyMo(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg text-text hover:bg-active-bg "
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={mutationXuLy.isPending}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg bg-accent hover:bg-accent text-white disabled:opacity-50 transition-colors shadow-sm"
              >
                {mutationXuLy.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Lưu cập nhật</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </HopThoai>
      )}
    </div>
  );
}
