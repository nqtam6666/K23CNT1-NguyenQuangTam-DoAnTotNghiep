'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BellRing,
  Check,
  FileText,
  Info,
  LayoutDashboard,
  LogOut,
  Video,
} from 'lucide-react';
import { PayloadJwt, VaiTro, layNhanVaiTro } from '@lms/chung';
import { useQueryClient } from '@tanstack/react-query';
import { useCaiDatHeThong } from '../tien-ich/use-cai-dat';
import { mayKhachApi } from '../tien-ich/may-khach-api';
import { thongBao } from '../tien-ich/thong-bao';
import { AnhDaiDien } from '../thanh-phan/anh-dai-dien';
import { ToggleTheme } from '@/components/ui/toggle-theme';

type MaVaiTroTrangChu = 'gv' | 'sv' | 'qt';
type MucDoGiaiThichMinhHoa = 'co-ban' | 'trung-binh' | 'nang-cao';
type MaCauHoiMinhHoa = 'khoa-chinh' | 'vong-lap' | 'ngoai-pham-vi';

const NHAN_MUC_DO: Record<MucDoGiaiThichMinhHoa, string> = {
  'co-ban': 'Cơ bản',
  'trung-binh': 'Trung bình',
  'nang-cao': 'Nâng cao',
};

const CAU_HOI_MINH_HOA: Record<
  MaCauHoiMinhHoa,
  {
    cauHoi: string;
    mon: string;
    nguon: string[];
    traLoi?: Record<MucDoGiaiThichMinhHoa, { doan: string; y: string[] }>;
  }
> = {
  'khoa-chinh': {
    cauHoi: 'Khóa chính và khóa ngoại khác nhau thế nào?',
    mon: 'CSDL',
    nguon: ['Giáo trình CSDL · Chương 2 · Đoạn 5', 'Slide tuần 3 · Trang 12'],
    traLoi: {
      'co-ban': {
        doan: 'Khóa chính giống như số căn cước của mỗi dòng trong bảng: không trùng và không được để trống. Khóa ngoại là cột trỏ sang khóa chính của bảng khác để nối hai bảng lại.',
        y: [
          'Bảng SinhVien có khóa chính maSinhVien.',
          'Bảng GhiDanh có khóa ngoại maSinhVien trỏ về bảng trên.',
        ],
      },
      'trung-binh': {
        doan: 'Khóa chính xác định duy nhất mỗi bản ghi, không trùng lặp và không nhận giá trị rỗng. Khóa ngoại tham chiếu đến khóa chính của một quan hệ khác để bảo đảm toàn vẹn tham chiếu.',
        y: [
          'Mỗi bảng chỉ có một khóa chính, có thể gồm nhiều cột.',
          'Một bảng có thể có nhiều khóa ngoại.',
          'Giá trị khóa ngoại phải tồn tại ở bảng được tham chiếu.',
        ],
      },
      'nang-cao': {
        doan: 'Khóa chính là khóa ứng viên được chọn, thỏa ràng buộc thực thể. Khóa ngoại thể hiện ràng buộc toàn vẹn tham chiếu giữa hai quan hệ.',
        y: [
          'Hành vi khi xóa hoặc sửa bản ghi cha: CASCADE, SET NULL, RESTRICT.',
          'Khóa ngoại nên có chỉ mục để tránh quét toàn bảng khi kết nối.',
          'Khóa ngoại có thể nhận rỗng nếu quan hệ là tùy chọn.',
        ],
      },
    },
  },
  'vong-lap': {
    cauHoi: 'Khi nào dùng for, khi nào dùng while?',
    mon: 'Python',
    nguon: ['Giáo trình Python · Chương 3 · Đoạn 2', 'Slide tuần 4 · Trang 7'],
    traLoi: {
      'co-ban': {
        doan: 'Dùng for khi đã biết cần lặp bao nhiêu lần, ví dụ in 10 dòng. Dùng while khi chỉ biết lúc nào phải dừng, ví dụ hỏi mật khẩu đến khi nhập đúng.',
        y: [],
      },
      'trung-binh': {
        doan: 'for duyệt qua một dãy đã xác định như range(10) hoặc một danh sách. while lặp đến khi điều kiện trở thành sai.',
        y: [
          'Dùng for khi biết trước số phần tử.',
          'Dùng while khi điều kiện dừng phụ thuộc dữ liệu nhập.',
          'Cả hai đều dùng được break và continue.',
        ],
      },
      'nang-cao': {
        doan: 'for lặp trên đối tượng khả lặp thông qua iterator nên không cần tự quản lý biến đếm. while phù hợp với vòng lặp có trạng thái hoặc điều kiện dừng phức tạp.',
        y: [
          'Ưu tiên for cùng list comprehension cho dữ liệu đã biết.',
          'Với while, luôn bảo đảm điều kiện có thể chuyển sang sai để tránh lặp vô hạn.',
          'Khối else của vòng lặp chạy khi vòng lặp kết thúc mà không gặp break.',
        ],
      },
    },
  },
  'ngoai-pham-vi': {
    cauHoi: 'Đề thi cuối kỳ năm nay có những câu nào?',
    mon: 'Ngoài tài liệu',
    nguon: [],
  },
};

