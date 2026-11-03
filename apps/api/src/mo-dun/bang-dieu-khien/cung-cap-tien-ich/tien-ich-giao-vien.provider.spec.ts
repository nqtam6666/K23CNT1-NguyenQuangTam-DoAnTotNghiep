import { VaiTro, PayloadJwt, CanhBaoSinhVien, HangChoXuLyGiangVien, BuoiHocHomNay } from '@lms/chung';
import { TienIchGiaoVienProvider } from './tien-ich-giao-vien.provider';

const ID_LOP = 'lop-1';
const qua = (ngay: number) => new Date(Date.now() - ngay * 86400000);
const toi = (ngay: number) => new Date(Date.now() + ngay * 86400000);

function taoPrismaGia(tuyChon: { coHoSo?: boolean } = {}) {
  const hoSo = {
    id: 'gv-1',
    cacLopGiangDay: [{ id: ID_LOP, maLopHocPhan: 'LHP-PY101-01', tenLopHocPhan: 'Python', _count: { danhSachGhiDanh: 3 } }],
  };
  return {
    hoSoGiaoVien: { findUnique: jest.fn().mockResolvedValue(tuyChon.coHoSo === false ? null : hoSo) },
    buoiHoc: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'buoi-1',
          idLopHocPhan: ID_LOP,
          chuDe: 'Vòng lặp',
          thoiGianBD: new Date(Date.now() - 600000),
          thoiGianKT: new Date(Date.now() + 3600000),
          trangThai: 'DANG_DIEN_RA',
          maDiemDanh: '482913',
          hanMaDiemDanh: new Date(Date.now() + 240000),
          banGhiDiemDanh: [{ trangThai: 'CO_MAT' }, { trangThai: 'VANG_KHONG_PHEP' }],
        },
      ]),
    },
    baiTap: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'bt-1',
          idLopHocPhan: ID_LOP,
          tieuDe: 'Bài 1',
          hanNop: qua(3),
          diemToiDa: 10,
          cacBaiNop: [
            { idNguoiDung: 'nd-a', trangThai: 'DA_NOP', diemSo: null },
            { idNguoiDung: 'nd-c', trangThai: 'DA_CHAM', diemSo: 3 },
          ],
        },
        {
          id: 'bt-2',
          idLopHocPhan: ID_LOP,
          tieuDe: 'Bài 2',
          hanNop: qua(1),
          diemToiDa: 10,
          cacBaiNop: [{ idNguoiDung: 'nd-c', trangThai: 'DA_CHAM', diemSo: 4 }],
        },
        { id: 'bt-3', idLopHocPhan: ID_LOP, tieuDe: 'Bài 3', hanNop: toi(5), diemToiDa: 10, cacBaiNop: [] },
      ]),
    },
    banGhiDiemDanh: {
      findMany: jest.fn().mockResolvedValue([
        // Sinh viên A vắng không phép 3 buổi -> mức CAO
        ...[1, 2, 3].map(() => ({ idHocSinh: 'hs-a', trangThai: 'VANG_KHONG_PHEP', buoiHoc: { idLopHocPhan: ID_LOP } })),
        { idHocSinh: 'hs-b', trangThai: 'CO_MAT', buoiHoc: { idLopHocPhan: ID_LOP } },
        { idHocSinh: 'hs-c', trangThai: 'CO_MAT', buoiHoc: { idLopHocPhan: ID_LOP } },
      ]),
    },
    ghiDanh: {
      findMany: jest.fn().mockResolvedValue([
        { idLopHocPhan: ID_LOP, hocSinh: { id: 'hs-a', nguoiDung: { id: 'nd-a', hoTen: 'Sinh viên A' } } },
        // Sinh viên B chưa nộp 2 bài quá hạn -> mức VỪA
        { idLopHocPhan: ID_LOP, hocSinh: { id: 'hs-b', nguoiDung: { id: 'nd-b', hoTen: 'Sinh viên B' } } },
        // Sinh viên C đã nộp đủ nhưng điểm trung bình 3.5 -> mức THẤP
        { idLopHocPhan: ID_LOP, hocSinh: { id: 'hs-c', nguoiDung: { id: 'nd-c', hoTen: 'Sinh viên C' } } },
      ]),
    },
    donXinNghi: {
      findMany: jest.fn().mockResolvedValue([
        { id: 'don-1', lyDo: 'Ốm', nguoiGui: { hoTen: 'Sinh viên B' }, buoiHoc: { thoiGianBD: toi(1), idLopHocPhan: ID_LOP } },
      ]),
      count: jest.fn().mockResolvedValue(1),
    },
    banNhapAI: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
  };
}

