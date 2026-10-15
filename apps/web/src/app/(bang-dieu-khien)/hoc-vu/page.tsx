'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit2,
  School,
  Loader2,
  Upload,
} from 'lucide-react';
import { mayKhachApi } from '../../../tien-ich/may-khach-api';
import { thongBao } from '../../../tien-ich/thong-bao';
import { KhungXuong } from '../../../thanh-phan/khung-xuong';
import { HopThoai } from '../../../thanh-phan/hop-thoai';
import { CongTac } from '../../../thanh-phan/cong-tac';
import AnimatedBackground from '@/components/ui/animated-tabs';
import {
  NamHoc,
  TaoNamHocInput,
  TaoMonHocInput,
  TaoLopHanhChinhInput,
} from '@lms/chung';

interface MucCanXoa {
  loai: 'nam-hoc' | 'hoc-ky' | 'mon-hoc' | 'lop-hanh-chinh';
  id: string;
  tenHienThi: string;
  ghiChu?: string;
}

export default function TrangQuanLyHocVu() {
  const queryClient = useQueryClient();
  const [tabHienTai, setTabHienTai] = useState<'nam-hoc' | 'mon-hoc' | 'lop-hanh-chinh'>('nam-hoc');

  // Modal states (Thêm mới / Chỉnh sửa dùng chung hoặc theo idDangSua)
  const [moModalNamHoc, setMoModalNamHoc] = useState(false);
  const [idNamHocDangSua, setIdNamHocDangSua] = useState<string | null>(null);

  const [moModalHocKy, setMoModalHocKy] = useState(false);
  const [idHocKyDangSua, setIdHocKyDangSua] = useState<string | null>(null);

  const [moModalMonHoc, setMoModalMonHoc] = useState(false);
  const [idMonHocDangSua, setIdMonHocDangSua] = useState<string | null>(null);

  const [moModalLopHanhChinh, setMoModalLopHanhChinh] = useState(false);
  const [idLopHanhChinhDangSua, setIdLopHanhChinhDangSua] = useState<string | null>(null);

  const [loaiThemHangLoat, setLoaiThemHangLoat] = useState<'mon-hoc' | 'lop-hanh-chinh' | null>(null);
  const [vanBanHangLoat, setVanBanHangLoat] = useState('');

  const [mucCanXoa, setMucCanXoa] = useState<MucCanXoa | null>(null);

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

  const { data: danhSachGiaoVien } = useQuery({
    queryKey: ['giao-vien-select'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/ho-so/giao-vien', { params: { kichThuoc: 100 } });
      return res.data.duLieu?.duLieu || [];
    },
    enabled: moModalLopHanhChinh,
  });

  // Mutations: Năm học
  const luuNamHocMutation = useMutation({
    mutationFn: (duLieu: TaoNamHocInput) =>
      idNamHocDangSua
        ? mayKhachApi.patch(`/hoc-vu/nam-hoc/${idNamHocDangSua}`, duLieu)
        : mayKhachApi.post('/hoc-vu/nam-hoc', duLieu),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nam-hoc'] });
      setMoModalNamHoc(false);
      setIdNamHocDangSua(null);
      setFormNamHoc({ tenNamHoc: '', hienTai: false });
      thongBao.thanhCong(
        idNamHocDangSua ? 'Cập nhật năm học thành công' : 'Tạo năm học thành công',
        'Thông tin năm học đã được lưu vào hệ thống.',
      );
    },
    onError: (err: any) => {
      thongBao.loiHeThong(err, 'Lỗi khi lưu năm học');
    },
  });

  // Mutations: Học kỳ
  const luuHocKyMutation = useMutation({
    mutationFn: (duLieu: any) =>
      idHocKyDangSua
        ? mayKhachApi.patch(`/hoc-vu/hoc-ky/${idHocKyDangSua}`, duLieu)
        : mayKhachApi.post('/hoc-vu/hoc-ky', duLieu),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nam-hoc'] });
      queryClient.invalidateQueries({ queryKey: ['hoc-ky-select'] });
      setMoModalHocKy(false);
      setIdHocKyDangSua(null);
      thongBao.thanhCong(
        idHocKyDangSua ? 'Cập nhật học kỳ thành công' : 'Tạo học kỳ thành công',
        'Thông tin học kỳ đã được lưu.',
      );
    },
    onError: (err: any) => {
      thongBao.loiHeThong(err, 'Lỗi khi lưu học kỳ');
    },
  });

  // Mutations: Môn học
  const luuMonHocMutation = useMutation({
    mutationFn: (duLieu: TaoMonHocInput) =>
      idMonHocDangSua
        ? mayKhachApi.patch(`/hoc-vu/mon-hoc/${idMonHocDangSua}`, duLieu)
        : mayKhachApi.post('/hoc-vu/mon-hoc', duLieu),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mon-hoc'] });
      setMoModalMonHoc(false);
      setIdMonHocDangSua(null);
      setFormMonHoc({ maMonHoc: '', tenMonHoc: '', soTinChi: 3, moTa: '' });
      thongBao.thanhCong(
        idMonHocDangSua ? 'Cập nhật môn học thành công' : 'Tạo môn học thành công',
        'Danh mục môn học đã được cập nhật.',
      );
    },
    onError: (err: any) => {
      thongBao.loiHeThong(err, 'Lỗi khi lưu môn học');
    },
  });

  // Mutations: Lớp hành chính
  const luuLopMutation = useMutation({
    mutationFn: (duLieu: TaoLopHanhChinhInput) =>
      idLopHanhChinhDangSua
        ? mayKhachApi.patch(`/hoc-vu/lop-hanh-chinh/${idLopHanhChinhDangSua}`, duLieu)
        : mayKhachApi.post('/hoc-vu/lop-hanh-chinh', duLieu),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lop-hanh-chinh'] });
      setMoModalLopHanhChinh(false);
      setIdLopHanhChinhDangSua(null);
      setFormLopHanhChinh({ maLop: '', tenLop: '', khoiLop: 10, idGiaoVienCN: null });
      thongBao.thanhCong(
        idLopHanhChinhDangSua ? 'Cập nhật lớp hành chính thành công' : 'Tạo lớp hành chính thành công',
        'Thông tin lớp hành chính đã được lưu.',
      );
    },
    onError: (err: any) => {
      thongBao.loiHeThong(err, 'Lỗi khi lưu lớp hành chính');
    },
  });

  // Mutation: Xóa dùng chung cho cả 4 phân mục
  const xoaMucMutation = useMutation({
    mutationFn: async (muc: MucCanXoa) => {
      await mayKhachApi.delete(`/hoc-vu/${muc.loai}/${muc.id}`);
    },
    onSuccess: (_, muc) => {
      if (muc.loai === 'nam-hoc' || muc.loai === 'hoc-ky') {
        queryClient.invalidateQueries({ queryKey: ['nam-hoc'] });
      } else if (muc.loai === 'mon-hoc') {
        queryClient.invalidateQueries({ queryKey: ['mon-hoc'] });
      } else if (muc.loai === 'lop-hanh-chinh') {
        queryClient.invalidateQueries({ queryKey: ['lop-hanh-chinh'] });
      }
      setMucCanXoa(null);
      thongBao.thanhCong('Đã xóa thành công', `${muc.tenHienThi} đã được xóa khỏi hệ thống.`);
    },
    onError: (err: any) => {
      thongBao.loiHeThong(err, 'Không thể xóa mục này (có thể đang chứa dữ liệu liên kết)');
    },
  });

  // Mutation: Thêm hàng loạt Môn học / Lớp hành chính
  const themHangLoatMutation = useMutation({
    mutationFn: async () => {
      const cacDong = vanBanHangLoat
        .split(/\r?\n/)
        .map((d) => d.trim())
        .filter((d) => d.length > 0);
      let soThanhCong = 0;
      let soBoQua = 0;

      for (const dong of cacDong) {
        const cot = dong.split(/\t|,|;/).map((c) => c.trim().replace(/^["']|["']$/g, ''));
        if (cot.length < 2) continue;
        // Bỏ qua dòng tiêu đề
        if (
          cot[0].toLowerCase().includes('mã') ||
          cot[0].toLowerCase() === 'mamonhoc' ||
          cot[0].toLowerCase() === 'malop'
        ) {
          continue;
        }
        try {
          if (loaiThemHangLoat === 'mon-hoc') {
            await mayKhachApi.post('/hoc-vu/mon-hoc', {
              maMonHoc: cot[0].toUpperCase(),
              tenMonHoc: cot[1],
              soTinChi: parseInt(cot[2] || '3', 10) || 3,
              moTa: cot[3] || '',
            });
          } else if (loaiThemHangLoat === 'lop-hanh-chinh') {
            await mayKhachApi.post('/hoc-vu/lop-hanh-chinh', {
              maLop: cot[0].toUpperCase(),
              tenLop: cot[1],
              khoiLop: parseInt(cot[2] || '10', 10) || 10,
              idGiaoVienCN: null,
            });
          }
          soThanhCong++;
        } catch {
          soBoQua++;
        }
      }
      return { soThanhCong, soBoQua };
    },
    onSuccess: (ketQua) => {
      if (loaiThemHangLoat === 'mon-hoc') {
        queryClient.invalidateQueries({ queryKey: ['mon-hoc'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['lop-hanh-chinh'] });
      }
      setLoaiThemHangLoat(null);
      setVanBanHangLoat('');
      thongBao.thanhCong(
        `Đã thêm ${ketQua.soThanhCong} mục thành công`,
        ketQua.soBoQua > 0 ? `Bỏ qua ${ketQua.soBoQua} dòng trùng mã hoặc không hợp lệ.` : 'Tất cả dữ liệu đã được lưu.',
      );
    },
    onError: (err: any) => {
      thongBao.loiHeThong(err, 'Lỗi khi thêm hàng loạt');
    },
  });

  const dinhDangNgayInput = (iso?: string) => {
    if (!iso) return '';
    try {
      return new Date(iso).toISOString().slice(0, 10);
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="eyebrow mb-1">Phân hệ đào tạo</p>
          <h1 className="text-[22px] font-mono font-bold tracking-tight text-[var(--text)]">
            Quản lý Học vụ & Đào tạo
          </h1>
          <p className="text-[14px] text-[var(--muted)] mt-1">
            Thiết lập danh mục năm học, học kỳ, môn học và lớp hành chính của nhà trường
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-1 py-1">
        <AnimatedBackground
          defaultValue={tabHienTai}
          onValueChange={(idTab) => {
            if (idTab) {
              setTabHienTai(idTab as typeof tabHienTai);
            }
          }}
          className="rounded bg-accent-soft "
          transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
        >
          <button
            data-id="nam-hoc"
            type="button"
            onClick={() => setTabHienTai('nam-hoc')}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              tabHienTai === 'nam-hoc'
                ? 'border-accent text-accent '
                : 'border-transparent text-muted hover:text-text '
            }`}
          >
            <Calendar className="w-4 h-4" />
            Năm học & Học kỳ
          </button>
          <button
            data-id="mon-hoc"
            type="button"
            onClick={() => setTabHienTai('mon-hoc')}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              tabHienTai === 'mon-hoc'
                ? 'border-accent text-accent '
                : 'border-transparent text-muted hover:text-text '
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Danh mục Môn học
          </button>
          <button
            data-id="lop-hanh-chinh"
            type="button"
            onClick={() => setTabHienTai('lop-hanh-chinh')}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              tabHienTai === 'lop-hanh-chinh'
                ? 'border-accent text-accent '
                : 'border-transparent text-muted hover:text-text '
            }`}
          >
            <School className="w-4 h-4" />
            Lớp hành chính
          </button>
        </AnimatedBackground>
      </div>

      {/* TAB 1: NĂM HỌC & HỌC KỲ */}
      {tabHienTai === 'nam-hoc' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setIdNamHocDangSua(null);
                setFormNamHoc({ tenNamHoc: '', hienTai: false });
                setMoModalNamHoc(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent text-white text-sm font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Thêm Năm học mới
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dangTaiNamHoc ? (
              [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-surface border border-border rounded p-5 shadow-2xs space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      <KhungXuong className="w-10 h-10 rounded-lg" />
                      <div className="space-y-1.5">
                        <KhungXuong className="h-4 w-32" />
                        <KhungXuong className="h-3 w-20" />
                      </div>
                    </div>
                    <KhungXuong className="h-7 w-24 rounded-md" />
                  </div>
                  <div className="space-y-2">
                    <KhungXuong className="h-3 w-28" />
                    <KhungXuong className="h-10 w-full rounded-lg" />
                    <KhungXuong className="h-10 w-full rounded-lg" />
                  </div>
                </div>
              ))
            ) : danhSachNamHoc && danhSachNamHoc.length > 0 ? (
              danhSachNamHoc.map((nh: any) => (
                <div
                  key={nh.id}
                  className={`bg-surface border rounded p-5 shadow-sm transition-all ${
                    nh.hienTai ? 'border-accent ring-2 ring-accent' : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-border gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center text-accent">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text text-base">
                          Năm học {nh.tenNamHoc}
                        </h3>
                        {nh.hienTai ? (
                          <span className="inline-flex items-center gap-1 text-xs text-accent font-medium mt-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Năm học hiện tại
                          </span>
                        ) : (
                          <span className="text-xs text-muted">Đã lưu trữ</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIdHocKyDangSua(null);
                          setFormHocKy({
                            idNamHoc: nh.id,
                            tenHocKy: '',
                            hienTai: false,
                            ngayBatDau: '',
                            ngayKetThuc: '',
                          });
                          setMoModalHocKy(true);
                        }}
                        className="text-xs text-accent font-medium px-2.5 py-1.5 bg-accent-soft rounded-md transition-colors cursor-pointer"
                      >
                        + Thêm học kỳ
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIdNamHocDangSua(nh.id);
                          setFormNamHoc({
                            tenNamHoc: nh.tenNamHoc,
                            hienTai: Boolean(nh.hienTai),
                          });
                          setMoModalNamHoc(true);
                        }}
                        title="Sửa năm học"
                        className="p-1.5 text-muted hover:text-accent hover:bg-accent-soft rounded-md transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setMucCanXoa({
                            loai: 'nam-hoc',
                            id: nh.id,
                            tenHienThi: `Năm học ${nh.tenNamHoc}`,
                          })
                        }
                        title="Xóa năm học"
                        className="p-1.5 text-muted hover:text-danger hover:bg-danger-soft rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Danh sách học kỳ */}
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                      Danh sách học kỳ:
                    </p>
                    {nh.cacHocKy && nh.cacHocKy.length > 0 ? (
                      nh.cacHocKy.map((hk: any) => (
                        <div
                          key={hk.id}
                          className="flex items-center justify-between p-2.5 bg-bg rounded-lg border border-border text-sm gap-2"
                        >
                          <div>
                            <span className="font-medium text-text">{hk.tenHocKy}</span>
                            <span className="text-xs text-muted ml-2">
                              ({new Date(hk.ngayBatDau).toLocaleDateString('vi-VN')} -{' '}
                              {new Date(hk.ngayKetThuc).toLocaleDateString('vi-VN')})
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {hk.hienTai && (
                              <span className="px-2 py-0.5 text-xs bg-accent-soft text-accent font-medium rounded-full">
                                Đang diễn ra
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setIdHocKyDangSua(hk.id);
                                setFormHocKy({
                                  idNamHoc: nh.id,
                                  tenHocKy: hk.tenHocKy || '',
                                  hienTai: Boolean(hk.hienTai),
                                  ngayBatDau: dinhDangNgayInput(hk.ngayBatDau),
                                  ngayKetThuc: dinhDangNgayInput(hk.ngayKetThuc),
                                });
                                setMoModalHocKy(true);
                              }}
                              title="Sửa học kỳ"
                              className="p-1 text-muted hover:text-accent hover:bg-accent-soft rounded transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setMucCanXoa({
                                  loai: 'hoc-ky',
                                  id: hk.id,
                                  tenHienThi: `${hk.tenHocKy} (${nh.tenNamHoc})`,
                                })
                              }
                              title="Xóa học kỳ"
                              className="p-1 text-muted hover:text-danger hover:bg-danger-soft rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted italic">
                        Chưa có học kỳ nào được cấu hình
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12 text-muted">
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
              <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm mã hoặc tên môn học..."
                value={tuKhoaMonHoc}
                onChange={(e) => setTuKhoaMonHoc(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent bg-surface shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setVanBanHangLoat('');
                  setLoaiThemHangLoat('mon-hoc');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-border hover:bg-bg text-text text-sm font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                <Upload className="w-4 h-4 text-accent" />
                Thêm hàng loạt
              </button>
              <button
                onClick={() => {
                  setIdMonHocDangSua(null);
                  setFormMonHoc({ maMonHoc: '', tenMonHoc: '', soTinChi: 3, moTa: '' });
                  setMoModalMonHoc(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent text-white text-sm font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Thêm Môn học
              </button>
            </div>
          </div>

          <div className="bg-surface border border-border rounded overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-muted">
              <thead className="bg-bg border-b border-border text-text font-semibold">
                <tr>
                  <th className="py-3 px-4">Mã môn</th>
                  <th className="py-3 px-4">Tên môn học</th>
                  <th className="py-3 px-4 text-center">Số tín chỉ / Tiết</th>
                  <th className="py-3 px-4 text-center">Số lớp học phần</th>
                  <th className="py-3 px-4">Mô tả</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dangTaiMonHoc ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i}>
                      <td className="py-3 px-4"><KhungXuong className="h-4 w-16" /></td>
                      <td className="py-3 px-4"><KhungXuong className="h-4 w-40" /></td>
                      <td className="py-3 px-4 text-center"><KhungXuong className="h-4 w-8 mx-auto" /></td>
                      <td className="py-3 px-4 text-center"><KhungXuong className="h-4 w-12 mx-auto" /></td>
                      <td className="py-3 px-4"><KhungXuong className="h-4 w-48" /></td>
                      <td className="py-3 px-4 text-right"><KhungXuong className="h-4 w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : ketQuaMonHoc?.duLieu && ketQuaMonHoc.duLieu.length > 0 ? (
                  ketQuaMonHoc.duLieu.map((mh: any) => (
                    <tr key={mh.id} className="hover:bg-bg transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-accent ">
                        {mh.maMonHoc}
                      </td>
                      <td className="py-3 px-4 font-medium text-text ">{mh.tenMonHoc}</td>
                      <td className="py-3 px-4 text-center">{mh.soTinChi}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 bg-active-bg text-text rounded text-xs font-medium border border-transparent ">
                          {mh._count?.cacLopHocPhan || 0} lớp
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted max-w-xs truncate">
                        {mh.moTa || '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setIdMonHocDangSua(mh.id);
                              setFormMonHoc({
                                maMonHoc: mh.maMonHoc,
                                tenMonHoc: mh.tenMonHoc,
                                soTinChi: mh.soTinChi || 3,
                                moTa: mh.moTa || '',
                              });
                              setMoModalMonHoc(true);
                            }}
                            title="Sửa môn học"
                            className="p-1.5 text-muted hover:text-accent hover:bg-accent-soft rounded-md transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setMucCanXoa({
                                loai: 'mon-hoc',
                                id: mh.id,
                                tenHienThi: `${mh.maMonHoc} - ${mh.tenMonHoc}`,
                              })
                            }
                            title="Xóa môn học"
                            className="p-1.5 text-muted hover:text-danger hover:bg-danger-soft rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-muted">
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
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setVanBanHangLoat('');
                setLoaiThemHangLoat('lop-hanh-chinh');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-border hover:bg-bg text-text text-sm font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Upload className="w-4 h-4 text-accent" />
              Thêm hàng loạt
            </button>
            <button
              onClick={() => {
                setIdLopHanhChinhDangSua(null);
                setFormLopHanhChinh({ maLop: '', tenLop: '', khoiLop: 10, idGiaoVienCN: null });
                setMoModalLopHanhChinh(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent text-white text-sm font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Thêm Lớp hành chính
            </button>
          </div>

          <div className="bg-surface border border-border rounded overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-muted">
              <thead className="bg-bg border-b border-border text-text font-semibold">
                <tr>
                  <th className="py-3 px-4">Mã lớp</th>
                  <th className="py-3 px-4">Tên lớp</th>
                  <th className="py-3 px-4 text-center">Khối lớp</th>
                  <th className="py-3 px-4">Giáo viên chủ nhiệm</th>
                  <th className="py-3 px-4 text-center">Sĩ số học sinh</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dangTaiLop ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i}>
                      <td className="py-3 px-4"><KhungXuong className="h-4 w-16" /></td>
                      <td className="py-3 px-4"><KhungXuong className="h-4 w-32" /></td>
                      <td className="py-3 px-4 text-center"><KhungXuong className="h-4 w-16 mx-auto rounded-full" /></td>
                      <td className="py-3 px-4"><KhungXuong className="h-4 w-36" /></td>
                      <td className="py-3 px-4 text-center"><KhungXuong className="h-4 w-20 mx-auto rounded-full" /></td>
                      <td className="py-3 px-4 text-right"><KhungXuong className="h-4 w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : ketQuaLopHanhChinh?.duLieu && ketQuaLopHanhChinh.duLieu.length > 0 ? (
                  ketQuaLopHanhChinh.duLieu.map((lop: any) => (
                    <tr key={lop.id} className="hover:bg-bg transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-accent">
                        {lop.maLop}
                      </td>
                      <td className="py-3 px-4 font-medium text-text">{lop.tenLop}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 bg-accent-soft text-accent rounded text-xs font-semibold">
                          Khối {lop.khoiLop}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {lop.giaoVienChuNhiem ? (
                          <div>
                            <p className="font-medium text-text">
                              {lop.giaoVienChuNhiem.nguoiDung.hoTen}
                            </p>
                            <p className="text-xs text-muted">
                              {lop.giaoVienChuNhiem.nguoiDung.email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted italic">Chưa phân công</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-1 bg-accent-soft text-accent rounded-full text-xs font-semibold">
                          {lop._count?.danhSachHocSinh || 0} học sinh
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setIdLopHanhChinhDangSua(lop.id);
                              setFormLopHanhChinh({
                                maLop: lop.maLop,
                                tenLop: lop.tenLop,
                                khoiLop: lop.khoiLop || 10,
                                idGiaoVienCN: lop.idGiaoVienCN || null,
                              });
                              setMoModalLopHanhChinh(true);
                            }}
                            title="Sửa lớp hành chính"
                            className="p-1.5 text-muted hover:text-accent hover:bg-accent-soft rounded-md transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setMucCanXoa({
                                loai: 'lop-hanh-chinh',
                                id: lop.id,
                                tenHienThi: `${lop.maLop} - ${lop.tenLop}`,
                              })
                            }
                            title="Xóa lớp hành chính"
                            className="p-1.5 text-muted hover:text-danger hover:bg-danger-soft rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-muted">
                      Chưa có lớp hành chính nào được tạo
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL THÊM / SỬA NĂM HỌC */}
      <HopThoai
        mo={moModalNamHoc}
        onDong={() => {
          setMoModalNamHoc(false);
          setIdNamHocDangSua(null);
        }}
        tieuDe={idNamHocDangSua ? 'Chỉnh sửa Năm học' : 'Thêm Năm học mới'}
        moTa={
          idNamHocDangSua
            ? 'Cập nhật tên năm học hoặc trạng thái năm học hiện tại'
            : 'Tạo năm học mới cho hệ thống quản lý học tập'
        }
        kichThuoc="nho"
      >
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-text mb-1">
                Tên năm học (Định dạng YYYY-YYYY)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: 2026-2027"
                value={formNamHoc.tenNamHoc}
                onChange={(e) => setFormNamHoc({ ...formNamHoc, tenNamHoc: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <CongTac
                id="namHienTai"
                checked={formNamHoc.hienTai}
                onChange={(checked) => setFormNamHoc({ ...formNamHoc, hienTai: checked })}
              />
              <label htmlFor="namHienTai" className="text-sm text-text cursor-pointer">
                Đặt làm năm học hiện tại
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setMoModalNamHoc(false);
                setIdNamHocDangSua(null);
              }}
              className="px-4 py-2 border border-border text-text rounded-lg text-sm hover:bg-bg cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={luuNamHocMutation.isPending}
              onClick={() => luuNamHocMutation.mutate(formNamHoc)}
              className="px-4 py-2 bg-accent hover:bg-accent text-white rounded-lg text-sm font-medium disabled:opacity-50 cursor-pointer"
            >
              {luuNamHocMutation.isPending
                ? 'Đang lưu...'
                : idNamHocDangSua
                  ? 'Lưu thay đổi'
                  : 'Tạo Năm học'}
            </button>
          </div>
        </div>
      </HopThoai>

      {/* MODAL THÊM / SỬA HỌC KỲ */}
      <HopThoai
        mo={moModalHocKy}
        onDong={() => {
          setMoModalHocKy(false);
          setIdHocKyDangSua(null);
        }}
        tieuDe={idHocKyDangSua ? 'Chỉnh sửa Học kỳ' : 'Thêm Học kỳ mới'}
        moTa="Thiết lập học kỳ và khoảng thời gian diễn ra"
        kichThuoc="nho"
      >
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-text mb-1">Tên học kỳ</label>
              <input
                type="text"
                placeholder="Ví dụ: Học kỳ 1"
                value={formHocKy.tenHocKy}
                onChange={(e) => setFormHocKy({ ...formHocKy, tenHocKy: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text mb-1">Ngày bắt đầu</label>
                <input
                  type="date"
                  value={formHocKy.ngayBatDau}
                  onChange={(e) => setFormHocKy({ ...formHocKy, ngayBatDau: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text mb-1">Ngày kết thúc</label>
                <input
                  type="date"
                  value={formHocKy.ngayKetThuc}
                  onChange={(e) => setFormHocKy({ ...formHocKy, ngayKetThuc: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CongTac
                id="hkHienTai"
                checked={formHocKy.hienTai}
                onChange={(checked) => setFormHocKy({ ...formHocKy, hienTai: checked })}
              />
              <label htmlFor="hkHienTai" className="text-sm text-text cursor-pointer">
                Đang diễn ra (Học kỳ hiện tại)
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setMoModalHocKy(false);
                setIdHocKyDangSua(null);
              }}
              className="px-4 py-2 border border-border text-text rounded-lg text-sm hover:bg-bg cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={luuHocKyMutation.isPending}
              onClick={() => luuHocKyMutation.mutate(formHocKy)}
              className="px-4 py-2 bg-accent hover:bg-accent text-white rounded-lg text-sm font-medium disabled:opacity-50 cursor-pointer"
            >
              {luuHocKyMutation.isPending
                ? 'Đang lưu...'
                : idHocKyDangSua
                  ? 'Lưu thay đổi'
                  : 'Tạo Học kỳ'}
            </button>
          </div>
        </div>
      </HopThoai>

      {/* MODAL THÊM / SỬA MÔN HỌC */}
      <HopThoai
        mo={moModalMonHoc}
        onDong={() => {
          setMoModalMonHoc(false);
          setIdMonHocDangSua(null);
        }}
        tieuDe={idMonHocDangSua ? 'Chỉnh sửa Môn học' : 'Thêm Môn học mới'}
        moTa={
          idMonHocDangSua
            ? 'Cập nhật thông tin môn học trong chương trình đào tạo'
            : 'Thêm môn học vào chương trình đào tạo'
        }
        kichThuoc="nho"
      >
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-text mb-1">Mã môn học</label>
              <input
                type="text"
                placeholder="Ví dụ: TOAN10, TINHOC11"
                value={formMonHoc.maMonHoc}
                onChange={(e) =>
                  setFormMonHoc({ ...formMonHoc, maMonHoc: e.target.value.toUpperCase() })
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono focus:ring-2 focus:ring-accent focus:outline-none uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text mb-1">Tên môn học</label>
              <input
                type="text"
                placeholder="Ví dụ: Toán học 10"
                value={formMonHoc.tenMonHoc}
                onChange={(e) => setFormMonHoc({ ...formMonHoc, tenMonHoc: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text mb-1">
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
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text mb-1">Mô tả môn học</label>
              <textarea
                rows={2}
                placeholder="Mô tả tóm tắt nội dung môn học..."
                value={formMonHoc.moTa || ''}
                onChange={(e) => setFormMonHoc({ ...formMonHoc, moTa: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setMoModalMonHoc(false);
                setIdMonHocDangSua(null);
              }}
              className="px-4 py-2 border border-border text-text rounded-lg text-sm hover:bg-bg cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={luuMonHocMutation.isPending}
              onClick={() => luuMonHocMutation.mutate(formMonHoc)}
              className="px-4 py-2 bg-accent hover:bg-accent text-white rounded-lg text-sm font-medium disabled:opacity-50 cursor-pointer"
            >
              {luuMonHocMutation.isPending
                ? 'Đang lưu...'
                : idMonHocDangSua
                  ? 'Lưu thay đổi'
                  : 'Tạo Môn học'}
            </button>
          </div>
        </div>
      </HopThoai>

      {/* MODAL THÊM / SỬA LỚP HÀNH CHÍNH */}
      <HopThoai
        mo={moModalLopHanhChinh}
        onDong={() => {
          setMoModalLopHanhChinh(false);
          setIdLopHanhChinhDangSua(null);
        }}
        tieuDe={idLopHanhChinhDangSua ? 'Chỉnh sửa Lớp hành chính' : 'Thêm Lớp hành chính mới'}
        moTa="Thiết lập mã lớp, tên lớp, khối và phân công giáo viên chủ nhiệm"
        kichThuoc="nho"
      >
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-text mb-1">Mã lớp</label>
              <input
                type="text"
                placeholder="Ví dụ: 10A1, 11B2"
                value={formLopHanhChinh.maLop}
                onChange={(e) =>
                  setFormLopHanhChinh({
                    ...formLopHanhChinh,
                    maLop: e.target.value.toUpperCase(),
                  })
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm font-mono focus:ring-2 focus:ring-accent focus:outline-none uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text mb-1">Tên lớp</label>
              <input
                type="text"
                placeholder="Ví dụ: Lớp 10A1 Chuyên Toán"
                value={formLopHanhChinh.tenLop}
                onChange={(e) =>
                  setFormLopHanhChinh({ ...formLopHanhChinh, tenLop: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text mb-1">Khối lớp</label>
              <select
                value={formLopHanhChinh.khoiLop}
                onChange={(e) =>
                  setFormLopHanhChinh({
                    ...formLopHanhChinh,
                    khoiLop: parseInt(e.target.value) || 10,
                  })
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent focus:outline-none bg-surface"
              >
                <option value={10}>Khối 10</option>
                <option value={11}>Khối 11</option>
                <option value={12}>Khối 12</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text mb-1">
                Giáo viên chủ nhiệm
              </label>
              <select
                value={formLopHanhChinh.idGiaoVienCN || ''}
                onChange={(e) =>
                  setFormLopHanhChinh({
                    ...formLopHanhChinh,
                    idGiaoVienCN: e.target.value ? e.target.value : null,
                  })
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent focus:outline-none bg-surface"
              >
                <option value="">-- Chưa phân công --</option>
                {danhSachGiaoVien?.map((gv: any) => (
                  <option key={gv.id} value={gv.id}>
                    {gv.maGiaoVien} - {gv.nguoiDung?.hoTen} ({gv.chuyenMon || 'Giảng dạy'})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setMoModalLopHanhChinh(false);
                setIdLopHanhChinhDangSua(null);
              }}
              className="px-4 py-2 border border-border text-text rounded-lg text-sm hover:bg-bg cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={luuLopMutation.isPending}
              onClick={() => luuLopMutation.mutate(formLopHanhChinh)}
              className="px-4 py-2 bg-accent hover:bg-accent text-white rounded-lg text-sm font-medium disabled:opacity-50 cursor-pointer"
            >
              {luuLopMutation.isPending
                ? 'Đang lưu...'
                : idLopHanhChinhDangSua
                  ? 'Lưu thay đổi'
                  : 'Tạo Lớp'}
            </button>
          </div>
        </div>
      </HopThoai>

      {/* MODAL THÊM HÀNG LOẠT (MÔN HỌC / LỚP HÀNH CHÍNH) */}
      <HopThoai
        mo={Boolean(loaiThemHangLoat)}
        onDong={() => setLoaiThemHangLoat(null)}
        tieuDe={
          loaiThemHangLoat === 'mon-hoc'
            ? 'Thêm hàng loạt Môn học'
            : 'Thêm hàng loạt Lớp hành chính'
        }
        moTa={
          loaiThemHangLoat === 'mon-hoc'
            ? 'Dán dữ liệu từ Excel / CSV theo định dạng: Mã môn, Tên môn học, Số tín chỉ, Mô tả'
            : 'Dán dữ liệu từ Excel / CSV theo định dạng: Mã lớp, Tên lớp, Khối lớp (10/11/12)'
        }
        kichThuoc="vua"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">
              Mỗi dòng 1 bản ghi, phân tách bằng dấu phẩy (`,`), chấm phẩy (`;`) hoặc Tab.
            </span>
            <button
              type="button"
              onClick={() => {
                if (loaiThemHangLoat === 'mon-hoc') {
                  setVanBanHangLoat(
                    [
                      'TIN10, Tin học 10, 3, Lập trình cơ bản và Khoa học máy tính',
                      'TIN11, Tin học 11, 3, Cấu trúc dữ liệu và Cơ sở dữ liệu',
                      'TIN12, Tin học 12, 3, Trí tuệ nhân tạo và Mạng máy tính',
                    ].join('\n'),
                  );
                } else {
                  setVanBanHangLoat(
                    [
                      '10A4, Lớp 10A4 Tin học, 10',
                      '11A4, Lớp 11A4 Tin học, 11',
                      '12A4, Lớp 12A4 Tin học, 12',
                    ].join('\n'),
                  );
                }
              }}
              className="px-2.5 py-1 text-xs font-medium bg-accent-soft text-accent rounded hover:opacity-90 cursor-pointer"
            >
              Điền dữ liệu mẫu
            </button>
          </div>
          <textarea
            rows={7}
            value={vanBanHangLoat}
            onChange={(e) => setVanBanHangLoat(e.target.value)}
            placeholder={
              loaiThemHangLoat === 'mon-hoc'
                ? 'TIN10, Tin học 10, 3, Lập trình cơ bản\nTIN11, Tin học 11, 3, Cơ sở dữ liệu'
                : '10A4, Lớp 10A4 Chuyên Tin, 10\n11A4, Lớp 11A4 Chuyên Tin, 11'
            }
            className="w-full p-3 border border-border rounded text-xs font-mono bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setLoaiThemHangLoat(null)}
              className="px-4 py-2 border border-border text-text rounded-lg text-sm hover:bg-bg cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={themHangLoatMutation.isPending || !vanBanHangLoat.trim()}
              onClick={() => themHangLoatMutation.mutate()}
              className="px-4 py-2 bg-accent hover:bg-accent text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {themHangLoatMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Nhập hàng loạt
            </button>
          </div>
        </div>
      </HopThoai>

      {/* MODAL XÁC NHẬN XÓA DÙNG CHUNG */}
      <HopThoai
        mo={Boolean(mucCanXoa)}
        onDong={() => setMucCanXoa(null)}
        tieuDe="Xác nhận xóa dữ liệu học vụ"
        moTa="Thao tác xóa chỉ thực hiện được khi danh mục chưa phát sinh dữ liệu ràng buộc."
        kichThuoc="nho"
      >
        <div className="space-y-4">
          {mucCanXoa && (
            <div className="p-3.5 rounded-lg bg-danger-soft border border-danger text-xs text-text space-y-1">
              <p className="font-semibold text-danger">Bạn có chắc chắn muốn xóa mục này?</p>
              <p>
                Mục chọn: <span className="font-semibold">{mucCanXoa.tenHienThi}</span>
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setMucCanXoa(null)}
              className="px-4 py-2 border border-border text-text rounded-lg text-sm hover:bg-bg cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={xoaMucMutation.isPending}
              onClick={() => mucCanXoa && xoaMucMutation.mutate(mucCanXoa)}
              className="px-4 py-2 bg-danger text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {xoaMucMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Xác nhận xóa
            </button>
          </div>
        </div>
      </HopThoai>
    </div>
  );
}
