'use client';

import { useState, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Users,
  Search,
  UserPlus,
  Upload,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import {
  taoNguoiDungSchema,
  TaoNguoiDungDto,
  CapNhatNguoiDungDto,
  VaiTro,
  DANH_SACH_VAI_TRO,
  layNhanVaiTro,
} from '@lms/chung';
import { mayKhachApi } from '../../../tien-ich/may-khach-api';
import { thongBao } from '../../../tien-ich/thong-bao';
import { KhungXuongBang } from '../../../thanh-phan/khung-xuong';
import { HopThoai } from '../../../thanh-phan/hop-thoai';
import { CongTac } from '../../../thanh-phan/cong-tac';

interface DongNhapHangLoat {
  hoTen: string;
  email: string;
  soDienThoai: string;
  vaiTro: VaiTro;
  matKhau: string;
}

function chuanHoaVaiTroTuChuoi(chuoi: string | undefined, macDinh: VaiTro): VaiTro {
  if (!chuoi) return macDinh;
  const v = chuoi.trim().toUpperCase();
  if ((DANH_SACH_VAI_TRO as readonly string[]).includes(v)) {
    return v as VaiTro;
  }
  const khongDau = v
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/Đ/g, 'D');
  if (khongDau.includes('QUAN TRI') || khongDau === 'ADMIN') return VaiTro.QUAN_TRI_VIEN;
  if (khongDau.includes('GIAM HIEU') || khongDau === 'BGH') return VaiTro.BAN_GIAM_HIEU;
  if (khongDau.includes('GIAO VU')) return VaiTro.GIAO_VU;
  if (khongDau.includes('GIAO VIEN') || khongDau.includes('GIANG VIEN') || khongDau === 'GV') {
    return VaiTro.GIAO_VIEN;
  }
  if (khongDau.includes('PHU HUYNH') || khongDau === 'PH') return VaiTro.PHU_HUYNH;
  if (khongDau.includes('HOC SINH') || khongDau.includes('SINH VIEN') || khongDau === 'HS') {
    return VaiTro.HOC_SINH;
  }
  return macDinh;
}

