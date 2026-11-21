import { BadRequestException } from '@nestjs/common';

export const CHIEU_VECTOR_KHUON_MAT = 128;

/**
 * Chuẩn hóa vector đặc trưng khuôn mặt 128 chiều về độ dài đơn vị L2 (Unit Norm).
 * Chặn vector rỗng, NaN, Infinity hoặc vector toàn số 0.
 */
export function chuanHoaVectorKhuonMat(vector: number[]): number[] {
  if (!Array.isArray(vector) || vector.length !== CHIEU_VECTOR_KHUON_MAT) {
    throw new BadRequestException({
      thanhCong: false,
      thongDiep: `Vector khuôn mặt phải có đúng ${CHIEU_VECTOR_KHUON_MAT} phần tử.`,
    });
  }

  let tongBinhPhuong = 0;
  for (let i = 0; i < vector.length; i++) {
    const val = vector[i];
    if (typeof val !== 'number' || !Number.isFinite(val)) {
      throw new BadRequestException({
        thanhCong: false,
        thongDiep: 'Vector đặc trưng khuôn mặt chứa giá trị không hợp lệ.',
      });
    }
    tongBinhPhuong += val * val;
  }

  const chuanL2 = Math.sqrt(tongBinhPhuong);
  if (chuanL2 < 1e-6) {
    throw new BadRequestException({
      thanhCong: false,
      thongDiep: 'Không phát hiện được đặc trưng khuôn mặt hợp lệ từ ảnh chụp.',
    });
  }

  return vector.map((v) => Number((v / chuanL2).toFixed(6)));
}

/**
 * Tính khoảng cách Euclidean và độ tương đồng Cosine giữa 2 vector đã chuẩn hóa L2.
 * Với face-api 128-D đã chuẩn hóa L2:
 *  - Khoảng cách Euclidean <= 0.48 tương đương Cosine similarity >= ~0.88.
 *  - Ta quy đổi độ tương đồng chuẩn hóa về thang [0..1] nhất quán với Euclidean:
 *    doTuongDong = max(0, min(1, 1 - khoangCach / 1.41421356)) hoặc (1 + cosine) / 2.
 */
export function doiSoatVectorKhuonMat(
  vectorA: number[],
  vectorB: number[],
): {
  khoangCach: number;
  doTuongDongCosine: number;
  doTuongDong: number;
} {
  const a = chuanHoaVectorKhuonMat(vectorA);
  const b = chuanHoaVectorKhuonMat(vectorB);

  let tongBinhPhuongHieu = 0;
  let tichVoHuong = 0;
  for (let i = 0; i < CHIEU_VECTOR_KHUON_MAT; i++) {
    const hieu = a[i] - b[i];
    tongBinhPhuongHieu += hieu * hieu;
    tichVoHuong += a[i] * b[i];
  }

  const khoangCach = Math.sqrt(tongBinhPhuongHieu);
  const doTuongDongCosine = Math.max(-1, Math.min(1, tichVoHuong));
  // Quy đổi trực quan từ khoảng cách L2 trên mặt cầu đơn vị sang điểm tin cậy 0..1
  // Khi khoangCach = 0 -> 1.0; khoangCach = 0.45 -> ~0.775; khoangCach >= 1.0 -> <= 0.50
  const doTuongDong = Math.max(0, Math.min(1, Number((1 - khoangCach * 0.5).toFixed(4))));

  return {
    khoangCach: Number(khoangCach.toFixed(4)),
    doTuongDongCosine: Number(doTuongDongCosine.toFixed(4)),
    doTuongDong,
  };
}
