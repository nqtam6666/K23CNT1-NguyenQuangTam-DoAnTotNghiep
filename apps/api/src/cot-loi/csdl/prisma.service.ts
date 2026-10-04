import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly nhatKy = new Logger(PrismaService.name);

  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? [
              { emit: 'event', level: 'query' },
              { emit: 'stdout', level: 'info' },
              { emit: 'stdout', level: 'warn' },
              { emit: 'stdout', level: 'error' },
            ]
          : [{ emit: 'stdout', level: 'error' }],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.nhatKy.log('Đã kết nối thành công đến PostgreSQL (Prisma Client)');
    } catch (loi) {
      this.nhatKy.error('Lỗi khi kết nối đến cơ sở dữ liệu:', loi);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.nhatKy.log('Đã ngắt kết nối PostgreSQL (Prisma Client)');
  }
}
