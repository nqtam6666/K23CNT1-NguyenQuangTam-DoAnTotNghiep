'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  ShieldAlert,
  KeyRound,
  Save,
  Check,
  X,
} from 'lucide-react';
import { mayKhachApi } from '../../../../../tien-ich/may-khach-api';
import { thongBao } from '../../../../../tien-ich/thong-bao';
import { HopThoai } from '../../../../../thanh-phan/hop-thoai';
import AnimatedBackground from '@/components/ui/animated-tabs';
import {
  BuoiHoc,
  PayloadJwt,
  VaiTro,
  TrangThaiDiemDanh,
  TrangThaiDonXinNghi,
  ThongKeChuyenCanLop,
  DonXinNghi,
} from '@lms/chung';

interface ThuocTinhTabDiemDanh {
  idLopHocPhan: string;
  nguoiDung?: PayloadJwt;
  laGiaoVienLop: boolean;
  danhSachBuoiHoc: BuoiHoc[];
}

export function TabDiemDanh({
  idLopHocPhan,
  nguoiDung,
  laGiaoVienLop,
  danhSachBuoiHoc,
}: ThuocTinhTabDiemDanh) {
  const queryClient = useQueryClient();

  const laQuanTri =
    nguoiDung?.vaiTro === VaiTro.QUAN_TRI_VIEN ||
    nguoiDung?.vaiTro === VaiTro.GIAO_VU ||
    nguoiDung?.vaiTro === VaiTro.BAN_GIAM_HIEU;
  const coQuyenQuanLy = laGiaoVienLop || laQuanTri;
  const laHocSinh = nguoiDung?.vaiTro === VaiTro.HOC_SINH;

  const [cheDoXem, setCheDoXem] = useState<'theo-buoi' | 'chuyen-can' | 'don-xin-nghi'>('theo-buoi');
  const [idBuoiHocChon, setIdBuoiHocChon] = useState<string>('');
  const [thoiHanPhut, setThoiHanPhut] = useState<number>(10);
  const [maPinNhap, setMaPinNhap] = useState<string>('');

  // State bảng điểm danh theo buổi (cho Giáo viên)
  const [bangTrangThai, setBangTrangThai] = useState<
    Record<string, { trangThai: TrangThaiDiemDanh; ghiChu: string }>
  >({});

  // Modal xin nghỉ phép (cho Học sinh)
  const [moModalXinNghi, setMoModalXinNghi] = useState(false);
  const [idBuoiHocXinNghi, setIdBuoiHocXinNghi] = useState<string>('');
  const [lyDoNghi, setLyDoNghi] = useState('');

  useEffect(() => {
    if (!idBuoiHocChon && danhSachBuoiHoc.length > 0) {
      setIdBuoiHocChon(danhSachBuoiHoc[0].id);
      setIdBuoiHocXinNghi(danhSachBuoiHoc[0].id);
    }
  }, [danhSachBuoiHoc, idBuoiHocChon]);

  // 1. Lấy báo cáo điểm danh của buổi học đang chọn
  const { data: duLieuBuoiHoc, isLoading: dangTaiDiemDanhBuoi } = useQuery({
    queryKey: ['diem-danh-buoi', idBuoiHocChon],
    queryFn: async () => {
      if (!idBuoiHocChon) return null;
      const res = await mayKhachApi.get(
        `/phong-hoc-truc-tuyen/lop/${idLopHocPhan}/buoi-hoc/${idBuoiHocChon}/bao-cao`,
      );
      return res.data?.duLieu || res.data;
    },
    enabled: !!idBuoiHocChon,
  });

  // Đồng bộ state bảng điểm danh khi đổi buổi học
  useEffect(() => {
    if (duLieuBuoiHoc?.danhSachDiemDanh) {
      const mapMoi: Record<string, { trangThai: TrangThaiDiemDanh; ghiChu: string }> = {};
      for (const hs of duLieuBuoiHoc.danhSachDiemDanh) {
        const idHs = hs.idHocSinh || hs.hocSinh?.id;
        if (idHs) {
          mapMoi[idHs] = {
            trangThai: (hs.trangThai as TrangThaiDiemDanh) || TrangThaiDiemDanh.CO_MAT,
            ghiChu: hs.ghiChu || '',
          };
        }
      }
      setBangTrangThai(mapMoi);
    }
  }, [duLieuBuoiHoc]);

  // 2. Lấy thống kê chuyên cần toàn lớp học phần
  const { data: thongKeChuyenCan, isLoading: dangTaiChuyenCan } = useQuery<ThongKeChuyenCanLop>({
    queryKey: ['thong-ke-chuyen-can', idLopHocPhan],
    queryFn: async () => {
      const res = await mayKhachApi.get(
        `/phong-hoc-truc-tuyen/lop/${idLopHocPhan}/thong-ke-chuyen-can`,
      );
      return res.data?.duLieu || res.data;
    },
  });

  // 3. Lấy danh sách đơn xin nghỉ phép
  const { data: danhSachDonNghi = [], isLoading: dangTaiDonNghi } = useQuery<DonXinNghi[]>({
    queryKey: ['don-xin-nghi-lop', idLopHocPhan],
    queryFn: async () => {
      const res = await mayKhachApi.get(`/phong-hoc-truc-tuyen/lop/${idLopHocPhan}/don-xin-nghi`);
      return res.data?.duLieu || res.data || [];
    },
  });

  // Mutation: Mở mã PIN điểm danh thông minh (GV)
  const taoMaPinMutation = useMutation({
    mutationFn: async () => {
      const res = await mayKhachApi.post(
        `/phong-hoc-truc-tuyen/buoi-hoc/${idBuoiHocChon}/mo-ma-diem-danh`,
        {
          thoiHanPhut,
        },
      );
      return res.data?.duLieu || res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['diem-danh-buoi', idBuoiHocChon] });
      queryClient.invalidateQueries({ queryKey: ['buoi-hoc-lop', idLopHocPhan] });
      thongBao.thanhCong(
        `Đã mở mã điểm danh: ${data.maDiemDanh}`,
        `Mã có hiệu lực trong ${thoiHanPhut} phút để học sinh tự điểm danh.`,
      );
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Không thể tạo mã điểm danh',
        err.response?.data?.thongDiep || 'Vui lòng thử lại.',
      );
    },
  });

  // Mutation: Học sinh tự điểm danh bằng mã PIN 6 số
  const diemDanhBangMaMutation = useMutation({
    mutationFn: async () => {
      const res = await mayKhachApi.post(
        `/phong-hoc-truc-tuyen/buoi-hoc/${idBuoiHocChon}/diem-danh-ma`,
        {
          maDiemDanh: maPinNhap.trim(),
        },
      );
      return res.data?.duLieu || res.data;
    },
    onSuccess: (data) => {
      setMaPinNhap('');
      queryClient.invalidateQueries({ queryKey: ['diem-danh-buoi', idBuoiHocChon] });
      queryClient.invalidateQueries({ queryKey: ['thong-ke-chuyen-can', idLopHocPhan] });
      thongBao.thanhCong('Điểm danh thành công!', data?.thongDiep || 'Đã ghi nhận có mặt.');
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Điểm danh thất bại',
        err.response?.data?.thongDiep || 'Mã điểm danh không hợp lệ hoặc đã hết hạn.',
      );
    },
  });

  // Mutation: Đồng bộ điểm danh tự động từ phiên học trực tuyến & đơn xin nghỉ (GV)
  const dongBoTuDongMutation = useMutation({
    mutationFn: async () => {
      const res = await mayKhachApi.post(
        `/phong-hoc-truc-tuyen/buoi-hoc/${idBuoiHocChon}/dong-bo-thong-minh`,
      );
      return res.data?.duLieu || res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['diem-danh-buoi', idBuoiHocChon] });
      queryClient.invalidateQueries({ queryKey: ['thong-ke-chuyen-can', idLopHocPhan] });
      thongBao.thanhCong(
        'Đồng bộ điểm danh hoàn tất',
        data?.thongDiep || 'Đã đối soát dữ liệu phòng học trực tuyến và đơn xin nghỉ phép.',
      );
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Không thể đồng bộ điểm danh',
        err.response?.data?.thongDiep || 'Đã xảy ra lỗi khi đồng bộ.',
      );
    },
  });

  // Mutation: Lưu bảng điểm danh hàng loạt (GV)
  const luuHangLoatMutation = useMutation({
    mutationFn: async () => {
      const danhSachDiemDanh = Object.entries(bangTrangThai).map(([idHocSinh, item]) => ({
        idHocSinh,
        trangThai: item.trangThai,
        ghiChu: item.ghiChu || undefined,
      }));
      const res = await mayKhachApi.post(
        `/phong-hoc-truc-tuyen/buoi-hoc/${idBuoiHocChon}/diem-danh-hang-loat`,
        { danhSachDiemDanh },
      );
      return res.data?.duLieu || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diem-danh-buoi', idBuoiHocChon] });
      queryClient.invalidateQueries({ queryKey: ['thong-ke-chuyen-can', idLopHocPhan] });
      thongBao.thanhCong('Đã lưu bảng điểm danh', 'Cập nhật chuyên cần thành công.');
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Lưu điểm danh thất bại',
        err.response?.data?.thongDiep || 'Không thể lưu bảng điểm danh.',
      );
    },
  });

  // Mutation: Học sinh gửi đơn xin nghỉ phép
  const taoDonXinNghiMutation = useMutation({
    mutationFn: async () => {
      const res = await mayKhachApi.post(`/phong-hoc-truc-tuyen/lop/${idLopHocPhan}/don-xin-nghi`, {
        idBuoiHoc: idBuoiHocXinNghi || idBuoiHocChon,
        lyDo: lyDoNghi.trim(),
      });
      return res.data?.duLieu || res.data;
    },
    onSuccess: () => {
      setMoModalXinNghi(false);
      setLyDoNghi('');
      queryClient.invalidateQueries({ queryKey: ['don-xin-nghi-lop', idLopHocPhan] });
      thongBao.thanhCong('Đã gửi đơn xin nghỉ phép', 'Giáo viên phụ trách sẽ xem xét và phản hồi.');
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Không thể gửi đơn xin nghỉ',
        err.response?.data?.thongDiep || 'Vui lòng kiểm tra lại thông tin.',
      );
    },
  });

  // Mutation: Giáo viên duyệt/từ chối đơn xin nghỉ
  const duyetDonMutation = useMutation({
    mutationFn: async ({
      idDon,
      trangThai,
    }: {
      idDon: string;
      trangThai: 'DA_DUYET' | 'TU_CHOI';
    }) => {
      const res = await mayKhachApi.patch(`/phong-hoc-truc-tuyen/don-xin-nghi/${idDon}/duyet`, {
        trangThai,
      });
      return res.data?.duLieu || res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['don-xin-nghi-lop', idLopHocPhan] });
      queryClient.invalidateQueries({ queryKey: ['thong-ke-chuyen-can', idLopHocPhan] });
      thongBao.thanhCong(
        variables.trangThai === 'DA_DUYET'
          ? 'Đã phê duyệt đơn xin nghỉ'
          : 'Đã từ chối đơn xin nghỉ',
      );
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Xử lý đơn thất bại',
        err.response?.data?.thongDiep || 'Không thể cập nhật trạng thái đơn.',
      );
    },
  });

  const buoiHocDangChon =
    duLieuBuoiHoc?.buoiHoc || danhSachBuoiHoc.find((b) => b.id === idBuoiHocChon);
  const maDiemDanhHienTai = buoiHocDangChon?.maDiemDanh;
  const hanMaDiemDanh = buoiHocDangChon?.hanMaDiemDanh
    ? new Date(buoiHocDangChon.hanMaDiemDanh)
    : null;
  const maConHieuLuc = Boolean(maDiemDanhHienTai && hanMaDiemDanh && hanMaDiemDanh > new Date());

  // Danh sách học sinh để điểm danh theo buổi (lấy từ thongKeChuyenCan kết hợp danhSachDiemDanh của buổi)
  const danhSachHocSinhLop = thongKeChuyenCan?.danhSachHocSinh || [];

  return (
    <div className="space-y-6">
      {/* Thanh điều hướng phụ */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card rounded border border-border/80 p-5 shadow-sm">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Điểm danh thông minh & Quản lý chuyên cần
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Điểm danh bằng mã PIN thời gian thực, đồng bộ tự động từ phòng học trực tuyến và cảnh báo chuyên cần học phần
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-muted/50 p-1 rounded">
          <AnimatedBackground
            defaultValue={cheDoXem}
            onValueChange={(val) => val && setCheDoXem(val as typeof cheDoXem)}
            className="rounded bg-primary shadow-sm"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
          >
            <button
              data-id="theo-buoi"
              type="button"
              onClick={() => setCheDoXem('theo-buoi')}
              className={`px-3.5 py-2 rounded text-xs font-semibold transition-colors cursor-pointer ${
                cheDoXem === 'theo-buoi'
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Điểm danh theo buổi
            </button>
            <button
              data-id="chuyen-can"
              type="button"
              onClick={() => setCheDoXem('chuyen-can')}
              className={`px-3.5 py-2 rounded text-xs font-semibold transition-colors cursor-pointer ${
                cheDoXem === 'chuyen-can'
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Thống kê & Cảnh báo chuyên cần
            </button>
            <button
              data-id="don-xin-nghi"
              type="button"
              onClick={() => setCheDoXem('don-xin-nghi')}
              className={`px-3.5 py-2 rounded text-xs font-semibold transition-colors cursor-pointer ${
                cheDoXem === 'don-xin-nghi'
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Đơn xin nghỉ phép ({danhSachDonNghi.length})
            </button>
          </AnimatedBackground>
        </div>
      </div>

      {/* CHẾ ĐỘ 1: ĐIỂM DANH THEO BUỔI */}
      {cheDoXem === 'theo-buoi' && (
        <div className="space-y-6">
          {danhSachBuoiHoc.length === 0 ? (
            <div className="rounded border border-dashed border-border/80 p-10 text-center bg-card/40">
              <QrCode className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-foreground">Chưa có buổi học nào</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Vui lòng thiết lập Thời khóa biểu và bấm &ldquo;Tự động sinh buổi học&rdquo; trước khi thực hiện điểm danh.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 bg-card rounded border border-border/80 p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        Chọn buổi học cần điểm danh
                      </label>
                      <select
                        value={idBuoiHocChon}
                        onChange={(e) => setIdBuoiHocChon(e.target.value)}
                        className="w-full rounded border border-input bg-background px-3.5 py-2 text-sm font-medium focus:border-primary focus:outline-none"
                      >
                        {danhSachBuoiHoc.map((bh) => (
                          <option key={bh.id} value={bh.id}>
                            {bh.chuDe} ({new Date(bh.thoiGianBD).toLocaleDateString('vi-VN')})
                          </option>
                        ))}
                      </select>
                    </div>

                    {coQuyenQuanLy && (
                      <div className="flex items-center gap-2 self-end">
                        <button
                          type="button"
                          onClick={() => dongBoTuDongMutation.mutate()}
                          disabled={dongBoTuDongMutation.isPending}
                          className="inline-flex items-center gap-1.5 rounded border border-border bg-muted/40 hover:bg-muted px-3.5 py-2 text-xs font-semibold text-foreground transition-colors cursor-pointer"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${dongBoTuDongMutation.isPending ? 'animate-spin' : ''}`}
                          />
                          Đồng bộ tự động
                        </button>
                        <button
                          type="button"
                          onClick={() => luuHangLoatMutation.mutate()}
                          disabled={luuHangLoatMutation.isPending}
                          className="inline-flex items-center gap-1.5 rounded bg-primary hover:bg-primary/90 px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-colors cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          {luuHangLoatMutation.isPending ? 'Đang lưu...' : 'Lưu điểm danh'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Tóm tắt số liệu buổi học */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded bg-accent/10 border border-accent">
                      <span className="text-[11px] font-medium text-accent ">
                        Có mặt
                      </span>
                      <p className="text-lg font-bold text-accent ">
                        {
                          Object.values(bangTrangThai).filter(
                            (x) => x.trangThai === TrangThaiDiemDanh.CO_MAT,
                          ).length
                        }
                      </p>
                    </div>
                    <div className="p-3 rounded bg-accent/10 border border-accent">
                      <span className="text-[11px] font-medium text-accent ">
                        Đi muộn
                      </span>
                      <p className="text-lg font-bold text-accent ">
                        {
                          Object.values(bangTrangThai).filter(
                            (x) => x.trangThai === TrangThaiDiemDanh.DI_MUON,
                          ).length
                        }
                      </p>
                    </div>
                    <div className="p-3 rounded bg-accent/10 border border-accent">
                      <span className="text-[11px] font-medium text-accent ">
                        Vắng có phép
                      </span>
                      <p className="text-lg font-bold text-accent ">
                        {
                          Object.values(bangTrangThai).filter(
                            (x) => x.trangThai === TrangThaiDiemDanh.VANG_CO_PHEP,
                          ).length
                        }
                      </p>
                    </div>
                    <div className="p-3 rounded bg-danger/10 border border-danger">
                      <span className="text-[11px] font-medium text-danger ">
                        Vắng không phép
                      </span>
                      <p className="text-lg font-bold text-danger ">
                        {
                          Object.values(bangTrangThai).filter(
                            (x) => x.trangThai === TrangThaiDiemDanh.VANG_KHONG_PHEP,
                          ).length
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Khung Mã PIN Điểm Danh Thông Minh */}
                <div className="bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-[4px] p-5 flex flex-col justify-between space-y-4">
                  {coQuyenQuanLy ? (
                    <>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--accent)]">
                            <KeyRound className="w-4 h-4" strokeWidth={1.5} />
                            Mã PIN Điểm danh thông minh
                          </span>
                          <select
                            value={thoiHanPhut}
                            onChange={(e) => setThoiHanPhut(Number(e.target.value))}
                            className="bg-[var(--surface)] text-[var(--text)] text-xs font-mono rounded-[4px] px-2 py-1 border border-[var(--border)] focus:outline-none"
                          >
                            <option value={5}>5 phút</option>
                            <option value={10}>10 phút</option>
                            <option value={15}>15 phút</option>
                            <option value={30}>30 phút</option>
                          </select>
                        </div>
                        <p className="text-[11px] text-[var(--muted)]">
                          Chiếu mã 6 chữ số lên màn hình để học sinh tự điểm danh trên thiết bị cá nhân
                        </p>
                      </div>

                      {maConHieuLuc ? (
                        <div className="bg-[var(--surface)] border border-[var(--accent)] rounded-[4px] p-4 text-center space-y-1">
                          <div className="text-3xl font-mono font-bold tracking-[0.3em] text-[var(--accent)]">
                            {maDiemDanhHienTai}
                          </div>
                          <p className="text-[11px] font-mono text-[var(--muted)]">
                            Hiệu lực đến:{' '}
                            {hanMaDiemDanh?.toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-[4px] p-4 text-center text-xs text-[var(--muted)]">
                          Chưa có mã PIN đang mở cho buổi học này
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => taoMaPinMutation.mutate()}
                        disabled={taoMaPinMutation.isPending}
                        className="w-full py-[11px] rounded-[4px] bg-[var(--accent)] hover:brightness-95 text-white font-semibold text-xs transition-all shadow-[0_2px_8px_-2px_color-mix(in_srgb,var(--accent)_30%,transparent)] cursor-pointer"
                      >
                        {taoMaPinMutation.isPending
                          ? 'Đang khởi tạo mã...'
                          : maConHieuLuc
                            ? 'Đổi mã PIN mới'
                            : 'Mở mã PIN điểm danh'}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--accent)]">
                          <KeyRound className="w-4 h-4" strokeWidth={1.5} />
                          Tự điểm danh bằng mã PIN
                        </span>
                        <p className="text-[11px] text-[var(--muted)]">
                          Nhập mã PIN 6 chữ số do giáo viên cung cấp trong giờ học để xác nhận có mặt
                        </p>
                      </div>

                      <div className="space-y-2.5">
                        <input
                          type="text"
                          maxLength={6}
                          value={maPinNhap}
                          onChange={(e) => setMaPinNhap(e.target.value.replace(/\D/g, ''))}
                          placeholder="Nhập 6 chữ số..."
                          className="w-full text-center text-xl font-mono font-bold tracking-[0.25em] rounded-[4px] bg-[var(--surface)] border border-[var(--border)] px-3 py-2.5 text-[var(--text)] placeholder:text-[var(--muted)] placeholder:text-sm placeholder:tracking-normal focus:outline-none focus:border-[var(--accent)]"
                        />
                        <button
                          type="button"
                          disabled={maPinNhap.length < 4 || diemDanhBangMaMutation.isPending}
                          onClick={() => diemDanhBangMaMutation.mutate()}
                          className="w-full py-[11px] rounded-[4px] bg-[var(--accent)] hover:brightness-95 disabled:opacity-50 text-white font-semibold text-xs transition-all cursor-pointer"
                        >
                          {diemDanhBangMaMutation.isPending
                            ? 'Đang xác thực...'
                            : 'Xác nhận điểm danh'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Bảng danh sách điểm danh chi tiết của buổi học */}
              {coQuyenQuanLy && (
                <div className="bg-card rounded border border-border/80 overflow-hidden shadow-sm">
                  {dangTaiDiemDanhBuoi ? (
                    <div className="p-10 text-center text-sm text-muted-foreground">
                      Đang tải danh sách điểm danh...
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                        <tr>
                          <th className="py-3 px-4">Mã HS</th>
                          <th className="py-3 px-4">Họ và tên học sinh</th>
                          <th className="py-3 px-4">Trạng thái điểm danh</th>
                          <th className="py-3 px-4">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {danhSachHocSinhLop.map((hs) => {
                          const dongHienTai = bangTrangThai[hs.idHocSinh] || {
                            trangThai: TrangThaiDiemDanh.CO_MAT,
                            ghiChu: '',
                          };
                          return (
                            <tr key={hs.idHocSinh} className="hover:bg-muted/20">
                              <td className="py-3 px-4 font-mono font-semibold text-primary">
                                {hs.maHocSinh}
                              </td>
                              <td className="py-3 px-4 font-semibold text-foreground">
                                {hs.hoTen}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {(
                                    [
                                      {
                                        ma: TrangThaiDiemDanh.CO_MAT,
                                        nhan: 'Có mặt',
                                        mau: 'bg-accent text-white',
                                      },
                                      {
                                        ma: TrangThaiDiemDanh.DI_MUON,
                                        nhan: 'Đi muộn',
                                        mau: 'bg-accent text-white',
                                      },
                                      {
                                        ma: TrangThaiDiemDanh.VANG_CO_PHEP,
                                        nhan: 'Có phép',
                                        mau: 'bg-accent text-white',
                                      },
                                      {
                                        ma: TrangThaiDiemDanh.VANG_KHONG_PHEP,
                                        nhan: 'Không phép',
                                        mau: 'bg-danger text-white',
                                      },
                                    ] as const
                                  ).map((tt) => (
                                    <button
                                      key={tt.ma}
                                      type="button"
                                      onClick={() =>
                                        setBangTrangThai((prev) => ({
                                          ...prev,
                                          [hs.idHocSinh]: {
                                            ...dongHienTai,
                                            trangThai: tt.ma,
                                          },
                                        }))
                                      }
                                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                        dongHienTai.trangThai === tt.ma
                                          ? tt.mau
                                          : 'bg-muted text-muted-foreground hover:text-foreground'
                                      }`}
                                    >
                                      {tt.nhan}
                                    </button>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <input
                                  type="text"
                                  value={dongHienTai.ghiChu}
                                  onChange={(e) =>
                                    setBangTrangThai((prev) => ({
                                      ...prev,
                                      [hs.idHocSinh]: {
                                        ...dongHienTai,
                                        ghiChu: e.target.value,
                                      },
                                    }))
                                  }
                                  placeholder="Ghi chú (nếu có)..."
                                  className="w-full rounded-lg border border-input bg-background px-2.5 py-1 text-xs focus:border-primary focus:outline-none"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* CHẾ ĐỘ 2: THỐNG KÊ & CẢNH BÁO CHUYÊN CẦN */}
      {cheDoXem === 'chuyen-can' && (
        <div className="space-y-5">
          {dangTaiChuyenCan ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Đang tổng hợp dữ liệu chuyên cần của học phần...
            </div>
          ) : thongKeChuyenCan ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card rounded border border-border/80 p-5 shadow-sm">
                  <span className="text-xs text-muted-foreground">Tổng số buổi học</span>
                  <p className="text-2xl font-extrabold text-foreground mt-1">
                    {thongKeChuyenCan.tongSoBuoiHoc} buổi
                  </p>
                </div>
                <div className="bg-card rounded border border-border/80 p-5 shadow-sm">
                  <span className="text-xs text-muted-foreground">Tỷ lệ chuyên cần trung bình</span>
                  <p className="text-2xl font-extrabold text-accent mt-1">
                    {thongKeChuyenCan.tyLeChuyenCanTrungBinh}%
                  </p>
                </div>
                <div className="bg-card rounded border border-border/80 p-5 shadow-sm">
                  <span className="text-xs text-muted-foreground">
                    Cảnh báo nguy cơ cấm thi (&gt;20% vắng)
                  </span>
                  <p className="text-2xl font-extrabold text-danger mt-1">
                    {thongKeChuyenCan.soHocSinhNguyCoCamThi} học sinh
                  </p>
                </div>
              </div>

              <div className="bg-card rounded border border-border/80 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                    <tr>
                      <th className="py-3 px-4">Mã HS</th>
                      <th className="py-3 px-4">Họ và tên</th>
                      <th className="py-3 px-4 text-center">Có mặt</th>
                      <th className="py-3 px-4 text-center">Đi muộn</th>
                      <th className="py-3 px-4 text-center">Có phép</th>
                      <th className="py-3 px-4 text-center">Không phép</th>
                      <th className="py-3 px-4">Tỷ lệ chuyên cần</th>
                      <th className="py-3 px-4 text-right">Đánh giá học vụ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {thongKeChuyenCan.danhSachHocSinh.map((hs) => (
                      <tr key={hs.idHocSinh} className="hover:bg-muted/20">
                        <td className="py-3 px-4 font-mono font-semibold text-primary">
                          {hs.maHocSinh}
                        </td>
                        <td className="py-3 px-4 font-semibold text-foreground">{hs.hoTen}</td>
                        <td className="py-3 px-4 text-center font-medium text-accent">
                          {hs.soBuoiCoMat}
                        </td>
                        <td className="py-3 px-4 text-center font-medium text-accent">
                          {hs.soBuoiDiMuon}
                        </td>
                        <td className="py-3 px-4 text-center font-medium text-accent">
                          {hs.soBuoiVangCoPhep}
                        </td>
                        <td className="py-3 px-4 text-center font-medium text-danger">
                          {hs.soBuoiVangKhongPhep}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  hs.tyLeChuyenCan >= 85
                                    ? 'bg-accent'
                                    : hs.tyLeChuyenCan >= 80
                                      ? 'bg-accent'
                                      : 'bg-danger'
                                }`}
                                style={{ width: `${Math.min(100, hs.tyLeChuyenCan)}%` }}
                              />
                            </div>
                            <span className="font-bold">{hs.tyLeChuyenCan}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {hs.mucCanhBao === 'AN_TOAN' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Đủ điều kiện dự thi
                            </span>
                          ) : hs.mucCanhBao === 'LUU_Y' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">
                              <AlertTriangle className="w-3.5 h-3.5" /> Cần lưu ý chuyên cần
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-danger/10 text-danger font-semibold">
                              <ShieldAlert className="w-3.5 h-3.5" /> Nguy cơ cấm thi
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* CHẾ ĐỘ 3: ĐƠN XIN NGHỈ PHÉP */}
      {cheDoXem === 'don-xin-nghi' && (
        <div className="space-y-4">
          {laHocSinh && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMoModalXinNghi(true)}
                className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Gửi đơn xin nghỉ phép
              </button>
            </div>
          )}

          <div className="bg-card rounded border border-border/80 overflow-hidden shadow-sm">
            {dangTaiDonNghi ? (
              <div className="p-10 text-center text-sm text-muted-foreground">
                Đang tải danh sách đơn xin nghỉ phép...
              </div>
            ) : danhSachDonNghi.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">
                Chưa có đơn xin nghỉ phép nào trong lớp học phần này.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                  <tr>
                    <th className="py-3 px-4">Người gửi</th>
                    <th className="py-3 px-4">Buổi học xin nghỉ</th>
                    <th className="py-3 px-4">Lý do</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    {coQuyenQuanLy && <th className="py-3 px-4 text-right">Phê duyệt</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {danhSachDonNghi.map((don) => (
                    <tr key={don.id} className="hover:bg-muted/20">
                      <td className="py-3 px-4 font-semibold text-foreground">
                        {don.nguoiGui?.hoTen || 'Học sinh'}{' '}
                        {don.nguoiGui?.hoSoHocSinh?.maHocSinh && (
                          <span className="text-muted-foreground font-mono">
                            ({don.nguoiGui.hoSoHocSinh.maHocSinh})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {don.buoiHoc?.chuDe || 'Buổi học'} (
                        {don.buoiHoc?.thoiGianBD
                          ? new Date(don.buoiHoc.thoiGianBD).toLocaleDateString('vi-VN')
                          : new Date(don.ngayTao).toLocaleDateString('vi-VN')}
                        )
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{don.lyDo}</td>
                      <td className="py-3 px-4">
                        {don.trangThai === TrangThaiDonXinNghi.DA_DUYET ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">
                            Đã duyệt
                          </span>
                        ) : don.trangThai === TrangThaiDonXinNghi.TU_CHOI ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-danger/10 text-danger font-semibold">
                            Từ chối
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">
                            Chờ duyệt
                          </span>
                        )}
                      </td>
                      {coQuyenQuanLy && (
                        <td className="py-3 px-4 text-right">
                          {don.trangThai === TrangThaiDonXinNghi.CHO_DUYET && (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  duyetDonMutation.mutate({
                                    idDon: don.id,
                                    trangThai: 'DA_DUYET',
                                  })
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent hover:bg-accent text-white font-semibold cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" /> Duyệt
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  duyetDonMutation.mutate({
                                    idDon: don.id,
                                    trangThai: 'TU_CHOI',
                                  })
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-danger hover:bg-danger text-white font-semibold cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" /> Từ chối
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Modal Gửi đơn xin nghỉ phép (Học sinh) */}
      <HopThoai
        mo={moModalXinNghi}
        onDong={() => setMoModalXinNghi(false)}
        tieuDe="Gửi đơn xin nghỉ phép trực tuyến"
        moTa="Đơn xin nghỉ được giáo viên phê duyệt sẽ tự động tính là Vắng có phép khi đồng bộ điểm danh"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!lyDoNghi.trim()) return;
            taoDonXinNghiMutation.mutate();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Chọn buổi học xin nghỉ *
            </label>
            <select
              value={idBuoiHocXinNghi}
              onChange={(e) => setIdBuoiHocXinNghi(e.target.value)}
              className="w-full rounded border border-input bg-background px-3.5 py-2 text-sm focus:border-primary focus:outline-none"
            >
              {danhSachBuoiHoc.map((bh) => (
                <option key={bh.id} value={bh.id}>
                  {bh.chuDe} ({new Date(bh.thoiGianBD).toLocaleDateString('vi-VN')})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Lý do xin nghỉ *
            </label>
            <textarea
              required
              rows={3}
              value={lyDoNghi}
              onChange={(e) => setLyDoNghi(e.target.value)}
              placeholder="Nêu rõ lý do xin nghỉ học (tối thiểu 5 ký tự)..."
              className="w-full rounded border border-input bg-background px-3.5 py-2 text-sm focus:border-primary focus:outline-none resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setMoModalXinNghi(false)}
              className="rounded border border-input px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={lyDoNghi.trim().length < 5 || taoDonXinNghiMutation.isPending}
              className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
            >
              {taoDonXinNghiMutation.isPending ? 'Đang gửi...' : 'Gửi đơn xin nghỉ'}
            </button>
          </div>
        </form>
      </HopThoai>
    </div>
  );
}
