import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function khoiChay() {
  const nhatKy = new Logger('LMS-KhoiDong');
  const app = await NestFactory.create(AppModule);

  // 1. Cấu hình Cookie Parser
  app.use(cookieParser());

  // 2. Cấu hình CORS an toàn
  const urlFrontend = process.env.URL_UNG_DUNG_WEB || 'http://localhost:3000';
  app.enableCors({
    origin: [urlFrontend, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // 3. Tiền tố toàn cục API
  const tienToApi = process.env.API_TIEN_TO || '/api/v1';
  app.setGlobalPrefix(tienToApi.replace(/^\//, ''));

  // 4. Cấu hình tài liệu Swagger OpenAPI
  const cauHinhSwagger = new DocumentBuilder()
    .setTitle('LMS Trường Học - API Documentation')
    .setDescription(
      'Hệ thống Quản lý Học tập LMS Trường học tích hợp LiveKit SFU & Trợ lý AI RAG (K23CNT1 - Nguyễn Quang Tâm)',
    )
    .setVersion('0.1.0')
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
  SwaggerModule.setup('api/tai-lieu', app, taiLieuSwagger, {
    customSiteTitle: 'Tài liệu API LMS Trường Học',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
    },
  });

  // 5. Khởi chạy máy chủ
  const cong = process.env.PORT || 4000;
  await app.listen(cong);

  nhatKy.log(`🚀 Máy chủ Backend API đang chạy tại: http://localhost:${cong}${tienToApi}`);
  nhatKy.log(`📖 Tài liệu Swagger OpenAPI: http://localhost:${cong}/api/tai-lieu`);
}

khoiChay();
