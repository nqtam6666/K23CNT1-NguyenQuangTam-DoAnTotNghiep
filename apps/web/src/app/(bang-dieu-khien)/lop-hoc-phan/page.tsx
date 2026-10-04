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
      thongBao.thanhCong('Ghi danh thành công!', res.data?.thongDiep || 'Bạn đã tham gia lớp học phần thành công.');
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
      thongBao.thanhCong('Tạo lớp học phần thành công!', 'Lớp học phần mới đã được khởi tạo trên hệ thống.');
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Không gian Lớp học phần</h1>
          <p className="text-sm text-slate-500 mt-1">
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
              className="inline-flex items-center gap-2 px-4 py-2 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-lg transition-colors shadow-sm"
            >
              <KeyRound className="w-4 h-4" />
              Tham gia bằng mã
            </button>
          )}

          {laAdminHoacGiaoVu && (
            <button
              onClick={() => {
                setThongBaoLoi(null);
                setMoModalTaoLop(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Tạo Lớp học phần
            </button>
          )}
        </div>
      </div>

      {/* Tìm kiếm */}
      <div className="flex items-center gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã hoặc tên lớp học phần..."
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>
      </div>

      {/* Danh sách thẻ lớp học phần */}
      {isLoading ? (
        <div className="text-center py-16 text-slate-400">Đang tải danh sách lớp học phần...</div>
      ) : danhSachLop?.duLieu && danhSachLop.duLieu.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {danhSachLop.duLieu.map((lop: any) => (
            <div
              key={lop.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col group"
            >
              {/* Card Banner */}
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white">
                <div className="flex items-start justify-between">
                  <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-md text-xs font-mono font-bold tracking-wider uppercase">
                    {lop.maLopHocPhan}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                    Sẵn sàng
                  </span>
                </div>
                <h3 className="font-bold text-lg mt-3 line-clamp-1 group-hover:text-indigo-100 transition-colors">
                  {lop.tenLopHocPhan}
                </h3>
                <p className="text-xs text-indigo-100/90 mt-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span>{lop.monHoc?.tenMonHoc || 'Chưa gắn môn'}</span>
                </p>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Học kỳ:
                    </span>
                    <span className="font-medium text-slate-800">
                      {lop.hocKy?.tenHocKy || '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> Sĩ số:
                    </span>
                    <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {lop._count?.danhSachGhiDanh || 0} học sinh
                    </span>
                  </div>

                  {lop.giaoVien && (
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        {lop.giaoVien.nguoiDung.hoTen.charAt(0)}
                      </div>
                      <div className="truncate">
                        <p className="font-medium text-slate-900 truncate">
                          {lop.giaoVien.nguoiDung.hoTen}
                        </p>
                        <p className="text-[11px] text-slate-400">Giáo viên phụ trách</p>
                      </div>
                    </div>
                  )}

                  {laAdminHoacGiaoVu && lop.maThamGia && (
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                      <span className="text-slate-500 font-mono text-[11px]">Mã mời:</span>
                      <span className="font-mono font-bold text-indigo-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {lop.maThamGia}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action button */}
                <Link
                  href={`/lop-hoc-phan/${lop.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <span>Truy cập Lớp học</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl">
          <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800 text-base">Chưa có lớp học phần nào</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            {laHocSinh
              ? 'Bạn chưa được ghi danh vào lớp học phần nào. Nhấn "Tham gia bằng mã" nếu có mã mời từ giáo viên.'
              : 'Hãy bắt đầu tạo lớp học phần để phân công giảng dạy và xếp thời khóa biểu.'}
          </p>
        </div>
      )}

      {/* MODAL THAM GIA BẰNG MÃ */}
      {moModalThamGia && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Tham gia bằng mã mời</h3>
                <p className="text-xs text-slate-500">Nhập mã lớp 6 ký tự được cấp bởi giáo viên</p>
              </div>
            </div>

            {thongBaoLoi && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{thongBaoLoi}</span>
              </div>
            )}

            <div>
              <input
                type="text"
                maxLength={10}
                placeholder="VD: 7KZ9A2"
                value={maThamGia}
                onChange={(e) => setMaThamGia(e.target.value.toUpperCase())}
                className="w-full text-center text-2xl font-mono font-bold tracking-widest px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setMoModalThamGia(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={!maThamGia.trim() || thamGiaMutation.isPending}
                onClick={() => thamGiaMutation.mutate(maThamGia.trim())}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {thamGiaMutation.isPending ? 'Đang xác thực...' : 'Tham gia ngay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TẠO LỚP HỌC PHẦN */}
      {moModalTaoLop && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Tạo Lớp học phần mới</h3>
            {thongBaoLoi && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{thongBaoLoi}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Mã lớp học phần</label>
                <input
                  type="text"
                  placeholder="VD: LHP_TOAN_10A1"
                  value={formTaoLop.maLopHocPhan}
                  onChange={(e) =>
                    setFormTaoLop({ ...formTaoLop, maLopHocPhan: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tên lớp học phần</label>
                <input
                  type="text"
                  placeholder="VD: Toán 10 - Lớp nâng cao A1"
                  value={formTaoLop.tenLopHocPhan}
                  onChange={(e) => setFormTaoLop({ ...formTaoLop, tenLopHocPhan: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Môn học</label>
                  <select
                    value={formTaoLop.idMonHoc}
                    onChange={(e) => setFormTaoLop({ ...formTaoLop, idMonHoc: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
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
                  <label className="block text-xs font-medium text-slate-700 mb-1">Học kỳ</label>
                  <select
                    value={formTaoLop.idHocKy}
                    onChange={(e) => setFormTaoLop({ ...formTaoLop, idHocKy: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
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
                <label className="block text-xs font-medium text-slate-700 mb-1">Giáo viên phụ trách</label>
                <select
                  value={formTaoLop.idGiaoVien}
                  onChange={(e) => setFormTaoLop({ ...formTaoLop, idGiaoVien: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
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
                <label className="block text-xs font-medium text-slate-700 mb-1">Mô tả tóm tắt</label>
                <textarea
                  rows={2}
                  placeholder="Mục tiêu và yêu cầu môn học..."
                  value={formTaoLop.moTa || ''}
                  onChange={(e) => setFormTaoLop({ ...formTaoLop, moTa: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setMoModalTaoLop(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50"
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
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {taoLopMutation.isPending ? 'Đang tạo...' : 'Tạo lớp'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
