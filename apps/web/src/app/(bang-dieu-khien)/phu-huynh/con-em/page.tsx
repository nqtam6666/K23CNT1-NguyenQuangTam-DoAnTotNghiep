'use client';

import { useQuery } from '@tanstack/react-query';
import { HeartHandshake, GraduationCap, School, AlertCircle, Loader2 } from 'lucide-react';
import { mayKhachApi } from '../../../../tien-ich/may-khach-api';

export default function TrangConEmPhuHuynh() {
  const {
    data: danhSachConEm,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['danhSachConEmPhuHuynh'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/ho-so/con-em');
      return res.data?.duLieu || [];
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow mb-1">Cổng thông tin phụ huynh</p>
        <h2 className="text-[22px] font-sans font-bold text-[var(--text)] tracking-tight">Theo dõi Con em</h2>
        <p className="text-[13.5px] text-[var(--muted)] mt-1">
          Danh sách sinh viên được liên kết với tài khoản phụ huynh của bạn trong hệ thống trường học.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-2" />
          <p className="text-sm text-muted">Đang tải danh sách sinh viên liên kết...</p>
        </div>
      ) : isError ? (
        <div className="p-8 text-center text-danger bg-surface rounded-[var(--radius)] border border-border">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm font-medium">Không thể tải danh sách con em.</p>
        </div>
      ) : danhSachConEm.length === 0 ? (
        <div className="py-16 text-center bg-surface rounded-[var(--radius)] border border-border shadow-2xs">
          <HeartHandshake className="w-12 h-12 text-muted mx-auto mb-3" />
          <p className="font-medium text-text">Chưa có liên kết sinh viên nào</p>
          <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
            Vui lòng liên hệ phòng Giáo vụ hoặc Giảng viên chủ nhiệm để xác nhận và thiết lập liên
            kết tài khoản phụ huynh.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {danhSachConEm.map((lienKet: any) => {
            const hocSinh = lienKet.hocSinh;
            return (
              <div
                key={lienKet.id}
                className="rounded-[var(--radius)] bg-surface border border-border shadow-2xs overflow-hidden"
              >
                <div className="h-1 w-full bg-[var(--accent)]" />
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent-soft text-accent font-bold text-lg flex items-center justify-center border border-accent shrink-0">
                      {hocSinh?.nguoiDung?.hoTen?.charAt(0) || 'H'}
                    </div>
                    <div>
                      <h3 className="font-bold text-text text-[16px]">
                        {hocSinh?.nguoiDung?.hoTen}
                      </h3>
                      <p className="font-mono text-[11.5px] text-muted">{hocSinh?.nguoiDung?.email}</p>
                      <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-[var(--radius)] text-[11px] font-semibold bg-accent-soft text-accent border border-accent">
                        Mối quan hệ: {lienKet.moiQuanHe}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3.5 border-t border-border grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-muted">Mã sinh viên:</span>
                      <p className="font-mono font-semibold text-accent mt-0.5">{hocSinh?.maHocSinh}</p>
                    </div>
                    <div>
                      <span className="text-muted">Lớp sinh hoạt:</span>
                      <p className="font-semibold text-text mt-0.5">
                        {hocSinh?.lopHanhChinh?.tenLop || 'Chưa xếp lớp'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted">Khối:</span>
                      <p className="font-semibold text-text mt-0.5">
                        Khối {hocSinh?.lopHanhChinh?.khoiLop || '---'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted">Ngày sinh:</span>
                      <p className="font-mono font-semibold text-text mt-0.5 tabular-nums">
                        {hocSinh?.ngaySinh
                          ? new Date(hocSinh.ngaySinh).toLocaleDateString('vi-VN')
                          : 'Chưa cập nhật'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
