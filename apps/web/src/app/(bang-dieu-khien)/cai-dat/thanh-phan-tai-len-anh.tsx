'use client';

import React, { useRef, useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  Loader2,
  AlertCircle,
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
  giaTriHienTai,
  dinhDangChoPhep = '.png,.jpg,.jpeg,.svg,.ico,.webp',
  khuyenNghi = 'Hỗ trợ PNG, SVG, JPG, WEBP, ICO (tối đa 5MB)',
  onCapNhat,
  onXoa,
}: ThuocTinhThanhPhanTaiLenAnh) {
  const queryClient = useQueryClient();
  const theInputRef = useRef<HTMLInputElement>(null);
  const [dangTaiLen, setDangTaiLen] = useState(false);
  const [loiCucBo, setLoiCucBo] = useState<string | null>(null);

  const xuLyTaiLenTep = async (tep: File) => {
    setLoiCucBo(null);

    if (tep.size > 5 * 1024 * 1024) {
      const thongBaoLoi = 'Kích thước tệp vượt quá giới hạn 5MB.';
      setLoiCucBo(thongBaoLoi);
      thongBao.canhBao('Tệp quá lớn', thongBaoLoi);
      return;
    }

    const duoiTep = tep.name.split('.').pop()?.toLowerCase();
    const duoiHopLe = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'ico'];
    if (!duoiTep || !duoiHopLe.includes(duoiTep)) {
      const thongBaoLoi =
        'Định dạng tệp không hợp lệ. Vui lòng chọn ảnh PNG, JPG, SVG, WEBP hoặc ICO.';
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

      onCapNhat(duongDanMoi);

      await queryClient.invalidateQueries({ queryKey: ['cai-dat-he-thong'] });
      await queryClient.invalidateQueries({ queryKey: ['cai-dat-cong-khai'] });

      thongBao.thanhCong(
        'Đã tải lên tệp ảnh',
        `Đã áp dụng "${tep.name}" cho mục ${nhan}.`,
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
    <div className="space-y-1.5">
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

      <div className="flex items-center gap-2.5">
        <div className="relative shrink-0 flex items-center justify-center w-10 h-10 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] overflow-hidden">
          {coAnh ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={giaTriHienTai}
              alt={nhan}
              className="max-h-8 max-w-8 object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.opacity = '0.3';
              }}
            />
          ) : (
            <ImageIcon className="w-4 h-4 text-[var(--muted)] stroke-[1.5]" />
          )}

          {dangTaiLen && (
            <div className="absolute inset-0 bg-[var(--surface)] flex items-center justify-center text-[var(--accent)]">
              <Loader2 className="w-4 h-4 animate-spin stroke-[1.5]" />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            disabled={dangTaiLen}
            onClick={() => theInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius)] text-xs font-semibold text-[var(--text)] bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--active-bg)] focus-visible:outline-none focus-visible:border-[var(--accent)] transition-colors cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>{coAnh ? 'Đổi ảnh' : 'Chọn ảnh'}</span>
          </button>

          {coAnh && (
            <button
              type="button"
              disabled={dangTaiLen}
              onClick={onXoa}
              title="Gỡ tệp ảnh hiện tại"
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-[var(--radius)] text-xs font-semibold text-[var(--danger)] bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--danger-soft)] hover:border-[var(--danger)] focus-visible:outline-none transition-colors cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Gỡ</span>
            </button>
          )}

          {coAnh && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[var(--radius)] text-[10px] font-mono bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]">
              <CheckCircle2 className="w-3 h-3 stroke-[1.5]" />
              Đã tải
            </span>
          )}
        </div>
      </div>

      {khuyenNghi && (
        <p className="text-[11px] text-[var(--muted)] leading-snug">{khuyenNghi}</p>
      )}

      {loiCucBo && (
        <div className="px-2.5 py-1.5 rounded-[var(--radius)] bg-[var(--danger-soft)] border border-[var(--danger)] text-[var(--danger)] text-[11px] flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 stroke-[1.5]" />
          <span>{loiCucBo}</span>
        </div>
      )}
    </div>
  );
}

