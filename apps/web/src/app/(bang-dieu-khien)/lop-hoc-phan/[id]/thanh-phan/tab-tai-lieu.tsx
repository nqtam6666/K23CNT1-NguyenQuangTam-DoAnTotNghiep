'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Upload,
  Plus,
  Trash2,
  Download,
  BookOpen,
  Presentation,
  FileArchive,
  Film,
  Loader2,
  Calendar,
  Star,
  History,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  Database,
} from 'lucide-react';
import { mayKhachApi } from '../../../../../tien-ich/may-khach-api';
import { thongBao } from '../../../../../tien-ich/thong-bao';
import { HopThoai } from '../../../../../thanh-phan/hop-thoai';
import {
  TaiLieu,
  LoaiTaiLieu,
  DanhGiaTaiLieu,
  PhienBanTaiLieu,
  PayloadJwt,
  VaiTro,
} from '@lms/chung';

interface ThuocTinhTabTaiLieu {
  idLopHocPhan: string;
  nguoiDung?: PayloadJwt;
  laGiaoVienLop: boolean;
}

const nhanLoaiTaiLieu: Record<LoaiTaiLieu, { ten: string; lopCss: string }> = {
  [LoaiTaiLieu.GIAO_TRINH]: {
    ten: 'Giáo trình',
    lopCss: 'bg-accent-soft text-accent border-accent',
  },
  [LoaiTaiLieu.BAI_GIANG]: {
    ten: 'Bài giảng',
    lopCss: 'bg-info-soft text-info border-border',
  },
  [LoaiTaiLieu.SLIDE]: {
    ten: 'Slide trình chiếu',
    lopCss: 'bg-active-bg text-text border-border',
  },
  [LoaiTaiLieu.TAI_LIEU_THAM_KHAO]: {
    ten: 'Tham khảo',
    lopCss: 'bg-bg text-muted border-border',
  },
};

