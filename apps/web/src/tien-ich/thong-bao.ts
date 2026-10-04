import { toast } from 'sonner';

/**
 * Tiện ích hiển thị Popup Toast thông báo chuẩn mực cho toàn bộ hệ thống LMS
 */
export const thongBao = {
  thanhCong: (tieuDe: string, moTa?: string) => {
    toast.success(tieuDe, {
      description: moTa,
      duration: 3500,
    });
  },

  thatBai: (tieuDe: string, moTa?: string) => {
    toast.error(tieuDe, {
      description: moTa,
      duration: 4500,
    });
  },

  canhBao: (tieuDe: string, moTa?: string) => {
    toast.warning(tieuDe, {
      description: moTa,
      duration: 4000,
    });
  },

  thongTin: (tieuDe: string, moTa?: string) => {
    toast.info(tieuDe, {
      description: moTa,
      duration: 3500,
    });
  },

  loiHeThong: (loi: any, thongDiepMacDinh = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.') => {
    const thongDiep =
      loi?.response?.data?.thongDiep ||
      loi?.response?.data?.message ||
      loi?.message ||
      thongDiepMacDinh;

    toast.error('Thao tác không thành công', {
      description: typeof thongDiep === 'string' ? thongDiep : JSON.stringify(thongDiep),
      duration: 5000,
    });
  },
};
