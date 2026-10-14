'use client';

import React, { useRef, useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { mayKhachApi } from '../../../tien-ich/may-khach-api';
import { thongBao } from '../../../tien-ich/thong-bao';

interface ThuocTinhThanhPhanTaiLenAnh {
  khoa: string;
  nhan: string;
  moTa: string;
  giaTriHienTai?: string;
  dinhDangChoPhep?: string;
  khuyenNghi?: string;
  onCapNhat: (duongDanMoi: string) => void;
  onXoa: () => void;
}

export function ThanhPhanTaiLenAnhCaiDat({
  khoa,
  nhan,
  moTa,
  giaTriHienTai,
  dinhDangChoPhep = '.png,.jpg,.jpeg,.svg,.ico,.webp',
  khuyenNghi = 'Hỗ trợ PNG, SVG, JPG, WEBP, ICO (Tối đa 5MB)',
  onCapNhat,
  onXoa,
}: ThuocTinhThanhPhanTaiLenAnh) {
  const queryClient = useQueryClient();
  const theInputRef = useRef<HTMLInputElement>(null);
  const [dangTaiLen, setDangTaiLen] = useState(false);
  const [loiCucBo, setLoiCucBo] = useState<string | null>(null);
  const [dangKeoTha, setDangKeoTha] = useState(false);

  const xuLyTaiLenTep = async (tep: File) => {
    setLoiCucBo(null);

    // 1. Kiểm tra kích thước (< 5MB)
    if (tep.size > 5 * 1024 * 1024) {
      const thongBaoLoi = 'Kích thước tệp vượt quá giới hạn 5MB.';
      setLoiCucBo(thongBaoLoi);
      thongBao.canhBao('Tệp quá lớn', thongBaoLoi);
      return;
    }

    // 2. Kiểm tra định dạng đuôi tệp
    const duoiTep = tep.name.split('.').pop()?.toLowerCase();
    const duoiHopLe = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'ico'];
    if (!duoiTep || !duoiHopLe.includes(duoiTep)) {
      const thongBaoLoi = 'Định dạng tệp không được hỗ trợ. Vui lòng chọn ảnh PNG, JPG, SVG, WEBP hoặc ICO.';
      setLoiCucBo(thongBaoLoi);
      thongBao.canhBao('Định dạng không hợp lệ', thongBaoLoi);
      return;
    }

    setDangTaiLen(true);

    try {
      const formData = new FormData();
      formData.append('tep', tep);
      formData.append('khoa', khoa);

      const phanHoi = await mayKhachApi.post('/cai-dat/tai-len-tep', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const duongDanMoi = phanHoi.data?.duLieu?.url || phanHoi.data?.url;

      if (!duongDanMoi) {
        throw new Error('Không nhận được đường dẫn tệp tải lên từ máy chủ.');
      }

      // Cập nhật giá trị vào biểu mẫu
      onCapNhat(duongDanMoi);

      // Làm mới bộ đệm cài đặt hệ thống trên toàn web app
      await queryClient.invalidateQueries({ queryKey: ['caiDatHeThong'] });
      await queryClient.invalidateQueries({ queryKey: ['cai-dat-cong-khai'] });

      thongBao.thanhCong(
        'Tải lên tệp thành công!',
        `Đã tải lên và áp dụng "${tep.name}" cho ${nhan}.`,
      );
    } catch (loi: any) {
      const msg =
        loi.response?.data?.thongDiep ||
        loi.response?.data?.message ||
        'Không thể tải tệp lên máy chủ. Vui lòng thử lại.';
      setLoiCucBo(msg);
      thongBao.thatBai('Tải lên thất bại', msg);
    } finally {
      setDangTaiLen(false);
      if (theInputRef.current) {
        theInputRef.current.value = '';
      }
    }
  };

  const coAnh = Boolean(giaTriHienTai && giaTriHienTai.trim().length > 0);

  return (
    <div className="space-y-3">
      {/* Ẩn thẻ input file gốc */}
      <input
        ref={theInputRef}
        type="file"
        data-input-khoa={khoa}
        accept={dinhDangChoPhep}
        className="hidden"
        onChange={(e) => {
          const tep = e.target.files?.[0];
          if (tep) {
            xuLyTaiLenTep(tep);
          }
        }}
      />

      {/* Thông báo lỗi nội dòng nếu có */}
      {loiCucBo && (
        <div className="p-3 rounded bg-danger-soft border border-danger text-danger text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-danger" />
          <span>{loiCucBo}</span>
        </div>
      )}

      {/* Giao diện chính của bộ tải ảnh */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 rounded border border-border bg-bg">
        {/* Khung xem trước hình ảnh */}
        <div className="relative shrink-0 flex items-center justify-center w-28 h-24 rounded border border-border bg-surface overflow-hidden group">
          {coAnh ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={giaTriHienTai}
              alt={nhan}
              className="relative max-h-20 max-w-[96px] object-contain p-1"
              onError={(e) => {
                // Nếu ảnh tải lỗi thì ẩn đi hiển thị placeholder
                (e.currentTarget as HTMLElement).style.opacity = '0.3';
              }}
            />
          ) : (
            <div className="relative flex flex-col items-center justify-center text-muted">
              <ImageIcon className="w-7 h-7 stroke-[1.5]" />
              <span className="text-[10px] mt-1 font-medium">Chưa có tệp</span>
            </div>
          )}

          {dangTaiLen && (
            <div className="absolute inset-0 bg-surface/90 flex flex-col items-center justify-center text-accent">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-[10px] font-semibold mt-1">Đang tải...</span>
            </div>
          )}
        </div>

        {/* Khu vực thông tin & Kéo thả / Chọn tệp */}
        <div className="flex-1 min-w-0 flex flex-col justify-center space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text ">
              {coAnh ? 'Tệp ảnh hiện tại đang dùng' : 'Chưa tải lên tệp nào'}
            </span>
            {coAnh && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent-soft text-accent border border-accent ">
                <CheckCircle2 className="w-3 h-3" />
                Đang áp dụng
              </span>
            )}
          </div>

          {coAnh && (
            <p className="text-[11px] font-mono text-muted truncate max-w-full">
              {giaTriHienTai}
            </p>
          )}

          <p className="text-[11px] text-muted ">
            {khuyenNghi}
          </p>

          {/* Vùng nút bấm hành động */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              disabled={dangTaiLen}
              onClick={() => theInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-white bg-accent hover:bg-accent transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              {coAnh ? 'Tải tệp ảnh mới' : 'Chọn tệp từ máy tính'}
            </button>

            {coAnh && (
              <button
                type="button"
                disabled={dangTaiLen}
                onClick={onXoa}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-danger bg-surface border border-danger hover:bg-danger-soft transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Gỡ tệp này
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Vùng kéo thả phụ nhanh */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDangKeoTha(true);
        }}
        onDragLeave={() => setDangKeoTha(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDangKeoTha(false);
          const tep = e.dataTransfer.files?.[0];
          if (tep) {
            xuLyTaiLenTep(tep);
          }
        }}
        onClick={() => theInputRef.current?.click()}
        className={`p-3 border-2 border-dashed rounded flex items-center justify-center gap-2 text-center cursor-pointer transition-all ${
          dangKeoTha
            ? 'border-accent bg-accent-soft text-accent '
            : 'border-border hover:border-accent text-muted hover:bg-active-bg '
        }`}
      >
        <Upload className="w-3.5 h-3.5 shrink-0" />
        <span className="text-[11px] font-medium">
          Hoặc kéo thả trực tiếp tệp ảnh vào đây để tải lên ngay lập tức
        </span>
      </div>
    </div>
  );
}
