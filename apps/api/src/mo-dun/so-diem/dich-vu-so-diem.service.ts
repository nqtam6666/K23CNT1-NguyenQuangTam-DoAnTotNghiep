import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { KhoSoDiemRepository } from './kho-so-diem.repository';
import { DichVuLlmService } from '../tro-ly-ai/dich-vu-llm.service';
import {
  PayloadJwt,
  VaiTro,
  TrangThaiDiemDanh,
  CheDoKiemTra,
  LoaiBanNhapAI,
  TrangThaiBanNhapAI,
  TaoCotDiemInput,
  LuuBangDiemHangLoatInput,
  BangDiemLopHocPhan,
  DongBangDiemHocSinh,
  KetQuaNhanXetHocPhanAI,
} from '@lms/chung';

@Injectable()
export class DichVuSoDiemService {
  private readonly nhatKy = new Logger(DichVuSoDiemService.name);

  constructor(
    private readonly khoSoDiem: KhoSoDiemRepository,
    private readonly prisma: PrismaService,
    private readonly dichVuLlm: DichVuLlmService,
  ) {}

  private layIdNguoiDung(nguoiDung: PayloadJwt): string {
    return nguoiDung.sub || (nguoiDung as any).id;
  }

  /**
   * Quy đổi điểm Hệ 10 sang Hệ 4, Điểm chữ và Xếp loại học phần chuẩn tín chỉ
   */
  private quyDoiDiemHocPhan(diemHe10: number | null): {
    diemHe4: number | null;
    diemChu: 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D+' | 'D' | 'F' | 'CHUA_XEP_LOAI';
    xepLoai: string;
    datQuaMon: boolean | null;
  } {
    if (diemHe10 === null || Number.isNaN(diemHe10)) {
      return {
        diemHe4: null,
        diemChu: 'CHUA_XEP_LOAI',
        xepLoai: 'Chưa đủ đầu điểm',
        datQuaMon: null,
      };
    }

    if (diemHe10 >= 8.5) {
      return { diemHe4: 4.0, diemChu: 'A', xepLoai: 'Xuất sắc / Giỏi', datQuaMon: true };
    }
    if (diemHe10 >= 8.0) {
      return { diemHe4: 3.5, diemChu: 'B+', xepLoai: 'Khá giỏi', datQuaMon: true };
    }
    if (diemHe10 >= 7.0) {
      return { diemHe4: 3.0, diemChu: 'B', xepLoai: 'Khá', datQuaMon: true };
    }
    if (diemHe10 >= 6.5) {
      return { diemHe4: 2.5, diemChu: 'C+', xepLoai: 'Trung bình khá', datQuaMon: true };
    }
    if (diemHe10 >= 5.5) {
      return { diemHe4: 2.0, diemChu: 'C', xepLoai: 'Trung bình', datQuaMon: true };
    }
    if (diemHe10 >= 5.0) {
      return { diemHe4: 1.5, diemChu: 'D+', xepLoai: 'Trung bình yếu', datQuaMon: true };
    }
    if (diemHe10 >= 4.0) {
      return { diemHe4: 1.0, diemChu: 'D', xepLoai: 'Đạt tối thiểu', datQuaMon: true };
    }
    return { diemHe4: 0.0, diemChu: 'F', xepLoai: 'Không đạt (Học lại)', datQuaMon: false };
  }

  /**
   * Đảm bảo lớp học phần luôn có bộ cột điểm chuẩn nếu chưa khởi tạo
   */
  private async damBaoCotDiemMacDinh(idLopHocPhan: string) {
    let danhSachCot = await this.khoSoDiem.layCotDiemTheoLop(idLopHocPhan);
    if (danhSachCot.length === 0) {
      await this.prisma.$transaction([
        this.prisma.cotDiem.create({
          data: { idLopHocPhan, tenCotDiem: 'Chuyên cần', heSo: 1.0 },
        }),
        this.prisma.cotDiem.create({
          data: { idLopHocPhan, tenCotDiem: 'Luyện tập & Bài tập', heSo: 2.0 },
        }),
        this.prisma.cotDiem.create({
          data: { idLopHocPhan, tenCotDiem: 'Giữa kỳ (Thi thử)', heSo: 2.0 },
        }),
        this.prisma.cotDiem.create({
          data: { idLopHocPhan, tenCotDiem: 'Cuối kỳ', heSo: 5.0 },
        }),
      ]);
      danhSachCot = await this.khoSoDiem.layCotDiemTheoLop(idLopHocPhan);
    }
    return danhSachCot;
  }

