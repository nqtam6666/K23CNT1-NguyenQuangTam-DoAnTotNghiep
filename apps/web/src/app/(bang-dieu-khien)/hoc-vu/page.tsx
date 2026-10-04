'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  BookOpen,
  GraduationCap,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit2,
  Layers,
  Clock,
  School,
  AlertCircle,
} from 'lucide-react';
import { mayKhachApi } from '../../../tien-ich/may-khach-api';
import { thongBao } from '../../../tien-ich/thong-bao';
import {
  NamHoc,
  HocKy,
  MonHoc,
  LopHanhChinh,
  TaoNamHocInput,
  TaoHocKyInput,
  TaoMonHocInput,
  TaoLopHanhChinhInput,
} from '@lms/chung';

export default function TrangQuanLyHocVu() {
  const queryClient = useQueryClient();
  const [tabHienTai, setTabHienTai] = useState<'nam-hoc' | 'mon-hoc' | 'lop-hanh-chinh'>('nam-hoc');

  // Modal states
  const [moModalNamHoc, setMoModalNamHoc] = useState(false);
  const [moModalHocKy, setMoModalHocKy] = useState(false);
  const [moModalMonHoc, setMoModalMonHoc] = useState(false);
  const [moModalLopHanhChinh, setMoModalLopHanhChinh] = useState(false);
  const [idNamHocDangChon, setIdNamHocDangChon] = useState<string>('');

  // Form states
  const [formNamHoc, setFormNamHoc] = useState<TaoNamHocInput>({ tenNamHoc: '', hienTai: false });
  const [formHocKy, setFormHocKy] = useState<{
    idNamHoc: string;
    tenHocKy: string;
    hienTai: boolean;
    ngayBatDau: string;
    ngayKetThuc: string;
  }>({
    idNamHoc: '',
    tenHocKy: '',
    hienTai: false,
    ngayBatDau: '',
    ngayKetThuc: '',
  });
  const [formMonHoc, setFormMonHoc] = useState<TaoMonHocInput>({
    maMonHoc: '',
    tenMonHoc: '',
    soTinChi: 3,
    moTa: '',
  });
  const [formLopHanhChinh, setFormLopHanhChinh] = useState<TaoLopHanhChinhInput>({
    maLop: '',
    tenLop: '',
    khoiLop: 10,
    idGiaoVienCN: null,
  });

  const [tuKhoaMonHoc, setTuKhoaMonHoc] = useState('');
  const [thongBaoLoi, setThongBaoLoi] = useState<string | null>(null);

  // Queries
  const { data: danhSachNamHoc, isLoading: dangTaiNamHoc } = useQuery<NamHoc[]>({
    queryKey: ['nam-hoc'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/hoc-vu/nam-hoc');
      return res.data.duLieu;
    },
  });

  const { data: ketQuaMonHoc, isLoading: dangTaiMonHoc } = useQuery({
    queryKey: ['mon-hoc', tuKhoaMonHoc],
    queryFn: async () => {
      const res = await mayKhachApi.get('/hoc-vu/mon-hoc', {
        params: { tuKhoa: tuKhoaMonHoc, kichThuoc: 50 },
      });
      return res.data.duLieu;
    },
  });

  const { data: ketQuaLopHanhChinh, isLoading: dangTaiLop } = useQuery({
    queryKey: ['lop-hanh-chinh'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/hoc-vu/lop-hanh-chinh', {
        params: { kichThuoc: 50 },
      });
      return res.data.duLieu;
    },
  });

  // Mutations
  const taoNamHocMutation = useMutation({
    mutationFn: (duLieu: TaoNamHocInput) => mayKhachApi.post('/hoc-vu/nam-hoc', duLieu),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nam-hoc'] });
      setMoModalNamHoc(false);
      setFormNamHoc({ tenNamHoc: '', hienTai: false });
      setThongBaoLoi(null);
      thongBao.thanhCong('Tạo năm học thành công', 'Năm học mới đã được lưu vào hệ thống.');
    },
    onError: (err: any) => {
      setThongBaoLoi(err.response?.data?.thongDiep || 'Lỗi khi tạo năm học');
      thongBao.loiHeThong(err, 'Lỗi khi tạo năm học');
    },
  });

  const taoHocKyMutation = useMutation({
    mutationFn: (duLieu: any) => mayKhachApi.post('/hoc-vu/hoc-ky', duLieu),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nam-hoc'] });
      setMoModalHocKy(false);
      setThongBaoLoi(null);
      thongBao.thanhCong('Tạo học kỳ thành công', 'Học kỳ mới đã được kích hoạt.');
    },
    onError: (err: any) => {
      setThongBaoLoi(err.response?.data?.thongDiep || 'Lỗi khi tạo học kỳ');
      thongBao.loiHeThong(err, 'Lỗi khi tạo học kỳ');
    },
  });

  const taoMonHocMutation = useMutation({
    mutationFn: (duLieu: TaoMonHocInput) => mayKhachApi.post('/hoc-vu/mon-hoc', duLieu),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mon-hoc'] });
      setMoModalMonHoc(false);
      setFormMonHoc({ maMonHoc: '', tenMonHoc: '', soTinChi: 3, moTa: '' });
      setThongBaoLoi(null);
      thongBao.thanhCong('Tạo môn học thành công', 'Môn học mới đã sẵn sàng để mở lớp học phần.');
    },
    onError: (err: any) => {
      setThongBaoLoi(err.response?.data?.thongDiep || 'Lỗi khi tạo môn học');
      thongBao.loiHeThong(err, 'Lỗi khi tạo môn học');
    },
  });

  const taoLopMutation = useMutation({
    mutationFn: (duLieu: TaoLopHanhChinhInput) => mayKhachApi.post('/hoc-vu/lop-hanh-chinh', duLieu),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lop-hanh-chinh'] });
      setMoModalLopHanhChinh(false);
      setFormLopHanhChinh({ maLop: '', tenLop: '', khoiLop: 10, idGiaoVienCN: null });
      setThongBaoLoi(null);
      thongBao.thanhCong('Tạo lớp hành chính thành công', 'Lớp hành chính mới đã được thêm.');
    },
    onError: (err: any) => {
      setThongBaoLoi(err.response?.data?.thongDiep || 'Lỗi khi tạo lớp hành chính');
      thongBao.loiHeThong(err, 'Lỗi khi tạo lớp hành chính');
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Học vụ & Đào tạo</h1>
          <p className="text-sm text-slate-500 mt-1">
            Thiết lập danh mục năm học, học kỳ, môn học và lớp hành chính của nhà trường
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => {
            setTabHienTai('nam-hoc');
            setThongBaoLoi(null);
          }}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            tabHienTai === 'nam-hoc'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Năm học & Học kỳ
        </button>
        <button
          onClick={() => {
            setTabHienTai('mon-hoc');
            setThongBaoLoi(null);
          }}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            tabHienTai === 'mon-hoc'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Danh mục Môn học
        </button>
        <button
          onClick={() => {
            setTabHienTai('lop-hanh-chinh');
            setThongBaoLoi(null);
          }}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
            tabHienTai === 'lop-hanh-chinh'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <School className="w-4 h-4" />
          Lớp hành chính
        </button>
      </div>

      {/* TAB 1: NĂM HỌC & HỌC KỲ */}
      {tabHienTai === 'nam-hoc' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setFormNamHoc({ tenNamHoc: '', hienTai: false });
                setThongBaoLoi(null);
                setMoModalNamHoc(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Thêm Năm học mới
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dangTaiNamHoc ? (
              <div className="col-span-2 text-center py-12 text-slate-400">Đang tải dữ liệu năm học...</div>
            ) : danhSachNamHoc && danhSachNamHoc.length > 0 ? (
              danhSachNamHoc.map((nh: any) => (
                <div
                  key={nh.id}
                  className={`bg-white border rounded-xl p-5 shadow-sm transition-all ${
                    nh.hienTai ? 'border-indigo-400 ring-2 ring-indigo-50' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-base">Năm học {nh.tenNamHoc}</h3>
                        {nh.hienTai ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium mt-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Năm học hiện tại
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Đã lưu trữ</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIdNamHocDangChon(nh.id);
                        setFormHocKy({
                          idNamHoc: nh.id,
                          tenHocKy: '',
                          hienTai: false,
                          ngayBatDau: '',
                          ngayKetThuc: '',
                        });
                        setThongBaoLoi(null);
                        setMoModalHocKy(true);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                    >
                      + Thêm học kỳ
                    </button>
                  </div>

                  {/* Danh sách học kỳ */}
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Danh sách học kỳ:
                    </p>
                    {nh.cacHocKy && nh.cacHocKy.length > 0 ? (
                      nh.cacHocKy.map((hk: any) => (
                        <div
                          key={hk.id}
                          className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-sm"
                        >
                          <div>
                            <span className="font-medium text-slate-700">{hk.tenHocKy}</span>
                            <span className="text-xs text-slate-400 ml-2">
                              ({new Date(hk.ngayBatDau).toLocaleDateString('vi-VN')} -{' '}
                              {new Date(hk.ngayKetThuc).toLocaleDateString('vi-VN')})
                            </span>
                          </div>
                          {hk.hienTai && (
                            <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 font-medium rounded-full">
                              Đang diễn ra
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">Chưa có học kỳ nào được cấu hình</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12 text-slate-400">
                Chưa có năm học nào. Hãy nhấn &quot;Thêm Năm học mới&quot; để bắt đầu.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DANH MỤC MÔN HỌC */}
      {tabHienTai === 'mon-hoc' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm mã hoặc tên môn học..."
                value={tuKhoaMonHoc}
                onChange={(e) => setTuKhoaMonHoc(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
            <button
              onClick={() => {
                setFormMonHoc({ maMonHoc: '', tenMonHoc: '', soTinChi: 3, moTa: '' });
                setThongBaoLoi(null);
                setMoModalMonHoc(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Thêm Môn học
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="py-3 px-4">Mã môn</th>
                  <th className="py-3 px-4">Tên môn học</th>
                  <th className="py-3 px-4 text-center">Số tín chỉ / Tiết</th>
                  <th className="py-3 px-4 text-center">Số lớp học phần</th>
                  <th className="py-3 px-4">Mô tả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dangTaiMonHoc ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      Đang tải danh mục môn học...
                    </td>
                  </tr>
                ) : ketQuaMonHoc?.duLieu && ketQuaMonHoc.duLieu.length > 0 ? (
                  ketQuaMonHoc.duLieu.map((mh: any) => (
                    <tr key={mh.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-indigo-600">{mh.maMonHoc}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">{mh.tenMonHoc}</td>
                      <td className="py-3 px-4 text-center">{mh.soTinChi}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-medium">
                          {mh._count?.cacLopHocPhan || 0} lớp
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate">{mh.moTa || '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      Không tìm thấy môn học nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LỚP HÀNH CHÍNH */}
      {tabHienTai === 'lop-hanh-chinh' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setFormLopHanhChinh({ maLop: '', tenLop: '', khoiLop: 10, idGiaoVienCN: null });
                setThongBaoLoi(null);
                setMoModalLopHanhChinh(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Thêm Lớp hành chính
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="py-3 px-4">Mã lớp</th>
                  <th className="py-3 px-4">Tên lớp</th>
                  <th className="py-3 px-4 text-center">Khối lớp</th>
                  <th className="py-3 px-4">Giáo viên chủ nhiệm</th>
                  <th className="py-3 px-4 text-center">Sĩ số học sinh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dangTaiLop ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      Đang tải danh sách lớp hành chính...
                    </td>
                  </tr>
                ) : ketQuaLopHanhChinh?.duLieu && ketQuaLopHanhChinh.duLieu.length > 0 ? (
                  ketQuaLopHanhChinh.duLieu.map((lop: any) => (
                    <tr key={lop.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-indigo-600">{lop.maLop}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">{lop.tenLop}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-semibold">
                          Khối {lop.khoiLop}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {lop.giaoVienChuNhiem ? (
                          <div>
                            <p className="font-medium text-slate-800">{lop.giaoVienChuNhiem.nguoiDung.hoTen}</p>
                            <p className="text-xs text-slate-400">{lop.giaoVienChuNhiem.nguoiDung.email}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Chưa phân công</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
                          {lop._count?.danhSachHocSinh || 0} học sinh
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      Chưa có lớp hành chính nào được tạo
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL THÊM NĂM HỌC */}
      {moModalNamHoc && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Thêm Năm học mới</h3>
            {thongBaoLoi && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{thongBaoLoi}</span>
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tên năm học (Định dạng YYYY-YYYY)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 2026-2027"
                  value={formNamHoc.tenNamHoc}
                  onChange={(e) => setFormNamHoc({ ...formNamHoc, tenNamHoc: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="namHienTai"
                  checked={formNamHoc.hienTai}
                  onChange={(e) => setFormNamHoc({ ...formNamHoc, hienTai: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <label htmlFor="namHienTai" className="text-sm text-slate-700">
                  Đặt làm năm học hiện tại
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setMoModalNamHoc(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={taoNamHocMutation.isPending}
                onClick={() => taoNamHocMutation.mutate(formNamHoc)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {taoNamHocMutation.isPending ? 'Đang lưu...' : 'Tạo Năm học'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM HỌC KỲ */}
      {moModalHocKy && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Thêm Học kỳ mới</h3>
            {thongBaoLoi && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{thongBaoLoi}</span>
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tên học kỳ</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Học kỳ 1"
                  value={formHocKy.tenHocKy}
                  onChange={(e) => setFormHocKy({ ...formHocKy, tenHocKy: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={formHocKy.ngayBatDau}
                    onChange={(e) => setFormHocKy({ ...formHocKy, ngayBatDau: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={formHocKy.ngayKetThuc}
                    onChange={(e) => setFormHocKy({ ...formHocKy, ngayKetThuc: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hkHienTai"
                  checked={formHocKy.hienTai}
                  onChange={(e) => setFormHocKy({ ...formHocKy, hienTai: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <label htmlFor="hkHienTai" className="text-sm text-slate-700">
                  Đang diễn ra (Học kỳ hiện tại)
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setMoModalHocKy(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={taoHocKyMutation.isPending}
                onClick={() => taoHocKyMutation.mutate(formHocKy)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {taoHocKyMutation.isPending ? 'Đang lưu...' : 'Tạo Học kỳ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM MÔN HỌC */}
      {moModalMonHoc && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Thêm Môn học mới</h3>
            {thongBaoLoi && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{thongBaoLoi}</span>
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Mã môn học</label>
                <input
                  type="text"
                  placeholder="Ví dụ: TOAN10, TINHOC11"
                  value={formMonHoc.maMonHoc}
                  onChange={(e) =>
                    setFormMonHoc({ ...formMonHoc, maMonHoc: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tên môn học</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Toán học 10"
                  value={formMonHoc.tenMonHoc}
                  onChange={(e) => setFormMonHoc({ ...formMonHoc, tenMonHoc: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Số tín chỉ / Số tiết quy đổi
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formMonHoc.soTinChi}
                  onChange={(e) =>
                    setFormMonHoc({ ...formMonHoc, soTinChi: parseInt(e.target.value) || 1 })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Mô tả môn học</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả tóm tắt nội dung môn học..."
                  value={formMonHoc.moTa || ''}
                  onChange={(e) => setFormMonHoc({ ...formMonHoc, moTa: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setMoModalMonHoc(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={taoMonHocMutation.isPending}
                onClick={() => taoMonHocMutation.mutate(formMonHoc)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {taoMonHocMutation.isPending ? 'Đang lưu...' : 'Tạo Môn học'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM LỚP HÀNH CHÍNH */}
      {moModalLopHanhChinh && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Thêm Lớp hành chính mới</h3>
            {thongBaoLoi && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{thongBaoLoi}</span>
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Mã lớp</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 10A1, 11B2"
                  value={formLopHanhChinh.maLop}
                  onChange={(e) =>
                    setFormLopHanhChinh({ ...formLopHanhChinh, maLop: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tên lớp</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Lớp 10A1 Chuyên Toán"
                  value={formLopHanhChinh.tenLop}
                  onChange={(e) => setFormLopHanhChinh({ ...formLopHanhChinh, tenLop: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Khối lớp</label>
                <select
                  value={formLopHanhChinh.khoiLop}
                  onChange={(e) =>
                    setFormLopHanhChinh({ ...formLopHanhChinh, khoiLop: parseInt(e.target.value) || 10 })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  <option value={10}>Khối 10</option>
                  <option value={11}>Khối 11</option>
                  <option value={12}>Khối 12</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setMoModalLopHanhChinh(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={taoLopMutation.isPending}
                onClick={() => taoLopMutation.mutate(formLopHanhChinh)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {taoLopMutation.isPending ? 'Đang lưu...' : 'Tạo Lớp'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
