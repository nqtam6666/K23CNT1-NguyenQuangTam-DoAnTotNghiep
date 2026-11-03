'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Pin,
  Send,
  Trash2,
  MessageSquare,
  CheckCircle2,
  HelpCircle,
  Search,
  Tag,
  BookOpen,
  Loader2,
  Filter,
  Clock,
  Calendar,
  Bot,
  ClipboardCheck,
  BrainCircuit,
  ArrowRight,
} from 'lucide-react';
import { mayKhachApi } from '../../../../../tien-ich/may-khach-api';
import { thongBao } from '../../../../../tien-ich/thong-bao';
import {
  BaiDang,
  ChuDeBaiDang,
  PayloadJwt,
  VaiTro,
  ThoiKhoaBieu,
  BuoiHoc,
} from '@lms/chung';
import { AnhDaiDien } from '../../../../../thanh-phan/anh-dai-dien';
import { CongTac } from '../../../../../thanh-phan/cong-tac';

interface ThuocTinhTabBangTin {
  idLopHocPhan: string;
  nguoiDung?: PayloadJwt;
  laGiaoVienLop: boolean;
  danhSachTkb?: ThoiKhoaBieu[];
  danhSachBuoiHoc?: BuoiHoc[];
  onChuyenTab?: (
    tab:
      | 'bang-tin'
      | 'diem-danh'
      | 'kiem-tra'
      | 'bai-tap'
      | 'so-diem'
      | 'tai-lieu'
      | 'thoi-khoa-bieu'
      | 'hoc-sinh',
  ) => void;
}

const CAU_HINH_CHU_DE: Record<
  ChuDeBaiDang,
  { nhan: string; laHoiDap: boolean; lopHuyHieu: string }
> = {
  [ChuDeBaiDang.THONG_BAO]: {
    nhan: 'Thông báo lớp',
    laHoiDap: false,
    lopHuyHieu: 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]',
  },
  [ChuDeBaiDang.HOI_DAP_BAI_HOC]: {
    nhan: 'Hỏi đáp bài giảng',
    laHoiDap: true,
    lopHuyHieu: 'bg-[var(--info-soft)] text-[var(--info)] border-[var(--border)]',
  },
  [ChuDeBaiDang.THAO_LUAN_BAI_TAP]: {
    nhan: 'Thảo luận bài tập',
    laHoiDap: true,
    lopHuyHieu: 'bg-[var(--active-bg)] text-[var(--text)] border-[var(--border)]',
  },
  [ChuDeBaiDang.ON_THI]: {
    nhan: 'Ôn tập & Kiểm tra',
    laHoiDap: true,
    lopHuyHieu: 'bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--border)]',
  },
  [ChuDeBaiDang.CHIA_SE_TAI_LIEU]: {
    nhan: 'Chia sẻ học liệu',
    laHoiDap: false,
    lopHuyHieu: 'bg-[var(--bg)] text-[var(--muted)] border-[var(--border)]',
  },
};

