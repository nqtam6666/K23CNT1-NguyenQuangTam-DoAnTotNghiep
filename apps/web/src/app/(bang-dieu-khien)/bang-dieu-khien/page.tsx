'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  RefreshCw,
  Layers,
  BookOpen,
  Bot,
  ArrowRight,
  Video,
  Users,
  CheckCircle2,
  Send,
  BarChart3,
  ShieldCheck,
  Settings,
  GraduationCap,
  Calendar,
  FileText,
  Clock,
} from 'lucide-react';
import { mayKhachApi } from '../../../tien-ich/may-khach-api';
import { PayloadJwt, PhanHoiBangDieuKhien, VaiTro, TheThongKe } from '@lms/chung';
import { KhungXuongTongQuan, KhungXuong } from '../../../thanh-phan/khung-xuong';
import { BannerChao } from '../../../thanh-phan/bang-dieu-khien/banner-chao';
import { TheThongKeComponent } from '../../../thanh-phan/bang-dieu-khien/the-thong-ke';
import { HoatDongGanDayComponent } from '../../../thanh-phan/bang-dieu-khien/hoat-dong-gan-day';
import { ViecCanXuLyComponent } from '../../../thanh-phan/bang-dieu-khien/viec-can-xu-ly';
import { LoiTatTacVu } from '../../../thanh-phan/bang-dieu-khien/loi-tat-tac-vu';
import { HopThongBao } from '../../../thanh-phan/hop-thong-bao';
import { NutBam } from '../../../thanh-phan/nut-bam';
import { TrangThaiRong } from '../../../thanh-phan/bang-du-lieu';

const BANG_MAU_LOP_HOC = [
  '#0F766E',
  '#B45309',
  '#1D4ED8',
  '#BE123C',
  '#4D7C0F',
  '#0E7490',
  '#A16207',
  '#57534E',
];

// Lazy-load Recharts để giảm hơn 1.2MB JS đồng bộ khi F5 trang Tổng quan
const BieuDoChuyenCan = dynamic(
  () =>
    import('../../../thanh-phan/bang-dieu-khien/bieu-do-chuyen-can').then(
      (mod) => mod.BieuDoChuyenCan,
    ),
  {
    ssr: false,
    loading: () => <KhungXuong className="h-[340px] w-full" />,
  },
);

const BieuDoVaiTro = dynamic(
  () =>
    import('../../../thanh-phan/bang-dieu-khien/bieu-do-vai-tro').then(
      (mod) => mod.BieuDoVaiTro,
    ),
  {
    ssr: false,
    loading: () => <KhungXuong className="h-[340px] w-full" />,
  },
);

