'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Users,
  Video,
  Clock,
  Plus,
  Trash2,
  BookOpen,
  ArrowLeft,
  CalendarPlus,
  School,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  MessageSquare,
  ClipboardCheck,
  QrCode,
  BrainCircuit,
  GraduationCap,
  Copy,
  UserCheck,
} from 'lucide-react';
import { mayKhachApi } from '../../../../tien-ich/may-khach-api';
import { thongBao } from '../../../../tien-ich/thong-bao';
import { HopThoai } from '../../../../thanh-phan/hop-thoai';
import { TabBangTin } from './thanh-phan/tab-bang-tin';
import { TabTaiLieu } from './thanh-phan/tab-tai-lieu';
import { TabBaiTap } from './thanh-phan/tab-bai-tap';
import { TabDiemDanh } from './thanh-phan/tab-diem-danh';
import { TabKiemTra } from './thanh-phan/tab-kiem-tra';
import { TabSoDiem } from './thanh-phan/tab-so-diem';
import {
  LopHocPhan,
  ThoiKhoaBieu,
  BuoiHoc,
  GhiDanh,
  TaoThoiKhoaBieuInput,
  VaiTro,
  PayloadJwt,
} from '@lms/chung';

export default function TrangChiTietLopHocPhan({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [tabHienTai, setTabHienTai] = useState<
    | 'bang-tin'
    | 'diem-danh'
    | 'kiem-tra'
    | 'bai-tap'
    | 'so-diem'
    | 'tai-lieu'
    | 'thoi-khoa-bieu'
    | 'hoc-sinh'
  >('bang-tin');

  // Modals
  const [moModalTkb, setMoModalTkb] = useState(false);
  const [moModalGhiDanh, setMoModalGhiDanh] = useState(false);
  const [moModalImportLop, setMoModalImportLop] = useState(false);
  const [thongBaoLoi, setThongBaoLoi] = useState<string | null>(null);
  const [thongBaoThanhCong, setThongBaoThanhCong] = useState<string | null>(null);

  // Form TKB
  const [formTkb, setFormTkb] = useState<TaoThoiKhoaBieuInput>({
    thuTrongTuan: 2,
    tietBatDau: 1,
    soTiet: 3,
    phongHoc: '',
  });

  // Form Ghi danh
  const [idHocSinhChon, setIdHocSinhChon] = useState('');
  const [idLopHanhChinhChon, setIdLopHanhChinhChon] = useState('');

  // Lấy profile user (Tái sử dụng cache 0ms)
  const { data: nguoiDungHienTai } = useQuery<PayloadJwt>({
    queryKey: ['ho-so-hien-tai'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/xac-thuc/ho-so-hien-tai');
      return res.data?.duLieu;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Lấy chi tiết lớp
  const {
    data: lopHocPhan,
    isLoading: dangTaiLop,
    error: loiLop,
  } = useQuery<LopHocPhan>({
    queryKey: ['chi-tiet-lop', id],
    queryFn: async () => {
      const res = await mayKhachApi.get(`/lop-hoc-phan/${id}`);
      return res.data.duLieu;
    },
    retry: false,
  });

  const laGiaoVienLop = Boolean(
    nguoiDungHienTai?.vaiTro === VaiTro.GIAO_VIEN &&
      (lopHocPhan?.giaoVien?.nguoiDung?.id === nguoiDungHienTai?.sub ||
        lopHocPhan?.giaoVien?.nguoiDung?.email === nguoiDungHienTai?.email),
  );

  // Lấy thời khóa biểu lớp
  const { data: danhSachTkb, isLoading: dangTaiTkb } = useQuery<ThoiKhoaBieu[]>({
    queryKey: ['tkb-lop', id],
    queryFn: async () => {
      const res = await mayKhachApi.get(`/thoi-khoa-bieu/lop/${id}`);
      return res.data.duLieu || [];
    },
    enabled: !!lopHocPhan,
  });

  // Lấy danh sách buổi học
  const { data: danhSachBuoiHoc, isLoading: dangTaiBuoiHoc } = useQuery<BuoiHoc[]>({
    queryKey: ['buoi-hoc-lop', id],
    queryFn: async () => {
      const res = await mayKhachApi.get(`/thoi-khoa-bieu/buoi-hoc/lop/${id}`);
      return res.data.duLieu || [];
    },
    enabled: !!lopHocPhan,
  });

  // Lấy danh sách học sinh ghi danh
  const { data: danhSachGhiDanh, isLoading: dangTaiGhiDanh } = useQuery<GhiDanh[]>({
    queryKey: ['ghi-danh-lop', id],
    queryFn: async () => {
      const res = await mayKhachApi.get(`/lop-hoc-phan/${id}/ghi-danh`);
      return res.data.duLieu || [];
    },
    enabled: !!lopHocPhan,
  });

  // Lấy danh sách học sinh (để giáo vụ chọn thêm)
  const { data: tatCaHocSinh } = useQuery({
    queryKey: ['hoc-sinh-select'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/ho-so/hoc-sinh', { params: { kichThuoc: 100 } });
      return res.data.duLieu?.duLieu || [];
    },
    enabled: moModalGhiDanh,
  });

  // Lấy danh sách lớp hành chính (để giáo vụ chọn import)
  const { data: danhSachLopHanhChinh } = useQuery({
    queryKey: ['lop-hanh-chinh-select'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/hoc-vu/lop-hanh-chinh', { params: { kichThuoc: 50 } });
      return res.data.duLieu?.duLieu || [];
    },
    enabled: moModalImportLop,
  });

  // Mutations
  const taoTkbMutation = useMutation({
    mutationFn: (duLieu: TaoThoiKhoaBieuInput) =>
      mayKhachApi.post(`/thoi-khoa-bieu/lop/${id}`, duLieu),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tkb-lop', id] });
      setMoModalTkb(false);
      setThongBaoLoi(null);
      setThongBaoThanhCong('Thêm tiết học thành công');
      thongBao.thanhCong('Thêm tiết học thành công');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.thongDiep || 'Lỗi khi thêm tiết học (trùng lịch)';
      setThongBaoLoi(msg);
      thongBao.thatBai('Thêm tiết học thất bại', msg);
    },
  });

  const sinhBuoiHocMutation = useMutation({
    mutationFn: () => mayKhachApi.post(`/thoi-khoa-bieu/lop/${id}/sinh-buoi-hoc`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['buoi-hoc-lop', id] });
      const msg = res.data.duLieu?.thongBao || 'Đã sinh danh sách buổi học tự động';
      setThongBaoThanhCong(msg);
      thongBao.thanhCong('Sinh lịch học thành công', msg);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.thongDiep || 'Lỗi khi sinh buổi học';
      setThongBaoLoi(msg);
      thongBao.thatBai('Sinh buổi học thất bại', msg);
    },
  });

  const ghiDanhMutation = useMutation({
    mutationFn: (idHocSinh: string) =>
      mayKhachApi.post(`/lop-hoc-phan/${id}/ghi-danh`, { idHocSinh }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ghi-danh-lop', id] });
      queryClient.invalidateQueries({ queryKey: ['chi-tiet-lop', id] });
      setMoModalGhiDanh(false);
      setIdHocSinhChon('');
      setThongBaoLoi(null);
      setThongBaoThanhCong('Ghi danh sinh viên thành công');
      thongBao.thanhCong('Ghi danh thành công', 'Đã thêm sinh viên vào lớp học phần.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.thongDiep || 'Lỗi khi ghi danh';
      setThongBaoLoi(msg);
      thongBao.thatBai('Ghi danh thất bại', msg);
    },
  });

  const ghiDanhTheoLopMutation = useMutation({
    mutationFn: (idLopHanhChinh: string) =>
      mayKhachApi.post(`/lop-hoc-phan/${id}/ghi-danh-lop-hanh-chinh`, { idLopHanhChinh }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ghi-danh-lop', id] });
      queryClient.invalidateQueries({ queryKey: ['chi-tiet-lop', id] });
      setMoModalImportLop(false);
      setIdLopHanhChinhChon('');
      setThongBaoLoi(null);
      setThongBaoThanhCong('Ghi danh theo lớp hành chính thành công');
      thongBao.thanhCong(
        'Ghi danh theo lớp thành công',
        'Toàn bộ sinh viên trong lớp sinh hoạt đã được thêm vào lớp học phần.',
      );
    },
    onError: (err: any) => {
      const msg = err.response?.data?.thongDiep || 'Lỗi khi ghi danh theo lớp';
      setThongBaoLoi(msg);
      thongBao.thatBai('Ghi danh thất bại', msg);
    },
  });

  const xoaGhiDanhMutation = useMutation({
    mutationFn: (idHocSinh: string) =>
      mayKhachApi.delete(`/lop-hoc-phan/${id}/ghi-danh/${idHocSinh}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ghi-danh-lop', id] });
      queryClient.invalidateQueries({ queryKey: ['chi-tiet-lop', id] });
      setThongBaoThanhCong('Đã xóa sinh viên khỏi lớp học phần');
      thongBao.thanhCong('Đã rút tên sinh viên khỏi lớp học phần.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.thongDiep || 'Lỗi khi xóa sinh viên';
      setThongBaoLoi(msg);
      thongBao.thatBai('Rút tên sinh viên thất bại', msg);
    },
  });

  const xoaTkbMutation = useMutation({
    mutationFn: (idTkb: string) => mayKhachApi.delete(`/thoi-khoa-bieu/${idTkb}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tkb-lop', id] });
      setThongBaoThanhCong('Đã xóa tiết học');
      thongBao.thanhCong('Đã xóa tiết học khỏi thời khóa biểu.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.thongDiep || 'Lỗi khi xóa tiết học';
      setThongBaoLoi(msg);
      thongBao.thatBai('Xóa tiết học thất bại', msg);
    },
  });

  const laAdminHoacGiaoVu =
    nguoiDungHienTai?.vaiTro === VaiTro.QUAN_TRI_VIEN ||
    nguoiDungHienTai?.vaiTro === VaiTro.GIAO_VU;

  const laGiaoVien = nguoiDungHienTai?.vaiTro === VaiTro.GIAO_VIEN;

  const saoChepMaMoi = (ma: string) => {
    navigator.clipboard?.writeText(ma);
    thongBao.thanhCong('Đã sao chép mã mời', `Mã tham gia ${ma} đã được lưu vào bộ nhớ tạm.`);
  };

  if (dangTaiLop) {
    return (
      <div className="text-center py-20 text-[var(--muted)]">
        Đang tải thông tin lớp học phần...
      </div>
    );
  }

  if (loiLop || !lopHocPhan) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-[var(--danger-soft)] text-[var(--danger)] rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text)]">Không thể truy cập lớp học phần</h2>
        <p className="text-sm text-[var(--muted)]">
          Bạn không có quyền truy cập lớp học này hoặc lớp học không tồn tại. Vui lòng kiểm tra lại
          liên kết hoặc liên hệ giảng viên phụ trách.
        </p>
        <Link
          href="/lop-hoc-phan"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-[var(--radius)] text-sm font-medium hover:bg-[var(--accent-hover)]"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách lớp
        </Link>
      </div>
    );
  }

  const cacTab = [
    { id: 'bang-tin', nhan: 'Bảng tin', icon: MessageSquare },
    { id: 'tai-lieu', nhan: 'Tài liệu môn học', icon: BookOpen },
    { id: 'bai-tap', nhan: 'Bài tập', icon: ClipboardCheck },
    { id: 'kiem-tra', nhan: 'Luyện tập & Thi thử', icon: BrainCircuit },
    { id: 'diem-danh', nhan: 'Điểm danh thông minh', icon: QrCode },
    { id: 'so-diem', nhan: 'Kết quả học phần', icon: GraduationCap },
    { id: 'thoi-khoa-bieu', nhan: 'Thời khóa biểu', icon: Clock },
    {
      id: 'hoc-sinh',
      nhan: `Thành viên (${lopHocPhan._count?.danhSachGhiDanh || 0})`,
      icon: Users,
    },
  ] as const;

  return (
    <div className="space-y-5">
      {/* Breadcrumb quay lại */}
      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        <Link
          href="/lop-hoc-phan"
          className="inline-flex items-center gap-1.5 font-semibold text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Danh sách lớp học phần
        </Link>
        <span>/</span>
        <span className="font-mono font-semibold text-[var(--text)]">
          {lopHocPhan.maLopHocPhan}
        </span>
      </div>

      {/* Thông báo */}
      {thongBaoLoi && (
        <div className="p-3 bg-[var(--danger-soft)] text-[var(--danger)] text-sm rounded-[var(--radius)] flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {thongBaoLoi}
          </span>
          <button
            onClick={() => setThongBaoLoi(null)}
            className="text-xs font-bold underline cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}
      {thongBaoThanhCong && (
        <div className="p-3 bg-[var(--accent-soft)] text-[var(--accent)] text-sm rounded-[var(--radius)] flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {thongBaoThanhCong}
          </span>
          <button
            onClick={() => setThongBaoThanhCong(null)}
            className="text-xs font-bold underline cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Banner thông tin lớp học */}
      <div className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-[var(--radius)] shadow-xs overflow-hidden">
        <div className="h-[4px] w-full bg-[var(--accent)]" />
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-2.5 py-0.5 bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)] rounded-[var(--radius)] text-[11px] font-mono font-bold tracking-wider uppercase">
                  {lopHocPhan.maLopHocPhan}
                </span>
                <span className="text-xs font-mono text-[var(--muted)]">
                  {lopHocPhan.monHoc?.tenMonHoc} • {lopHocPhan.monHoc?.soTinChi || 3} tín chỉ
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-sans font-semibold bg-[var(--accent-soft)] text-[var(--accent)] px-2 py-0.5 rounded-[var(--radius)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                  Đang học
                </span>
              </div>

              <h1 className="text-[22px] sm:text-[24px] font-sans font-bold tracking-tight text-[var(--text)]">
                {lopHocPhan.tenLopHocPhan}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-[12.5px] text-[var(--muted)] pt-0.5">
                {lopHocPhan.giaoVien && (
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[var(--accent)]" strokeWidth={1.75} />
                    <span>Giảng viên:</span>
                    <strong className="text-[var(--text)] font-semibold">
                      {lopHocPhan.giaoVien.nguoiDung.hoTen}
                    </strong>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[var(--accent)]" strokeWidth={1.75} />
                  {lopHocPhan.hocKy?.tenHocKy} ({lopHocPhan.hocKy?.namHoc?.tenNamHoc})
                </span>
                <span className="flex items-center gap-1.5 font-mono">
                  <Users className="w-4 h-4 text-[var(--accent)]" strokeWidth={1.75} />
                  {lopHocPhan._count?.danhSachGhiDanh || 0} sinh viên
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {(laAdminHoacGiaoVu || laGiaoVienLop) && lopHocPhan.maThamGia && (
                <button
                  type="button"
                  onClick={() => saoChepMaMoi(lopHocPhan.maThamGia!)}
                  title="Nhấn để sao chép mã mời"
                  className="px-3.5 py-2 rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--bg)] hover:border-[var(--accent)] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <div className="text-left">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">
                      Mã mời lớp
                    </p>
                    <p className="text-sm font-mono font-bold text-[var(--accent)] tracking-wider">
                      {lopHocPhan.maThamGia}
                    </p>
                  </div>
                  <Copy className="w-4 h-4 text-[var(--muted)]" strokeWidth={1.75} />
                </button>
              )}

              <Link
                href={`/lop-hoc-phan/${id}/phong-hoc`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold rounded-[var(--radius)] text-[13px] transition-colors"
              >
                <Video className="w-4 h-4" strokeWidth={1.75} />
                Vào phòng học trực tuyến
              </Link>
            </div>
          </div>
        </div>

        {/* Thanh Tabs Điều Hướng gạch chân bên trong thẻ Header */}
        <div className="px-6 border-t border-[var(--border)] bg-[var(--bg)] flex overflow-x-auto scrollbar-none gap-1">
          {cacTab.map((tab) => {
            const Icon = tab.icon;
            const dangChon = tabHienTai === tab.id;
            return (
              <button
                key={tab.id}
                data-id={tab.id}
                data-tab={tab.id}
                type="button"
                onClick={() => setTabHienTai(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-3 text-[13px] font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  dangChon
                    ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--surface)]'
                    : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={1.75} />
                <span>{tab.nhan}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: BẢNG TIN */}
      {tabHienTai === 'bang-tin' && (
        <TabBangTin
          idLopHocPhan={id}
          nguoiDung={nguoiDungHienTai}
          laGiaoVienLop={laGiaoVienLop}
          danhSachTkb={danhSachTkb || []}
          danhSachBuoiHoc={danhSachBuoiHoc || []}
          onChuyenTab={setTabHienTai}
        />
      )}

      {/* TAB 2: ĐIỂM DANH THÔNG MINH */}
      {tabHienTai === 'diem-danh' && (
        <TabDiemDanh
          idLopHocPhan={id}
          nguoiDung={nguoiDungHienTai}
          laGiaoVienLop={laGiaoVienLop}
          danhSachBuoiHoc={danhSachBuoiHoc || []}
        />
      )}

      {/* TAB 3: LUYỆN TẬP & THI THỬ */}
      {tabHienTai === 'kiem-tra' && (
        <TabKiemTra
          idLopHocPhan={id}
          nguoiDung={nguoiDungHienTai}
          laGiaoVienLop={laGiaoVienLop}
        />
      )}

      {/* TAB 4: BÀI TẬP */}
      {tabHienTai === 'bai-tap' && (
        <TabBaiTap
          idLopHocPhan={id}
          nguoiDung={nguoiDungHienTai}
          laGiaoVienLop={laGiaoVienLop}
        />
      )}

      {/* TAB 5: KẾT QUẢ HỌC PHẦN */}
      {tabHienTai === 'so-diem' && (
        <TabSoDiem
          idLopHocPhan={id}
          nguoiDung={nguoiDungHienTai}
          laGiaoVienLop={laGiaoVienLop}
        />
      )}

      {/* TAB 6: TÀI LIỆU */}
      {tabHienTai === 'tai-lieu' && (
        <TabTaiLieu
          idLopHocPhan={id}
          nguoiDung={nguoiDungHienTai}
          laGiaoVienLop={laGiaoVienLop}
        />
      )}

      {/* TAB 7: THỜI KHÓA BIỂU & BUỔI HỌC */}
      {tabHienTai === 'thoi-khoa-bieu' && (
        <div className="space-y-6">
          {/* Lịch tuần định kỳ */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-[var(--text)] text-[15px]">Lịch học tuần định kỳ</h3>
                <p className="text-xs text-[var(--muted)]">
                  Các tiết học cố định lặp lại theo tuần trong học kỳ
                </p>
              </div>

              {(laAdminHoacGiaoVu || laGiaoVien) && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setThongBaoLoi(null);
                      sinhBuoiHocMutation.mutate();
                    }}
                    disabled={sinhBuoiHocMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-semibold rounded-[var(--radius)] transition-colors border border-[var(--accent)] cursor-pointer"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    {sinhBuoiHocMutation.isPending ? 'Đang sinh...' : 'Tự động sinh buổi học'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setThongBaoLoi(null);
                      setMoModalTkb(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold rounded-[var(--radius)] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm tiết học
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {dangTaiTkb ? (
                <div className="col-span-3 text-center py-6 text-[var(--muted)]">
                  Đang tải lịch học...
                </div>
              ) : danhSachTkb && danhSachTkb.length > 0 ? (
                danhSachTkb.map((tkb) => (
                  <div
                    key={tkb.id}
                    className="p-4 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)] flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 bg-[var(--accent-soft)] text-[var(--accent)] font-mono font-bold text-xs rounded-[var(--radius)]">
                        Thứ {tkb.thuTrongTuan === 8 ? 'CN' : tkb.thuTrongTuan}
                      </span>
                      <p className="text-sm font-semibold text-[var(--text)] pt-1">
                        Tiết {tkb.tietBatDau} - Tiết {tkb.tietBatDau + tkb.soTiet - 1} ({tkb.soTiet}{' '}
                        tiết)
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        Phòng: {tkb.phongHoc || 'Trực tuyến'}
                      </p>
                    </div>

                    {(laAdminHoacGiaoVu || laGiaoVien) && (
                      <button
                        type="button"
                        onClick={() => xoaTkbMutation.mutate(tkb.id)}
                        className="text-[var(--muted)] hover:text-[var(--danger)] p-1 rounded-[var(--radius)] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-6 text-[var(--muted)]">
                  Chưa có lịch học tuần nào được thiết lập
                </div>
              )}
            </div>
          </div>

          {/* Danh sách các buổi học cụ thể */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-[var(--text)] text-[15px]">Danh sách Buổi học cụ thể</h3>
            <div className="divide-y divide-[var(--border)]">
              {dangTaiBuoiHoc ? (
                <div className="text-center py-6 text-[var(--muted)]">Đang tải buổi học...</div>
              ) : danhSachBuoiHoc && danhSachBuoiHoc.length > 0 ? (
                danhSachBuoiHoc.map((buoi) => (
                  <div key={buoi.id} className="py-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--text)]">{buoi.chuDe}</h4>
                      <p className="text-xs font-mono text-[var(--muted)] mt-0.5">
                        {new Date(buoi.thoiGianBD).toLocaleString('vi-VN')} -{' '}
                        {new Date(buoi.thoiGianKT).toLocaleTimeString('vi-VN')}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-[var(--bg)] text-[var(--muted)] rounded-[var(--radius)] text-xs font-medium border border-[var(--border)]">
                      {buoi.trangThai === 'CHUA_BAT_DAU' ? 'Chưa bắt đầu' : buoi.trangThai}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-[var(--muted)]">
                  Chưa có buổi học nào. Nhấn &quot;Tự động sinh buổi học&quot; để sinh lịch học theo
                  thời khóa biểu.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: DANH SÁCH SINH VIÊN GHI DANH */}
      {tabHienTai === 'hoc-sinh' && (
        <div className="space-y-4">
          {laAdminHoacGiaoVu && (
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setThongBaoLoi(null);
                  setMoModalImportLop(true);
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--bg)] text-[var(--text)] text-xs font-semibold rounded-[var(--radius)] transition-colors cursor-pointer"
              >
                <School className="w-4 h-4 text-[var(--accent)]" />
                Ghi danh theo Lớp hành chính
              </button>
              <button
                type="button"
                onClick={() => {
                  setThongBaoLoi(null);
                  setMoModalGhiDanh(true);
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-semibold rounded-[var(--radius)] transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                Thêm Sinh viên
              </button>
            </div>
          )}

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden shadow-xs">
            <table className="w-full text-left text-sm text-[var(--muted)]">
              <thead className="bg-[var(--bg)] border-b border-[var(--border)] text-[var(--text)] font-semibold text-xs font-mono uppercase">
                <tr>
                  <th className="py-3 px-4">Mã sinh viên</th>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-4">Lớp hành chính</th>
                  <th className="py-3 px-4">Ngày ghi danh</th>
                  {laAdminHoacGiaoVu && <th className="py-3 px-4 text-right">Thao tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {dangTaiGhiDanh ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-[var(--muted)]">
                      Đang tải danh sách sinh viên...
                    </td>
                  </tr>
                ) : danhSachGhiDanh && danhSachGhiDanh.length > 0 ? (
                  danhSachGhiDanh.map((gd: any) => (
                    <tr key={gd.id} className="hover:bg-[var(--bg)] transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-[var(--accent)]">
                        {gd.hocSinh?.maHocSinh}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-[var(--text)]">
                          {gd.hocSinh?.nguoiDung.hoTen}
                        </p>
                        <p className="text-xs text-[var(--muted)]">{gd.hocSinh?.nguoiDung.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        {gd.hocSinh?.lopHanhChinh ? (
                          <span className="px-2 py-0.5 bg-[var(--bg)] text-[var(--text)] font-mono text-xs rounded-[var(--radius)] border border-[var(--border)]">
                            {gd.hocSinh.lopHanhChinh.tenLop}
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--muted)]">Chưa xếp lớp</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-[var(--muted)]">
                        {new Date(gd.ngayGhiDanh).toLocaleDateString('vi-VN')}
                      </td>
                      {laAdminHoacGiaoVu && (
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => xoaGhiDanhMutation.mutate(gd.hocSinh.id)}
                            className="text-xs text-[var(--danger)] font-semibold px-2 py-1 hover:bg-[var(--danger-soft)] rounded-[var(--radius)] cursor-pointer"
                          >
                            Xóa khỏi lớp
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-[var(--muted)]">
                      Chưa có sinh viên nào được ghi danh vào lớp học phần này
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL THÊM TIẾT HỌC THỜI KHÓA BIỂU */}
      <HopThoai
        mo={moModalTkb}
        onDong={() => setMoModalTkb(false)}
        tieuDe="Thêm Tiết học vào Thời khóa biểu"
        moTa="Thiết lập buổi học định kỳ hàng tuần cho lớp học phần"
        kichThuoc="nho"
      >
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">
                Thứ trong tuần
              </label>
              <select
                value={formTkb.thuTrongTuan}
                onChange={(e) =>
                  setFormTkb({ ...formTkb, thuTrongTuan: parseInt(e.target.value) || 2 })
                }
                className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius)] text-sm bg-[var(--surface)] focus:border-[var(--accent)] focus:outline-none"
              >
                <option value={2}>Thứ Hai</option>
                <option value={3}>Thứ Ba</option>
                <option value={4}>Thứ Tư</option>
                <option value={5}>Thứ Năm</option>
                <option value={6}>Thứ Sáu</option>
                <option value={7}>Thứ Bảy</option>
                <option value={8}>Chủ Nhật</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text)] mb-1">
                  Tiết bắt đầu
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={formTkb.tietBatDau}
                  onChange={(e) =>
                    setFormTkb({ ...formTkb, tietBatDau: parseInt(e.target.value) || 1 })
                  }
                  className="w-full px-3 py-2 border border-[var(--border)] bg-[var(--bg)] rounded-[var(--radius)] text-sm focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text)] mb-1">Số tiết</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={formTkb.soTiet}
                  onChange={(e) =>
                    setFormTkb({ ...formTkb, soTiet: parseInt(e.target.value) || 1 })
                  }
                  className="w-full px-3 py-2 border border-[var(--border)] bg-[var(--bg)] rounded-[var(--radius)] text-sm focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">Phòng học</label>
              <input
                type="text"
                placeholder="VD: P102, Lab 3, Trực tuyến"
                value={formTkb.phongHoc || ''}
                onChange={(e) => setFormTkb({ ...formTkb, phongHoc: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--border)] bg-[var(--bg)] rounded-[var(--radius)] text-sm focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setMoModalTkb(false)}
              className="px-4 py-2 border border-[var(--border)] text-[var(--text)] rounded-[var(--radius)] text-xs font-semibold hover:bg-[var(--bg)] cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={taoTkbMutation.isPending}
              onClick={() => taoTkbMutation.mutate(formTkb)}
              className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-[var(--radius)] text-xs font-semibold disabled:opacity-50 cursor-pointer"
            >
              {taoTkbMutation.isPending ? 'Đang lưu...' : 'Thêm tiết học'}
            </button>
          </div>
        </div>
      </HopThoai>

      {/* MODAL GHI DANH 1 HỌC SINH */}
      <HopThoai
        mo={moModalGhiDanh}
        onDong={() => setMoModalGhiDanh(false)}
        tieuDe="Ghi danh Sinh viên vào lớp"
        moTa="Thêm sinh viên cụ thể vào danh sách lớp học phần"
        kichThuoc="nho"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">
              Chọn sinh viên
            </label>
            <select
              value={idHocSinhChon}
              onChange={(e) => setIdHocSinhChon(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius)] text-sm bg-[var(--surface)] focus:border-[var(--accent)] focus:outline-none"
            >
              <option value="">-- Chọn sinh viên từ danh sách --</option>
              {tatCaHocSinh?.map((hs: any) => (
                <option key={hs.id} value={hs.id}>
                  {hs.maHocSinh} - {hs.nguoiDung.hoTen} ({hs.lopHanhChinh?.tenLop || 'Chưa xếp lớp'})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setMoModalGhiDanh(false)}
              className="px-4 py-2 border border-[var(--border)] text-[var(--text)] rounded-[var(--radius)] text-xs font-semibold hover:bg-[var(--bg)] cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={!idHocSinhChon || ghiDanhMutation.isPending}
              onClick={() => ghiDanhMutation.mutate(idHocSinhChon)}
              className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-[var(--radius)] text-xs font-semibold disabled:opacity-50 cursor-pointer"
            >
              {ghiDanhMutation.isPending ? 'Đang ghi danh...' : 'Ghi danh'}
            </button>
          </div>
        </div>
      </HopThoai>

      {/* MODAL GHI DANH THEO LỚP HÀNH CHÍNH */}
      <HopThoai
        mo={moModalImportLop}
        onDong={() => setMoModalImportLop(false)}
        tieuDe="Ghi danh theo Lớp hành chính"
        moTa="Toàn bộ sinh viên thuộc lớp hành chính được chọn sẽ được tự động ghi danh vào lớp học phần này"
        kichThuoc="nho"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">
              Chọn lớp hành chính
            </label>
            <select
              value={idLopHanhChinhChon}
              onChange={(e) => setIdLopHanhChinhChon(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius)] text-sm bg-[var(--surface)] focus:border-[var(--accent)] focus:outline-none"
            >
              <option value="">-- Chọn lớp hành chính --</option>
              {danhSachLopHanhChinh?.map((lop: any) => (
                <option key={lop.id} value={lop.id}>
                  {lop.maLop} - {lop.tenLop} ({lop._count?.danhSachHocSinh || 0} sinh viên)
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setMoModalImportLop(false)}
              className="px-4 py-2 border border-[var(--border)] text-[var(--text)] rounded-[var(--radius)] text-xs font-semibold hover:bg-[var(--bg)] cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={!idLopHanhChinhChon || ghiDanhTheoLopMutation.isPending}
              onClick={() => ghiDanhTheoLopMutation.mutate(idLopHanhChinhChon)}
              className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-[var(--radius)] text-xs font-semibold disabled:opacity-50 cursor-pointer"
            >
              {ghiDanhTheoLopMutation.isPending ? 'Đang import...' : 'Tiến hành ghi danh'}
            </button>
          </div>
        </div>
      </HopThoai>
    </div>
  );
}
