import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {
  CapNhatHoSoDto,
  TaoHoSoHocSinhDto,
  CapNhatHoSoHocSinhDto,
  TruyVanHoSoHocSinhDto,
  TaoHoSoGiaoVienDto,
  CapNhatHoSoGiaoVienDto,
  ThietLapLienKetPhuHuynhDto,
  TruyVanPhanTrangDto,
  MaLoiNghiepVu,
  VaiTro,
  PayloadJwt,
} from '@lms/chung';
import { KhoHoSo } from './kho-ho-so.repository';
import { KhoNguoiDung } from '../nguoi-dung/kho-nguoi-dung.repository';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class DichVuHoSo {
  constructor(
    private readonly khoHoSo: KhoHoSo,
    private readonly khoNguoiDung: KhoNguoiDung,
  ) {}

  /**
   * Lấy toàn bộ thông tin hồ sơ của người dùng đang đăng nhập
   */
  async layHoSoCaNhan(idNguoiDung: string, vaiTro: VaiTro) {
    const nguoiDung = await this.khoNguoiDung.timTheoId(idNguoiDung, true);
    if (!nguoiDung) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy người dùng',
      });
    }

    const { matKhau, ...duLieu } = nguoiDung;

    if (vaiTro === VaiTro.HOC_SINH) {
      const hoSoHocSinh = await this.khoHoSo.timHoSoHocSinhTheoIdNguoiDung(idNguoiDung);
      return { ...duLieu, hoSoHocSinh };
    }

    if (vaiTro === VaiTro.GIAO_VIEN) {
      const hoSoGiaoVien = await this.khoHoSo.timHoSoGiaoVienTheoIdNguoiDung(idNguoiDung);
      return { ...duLieu, hoSoGiaoVien };
    }

    if (vaiTro === VaiTro.PHU_HUYNH) {
      const danhSachConEm = await this.khoHoSo.layDanhSachConEmCuaPhuHuynh(idNguoiDung);
      return { ...duLieu, danhSachConEm };
    }

    return duLieu;
  }

  /**
   * Cập nhật thông tin cá nhân cơ bản (số điện thoại, họ tên, ảnh đại diện)
   */
  async capNhatHoSoCaNhan(idNguoiDung: string, duLieu: CapNhatHoSoDto) {
    const nguoiDung = await this.khoNguoiDung.timTheoId(idNguoiDung);
    if (!nguoiDung) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy người dùng',
      });
    }

    const duLieuCapNhat: any = {};
    if (duLieu.hoTen !== undefined) duLieuCapNhat.hoTen = duLieu.hoTen;
    if (duLieu.soDienThoai !== undefined) duLieuCapNhat.soDienThoai = duLieu.soDienThoai;
    if (duLieu.anhDaiDien !== undefined) {
      duLieuCapNhat.anhDaiDien = duLieu.anhDaiDien === '' ? null : duLieu.anhDaiDien;
    }

    const capNhat = await this.khoNguoiDung.capNhatNguoiDung(idNguoiDung, duLieuCapNhat);

    const { matKhau, ...ketQua } = capNhat;
    return ketQua;
  }

  /**
   * Tải lên và cập nhật ảnh đại diện người dùng
   * Tuân thủ Quy tắc 02 (Bảo mật upload file: whitelist mime, magic bytes, uuid filename, chống path traversal)
   */
  async taiLenAnhDaiDien(idNguoiDung: string, tep?: Express.Multer.File) {
    if (!tep || !tep.buffer) {
      throw new BadRequestException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
        thongDiep: 'Vui lòng chọn tập tin hình ảnh để tải lên',
      });
    }

    const mimeHopLe = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!mimeHopLe.includes(tep.mimetype)) {
      throw new BadRequestException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
        thongDiep: 'Định dạng ảnh không hợp lệ. Chỉ chấp nhận JPG, PNG, WEBP hoặc GIF',
      });
    }

    const buf = tep.buffer;
    const laJpeg = buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    const laPng = buf.length >= 4 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
    const laGif = buf.length >= 4 && buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38;
    const laWebp = buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP';

    if (!laJpeg && !laPng && !laGif && !laWebp) {
      throw new BadRequestException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
        thongDiep: 'Nội dung tập tin không đúng định dạng hình ảnh hợp lệ',
      });
    }

    let duoiTep = 'jpg';
    if (laPng) duoiTep = 'png';
    else if (laWebp) duoiTep = 'webp';
    else if (laGif) duoiTep = 'gif';

    const tenTep = `${randomUUID()}.${duoiTep}`;
    const thuMucLuu = path.join(process.cwd(), 'uploads', 'avatars');
    if (!fs.existsSync(thuMucLuu)) {
      fs.mkdirSync(thuMucLuu, { recursive: true });
    }

    const duongDanDayDu = path.join(thuMucLuu, tenTep);
    await fs.promises.writeFile(duongDanDayDu, buf);

    const urlAnh = `/uploads/avatars/${tenTep}`;

    await this.khoNguoiDung.capNhatNguoiDung(idNguoiDung, {
      anhDaiDien: urlAnh,
    });

    return {
      thanhCong: true,
      thongDiep: 'Cập nhật ảnh đại diện thành công',
      urlAnh,
    };
  }

  // ==================== NGHIỆP VỤ HỌC SINH ====================

  async layDanhSachHocSinh(thamSo: TruyVanHoSoHocSinhDto) {
    return this.khoHoSo.timDanhSachHocSinh(thamSo);
  }

  async layChiTietHocSinh(id: string, nguoiDungHienTai: PayloadJwt) {
    const hoSo = await this.khoHoSo.timHoSoHocSinhTheoId(id);
    if (!hoSo) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy hồ sơ học sinh',
      });
    }

    // CHỐNG IDOR (Rule 02 - Insecure Direct Object References)
    if (nguoiDungHienTai.vaiTro === VaiTro.HOC_SINH) {
      if (hoSo.idNguoiDung !== nguoiDungHienTai.id) {
        throw new ForbiddenException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
          thongDiep: 'Học sinh chỉ được phép xem hồ sơ của chính mình',
        });
      }
    } else if (nguoiDungHienTai.vaiTro === VaiTro.PHU_HUYNH) {
      const coLienKet = await this.khoHoSo.kiemTraLienKet(nguoiDungHienTai.id, hoSo.id);
      if (!coLienKet) {
        throw new ForbiddenException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
          thongDiep: 'Bạn chỉ được phép xem thông tin hồ sơ của con em mình',
        });
      }
    }

    return hoSo;
  }

  async taoHoSoHocSinh(duLieu: TaoHoSoHocSinhDto) {
    const nguoiDung = await this.khoNguoiDung.timTheoId(duLieu.idNguoiDung);
    if (!nguoiDung) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Người dùng không tồn tại',
      });
    }

    const daCoHoSo = await this.khoHoSo.timHoSoHocSinhTheoIdNguoiDung(duLieu.idNguoiDung);
    if (daCoHoSo) {
      throw new ConflictException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.TAI_NGUYEN_DA_TON_TAI,
        thongDiep: 'Người dùng này đã có hồ sơ học sinh',
      });
    }

    const daTonTaiMa = await this.khoHoSo.timHoSoHocSinhTheoMa(duLieu.maHocSinh);
    if (daTonTaiMa) {
      throw new ConflictException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.TAI_NGUYEN_DA_TON_TAI,
        thongDiep: 'Mã học sinh này đã được sử dụng',
      });
    }

    return this.khoHoSo.taoHoSoHocSinh({
      nguoiDung: { connect: { id: duLieu.idNguoiDung } },
      maHocSinh: duLieu.maHocSinh,
      lopHanhChinh: duLieu.idLopHanhChinh ? { connect: { id: duLieu.idLopHanhChinh } } : undefined,
      ngaySinh: duLieu.ngaySinh ? new Date(duLieu.ngaySinh) : undefined,
      diaChi: duLieu.diaChi,
    });
  }

  async capNhatHoSoHocSinh(id: string, duLieu: CapNhatHoSoHocSinhDto) {
    const hoSo = await this.khoHoSo.timHoSoHocSinhTheoId(id);
    if (!hoSo) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy hồ sơ học sinh',
      });
    }

    if (duLieu.maHocSinh && duLieu.maHocSinh !== hoSo.maHocSinh) {
      const daTonTaiMa = await this.khoHoSo.timHoSoHocSinhTheoMa(duLieu.maHocSinh);
      if (daTonTaiMa) {
        throw new ConflictException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.TAI_NGUYEN_DA_TON_TAI,
          thongDiep: 'Mã học sinh này đã được sử dụng',
        });
      }
    }

    return this.khoHoSo.capNhatHoSoHocSinh(id, {
      maHocSinh: duLieu.maHocSinh,
      lopHanhChinh:
        duLieu.idLopHanhChinh !== undefined
          ? duLieu.idLopHanhChinh
            ? { connect: { id: duLieu.idLopHanhChinh } }
            : { disconnect: true }
          : undefined,
      ngaySinh: duLieu.ngaySinh ? new Date(duLieu.ngaySinh) : undefined,
      diaChi: duLieu.diaChi,
    });
  }

  // ==================== NGHIỆP VỤ GIÁO VIÊN ====================

  async layDanhSachGiaoVien(thamSo: TruyVanPhanTrangDto) {
    return this.khoHoSo.timDanhSachGiaoVien(thamSo);
  }

  async layChiTietGiaoVien(id: string) {
    const hoSo = await this.khoHoSo.timHoSoGiaoVienTheoId(id);
    if (!hoSo) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy hồ sơ giáo viên',
      });
    }
    return hoSo;
  }

  async taoHoSoGiaoVien(duLieu: TaoHoSoGiaoVienDto) {
    const nguoiDung = await this.khoNguoiDung.timTheoId(duLieu.idNguoiDung);
    if (!nguoiDung) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Người dùng không tồn tại',
      });
    }

    const daCoHoSo = await this.khoHoSo.timHoSoGiaoVienTheoIdNguoiDung(duLieu.idNguoiDung);
    if (daCoHoSo) {
      throw new ConflictException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.TAI_NGUYEN_DA_TON_TAI,
        thongDiep: 'Người dùng này đã có hồ sơ giáo viên',
      });
    }

    const daTonTaiMa = await this.khoHoSo.timHoSoGiaoVienTheoMa(duLieu.maGiaoVien);
    if (daTonTaiMa) {
      throw new ConflictException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.TAI_NGUYEN_DA_TON_TAI,
        thongDiep: 'Mã giáo viên này đã được sử dụng',
      });
    }

    return this.khoHoSo.taoHoSoGiaoVien({
      nguoiDung: { connect: { id: duLieu.idNguoiDung } },
      maGiaoVien: duLieu.maGiaoVien,
      hocVi: duLieu.hocVi,
      chuyenMon: duLieu.chuyenMon,
    });
  }

  async capNhatHoSoGiaoVien(id: string, duLieu: CapNhatHoSoGiaoVienDto) {
    const hoSo = await this.khoHoSo.timHoSoGiaoVienTheoId(id);
    if (!hoSo) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy hồ sơ giáo viên',
      });
    }

    if (duLieu.maGiaoVien && duLieu.maGiaoVien !== hoSo.maGiaoVien) {
      const daTonTaiMa = await this.khoHoSo.timHoSoGiaoVienTheoMa(duLieu.maGiaoVien);
      if (daTonTaiMa) {
        throw new ConflictException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.TAI_NGUYEN_DA_TON_TAI,
          thongDiep: 'Mã giáo viên này đã được sử dụng',
        });
      }
    }

    return this.khoHoSo.capNhatHoSoGiaoVien(id, {
      maGiaoVien: duLieu.maGiaoVien,
      hocVi: duLieu.hocVi,
      chuyenMon: duLieu.chuyenMon,
    });
  }

  // ==================== LIÊN KẾT PHỤ HUYNH ====================

  async thietLapLienKetPhuHuynh(duLieu: ThietLapLienKetPhuHuynhDto) {
    const phuHuynh = await this.khoNguoiDung.timTheoId(duLieu.idPhuHuynh);
    if (!phuHuynh || phuHuynh.vaiTro !== VaiTro.PHU_HUYNH) {
      throw new BadRequestException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.YEU_CAU_KHONG_HOP_LE,
        thongDiep: 'Người dùng được chỉ định không phải là tài khoản Phụ huynh',
      });
    }

    const hocSinh = await this.khoHoSo.timHoSoHocSinhTheoId(duLieu.idHocSinh);
    if (!hocSinh) {
      throw new NotFoundException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_TIM_THAY_TAI_NGUYEN,
        thongDiep: 'Không tìm thấy hồ sơ học sinh',
      });
    }

    return this.khoHoSo.thietLapLienKetPhuHuynh(
      duLieu.idPhuHuynh,
      duLieu.idHocSinh,
      duLieu.moiQuanHe,
    );
  }

  async xoaLienKetPhuHuynh(idPhuHuynh: string, idHocSinh: string) {
    return this.khoHoSo.xoaLienKetPhuHuynh(idPhuHuynh, idHocSinh);
  }

  async layDanhSachConEm(idPhuHuynh: string) {
    return this.khoHoSo.layDanhSachConEmCuaPhuHuynh(idPhuHuynh);
  }
}
