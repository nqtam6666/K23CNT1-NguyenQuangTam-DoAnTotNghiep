import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { KhoBaiTapRepository } from './kho-bai-tap.repository';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { DichVuCaiDatService } from '../cai-dat/dich-vu-cai-dat.service';
import {
  PayloadJwt,
  VaiTro,
  TrangThaiBaiNop,
  TaoBaiTapInput,
  ChamDiemBaiNopInput,
  MaLoiNghiepVu,
} from '@lms/chung';
import * as path from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';

@Injectable()
export class DichVuBaiTapService {
  constructor(
    private readonly khoBaiTap: KhoBaiTapRepository,
    private readonly prisma: PrismaService,
    @Optional() private readonly dichVuCaiDat?: DichVuCaiDatService,
  ) {}

  async kiemTraQuyenTruyCapLop(idLopHocPhan: string, nguoiDung: PayloadJwt) {
    const lop = await this.prisma.lopHocPhan.findUnique({
      where: { id: idLopHocPhan },
    });

    if (!lop) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy lớp học phần',
      });
    }

    if (
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN ||
      nguoiDung.vaiTro === VaiTro.BAN_GIAM_HIEU ||
      nguoiDung.vaiTro === VaiTro.GIAO_VU
    ) {
      return lop;
    }

    if (nguoiDung.vaiTro === VaiTro.GIAO_VIEN) {
      const hoSo = await this.prisma.hoSoGiaoVien.findUnique({
        where: { idNguoiDung: nguoiDung.sub },
      });
      if (!hoSo || lop.idGiaoVien !== hoSo.id) {
        throw new ForbiddenException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
          thongDiep: 'Bạn không được phân công giảng dạy lớp học phần này',
        });
      }
      return lop;
    }

    if (nguoiDung.vaiTro === VaiTro.HOC_SINH) {
      const hoSo = await this.prisma.hoSoHocSinh.findUnique({
        where: { idNguoiDung: nguoiDung.sub },
      });
      if (!hoSo) {
        throw new ForbiddenException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
          thongDiep: 'Không tìm thấy hồ sơ học sinh của bạn',
        });
      }
      const ghiDanh = await this.prisma.ghiDanh.findFirst({
        where: { idLopHocPhan, idHocSinh: hoSo.id },
      });
      if (!ghiDanh) {
        throw new ForbiddenException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
          thongDiep: 'Bạn chưa được ghi danh vào lớp học phần này',
        });
      }
      return lop;
    }

    if (nguoiDung.vaiTro === VaiTro.PHU_HUYNH) {
      const lienKet = await this.prisma.phuHuynhHocSinh.findMany({
        where: { idPhuHuynh: nguoiDung.sub },
        select: { idHocSinh: true },
      });
      const coConHoc = await this.prisma.ghiDanh.findFirst({
        where: {
          idLopHocPhan,
          idHocSinh: { in: lienKet.map((l) => l.idHocSinh) },
        },
      });
      if (!coConHoc) {
        throw new ForbiddenException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
          thongDiep: 'Con em của bạn không học lớp học phần này',
        });
      }
      return lop;
    }

    throw new ForbiddenException({
      thanhCong: false,
      maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
      thongDiep: 'Không có quyền truy cập',
    });
  }

  // ==========================================
  // BÀI TẬP
  // ==========================================

  async layDanhSachBaiTap(idLopHocPhan: string, nguoiDung: PayloadJwt) {
    await this.kiemTraQuyenTruyCapLop(idLopHocPhan, nguoiDung);

    const idHocSinh =
      nguoiDung.vaiTro === VaiTro.HOC_SINH ? nguoiDung.sub : undefined;

    const danhSach = await this.khoBaiTap.layDanhSachTheoLop(idLopHocPhan, idHocSinh);

    // Map bài nộp cá nhân để frontend dễ hiển thị
    return danhSach.map((bt: any) => ({
      ...bt,
      baiNopCuaToi: bt.cacBaiNop && bt.cacBaiNop.length > 0 ? bt.cacBaiNop[0] : null,
      cacBaiNop: undefined,
    }));
  }

  async layChiTietBaiTap(idBaiTap: string, nguoiDung: PayloadJwt) {
    const baiTap = await this.khoBaiTap.timTheoId(idBaiTap);
    if (!baiTap) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy bài tập',
      });
    }

    await this.kiemTraQuyenTruyCapLop(baiTap.idLopHocPhan, nguoiDung);

    let baiNopCuaToi = null;
    if (nguoiDung.vaiTro === VaiTro.HOC_SINH) {
      baiNopCuaToi = await this.khoBaiTap.timBaiNopCuaHocSinh(
        idBaiTap,
        nguoiDung.sub,
      );
    }

    return {
      ...baiTap,
      baiNopCuaToi,
    };
  }

  async taoBaiTap(
    idLopHocPhan: string,
    duLieu: TaoBaiTapInput,
    nguoiDung: PayloadJwt,
  ) {
    const lop = await this.kiemTraQuyenTruyCapLop(idLopHocPhan, nguoiDung);

    const laAdmin =
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN ||
      nguoiDung.vaiTro === VaiTro.BAN_GIAM_HIEU;

    let laGiaoVienLop = false;
    if (nguoiDung.vaiTro === VaiTro.GIAO_VIEN) {
      const hoSo = await this.prisma.hoSoGiaoVien.findUnique({
        where: { idNguoiDung: nguoiDung.sub },
      });
      laGiaoVienLop = !!hoSo && lop.idGiaoVien === hoSo.id;
    }

    if (!laAdmin && !laGiaoVienLop) {
      throw new ForbiddenException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
        thongDiep: 'Chỉ giáo viên phụ trách lớp mới có quyền giao bài tập',
      });
    }

    const hanNop = new Date(duLieu.hanNop);
    if (isNaN(hanNop.getTime())) {
      throw new BadRequestException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
        thongDiep: 'Thời hạn nộp bài không hợp lệ',
      });
    }

    const baiTapMoi = await this.khoBaiTap.taoBaiTap({
      idLopHocPhan,
      tieuDe: duLieu.tieuDe.trim(),
      noiDung: duLieu.noiDung.trim(),
      hanNop,
      diemToiDa: duLieu.diemToiDa || 10,
      hinhThucNop: duLieu.hinhThucNop,
    });

    const chuoiHanNop = hanNop.toLocaleString('vi-VN', { hour12: false });
    void this.dichVuCaiDat?.phatThongBaoChoLopHocPhan({
      idLopHocPhan,
      idNguoiTao: nguoiDung.sub,
      tieuDe: `Bài tập mới: ${duLieu.tieuDe.trim()}`,
      noiDung: `Lớp ${lop.tenLopHocPhan} vừa có bài tập mới. Hạn nộp: ${chuoiHanNop}. Điểm tối đa: ${duLieu.diemToiDa || 10}.`,
      duongDan: `/bai-tap/${baiTapMoi.id}`,
      loaiSuKien: 'BAI_TAP_MOI',
    });

    return baiTapMoi;
  }

  async xoaBaiTap(idBaiTap: string, nguoiDung: PayloadJwt) {
    const baiTap = await this.khoBaiTap.timTheoId(idBaiTap);
    if (!baiTap) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy bài tập',
      });
    }

    const laAdmin =
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN ||
      nguoiDung.vaiTro === VaiTro.BAN_GIAM_HIEU;

    let laGiaoVienLop = false;
    if (nguoiDung.vaiTro === VaiTro.GIAO_VIEN) {
      const hoSo = await this.prisma.hoSoGiaoVien.findUnique({
        where: { idNguoiDung: nguoiDung.sub },
      });
      laGiaoVienLop = !!hoSo && baiTap.lopHocPhan.idGiaoVien === hoSo.id;
    }

    if (!laAdmin && !laGiaoVienLop) {
      throw new ForbiddenException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
        thongDiep: 'Bạn không có quyền xóa bài tập này',
      });
    }

    await this.khoBaiTap.xoaBaiTap(idBaiTap);
    return { thanhCong: true, thongDiep: 'Đã xóa bài tập thành công' };
  }

  // ==========================================
  // NỘP BÀI (HỌC SINH)
  // ==========================================

  async nopBai(
    idBaiTap: string,
    noiDung: string | undefined,
    tep: Express.Multer.File | undefined,
    nguoiDung: PayloadJwt,
  ) {
    if (nguoiDung.vaiTro !== VaiTro.HOC_SINH) {
      throw new ForbiddenException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
        thongDiep: 'Chỉ học sinh mới có quyền nộp bài tập',
      });
    }

    const baiTap = await this.khoBaiTap.timTheoId(idBaiTap);
    if (!baiTap) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy bài tập',
      });
    }

    // Kiểm tra học sinh có ghi danh lớp này không
    await this.kiemTraQuyenTruyCapLop(baiTap.idLopHocPhan, nguoiDung);

    let duongDanTep: string | null = null;

    if (tep) {
      const dungLuongToiDaMb =
        (await this.dichVuCaiDat?.layGiaTriSo('bai_tap.dung_luong_tep_nop_toi_da_mb', 15)) ?? 15;
      if (tep.size > dungLuongToiDaMb * 1024 * 1024) {
        throw new BadRequestException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
          thongDiep: `Kích thước tệp bài nộp vượt quá giới hạn cho phép (${dungLuongToiDaMb}MB).`,
        });
      }

      const chuoiDinhDang =
        (await this.dichVuCaiDat?.layGiaTriChuoi(
          'bai_tap.dinh_dang_tep_cho_phep',
          'pdf,doc,docx,xls,xlsx,ppt,pptx,txt,zip,rar,png,jpg,jpeg',
        )) || 'pdf,doc,docx,xls,xlsx,ppt,pptx,txt,zip,rar,png,jpg,jpeg';

      const duoiHopLe = chuoiDinhDang
        .split(',')
        .map((d) => d.trim().toLowerCase().replace(/^\./, ''))
        .filter(Boolean);

      const phanMoRong = path.extname(tep.originalname).toLowerCase().replace('.', '');
      if (!duoiHopLe.includes(phanMoRong)) {
        throw new BadRequestException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
          thongDiep: `Định dạng tệp .${phanMoRong} không được hỗ trợ. Chỉ chấp nhận: ${duoiHopLe.join(', ')}`,
        });
      }

      const tenTep = `${randomUUID()}.${phanMoRong}`;
      const thuMucLuu = path.join(process.cwd(), 'uploads', 'bai-nop');
      if (!fs.existsSync(thuMucLuu)) {
        fs.mkdirSync(thuMucLuu, { recursive: true });
      }

      const duongDanDayDu = path.join(thuMucLuu, tenTep);
      await fs.promises.writeFile(duongDanDayDu, tep.buffer);
      duongDanTep = `/uploads/bai-nop/${tenTep}`;
    }

    if (!noiDung && !duongDanTep) {
      throw new BadRequestException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
        thongDiep: 'Vui lòng nhập câu trả lời hoặc đính kèm tệp bài làm',
      });
    }

    // Kiểm tra hạn nộp & cấu hình cho phép nộp muộn
    const bayGio = new Date();
    const quaHan = bayGio > new Date(baiTap.hanNop);
    if (quaHan) {
      const choPhepNopMuon =
        (await this.dichVuCaiDat?.layGiaTriBoolean('bai_tap.cho_phep_nop_muon_mac_dinh', true)) ??
        true;
      if (!choPhepNopMuon) {
        throw new BadRequestException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.YEU_CAU_KHONG_HOP_LE,
          thongDiep:
            'Đã quá thời hạn nộp bài và quy định hệ thống hiện không cho phép nộp bài sau hạn chót.',
        });
      }
    }

    const trangThai = quaHan ? TrangThaiBaiNop.NOP_MUON : TrangThaiBaiNop.DA_NOP;

    return this.khoBaiTap.luuBaiNop({
      idBaiTap,
      idNguoiDung: nguoiDung.sub,
      noiDung: noiDung ? noiDung.trim() : null,
      duongDanTep,
      trangThai,
    });
  }

  // ==========================================
  // DANH SÁCH BÀI NỘP & CHẤM ĐIỂM (GIÁO VIÊN)
  // ==========================================

  async layDanhSachBaiNop(idBaiTap: string, nguoiDung: PayloadJwt) {
    const baiTap = await this.khoBaiTap.timTheoId(idBaiTap);
    if (!baiTap) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy bài tập',
      });
    }

    const laAdmin =
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN ||
      nguoiDung.vaiTro === VaiTro.BAN_GIAM_HIEU;

    let laGiaoVienLop = false;
    if (nguoiDung.vaiTro === VaiTro.GIAO_VIEN) {
      const hoSo = await this.prisma.hoSoGiaoVien.findUnique({
        where: { idNguoiDung: nguoiDung.sub },
      });
      laGiaoVienLop = !!hoSo && baiTap.lopHocPhan.idGiaoVien === hoSo.id;
    }

    if (!laAdmin && !laGiaoVienLop) {
      throw new ForbiddenException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
        thongDiep: 'Chỉ giáo viên giảng dạy mới có quyền xem danh sách bài nộp của cả lớp',
      });
    }

    return this.khoBaiTap.layDanhSachBaiNopTheoBaiTap(idBaiTap);
  }

  async chamDiem(
    idBaiNop: string,
    duLieu: ChamDiemBaiNopInput,
    nguoiDung: PayloadJwt,
  ) {
    const baiNop = await this.khoBaiTap.timBaiNopTheoId(idBaiNop);
    if (!baiNop) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy bài nộp để chấm điểm',
      });
    }

    const laAdmin =
      nguoiDung.vaiTro === VaiTro.QUAN_TRI_VIEN ||
      nguoiDung.vaiTro === VaiTro.BAN_GIAM_HIEU;

    let laGiaoVienLop = false;
    if (nguoiDung.vaiTro === VaiTro.GIAO_VIEN) {
      const hoSo = await this.prisma.hoSoGiaoVien.findUnique({
        where: { idNguoiDung: nguoiDung.sub },
      });
      laGiaoVienLop =
        !!hoSo && baiNop.baiTap.lopHocPhan.idGiaoVien === hoSo.id;
    }

    if (!laAdmin && !laGiaoVienLop) {
      throw new ForbiddenException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
        thongDiep: 'Bạn không có quyền chấm điểm bài tập này',
      });
    }

    if (duLieu.diemSo > baiNop.baiTap.diemToiDa) {
      throw new BadRequestException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
        thongDiep: `Điểm số không được vượt quá điểm tối đa (${baiNop.baiTap.diemToiDa})`,
      });
    }

    const daCham = await this.khoBaiTap.chamDiemBaiNop(
      idBaiNop,
      duLieu.diemSo,
      duLieu.nhanXet ? duLieu.nhanXet.trim() : null,
    );

    void this.dichVuCaiDat?.phatThongBaoDaKenhChoNguoiDung({
      danhSachIdNguoiDung: [baiNop.idNguoiDung],
      tieuDe: `Đã chấm điểm bài tập: ${baiNop.baiTap.tieuDe}`,
      noiDung: `Bài nộp của bạn đạt ${duLieu.diemSo}/${baiNop.baiTap.diemToiDa} điểm.${duLieu.nhanXet?.trim() ? ` Nhận xét: "${duLieu.nhanXet.trim()}"` : ''}`,
      duongDan: `/bai-tap/${baiNop.idBaiTap}`,
      loaiSuKien: 'CHAM_DIEM',
    });

    return daCham;
  }
}