const BUOC_HOC_PHAN = [
  {
    so: '01',
    tieuDe: 'Chuẩn bị học liệu',
    moTa: 'Giảng viên tải giáo trình, slide và video theo chương. Mỗi lần cập nhật được lưu thành một phiên bản mới.',
    the: ['Tài liệu', 'Phiên bản', 'Lịch học'],
  },
  {
    so: '02',
    tieuDe: 'Lên lớp và điểm danh',
    moTa: 'Học tại phòng hoặc trực tuyến. Sinh viên điểm danh bằng mã PIN 6 số do giảng viên phát trong buổi học.',
    the: ['Phòng học trực tuyến', 'PIN 6 số'],
  },
  {
    so: '03',
    tieuDe: 'Bài tập và kiểm tra',
    moTa: 'Nộp bài, làm bài kiểm tra, nhận điểm và nhận xét. Trợ lý gợi ý nhận xét, giảng viên là người xác nhận cuối cùng.',
    the: ['Nộp bài', 'Chấm điểm', 'Thảo luận'],
  },
  {
    so: '04',
    tieuDe: 'Theo dõi và hỗ trợ',
    moTa: 'Bảng kết quả theo lớp và từng sinh viên. Cảnh báo sớm khi chậm tiến độ, gợi ý nội dung ôn tập từ câu trả lời sai.',
    the: ['Phân tích học tập', 'Cảnh báo sớm'],
  },
];

const VAI_TRO_TRANG_CHU: Record<
  MaVaiTroTrangChu,
  { ten: string; tomTat: string; moTa: string; viec: string[] }
> = {
  gv: {
    ten: 'Giảng viên',
    tomTat: 'Lớp học, học liệu, đánh giá',
    moTa: 'Quản lý lớp học, xây dựng học liệu, giao bài tập, tổ chức kiểm tra và theo dõi kết quả học tập.',
    viec: [
      'Sinh câu hỏi từ tài liệu theo chương và mức độ khó',
      'Tạo đề kiểm tra kèm đáp án và lời giải thích',
      'Gợi ý giáo án, kế hoạch bài giảng, nội dung ôn tập',
      'Mọi nội dung do trợ lý tạo đều là bản nháp chờ duyệt',
    ],
  },
  sv: {
    ten: 'Sinh viên',
    tomTat: 'Học tập, bài tập, hỏi đáp',
    moTa: 'Tham gia lớp học, truy cập học liệu, làm bài tập, trao đổi với giảng viên và nhận hỗ trợ học tập.',
    viec: [
      'Hỏi đáp theo giáo trình, giải thích ở 3 mức độ',
      'Câu trả lời luôn kèm nguồn tài liệu để đối chiếu',
      'Bài luyện tập theo chương, gợi ý ôn từ câu trả lời sai',
      'Diễn đàn môn học, bình luận bài giảng, đánh giá học liệu',
    ],
  },
  qt: {
    ten: 'Quản trị viên',
    tomTat: 'Tài khoản, phân quyền, giám sát',
    moTa: 'Quản lý tài khoản, phân quyền và giám sát hoạt động của hệ thống.',
    viec: [
      'Tài khoản, vai trò, năm học, môn học và lớp học phần',
      'Giới hạn lượt hỏi trợ lý mỗi ngày theo vai trò',
      'Theo dõi lượng sử dụng và chi phí của trợ lý',
      'Nhật ký hoạt động, quy tắc sử dụng trợ lý',
    ],
  },
};

function XoaBoNhoPhien() {
  try {
    sessionStorage.removeItem('lms_cache_ho_so');
    sessionStorage.removeItem('lms_cache_bang_dieu_khien');
    localStorage.removeItem('lms_cache_ho_so');
    localStorage.removeItem('lms_cache_bang_dieu_khien');
  } catch {
    // Bỏ qua lỗi bộ nhớ trình duyệt
  }
}

