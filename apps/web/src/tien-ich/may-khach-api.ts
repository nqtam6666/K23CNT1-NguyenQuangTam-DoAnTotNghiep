import axios from 'axios';

const URL_API_GOC = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const mayKhachApi = axios.create({
  baseURL: URL_API_GOC,
  withCredentials: true, // Gửi kèm HTTP-only cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// Khoá đồng bộ (Mutex) tránh nhiều request 401 cùng lúc gọi /lam-moi-token làm huỷ phiên xoay vòng
let dangLamMoiTokenPromise: Promise<unknown> | null = null;

// Interceptor xử lý tự động làm mới Token khi mã lỗi 401
mayKhachApi.interceptors.response.use(
  (phanHoi) => phanHoi,
  async (loi) => {
    const yeuCauGoc = loi.config;

    // Bỏ qua tự động làm mới hoặc redirect nếu chính yêu cầu đó là luồng xác thực (đăng nhập, đăng ký, làm mới)
    const duongDan = yeuCauGoc?.url || '';
    const laYeuCauXacThuc =
      duongDan.includes('/xac-thuc/dang-nhap') ||
      duongDan.includes('/xac-thuc/dang-ky') ||
      duongDan.includes('/xac-thuc/lam-moi-token') ||
      duongDan.includes('/xac-thuc/dang-xuat');

    if (loi.response?.status === 401 && !yeuCauGoc?._daThuLai && !laYeuCauXacThuc) {
      yeuCauGoc._daThuLai = true;
      try {
        if (!dangLamMoiTokenPromise) {
          dangLamMoiTokenPromise = axios
            .post(`${URL_API_GOC}/xac-thuc/lam-moi-token`, {}, { withCredentials: true })
            .finally(() => {
              dangLamMoiTokenPromise = null;
            });
        }
        await dangLamMoiTokenPromise;
        return mayKhachApi(yeuCauGoc);
      } catch (loiLamMoi) {
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.removeItem('lms_cache_ho_so');
            sessionStorage.removeItem('lms_cache_bang_dieu_khien');
          } catch {
            // Bỏ qua lỗi xoá sessionStorage
          }
          if (window.location.pathname !== '/dang-nhap') {
            window.location.href = '/dang-nhap';
          }
        }
        return Promise.reject(loiLamMoi);
      }
    }

    return Promise.reject(loi);
  },
);
