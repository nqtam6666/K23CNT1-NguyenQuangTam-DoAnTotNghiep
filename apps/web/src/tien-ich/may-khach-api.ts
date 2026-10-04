import axios from 'axios';

const URL_API_GOC = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const mayKhachApi = axios.create({
  baseURL: URL_API_GOC,
  withCredentials: true, // Gửi kèm HTTP-only cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor xử lý tự động làm mới Token khi mã lỗi 401
mayKhachApi.interceptors.response.use(
  (phanHoi) => phanHoi,
  async (loi) => {
    const yeuCauGoc = loi.config;

    if (loi.response?.status === 401 && !yeuCauGoc._daThuLai) {
      yeuCauGoc._daThuLai = true;
      try {
        await axios.post(
          `${URL_API_GOC}/xac-thuc/lam-moi-token`,
          {},
          { withCredentials: true },
        );
        return mayKhachApi(yeuCauGoc);
      } catch (loiLamMoi) {
        if (typeof window !== 'undefined') {
          window.location.href = '/dang-nhap';
        }
        return Promise.reject(loiLamMoi);
      }
    }

    return Promise.reject(loi);
  },
);