function NhanTrangThai({
  loai,
  children,
}: {
  loai: 'ok' | 'warn' | 'muted' | 'accent';
  children: React.ReactNode;
}) {
  const lop = {
    ok: 'bg-[var(--ok-soft)] text-[var(--ok)]',
    warn: 'bg-[var(--warn-soft)] text-[var(--warn)]',
    muted: 'bg-[var(--active-bg)] text-[var(--muted)]',
    accent: 'bg-[var(--accent-soft)] text-[var(--accent)]',
  }[loai];
  return (
    <span
      className={`inline-flex items-center gap-1.5 h-[22px] px-2 rounded-[4px] font-mono text-[11px] font-medium whitespace-nowrap ${lop}`}
    >
      {children}
    </span>
  );
}

function TheTrichDan({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-[3px] border border-[var(--border)] rounded-[4px] bg-[var(--bg)] font-mono text-[11px] text-[var(--accent)]">
      <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
      {children}
    </span>
  );
}

function DauMuc({ eyebrow, tieuDe, moTa }: { eyebrow: string; tieuDe: string; moTa: string }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12 items-end mb-7">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2 text-[26px] leading-[1.25] font-semibold tracking-[-0.02em] text-[var(--text)]">
          {tieuDe}
        </h2>
      </div>
      <p className="text-[var(--muted)] max-w-[56ch]">{moTa}</p>
    </div>
  );
}