export default function TrangBangDieuKhien() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [cauHoiNhanh, setCauHoiNhanh] = useState('');

  // Khôi phục nhanh dữ liệu từ sessionStorage / localStorage ngay sau khi hydrate
  useEffect(() => {
    try {
      const rawHoSo =
        sessionStorage.getItem('lms_cache_ho_so') || localStorage.getItem('lms_cache_ho_so');
      if (rawHoSo && !queryClient.getQueryData(['ho-so-hien-tai'])) {
        queryClient.setQueryData(['ho-so-hien-tai'], JSON.parse(rawHoSo) as PayloadJwt, {
          updatedAt: 0,
        });
      }
      const rawBangDieuKhien = sessionStorage.getItem('lms_cache_bang_dieu_khien');
      if (rawBangDieuKhien && !queryClient.getQueryData(['du-lieu-bang-dieu-khien'])) {
        queryClient.setQueryData(
          ['du-lieu-bang-dieu-khien'],
          JSON.parse(rawBangDieuKhien) as PhanHoiBangDieuKhien,
          { updatedAt: 0 },
        );
      }
    } catch {
      // Bỏ qua lỗi đọc sessionStorage
    }
  }, [queryClient]);

  // 1. Hồ sơ người dùng hiện tại
  const { data: nguoiDung, isLoading: dangTaiHoSo } = useQuery<PayloadJwt>({
    queryKey: ['ho-so-hien-tai'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/xac-thuc/ho-so-hien-tai');
      const duLieu = res.data?.duLieu || res.data;
      try {
        const chuoi = JSON.stringify(duLieu);
        sessionStorage.setItem('lms_cache_ho_so', chuoi);
        localStorage.setItem('lms_cache_ho_so', chuoi);
      } catch {
        // Bỏ qua
      }
      return duLieu;
    },
    staleTime: 15 * 1000,
  });

  // 2. Dữ liệu tiện ích bảng điều khiển từ Registry API
  const {
    data: phanHoiBangDieuKhien,
    isLoading: dangTaiTienIch,
    isError,
    refetch,
    isFetching,
  } = useQuery<PhanHoiBangDieuKhien>({
    queryKey: ['du-lieu-bang-dieu-khien'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/bang-dieu-khien');
      const duLieu = res.data?.duLieu || res.data;
      try {
        sessionStorage.setItem('lms_cache_bang_dieu_khien', JSON.stringify(duLieu));
      } catch {
        // Bỏ qua
      }
      return duLieu;
    },
    staleTime: 30 * 1000,
  });

  // 3. Lấy danh sách lớp học phần thực tế để hiển thị trên Bàn làm việc
  const { data: danhSachLop = [] } = useQuery<any[]>({
    queryKey: ['danh-sach-lop-bang-dieu-khien'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/lop-hoc-phan', { params: { kichThuoc: 6 } });
      const raw = res.data?.duLieu || res.data;
      return Array.isArray(raw) ? raw : raw?.duLieu || raw?.danhSach || [];
    },
    enabled: Boolean(nguoiDung),
    staleTime: 30 * 1000,
  });

  // 4. Lấy thống kê lưu lượng & hạn mức Trợ lý AI hôm nay
  const { data: thongKeAi } = useQuery<any>({
    queryKey: ['thong-ke-su-dung-ai'],
    queryFn: async () => {
      const res = await mayKhachApi.get('/tro-ly-ai/thong-ke-su-dung');
      return res.data?.duLieu || res.data;
    },
    enabled: Boolean(nguoiDung && nguoiDung.vaiTro !== VaiTro.PHU_HUYNH),
    staleTime: 15 * 1000,
  });

  // Trạng thái 1: Đang tải khung xương (chỉ hiện lần đầu tiên khi chưa có cache)
  if ((dangTaiHoSo || dangTaiTienIch) && !phanHoiBangDieuKhien) {
    return <KhungXuongTongQuan />;
  }

  // Trạng thái 2: Lỗi tải dữ liệu có nút thử lại
  if (isError && !phanHoiBangDieuKhien) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <HopThongBao
            loai="danger"
            eyebrow="TRẠNG THÁI KẾT NỐI"
            tieuDe="Không thể tải dữ liệu bảng điều khiển"
            hanhDong={
              <NutBam
                variant="primary"
                onClick={() => refetch()}
                dangTai={isFetching}
                icon={<RefreshCw strokeWidth={1.5} className="w-4 h-4" />}
              >
                Thử lại ngay
              </NutBam>
            }
          >
            Đã có lỗi xảy ra trong quá trình tổng hợp số liệu từ máy chủ. Vui lòng kiểm tra lại kết
            nối mạng hoặc thử lại sau.
          </HopThongBao>
        </div>
      </div>
    );
  }

  const danhSachTienIch = phanHoiBangDieuKhien?.tienIch || [];

  // Lọc tiện ích theo loại
  const cacTheThongKeGoc = danhSachTienIch.filter((t) => t.loai === 'THE_THONG_KE' && t.duLieu);
  const bieuDoChuyenCan = danhSachTienIch.find((t) => t.id === 'bieu-do-chuyen-can-7-ngay');
  const bieuDoVaiTro = danhSachTienIch.find((t) => t.id === 'bieu-do-phan-bo-vai-tro');
  const hoatDongGanDay = danhSachTienIch.find((t) => t.loai === 'HOAT_DONG_GAN_DAY');
  const viecCanXuLy = danhSachTienIch.find((t) => t.loai === 'VIEC_CAN_XU_LY');

  // Đảm bảo lưới 4 cột chỉ số luôn đầy đủ 4 thẻ cân đối (bổ sung thẻ Trợ lý AI / Lớp học phần nếu vai trò chỉ có 3 thẻ)
  const theBoSungThuTu: TheThongKe = {
    id: 'han-muc-tro-ly-ai-hom-nay',
    tieuDe: 'Hạn mức Trợ lý AI hôm nay',
    giaTri: thongKeAi ? `${thongKeAi.conLaiHomNay ?? 30}/${thongKeAi.gioiHanCaNhanNgay ?? 30}` : '30/30',
    donVi: 'lượt hỏi',
    moTa: `Đã dùng ${thongKeAi?.soLuotCaNhanHomNay ?? 0} lượt tra cứu học liệu hôm nay`,
    bieuTuong: 'Bot',
    duongDanChiTiet: '/tro-ly-ai',
  };

  const laQuanTri =
    nguoiDung?.vaiTro === VaiTro.QUAN_TRI_VIEN ||
    nguoiDung?.vaiTro === VaiTro.BAN_GIAM_HIEU ||
    nguoiDung?.vaiTro === VaiTro.GIAO_VU;
  const laGiaoVien = nguoiDung?.vaiTro === VaiTro.GIAO_VIEN;

  // Trạng thái 3: Dữ liệu rỗng
  if (danhSachTienIch.length === 0) {
    return (
      <div className="space-y-6">
        <BannerChao hoTen={nguoiDung?.hoTen} vaiTro={nguoiDung?.vaiTro} />
        <TrangThaiRong
          icon={Layers}
          tieuDe="Chưa có dữ liệu thống kê"
          moTa="Hệ thống chưa ghi nhận các hoạt động của bạn. Hãy bắt đầu khám phá các tính năng theo vai trò được cấp phép."
        />
        <LoiTatTacVu vaiTro={nguoiDung?.vaiTro} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Banner chào mừng */}
      <BannerChao hoTen={nguoiDung?.hoTen} vaiTro={nguoiDung?.vaiTro} />

      {/* 2. Lưới 4 thẻ thống kê số liệu trọng tâm (luôn đủ 4 cột cân đối) */}
      {cacTheThongKeGoc.length > 0 && (
        <section aria-label="Số liệu thống kê tổng quan" className="space-y-2.5">
          <p className="eyebrow">CHỈ SỐ HỌC VỤ TRỌNG TÂM</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cacTheThongKeGoc.slice(0, 4).map((the) => (
              <TheThongKeComponent key={the.id} duLieu={the.duLieu} />
            ))}
            {cacTheThongKeGoc.length === 3 && <TheThongKeComponent duLieu={theBoSungThuTu} />}
          </div>
        </section>
      )}

      {/* 3. Trung tâm Điều hành Quản trị & An toàn (Dành riêng cho Quản trị viên / Ban giám hiệu / Giáo vụ) */}
      {laQuanTri && (
        <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div>
                <p className="eyebrow">TRUNG TÂM ĐIỀU HÀNH QUẢN TRỊ & AN TOÀN HỆ THỐNG</p>
                <h2 className="text-[16px] font-sans font-semibold text-[var(--text)]">
                  Giám sát tài khoản, học vụ, chi phí mô hình AI và cấu hình toàn trường
                </h2>
              </div>
            </div>

            {thongKeAi && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)] font-mono text-[var(--text)]">
                  Lưu lượng AI hôm nay:{' '}
                  <strong className="text-[var(--accent)]">{thongKeAi.tongLuotHomNay ?? 0}</strong> lượt
                </span>
                <span className="px-2.5 py-1 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)] font-mono text-[var(--text)]">
                  Tổng Token:{' '}
                  <strong className="text-[var(--accent)]">
                    {(thongKeAi.tongTokenToanThoiGian ?? 0).toLocaleString('vi-VN')}
                  </strong>
                </span>
                <span className="px-2.5 py-1 rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] font-mono font-semibold">
                  Chi phí ước tính: {(thongKeAi.chiPhiToanThoiGianVnd ?? 0).toLocaleString('vi-VN')} ₫
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link
              href="/nguoi-dung"
              className="p-3.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors flex items-start gap-3 group"
            >
              <div className="w-9 h-9 rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--text)] group-hover:text-[var(--accent)]">
                  Quản lý người dùng & Phân quyền
                </p>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">
                  Tài khoản, vai trò, khóa/mở khóa & phiên đăng nhập
                </p>
              </div>
            </Link>

            <Link
              href="/hoc-vu"
              className="p-3.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors flex items-start gap-3 group"
            >
              <div className="w-9 h-9 rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--text)] group-hover:text-[var(--accent)]">
                  Quản lý Học vụ & Đào tạo
                </p>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">
                  Năm học, học kỳ, môn học, lớp hành chính & phân công
                </p>
              </div>
            </Link>

            <Link
              href="/tro-ly-ai"
              className="p-3.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors flex items-start gap-3 group"
            >
              <div className="w-9 h-9 rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--text)] group-hover:text-[var(--accent)]">
                  Giám sát Lưu lượng & Chi phí AI
                </p>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">
                  Nhật ký sử dụng Token, độ trễ phản hồi & bản nháp học liệu
                </p>
              </div>
            </Link>

            <Link
              href="/cai-dat"
              className="p-3.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors flex items-start gap-3 group"
            >
              <div className="w-9 h-9 rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0">
                <Settings className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--text)] group-hover:text-[var(--accent)]">
                  Cài đặt Hệ thống & Quy tắc AI
                </p>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">
                  Giới hạn lượt hỏi/ngày, mô hình ngôn ngữ & bảo mật
                </p>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* 4. Phần biểu đồ trực quan Recharts (Dành cho Quản trị / Điều hành) */}
      {(bieuDoChuyenCan || bieuDoVaiTro) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {bieuDoChuyenCan && (
            <div className={bieuDoVaiTro ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <BieuDoChuyenCan
                tieuDe={bieuDoChuyenCan.tieuDe}
                duLieu={bieuDoChuyenCan.duLieu || []}
              />
            </div>
          )}

          {bieuDoVaiTro && (
            <div className={bieuDoChuyenCan ? 'lg:col-span-1' : 'lg:col-span-3'}>
              <BieuDoVaiTro tieuDe={bieuDoVaiTro.tieuDe} duLieu={bieuDoVaiTro.duLieu || []} />
            </div>
          )}
        </div>
      )}

      {/* 5. BÀN LÀM VIỆC HỌC TẬP & TRỢ LÝ SMARTCLASS AI (LƯỚI BENTO 8 CỘT + 4 CỘT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Cột trái (8 cột): Danh sách lớp học phần đang hoạt động */}
        <div className="lg:col-span-8 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
                <BookOpen className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div>
                <p className="eyebrow">KHÔNG GIAN LỚP HỌC SỐ</p>
                <h2 className="text-[16px] font-sans font-semibold text-[var(--text)]">
                  {laGiaoVien
                    ? 'Lớp học phần đang giảng dạy'
                    : laQuanTri
                      ? 'Lớp học phần đang mở trong học kỳ'
                      : 'Lớp học phần của tôi'}
                </h2>
              </div>
            </div>

            <Link
              href="/lop-hoc-phan"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)] text-xs font-semibold text-[var(--accent)] transition-colors"
            >
              <span>Xem tất cả ({danhSachLop.length})</span>
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
            </Link>
          </div>

          {danhSachLop.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--muted)]">
              Chưa có lớp học phần nào được ghi nhận trong học kỳ này.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {danhSachLop.slice(0, 4).map((lop: any, idx: number) => {
                const mauDai = BANG_MAU_LOP_HOC[idx % BANG_MAU_LOP_HOC.length];
                return (
                  <div
                    key={lop.id}
                    className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] overflow-hidden hover:border-[var(--accent)] transition-colors flex flex-col justify-between"
                  >
                    <div className="h-1.5 w-full" style={{ backgroundColor: mauDai }} />
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-[4px] bg-[var(--surface)] border border-[var(--border)] text-[var(--accent)]">
                            {lop.maLopHocPhan}
                          </span>
                          <span className="font-mono text-[11px] text-[var(--muted)]">
                            {lop.monHoc?.soTinChi || 3} tín chỉ
                          </span>
                        </div>

                        <Link
                          href={`/lop-hoc-phan/${lop.id}`}
                          className="block font-sans text-sm font-semibold text-[var(--text)] hover:text-[var(--accent)] line-clamp-1"
                        >
                          {lop.tenLopHocPhan}
                        </Link>

                        <p className="text-xs text-[var(--muted)] truncate">
                          GV: {lop.giaoVien?.nguoiDung?.hoTen || 'Chưa phân công'}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-[var(--border)] flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--muted)]">
                          <Users className="w-3.5 h-3.5 text-[var(--accent)]" />
                          {lop._count?.danhSachGhiDanh ?? 0}/{lop.siSoToiDa ?? 50} SV
                        </span>

                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/lop-hoc-phan/${lop.id}/phong-hoc`}
                            title="Mở phòng học trực tuyến"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-[4px] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] text-[11px] font-semibold text-[var(--text)] transition-colors"
                          >
                            <Video className="w-3 h-3 text-[var(--accent)]" />
                            <span>Phòng học</span>
                          </Link>

                          <Link
                            href={`/lop-hoc-phan/${lop.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[var(--accent)] text-white text-[11px] font-semibold hover:brightness-95 transition-colors"
                          >
                            <span>Vào lớp</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cột phải (4 cột): Trợ lý học tập SmartClass AI & Hạn mức trong ngày */}
        <div className="lg:col-span-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[var(--radius)] bg-[var(--accent)] text-white flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="eyebrow">TRỢ LÝ HỌC THUẬT</p>
                  <h2 className="text-[16px] font-sans font-semibold text-[var(--text)]">
                    SmartClass AI
                  </h2>
                </div>
              </div>

              {thongKeAi && (
                <span className="px-2.5 py-1 rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] font-mono text-[11px] font-semibold">
                  {thongKeAi.soLuotCaNhanHomNay ?? 0}/{thongKeAi.gioiHanCaNhanNgay ?? 30} lượt
                </span>
              )}
            </div>

            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Hỏi đáp bám sát giáo trình môn học kèm trích dẫn nguồn, giải thích theo 3 mức độ{' '}
              <strong className="text-[var(--text)]">Cơ bản · Trung bình · Nâng cao</strong> và gợi ý
              bài tập luyện tập.
            </p>

            {/* Ô hỏi nhanh nhảy thẳng sang Trợ lý AI */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                router.push('/tro-ly-ai');
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={cauHoiNhanh}
                onChange={(e) => setCauHoiNhanh(e.target.value)}
                placeholder="Nhập câu hỏi giáo trình cần giải thích..."
                className="flex-1 px-3 py-2 text-xs rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-[var(--radius)] bg-[var(--accent)] text-white text-xs font-semibold hover:brightness-95 transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Hỏi</span>
              </button>
            </form>

            {/* Gợi ý tác vụ AI nhanh */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-semibold text-[var(--muted)]">Tác vụ học thuật nhanh:</p>
              <div className="grid grid-cols-1 gap-1.5">
                <Link
                  href="/tro-ly-ai"
                  className="px-3 py-2 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)] text-xs text-[var(--text)] flex items-center justify-between transition-colors"
                >
                  <span className="truncate">Tóm tắt nội dung chính tài liệu môn học</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                </Link>
                <Link
                  href="/tro-ly-ai"
                  className="px-3 py-2 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)] text-xs text-[var(--text)] flex items-center justify-between transition-colors"
                >
                  <span className="truncate">
                    {laGiaoVien || laQuanTri
                      ? 'Biên soạn đề kiểm tra & giáo án từ tài liệu'
                      : 'Tạo câu hỏi trắc nghiệm tự luyện tập theo chương'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                </Link>
              </div>
            </div>
          </div>

          {/* Thanh trạng thái hạn mức & độ trễ cuối thẻ */}
          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--muted)]">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
              Còn lại hôm nay:{' '}
              <strong className="font-mono text-[var(--text)]">
                {thongKeAi?.conLaiHomNay ?? 30} lượt
              </strong>
            </span>
            <Link href="/tro-ly-ai" className="font-semibold text-[var(--accent)] hover:underline">
              Mở Trợ lý AI →
            </Link>
          </div>
        </div>
      </div>

      {/* 6. Phần Việc cần xử lý & Hoạt động / Lộ trình học tập (Luôn cân đối 2 cột 50/50) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {viecCanXuLy ? (
          <ViecCanXuLyComponent danhSach={viecCanXuLy.duLieu || []} />
        ) : (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-5 shadow-xs">
            <p className="eyebrow">CÔNG VIỆC TRONG TUẦN</p>
            <h3 className="text-base font-sans font-semibold text-[var(--text)] mt-1">
              Bạn đã hoàn tất các đầu việc cần xử lý
            </h3>
          </div>
        )}

        {hoatDongGanDay ? (
          <HoatDongGanDayComponent danhSach={hoatDongGanDay.duLieu || []} />
        ) : (
          /* Khối Phân tích tiến độ & Lộ trình ôn tập cho Sinh viên / Giảng viên để lấp đầy cột phải cân đối */
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0">
                    <BarChart3 className="w-4 h-4" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="eyebrow">PHÂN TÍCH HỌC TẬP & LỊCH TRÌNH</p>
                    <h3 className="text-[16px] font-sans font-semibold text-[var(--text)]">
                      {laGiaoVien
                        ? 'Theo dõi chuyên cần, bài nộp & cảnh báo sớm'
                        : 'Tiến độ học tập & Gợi ý ôn tập cá nhân'}
                    </h3>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-[var(--radius)] bg-[var(--accent-soft)] text-[var(--accent)] text-[11px] font-semibold">
                  Learning Analytics
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-[var(--accent)] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[var(--text)] truncate">
                        {laGiaoVien
                          ? 'Hỗ trợ chấm điểm & Gợi ý nhận xét bài nộp bằng AI'
                          : 'Đề xuất nội dung ôn tập dựa trên câu trả lời sai'}
                      </p>
                      <p className="text-[11px] text-[var(--muted)] truncate">
                        {laGiaoVien
                          ? 'Giảng viên duyệt kết quả cuối cùng trong từng lớp học phần'
                          : 'Tự động tổng hợp các câu sai trong bài kiểm tra để gợi ý tài liệu đọc lại'}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/lop-hoc-phan"
                    className="px-2.5 py-1 rounded-[4px] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] text-xs font-semibold text-[var(--accent)] shrink-0"
                  >
                    Xem →
                  </Link>
                </div>

                <div className="p-3 rounded-[var(--radius)] bg-[var(--bg)] border border-[var(--border)] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Calendar className="w-4 h-4 text-[var(--accent)] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[var(--text)] truncate">
                        Lịch học, điểm danh mã PIN 6 số & hạn nộp bài tập
                      </p>
                      <p className="text-[11px] text-[var(--muted)] truncate">
                        Tra cứu lịch học theo tuần và tham gia phòng học trực tuyến đúng giờ
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/thoi-khoa-bieu"
                    className="px-2.5 py-1 rounded-[4px] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] text-xs font-semibold text-[var(--accent)] shrink-0"
                  >
                    Lịch học →
                  </Link>
                </div>
              </div>
            </div>

            <div className="pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-xs">
              <span className="text-[var(--muted)]">
                Chọn lớp học phần để xem biểu đồ phân tích học tập chi tiết
              </span>
              <Link
                href="/lop-hoc-phan"
                className="font-semibold text-[var(--accent)] hover:underline"
              >
                Mở phân tích →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 7. Lối tắt tác vụ nhanh theo vai trò */}
      <LoiTatTacVu vaiTro={nguoiDung?.vaiTro} />
    </div>
  );
}
