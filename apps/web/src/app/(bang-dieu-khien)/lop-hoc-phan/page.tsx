'use client';

import { useState } from 'react';
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
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { mayKhachApi } from '../../../tien-ich/may-khach-api';
import { thongBao } from '../../../tien-ich/thong-bao';
import { LopHocPhan, TaoLopHocPhanInput, VaiTro, PayloadJwt } from '@lms/chung';
import { HopThoai } from '../../../thanh-phan/hop-thoai';
import { KhungXuongThe } from '../../../thanh-phan/khung-xuong';

export default function TrangLopHocPhan() {
  const queryClient = useQueryClient();
  const [tuKhoa, setTuKhoa] = useState('');
  const [moModalThamGia, setMoModalThamGia] = useState(false);
  const [moModalTaoLop, setMoModalTaoLop] = useState(false);
  const [maThamGia, setMaThamGia] = useState('');
  const [thongBaoLoi, setThongBaoLoi] = useState<string | null>(null);

  // Form tạo lớp
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

  // Lấy danh mục để select khi tạo lớp (chỉ tải khi modal mở)
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
      setThongBaoLoi(null);
      thongBao.thanhCong(
        'Ghi danh thành công!',
        res.data?.thongDiep || 'Bạn đã tham gia lớp học phần thành công.',
      );
    },
    onError: (err: any) => {
      const msg = err.response?.data?.thongDiep || 'Mã tham gia không hợp lệ hoặc lỗi kết nối';
      setThongBaoLoi(msg);
      thongBao.thatBai('Tham gia lớp học thất bại', msg);
    },
  });

  const taoLopMutation = useMutation({
    mutationFn: (duLieu: TaoLopHocPhanInput) => mayKhachApi.post('/lop-hoc-phan', duLieu),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lop-hoc-phan'] });
      setMoModalTaoLop(false);
      setFormTaoLop({
        maLopHocPhan: '',
        tenLopHocPhan: '',
        idMonHoc: '',
        idHocKy: '',
        idGiaoVien: '',
        moTa: '',
      });
      setThongBaoLoi(null);
      thongBao.thanhCong(
        'Tạo lớp học phần thành công!',
        'Lớp học phần mới đã được khởi tạo trên hệ thống.',
      );
    },
    onError: (err: any) => {
      const msg = err.response?.data?.thongDiep || 'Lỗi khi tạo lớp học phần';
      setThongBaoLoi(msg);
      thongBao.thatBai('Tạo lớp thất bại', msg);
    },
  });

  const laAdminHoacGiaoVu =
    nguoiDungHienTai?.vaiTro === VaiTro.QUAN_TRI_VIEN ||
    nguoiDungHienTai?.vaiTro === VaiTro.GIAO_VU;

  const laHocSinh = nguoiDungHienTai?.vaiTro === VaiTro.HOC_SINH;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="eyebrow mb-1">Không gian học tập</p>
          <h1 className="text-[22px] font-mono font-bold tracking-tight text-[var(--text)]">
            Không gian Lớp học phần
          </h1>
          <p className="text-[14px] text-[var(--muted)] mt-1">
            Không gian học tập trực tuyến tích hợp phòng LiveKit SFU, tài liệu và thời khóa biểu
          </p>
        </div>

        <div className="flex items-center gap-3">
          {laHocSinh && (
            <button
              onClick={() => {
                setMaThamGia('');
                setThongBaoLoi(null);
                setMoModalThamGia(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-[11px] border border-[var(--border)] bg-[var(--surface)] hover:brightness-95 text-[var(--text)] text-[13px] font-semibold rounded-[4px] transition-all cursor-pointer"
            >
              <KeyRound className="w-[18px] h-[18px] text-[var(--accent)]" strokeWidth={1.5} />
              Tham gia bằng mã
            </button>
          )}

          {laAdminHoacGiaoVu && (
            <button
              onClick={() => {
                setThongBaoLoi(null);
                setMoModalTaoLop(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-[11px] bg-[var(--accent)] hover:brightness-95 text-white text-[13px] font-semibold rounded-[4px] transition-all shadow-[0_2px_8px_-2px_color-mix(in_srgb,var(--accent)_30%,transparent)] cursor-pointer"
            >
              <Plus className="w-[18px] h-[18px]" strokeWidth={1.5} />
              Tạo Lớp học phần
            </button>
          )}
        </div>
      </div>

      {/* Tìm kiếm */}
      <div className="flex items-center gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Tìm theo mã hoặc tên lớp học phần..."
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--muted)] rounded-[4px] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors"
          />
        </div>
      </div>

      {/* Danh sách thẻ lớp học phần */}
      {isLoading ? (
        <KhungXuongThe soLuong={6} />
      ) : danhSachLop?.duLieu && danhSachLop.duLieu.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {danhSachLop.duLieu.map((lop: any) => (
            <div
              key={lop.id}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-[4px] overflow-hidden hover:border-[var(--accent)] transition-colors flex flex-col group"
            >
              {/* Card Banner */}
              <div className="bg-[var(--bg)] border-b border-[var(--border)] p-5">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 bg-[var(--surface)] border border-[var(--border)] rounded-[4px] text-[11px] font-mono font-bold tracking-wider uppercase text-[var(--accent)]">
                    {lop.maLopHocPhan}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--border)] px-2 py-0.5 rounded-[4px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
                    Sẵn sàng
                  </span>
                </div>
                <h3 className="font-mono font-bold text-[16px] text-[var(--text)] mt-3 line-clamp-1 group-hover:text-[var(--accent)] transition-colors">
                  {lop.tenLopHocPhan}
                </h3>
                <p className="text-xs text-[var(--muted)] mt-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 shrink-0 text-[var(--accent)]" strokeWidth={1.5} />
                  <span>{lop.monHoc?.tenMonHoc || 'Chưa gắn môn'}</span>
                </p>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3 text-xs text-[var(--muted)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--muted)] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} /> Học kỳ:
                    </span>
                    <span className="font-mono font-medium text-[var(--text)]">{lop.hocKy?.tenHocKy || '—'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[var(--muted)] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" strokeWidth={1.5} /> Sĩ số:
                    </span>
                    <span className="font-mono font-semibold text-[var(--text)] bg-[var(--bg)] px-2 py-0.5 rounded-[4px] border border-[var(--border)]">
                      {lop._count?.danhSachGhiDanh || 0} học sinh
                    </span>
                  </div>

                  {lop.giaoVien && (
                    <div className="pt-2.5 border-t border-[var(--border)] flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-[4px] bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--border)] font-mono font-bold flex items-center justify-center text-xs">
                        {lop.giaoVien.nguoiDung.hoTen.charAt(0)}
                      </div>
                      <div className="truncate">
                        <p className="font-medium text-[var(--text)] truncate">
                          {lop.giaoVien.nguoiDung.hoTen}
                        </p>
                        <p className="text-[11px] font-mono text-[var(--muted)]">Giáo viên phụ trách</p>
                      </div>
                    </div>
                  )}

                  {laAdminHoacGiaoVu && lop.maThamGia && (
                    <div className="p-2 bg-[var(--bg)] rounded-[4px] border border-[var(--border)] flex items-center justify-between">
                      <span className="text-[var(--muted)] font-mono text-[11px]">Mã mời:</span>
                      <span className="font-mono font-bold text-[var(--accent)] bg-[var(--surface)] px-2 py-0.5 rounded-[4px] border border-[var(--border)]">
                        {lop.maThamGia}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action button */}
                <Link
                  href={`/lop-hoc-phan/${lop.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-[11px] px-4 bg-[var(--accent)] hover:brightness-95 text-white text-[13px] font-semibold rounded-[4px] transition-all shadow-[0_2px_8px_-2px_color-mix(in_srgb,var(--accent)_30%,transparent)]"
                >
                  <span>Truy cập Lớp học</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-14 bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-[4px]">
          <Video className="w-10 h-10 text-[var(--muted)] mx-auto mb-3" strokeWidth={1.5} />
          <h3 className="font-mono font-bold text-[var(--text)] text-[15px]">Chưa có lớp học phần nào</h3>
          <p className="text-[13px] text-[var(--muted)] mt-1 max-w-sm mx-auto">
            {laHocSinh
              ? 'Bạn chưa được ghi danh vào lớp học phần nào. Nhấn "Tham gia bằng mã" nếu có mã mời từ giáo viên.'
              : 'Hãy bắt đầu tạo lớp học phần để phân công giảng dạy và xếp thời khóa biểu.'}
          </p>
        </div>
      )}

      {/* MODAL THAM GIA BẰNG MÃ */}
      <HopThoai
        mo={moModalThamGia}
        onDong={() => setMoModalThamGia(false)}
        tieuDe="Tham gia bằng mã mời"
        moTa="Nhập mã lớp 6 ký tự được cấp bởi giáo viên bộ môn"
        kichThuoc="nho"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-accent-soft rounded text-accent">
            <KeyRound className="w-5 h-5 shrink-0" />
            <p className="text-xs">Mã mời sẽ tự động phân bạn vào đúng lớp học phần tương ứng.</p>
          </div>

          <div>
            <input
              type="text"
              maxLength={10}
              placeholder="VD: 7KZ9A2"
              value={maThamGia}
              onChange={(e) => setMaThamGia(e.target.value.toUpperCase())}
              className="w-full text-center text-2xl font-mono font-bold tracking-widest px-4 py-3 border border-border rounded focus:ring-2 focus:ring-accent focus:outline-none uppercase"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setMoModalThamGia(false)}
              className="px-4 py-2.5 border border-border text-text rounded text-sm font-medium hover:bg-bg cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={!maThamGia.trim() || thamGiaMutation.isPending}
              onClick={() => thamGiaMutation.mutate(maThamGia.trim())}
              className="px-5 py-2.5 bg-accent hover:bg-accent text-white rounded text-sm font-semibold disabled:opacity-50 cursor-pointer shadow-sm shadow-emerald-600/20"
            >
              {thamGiaMutation.isPending ? 'Đang xác thực...' : 'Tham gia ngay'}
            </button>
          </div>
        </div>
      </HopThoai>

      {/* MODAL TẠO LỚP HỌC PHẦN */}
      <HopThoai
        mo={moModalTaoLop}
        onDong={() => setMoModalTaoLop(false)}
        tieuDe="Tạo Lớp học phần mới"
        moTa="Điền thông tin môn học, học kỳ và giáo viên phụ trách để mở lớp mới"
        kichThuoc="vua"
      >
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Mã lớp học phần
              </label>
              <input
                type="text"
                placeholder="VD: LHP_TOAN_10A1"
                value={formTaoLop.maLopHocPhan}
                onChange={(e) =>
                  setFormTaoLop({ ...formTaoLop, maLopHocPhan: e.target.value.toUpperCase() })
                }
                className="w-full px-3.5 py-2.5 border border-border rounded text-sm font-mono focus:ring-2 focus:ring-accent uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Tên lớp học phần
              </label>
              <input
                type="text"
                placeholder="VD: Toán 10 - Lớp nâng cao A1"
                value={formTaoLop.tenLopHocPhan}
                onChange={(e) => setFormTaoLop({ ...formTaoLop, tenLopHocPhan: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-border rounded text-sm focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text mb-1">Môn học</label>
                <select
                  value={formTaoLop.idMonHoc}
                  onChange={(e) => setFormTaoLop({ ...formTaoLop, idMonHoc: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-border rounded text-sm bg-surface focus:ring-2 focus:ring-accent cursor-pointer"
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
                <label className="block text-xs font-semibold text-text mb-1">Học kỳ</label>
                <select
                  value={formTaoLop.idHocKy}
                  onChange={(e) => setFormTaoLop({ ...formTaoLop, idHocKy: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-border rounded text-sm bg-surface focus:ring-2 focus:ring-accent cursor-pointer"
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
              <label className="block text-xs font-semibold text-text mb-1">
                Giáo viên phụ trách
              </label>
              <select
                value={formTaoLop.idGiaoVien}
                onChange={(e) => setFormTaoLop({ ...formTaoLop, idGiaoVien: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-border rounded text-sm bg-surface focus:ring-2 focus:ring-accent cursor-pointer"
              >
                <option value="">-- Chọn giáo viên --</option>
                {danhSachGiaoVien?.map((gv: any) => (
                  <option key={gv.id} value={gv.id}>
                    {gv.maGiaoVien} - {gv.nguoiDung.hoTen} ({gv.chuyenMon || 'Giảng dạy'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Mô tả tóm tắt
              </label>
              <textarea
                rows={2}
                placeholder="Mục tiêu và yêu cầu môn học..."
                value={formTaoLop.moTa || ''}
                onChange={(e) => setFormTaoLop({ ...formTaoLop, moTa: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-border rounded text-sm focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setMoModalTaoLop(false)}
              className="px-4 py-2.5 border border-border text-text rounded text-sm font-medium hover:bg-bg cursor-pointer"
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
                taoLopMutation.isPending
              }
              onClick={() => taoLopMutation.mutate(formTaoLop)}
              className="px-5 py-2.5 bg-accent hover:bg-accent text-white rounded text-sm font-semibold disabled:opacity-50 cursor-pointer shadow-sm shadow-emerald-600/20"
            >
              {taoLopMutation.isPending ? 'Đang tạo...' : 'Tạo lớp'}
            </button>
          </div>
        </div>
      </HopThoai>
    </div>
  );
}
