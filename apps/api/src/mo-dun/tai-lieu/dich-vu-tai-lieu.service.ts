import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { KhoTaiLieuRepository } from './kho-tai-lieu.repository';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { DichVuCaiDatService } from '../cai-dat/dich-vu-cai-dat.service';
import {
  PayloadJwt,
  VaiTro,
  LoaiTaiLieu,
  TaoTaiLieuInput,
  MaLoiNghiepVu,
} from '@lms/chung';
import * as path from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';

@Injectable()
export class DichVuTaiLieuService {
  constructor(
    private readonly khoTaiLieu: KhoTaiLieuRepository,
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
          thongDiep: 'Bạn không phụ trách giảng dạy lớp học phần này',
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
          thongDiep: 'Không tìm thấy hồ sơ học sinh',
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
          thongDiep: 'Con em của bạn không học lớp này',
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

  async layDanhSachTaiLieu(idLopHocPhan: string, nguoiDung: PayloadJwt) {
    await this.kiemTraQuyenTruyCapLop(idLopHocPhan, nguoiDung);
    return this.khoTaiLieu.layDanhSachTheoLop(idLopHocPhan);
  }

  async taiLenTaiLieu(
    idLopHocPhan: string,
    duLieu: TaoTaiLieuInput,
    tep: Express.Multer.File | undefined,
    nguoiDung: PayloadJwt,
  ) {
    const lop = await this.kiemTraQuyenTruyCapLop(idLopHocPhan, nguoiDung);

    // Chỉ giáo viên phụ trách hoặc quản trị viên được tải tài liệu lên
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
        thongDiep: 'Chỉ giáo viên giảng dạy lớp mới có quyền tải lên tài liệu học tập',
      });
    }

    if (!tep) {
      throw new BadRequestException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
        thongDiep: 'Vui lòng đính kèm tập tin tài liệu',
      });
    }

    const dungLuongToiDaMb =
      (await this.dichVuCaiDat?.layGiaTriSo('bai_tap.dung_luong_tai_lieu_toi_da_mb', 25)) ?? 25;
    if (tep.size > dungLuongToiDaMb * 1024 * 1024) {
      throw new BadRequestException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
        thongDiep: `Kích thước tệp tài liệu vượt quá giới hạn cho phép (${dungLuongToiDaMb}MB).`,
      });
    }

    const chuoiDinhDang =
      (await this.dichVuCaiDat?.layGiaTriChuoi(
        'bai_tap.dinh_dang_tep_cho_phep',
        'pdf,doc,docx,xls,xlsx,ppt,pptx,txt,zip,rar,mp4,png,jpg,jpeg',
      )) || 'pdf,doc,docx,xls,xlsx,ppt,pptx,txt,zip,rar,mp4,png,jpg,jpeg';

    const duoiHopLe = chuoiDinhDang
      .split(',')
      .map((d) => d.trim().toLowerCase().replace(/^\./, ''))
      .filter(Boolean);

    // Kiểm tra đuôi file an toàn
    const phanMoRong = path.extname(tep.originalname).toLowerCase().replace('.', '');

    if (!duoiHopLe.includes(phanMoRong)) {
      throw new BadRequestException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
        thongDiep: `Định dạng tệp .${phanMoRong} không được hỗ trợ. Chỉ chấp nhận: ${duoiHopLe.join(', ')}`,
      });
    }

    const tenTepMoi = `${randomUUID()}.${phanMoRong}`;
    const thuMucLuu = path.join(process.cwd(), 'uploads', 'tai-lieu');
    if (!fs.existsSync(thuMucLuu)) {
      fs.mkdirSync(thuMucLuu, { recursive: true });
    }

    const duongDanDayDu = path.join(thuMucLuu, tenTepMoi);
    await fs.promises.writeFile(duongDanDayDu, tep.buffer);

    const duongDanTep = `/uploads/tai-lieu/${tenTepMoi}`;

    return this.khoTaiLieu.taoTaiLieu({
      idLopHocPhan,
      tieuDe: duLieu.tieuDe.trim(),
      moTa: duLieu.moTa ? duLieu.moTa.trim() : null,
      duongDanTep,
      loaiTaiLieu: duLieu.loaiTaiLieu || LoaiTaiLieu.TAI_LIEU_THAM_KHAO,
      kichThuocTep: tep.size,
    });
  }

  async xoaTaiLieu(idTaiLieu: string, nguoiDung: PayloadJwt) {
    const taiLieu = await this.khoTaiLieu.timTheoId(idTaiLieu);
    if (!taiLieu) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy tài liệu học tập',
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
      laGiaoVienLop = !!hoSo && taiLieu.lopHocPhan.idGiaoVien === hoSo.id;
    }

    if (!laAdmin && !laGiaoVienLop) {
      throw new ForbiddenException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
        thongDiep: 'Bạn không có quyền xóa tài liệu này',
      });
    }

    // Xóa file vật lý trên disk nếu tồn tại
    try {
      const duongDanTep = path.join(process.cwd(), taiLieu.duongDanTep.replace(/^\//, ''));
      if (fs.existsSync(duongDanTep)) {
        await fs.promises.unlink(duongDanTep);
      }
    } catch {
      // Bỏ qua lỗi xóa tệp vật lý để không làm gián đoạn CSDL
    }

    await this.khoTaiLieu.xoaTaiLieu(idTaiLieu);
    return { thanhCong: true, thongDiep: 'Đã xóa tài liệu học tập thành công' };
  }
}
