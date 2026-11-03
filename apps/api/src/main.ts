import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import express from 'express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AppModule } from './app.module';
import { boSungZodVaoSwagger } from './cot-loi/tai-lieu/bo-sung-zod-swagger';

async function khoiChay() {
  const nhatKy = new Logger('LMS-KhoiDong');
  const app = await NestFactory.create(AppModule);

  // 1. Cấu hình Cookie Parser
  app.use(cookieParser());

  // Phục vụ tệp tĩnh tải lên (Uploads)
  const thuMucTaiLen = join(process.cwd(), 'uploads');
  if (!existsSync(thuMucTaiLen)) {
    mkdirSync(thuMucTaiLen, { recursive: true });
  }
  const thuMucAnhDaiDien = join(thuMucTaiLen, 'avatars');
  if (!existsSync(thuMucAnhDaiDien)) {
    mkdirSync(thuMucAnhDaiDien, { recursive: true });
  }
  const thuMucThuongHieu = join(thuMucTaiLen, 'thuong-hieu');
  if (!existsSync(thuMucThuongHieu)) {
    mkdirSync(thuMucThuongHieu, { recursive: true });
  }
  const thuMucTaiLieu = join(thuMucTaiLen, 'tai-lieu');
  if (!existsSync(thuMucTaiLieu)) {
    mkdirSync(thuMucTaiLieu, { recursive: true });
  }
  const thuMucBaiNop = join(thuMucTaiLen, 'bai-nop');
  if (!existsSync(thuMucBaiNop)) {
    mkdirSync(thuMucBaiNop, { recursive: true });
  }
  app.use('/uploads', express.static(thuMucTaiLen));

  // 2. Cấu hình CORS an toàn (hỗ trợ cả Web trình duyệt và WebView máy ảo Android 10.0.2.2)
  const urlFrontend = process.env.URL_UNG_DUNG_WEB || 'http://localhost:3000';
  app.enableCors({
    origin: [
      urlFrontend,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://10.0.2.2:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // 3. Tiền tố toàn cục API
  const tienToApi = process.env.API_TIEN_TO || '/api/v1';
  app.setGlobalPrefix(tienToApi.replace(/^\//, ''));

  // 4. Cấu hình tài liệu Swagger OpenAPI
  const cauHinhSwagger = new DocumentBuilder()
    .setTitle('SmartClass AI - API Documentation')
    .setDescription(
      'Hệ thống Lớp học số tích hợp Trí tuệ nhân tạo SmartClass AI: Điểm danh thông minh, luyện tập, thi thử và quản lý kết quả học phần (K23CNT1 - Nguyễn Quang Tâm)',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Nhập JWT Access Token vào đây',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const taiLieuSwagger = SwaggerModule.createDocument(app, cauHinhSwagger);
  boSungZodVaoSwagger(app, taiLieuSwagger, tienToApi);
  SwaggerModule.setup('api/tai-lieu', app, taiLieuSwagger, {
    customSiteTitle: 'Tài liệu API — SmartClass AI',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
    },
  });

  // 5. Khởi chạy máy chủ (lắng nghe 0.0.0.0 để hỗ trợ đồng thời Web, Android Emulator 10.0.2.2 và thiết bị thật qua LAN)
  const cong = process.env.PORT || 4000;
  await app.listen(cong, '0.0.0.0');

  nhatKy.log(`Máy chủ Backend API đang chạy tại: http://localhost:${cong}${tienToApi}`);
  nhatKy.log(`Tài liệu Swagger OpenAPI: http://localhost:${cong}/api/tai-lieu`);
}

khoiChay();
