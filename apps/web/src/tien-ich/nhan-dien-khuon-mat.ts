'use client';

type FaceApiThuVien = typeof import('@vladmandic/face-api');

export const DUONG_DAN_MO_HINH_KHUON_MAT = '/models/khuon-mat';
export const CHIEU_VECTOR_KHUON_MAT = 128;

let faceApiDaTai: FaceApiThuVien | null = null;
let tienTrinhTaiMoHinh: Promise<FaceApiThuVien> | null = null;

export interface HopGioiHanKhuonMat {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type KetQuaTrichXuatMotKhuonMat =
  | {
      hopLe: true;
      diemChatLuong: number;
      vector: number[];
      hopGioiHan: HopGioiHanKhuonMat;
      muiXTuongDoi: number;
      muiYTuongDoi: number;
      tyLeMoMat: number;
    }
  | {
      hopLe: false;
      maLoi: 'CHUA_SAN_SANG' | 'KHONG_CO_MAT' | 'NHIEU_KHUON_MAT' | 'CHAT_LUONG_THAP';
      thongDiep: string;
    };

export interface KetQuaPhatHienKhuonMat {
  vector: number[];
  diemChatLuong: number;
  hopGioiHan: HopGioiHanKhuonMat;
}

function khoangCachDiem(a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function tinhTyLeMoMatMotBen(diemMat: { x: number; y: number }[]): number {
  if (!diemMat || diemMat.length < 6) return 0.3;
  const doc1 = khoangCachDiem(diemMat[1], diemMat[5]);
  const doc2 = khoangCachDiem(diemMat[2], diemMat[4]);
  const ngang = khoangCachDiem(diemMat[0], diemMat[3]);
  if (ngang <= 1e-3) return 0.3;
  return (doc1 + doc2) / (2 * ngang);
}

/**
 * Tải mô hình nhận diện khuôn mặt cục bộ từ /models/khuon-mat (chạy 100% trên trình duyệt)
 */
export async function taiMoHinhNhanDienKhuonMat(): Promise<FaceApiThuVien> {
  if (typeof window === 'undefined') {
    throw new Error('Trình nhận diện khuôn mặt chỉ hoạt động trên trình duyệt.');
  }
  if (faceApiDaTai) return faceApiDaTai;

  if (!tienTrinhTaiMoHinh) {
    tienTrinhTaiMoHinh = (async () => {
      const faceapi = await import('@vladmandic/face-api');
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(DUONG_DAN_MO_HINH_KHUON_MAT),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(DUONG_DAN_MO_HINH_KHUON_MAT),
        faceapi.nets.faceRecognitionNet.loadFromUri(DUONG_DAN_MO_HINH_KHUON_MAT),
      ]);
      faceApiDaTai = faceapi;
      return faceapi;
    })().catch((loi) => {
      tienTrinhTaiMoHinh = null;
      throw loi;
    });
  }

  return tienTrinhTaiMoHinh;
}

/**
 * Chuẩn hóa vector đặc trưng về độ dài đơn vị L2
 */
export function chuanHoaVectorClient(vector: number[]): number[] {
  let tongBinhPhuong = 0;
  for (let i = 0; i < vector.length; i++) {
    tongBinhPhuong += vector[i] * vector[i];
  }
  const chuanL2 = Math.sqrt(tongBinhPhuong);
  if (chuanL2 < 1e-6) {
    return vector.map(() => 0);
  }
  return vector.map((v) => Number((v / chuanL2).toFixed(6)));
}

/**
 * Gộp trung bình nhiều khung hình chụp để tạo vector đại diện ổn định hơn và chuẩn hóa L2
 */
export function trungBinhVaChuanHoaVector(danhSachVector: number[][]): number[] {
  if (danhSachVector.length === 0) {
    throw new Error('Không có mẫu khuôn mặt để xử lý.');
  }
  const vectorTong = new Array<number>(CHIEU_VECTOR_KHUON_MAT).fill(0);
  for (const vec of danhSachVector) {
    for (let i = 0; i < CHIEU_VECTOR_KHUON_MAT; i++) {
      vectorTong[i] += vec[i] || 0;
    }
  }
  const vectorTrungBinh = vectorTong.map((v) => v / danhSachVector.length);
  return chuanHoaVectorClient(vectorTrungBinh);
}

/**
 * Tính khoảng cách Euclidean & độ tin cậy khớp [0..1] đồng bộ với công thức máy chủ
 */
