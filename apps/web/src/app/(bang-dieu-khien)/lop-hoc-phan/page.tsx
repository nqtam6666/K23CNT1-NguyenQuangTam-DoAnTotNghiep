'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Video,
  Plus,
  Search,
  KeyRound,
  Users,
  Calendar,
  BookOpen,
  ArrowRight,
  Edit2,
  Trash2,
  Loader2,
  Copy,
  UserCheck,
} from 'lucide-react';
import { mayKhachApi } from '../../../tien-ich/may-khach-api';
import { thongBao } from '../../../tien-ich/thong-bao';
import { TaoLopHocPhanInput, VaiTro, PayloadJwt } from '@lms/chung';
import { HopThoai } from '../../../thanh-phan/hop-thoai';
import { KhungXuongThe } from '../../../thanh-phan/khung-xuong';

export default function TrangLopHocPhan() {
  const queryClient = useQueryClient();
  const [tuKhoa, setTuKhoa] = useState('');
  const [boLocTrangThai, setBoLocTrangThai] = useState<'DANG_HOC' | 'DA_KET_THUC' | 'TAT_CA'>(
    'DANG_HOC',
  );
  const [moModalThamGia, setMoModalThamGia] = useState(false);
  const [moModalTaoLop, setMoModalTaoLop] = useState(false);
  const [idLopDangSua, setIdLopDangSua] = useState<string | null>(null);
  const [lopCanXoa, setLopCanXoa] = useState<any | null>(null);
  const [maThamGia, setMaThamGia] = useState('');

  // Form tạo / sửa lớp
  const [formTaoLop, setFormTaoLop] = useState<TaoLopHocPhanInput>({
    maLopHocPhan: '',
    tenLopHocPhan: '',
    idMonHoc: '',
    idHocKy: '',
    idGiaoVien: '',
    moTa: '',
  });

  // Lấy thông tin user hiện tại (Dùng chung cache với Layout, 0ms latency)
  const { data: nguoiDungHienTai } = useQuery<PayloadJwt>({
    queryKey: ['ho-so-hien-tai'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/xac-thuc/ho-so-hien-tai');
      return res.data?.duLieu;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Lấy danh sách lớp học phần
  const { data: danhSachLop, isLoading } = useQuery({
    queryKey: ['lop-hoc-phan', tuKhoa],
    queryFn: async () => {
      const res = await mayKhachApi.get('/lop-hoc-phan', {
        params: { tuKhoa, kichThuoc: 50 },
      });
      return res.data.duLieu;
    },
  });

  // Lấy danh mục để select khi tạo / sửa lớp (chỉ tải khi modal mở)
  const { data: danhSachMonHoc } = useQuery({
    queryKey: ['mon-hoc-select'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/hoc-vu/mon-hoc', { params: { kichThuoc: 100 } });
      return res.data.duLieu?.duLieu || [];
    },
    enabled: moModalTaoLop,
  });

  const { data: danhSachHocKy } = useQuery({
    queryKey: ['hoc-ky-select'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/hoc-vu/hoc-ky');
      return res.data.duLieu || [];
    },
    enabled: moModalTaoLop,
  });

  const { data: danhSachGiaoVien } = useQuery({
    queryKey: ['giao-vien-select'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/ho-so/giao-vien', { params: { kichThuoc: 100 } });
      return res.data.duLieu?.duLieu || [];
    },
    enabled: moModalTaoLop,
  });

  // Mutations
  const thamGiaMutation = useMutation({
    mutationFn: (code: string) =>
      mayKhachApi.post('/lop-hoc-phan/tham-gia-bang-ma', { maThamGia: code }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['lop-hoc-phan'] });
      setMoModalThamGia(false);
      setMaThamGia('');
      thongBao.thanhCong(
        'Ghi danh thành công',
        res.data?.thongDiep || 'Bạn đã tham gia lớp học phần thành công.',
      );
    },
    onError: (err: any) => {
      const msg = err.response?.data?.thongDiep || 'Mã tham gia không hợp lệ hoặc lỗi kết nối';
      thongBao.thatBai('Tham gia lớp học thất bại', msg);
    },
  });

  const luuLopMutation = useMutation({
    mutationFn: (duLieu: TaoLopHocPhanInput) =>
      idLopDangSua
        ? mayKhachApi.patch(`/lop-hoc-phan/${idLopDangSua}`, duLieu)
        : mayKhachApi.post('/lop-hoc-phan', duLieu),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lop-hoc-phan'] });
      setMoModalTaoLop(false);
      setIdLopDangSua(null);
      setFormTaoLop({
        maLopHocPhan: '',
        tenLopHocPhan: '',
        idMonHoc: '',
        idHocKy: '',
        idGiaoVien: '',
        moTa: '',
      });
      thongBao.thanhCong(
        idLopDangSua ? 'Cập nhật lớp học phần thành công' : 'Tạo lớp học phần thành công',
        'Thông tin lớp học phần đã được lưu trên hệ thống.',
      );
    },
    onError: (err: any) => {
      const msg = err.response?.data?.thongDiep || 'Lỗi khi lưu lớp học phần';
      thongBao.thatBai('Không thể lưu lớp học phần', msg);
    },
  });

  const xoaLopMutation = useMutation({
    mutationFn: (id: string) => mayKhachApi.delete(`/lop-hoc-phan/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lop-hoc-phan'] });
      setLopCanXoa(null);
      thongBao.thanhCong('Đã xóa lớp học phần', 'Lớp học phần đã được xóa khỏi hệ thống.');
    },
    onError: (err: any) => {
      thongBao.loiHeThong(err, 'Không thể xóa lớp học phần này');
    },
  });

  const laAdminHoacGiaoVu =
    nguoiDungHienTai?.vaiTro === VaiTro.QUAN_TRI_VIEN ||
    nguoiDungHienTai?.vaiTro === VaiTro.GIAO_VU;

  const laGiaoVien = nguoiDungHienTai?.vaiTro === VaiTro.GIAO_VIEN;
  const laHocSinh = nguoiDungHienTai?.vaiTro === VaiTro.HOC_SINH;

  const danhSachGoc: any[] = danhSachLop?.duLieu || [];

  const { danhSachHienThi, demDangHoc, demDaKetThuc } = useMemo(() => {
    let dangHoc = 0;
    let daKetThuc = 0;

    const phanLoai = danhSachGoc.map((lop) => {
      const ketThuc = Boolean(lop.daKetThuc || lop.trangThai === 'DA_KET_THUC');
      if (ketThuc) daKetThuc++;
      else dangHoc++;
      return { ...lop, _daKetThuc: ketThuc };
    });

    const loc = phanLoai.filter((lop) => {
      if (boLocTrangThai === 'DANG_HOC') return !lop._daKetThuc;
      if (boLocTrangThai === 'DA_KET_THUC') return lop._daKetThuc;
      return true;
    });

    return {
      danhSachHienThi: loc,
      demDangHoc: dangHoc,
      demDaKetThuc: daKetThuc,
    };
  }, [danhSachGoc, boLocTrangThai]);

  const hocKyTieuBieu = danhSachGoc[0]?.hocKy
    ? `${danhSachGoc[0].hocKy.tenHocKy}${
        danhSachGoc[0].hocKy.namHoc?.tenNamHoc
          ? ` • NĂM HỌC ${danhSachGoc[0].hocKy.namHoc.tenNamHoc}`
          : ''
      }`
    : 'KHÔNG GIAN HỌC TẬP TRỰC TUYẾN';

  const moModalSuaLop = (lop: any) => {
    setIdLopDangSua(lop.id);
    setFormTaoLop({
      maLopHocPhan: lop.maLopHocPhan || '',
      tenLopHocPhan: lop.tenLopHocPhan || '',
      idMonHoc: lop.idMonHoc || lop.monHoc?.id || '',
      idHocKy: lop.idHocKy || lop.hocKy?.id || '',
      idGiaoVien: lop.idGiaoVien || lop.giaoVien?.id || '',
      moTa: lop.moTa || '',
    });
    setMoModalTaoLop(true);
  };

  const saoChepMaMoi = (ma: string) => {
    navigator.clipboard?.writeText(ma);
    thongBao.thanhCong('Đã sao chép mã mời', `Mã tham gia ${ma} đã được lưu vào bộ nhớ tạm.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="eyebrow mb-1">{hocKyTieuBieu}</p>
          <h1 className="text-[22px] font-sans font-bold tracking-tight text-[var(--text)]">
            {laHocSinh
              ? 'Lớp học phần của tôi'
              : laGiaoVien
                ? 'Lớp học phần phụ trách'
                : 'Quản lý Lớp học phần'}
          </h1>
          <p className="text-[13.5px] text-[var(--muted)] mt-1">
            Danh sách các lớp học phần đang tham gia kèm tài liệu, bài tập và phòng học trực tuyến.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {laHocSinh && (
            <button
              type="button"
              onClick={() => {
                setMaThamGia('');
                setMoModalThamGia(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] text-[var(--text)] text-[13px] font-semibold rounded-[var(--radius)] transition-colors cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-[var(--accent)]" strokeWidth={1.75} />
              Tham gia bằng mã
            </button>
          )}

          {laAdminHoacGiaoVu && (
            <button
              type="button"
              onClick={() => {
                setIdLopDangSua(null);
                setFormTaoLop({
                  maLopHocPhan: '',
                  tenLopHocPhan: '',
                  idMonHoc: '',
                  idHocKy: '',
                  idGiaoVien: '',
                  moTa: '',
                });
                setMoModalTaoLop(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-semibold rounded-[var(--radius)] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" strokeWidth={1.75} />
              Tạo Lớp học phần
            </button>
          )}
        </div>
      </div>

      {/* Thanh tìm kiếm & Bộ lọc trạng thái */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--surface)] p-3 rounded-[var(--radius)] border border-[var(--border)]">
        <div className="relative flex-1 max-w-md">
          <Search
            className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2"
            strokeWidth={1.75}
          />
          <input
            type="text"
            placeholder="Tìm theo mã lớp, tên học phần hoặc môn học..."
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--muted)] rounded-[var(--radius)] text-[13px] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setBoLocTrangThai('DANG_HOC')}
            className={`px-3 py-1.5 rounded-[var(--radius)] text-[12px] font-semibold border transition-colors cursor-pointer ${
              boLocTrangThai === 'DANG_HOC'
                ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]'
                : 'bg-transparent text-[var(--muted)] border-transparent hover:text-[var(--text)]'
            }`}
          >
            Đang học ({demDangHoc})
          </button>
          <button
            type="button"
            onClick={() => setBoLocTrangThai('DA_KET_THUC')}
            className={`px-3 py-1.5 rounded-[var(--radius)] text-[12px] font-semibold border transition-colors cursor-pointer ${
              boLocTrangThai === 'DA_KET_THUC'
                ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]'
                : 'bg-transparent text-[var(--muted)] border-transparent hover:text-[var(--text)]'
            }`}
          >
            Đã kết thúc ({demDaKetThuc})
          </button>
          <button
            type="button"
            onClick={() => setBoLocTrangThai('TAT_CA')}
            className={`px-3 py-1.5 rounded-[var(--radius)] text-[12px] font-semibold border transition-colors cursor-pointer ${
              boLocTrangThai === 'TAT_CA'
                ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]'
                : 'bg-transparent text-[var(--muted)] border-transparent hover:text-[var(--text)]'
            }`}
          >
            Tất cả ({danhSachGoc.length})
          </button>
        </div>
      </div>

      {/* Danh sách thẻ lớp học phần */}
      {isLoading ? (
        <KhungXuongThe soLuong={6} />
      ) : danhSachHienThi.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {danhSachHienThi.map((lop: any, idx: number) => {
            const bienMauLop = `var(--lop-${(idx % 8) + 1})`;
            const soTinChi = lop.monHoc?.soTinChi;
            return (
              <div
                key={lop.id}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-xs overflow-hidden hover:border-[var(--accent)] transition-colors flex flex-col group"
              >
                {/* Dải màu 4px nhận diện lớp học phần */}
                <div
                  className="h-[4px] w-full shrink-0"
                  style={{ backgroundColor: bienMauLop }}
                />

                {/* Nội dung chính của thẻ */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2.5 py-0.5 border rounded-[var(--radius)] text-[11px] font-mono font-bold tracking-wider uppercase"
                          style={{
                            color: bienMauLop,
                            borderColor: `color-mix(in srgb, ${bienMauLop} 35%, var(--border))`,
                            backgroundColor: `color-mix(in srgb, ${bienMauLop} 10%, var(--surface))`,
                          }}
                        >
                          {lop.maLopHocPhan}
                        </span>
                        {soTinChi && (
                          <span className="text-[11px] font-mono text-[var(--muted)]">
                            {soTinChi} TC
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {laAdminHoacGiaoVu && (
                          <>
                            <button
                              type="button"
                              onClick={() => moModalSuaLop(lop)}
                              title="Chỉnh sửa lớp học phần"
                              className="p-1.5 text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] rounded-[var(--radius)] transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setLopCanXoa(lop)}
                              title="Xóa lớp học phần"
                              className="p-1.5 text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] rounded-[var(--radius)] transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                            </button>
                          </>
                        )}
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-sans font-semibold bg-[var(--accent-soft)] text-[var(--accent)] px-2.5 py-0.5 rounded-[var(--radius)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                          {lop._daKetThuc ? 'Đã kết thúc' : 'Đang học'}
                        </span>
                      </div>
                    </div>

                    <Link href={`/lop-hoc-phan/${lop.id}`} className="block mt-3">
                      <h3 className="font-sans font-bold text-[16px] text-[var(--text)] line-clamp-1 group-hover:text-[var(--accent)] transition-colors">
                        {lop.tenLopHocPhan}
                      </h3>
                    </Link>

                    <p className="text-[12.5px] text-[var(--muted)] mt-1 flex items-center gap-1.5 line-clamp-1">
                      <BookOpen
                        className="w-3.5 h-3.5 shrink-0 text-[var(--accent)]"
                        strokeWidth={1.75}
                      />
                      <span>{lop.monHoc?.tenMonHoc || 'Chưa gắn môn học'}</span>
                    </p>
                  </div>

                  {/* Thông tin giảng viên, học kỳ, sĩ số */}
                  <div className="mt-4 pt-3.5 border-t border-[var(--border)] space-y-2 text-[12.5px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[var(--muted)] flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-[var(--accent)]" strokeWidth={1.75} />
                        Giảng viên:
                      </span>
                      <span className="font-medium text-[var(--text)] truncate max-w-[190px]">
                        {lop.giaoVien?.nguoiDung?.hoTen || 'Chưa phân công'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[var(--muted)] flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" strokeWidth={1.75} />
                        Học kỳ:
                      </span>
                      <span className="font-mono text-[12px] text-[var(--text)]">
                        {lop.hocKy?.tenHocKy || '—'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[var(--muted)] flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[var(--accent)]" strokeWidth={1.75} />
                        Sĩ số:
                      </span>
                      <span className="font-mono text-[12px] font-semibold text-[var(--text)] tabular-nums">
                        {lop._count?.danhSachGhiDanh || 0} sinh viên
                      </span>
                    </div>

                    {(laAdminHoacGiaoVu || laGiaoVien) && lop.maThamGia && (
                      <div className="pt-1 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono text-[var(--muted)]">Mã mời:</span>
                        <button
                          type="button"
                          onClick={() => saoChepMaMoi(lop.maThamGia)}
                          title="Sao chép mã mời lớp học"
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--bg)] hover:border-[var(--accent)] font-mono text-[11px] font-bold text-[var(--accent)] transition-colors cursor-pointer"
                        >
                          <span>{lop.maThamGia}</span>
                          <Copy className="w-3 h-3" strokeWidth={1.75} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chân thẻ: Phòng học trực tuyến & Vào lớp */}
                <div className="px-5 py-3 bg-[var(--bg)] border-t border-[var(--border)] flex items-center justify-between gap-2">
                  <Link
                    href={`/lop-hoc-phan/${lop.id}/phong-hoc`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] text-[12px] font-semibold text-[var(--text)] transition-colors"
                  >
                    <Video className="w-3.5 h-3.5 text-[var(--accent)]" strokeWidth={1.75} />
                    <span>Phòng học</span>
                  </Link>

                  <Link
                    href={`/lop-hoc-phan/${lop.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[var(--radius)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[12.5px] font-semibold transition-colors"
                  >
                    <span>Vào lớp</span>
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-14 bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-[var(--radius)]">
          <Video className="w-10 h-10 text-[var(--muted)] mx-auto mb-3" strokeWidth={1.5} />
          <h3 className="font-sans font-bold text-[var(--text)] text-[15px]">
            Chưa có lớp học phần phù hợp
          </h3>
          <p className="text-[13px] text-[var(--muted)] mt-1 max-w-sm mx-auto">
            {laHocSinh
              ? 'Bạn chưa được ghi danh vào lớp học phần nào trong mục này. Nhấn "Tham gia bằng mã" nếu có mã mời từ giảng viên.'
              : 'Hãy bắt đầu tạo lớp học phần để phân công giảng dạy và xếp thời khóa biểu.'}
          </p>
        </div>
      )}

      {/* MODAL THAM GIA BẰNG MÃ */}
      <HopThoai
        mo={moModalThamGia}
        onDong={() => setMoModalThamGia(false)}
        tieuDe="Tham gia bằng mã mời"
        moTa="Nhập mã lớp được cấp bởi giảng viên phụ trách học phần"
        kichThuoc="nho"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-[var(--accent-soft)] rounded-[var(--radius)] text-[var(--accent)]">
            <KeyRound className="w-5 h-5 shrink-0" />
            <p className="text-xs">Mã mời sẽ tự động ghi danh bạn vào đúng lớp học phần tương ứng.</p>
          </div>

          <div>
            <input
              type="text"
              maxLength={10}
              placeholder="VD: 7KZ9A2"
              value={maThamGia}
              onChange={(e) => setMaThamGia(e.target.value.toUpperCase())}
              className="w-full text-center text-2xl font-mono font-bold tracking-widest px-4 py-3 border border-[var(--border)] bg-[var(--bg)] rounded-[var(--radius)] focus:border-[var(--accent)] focus:outline-none uppercase"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setMoModalThamGia(false)}
              className="px-4 py-2.5 border border-[var(--border)] text-[var(--text)] rounded-[var(--radius)] text-xs font-semibold hover:bg-[var(--bg)] cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={!maThamGia.trim() || thamGiaMutation.isPending}
              onClick={() => thamGiaMutation.mutate(maThamGia.trim())}
              className="px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-[var(--radius)] text-xs font-semibold disabled:opacity-50 cursor-pointer"
            >
              {thamGiaMutation.isPending ? 'Đang xác thực...' : 'Tham gia ngay'}
            </button>
          </div>
        </div>
      </HopThoai>

      {/* MODAL TẠO / SỬA LỚP HỌC PHẦN */}
      <HopThoai
        mo={moModalTaoLop}
        onDong={() => {
          setMoModalTaoLop(false);
          setIdLopDangSua(null);
        }}
        tieuDe={idLopDangSua ? 'Chỉnh sửa Lớp học phần' : 'Tạo Lớp học phần mới'}
        moTa="Điền thông tin môn học, học kỳ và giảng viên phụ trách"
        kichThuoc="vua"
      >
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                Mã lớp học phần
              </label>
              <input
                type="text"
                placeholder="VD: IT3080-01"
                value={formTaoLop.maLopHocPhan}
                onChange={(e) =>
                  setFormTaoLop({ ...formTaoLop, maLopHocPhan: e.target.value.toUpperCase() })
                }
                className="w-full px-3.5 py-2.5 border border-[var(--border)] bg-[var(--bg)] rounded-[var(--radius)] text-sm font-mono focus:border-[var(--accent)] focus:outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                Tên lớp học phần
              </label>
              <input
                type="text"
                placeholder="VD: Trí tuệ nhân tạo và Ứng dụng - Nhóm 01"
                value={formTaoLop.tenLopHocPhan}
                onChange={(e) => setFormTaoLop({ ...formTaoLop, tenLopHocPhan: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[var(--border)] bg-[var(--bg)] rounded-[var(--radius)] text-sm focus:border-[var(--accent)] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Môn học</label>
                <select
                  value={formTaoLop.idMonHoc}
                  onChange={(e) => setFormTaoLop({ ...formTaoLop, idMonHoc: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[var(--border)] rounded-[var(--radius)] text-sm bg-[var(--surface)] focus:border-[var(--accent)] focus:outline-none cursor-pointer"
                >
                  <option value="">-- Chọn môn học --</option>
                  {danhSachMonHoc?.map((mh: any) => (
                    <option key={mh.id} value={mh.id}>
                      {mh.maMonHoc} - {mh.tenMonHoc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Học kỳ</label>
                <select
                  value={formTaoLop.idHocKy}
                  onChange={(e) => setFormTaoLop({ ...formTaoLop, idHocKy: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[var(--border)] rounded-[var(--radius)] text-sm bg-[var(--surface)] focus:border-[var(--accent)] focus:outline-none cursor-pointer"
                >
                  <option value="">-- Chọn học kỳ --</option>
                  {danhSachHocKy?.map((hk: any) => (
                    <option key={hk.id} value={hk.id}>
                      {hk.tenHocKy} ({hk.namHoc?.tenNamHoc})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                Giảng viên phụ trách
              </label>
              <select
                value={formTaoLop.idGiaoVien}
                onChange={(e) => setFormTaoLop({ ...formTaoLop, idGiaoVien: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[var(--border)] rounded-[var(--radius)] text-sm bg-[var(--surface)] focus:border-[var(--accent)] focus:outline-none cursor-pointer"
              >
                <option value="">-- Chọn giảng viên --</option>
                {danhSachGiaoVien?.map((gv: any) => (
                  <option key={gv.id} value={gv.id}>
                    {gv.maGiaoVien} - {gv.nguoiDung.hoTen} ({gv.chuyenMon || 'Giảng dạy'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                Mô tả tóm tắt
              </label>
              <textarea
                rows={2}
                placeholder="Mục tiêu và yêu cầu môn học..."
                value={formTaoLop.moTa || ''}
                onChange={(e) => setFormTaoLop({ ...formTaoLop, moTa: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-[var(--border)] bg-[var(--bg)] rounded-[var(--radius)] text-sm focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => {
                setMoModalTaoLop(false);
                setIdLopDangSua(null);
              }}
              className="px-4 py-2.5 border border-[var(--border)] text-[var(--text)] rounded-[var(--radius)] text-xs font-semibold hover:bg-[var(--bg)] cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={
                !formTaoLop.maLopHocPhan ||
                !formTaoLop.idMonHoc ||
                !formTaoLop.idHocKy ||
                !formTaoLop.idGiaoVien ||
                luuLopMutation.isPending
              }
              onClick={() => luuLopMutation.mutate(formTaoLop)}
              className="px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-[var(--radius)] text-xs font-semibold disabled:opacity-50 cursor-pointer"
            >
              {luuLopMutation.isPending
                ? 'Đang lưu...'
                : idLopDangSua
                  ? 'Lưu thay đổi'
                  : 'Tạo lớp'}
            </button>
          </div>
        </div>
      </HopThoai>

      {/* MODAL XÁC NHẬN XÓA LỚP HỌC PHẦN */}
      <HopThoai
        mo={Boolean(lopCanXoa)}
        onDong={() => setLopCanXoa(null)}
        tieuDe="Xác nhận xóa Lớp học phần"
        moTa="Lớp học phần chỉ có thể xóa khi chưa phát sinh dữ liệu buổi học hoặc bài kiểm tra."
        kichThuoc="nho"
      >
        <div className="space-y-4">
          {lopCanXoa && (
            <div className="p-3.5 rounded-[var(--radius)] bg-[var(--danger-soft)] border border-[var(--danger)] text-xs text-[var(--text)] space-y-1">
              <p className="font-semibold text-[var(--danger)]">
                Bạn có chắc chắn muốn xóa lớp học phần này?
              </p>
              <p>
                Mã lớp: <span className="font-mono font-semibold">{lopCanXoa.maLopHocPhan}</span>
              </p>
              <p>
                Tên lớp: <span className="font-semibold">{lopCanXoa.tenLopHocPhan}</span>
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setLopCanXoa(null)}
              className="px-4 py-2 border border-[var(--border)] text-[var(--text)] rounded-[var(--radius)] text-xs font-semibold hover:bg-[var(--bg)] cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={xoaLopMutation.isPending}
              onClick={() => lopCanXoa && xoaLopMutation.mutate(lopCanXoa.id)}
              className="px-4 py-2 bg-[var(--danger)] text-white rounded-[var(--radius)] text-xs font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {xoaLopMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Xác nhận xóa
            </button>
          </div>
        </div>
      </HopThoai>
    </div>
  );
}
