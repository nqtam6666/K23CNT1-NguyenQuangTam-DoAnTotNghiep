'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Pin,
  Send,
  Trash2,
  MessageSquare,
  Sparkles,
  AlertCircle,
  MoreVertical,
  Loader2,
} from 'lucide-react';
import { mayKhachApi } from '../../../../../tien-ich/may-khach-api';
import { thongBao } from '../../../../../tien-ich/thong-bao';
import { BaiDang, BinhLuan, PayloadJwt, VaiTro } from '@lms/chung';
import { AnhDaiDien } from '../../../../../thanh-phan/anh-dai-dien';
import { CongTac } from '../../../../../thanh-phan/cong-tac';

interface ThuocTinhTabBangTin {
  idLopHocPhan: string;
  nguoiDung?: PayloadJwt;
  laGiaoVienLop: boolean;
}

export function TabBangTin({ idLopHocPhan, nguoiDung, laGiaoVienLop }: ThuocTinhTabBangTin) {
  const queryClient = useQueryClient();
  const [noiDungMoi, setNoiDungMoi] = useState('');
  const [ghimDauTrang, setGhimDauTrang] = useState(false);
  const [binhLuanDangNhap, setBinhLuanDangNhap] = useState<Record<string, string>>({});

  const laQuanTri =
    nguoiDung?.vaiTro === VaiTro.QUAN_TRI_VIEN ||
    nguoiDung?.vaiTro === VaiTro.BAN_GIAM_HIEU;

  // Lấy danh sách bài đăng
  const {
    data: danhSachBaiDang = [],
    isLoading: dangTai,
    error,
  } = useQuery<BaiDang[]>({
    queryKey: ['bang-tin', idLopHocPhan],
    queryFn: async () => {
      const res = await mayKhachApi.get(`/bai-dang/lop/${idLopHocPhan}`);
      return res.data?.duLieu || res.data || [];
    },
  });

  // Mutation đăng bài mới
  const mutationDangBai = useMutation({
    mutationFn: async () => {
      const res = await mayKhachApi.post(`/bai-dang/lop/${idLopHocPhan}`, {
        noiDung: noiDungMoi,
        ghimDauTrang: (laGiaoVienLop || laQuanTri) ? ghimDauTrang : false,
      });
      return res.data;
    },
    onSuccess: () => {
      setNoiDungMoi('');
      setGhimDauTrang(false);
      queryClient.invalidateQueries({ queryKey: ['bang-tin', idLopHocPhan] });
      thongBao.thanhCong('Đăng bài thành công', 'Bài viết đã được hiển thị trên bảng tin lớp học.');
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Không thể đăng bài',
        err.response?.data?.thongDiep || 'Đã xảy ra lỗi khi tạo bài đăng.',
      );
    },
  });

  // Mutation xóa bài đăng
  const mutationXoaBai = useMutation({
    mutationFn: async (idBaiDang: string) => {
      await mayKhachApi.delete(`/bai-dang/${idBaiDang}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bang-tin', idLopHocPhan] });
      thongBao.thanhCong('Đã xóa bài đăng', 'Bài viết đã được gỡ khỏi bảng tin.');
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Không thể xóa bài',
        err.response?.data?.thongDiep || 'Bạn không có quyền xóa bài đăng này.',
      );
    },
  });

  // Mutation gửi bình luận
  const mutationBinhLuan = useMutation({
    mutationFn: async ({ idBaiDang, noiDung }: { idBaiDang: string; noiDung: string }) => {
      const res = await mayKhachApi.post(`/bai-dang/${idBaiDang}/binh-luan`, { noiDung });
      return res.data;
    },
    onSuccess: (_, bien) => {
      setBinhLuanDangNhap((truoc) => ({ ...truoc, [bien.idBaiDang]: '' }));
      queryClient.invalidateQueries({ queryKey: ['bang-tin', idLopHocPhan] });
    },
    onError: (err: any) => {
      thongBao.thatBai(
        'Lỗi bình luận',
        err.response?.data?.thongDiep || 'Không thể gửi bình luận vào lúc này.',
      );
    },
  });

  // Mutation xóa bình luận
  const mutationXoaBinhLuan = useMutation({
    mutationFn: async (idBinhLuan: string) => {
      await mayKhachApi.delete(`/bai-dang/binh-luan/${idBinhLuan}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bang-tin', idLopHocPhan] });
      thongBao.thanhCong('Đã xóa bình luận', 'Bình luận đã được xóa.');
    },
    onError: (err: any) => {
      thongBao.thatBai('Không thể xóa bình luận', err.response?.data?.thongDiep || 'Lỗi khi xóa.');
    },
  });

  const xuLyDangBai = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noiDungMoi.trim()) return;
    mutationDangBai.mutate();
  };

  const xuLyGuiBinhLuan = (idBaiDang: string) => {
    const noiDung = binhLuanDangNhap[idBaiDang]?.trim();
    if (!noiDung) return;
    mutationBinhLuan.mutate({ idBaiDang, noiDung });
  };

  const dinhDangThoiGian = (ngay: string | Date) => {
    try {
      const d = new Date(ngay);
      return d.toLocaleDateString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Khung tạo bài đăng mới */}
      <div className="bg-card text-card-foreground rounded border border-border/80 shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-3">
          <AnhDaiDien
            url={nguoiDung?.anhDaiDien}
            hoTen={nguoiDung?.hoTen || 'Người dùng'}
            kichThuoc="md"
          />
          <div>
            <h3 className="text-sm font-semibold">{nguoiDung?.hoTen}</h3>
            <p className="text-xs text-muted-foreground">Chia sẻ thông báo hoặc trao đổi bài học với lớp</p>
          </div>
        </div>

        <form onSubmit={xuLyDangBai} className="space-y-3">
          <textarea
            value={noiDungMoi}
            onChange={(e) => setNoiDungMoi(e.target.value)}
            placeholder="Thông báo điều gì đó cho lớp học của bạn..."
            rows={3}
            className="w-full resize-none rounded border border-input bg-background/50 p-3.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground transition-all"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {(laGiaoVienLop || laQuanTri) && (
              <div className="flex items-center gap-2.5">
                <CongTac
                  id="ghimDauTrang"
                  checked={ghimDauTrang}
                  onChange={(checked) => setGhimDauTrang(checked)}
                />
                <label
                  htmlFor="ghimDauTrang"
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer select-none"
                >
                  <Pin className="w-3.5 h-3.5 text-accent" />
                  Ghim bài đăng lên đầu trang
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={!noiDungMoi.trim() || mutationDangBai.isPending}
              className="ml-auto inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {mutationDangBai.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang đăng...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Đăng lên lớp
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Danh sách bài đăng */}
      {dangTai ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 rounded bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : danhSachBaiDang.length === 0 ? (
        <div className="rounded border border-dashed border-border/80 p-12 text-center bg-card/40">
          <MessageSquare className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-foreground">Chưa có bài đăng nào</h4>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Bảng tin lớp học đang trống. Hãy đăng bài đầu tiên để bắt đầu thảo luận cùng các thành viên!
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {danhSachBaiDang.map((bai) => {
            const coQuyenXoa =
              laQuanTri ||
              laGiaoVienLop ||
              bai.idNguoiDung === nguoiDung?.sub;

            return (
              <div
                key={bai.id}
                className={`bg-[var(--surface)] text-[var(--text)] rounded-[4px] border transition-all overflow-hidden ${
                  bai.ghimDauTrang
                    ? 'border-[var(--accent)] bg-[var(--active-bg)]'
                    : 'border-[var(--border)]'
                }`}
              >
                {/* Thanh tiêu đề bài đăng */}
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <AnhDaiDien
                        url={bai.nguoiDang?.anhDaiDien}
                        hoTen={bai.nguoiDang?.hoTen || 'Thành viên'}
                        kichThuoc="md"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{bai.nguoiDang?.hoTen}</span>
                          {bai.nguoiDang?.vaiTro === VaiTro.GIAO_VIEN && (
                            <span className="rounded-md bg-accent/10 text-accent px-1.5 py-0.5 text-[10px] font-semibold">
                              Giáo viên
                            </span>
                          )}
                          {bai.ghimDauTrang && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 text-accent px-1.5 py-0.5 text-[10px] font-semibold">
                              <Pin className="w-3 h-3" />
                              Đã ghim
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{dinhDangThoiGian(bai.ngayTao)}</p>
                      </div>
                    </div>

                    {coQuyenXoa && (
                      <button
                        onClick={() => mutationXoaBai.mutate(bai.id)}
                        disabled={mutationXoaBai.isPending}
                        title="Xóa bài đăng"
                        className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Nội dung bài viết */}
                  <div className="mt-3.5 text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                    {bai.noiDung}
                  </div>
                </div>

                {/* Phần bình luận */}
                <div className="bg-muted/20 border-t border-border/60 p-4 space-y-3">
                  {/* Danh sách bình luận con */}
                  {bai.cacBinhLuan && bai.cacBinhLuan.length > 0 && (
                    <div className="space-y-2.5">
                      {bai.cacBinhLuan.map((bl) => {
                        const coQuyenXoaBL =
                          laQuanTri ||
                          laGiaoVienLop ||
                          bl.idNguoiDung === nguoiDung?.sub;

                        return (
                          <div key={bl.id} className="flex items-start justify-between gap-2.5 group">
                            <div className="flex items-start gap-2.5 flex-1 min-w-0">
                              <AnhDaiDien
                                url={bl.nguoiDung?.anhDaiDien}
                                hoTen={bl.nguoiDung?.hoTen || 'Thành viên'}
                                kichThuoc="sm"
                              />
                              <div className="bg-background rounded px-3 py-2 border border-border/60 text-xs flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-semibold text-foreground">{bl.nguoiDung?.hoTen}</span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {dinhDangThoiGian(bl.ngayTao)}
                                  </span>
                                </div>
                                <p className="text-foreground/90 mt-1 whitespace-pre-line">{bl.noiDung}</p>
                              </div>
                            </div>

                            {coQuyenXoaBL && (
                              <button
                                onClick={() => mutationXoaBinhLuan.mutate(bl.id)}
                                title="Xóa bình luận"
                                className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Ô nhập bình luận */}
                  <div className="flex items-center gap-2 pt-1">
                    <AnhDaiDien
                      url={nguoiDung?.anhDaiDien}
                      hoTen={nguoiDung?.hoTen || 'Tôi'}
                      kichThuoc="sm"
                    />
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={binhLuanDangNhap[bai.id] || ''}
                        onChange={(e) =>
                          setBinhLuanDangNhap((truoc) => ({
                            ...truoc,
                            [bai.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            xuLyGuiBinhLuan(bai.id);
                          }
                        }}
                        placeholder="Viết câu trả lời hoặc thảo luận..."
                        className="w-full rounded border border-input bg-background px-3.5 py-1.5 pr-9 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => xuLyGuiBinhLuan(bai.id)}
                        disabled={
                          !binhLuanDangNhap[bai.id]?.trim() ||
                          mutationBinhLuan.isPending
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-primary hover:text-primary/80 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
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
