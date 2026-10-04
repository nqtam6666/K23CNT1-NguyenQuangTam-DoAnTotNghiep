import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';
import { MaLoiNghiepVu } from '@lms/chung';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.DU_LIEU_KHONG_HOP_LE,
          thongDiep: 'Dữ liệu đầu vào không hợp lệ',
          chiTiet: error.errors.map((e) => ({
            truong: e.path.join('.'),
            thongBao: e.message,
          })),
        });
      }
      throw new BadRequestException('Dữ liệu không hợp lệ');
    }
  }
}
