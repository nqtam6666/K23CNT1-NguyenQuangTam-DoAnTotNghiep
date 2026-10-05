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
  FileCode,
  FileArchive,
  Film,
  Loader2,
  Calendar,
  Layers,
} from 'lucide-react';
import { mayKhachApi } from '../../../../../tien-ich/may-khach-api';
import { thongBao } from '../../../../../tien-ich/thong-bao';
import { HopThoai } from '../../../../../thanh-phan/hop-thoai';
import { TaiLieu, LoaiTaiLieu, PayloadJwt, VaiTro } from '@lms/chung';

interface ThuocTinhTabTaiLieu {
  idLopHocPhan: string;
  nguoiDung?: PayloadJwt;
  laGiaoVienLop: boolean;
}

const nhanLoaiTaiLieu: Record<LoaiTaiLieu, { ten: string; lopCss: string }> = {
  [LoaiTaiLieu.GIAO_TRINH]: {
    ten: 'Giáo trình',
    lopCss: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  [LoaiTaiLieu.BAI_GIANG]: {
    ten: 'Bài giảng',
    lopCss: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  [LoaiTaiLieu.SLIDE]: {
    ten: 'Slide trình chiếu',
    lopCss: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  },
  [LoaiTaiLieu.TAI_LIEU_THAM_KHAO]: {
    ten: 'Tham khảo',
    lopCss: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
};

export function TabTaiLieu({ idLopHocPhan, nguoiDung, laGiaoVienLop }: ThuocTinhTabTaiLieu) {
  const queryClient = useQueryClient();
  const [moModalThem, setMoModalThem] = useState(false);
  const [tieuDe, setTieuDe] = useState('');
  const [moTa, setMoTa] = useState('');
  const [loaiTaiLieu, setLoaiTaiLieu] = useState<LoaiTaiLieu>(LoaiTaiLieu.TAI_LIEU_THAM_KHAO);
  const [tepChon, setTepChon] = useState<File | null>(null);
  const inputTepRef = useRef<HTMLInputElement>(null);

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
      thongBao.thanhCong('Tải lên thành công', 'Tài liệu đã được lưu trữ và sẵn sàng phục vụ học tập.');
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Tải lên thất bại',
        err.response?.data?.thongDiep || 'Không thể tải tệp tài liệu lên máy chủ.',
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
    if (ext === 'pdf') return <FileText className="w-6 h-6 text-red-500" />;
    if (ext === 'ppt' || ext === 'pptx') return <Presentation className="w-6 h-6 text-orange-500" />;
    if (ext === 'doc' || ext === 'docx') return <FileText className="w-6 h-6 text-blue-500" />;
    if (ext === 'zip' || ext === 'rar' || ext === '7z') return <FileArchive className="w-6 h-6 text-amber-500" />;
    if (ext === 'mp4' || ext === 'mkv') return <Film className="w-6 h-6 text-purple-500" />;
    return <BookOpen className="w-6 h-6 text-emerald-500" />;
  };

  const layUrlDayDu = (duongDan: string) => {
    if (duongDan.startsWith('http')) return duongDan;
    const urlApi = process.env.NEXT_PUBLIC_URL_MAY_CHU_API || 'http://localhost:4000';
    return `${urlApi.replace(/\/$/, '')}${duongDan.startsWith('/') ? '' : '/'}${duongDan}`;
  };

  return (
    <div className="space-y-6">
      {/* Thanh hành động */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card rounded-2xl border border-border/80 p-5 shadow-sm">
        <div>
          <h3 className="text-base font-semibold text-foreground">Kho tài liệu học tập</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Giáo trình, bài giảng, slide và tài liệu tham khảo chính thức của môn học
          </p>
        </div>

        {coQuyenQuanLy && (
          <button
            onClick={() => setMoModalThem(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Tải lên tài liệu
          </button>
        )}
      </div>

      {/* Danh sách tài liệu */}
      {dangTai ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : danhSachTaiLieu.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center bg-card/40">
          <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-foreground">Chưa có tài liệu nào</h4>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            {coQuyenQuanLy
              ? 'Hãy tải lên tài liệu học tập đầu tiên để sinh viên tham khảo và phục vụ Trợ lý AI.'
              : 'Giáo viên phụ trách chưa đăng tải tài liệu nào cho lớp học phần này.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {danhSachTaiLieu.map((tl) => {
            const cauHinhNhan = nhanLoaiTaiLieu[tl.loaiTaiLieu] || nhanLoaiTaiLieu[LoaiTaiLieu.TAI_LIEU_THAM_KHAO];

            return (
              <div
                key={tl.id}
                className="bg-card text-card-foreground rounded-2xl border border-border/80 p-5 shadow-sm hover:border-border transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-muted/50 border border-border/60">
                        {layBieuTuongTep(tl.duongDanTep)}
                      </div>
                      <div>
                        <span
                          className={`inline-block border px-2 py-0.5 text-[10px] font-semibold rounded-md mb-1.5 ${cauHinhNhan.lopCss}`}
                        >
                          {cauHinhNhan.ten}
                        </span>
                        <h4 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                          {tl.tieuDe}
                        </h4>
                      </div>
                    </div>

                    {coQuyenQuanLy && (
                      <button
                        onClick={() => mutationXoa.mutate(tl.id)}
                        disabled={mutationXoa.isPending}
                        title="Xóa tài liệu"
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {tl.moTa && (
                    <p className="text-xs text-muted-foreground mt-3 line-clamp-2 leading-relaxed">
                      {tl.moTa}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-border/60 text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span>{dinhDangDungLuong(tl.kichThuocTep)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {dinhDangNgay(tl.ngayTao)}
                    </span>
                  </div>

                  <a
                    href={layUrlDayDu(tl.duongDanTep)}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Tải về
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Thêm tài liệu */}
      <HopThoai
        mo={moModalThem}
        onDong={() => setMoModalThem(false)}
        tieuDe="Tải lên tài liệu học tập"
        moTa="Đăng tải bài giảng, slide hoặc giáo trình phục vụ sinh viên và phân tích Trợ lý AI"
      >
        <form onSubmit={xuLyNopForm} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground">Tiêu đề tài liệu *</label>
            <input
              type="text"
              required
              value={tieuDe}
              onChange={(e) => setTieuDe(e.target.value)}
              placeholder="VD: Slide bài giảng Chương 1 - Nhập môn công nghệ"
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Phân loại tài liệu *</label>
            <select
              value={loaiTaiLieu}
              onChange={(e) => setLoaiTaiLieu(e.target.value as LoaiTaiLieu)}
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value={LoaiTaiLieu.BAI_GIANG}>Bài giảng</option>
              <option value={LoaiTaiLieu.SLIDE}>Slide trình chiếu</option>
              <option value={LoaiTaiLieu.GIAO_TRINH}>Giáo trình</option>
              <option value={LoaiTaiLieu.TAI_LIEU_THAM_KHAO}>Tài liệu tham khảo</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Mô tả tóm tắt (không bắt buộc)</label>
            <textarea
              rows={2}
              value={moTa}
              onChange={(e) => setMoTa(e.target.value)}
              placeholder="Ghi chú nội dung chính của tài liệu..."
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Chọn tệp tin đính kèm *</label>
            <div
              onClick={() => inputTepRef.current?.click()}
              className="mt-1.5 border-2 border-dashed border-border/80 hover:border-primary/50 rounded-2xl p-6 text-center cursor-pointer transition-all bg-muted/20 hover:bg-muted/40"
            >
              <input
                ref={inputTepRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.mp4,.png,.jpg"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setTepChon(e.target.files[0]);
                  }
                }}
              />
              <Upload className="w-8 h-8 text-muted-foreground/60 mx-auto mb-2" />
              {tepChon ? (
                <div>
                  <p className="text-xs font-semibold text-primary">{tepChon.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {dinhDangDungLuong(tepChon.size)}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-medium text-foreground">Bấm để chọn tệp từ máy tính</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Hỗ trợ PDF, DOCX, PPTX, MP4, ZIP (Tối đa 50MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setMoModalThem(false)}
              className="rounded-xl border border-input px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!tieuDe.trim() || !tepChon || mutationTaiLen.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
    </div>
  );
}