const giangVien = { id: 'nd-gv', sub: 'nd-gv', vaiTro: VaiTro.GIAO_VIEN } as unknown as PayloadJwt;
const lay = <T>(ketQua: { id: string; duLieu: unknown }[], id: string) => ketQua.find((t) => t.id === id)?.duLieu as T;

describe('TienIchGiaoVienProvider', () => {
  it('chỉ phục vụ vai trò giảng viên', () => {
    const provider = new TienIchGiaoVienProvider(taoPrismaGia() as never);
    expect(provider.vaiTroPhuHop(VaiTro.GIAO_VIEN)).toBe(true);
    expect(provider.vaiTroPhuHop(VaiTro.HOC_SINH)).toBe(false);
    expect(provider.vaiTroPhuHop(VaiTro.QUAN_TRI_VIEN)).toBe(false);
  });

  it('trả về mảng rỗng khi không có hồ sơ giảng viên', async () => {
    const provider = new TienIchGiaoVienProvider(taoPrismaGia({ coHoSo: false }) as never);
    await expect(provider.cungCapTienIch(giangVien)).resolves.toEqual([]);
  });

  it('chỉ truy vấn dữ liệu trong các lớp giảng viên phụ trách', async () => {
    const prisma = taoPrismaGia();
    await new TienIchGiaoVienProvider(prisma as never).cungCapTienIch(giangVien);
    expect(prisma.buoiHoc.findMany.mock.calls[0][0].where.idLopHocPhan).toEqual({ in: [ID_LOP] });
    expect(prisma.baiTap.findMany.mock.calls[0][0].where.idLopHocPhan).toEqual({ in: [ID_LOP] });
    expect(prisma.ghiDanh.findMany.mock.calls[0][0].where.idLopHocPhan).toEqual({ in: [ID_LOP] });
    expect(prisma.banNhapAI.findMany.mock.calls[0][0].where.idGiaoVien).toBe('gv-1');
  });

  it('xếp cảnh báo sớm theo mức độ: cao, vừa, thấp', async () => {
    const ketQua = await new TienIchGiaoVienProvider(taoPrismaGia() as never).cungCapTienIch(giangVien);
    const canhBao = lay<CanhBaoSinhVien[]>(ketQua, 'canh-bao-som');
    expect(canhBao.map((c) => [c.hoTen, c.mucDo])).toEqual([
      ['Sinh viên A', 'CAO'],
      ['Sinh viên B', 'VUA'],
      ['Sinh viên C', 'THAP'],
    ]);
    expect(canhBao[0].lyDo).toContain('Vắng không phép 3 buổi');
    expect(canhBao[1].lyDo).toContain('Chưa nộp 2 bài tập');
  });

  it('hàng chờ chỉ gồm bài tập còn bài nộp chờ chấm', async () => {
    const ketQua = await new TienIchGiaoVienProvider(taoPrismaGia() as never).cungCapTienIch(giangVien);
    const hangCho = lay<HangChoXuLyGiangVien>(ketQua, 'hang-cho-xu-ly');
    expect(hangCho.chamBai).toEqual([expect.objectContaining({ idBaiTap: 'bt-1', soChoCham: 1 })]);
    expect(hangCho.donXinNghi).toHaveLength(1);
    expect(hangCho.banNhap).toHaveLength(0);
  });

  it('chỉ trả mã điểm danh khi mã còn hiệu lực, kèm số có mặt và sĩ số', async () => {
    const ketQua = await new TienIchGiaoVienProvider(taoPrismaGia() as never).cungCapTienIch(giangVien);
    const [buoi] = lay<BuoiHocHomNay[]>(ketQua, 'lich-hom-nay');
    expect(buoi.maDiemDanh).toBe('482913');
    expect(buoi.soCoMat).toBe(1);
    expect(buoi.siSo).toBe(3);
  });

  it('ẩn mã điểm danh đã hết hạn', async () => {
    const prisma = taoPrismaGia();
    prisma.buoiHoc.findMany.mockResolvedValue([
      {
        id: 'buoi-2', idLopHocPhan: ID_LOP, chuDe: 'Cũ', thoiGianBD: qua(1), thoiGianKT: qua(1),
        trangThai: 'DA_KET_THUC', maDiemDanh: '111111', hanMaDiemDanh: qua(1), banGhiDiemDanh: [],
      },
    ]);
    const ketQua = await new TienIchGiaoVienProvider(prisma as never).cungCapTienIch(giangVien);
    expect(lay<BuoiHocHomNay[]>(ketQua, 'lich-hom-nay')[0].maDiemDanh).toBeNull();
  });
});