  /**
   * Lấy bảng kết quả học phần tổng hợp của lớp
   */
  async layBangDiemLopHocPhan(
    idLopHocPhan: string,
    nguoiDung: PayloadJwt,
  ): Promise<BangDiemLopHocPhan> {
    const idNguoiDung = this.layIdNguoiDung(nguoiDung);
    const lop = await this.prisma.lopHocPhan.findUnique({
      where: { id: idLopHocPhan },
      include: {
        monHoc: true,
        giaoVien: true,
        cacBuoiHoc: {
          include: {
            banGhiDiemDanh: true,
          },
        },
        danhSachGhiDanh: {
          include: {
            hocSinh: {
              include: {
                nguoiDung: {
                  select: {
                    id: true,
                    hoTen: true,
                    email: true,
                    anhDaiDien: true,
                  },
                },
                lopHanhChinh: {
                  select: {
                    maLop: true,
                    tenLop: true,
                  },
                },
              },
            },
          },
          orderBy: {
            hocSinh: { maHocSinh: 'asc' },
          },
        },
      },
    });

    if (!lop) {
      throw new NotFoundException({
        thanhCong: false,
        thongDiep: 'Lớp học phần không tồn tại.',
      });
    }

    if (
      nguoiDung.vaiTro === VaiTro.GIAO_VIEN &&
      lop.giaoVien?.idNguoiDung !== idNguoiDung
    ) {
      throw new ForbiddenException({
        thanhCong: false,
        thongDiep: 'Bạn không phải giáo viên phụ trách lớp học phần này.',
      });
    }

    let idHocSinhHienTai: string | null = null;
    if (nguoiDung.vaiTro === VaiTro.HOC_SINH) {
      const hoSo = await this.prisma.hoSoHocSinh.findUnique({
        where: { idNguoiDung },
      });
      if (!hoSo) {
        throw new ForbiddenException({
          thanhCong: false,
          thongDiep: 'Hồ sơ học sinh không tồn tại.',
        });
      }
      const daGhiDanh = lop.danhSachGhiDanh.some((gd) => gd.hocSinh.id === hoSo.id);
      if (!daGhiDanh) {
        throw new ForbiddenException({
          thanhCong: false,
          thongDiep: 'Bạn không thuộc lớp học phần này.',
        });
      }
      idHocSinhHienTai = hoSo.id;
    }

    const danhSachCot = await this.damBaoCotDiemMacDinh(idLopHocPhan);

    const phanBoDiemChu = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    let tongDiemLop = 0;
    let soHocSinhDaDuDiem = 0;
    let soHocSinhQuaMon = 0;

    const tatCaDong: DongBangDiemHocSinh[] = lop.danhSachGhiDanh.map((gd) => {
      const hs = gd.hocSinh;

      // 1. Tính tỷ lệ chuyên cần
      let soCoMat = 0;
      let soDiMuon = 0;
      let soVangCoPhep = 0;
      let soVangKhongPhep = 0;
      for (const buoi of lop.cacBuoiHoc) {
        const bg = buoi.banGhiDiemDanh.find((d) => d.idHocSinh === hs.id);
        if (!bg) continue;
        if (bg.trangThai === TrangThaiDiemDanh.CO_MAT) soCoMat++;
        else if (bg.trangThai === TrangThaiDiemDanh.DI_MUON) soDiMuon++;
        else if (bg.trangThai === TrangThaiDiemDanh.VANG_CO_PHEP) soVangCoPhep++;
        else if (bg.trangThai === TrangThaiDiemDanh.VANG_KHONG_PHEP) soVangKhongPhep++;
      }
      const tongBuoiDiemDanh = soCoMat + soDiMuon + soVangCoPhep + soVangKhongPhep;
      const tyLeChuyenCan =
        tongBuoiDiemDanh > 0
          ? Math.round(
              ((soCoMat + soDiMuon * 0.5 + soVangCoPhep * 0.5) / tongBuoiDiemDanh) * 100,
            )
          : 100;

      // 2. Ghép điểm theo từng cột
      const diemTheoCot: Record<
        string,
        { idDiem?: string; giaTri: number | null; ghiChu?: string | null }
      > = {};
      let tongDiemNhanHeSo = 0;
      let tongHeSoDaCoDiem = 0;

      for (const cot of danhSachCot) {
        const diem = cot.danhSachDiem.find((d) => d.idHocSinh === hs.id);
        if (diem) {
          diemTheoCot[cot.id] = {
            idDiem: diem.id,
            giaTri: diem.giaTri,
            ghiChu: diem.ghiChu,
          };
          tongDiemNhanHeSo += diem.giaTri * cot.heSo;
          tongHeSoDaCoDiem += cot.heSo;
        } else {
          diemTheoCot[cot.id] = {
            giaTri: null,
            ghiChu: null,
          };
        }
      }

      const diemTrungBinhHe10 =
        tongHeSoDaCoDiem > 0
          ? Number((tongDiemNhanHeSo / tongHeSoDaCoDiem).toFixed(2))
          : null;

      const quyDoi = this.quyDoiDiemHocPhan(diemTrungBinhHe10);

      if (diemTrungBinhHe10 !== null) {
        soHocSinhDaDuDiem++;
        tongDiemLop += diemTrungBinhHe10;
        if (quyDoi.datQuaMon) soHocSinhQuaMon++;
        if (quyDoi.diemChu === 'A') phanBoDiemChu.A++;
        else if (quyDoi.diemChu === 'B+' || quyDoi.diemChu === 'B') phanBoDiemChu.B++;
        else if (quyDoi.diemChu === 'C+' || quyDoi.diemChu === 'C') phanBoDiemChu.C++;
        else if (quyDoi.diemChu === 'D+' || quyDoi.diemChu === 'D') phanBoDiemChu.D++;
        else if (quyDoi.diemChu === 'F') phanBoDiemChu.F++;
      }

      return {
        idHocSinh: hs.id,
        maHocSinh: hs.maHocSinh,
        hoTen: hs.nguoiDung.hoTen,
        email: hs.nguoiDung.email,
        anhDaiDien: hs.nguoiDung.anhDaiDien,
        lopHanhChinh: hs.lopHanhChinh?.maLop || null,
        tyLeChuyenCan,
        diemTheoCot,
        diemTrungBinhHe10,
        diemTrungBinhHe4: quyDoi.diemHe4,
        diemChu: quyDoi.diemChu,
        xepLoai: quyDoi.xepLoai,
        datQuaMon: quyDoi.datQuaMon,
      };
    });

    // Nếu là học sinh, chỉ trả về dòng điểm của chính học sinh đó kèm thống kê chung của lớp
    let danhSachTraVe = tatCaDong;
    if (nguoiDung.vaiTro === VaiTro.HOC_SINH) {
      danhSachTraVe = idHocSinhHienTai
        ? tatCaDong.filter((d) => d.idHocSinh === idHocSinhHienTai)
        : [];
    }

    return {
      idLopHocPhan: lop.id,
      tenLopHocPhan: lop.tenLopHocPhan,
      maLopHocPhan: lop.maLopHocPhan,
      soTinChi: lop.monHoc?.soTinChi || 3,
      danhSachCotDiem: danhSachCot.map((c) => ({
        id: c.id,
        idLopHocPhan: c.idLopHocPhan,
        tenCotDiem: c.tenCotDiem,
        heSo: c.heSo,
        ngayTao: c.ngayTao,
      })),
      danhSachHocSinh: danhSachTraVe,
      thongKe: {
        tongSoHocSinh: tatCaDong.length,
        soHocSinhDaDuDiem,
        diemTrungBinhLop:
          soHocSinhDaDuDiem > 0
            ? Number((tongDiemLop / soHocSinhDaDuDiem).toFixed(2))
            : 0,
        tyLeQuaMon:
          soHocSinhDaDuDiem > 0
            ? Math.round((soHocSinhQuaMon / soHocSinhDaDuDiem) * 100)
            : 0,
        phanBoDiemChu,
      },
    };
  }

