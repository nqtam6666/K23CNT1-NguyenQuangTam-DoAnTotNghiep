'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Send,
  Plus,
  Trash2,
  BookOpen,
  FileText,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Bot,
  Loader2,
  Layers,
  ArrowRight,
  HelpCircle,
  Eye,
  SlidersHorizontal,
  Activity,
  Clock,
} from 'lucide-react';
import {
  VaiTro,
  LoaiBanNhapAI,
  TrangThaiBanNhapAI,
  MucDoGiaiThich,
  MucDoKho,
  PhienTroLy,
  NguonTrichDan,
  KetQuaHoiDapAI,
  BanNhapAI,
} from '@lms/chung';
import { mayKhachApi } from '@/tien-ich/may-khach-api';
import { thongBao } from '@/tien-ich/thong-bao';
import { HopThoai } from '@/thanh-phan/hop-thoai';
import { AnhDaiDien } from '@/thanh-phan/anh-dai-dien';
import { DinhDangMarkdown } from '@/thanh-phan/dinh-dang-markdown';
import { AnimatedBackground } from '@/components/ui/animated-tabs';

export default function TrangTroLyHocTap() {
  const queryClient = useQueryClient();

  const [idPhienChon, setIdPhienChon] = useState<string | null>(null);
  const [cauHoiNhap, setCauHoiNhap] = useState('');
  const [idLopLoc, setIdLopLoc] = useState<string>('');
  const [mucDoGiaiThich, setMucDoGiaiThich] = useState<MucDoGiaiThich>(
    MucDoGiaiThich.TRUNG_BINH,
  );
  const [doanXemChiTiet, setDoanXemChiTiet] = useState<NguonTrichDan | null>(null);

  // Lưu gợi ý câu hỏi tiếp theo và bài tập luyện tập của lượt hỏi đáp gần nhất
  const [goiYCauHoiTiepTheo, setGoiYCauHoiTiepTheo] = useState<string[]>([]);
  const [goiYBaiTapLuyenTap, setGoiYBaiTapLuyenTap] = useState<string[]>([]);

  // Modal bản nháp AI (Giáo viên - Nhóm 3)
  const [moModalBanNhap, setMoModalBanNhap] = useState(false);
  const [cheDoTaoBanNhap, setCheDoTaoBanNhap] = useState<'TU_TAI_LIEU' | 'THU_CONG'>('TU_TAI_LIEU');
  const [idLopBanNhap, setIdLopBanNhap] = useState('');
  const [idTaiLieuBanNhap, setIdTaiLieuBanNhap] = useState('');
  const [loaiBanNhap, setLoaiBanNhap] = useState<LoaiBanNhapAI>(LoaiBanNhapAI.CAU_HOI);
  const [chuDeBanNhap, setChuDeBanNhap] = useState('');
  const [mucDoKhoBanNhap, setMucDoKhoBanNhap] = useState<MucDoKho>(MucDoKho.TRUNG_BINH);
  const [soLuongCauBanNhap, setSoLuongCauBanNhap] = useState(5);
  const [tieuDeBanNhap, setTieuDeBanNhap] = useState('');
  const [noiDungBanNhap, setNoiDungBanNhap] = useState('');
  const [banNhapXemChiTiet, setBanNhapXemChiTiet] = useState<BanNhapAI | null>(null);
  const [moModalGiamSat, setMoModalGiamSat] = useState(false);

  const cuonCuoiTrangRef = useRef<HTMLDivElement>(null);

  // Điền sẵn câu hỏi khi được chuyển từ ô hỏi nhanh ở Bảng điều khiển (?cauHoi=...)
  useEffect(() => {
    const cauHoiTuUrl = new URLSearchParams(window.location.search).get('cauHoi');
    if (cauHoiTuUrl) setCauHoiNhap(cauHoiTuUrl.slice(0, 2000));
  }, []);

  // 1. Lấy thông tin người dùng hiện tại
  const { data: nguoiDung } = useQuery({
    queryKey: ['ho-so-hien-tai'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/xac-thuc/ho-so-hien-tai');
      return res.data?.duLieu || res.data;
    },
  });

  // 1b. Lấy thống kê lưu lượng, hạn mức lượt hỏi mỗi ngày và chi phí sử dụng AI
  const { data: thongKeSuDung } = useQuery<any>({
    queryKey: ['thong-ke-su-dung-ai'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/tro-ly-ai/thong-ke-su-dung');
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

  // Lấy danh sách tài liệu của lớp đang chọn trong khung chat (hoặc lớp mặc định đầu tiên)
  const idLopHienTai = idLopLoc || danhSachLop[0]?.id || '';
  const { data: danhSachTaiLieuChat = [] } = useQuery<any[]>({
    queryKey: ['tai-lieu-lop-chat', idLopHienTai],
    queryFn: async () => {
      if (!idLopHienTai) return [];
      const res = await mayKhachApi.get(`/tai-lieu/lop/${idLopHienTai}`);
      return res.data?.duLieu || res.data || [];
    },
    enabled: !!idLopHienTai,
  });

  // Lấy danh sách tài liệu của lớp đang chọn trong modal bản nháp
  const { data: danhSachTaiLieuLop = [] } = useQuery<any[]>({
    queryKey: ['tai-lieu-lop-ban-nhap', idLopBanNhap],
    queryFn: async () => {
      if (!idLopBanNhap) return [];
      const res = await mayKhachApi.get(`/tai-lieu/lop/${idLopBanNhap}`);
      return res.data?.duLieu || res.data || [];
    },
    enabled: !!idLopBanNhap && moModalBanNhap,
  });

  // 3. Lấy danh sách phiên hội thoại
  const { data: danhSachPhien = [], isLoading: dangTaiPhien } = useQuery<PhienTroLy[]>({
    queryKey: ['danh-sach-phien-tro-ly'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/tro-ly-ai/phien');
      return res.data?.duLieu || res.data || [];
    },
  });

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

  useEffect(() => {
    cuonCuoiTrangRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chiTietPhien?.cacTinNhan]);

  // 5. Mutation gửi câu hỏi tới Trợ lý AI (kèm mức độ giải thích)
  const mutationHoiDap = useMutation({
    mutationFn: async (cauHoi: string) => {
      const res = await mayKhachApi.post('/tro-ly-ai/hoi-dap', {
        idPhien: idPhienChon || undefined,
        idLopHocPhan: idLopLoc || undefined,
        noiDung: cauHoi.trim(),
        mucDoGiaiThich,
      });
      return (res.data?.duLieu || res.data) as KetQuaHoiDapAI;
    },
    onSuccess: (data: KetQuaHoiDapAI) => {
      setCauHoiNhap('');
      if (!idPhienChon && data.idPhien) {
        setIdPhienChon(data.idPhien);
      }
      if (data.goiYCauHoiTiepTheo) {
        setGoiYCauHoiTiepTheo(data.goiYCauHoiTiepTheo);
      }
      if (data.goiYBaiTapLuyenTap) {
        setGoiYBaiTapLuyenTap(data.goiYBaiTapLuyenTap);
      }
      queryClient.invalidateQueries({ queryKey: ['chi-tiet-phien-tro-ly', data.idPhien] });
      queryClient.invalidateQueries({ queryKey: ['danh-sach-phien-tro-ly'] });
      queryClient.invalidateQueries({ queryKey: ['thong-ke-su-dung-ai'] });
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

  // 8a. Mutation sinh bản nháp tự động từ tài liệu theo chương và độ khó (Nhóm 3)
  const mutationSinhBanNhapTuTaiLieu = useMutation({
    mutationFn: async () => {
      const res = await mayKhachApi.post('/tro-ly-ai/ban-nhap/sinh-tu-tai-lieu', {
        idLopHocPhan: idLopBanNhap,
        idTaiLieu: idTaiLieuBanNhap || undefined,
        loaiBanNhap,
        chuDe: chuDeBanNhap.trim(),
        mucDoKho: mucDoKhoBanNhap,
        soLuongCau: Number(soLuongCauBanNhap),
      });
      return res.data?.duLieu || res.data;
    },
    onSuccess: (banNhapMoi: BanNhapAI) => {
      setMoModalBanNhap(false);
      setChuDeBanNhap('');
      queryClient.invalidateQueries({ queryKey: ['ban-nhap-ai-lop', idLopBanNhap] });
      queryClient.invalidateQueries({ queryKey: ['ban-nhap-ai-lop', idLopMucTieuBanNhap] });
      queryClient.invalidateQueries({ queryKey: ['thong-ke-su-dung-ai'] });
      thongBao.thanhCong(
        'Đã biên soạn bản nháp từ tài liệu',
        'Bản nháp đang ở trạng thái chờ duyệt. Giảng viên vui lòng kiểm tra trước khi áp dụng.',
      );
      if (banNhapMoi?.id) {
        setBanNhapXemChiTiet(banNhapMoi);
      }
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Không thể sinh bản nháp từ tài liệu',
        err.response?.data?.thongDiep || 'Vui lòng kiểm tra lại thông tin.',
      );
    },
  });

  // 8b. Mutation tạo bản nháp thủ công
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
      queryClient.invalidateQueries({ queryKey: ['ban-nhap-ai-lop', idLopMucTieuBanNhap] });
      queryClient.invalidateQueries({ queryKey: ['thong-ke-su-dung-ai'] });
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
      setBanNhapXemChiTiet(null);
      if (bien.trangThai === TrangThaiBanNhapAI.DA_DUYET) {
        thongBao.thanhCong(
          'Đã phê duyệt bản nháp',
          'Nội dung đã được áp dụng chính thức vào lớp học phần (Đề kiểm tra / Bài tập / Kế hoạch bài giảng).',
        );
      } else {
        thongBao.thanhCong('Đã từ chối', 'Bản nháp đã được đánh dấu từ chối.');
      }
      queryClient.invalidateQueries({ queryKey: ['ban-nhap-ai-lop', idLopMucTieuBanNhap] });
      queryClient.invalidateQueries({ queryKey: ['bai-tap-lop'] });
      queryClient.invalidateQueries({ queryKey: ['kiem-tra-lop'] });
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Không thể cập nhật trạng thái bản nháp',
        err.response?.data?.thongDiep || 'Vui lòng thử lại.',
      );
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

  const nhanLoaiBanNhap = (loai: LoaiBanNhapAI) => {
    if (loai === LoaiBanNhapAI.CAU_HOI) return 'Đề kiểm tra / Câu hỏi';
    if (loai === LoaiBanNhapAI.TOM_TAT) return 'Kế hoạch bài giảng';
    if (loai === LoaiBanNhapAI.NHAN_XET) return 'Nhận xét đánh giá';
    return 'Bài tập thực hành';
  };

  const nhanNutDuyet = (loai: LoaiBanNhapAI) => {
    if (loai === LoaiBanNhapAI.CAU_HOI) return 'Duyệt & Tạo đề kiểm tra';
    if (loai === LoaiBanNhapAI.TOM_TAT) return 'Duyệt & Đăng kế hoạch';
    if (loai === LoaiBanNhapAI.NHAN_XET) return 'Duyệt nhận xét';
    return 'Duyệt & Tạo bài tập';
  };

  return (
    <div className="space-y-6">
      {/* Banner tiêu đề phân hệ */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[var(--surface)] rounded-[4px] border border-[var(--border)] p-5">
        <div className="flex items-center gap-3.5">
          <div className="w-[44px] h-[44px] rounded-[4px] bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] shrink-0">
            <Bot className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div>
            <p className="eyebrow mb-0.5">Hỏi đáp học liệu & Biên soạn học thuật</p>
            <h1 className="text-[20px] font-mono font-bold tracking-tight text-[var(--text)]">
              Trợ lý hỗ trợ học tập
            </h1>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Tra cứu giáo trình có trích dẫn nguồn, tùy chỉnh mức độ giải thích và gợi ý luyện tập
            </p>
          </div>
        </div>

        {/* Thanh hạn mức sử dụng hôm nay & Nút tác vụ */}
        <div className="flex flex-wrap items-center gap-2.5">
          {thongKeSuDung && (
            <div className="inline-flex items-center gap-2 rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs text-[var(--text)]">
              <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Hạn mức hôm nay:</span>
              <span className="font-mono font-semibold text-[var(--accent)]">
                {thongKeSuDung.soLuotCaNhanHomNay ?? 0}/{thongKeSuDung.gioiHanCaNhanNgay ?? 30} lượt
              </span>
            </div>
          )}

          {(laGiaoVien || laQuanTri) && (
            <button
              type="button"
              onClick={() => setMoModalGiamSat(true)}
              className="inline-flex items-center gap-1.5 rounded border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2 text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-[var(--accent)]" />
              Lưu lượng & Chi phí
            </button>
          )}

          {(laGiaoVien || laQuanTri) && (
            <button
              onClick={() => {
                setIdLopBanNhap(idLopLoc || danhSachLop[0]?.id || '');
                setMoModalBanNhap(true);
              }}
              className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              Biên soạn câu hỏi / Giáo án từ tài liệu
            </button>
          )}
        </div>
      </div>

      {/* Bố cục chính 2 cột: Sidebar phiên trò chuyện & Khung chat */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Cột 1: Danh sách phiên hội thoại */}
        <div className="lg:col-span-1 bg-card rounded border border-border/80 p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
              Lịch sử trò chuyện
            </h2>
            <button
              onClick={() => {
                setIdPhienChon(null);
                setCauHoiNhap('');
                setGoiYCauHoiTiepTheo([]);
                setGoiYBaiTapLuyenTap([]);
              }}
              title="Tạo cuộc hội thoại mới"
              className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Mới
            </button>
          </div>

          <div className="space-y-1.5 max-h-[620px] overflow-y-auto pr-1">
            {dangTaiPhien ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 rounded bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : danhSachPhien.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                Chưa có phiên trò chuyện nào. Hãy gửi câu hỏi đầu tiên.
              </div>
            ) : (
              <AnimatedBackground
                defaultValue={idPhienChon || ''}
                className="rounded-[var(--radius)] bg-[var(--accent-soft)] border-l-[3px] border-l-[var(--accent)]"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.25 }}
              >
                {danhSachPhien.map((phien) => {
                  const laChon = phien.id === idPhienChon;
                  return (
                    <div
                      key={phien.id}
                      data-id={phien.id}
                      onClick={() => setIdPhienChon(phien.id)}
                      className={`group relative w-full flex items-center justify-between p-3 rounded-[var(--radius)] cursor-pointer text-xs transition-colors ${
                        laChon
                          ? 'text-[var(--accent)] font-semibold'
                          : 'text-foreground hover:bg-muted/50 border border-transparent hover:border-border/60'
                      }`}
                    >
                      <div className="truncate pr-6">
                        <p className="truncate">{phien.tieuDe}</p>
                        <p
                          className={`text-[10px] mt-0.5 ${
                            laChon ? 'text-[var(--muted)]' : 'text-muted-foreground'
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
                        className={`p-1 rounded-[var(--radius)] opacity-0 group-hover:opacity-100 transition-opacity ${
                          laChon
                            ? 'hover:bg-[var(--danger-soft)] text-[var(--danger)]'
                            : 'hover:bg-destructive/10 text-muted-foreground hover:text-destructive'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </AnimatedBackground>
            )}
          </div>
        </div>

        {/* Cột 2: Khung làm việc và hội thoại */}
        <div className="lg:col-span-3 bg-card rounded border border-border/80 shadow-sm flex flex-col h-[720px]">
          {/* Header khu vực chat: Chọn lớp học phần & Chọn mức độ giải thích */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border/80">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <div>
                <h2 className="text-sm font-mono font-bold text-foreground">
                  {chiTietPhien?.tieuDe || 'Hội thoại mới'}
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Chỉ trả lời dựa trên căn cứ tài liệu môn học (Từ chối suy đoán ngoài giáo trình)
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Chọn mức độ giải thích (Nhóm 2) */}
              <div className="flex items-center gap-1.5 bg-muted/50 border border-border px-2 py-1 rounded">
                <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground hidden sm:inline">
                  Giải thích:
                </span>
                {(
                  [
                    { ma: MucDoGiaiThich.CO_BAN, nhan: 'Cơ bản' },
                    { ma: MucDoGiaiThich.TRUNG_BINH, nhan: 'Trung bình' },
                    { ma: MucDoGiaiThich.NANG_CAO, nhan: 'Nâng cao' },
                  ] as const
                ).map((muc) => (
                  <button
                    key={muc.ma}
                    type="button"
                    onClick={() => setMucDoGiaiThich(muc.ma)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      mucDoGiaiThich === muc.ma
                        ? 'bg-accent text-white'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {muc.nhan}
                  </button>
                ))}
              </div>

              {/* Bộ lọc phạm vi lớp học phần */}
              <select
                value={idLopLoc}
                onChange={(e) => setIdLopLoc(e.target.value)}
                className="rounded border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
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

          {/* Thanh tài liệu học tập sẵn có của lớp — bấm 1 chạm để hỏi hoặc sinh đề */}
          {danhSachTaiLieuChat.length > 0 && (
            <div className="px-4 py-2.5 border-b border-border/70 bg-muted/20 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-semibold text-muted-foreground flex items-center gap-1 shrink-0">
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                Tài liệu sẵn có ({danhSachTaiLieuChat.length}):
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {danhSachTaiLieuChat.slice(0, 4).map((tl: any) => (
                  <button
                    key={tl.id}
                    type="button"
                    disabled={mutationHoiDap.isPending}
                    onClick={() => {
                      const cau = `Tóm tắt nội dung chính của tài liệu "${tl.tieuDe}" và nêu các ý trọng tâm cần nhớ`;
                      setCauHoiNhap(cau);
                      mutationHoiDap.mutate(cau);
                    }}
                    title="Nhấn để Trợ lý tóm tắt tài liệu này"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-border bg-background hover:border-accent text-[11px] text-foreground transition-colors cursor-pointer"
                  >
                    <FileText className="w-3 h-3 text-accent shrink-0" />
                    <span className="max-w-[200px] truncate">{tl.tieuDe}</span>
                  </button>
                ))}
                {(laGiaoVien || laQuanTri) && (
                  <button
                    type="button"
                    onClick={() => {
                      const tlDau = danhSachTaiLieuChat[0];
                      setIdLopBanNhap(idLopHienTai);
                      setIdTaiLieuBanNhap(tlDau?.id || '');
                      setChuDeBanNhap(tlDau?.tieuDe || 'Kiến thức trọng tâm học phần');
                      setCheDoTaoBanNhap('TU_TAI_LIEU');
                      setMoModalBanNhap(true);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-accent-soft text-accent border border-accent text-[11px] font-semibold hover:bg-accent hover:text-white transition-colors cursor-pointer"
                  >
                    <Bot className="w-3 h-3" />
                    Sinh đề nhanh từ tài liệu
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Dòng tin nhắn */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {dangTaiTinNhan ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : !chiTietPhien || chiTietPhien.cacTinNhan?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-4">
                <div className="w-14 h-14 rounded bg-primary/10 flex items-center justify-center text-primary">
                  <Bot className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-mono font-bold text-foreground">
                    Bạn cần hỗ trợ nội dung nào hôm nay?
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Chọn mức độ giải thích <strong>Cơ bản</strong>, <strong>Trung bình</strong> hoặc{' '}
                    <strong>Nâng cao</strong> để Trợ lý trình bày kiến thức phù hợp với nhu cầu ôn tập.
                  </p>
                </div>

                {/* Prompt chips gợi ý */}
                <div className="w-full space-y-2 pt-2">
                  <p className="text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-wider text-left">
                    Gợi ý câu hỏi phổ biến:
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    <AnimatedBackground
                      enableHover
                      className="rounded-[var(--radius)] bg-[var(--active-bg)]"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.25 }}
                    >
                      {goiYCauHoi.map((cau, idx) => (
                        <button
                          key={idx}
                          data-id={String(idx)}
                          type="button"
                          onClick={() => {
                            setCauHoiNhap(cau);
                            mutationHoiDap.mutate(cau);
                          }}
                          className="w-full text-left p-2.5 rounded-[var(--radius)] border border-border/80 bg-background hover:border-[var(--accent)] text-xs text-foreground/90 transition-colors flex items-center justify-between group cursor-pointer"
                        >
                          <span className="truncate">{cau}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0 ml-2" />
                        </button>
                      ))}
                    </AnimatedBackground>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {chiTietPhien.cacTinNhan?.map((tin) => {
                  const laNguoiDung = tin.vaiTro === 'user';
                  return (
                    <div
                      key={tin.id}
                      className={`flex gap-3.5 ${laNguoiDung ? 'justify-end' : 'justify-start'}`}
                    >
                      {!laNguoiDung && (
                        <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] sm:max-w-[78%] rounded p-4 text-xs leading-relaxed space-y-3 ${
                          laNguoiDung
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'bg-bg text-text border border-border'
                        }`}
                      >
                        <DinhDangMarkdown
                          noiDung={tin.noiDung}
                          laNguoiDung={laNguoiDung}
                        />

                        {/* Trích dẫn nguồn tài liệu RAG */}
                        {!laNguoiDung && tin.trichDan && tin.trichDan.length > 0 && (
                          <div className="pt-3 border-t border-border/60 space-y-2">
                            <p className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-primary" />
                              Tài liệu nguồn trích dẫn ({tin.trichDan.length}):
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {tin.trichDan.map((tc, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => setDoanXemChiTiet(tc)}
                                  className="p-2 rounded bg-background border border-border/70 hover:border-primary/50 cursor-pointer transition-colors flex items-center justify-between gap-2 group"
                                >
                                  <div className="truncate">
                                    <p className="font-semibold text-foreground truncate text-[11px] group-hover:text-primary transition-colors">
                                      {tc.tieuDeTaiLieu}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                                      Đoạn {tc.soThuTu} • {tc.doTuongDong}% tương đồng
                                    </p>
                                  </div>
                                  <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tác vụ nhanh dưới câu trả lời cho Giảng viên: Lưu thành Bản nháp lớp học */}
                        {!laNguoiDung && (laGiaoVien || laQuanTri) && (
                          <div className="pt-2 border-t border-border/50 flex flex-wrap items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const tieuDeNguon =
                                  tin.trichDan?.[0]?.tieuDeTaiLieu ||
                                  chiTietPhien?.tieuDe ||
                                  'Tài liệu tổng hợp từ Trợ lý';
                                setIdLopBanNhap(idLopHienTai);
                                setCheDoTaoBanNhap('THU_CONG');
                                setLoaiBanNhap(LoaiBanNhapAI.TOM_TAT);
                                setTieuDeBanNhap(`Tóm tắt & Hướng dẫn: ${tieuDeNguon}`);
                                setNoiDungBanNhap(tin.noiDung);
                                setMoModalBanNhap(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-border bg-background hover:border-accent text-[11px] font-semibold text-foreground transition-colors cursor-pointer"
                            >
                              <Layers className="w-3 h-3 text-accent" />
                              Lưu câu trả lời làm Bản nháp
                            </button>
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
                })}

                {/* Khu vực Gợi ý câu hỏi tiếp theo & Bài tập luyện tập sau mỗi câu trả lời (Nhóm 2) */}
                {!mutationHoiDap.isPending &&
                  (goiYCauHoiTiepTheo.length > 0 || goiYBaiTapLuyenTap.length > 0) && (
                    <div className="pl-11 space-y-3 pt-1">
                      {goiYCauHoiTiepTheo.length > 0 && (
                        <div className="rounded border border-border bg-bg p-3.5 space-y-2">
                          <p className="text-[11px] font-mono font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-accent" />
                            Gợi ý câu hỏi đào sâu tiếp theo:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {goiYCauHoiTiepTheo.map((cauGoiY, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => mutationHoiDap.mutate(cauGoiY)}
                                className="text-left text-xs px-3 py-1.5 rounded border border-border bg-surface hover:border-accent text-text transition-colors cursor-pointer"
                              >
                                {cauGoiY}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {goiYBaiTapLuyenTap.length > 0 && (
                        <div className="rounded border border-accent bg-accent-soft p-3.5 space-y-2">
                          <p className="text-[11px] font-mono font-semibold text-accent uppercase tracking-wider flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" />
                            Bài tập tự luyện tập củng cố kiến thức:
                          </p>
                          <div className="space-y-1.5">
                            {goiYBaiTapLuyenTap.map((btGoiY, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => mutationHoiDap.mutate(btGoiY)}
                                className="w-full text-left text-xs px-3 py-2 rounded border border-border bg-surface hover:border-accent text-text flex items-center justify-between gap-2 transition-colors cursor-pointer"
                              >
                                <span>{btGoiY}</span>
                                <span className="text-[11px] font-semibold text-accent shrink-0">
                                  Luyện tập ngay →
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
              </>
            )}

            {/* Trạng thái AI đang truy hồi và sinh câu trả lời */}
            {mutationHoiDap.isPending && (
              <div className="flex gap-3.5 justify-start">
                <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="rounded p-4 bg-bg border border-border text-xs text-muted flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  Đang tra cứu tài liệu học tập và tổng hợp câu trả lời...
                </div>
              </div>
            )}

            <div ref={cuonCuoiTrangRef} />
          </div>

          {/* Ô nhập tin nhắn + thanh gợi ý nhanh */}
          <div className="p-3.5 border-t border-border/80 bg-card space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-mono text-muted-foreground mr-1">Hỏi nhanh:</span>
              {[
                'Tóm tắt nội dung chính của tài liệu học tập',
                'Giải thích các khái niệm trọng tâm trong bài giảng',
                'Hướng dẫn làm bài tập thực hành tuần này',
              ].map((mauCau, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={mutationHoiDap.isPending}
                  onClick={() => {
                    setCauHoiNhap(mauCau);
                    mutationHoiDap.mutate(mauCau);
                  }}
                  className="px-2 py-0.5 rounded border border-border bg-background hover:border-accent text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {mauCau}
                </button>
              ))}
            </div>
            <form onSubmit={xuLyGuiTinNhan} className="flex items-center gap-2">
              <input
                type="text"
                value={cauHoiNhap}
                onChange={(e) => setCauHoiNhap(e.target.value)}
                placeholder="Đặt câu hỏi về nội dung bài giảng, công thức hoặc bài tập (Nhấn Enter để gửi)..."
                className="flex-1 rounded border border-input bg-background px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                disabled={!cauHoiNhap.trim() || mutationHoiDap.isPending}
                className="inline-flex items-center justify-center w-10 h-10 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 cursor-pointer"
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

      {/* Bảng quản lý bản nháp AI (Dành cho Giáo viên & Quản trị viên - Nhóm 3) */}
      {(laGiaoVien || laQuanTri) && (
        <div className="bg-card rounded border border-border/80 p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              <div>
                <h2 className="text-sm font-mono font-bold text-foreground">
                  Danh sách bản nháp câu hỏi, giáo án & nhận xét chờ giảng viên phê duyệt
                </h2>
                <p className="text-xs text-muted-foreground">
                  Mọi nội dung do Trợ lý biên soạn đều lưu ở trạng thái chờ duyệt và chỉ áp dụng sau khi giảng viên xác nhận
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-primary/10 text-primary">
              {danhSachBanNhap.length} bản nháp
            </span>
          </div>

          {danhSachBanNhap.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted bg-bg rounded border border-dashed border-border">
              Chưa có bản nháp nào được tạo cho lớp học này. Nhấn &quot;Biên soạn câu hỏi / Giáo án từ tài liệu&quot; để tạo mới.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {danhSachBanNhap.map((bn) => {
                const laDaDuyet = bn.trangThai === TrangThaiBanNhapAI.DA_DUYET;
                const laTuChoi = bn.trangThai === TrangThaiBanNhapAI.TU_CHOI;
                const duLieu = (bn.duLieuJson || {}) as any;

                return (
                  <div
                    key={bn.id}
                    className="p-4 rounded border border-border bg-surface space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-active-bg text-text border border-border uppercase">
                          {nhanLoaiBanNhap(bn.loaiBanNhap)}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            laDaDuyet
                              ? 'bg-accent-soft text-accent'
                              : laTuChoi
                                ? 'bg-danger-soft text-danger'
                                : 'bg-info-soft text-info'
                          }`}
                        >
                          {laDaDuyet ? 'Đã duyệt' : laTuChoi ? 'Đã từ chối' : 'Chờ duyệt'}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-text line-clamp-1">{bn.tieuDe}</h3>
                      {duLieu?.mucDoKho && (
                        <p className="text-[10px] font-mono text-accent">
                          Độ khó: {duLieu.mucDoKho}
                          {Array.isArray(duLieu.danhSachCauHoi)
                            ? ` • ${duLieu.danhSachCauHoi.length} câu hỏi`
                            : ''}
                        </p>
                      )}
                      <p className="text-[11px] text-muted line-clamp-2">
                        {duLieu?.noiDung || duLieu?.nhanXetChiTiet || duLieu?.moTa || ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <button
                        type="button"
                        onClick={() => setBanNhapXemChiTiet(bn)}
                        className="py-1.5 px-2.5 rounded border border-border text-text hover:bg-bg text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        Chi tiết
                      </button>

                      {!laDaDuyet && !laTuChoi && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              mutationDuyetBanNhap.mutate({
                                id: bn.id,
                                trangThai: TrangThaiBanNhapAI.DA_DUYET,
                              })
                            }
                            className="flex-1 py-1.5 px-3 rounded bg-accent hover:bg-accent text-white text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            {nhanNutDuyet(bn.loaiBanNhap)}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              mutationDuyetBanNhap.mutate({
                                id: bn.id,
                                trangThai: TrangThaiBanNhapAI.TU_CHOI,
                              })
                            }
                            className="py-1.5 px-2.5 rounded border border-input text-muted-foreground hover:text-danger hover:bg-danger-soft text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                    </div>
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
          <div className="rounded bg-bg p-4 border border-border leading-relaxed text-text max-h-[60vh] overflow-y-auto">
            <DinhDangMarkdown noiDung={doanXemChiTiet?.noiDung || ''} />
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setDoanXemChiTiet(null)}
              className="rounded border border-border px-4 py-2 text-xs font-semibold text-text hover:bg-active-bg transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </HopThoai>

      {/* Modal 2: Biên soạn bản nháp từ Tài liệu môn học hoặc Thủ công (Nhóm 3) */}
      <HopThoai
        mo={moModalBanNhap}
        onDong={() => setMoModalBanNhap(false)}
        tieuDe="Biên soạn học thuật cho Giảng viên"
        moTa="Sinh câu hỏi kiểm tra theo chương & độ khó, gợi ý giáo án bài giảng hoặc tạo bài tập (lưu bản nháp chờ phê duyệt)"
        kichThuoc="lon"
      >
        <div className="space-y-4">
          {/* Chuyển chế độ */}
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <button
              type="button"
              onClick={() => setCheDoTaoBanNhap('TU_TAI_LIEU')}
              className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer ${
                cheDoTaoBanNhap === 'TU_TAI_LIEU'
                  ? 'bg-accent text-white'
                  : 'bg-bg text-muted hover:text-text border border-border'
              }`}
            >
              Sinh tự động từ tài liệu môn học
            </button>
            <button
              type="button"
              onClick={() => setCheDoTaoBanNhap('THU_CONG')}
              className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer ${
                cheDoTaoBanNhap === 'THU_CONG'
                  ? 'bg-accent text-white'
                  : 'bg-bg text-muted hover:text-text border border-border'
              }`}
            >
              Soạn thảo bản nháp thủ công
            </button>
          </div>

          {cheDoTaoBanNhap === 'TU_TAI_LIEU' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!chuDeBanNhap.trim() || !idLopBanNhap) return;
                mutationSinhBanNhapTuTaiLieu.mutate();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">Lớp học phần *</label>
                  <select
                    required
                    value={idLopBanNhap}
                    onChange={(e) => {
                      setIdLopBanNhap(e.target.value);
                      setIdTaiLieuBanNhap('');
                    }}
                    className="mt-1.5 w-full rounded border border-input bg-background px-3 py-2 text-xs focus:border-primary focus:outline-none"
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
                  <label className="text-xs font-semibold text-foreground">
                    Tài liệu / Giáo trình nguồn (tùy chọn)
                  </label>
                  <select
                    value={idTaiLieuBanNhap}
                    onChange={(e) => {
                      const val = e.target.value;
                      setIdTaiLieuBanNhap(val);
                      if (val) {
                        const tlChon = danhSachTaiLieuLop.find((t: any) => t.id === val);
                        if (tlChon?.tieuDe && !chuDeBanNhap.trim()) {
                          setChuDeBanNhap(tlChon.tieuDe);
                        }
                      }
                    }}
                    className="mt-1.5 w-full rounded border border-input bg-background px-3 py-2 text-xs focus:border-primary focus:outline-none"
                  >
                    <option value="">Tất cả tài liệu của lớp học phần</option>
                    {danhSachTaiLieuLop.map((tl: any) => (
                      <option key={tl.id} value={tl.id}>
                        {tl.tieuDe}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">
                    Loại nội dung cần biên soạn *
                  </label>
                  <select
                    value={loaiBanNhap}
                    onChange={(e) => setLoaiBanNhap(e.target.value as LoaiBanNhapAI)}
                    className="mt-1.5 w-full rounded border border-input bg-background px-3 py-2 text-xs focus:border-primary focus:outline-none"
                  >
                    <option value={LoaiBanNhapAI.CAU_HOI}>Bộ câu hỏi / Đề kiểm tra</option>
                    <option value={LoaiBanNhapAI.TOM_TAT}>Giáo án / Kế hoạch bài giảng</option>
                    <option value={LoaiBanNhapAI.BAI_TAP}>Bài tập thực hành về nhà</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">Mức độ khó *</label>
                  <select
                    value={mucDoKhoBanNhap}
                    onChange={(e) => setMucDoKhoBanNhap(e.target.value as MucDoKho)}
                    className="mt-1.5 w-full rounded border border-input bg-background px-3 py-2 text-xs focus:border-primary focus:outline-none"
                  >
                    <option value={MucDoKho.DE}>Dễ (Nhận biết & Thông hiểu)</option>
                    <option value={MucDoKho.TRUNG_BINH}>Trung bình (Vận dụng)</option>
                    <option value={MucDoKho.KHO}>Khó (Vận dụng cao & Phân tích)</option>
                  </select>
                </div>

                {loaiBanNhap === LoaiBanNhapAI.CAU_HOI && (
                  <div>
                    <label className="text-xs font-semibold text-foreground">
                      Số lượng câu hỏi (3 - 20)
                    </label>
                    <input
                      type="number"
                      min={3}
                      max={20}
                      value={soLuongCauBanNhap}
                      onChange={(e) => setSoLuongCauBanNhap(Number(e.target.value))}
                      className="mt-1.5 w-full rounded border border-input bg-background px-3 py-2 text-xs focus:border-primary focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Chương / Chủ đề kiến thức trọng tâm *
                </label>
                <input
                  type="text"
                  required
                  value={chuDeBanNhap}
                  onChange={(e) => setChuDeBanNhap(e.target.value)}
                  placeholder="VD: Chương 1 - Tổng quan kiến thức hoặc chọn nhanh bên dưới..."
                  className="w-full rounded border border-input bg-background px-3.5 py-2 text-xs focus:border-primary focus:outline-none"
                />

                {/* Chọn nhanh chủ đề từ tài liệu của lớp hoặc mẫu học thuật */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-mono text-muted-foreground">Chọn nhanh:</span>
                  {danhSachTaiLieuLop.slice(0, 3).map((tl: any) => (
                    <button
                      key={tl.id}
                      type="button"
                      onClick={() => {
                        setIdTaiLieuBanNhap(tl.id);
                        setChuDeBanNhap(tl.tieuDe);
                      }}
                      className="px-2 py-0.5 rounded border border-accent bg-accent-soft text-accent text-[11px] font-medium hover:bg-accent hover:text-white transition-colors cursor-pointer"
                    >
                      {tl.tieuDe}
                    </button>
                  ))}
                  {[
                    'Ôn tập tổng hợp kiến thức trọng tâm',
                    'Kiểm tra đánh giá định kỳ',
                    'Bài tập thực hành vận dụng',
                  ].map((cdMau, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setChuDeBanNhap(cdMau)}
                      className="px-2 py-0.5 rounded border border-border bg-bg hover:border-accent text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      {cdMau}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setMoModalBanNhap(false)}
                  className="rounded border border-input px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={
                    !chuDeBanNhap.trim() ||
                    !idLopBanNhap ||
                    mutationSinhBanNhapTuTaiLieu.isPending
                  }
                  className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                >
                  {mutationSinhBanNhapTuTaiLieu.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Đang biên soạn bản nháp...
                    </>
                  ) : (
                    <>
                      <Bot className="w-3.5 h-3.5" />
                      Sinh bản nháp chờ duyệt
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!tieuDeBanNhap.trim() || !idLopBanNhap) return;
                mutationTaoBanNhap.mutate();
              }}
              className="space-y-4"
            >
              {/* Điền mẫu nhanh 1 chạm */}
              <div className="flex flex-wrap items-center gap-1.5 bg-bg p-2.5 rounded border border-border">
                <span className="text-[11px] font-mono text-muted-foreground mr-1">
                  Điền mẫu nhanh:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setLoaiBanNhap(LoaiBanNhapAI.BAI_TAP);
                    setTieuDeBanNhap('Bài tập thực hành ôn tập kiến thức tuần này');
                    setNoiDungBanNhap(
                      '1. Tóm tắt các khái niệm trọng tâm đã học trong bài giảng.\n2. Viết chương trình / giải bài toán minh họa cho cấu trúc vừa học kèm giải thích từng bước.\n3. Nộp bài trước hạn quy định trên hệ thống.',
                    );
                  }}
                  className="px-2 py-1 rounded border border-border bg-surface hover:border-accent text-[11px] font-medium text-foreground transition-colors cursor-pointer"
                >
                  Mẫu Bài tập về nhà
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoaiBanNhap(LoaiBanNhapAI.CAU_HOI);
                    setTieuDeBanNhap('Câu hỏi ôn tập củng cố bài học');
                    setNoiDungBanNhap(
                      'Câu 1: Trình bày khái niệm và ưu nhược điểm của phương pháp trong bài học.\nCâu 2: Phân tích độ phức tạp và cho ví dụ minh họa thực tế.',
                    );
                  }}
                  className="px-2 py-1 rounded border border-border bg-surface hover:border-accent text-[11px] font-medium text-foreground transition-colors cursor-pointer"
                >
                  Mẫu Câu hỏi ôn tập
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoaiBanNhap(LoaiBanNhapAI.TOM_TAT);
                    setTieuDeBanNhap('Đề cương tóm tắt & Kế hoạch bài giảng');
                    setNoiDungBanNhap(
                      '- Mục tiêu bài học: Nắm vững lý thuyết cốt lõi và vận dụng vào bài tập.\n- Nội dung trọng tâm: Lý thuyết nền tảng, ví dụ mẫu và bài tập thực hành.\n- Yêu cầu chuẩn bị: Đọc trước tài liệu học tập trên lớp.',
                    );
                  }}
                  className="px-2 py-1 rounded border border-border bg-surface hover:border-accent text-[11px] font-medium text-foreground transition-colors cursor-pointer"
                >
                  Mẫu Giáo án tóm tắt
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Lớp học phần *</label>
                <select
                  required
                  value={idLopBanNhap}
                  onChange={(e) => setIdLopBanNhap(e.target.value)}
                  className="mt-1.5 w-full rounded border border-input bg-background px-3.5 py-2 text-xs focus:border-primary focus:outline-none"
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
                <label className="text-xs font-semibold text-foreground">Loại nội dung *</label>
                <select
                  value={loaiBanNhap}
                  onChange={(e) => setLoaiBanNhap(e.target.value as LoaiBanNhapAI)}
                  className="mt-1.5 w-full rounded border border-input bg-background px-3.5 py-2 text-xs focus:border-primary focus:outline-none"
                >
                  <option value={LoaiBanNhapAI.BAI_TAP}>Bài tập về nhà</option>
                  <option value={LoaiBanNhapAI.CAU_HOI}>Câu hỏi kiểm tra</option>
                  <option value={LoaiBanNhapAI.TOM_TAT}>Giáo án / Tóm tắt ôn tập</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Tiêu đề *</label>
                <input
                  type="text"
                  required
                  value={tieuDeBanNhap}
                  onChange={(e) => setTieuDeBanNhap(e.target.value)}
                  placeholder="VD: Bài tập luyện tập cấu trúc rẽ nhánh"
                  className="mt-1.5 w-full rounded border border-input bg-background px-3.5 py-2 text-xs focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Nội dung chi tiết *</label>
                <textarea
                  required
                  rows={4}
                  value={noiDungBanNhap}
                  onChange={(e) => setNoiDungBanNhap(e.target.value)}
                  placeholder="Nội dung bài tập, câu hỏi hoặc kế hoạch bài giảng..."
                  className="mt-1.5 w-full rounded border border-input bg-background px-3.5 py-2 text-xs focus:border-primary focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setMoModalBanNhap(false)}
                  className="rounded border border-input px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!tieuDeBanNhap.trim() || !idLopBanNhap || mutationTaoBanNhap.isPending}
                  className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                >
                  {mutationTaoBanNhap.isPending ? 'Đang lưu...' : 'Lưu bản nháp'}
                </button>
              </div>
            </form>
          )}
        </div>
      </HopThoai>

      {/* Modal 3: Xem chi tiết & Kiểm duyệt bản nháp AI (Giảng viên) */}
      <HopThoai
        mo={!!banNhapXemChiTiet}
        onDong={() => setBanNhapXemChiTiet(null)}
        tieuDe={banNhapXemChiTiet?.tieuDe || 'Chi tiết bản nháp'}
        moTa={
          banNhapXemChiTiet
            ? `Loại: ${nhanLoaiBanNhap(banNhapXemChiTiet.loaiBanNhap)} • Trạng thái: ${
                banNhapXemChiTiet.trangThai === TrangThaiBanNhapAI.DA_DUYET
                  ? 'Đã phê duyệt'
                  : banNhapXemChiTiet.trangThai === TrangThaiBanNhapAI.TU_CHOI
                    ? 'Đã từ chối'
                    : 'Chờ giảng viên phê duyệt'
              }`
            : ''
        }
        kichThuoc="lon"
      >
        {banNhapXemChiTiet && (
          <div className="space-y-4 text-xs">
            {/* Nội dung văn bản / Kế hoạch bài giảng / Bài tập */}
            {Boolean((banNhapXemChiTiet.duLieuJson as any)?.noiDung) && (
              <div className="rounded bg-bg border border-border p-4 leading-relaxed max-h-[50vh] overflow-y-auto">
                <DinhDangMarkdown
                  noiDung={String((banNhapXemChiTiet.duLieuJson as any)?.noiDung || '')}
                />
              </div>
            )}

            {/* Danh sách câu hỏi trắc nghiệm nếu là bản nháp CAU_HOI */}
            {Array.isArray((banNhapXemChiTiet.duLieuJson as any)?.danhSachCauHoi) && (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {((banNhapXemChiTiet.duLieuJson as any).danhSachCauHoi as any[]).map(
                  (ch, idx) => (
                    <div
                      key={idx}
                      className="rounded border border-border bg-bg p-3.5 space-y-2"
                    >
                      <p className="font-bold text-text">
                        Câu {idx + 1}: {ch.noiDung}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(ch.cacPhuongAn || []).map((pa: any) => (
                          <div
                            key={pa.ma}
                            className={`p-2 rounded border ${
                              pa.ma === ch.dapAnDung
                                ? 'border-accent bg-accent-soft text-accent font-semibold'
                                : 'border-border bg-surface text-text'
                            }`}
                          >
                            <span className="font-mono font-bold mr-1.5">{pa.ma}.</span>
                            {pa.noiDung}
                          </div>
                        ))}
                      </div>
                      {ch.giaiThich && (
                        <p className="text-[11px] text-muted pt-1">
                          <strong>Giải thích:</strong> {ch.giaiThich}
                        </p>
                      )}
                    </div>
                  ),
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setBanNhapXemChiTiet(null)}
                className="rounded border border-border px-4 py-2 text-xs font-semibold text-text hover:bg-bg cursor-pointer"
              >
                Đóng
              </button>
              {banNhapXemChiTiet.trangThai === TrangThaiBanNhapAI.CHO_DUYET && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      mutationDuyetBanNhap.mutate({
                        id: banNhapXemChiTiet.id,
                        trangThai: TrangThaiBanNhapAI.TU_CHOI,
                      })
                    }
                    className="rounded border border-danger text-danger hover:bg-danger-soft px-4 py-2 text-xs font-semibold cursor-pointer"
                  >
                    Từ chối bản nháp
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      mutationDuyetBanNhap.mutate({
                        id: banNhapXemChiTiet.id,
                        trangThai: TrangThaiBanNhapAI.DA_DUYET,
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded bg-accent text-white px-4 py-2 text-xs font-semibold cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {nhanNutDuyet(banNhapXemChiTiet.loaiBanNhap)}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </HopThoai>

      {/* Modal 4: Giám sát lưu lượng, Token & Chi phí vận hành Trợ lý AI (Nhóm 6) */}
      <HopThoai
        mo={moModalGiamSat}
        onDong={() => setMoModalGiamSat(false)}
        tieuDe="Giám sát lưu lượng, hạn mức & chi phí vận hành"
        moTa="Thống kê số lượt truy vấn, sản lượng token xử lý và chi phí ước tính theo thời gian thực"
        kichThuoc="lon"
      >
        <div className="space-y-5 text-xs">
          {/* 4 thẻ chỉ số KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded border border-[var(--border)] bg-[var(--bg)] p-3.5">
              <p className="eyebrow">Lượt gọi hôm nay</p>
              <p className="text-xl font-mono font-bold text-[var(--accent)] mt-1">
                {(thongKeSuDung?.tongLuotHomNay ?? 0).toLocaleString('vi-VN')}
              </p>
              <p className="text-[11px] text-[var(--muted)] mt-1">
                7 ngày: {(thongKeSuDung?.tongLuot7Ngay ?? 0).toLocaleString('vi-VN')} • Tổng:{' '}
                {(thongKeSuDung?.tongLuotToanThoiGian ?? 0).toLocaleString('vi-VN')}
              </p>
            </div>

            <div className="rounded border border-[var(--border)] bg-[var(--bg)] p-3.5">
              <p className="eyebrow">Tổng Token xử lý</p>
              <p className="text-xl font-mono font-bold text-[var(--text)] mt-1">
                {(thongKeSuDung?.tongTokenToanThoiGian ?? 0).toLocaleString('vi-VN')}
              </p>
              <p className="text-[11px] text-[var(--muted)] mt-1">
                Hôm nay: {(thongKeSuDung?.tongTokenHomNay ?? 0).toLocaleString('vi-VN')} token
              </p>
            </div>

            <div className="rounded border border-[var(--border)] bg-[var(--bg)] p-3.5">
              <p className="eyebrow">Chi phí ước tính</p>
              <p className="text-xl font-mono font-bold text-[var(--accent)] mt-1">
                {(thongKeSuDung?.chiPhiToanThoiGianVnd ?? 0).toLocaleString('vi-VN')} ₫
              </p>
              <p className="text-[11px] text-[var(--muted)] mt-1">
                Hôm nay: {(thongKeSuDung?.chiPhiHomNayVnd ?? 0).toLocaleString('vi-VN')} ₫ (~12 ₫/1K token)
              </p>
            </div>

            <div className="rounded border border-[var(--border)] bg-[var(--bg)] p-3.5">
              <p className="eyebrow">Độ trễ TB / Hạn mức</p>
              <p className="text-xl font-mono font-bold text-[var(--text)] mt-1">
                {thongKeSuDung?.doTreTrungBinhMs ?? 0} ms
              </p>
              <p className="text-[11px] text-[var(--muted)] mt-1">
                GV: {thongKeSuDung?.gioiHanGiaoVien ?? 100} • SV: {thongKeSuDung?.gioiHanHocSinh ?? 30} lượt/ngày
              </p>
            </div>
          </div>

          {/* Phân bổ theo loại tác vụ */}
          {Array.isArray(thongKeSuDung?.phanBoTheoTacVu) &&
            thongKeSuDung.phanBoTheoTacVu.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-[var(--text)]">
                  Phân bổ lưu lượng theo nhóm tác vụ
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {thongKeSuDung.phanBoTheoTacVu.map((item: any) => (
                    <div
                      key={item.loaiTacVu}
                      className="flex items-center justify-between rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5"
                    >
                      <div>
                        <p className="font-mono font-semibold text-[var(--text)] text-[11px]">
                          {item.loaiTacVu}
                        </p>
                        <p className="text-[11px] text-[var(--muted)]">
                          {(item.tongToken ?? 0).toLocaleString('vi-VN')} token
                        </p>
                      </div>
                      <span className="font-mono font-bold text-sm text-[var(--accent)]">
                        {item.soLuot} lượt
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Bảng nhật ký sử dụng gần đây */}
          <div className="space-y-2">
            <h4 className="font-semibold text-[var(--text)]">
              Nhật ký truy vấn & tiêu thụ Token gần đây
            </h4>
            <div className="max-h-[260px] overflow-y-auto rounded border border-[var(--border)]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[var(--bg)] border-b border-[var(--border)] sticky top-0">
                  <tr>
                    <th className="py-2 px-3 text-[11px] font-mono uppercase text-[var(--muted)]">
                      Thời gian
                    </th>
                    <th className="py-2 px-3 text-[11px] font-mono uppercase text-[var(--muted)]">
                      Người thực hiện
                    </th>
                    <th className="py-2 px-3 text-[11px] font-mono uppercase text-[var(--muted)]">
                      Tác vụ
                    </th>
                    <th className="py-2 px-3 text-[11px] font-mono uppercase text-[var(--muted)] text-right">
                      Token
                    </th>
                    <th className="py-2 px-3 text-[11px] font-mono uppercase text-[var(--muted)] text-right">
                      Độ trễ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
                  {Array.isArray(thongKeSuDung?.nhatKyGanDay) &&
                  thongKeSuDung.nhatKyGanDay.length > 0 ? (
                    thongKeSuDung.nhatKyGanDay.map((nk: any) => (
                      <tr key={nk.id} className="hover:bg-[var(--bg)]/60">
                        <td className="py-2 px-3 font-mono text-[11px] text-[var(--muted)]">
                          {new Date(nk.ngayTao).toLocaleString('vi-VN')}
                        </td>
                        <td className="py-2 px-3 text-[var(--text)] font-medium">
                          {nk.nguoiDung?.hoTen || 'Người dùng'}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-[var(--accent)]">
                          {nk.loaiTacVu}
                        </td>
                        <td className="py-2 px-3 font-mono text-right text-[var(--text)]">
                          {(nk.soLuongToken ?? 0).toLocaleString('vi-VN')}
                        </td>
                        <td className="py-2 px-3 font-mono text-right text-[var(--muted)]">
                          {nk.doTreMs ?? 0} ms
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-[var(--muted)]">
                        Chưa có bản ghi lưu lượng sử dụng
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setMoModalGiamSat(false)}
              className="rounded border border-[var(--border)] px-4 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--bg)] cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </HopThoai>
    </div>
  );
}
