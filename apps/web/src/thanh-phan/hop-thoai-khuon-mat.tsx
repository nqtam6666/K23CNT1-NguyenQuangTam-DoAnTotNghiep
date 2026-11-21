'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Camera,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ScanFace,
  ShieldCheck,
  Trash2,
  UserCheck,
  VideoOff,
  AlertCircle,
} from 'lucide-react';
import { HopThoai } from './hop-thoai';
import { mayKhachApi } from '../tien-ich/may-khach-api';
import { thongBao } from '../tien-ich/thong-bao';
import {
  HoSoKhuonMat,
  KetQuaDiemDanhKhuonMat,
  MucDuLieuKhuonMatLop,
} from '@lms/chung';
import {
  taiMoHinhNhanDienKhuonMat,
  tinhDoTuongDongClient,
  trichXuatMotKhuonMat,
  trichXuatNhieuKhuonMat,
  trungBinhVaChuanHoaVector,
} from '../tien-ich/nhan-dien-khuon-mat';

export type CheDoHopThoaiKhuonMat = 'dang-ky' | 'diem-danh-ca-nhan' | 'camera-lop';

interface HocSinhNhanDienTam {
  idHocSinh: string;
  maHocSinh: string;
  hoTen: string;
  doTinCay: number;
  thoiDiemNhanDien: string;
}

interface ThuocTinhHopThoaiKhuonMat {
  mo: boolean;
  onDong: () => void;
  cheDo: CheDoHopThoaiKhuonMat;
  idLopHocPhan?: string;
  idBuoiHoc?: string;
  nguongKhop?: number;
  onThanhCong?: (duLieu?: HoSoKhuonMat | KetQuaDiemDanhKhuonMat | unknown) => void;
}

const SO_MAU_DANG_KY = 3;
const NGUONG_CHUYEN_DONG_MUI = 0.035;
const NGUONG_CHOP_MAT = 0.21;

