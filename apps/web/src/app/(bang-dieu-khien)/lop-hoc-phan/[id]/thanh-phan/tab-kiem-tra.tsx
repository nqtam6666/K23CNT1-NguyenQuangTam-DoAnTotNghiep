'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  BrainCircuit,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  Trophy,
  Trash2,
  Eye,
  Loader2,
  HelpCircle,
  Award,
  FileCheck2,
  Lock,
  Unlock,
} from 'lucide-react';
import { mayKhachApi } from '../../../../../tien-ich/may-khach-api';
import { thongBao } from '../../../../../tien-ich/thong-bao';
import { HopThoai } from '../../../../../thanh-phan/hop-thoai';
import AnimatedBackground from '@/components/ui/animated-tabs';
import {
  BaiKiemTra,
  CauHoi,
  CheDoKiemTra,
  TrangThaiBaiKiemTra,
  LuotLamBai,
  PayloadJwt,
  VaiTro,
} from '@lms/chung';

interface ThuocTinhTabKiemTra {
  idLopHocPhan: string;
  nguoiDung?: PayloadJwt;
  laGiaoVienLop: boolean;
}

export function TabKiemTra({ idLopHocPhan, nguoiDung, laGiaoVienLop }: ThuocTinhTabKiemTra) {
  const queryClient = useQueryClient();

  const laQuanTri =
    nguoiDung?.vaiTro === VaiTro.QUAN_TRI_VIEN ||
    nguoiDung?.vaiTro === VaiTro.GIAO_VU ||
    nguoiDung?.vaiTro === VaiTro.BAN_GIAM_HIEU;
  const coQuyenQuanLy = laGiaoVienLop || laQuanTri;

  const [boLocCheDo, setBoLocCheDo] = useState<'TAT_CA' | CheDoKiemTra>('TAT_CA');

  // Modal Sinh đề bằng AI (Giáo viên)
  const [moModalSinhDeAI, setMoModalSinhDeAI] = useState(false);
  const [tieuDeAI, setTieuDeAI] = useState('');
  const [chuDeAI, setChuDeAI] = useState('');
  const [cheDoAI, setCheDoAI] = useState<CheDoKiemTra>(CheDoKiemTra.LUYEN_TAP);
  const [soLuongCauAI, setSoLuongCauAI] = useState(5);
  const [thoiGianLamPhutAI, setThoiGianLamPhutAI] = useState(15);

  // Modal Xem chi tiết đề / Kết quả lớp (Giáo viên)
  const [idBaiXemChiTiet, setIdBaiXemChiTiet] = useState<string | null>(null);

  // State Phòng làm bài trực tuyến & Xem kết quả bài làm
  const [baiDangLam, setBaiDangLam] = useState<BaiKiemTra | null>(null);
  const [dapAnChon, setDapAnChon] = useState<Record<string, string>>({});
  const [giayConLai, setGiayConLai] = useState<number>(0);
  const [thoiGianBatDauMs, setThoiGianBatDauMs] = useState<number>(0);
  const [ketQuaVuaNop, setKetQuaVuaNop] = useState<LuotLamBai | null>(null);

  // 1. Lấy danh sách bài luyện tập & thi thử của lớp học phần
  const { data: danhSachBaiKiemTra = [], isLoading: dangTaiDanhSach } = useQuery<BaiKiemTra[]>({
    queryKey: ['kiem-tra-lop', idLopHocPhan],
    queryFn: async () => {
      const res = await mayKhachApi.get(`/kiem-tra/lop/${idLopHocPhan}`);
      return res.data?.duLieu || res.data || [];
    },
  });

  // 2. Lấy chi tiết 1 bài kiểm tra (khi GV xem câu hỏi/bảng điểm)
  const { data: chiTietBaiKiemTra, isLoading: dangTaiChiTiet } = useQuery<BaiKiemTra>({
    queryKey: ['chi-tiet-kiem-tra', idBaiXemChiTiet],
    queryFn: async () => {
      if (!idBaiXemChiTiet) return null;
      const res = await mayKhachApi.get(`/kiem-tra/${idBaiXemChiTiet}`);
      return res.data?.duLieu || res.data;
    },
    enabled: !!idBaiXemChiTiet,
  });

  // Đồng hồ đếm ngược khi đang trong phòng làm bài
  useEffect(() => {
    if (!baiDangLam || ketQuaVuaNop || giayConLai <= 0) return;
    const timer = setInterval(() => {
      setGiayConLai((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [baiDangLam, ketQuaVuaNop, giayConLai]);

  // Mutation: Sinh đề tự động từ học liệu bằng AI
  const sinhDeAIMutation = useMutation({
    mutationFn: async () => {
      const res = await mayKhachApi.post(`/kiem-tra/lop/${idLopHocPhan}/sinh-bang-ai`, {
        tieuDe: tieuDeAI.trim() || `${cheDoAI === CheDoKiemTra.THI_THU ? 'Thi thử' : 'Luyện tập'}: ${chuDeAI.trim()}`,
        chuDe: chuDeAI.trim(),
        cheDo: cheDoAI,
        soLuongCau: Number(soLuongCauAI),
        thoiGianLamPhut: Number(thoiGianLamPhutAI),
        soLuotToiDa: cheDoAI === CheDoKiemTra.THI_THU ? 1 : 10,
      });
      return res.data?.duLieu || res.data;
    },
    onSuccess: (data) => {
      setMoModalSinhDeAI(false);
      setTieuDeAI('');
      setChuDeAI('');
      queryClient.invalidateQueries({ queryKey: ['kiem-tra-lop', idLopHocPhan] });
      thongBao.thanhCong(
        'Đã biên soạn đề thành công!',
        `Đề "${data?.tieuDe || ''}" đã được tạo từ học liệu môn học.`,
      );
      if (data?.id) {
        setIdBaiXemChiTiet(data.id);
      }
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Không thể sinh đề tự động',
        err.response?.data?.thongDiep || 'Đã xảy ra lỗi khi biên soạn câu hỏi.',
      );
    },
  });

  // Mutation: Đổi trạng thái đề (Bản nháp <-> Đang mở <-> Đã đóng)
  const doiTrangThaiMutation = useMutation({
    mutationFn: async ({
      idBaiKiemTra,
      trangThai,
    }: {
      idBaiKiemTra: string;
      trangThai: TrangThaiBaiKiemTra;
    }) => {
      const res = await mayKhachApi.patch(`/kiem-tra/${idBaiKiemTra}/trang-thai`, { trangThai });
      return res.data?.duLieu || res.data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['kiem-tra-lop', idLopHocPhan] });
      queryClient.invalidateQueries({ queryKey: ['chi-tiet-kiem-tra', vars.idBaiKiemTra] });
      thongBao.thanhCong(
        vars.trangThai === TrangThaiBaiKiemTra.DANG_MO
          ? 'Đã phát hành bài kiểm tra cho học sinh!'
          : 'Đã cập nhật trạng thái bài kiểm tra.',
      );
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Cập nhật trạng thái thất bại',
        err.response?.data?.thongDiep || 'Không thể thay đổi trạng thái.',
      );
    },
  });

  // Mutation: Xóa bài kiểm tra
  const xoaBaiMutation = useMutation({
    mutationFn: async (idBaiKiemTra: string) => {
      await mayKhachApi.delete(`/kiem-tra/${idBaiKiemTra}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kiem-tra-lop', idLopHocPhan] });
      setIdBaiXemChiTiet(null);
      thongBao.thanhCong('Đã xóa bài kiểm tra khỏi lớp học phần.');
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Không thể xóa bài kiểm tra',
        err.response?.data?.thongDiep || 'Vui lòng thử lại.',
      );
    },
  });

  // Mutation: Bắt đầu làm bài (Lấy đề chi tiết)
  const batDauLamBaiMutation = useMutation({
    mutationFn: async (idBaiKiemTra: string) => {
      const resChiTiet = await mayKhachApi.get(`/kiem-tra/${idBaiKiemTra}`);
      return (resChiTiet.data?.duLieu || resChiTiet.data) as BaiKiemTra;
    },
    onSuccess: (baiKiemTra) => {
      setBaiDangLam(baiKiemTra);
      setDapAnChon({});
      setKetQuaVuaNop(null);
      setThoiGianBatDauMs(Date.now());
      setGiayConLai((baiKiemTra.thoiGianLamPhut || 15) * 60);
      thongBao.thanhCong(
        `Bắt đầu: ${baiKiemTra.tieuDe}`,
        `Thời gian làm bài: ${baiKiemTra.thoiGianLamPhut} phút.`,
      );
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Không thể bắt đầu làm bài',
        err.response?.data?.thongDiep || 'Bài kiểm tra hiện không khả dụng.',
      );
    },
  });

  // Mutation: Nộp bài & Chấm điểm tự động + Nhận xét AI
  const nopBaiMutation = useMutation({
    mutationFn: async () => {
      if (!baiDangLam) throw new Error('Chưa chọn bài kiểm tra');
      const thoiLuongGiay = Math.max(1, Math.round((Date.now() - thoiGianBatDauMs) / 1000));
      const danhSachTraLoi = (baiDangLam.cacCauHoi || []).map((cau) => ({
        idCauHoi: cau.id,
        dapAnChon: dapAnChon[cau.id] || '',
      }));

      const res = await mayKhachApi.post(`/kiem-tra/${baiDangLam.id}/nop-bai`, {
        thoiLuongGiay,
        danhSachTraLoi,
      });
      return (res.data?.duLieu || res.data) as LuotLamBai;
    },
    onSuccess: (data) => {
      setKetQuaVuaNop(data);
      queryClient.invalidateQueries({ queryKey: ['kiem-tra-lop', idLopHocPhan] });
      queryClient.invalidateQueries({ queryKey: ['so-diem-lop', idLopHocPhan] });
      thongBao.thanhCong(
        `Hoàn thành bài làm: ${data.diemSo}/10 điểm`,
        `Bạn trả lời đúng ${data.soCauDung}/${data.tongSoCau} câu hỏi.`,
      );
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Nộp bài thất bại',
        err.response?.data?.thongDiep || 'Không thể chấm điểm bài làm.',
      );
    },
  });

  const danhSachLoc = danhSachBaiKiemTra.filter((b) =>
    boLocCheDo === 'TAT_CA' ? true : b.cheDo === boLocCheDo,
  );

  const dinhDangDongHo = (tongGiay: number) => {
    const phut = Math.floor(tongGiay / 60);
    const giay = tongGiay % 60;
    return `${String(phut).padStart(2, '0')}:${String(giay).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Thanh tiêu đề & tác vụ */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card rounded border border-border/80 p-5 shadow-sm">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Luyện tập & Thi thử trực tuyến
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Biên soạn câu hỏi ôn tập từ giáo trình môn học, chấm điểm tự động và giải thích kiến thức chuyên sâu
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-muted/60 p-1 rounded">
            <AnimatedBackground
              defaultValue={boLocCheDo}
              onValueChange={(val) => val && setBoLocCheDo(val as 'TAT_CA' | CheDoKiemTra)}
              className="rounded-lg bg-background shadow-xs"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
            >
              {(
                [
                  { ma: 'TAT_CA', nhan: 'Tất cả' },
                  { ma: CheDoKiemTra.LUYEN_TAP, nhan: 'Luyện tập' },
                  { ma: CheDoKiemTra.THI_THU, nhan: 'Thi thử' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.ma}
                  data-id={tab.ma}
                  type="button"
                  onClick={() => setBoLocCheDo(tab.ma)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    boLocCheDo === tab.ma
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.nhan}
                </button>
              ))}
            </AnimatedBackground>
          </div>

          {coQuyenQuanLy && (
            <button
              type="button"
              onClick={() => setMoModalSinhDeAI(true)}
              className="inline-flex items-center gap-2 rounded bg-accent hover:bg-accent px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Biên soạn đề thông minh từ Tài liệu
            </button>
          )}
        </div>
      </div>

      {/* Danh sách bài Luyện tập & Thi thử */}
      {dangTaiDanhSach ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 rounded bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : danhSachLoc.length === 0 ? (
        <div className="rounded border border-dashed border-border/80 p-12 text-center bg-card/40">
          <BrainCircuit className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-foreground">
            Chưa có bài luyện tập hoặc thi thử nào
          </h4>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            {coQuyenQuanLy
              ? 'Hãy nhấn "Biên soạn đề thông minh từ Tài liệu" để hệ thống trích xuất nội dung giáo trình của lớp và tạo bộ câu hỏi trắc nghiệm.'
              : 'Giáo viên chưa mở đề luyện tập hoặc thi thử nào cho học phần này.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {danhSachLoc.map((bai) => {
            const luotGanNhat = bai.luotLamGanNhat || bai.cacLuotLam?.[0];
            const laThiThu = bai.cheDo === CheDoKiemTra.THI_THU;
            const diemHienThi =
              bai.diemCaoNhatCuaToi !== undefined && bai.diemCaoNhatCuaToi !== null
                ? bai.diemCaoNhatCuaToi
                : luotGanNhat?.diemSo;

            return (
              <div
                key={bai.id}
                className="bg-card rounded border border-border/80 p-5 shadow-sm hover:border-border transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          laThiThu
                            ? 'bg-danger/10 text-danger border border-danger'
                            : 'bg-accent/10 text-accent border border-accent'
                        }`}
                      >
                        {laThiThu ? 'Đề Thi thử' : 'Bài Luyện tập'}
                      </span>

                      {coQuyenQuanLy && (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            bai.trangThai === TrangThaiBaiKiemTra.DANG_MO
                              ? 'bg-accent/10 text-accent'
                              : bai.trangThai === TrangThaiBaiKiemTra.BAN_NHAP
                                ? 'bg-accent/10 text-accent'
                                : 'bg-active-bg text-muted'
                          }`}
                        >
                          {bai.trangThai === TrangThaiBaiKiemTra.DANG_MO
                            ? 'Đang mở'
                            : bai.trangThai === TrangThaiBaiKiemTra.BAN_NHAP
                              ? 'Bản nháp (Chờ duyệt)'
                              : 'Đã đóng'}
                        </span>
                      )}
                    </div>

                    {diemHienThi !== undefined && diemHienThi !== null && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-bold">
                        <Trophy className="w-3.5 h-3.5" />
                        Đạt: {diemHienThi}/{bai.diemToiDa} điểm
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-foreground">{bai.tieuDe}</h4>
                  {bai.moTa && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{bai.moTa}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-primary" />
                      {bai._count?.cacCauHoi || bai.cacCauHoi?.length || 0} câu hỏi
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-accent" />
                      {bai.thoiGianLamPhut} phút
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-accent" />
                      Thang điểm {bai.diemToiDa}
                    </span>
                    {coQuyenQuanLy && (
                      <span className="font-semibold text-primary">
                        {bai._count?.cacLuotLam || 0} lượt làm bài
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/60">
                  {coQuyenQuanLy ? (
                    <div className="flex flex-wrap items-center gap-2 w-full justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIdBaiXemChiTiet(bai.id)}
                          className="inline-flex items-center gap-1.5 rounded bg-muted hover:bg-muted/80 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Xem đề & Kết quả
                        </button>

                        {bai.trangThai !== TrangThaiBaiKiemTra.DANG_MO ? (
                          <button
                            type="button"
                            onClick={() =>
                              doiTrangThaiMutation.mutate({
                                idBaiKiemTra: bai.id,
                                trangThai: TrangThaiBaiKiemTra.DANG_MO,
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded bg-accent hover:bg-accent px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            Phát hành đề
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              doiTrangThaiMutation.mutate({
                                idBaiKiemTra: bai.id,
                                trangThai: TrangThaiBaiKiemTra.DA_DONG,
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded bg-accent/10 hover:bg-accent/20 px-3 py-1.5 text-xs font-semibold text-accent transition-colors cursor-pointer"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            Đóng đề
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => batDauLamBaiMutation.mutate(bai.id)}
                          className="inline-flex items-center gap-1 rounded bg-primary/10 hover:bg-primary/20 px-3 py-1.5 text-xs font-semibold text-primary transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Làm thử
                        </button>
                        <button
                          type="button"
                          onClick={() => xoaBaiMutation.mutate(bai.id)}
                          className="p-1.5 rounded text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                          title="Xóa đề"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end w-full">
                      <button
                        type="button"
                        disabled={
                          (bai.soLuotDaLam !== undefined && bai.soLuotDaLam >= bai.soLuotToiDa) ||
                          batDauLamBaiMutation.isPending
                        }
                        onClick={() => batDauLamBaiMutation.mutate(bai.id)}
                        className="inline-flex items-center gap-1.5 rounded bg-primary hover:bg-primary/90 disabled:opacity-50 px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-colors cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        {laThiThu
                          ? bai.soLuotDaLam && bai.soLuotDaLam >= bai.soLuotToiDa
                            ? 'Đã hoàn thành bài thi thử'
                            : 'Vào phòng Thi thử'
                          : luotGanNhat
                            ? 'Luyện tập lại'
                            : 'Bắt đầu Luyện tập'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: BIÊN SOẠN ĐỀ THÔNG MINH TỪ TÀI LIỆU HỌC PHẦN (GIÁO VIÊN) */}
      <HopThoai
        mo={moModalSinhDeAI}
        onDong={() => setMoModalSinhDeAI(false)}
        tieuDe="Biên soạn đề Luyện tập / Thi thử từ Tài liệu môn học"
        moTa="Hệ thống tự động đối chiếu học liệu của lớp học phần để sinh câu hỏi trắc nghiệm kèm đáp án và lời giải thích học thuật"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!chuDeAI.trim()) return;
            sinhDeAIMutation.mutate();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Tiêu đề bài kiểm tra (tùy chọn)
            </label>
            <input
              type="text"
              value={tieuDeAI}
              onChange={(e) => setTieuDeAI(e.target.value)}
              placeholder="VD: Đề luyện tập Chương 2 - Hàm số và Đồ thị"
              className="w-full rounded border border-input bg-background px-3.5 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Chủ đề / Nội dung kiến thức trọng tâm *
            </label>
            <input
              type="text"
              required
              value={chuDeAI}
              onChange={(e) => setChuDeAI(e.target.value)}
              placeholder="VD: Hàm số bậc hai, Định lý Vi-ét và xét dấu tam thức bậc hai"
              className="w-full rounded border border-input bg-background px-3.5 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Hình thức đánh giá
              </label>
              <select
                value={cheDoAI}
                onChange={(e) => setCheDoAI(e.target.value as CheDoKiemTra)}
                className="w-full rounded border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value={CheDoKiemTra.LUYEN_TAP}>Luyện tập (Làm nhiều lần)</option>
                <option value={CheDoKiemTra.THI_THU}>Thi thử (Chấm lấy điểm)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Số câu hỏi (3 - 20)
              </label>
              <input
                type="number"
                min={3}
                max={20}
                value={soLuongCauAI}
                onChange={(e) => setSoLuongCauAI(Number(e.target.value))}
                className="w-full rounded border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Thời gian (phút)
              </label>
              <input
                type="number"
                min={5}
                max={180}
                value={thoiGianLamPhutAI}
                onChange={(e) => setThoiGianLamPhutAI(Number(e.target.value))}
                className="w-full rounded border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setMoModalSinhDeAI(false)}
              className="rounded border border-input px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!chuDeAI.trim() || sinhDeAIMutation.isPending}
              className="inline-flex items-center gap-2 rounded bg-accent hover:bg-accent px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 cursor-pointer"
            >
              {sinhDeAIMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang biên soạn câu hỏi...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Biên soạn đề kiểm tra
                </>
              )}
            </button>
          </div>
        </form>
      </HopThoai>

      {/* MODAL 2: PHÒNG LÀM BÀI TRỰC TUYẾN & XEM KẾT QUẢ CHẤM ĐIỂM */}
      <HopThoai
        mo={!!baiDangLam}
        onDong={() => {
          setBaiDangLam(null);
          setKetQuaVuaNop(null);
        }}
        tieuDe={baiDangLam?.tieuDe || 'Phòng làm bài trực tuyến'}
        moTa={
          ketQuaVuaNop
            ? `Đã hoàn thành • Điểm số: ${ketQuaVuaNop.diemSo}/10 (${ketQuaVuaNop.soCauDung}/${ketQuaVuaNop.tongSoCau} câu đúng)`
            : `Thời gian còn lại: ${dinhDangDongHo(giayConLai)} • Đã chọn ${Object.keys(dapAnChon).length}/${baiDangLam?.cacCauHoi?.length || 0} câu`
        }
        kichThuoc="rat-lon"
      >
        {baiDangLam && (
          <div className="space-y-5">
            {/* Banner Nhận xét & Phân tích sau khi nộp bài */}
            {ketQuaVuaNop && (
              <div className="rounded bg-accent-soft border border-accent p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-accent">
                    <Sparkles className="w-4 h-4" />
                    Đánh giá kết quả & Định hướng ôn tập
                  </span>
                  <span className="px-3 py-1 rounded-full bg-accent text-white text-xs font-extrabold">
                    Điểm đạt được: {ketQuaVuaNop.diemSo} / 10
                  </span>
                </div>
                {ketQuaVuaNop.nhanXetAI && (
                  <p className="text-xs text-text leading-relaxed whitespace-pre-line">
                    {ketQuaVuaNop.nhanXetAI}
                  </p>
                )}
              </div>
            )}

            {/* Danh sách câu hỏi */}
            <div className="space-y-4">
              {baiDangLam.cacCauHoi?.map((cau: CauHoi, idx: number) => {
                const maChon = dapAnChon[cau.id];
                const chiTietChamCau = ketQuaVuaNop?.chiTietTraLoi?.find(
                  (kq) => kq.idCauHoi === cau.id,
                );

                return (
                  <div
                    key={cau.id}
                    className="rounded border border-border p-4 space-y-3 bg-bg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h5 className="text-sm font-bold text-text">
                        Câu {idx + 1}: {cau.noiDung}
                      </h5>
                      {chiTietChamCau && (
                        <span
                          className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            chiTietChamCau.dungHaySai
                              ? 'bg-accent-soft text-accent'
                              : 'bg-danger-soft text-danger'
                          }`}
                        >
                          {chiTietChamCau.dungHaySai ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Chính xác
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" /> Chưa đúng
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {cau.cacPhuongAn?.map((pa) => {
                        const dangChon = maChon === pa.ma;
                        const laDapAnDung =
                          chiTietChamCau && chiTietChamCau.dapAnDung === pa.ma;
                        const chonSai =
                          chiTietChamCau && dangChon && !chiTietChamCau.dungHaySai;

                        let lopMau =
                          'border-border bg-surface text-text hover:border-accent';
                        if (ketQuaVuaNop) {
                          if (laDapAnDung) {
                            lopMau =
                              'border-accent bg-accent-soft text-accent font-semibold';
                          } else if (chonSai) {
                            lopMau = 'border-danger bg-danger-soft text-danger font-semibold';
                          }
                        } else if (dangChon) {
                          lopMau =
                            'border-accent bg-accent-soft text-accent font-semibold ring-1 ring-accent';
                        }

                        return (
                          <button
                            key={pa.ma}
                            type="button"
                            disabled={!!ketQuaVuaNop}
                            onClick={() =>
                              setDapAnChon((prev) => ({
                                ...prev,
                                [cau.id]: pa.ma,
                              }))
                            }
                            className={`text-left px-3.5 py-2.5 rounded border text-xs transition-all cursor-pointer ${lopMau}`}
                          >
                            <span className="font-bold mr-1.5">{pa.ma}.</span>
                            {pa.noiDung}
                          </button>
                        );
                      })}
                    </div>

                    {/* Giải thích kiến thức sau khi nộp bài */}
                    {chiTietChamCau?.giaiThich && (
                      <div className="rounded bg-accent-soft border border-accent p-3 text-xs text-accent">
                        <span className="font-bold">Giải thích đáp án: </span>
                        {chiTietChamCau.giaiThich}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Chân trang nộp bài */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="text-xs font-semibold text-muted">
                {!ketQuaVuaNop && (
                  <span>
                    Thời gian còn lại:{' '}
                    <strong className="text-danger font-mono text-sm">
                      {dinhDangDongHo(giayConLai)}
                    </strong>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setBaiDangLam(null);
                    setKetQuaVuaNop(null);
                  }}
                  className="rounded border border-border px-4 py-2 text-xs font-semibold text-text hover:bg-bg cursor-pointer"
                >
                  Đóng
                </button>
                {!ketQuaVuaNop && (
                  <button
                    type="button"
                    disabled={nopBaiMutation.isPending}
                    onClick={() => nopBaiMutation.mutate()}
                    className="inline-flex items-center gap-2 rounded bg-accent hover:bg-accent px-5 py-2 text-xs font-semibold text-white shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {nopBaiMutation.isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Đang chấm bài...
                      </>
                    ) : (
                      <>
                        <FileCheck2 className="w-3.5 h-3.5" />
                        Nộp bài & Chấm điểm ngay
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </HopThoai>

      {/* MODAL 3: XEM CHI TIẾT ĐỀ & BẢNG KẾT QUẢ CỦA HỌC SINH (GIÁO VIÊN) */}
      <HopThoai
        mo={!!idBaiXemChiTiet}
        onDong={() => setIdBaiXemChiTiet(null)}
        tieuDe={chiTietBaiKiemTra?.tieuDe || 'Chi tiết bài kiểm tra'}
        moTa="Kiểm duyệt ngân hàng câu hỏi, đáp án và theo dõi kết quả làm bài của học sinh"
        kichThuoc="rat-lon"
      >
        {dangTaiChiTiet ? (
          <div className="p-8 text-center text-xs text-muted">Đang tải chi tiết đề...</div>
        ) : chiTietBaiKiemTra ? (
          <div className="space-y-5">
            {/* Thanh trạng thái kiểm duyệt */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded bg-bg border border-border">
              <div className="text-xs text-text">
                Trạng thái hiện tại:{' '}
                <strong className="text-accent">{chiTietBaiKiemTra.trangThai}</strong> • Tổng số:{' '}
                <strong>{chiTietBaiKiemTra.cacCauHoi?.length || 0} câu hỏi</strong>
              </div>
              {chiTietBaiKiemTra.trangThai !== TrangThaiBaiKiemTra.DANG_MO && (
                <button
                  type="button"
                  onClick={() =>
                    doiTrangThaiMutation.mutate({
                      idBaiKiemTra: chiTietBaiKiemTra.id,
                      trangThai: TrangThaiBaiKiemTra.DANG_MO,
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded bg-accent hover:bg-accent px-3.5 py-1.5 text-xs font-semibold text-white cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  Duyệt & Phát hành cho học sinh
                </button>
              )}
            </div>

            {/* Danh sách câu hỏi & đáp án */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                Nội dung câu hỏi & Đáp án chuẩn
              </h4>
              {chiTietBaiKiemTra.cacCauHoi?.map((cau: CauHoi, idx: number) => (
                <div
                  key={cau.id}
                  className="p-3.5 rounded border border-border space-y-2 text-xs"
                >
                  <p className="font-bold text-text">
                    Câu {idx + 1}: {cau.noiDung}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {cau.cacPhuongAn?.map((pa) => (
                      <div
                        key={pa.ma}
                        className={`px-3 py-1.5 rounded-lg border ${
                          cau.dapAnDung === pa.ma
                            ? 'border-accent bg-accent-soft text-accent font-semibold'
                            : 'border-border text-muted'
                        }`}
                      >
                        <span className="font-bold mr-1">{pa.ma}.</span>
                        {pa.noiDung}
                      </div>
                    ))}
                  </div>
                  {cau.giaiThich && (
                    <p className="text-muted italic">Giải thích: {cau.giaiThich}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Bảng kết quả làm bài của học sinh */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                Lịch sử làm bài của học sinh ({chiTietBaiKiemTra.cacLuotLam?.length || 0})
              </h4>
              {chiTietBaiKiemTra.cacLuotLam && chiTietBaiKiemTra.cacLuotLam.length > 0 ? (
                <div className="rounded border border-border overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-bg border-b border-border text-muted font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Mã HS</th>
                        <th className="py-2.5 px-3">Họ và tên</th>
                        <th className="py-2.5 px-3">Số câu đúng</th>
                        <th className="py-2.5 px-3">Điểm số</th>
                        <th className="py-2.5 px-3">Thời gian nộp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {chiTietBaiKiemTra.cacLuotLam.map((ll: LuotLamBai) => (
                        <tr key={ll.id}>
                          <td className="py-2.5 px-3 font-mono font-semibold text-accent">
                            {ll.hocSinh?.maHocSinh}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-text">
                            {ll.hocSinh?.nguoiDung?.hoTen}
                          </td>
                          <td className="py-2.5 px-3">
                            {ll.soCauDung}/{ll.tongSoCau}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-accent">
                            {ll.diemSo !== null && ll.diemSo !== undefined ? ll.diemSo : 'Đang làm'}
                          </td>
                          <td className="py-2.5 px-3 text-muted">
                            {ll.thoiGianNop
                              ? new Date(ll.thoiGianNop).toLocaleString('vi-VN')
                              : 'Chưa nộp'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-muted italic">Chưa có học sinh nào nộp bài.</p>
              )}
            </div>
          </div>
        ) : null}
      </HopThoai>
    </div>
  );
}
