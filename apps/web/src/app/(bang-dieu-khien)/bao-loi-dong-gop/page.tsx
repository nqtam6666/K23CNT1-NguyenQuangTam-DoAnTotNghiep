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

// Từ điển nhãn hiển thị tiếng Việt chuẩn
const NHAN_LOAI: Record<LoaiBaoLoiDongGop, { nhan: string; moTa: string; mauSac: string; icon: any }> = {
  [LoaiBaoLoiDongGop.BAO_LOI]: {
    nhan: 'Báo lỗi hệ thống',
    moTa: 'Sự cố chức năng, hiển thị sai hoặc lỗi kỹ thuật',
    mauSac: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    icon: AlertCircle,
  },
  [LoaiBaoLoiDongGop.DONG_GOP_Y_KIEN]: {
    nhan: 'Đóng góp ý kiến',
    moTa: 'Đề xuất cải tiến trải nghiệm hoặc chức năng mới',
    mauSac: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    icon: Sparkles,
  },
  [LoaiBaoLoiDongGop.HO_TRO_KY_THUAT]: {
    nhan: 'Hỗ trợ kỹ thuật',
    moTa: 'Trợ giúp về tài khoản, thao tác sử dụng và thiết bị',
    mauSac: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    icon: LifeBuoy,
  },
};