export function tinhDoTuongDongClient(
  vectorA: number[],
  vectorB: number[],
): { khoangCach: number; doTuongDong: number } {
  const a = chuanHoaVectorClient(vectorA);
  const b = chuanHoaVectorClient(vectorB);
  let tongBinhPhuongHieu = 0;
  for (let i = 0; i < CHIEU_VECTOR_KHUON_MAT; i++) {
    const hieu = a[i] - b[i];
    tongBinhPhuongHieu += hieu * hieu;
  }
  const khoangCach = Math.sqrt(tongBinhPhuongHieu);
  const doTuongDong = Math.max(0, Math.min(1, Number((1 - khoangCach * 0.5).toFixed(4))));
  return {
    khoangCach: Number(khoangCach.toFixed(4)),
    doTuongDong,
  };
}

/**
 * Phát hiện đúng 1 khuôn mặt rõ nét kèm tọa độ mũi & độ mở mắt để xác thực người thật
 */
export async function trichXuatMotKhuonMat(
  videoEl: HTMLVideoElement,
): Promise<KetQuaTrichXuatMotKhuonMat> {
  if (!videoEl || videoEl.readyState < 2 || videoEl.videoWidth === 0) {
    return {
      hopLe: false,
      maLoi: 'CHUA_SAN_SANG',
      thongDiep: 'Đang chờ tín hiệu hình ảnh từ camera.',
    };
  }

  const faceapi = await taiMoHinhNhanDienKhuonMat();
  const phatHien = await faceapi
    .detectAllFaces(
      videoEl,
      new faceapi.TinyFaceDetectorOptions({
        inputSize: 320,
        scoreThreshold: 0.55,
      }),
    )
    .withFaceLandmarks(true)
    .withFaceDescriptors();

  if (phatHien.length === 0) {
    return {
      hopLe: false,
      maLoi: 'KHONG_CO_MAT',
      thongDiep: 'Chưa thấy khuôn mặt. Vui lòng nhìn thẳng vào khung hình.',
    };
  }

  if (phatHien.length > 1) {
    return {
      hopLe: false,
      maLoi: 'NHIEU_KHUON_MAT',
      thongDiep: 'Phát hiện nhiều hơn một khuôn mặt trong khung hình. Vui lòng chỉ để một người thực hiện.',
    };
  }

  const ketQua = phatHien[0];
  const box = ketQua.detection.box;
  const diemChatLuong = Number(ketQua.detection.score.toFixed(4));

  if (diemChatLuong < 0.65 || box.width < 70 || box.height < 70) {
    return {
      hopLe: false,
      maLoi: 'CHAT_LUONG_THAP',
      thongDiep: 'Khuôn mặt còn hơi mờ hoặc quá xa camera. Vui lòng tiến gần hơn và giữ đủ sáng.',
    };
  }

  const mui = ketQua.landmarks.getNose();
  const dinhMui = mui[3] || mui[0] || { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const muiXTuongDoi = (dinhMui.x - box.x) / Math.max(1, box.width);
  const muiYTuongDoi = (dinhMui.y - box.y) / Math.max(1, box.height);

  const earTrai = tinhTyLeMoMatMotBen(ketQua.landmarks.getLeftEye());
  const earPhai = tinhTyLeMoMatMotBen(ketQua.landmarks.getRightEye());
  const tyLeMoMat = (earTrai + earPhai) / 2;

  return {
    hopLe: true,
    diemChatLuong,
    vector: chuanHoaVectorClient(Array.from(ketQua.descriptor)),
    hopGioiHan: {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
    },
    muiXTuongDoi,
    muiYTuongDoi,
    tyLeMoMat,
  };
}

/**
 * Phát hiện đồng thời nhiều khuôn mặt trong khung hình camera lớp học
 */
export async function trichXuatNhieuKhuonMat(
  videoEl: HTMLVideoElement,
): Promise<KetQuaPhatHienKhuonMat[]> {
  if (!videoEl || videoEl.readyState < 2 || videoEl.videoWidth === 0) {
    return [];
  }

  const faceapi = await taiMoHinhNhanDienKhuonMat();
  const phatHien = await faceapi
    .detectAllFaces(
      videoEl,
      new faceapi.TinyFaceDetectorOptions({
        inputSize: 416,
        scoreThreshold: 0.5,
      }),
    )
    .withFaceLandmarks(true)
    .withFaceDescriptors();

  return phatHien
    .filter((item) => item.detection.score >= 0.55)
    .map((item) => ({
      vector: chuanHoaVectorClient(Array.from(item.descriptor)),
      diemChatLuong: Number(item.detection.score.toFixed(4)),
      hopGioiHan: {
        x: item.detection.box.x,
        y: item.detection.box.y,
        width: item.detection.box.width,
        height: item.detection.box.height,
      },
    }));
}