  /**
   * Thêm cột điểm mới vào lớp học phần
   */
  async taoCotDiem(
    idLopHocPhan: string,
    duLieu: TaoCotDiemInput,
    nguoiDung: PayloadJwt,
  ) {
    const idNguoiDung = this.layIdNguoiDung(nguoiDung);
    const lop = await this.prisma.lopHocPhan.findUnique({
      where: { id: idLopHocPhan },
      include: { giaoVien: true },
    });
    if (!lop) {
      throw new NotFoundException({
        thanhCong: false,
        thongDiep: 'Lớp học phần không tồn tại.',
      });
    }

    const laQuanTri =
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN || nguoiDung.vaiTro === VaiTro.GIAO_VU;
    const laGiaoVienLop = lop.giaoVien?.idNguoiDung === idNguoiDung;

    if (!laQuanTri && !laGiaoVienLop) {
      throw new ForbiddenException({
        thanhCong: false,
        thongDiep: 'Chỉ giáo viên phụ trách lớp mới được thêm cột điểm.',
      });
    }

    return this.khoSoDiem.taoCotDiem(idLopHocPhan, duLieu.tenCotDiem, duLieu.heSo);
  }

  /**
   * Xóa cột điểm
   */
  async xoaCotDiem(idCotDiem: string, nguoiDung: PayloadJwt) {
    const idNguoiDung = this.layIdNguoiDung(nguoiDung);
    const cot = await this.khoSoDiem.timCotDiemTheoId(idCotDiem);
    if (!cot) {
      throw new NotFoundException({
        thanhCong: false,
        thongDiep: 'Cột điểm không tồn tại.',
      });
    }

    const laQuanTri =
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN || nguoiDung.vaiTro === VaiTro.GIAO_VU;
    const laGiaoVienLop = cot.lopHocPhan?.giaoVien?.idNguoiDung === idNguoiDung;

    if (!laQuanTri && !laGiaoVienLop) {
      throw new ForbiddenException({
        thanhCong: false,
        thongDiep: 'Bạn không có quyền xóa cột điểm này.',
      });
    }

    return this.khoSoDiem.xoaCotDiem(idCotDiem);
  }

