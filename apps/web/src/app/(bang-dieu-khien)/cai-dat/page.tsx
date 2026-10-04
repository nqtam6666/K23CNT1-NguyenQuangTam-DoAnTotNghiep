'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings,
  Save,
  RefreshCw,
  Globe,
  Sliders,
  Sparkles,
  Phone,
  Lock,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { mayKhachApi } from '../../../tien-ich/may-khach-api';
import { thongBao } from '../../../tien-ich/thong-bao';
import { CaiDatHeThong } from '@lms/chung';

const NHOM_CAI_DAT_LABEL: Record<string, { ten: string; bieuTuong: any; moTa: string }> = {
  chung: {
    ten: 'Cấu hình Chung & Thương hiệu',
    bieuTuong: Globe,
    moTa: 'Tên hệ thống, khẩu hiệu, tên trường đào tạo và tác giả',
  },
  banner: {
    ten: 'Giao diện & Banner Trang chủ',
    bieuTuong: Sparkles,
    moTa: 'Tiêu đề banner chính, thông điệp giới thiệu và thông báo chung',
  },
  lien_he: {
    ten: 'Kênh Liên hệ & Hỗ trợ',
    bieuTuong: Phone,
    moTa: 'Email quản trị, số điện thoại đường dây nóng trợ giúp người học',
  },
  he_thong: {
    ten: 'Vận hành & Đăng ký',
    bieuTuong: Sliders,
    moTa: 'Các cờ tính năng, cho phép đăng ký trực tuyến hoặc bảo trì',
  },
};

export default function TrangCaiDatHeThong() {
  const queryClient = useQueryClient();
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

  // Mutation cập nhật cấu hình hệ thống hàng loạt
  const dotCapNhat = useMutation({
    mutationFn: async (duLieu: Array<{ khoa: string; giaTri: string }>) => {
      const res = await mayKhachApi.put('/cai-dat', { danhSachCaiDat: duLieu });
      return res.data;
    },
    onSuccess: () => {
      thongBao.thanhCong(
        'Đã lưu cấu hình',
        'Các thiết lập hệ thống đã được cập nhật và áp dụng toàn diện.',
      );
      setDangThayDoi(false);
      // Invalidate cả cache admin lẫn cache công khai của người dùng
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
      'Đã hủy thay đổi',
      'Các trường đã được trả về giá trị hiện tại trên máy chủ.',
    );
  };

  // Gom nhóm các cài đặt theo nhóm
  const nhomMap = danhSachCaiDat.reduce<Record<string, CaiDatHeThong[]>>((acc, item) => {
    const nhom = item.nhom || 'chung';
    if (!acc[nhom]) acc[nhom] = [];
    acc[nhom].push(item);
    return acc;
  }, {});

  const danhSachNhomKeys = Object.keys(nhomMap);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Tiêu đề trang & Nút hành động */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-slate-800">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Cài đặt Hệ thống</h1>
              <p className="text-sm text-slate-500">
                Tùy chỉnh thông số toàn hệ thống, áp dụng trực tiếp cho giao diện khách, đăng nhập
                và trang quản trị
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
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

      {dangThayDoi && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="font-medium">
              Bạn có một số cấu hình chưa lưu. Hãy nhấn "Lưu thay đổi" để áp dụng cho toàn hệ thống.
            </span>
          </div>
          <button
            onClick={xuLyLuuTatCa}
            className="text-xs font-semibold px-2.5 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Lưu ngay
          </button>
        </div>
      )}

      {/* Hiển thị Skeleton khi đang tải */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse space-y-4"
            >
              <div className="h-6 bg-slate-200 rounded w-1/4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="h-10 bg-slate-100 rounded" />
                <div className="h-10 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {danhSachNhomKeys.map((nhomKey) => {
            const metaNhom = NHOM_CAI_DAT_LABEL[nhomKey] || {
              ten: `Nhóm: ${nhomKey}`,
              bieuTuong: Layers,
              moTa: 'Các thông số thuộc nhóm ' + nhomKey,
            };
            const BieuTuongNhom = metaNhom.bieuTuong;
            const cacItem = nhomMap[nhomKey] || [];

            return (
              <div
                key={nhomKey}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Header nhóm */}
                <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <BieuTuongNhom className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-800 text-base">{metaNhom.ten}</h2>
                      <p className="text-xs text-slate-500">{metaNhom.moTa}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    {cacItem.length} cấu hình
                  </span>
                </div>

                {/* Danh sách trường input trong nhóm */}
                <div className="p-6 space-y-5">
                  {cacItem.map((item) => {
                    const giaTriHienTai = formValues[item.khoa] ?? item.giaTri;
                    const laBoolean = item.kieuDuLieu === 'boolean';
                    const laVanBanDai =
                      item.khoa === 'BANNER_MO_TA' || item.khoa === 'THONG_BAO_CHUNG';

                    return (
                      <div
                        key={item.khoa}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start pb-5 border-b border-slate-100 last:border-b-0 last:pb-0"
                      >
                        {/* Cột thông tin khóa & mô tả */}
                        <div className="lg:col-span-5 space-y-1">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-semibold text-slate-800">
                              {item.khoa}
                            </label>
                            {item.congKhai ? (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded"
                                title="Công khai cho cả khách truy cập không cần đăng nhập"
                              >
                                <Globe className="w-2.5 h-2.5" />
                                Công khai
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded"
                                title="Chỉ Quản trị viên mới có thể xem và sửa"
                              >
                                <Lock className="w-2.5 h-2.5" />
                                Nội bộ
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {item.moTa || 'Cấu hình tham số của hệ thống.'}
                          </p>
                        </div>

                        {/* Cột Input điều khiển */}
                        <div className="lg:col-span-7">
                          {laBoolean ? (
                            <div className="flex items-center gap-3">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={giaTriHienTai === 'true'}
                                  onChange={(e) =>
                                    thayDoiGiaTri(item.khoa, e.target.checked ? 'true' : 'false')
                                  }
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:after:w-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                              <span className="text-xs font-medium text-slate-700">
                                {giaTriHienTai === 'true'
                                  ? 'Đang bật (Cho phép)'
                                  : 'Đang tắt (Khóa)'}
                              </span>
                            </div>
                          ) : laVanBanDai ? (
                            <textarea
                              rows={3}
                              value={giaTriHienTai}
                              onChange={(e) => thayDoiGiaTri(item.khoa, e.target.value)}
                              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 bg-white"
                              placeholder="Nhập nội dung văn bản..."
                            />
                          ) : (
                            <input
                              type="text"
                              value={giaTriHienTai}
                              onChange={(e) => thayDoiGiaTri(item.khoa, e.target.value)}
                              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 bg-white"
                              placeholder="Nhập giá trị..."
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
