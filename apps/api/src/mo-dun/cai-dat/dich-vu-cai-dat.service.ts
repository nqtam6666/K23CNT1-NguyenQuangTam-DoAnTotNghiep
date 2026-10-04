import { Injectable, NotFoundException } from '@nestjs/common';
import { KhoCaiDatRepository } from './kho-cai-dat.repository';
import { BanDoCaiDat, CaiDatHeThong } from '@lms/chung';

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
}