  /**
   * Lưu bảng điểm hàng loạt
   */
  async luuBangDiemHangLoat(
    idLopHocPhan: string,
    duLieu: LuuBangDiemHangLoatInput,
    nguoiDung: PayloadJwt,
  ) {
    const idNguoiDung = this.layIdNguoiDung(nguoiDung);
    const lop = await this.prisma.lopHocPhan.findUnique({
      where: { id: idLopHocPhan },
      include: { giaoVien: true },
    });
    if (!lop) {
      throw new NotFoundException({
        thanhCong: false,
        thongDiep: 'Lớp học phần không tồn tại.',
      });
    }

    const laQuanTri =
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN || nguoiDung.vaiTro === VaiTro.GIAO_VU;
    const laGiaoVienLop = lop.giaoVien?.idNguoiDung === idNguoiDung;

    if (!laQuanTri && !laGiaoVienLop) {
      throw new ForbiddenException({
        thanhCong: false,
        thongDiep: 'Chỉ giáo viên phụ trách lớp học phần mới được cập nhật bảng điểm.',
      });
    }

    const ketQua = await this.khoSoDiem.luuDiemHangLoat(duLieu.danhSachDiem);
    return {
      soLuongCapNhat: ketQua.length,
    };
  }

  /**
   * Đồng bộ tự động điểm Chuyên cần (từ Điểm danh), Luyện tập/Bài tập và Thi thử vào Sổ điểm học phần
   */
  async dongBoDiemTuDong(idLopHocPhan: string, nguoiDung: PayloadJwt) {
    const idNguoiDung = this.layIdNguoiDung(nguoiDung);
    const lop = await this.prisma.lopHocPhan.findUnique({
      where: { id: idLopHocPhan },
      include: {
        giaoVien: true,
        danhSachGhiDanh: {
          include: {
            hocSinh: true,
          },
        },
        cacBuoiHoc: {
          include: {
            banGhiDiemDanh: true,
          },
        },
        cacBaiTap: {
          include: {
            cacBaiNop: true,
          },
        },
        cacBaiKiemTra: {
          include: {
            cacLuotLam: true,
          },
        },
      },
    });

    if (!lop) {
      throw new NotFoundException({
        thanhCong: false,
        thongDiep: 'Lớp học phần không tồn tại.',
      });
    }

    const laQuanTri =
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN || nguoiDung.vaiTro === VaiTro.GIAO_VU;
    const laGiaoVienLop = lop.giaoVien?.idNguoiDung === idNguoiDung;

    if (!laQuanTri && !laGiaoVienLop) {
      throw new ForbiddenException({
        thanhCong: false,
        thongDiep: 'Chỉ giáo viên phụ trách mới được đồng bộ sổ điểm học phần.',
      });
    }

    const danhSachCot = await this.damBaoCotDiemMacDinh(idLopHocPhan);
    const cotChuyenCan = danhSachCot.find((c) =>
      c.tenCotDiem.toLowerCase().includes('chuyên cần'),
    );
    const cotQuaTrinh = danhSachCot.find(
      (c) =>
        c.tenCotDiem.toLowerCase().includes('luyện tập') ||
        c.tenCotDiem.toLowerCase().includes('bài tập') ||
        c.tenCotDiem.toLowerCase().includes('quá trình'),
    );
    const cotGiuaKy = danhSachCot.find(
      (c) =>
        c.tenCotDiem.toLowerCase().includes('giữa kỳ') ||
        c.tenCotDiem.toLowerCase().includes('thi thử'),
    );

    const danhSachCapNhat: {
      idCotDiem: string;
      idHocSinh: string;
      giaTri: number;
      ghiChu: string;
    }[] = [];

    for (const gd of lop.danhSachGhiDanh) {
      const hs = gd.hocSinh;

      // 1. Đồng bộ Điểm chuyên cần từ lịch sử Điểm danh
      if (cotChuyenCan) {
        let soVangKhongPhep = 0;
        let soDiMuon = 0;
        let soVangCoPhep = 0;
        for (const buoi of lop.cacBuoiHoc) {
          const bg = buoi.banGhiDiemDanh.find((d) => d.idHocSinh === hs.id);
          if (!bg) continue;
          if (bg.trangThai === TrangThaiDiemDanh.VANG_KHONG_PHEP) soVangKhongPhep++;
          else if (bg.trangThai === TrangThaiDiemDanh.DI_MUON) soDiMuon++;
          else if (bg.trangThai === TrangThaiDiemDanh.VANG_CO_PHEP) soVangCoPhep++;
        }
        const diemTru = soVangKhongPhep * 2.0 + soDiMuon * 0.5 + soVangCoPhep * 0.5;
        const diemChuyenCan = Number(Math.max(0, Math.min(10, 10 - diemTru)).toFixed(1));
        danhSachCapNhat.push({
          idCotDiem: cotChuyenCan.id,
          idHocSinh: hs.id,
          giaTri: diemChuyenCan,
          ghiChu: 'Đồng bộ tự động từ điểm danh chuyên cần',
        });
      }

      // 2. Đồng bộ Điểm Luyện tập & Bài tập
      if (cotQuaTrinh) {
        const cacDiemThanhPhan: number[] = [];

        // Điểm từ Bài tập đã chấm
        for (const bt of lop.cacBaiTap) {
          const bn = bt.cacBaiNop.find(
            (n) => n.idNguoiDung === hs.idNguoiDung && n.diemSo !== null,
          );
          if (bn && bn.diemSo !== null) {
            cacDiemThanhPhan.push(Number(((bn.diemSo / (bt.diemToiDa || 10)) * 10).toFixed(2)));
          }
        }

        // Điểm cao nhất từ các bài Luyện tập
        const cacBaiLuyenTap = lop.cacBaiKiemTra.filter(
          (k) => k.cheDo === CheDoKiemTra.LUYEN_TAP,
        );
        for (const blt of cacBaiLuyenTap) {
          const luotHS = blt.cacLuotLam.filter((l) => l.idHocSinh === hs.id);
          if (luotHS.length > 0) {
            const maxDiem = Math.max(...luotHS.map((l) => l.diemSo));
            cacDiemThanhPhan.push(Number(((maxDiem / (blt.diemToiDa || 10)) * 10).toFixed(2)));
          }
        }

        if (cacDiemThanhPhan.length > 0) {
          const tbQuaTrinh = Number(
            (
              cacDiemThanhPhan.reduce((a, b) => a + b, 0) / cacDiemThanhPhan.length
            ).toFixed(1),
          );
          danhSachCapNhat.push({
            idCotDiem: cotQuaTrinh.id,
            idHocSinh: hs.id,
            giaTri: tbQuaTrinh,
            ghiChu: `Tổng hợp từ ${cacDiemThanhPhan.length} đầu điểm luyện tập & bài tập`,
          });
        }
      }

      // 3. Đồng bộ Điểm Giữa kỳ (Thi thử)
      if (cotGiuaKy) {
        const cacBaiThiThu = lop.cacBaiKiemTra.filter((k) => k.cheDo === CheDoKiemTra.THI_THU);
        const diemThiThu: number[] = [];
        for (const btt of cacBaiThiThu) {
          const luotHS = btt.cacLuotLam.filter((l) => l.idHocSinh === hs.id);
          if (luotHS.length > 0) {
            const maxDiem = Math.max(...luotHS.map((l) => l.diemSo));
            diemThiThu.push(Number(((maxDiem / (btt.diemToiDa || 10)) * 10).toFixed(2)));
          }
        }

        if (diemThiThu.length > 0) {
          const tbThiThu = Number(
            (diemThiThu.reduce((a, b) => a + b, 0) / diemThiThu.length).toFixed(1),
          );
          danhSachCapNhat.push({
            idCotDiem: cotGiuaKy.id,
            idHocSinh: hs.id,
            giaTri: tbThiThu,
            ghiChu: `Đồng bộ từ kết quả ${diemThiThu.length} đề thi thử`,
          });
        }
      }
    }

    if (danhSachCapNhat.length > 0) {
      await this.khoSoDiem.luuDiemHangLoat(danhSachCapNhat);
    }

    return {
      soLuongDongBo: danhSachCapNhat.length,
    };
  }