export function HopThoaiKhuonMat({
  mo,
  onDong,
  cheDo,
  idLopHocPhan,
  idBuoiHoc,
  nguongKhop = 0.78,
  onThanhCong,
}: ThuocTinhHopThoaiKhuonMat) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const luongCameraRef = useRef<MediaStream | null>(null);
  const boDemQuetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dangChayVongQuetRef = useRef(false);
  const dangGuiRef = useRef(false);

  const [trangThaiCamera, setTrangThaiCamera] = useState<
    'DANG_TAI' | 'SAN_SANG' | 'LOI_CAMERA'
  >('DANG_TAI');
  const [thongDiepHuongDan, setThongDiepHuongDan] = useState(
    'Đang chuẩn bị camera và bộ nhận diện khuôn mặt...',
  );
  const [loiCamera, setLoiCamera] = useState<string | null>(null);

  // Trạng thái đăng ký & tự điểm danh cá nhân
  const [soMauDaThu, setSoMauDaThu] = useState(0);
  const [daXacThucNguoiThat, setDaXacThucNguoiThat] = useState(false);
  const [dangXuLyGui, setDangXuLyGui] = useState(false);

  const cacMauVectorRef = useRef<number[][]>([]);
  const cacDiemChatLuongRef = useRef<number[]>([]);
  const muiGocRef = useRef<{ x: number; y: number } | null>(null);
  const daXacThucRef = useRef(false);
  const daHoanTatTuDongRef = useRef(false);

  // Trạng thái camera lớp học
  const [danhSachMauLop, setDanhSachMauLop] = useState<MucDuLieuKhuonMatLop[]>([]);
  const [danhSachNhanDien, setDanhSachNhanDien] = useState<HocSinhNhanDienTam[]>([]);
  const danhSachMauLopRef = useRef<MucDuLieuKhuonMatLop[]>([]);

  const dungCameraVaBoDem = useCallback(() => {
    dangChayVongQuetRef.current = false;
    if (boDemQuetRef.current) {
      clearTimeout(boDemQuetRef.current);
      boDemQuetRef.current = null;
    }
    if (luongCameraRef.current) {
      luongCameraRef.current.getTracks().forEach((track) => track.stop());
      luongCameraRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const datLaiTrangThaiQuet = useCallback(() => {
    cacMauVectorRef.current = [];
    cacDiemChatLuongRef.current = [];
    muiGocRef.current = null;
    daXacThucRef.current = false;
    daHoanTatTuDongRef.current = false;
    dangGuiRef.current = false;
    setSoMauDaThu(0);
    setDaXacThucNguoiThat(false);
    setDangXuLyGui(false);
  }, []);

  const xuLyGuiKetQuaCaNhan = useCallback(
    async (vectors: number[][], chatLuongs: number[]) => {
      if (dangGuiRef.current) return;
      dangGuiRef.current = true;
      setDangXuLyGui(true);

      try {
        const vectorDaiDien = trungBinhVaChuanHoaVector(vectors);
        const diemChatLuongTB =
          chatLuongs.length > 0
            ? Number(
                (chatLuongs.reduce((a, b) => a + b, 0) / chatLuongs.length).toFixed(4),
              )
            : 0.85;

        if (cheDo === 'dang-ky') {
          setThongDiepHuongDan('Đang lưu dữ liệu khuôn mặt vào hồ sơ cá nhân...');
          const res = await mayKhachApi.post('/phong-hoc-truc-tuyen/khuon-mat/dang-ky', {
            vectorKhuonMat: vectorDaiDien,
            soMauChup: vectors.length,
            diemChatLuong: Math.max(0.4, Math.min(1, diemChatLuongTB)),
            daXacThucNguoiThat: true,
          });
          const duLieuMoi = (res.data?.duLieu || res.data) as HoSoKhuonMat;
          thongBao.thanhCong(
            'Đã đăng ký khuôn mặt',
            'Khuôn mặt của bạn đã sẵn sàng để sử dụng khi điểm danh buổi học.',
          );
          dungCameraVaBoDem();
          onThanhCong?.(duLieuMoi);
          onDong();
        } else if (cheDo === 'diem-danh-ca-nhan' && idBuoiHoc) {
          setThongDiepHuongDan('Đang đối chiếu khuôn mặt và ghi nhận điểm danh...');
          const res = await mayKhachApi.post(
            `/phong-hoc-truc-tuyen/buoi-hoc/${idBuoiHoc}/diem-danh-khuon-mat`,
            {
              vectorKhuonMat: vectorDaiDien,
              diemChatLuong: Math.max(0.4, Math.min(1, diemChatLuongTB)),
              daXacThucNguoiThat: true,
            },
          );
          const ketQua = (res.data?.duLieu || res.data) as KetQuaDiemDanhKhuonMat;
          thongBao.thanhCong(
            'Điểm danh thành công',
            res.data?.thongDiep ||
              `Đã ghi nhận có mặt (độ khớp ${Math.round((ketQua?.doTuongDong || 0.8) * 100)}%).`,
          );
          dungCameraVaBoDem();
          onThanhCong?.(ketQua);
          onDong();
        }
      } catch (loi: any) {
        thongBao.loiHeThong(
          loi,
          cheDo === 'dang-ky'
            ? 'Không thể lưu dữ liệu khuôn mặt. Vui lòng thử lại.'
            : 'Điểm danh chưa thành công. Vui lòng căn lại khuôn mặt và thử lại.',
        );
        datLaiTrangThaiQuet();
        setThongDiepHuongDan(
          'Chưa xác nhận được. Vui lòng nhìn thẳng nơi đủ ánh sáng rồi xoay nhẹ đầu.',
        );
      } finally {
        dangGuiRef.current = false;
        setDangXuLyGui(false);
      }
    },
    [cheDo, datLaiTrangThaiQuet, dungCameraVaBoDem, idBuoiHoc, onDong, onThanhCong],
  );

  const veKhungNhanDien = useCallback(
    (
      danhSachKhung: {
        x: number;
        y: number;
        width: number;
        height: number;
        nhan: string;
        khop: boolean;
      }[],
    ) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) return;

      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const khung of danhSachKhung) {
        ctx.strokeStyle = khung.khop ? '#16a34a' : '#d97706';
        ctx.lineWidth = 2;
        ctx.strokeRect(khung.x, khung.y, khung.width, khung.height);

        if (khung.nhan) {
          ctx.font = '600 13px "JetBrains Mono", monospace';
          const textWidth = ctx.measureText(khung.nhan).width;
          const labelY = Math.max(24, khung.y - 6);
          ctx.fillStyle = khung.khop ? 'rgba(22, 163, 74, 0.9)' : 'rgba(24, 24, 27, 0.8)';
          ctx.fillRect(khung.x, labelY - 18, textWidth + 14, 22);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(khung.nhan, khung.x + 7, labelY - 3);
        }
      }
    },
    [],
  );

  const chayVongQuet = useCallback(async () => {
    if (!dangChayVongQuetRef.current) return;
    const video = videoRef.current;

    if (video && video.readyState >= 2 && !dangGuiRef.current) {
      if (cheDo === 'camera-lop') {
        const khuonMats = await trichXuatNhieuKhuonMat(video);
        const mauLop = danhSachMauLopRef.current;
        const khungVe: {
          x: number;
          y: number;
          width: number;
          height: number;
          nhan: string;
          khop: boolean;
        }[] = [];
        const moiPhatHien: HocSinhNhanDienTam[] = [];

        for (const km of khuonMats) {
          let totNhat: { mau: MucDuLieuKhuonMatLop; doTinCay: number } | null = null;
          for (const mau of mauLop) {
            const { doTuongDong } = tinhDoTuongDongClient(km.vector, mau.vectorKhuonMat);
            if (doTuongDong >= nguongKhop && (!totNhat || doTuongDong > totNhat.doTinCay)) {
              totNhat = { mau, doTinCay: doTuongDong };
            }
          }

          if (totNhat) {
            const phanTram = Math.round(totNhat.doTinCay * 100);
            khungVe.push({
              ...km.hopGioiHan,
              nhan: `${totNhat.mau.hoTen} (${phanTram}%)`,
              khop: true,
            });
            moiPhatHien.push({
              idHocSinh: totNhat.mau.idHocSinh,
              maHocSinh: totNhat.mau.maHocSinh,
              hoTen: totNhat.mau.hoTen,
              doTinCay: totNhat.doTinCay,
              thoiDiemNhanDien: new Date().toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              }),
            });
          } else {
            khungVe.push({
              ...km.hopGioiHan,
              nhan: 'Chưa khớp hồ sơ lớp',
              khop: false,
            });
          }
        }

        veKhungNhanDien(khungVe);

        if (moiPhatHien.length > 0) {
          setDanhSachNhanDien((truoc) => {
            const banDo = new Map(truoc.map((item) => [item.idHocSinh, item]));
            for (const item of moiPhatHien) {
              const hienCo = banDo.get(item.idHocSinh);
              if (!hienCo || item.doTinCay > hienCo.doTinCay) {
                banDo.set(item.idHocSinh, item);
              }
            }
            return Array.from(banDo.values());
          });
        }
      } else {
        const kq = await trichXuatMotKhuonMat(video);
        if (!kq.hopLe) {
          veKhungNhanDien([]);
          setThongDiepHuongDan(kq.thongDiep);
        } else {
          veKhungNhanDien([
            {
              ...kq.hopGioiHan,
              nhan: daXacThucRef.current
                ? `Đã xác thực (${cacMauVectorRef.current.length}/${SO_MAU_DANG_KY})`
                : 'Đang kiểm tra chuyển động...',
              khop: daXacThucRef.current,
            },
          ]);

          if (!muiGocRef.current) {
            muiGocRef.current = { x: kq.muiXTuongDoi, y: kq.muiYTuongDoi };
          }

          if (!daXacThucRef.current) {
            const lechX = Math.abs(kq.muiXTuongDoi - muiGocRef.current.x);
            const lechY = Math.abs(kq.muiYTuongDoi - muiGocRef.current.y);
            const coChuyenDong =
              lechX >= NGUONG_CHUYEN_DONG_MUI ||
              lechY >= NGUONG_CHUYEN_DONG_MUI ||
              kq.tyLeMoMat < NGUONG_CHOP_MAT;

            if (coChuyenDong) {
              daXacThucRef.current = true;
              setDaXacThucNguoiThat(true);
              setThongDiepHuongDan(
                'Đã xác thực người thật. Vui lòng giữ yên khuôn mặt trong giây lát...',
              );
            } else {
              setThongDiepHuongDan(
                'Vui lòng xoay nhẹ đầu sang trái/phải hoặc chớp mắt để xác nhận.',
              );
            }
          }

          if (daXacThucRef.current && !daHoanTatTuDongRef.current) {
            cacMauVectorRef.current.push(kq.vector);
            cacDiemChatLuongRef.current.push(kq.diemChatLuong);
            const soLuong = cacMauVectorRef.current.length;
            setSoMauDaThu(soLuong);

            const mucTieu = cheDo === 'dang-ky' ? SO_MAU_DANG_KY : 2;
            if (soLuong >= mucTieu) {
              daHoanTatTuDongRef.current = true;
              await xuLyGuiKetQuaCaNhan(
                cacMauVectorRef.current,
                cacDiemChatLuongRef.current,
              );
              return;
            }
          }
        }
      }
    }

    if (dangChayVongQuetRef.current) {
      boDemQuetRef.current = setTimeout(chayVongQuet, cheDo === 'camera-lop' ? 750 : 450);
    }
  }, [cheDo, nguongKhop, veKhungNhanDien, xuLyGuiKetQuaCaNhan]);

  const khoiDongCamera = useCallback(async () => {
    dungCameraVaBoDem();
    datLaiTrangThaiQuet();
    setLoiCamera(null);
    setTrangThaiCamera('DANG_TAI');
    setThongDiepHuongDan('Đang chuẩn bị camera và bộ nhận diện khuôn mặt...');

    try {
      await taiMoHinhNhanDienKhuonMat();

      if (cheDo === 'camera-lop' && idLopHocPhan) {
        const res = await mayKhachApi.get(
          `/phong-hoc-truc-tuyen/lop/${idLopHocPhan}/du-lieu-khuon-mat`,
        );
        const dsMau = (res.data?.duLieu || []) as MucDuLieuKhuonMatLop[];
        danhSachMauLopRef.current = dsMau;
        setDanhSachMauLop(dsMau);
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Trình duyệt hiện tại không hỗ trợ truy cập camera.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cheDo === 'camera-lop' ? 'environment' : 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      luongCameraRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setTrangThaiCamera('SAN_SANG');
      setThongDiepHuongDan(
        cheDo === 'camera-lop'
          ? 'Camera lớp học đã sẵn sàng. Hệ thống tự động nhận diện học sinh xuất hiện trong khung hình.'
          : 'Đưa khuôn mặt vào chính giữa khung hình, đủ ánh sáng.',
      );

      dangChayVongQuetRef.current = true;
      boDemQuetRef.current = setTimeout(chayVongQuet, 500);
    } catch (loi: any) {
      setTrangThaiCamera('LOI_CAMERA');
      const thongDiep =
        loi?.response?.data?.thongDiep ||
        loi?.message ||
        'Không thể mở camera. Vui lòng kiểm tra quyền truy cập camera của trình duyệt.';
      setLoiCamera(thongDiep);
      setThongDiepHuongDan(thongDiep);
    }
  }, [cheDo, chayVongQuet, datLaiTrangThaiQuet, dungCameraVaBoDem, idLopHocPhan]);

  useEffect(() => {
    if (mo) {
      setDanhSachNhanDien([]);
      khoiDongCamera();
    } else {
      dungCameraVaBoDem();
      datLaiTrangThaiQuet();
    }
    return () => {
      dungCameraVaBoDem();
    };
  }, [mo, khoiDongCamera, dungCameraVaBoDem, datLaiTrangThaiQuet]);

  const xuLyLuuCameraLop = async () => {
    if (!idBuoiHoc || danhSachNhanDien.length === 0) return;
    setDangXuLyGui(true);
    try {
      const res = await mayKhachApi.post(
        `/phong-hoc-truc-tuyen/buoi-hoc/${idBuoiHoc}/diem-danh-khuon-mat-lop`,
        {
          danhSachNhanDien: danhSachNhanDien.map((hs) => ({
            idHocSinh: hs.idHocSinh,
            doTinCay: hs.doTinCay,
          })),
        },
      );
      thongBao.thanhCong(
        'Đã lưu điểm danh khuôn mặt',
        res.data?.thongDiep ||
          `Đã ghi nhận điểm danh cho ${danhSachNhanDien.length} học sinh.`,
      );
      dungCameraVaBoDem();
      onThanhCong?.(res.data?.duLieu);
      onDong();
    } catch (loi: any) {
      thongBao.loiHeThong(loi, 'Không thể lưu kết quả điểm danh khuôn mặt');
    } finally {
      setDangXuLyGui(false);
    }
  };

  const tieuDeModal =
    cheDo === 'dang-ky'
      ? 'Đăng ký dữ liệu khuôn mặt cá nhân'
      : cheDo === 'diem-danh-ca-nhan'
        ? 'Điểm danh bằng khuôn mặt'
        : 'Camera điểm danh cả lớp';

  const moTaModal =
    cheDo === 'dang-ky'
      ? 'Chụp nhanh khuôn mặt để sử dụng cho các buổi điểm danh trực tiếp.'
      : cheDo === 'diem-danh-ca-nhan'
        ? 'Xác nhận hiện diện nhanh qua camera và tự động cập nhật trạng thái buổi học.'
        : 'Quét nhiều khuôn mặt trong phòng học và xác nhận điểm danh hàng loạt.';

  return (
    <HopThoai
      mo={mo}
      onDong={() => {
        dungCameraVaBoDem();
        onDong();
      }}
      eyebrow="ĐIỂM DANH KHUÔN MẶT"
      tieuDe={tieuDeModal}
      moTa={moTaModal}
      kichThuoc={cheDo === 'camera-lop' ? 'rat-lon' : 'lon'}
    >
      <div className={cheDo === 'camera-lop' ? 'grid grid-cols-1 lg:grid-cols-12 gap-4' : 'space-y-4'}>
        {/* Khung hiển thị Camera & Canvas */}
        <div className={cheDo === 'camera-lop' ? 'lg:col-span-7 space-y-3' : 'space-y-3'}>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-black">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`h-full w-full object-cover ${
                cheDo !== 'camera-lop' ? '-scale-x-100' : ''
              }`}
            />
            <canvas
              ref={canvasRef}
              className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${
                cheDo !== 'camera-lop' ? '-scale-x-100' : ''
              }`}
            />

            {trangThaiCamera === 'DANG_TAI' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[var(--bg)]/90 text-[var(--text)]">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)] stroke-[1.5]" />
                <p className="font-mono text-xs text-[var(--muted)]">
                  Đang khởi động camera...
                </p>
              </div>
            )}

            {trangThaiCamera === 'LOI_CAMERA' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--bg)] p-6 text-center">
                <VideoOff className="h-8 w-8 text-[var(--danger)] stroke-[1.5]" />
                <p className="text-xs text-[var(--text)]">{loiCamera}</p>
                <button
                  type="button"
                  onClick={khoiDongCamera}
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] hover:bg-[var(--active-bg)] transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5 stroke-[1.5]" />
                  <span>Thử kết nối lại camera</span>
                </button>
              </div>
            )}
          </div>

          {/* Thanh trạng thái tiến trình */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              {dangXuLyGui ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[var(--accent)] stroke-[1.5]" />
              ) : daXacThucNguoiThat ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--accent)] stroke-[1.5]" />
              ) : (
                <ScanFace className="h-4 w-4 shrink-0 text-[var(--accent)] stroke-[1.5]" />
              )}
              <p className="text-xs text-[var(--text)] leading-relaxed">{thongDiepHuongDan}</p>
            </div>

            {cheDo !== 'camera-lop' && (
              <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] tabular-nums">
                <span
                  className={`rounded-[var(--radius)] border px-2 py-0.5 ${
                    daXacThucNguoiThat
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]'
                  }`}
                >
                  {daXacThucNguoiThat ? 'Đã xác thực' : 'Chờ cử động nhẹ'}
                </span>
                <span className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[var(--text)]">
                  Mẫu {soMauDaThu}/{cheDo === 'dang-ky' ? SO_MAU_DANG_KY : 2}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Cột danh sách nhận diện khi Giáo viên bật camera cả lớp */}
        {cheDo === 'camera-lop' && (
          <div className="lg:col-span-5 flex flex-col justify-between rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] p-3.5 space-y-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--muted)]">
                    ĐÃ NHẬN DIỆN
                  </p>
                  <p className="font-mono text-sm font-bold text-[var(--text)] tabular-nums">
                    {danhSachNhanDien.length} / {danhSachMauLop.length} học sinh có hồ sơ
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-2 py-1 font-mono text-[11px] text-[var(--muted)] tabular-nums">
                  <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent)] stroke-[1.5]" />
                  <span>Ngưỡng {Math.round(nguongKhop * 100)}%</span>
                </span>
              </div>

              {danhSachMauLop.length === 0 ? (
                <div className="flex items-start gap-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-3 text-xs text-[var(--muted)]">
                  <AlertCircle className="h-4 w-4 shrink-0 text-[var(--accent)] stroke-[1.5] mt-0.5" />
                  <span>
                    Chưa có học sinh nào trong lớp đăng ký dữ liệu khuôn mặt trong hồ sơ cá nhân.
                  </span>
                </div>
              ) : danhSachNhanDien.length === 0 ? (
                <div className="py-10 text-center space-y-1.5">
                  <Camera className="h-6 w-6 mx-auto text-[var(--muted)] stroke-[1.5]" />
                  <p className="text-xs text-[var(--muted)]">
                    Đưa camera hướng về phía lớp học để bắt đầu nhận diện học sinh.
                  </p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto divide-y divide-[var(--border)] rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]">
                  {danhSachNhanDien.map((hs) => (
                    <div
                      key={hs.idHocSinh}
                      className="flex items-center justify-between gap-2 px-3 py-2 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--text)] truncate">{hs.hoTen}</p>
                        <p className="font-mono text-[11px] text-[var(--muted)] tabular-nums">
                          {hs.maHocSinh} · Khớp {Math.round(hs.doTinCay * 100)}% · {hs.thoiDiemNhanDien}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setDanhSachNhanDien((truoc) =>
                            truoc.filter((x) => x.idHocSinh !== hs.idHocSinh),
                          )
                        }
                        title="Loại khỏi danh sách xác nhận"
                        className="rounded-[var(--radius)] p-1.5 text-[var(--muted)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5 stroke-[1.5]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] pt-3">
              <button
                type="button"
                onClick={() => {
                  dungCameraVaBoDem();
                  onDong();
                }}
                className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--active-bg)] transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={danhSachNhanDien.length === 0 || dangXuLyGui}
                onClick={xuLyLuuCameraLop}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius)] bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white hover:opacity-95 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {dangXuLyGui ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin stroke-[1.5]" />
                ) : (
                  <UserCheck className="h-3.5 w-3.5 stroke-[1.5]" />
                )}
                <span>Xác nhận điểm danh ({danhSachNhanDien.length})</span>
              </button>
            </div>
          </div>
        )}

        {/* Nút điều khiển dưới cùng cho chế độ cá nhân */}
        {cheDo !== 'camera-lop' && (
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={khoiDongCamera}
              disabled={dangXuLyGui}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--active-bg)] transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className="h-3.5 w-3.5 stroke-[1.5]" />
              <span>Quét lại</span>
            </button>
            <button
              type="button"
              onClick={() => {
                dungCameraVaBoDem();
                onDong();
              }}
              className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--active-bg)] transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </HopThoai>
  );
}