const NHAN_UU_TIEN: Record<MucDoUuTienBaoLoi, { nhan: string; mauSac: string }> = {
  [MucDoUuTienBaoLoi.THAP]: {
    nhan: 'Thấp',
    mauSac: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  },
  [MucDoUuTienBaoLoi.TRUNG_BINH]: {
    nhan: 'Trung bình',
    mauSac: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  },
  [MucDoUuTienBaoLoi.CAO]: {
    nhan: 'Cao',
    mauSac: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  [MucDoUuTienBaoLoi.KHAN_CAP]: {
    nhan: 'Khẩn cấp',
    mauSac: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-200 border-red-300 dark:border-red-700 font-semibold',
  },
};

const NHAN_TRANG_THAI: Record<TrangThaiBaoLoi, { nhan: string; mauSac: string; icon: any }> = {
  [TrangThaiBaoLoi.CHO_TIEP_NHAN]: {
    nhan: 'Chờ tiếp nhận',
    mauSac: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    icon: Clock,
  },
  [TrangThaiBaoLoi.DANG_XU_LY]: {
    nhan: 'Đang xử lý',
    mauSac: 'bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    icon: RefreshCw,
  },
  [TrangThaiBaoLoi.DA_XU_LY]: {
    nhan: 'Đã giải quyết',
    mauSac: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    icon: CheckCircle2,
  },
  [TrangThaiBaoLoi.TU_CHOI]: {
    nhan: 'Từ chối',
    mauSac: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <LifeBuoy className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Báo lỗi & Đóng góp ý kiến
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {laQuanTri
              ? 'Tiếp nhận, xử lý và phản hồi các sự cố kỹ thuật và ý kiến đóng góp từ người dùng.'
              : 'Gửi báo lỗi kỹ thuật, đóng góp ý tưởng cải tiến hoặc yêu cầu hỗ trợ trực tiếp từ ban quản trị.'}
          </p>
        </div>

        <button
          onClick={() => setModalGuiMo(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Gửi báo lỗi / Đóng góp mới</span>
        </button>
      </div>

      {/* 2. Thẻ số liệu thống kê */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {laQuanTri ? 'Tổng số yêu cầu' : 'Yêu cầu của bạn'}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {thongKe?.tongSo ?? 0}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Chờ tiếp nhận
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {thongKe?.choTiepNhan ?? 0}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Đang xử lý
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {thongKe?.dangXuLy ?? 0}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <RefreshCw className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Đã giải quyết
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {thongKe?.daXuLy ?? 0}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Thanh tìm kiếm và bộ lọc */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={tuKhoa}
              onChange={(e) => {
                setTuKhoa(e.target.value);
                setTrangHienTai(1);
              }}
              placeholder="Tìm kiếm theo tiêu đề, nội dung phản ánh..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Lọc loại phản ánh */}
          <select
            value={boLocLoai}
            onChange={(e) => {
              setBoLocLoai(e.target.value);
              setTrangHienTai(1);
            }}
            className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
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
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
            <LifeBuoy className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Chưa có phản ánh hoặc báo lỗi nào
          </h3>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {tuKhoa || boLocLoai || boLocTrangThai || boLocUuTien
              ? 'Không tìm thấy kết quả phù hợp với các bộ lọc hiện tại. Thử thay đổi tiêu chí tìm kiếm.'
              : 'Hệ thống đang vận hành ổn định. Nếu gặp bất kỳ vấn đề kỹ thuật nào, hãy gửi phản ánh ngay.'}
          </p>
          <button
            onClick={() => setModalGuiMo(true)}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
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
                className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
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
                        className="text-base font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                      >
                        {item.tieuDe}
                      </h4>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {item.noiDung}
                      </p>
                    </div>

                    {/* Phản hồi từ quản trị nếu có */}
                    {item.phanHoiXuLy && (
                      <div className="mt-2.5 p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50">
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Phản hồi từ Ban Quản trị:</span>
                          {item.nguoiXuLy?.hoTen && (
                            <span className="font-normal text-emerald-700 dark:text-emerald-400">
                              ({item.nguoiXuLy.hoTen})
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                          {item.phanHoiXuLy}
                        </p>
                      </div>
                    )}

                    {/* Metadata người gửi & thời gian */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 dark:text-slate-500 pt-1">
                      <span>Gửi lúc: {dinhDangThoiGian(item.ngayTao)}</span>

                      {laQuanTri && item.nguoiDung && (
                        <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Chi tiết</span>
                    </button>

                    {laQuanTri && (
                      <button
                        onClick={() => xuLyMoModalXuLy(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 border border-blue-200 dark:border-blue-800 text-xs font-medium text-blue-700 dark:text-blue-300 transition-colors"
                        title="Cập nhật xử lý & phản hồi"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Xử lý</span>
                      </button>
                    )}

                    {laChuSoHuu && item.trangThai === TrangThaiBaoLoi.CHO_TIEP_NHAN && (
                      <button
                        onClick={() => xuLyXoa(item.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-medium text-rose-600 dark:text-rose-400 transition-colors"
                        title="Hủy phản ánh này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="sr-only sm:not-sr-only">Hủy</span>
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
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hiển thị trang <span className="font-semibold text-slate-900 dark:text-slate-100">{trangHienTai}</span> / {phanTrang.tongSoTrang} (Tổng số {phanTrang.tongSo} phản ánh)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTrangHienTai((p) => Math.max(1, p - 1))}
              disabled={trangHienTai <= 1}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTrangHienTai((p) => Math.min(phanTrang.tongSoTrang, p + 1))}
              disabled={trangHienTai >= phanTrang.tongSoTrang}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Phân loại yêu cầu
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { loai: LoaiBaoLoiDongGop.BAO_LOI, label: 'Báo lỗi hệ thống', sub: 'Chức năng lỗi, không tải được trang' },
                { loai: LoaiBaoLoiDongGop.DONG_GOP_Y_KIEN, label: 'Đóng góp ý kiến', sub: 'Góp ý giao diện, tiện ích mới' },
                { loai: LoaiBaoLoiDongGop.HO_TRO_KY_THUAT, label: 'Hỗ trợ kỹ thuật', sub: 'Tài khoản, quyền hạn, thiết bị' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.loai}
                  onClick={() => setFormGui((f) => ({ ...f, loaiPhanHoi: item.loai }))}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    formGui.loaiPhanHoi === item.loai
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <p className="text-xs font-semibold">{item.label}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Mức độ ưu tiên */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Mức độ ưu tiên
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { u: MucDoUuTienBaoLoi.THAP, label: 'Thấp' },
                { u: MucDoUuTienBaoLoi.TRUNG_BINH, label: 'Trung bình' },
                { u: MucDoUuTienBaoLoi.CAO, label: 'Cao' },
                { u: MucDoUuTienBaoLoi.KHAN_CAP, label: 'Khẩn cấp' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.u}
                  onClick={() => setFormGui((f) => ({ ...f, mucDoUuTien: p.u }))}
                  className={`py-2 px-3 rounded-lg border text-center text-xs font-medium transition-all ${
                    formGui.mucDoUuTien === p.u
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tiêu đề */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Tiêu đề phản ánh <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formGui.tieuDe}
              onChange={(e) => setFormGui((f) => ({ ...f, tieuDe: e.target.value }))}
              placeholder="Tóm tắt ngắn gọn vấn đề (Ví dụ: Không thể tải bài tập PDF môn Toán)"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Chi tiết nội dung */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Nội dung chi tiết <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={5}
              value={formGui.noiDung}
              onChange={(e) => setFormGui((f) => ({ ...f, noiDung: e.target.value }))}
              placeholder="Mô tả cụ thể các bước bạn đã làm, thông báo lỗi xuất hiện (nếu có), hoặc đề xuất giải pháp bạn mong muốn..."
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
            <p className="mt-1 text-right text-[11px] text-slate-400">
              {formGui.noiDung.length}/5000 ký tự (tối thiểu 10 ký tự)
            </p>
          </div>

          {/* Đính kèm thông tin thiết bị */}
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <input
              type="checkbox"
              id="kemThongTin"
              checked={formGui.kemThongTinThietBi}
              onChange={(e) => setFormGui((f) => ({ ...f, kemThongTinThietBi: e.target.checked }))}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <label htmlFor="kemThongTin" className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
              Tự động gửi thông tin thiết bị để bộ phận kỹ thuật hỗ trợ khắc phục nhanh nhất.
            </label>
          </div>

          {/* Nút hành động */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setModalGuiMo(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={mutationGuiMoi.isPending}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors shadow-sm"
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
            <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
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
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {modalChiTietMo.tieuDe}
              </h3>
              <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                {modalChiTietMo.noiDung}
              </div>
            </div>

            {/* Thông tin kỹ thuật đính kèm nếu có */}
            {modalChiTietMo.thongTinTrinhDuyet && (
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <p className="flex items-start gap-2">
                  <Monitor className="w-3.5 h-3.5 text-slate-500 mt-0.5" />
                  <span className="font-mono text-[11px] break-all">
                    {modalChiTietMo.thongTinTrinhDuyet}
                  </span>
                </p>
              </div>
            )}

            {/* Khối phản hồi từ Ban Quản trị */}
            {modalChiTietMo.phanHoiXuLy ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Phản hồi chính thức:</span>
                  </div>
                  {modalChiTietMo.ngayCapNhat && (
                    <span className="text-xs text-emerald-700 dark:text-emerald-400">
                      {dinhDangThoiGian(modalChiTietMo.ngayCapNhat)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-emerald-950 dark:text-emerald-100 whitespace-pre-wrap leading-relaxed">
                  {modalChiTietMo.phanHoiXuLy}
                </p>
                {modalChiTietMo.nguoiXuLy?.hoTen && (
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 pt-1">
                    Người phụ trách: {modalChiTietMo.nguoiXuLy.hoTen}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Yêu cầu này đang trong hàng đợi xử lý của ban quản trị.</span>
              </div>
            )}

            {/* Chân modal */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400">
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Cập nhật xử lý</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setModalChiTietMo(null)}
                  className="px-4 py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">Yêu cầu được chọn:</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {modalXuLyMo.tieuDe}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                {modalXuLyMo.noiDung}
              </p>
            </div>

            {/* Lựa chọn trạng thái mới */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Trạng thái xử lý <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { tt: TrangThaiBaoLoi.CHO_TIEP_NHAN, label: 'Chờ tiếp nhận', color: 'hover:border-amber-500' },
                  { tt: TrangThaiBaoLoi.DANG_XU_LY, label: 'Đang xử lý', color: 'hover:border-blue-500' },
                  { tt: TrangThaiBaoLoi.DA_XU_LY, label: 'Đã giải quyết', color: 'hover:border-emerald-500' },
                  { tt: TrangThaiBaoLoi.TU_CHOI, label: 'Từ chối', color: 'hover:border-slate-500' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.tt}
                    onClick={() => setFormXuLy((f) => ({ ...f, trangThai: item.tt }))}
                    className={`py-2 px-3 rounded-lg border text-center text-xs font-medium transition-all ${
                      formXuLy.trangThai === item.tt
                        ? 'border-blue-600 bg-blue-600 text-white font-semibold'
                        : `border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 ${item.color}`
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nội dung phản hồi */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Nội dung phản hồi tới người gửi
              </label>
              <textarea
                rows={4}
                required
                value={formXuLy.phanHoiXuLy}
                onChange={(e) => setFormXuLy((f) => ({ ...f, phanHoiXuLy: e.target.value }))}
                placeholder="Nhập thông điệp trả lời, kết quả khắc phục hoặc hướng dẫn thêm cho người gửi..."
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Thông điệp này sẽ hiển thị trực tiếp trong lịch sử phản ánh của người gửi và gửi thông báo chuông tới họ.
              </p>
            </div>

            {/* Nút hành động */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setModalXuLyMo(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={mutationXuLy.isPending}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors shadow-sm"
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
