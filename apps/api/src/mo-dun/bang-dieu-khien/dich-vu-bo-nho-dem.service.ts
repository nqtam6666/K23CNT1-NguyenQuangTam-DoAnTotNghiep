import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class DichVuBoNhoDem implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DichVuBoNhoDem.name);
  private redis: Redis | null = null;
  private boNhoDemTam = new Map<string, { duLieu: any; hetHanLuc: number }>();

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const host = this.config.get<string>('REDIS_HOST', 'localhost');
    const port = Number(this.config.get<number>('REDIS_CONG', 6379));
    const password = this.config.get<string>('REDIS_MAT_KHAU') || undefined;

    try {
      this.redis = new Redis({
        host,
        port,
        password,
        lazyConnect: true,
        connectTimeout: 3000,
        maxRetriesPerRequest: 1,
      });

      this.redis.connect().catch((err) => {
        this.logger.warn(`Không thể kết nối Redis (${host}:${port}): ${err.message}. Sử dụng bộ nhớ đệm nội bộ tạm thời.`);
      });

      this.redis.on('error', (err) => {
        this.logger.warn(`Cảnh báo Redis: ${err.message}`);
      });
    } catch (err: any) {
      this.logger.warn(`Khởi tạo Redis thất bại: ${err.message}. Sử dụng bộ nhớ đệm nội bộ.`);
    }
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit().catch(() => {});
    }
  }

  async lay<T = any>(khoa: string): Promise<T | null> {
    if (this.redis && this.redis.status === 'ready') {
      try {
        const duLieu = await this.redis.get(khoa);
        if (duLieu) {
          return JSON.parse(duLieu) as T;
        }
      } catch (err: any) {
        this.logger.warn(`Lỗi đọc Redis [${khoa}]: ${err.message}`);
      }
    }

    // Fallback: Bộ nhớ nội bộ
    const mucDem = this.boNhoDemTam.get(khoa);
    if (mucDem && mucDem.hetHanLuc > Date.now()) {
      return mucDem.duLieu as T;
    }
    this.boNhoDemTam.delete(khoa);
    return null;
  }

  async luu(khoa: string, duLieu: any, ttlGiay = 60): Promise<void> {
    const chuoiJson = JSON.stringify(duLieu);

    if (this.redis && this.redis.status === 'ready') {
      try {
        await this.redis.setex(khoa, ttlGiay, chuoiJson);
        return;
      } catch (err: any) {
        this.logger.warn(`Lỗi ghi Redis [${khoa}]: ${err.message}`);
      }
    }

    // Fallback: Bộ nhớ nội bộ
    this.boNhoDemTam.set(khoa, {
      duLieu,
      hetHanLuc: Date.now() + ttlGiay * 1000,
    });
  }

  async xoa(khoa: string): Promise<void> {
    if (this.redis && this.redis.status === 'ready') {
      try {
        await this.redis.del(khoa);
      } catch {
        // Bỏ qua lỗi xóa
      }
    }
    this.boNhoDemTam.delete(khoa);
  }

  async kiemTraKetNoi(): Promise<boolean> {
    if (!this.redis) return false;
    try {
      const phanHoi = await this.redis.ping();
      return phanHoi === 'PONG';
    } catch {
      return false;
    }
  }
}