export default function TrangQuanLyNguoiDung() {
  const queryClient = useQueryClient();
  const tepCsvRef = useRef<HTMLInputElement | null>(null);
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [tuKhoa, setTuKhoa] = useState('');
  const [vaiTroLoc, setVaiTroLoc] = useState<string>('');
  const [modalTaoMo, setModalTaoMo] = useState(false);
  const [modalDatMatKhauMo, setModalDatMatKhauMo] = useState<string | null>(null);
  const [matKhauMoi, setMatKhauMoi] = useState('');

  // State sửa & xóa người dùng
  const [nguoiDungDangSua, setNguoiDungDangSua] = useState<any | null>(null);
  const [formSua, setFormSua] = useState<{
    hoTen: string;
    soDienThoai: string;
    vaiTro: VaiTro;
    kichHoat: boolean;
  }>({
    hoTen: '',
    soDienThoai: '',
    vaiTro: VaiTro.HOC_SINH,
    kichHoat: true,
  });
  const [nguoiDungCanXoa, setNguoiDungCanXoa] = useState<any | null>(null);

  // State Thêm hàng loạt (Bulk Add)
  const [modalHangLoatMo, setModalHangLoatMo] = useState(false);
  const [cheDoHangLoat, setCheDoHangLoat] = useState<'dan-van-ban' | 'bang-truc-tiep'>(
    'dan-van-ban',
  );
  const [vaiTroMacDinhLo, setVaiTroMacDinhLo] = useState<VaiTro>(VaiTro.HOC_SINH);
  const [matKhauMacDinhLo, setMatKhauMacDinhLo] = useState('HocSinh@123');
  const [vanBanHangLoat, setVanBanHangLoat] = useState('');
  const [danhSachDongBang, setDanhSachDongBang] = useState<DongNhapHangLoat[]>([
    { hoTen: '', email: '', soDienThoai: '', vaiTro: VaiTro.HOC_SINH, matKhau: '' },
    { hoTen: '', email: '', soDienThoai: '', vaiTro: VaiTro.HOC_SINH, matKhau: '' },
    { hoTen: '', email: '', soDienThoai: '', vaiTro: VaiTro.HOC_SINH, matKhau: '' },
  ]);
  const [ketQuaHangLoat, setKetQuaHangLoat] = useState<{
    soThanhCong: number;
    soBoQua: number;
    tongSoYeuCau: number;
    danhSachBoQua: Array<{ email: string; hoTen: string; lyDo: string }>;
  } | null>(null);

  // 1. Fetch danh sách người dùng
  const { data, isLoading, isError } = useQuery({
    queryKey: ['danhSachNguoiDung', trangHienTai, tuKhoa, vaiTroLoc],
    queryFn: async () => {
      const params = new URLSearchParams({
        trang: String(trangHienTai),
        kichThuoc: '10',
      });
      if (tuKhoa) params.append('tuKhoa', tuKhoa);
      if (vaiTroLoc) params.append('vaiTro', vaiTroLoc);

      const res = await mayKhachApi.get(`/nguoi-dung?${params.toString()}`);
      return res.data?.duLieu;
    },
  });

  // 2. Mutation chuyển đổi trạng thái Khóa / Mở
  const mutationChuyenTrangThai = useMutation({
    mutationFn: async ({ id, kichHoat }: { id: string; kichHoat: boolean }) => {
      await mayKhachApi.patch(`/nguoi-dung/${id}/trang-thai`, { kichHoat });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['danhSachNguoiDung'] });
      thongBao.thanhCong(
        variables.kichHoat ? 'Đã kích hoạt tài khoản' : 'Đã khóa tài khoản',
        'Cập nhật trạng thái người dùng thành công.',
      );
    },
    onError: (err: any) => {
      thongBao.loiHeThong(err, 'Lỗi khi cập nhật trạng thái người dùng');
    },
  });

  // 3. Mutation đặt lại mật khẩu
  const mutationDatLaiMatKhau = useMutation({
    mutationFn: async ({ id, matKhauMoi }: { id: string; matKhauMoi: string }) => {
      await mayKhachApi.post(`/nguoi-dung/${id}/dat-lai-mat-khau`, { matKhauMoi });
    },
    onSuccess: () => {
      setModalDatMatKhauMo(null);
      setMatKhauMoi('');
      thongBao.thanhCong('Đặt lại mật khẩu thành công', 'Mật khẩu mới đã được cập nhật.');
    },
    onError: (err: any) => {
      thongBao.loiHeThong(err, 'Lỗi khi đặt lại mật khẩu');
    },
  });

  // 4. Mutation sửa thông tin người dùng
  const mutationCapNhat = useMutation({
    mutationFn: async ({ id, duLieu }: { id: string; duLieu: CapNhatNguoiDungDto }) => {
      await mayKhachApi.patch(`/nguoi-dung/${id}`, duLieu);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['danhSachNguoiDung'] });
      setNguoiDungDangSua(null);
      thongBao.thanhCong('Cập nhật thành công', 'Thông tin người dùng đã được lưu.');
    },
    onError: (err: any) => {
      thongBao.loiHeThong(err, 'Lỗi khi cập nhật thông tin người dùng');
    },
  });

  // 5. Mutation xóa người dùng
  const mutationXoa = useMutation({
    mutationFn: async (id: string) => {
      await mayKhachApi.delete(`/nguoi-dung/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['danhSachNguoiDung'] });
      setNguoiDungCanXoa(null);
      thongBao.thanhCong('Đã xóa người dùng', 'Tài khoản người dùng đã được xóa khỏi hệ thống.');
    },
    onError: (err: any) => {
      thongBao.loiHeThong(err, 'Lỗi khi xóa người dùng');
    },
  });

  // 6. Mutation tạo hàng loạt người dùng
  const mutationTaoHangLoat = useMutation({
    mutationFn: async (danhSach: TaoNguoiDungDto[]) => {
      const res = await mayKhachApi.post('/nguoi-dung/hang-loat', { danhSach });
      return res.data?.duLieu;
    },
    onSuccess: (ketQua) => {
      queryClient.invalidateQueries({ queryKey: ['danhSachNguoiDung'] });
      setKetQuaHangLoat(ketQua);
      if (ketQua?.soThanhCong > 0) {
        thongBao.thanhCong(
          `Đã tạo ${ketQua.soThanhCong}/${ketQua.tongSoYeuCau} tài khoản`,
          ketQua.soBoQua > 0
            ? `Có ${ketQua.soBoQua} dòng bị bỏ qua do trùng email.`
            : 'Toàn bộ danh sách người dùng đã được thêm thành công.',
        );
      } else {
        thongBao.canhBao(
          'Chưa tạo được tài khoản nào',
          'Các email trong danh sách đều đã tồn tại trên hệ thống.',
        );
      }
    },
    onError: (err: any) => {
      thongBao.loiHeThong(err, 'Lỗi khi tạo người dùng hàng loạt');
    },
  });

  // Phân tích dữ liệu hàng loạt sang danh sách kiểm tra hợp lệ
  const phanTichHangLoat = useMemo(() => {
    const danhSachTho: DongNhapHangLoat[] = [];

    if (cheDoHangLoat === 'dan-van-ban') {
      const cacDong = vanBanHangLoat
        .split(/\r?\n/)
        .map((d) => d.trim())
        .filter(Boolean);

      for (const dong of cacDong) {
        // Bỏ qua dòng tiêu đề nếu có
        const dongThuong = dong.toLowerCase();
        if (
          (dongThuong.includes('ho ten') || dongThuong.includes('họ tên')) &&
          dongThuong.includes('email')
        ) {
          continue;
        }

        const tachCot = dong.includes('\t')
          ? dong.split('\t')
          : dong.includes(';')
            ? dong.split(';')
            : dong.split(',');

        const cot = tachCot.map((c) => c.trim().replace(/^["']|["']$/g, ''));
        if (cot.length >= 2) {
          danhSachTho.push({
            hoTen: cot[0] || '',
            email: (cot[1] || '').toLowerCase(),
            soDienThoai: cot[2] || '',
            vaiTro: chuanHoaVaiTroTuChuoi(cot[3], vaiTroMacDinhLo),
            matKhau: cot[4] || matKhauMacDinhLo,
          });
        }
      }
    } else {
      for (const dong of danhSachDongBang) {
        if (!dong.hoTen.trim() && !dong.email.trim()) continue;
        danhSachTho.push({
          hoTen: dong.hoTen.trim(),
          email: dong.email.trim().toLowerCase(),
          soDienThoai: dong.soDienThoai.trim(),
          vaiTro: dong.vaiTro || vaiTroMacDinhLo,
          matKhau: dong.matKhau.trim() || matKhauMacDinhLo,
        });
      }
    }

    const hopLe: TaoNguoiDungDto[] = [];
    const chiTietDong: Array<{
      dong: DongNhapHangLoat;
      hopLe: boolean;
      loi?: string;
    }> = [];

    const emailDaGap = new Set<string>();

    for (const d of danhSachTho) {
      const sdt = d.soDienThoai.trim();
      const duLieuKiemTra = {
        hoTen: d.hoTen.trim(),
        email: d.email.trim().toLowerCase(),
        matKhau: d.matKhau.trim() || matKhauMacDinhLo,
        soDienThoai: sdt ? sdt : undefined,
        vaiTro: d.vaiTro,
        kichHoat: true,
      };

      const kq = taoNguoiDungSchema.safeParse(duLieuKiemTra);
      if (!kq.success) {
        chiTietDong.push({
          dong: d,
          hopLe: false,
          loi: kq.error.issues[0]?.message || 'Dữ liệu không hợp lệ',
        });
      } else if (emailDaGap.has(kq.data.email)) {
        chiTietDong.push({
          dong: d,
          hopLe: false,
          loi: 'Trùng email trong danh sách',
        });
      } else {
        emailDaGap.add(kq.data.email);
        hopLe.push(kq.data);
        chiTietDong.push({
          dong: d,
          hopLe: true,
        });
      }
    }

    return { hopLe, chiTietDong };
  }, [cheDoHangLoat, vanBanHangLoat, danhSachDongBang, vaiTroMacDinhLo, matKhauMacDinhLo]);

  const xuLyChonTepCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tep = e.target.files?.[0];
    if (!tep) return;
    const reader = new FileReader();
    reader.onload = () => {
      const noiDung = String(reader.result || '');
      setCheDoHangLoat('dan-van-ban');
      setVanBanHangLoat(noiDung);
      setKetQuaHangLoat(null);
      thongBao.thanhCong('Đã đọc tệp danh sách', `Đã nạp nội dung từ tệp ${tep.name}`);
    };
    reader.readAsText(tep, 'utf-8');
    e.target.value = '';
  };

  const taiTepCsvMau = () => {
    const mau = [
      'Họ tên,Email,Số điện thoại,Vai trò,Mật khẩu',
      'Nguyễn Minh Khôi,khoi.nm@lms.edu.vn,0912345601,HOC_SINH,HocSinh@123',
      'Trần Thu Hà,ha.tt@lms.edu.vn,0912345602,HOC_SINH,HocSinh@123',
      'Lê Hoàng Nam,nam.lh@lms.edu.vn,0912345603,GIAO_VIEN,GiaoVien@123',
    ].join('\n');
    const blob = new Blob(['\uFEFF' + mau], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const theA = document.createElement('a');
    theA.href = url;
    theA.download = 'mau-them-nguoi-dung-hang-loat.csv';
    theA.click();
    URL.revokeObjectURL(url);
  };

  // 7. Form tạo người dùng mới
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaoNguoiDungDto>({
    resolver: zodResolver(taoNguoiDungSchema),
    defaultValues: {
      email: '',
      matKhau: '',
      hoTen: '',
      soDienThoai: '',
      vaiTro: VaiTro.HOC_SINH,
    },
  });

  const xuLyTaoNguoiDung = async (duLieu: TaoNguoiDungDto) => {
    try {
      const payload: TaoNguoiDungDto = {
        ...duLieu,
        soDienThoai: duLieu.soDienThoai?.trim() ? duLieu.soDienThoai.trim() : undefined,
      };
      await mayKhachApi.post('/nguoi-dung', payload);
      queryClient.invalidateQueries({ queryKey: ['danhSachNguoiDung'] });
      setModalTaoMo(false);
      reset();
      thongBao.thanhCong('Tạo tài khoản thành công', `Tài khoản ${duLieu.email} đã được tạo.`);
    } catch (loi: any) {
      thongBao.loiHeThong(loi, 'Lỗi khi tạo người dùng mới');
    }
  };

  const moModalSuaNguoiDung = (item: any) => {
    setNguoiDungDangSua(item);
    setFormSua({
      hoTen: item.hoTen || '',
      soDienThoai: item.soDienThoai || '',
      vaiTro: (item.vaiTro as VaiTro) || VaiTro.HOC_SINH,
      kichHoat: Boolean(item.kichHoat),
    });
  };

  const xuLyLuuSuaNguoiDung = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nguoiDungDangSua) return;
    const hoTenTrim = formSua.hoTen.trim();
    if (hoTenTrim.length < 2) {
      thongBao.canhBao('Họ và tên tối thiểu 2 ký tự');
      return;
    }
    const sdtTrim = formSua.soDienThoai.trim();
    if (sdtTrim && !/^[0-9]{10,11}$/.test(sdtTrim)) {
      thongBao.canhBao('Số điện thoại phải gồm 10 hoặc 11 chữ số');
      return;
    }

    mutationCapNhat.mutate({
      id: nguoiDungDangSua.id,
      duLieu: {
        hoTen: hoTenTrim,
        soDienThoai: sdtTrim ? sdtTrim : null,
        vaiTro: formSua.vaiTro,
        kichHoat: formSua.kichHoat,
      },
    });
  };

  const layMauBadgeVaiTro = (vaiTro: string) => {
    switch (vaiTro) {
      case 'QUAN_TRI_VIEN':
        return 'bg-accent-soft text-accent border-accent ';
      case 'BAN_GIAM_HIEU':
        return 'bg-accent-soft text-accent border-accent ';
      case 'GIAO_VU':
        return 'bg-accent-soft text-accent border-accent ';
      case 'GIAO_VIEN':
        return 'bg-accent-soft text-accent border-accent ';
      case 'HOC_SINH':
        return 'bg-info-soft text-info border-info ';
      case 'PHU_HUYNH':
        return 'bg-accent-soft text-accent border-accent ';
      default:
        return 'bg-active-bg text-text border-border ';
    }
  };

  const dangMoBatKyModal = Boolean(
    modalDatMatKhauMo ||
      modalTaoMo ||
      modalHangLoatMo ||
      nguoiDungDangSua ||
      nguoiDungCanXoa,
  );

  return (
    <div className="space-y-6">
      {/* Tiêu đề & Nút Thao tác */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="eyebrow mb-1">Quản trị hệ thống</p>
          <h2 className="text-[22px] font-mono font-bold text-[var(--text)] tracking-tight">
            Quản lý Người dùng
          </h2>
          <p className="text-[14px] text-[var(--muted)] mt-1">
            Quản lý tài khoản, phân quyền vai trò và trạng thái hoạt động trong hệ thống LMS
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setKetQuaHangLoat(null);
              setModalHangLoatMo(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-[11px] bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--active-bg)] text-[var(--text)] text-[13px] font-semibold rounded-[4px] transition-colors cursor-pointer"
          >
            <Upload className="w-[17px] h-[17px] text-[var(--accent)]" strokeWidth={1.5} />
            Thêm hàng loạt
          </button>
          <button
            type="button"
            onClick={() => setModalTaoMo(true)}
            className="inline-flex items-center gap-2 px-5 py-[11px] bg-[var(--accent)] hover:brightness-95 text-white text-[13px] font-semibold rounded-[4px] shadow-[0_2px_8px_-2px_color-mix(in_srgb,var(--accent)_30%,transparent)] transition-all cursor-pointer"
          >
            <UserPlus className="w-[18px] h-[18px]" strokeWidth={1.5} />
            Thêm người dùng mới
          </button>
        </div>
      </div>

      {/* Thanh Tìm kiếm & Bộ lọc */}
      <div className="p-4 rounded bg-surface border border-border shadow-2xs flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted " />
          <input
            type="search"
            name="tim_kiem_nguoi_dung"
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
            data-form-type="other"
            readOnly={dangMoBatKyModal}
            placeholder="Tìm theo họ tên, email, số điện thoại..."
            value={tuKhoa}
            onChange={(e) => {
              if (dangMoBatKyModal) return;
              setTuKhoa(e.target.value);
              setTrangHienTai(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm text-text placeholder:text-muted bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="w-full sm:w-60">
          <select
            value={vaiTroLoc}
            onChange={(e) => {
              setVaiTroLoc(e.target.value);
              setTrangHienTai(1);
            }}
            className="w-full py-2 px-3 border border-border rounded-lg text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">-- Tất cả vai trò --</option>
            {DANH_SACH_VAI_TRO.map((vt) => (
              <option key={vt} value={vt}>
                {layNhanVaiTro(vt)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bảng Dữ liệu người dùng */}
      <div className="bg-surface rounded border border-border shadow-2xs overflow-hidden">
        {isLoading ? (
          <KhungXuongBang soDong={6} soCot={6} />
        ) : isError ? (
          <div className="p-8 text-center text-danger">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Không thể tải danh sách người dùng.</p>
          </div>
        ) : data?.danhSach?.length === 0 ? (
          <div className="py-16 text-center text-muted">
            <Users className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="font-medium text-text">Chưa tìm thấy người dùng nào</p>
            <p className="text-xs text-muted mt-1">
              Thử thay đổi bộ lọc hoặc thêm tài khoản mới.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-muted ">
              <thead className="bg-bg border-b border-border text-xs font-semibold text-muted uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Người dùng</th>
                  <th className="py-3.5 px-4">Số điện thoại</th>
                  <th className="py-3.5 px-4">Vai trò</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4">Ngày tạo</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border ">
                {data?.danhSach?.map((item: any) => (
                  <tr key={item.id} className="hover:bg-bg transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-active-bg text-text font-semibold flex items-center justify-center text-xs border border-border ">
                          {item.hoTen?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-text leading-tight">{item.hoTen}</p>
                          <p className="text-xs text-muted ">{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">{item.soDienThoai || 'Chưa cập nhật'}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full border ${layMauBadgeVaiTro(
                          item.vaiTro,
                        )}`}
                      >
                        {layNhanVaiTro(item.vaiTro)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.kichHoat ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-accent-soft text-accent border border-accent">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-danger-soft text-danger border border-danger">
                          <span className="w-1.5 h-1.5 rounded-full bg-danger" />
                          Đã khóa
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted">
                      {new Date(item.ngayTao).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moModalSuaNguoiDung(item)}
                          title="Sửa thông tin người dùng"
                          className="p-1.5 text-muted hover:text-accent hover:bg-accent-soft rounded-md transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMatKhauMoi('');
                            setModalDatMatKhauMo(item.id);
                          }}
                          title="Đặt lại mật khẩu"
                          className="p-1.5 text-muted hover:text-accent hover:bg-accent-soft rounded-md transition-colors cursor-pointer"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            mutationChuyenTrangThai.mutate({
                              id: item.id,
                              kichHoat: !item.kichHoat,
                            })
                          }
                          title={item.kichHoat ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            item.kichHoat
                              ? 'text-muted hover:text-danger hover:bg-danger-soft'
                              : 'text-muted hover:text-accent hover:bg-accent-soft'
                          }`}
                        >
                          {item.kichHoat ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            <Unlock className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setNguoiDungCanXoa(item)}
                          title="Xóa người dùng"
                          className="p-1.5 text-muted hover:text-danger hover:bg-danger-soft rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Thanh Phân Trang */}
        {data && data.tongSoTrang > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted">
            <span>
              Hiển thị trang {data.trangHienTai} / {data.tongSoTrang} ({data.tongSo} người dùng)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={trangHienTai <= 1}
                onClick={() => setTrangHienTai((p) => Math.max(p - 1, 1))}
                className="p-1.5 border border-border rounded-md hover:bg-bg disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={trangHienTai >= data.tongSoTrang}
                onClick={() => setTrangHienTai((p) => p + 1)}
                className="p-1.5 border border-border rounded-md hover:bg-bg disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Thêm Hàng Loạt Người Dùng (Bulk Add) */}
      <HopThoai
        mo={modalHangLoatMo}
        onDong={() => setModalHangLoatMo(false)}
        tieuDe="Thêm người dùng hàng loạt"
        moTa="Nhập nhanh danh sách học sinh, giáo viên từ tệp CSV / Excel hoặc bảng nhập trực tiếp"
        kichThuoc="lon"
      >
        <div className="space-y-4">
          {/* Thiết lập mặc định cho các cột khuyết */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg bg-bg border border-border">
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Vai trò mặc định (khi dòng không ghi vai trò)
              </label>
              <select
                value={vaiTroMacDinhLo}
                onChange={(e) => setVaiTroMacDinhLo(e.target.value as VaiTro)}
                className="w-full px-3 py-1.5 border border-border rounded text-xs bg-surface"
              >
                {DANH_SACH_VAI_TRO.map((vt) => (
                  <option key={vt} value={vt}>
                    {layNhanVaiTro(vt)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Mật khẩu khởi tạo mặc định (tối thiểu 8 ký tự)
              </label>
              <input
                type="text"
                value={matKhauMacDinhLo}
                onChange={(e) => setMatKhauMacDinhLo(e.target.value)}
                placeholder="HocSinh@123"
                className="w-full px-3 py-1.5 border border-border rounded text-xs font-mono bg-surface"
              />
            </div>
          </div>

          {/* Thanh chuyển chế độ nhập + Tải tệp CSV */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex rounded border border-border bg-bg p-0.5">
              <button
                type="button"
                onClick={() => setCheDoHangLoat('dan-van-ban')}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
                  cheDoHangLoat === 'dan-van-ban'
                    ? 'bg-accent text-white'
                    : 'text-muted hover:text-text'
                }`}
              >
                Dán CSV / Excel
              </button>
              <button
                type="button"
                onClick={() => setCheDoHangLoat('bang-truc-tiep')}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer ${
                  cheDoHangLoat === 'bang-truc-tiep'
                    ? 'bg-accent text-white'
                    : 'text-muted hover:text-text'
                }`}
              >
                Nhập bảng từng dòng
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={tepCsvRef}
                type="file"
                accept=".csv,.txt"
                onChange={xuLyChonTepCsv}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => tepCsvRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-border bg-surface hover:bg-active-bg rounded cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-accent" />
                Chọn tệp .CSV
              </button>
              <button
                type="button"
                onClick={taiTepCsvMau}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-border bg-surface hover:bg-active-bg rounded cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-muted" />
                Tải CSV mẫu
              </button>
              <button
                type="button"
                onClick={() => {
                  setCheDoHangLoat('dan-van-ban');
                  setKetQuaHangLoat(null);
                  setVanBanHangLoat(
                    [
                      'Nguyễn Minh Khôi, khoi.nm@lms.edu.vn, 0912345601, HOC_SINH',
                      'Trần Thu Hà, ha.tt@lms.edu.vn, 0912345602, HOC_SINH',
                      'Lê Hoàng Nam, nam.lh@lms.edu.vn, 0912345603, GIAO_VIEN',
                    ].join('\n'),
                  );
                }}
                className="px-2.5 py-1.5 text-xs font-medium text-accent bg-accent-soft border border-accent rounded cursor-pointer"
              >
                Điền dữ liệu mẫu
              </button>
            </div>
          </div>

          {/* Vùng nhập dữ liệu theo chế độ */}
          {cheDoHangLoat === 'dan-van-ban' ? (
            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Mỗi dòng 1 người dùng theo thứ tự:{' '}
                <span className="font-mono text-text">
                  Họ tên, Email, Số điện thoại, Vai trò (tùy chọn), Mật khẩu (tùy chọn)
                </span>
              </label>
              <textarea
                rows={6}
                value={vanBanHangLoat}
                onChange={(e) => {
                  setVanBanHangLoat(e.target.value);
                  setKetQuaHangLoat(null);
                }}
                placeholder={
                  'Nguyễn Văn An, an.nv@lms.edu.vn, 0987654321, HOC_SINH\nTrần Thị Bình, binh.tt@lms.edu.vn, 0912345678, GIAO_VIEN'
                }
                className="w-full p-3 border border-border rounded font-mono text-xs bg-surface focus:outline-none focus:border-accent"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="max-h-60 overflow-y-auto border border-border rounded">
                <table className="w-full text-left text-xs">
                  <thead className="bg-bg border-b border-border sticky top-0">
                    <tr>
                      <th className="py-2 px-2.5">#</th>
                      <th className="py-2 px-2.5">Họ và tên *</th>
                      <th className="py-2 px-2.5">Email *</th>
                      <th className="py-2 px-2.5">Số ĐT</th>
                      <th className="py-2 px-2.5">Vai trò</th>
                      <th className="py-2 px-2.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {danhSachDongBang.map((dong, idx) => (
                      <tr key={idx}>
                        <td className="py-1.5 px-2.5 font-mono text-muted">{idx + 1}</td>
                        <td className="py-1.5 px-2">
                          <input
                            type="text"
                            value={dong.hoTen}
                            placeholder="Nguyễn Văn A"
                            onChange={(e) => {
                              const banSao = [...danhSachDongBang];
                              banSao[idx] = { ...dong, hoTen: e.target.value };
                              setDanhSachDongBang(banSao);
                            }}
                            className="w-full px-2 py-1 border border-border rounded text-xs"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="email"
                            value={dong.email}
                            placeholder="email@lms.edu.vn"
                            onChange={(e) => {
                              const banSao = [...danhSachDongBang];
                              banSao[idx] = { ...dong, email: e.target.value };
                              setDanhSachDongBang(banSao);
                            }}
                            className="w-full px-2 py-1 border border-border rounded text-xs font-mono"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="text"
                            value={dong.soDienThoai}
                            placeholder="0987654321"
                            onChange={(e) => {
                              const banSao = [...danhSachDongBang];
                              banSao[idx] = { ...dong, soDienThoai: e.target.value };
                              setDanhSachDongBang(banSao);
                            }}
                            className="w-28 px-2 py-1 border border-border rounded text-xs font-mono"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <select
                            value={dong.vaiTro}
                            onChange={(e) => {
                              const banSao = [...danhSachDongBang];
                              banSao[idx] = { ...dong, vaiTro: e.target.value as VaiTro };
                              setDanhSachDongBang(banSao);
                            }}
                            className="px-2 py-1 border border-border rounded text-xs bg-surface"
                          >
                            {DANH_SACH_VAI_TRO.map((vt) => (
                              <option key={vt} value={vt}>
                                {layNhanVaiTro(vt)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-1.5 px-2 text-right">
                          <button
                            type="button"
                            disabled={danhSachDongBang.length <= 1}
                            onClick={() =>
                              setDanhSachDongBang(danhSachDongBang.filter((_, i) => i !== idx))
                            }
                            className="p-1 text-muted hover:text-danger rounded disabled:opacity-30 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setDanhSachDongBang([
                      ...danhSachDongBang,
                      {
                        hoTen: '',
                        email: '',
                        soDienThoai: '',
                        vaiTro: vaiTroMacDinhLo,
                        matKhau: '',
                      },
                    ])
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-accent bg-accent-soft border border-accent rounded cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm 1 dòng
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDanhSachDongBang([
                      ...danhSachDongBang,
                      ...Array.from({ length: 5 }, () => ({
                        hoTen: '',
                        email: '',
                        soDienThoai: '',
                        vaiTro: vaiTroMacDinhLo,
                        matKhau: '',
                      })),
                    ])
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-text bg-surface border border-border rounded hover:bg-active-bg cursor-pointer"
                >
                  + Thêm 5 dòng
                </button>
              </div>
            </div>
          )}

          {/* Bảng kiểm tra trước khi gửi */}
          {phanTichHangLoat.chiTietDong.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text">
                  Xem trước danh sách ({phanTichHangLoat.hopLe.length} hợp lệ /{' '}
                  {phanTichHangLoat.chiTietDong.length} dòng)
                </span>
              </div>
              <div className="max-h-40 overflow-y-auto border border-border rounded">
                <table className="w-full text-left text-xs">
                  <thead className="bg-bg border-b border-border sticky top-0">
                    <tr>
                      <th className="py-1.5 px-2.5">Họ tên</th>
                      <th className="py-1.5 px-2.5">Email</th>
                      <th className="py-1.5 px-2.5">Vai trò</th>
                      <th className="py-1.5 px-2.5 text-right">Kiểm tra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {phanTichHangLoat.chiTietDong.map((muc, idx) => (
                      <tr key={idx}>
                        <td className="py-1.5 px-2.5 font-medium text-text">
                          {muc.dong.hoTen || '—'}
                        </td>
                        <td className="py-1.5 px-2.5 font-mono">{muc.dong.email || '—'}</td>
                        <td className="py-1.5 px-2.5">{layNhanVaiTro(muc.dong.vaiTro)}</td>
                        <td className="py-1.5 px-2.5 text-right">
                          {muc.hopLe ? (
                            <span className="inline-flex items-center gap-1 text-accent font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Hợp lệ
                            </span>
                          ) : (
                            <span className="text-danger font-medium">{muc.loi}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Kết quả sau khi gửi */}
          {ketQuaHangLoat && (
            <div className="p-3 rounded-lg bg-accent-soft border border-accent text-xs space-y-1.5">
              <p className="font-semibold text-accent">
                Kết quả xử lý: Tạo thành công {ketQuaHangLoat.soThanhCong}/
                {ketQuaHangLoat.tongSoYeuCau} tài khoản
                {ketQuaHangLoat.soBoQua > 0 ? ` (${ketQuaHangLoat.soBoQua} dòng bỏ qua)` : ''}.
              </p>
              {ketQuaHangLoat.danhSachBoQua?.length > 0 && (
                <ul className="list-disc list-inside text-muted space-y-0.5">
                  {ketQuaHangLoat.danhSachBoQua.map((b, i) => (
                    <li key={i}>
                      <span className="font-mono text-text">{b.email}</span>: {b.lyDo}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-border">
            <button
              type="button"
              onClick={() => setModalHangLoatMo(false)}
              className="px-4 py-2 text-sm text-muted hover:bg-active-bg rounded-lg cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              disabled={phanTichHangLoat.hopLe.length === 0 || mutationTaoHangLoat.isPending}
              onClick={() => mutationTaoHangLoat.mutate(phanTichHangLoat.hopLe)}
              className="px-4 py-2 text-sm font-semibold bg-accent text-white rounded-lg disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {mutationTaoHangLoat.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Tạo hàng loạt ({phanTichHangLoat.hopLe.length} tài khoản)
            </button>
          </div>
        </div>
      </HopThoai>

      {/* Modal Tạo Người Dùng Mới */}
      <HopThoai
        mo={modalTaoMo}
        onDong={() => setModalTaoMo(false)}
        tieuDe="Thêm người dùng mới"
        moTa="Tạo tài khoản người dùng mới và phân quyền vai trò trong hệ thống"
        kichThuoc="nho"
      >
        <form autoComplete="off" onSubmit={handleSubmit(xuLyTaoNguoiDung)} className="space-y-4">
          <input
            type="text"
            name="trap_username_create"
            autoComplete="username"
            defaultValue=""
            tabIndex={-1}
            aria-hidden="true"
            className="sr-only"
          />
          <div>
            <label className="block text-xs font-semibold text-text mb-1">Họ và tên *</label>
            <input
              type="text"
              autoComplete="off"
              {...register('hoTen')}
              placeholder="Ví dụ: Nguyễn Văn An"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent"
            />
            {errors.hoTen && <p className="mt-1 text-xs text-danger">{errors.hoTen.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1">Email *</label>
            <input
              type="email"
              autoComplete="off"
              {...register('email')}
              placeholder="an.nv@lms.edu.vn"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent"
            />
            {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              Mật khẩu khởi tạo *
            </label>
            <input
              type="password"
              autoComplete="new-password"
              {...register('matKhau')}
              placeholder="Tối thiểu 8 ký tự"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent"
            />
            {errors.matKhau && <p className="mt-1 text-xs text-danger">{errors.matKhau.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1">Số điện thoại</label>
            <input
              type="text"
              autoComplete="off"
              {...register('soDienThoai')}
              placeholder="0987654321"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1">Vai trò *</label>
            <select
              {...register('vaiTro')}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface focus:ring-2 focus:ring-accent"
            >
              {DANH_SACH_VAI_TRO.map((vt) => (
                <option key={vt} value={vt}>
                  {layNhanVaiTro(vt)}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
            <button
              type="button"
              onClick={() => setModalTaoMo(false)}
              className="px-4 py-2 text-sm text-muted hover:bg-active-bg rounded-lg cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium bg-accent hover:bg-accent text-white rounded-lg disabled:opacity-60 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Tạo người dùng
            </button>
          </div>
        </form>
      </HopThoai>

      {/* Modal Sửa Thông Tin Người Dùng */}
      <HopThoai
        mo={Boolean(nguoiDungDangSua)}
        onDong={() => setNguoiDungDangSua(null)}
        tieuDe="Chỉnh sửa thông tin người dùng"
        moTa={
          nguoiDungDangSua
            ? `Cập nhật họ tên, số điện thoại, vai trò và trạng thái cho ${nguoiDungDangSua.email}`
            : ''
        }
        kichThuoc="nho"
      >
        <form autoComplete="off" onSubmit={xuLyLuuSuaNguoiDung} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text mb-1">Email đăng nhập</label>
            <input
              type="email"
              value={nguoiDungDangSua?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-bg text-muted cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1">Họ và tên *</label>
            <input
              type="text"
              value={formSua.hoTen}
              onChange={(e) => setFormSua((f) => ({ ...f, hoTen: e.target.value }))}
              placeholder="Ví dụ: Nguyễn Văn An"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1">Số điện thoại</label>
            <input
              type="text"
              value={formSua.soDienThoai}
              onChange={(e) => setFormSua((f) => ({ ...f, soDienThoai: e.target.value }))}
              placeholder="0987654321"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1">Vai trò *</label>
            <select
              value={formSua.vaiTro}
              onChange={(e) => setFormSua((f) => ({ ...f, vaiTro: e.target.value as VaiTro }))}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface focus:ring-2 focus:ring-accent"
            >
              {DANH_SACH_VAI_TRO.map((vt) => (
                <option key={vt} value={vt}>
                  {layNhanVaiTro(vt)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-bg border border-border">
            <div>
              <p className="text-xs font-semibold text-text">Trạng thái hoạt động</p>
              <p className="text-[11px] text-muted">
                {formSua.kichHoat ? 'Tài khoản đang hoạt động bình thường' : 'Tài khoản đang bị khóa'}
              </p>
            </div>
            <CongTac
              checked={formSua.kichHoat}
              ariaLabel="Trạng thái kích hoạt tài khoản"
              onChange={(checked) => setFormSua((f) => ({ ...f, kichHoat: checked }))}
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
            <button
              type="button"
              onClick={() => setNguoiDungDangSua(null)}
              className="px-4 py-2 text-sm text-muted hover:bg-active-bg rounded-lg cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={mutationCapNhat.isPending}
              className="px-4 py-2 text-sm font-medium bg-accent hover:bg-accent text-white rounded-lg disabled:opacity-60 flex items-center gap-2 cursor-pointer"
            >
              {mutationCapNhat.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Lưu thay đổi
            </button>
          </div>
        </form>
      </HopThoai>

      {/* Modal Đặt Lại Mật Khẩu */}
      <HopThoai
        mo={Boolean(modalDatMatKhauMo)}
        onDong={() => {
          setModalDatMatKhauMo(null);
          setMatKhauMoi('');
        }}
        tieuDe="Đặt lại mật khẩu"
        moTa="Nhập mật khẩu mới cho người dùng. Người dùng sẽ bị thu hồi các phiên đăng nhập cũ."
        kichThuoc="nho"
      >
        <form
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault();
            if (modalDatMatKhauMo && matKhauMoi.length >= 8 && !mutationDatLaiMatKhau.isPending) {
              mutationDatLaiMatKhau.mutate({
                id: modalDatMatKhauMo,
                matKhauMoi,
              });
            }
          }}
          className="space-y-4"
        >
          <input
            type="text"
            name="trap_username_reset"
            autoComplete="username"
            defaultValue=""
            tabIndex={-1}
            aria-hidden="true"
            className="sr-only"
          />
          <input
            type="password"
            name="mat_khau_moi_cap_lai"
            autoComplete="new-password"
            placeholder="Mật khẩu mới (tối thiểu 8 ký tự)"
            value={matKhauMoi}
            onChange={(e) => setMatKhauMoi(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent"
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setModalDatMatKhauMo(null);
                setMatKhauMoi('');
              }}
              className="px-3 py-1.5 text-xs text-muted hover:bg-active-bg rounded-md cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={matKhauMoi.length < 8 || mutationDatLaiMatKhau.isPending}
              className="px-3 py-1.5 text-xs font-medium bg-accent hover:bg-accent text-white rounded-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {mutationDatLaiMatKhau.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Xác nhận đổi
            </button>
          </div>
        </form>
      </HopThoai>

      {/* Modal Xác Nhận Xóa Người Dùng */}
      <HopThoai
        mo={Boolean(nguoiDungCanXoa)}
        onDong={() => setNguoiDungCanXoa(null)}
        tieuDe="Xác nhận xóa người dùng"
        moTa="Tài khoản bị xóa sẽ bị thu hồi toàn bộ phiên đăng nhập và ngừng hoạt động."
        kichThuoc="nho"
      >
        <div className="space-y-4">
          {nguoiDungCanXoa && (
            <div className="p-3.5 rounded-lg bg-danger-soft border border-danger text-xs text-text space-y-1">
              <p className="font-semibold text-danger">
                Bạn có chắc chắn muốn xóa tài khoản này?
              </p>
              <p>
                Họ tên: <span className="font-semibold">{nguoiDungCanXoa.hoTen}</span>
              </p>
              <p>
                Email: <span className="font-mono">{nguoiDungCanXoa.email}</span>
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setNguoiDungCanXoa(null)}
              className="px-4 py-2 text-sm text-muted hover:bg-active-bg rounded-lg cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={mutationXoa.isPending}
              onClick={() => nguoiDungCanXoa && mutationXoa.mutate(nguoiDungCanXoa.id)}
              className="px-4 py-2 text-sm font-medium bg-danger text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {mutationXoa.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Xác nhận xóa
            </button>
          </div>
        </div>
      </HopThoai>
    </div>
  );
}
