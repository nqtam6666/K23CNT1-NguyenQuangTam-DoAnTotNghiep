import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { MaLoiNghiepVu, PhanHoiLoi } from '@lms/chung';

@Catch()
export class BoLocNgoaiLeToanCuc implements ExceptionFilter {
  private readonly nhatKy = new Logger(BoLocNgoaiLeToanCuc.name);

  catch(ngoaiLe: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const phanHoi = ctx.getResponse<Response>();
    const yeuCau = ctx.getRequest<Request>();

    let maTrangThai = HttpStatus.INTERNAL_SERVER_ERROR;
    let maLoi = MaLoiNghiepVu.LOI_HE_THONG;
    let thongDiep = 'Đã xảy ra lỗi hệ thống, vui lòng thử lại sau';
    let chiTiet: unknown = undefined;

    if (ngoaiLe instanceof HttpException) {
      maTrangThai = ngoaiLe.getStatus();
      const phanHoiHttp = ngoaiLe.getResponse();

      if (typeof phanHoiHttp === 'string') {
        thongDiep = phanHoiHttp;
      } else if (typeof phanHoiHttp === 'object' && phanHoiHttp !== null) {
        const obj = phanHoiHttp as Record<string, any>;
        thongDiep = obj.message || obj.thongDiep || thongDiep;
        maLoi = obj.maLoi || (obj.error ? String(obj.error).toUpperCase() : maLoi);
        chiTiet = obj.chiTiet || obj.details;
      }
    } else if (ngoaiLe instanceof ZodError) {
      maTrangThai = HttpStatus.BAD_REQUEST;
      maLoi = MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE;
      thongDiep = 'Dữ liệu yêu cầu không hợp lệ';
      chiTiet = ngoaiLe.errors.map((err) => ({
        truong: err.path.join('.'),
        loi: err.message,
      }));
    } else if (ngoaiLe instanceof Error) {
      this.nhatKy.error(`Ngoại lệ không xác định: ${ngoaiLe.message}`, ngoaiLe.stack);
    }

    const ketQua: PhanHoiLoi = {
      thanhCong: false,
      maLoi,
      thongDiep: Array.isArray(thongDiep) ? thongDiep.join(', ') : thongDiep,
      chiTiet,
      duongDan: yeuCau.url,
      thoiGian: new Date().toISOString(),
    };

    phanHoi.status(maTrangThai).json(ketQua);
  }
}