export function TabBangTin({
  idLopHocPhan,
  nguoiDung,
  laGiaoVienLop,
  danhSachTkb = [],
  danhSachBuoiHoc = [],
  onChuyenTab,
}: ThuocTinhTabBangTin) {
  const queryClient = useQueryClient();

  const laQuanTri =
    nguoiDung?.vaiTro === VaiTro.QUAN_TRI_VIEN ||
    nguoiDung?.vaiTro === VaiTro.BAN_GIAM_HIEU;

  const [tieuDeMoi, setTieuDeMoi] = useState('');
  const [chuDeMoi, setChuDeMoi] = useState<ChuDeBaiDang>(
    laGiaoVienLop || laQuanTri ? ChuDeBaiDang.THONG_BAO : ChuDeBaiDang.HOI_DAP_BAI_HOC,
  );
  const [nhanChuongMoi, setNhanChuongMoi] = useState('');
  const [noiDungMoi, setNoiDungMoi] = useState('');
  const [ghimDauTrang, setGhimDauTrang] = useState(false);
  const [binhLuanDangNhap, setBinhLuanDangNhap] = useState<Record<string, string>>({});

  // Bộ lọc diễn đàn
  const [boLocChuDe, setBoLocChuDe] = useState<'TAT_CA' | 'CHUA_GIAI_DAP' | ChuDeBaiDang>('TAT_CA');
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState('');

  // Lấy danh sách bài đăng
  const { data: danhSachBaiDang = [], isLoading: dangTai } = useQuery<BaiDang[]>({
    queryKey: ['bang-tin', idLopHocPhan],
    queryFn: async () => {
      const res = await mayKhachApi.get(`/bai-dang/lop/${idLopHocPhan}`);
      return res.data?.duLieu || res.data || [];
    },
  });

  // Thống kê diễn đàn hỏi đáp
  const thongKeDienDan = useMemo(() => {
    let tongCauHoi = 0;
    let daGiaiDap = 0;
    for (const bai of danhSachBaiDang) {
      const chuDe = bai.chuDe || ChuDeBaiDang.THONG_BAO;
      if (CAU_HINH_CHU_DE[chuDe]?.laHoiDap) {
        tongCauHoi++;
        if (bai.daGiaiDap) daGiaiDap++;
      }
    }
    return {
      tongBaiDang: danhSachBaiDang.length,
      tongCauHoi,
      daGiaiDap,
      chuaGiaiDap: Math.max(0, tongCauHoi - daGiaiDap),
    };
  }, [danhSachBaiDang]);

  const danhSachDaLoc = useMemo(() => {
    const tuKhoa = tuKhoaTimKiem.trim().toLowerCase();
    return danhSachBaiDang.filter((bai) => {
      const chuDe = bai.chuDe || ChuDeBaiDang.THONG_BAO;
      if (boLocChuDe === 'CHUA_GIAI_DAP') {
        if (!CAU_HINH_CHU_DE[chuDe]?.laHoiDap || bai.daGiaiDap) return false;
      } else if (boLocChuDe !== 'TAT_CA' && chuDe !== boLocChuDe) {
        return false;
      }

      if (tuKhoa) {
        const khopNoiDung = bai.noiDung.toLowerCase().includes(tuKhoa);
        const khopTieuDe = (bai.tieuDe || '').toLowerCase().includes(tuKhoa);
        const khopChuong = (bai.nhanChuong || '').toLowerCase().includes(tuKhoa);
        const khopTacGia = (bai.nguoiDang?.hoTen || '').toLowerCase().includes(tuKhoa);
        return khopNoiDung || khopTieuDe || khopChuong || khopTacGia;
      }

      return true;
    });
  }, [danhSachBaiDang, boLocChuDe, tuKhoaTimKiem]);

  // Mutation đăng bài mới
  const mutationDangBai = useMutation({
    mutationFn: async () => {
      const res = await mayKhachApi.post(`/bai-dang/lop/${idLopHocPhan}`, {
        tieuDe: tieuDeMoi.trim() || null,
        chuDe: chuDeMoi,
        nhanChuong: nhanChuongMoi.trim() || null,
        noiDung: noiDungMoi,
        ghimDauTrang: laGiaoVienLop || laQuanTri ? ghimDauTrang : false,
      });
      return res.data;
    },
    onSuccess: () => {
      setTieuDeMoi('');
      setNhanChuongMoi('');
      setNoiDungMoi('');
      setGhimDauTrang(false);
      queryClient.invalidateQueries({ queryKey: ['bang-tin', idLopHocPhan] });
      thongBao.thanhCong(
        'Đăng bài thành công',
        'Chủ đề thảo luận đã được hiển thị trên diễn đàn lớp học.',
      );
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Không thể đăng bài',
        err.response?.data?.thongDiep || 'Đã xảy ra lỗi khi tạo bài đăng.',
      );
    },
  });

  // Mutation đánh dấu câu hỏi đã giải đáp
  const mutationGiaiDap = useMutation({
    mutationFn: async ({
      idBaiDang,
      daGiaiDap,
      idBinhLuanGiaiDap,
    }: {
      idBaiDang: string;
      daGiaiDap: boolean;
      idBinhLuanGiaiDap?: string | null;
    }) => {
      const res = await mayKhachApi.patch(`/bai-dang/${idBaiDang}/giai-dap`, {
        daGiaiDap,
        idBinhLuanGiaiDap: idBinhLuanGiaiDap ?? null,
      });
      return res.data;
    },
    onSuccess: (_, bien) => {
      queryClient.invalidateQueries({ queryKey: ['bang-tin', idLopHocPhan] });
      thongBao.thanhCong(
        bien.daGiaiDap ? 'Đã xác nhận giải đáp' : 'Đã mở lại câu hỏi',
        bien.daGiaiDap
          ? 'Chủ đề hỏi đáp đã được đánh dấu hoàn tất giải đáp.'
          : 'Chủ đề đã chuyển về trạng thái chờ giải đáp.',
      );
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Không thể cập nhật trạng thái',
        err.response?.data?.thongDiep || 'Vui lòng thử lại sau.',
      );
    },
  });

  // Mutation xóa bài đăng
  const mutationXoaBai = useMutation({
    mutationFn: async (idBaiDang: string) => {
      await mayKhachApi.delete(`/bai-dang/${idBaiDang}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bang-tin', idLopHocPhan] });
      thongBao.thanhCong('Đã xóa bài đăng', 'Bài viết đã được gỡ khỏi bảng tin.');
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Không thể xóa bài',
        err.response?.data?.thongDiep || 'Bạn không có quyền xóa bài đăng này.',
      );
    },
  });

  // Mutation gửi bình luận
  const mutationBinhLuan = useMutation({
    mutationFn: async ({ idBaiDang, noiDung }: { idBaiDang: string; noiDung: string }) => {
      const res = await mayKhachApi.post(`/bai-dang/${idBaiDang}/binh-luan`, { noiDung });
      return res.data;
    },
    onSuccess: (_, bien) => {
      setBinhLuanDangNhap((truoc) => ({ ...truoc, [bien.idBaiDang]: '' }));
      queryClient.invalidateQueries({ queryKey: ['bang-tin', idLopHocPhan] });
      thongBao.thanhCong('Đã gửi phản hồi');
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Lỗi bình luận',
        err.response?.data?.thongDiep || 'Không thể gửi bình luận vào lúc này.',
      );
    },
  });

  // Mutation xóa bình luận
  const mutationXoaBinhLuan = useMutation({
    mutationFn: async (idBinhLuan: string) => {
      await mayKhachApi.delete(`/bai-dang/binh-luan/${idBinhLuan}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bang-tin', idLopHocPhan] });
      thongBao.thanhCong('Đã xóa bình luận', 'Bình luận đã được xóa.');
    },
    onError: (err: any) => {
      thongBao.thatBai('Không thể xóa bình luận', err.response?.data?.thongDiep || 'Lỗi khi xóa.');
    },
  });

  const xuLyDangBai = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noiDungMoi.trim()) return;
    mutationDangBai.mutate();
  };

  const xuLyGuiBinhLuan = (idBaiDang: string) => {
    const noiDung = binhLuanDangNhap[idBaiDang]?.trim();
    if (!noiDung) return;
    mutationBinhLuan.mutate({ idBaiDang, noiDung });
  };

  const dinhDangThoiGian = (ngay: string | Date) => {
    try {
      const d = new Date(ngay);
      return d.toLocaleDateString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const buoiHocSapToi = useMemo(() => {
    return danhSachBuoiHoc.slice(0, 3);
  }, [danhSachBuoiHoc]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* CỘT TRÁI (8 CỘT): Khung đăng bài + Bộ lọc + Luồng thảo luận */}
      <div className="lg:col-span-8 space-y-4">
        {/* Khung tạo bài đăng / đặt câu hỏi mới */}
        <div className="bg-[var(--surface)] text-[var(--text)] rounded-[var(--radius)] border border-[var(--border)] p-5 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <AnhDaiDien
                url={nguoiDung?.anhDaiDien}
                hoTen={nguoiDung?.hoTen || 'Người dùng'}
                kichThuoc="md"
              />
              <div>
                <h3 className="text-[13.5px] font-semibold text-[var(--text)]">
                  {nguoiDung?.hoTen}
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Đăng thông báo hoặc đặt câu hỏi thảo luận theo chương học
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(Object.keys(CAU_HINH_CHU_DE) as ChuDeBaiDang[]).map((maChuDe) => {
                const chon = chuDeMoi === maChuDe;
                return (
                  <button
                    key={maChuDe}
                    type="button"
                    onClick={() => setChuDeMoi(maChuDe)}
                    className={`px-2.5 py-1 rounded-[var(--radius)] text-[11.5px] font-semibold border transition-colors cursor-pointer ${
                      chon
                        ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                        : 'bg-[var(--bg)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]'
                    }`}
                  >
                    {CAU_HINH_CHU_DE[maChuDe].nhan}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={xuLyDangBai} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={tieuDeMoi}
                  onChange={(e) => setTieuDeMoi(e.target.value)}
                  placeholder="Tiêu đề câu hỏi hoặc chủ đề thảo luận (không bắt buộc)..."
                  className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2 text-xs text-[var(--text)] focus:border-[var(--accent)] focus:outline-none placeholder:text-[var(--muted)]"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={nhanChuongMoi}
                  onChange={(e) => setNhanChuongMoi(e.target.value)}
                  placeholder="Chương / Bài (VD: Chương 2)"
                  className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2 text-xs text-[var(--text)] focus:border-[var(--accent)] focus:outline-none placeholder:text-[var(--muted)]"
                />
              </div>
            </div>

            <textarea
              value={noiDungMoi}
              onChange={(e) => setNoiDungMoi(e.target.value)}
              placeholder={
                CAU_HINH_CHU_DE[chuDeMoi].laHoiDap
                  ? 'Mô tả chi tiết câu hỏi, đoạn mã nguồn hoặc nội dung bài giảng cần giải đáp...'
                  : 'Nhập nội dung thông báo hoặc chia sẻ tài liệu cho lớp học phần...'
              }
              rows={3}
              className="w-full resize-none rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] p-3.5 text-[13.5px] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none placeholder:text-[var(--muted)] transition-colors"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              {laGiaoVienLop || laQuanTri ? (
                <div className="flex items-center gap-2.5">
                  <CongTac
                    id="ghimDauTrang"
                    checked={ghimDauTrang}
                    onChange={(checked) => setGhimDauTrang(checked)}
                  />
                  <label
                    htmlFor="ghimDauTrang"
                    className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] cursor-pointer select-none"
                  >
                    <Pin className="w-3.5 h-3.5 text-[var(--accent)]" strokeWidth={1.75} />
                    Ghim bài đăng lên đầu trang
                  </label>
                </div>
              ) : (
                <span className="text-xs text-[var(--muted)]">
                  Chủ đề đang chọn:{' '}
                  <strong className="text-[var(--text)]">{CAU_HINH_CHU_DE[chuDeMoi].nhan}</strong>
                </span>
              )}

              <button
                type="submit"
                disabled={!noiDungMoi.trim() || mutationDangBai.isPending}
                className="ml-auto inline-flex items-center gap-2 rounded-[var(--radius)] bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {mutationDangBai.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Đang đăng...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" strokeWidth={1.75} />
                    Đăng thảo luận
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Thanh lọc chủ đề & Tìm kiếm */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-[var(--muted)] mr-1" strokeWidth={1.75} />
            <button
              type="button"
              onClick={() => setBoLocChuDe('TAT_CA')}
              className={`px-2.5 py-1 rounded-[var(--radius)] text-xs font-semibold border transition-colors cursor-pointer ${
                boLocChuDe === 'TAT_CA'
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]'
                  : 'bg-[var(--bg)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]'
              }`}
            >
              Tất cả ({danhSachBaiDang.length})
            </button>
            <button
              type="button"
              onClick={() => setBoLocChuDe('CHUA_GIAI_DAP')}
              className={`px-2.5 py-1 rounded-[var(--radius)] text-xs font-semibold border transition-colors cursor-pointer ${
                boLocChuDe === 'CHUA_GIAI_DAP'
                  ? 'bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger)]'
                  : 'bg-[var(--bg)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]'
              }`}
            >
              Chờ giải đáp ({thongKeDienDan.chuaGiaiDap})
            </button>
            {(Object.keys(CAU_HINH_CHU_DE) as ChuDeBaiDang[]).map((maChuDe) => (
              <button
                key={maChuDe}
                type="button"
                onClick={() => setBoLocChuDe(maChuDe)}
                className={`px-2.5 py-1 rounded-[var(--radius)] text-xs font-semibold border transition-colors cursor-pointer ${
                  boLocChuDe === maChuDe
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]'
                    : 'bg-[var(--bg)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]'
                }`}
              >
                {CAU_HINH_CHU_DE[maChuDe].nhan}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-56">
            <Search
              className="w-3.5 h-3.5 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2"
              strokeWidth={1.75}
            />
            <input
              type="text"
              value={tuKhoaTimKiem}
              onChange={(e) => setTuKhoaTimKiem(e.target.value)}
              placeholder="Tìm theo từ khóa, chương..."
              className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] pl-8 pr-3 py-1.5 text-xs text-[var(--text)] focus:border-[var(--accent)] focus:outline-none placeholder:text-[var(--muted)]"
            />
          </div>
        </div>

        {/* Danh sách bài đăng */}
        {dangTai ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-36 rounded-[var(--radius)] bg-[var(--surface)] border border-[var(--border)] animate-pulse"
              />
            ))}
          </div>
        ) : danhSachDaLoc.length === 0 ? (
          <div className="rounded-[var(--radius)] border border-dashed border-[var(--border)] p-12 text-center bg-[var(--surface)]">
            <MessageSquare className="w-10 h-10 text-[var(--muted)] mx-auto mb-3" strokeWidth={1.5} />
            <h4 className="text-sm font-sans font-bold text-[var(--text)]">
              Không có bài thảo luận phù hợp
            </h4>
            <p className="text-xs text-[var(--muted)] mt-1 max-w-sm mx-auto">
              Hãy đặt câu hỏi hoặc chọn bộ lọc chủ đề khác để xem các trao đổi trong lớp.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {danhSachDaLoc.map((bai) => {
              const coQuyenXoa =
                laQuanTri || laGiaoVienLop || bai.idNguoiDung === nguoiDung?.sub;
              const coQuyenDanhDauGiaiDap =
                laQuanTri || laGiaoVienLop || bai.idNguoiDung === nguoiDung?.sub;

              const chuDe = bai.chuDe || ChuDeBaiDang.THONG_BAO;
              const cauHinhChuDe =
                CAU_HINH_CHU_DE[chuDe] || CAU_HINH_CHU_DE[ChuDeBaiDang.THONG_BAO];

              return (
                <div
                  key={bai.id}
                  className={`bg-[var(--surface)] text-[var(--text)] rounded-[var(--radius)] border transition-colors overflow-hidden shadow-xs ${
                    bai.ghimDauTrang
                      ? 'border-[var(--accent)]'
                      : 'border-[var(--border)]'
                  }`}
                >
                  {bai.ghimDauTrang && (
                    <div className="h-[3px] w-full bg-[var(--accent)]" />
                  )}
                  {/* Thanh tiêu đề bài đăng */}
                  <div className="p-5 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <AnhDaiDien
                          url={bai.nguoiDang?.anhDaiDien}
                          hoTen={bai.nguoiDang?.hoTen || 'Thành viên'}
                          kichThuoc="md"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[13.5px] font-semibold text-[var(--text)]">
                              {bai.nguoiDang?.hoTen}
                            </span>
                            {bai.nguoiDang?.vaiTro === VaiTro.GIAO_VIEN && (
                              <span className="rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)] px-1.5 py-0.5 text-[10px] font-mono font-bold">
                                Giảng viên
                              </span>
                            )}
                            <span
                              className={`inline-flex items-center gap-1 rounded-[var(--radius)] border px-2 py-0.5 text-[11px] font-semibold ${cauHinhChuDe.lopHuyHieu}`}
                            >
                              <Tag className="w-3 h-3" strokeWidth={1.75} />
                              {cauHinhChuDe.nhan}
                            </span>
                            {bai.nhanChuong && (
                              <span className="inline-flex items-center gap-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] px-2 py-0.5 text-[11px] font-mono">
                                <BookOpen
                                  className="w-3 h-3 text-[var(--accent)]"
                                  strokeWidth={1.75}
                                />
                                {bai.nhanChuong}
                              </span>
                            )}
                            {bai.ghimDauTrang && (
                              <span className="inline-flex items-center gap-1 rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] px-2 py-0.5 text-[10px] font-semibold">
                                <Pin className="w-3 h-3" strokeWidth={1.75} />
                                Đã ghim
                              </span>
                            )}
                            {cauHinhChuDe.laHoiDap && (
                              <span
                                className={`inline-flex items-center gap-1 rounded-[var(--radius)] px-2 py-0.5 text-[11px] font-semibold border ${
                                  bai.daGiaiDap
                                    ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]'
                                    : 'bg-[var(--bg)] text-[var(--muted)] border-[var(--border)]'
                                }`}
                              >
                                {bai.daGiaiDap ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3" strokeWidth={1.75} />
                                    Đã giải đáp
                                  </>
                                ) : (
                                  <>
                                    <HelpCircle className="w-3 h-3" strokeWidth={1.75} />
                                    Chờ giải đáp
                                  </>
                                )}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-mono text-[var(--muted)] mt-0.5">
                            {dinhDangThoiGian(bai.ngayTao)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {cauHinhChuDe.laHoiDap && coQuyenDanhDauGiaiDap && (
                          <button
                            type="button"
                            onClick={() =>
                              mutationGiaiDap.mutate({
                                idBaiDang: bai.id,
                                daGiaiDap: !bai.daGiaiDap,
                                idBinhLuanGiaiDap: bai.daGiaiDap
                                  ? null
                                  : bai.idBinhLuanGiaiDap,
                              })
                            }
                            disabled={mutationGiaiDap.isPending}
                            className={`px-2.5 py-1 rounded-[var(--radius)] text-xs font-semibold border transition-colors cursor-pointer ${
                              bai.daGiaiDap
                                ? 'bg-[var(--bg)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]'
                                : 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white'
                            }`}
                          >
                            {bai.daGiaiDap ? 'Mở lại câu hỏi' : 'Đánh dấu đã giải đáp'}
                          </button>
                        )}

                        {coQuyenXoa && (
                          <button
                            type="button"
                            onClick={() => mutationXoaBai.mutate(bai.id)}
                            disabled={mutationXoaBai.isPending}
                            title="Xóa bài đăng"
                            className="rounded-[var(--radius)] p-1.5 text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Tiêu đề & Nội dung bài viết */}
                    {bai.tieuDe && (
                      <h4 className="mt-3 text-[15px] font-sans font-bold text-[var(--text)]">
                        {bai.tieuDe}
                      </h4>
                    )}
                    <div className="mt-2 text-[13.5px] text-[var(--text)] whitespace-pre-line leading-relaxed">
                      {bai.noiDung}
                    </div>
                  </div>

                  {/* Phần bình luận */}
                  <div className="bg-[var(--bg)] border-t border-[var(--border)] p-4 space-y-3">
                    {bai.cacBinhLuan && bai.cacBinhLuan.length > 0 && (
                      <div className="space-y-2.5">
                        {bai.cacBinhLuan.map((bl) => {
                          const coQuyenXoaBL =
                            laQuanTri || laGiaoVienLop || bl.idNguoiDung === nguoiDung?.sub;
                          const laChapNhan =
                            Boolean(bl.laCauTraLoiChapNhan) ||
                            (Boolean(bai.idBinhLuanGiaiDap) && bai.idBinhLuanGiaiDap === bl.id);

                          return (
                            <div
                              key={bl.id}
                              className="flex items-start justify-between gap-2.5 group"
                            >
                              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                <AnhDaiDien
                                  url={bl.nguoiDung?.anhDaiDien}
                                  hoTen={bl.nguoiDung?.hoTen || 'Thành viên'}
                                  kichThuoc="sm"
                                />
                                <div
                                  className={`rounded-[var(--radius)] px-3.5 py-2.5 border text-xs flex-1 ${
                                    laChapNhan
                                      ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--text)]'
                                      : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text)]'
                                  }`}
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-[var(--text)]">
                                        {bl.nguoiDung?.hoTen}
                                      </span>
                                      {bl.nguoiDung?.vaiTro === VaiTro.GIAO_VIEN && (
                                        <span className="rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)] px-1.5 py-0.5 text-[10px] font-mono font-bold">
                                          Giảng viên
                                        </span>
                                      )}
                                      {laChapNhan && (
                                        <span className="inline-flex items-center gap-1 rounded-[var(--radius)] bg-[var(--accent)] text-white px-2 py-0.5 text-[10px] font-semibold">
                                          <CheckCircle2 className="w-3 h-3" strokeWidth={1.75} />
                                          Câu trả lời được xác nhận
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] font-mono text-[var(--muted)]">
                                      {dinhDangThoiGian(bl.ngayTao)}
                                    </span>
                                  </div>
                                  <p className="text-[var(--text)] mt-1.5 whitespace-pre-line leading-relaxed">
                                    {bl.noiDung}
                                  </p>

                                  {cauHinhChuDe.laHoiDap && coQuyenDanhDauGiaiDap && (
                                    <div className="mt-2 pt-1.5 border-t border-[var(--border)] flex justify-end">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          mutationGiaiDap.mutate({
                                            idBaiDang: bai.id,
                                            daGiaiDap: !laChapNhan,
                                            idBinhLuanGiaiDap: laChapNhan ? null : bl.id,
                                          })
                                        }
                                        className="text-[11px] font-semibold text-[var(--accent)] hover:underline cursor-pointer"
                                      >
                                        {laChapNhan
                                          ? 'Bỏ chọn câu trả lời chuẩn'
                                          : 'Chọn làm câu trả lời chuẩn'}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {coQuyenXoaBL && (
                                <button
                                  type="button"
                                  onClick={() => mutationXoaBinhLuan.mutate(bl.id)}
                                  title="Xóa bình luận"
                                  className="opacity-0 group-hover:opacity-100 p-1 text-[var(--muted)] hover:text-[var(--danger)] transition-opacity cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Ô nhập bình luận */}
                    <div className="flex items-center gap-2 pt-1">
                      <AnhDaiDien
                        url={nguoiDung?.anhDaiDien}
                        hoTen={nguoiDung?.hoTen || 'Tôi'}
                        kichThuoc="sm"
                      />
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={binhLuanDangNhap[bai.id] || ''}
                          onChange={(e) =>
                            setBinhLuanDangNhap((truoc) => ({
                              ...truoc,
                              [bai.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              xuLyGuiBinhLuan(bai.id);
                            }
                          }}
                          placeholder="Viết câu trả lời hoặc giải thích cho chủ đề này..."
                          className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 pr-9 text-xs text-[var(--text)] focus:border-[var(--accent)] focus:outline-none placeholder:text-[var(--muted)] transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => xuLyGuiBinhLuan(bai.id)}
                          disabled={
                            !binhLuanDangNhap[bai.id]?.trim() || mutationBinhLuan.isPending
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--accent)] hover:brightness-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" strokeWidth={1.75} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CỘT PHẢI (4 CỘT): Tổng quan thảo luận + Lịch học tuần + Lối tắt học phần */}
      <div className="lg:col-span-4 space-y-4">
        {/* Card 1: Thống kê thảo luận */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-sans font-bold text-[var(--text)]">
              Tổng quan thảo luận lớp
            </h3>
            <span className="text-[11px] font-mono text-[var(--muted)]">Thời gian thực</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)] p-3">
              <span className="eyebrow">Tổng bài viết</span>
              <p className="text-lg font-mono font-bold text-[var(--text)] mt-0.5 tabular-nums">
                {thongKeDienDan.tongBaiDang}
              </p>
            </div>
            <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)] p-3">
              <span className="eyebrow">Hỏi đáp môn học</span>
              <p className="text-lg font-mono font-bold text-[var(--accent)] mt-0.5 tabular-nums">
                {thongKeDienDan.tongCauHoi}
              </p>
            </div>
            <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)] p-3">
              <span className="eyebrow">Đã giải đáp</span>
              <p className="text-lg font-mono font-bold text-[var(--accent)] mt-0.5 tabular-nums">
                {thongKeDienDan.daGiaiDap}
              </p>
            </div>
            <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)] p-3">
              <span className="eyebrow">Chờ phản hồi</span>
              <p className="text-lg font-mono font-bold text-[var(--danger)] mt-0.5 tabular-nums">
                {thongKeDienDan.chuaGiaiDap}
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Lịch học định kỳ & Buổi học */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-sans font-bold text-[var(--text)] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[var(--accent)]" strokeWidth={1.75} />
              Lịch học trong tuần
            </h3>
            {onChuyenTab && (
              <button
                type="button"
                onClick={() => onChuyenTab('thoi-khoa-bieu')}
                className="text-[11.5px] font-semibold text-[var(--accent)] hover:underline cursor-pointer"
              >
                Chi tiết →
              </button>
            )}
          </div>

          {danhSachTkb.length > 0 ? (
            <div className="space-y-2">
              {danhSachTkb.map((tkb) => (
                <div
                  key={tkb.id}
                  className="p-2.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-[var(--accent)]">
                      Thứ {tkb.thuTrongTuan === 8 ? 'CN' : tkb.thuTrongTuan}
                    </span>
                    <span className="text-[var(--text)] font-medium ml-2">
                      Tiết {tkb.tietBatDau} – {tkb.tietBatDau + tkb.soTiet - 1}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-[var(--muted)]">
                    {tkb.phongHoc || 'Trực tuyến'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--muted)] py-2">
              Chưa thiết lập tiết học định kỳ hàng tuần.
            </p>
          )}

          {buoiHocSapToi.length > 0 && (
            <div className="pt-2.5 border-t border-[var(--border)] space-y-2">
              <p className="eyebrow">Buổi học theo lịch</p>
              {buoiHocSapToi.map((buoi) => (
                <div
                  key={buoi.id}
                  className="flex items-start justify-between gap-2 text-xs py-1"
                >
                  <div className="truncate">
                    <p className="font-medium text-[var(--text)] truncate">{buoi.chuDe}</p>
                    <p className="text-[11px] font-mono text-[var(--muted)] flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(buoi.thoiGianBD).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  {onChuyenTab && (
                    <button
                      type="button"
                      onClick={() => onChuyenTab('diem-danh')}
                      className="px-2 py-0.5 rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] text-[11px] font-semibold shrink-0 cursor-pointer"
                    >
                      Điểm danh
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 3: Lối tắt học tập */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-4 shadow-xs space-y-2.5">
          <h3 className="text-[13px] font-sans font-bold text-[var(--text)]">
            Tiện ích học phần
          </h3>

          <div className="space-y-1.5">
            {onChuyenTab && (
              <>
                <button
                  type="button"
                  onClick={() => onChuyenTab('tai-lieu')}
                  className="w-full p-2.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--accent)] flex items-center justify-between text-xs font-medium text-[var(--text)] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[var(--accent)]" strokeWidth={1.75} />
                    Tài liệu & Giáo trình môn học
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--muted)]" />
                </button>

                <button
                  type="button"
                  onClick={() => onChuyenTab('bai-tap')}
                  className="w-full p-2.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--accent)] flex items-center justify-between text-xs font-medium text-[var(--text)] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-[var(--accent)]" strokeWidth={1.75} />
                    Bài tập & Nộp bài trực tuyến
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--muted)]" />
                </button>

                <button
                  type="button"
                  onClick={() => onChuyenTab('kiem-tra')}
                  className="w-full p-2.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--accent)] flex items-center justify-between text-xs font-medium text-[var(--text)] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-[var(--accent)]" strokeWidth={1.75} />
                    Luyện tập & Kiểm tra trắc nghiệm
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--muted)]" />
                </button>
              </>
            )}

            <Link
              href="/tro-ly-ai"
              className="w-full p-2.5 rounded-[var(--radius)] border border-[var(--accent)] bg-[var(--accent-soft)] hover:bg-[var(--accent)] hover:text-white flex items-center justify-between text-xs font-semibold text-[var(--accent)] transition-colors"
            >
              <span className="flex items-center gap-2">
                <Bot className="w-4 h-4" strokeWidth={1.75} />
                Hỏi Trợ lý học tập kèm trích dẫn
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
