'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Users,
  Video,
  Clock,
  Plus,
  Trash2,
  BookOpen,
  ArrowLeft,
  Sparkles,
  School,
  AlertCircle,
  CheckCircle2,
  UserPlus,
} from 'lucide-react';
import { mayKhachApi } from '../../../../tien-ich/may-khach-api';
import { thongBao } from '../../../../tien-ich/thong-bao';
import {
  LopHocPhan,
  ThoiKhoaBieu,
  BuoiHoc,
  GhiDanh,
  TaoThoiKhoaBieuInput,
  VaiTro,
  PayloadJwt,
} from '@lms/chung';

export default function TrangChiTietLopHocPhan({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [tabHienTai, setTabHienTai] = useState<'thoi-khoa-bieu' | 'hoc-sinh'>('thoi-khoa-bieu');

  // Modals
  const [moModalTkb, setMoModalTkb] = useState(false);
  const [moModalGhiDanh, setMoModalGhiDanh] = useState(false);
  const [moModalImportLop, setMoModalImportLop] = useState(false);
  const [thongBaoLoi, setThongBaoLoi] = useState<string | null>(null);
  const [thongBaoThanhCong, setThongBaoThanhCong] = useState<string | null>(null);

  // Form TKB
  const [formTkb, setFormTkb] = useState<TaoThoiKhoaBieuInput>({
    thuTrongTuan: 2,
    tietBatDau: 1,
    soTiet: 3,
    phongHoc: '',
  });

  // Form Ghi danh
  const [idHocSinhChon, setIdHocSinhChon] = useState('');
  const [idLopHanhChinhChon, setIdLopHanhChinhChon] = useState('');

  // Lấy profile user
  const { data: nguoiDungHienTai } = useQuery<PayloadJwt>({
    queryKey: ['nguoi-dung-hien-tai'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/xac-thuc/ho-so-hien-tai');
      return res.data.duLieu;
    },
  });

  // Lấy chi tiết lớp
  const { data: lopHocPhan, isLoading: dangTaiLop, error: loiLop } = useQuery<LopHocPhan>({
    queryKey: ['chi-tiet-lop', id],
    queryFn: async () => {
      const res = await mayKhachApi.get(`/lop-hoc-phan/${id}`);
      return res.data.duLieu;
    },
    retry: false,
  });

  // Lấy thời khóa biểu lớp
  const { data: danhSachTkb, isLoading: dangTaiTkb } = useQuery<ThoiKhoaBieu[]>({
    queryKey: ['tkb-lop', id],
    queryFn: async () => {
      const res = await mayKhachApi.get(`/thoi-khoa-bieu/lop/${id}`);
      return res.data.duLieu || [];
    },
    enabled: !!lopHocPhan,
  });

  // Lấy danh sách buổi học
  const { data: danhSachBuoiHoc, isLoading: dangTaiBuoiHoc } = useQuery<BuoiHoc[]>({
    queryKey: ['buoi-hoc-lop', id],
    queryFn: async () => {
      const res = await mayKhachApi.get(`/thoi-khoa-bieu/buoi-hoc/lop/${id}`);
      return res.data.duLieu || [];
    },
    enabled: !!lopHocPhan,
  });

  // Lấy danh sách học sinh ghi danh
  const { data: danhSachGhiDanh, isLoading: dangTaiGhiDanh } = useQuery<GhiDanh[]>({
    queryKey: ['ghi-danh-lop', id],
    queryFn: async () => {
      const res = await mayKhachApi.get(`/lop-hoc-phan/${id}/ghi-danh`);
      return res.data.duLieu || [];
    },
    enabled: !!lopHocPhan,
  });

  // Lấy danh sách học sinh (để giáo vụ chọn thêm)
  const { data: tatCaHocSinh } = useQuery({
    queryKey: ['hoc-sinh-select'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/ho-so/hoc-sinh', { params: { kichThuoc: 100 } });
      return res.data.duLieu?.duLieu || [];
    },
    enabled: moModalGhiDanh,
  });

  // Lấy danh sách lớp hành chính (để giáo vụ chọn import)
  const { data: danhSachLopHanhChinh } = useQuery({
    queryKey: ['lop-hanh-chinh-select'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/hoc-vu/lop-hanh-chinh', { params: { kichThuoc: 50 } });
      return res.data.duLieu?.duLieu || [];
    },
    enabled: moModalImportLop,
  });

  // Mutations
  const taoTkbMutation = useMutation({
    mutationFn: (duLieu: TaoThoiKhoaBieuInput) =>
      mayKhachApi.post(`/thoi-khoa-bieu/lop/${id}`, duLieu),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tkb-lop', id] });
      setMoModalTkb(false);
      setThongBaoLoi(null);
      setThongBaoThanhCong('Thêm tiết học thành công');
      thongBao.thanhCong('Thêm tiết học thành công!');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.thongDiep || 'Lỗi khi thêm tiết học (trùng lịch)';
      setThongBaoLoi(msg);
      thongBao.thatBai('Thêm tiết học thất bại', msg);
    },
  });

  const sinhBuoiHocMutation = useMutation({
    mutationFn: () => mayKhachApi.post(`/thoi-khoa-bieu/lop/${id}/sinh-buoi-hoc`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['buoi-hoc-lop', id] });
      const msg = res.data.duLieu?.thongBao || 'Đã sinh danh sách buổi học tự động';
      setThongBaoThanhCong(msg);
      thongBao.thanhCong('Sinh lịch học thành công!', msg);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.thongDiep || 'Lỗi khi sinh buổi học';
      setThongBaoLoi(msg);
      thongBao.thatBai('Sinh buổi học thất bại', msg);
    },
  });

  const ghiDanhMutation = useMutation({
    mutationFn: (idHocSinh: string) =>
      mayKhachApi.post(`/lop-hoc-phan/${id}/ghi-danh`, { idHocSinh }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ghi-danh-lop', id] });
      queryClient.invalidateQueries({ queryKey: ['chi-tiet-lop', id] });
      setMoModalGhiDanh(false);
      setIdHocSinhChon('');
      setThongBaoLoi(null);
      setThongBaoThanhCong('Ghi danh học sinh thành công');
      thongBao.thanhCong('Ghi danh thành công!', 'Đã thêm học sinh vào lớp học phần.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.thongDiep || 'Lỗi khi ghi danh';
      setThongBaoLoi(msg);
      thongBao.thatBai('Ghi danh thất bại', msg);
    },
  });

  const ghiDanhTheoLopMutation = useMutation({
    mutationFn: (idLopHanhChinh: string) =>
      mayKhachApi.post(`/lop-hoc-phan/${id}/ghi-danh-lop-hanh-chinh`, { idLopHanhChinh }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ghi-danh-lop', id] });
      queryClient.invalidateQueries({ queryKey: ['chi-tiet-lop', id] });
      setMoModalImportLop(false);
      setIdLopHanhChinhChon('');
      setThongBaoLoi(null);
      setThongBaoThanhCong('Ghi danh theo lớp hành chính thành công');
      thongBao.thanhCong('Ghi danh theo lớp thành công!', 'Toàn bộ học sinh trong lớp sinh hoạt đã được thêm vào lớp học phần.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.thongDiep || 'Lỗi khi ghi danh theo lớp';
      setThongBaoLoi(msg);
      thongBao.thatBai('Ghi danh thất bại', msg);
    },
  });

  const xoaGhiDanhMutation = useMutation({
    mutationFn: (idHocSinh: string) =>
      mayKhachApi.delete(`/lop-hoc-phan/${id}/ghi-danh/${idHocSinh}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ghi-danh-lop', id] });
      queryClient.invalidateQueries({ queryKey: ['chi-tiet-lop', id] });
      setThongBaoThanhCong('Đã xóa học sinh khỏi lớp học phần');
      thongBao.thanhCong('Đã rút tên học sinh khỏi lớp học phần.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.thongDiep || 'Lỗi khi xóa học sinh';
      setThongBaoLoi(msg);
      thongBao.thatBai('Rút tên học sinh thất bại', msg);
    },
  });

  const xoaTkbMutation = useMutation({
    mutationFn: (idTkb: string) => mayKhachApi.delete(`/thoi-khoa-bieu/${idTkb}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tkb-lop', id] });
      setThongBaoThanhCong('Đã xóa tiết học');
      thongBao.thanhCong('Đã xóa tiết học khỏi thời khóa biểu.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.thongDiep || 'Lỗi khi xóa tiết học';
      setThongBaoLoi(msg);
      thongBao.thatBai('Xóa tiết học thất bại', msg);
    },
  });

  const laAdminHoacGiaoVu =
    nguoiDungHienTai?.vaiTro === VaiTro.QUAN_TRI_VIEN ||
    nguoiDungHienTai?.vaiTro === VaiTro.GIAO_VU;

  const laGiaoVien = nguoiDungHienTai?.vaiTro === VaiTro.GIAO_VIEN;

  if (dangTaiLop) {
    return <div className="text-center py-20 text-slate-400">Đang tải thông tin lớp học phần...</div>;
  }

  if (loiLop || !lopHocPhan) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Không thể truy cập lớp học phần</h2>
        <p className="text-sm text-slate-500">
          Bạn không có quyền truy cập lớp học này hoặc lớp học không tồn tại (Kiểm soát chống IDOR).
        </p>
        <Link
          href="/lop-hoc-phan"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách lớp
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Nút quay lại */}
      <Link
        href="/lop-hoc-phan"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách lớp học phần
      </Link>

      {/* Thông báo */}
      {thongBaoLoi && (
        <div className="p-3 bg-rose-50 text-rose-700 text-sm rounded-xl flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {thongBaoLoi}
          </span>
          <button onClick={() => setThongBaoLoi(null)} className="text-xs font-bold underline">
            Đóng
          </button>
        </div>
      )}
      {thongBaoThanhCong && (
        <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-xl flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {thongBaoThanhCong}
          </span>
          <button onClick={() => setThongBaoThanhCong(null)} className="text-xs font-bold underline">
            Đóng
          </button>
        </div>
      )}

      {/* Banner thông tin lớp học */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-lg text-xs font-mono font-bold tracking-wider uppercase">
                {lopHocPhan.maLopHocPhan}
              </span>
              <span className="text-xs text-slate-400">
                {lopHocPhan.monHoc?.tenMonHoc} ({lopHocPhan.monHoc?.soTinChi} tín chỉ)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {lopHocPhan.tenLopHocPhan}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-400" />
                {lopHocPhan.hocKy?.tenHocKy} ({lopHocPhan.hocKy?.namHoc?.tenNamHoc})
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-400" />
                {lopHocPhan._count?.danhSachGhiDanh || 0} học sinh đã ghi danh
              </span>
              {lopHocPhan.giaoVien && (
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-500 text-[10px] font-bold flex items-center justify-center">
                    GV
                  </span>
                  {lopHocPhan.giaoVien.nguoiDung.hoTen}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/lop-hoc-phan/${id}/phong-hoc`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-emerald-600/30"
            >
              <Video className="w-4 h-4" />
              Vào phòng học trực tuyến LiveKit
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setTabHienTai('thoi-khoa-bieu')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            tabHienTai === 'thoi-khoa-bieu'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          Thời khóa biểu & Lịch học
        </button>
        <button
          onClick={() => setTabHienTai('hoc-sinh')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            tabHienTai === 'hoc-sinh'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          Danh sách Học sinh ghi danh ({lopHocPhan._count?.danhSachGhiDanh || 0})
        </button>
      </div>

      {/* TAB 1: THỜI KHÓA BIỂU & BUỔI HỌC */}
      {tabHienTai === 'thoi-khoa-bieu' && (
        <div className="space-y-6">
          {/* Lịch tuần định kỳ */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Lịch học tuần định kỳ</h3>
                <p className="text-xs text-slate-500">Các tiết học cố định lặp lại theo tuần trong học kỳ</p>
              </div>

              {(laAdminHoacGiaoVu || laGiaoVien) && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setThongBaoLoi(null);
                      sinhBuoiHocMutation.mutate();
                    }}
                    disabled={sinhBuoiHocMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold rounded-lg transition-colors border border-violet-200"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {sinhBuoiHocMutation.isPending ? 'Đang sinh...' : 'Tự động sinh buổi học'}
                  </button>
                  <button
                    onClick={() => {
                      setThongBaoLoi(null);
                      setMoModalTkb(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm tiết học
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {dangTaiTkb ? (
                <div className="col-span-3 text-center py-6 text-slate-400">Đang tải lịch học...</div>
              ) : danhSachTkb && danhSachTkb.length > 0 ? (
                danhSachTkb.map((tkb) => (
                  <div
                    key={tkb.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-bold text-xs rounded">
                        Thứ {tkb.thuTrongTuan === 8 ? 'CN' : tkb.thuTrongTuan}
                      </span>
                      <p className="text-sm font-semibold text-slate-800">
                        Tiết {tkb.tietBatDau} - Tiết {tkb.tietBatDau + tkb.soTiet - 1} ({tkb.soTiet} tiết)
                      </p>
                      <p className="text-xs text-slate-500">Phòng: {tkb.phongHoc || 'Trực tuyến LiveKit'}</p>
                    </div>

                    {(laAdminHoacGiaoVu || laGiaoVien) && (
                      <button
                        onClick={() => xoaTkbMutation.mutate(tkb.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-6 text-slate-400 italic">
                  Chưa có lịch học tuần nào được thiết lập
                </div>
              )}
            </div>
          </div>

          {/* Danh sách các buổi học cụ thể */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Danh sách Buổi học cụ thể</h3>
            <div className="divide-y divide-slate-100">
              {dangTaiBuoiHoc ? (
                <div className="text-center py-6 text-slate-400">Đang tải buổi học...</div>
              ) : danhSachBuoiHoc && danhSachBuoiHoc.length > 0 ? (
                danhSachBuoiHoc.map((buoi) => (
                  <div key={buoi.id} className="py-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">{buoi.chuDe}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(buoi.thoiGianBD).toLocaleString('vi-VN')} -{' '}
                        {new Date(buoi.thoiGianKT).toLocaleTimeString('vi-VN')}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                      {buoi.trangThai === 'CHUA_BAT_DAU' ? 'Chưa bắt đầu' : buoi.trangThai}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 italic">
                  Chưa có buổi học nào. Nhấn &quot;Tự động sinh buổi học&quot; để sinh lịch học theo thời khóa biểu.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DANH SÁCH HỌC SINH GHI DANH */}
      {tabHienTai === 'hoc-sinh' && (
        <div className="space-y-4">
          {laAdminHoacGiaoVu && (
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setThongBaoLoi(null);
                  setMoModalImportLop(true);
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors shadow-sm"
              >
                <School className="w-4 h-4 text-indigo-600" />
                Ghi danh theo Lớp hành chính
              </button>
              <button
                onClick={() => {
                  setThongBaoLoi(null);
                  setMoModalGhiDanh(true);
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                Thêm Học sinh
              </button>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="py-3 px-4">Mã học sinh</th>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-4">Lớp hành chính</th>
                  <th className="py-3 px-4">Ngày ghi danh</th>
                  {laAdminHoacGiaoVu && <th className="py-3 px-4 text-right">Thao tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dangTaiGhiDanh ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      Đang tải danh sách học sinh...
                    </td>
                  </tr>
                ) : danhSachGhiDanh && danhSachGhiDanh.length > 0 ? (
                  danhSachGhiDanh.map((gd: any) => (
                    <tr key={gd.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-indigo-600">
                        {gd.hocSinh?.maHocSinh}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800">{gd.hocSinh?.nguoiDung.hoTen}</p>
                        <p className="text-xs text-slate-400">{gd.hocSinh?.nguoiDung.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        {gd.hocSinh?.lopHanhChinh ? (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium text-xs rounded">
                            {gd.hocSinh.lopHanhChinh.tenLop}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Chưa xếp lớp</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {new Date(gd.ngayGhiDanh).toLocaleDateString('vi-VN')}
                      </td>
                      {laAdminHoacGiaoVu && (
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => xoaGhiDanhMutation.mutate(gd.hocSinh.id)}
                            className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 hover:bg-rose-50 rounded"
                          >
                            Xóa khỏi lớp
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      Chưa có học sinh nào được ghi danh vào lớp học phần này
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL THÊM TIẾT HỌC THỜI KHÓA BIỂU */}
      {moModalTkb && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Thêm Tiết học vào Thời khóa biểu</h3>
            {thongBaoLoi && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{thongBaoLoi}</span>
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Thứ trong tuần</label>
                <select
                  value={formTkb.thuTrongTuan}
                  onChange={(e) => setFormTkb({ ...formTkb, thuTrongTuan: parseInt(e.target.value) || 2 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={2}>Thứ Hai</option>
                  <option value={3}>Thứ Ba</option>
                  <option value={4}>Thứ Tư</option>
                  <option value={5}>Thứ Năm</option>
                  <option value={6}>Thứ Sáu</option>
                  <option value={7}>Thứ Bảy</option>
                  <option value={8}>Chủ Nhật</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Tiết bắt đầu</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={formTkb.tietBatDau}
                    onChange={(e) => setFormTkb({ ...formTkb, tietBatDau: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Số tiết</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={formTkb.soTiet}
                    onChange={(e) => setFormTkb({ ...formTkb, soTiet: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Phòng học</label>
                <input
                  type="text"
                  placeholder="VD: P102, Lab 3, Trực tuyến"
                  value={formTkb.phongHoc || ''}
                  onChange={(e) => setFormTkb({ ...formTkb, phongHoc: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setMoModalTkb(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={taoTkbMutation.isPending}
                onClick={() => taoTkbMutation.mutate(formTkb)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {taoTkbMutation.isPending ? 'Đang lưu...' : 'Thêm tiết học'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GHI DANH 1 HỌC SINH */}
      {moModalGhiDanh && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Ghi danh Học sinh vào lớp</h3>
            {thongBaoLoi && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{thongBaoLoi}</span>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Chọn học sinh</label>
              <select
                value={idHocSinhChon}
                onChange={(e) => setIdHocSinhChon(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Chọn học sinh từ danh sách --</option>
                {tatCaHocSinh?.map((hs: any) => (
                  <option key={hs.id} value={hs.id}>
                    {hs.maHocSinh} - {hs.nguoiDung.hoTen} ({hs.lopHanhChinh?.tenLop || 'Chưa xếp lớp'})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setMoModalGhiDanh(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={!idHocSinhChon || ghiDanhMutation.isPending}
                onClick={() => ghiDanhMutation.mutate(idHocSinhChon)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {ghiDanhMutation.isPending ? 'Đang ghi danh...' : 'Ghi danh'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GHI DANH THEO LỚP HÀNH CHÍNH */}
      {moModalImportLop && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Ghi danh theo Lớp hành chính</h3>
            <p className="text-xs text-slate-500">
              Toàn bộ học sinh thuộc lớp hành chính được chọn sẽ được tự động ghi danh vào lớp học phần này.
            </p>
            {thongBaoLoi && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{thongBaoLoi}</span>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Chọn lớp hành chính</label>
              <select
                value={idLopHanhChinhChon}
                onChange={(e) => setIdLopHanhChinhChon(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Chọn lớp hành chính --</option>
                {danhSachLopHanhChinh?.map((lop: any) => (
                  <option key={lop.id} value={lop.id}>
                    {lop.maLop} - {lop.tenLop} ({lop._count?.danhSachHocSinh || 0} học sinh)
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setMoModalImportLop(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={!idLopHanhChinhChon || ghiDanhTheoLopMutation.isPending}
                onClick={() => ghiDanhTheoLopMutation.mutate(idLopHanhChinhChon)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {ghiDanhTheoLopMutation.isPending ? 'Đang import...' : 'Tiến hành ghi danh'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
