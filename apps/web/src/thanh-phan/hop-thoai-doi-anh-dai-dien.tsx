'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  Check,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { HopThoai } from './hop-thoai';
import { AnhDaiDien } from './anh-dai-dien';
import { mayKhachApi } from '../tien-ich/may-khach-api';
import { thongBao } from '../tien-ich/thong-bao';

interface ThuocTinhHopThoaiDoiAnh {
  mo: boolean;
  onDong: () => void;
  anhDaiDienHienTai?: string | null;
  hoTen?: string | null;
}

// Danh mục 8 avatar mẫu học đường dạng SVG phẳng, tự chứa 100%
const AVATAR_MAU = [
  {
    id: 'hoc-sinh-1',
    ten: 'Học viên Năng động',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#3B82F6"/><circle cx="50" cy="38" r="18" fill="#FDE047"/><path d="M26 80c0-13 11-22 24-22s24 9 24 22" fill="#1D4ED8"/><circle cx="44" cy="36" r="2.5" fill="#1E293B"/><circle cx="56" cy="36" r="2.5" fill="#1E293B"/><path d="M46 44q4 3 8 0" stroke="#1E293B" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
  },
  {
    id: 'hoc-sinh-2',
    ten: 'Học sinh Sáng tạo',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#10B981"/><circle cx="50" cy="38" r="18" fill="#FED7AA"/><path d="M26 80c0-13 11-22 24-22s24 9 24 22" fill="#047857"/><circle cx="43" cy="36" r="2.5" fill="#1E293B"/><circle cx="57" cy="36" r="2.5" fill="#1E293B"/><path d="M45 43q5 3 10 0" stroke="#1E293B" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="50" cy="20" r="6" fill="#F59E0B"/></svg>`,
  },
  {
    id: 'tot-nghiep',
    ten: 'Tân Cử nhân',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#6366F1"/><path d="M20 32l30-12 30 12-30 12z" fill="#1E1B4B"/><path d="M72 35v16" stroke="#FBBF24" stroke-width="3" stroke-linecap="round"/><circle cx="72" cy="53" r="2" fill="#FBBF24"/><circle cx="50" cy="46" r="16" fill="#FDE047"/><path d="M25 82c0-14 11-23 25-23s25 9 25 23" fill="#312E81"/><circle cx="45" cy="45" r="2.5" fill="#1E293B"/><circle cx="55" cy="45" r="2.5" fill="#1E293B"/><path d="M47 52q3 2 6 0" stroke="#1E293B" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
  },
  {
    id: 'giang-vien',
    ten: 'Nhà Giáo dục',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#0284C7"/><circle cx="50" cy="38" r="18" fill="#FEE2E2"/><path d="M38 34h8v5h-8zm16 0h8v5h-8z" stroke="#0369A1" stroke-width="2" fill="none"/><path d="M46 36h8" stroke="#0369A1" stroke-width="2"/><path d="M26 80c0-13 11-22 24-22s24 9 24 22" fill="#0C4A6E"/><path d="M46 58l4 10 4-10z" fill="#E11D48"/><circle cx="44" cy="37" r="2" fill="#0F172A"/><circle cx="56" cy="37" r="2" fill="#0F172A"/></svg>`,
  },
  {
    id: 'nghien-cuu',
    ten: 'Nhà Nghiên cứu',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#8B5CF6"/><circle cx="50" cy="38" r="18" fill="#FEF08A"/><path d="M26 80c0-13 11-22 24-22s24 9 24 22" fill="#5B21B6"/><circle cx="44" cy="36" r="2.5" fill="#1E293B"/><circle cx="56" cy="36" r="2.5" fill="#1E293B"/><path d="M46 44q4 2.5 8 0" stroke="#1E293B" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="68" cy="28" r="7" fill="#C084FC" opacity="0.8"/></svg>`,
  },
  {
    id: 'cong-nghe',
    ten: 'Chuyên viên Công nghệ',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#0F766E"/><circle cx="50" cy="38" r="18" fill="#FDE047"/><path d="M26 80c0-13 11-22 24-22s24 9 24 22" fill="#115E59"/><circle cx="43" cy="36" r="2.5" fill="#0F172A"/><circle cx="57" cy="36" r="2.5" fill="#0F172A"/><path d="M46 44h8" stroke="#0F172A" stroke-width="2" stroke-linecap="round"/><rect x="34" y="66" width="32" height="18" rx="2" fill="#CCFBF1"/><rect x="36" y="68" width="28" height="12" rx="1" fill="#042F2E"/></svg>`,
  },
  {
    id: 'tri-thuc',
    ten: 'Độc giả Tri thức',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#D97706"/><circle cx="50" cy="36" r="18" fill="#FED7AA"/><path d="M26 80c0-13 11-22 24-22s24 9 24 22" fill="#92400E"/><path d="M36 68l14-6 14 6v8l-14-5-14 5z" fill="#FEF3C7"/><circle cx="44" cy="34" r="2.5" fill="#451A03"/><circle cx="56" cy="34" r="2.5" fill="#451A03"/></svg>`,
  },
  {
    id: 'quan-tri',
    ten: 'Quản trị Học viện',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#475569"/><circle cx="50" cy="38" r="18" fill="#E2E8F0"/><path d="M26 80c0-13 11-22 24-22s24 9 24 22" fill="#1E293B"/><circle cx="44" cy="36" r="2.5" fill="#0F172A"/><circle cx="56" cy="36" r="2.5" fill="#0F172A"/><path d="M46 44h8" stroke="#0F172A" stroke-width="2" stroke-linecap="round"/><path d="M50 18l10 5v8c0 7-10 11-10 11s-10-4-10-11v-8z" fill="#F59E0B" opacity="0.9"/></svg>`,
  },
].map((item) => ({
  ...item,
  dataUri: `data:image/svg+xml;utf8,${encodeURIComponent(item.svg)}`,
}));

