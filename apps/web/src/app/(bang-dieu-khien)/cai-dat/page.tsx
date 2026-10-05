'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings,
  Save,
  RefreshCw,
  School,
  Sparkles,
  Phone,
  Sliders,
  GraduationCap,
  Layers,
  AlertCircle,
  Bot,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { mayKhachApi } from '../../../tien-ich/may-khach-api';
import { thongBao } from '../../../tien-ich/thong-bao';
import { CaiDatHeThong } from '@lms/chung';
import { KhungXuong } from '../../../thanh-phan/khung-xuong';
import { ThanhPhanTaiLenAnhCaiDat } from './thanh-phan-tai-len-anh';

interface ThongTinCauHinh {
  nhan: string;
  moTa: string;
  placeholder?: string;
  kieu: 'text' | 'textarea' | 'boolean' | 'number' | 'file-anh' | 'select' | 'password';
  tabId: string;
  dinhDangChoPhep?: string;
  khuyenNghi?: string;
}

const TU_DIEN_CAU_HINH: Record<string, ThongTinCauHinh> = {
  TEN_HE_THONG: {
    nhan: 'Tên hệ thống LMS',
    moTa: 'Tên hiển thị thương hiệu chính của nền tảng (xuất hiện trên Sidebar, thanh tiêu đề và văn bản thông báo).',
    placeholder: 'Ví dụ: LMS Trường Học',
    kieu: 'text',
    tabId: 'he-thong',
  },
  TEN_TRUONG: {
    nhan: 'Tên trường / Viện đào tạo',
    moTa: 'Tên cơ sở giáo dục đại học hoặc đơn vị chủ quản hệ thống quản lý học tập.',
    placeholder: 'Ví dụ: Trường Đại học Nguyễn Trãi',
    kieu: 'text',
    tabId: 'he-thong',
  },
  KHAU_HIEU: {
    nhan: 'Khẩu hiệu hệ thống (Slogan)',
    moTa: 'Thông điệp ngắn gọn thể hiện sứ mệnh đào tạo, xuất hiện ở banner trang chủ và chân trang.',
    placeholder: 'Ví dụ: Hệ thống Quản lý Học tập Thế hệ Mới',
    kieu: 'text',
    tabId: 'he-thong',
  },
  THONG_BAO_CHUNG: {
    nhan: 'Thông báo chung toàn trường',
    moTa: 'Nội dung thông báo quan trọng được ghim nổi bật cho tất cả giảng viên, sinh viên và phụ huynh.',
    placeholder: 'Nhập nội dung thông báo gửi đến toàn trường...',
    kieu: 'textarea',
    tabId: 'he-thong',
  },
  TAC_GIA: {
    nhan: 'Họ và tên tác giả',
    moTa: 'Sinh viên / Kỹ sư nghiên cứu và phát triển đề tài đồ án tốt nghiệp.',
    placeholder: 'Ví dụ: Nguyễn Quang Tâm',
    kieu: 'text',
    tabId: 'do-an',
  },
  MSSV: {
    nhan: 'Mã số sinh viên (MSSV)',
    moTa: 'Mã định danh sinh viên thực hiện đề tài.',
    placeholder: 'Ví dụ: 2310900093',
    kieu: 'text',
    tabId: 'do-an',
  },
  MA_LOP_KHOA: {
    nhan: 'Lớp sinh hoạt / Khóa học',
    moTa: 'Lớp chuyên ngành hoặc niên khóa học tập của sinh viên.',
    placeholder: 'Ví dụ: K23CNT1',
    kieu: 'text',
    tabId: 'do-an',
  },
  BANNER_TIEU_DE: {
    nhan: 'Tiêu đề Banner trang chủ',
    moTa: 'Dòng tiêu đề lớn tạo ấn tượng trên màn hình giới thiệu (Landing Page).',
    placeholder: 'Ví dụ: Nền tảng Học tập Toàn diện Tích hợp Phòng học LiveKit & Trợ lý AI',
    kieu: 'text',
    tabId: 'giao-dien',
  },
  BANNER_MO_TA: {
    nhan: 'Nội dung mô tả Banner trang chủ',
    moTa: 'Đoạn văn ngắn làm rõ mục tiêu và các tính năng cốt lõi của nền tảng đào tạo.',
    placeholder: 'Nhập mô tả tóm tắt...',
    kieu: 'textarea',
    tabId: 'giao-dien',
  },
  URL_LOGO: {
    nhan: 'Logo trường học / Hệ thống',
    moTa: 'Tải lên hình ảnh Logo chính thức (hiển thị trên thanh bên điều hướng Sidebar, trang chủ và màn hình đăng nhập).',
    kieu: 'file-anh',
    tabId: 'giao-dien',
    dinhDangChoPhep: '.png,.jpg,.jpeg,.svg,.webp',
    khuyenNghi: 'Khuyên dùng hình ảnh nền trong suốt PNG hoặc SVG, tỉ lệ ngang hoặc 240x60px',
  },
  URL_FAVICON: {
    nhan: 'Biểu tượng trang web (Favicon)',
    moTa: 'Tải lên biểu tượng hiển thị trên thanh tiêu đề tab của trình duyệt web (kích thước chuẩn 32x32 hoặc 48x48).',
    kieu: 'file-anh',
    tabId: 'giao-dien',
    dinhDangChoPhep: '.ico,.png,.svg',
    khuyenNghi: 'Khuyên dùng định dạng ICO hoặc PNG vuông tỉ lệ 1:1 (32x32px)',
  },
  URL_ICON: {
    nhan: 'Biểu tượng thu gọn (App Icon)',
    moTa: 'Tải lên biểu tượng hình vuông thu gọn khi thanh bên điều hướng thu sang chế độ rút gọn (Icon Rail).',
    kieu: 'file-anh',
    tabId: 'giao-dien',
    dinhDangChoPhep: '.png,.jpg,.jpeg,.svg,.webp',
    khuyenNghi: 'Khuyên dùng định dạng PNG hoặc SVG vuông tỉ lệ 1:1 (khuyến nghị 64x64px)',
  },
  EMAIL_LIEN_HE: {
    nhan: 'Hòm thư điện tử liên hệ',
    moTa: 'Email chính thức tiếp nhận phản hồi, giải đáp thắc mắc và hỗ trợ kỹ thuật.',
    placeholder: 'lienhe@truong.edu.vn',
    kieu: 'text',
    tabId: 'lien-he',
  },
  SO_DIEN_THOAI: {
    nhan: 'Đường dây nóng hỗ trợ (Hotline)',
    moTa: 'Số điện thoại trực ban giải đáp hỗ trợ kỹ thuật cho người học.',
    placeholder: 'Ví dụ: 0987654321',
    kieu: 'text',
    tabId: 'lien-he',
  },
  CHO_PHEP_DANG_KY: {
    nhan: 'Mở cổng đăng ký tài khoản tự do',
    moTa: 'Bật tính năng này để cho phép người dùng tự tạo tài khoản học viên tại trang đăng nhập/đăng ký. Khi tắt, chỉ Quản trị viên mới được tạo tài khoản.',
    kieu: 'boolean',
    tabId: 'van-hanh',
  },
  AI_NHA_CUNG_CAP: {
    nhan: 'Nhà cung cấp dịch vụ AI',
    moTa: 'Chọn nền tảng mô hình ngôn ngữ lớn (Google Gemini miễn phí/trả phí, Groq Cloud siêu tốc miễn phí, OpenAI GPT, Ollama chạy cục bộ máy chủ riêng, hoặc API tùy biến).',
    kieu: 'select',
    tabId: 'tri-tue-nhan-tao',
  },
  AI_API_KEY: {
    nhan: 'Mã khóa API bí mật (API Key)',
    moTa: 'Mã khóa API được cấp từ nhà cung cấp dịch vụ. Dữ liệu này được bảo mật an toàn trên máy chủ và không bị lộ ra bên ngoài.',
    placeholder: 'Nhập API Key (ví dụ: AIzaSy... hoặc gsk_...)',
    kieu: 'password',
    tabId: 'tri-tue-nhan-tao',
  },
  AI_MODEL: {
    nhan: 'Tên mô hình ngôn ngữ (Model Name)',
    moTa: 'Tên định danh mô hình sẽ được gọi (ví dụ: gemini-1.5-flash, gemini-2.0-flash, llama-3.3-70b-versatile, gpt-4o-mini).',
    placeholder: 'Ví dụ: gemini-1.5-flash',
    kieu: 'text',
    tabId: 'tri-tue-nhan-tao',
  },
  AI_BASE_URL: {
    nhan: 'Địa chỉ máy chủ API tùy biến (Base URL)',
    moTa: 'Đường dẫn máy chủ API (để trống nếu dùng mặc định của hãng; điền http://localhost:11434 nếu dùng Ollama hoặc điền URL endpoint tương thích OpenAI).',
    placeholder: 'Ví dụ: http://localhost:11434 hoặc https://api.deepseek.com',
    kieu: 'text',
    tabId: 'tri-tue-nhan-tao',
  },
  AI_PROMPT_HE_THONG: {
    nhan: 'Chỉ dẫn hệ thống cốt lõi (System Instruction)',
    moTa: 'Chỉ thị gốc định hình phong cách sư phạm, văn phong tiếng Việt chuẩn mực và quy tắc ứng xử của Trợ lý AI khi giải đáp thắc mắc của người học.',
    placeholder: 'Nhập nội dung chỉ dẫn hệ thống cho AI...',
    kieu: 'textarea',
    tabId: 'tri-tue-nhan-tao',
  },
  AI_NHIET_DO: {
    nhan: 'Nhiệt độ sáng tạo (Temperature: 0.0 - 1.0)',
    moTa: 'Mức độ biến thiên câu trả lời: 0.2 (rất chặt chẽ, chính xác học thuật) đến 0.8 (sáng tạo, linh hoạt). Khuyên dùng 0.7.',
    placeholder: '0.7',
    kieu: 'text',
    tabId: 'tri-tue-nhan-tao',
  },
  AI_TOKEN_TOI_DA: {
    nhan: 'Giới hạn số lượng Token (Max Output Tokens)',
    moTa: 'Số lượng từ tối đa trong một phản hồi từ AI. Khuyên dùng 1024 hoặc 2048 token.',
    placeholder: '1024',
    kieu: 'number',
    tabId: 'tri-tue-nhan-tao',
  },
};

