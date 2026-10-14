'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  GraduationCap,
  RefreshCw,
  Sparkles,
  Plus,
  Save,
  CheckCircle2,
  AlertTriangle,
  Award,
  TrendingUp,
  Loader2,
  Trash2,
} from 'lucide-react';
import { mayKhachApi } from '../../../../../tien-ich/may-khach-api';
import { thongBao } from '../../../../../tien-ich/thong-bao';
import { HopThoai } from '../../../../../thanh-phan/hop-thoai';
import {
  BangDiemLopHocPhan,
  CotDiem,
  DongBangDiemHocSinh,
  KetQuaNhanXetHocPhanAI,
  PayloadJwt,
  VaiTro,
} from '@lms/chung';

interface ThuocTinhTabSoDiem {
  idLopHocPhan: string;
  nguoiDung?: PayloadJwt;
  laGiaoVienLop: boolean;
}

export function TabSoDiem({ idLopHocPhan, nguoiDung, laGiaoVienLop }: ThuocTinhTabSoDiem) {
  const queryClient = useQueryClient();

  const laQuanTri =
    nguoiDung?.vaiTro === VaiTro.QUAN_TRI_VIEN ||
    nguoiDung?.vaiTro === VaiTro.GIAO_VU ||
    nguoiDung?.vaiTro === VaiTro.BAN_GIAM_HIEU;
  const coQuyenQuanLy = laGiaoVienLop || laQuanTri;

  // Bảng điểm đang chỉnh sửa: key = `${idCotDiem}__${idHocSinh}`
  const [bangDiemSua, setBangDiemSua] = useState<Record<string, string>>({});
  const [coThayDoiDiem, setCoThayDoiDiem] = useState(false);

  // Modal Thêm cột điểm mới
  const [moModalThemCot, setMoModalThemCot] = useState(false);
  const [tenCotMoi, setTenCotMoi] = useState('');
  const [heSoMoi, setHeSoMoi] = useState(1);

  // Modal Nhận xét năng lực học phần bằng AI
  const [ketQuaAI, setKetQuaAI] = useState<KetQuaNhanXetHocPhanAI | null>(null);
  const [idHocSinhDangPhanTich, setIdHocSinhDangPhanTich] = useState<string | null>(null);

  // 1. Lấy toàn bộ sổ điểm & kết quả học phần
  const { data: duLieuSoDiem, isLoading: dangTaiSoDiem } = useQuery<BangDiemLopHocPhan>({
    queryKey: ['so-diem-lop', idLopHocPhan],
    queryFn: async () => {
      const res = await mayKhachApi.get(`/so-diem/lop/${idLopHocPhan}`);
      return res.data?.duLieu || res.data;
    },
  });

  // Đồng bộ dữ liệu điểm vào state chỉnh sửa
  useEffect(() => {
    if (!duLieuSoDiem) return;
    const mapBanDau: Record<string, string> = {};
    for (const hs of duLieuSoDiem.danhSachHocSinh) {
      for (const cot of duLieuSoDiem.danhSachCotDiem) {
        const gt = hs.diemTheoCot?.[cot.id]?.giaTri;
        mapBanDau[`${cot.id}__${hs.idHocSinh}`] =
          gt !== null && gt !== undefined ? String(gt) : '';
      }
    }
    setBangDiemSua(mapBanDau);
    setCoThayDoiDiem(false);
  }, [duLieuSoDiem]);

  // Mutation: Đồng bộ tự động điểm Chuyên cần + Luyện tập/Bài tập + Thi thử
  const dongBoDiemMutation = useMutation({
    mutationFn: async () => {
      const res = await mayKhachApi.post(`/so-diem/lop/${idLopHocPhan}/dong-bo-tu-dong`);
      return res.data?.duLieu || res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['so-diem-lop', idLopHocPhan] });
      thongBao.thanhCong(
        'Đồng bộ kết quả học phần thành công!',
        data?.thongDiep || 'Đã cập nhật điểm chuyên cần, luyện tập và thi thử.',
      );
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Không thể đồng bộ điểm tự động',
        err.response?.data?.thongDiep || 'Vui lòng thử lại.',
      );
    },
  });

  // Mutation: Lưu bảng điểm hàng loạt
  const luuBangDiemMutation = useMutation({
    mutationFn: async () => {
      if (!duLieuSoDiem) return;
      const danhSachDiem: { idCotDiem: string; idHocSinh: string; giaTri: number }[] = [];

      for (const [khoa, chuoiGiaTri] of Object.entries(bangDiemSua)) {
        if (chuoiGiaTri.trim() === '') continue;
        const so = Number(chuoiGiaTri);
        if (Number.isNaN(so) || so < 0 || so > 10) continue;
        const [idCotDiem, idHocSinh] = khoa.split('__');
        danhSachDiem.push({ idCotDiem, idHocSinh, giaTri: so });
      }

      const res = await mayKhachApi.post(`/so-diem/lop/${idLopHocPhan}/luu-diem`, {
        danhSachDiem,
      });
      return res.data?.duLieu || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['so-diem-lop', idLopHocPhan] });
      setCoThayDoiDiem(false);
      thongBao.thanhCong('Đã lưu sổ điểm học phần thành công.');
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Lưu điểm thất bại',
        err.response?.data?.thongDiep || 'Vui lòng kiểm tra lại giá trị điểm (0 - 10).',
      );
    },
  });

  // Mutation: Thêm cột điểm mới
  const themCotDiemMutation = useMutation({
    mutationFn: async () => {
      const res = await mayKhachApi.post(`/so-diem/lop/${idLopHocPhan}/cot-diem`, {
        tenCotDiem: tenCotMoi.trim(),
        heSo: Number(heSoMoi),
      });
      return res.data?.duLieu || res.data;
    },
    onSuccess: () => {
      setMoModalThemCot(false);
      setTenCotMoi('');
      setHeSoMoi(1);
      queryClient.invalidateQueries({ queryKey: ['so-diem-lop', idLopHocPhan] });
      thongBao.thanhCong('Đã thêm cột điểm thành phần mới.');
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Không thể thêm cột điểm',
        err.response?.data?.thongDiep || 'Vui lòng thử lại.',
      );
    },
  });

  // Mutation: Xóa cột điểm
  const xoaCotDiemMutation = useMutation({
    mutationFn: async (idCotDiem: string) => {
      await mayKhachApi.delete(`/so-diem/cot-diem/${idCotDiem}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['so-diem-lop', idLopHocPhan] });
      thongBao.thanhCong('Đã xóa cột điểm thành phần.');
    },
    onError: (err: any) => {
      thongBao.thatBai('Không thể xóa cột điểm', err.response?.data?.thongDiep);
    },
  });

  // Mutation: Phân tích năng lực & Đề xuất lộ trình học phần bằng AI
  const phanTichAIMutation = useMutation({
    mutationFn: async (idHocSinh: string) => {
      setIdHocSinhDangPhanTich(idHocSinh);
      const res = await mayKhachApi.post(
        `/so-diem/lop/${idLopHocPhan}/hoc-sinh/${idHocSinh}/nhan-xet-ai`,
      );
      return (res.data?.duLieu || res.data) as KetQuaNhanXetHocPhanAI;
    },
    onSuccess: (data) => {
      setIdHocSinhDangPhanTich(null);
      setKetQuaAI(data);
      thongBao.thanhCong(`Đã hoàn tất phân tích kết quả học phần cho ${data.hoTen}`);
    },
    onError: (err: any) => {
      setIdHocSinhDangPhanTich(null);
      thongBao.thatBai(
        'Không thể phân tích kết quả học phần',
        err.response?.data?.thongDiep || 'Vui lòng thử lại.',
      );
    },
  });

  return (
    <div className="space-y-6">
      {/* Thanh công cụ Sổ điểm & Quản lý kết quả học phần */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card rounded border border-border/80 p-5 shadow-sm">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Quản lý kết quả học phần & Phân tích năng lực
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tổng hợp điểm thành phần, quy đổi thang điểm tín chỉ (Hệ 10, Hệ 4, Điểm chữ) và tư vấn lộ trình học tập cá nhân hóa
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {coQuyenQuanLy && (
            <>
              <button
                type="button"
                disabled={dongBoDiemMutation.isPending}
                onClick={() => dongBoDiemMutation.mutate()}
                className="inline-flex items-center gap-1.5 rounded border border-border bg-muted/50 hover:bg-muted px-3.5 py-2 text-xs font-semibold text-foreground transition-colors cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${dongBoDiemMutation.isPending ? 'animate-spin' : ''}`}
                />
                Đồng bộ điểm tự động
              </button>

              <button
                type="button"
                onClick={() => setMoModalThemCot(true)}
                className="inline-flex items-center gap-1.5 rounded border border-border bg-background hover:bg-muted/60 px-3.5 py-2 text-xs font-semibold text-foreground transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm cột điểm
              </button>

              <button
                type="button"
                disabled={!coThayDoiDiem || luuBangDiemMutation.isPending}
                onClick={() => luuBangDiemMutation.mutate()}
                className="inline-flex items-center gap-1.5 rounded bg-primary hover:bg-primary/90 disabled:opacity-50 px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                {luuBangDiemMutation.isPending ? 'Đang lưu...' : 'Lưu sổ điểm'}
              </button>
            </>
          )}
        </div>
      </div>

      {dangTaiSoDiem ? (
        <div className="p-12 text-center text-sm text-muted-foreground">
          Đang tải bảng kết quả học phần...
        </div>
      ) : duLieuSoDiem ? (
        <>
          {/* Thẻ thống kê tổng quan kết quả học phần */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card rounded border border-border/80 p-5 shadow-sm">
              <span className="text-xs text-muted-foreground">Điểm trung bình học phần</span>
              <p className="text-2xl font-extrabold text-primary mt-1">
                {duLieuSoDiem.thongKe.diemTrungBinhLop} / 10
              </p>
            </div>

            <div className="bg-card rounded border border-border/80 p-5 shadow-sm">
              <span className="text-xs text-muted-foreground">Tỷ lệ hoàn thành học phần (Qua môn)</span>
              <p className="text-2xl font-extrabold text-accent mt-1">
                {duLieuSoDiem.thongKe.tyLeQuaMon}%
              </p>
            </div>

            <div className="bg-card rounded border border-border/80 p-5 shadow-sm">
              <span className="text-xs text-muted-foreground">Phân loại Điểm A & Điểm B</span>
              <p className="text-2xl font-extrabold text-accent mt-1">
                {duLieuSoDiem.thongKe.phanBoDiemChu.A + duLieuSoDiem.thongKe.phanBoDiemChu.B} học sinh
              </p>
            </div>

            <div className="bg-card rounded border border-border/80 p-5 shadow-sm">
              <span className="text-xs text-muted-foreground">Cần hỗ trợ phụ đạo (Điểm D / F)</span>
              <p className="text-2xl font-extrabold text-danger mt-1">
                {duLieuSoDiem.thongKe.phanBoDiemChu.D + duLieuSoDiem.thongKe.phanBoDiemChu.F} học sinh
              </p>
            </div>
          </div>

          {/* Bảng điểm học phần chi tiết */}
          <div className="bg-card rounded border border-border/80 overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">Mã HS</th>
                  <th className="py-3 px-4 min-w-[160px]">Họ và tên</th>
                  {duLieuSoDiem.danhSachCotDiem.map((cot: CotDiem) => (
                    <th key={cot.id} className="py-3 px-3 text-center min-w-[120px]">
                      <div className="flex items-center justify-center gap-1">
                        <span>{cot.tenCotDiem}</span>
                        <span className="text-[10px] text-primary font-mono">
                          (HS {cot.heSo})
                        </span>
                        {coQuyenQuanLy && (
                          <button
                            type="button"
                            onClick={() => xoaCotDiemMutation.mutate(cot.id)}
                            className="text-muted-foreground hover:text-danger ml-1 cursor-pointer"
                            title="Xóa cột điểm"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="py-3 px-3 text-center">TB Hệ 10</th>
                  <th className="py-3 px-3 text-center">Hệ 4</th>
                  <th className="py-3 px-3 text-center">Điểm chữ</th>
                  <th className="py-3 px-3 text-center">Kết quả</th>
                  <th className="py-3 px-4 text-right">Đánh giá năng lực</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {duLieuSoDiem.danhSachHocSinh.map((hs: DongBangDiemHocSinh) => (
                  <tr key={hs.idHocSinh} className="hover:bg-muted/20">
                    <td className="py-3 px-4 font-mono font-semibold text-primary">
                      {hs.maHocSinh}
                    </td>
                    <td className="py-3 px-4 font-semibold text-foreground">{hs.hoTen}</td>

                    {duLieuSoDiem.danhSachCotDiem.map((cot: CotDiem) => {
                      const khoa = `${cot.id}__${hs.idHocSinh}`;
                      const giaTriO = bangDiemSua[khoa] ?? '';
                      const diemHienTai = hs.diemTheoCot?.[cot.id]?.giaTri;

                      return (
                        <td key={cot.id} className="py-2.5 px-3 text-center">
                          {coQuyenQuanLy ? (
                            <input
                              type="number"
                              min={0}
                              max={10}
                              step={0.1}
                              value={giaTriO}
                              onChange={(e) => {
                                setBangDiemSua((prev) => ({
                                  ...prev,
                                  [khoa]: e.target.value,
                                }));
                                setCoThayDoiDiem(true);
                              }}
                              placeholder="—"
                              className="w-20 text-center rounded-lg border border-input bg-background px-2 py-1 text-xs font-semibold focus:border-primary focus:outline-none"
                            />
                          ) : (
                            <span className="font-semibold text-foreground">
                              {diemHienTai !== null && diemHienTai !== undefined
                                ? diemHienTai
                                : '—'}
                            </span>
                          )}
                        </td>
                      );
                    })}

                    <td className="py-3 px-3 text-center font-bold text-foreground">
                      {hs.diemTrungBinhHe10 !== null ? hs.diemTrungBinhHe10 : '—'}
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-accent">
                      {hs.diemTrungBinhHe4 !== null ? hs.diemTrungBinhHe4 : '—'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {hs.diemChu && hs.diemChu !== 'CHUA_XEP_LOAI' ? (
                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold">
                          {hs.diemChu}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {hs.datQuaMon === null ? (
                        <span className="text-muted-foreground">Chưa xét</span>
                      ) : hs.datQuaMon ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Qua môn
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-danger/10 text-danger font-semibold">
                          <AlertTriangle className="w-3 h-3" /> Học lại
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        disabled={idHocSinhDangPhanTich === hs.idHocSinh}
                        onClick={() => phanTichAIMutation.mutate(hs.idHocSinh)}
                        className="inline-flex items-center gap-1 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        {idHocSinhDangPhanTich === hs.idHocSinh ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                        Nhận xét năng lực
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {/* Modal 1: Thêm cột điểm thành phần mới */}
      <HopThoai
        mo={moModalThemCot}
        onDong={() => setMoModalThemCot(false)}
        tieuDe="Thêm cột điểm thành phần"
        moTa="Thiết lập tên cột điểm và trọng số (hệ số) tính điểm trung bình học phần"
        kichThuoc="nho"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!tenCotMoi.trim()) return;
            themCotDiemMutation.mutate();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              Tên cột điểm *
            </label>
            <input
              type="text"
              required
              value={tenCotMoi}
              onChange={(e) => setTenCotMoi(e.target.value)}
              placeholder="VD: Tiểu luận nhóm, Thực hành Lab..."
              className="w-full rounded border border-border px-3.5 py-2 text-sm focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              Hệ số (Trọng số) *
            </label>
            <input
              type="number"
              min={0.5}
              max={10}
              step={0.5}
              value={heSoMoi}
              onChange={(e) => setHeSoMoi(Number(e.target.value))}
              className="w-full rounded border border-border px-3.5 py-2 text-sm focus:border-accent focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setMoModalThemCot(false)}
              className="rounded border border-border px-4 py-2 text-xs font-semibold text-text hover:bg-bg cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!tenCotMoi.trim() || themCotDiemMutation.isPending}
              className="rounded bg-accent hover:bg-accent px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 cursor-pointer"
            >
              {themCotDiemMutation.isPending ? 'Đang thêm...' : 'Thêm cột điểm'}
            </button>
          </div>
        </form>
      </HopThoai>

      {/* Modal 2: Báo cáo phân tích & Nhận xét kết quả học phần bằng AI */}
      <HopThoai
        mo={!!ketQuaAI}
        onDong={() => setKetQuaAI(null)}
        tieuDe={`Phân tích kết quả học phần: ${ketQuaAI?.hoTen || ''}`}
        moTa="Tổng hợp từ dữ liệu chuyên cần, điểm luyện tập, bài tập, thi thử và điểm thành phần"
        kichThuoc="lon"
      >
        {ketQuaAI && (
          <div className="space-y-4">
            <div className="rounded bg-accent-soft border border-accent p-4 space-y-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-accent">
                <GraduationCap className="w-4 h-4" />
                Đánh giá tổng quan học phần ({ketQuaAI.xepLoai} • Điểm chữ {ketQuaAI.diemChu})
              </span>
              <p className="text-xs text-text leading-relaxed">
                {ketQuaAI.nhanXetChiTiet}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded bg-accent-soft border border-accent p-4 space-y-2">
                <h5 className="text-xs font-bold text-accent flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  Điểm mạnh nổi bật
                </h5>
                <ul className="space-y-1.5 text-xs text-accent list-disc pl-4">
                  {ketQuaAI.diemManh.map((dm, idx) => (
                    <li key={idx}>{dm}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded bg-accent-soft border border-accent p-4 space-y-2">
                <h5 className="text-xs font-bold text-accent flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Nội dung cần củng cố
                </h5>
                <ul className="space-y-1.5 text-xs text-accent list-disc pl-4">
                  {ketQuaAI.diemCanCaiThien.map((dc, idx) => (
                    <li key={idx}>{dc}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded bg-bg border border-border p-4 space-y-2">
              <h5 className="text-xs font-bold text-text flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-accent" />
                Lộ trình ôn tập & Cải thiện kết quả học phần
              </h5>
              <ol className="space-y-1.5 text-xs text-text list-decimal pl-4">
                {ketQuaAI.loTrinhDeXuat.map((lt, idx) => (
                  <li key={idx}>{lt}</li>
                ))}
              </ol>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setKetQuaAI(null)}
                className="rounded bg-surface hover:bg-surface px-4 py-2 text-xs font-semibold text-white cursor-pointer"
              >
                Đóng báo cáo
              </button>
            </div>
          </div>
        )}
      </HopThoai>
    </div>
  );
}
