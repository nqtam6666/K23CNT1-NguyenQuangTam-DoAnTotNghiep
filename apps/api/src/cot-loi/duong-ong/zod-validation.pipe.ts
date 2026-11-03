import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';
import { MaLoiNghiepVu } from '@lms/chung';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(public readonly schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        const chiTietLoi = error.errors.map((e) => ({
          truong: e.path.join('.'),
          thongBao: e.message,
        }));
        const thongDiepChiTiet =
          chiTietLoi.map((c) => c.thongBao).filter(Boolean).join('; ') ||
          'Dữ liệu đầu vào không hợp lệ';
        throw new BadRequestException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
          thongDiep: thongDiepChiTiet,
          chiTiet: chiTietLoi,
        });
      }
      throw new BadRequestException('Dữ liệu không hợp lệ');
    }
  }
}