interface TabCaiDat {
  id: string;
  ten: string;
  moTa: string;
  bieuTuong: React.ComponentType<{ className?: string }>;
}

const DANH_SACH_TAB: TabCaiDat[] = [
  {
    id: 'he-thong',
    ten: 'Trường học & Hệ thống',
    moTa: 'Thiết lập tên trường, thương hiệu hệ thống và thông báo chung',
    bieuTuong: School,
  },
  {
    id: 'tri-tue-nhan-tao',
    ten: 'Trí tuệ nhân tạo (AI & LLM)',
    moTa: 'Cấu hình nhà cung cấp LLM (Gemini, Groq, OpenAI, Ollama), API Key và kiểm tra kết nối',
    bieuTuong: Bot,
  },
  {
    id: 'do-an',
    ten: 'Thông tin Đồ án',
    moTa: 'Thông tin sinh viên, mã số sinh viên và niên khóa thực hiện',
    bieuTuong: GraduationCap,
  },
  {
    id: 'giao-dien',
    ten: 'Giao diện & Thương hiệu',
    moTa: 'Tùy chỉnh Logo, Favicon, Icon, tiêu đề và thông điệp hiển thị trên hệ thống',
    bieuTuong: Sparkles,
  },
  {
    id: 'lien-he',
    ten: 'Kênh Liên hệ',
    moTa: 'Địa chỉ email và số điện thoại đường dây nóng hỗ trợ',
    bieuTuong: Phone,
  },
  {
    id: 'van-hanh',
    ten: 'Vận hành & Phân quyền',
    moTa: 'Cấu hình cổng đăng ký tài khoản tự do và tính năng vận hành',
    bieuTuong: Sliders,
  },
];

