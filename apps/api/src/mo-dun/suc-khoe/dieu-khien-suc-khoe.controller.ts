import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CongKhai } from '../../cot-loi/trang-tri/cong-khai.decorator';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';

@ApiTags('Hệ thống & Sức khỏe')
@Controller('suc-khoe')
export class DieuKhienSucKhoe {
  constructor(private readonly prisma: PrismaService) {}

  @CongKhai()
  @Get()
  @ApiOperation({ summary: 'Kiểm tra trạng thái hoạt động của hệ thống API và Database' })
  @ApiResponse({ status: 200, description: 'Hệ thống hoạt động bình thường' })
  async kiemTraSucKhoe() {
    let trangThaiCsdl = 'chua_ket_noi';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      trangThaiCsdl = 'san_sang';
    } catch {
      trangThaiCsdl = 'loi_ket_noi';
    }

    return {
      trangThai: 'hoat_dong_binh_thuong',
      ungDung: 'LMS Truong Hoc API',
      phienBan: '0.1.0',
      coSoDuLieu: trangThaiCsdl,
      thoiGianMayChu: new Date().toISOString(),
      moiTruong: process.env.NODE_ENV || 'development',
    };
  }
}
