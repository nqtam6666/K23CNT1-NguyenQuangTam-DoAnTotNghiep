'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
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
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="rgb(5,150,105)"/><circle cx="50" cy="38" r="18" fill="rgb(230,246,239)"/><path d="M26 80c0-13 11-22 24-22s24 9 24 22" fill="rgb(4,120,87)"/><circle cx="44" cy="36" r="2.5" fill="rgb(43,42,39)"/><circle cx="56" cy="36" r="2.5" fill="rgb(43,42,39)"/><path d="M46 44q4 3 8 0" stroke="rgb(43,42,39)" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
  },
  {
    id: 'hoc-sinh-2',
    ten: 'Học sinh Sáng tạo',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="rgb(16,185,129)"/><circle cx="50" cy="38" r="18" fill="rgb(250,248,244)"/><path d="M26 80c0-13 11-22 24-22s24 9 24 22" fill="rgb(5,150,105)"/><circle cx="43" cy="36" r="2.5" fill="rgb(43,42,39)"/><circle cx="57" cy="36" r="2.5" fill="rgb(43,42,39)"/><path d="M45 43q5 3 10 0" stroke="rgb(43,42,39)" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`,
  },
  {
    id: 'tot-nghiep',
    ten: 'Tân Cử nhân',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="rgb(14,165,198)"/><path d="M20 32l30-12 30 12-30 12z" fill="rgb(43,42,39)"/><circle cx="50" cy="46" r="16" fill="rgb(250,248,244)"/><path d="M25 82c0-14 11-23 25-23s25 9 25 23" fill="rgb(43,42,39)"/><circle cx="45" cy="45" r="2.5" fill="rgb(43,42,39)"/><circle cx="55" cy="45" r="2.5" fill="rgb(43,42,39)"/></svg>`,
  },
  {
    id: 'giang-vien',
    ten: 'Nhà Giáo dục',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="rgb(5,150,105)"/><circle cx="50" cy="38" r="18" fill="rgb(255,253,248)"/><path d="M38 34h8v5h-8zm16 0h8v5h-8z" stroke="rgb(43,42,39)" stroke-width="2" fill="none"/><path d="M46 36h8" stroke="rgb(43,42,39)" stroke-width="2"/><path d="M26 80c0-13 11-22 24-22s24 9 24 22" fill="rgb(43,42,39)"/></svg>`,
  },
  {
    id: 'nghien-cuu',
    ten: 'Nhà Nghiên cứu',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="rgb(122,118,109)"/><circle cx="50" cy="38" r="18" fill="rgb(250,248,244)"/><path d="M26 80c0-13 11-22 24-22s24 9 24 22" fill="rgb(43,42,39)"/><circle cx="44" cy="36" r="2.5" fill="rgb(43,42,39)"/><circle cx="56" cy="36" r="2.5" fill="rgb(43,42,39)"/></svg>`,
  },
  {
    id: 'cong-nghe',
    ten: 'Chuyên viên Công nghệ',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="rgb(15,118,110)"/><circle cx="50" cy="38" r="18" fill="rgb(250,248,244)"/><path d="M26 80c0-13 11-22 24-22s24 9 24 22" fill="rgb(17,94,89)"/><circle cx="43" cy="36" r="2.5" fill="rgb(43,42,39)"/><circle cx="57" cy="36" r="2.5" fill="rgb(43,42,39)"/></svg>`,
  },
  {
    id: 'tri-thuc',
    ten: 'Độc giả Tri thức',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="rgb(180,83,9)"/><circle cx="50" cy="36" r="18" fill="rgb(250,248,244)"/><path d="M26 80c0-13 11-22 24-22s24 9 24 22" fill="rgb(146,64,14)"/><circle cx="44" cy="34" r="2.5" fill="rgb(43,42,39)"/><circle cx="56" cy="34" r="2.5" fill="rgb(43,42,39)"/></svg>`,
  },
  {
    id: 'quan-tri',
    ten: 'Quản trị Học viện',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="rgb(43,42,39)"/><circle cx="50" cy="38" r="18" fill="rgb(229,226,218)"/><path d="M26 80c0-13 11-22 24-22s24 9 24 22" fill="rgb(122,118,109)"/><circle cx="44" cy="36" r="2.5" fill="rgb(43,42,39)"/><circle cx="56" cy="36" r="2.5" fill="rgb(43,42,39)"/></svg>`,
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
  const [tabHienTai, setTabHienTai] = useState<'tai-len' | 'mau-san'>('tai-len');
  const [tepChon, setTepChon] = useState<File | null>(null);
  const [urlXemTruoc, setUrlXemTruoc] = useState<string | null>(anhDaiDienHienTai || null);
  const [dangXuLy, setDangXuLy] = useState(false);
  const [loiCucBo, setLoiCucBo] = useState<string | null>(null);
  const theInputTepRef = useRef<HTMLInputElement>(null);

  // Khi modal mở, cập nhật lại ảnh xem trước về ảnh hiện tại
  useEffect(() => {
    if (mo) {
      setTabHienTai('tai-len');
      setUrlXemTruoc(anhDaiDienHienTai || null);
      setTepChon(null);
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
      moTa="Tải ảnh mới trực tiếp từ thiết bị của bạn hoặc chọn avatar mẫu học đường"
      kichThuoc="vua"
    >
      <div className="space-y-6">
        {/* Vùng xem trước ảnh đại diện */}
        <div className="flex flex-col items-center justify-center p-4 rounded bg-bg border border-border ">
          <div className="relative">
            <AnhDaiDien
              url={urlXemTruoc}
              hoTen={hoTen}
              kichThuoc="xl"
              className="ring-4 ring-white shadow-md"
            />
            {urlXemTruoc !== anhDaiDienHienTai && (
              <span className="absolute bottom-0.5 right-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent text-white shadow-xs ring-2 ring-white select-none">
                Mới
              </span>
            )}
          </div>
          <p className="mt-2.5 text-xs text-muted font-medium">
            {urlXemTruoc
              ? tepChon
                ? `Ảnh chọn: ${tepChon.name} (${Math.round(tepChon.size / 1024)} KB)`
                : 'Ảnh xem trước'
              : 'Chưa có ảnh đại diện (đang dùng chữ cái mặc định)'}
          </p>
        </div>

        {/* Thông báo lỗi nội dòng nếu có */}
        {loiCucBo && (
          <div className="p-3 rounded bg-danger-soft border border-danger text-danger text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-danger" />
            <span>{loiCucBo}</span>
          </div>
        )}

        {/* Danh sách tab chọn nguồn ảnh */}
        <div className="flex border-b border-border gap-2">
          <button
            type="button"
            onClick={() => setTabHienTai('tai-len')}
            className={`pb-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              tabHienTai === 'tai-len'
                ? 'border-accent text-accent '
                : 'border-transparent text-muted hover:text-text '
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
                ? 'border-accent text-accent '
                : 'border-transparent text-muted hover:text-text '
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Bộ sưu tập học đường
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
              className="p-6 border-2 border-dashed border-border hover:border-accent rounded flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-accent-soft group"
            >
              <div className="w-12 h-12 rounded-full bg-accent-soft text-accent flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-text ">
                Nhấp để chọn ảnh hoặc kéo thả ảnh vào đây
              </p>
              <p className="text-[11px] text-muted mt-1">
                Hỗ trợ định dạng PNG, JPG, WEBP hoặc GIF (Dung lượng tối đa 5MB)
              </p>
            </div>
          </div>
        )}

        {/* Nội dung Tab 2: Chọn ảnh mẫu học đường */}
        {tabHienTai === 'mau-san' && (
          <div className="space-y-3">
            <p className="text-xs text-muted ">
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
                    className={`relative p-2 rounded flex flex-col items-center gap-1.5 transition-all cursor-pointer border ${
                      dangChon
                        ? 'border-accent bg-accent-soft ring-2 ring-accent'
                        : 'border-border hover:border-border bg-surface '
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-2xs">
                      <img src={item.dataUri} alt={item.ten} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-medium text-text text-center line-clamp-1">
                      {item.ten}
                    </span>
                    {dangChon && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-accent text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Thanh tác vụ chân hộp thoại */}
        <div className="pt-4 border-t border-border flex items-center justify-between">
          <div>
            {anhDaiDienHienTai && (
              <button
                type="button"
                onClick={xuLyGoAnh}
                disabled={dangXuLy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger-soft rounded-lg transition-colors cursor-pointer disabled:opacity-50"
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
              className="px-4 py-2 border border-border text-text rounded text-xs font-medium hover:bg-bg transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={xuLyLuuAnh}
              disabled={dangXuLy || (!tepChon && urlXemTruoc === anhDaiDienHienTai)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent text-white rounded text-xs font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
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