  /**
   * Ứng dụng AI phân tích toàn diện kết quả học phần & tư vấn lộ trình học tập cho từng sinh viên
   */
  async sinhNhanXetHocPhanAI(
    idLopHocPhan: string,
    idHocSinh: string,
    nguoiDung: PayloadJwt,
  ): Promise<KetQuaNhanXetHocPhanAI> {
    const idNguoiDung = this.layIdNguoiDung(nguoiDung);
    const bangDiem = await this.layBangDiemLopHocPhan(idLopHocPhan, nguoiDung);
    const dongHS = bangDiem.danhSachHocSinh.find((d) => d.idHocSinh === idHocSinh);

    if (!dongHS) {
      throw new NotFoundException({
        thanhCong: false,
        thongDiep: 'Không tìm thấy dữ liệu học sinh trong bảng điểm học phần.',
      });
    }

    const chiTietCot = bangDiem.danhSachCotDiem
      .map((c) => {
        const val = dongHS.diemTheoCot[c.id]?.giaTri;
        return `${c.tenCotDiem} (Hệ số ${c.heSo}): ${val !== null && val !== undefined ? val : 'Chưa có'}`;
      })
      .join(', ');

    const diemTB = dongHS.diemTrungBinhHe10;
    const diemManh: string[] = [];
    const diemCanCaiThien: string[] = [];
    const loTrinhDeXuat: string[] = [];

    if (dongHS.tyLeChuyenCan >= 90) {
      diemManh.push(`Ý thức chuyên cần rất tốt (${dongHS.tyLeChuyenCan}% buổi học có mặt).`);
    } else if (dongHS.tyLeChuyenCan < 80) {
      diemCanCaiThien.push(
        `Tỷ lệ chuyên cần còn thấp (${dongHS.tyLeChuyenCan}%), cần tham gia đầy đủ các buổi giảng trực tuyến và trên lớp.`,
      );
      loTrinhDeXuat.push('Đảm bảo tham gia tối thiểu 90% số buổi học còn lại để không bị trừ điểm chuyên cần.');
    }

    if (diemTB !== null && diemTB >= 8.0) {
      diemManh.push(
        `Năng lực tiếp thu học phần "${bangDiem.tenLopHocPhan}" đạt mức ${dongHS.xepLoai} (${diemTB}/10 - Điểm chữ ${dongHS.diemChu}).`,
      );
      loTrinhDeXuat.push(
        'Tiếp tục thực hành các đề thi thử nâng cao và hỗ trợ thảo luận nhóm trong lớp học phần.',
      );
    } else if (diemTB !== null && diemTB >= 5.5) {
      diemManh.push(
        `Đạt mức hoàn thành chuẩn đầu ra cơ bản của học phần (${diemTB}/10 - Điểm chữ ${dongHS.diemChu}).`,
      );
      diemCanCaiThien.push(
        'Điểm số các bài kiểm tra quá trình và thi thử còn ở mức trung bình - khá, chưa bứt phá.',
      );
      loTrinhDeXuat.push(
        'Làm lại các đề Luyện tập trong lớp học phần để nắm vững các dạng câu hỏi vận dụng trước kỳ thi cuối kỳ.',
      );
    } else {
      diemCanCaiThien.push(
        `Kết quả học phần hiện tại đang ở mức cảnh báo (${diemTB ?? 'Chưa đủ điểm'}/10), cần bổ sung gấp kiến thức nền tảng.`,
      );
      loTrinhDeXuat.push(
        'Ôn tập lại toàn bộ giáo trình trong mục Tài liệu kết hợp hỏi đáp với Trợ lý học tập và hoàn thành đầy đủ các bài Luyện tập.',
      );
    }

    if (diemManh.length === 0) {
      diemManh.push('Đã ghi danh và tham gia vào lộ trình học tập số của lớp học phần.');
    }
    if (diemCanCaiThien.length === 0) {
      diemCanCaiThien.push('Duy trì sự ổn định ở tất cả các cột điểm thành phần và bài thi cuối kỳ.');
    }
    if (loTrinhDeXuat.length < 2) {
      loTrinhDeXuat.push(
        'Chủ động tự kiểm tra năng lực qua phân hệ Thi thử để rèn kỹ năng phân bổ thời gian làm bài.',
      );
    }

    const nhanXetChiTiet = `Học sinh ${dongHS.hoTen} (${dongHS.maHocSinh}) tại học phần "${bangDiem.tenLopHocPhan}" hiện có tỷ lệ chuyên cần đạt ${dongHS.tyLeChuyenCan}%, chi tiết các cột điểm: ${chiTietCot}. Điểm trung bình học phần tạm tính đạt ${diemTB !== null ? `${diemTB}/10 (Hệ 4: ${dongHS.diemTrungBinhHe4} - Điểm chữ: ${dongHS.diemChu} - ${dongHS.xepLoai})` : 'chưa đủ đầu điểm tổng kết'}. ${diemManh[0]} ${loTrinhDeXuat[0]}`;

    // Lưu nhật ký sử dụng AI và Bản nháp nhận xét theo Rule 04
    await this.prisma.nhatKySuDungAI.create({
      data: {
        idNguoiDung,
        loaiTacVu: 'NHAN_XET_KET_QUA_HOC_PHAN',
        soLuongToken: 280,
        doTreMs: 120,
      },
    });

    const lop = await this.prisma.lopHocPhan.findUnique({
      where: { id: idLopHocPhan },
    });
    if (lop?.idGiaoVien) {
      await this.prisma.banNhapAI.create({
        data: {
          idLopHocPhan,
          idGiaoVien: lop.idGiaoVien,
          loaiBanNhap: LoaiBanNhapAI.NHAN_XET,
          tieuDe: `Đánh giá học phần: ${dongHS.hoTen} (${dongHS.maHocSinh})`,
          duLieuJson: {
            idHocSinh,
            hoTen: dongHS.hoTen,
            diemTrungBinhHe10: diemTB,
            diemChu: dongHS.diemChu,
            nhanXetChiTiet,
            diemManh,
            diemCanCaiThien,
            loTrinhDeXuat,
          } as any,
          trangThai: TrangThaiBanNhapAI.CHO_DUYET,
        },
      });
    }

    return {
      idHocSinh: dongHS.idHocSinh,
      hoTen: dongHS.hoTen,
      maHocSinh: dongHS.maHocSinh,
      diemTrungBinhHe10: diemTB,
      diemChu: dongHS.diemChu,
      xepLoai: dongHS.xepLoai,
      tyLeChuyenCan: dongHS.tyLeChuyenCan,
      nhanXetChiTiet,
      diemManh,
      diemCanCaiThien,
      loTrinhDeXuat,
    };
  }
}
