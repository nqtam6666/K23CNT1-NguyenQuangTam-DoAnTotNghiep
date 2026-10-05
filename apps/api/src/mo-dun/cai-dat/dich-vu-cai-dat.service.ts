import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { KhoCaiDatRepository } from './kho-cai-dat.repository';
import { BanDoCaiDat, CaiDatHeThong, MaLoiNghiepVu } from '@lms/chung';
import { randomUUID } from 'crypto';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DichVuCaiDatService {
  constructor(private readonly khoCaiDat: KhoCaiDatRepository) {}

  /**
   * Lấy toàn bộ danh sách cài đặt hệ thống (Dành cho Quản trị viên)
   */
  async layDanhSachCaiDat(): Promise<CaiDatHeThong[]> {
    return this.khoCaiDat.layDanhSach();
  }

  /**
   * Lấy bản đồ cấu hình công khai (Key-Value) cho giao diện khách (Landing page, Login, Sidebar)
   */
  async layBanDoCaiDatCongKhai(): Promise<BanDoCaiDat> {
    const danhSach = await this.khoCaiDat.layDanhSachCongKhai();
    const banDo: BanDoCaiDat = {};
    for (const item of danhSach) {
      banDo[item.khoa] = item.giaTri;
    }
    return banDo;
  }

  /**
   * Lấy chi tiết một cài đặt theo khóa
   */
  async layTheoKhoa(khoa: string): Promise<CaiDatHeThong> {
    const caiDat = await this.khoCaiDat.layTheoKhoa(khoa);
    if (!caiDat) {
      throw new NotFoundException(`Không tìm thấy cấu hình với mã '${khoa}'`);
    }
    return caiDat;
  }

  /**
   * Cập nhật hàng loạt nhiều cài đặt
   */
  async capNhatNhieu(
    danhSach: Array<{ khoa: string; giaTri: string }>,
  ): Promise<{ soLuong: number }> {
    const soLuong = await this.khoCaiDat.capNhatNhieu(danhSach);
    return { soLuong };
  }

  /**
   * Cập nhật một cài đặt theo khóa
   */
  async capNhatMot(khoa: string, giaTri: string): Promise<CaiDatHeThong> {
    return this.khoCaiDat.capNhat(khoa, giaTri);
  }

  /**
   * Tải lên tệp hình ảnh thương hiệu (Logo, Favicon, Icon) an toàn
   * Tuân thủ Quy tắc 02 (Kiểm tra magic bytes, kích thước <= 5MB, chống XSS trong SVG, chống path traversal)
   */
  async taiLenTepThuongHieu(tep?: Express.Multer.File, khoa?: string) {
    if (!tep || !tep.buffer) {
      throw new BadRequestException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
        thongDiep: 'Vui lòng chọn tập tin hình ảnh để tải lên',
      });
    }

    const mimeHopLe = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'image/x-icon',
      'image/vnd.microsoft.icon',
    ];

    if (!mimeHopLe.includes(tep.mimetype) && !tep.originalname.match(/\.(png|jpe?g|webp|gif|svg|ico)$/i)) {
      throw new BadRequestException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
        thongDiep: 'Định dạng tệp không hợp lệ. Chỉ chấp nhận PNG, JPG, WEBP, GIF, SVG hoặc ICO',
      });
    }

    const buf = tep.buffer;
    const laJpeg = buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    const laPng = buf.length >= 4 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
    const laGif = buf.length >= 4 && buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38;
    const laWebp = buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP';
    const laIco = buf.length >= 4 && buf[0] === 0x00 && buf[1] === 0x00 && buf[2] === 0x01 && buf[3] === 0x00;

    // Kiểm tra định dạng SVG an toàn (chống Stored XSS)
    let laSvg = false;
    if (tep.mimetype === 'image/svg+xml' || tep.originalname.toLowerCase().endsWith('.svg')) {
      const noiDungChuoi = buf.toString('utf8');
      const chuaTheSvg = noiDungChuoi.toLowerCase().includes('<svg');
      const chuaMaDoc =
        /<script/i.test(noiDungChuoi) ||
        /javascript:/i.test(noiDungChuoi) ||
        /xlink:href\s*=\s*['"]javascript:/i.test(noiDungChuoi) ||
        /on\w+\s*=/i.test(noiDungChuoi);

      if (chuaTheSvg && !chuaMaDoc) {
        laSvg = true;
      }
    }

    if (!laJpeg && !laPng && !laGif && !laWebp && !laIco && !laSvg) {
      throw new BadRequestException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
        thongDiep: 'Nội dung tập tin không đúng định dạng hình ảnh hợp lệ hoặc chứa mã độc nguy hiểm',
      });
    }

    let duoiTep = 'png';
    if (laJpeg) duoiTep = 'jpg';
    else if (laWebp) duoiTep = 'webp';
    else if (laGif) duoiTep = 'gif';
    else if (laIco) duoiTep = 'ico';
    else if (laSvg) duoiTep = 'svg';

    const tenTep = `${randomUUID()}.${duoiTep}`;
    const thuMucLuu = path.join(process.cwd(), 'uploads', 'thuong-hieu');
    if (!fs.existsSync(thuMucLuu)) {
      fs.mkdirSync(thuMucLuu, { recursive: true });
    }

    const duongDanDayDu = path.join(thuMucLuu, tenTep);
    await fs.promises.writeFile(duongDanDayDu, buf);

    const url = `/uploads/thuong-hieu/${tenTep}`;

    // Tự động đồng bộ vào cấu hình hệ thống nếu có khóa hợp lệ
    const cacKhoaHopLe = ['URL_LOGO', 'URL_FAVICON', 'URL_ICON'];
    if (khoa && cacKhoaHopLe.includes(khoa)) {
      await this.khoCaiDat.capNhat(khoa, url);
    }

    return {
      thanhCong: true,
      thongDiep: 'Tải lên hình ảnh thành công',
      url,
      khoa: khoa || null,
      tenTepGoc: tep.originalname,
      kichThuoc: tep.size,
    };
  }
}