export function HopThoaiDoiAnhDaiDien({
  mo,
  onDong,
  anhDaiDienHienTai,
  hoTen,
}: ThuocTinhHopThoaiDoiAnh) {
  const queryClient = useQueryClient();
  const [tabHienTai, setTabHienTai] = useState<'tai-len' | 'mau-san' | 'lien-ket'>('tai-len');
  const [tepChon, setTepChon] = useState<File | null>(null);
  const [urlXemTruoc, setUrlXemTruoc] = useState<string | null>(anhDaiDienHienTai || null);
  const [urlNhapTay, setUrlNhapTay] = useState<string>('');
  const [dangXuLy, setDangXuLy] = useState(false);
  const [loiCucBo, setLoiCucBo] = useState<string | null>(null);
  const theInputTepRef = useRef<HTMLInputElement>(null);

  // Khi modal mở, cập nhật lại ảnh xem trước về ảnh hiện tại
  useEffect(() => {
    if (mo) {
      setTabHienTai('tai-len');
      setUrlXemTruoc(anhDaiDienHienTai || null);
      setTepChon(null);
      setUrlNhapTay('');
      setLoiCucBo(null);
    }
  }, [mo, anhDaiDienHienTai]);

  // Xử lý khi người dùng chọn file từ máy tính
  const xuLyChonTep = (tep: File) => {
    setLoiCucBo(null);

    // 1. Kiểm tra kích thước (< 5MB)
    if (tep.size > 5 * 1024 * 1024) {
      setLoiCucBo('Dung lượng tệp vượt quá giới hạn 5MB.');
      thongBao.canhBao('Tệp quá lớn', 'Vui lòng chọn hình ảnh có dung lượng dưới 5MB.');
      return;
    }

    // 2. Kiểm tra định dạng MIME
    const loaiHopLe = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!loaiHopLe.includes(tep.type)) {
      setLoiCucBo('Định dạng tệp không được hỗ trợ (chỉ nhận JPG, PNG, WEBP, GIF).');
      thongBao.canhBao('Định dạng không hợp lệ', 'Vui lòng chọn ảnh định dạng JPG, PNG, WEBP hoặc GIF.');
      return;
    }

    setTepChon(tep);
    const urlMoi = URL.createObjectURL(tep);
    setUrlXemTruoc(urlMoi);
  };

  // Xử lý chọn ảnh mẫu có sẵn
  const xuLyChonAnhMau = (dataUri: string) => {
    setLoiCucBo(null);
    setTepChon(null);
    setUrlXemTruoc(dataUri);
  };

  // Xử lý áp dụng URL nhập tay
  const xuLyApDungUrl = () => {
    setLoiCucBo(null);
    const link = urlNhapTay.trim();
    if (!link) {
      setLoiCucBo('Vui lòng nhập đường dẫn hình ảnh.');
      return;
    }
    if (!link.startsWith('http://') && !link.startsWith('https://') && !link.startsWith('/')) {
      setLoiCucBo('Đường dẫn phải bắt đầu bằng http://, https:// hoặc /');
      return;
    }
    setTepChon(null);
    setUrlXemTruoc(link);
    thongBao.thanhCong('Đã nạp ảnh xem trước');
  };

  // Gỡ ảnh đại diện (quay lại chữ cái đầu)
  const xuLyGoAnh = async () => {
    setDangXuLy(true);
    setLoiCucBo(null);
    try {
      await mayKhachApi.patch('/ho-so/ca-nhan', {
        anhDaiDien: '',
      });
      await queryClient.invalidateQueries({ queryKey: ['hoSoCaNhan'] });
      await queryClient.invalidateQueries({ queryKey: ['ho-so-hien-tai'] });
      thongBao.thanhCong('Đã gỡ ảnh đại diện', 'Ảnh đại diện đã được hoàn nguyên về dạng chữ cái mặc định.');
      onDong();
    } catch (loi: any) {
      const msg = loi.response?.data?.thongDiep || 'Không thể gỡ ảnh đại diện';
      setLoiCucBo(msg);
      thongBao.loiHeThong(loi, 'Không thể gỡ ảnh đại diện');
    } finally {
      setDangXuLy(false);
    }
  };

  // Lưu ảnh đại diện
  const xuLyLuuAnh = async () => {
    setDangXuLy(true);
    setLoiCucBo(null);

    try {
      // Trường hợp 1: Tải tệp lên từ máy
      if (tepChon) {
        const formData = new FormData();
        formData.append('tep', tepChon);

        await mayKhachApi.post('/ho-so/anh-dai-dien', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      // Trường hợp 2: Dùng ảnh mẫu hoặc URL trực tiếp
      else if (urlXemTruoc && urlXemTruoc !== anhDaiDienHienTai) {
        await mayKhachApi.patch('/ho-so/ca-nhan', {
          anhDaiDien: urlXemTruoc,
        });
      } else {
        onDong();
        return;
      }

      // Làm mới dữ liệu trên toàn bộ giao diện (Header, Sidebar, Profile)
      await queryClient.invalidateQueries({ queryKey: ['hoSoCaNhan'] });
      await queryClient.invalidateQueries({ queryKey: ['ho-so-hien-tai'] });

      thongBao.thanhCong('Cập nhật ảnh đại diện thành công', 'Ảnh đại diện mới đã được lưu vào hệ thống.');
      onDong();
    } catch (loi: any) {
      const msg = loi.response?.data?.thongDiep || 'Cập nhật ảnh đại diện thất bại.';
      setLoiCucBo(msg);
      thongBao.loiHeThong(loi, 'Cập nhật ảnh đại diện thất bại');
    } finally {
      setDangXuLy(false);
    }
  };

  return (
    <HopThoai
      mo={mo}
      onDong={onDong}
      tieuDe="Thay đổi Ảnh đại diện"
      moTa="Tải ảnh mới từ máy tính, chọn avatar mẫu học đường hoặc nhập liên kết ảnh"
      kichThuoc="vua"
    >
      <div className="space-y-6">
        {/* Vùng xem trước ảnh đại diện */}
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="relative">
            <AnhDaiDien
              url={urlXemTruoc}
              hoTen={hoTen}
              kichThuoc="xl"
              className="ring-4 ring-white dark:ring-slate-800 shadow-md"
            />
            {urlXemTruoc !== anhDaiDienHienTai && (
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                Mới
              </span>
            )}
          </div>
          <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            {urlXemTruoc
              ? tepChon
                ? `Ảnh chọn: ${tepChon.name} (${Math.round(tepChon.size / 1024)} KB)`
                : 'Ảnh xem trước'
              : 'Chưa có ảnh đại diện (đang dùng chữ cái mặc định)'}
          </p>
        </div>

        {/* Thông báo lỗi nội dòng nếu có */}
        {loiCucBo && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{loiCucBo}</span>
          </div>
        )}

        {/* Danh sách tab chọn nguồn ảnh */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
          <button
            type="button"
            onClick={() => setTabHienTai('tai-len')}
            className={`pb-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              tabHienTai === 'tai-len'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Tải lên từ thiết bị
          </button>

          <button
            type="button"
            onClick={() => setTabHienTai('mau-san')}
            className={`pb-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              tabHienTai === 'mau-san'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Bộ sưu tập học đường
          </button>

          <button
            type="button"
            onClick={() => setTabHienTai('lien-ket')}
            className={`pb-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              tabHienTai === 'lien-ket'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            Liên kết URL
          </button>
        </div>

        {/* Nội dung Tab 1: Tải lên từ máy */}
        {tabHienTai === 'tai-len' && (
          <div className="space-y-3">
            <input
              ref={theInputTepRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const tep = e.target.files?.[0];
                if (tep) xuLyChonTep(tep);
              }}
            />

            <div
              onClick={() => theInputTepRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const tep = e.dataTransfer.files?.[0];
                if (tep) xuLyChonTep(tep);
              }}
              className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-blue-50/40 dark:hover:bg-blue-950/20 group"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Nhấp để chọn ảnh hoặc kéo thả ảnh vào đây
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Hỗ trợ định dạng PNG, JPG, WEBP hoặc GIF (Dung lượng tối đa 5MB)
              </p>
            </div>
          </div>
        )}

        {/* Nội dung Tab 2: Chọn ảnh mẫu học đường */}
        {tabHienTai === 'mau-san' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chọn một hình tượng đại diện phù hợp với vai trò và phong cách của bạn:
            </p>
            <div className="grid grid-cols-4 gap-3">
              {AVATAR_MAU.map((item) => {
                const dangChon = urlXemTruoc === item.dataUri;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => xuLyChonAnhMau(item.dataUri)}
                    title={item.ten}
                    className={`relative p-2 rounded-xl flex flex-col items-center gap-1.5 transition-all cursor-pointer border ${
                      dangChon
                        ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 ring-2 ring-blue-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-2xs">
                      <img src={item.dataUri} alt={item.ten} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 text-center line-clamp-1">
                      {item.ten}
                    </span>
                    {dangChon && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Nội dung Tab 3: Nhập link ảnh trực tiếp */}
        {tabHienTai === 'lien-ket' && (
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Đường dẫn hình ảnh trực tiếp (URL)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={urlNhapTay}
                onChange={(e) => setUrlNhapTay(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={xuLyApDungUrl}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Xem trước
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Đảm bảo hình ảnh được chia sẻ công khai và có thể tải được trực tiếp.
            </p>
          </div>
        )}

        {/* Thanh tác vụ chân hộp thoại */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            {anhDaiDienHienTai && (
              <button
                type="button"
                onClick={xuLyGoAnh}
                disabled={dangXuLy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Gỡ ảnh hiện tại
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDong}
              disabled={dangXuLy}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={xuLyLuuAnh}
              disabled={dangXuLy || (!tepChon && urlXemTruoc === anhDaiDienHienTai)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              {dangXuLy ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Lưu ảnh đại diện
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </HopThoai>
  );
}
