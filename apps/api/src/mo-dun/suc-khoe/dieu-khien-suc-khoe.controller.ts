import { Controller, Get, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CongKhai } from '../../cot-loi/trang-tri/cong-khai.decorator';
import { PrismaService } from '../../cot-loi/csdl/prisma.service';
import { ConfigService } from '@nestjs/config';
import { NguoiDungHienTai } from '../../cot-loi/trang-tri/nguoi-dung-hien-tai.decorator';
import { PayloadJwt, VaiTro, SucKhoeHeThong } from '@lms/chung';
import http from 'http';

@ApiTags('Hệ thống & Sức khỏe')
@Controller()
export class DieuKhienSucKhoe {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  @CongKhai()
  @Get('suc-khoe')
  @ApiOperation({ summary: 'Kiểm tra trạng thái hoạt động của hệ thống API và Database (Công khai)' })
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

  @Get('he-thong/suc-khoe')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Chỉ báo sức khỏe chi tiết toàn diện của hệ thống (Dành riêng cho Quản trị viên)',
  })
  @ApiResponse({ status: 200, description: 'Trạng thái sức khỏe hệ thống' })
  async kiemTraSucKhoeChiTiet(
    @NguoiDungHienTai() nguoiDung: PayloadJwt,
  ): Promise<SucKhoeHeThong> {
    // Phân quyền: Chỉ Quản trị viên và Ban giám hiệu được phép xem
    if (
      !nguoiDung ||
      (nguoiDung.vaiTro !== VaiTro.QUAN_TRI_VIEN && nguoiDung.vaiTro !== VaiTro.BAN_GIAM_HIEU)
    ) {
      throw new ForbiddenException('Bạn không có quyền xem thông tin sức khỏe hệ thống');
    }

    // 1. Kiểm tra PostgreSQL
    let trangThaiDb: 'SAN_SANG' | 'LOI_KET_NOI' = 'SAN_SANG';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      trangThaiDb = 'LOI_KET_NOI';
    }

    // 2. Kiểm tra Redis
    let trangThaiRedis: 'SAN_SANG' | 'LOI_KET_NOI' = 'SAN_SANG';
    const redisHost = this.config.get<string>('REDIS_HOST', 'localhost');
    const redisPort = Number(this.config.get<number>('REDIS_CONG', 6379));
    try {
      const net = await import('net');
      await new Promise<void>((resolve, reject) => {
        const socket = net.createConnection({ host: redisHost, port: redisPort }, () => {
          socket.end();
          resolve();
        });
        socket.setTimeout(2000, () => {
          socket.destroy();
          reject(new Error('Hết thời gian chờ Redis'));
        });
        socket.on('error', (err) => reject(err));
      });
    } catch {
      trangThaiRedis = 'LOI_KET_NOI';
    }

    // 3. Kiểm tra MinIO Storage
    let trangThaiMinIO: 'SAN_SANG' | 'LOI_KET_NOI' = 'SAN_SANG';
    const minioHost = this.config.get<string>('MINIO_ENDPOINT', 'localhost');
    const minioPort = Number(this.config.get<number>('MINIO_CONG_API', 9000));
    try {
      const net = await import('net');
      await new Promise<void>((resolve, reject) => {
        const socket = net.createConnection({ host: minioHost, port: minioPort }, () => {
          socket.end();
          resolve();
        });
        socket.setTimeout(2000, () => {
          socket.destroy();
          reject(new Error('Hết thời gian chờ MinIO'));
        });
        socket.on('error', (err) => reject(err));
      });
    } catch {
      trangThaiMinIO = 'LOI_KET_NOI';
    }

    // 4. Kiểm tra LiveKit Server
    let trangThaiLiveKit: 'SAN_SANG' | 'LOI_KET_NOI' = 'SAN_SANG';
    try {
      const net = await import('net');
      await new Promise<void>((resolve, reject) => {
        const socket = net.createConnection({ host: 'localhost', port: 7880 }, () => {
          socket.end();
          resolve();
        });
        socket.setTimeout(2000, () => {
          socket.destroy();
          reject(new Error('Hết thời gian chờ LiveKit'));
        });
        socket.on('error', (err) => reject(err));
      });
    } catch {
      trangThaiLiveKit = 'LOI_KET_NOI';
    }

    const coSuCo =
      trangThaiDb === 'LOI_KET_NOI' ||
      trangThaiRedis === 'LOI_KET_NOI' ||
      trangThaiMinIO === 'LOI_KET_NOI' ||
      trangThaiLiveKit === 'LOI_KET_NOI';

    const tongHopTrangThai: 'HOAT_DONG_TOT' | 'CANH_BAO' | 'GAP_SU_CO' =
      trangThaiDb === 'LOI_KET_NOI'
        ? 'GAP_SU_CO'
        : coSuCo
          ? 'CANH_BAO'
          : 'HOAT_DONG_TOT';

    const duLieu: SucKhoeHeThong = {
      trangThai: tongHopTrangThai,
      dichVu: {
        coSoDuLieu: trangThaiDb,
        boNhoDemRedis: trangThaiRedis,
        luuTruMinIO: trangThaiMinIO,
        phongHocLiveKit: trangThaiLiveKit,
      },
      thoiGian: new Date().toISOString(),
    };

    return duLieu;
  }
}