export default function TrangCaiDatHeThong() {
  const queryClient = useQueryClient();
  const [tabHienTai, setTabHienTai] = useState<string>('he-thong');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [dangThayDoi, setDangThayDoi] = useState(false);

  // Trạng thái kiểm tra kết nối AI
  const [dangKiemTraKetNoi, setDangKiemTraKetNoi] = useState(false);
  const [ketQuaKiemTra, setKetQuaKiemTra] = useState<{
    thanhCong: boolean;
    thongDiep: string;
    doTreMs?: number;
  } | null>(null);
  const [hienThiMatKhauApiKey, setHienThiMatKhauApiKey] = useState(false);

  // Truy vấn danh sách tất cả cấu hình hệ thống từ API Admin
  const {
    data: danhSachCaiDat = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<CaiDatHeThong[]>({
    queryKey: ['cai-dat-he-thong'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/cai-dat');
      return res.data?.duLieu || [];
    },
    staleTime: 30 * 1000,
  });

  // Khởi tạo giá trị form khi dữ liệu API tải về
  useEffect(() => {
    if (danhSachCaiDat.length > 0) {
      const banDo: Record<string, string> = {};
      danhSachCaiDat.forEach((item) => {
        banDo[item.khoa] = item.giaTri;
      });
      setFormValues(banDo);
      setDangThayDoi(false);
    }
  }, [danhSachCaiDat]);

  // Phân loại các cài đặt theo tab
  const danhSachTheoTab = useMemo(() => {
    const ketQua: Record<string, CaiDatHeThong[]> = {
      'he-thong': [],
      'tri-tue-nhan-tao': [],
      'do-an': [],
      'giao-dien': [],
      'lien-he': [],
      'van-hanh': [],
      khac: [],
    };

    danhSachCaiDat.forEach((item) => {
      const thongTin = TU_DIEN_CAU_HINH[item.khoa];
      let tabId = thongTin?.tabId;

      if (!tabId) {
        const nhom = (item.nhom || '').toLowerCase();
        if (item.khoa.startsWith('AI_') || nhom.includes('tri_tue') || nhom.includes('ai')) {
          tabId = 'tri-tue-nhan-tao';
        } else if (nhom.includes('lien_he')) tabId = 'lien-he';
        else if (nhom.includes('giao_dien')) tabId = 'giao-dien';
        else if (nhom.includes('hoc_vu')) tabId = 'van-hanh';
        else if (nhom.includes('chung')) tabId = 'he-thong';
        else tabId = 'khac';
      }

      if (ketQua[tabId]) {
        ketQua[tabId].push(item);
      } else {
        ketQua['khac'].push(item);
      }
    });

    const thuTuKhoa: Record<string, number> = {
      URL_LOGO: 1,
      URL_FAVICON: 2,
      URL_ICON: 3,
      BANNER_TIEU_DE: 10,
      BANNER_MO_TA: 11,
      TEN_HE_THONG: 1,
      TEN_TRUONG: 2,
      KHAU_HIEU: 3,
      THONG_BAO_CHUNG: 4,
      AI_NHA_CUNG_CAP: 1,
      AI_API_KEY: 2,
      AI_MODEL: 3,
      AI_BASE_URL: 4,
      AI_PROMPT_HE_THONG: 5,
      AI_NHIET_DO: 6,
      AI_TOKEN_TOI_DA: 7,
      TAC_GIA: 1,
      MSSV: 2,
      MA_LOP_KHOA: 3,
      EMAIL_LIEN_HE: 1,
      SO_DIEN_THOAI: 2,
      CHO_PHEP_DANG_KY: 1,
    };

    Object.keys(ketQua).forEach((key) => {
      ketQua[key].sort((a, b) => {
        const thuTuA = thuTuKhoa[a.khoa] ?? 99;
        const thuTuB = thuTuKhoa[b.khoa] ?? 99;
        return thuTuA - thuTuB;
      });
    });

    return ketQua;
  }, [danhSachCaiDat]);

  const xuLyKiemTraKetNoiAI = async () => {
    setDangKiemTraKetNoi(true);
    setKetQuaKiemTra(null);
    try {
      const res = await mayKhachApi.post('/tro-ly-ai/kiem-tra-ket-noi', {
        nhaCungCap: formValues['AI_NHA_CUNG_CAP'] || 'gemini',
        apiKey: formValues['AI_API_KEY'] || '',
        model: formValues['AI_MODEL'] || 'gemini-1.5-flash',
        baseUrl: formValues['AI_BASE_URL'] || '',
      });

      const duLieu = res.data;
      if (duLieu?.thanhCong) {
        setKetQuaKiemTra({
          thanhCong: true,
          thongDiep: duLieu.thongDiep,
          doTreMs: duLieu.doTreMs,
        });
        thongBao.thanhCong('Kết nối AI thành công!', duLieu.thongDiep);
      } else {
        setKetQuaKiemTra({
          thanhCong: false,
          thongDiep: duLieu?.thongDiep || 'Kiểm tra kết nối thất bại.',
          doTreMs: duLieu?.doTreMs,
        });
        thongBao.thatBai(
          'Kết nối AI thất bại',
          duLieu?.thongDiep || 'Vui lòng kiểm tra lại API Key hoặc cấu hình mạng.',
        );
      }
    } catch (err: any) {
      const thongDiepLoi =
        err.response?.data?.thongDiep ||
        err.response?.data?.message ||
        err.message ||
        'Không thể kết nối đến máy chủ API';
      setKetQuaKiemTra({
        thanhCong: false,
        thongDiep: thongDiepLoi,
      });
      thongBao.thatBai('Lỗi kết nối AI', thongDiepLoi);
    } finally {
      setDangKiemTraKetNoi(false);
    }
  };

  // Mutation cập nhật cấu hình hệ thống hàng loạt
  const dotCapNhat = useMutation({
    mutationFn: async (duLieu: Array<{ khoa: string; giaTri: string }>) => {
      const res = await mayKhachApi.put('/cai-dat', { danhSachCaiDat: duLieu });
      return res.data;
    },
    onSuccess: () => {
      thongBao.thanhCong(
        'Đã lưu cấu hình thành công',
        'Các thiết lập hệ thống đã được cập nhật và áp dụng toàn diện.',
      );
      setDangThayDoi(false);
      queryClient.invalidateQueries({ queryKey: ['cai-dat-he-thong'] });
      queryClient.invalidateQueries({ queryKey: ['cai-dat-cong-khai'] });
    },
    onError: (loi: any) => {
      const thongDiep =
        loi.response?.data?.thongDiep ||
        loi.response?.data?.message ||
        'Không thể lưu cấu hình. Vui lòng kiểm tra quyền quản trị.';
      thongBao.thatBai('Lưu cấu hình thất bại', thongDiep);
    },
  });

  const thayDoiGiaTri = (khoa: string, giaTri: string) => {
    setFormValues((prev) => ({
      ...prev,
      [khoa]: giaTri,
    }));
    setDangThayDoi(true);
  };

  const xuLyLuuTatCa = () => {
    const danhSachCapNhat = Object.entries(formValues).map(([khoa, giaTri]) => ({
      khoa,
      giaTri,
    }));
    dotCapNhat.mutate(danhSachCapNhat);
  };

  const xuLyDatLai = () => {
    const banDo: Record<string, string> = {};
    danhSachCaiDat.forEach((item) => {
      banDo[item.khoa] = item.giaTri;
    });
    setFormValues(banDo);
    setDangThayDoi(false);
    thongBao.thongTin(
      'Đã hoàn tác thay đổi',
      'Các trường đã được trả về giá trị hiện tại trên máy chủ.',
    );
  };

  const tabHienTaiData = DANH_SACH_TAB.find((t) => t.id === tabHienTai) || DANH_SACH_TAB[0];
  const danhSachItemHienTai = danhSachTheoTab[tabHienTai] || [];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Tiêu đề trang & Nút hành động */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Cài đặt Hệ thống</h1>
            <p className="text-sm text-slate-500">
              Tùy chỉnh thông số toàn hệ thống, tự động áp dụng cho giao diện khách, đăng nhập và bảng điều khiển
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 active:scale-95 transition-all shadow-xs disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>

          {dangThayDoi && (
            <button
              type="button"
              onClick={xuLyDatLai}
              disabled={dotCapNhat.isPending}
              className="px-3.5 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            >
              Hủy thay đổi
            </button>
          )}

          <button
            type="button"
            onClick={xuLyLuuTatCa}
            disabled={!dangThayDoi || dotCapNhat.isPending}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {dotCapNhat.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{dotCapNhat.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
          </button>
        </div>
      </div>

      {/* Thanh cảnh báo có thay đổi chưa lưu */}
      {dangThayDoi && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-center justify-between animate-in fade-in duration-200 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-medium">
              Bạn có các thay đổi chưa lưu. Hãy nhấn &quot;Lưu thay đổi&quot; để áp dụng lên toàn hệ thống.
            </span>
          </div>
          <button
            onClick={xuLyLuuTatCa}
            disabled={dotCapNhat.isPending}
            className="text-xs font-semibold px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors cursor-pointer"
          >
            Lưu ngay
          </button>
        </div>
      )}

      {/* Thanh chuyển đổi Tab nhóm cài đặt */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {DANH_SACH_TAB.map((tab) => {
          const dangChon = tabHienTai === tab.id;
          const soLuong = danhSachTheoTab[tab.id]?.length || 0;
          const BieuTuong = tab.bieuTuong;
          return (
            <button
              key={tab.id}
              data-tab={tab.id}
              type="button"
              onClick={() => setTabHienTai(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                dangChon
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 ring-1 ring-blue-600'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <BieuTuong className="w-4 h-4" />
              <span>{tab.ten}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  dangChon
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {soLuong}
              </span>
            </button>
          );
        })}

        {/* Tab dự phòng nếu có cấu hình chưa được ánh xạ */}
        {danhSachTheoTab['khac'] && danhSachTheoTab['khac'].length > 0 && (
          <button
            type="button"
            onClick={() => setTabHienTai('khac')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              tabHienTai === 'khac'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Cấu hình khác</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {danhSachTheoTab['khac'].length}
            </span>
          </button>
        )}
      </div>

      {/* Hiển thị Khung xương Skeleton khi đang tải */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-2xs">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3 pb-5 border-b border-slate-100 last:border-0">
              <KhungXuong className="h-4 w-48" />
              <KhungXuong className="h-3 w-80" />
              <KhungXuong className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        /* Thẻ nội dung của Tab đang chọn */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Header tab */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-800 text-base">{tabHienTaiData.ten}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{tabHienTaiData.moTa}</p>
            </div>

            {/* Nút kiểm tra kết nối AI đặc thù khi ở Tab Trí tuệ nhân tạo */}
            {tabHienTai === 'tri-tue-nhan-tao' && (
              <button
                type="button"
                onClick={xuLyKiemTraKetNoiAI}
                disabled={dangKiemTraKetNoi}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer self-start sm:self-auto shrink-0"
              >
                {dangKiemTraKetNoi ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>{dangKiemTraKetNoi ? 'Đang kiểm tra kết nối...' : 'Kiểm tra kết nối AI'}</span>
              </button>
            )}
          </div>

          {/* Banner kết quả kiểm tra kết nối AI */}
          {tabHienTai === 'tri-tue-nhan-tao' && ketQuaKiemTra && (
            <div
              className={`p-4 border-b flex items-start gap-3 transition-all ${
                ketQuaKiemTra.thanhCong
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {ketQuaKiemTra.thanhCong ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold">
                    {ketQuaKiemTra.thanhCong ? 'Kết nối thành công!' : 'Kết nối thất bại:'}
                  </span>
                  {ketQuaKiemTra.doTreMs !== undefined && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-200 text-emerald-800">
                      {ketQuaKiemTra.doTreMs}ms
                    </span>
                  )}
                </div>
                <p className="mt-1 leading-relaxed">{ketQuaKiemTra.thongDiep}</p>
              </div>
            </div>
          )}

          {/* Hướng dẫn nhận mã khóa API miễn phí khi ở tab AI */}
          {tabHienTai === 'tri-tue-nhan-tao' && (
            <div className="p-4 bg-indigo-50/50 border-b border-indigo-100/60 text-xs text-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  Hệ thống hỗ trợ cả API miễn phí (Google Gemini, Groq Cloud, Ollama) và API trả phí (OpenAI).
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 underline"
                >
                  Lấy Gemini API Key miễn phí <ExternalLink className="w-3 h-3" />
                </a>
                <span>•</span>
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-800 underline"
                >
                  Lấy Groq API Key siêu tốc <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Danh sách các trường cài đặt trong tab */}
          <div className="p-6 space-y-6 divide-y divide-slate-100">
            {danhSachItemHienTai.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium">Chưa có thông số nào thuộc nhóm này.</p>
              </div>
            ) : (
              danhSachItemHienTai.map((item) => {
                const thongTin = TU_DIEN_CAU_HINH[item.khoa];
                const giaTriHienTai = formValues[item.khoa] ?? item.giaTri;
                const laBoolean =
                  thongTin?.kieu === 'boolean' ||
                  item.kieuDuLieu === 'LOGIC' ||
                  item.kieuDuLieu === 'boolean' ||
                  item.khoa === 'CHO_PHEP_DANG_KY' ||
                  item.giaTri === 'true' ||
                  item.giaTri === 'false';
                const laVanBanDai =
                  thongTin?.kieu === 'textarea' ||
                  item.khoa === 'BANNER_MO_TA' ||
                  item.khoa === 'THONG_BAO_CHUNG' ||
                  item.khoa === 'AI_PROMPT_HE_THONG';
                const laTepAnh =
                  thongTin?.kieu === 'file-anh' ||
                  item.khoa === 'URL_LOGO' ||
                  item.khoa === 'URL_FAVICON' ||
                  item.khoa === 'URL_ICON';
                const laSelectNhaCungCap = item.khoa === 'AI_NHA_CUNG_CAP';
                const laMatKhauApiKey = item.khoa === 'AI_API_KEY';
                const laModelAI = item.khoa === 'AI_MODEL';

                return (
                  <div
                    key={item.khoa}
                    className="pt-6 first:pt-0 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"
                  >
                    {/* Cột thông tin: Tên Việt hoá + mô tả */}
                    <div className="lg:col-span-5 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <label className="text-sm font-bold text-slate-900">
                          {thongTin?.nhan || item.khoa}
                        </label>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {thongTin?.moTa || item.moTa || 'Cấu hình tham số của hệ thống.'}
                      </p>
                    </div>

                    {/* Cột Điều khiển Input hoặc Nút Toggle hoặc Upload Ảnh */}
                    <div className="lg:col-span-7">
                      {laTepAnh ? (
                        /* Giao diện tải ảnh trực tiếp từ máy tính (không sử dụng liên kết) */
                        <ThanhPhanTaiLenAnhCaiDat
                          khoa={item.khoa}
                          nhan={thongTin?.nhan || item.khoa}
                          moTa={thongTin?.moTa || item.moTa || ''}
                          giaTriHienTai={giaTriHienTai}
                          dinhDangChoPhep={thongTin?.dinhDangChoPhep}
                          khuyenNghi={thongTin?.khuyenNghi}
                          onCapNhat={(duongDanMoi) => {
                            thayDoiGiaTri(item.khoa, duongDanMoi);
                          }}
                          onXoa={() => {
                            const giaTriMacDinh = item.khoa === 'URL_FAVICON' ? '/favicon.ico' : '';
                            thayDoiGiaTri(item.khoa, giaTriMacDinh);
                            thongBao.thongTin(
                              'Đã gỡ tệp hình ảnh',
                              'Vui lòng nhấn "Lưu thay đổi" nếu bạn muốn lưu trạng thái này.',
                            );
                          }}
                        />
                      ) : laSelectNhaCungCap ? (
                        /* Chọn nhà cung cấp AI */
                        <div className="space-y-1.5">
                          <select
                            value={giaTriHienTai || 'gemini'}
                            onChange={(e) => {
                              const nhaCungCapMoi = e.target.value;
                              thayDoiGiaTri('AI_NHA_CUNG_CAP', nhaCungCapMoi);
                              if (nhaCungCapMoi === 'gemini') {
                                thayDoiGiaTri('AI_MODEL', 'gemini-1.5-flash');
                                thayDoiGiaTri('AI_BASE_URL', '');
                              } else if (nhaCungCapMoi === 'groq') {
                                thayDoiGiaTri('AI_MODEL', 'llama-3.3-70b-versatile');
                                thayDoiGiaTri('AI_BASE_URL', 'https://api.groq.com/openai');
                              } else if (nhaCungCapMoi === 'openai') {
                                thayDoiGiaTri('AI_MODEL', 'gpt-4o-mini');
                                thayDoiGiaTri('AI_BASE_URL', 'https://api.openai.com');
                              } else if (nhaCungCapMoi === 'ollama') {
                                thayDoiGiaTri('AI_MODEL', 'llama3');
                                thayDoiGiaTri('AI_BASE_URL', 'http://localhost:11434');
                              }
                            }}
                            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 bg-white font-medium shadow-2xs cursor-pointer"
                          >
                            <option value="gemini">Google Gemini (Miễn phí 15 RPM / Khuyên dùng)</option>
                            <option value="groq">Groq Cloud (Miễn phí 14,400 RPD / Siêu tốc)</option>
                            <option value="openai">OpenAI (GPT-4o Mini / GPT-4o)</option>
                            <option value="ollama">Ollama (Chạy cục bộ máy chủ riêng / Miễn phí 100%)</option>
                            <option value="tuy_chon">API tùy chọn (DeepSeek, OpenRouter, Together AI...)</option>
                          </select>
                        </div>
                      ) : laMatKhauApiKey ? (
                        /* Input API Key kèm nút ẩn/hiện */
                        <div className="space-y-1.5">
                          <div className="relative">
                            <input
                              type={hienThiMatKhauApiKey ? 'text' : 'password'}
                              value={giaTriHienTai}
                              onChange={(e) => thayDoiGiaTri(item.khoa, e.target.value)}
                              className="w-full pl-3.5 pr-10 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 bg-white placeholder:text-slate-400 font-mono shadow-2xs"
                              placeholder={thongTin?.placeholder || 'Nhập API Key...'}
                            />
                            <button
                              type="button"
                              onClick={() => setHienThiMatKhauApiKey(!hienThiMatKhauApiKey)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                              title={hienThiMatKhauApiKey ? 'Ẩn mã khóa' : 'Hiện mã khóa'}
                            >
                              {hienThiMatKhauApiKey ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Để trống nếu bạn muốn hệ thống tự đọc biến môi trường GEMINI_API_KEY trong file .env máy chủ.
                          </p>
                        </div>
                      ) : laModelAI ? (
                        /* Input Model kèm các nhãn gợi ý chọn nhanh */
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={giaTriHienTai}
                            onChange={(e) => thayDoiGiaTri(item.khoa, e.target.value)}
                            className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 bg-white placeholder:text-slate-400 font-mono shadow-2xs"
                            placeholder={thongTin?.placeholder || 'Ví dụ: gemini-1.5-flash'}
                          />
                          <div className="flex flex-wrap items-center gap-1.5 text-xs">
                            <span className="text-slate-400 text-[11px]">Chọn nhanh:</span>
                            {[
                              'gemini-1.5-flash',
                              'gemini-2.0-flash',
                              'llama-3.3-70b-versatile',
                              'gpt-4o-mini',
                              'deepseek-chat',
                            ].map((m) => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => thayDoiGiaTri('AI_MODEL', m)}
                                className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors cursor-pointer border ${
                                  giaTriHienTai === m
                                    ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                }`}
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : laBoolean ? (
                        /* Nút Toggle Switch chuyên nghiệp */
                        <div className="flex items-center gap-3.5 py-1">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={giaTriHienTai === 'true'}
                            onClick={() =>
                              thayDoiGiaTri(item.khoa, giaTriHienTai === 'true' ? 'false' : 'true')
                            }
                            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                              giaTriHienTai === 'true' ? 'bg-blue-600' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                giaTriHienTai === 'true' ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <div className="flex flex-col select-none">
                            <span
                              className={`text-sm font-semibold transition-colors ${
                                giaTriHienTai === 'true' ? 'text-blue-700' : 'text-slate-500'
                              }`}
                            >
                              {giaTriHienTai === 'true'
                                ? 'Đang mở (Cho phép tự đăng ký)'
                                : 'Đang đóng (Chỉ quản trị viên mới tạo được)'}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Bấm vào nút để {giaTriHienTai === 'true' ? 'đóng lại' : 'mở cổng'}
                            </span>
                          </div>
                        </div>
                      ) : laVanBanDai ? (
                        /* Textarea nhiều dòng */
                        <textarea
                          rows={item.khoa === 'AI_PROMPT_HE_THONG' ? 4 : 3}
                          value={giaTriHienTai}
                          onChange={(e) => thayDoiGiaTri(item.khoa, e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 bg-white placeholder:text-slate-400 leading-relaxed shadow-2xs"
                          placeholder={thongTin?.placeholder || 'Nhập nội dung văn bản...'}
                        />
                      ) : (
                        /* Input văn bản thông thường */
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={giaTriHienTai}
                            onChange={(e) => thayDoiGiaTri(item.khoa, e.target.value)}
                            className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 bg-white placeholder:text-slate-400 shadow-2xs"
                            placeholder={thongTin?.placeholder || 'Nhập giá trị...'}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