export default function TrangChu() {
  const queryClient = useQueryClient();
  const { layGiaTri, choPhepDangKy } = useCaiDatHeThong();
  const [nguoiDung, setNguoiDung] = useState<PayloadJwt | null>(null);
  const [dangDangXuat, setDangDangXuat] = useState(false);
  const [vaiTroChon, setVaiTroChon] = useState<MaVaiTroTrangChu>('gv');
  const [mucDo, setMucDo] = useState<MucDoGiaiThichMinhHoa>('trung-binh');
  const [cauChon, setCauChon] = useState<MaCauHoiMinhHoa>('khoa-chinh');

  // Đồng bộ trạng thái đăng nhập với máy chủ để thống nhất với Bảng điều khiển
  useEffect(() => {
    let daHuy = false;
    try {
      const raw =
        sessionStorage.getItem('lms_cache_ho_so') || localStorage.getItem('lms_cache_ho_so');
      if (raw) {
        const hoSo = JSON.parse(raw) as PayloadJwt;
        if (hoSo?.email) setNguoiDung(hoSo);
      }
    } catch {
      // Bỏ qua lỗi đọc bộ nhớ trình duyệt
    }

    mayKhachApi
      .get('/xac-thuc/ho-so-hien-tai')
      .then((res) => {
        if (daHuy) return;
        const duLieu = (res.data?.duLieu || res.data) as PayloadJwt;
        if (duLieu?.email) {
          setNguoiDung(duLieu);
          try {
            const chuoi = JSON.stringify(duLieu);
            sessionStorage.setItem('lms_cache_ho_so', chuoi);
            localStorage.setItem('lms_cache_ho_so', chuoi);
          } catch {
            // Bỏ qua
          }
        }
      })
      .catch(() => {
        if (daHuy) return;
        setNguoiDung(null);
        XoaBoNhoPhien();
      });

    return () => {
      daHuy = true;
    };
  }, []);

  const xuLyDangXuat = async () => {
    setDangDangXuat(true);
    try {
      await mayKhachApi.post('/xac-thuc/dang-xuat');
    } catch {
      // Bỏ qua lỗi mạng khi đăng xuất
    } finally {
      XoaBoNhoPhien();
      queryClient.clear();
      setNguoiDung(null);
      setDangDangXuat(false);
      thongBao.thanhCong('Đã đăng xuất', 'Phiên làm việc đã kết thúc.');
    }
  };

  const tenHeThong = layGiaTri('TEN_HE_THONG', 'SmartClass AI');
  const tenTruong = layGiaTri('TEN_TRUONG', 'Trường Đại học Nguyễn Trãi');
  const tacGia = layGiaTri('TAC_GIA', 'Nguyễn Quang Tâm');
  const maLopKhoa = layGiaTri('MA_LOP_KHOA', 'K23CNT1');
  const mssv = layGiaTri('MSSV', '2310900093');
  const emailLienHe = layGiaTri('EMAIL_LIEN_HE', 'nguyenquangtam179@gmail.com');
  const soDienThoai = layGiaTri('SO_DIEN_THOAI', '0987654321');
  const thongBaoChung = layGiaTri('THONG_BAO_CHUNG');
  const urlLogo = layGiaTri('URL_LOGO');
  const chuVietTat = tenHeThong
    .split(/\s+/)
    .slice(0, 2)
    .map((t) => t.charAt(0))
    .join('')
    .toUpperCase();

  const laQuanTri = nguoiDung?.vaiTro === VaiTro.QUAN_TRI_VIEN;
  const cauHoi = CAU_HOI_MINH_HOA[cauChon];
  const traLoi = cauHoi.traLoi?.[mucDo];
  const vaiTro = VAI_TRO_TRANG_CHU[vaiTroChon];

  const LogoHeThong = (
    <span className="w-[34px] h-[34px] rounded-[var(--radius)] bg-[var(--accent)] text-[var(--accent-foreground)] grid place-items-center font-mono font-bold text-[13px] tracking-[-0.02em] overflow-hidden shrink-0">
      {urlLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={urlLogo} alt={tenHeThong} className="w-full h-full object-contain bg-[var(--surface)]" />
      ) : (
        chuVietTat
      )}
    </span>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      {thongBaoChung && (
        <div className="bg-[var(--accent-soft)] border-b border-[var(--border)] text-[var(--accent)] text-xs font-medium">
          <div className="max-w-[1180px] mx-auto px-6 py-2 flex items-center gap-2">
            <BellRing className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
            <span>{thongBaoChung}</span>
          </div>
        </div>
      )}

      {/* Thanh trên cùng */}
      <header className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--border)]">
        <div className="max-w-[1180px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-7 min-w-0">
            <Link href="/" className="flex items-center gap-2.5 min-w-0">
              {LogoHeThong}
              <span className="min-w-0">
                <span className="block font-semibold text-[15px] leading-tight truncate">
                  {tenHeThong}
                </span>
                <span className="block font-mono text-[11px] text-[var(--muted)] leading-tight truncate">
                  {tenTruong}
                </span>
              </span>
            </Link>
            <nav aria-label="Điều hướng trang chủ" className="hidden lg:flex gap-1">
              {[
                ['#hanh-trinh', 'Học phần'],
                ['#vai-tro', 'Vai trò'],
                ['#tro-ly', 'Trợ lý học tập'],
                ['#lien-he', 'Liên hệ'],
              ].map(([href, nhan]) => (
                <a
                  key={href}
                  href={href}
                  className="px-2.5 py-1.5 rounded-[4px] text-[13px] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--active-bg)] transition-colors"
                >
                  {nhan}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ToggleTheme />
            {nguoiDung ? (
              <>
                <Link
                  href="/ho-so"
                  title="Hồ sơ cá nhân"
                  className="hidden md:flex items-center gap-2.5 pl-1 pr-2.5 py-1 border border-[var(--border)] rounded-[var(--radius)] bg-[var(--bg)] hover:border-[var(--accent)] transition-colors"
                >
                  <AnhDaiDien url={nguoiDung.anhDaiDien} hoTen={nguoiDung.hoTen} kichThuoc="sm" />
                  <span className="leading-tight">
                    <span className="block text-xs font-semibold max-w-[150px] truncate">
                      {nguoiDung.hoTen}
                    </span>
                    <span className="block text-[11px] text-[var(--accent)]">
                      {layNhanVaiTro(nguoiDung.vaiTro)}
                    </span>
                  </span>
                </Link>
                <Link
                  href="/bang-dieu-khien"
                  className="inline-flex items-center gap-2 h-[38px] px-4 rounded-[var(--radius)] bg-[var(--accent)] text-[var(--accent-foreground)] text-[13px] font-semibold hover:brightness-95 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} />
                  <span className="hidden sm:inline">Vào bảng điều khiển</span>
                </Link>
                <button
                  type="button"
                  onClick={xuLyDangXuat}
                  disabled={dangDangXuat}
                  title="Đăng xuất"
                  aria-label="Đăng xuất"
                  className="w-9 h-9 grid place-items-center rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--danger)] hover:border-[var(--danger)] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/dang-nhap"
                  className="h-[34px] px-2.5 inline-flex items-center text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                >
                  Đăng nhập
                </Link>
                {choPhepDangKy && (
                  <Link
                    href="/dang-ky"
                    className="inline-flex items-center h-[38px] px-4 rounded-[var(--radius)] bg-[var(--accent)] text-[var(--accent-foreground)] text-[13px] font-semibold hover:brightness-95 transition-colors"
                  >
                    Đăng ký
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1180px] w-full mx-auto px-6">
        {/* Phần đầu */}
        <section className="py-14 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-start">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <span className="eyebrow">Lớp học số</span>
              <span className="w-7 h-px bg-[var(--border)]" />
              <span className="eyebrow">{tenTruong}</span>
            </div>
            <h1 className="text-[34px] lg:text-[42px] leading-[1.18] tracking-[-0.025em] font-semibold max-w-[16ch]">
              Lớp học, học liệu và <span className="text-[var(--accent)]">trợ lý học tập</span> trong
              một không gian.
            </h1>
            <p className="mt-[18px] text-[15px] text-[var(--muted)] max-w-[52ch]">
              Giảng viên tổ chức lớp học phần, giao bài và theo dõi tiến độ. Sinh viên học theo giáo
              trình, nộp bài đúng hạn và hỏi đáp có trích dẫn nguồn tài liệu.
            </p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              {nguoiDung ? (
                <Link
                  href={laQuanTri ? '/cai-dat' : '/bang-dieu-khien'}
                  className="inline-flex items-center gap-2 h-[38px] px-4 rounded-[var(--radius)] bg-[var(--accent)] text-[var(--accent-foreground)] text-[13px] font-semibold hover:brightness-95 transition-colors"
                >
                  <span>Tiếp tục với vai trò {layNhanVaiTro(nguoiDung.vaiTro)}</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </Link>
              ) : (
                <Link
                  href="/dang-nhap"
                  className="inline-flex items-center gap-2 h-[38px] px-4 rounded-[var(--radius)] bg-[var(--accent)] text-[var(--accent-foreground)] text-[13px] font-semibold hover:brightness-95 transition-colors"
                >
                  <span>Đăng nhập bằng tài khoản trường</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </Link>
              )}
              <a
                href="#hanh-trinh"
                className="inline-flex items-center h-[38px] px-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] text-[13px] font-semibold hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
              >
                Xem một học phần diễn ra thế nào
              </a>
            </div>
            <dl className="mt-10 pt-5 border-t border-[var(--border)] flex flex-wrap gap-x-8 gap-y-3">
              <div>
                <dt className="text-xs text-[var(--muted)]">Đơn vị</dt>
                <dd className="mt-0.5 text-[13px] font-semibold">{tenTruong}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)]">Hỗ trợ học vụ</dt>
                <dd className="mt-0.5 text-[13px] font-mono font-medium tabular-nums">{soDienThoai}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)]">Giờ trực</dt>
                <dd className="mt-0.5 text-[13px] font-mono font-medium tabular-nums">07:30 – 17:00</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-4">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-xs">
              <div className="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-[var(--border)]">
                <div>
                  <p className="text-sm font-semibold">Lịch học trong ngày</p>
                  <p className="font-mono text-[11px] text-[var(--muted)]">Minh họa giao diện</p>
                </div>
                <NhanTrangThai loai="accent">
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />3 buổi
                </NhanTrangThai>
              </div>
              {[
                {
                  bat: '07:30',
                  ket: '09:30',
                  ten: 'Mạng máy tính',
                  meta: 'LHP-MMT-01 · Phòng A2-301',
                  mau: 'var(--info)',
                  xong: true,
                },
                {
                  bat: '13:30',
                  ket: '15:30',
                  ten: 'Lập trình Python cơ bản',
                  meta: 'LHP-PY101-02 · Trực tuyến',
                  mau: 'var(--accent)',
                  dangHoc: true,
                },
                {
                  bat: '15:45',
                  ket: '17:45',
                  ten: 'Cơ sở dữ liệu',
                  meta: 'LHP-CSDL-01 · Phòng B1-204',
                  mau: 'var(--warn)',
                },
              ].map((buoi) => (
                <div
                  key={buoi.ten}
                  className="grid grid-cols-[4px_64px_1fr_auto] gap-3 items-center px-4 py-3 border-b border-[var(--border)] last:border-b-0"
                >
                  <span className="self-stretch rounded-[2px]" style={{ backgroundColor: buoi.mau }} />
                  <div
                    className={`font-mono text-xs leading-[1.35] tabular-nums ${buoi.xong ? 'text-[var(--muted)]' : ''}`}
                  >
                    {buoi.bat}
                    <span className="block text-[var(--muted)]">{buoi.ket}</span>
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-[13px] font-semibold leading-[1.35] truncate ${buoi.xong ? 'text-[var(--muted)]' : ''}`}
                    >
                      {buoi.ten}
                    </p>
                    <p className="font-mono text-[11px] text-[var(--muted)] truncate">{buoi.meta}</p>
                  </div>
                  {buoi.xong ? (
                    <NhanTrangThai loai="muted">Đã kết thúc</NhanTrangThai>
                  ) : buoi.dangHoc ? (
                    <Link
                      href={nguoiDung ? '/lop-hoc-phan' : '/dang-nhap'}
                      className="inline-flex items-center gap-1.5 h-[30px] px-2.5 rounded-[var(--radius)] bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-semibold hover:brightness-95 transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Vào phòng
                    </Link>
                  ) : (
                    <NhanTrangThai loai="warn">Sắp tới</NhanTrangThai>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-xs p-4">
              <p className="eyebrow mb-2.5">Hỏi trợ lý · Lập trình Python cơ bản</p>
              <p className="text-[13px] font-medium px-3 py-2.5 bg-[var(--active-bg)] border border-[var(--border)] rounded-[var(--radius)]">
                Vòng lặp <span className="font-mono">for</span> khác <span className="font-mono">while</span>{' '}
                ở điểm nào?
              </p>
              <p className="mt-2.5 text-[13px]">
                <span className="font-mono">for</span> duyệt qua một dãy đã biết trước số phần tử, còn{' '}
                <span className="font-mono">while</span> lặp đến khi điều kiện sai. Dùng{' '}
                <span className="font-mono">for</span> khi biết số lần lặp, dùng{' '}
                <span className="font-mono">while</span> khi chỉ biết điều kiện dừng.
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <TheTrichDan>Giáo trình Python · Chương 3 · Đoạn 2</TheTrichDan>
                <TheTrichDan>Slide tuần 4 · Trang 7</TheTrichDan>
              </div>
            </div>
          </div>
        </section>

        {/* Một học phần */}
        <section id="hanh-trinh" className="py-14 border-t border-[var(--border)] scroll-mt-16">
          <DauMuc
            eyebrow="Một học phần trên SmartClass"
            tieuDe="Từ buổi học đầu tiên đến báo cáo cuối kỳ."
            moTa="Mỗi bước dùng chung một lớp học phần: danh sách sinh viên, học liệu, bài tập, điểm danh và kết quả đều nằm ở cùng một chỗ."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-xs">
            {BUOC_HOC_PHAN.map((buoc, i) => (
              <div
                key={buoc.so}
                className={`p-5 flex flex-col gap-2.5 border-[var(--border)] ${
                  i < BUOC_HOC_PHAN.length - 1 ? 'border-b lg:border-b-0 lg:border-r' : ''
                } ${i === 1 ? 'sm:border-b lg:border-b-0' : ''} ${i === 0 ? 'sm:border-r' : ''}`}
              >
                <div className="flex items-center gap-2.5">
                  <b className="font-mono text-xs font-bold text-[var(--accent)]">{buoc.so}</b>
                  <i className="flex-1 h-px bg-[var(--border)]" />
                </div>
                <h3 className="text-[15px] font-semibold">{buoc.tieuDe}</h3>
                <p className="text-[13px] text-[var(--muted)]">{buoc.moTa}</p>
                <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                  {buoc.the.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-[11px] px-[7px] py-0.5 rounded-[4px] bg-[var(--active-bg)] text-[var(--muted)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Vai trò */}
        <section id="vai-tro" className="py-14 border-t border-[var(--border)] scroll-mt-16">
          <DauMuc
            eyebrow="Theo vai trò"
            tieuDe="Mỗi người thấy đúng phần việc của mình."
            moTa="Quyền truy cập theo vai trò và theo lớp học phần. Sinh viên chỉ thấy lớp mình đã ghi danh, giảng viên chỉ quản lý lớp mình phụ trách."
          />
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
            <div role="tablist" aria-label="Chọn vai trò" className="flex lg:flex-col gap-1 overflow-x-auto">
              {(Object.keys(VAI_TRO_TRANG_CHU) as MaVaiTroTrangChu[]).map((ma) => {
                const chon = ma === vaiTroChon;
                return (
                  <button
                    key={ma}
                    type="button"
                    role="tab"
                    aria-selected={chon}
                    onClick={() => setVaiTroChon(ma)}
                    className={`text-left px-4 py-3.5 rounded-[var(--radius)] border transition-colors cursor-pointer shrink-0 ${
                      chon
                        ? 'bg-[var(--surface)] border-[var(--border)] shadow-xs'
                        : 'border-transparent hover:bg-[var(--active-bg)]'
                    }`}
                  >
                    <span
                      className={`block text-sm font-semibold ${chon ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}
                    >
                      {VAI_TRO_TRANG_CHU[ma].ten}
                    </span>
                    <span className="block text-xs text-[var(--muted)]">{VAI_TRO_TRANG_CHU[ma].tomTat}</span>
                  </button>
                );
              })}
            </div>

            <div
              role="tabpanel"
              className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-xs p-6 grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div>
                <h3 className="text-lg font-semibold">{vaiTro.ten}</h3>
                <p className="mt-2 text-[13px] text-[var(--muted)]">{vaiTro.moTa}</p>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {vaiTro.viec.map((v) => (
                    <li key={v} className="flex gap-2.5 text-[13px]">
                      <Check className="w-4 h-4 mt-[3px] text-[var(--accent)] shrink-0" strokeWidth={1.5} />
                      {v}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border border-[var(--border)] rounded-[var(--radius)] bg-[var(--bg)] overflow-hidden self-start">
                {vaiTroChon === 'gv' && (
                  <>
                    <div className="flex justify-between items-center px-3 py-2.5 border-b border-[var(--border)] text-xs font-semibold">
                      <span>Bản nháp chờ duyệt</span>
                      <NhanTrangThai loai="warn">2 bản nháp</NhanTrangThai>
                    </div>
                    {[
                      { ten: 'Đề luyện tập Chương 3: Vòng lặp', phu: '10 câu · Trung bình · LHP-PY101-02', duyet: false },
                      { ten: 'Kế hoạch bài giảng tuần 10', phu: 'Giáo án · LHP-CSDL-01', duyet: false },
                      { ten: 'Nhận xét bài nộp · Nguyễn Văn An', phu: 'Điểm gợi ý 8.0 · Bài tập tuần 8', duyet: true },
                    ].map((d) => (
                      <div
                        key={d.ten}
                        className="flex justify-between items-center gap-3 px-3 py-2.5 border-b border-[var(--border)] last:border-b-0 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{d.ten}</p>
                          <p className="font-mono text-[11px] text-[var(--muted)] truncate">{d.phu}</p>
                        </div>
                        {d.duyet ? (
                          <NhanTrangThai loai="ok">Đã duyệt</NhanTrangThai>
                        ) : (
                          <span className="inline-flex h-[26px] px-2.5 items-center rounded-[var(--radius)] bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-semibold">
                            Duyệt
                          </span>
                        )}
                      </div>
                    ))}
                  </>
                )}
                {vaiTroChon === 'sv' && (
                  <>
                    <div className="flex justify-between items-center px-3 py-2.5 border-b border-[var(--border)] text-xs font-semibold">
                      <span>Bài tập sắp đến hạn</span>
                      <span className="font-mono text-[11px] font-normal text-[var(--muted)]">Tuần 9</span>
                    </div>
                    {[
                      { ten: 'Bài tập Chương 3: Vòng lặp', phu: 'LHP-PY101-02 · Hạn 23:59 05/11', nhan: 'Còn 2 ngày', loai: 'warn' as const },
                      { ten: 'Thiết kế lược đồ quan hệ', phu: 'LHP-CSDL-01 · Hạn 23:59 08/11', nhan: 'Chưa nộp', loai: 'muted' as const },
                      { ten: 'Báo cáo mô hình OSI', phu: 'LHP-MMT-01 · Đã chấm', nhan: '9.0', loai: 'ok' as const },
                    ].map((b) => (
                      <div
                        key={b.ten}
                        className="flex justify-between items-center gap-3 px-3 py-2.5 border-b border-[var(--border)] last:border-b-0 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{b.ten}</p>
                          <p className="font-mono text-[11px] text-[var(--muted)] truncate">{b.phu}</p>
                        </div>
                        <NhanTrangThai loai={b.loai}>{b.nhan}</NhanTrangThai>
                      </div>
                    ))}
                  </>
                )}
                {vaiTroChon === 'qt' && (
                  <>
                    <div className="flex justify-between items-center px-3 py-2.5 border-b border-[var(--border)] text-xs font-semibold">
                      <span>Hạn mức hỏi đáp mỗi ngày</span>
                      <span className="font-mono text-[11px] font-normal text-[var(--muted)]">Theo vai trò</span>
                    </div>
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr>
                          <th className="text-left font-mono text-[11px] font-medium text-[var(--muted)] px-3 py-2 border-b border-[var(--border)]">
                            Vai trò
                          </th>
                          <th className="text-right font-mono text-[11px] font-medium text-[var(--muted)] px-3 py-2 border-b border-[var(--border)]">
                            Giới hạn/ngày
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ['Sinh viên', '30'],
                          ['Giảng viên', '100'],
                        ].map(([ten, so]) => (
                          <tr key={ten}>
                            <td className="px-3 py-2.5 border-b border-[var(--border)]">{ten}</td>
                            <td className="px-3 py-2.5 border-b border-[var(--border)] text-right font-mono tabular-nums">
                              {so}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="px-3 py-2.5 text-[11px] text-[var(--muted)]">
                      Chỉnh trong Cài đặt hệ thống, nhóm Trợ lý học tập.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Trợ lý học tập */}
        <section id="tro-ly" className="py-14 border-t border-[var(--border)] scroll-mt-16">
          <DauMuc
            eyebrow="Trợ lý học tập"
            tieuDe="Trả lời từ tài liệu của môn học, không đoán."
            moTa="Chọn một câu hỏi và mức độ giải thích. Khi tài liệu không có căn cứ, trợ lý nói rõ là chưa đủ thông tin thay vì tự suy đoán."
          />
          <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-6">
            <div>
              <div
                role="group"
                aria-label="Mức độ giải thích"
                className="inline-flex p-[3px] gap-0.5 border border-[var(--border)] rounded-[var(--radius)] bg-[var(--active-bg)]"
              >
                {(Object.keys(NHAN_MUC_DO) as MucDoGiaiThichMinhHoa[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={mucDo === m}
                    onClick={() => setMucDo(m)}
                    className={`h-7 px-3 rounded-[6px] text-xs font-semibold transition-colors cursor-pointer ${
                      mucDo === m
                        ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                        : 'text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    {NHAN_MUC_DO[m]}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex flex-col gap-2">
                {(Object.keys(CAU_HOI_MINH_HOA) as MaCauHoiMinhHoa[]).map((ma) => (
                  <button
                    key={ma}
                    type="button"
                    aria-pressed={cauChon === ma}
                    onClick={() => setCauChon(ma)}
                    className={`text-left px-3.5 py-3 border rounded-[var(--radius)] bg-[var(--surface)] text-[13px] flex justify-between items-center gap-3 transition-colors cursor-pointer ${
                      cauChon === ma
                        ? 'border-[var(--accent)] text-[var(--accent)]'
                        : 'border-[var(--border)] hover:border-[var(--muted)]'
                    }`}
                  >
                    <span>{CAU_HOI_MINH_HOA[ma].cauHoi}</span>
                    <small className="font-mono text-[11px] text-[var(--muted)] shrink-0">
                      {CAU_HOI_MINH_HOA[ma].mon}
                    </small>
                  </button>
                ))}
              </div>
            </div>

            <div
              aria-live="polite"
              className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-xs p-5"
            >
              <p className="text-[13px] text-[var(--muted)]">
                Câu hỏi: <b className="font-semibold text-[var(--text)]">{cauHoi.cauHoi}</b>
              </p>
              <div className="mt-3.5 text-sm">
                {traLoi ? (
                  <>
                    <p>{traLoi.doan}</p>
                    {traLoi.y.length > 0 && (
                      <ul className="mt-2.5 pl-[18px] list-disc space-y-1">
                        {traLoi.y.map((y) => (
                          <li key={y}>{y}</li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <div className="flex gap-2.5 px-3.5 py-3 rounded-[var(--radius)] bg-[var(--info-soft)] text-[var(--info)] text-[13px]">
                    <Info className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={1.5} />
                    <p className="text-[var(--text)]">
                      Tài liệu của lớp học phần chưa có nội dung này nên trợ lý không trả lời để tránh suy
                      đoán. Bạn có thể hỏi giảng viên phụ trách hoặc xem thông báo của lớp.
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-3.5 border-t border-[var(--border)] flex justify-between items-center gap-3 flex-wrap">
                <div className="flex flex-wrap gap-2">
                  {cauHoi.nguon.length > 0 ? (
                    cauHoi.nguon.map((n) => <TheTrichDan key={n}>{n}</TheTrichDan>)
                  ) : (
                    <span className="font-mono text-[11px] text-[var(--muted)]">
                      Không tìm thấy nguồn phù hợp
                    </span>
                  )}
                </div>
                <span className="font-mono text-[11px] text-[var(--muted)]">Mức {NHAN_MUC_DO[mucDo].toLowerCase()}</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="lien-he" className="border-t border-[var(--border)] bg-[var(--surface)] py-8">
        <div className="max-w-[1180px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                {LogoHeThong}
                <span className="font-semibold text-[15px]">{tenHeThong}</span>
              </div>
              <p className="text-[13px] text-[var(--muted)]">
                Hệ thống lớp học số tích hợp trợ lý học tập. Đồ án tốt nghiệp ngành Công nghệ thông tin.
              </p>
            </div>
            <div>
              <h4 className="text-[13px] font-semibold mb-2">Liên hệ học vụ</h4>
              <a
                href={`mailto:${emailLienHe}`}
                className="block font-mono text-[13px] text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
              >
                {emailLienHe}
              </a>
              <p className="font-mono text-[13px] text-[var(--muted)] tabular-nums">{soDienThoai}</p>
            </div>
            <div>
              <h4 className="text-[13px] font-semibold mb-2">Thực hiện</h4>
              <p className="text-[13px] text-[var(--muted)]">{tacGia}</p>
              <p className="font-mono text-[13px] text-[var(--muted)] tabular-nums">
                {maLopKhoa} · {mssv}
              </p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-[var(--border)] flex justify-between text-xs text-[var(--muted)]">
            <span>© 2026 {tenTruong}</span>
            <span className="font-mono">{tenHeThong}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
