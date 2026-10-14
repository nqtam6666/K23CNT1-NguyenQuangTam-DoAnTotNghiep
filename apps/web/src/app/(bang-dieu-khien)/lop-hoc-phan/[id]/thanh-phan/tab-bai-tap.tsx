'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ClipboardCheck,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  UserCheck,
  Download,
  Award,
  Loader2,
  Calendar,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import { mayKhachApi } from '../../../../../tien-ich/may-khach-api';
import { thongBao } from '../../../../../tien-ich/thong-bao';
import { HopThoai } from '../../../../../thanh-phan/hop-thoai';
import { AnhDaiDien } from '../../../../../thanh-phan/anh-dai-dien';
import {
  BaiTap,
  BaiNop,
  HinhThucNop,
  TrangThaiBaiNop,
  PayloadJwt,
  VaiTro,
} from '@lms/chung';

interface ThuocTinhTabBaiTap {
  idLopHocPhan: string;
  nguoiDung?: PayloadJwt;
  laGiaoVienLop: boolean;
}

export function TabBaiTap({ idLopHocPhan, nguoiDung, laGiaoVienLop }: ThuocTinhTabBaiTap) {
  const queryClient = useQueryClient();

  // Modals
  const [moModalGiaoBai, setMoModalGiaoBai] = useState(false);
  const [baiTapChon, setBaiTapChon] = useState<BaiTap | null>(null);
  const [moModalNopBai, setMoModalNopBai] = useState(false);
  const [moModalChamDiem, setMoModalChamDiem] = useState(false);

  const layNgayMacDinh = () => {
    const d = new Date(Date.now() + 7 * 24 * 3600 * 1000);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  // Form Giao bài
  const [tieuDe, setTieuDe] = useState('');
  const [noiDung, setNoiDung] = useState('');
  const [hanNop, setHanNop] = useState(layNgayMacDinh);
  const [diemToiDa, setDiemToiDa] = useState(10);
  const [hinhThucNop, setHinhThucNop] = useState<HinhThucNop>(HinhThucNop.TEP_TIN);

  // Form Nộp bài
  const [noiDungNop, setNoiDungNop] = useState('');
  const [tepNop, setTepNop] = useState<File | null>(null);
  const inputTepNopRef = useRef<HTMLInputElement>(null);

  // Form Chấm điểm
  const [baiNopDangCham, setBaiNopDangCham] = useState<BaiNop | null>(null);
  const [diemCham, setDiemCham] = useState<number>(10);
  const [nhanXetCham, setNhanXetCham] = useState('');

  const laQuanTri =
    nguoiDung?.vaiTro === VaiTro.QUAN_TRI_VIEN ||
    nguoiDung?.vaiTro === VaiTro.BAN_GIAM_HIEU;

  const coQuyenQuanLy = laGiaoVienLop || laQuanTri;
  const laHocSinh = nguoiDung?.vaiTro === VaiTro.HOC_SINH;

  // 1. Lấy danh sách bài tập của lớp
  const {
    data: danhSachBaiTap = [],
    isLoading: dangTai,
  } = useQuery<BaiTap[]>({
    queryKey: ['bai-tap-lop', idLopHocPhan],
    queryFn: async () => {
      const res = await mayKhachApi.get(`/bai-tap/lop/${idLopHocPhan}`);
      return res.data?.duLieu || res.data || [];
    },
  });

  // 2. Lấy danh sách bài nộp của 1 bài tập (dành cho giáo viên)
  const {
    data: danhSachBaiNop = [],
    isLoading: dangTaiBaiNop,
  } = useQuery<BaiNop[]>({
    queryKey: ['danh-sach-bai-nop', baiTapChon?.id],
    queryFn: async () => {
      if (!baiTapChon?.id) return [];
      const res = await mayKhachApi.get(`/bai-tap/${baiTapChon.id}/danh-sach-nop`);
      return res.data?.duLieu || res.data || [];
    },
    enabled: !!baiTapChon?.id && moModalChamDiem,
  });

  // Mutation Tạo bài tập
  const mutationTaoBaiTap = useMutation({
    mutationFn: async () => {
      const hanNopIso = new Date(hanNop).toISOString();
      const res = await mayKhachApi.post(`/bai-tap/lop/${idLopHocPhan}`, {
        tieuDe,
        noiDung,
        hanNop: hanNopIso,
        diemToiDa: Number(diemToiDa),
        hinhThucNop,
      });
      return res.data;
    },
    onSuccess: () => {
      setMoModalGiaoBai(false);
      setTieuDe('');
      setNoiDung('');
      setHanNop(layNgayMacDinh());
      queryClient.invalidateQueries({ queryKey: ['bai-tap-lop', idLopHocPhan] });
      thongBao.thanhCong('Giao bài tập thành công', 'Bài tập đã được gửi tới học sinh trong lớp.');
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Không thể giao bài',
        err.response?.data?.thongDiep || 'Đã có lỗi xảy ra khi tạo bài tập.',
      );
    },
  });

  // Mutation Xóa bài tập
  const mutationXoaBaiTap = useMutation({
    mutationFn: async (idBaiTap: string) => {
      await mayKhachApi.delete(`/bai-tap/${idBaiTap}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bai-tap-lop', idLopHocPhan] });
      thongBao.thanhCong('Đã xóa bài tập', 'Bài tập đã được gỡ khỏi danh sách.');
    },
    onError: (err: any) => {
      thongBao.thatBai('Lỗi khi xóa bài tập', err.response?.data?.thongDiep || 'Không thể xóa.');
    },
  });

  // Mutation Nộp bài (Học sinh)
  const mutationNopBai = useMutation({
    mutationFn: async () => {
      if (!baiTapChon?.id) throw new Error('Chưa chọn bài tập');

      const formData = new FormData();
      if (tepNop) formData.append('tep', tepNop);
      if (noiDungNop.trim()) formData.append('noiDung', noiDungNop.trim());

      const res = await mayKhachApi.post(`/bai-tap/${baiTapChon.id}/nop-bai`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    },
    onSuccess: () => {
      setMoModalNopBai(false);
      setNoiDungNop('');
      setTepNop(null);
      queryClient.invalidateQueries({ queryKey: ['bai-tap-lop', idLopHocPhan] });
      thongBao.thanhCong('Nộp bài thành công', 'Bài làm của bạn đã được ghi nhận trên hệ thống.');
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Nộp bài thất bại',
        err.response?.data?.thongDiep || 'Không thể gửi bài làm vào lúc này.',
      );
    },
  });

  // Mutation Chấm điểm (Giáo viên)
  const mutationChamDiem = useMutation({
    mutationFn: async () => {
      if (!baiNopDangCham?.id) throw new Error('Chưa chọn bài nộp');
      const res = await mayKhachApi.post(`/bai-tap/bai-nop/${baiNopDangCham.id}/cham-diem`, {
        diemSo: Number(diemCham),
        nhanXet: nhanXetCham.trim() || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      setBaiNopDangCham(null);
      queryClient.invalidateQueries({ queryKey: ['danh-sach-bai-nop', baiTapChon?.id] });
      queryClient.invalidateQueries({ queryKey: ['bai-tap-lop', idLopHocPhan] });
      thongBao.thanhCong('Đã lưu điểm số', 'Điểm và nhận xét đã được cập nhật thành công.');
    },
    onError: (err: any) => {
      thongBao.thatBai('Không thể lưu điểm', err.response?.data?.thongDiep || 'Lỗi khi chấm điểm.');
    },
  });

  const dinhDangNgayGio = (ngay: string | Date) => {
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

  const layUrlDayDu = (duongDan: string) => {
    if (duongDan.startsWith('http')) return duongDan;
    const urlApi = process.env.NEXT_PUBLIC_URL_MAY_CHU_API || 'http://localhost:4000';
    return `${urlApi.replace(/\/$/, '')}${duongDan.startsWith('/') ? '' : '/'}${duongDan}`;
  };

  return (
    <div className="space-y-6">
      {/* Thanh tác vụ */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card rounded border border-border/80 p-5 shadow-sm">
        <div>
          <h3 className="text-base font-semibold text-foreground">Bài tập & Nhiệm vụ học tập</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quản lý bài kiểm tra, bài tập về nhà, thời hạn nộp và nhận xét chấm điểm
          </p>
        </div>

        {coQuyenQuanLy && (
          <button
            onClick={() => setMoModalGiaoBai(true)}
            className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Giao bài tập mới
          </button>
        )}
      </div>

      {/* Danh sách bài tập */}
      {dangTai ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 rounded bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : danhSachBaiTap.length === 0 ? (
        <div className="rounded border border-dashed border-border/80 p-12 text-center bg-card/40">
          <ClipboardCheck className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-foreground">Chưa có bài tập nào</h4>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            {coQuyenQuanLy
              ? 'Lớp học chưa có bài tập nào. Hãy bấm "Giao bài tập mới" để giao việc cho học sinh.'
              : 'Hiện tại bạn không có bài tập nào cần làm cho lớp học này.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {danhSachBaiTap.map((bt) => {
            const daNop = bt.baiNopCuaToi;
            const quaHan = new Date() > new Date(bt.hanNop);

            return (
              <div
                key={bt.id}
                className="bg-card text-card-foreground rounded border border-border/80 p-5 shadow-sm hover:border-border transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="p-2 rounded bg-primary/10 text-primary">
                      <ClipboardCheck className="w-5 h-5" />
                    </span>
                    <h4 className="text-base font-semibold text-foreground">{bt.tieuDe}</h4>

                    {/* Huy hiệu trạng thái dành cho học sinh */}
                    {laHocSinh && (
                      <>
                        {daNop ? (
                          daNop.trangThai === TrangThaiBaiNop.DA_CHAM ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 text-accent px-2 py-0.5 text-xs font-semibold">
                              <Award className="w-3.5 h-3.5" />
                              Điểm: {daNop.diemSo} / {bt.diemToiDa}
                            </span>
                          ) : daNop.trangThai === TrangThaiBaiNop.NOP_MUON ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 text-accent px-2 py-0.5 text-xs font-semibold">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Nộp muộn
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 text-accent px-2 py-0.5 text-xs font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Đã nộp bài
                            </span>
                          )
                        ) : quaHan ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-danger/10 text-danger px-2 py-0.5 text-xs font-semibold">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Quá hạn nộp
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 text-accent px-2 py-0.5 text-xs font-semibold">
                            <Clock className="w-3.5 h-3.5" />
                            Chưa nộp
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed line-clamp-2 pl-11">
                    {bt.noiDung}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pl-11 pt-1">
                    <span className="flex items-center gap-1 text-danger font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      Hạn nộp: {dinhDangNgayGio(bt.hanNop)}
                    </span>
                    <span>•</span>
                    <span>Thang điểm: {bt.diemToiDa} điểm</span>
                    {coQuyenQuanLy && (
                      <>
                        <span>•</span>
                        <span className="text-primary font-medium">
                          Đã nộp: {bt._count?.cacBaiNop || 0} học sinh
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Các nút hành động */}
                <div className="flex items-center gap-2.5 self-end md:self-center">
                  {laHocSinh && (
                    <button
                      onClick={() => {
                        setBaiTapChon(bt);
                        setNoiDungNop(bt.baiNopCuaToi?.noiDung || '');
                        setMoModalNopBai(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {daNop ? 'Xem / Nộp lại' : 'Nộp bài'}
                    </button>
                  )}

                  {coQuyenQuanLy && (
                    <>
                      <button
                        onClick={() => {
                          setBaiTapChon(bt);
                          setMoModalChamDiem(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded bg-primary/10 hover:bg-primary/20 text-primary px-3.5 py-2 text-xs font-semibold transition-all"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Xem bài nộp ({bt._count?.cacBaiNop || 0})
                      </button>

                      <button
                        onClick={() => mutationXoaBaiTap.mutate(bt.id)}
                        disabled={mutationXoaBaiTap.isPending}
                        title="Xóa bài tập"
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal 1: Giao bài tập mới (Giáo viên) */}
      <HopThoai
        mo={moModalGiaoBai}
        onDong={() => setMoModalGiaoBai(false)}
        tieuDe="Giao bài tập mới"
        moTa="Thiết lập tiêu đề, yêu cầu làm bài và thời hạn chót cho học sinh"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!tieuDe.trim() || !noiDung.trim() || !hanNop) return;
            mutationTaoBaiTap.mutate();
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-xs font-semibold text-foreground">Tiêu đề bài tập *</label>
            <input
              type="text"
              required
              value={tieuDe}
              onChange={(e) => setTieuDe(e.target.value)}
              placeholder="VD: Bài tập thực hành Chương 2 - Lập trình hướng đối tượng"
              className="mt-1.5 w-full rounded border border-input bg-background px-3.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Yêu cầu & Hướng dẫn làm bài *</label>
            <textarea
              required
              rows={4}
              value={noiDung}
              onChange={(e) => setNoiDung(e.target.value)}
              placeholder="Mô tả chi tiết câu hỏi, các đề mục cần hoàn thành, định dạng tệp yêu cầu..."
              className="mt-1.5 w-full rounded border border-input bg-background px-3.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground">Thời hạn nộp (Hạn chót) *</label>
              <input
                type="datetime-local"
                required
                value={hanNop}
                onChange={(e) => setHanNop(e.target.value)}
                className="mt-1.5 w-full rounded border border-input bg-background px-3.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Điểm tối đa</label>
              <input
                type="number"
                min={1}
                max={100}
                value={diemToiDa}
                onChange={(e) => setDiemToiDa(Number(e.target.value))}
                className="mt-1.5 w-full rounded border border-input bg-background px-3.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setMoModalGiaoBai(false)}
              className="rounded border border-input px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!tieuDe.trim() || !noiDung.trim() || !hanNop || mutationTaoBaiTap.isPending}
              className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {mutationTaoBaiTap.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang giao bài...
                </>
              ) : (
                'Giao bài tập'
              )}
            </button>
          </div>
        </form>
      </HopThoai>

      {/* Modal 2: Nộp bài (Học sinh) */}
      <HopThoai
        mo={moModalNopBai}
        onDong={() => setMoModalNopBai(false)}
        tieuDe={baiTapChon?.tieuDe || 'Nộp bài tập'}
        moTa={`Hạn nộp: ${baiTapChon ? dinhDangNgayGio(baiTapChon.hanNop) : ''}`}
      >
        <div className="space-y-4">
          {/* Thông tin bài đã chấm (nếu có) */}
          {baiTapChon?.baiNopCuaToi?.trangThai === TrangThaiBaiNop.DA_CHAM && (
            <div className="rounded bg-accent/10 border border-accent p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-accent ">
                  Kết quả đánh giá từ giáo viên:
                </span>
                <span className="text-base font-bold text-accent ">
                  {baiTapChon.baiNopCuaToi.diemSo} / {baiTapChon.diemToiDa} điểm
                </span>
              </div>
              {baiTapChon.baiNopCuaToi.nhanXet && (
                <p className="text-xs text-foreground/90 italic">
                  &ldquo;{baiTapChon.baiNopCuaToi.nhanXet}&rdquo;
                </p>
              )}
            </div>
          )}

          {/* Hướng dẫn làm bài */}
          <div className="rounded bg-muted/40 p-3.5 text-xs text-muted-foreground whitespace-pre-line leading-relaxed border border-border/60">
            <span className="font-semibold text-foreground block mb-1">Yêu cầu từ giáo viên:</span>
            {baiTapChon?.noiDung}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutationNopBai.mutate();
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-xs font-semibold text-foreground">
                Câu trả lời văn bản (hoặc ghi chú)
              </label>
              <textarea
                rows={3}
                value={noiDungNop}
                onChange={(e) => setNoiDungNop(e.target.value)}
                placeholder="Nhập nội dung câu trả lời hoặc liên kết bài làm..."
                className="mt-1.5 w-full rounded border border-input bg-background px-3.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Đính kèm tập tin bài làm</label>
              <div
                onClick={() => inputTepNopRef.current?.click()}
                className="mt-1.5 border-2 border-dashed border-border/80 hover:border-primary/50 rounded p-5 text-center cursor-pointer transition-all bg-muted/20 hover:bg-muted/40"
              >
                <input
                  ref={inputTepNopRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.png,.jpg,.jpeg,.txt"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setTepNop(e.target.files[0]);
                    }
                  }}
                />
                <Upload className="w-7 h-7 text-muted-foreground/60 mx-auto mb-2" />
                {tepNop ? (
                  <p className="text-xs font-semibold text-primary">{tepNop.name}</p>
                ) : baiTapChon?.baiNopCuaToi?.duongDanTep ? (
                  <div>
                    <p className="text-xs font-medium text-foreground">Đã có tệp nộp trước đó</p>
                    <p className="text-[10px] text-muted-foreground">Bấm để thay thế tệp mới</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-medium text-foreground">Chọn tệp bài nộp từ thiết bị</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Hỗ trợ Word, PDF, Excel, ZIP (Tối đa 30MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setMoModalNopBai(false)}
                className="rounded border border-input px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={(!noiDungNop.trim() && !tepNop) || mutationNopBai.isPending}
                className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {mutationNopBai.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Đang nộp...
                  </>
                ) : (
                  'Xác nhận nộp bài'
                )}
              </button>
            </div>
          </form>
        </div>
      </HopThoai>

      {/* Modal 3: Danh sách nộp bài & Chấm điểm (Giáo viên) */}
      <HopThoai
        mo={moModalChamDiem}
        onDong={() => {
          setMoModalChamDiem(false);
          setBaiNopDangCham(null);
        }}
        tieuDe={`Danh sách nộp bài: ${baiTapChon?.tieuDe || ''}`}
        moTa={`Điểm tối đa: ${baiTapChon?.diemToiDa || 10} điểm`}
        kichThuoc="rat-lon"
      >
        <div className="space-y-5">
          {/* Khung chấm điểm chi tiết khi giáo viên chọn 1 học sinh */}
          {baiNopDangCham && (
            <div className="bg-primary/5 border border-primary/20 rounded p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <AnhDaiDien
                    url={baiNopDangCham.nguoiNop?.anhDaiDien}
                    hoTen={baiNopDangCham.nguoiNop?.hoTen || 'Học sinh'}
                    kichThuoc="md"
                  />
                  <div>
                    <h4 className="text-sm font-semibold">{baiNopDangCham.nguoiNop?.hoTen}</h4>
                    <p className="text-xs text-muted-foreground">
                      Mã số: {baiNopDangCham.nguoiNop?.hoSoHocSinh?.maHocSinh || 'N/A'} • Nộp lúc:{' '}
                      {dinhDangNgayGio(baiNopDangCham.ngayNop)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setBaiNopDangCham(null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Đóng chấm
                </button>
              </div>

              {/* Nội dung bài nộp */}
              {baiNopDangCham.noiDung && (
                <div className="rounded bg-background p-3 text-xs text-foreground/90 border border-border">
                  <span className="font-semibold block mb-1">Nội dung trả lời:</span>
                  <p className="whitespace-pre-line">{baiNopDangCham.noiDung}</p>
                </div>
              )}

              {/* Tệp đính kèm */}
              {baiNopDangCham.duongDanTep && (
                <a
                  href={layUrlDayDu(baiNopDangCham.duongDanTep)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-1.5 rounded bg-background border border-border px-3 py-1.5 text-xs font-semibold text-primary hover:bg-muted/50 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Tải tệp bài làm của học sinh
                </a>
              )}

              {/* Biểu mẫu nhập điểm */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                <div className="sm:col-span-1">
                  <label className="text-xs font-semibold text-foreground">Điểm số *</label>
                  <input
                    type="number"
                    min={0}
                    max={baiTapChon?.diemToiDa || 10}
                    step={0.25}
                    value={diemCham}
                    onChange={(e) => setDiemCham(Number(e.target.value))}
                    className="mt-1 w-full rounded border border-input bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-bold"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-xs font-semibold text-foreground">Lời nhận xét</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={nhanXetCham}
                      onChange={(e) => setNhanXetCham(e.target.value)}
                      placeholder="VD: Bài làm tốt, lập luận rõ ràng..."
                      className="w-full rounded border border-input bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => mutationChamDiem.mutate()}
                      disabled={mutationChamDiem.isPending}
                      className="inline-flex items-center gap-1.5 rounded bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-all shrink-0"
                    >
                      {mutationChamDiem.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        'Lưu điểm'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bảng danh sách học sinh nộp bài */}
          {dangTaiBaiNop ? (
            <div className="h-40 rounded bg-muted/40 animate-pulse" />
          ) : danhSachBaiNop.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Chưa có học sinh nào nộp bài tập này.
            </div>
          ) : (
            <div className="rounded border border-border/80 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3 pl-4">Học sinh</th>
                    <th className="p-3">Thời gian nộp</th>
                    <th className="p-3">Trạng thái</th>
                    <th className="p-3">Điểm số</th>
                    <th className="p-3 pr-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {danhSachBaiNop.map((bn) => (
                    <tr key={bn.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 pl-4">
                        <div className="flex items-center gap-2.5">
                          <AnhDaiDien
                            url={bn.nguoiNop?.anhDaiDien}
                            hoTen={bn.nguoiNop?.hoTen || 'Học sinh'}
                            kichThuoc="sm"
                          />
                          <div>
                            <p className="font-semibold text-foreground">{bn.nguoiNop?.hoTen}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {bn.nguoiNop?.hoSoHocSinh?.maHocSinh || bn.nguoiNop?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{dinhDangNgayGio(bn.ngayNop)}</td>
                      <td className="p-3">
                        {bn.trangThai === TrangThaiBaiNop.DA_CHAM ? (
                          <span className="rounded-md bg-accent/10 text-accent px-2 py-0.5 text-[10px] font-semibold">
                            Đã chấm điểm
                          </span>
                        ) : bn.trangThai === TrangThaiBaiNop.NOP_MUON ? (
                          <span className="rounded-md bg-accent/10 text-accent px-2 py-0.5 text-[10px] font-semibold">
                            Nộp muộn
                          </span>
                        ) : (
                          <span className="rounded-md bg-accent/10 text-accent px-2 py-0.5 text-[10px] font-semibold">
                            Đã nộp
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-foreground">
                        {bn.diemSo !== null && bn.diemSo !== undefined
                          ? `${bn.diemSo} / ${baiTapChon?.diemToiDa || 10}`
                          : '—'}
                      </td>
                      <td className="p-3 pr-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setBaiNopDangCham(bn);
                            setDiemCham(bn.diemSo !== null && bn.diemSo !== undefined ? bn.diemSo : 10);
                            setNhanXetCham(bn.nhanXet || '');
                          }}
                          className="rounded-lg bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 text-xs font-semibold transition-colors"
                        >
                          {bn.trangThai === TrangThaiBaiNop.DA_CHAM ? 'Chấm lại' : 'Chấm điểm'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </HopThoai>
    </div>
  );
}
