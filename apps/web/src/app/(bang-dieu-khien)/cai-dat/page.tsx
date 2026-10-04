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
} from 'lucide-react';
import { mayKhachApi } from '../../../tien-ich/may-khach-api';
import { thongBao } from '../../../tien-ich/thong-bao';
import { CaiDatHeThong } from '@lms/chung';
import { KhungXuong } from '../../../thanh-phan/khung-xuong';

interface ThongTinCauHinh {
  nhan: string;
  moTa: string;
  placeholder?: string;
  kieu: 'text' | 'textarea' | 'boolean' | 'number';
  tabId: string;
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
    placeholder: 'Ví dụ: Trường Đại học Công nghệ',
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
    id: 'do-an',
    ten: 'Thông tin Đồ án',
    moTa: 'Thông tin sinh viên, mã số sinh viên và niên khóa thực hiện',
    bieuTuong: GraduationCap,
  },
  {
    id: 'giao-dien',
    ten: 'Giao diện & Banner',
    moTa: 'Tùy chỉnh tiêu đề và thông điệp hiển thị trên trang bìa',
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
        if (nhom.includes('lien_he')) tabId = 'lien-he';
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

    return ketQua;
  }, [danhSachCaiDat]);

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
              type="button"
              onClick={() => setTabHienTai(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                dangChon
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 ring-1 ring-blue-600'
                  : 'bg-white text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border border-slate-200/80'
              }`}
            >
              <BieuTuong className="w-4 h-4" />
              <span>{tab.ten}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  dangChon ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
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
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Cấu hình khác</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
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
          <div className="p-5 border-b border-slate-100 bg-slate-50/70">
            <h2 className="font-bold text-slate-800 text-base">{tabHienTaiData.ten}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{tabHienTaiData.moTa}</p>
          </div>

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
                  item.khoa === 'THONG_BAO_CHUNG';

                return (
                  <div
                    key={item.khoa}
                    className="pt-6 first:pt-0 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"
                  >
                    {/* Cột thông tin: Tên Việt hoá + mã tham số + mô tả */}
                    <div className="lg:col-span-5 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <label className="text-sm font-bold text-slate-900">
                          {thongTin?.nhan || item.khoa}
                        </label>
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">
                          {item.khoa}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {thongTin?.moTa || item.moTa || 'Cấu hình tham số của hệ thống.'}
                      </p>
                    </div>

                    {/* Cột Điều khiển Input hoặc Nút Toggle */}
                    <div className="lg:col-span-7">
                      {laBoolean ? (
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
                          rows={3}
                          value={giaTriHienTai}
                          onChange={(e) => thayDoiGiaTri(item.khoa, e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 bg-white placeholder:text-slate-400 leading-relaxed shadow-2xs"
                          placeholder={thongTin?.placeholder || 'Nhập nội dung văn bản...'}
                        />
                      ) : (
                        /* Input văn bản thông thường */
                        <input
                          type="text"
                          value={giaTriHienTai}
                          onChange={(e) => thayDoiGiaTri(item.khoa, e.target.value)}
                          className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 bg-white placeholder:text-slate-400 shadow-2xs"
                          placeholder={thongTin?.placeholder || 'Nhập giá trị...'}
                        />
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