export function TabTaiLieu({ idLopHocPhan, nguoiDung, laGiaoVienLop }: ThuocTinhTabTaiLieu) {
  const queryClient = useQueryClient();

  // Modal Tải lên tài liệu mới (v1)
  const [moModalThem, setMoModalThem] = useState(false);
  const [tieuDe, setTieuDe] = useState('');
  const [moTa, setMoTa] = useState('');
  const [loaiTaiLieu, setLoaiTaiLieu] = useState<LoaiTaiLieu>(LoaiTaiLieu.TAI_LIEU_THAM_KHAO);
  const [tepChon, setTepChon] = useState<File | null>(null);
  const inputTepRef = useRef<HTMLInputElement>(null);

  // Modal Cập nhật phiên bản mới (v2, v3...)
  const [taiLieuCapNhatPb, setTaiLieuCapNhatPb] = useState<TaiLieu | null>(null);
  const [tieuDePhienBan, setTieuDePhienBan] = useState('');
  const [ghiChuThayDoi, setGhiChuThayDoi] = useState('');
  const [tepPhienBanMoi, setTepPhienBanMoi] = useState<File | null>(null);
  const inputTepPhienBanRef = useRef<HTMLInputElement>(null);

  // Modal Xem lịch sử phiên bản
  const [taiLieuXemLichSu, setTaiLieuXemLichSu] = useState<TaiLieu | null>(null);

  // Modal Đánh giá học liệu (1-5 sao)
  const [taiLieuDanhGia, setTaiLieuDanhGia] = useState<TaiLieu | null>(null);
  const [soSaoChon, setSoSaoChon] = useState<number>(5);
  const [nhanXetDanhGia, setNhanXetDanhGia] = useState('');

  const laQuanTri =
    nguoiDung?.vaiTro === VaiTro.QUAN_TRI_VIEN ||
    nguoiDung?.vaiTro === VaiTro.BAN_GIAM_HIEU;

  const coQuyenQuanLy = laGiaoVienLop || laQuanTri;

  // Lấy danh sách tài liệu
  const {
    data: danhSachTaiLieu = [],
    isLoading: dangTai,
  } = useQuery<TaiLieu[]>({
    queryKey: ['tai-lieu-lop', idLopHocPhan],
    queryFn: async () => {
      const res = await mayKhachApi.get(`/tai-lieu/lop/${idLopHocPhan}`);
      return res.data?.duLieu || res.data || [];
    },
  });

  // Lấy lịch sử phiên bản của tài liệu đang chọn
  const {
    data: duLieuLichSuPhienBan,
    isLoading: dangTaiLichSu,
  } = useQuery<{
    idTaiLieu: string;
    tieuDeHienTai: string;
    tongSoPhienBan: number;
    danhSachPhienBan: PhienBanTaiLieu[];
  }>({
    queryKey: ['lich-su-phien-ban-tai-lieu', taiLieuXemLichSu?.id],
    queryFn: async () => {
      const res = await mayKhachApi.get(`/tai-lieu/${taiLieuXemLichSu!.id}/phien-ban`);
      return res.data?.duLieu || res.data;
    },
    enabled: !!taiLieuXemLichSu?.id,
  });

  // Lấy danh sách đánh giá của tài liệu đang chọn
  const {
    data: duLieuDanhGia,
    isLoading: dangTaiDanhGia,
  } = useQuery<{
    idTaiLieu: string;
    diemDanhGiaTrungBinh: number;
    tongSoDanhGia: number;
    danhSachDanhGia: DanhGiaTaiLieu[];
  }>({
    queryKey: ['danh-gia-tai-lieu', taiLieuDanhGia?.id],
    queryFn: async () => {
      const res = await mayKhachApi.get(`/tai-lieu/${taiLieuDanhGia!.id}/danh-gia`);
      return res.data?.duLieu || res.data;
    },
    enabled: !!taiLieuDanhGia?.id,
  });

  // Mutation tải lên tài liệu mới
  const mutationTaiLen = useMutation({
    mutationFn: async () => {
      if (!tepChon) throw new Error('Vui lòng chọn tập tin đính kèm');

      const formData = new FormData();
      formData.append('tep', tepChon);
      formData.append('tieuDe', tieuDe.trim());
      if (moTa.trim()) formData.append('moTa', moTa.trim());
      formData.append('loaiTaiLieu', loaiTaiLieu);

      const res = await mayKhachApi.post(`/tai-lieu/lop/${idLopHocPhan}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    },
    onSuccess: () => {
      setMoModalThem(false);
      setTieuDe('');
      setMoTa('');
      setTepChon(null);
      queryClient.invalidateQueries({ queryKey: ['tai-lieu-lop', idLopHocPhan] });
      thongBao.thanhCong(
        'Tải lên thành công',
        'Tài liệu (v1) đã được lưu trữ và sẵn sàng phục vụ học tập.',
      );
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Tải lên thất bại',
        err.response?.data?.thongDiep || 'Không thể tải tệp tài liệu lên máy chủ.',
      );
    },
  });

  // Mutation cập nhật phiên bản mới
  const mutationCapNhatPhienBan = useMutation({
    mutationFn: async () => {
      if (!taiLieuCapNhatPb || !tepPhienBanMoi) {
        throw new Error('Vui lòng chọn tệp phiên bản mới');
      }
      const formData = new FormData();
      formData.append('tep', tepPhienBanMoi);
      formData.append('ghiChuThayDoi', ghiChuThayDoi.trim());
      if (tieuDePhienBan.trim()) {
        formData.append('tieuDe', tieuDePhienBan.trim());
      }

      const res = await mayKhachApi.post(
        `/tai-lieu/${taiLieuCapNhatPb.id}/phien-ban`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return res.data;
    },
    onSuccess: (res) => {
      const soPb = res?.duLieu?.soPhienBanHienTai || res?.soPhienBanHienTai || '';
      const idTl = taiLieuCapNhatPb?.id;
      setTaiLieuCapNhatPb(null);
      setGhiChuThayDoi('');
      setTepPhienBanMoi(null);
      queryClient.invalidateQueries({ queryKey: ['tai-lieu-lop', idLopHocPhan] });
      if (idTl) {
        queryClient.invalidateQueries({ queryKey: ['lich-su-phien-ban-tai-lieu', idTl] });
      }
      thongBao.thanhCong(
        `Đã phát hành phiên bản v${soPb}`,
        'Tệp bài giảng mới đã được cập nhật và lưu vết phiên bản trước đó.',
      );
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Cập nhật phiên bản thất bại',
        err.response?.data?.thongDiep || 'Không thể tải lên phiên bản mới.',
      );
    },
  });

  // Mutation khôi phục phiên bản cũ
  const mutationKhoiPhucPhienBan = useMutation({
    mutationFn: async ({
      idTaiLieu,
      soPhienBan,
    }: {
      idTaiLieu: string;
      soPhienBan: number;
    }) => {
      const res = await mayKhachApi.post(`/tai-lieu/${idTaiLieu}/khoi-phuc-phien-ban`, {
        soPhienBan,
      });
      return res.data;
    },
    onSuccess: (_, bien) => {
      queryClient.invalidateQueries({ queryKey: ['tai-lieu-lop', idLopHocPhan] });
      queryClient.invalidateQueries({
        queryKey: ['lich-su-phien-ban-tai-lieu', bien.idTaiLieu],
      });
      thongBao.thanhCong(
        `Đã khôi phục phiên bản v${bien.soPhienBan}`,
        'Tài liệu học tập của lớp đã được chuyển về phiên bản đã chọn.',
      );
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Khôi phục thất bại',
        err.response?.data?.thongDiep || 'Không thể khôi phục phiên bản.',
      );
    },
  });

  // Mutation gửi đánh giá học liệu
  const mutationGuiDanhGia = useMutation({
    mutationFn: async () => {
      if (!taiLieuDanhGia) return;
      const res = await mayKhachApi.post(`/tai-lieu/${taiLieuDanhGia.id}/danh-gia`, {
        soSao: soSaoChon,
        nhanXet: nhanXetDanhGia.trim() || null,
      });
      return res.data;
    },
    onSuccess: () => {
      if (taiLieuDanhGia) {
        queryClient.invalidateQueries({
          queryKey: ['danh-gia-tai-lieu', taiLieuDanhGia.id],
        });
      }
      queryClient.invalidateQueries({ queryKey: ['tai-lieu-lop', idLopHocPhan] });
      thongBao.thanhCong(
        'Đã ghi nhận đánh giá',
        'Cảm ơn phản hồi của bạn về chất lượng học liệu môn học.',
      );
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Không thể gửi đánh giá',
        err.response?.data?.thongDiep || 'Vui lòng thử lại sau.',
      );
    },
  });

  // Mutation nạp tài liệu vào kho vector RAG
  const mutationNapRag = useMutation({
    mutationFn: async (idTaiLieu: string) => {
      const res = await mayKhachApi.post(`/tro-ly-ai/nap-tai-lieu/${idTaiLieu}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tai-lieu-lop', idLopHocPhan] });
      thongBao.thanhCong(
        'Đã đồng bộ kho tri thức AI',
        'Tài liệu đã được băm đoạn và cập nhật vector ngữ nghĩa cho Trợ lý AI.',
      );
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Không thể nạp vào kho AI',
        err.response?.data?.thongDiep || 'Lỗi khi xử lý văn bản tài liệu.',
      );
    },
  });

  // Mutation xóa tài liệu
  const mutationXoa = useMutation({
    mutationFn: async (idTaiLieu: string) => {
      await mayKhachApi.delete(`/tai-lieu/${idTaiLieu}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tai-lieu-lop', idLopHocPhan] });
      thongBao.thanhCong('Đã xóa tài liệu', 'Tập tin đã được dọn sạch khỏi kho tài liệu.');
    },
    onError: (err: any) => {
      thongBao.thatBai('Không thể xóa', err.response?.data?.thongDiep || 'Lỗi khi xóa tài liệu.');
    },
  });

  const xuLyNopForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tieuDe.trim() || !tepChon) return;
    mutationTaiLen.mutate();
  };

  const xuLyNopPhienBanMoi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taiLieuCapNhatPb || !tepPhienBanMoi || !ghiChuThayDoi.trim()) return;
    mutationCapNhatPhienBan.mutate();
  };

  const xuLyGuiDanhGia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taiLieuDanhGia) return;
    mutationGuiDanhGia.mutate();
  };

  const dinhDangDungLuong = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const dinhDangNgay = (ngay: string | Date) => {
    try {
      const d = new Date(ngay);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const layBieuTuongTep = (duongDan: string) => {
    const ext = duongDan.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="w-6 h-6 text-danger" strokeWidth={1.5} />;
    if (ext === 'ppt' || ext === 'pptx')
      return <Presentation className="w-6 h-6 text-accent" strokeWidth={1.5} />;
    if (ext === 'doc' || ext === 'docx')
      return <FileText className="w-6 h-6 text-accent" strokeWidth={1.5} />;
    if (ext === 'zip' || ext === 'rar' || ext === '7z')
      return <FileArchive className="w-6 h-6 text-accent" strokeWidth={1.5} />;
    if (ext === 'mp4' || ext === 'mkv')
      return <Film className="w-6 h-6 text-accent" strokeWidth={1.5} />;
    return <BookOpen className="w-6 h-6 text-accent" strokeWidth={1.5} />;
  };

  const layUrlDayDu = (duongDan: string) => {
    if (duongDan.startsWith('http')) return duongDan;
    const urlApi = process.env.NEXT_PUBLIC_URL_MAY_CHU_API || 'http://localhost:4000';
    return `${urlApi.replace(/\/$/, '')}${duongDan.startsWith('/') ? '' : '/'}${duongDan}`;
  };

  return (
    <div className="space-y-6">
      {/* Thanh hành động */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface rounded border border-border p-5">
        <div>
          <h3 className="text-base font-mono font-bold text-text">
            Kho học liệu & Quản lý phiên bản
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Giáo trình, bài giảng, slide kèm lịch sử phiên bản cập nhật và đánh giá chất lượng từ sinh viên
          </p>
        </div>

        {coQuyenQuanLy && (
          <button
            type="button"
            onClick={() => setMoModalThem(true)}
            className="inline-flex items-center gap-2 rounded bg-accent px-4 py-2.5 text-xs font-semibold text-white hover:brightness-95 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            Tải lên tài liệu mới
          </button>
        )}
      </div>

      {/* Danh sách tài liệu */}
      {dangTai ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 rounded bg-surface border border-border animate-pulse" />
          ))}
        </div>
      ) : danhSachTaiLieu.length === 0 ? (
        <div className="rounded border border-dashed border-border p-12 text-center bg-surface">
          <BookOpen className="w-12 h-12 text-muted mx-auto mb-3" strokeWidth={1.5} />
          <h4 className="text-base font-mono font-bold text-text">Chưa có tài liệu nào</h4>
          <p className="text-sm text-muted mt-1 max-w-sm mx-auto">
            {coQuyenQuanLy
              ? 'Hãy tải lên tài liệu học tập đầu tiên để sinh viên tham khảo và phục vụ Trợ lý AI.'
              : 'Giảng viên phụ trách chưa đăng tải tài liệu nào cho lớp học phần này.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {danhSachTaiLieu.map((tl) => {
            const cauHinhNhan =
              nhanLoaiTaiLieu[tl.loaiTaiLieu] ||
              nhanLoaiTaiLieu[LoaiTaiLieu.TAI_LIEU_THAM_KHAO];
            const soPhienBan = tl.soPhienBanHienTai || 1;
            const diemTb = tl.diemDanhGiaTrungBinh || 0;
            const tongDanhGia = tl.tongSoDanhGia || 0;
            const soDoanRag = tl.soDoanVectorRag || 0;

            return (
              <div
                key={tl.id}
                className="bg-surface text-text rounded border border-border p-5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded bg-bg border border-border shrink-0">
                        {layBieuTuongTep(tl.duongDanTep)}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`inline-block border px-2 py-0.5 text-[10px] font-semibold rounded ${cauHinhNhan.lopCss}`}
                          >
                            {cauHinhNhan.ten}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded border border-accent bg-accent-soft text-accent px-2 py-0.5 text-[10px] font-mono font-bold">
                            v{soPhienBan}
                          </span>
                          {soDoanRag > 0 && (
                            <span className="inline-flex items-center gap-1 rounded border border-border bg-bg text-muted px-2 py-0.5 text-[10px] font-mono">
                              <Database className="w-3 h-3 text-accent" strokeWidth={1.5} />
                              RAG: {soDoanRag} đoạn
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-text leading-snug line-clamp-2">
                          {tl.tieuDe}
                        </h4>
                      </div>
                    </div>

                    {coQuyenQuanLy && (
                      <button
                        type="button"
                        onClick={() => mutationXoa.mutate(tl.id)}
                        disabled={mutationXoa.isPending}
                        title="Xóa tài liệu"
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-muted hover:text-danger hover:bg-danger-soft rounded transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    )}
                  </div>

                  {tl.moTa && (
                    <p className="text-xs text-muted mt-3 line-clamp-2 leading-relaxed">
                      {tl.moTa}
                    </p>
                  )}

                  {tl.ghiChuPhienBanMoiNhat && soPhienBan > 1 && (
                    <div className="mt-2.5 px-3 py-1.5 rounded bg-bg border border-border text-[11px] text-muted">
                      <span className="font-mono font-semibold text-text">
                        Cập nhật v{soPhienBan}:
                      </span>{' '}
                      {tl.ghiChuPhienBanMoiNhat}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-border space-y-3">
                  {/* Hàng thông tin dung lượng, ngày & Đánh giá sao */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                    <div className="flex items-center gap-2.5 font-mono text-[11px]">
                      <span>{dinhDangDungLuong(tl.kichThuocTep)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                        {dinhDangNgay(tl.ngayCapNhatPhienBan || tl.ngayTao)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setTaiLieuDanhGia(tl);
                        setSoSaoChon(tl.danhGiaCuaToi?.soSao || 5);
                        setNhanXetDanhGia(tl.danhGiaCuaToi?.nhanXet || '');
                      }}
                      className="inline-flex items-center gap-1.5 rounded border border-border bg-bg hover:border-accent px-2.5 py-1 text-xs font-medium text-text transition-colors cursor-pointer"
                    >
                      <Star
                        className="w-3.5 h-3.5 text-accent fill-current"
                        strokeWidth={1.5}
                      />
                      <span className="font-mono font-bold tabular-nums">
                        {tongDanhGia > 0 ? diemTb.toFixed(1) : 'Đánh giá'}
                      </span>
                      <span className="text-muted">({tongDanhGia})</span>
                    </button>
                  </div>

                  {/* Hàng nút thao tác: Lịch sử phiên bản, Cập nhật bản mới, Nạp AI, Tải về */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setTaiLieuXemLichSu(tl)}
                        className="inline-flex items-center gap-1 rounded border border-border bg-bg hover:bg-active-bg px-2.5 py-1.5 text-xs font-medium text-text transition-colors cursor-pointer"
                      >
                        <History className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                        Lịch sử (v{soPhienBan})
                      </button>

                      {coQuyenQuanLy && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setTaiLieuCapNhatPb(tl);
                              setTieuDePhienBan(tl.tieuDe);
                              setGhiChuThayDoi('');
                              setTepPhienBanMoi(null);
                            }}
                            className="inline-flex items-center gap-1 rounded border border-border bg-bg hover:bg-active-bg px-2.5 py-1.5 text-xs font-medium text-text transition-colors cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                            Cập nhật bản mới
                          </button>

                          <button
                            type="button"
                            onClick={() => mutationNapRag.mutate(tl.id)}
                            disabled={mutationNapRag.isPending}
                            className="inline-flex items-center gap-1 rounded border border-border bg-bg hover:bg-active-bg px-2.5 py-1.5 text-xs font-medium text-text transition-colors cursor-pointer"
                            title="Đồng bộ nội dung tài liệu vào kho vector Trợ lý AI"
                          >
                            <Database className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                            {soDoanRag > 0 ? 'Đồng bộ lại AI' : 'Nạp vào AI'}
                          </button>
                        </>
                      )}
                    </div>

                    <a
                      href={layUrlDayDu(tl.duongDanTep)}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-1.5 rounded bg-accent-soft hover:bg-accent text-accent hover:text-white border border-accent px-3 py-1.5 text-xs font-semibold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Tải về
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal 1: Tải lên tài liệu mới (v1) */}
      <HopThoai
        mo={moModalThem}
        onDong={() => setMoModalThem(false)}
        tieuDe="Tải lên tài liệu học tập mới"
        moTa="Khởi tạo tài liệu phiên bản v1 phục vụ sinh viên và kho tri thức Trợ lý AI"
      >
        <form onSubmit={xuLyNopForm} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-text">Tiêu đề tài liệu *</label>
            <input
              type="text"
              required
              value={tieuDe}
              onChange={(e) => setTieuDe(e.target.value)}
              placeholder="VD: Slide bài giảng Chương 1 - Nhập môn công nghệ"
              className="mt-1.5 w-full rounded border border-border bg-bg px-3.5 py-2 text-sm text-text focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text">Phân loại tài liệu *</label>
            <select
              value={loaiTaiLieu}
              onChange={(e) => setLoaiTaiLieu(e.target.value as LoaiTaiLieu)}
              className="mt-1.5 w-full rounded border border-border bg-bg px-3.5 py-2 text-sm text-text focus:border-accent focus:outline-none"
            >
              <option value={LoaiTaiLieu.BAI_GIANG}>Bài giảng</option>
              <option value={LoaiTaiLieu.SLIDE}>Slide trình chiếu</option>
              <option value={LoaiTaiLieu.GIAO_TRINH}>Giáo trình</option>
              <option value={LoaiTaiLieu.TAI_LIEU_THAM_KHAO}>Tài liệu tham khảo</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-text">
              Mô tả tóm tắt (không bắt buộc)
            </label>
            <textarea
              rows={2}
              value={moTa}
              onChange={(e) => setMoTa(e.target.value)}
              placeholder="Ghi chú nội dung chính của tài liệu..."
              className="mt-1.5 w-full rounded border border-border bg-bg px-3.5 py-2 text-sm text-text focus:border-accent focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text">Chọn tệp tin đính kèm *</label>
            <div
              onClick={() => inputTepRef.current?.click()}
              className="mt-1.5 border border-dashed border-border hover:border-accent rounded p-6 text-center cursor-pointer transition-colors bg-bg"
            >
              <input
                ref={inputTepRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.mp4,.png,.jpg,.txt"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setTepChon(e.target.files[0]);
                  }
                }}
              />
              <Upload className="w-7 h-7 text-muted mx-auto mb-2" strokeWidth={1.5} />
              {tepChon ? (
                <div>
                  <p className="text-xs font-semibold text-accent">{tepChon.name}</p>
                  <p className="text-[10px] text-muted mt-0.5 font-mono">
                    {dinhDangDungLuong(tepChon.size)}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-medium text-text">Bấm để chọn tệp từ máy tính</p>
                  <p className="text-[10px] text-muted mt-1">
                    Hỗ trợ PDF, DOCX, PPTX, TXT, MP4, ZIP (Tối đa 50MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setMoModalThem(false)}
              className="rounded border border-border bg-surface px-4 py-2 text-xs font-semibold text-text hover:bg-active-bg transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!tieuDe.trim() || !tepChon || mutationTaiLen.isPending}
              className="inline-flex items-center gap-2 rounded bg-accent px-4 py-2 text-xs font-semibold text-white hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {mutationTaiLen.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang tải lên...
                </>
              ) : (
                'Tải lên ngay'
              )}
            </button>
          </div>
        </form>
      </HopThoai>

      {/* Modal 2: Cập nhật phiên bản mới (v2, v3...) */}
      <HopThoai
        mo={!!taiLieuCapNhatPb}
        onDong={() => setTaiLieuCapNhatPb(null)}
        tieuDe={`Cập nhật phiên bản mới (v${(taiLieuCapNhatPb?.soPhienBanHienTai || 1) + 1})`}
        moTa="Phiên bản trước đó vẫn được lưu trữ nguyên vẹn trong lịch sử để đối chiếu hoặc khôi phục khi cần"
      >
        <form onSubmit={xuLyNopPhienBanMoi} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-text">Tiêu đề học liệu</label>
            <input
              type="text"
              value={tieuDePhienBan}
              onChange={(e) => setTieuDePhienBan(e.target.value)}
              className="mt-1.5 w-full rounded border border-border bg-bg px-3.5 py-2 text-sm text-text focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text">
              Ghi chú thay đổi phiên bản (Changelog) *
            </label>
            <textarea
              rows={2}
              required
              value={ghiChuThayDoi}
              onChange={(e) => setGhiChuThayDoi(e.target.value)}
              placeholder="VD: Bổ sung ví dụ minh họa mục 2.3 và đính chính công thức trang 14..."
              className="mt-1.5 w-full rounded border border-border bg-bg px-3.5 py-2 text-sm text-text focus:border-accent focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text">
              Chọn tệp bài giảng phiên bản mới *
            </label>
            <div
              onClick={() => inputTepPhienBanRef.current?.click()}
              className="mt-1.5 border border-dashed border-border hover:border-accent rounded p-5 text-center cursor-pointer transition-colors bg-bg"
            >
              <input
                ref={inputTepPhienBanRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.mp4,.png,.jpg,.txt"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setTepPhienBanMoi(e.target.files[0]);
                  }
                }}
              />
              <Upload className="w-6 h-6 text-muted mx-auto mb-1.5" strokeWidth={1.5} />
              {tepPhienBanMoi ? (
                <div>
                  <p className="text-xs font-semibold text-accent">{tepPhienBanMoi.name}</p>
                  <p className="text-[10px] text-muted mt-0.5 font-mono">
                    {dinhDangDungLuong(tepPhienBanMoi.size)}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted">Bấm để chọn tệp cập nhật mới từ máy tính</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setTaiLieuCapNhatPb(null)}
              className="rounded border border-border bg-surface px-4 py-2 text-xs font-semibold text-text hover:bg-active-bg transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={
                !ghiChuThayDoi.trim() ||
                !tepPhienBanMoi ||
                mutationCapNhatPhienBan.isPending
              }
              className="inline-flex items-center gap-2 rounded bg-accent px-4 py-2 text-xs font-semibold text-white hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {mutationCapNhatPhienBan.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang phát hành...
                </>
              ) : (
                'Phát hành phiên bản mới'
              )}
            </button>
          </div>
        </form>
      </HopThoai>

      {/* Modal 3: Lịch sử phiên bản học liệu */}
      <HopThoai
        mo={!!taiLieuXemLichSu}
        onDong={() => setTaiLieuXemLichSu(null)}
        tieuDe={`Lịch sử phiên bản: ${taiLieuXemLichSu?.tieuDe || ''}`}
        moTa="Tra cứu các lần cập nhật tệp bài giảng, tải về từng bản hoặc khôi phục phiên bản trước"
        kichThuoc="vua"
      >
        <div className="space-y-3">
          {dangTaiLichSu ? (
            <div className="py-8 text-center text-xs text-muted">
              Đang tải lịch sử phiên bản...
            </div>
          ) : !duLieuLichSuPhienBan?.danhSachPhienBan?.length ? (
            <div className="py-8 text-center text-xs text-muted">
              Chưa có dữ liệu lịch sử phiên bản.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {duLieuLichSuPhienBan.danhSachPhienBan.map((pb) => (
                <div
                  key={pb.id || pb.soPhienBan}
                  className={`rounded border p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    pb.laPhienBanHienTai
                      ? 'border-accent bg-accent-soft'
                      : 'border-border bg-bg'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-accent text-white px-2 py-0.5 text-xs font-mono font-bold">
                        v{pb.soPhienBan}
                      </span>
                      <span className="text-xs font-semibold text-text">{pb.tieuDe}</span>
                      {pb.laPhienBanHienTai && (
                        <span className="inline-flex items-center gap-1 rounded border border-accent bg-surface text-accent px-2 py-0.5 text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} />
                          Đang áp dụng
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text">{pb.ghiChuThayDoi}</p>
                    <p className="text-[11px] font-mono text-muted">
                      Cập nhật bởi: {pb.hoTenNguoiCapNhat} • {dinhDangNgay(pb.ngayTao)} •{' '}
                      {dinhDangDungLuong(pb.kichThuocTep)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={layUrlDayDu(pb.duongDanTep)}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-1 rounded border border-border bg-surface hover:bg-active-bg px-2.5 py-1.5 text-xs font-semibold text-text transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Tải bản v{pb.soPhienBan}
                    </a>

                    {coQuyenQuanLy && !pb.laPhienBanHienTai && taiLieuXemLichSu && (
                      <button
                        type="button"
                        onClick={() =>
                          mutationKhoiPhucPhienBan.mutate({
                            idTaiLieu: taiLieuXemLichSu.id,
                            soPhienBan: pb.soPhienBan,
                          })
                        }
                        disabled={mutationKhoiPhucPhienBan.isPending}
                        className="inline-flex items-center gap-1 rounded bg-accent text-white hover:brightness-95 px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
                        Khôi phục
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setTaiLieuXemLichSu(null)}
              className="rounded border border-border bg-surface hover:bg-active-bg px-4 py-2 text-xs font-semibold text-text cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </HopThoai>

      {/* Modal 4: Đánh giá học liệu (1-5 sao & Nhận xét) */}
      <HopThoai
        mo={!!taiLieuDanhGia}
        onDong={() => setTaiLieuDanhGia(null)}
        tieuDe={`Đánh giá học liệu: ${taiLieuDanhGia?.tieuDe || ''}`}
        moTa="Đánh giá mức độ rõ ràng, hữu ích của tài liệu để giảng viên cải thiện chất lượng bài giảng"
        kichThuoc="vua"
      >
        <div className="space-y-4">
          <form
            onSubmit={xuLyGuiDanhGia}
            className="rounded border border-border bg-bg p-4 space-y-3"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-semibold text-text">
                Chọn mức độ đánh giá của bạn:
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((sao) => (
                  <button
                    key={sao}
                    type="button"
                    onClick={() => setSoSaoChon(sao)}
                    className={`px-2.5 py-1 rounded border text-xs font-mono font-bold inline-flex items-center gap-1 transition-colors cursor-pointer ${
                      soSaoChon >= sao
                        ? 'bg-accent text-white border-accent'
                        : 'bg-surface text-muted border-border'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 fill-current" strokeWidth={1.5} />
                    {sao}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={2}
              value={nhanXetDanhGia}
              onChange={(e) => setNhanXetDanhGia(e.target.value)}
              placeholder="Nhận xét thêm về tài liệu (nội dung dễ hiểu, cần bổ sung ví dụ...)..."
              className="w-full rounded border border-border bg-surface px-3 py-2 text-xs text-text focus:border-accent focus:outline-none resize-none"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={mutationGuiDanhGia.isPending}
                className="inline-flex items-center gap-1.5 rounded bg-accent px-4 py-1.5 text-xs font-semibold text-white hover:brightness-95 disabled:opacity-50 cursor-pointer"
              >
                {mutationGuiDanhGia.isPending ? 'Đang lưu...' : 'Gửi đánh giá'}
              </button>
            </div>
          </form>

          {/* Danh sách các đánh giá từ thành viên lớp */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-text">
                Phản hồi từ lớp học ({duLieuDanhGia?.tongSoDanhGia || 0})
              </span>
              {duLieuDanhGia && duLieuDanhGia.tongSoDanhGia > 0 && (
                <span className="font-mono font-bold text-accent">
                  Trung bình: {duLieuDanhGia.diemDanhGiaTrungBinh.toFixed(1)} / 5.0 sao
                </span>
              )}
            </div>

            {dangTaiDanhGia ? (
              <div className="py-6 text-center text-xs text-muted">
                Đang tải danh sách đánh giá...
              </div>
            ) : !duLieuDanhGia?.danhSachDanhGia?.length ? (
              <div className="py-6 text-center text-xs text-muted border border-dashed border-border rounded">
                Chưa có đánh giá nào cho tài liệu này. Hãy là người đầu tiên gửi phản hồi.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {duLieuDanhGia.danhSachDanhGia.map((dg) => (
                  <div
                    key={dg.id}
                    className="rounded border border-border bg-surface p-3 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-text">{dg.hoTenNguoiDung}</span>
                      <span className="font-mono font-bold text-accent">
                        {dg.soSao} / 5 sao • {dinhDangNgay(dg.ngayTao)}
                      </span>
                    </div>
                    {dg.nhanXet && <p className="text-muted">{dg.nhanXet}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </HopThoai>
    </div>
  );
}
