'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  BookOpen,
  FileText,
  Clock,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Bot,
  User,
  Loader2,
  GraduationCap,
  Layers,
  ArrowRight,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';
import {
  VaiTro,
  LoaiBanNhapAI,
  TrangThaiBanNhapAI,
  PhienTroLy,
  TinNhanTroLy,
  NguonTrichDan,
  KetQuaHoiDapAI,
  BanNhapAI,
} from '@lms/chung';
import { mayKhachApi } from '@/tien-ich/may-khach-api';
import { thongBao } from '@/tien-ich/thong-bao';
import { HopThoai } from '@/thanh-phan/hop-thoai';
import { AnhDaiDien } from '@/thanh-phan/anh-dai-dien';
import { DinhDangMarkdown } from '@/thanh-phan/dinh-dang-markdown';

export default function TrangTroLyHocTap() {
  const queryClient = useQueryClient();

  const [idPhienChon, setIdPhienChon] = useState<string | null>(null);
  const [cauHoiNhap, setCauHoiNhap] = useState('');
  const [idLopLoc, setIdLopLoc] = useState<string>('');
  const [doanXemChiTiet, setDoanXemChiTiet] = useState<NguonTrichDan | null>(null);

  // Modal bản nháp AI (Giáo viên)
  const [moModalBanNhap, setMoModalBanNhap] = useState(false);
  const [tieuDeBanNhap, setTieuDeBanNhap] = useState('');
  const [noiDungBanNhap, setNoiDungBanNhap] = useState('');
  const [idLopBanNhap, setIdLopBanNhap] = useState('');
  const [loaiBanNhap, setLoaiBanNhap] = useState<LoaiBanNhapAI>(LoaiBanNhapAI.BAI_TAP);

  const cuonCuoiTrangRef = useRef<HTMLDivElement>(null);

  // 1. Lấy thông tin người dùng hiện tại
  const { data: nguoiDung } = useQuery({
    queryKey: ['ho-so-hien-tai'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/xac-thuc/ho-so-hien-tai');
      return res.data?.duLieu || res.data;
    },
  });

  const laGiaoVien = nguoiDung?.vaiTro === VaiTro.GIAO_VIEN;
  const laQuanTri =
    nguoiDung?.vaiTro === VaiTro.QUAN_TRI_VIEN ||
    nguoiDung?.vaiTro === VaiTro.BAN_GIAM_HIEU;

  // 2. Lấy danh sách lớp học phần
  const { data: danhSachLop = [] } = useQuery<any[]>({
    queryKey: ['danh-sach-lop-hoc-phan'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/lop-hoc-phan', {
        params: { kichThuoc: 50 },
      });
      const raw = res.data?.duLieu || res.data;
      return Array.isArray(raw) ? raw : raw?.duLieu || raw?.danhSach || [];
    },
  });

  // 3. Lấy danh sách phiên hội thoại
  const { data: danhSachPhien = [], isLoading: dangTaiPhien } = useQuery<PhienTroLy[]>({
    queryKey: ['danh-sach-phien-tro-ly'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/tro-ly-ai/phien');
      return res.data?.duLieu || res.data || [];
    },
  });

  // Tự động chọn phiên đầu tiên nếu có
  useEffect(() => {
    if (!idPhienChon && danhSachPhien.length > 0) {
      setIdPhienChon(danhSachPhien[0].id);
    }
  }, [danhSachPhien, idPhienChon]);

  // 4. Lấy chi tiết tin nhắn của phiên đang chọn
  const { data: chiTietPhien, isLoading: dangTaiTinNhan } = useQuery<PhienTroLy>({
    queryKey: ['chi-tiet-phien-tro-ly', idPhienChon],
    queryFn: async () => {
      if (!idPhienChon) return null as any;
      const res = await mayKhachApi.get(`/tro-ly-ai/phien/${idPhienChon}`);
      return res.data?.duLieu || res.data;
    },
    enabled: !!idPhienChon,
  });

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    cuonCuoiTrangRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chiTietPhien?.cacTinNhan]);

  // 5. Mutation gửi câu hỏi tới Trợ lý AI
  const mutationHoiDap = useMutation({
    mutationFn: async (cauHoi: string) => {
      const res = await mayKhachApi.post('/tro-ly-ai/hoi-dap', {
        idPhien: idPhienChon || undefined,
        idLopHocPhan: idLopLoc || undefined,
        noiDung: cauHoi.trim(),
      });
      return res.data?.duLieu || res.data;
    },
    onSuccess: (data: KetQuaHoiDapAI) => {
      setCauHoiNhap('');
      if (!idPhienChon && data.idPhien) {
        setIdPhienChon(data.idPhien);
      }
      queryClient.invalidateQueries({ queryKey: ['chi-tiet-phien-tro-ly', data.idPhien] });
      queryClient.invalidateQueries({ queryKey: ['danh-sach-phien-tro-ly'] });
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Không thể gửi câu hỏi',
        err.response?.data?.thongDiep || 'Đã xảy ra lỗi khi kết nối với Trợ lý học tập.',
      );
    },
  });

  // 6. Mutation xóa phiên trò chuyện
  const mutationXoaPhien = useMutation({
    mutationFn: async (id: string) => {
      await mayKhachApi.delete(`/tro-ly-ai/phien/${id}`);
    },
    onSuccess: (_, id) => {
      thongBao.thanhCong('Đã xóa phiên', 'Cuộc hội thoại đã được gỡ bỏ khỏi danh sách.');
      if (idPhienChon === id) {
        setIdPhienChon(null);
      }
      queryClient.invalidateQueries({ queryKey: ['danh-sach-phien-tro-ly'] });
    },
  });

  // 7. Lấy danh sách bản nháp AI theo lớp (Dành cho Giáo viên)
  const idLopMucTieuBanNhap = idLopLoc || danhSachLop[0]?.id;
  const { data: danhSachBanNhap = [] } = useQuery<BanNhapAI[]>({
    queryKey: ['ban-nhap-ai-lop', idLopMucTieuBanNhap],
    queryFn: async () => {
      if (!idLopMucTieuBanNhap) return [];
      const res = await mayKhachApi.get(`/tro-ly-ai/ban-nhap/lop/${idLopMucTieuBanNhap}`);
      return res.data?.duLieu || res.data || [];
    },
    enabled: (laGiaoVien || laQuanTri) && (!!idLopLoc || danhSachLop.length > 0),
  });

  // 8. Mutation tạo bản nháp AI
  const mutationTaoBanNhap = useMutation({
    mutationFn: async () => {
      const res = await mayKhachApi.post('/tro-ly-ai/ban-nhap', {
        idLopHocPhan: idLopBanNhap,
        loaiBanNhap,
        tieuDe: tieuDeBanNhap.trim(),
        duLieuJson: {
          noiDung: noiDungBanNhap.trim(),
          diemToiDa: 10,
        },
      });
      return res.data;
    },
    onSuccess: () => {
      setMoModalBanNhap(false);
      setTieuDeBanNhap('');
      setNoiDungBanNhap('');
      queryClient.invalidateQueries({ queryKey: ['ban-nhap-ai-lop', idLopBanNhap] });
      thongBao.thanhCong('Tạo bản nháp thành công', 'Bản nháp gợi ý đã được lưu vào hệ thống.');
    },
    onError: (err: any) => {
      thongBao.thatBai('Lỗi tạo bản nháp', err.response?.data?.thongDiep || 'Không thể tạo bản nháp.');
    },
  });

  // 9. Mutation duyệt bản nháp AI
  const mutationDuyetBanNhap = useMutation({
    mutationFn: async ({ id, trangThai }: { id: string; trangThai: TrangThaiBanNhapAI }) => {
      const res = await mayKhachApi.patch(`/tro-ly-ai/ban-nhap/${id}/duyet`, { trangThai });
      return res.data;
    },
    onSuccess: (_, bien) => {
      if (bien.trangThai === TrangThaiBanNhapAI.DA_DUYET) {
        thongBao.thanhCong('Đã phê duyệt', 'Bản nháp đã được chuyển thành bài tập chính thức của lớp.');
      } else {
        thongBao.thanhCong('Đã từ chối', 'Bản nháp đã được đánh dấu từ chối.');
      }
      queryClient.invalidateQueries({ queryKey: ['ban-nhap-ai-lop', idLopLoc] });
      queryClient.invalidateQueries({ queryKey: ['bai-tap-lop'] });
    },
  });

  const xuLyGuiTinNhan = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cauHoiNhap.trim() || mutationHoiDap.isPending) return;
    mutationHoiDap.mutate(cauHoiNhap);
  };

  const goiYCauHoi = [
    'Tóm tắt nội dung chính của tài liệu học tập',
    'Các kiểu dữ liệu cơ bản trong Python là gì?',
    'Cách khai báo biến số và hàm trong ngôn ngữ lập trình',
    'Hướng dẫn làm bài tập thực hành tuần này',
  ];

  return (
    <div className="space-y-6">
      {/* Banner tiêu đề phân hệ */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card rounded-2xl border border-border/80 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Trợ lý hỗ trợ học tập</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tra cứu tri thức, giải đáp bài giảng và trích dẫn tài liệu học tập chính xác
            </p>
          </div>
        </div>

        {/* Nút tác vụ cho Giáo viên */}
        {(laGiaoVien || laQuanTri) && (
          <button
            onClick={() => {
              setIdLopBanNhap(idLopLoc || danhSachLop[0]?.id || '');
              setMoModalBanNhap(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
          >
            <Layers className="w-4 h-4" />
            Tạo bản nháp gợi ý
          </button>
        )}
      </div>

      {/* Bố cục chính 2 cột: Sidebar phiên trò chuyện & Khung chat */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Cột 1: Danh sách phiên hội thoại */}
        <div className="lg:col-span-1 bg-card rounded-2xl border border-border/80 p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Lịch sử trò chuyện
            </h2>
            <button
              onClick={() => {
                setIdPhienChon(null);
                setCauHoiNhap('');
              }}
              title="Tạo cuộc hội thoại mới"
              className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              Mới
            </button>
          </div>

          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {dangTaiPhien ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 rounded-xl bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : danhSachPhien.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                Chưa có phiên trò chuyện nào. Hãy gửi câu hỏi đầu tiên!
              </div>
            ) : (
              danhSachPhien.map((phien) => {
                const laChon = phien.id === idPhienChon;
                return (
                  <div
                    key={phien.id}
                    onClick={() => setIdPhienChon(phien.id)}
                    className={`group relative flex items-center justify-between p-3 rounded-xl cursor-pointer text-xs transition-all ${
                      laChon
                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                        : 'text-foreground hover:bg-muted/50 border border-transparent hover:border-border/60'
                    }`}
                  >
                    <div className="truncate pr-6">
                      <p className="truncate">{phien.tieuDe}</p>
                      <p
                        className={`text-[10px] mt-0.5 ${
                          laChon ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        }`}
                      >
                        {new Date(phien.ngayTao).toLocaleDateString('vi-VN')} •{' '}
                        {phien._count?.cacTinNhan || 0} tin nhắn
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        mutationXoaPhien.mutate(phien.id);
                      }}
                      title="Xóa phiên"
                      className={`p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
                        laChon
                          ? 'hover:bg-primary-foreground/20 text-primary-foreground'
                          : 'hover:bg-destructive/10 text-muted-foreground hover:text-destructive'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Cột 2: Khung làm việc và hội thoại */}
        <div className="lg:col-span-3 bg-card rounded-2xl border border-border/80 shadow-sm flex flex-col h-[700px]">
          {/* Header khu vực chat */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border/80">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  {chiTietPhien?.tieuDe || 'Hội thoại mới'}
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Chế độ tra cứu tri thức dựa trên tài liệu lớp học
                </p>
              </div>
            </div>

            {/* Bộ lọc phạm vi lớp học phần */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground hidden sm:inline">Phạm vi:</label>
              <select
                value={idLopLoc}
                onChange={(e) => setIdLopLoc(e.target.value)}
                className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Tất cả các lớp học phần</option>
                {danhSachLop.map((lop) => (
                  <option key={lop.id} value={lop.id}>
                    {lop.tenLopHocPhan} ({lop.maLopHocPhan})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dòng tin nhắn */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {dangTaiTinNhan ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (!chiTietPhien || chiTietPhien.cacTinNhan?.length === 0) ? (
              <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Bạn cần hỗ trợ gì hôm nay?</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Trợ lý sẵn sàng giải đáp các câu hỏi dựa trên giáo trình, slide bài giảng và tài liệu của khóa học.
                  </p>
                </div>

                {/* Prompt chips gợi ý */}
                <div className="w-full space-y-2 pt-2">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-left">
                    Gợi ý câu hỏi phổ biến:
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {goiYCauHoi.map((cau, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCauHoiNhap(cau);
                          mutationHoiDap.mutate(cau);
                        }}
                        className="text-left p-2.5 rounded-xl border border-border/80 bg-background hover:bg-muted/40 text-xs text-foreground/90 transition-all flex items-center justify-between group"
                      >
                        <span className="truncate">{cau}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              chiTietPhien.cacTinNhan?.map((tin) => {
                const laNguoiDung = tin.vaiTro === 'user';
                return (
                  <div
                    key={tin.id}
                    className={`flex gap-3.5 ${laNguoiDung ? 'justify-end' : 'justify-start'}`}
                  >
                    {!laNguoiDung && (
                      <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                        laNguoiDung
                          ? 'bg-primary text-primary-foreground font-medium rounded-tr-xs shadow-xs'
                          : 'bg-muted/30 text-foreground border border-border/80 rounded-tl-xs'
                      }`}
                    >
                      <DinhDangMarkdown
                        noiDung={tin.noiDung}
                        laNguoiDung={laNguoiDung}
                      />

                      {/* Trích dẫn nguồn tài liệu RAG */}
                      {!laNguoiDung && tin.trichDan && tin.trichDan.length > 0 && (
                        <div className="pt-3 border-t border-border/60 space-y-2">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-primary" />
                            Tài liệu nguồn trích dẫn ({tin.trichDan.length}):
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {tin.trichDan.map((tc, idx) => (
                              <div
                                key={idx}
                                onClick={() => setDoanXemChiTiet(tc)}
                                className="p-2 rounded-xl bg-background border border-border/70 hover:border-primary/50 cursor-pointer transition-all flex items-center justify-between gap-2 shadow-2xs group"
                              >
                                <div className="truncate">
                                  <p className="font-semibold text-foreground truncate text-[11px] group-hover:text-primary transition-colors">
                                    {tc.tieuDeTaiLieu}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">
                                    Đoạn {tc.soThuTu} • {tc.doTuongDong}% tương đồng
                                  </p>
                                </div>
                                <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {laNguoiDung && (
                      <AnhDaiDien
                        url={nguoiDung?.anhDaiDien}
                        hoTen={nguoiDung?.hoTen || 'Bạn'}
                        kichThuoc="sm"
                      />
                    )}
                  </div>
                );
              })
            )}

            {/* Trạng thái AI đang truy hồi và sinh câu trả lời */}
            {mutationHoiDap.isPending && (
              <div className="flex gap-3.5 justify-start">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="rounded-2xl rounded-tl-xs p-4 bg-muted/30 border border-border/80 text-xs text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  Đang tra cứu tài liệu học tập và tổng hợp câu trả lời...
                </div>
              </div>
            )}

            <div ref={cuonCuoiTrangRef} />
          </div>

          {/* Ô nhập tin nhắn */}
          <div className="p-4 border-t border-border/80 bg-card">
            <form onSubmit={xuLyGuiTinNhan} className="flex items-center gap-2">
              <input
                type="text"
                value={cauHoiNhap}
                onChange={(e) => setCauHoiNhap(e.target.value)}
                placeholder="Đặt câu hỏi về nội dung bài giảng, cú pháp hoặc bài tập..."
                className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={!cauHoiNhap.trim() || mutationHoiDap.isPending}
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs shrink-0"
              >
                {mutationHoiDap.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bảng quản lý bản nháp AI (Dành cho Giáo viên & Quản trị viên) */}
      {(laGiaoVien || laQuanTri) && (
        <div className="bg-card rounded-2xl border border-border/80 p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  Danh sách gợi ý bản nháp chờ phê duyệt
                </h2>
                <p className="text-xs text-muted-foreground">
                  Nội dung chỉ có hiệu lực sau khi được Giáo viên kiểm duyệt và chấp thuận
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary/10 text-primary">
              {danhSachBanNhap.length} bản nháp
            </span>
          </div>

          {danhSachBanNhap.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
              Chưa có bản nháp nào được tạo cho lớp học này. Bấm &quot;Tạo bản nháp gợi ý&quot; để thêm mới.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {danhSachBanNhap.map((bn) => {
                const laDaDuyet = bn.trangThai === TrangThaiBanNhapAI.DA_DUYET;
                const laTuChoi = bn.trangThai === TrangThaiBanNhapAI.TU_CHOI;
                return (
                  <div
                    key={bn.id}
                    className="p-4 rounded-xl border border-border/80 bg-background/60 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground uppercase">
                          {bn.loaiBanNhap}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            laDaDuyet
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : laTuChoi
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-amber-500/10 text-amber-600'
                          }`}
                        >
                          {laDaDuyet ? 'Đã duyệt' : laTuChoi ? 'Đã từ chối' : 'Chờ duyệt'}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-foreground line-clamp-1">{bn.tieuDe}</h3>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        {(bn.duLieuJson as any)?.noiDung || (bn.duLieuJson as any)?.moTa || ''}
                      </p>
                    </div>

                    {!laDaDuyet && !laTuChoi && (
                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <button
                          onClick={() =>
                            mutationDuyetBanNhap.mutate({
                              id: bn.id,
                              trangThai: TrangThaiBanNhapAI.DA_DUYET,
                            })
                          }
                          className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors"
                        >
                          Duyệt & Tạo bài tập
                        </button>
                        <button
                          onClick={() =>
                            mutationDuyetBanNhap.mutate({
                              id: bn.id,
                              trangThai: TrangThaiBanNhapAI.TU_CHOI,
                            })
                          }
                          className="py-1.5 px-3 rounded-lg border border-input text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-[11px] font-semibold transition-colors"
                        >
                          Từ chối
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal 1: Chi tiết đoạn trích dẫn nguồn */}
      <HopThoai
        mo={!!doanXemChiTiet}
        onDong={() => setDoanXemChiTiet(null)}
        tieuDe={doanXemChiTiet?.tieuDeTaiLieu || 'Trích dẫn tài liệu'}
        moTa={`Độ tương đồng ngữ nghĩa: ${doanXemChiTiet?.doTuongDong}% • Đoạn số ${doanXemChiTiet?.soThuTu}`}
      >
        <div className="space-y-4 text-xs">
          <div className="rounded-xl bg-muted/40 p-4 border border-border leading-relaxed text-foreground max-h-[60vh] overflow-y-auto">
            <DinhDangMarkdown noiDung={doanXemChiTiet?.noiDung || ''} />
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setDoanXemChiTiet(null)}
              className="rounded-xl border border-input px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </HopThoai>

      {/* Modal 2: Tạo bản nháp gợi ý từ AI (Dành cho Giáo viên) */}
      <HopThoai
        mo={moModalBanNhap}
        onDong={() => setMoModalBanNhap(false)}
        tieuDe="Tạo bản nháp gợi ý từ Trợ lý"
        moTa="Soạn thảo gợi ý bài tập hoặc câu hỏi thảo luận (chỉ lưu dạng bản nháp chờ phê duyệt)"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!tieuDeBanNhap.trim() || !idLopBanNhap) return;
            mutationTaoBanNhap.mutate();
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-xs font-semibold text-foreground">Lớp học phần *</label>
            <select
              required
              value={idLopBanNhap}
              onChange={(e) => setIdLopBanNhap(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Chọn lớp học phần</option>
              {danhSachLop.map((lop) => (
                <option key={lop.id} value={lop.id}>
                  {lop.tenLopHocPhan} ({lop.maLopHocPhan})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Loại nội dung gợi ý *</label>
            <select
              value={loaiBanNhap}
              onChange={(e) => setLoaiBanNhap(e.target.value as LoaiBanNhapAI)}
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value={LoaiBanNhapAI.BAI_TAP}>Bài tập về nhà</option>
              <option value={LoaiBanNhapAI.CAU_HOI}>Câu hỏi thảo luận</option>
              <option value={LoaiBanNhapAI.TOM_TAT}>Tóm tắt ôn tập</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Tiêu đề gợi ý *</label>
            <input
              type="text"
              required
              value={tieuDeBanNhap}
              onChange={(e) => setTieuDeBanNhap(e.target.value)}
              placeholder="VD: Bài tập luyện tập cấu trúc rẽ nhánh if-else"
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Nội dung chi tiết *</label>
            <textarea
              required
              rows={4}
              value={noiDungBanNhap}
              onChange={(e) => setNoiDungBanNhap(e.target.value)}
              placeholder="Nội dung bài tập hoặc câu hỏi gợi ý cho học sinh..."
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setMoModalBanNhap(false)}
              className="rounded-xl border border-input px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!tieuDeBanNhap.trim() || !idLopBanNhap || mutationTaoBanNhap.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-all"
            >
              {mutationTaoBanNhap.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu bản nháp'
              )}
            </button>
          </div>
        </form>
      </HopThoai>
    </div>
  );
}
