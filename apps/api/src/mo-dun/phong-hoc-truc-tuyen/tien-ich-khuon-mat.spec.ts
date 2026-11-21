import { BadRequestException } from '@nestjs/common';
import {
  CHIEU_VECTOR_KHUON_MAT,
  chuanHoaVectorKhuonMat,
  doiSoatVectorKhuonMat,
} from './tien-ich-khuon-mat';

function taoVectorDonVi(gocIndex = 0, nhieu = 0): number[] {
  const vec = new Array<number>(CHIEU_VECTOR_KHUON_MAT).fill(0);
  vec[gocIndex] = 1;
  if (nhieu !== 0) {
    vec[(gocIndex + 1) % CHIEU_VECTOR_KHUON_MAT] = nhieu;
  }
  return chuanHoaVectorKhuonMat(vec);
}

describe('tien-ich-khuon-mat (Chuẩn hóa L2 & Đối soát vector đặc trưng 128 chiều)', () => {
  it('chuanHoaVectorKhuonMat chuẩn hóa vector bất kỳ về độ dài đơn vị ≈ 1', () => {
    const tho = new Array<number>(CHIEU_VECTOR_KHUON_MAT).fill(2);
    const chuan = chuanHoaVectorKhuonMat(tho);

    const tongBinhPhuong = chuan.reduce((acc, v) => acc + v * v, 0);
    expect(chuan).toHaveLength(CHIEU_VECTOR_KHUON_MAT);
    expect(Math.sqrt(tongBinhPhuong)).toBeCloseTo(1, 4);
  });

  it('chuanHoaVectorKhuonMat từ chối vector sai số chiều, chứa NaN hoặc toàn số 0', () => {
    expect(() => chuanHoaVectorKhuonMat([0.1, 0.2])).toThrow(BadRequestException);

    const vectorKhong = new Array<number>(CHIEU_VECTOR_KHUON_MAT).fill(0);
    expect(() => chuanHoaVectorKhuonMat(vectorKhong)).toThrow(BadRequestException);

    const vectorNaN = new Array<number>(CHIEU_VECTOR_KHUON_MAT).fill(0.5);
    vectorNaN[5] = Number.NaN;
    expect(() => chuanHoaVectorKhuonMat(vectorNaN)).toThrow(BadRequestException);
  });

  it('doiSoatVectorKhuonMat trả độ tin cậy cao cho cùng khuôn mặt và thấp cho người khác', () => {
    const mauGoc = taoVectorDonVi(0);
    const mauCungNguoi = taoVectorDonVi(0, 0.15);
    const mauNguoiKhac = taoVectorDonVi(3);

    const ketQuaKhop = doiSoatVectorKhuonMat(mauCungNguoi, mauGoc);
    expect(ketQuaKhop.khoangCach).toBeLessThan(0.2);
    expect(ketQuaKhop.doTuongDong).toBeGreaterThan(0.9);
    expect(ketQuaKhop.doTuongDongCosine).toBeGreaterThan(0.95);

    const ketQuaKhongKhop = doiSoatVectorKhuonMat(mauNguoiKhac, mauGoc);
    expect(ketQuaKhongKhop.khoangCach).toBeCloseTo(Math.SQRT2, 3);
    expect(ketQuaKhongKhop.doTuongDong).toBeLessThan(0.35);
    expect(ketQuaKhongKhop.doTuongDongCosine).toBeCloseTo(0, 3);
  });
});
