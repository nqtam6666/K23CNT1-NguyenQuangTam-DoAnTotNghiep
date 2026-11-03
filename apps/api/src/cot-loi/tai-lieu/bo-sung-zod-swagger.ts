import { INestApplication } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import { OpenAPIObject } from '@nestjs/swagger';

const KHOA_DUONG_DAN = 'path';
const KHOA_PHUONG_THUC = 'method';
const KHOA_THAM_SO_ROUTE = '__routeArguments__';

const BAN_DO_PHUONG_THUC_HTTP: Record<number, string> = {
  0: 'get',
  1: 'post',
  2: 'put',
  3: 'delete',
  4: 'patch',
  6: 'options',
  7: 'head',
};

const TU_DIEN_MO_TA_VA_VI_DU: Record<
  string,
  { moTa: string; viDu: unknown }
> = {
  email: {
    moTa: 'Địa chỉ email tài khoản người dùng',
    viDu: 'hocsinh.moi@lms.edu.vn',
  },
  matKhau: {
    moTa: 'Mật khẩu tài khoản (tối thiểu 8 ký tự khi đăng ký, 6 ký tự khi đăng nhập)',
    viDu: 'MatKhau@123',
  },
  matKhauHienTai: {
    moTa: 'Mật khẩu đang sử dụng hiện tại',
    viDu: 'MatKhau@123',
  },
  matKhauMoi: {
    moTa: 'Mật khẩu mới muốn thiết lập (tối thiểu 8 ký tự)',
    viDu: 'MatKhauMoi@2026',
  },
  xacNhanMatKhauMoi: {
    moTa: 'Nhập lại mật khẩu mới để xác nhận khớp',
    viDu: 'MatKhauMoi@2026',
  },
  hoTen: {
    moTa: 'Họ và tên đầy đủ của người dùng',
    viDu: 'Nguyễn Văn An',
  },
  soDienThoai: {
    moTa: 'Số điện thoại liên hệ (10-11 chữ số)',
    viDu: '0987654321',
  },
  vaiTro: {
    moTa: 'Vai trò hệ thống (QUAN_TRI_VIEN, BAN_GIAM_HIEU, GIAO_VU, GIAO_VIEN, HOC_SINH, PHU_HUYNH)',
    viDu: 'HOC_SINH',
  },
  kichHoat: {
    moTa: 'Trạng thái kích hoạt tài khoản (true: hoạt động, false: tạm khóa)',
    viDu: true,
  },
  lyDo: {
    moTa: 'Lý do thay đổi trạng thái hoặc khóa tài khoản',
    viDu: 'Cập nhật theo danh sách học vụ đầu kỳ',
  },
  refreshToken: {
    moTa: 'Chuỗi Refresh Token (tùy chọn nếu trình duyệt đã gửi kèm HttpOnly Cookie)',
    viDu: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  },
  trang: {
    moTa: 'Số thứ tự trang hiện tại (bắt đầu từ 1)',
    viDu: 1,
  },
  gioiHan: {
    moTa: 'Số lượng bản ghi tối đa trên mỗi trang (1 - 100)',
    viDu: 20,
  },
  kichThuoc: {
    moTa: 'Số lượng bản ghi hiển thị trên mỗi trang (1 - 100)',
    viDu: 10,
  },
  tuKhoa: {
    moTa: 'Từ khóa tìm kiếm theo tên, mã hoặc email',
    viDu: 'Nguyễn',
  },
  sapXepTheo: {
    moTa: 'Tên trường dùng để sắp xếp kết quả',
    viDu: 'ngayTao',
  },
  thuTu: {
    moTa: 'Thứ tự sắp xếp (asc: tăng dần, desc: giảm dần)',
    viDu: 'desc',
  },
  tieuDe: {
    moTa: 'Tiêu đề bài đăng, tài liệu, bài tập hoặc đề kiểm tra',
    viDu: 'Bài tập tổng hợp Chương 1: Hàm số và Đồ thị',
  },
  noiDung: {
    moTa: 'Nội dung chi tiết hoặc câu hỏi gửi lên hệ thống',
    viDu: 'Giải thích giúp em định lý Viète và cho ví dụ minh họa cụ thể.',
  },
  moTa: {
    moTa: 'Mô tả tóm tắt hoặc hướng dẫn chi tiết',
    viDu: 'Tài liệu ôn tập trọng tâm phục vụ kiểm tra giữa học kỳ 1',
  },
  maThamGia: {
    moTa: 'Mã mời tham gia lớp học phần (6 ký tự in hoa)',
    viDu: 'TOAN10',
  },
  tenNamHoc: {
    moTa: 'Tên năm học (ví dụ: 2025 - 2026)',
    viDu: '2025 - 2026',
  },
  tenHocKy: {
    moTa: 'Tên học kỳ trong năm học',
    viDu: 'Học kỳ 1',
  },
  maMonHoc: {
    moTa: 'Mã định danh môn học',
    viDu: 'TOAN12',
  },
  tenMonHoc: {
    moTa: 'Tên môn học chính thức',
    viDu: 'Toán học 12',
  },
  tenLop: {
    moTa: 'Tên lớp hành chính',
    viDu: '12A1',
  },
  khoiLop: {
    moTa: 'Khối lớp (từ khối 1 đến khối 12)',
    viDu: 12,
  },
  maLopHocPhan: {
    moTa: 'Mã lớp học phần duy nhất',
    viDu: 'LHP-TOAN12A1-HK1',
  },
  tenLopHocPhan: {
    moTa: 'Tên hiển thị của lớp học phần',
    viDu: 'Toán 12A1 - Học kỳ 1',
  },
  diemSo: {
    moTa: 'Điểm số đánh giá (thang điểm 0 - 10)',
    viDu: 8.5,
  },
  nhanXet: {
    moTa: 'Nhận xét chi tiết của giáo viên hoặc đánh giá học liệu',
    viDu: 'Bài làm trình bày rõ ràng, lập luận chặt chẽ.',
  },
  soSao: {
    moTa: 'Điểm đánh giá chất lượng học liệu (từ 1 đến 5 sao)',
    viDu: 5,
  },
  chuDe: {
    moTa: 'Chủ đề hoặc chương kiến thức trọng tâm',
    viDu: 'Chương 1: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số',
  },
  soLuongCau: {
    moTa: 'Số lượng câu hỏi trắc nghiệm muốn sinh tự động (3 - 20)',
    viDu: 5,
  },
  thoiGianLamBaiPhut: {
    moTa: 'Thời gian làm bài kiểm tra tính bằng phút',
    viDu: 45,
  },
};

interface KetQuaPhanTichZod {
  schemaOpenApi: Record<string, any>;
  laBatBuoc: boolean;
  giaTriViDu?: unknown;
}

/**
 * Chuyển đổi đệ quy một ZodSchema sang OpenAPI 3.0 Schema Object
 */
function phanTichZodSchema(
  zodSchema: any,
  tenTruong?: string,
): KetQuaPhanTichZod {
  if (!zodSchema || !zodSchema._def) {
    return { schemaOpenApi: { type: 'string' }, laBatBuoc: true };
  }

  let current = zodSchema;
  let laBatBuoc = true;
  let coTheNull = false;
  let giaTriMacDinh: unknown = undefined;

  // Bóc tách các lớp bọc ngoài (Optional, Nullable, Default, Effects, Catch, Coerce...)
  let gioiHanVongLap = 0;
  while (current && current._def && gioiHanVongLap < 20) {
    gioiHanVongLap++;
    const typeName = current._def.typeName;

    if (typeName === 'ZodOptional') {
      laBatBuoc = false;
      current = current._def.innerType;
      continue;
    }
    if (typeName === 'ZodNullable') {
      coTheNull = true;
      current = current._def.innerType;
      continue;
    }
    if (typeName === 'ZodDefault') {
      laBatBuoc = false;
      try {
        giaTriMacDinh = current._def.defaultValue();
      } catch {
        // Bỏ qua nếu hàm defaultValue cần ngữ cảnh
      }
      current = current._def.innerType;
      continue;
    }
    if (typeName === 'ZodEffects') {
      current = current._def.schema;
      continue;
    }
    if (typeName === 'ZodCatch' || typeName === 'ZodReadonly' || typeName === 'ZodBranded') {
      current = current._def.innerType || current._def.type;
      continue;
    }
    if (typeName === 'ZodPipeline') {
      current = current._def.in;
      continue;
    }
    break;
  }

  const def = current?._def || {};
  const typeName = def.typeName;
  const goiY = tenTruong ? TU_DIEN_MO_TA_VA_VI_DU[tenTruong] : undefined;

  // 1. ZodObject
  if (typeName === 'ZodObject') {
    const rawShape = typeof def.shape === 'function' ? def.shape() : def.shape || {};
    const properties: Record<string, any> = {};
    const required: string[] = [];
    const exampleObj: Record<string, any> = {};

    for (const [khoa, schemaCon] of Object.entries(rawShape)) {
      const ketQuaCon = phanTichZodSchema(schemaCon, khoa);
      properties[khoa] = ketQuaCon.schemaOpenApi;
      if (ketQuaCon.laBatBuoc) {
        required.push(khoa);
      }
      if (ketQuaCon.giaTriViDu !== undefined) {
        exampleObj[khoa] = ketQuaCon.giaTriViDu;
      }
    }

    const schemaOpenApi: Record<string, any> = {
      type: 'object',
      properties,
    };
    if (required.length > 0) {
      schemaOpenApi.required = required;
    }
    if (Object.keys(exampleObj).length > 0) {
      schemaOpenApi.example = exampleObj;
    }
    return {
      schemaOpenApi,
      laBatBuoc,
      giaTriViDu: Object.keys(exampleObj).length > 0 ? exampleObj : undefined,
    };
  }

  // 2. ZodArray
  if (typeName === 'ZodArray') {
    const phanTu = phanTichZodSchema(def.type);
    const schemaOpenApi: Record<string, any> = {
      type: 'array',
      items: phanTu.schemaOpenApi,
    };
    if (def.minLength?.value !== undefined) {
      schemaOpenApi.minItems = def.minLength.value;
    }
    if (def.maxLength?.value !== undefined) {
      schemaOpenApi.maxItems = def.maxLength.value;
    }
    if (goiY?.moTa) {
      schemaOpenApi.description = goiY.moTa;
    }
    const viDuMang =
      goiY?.viDu !== undefined
        ? goiY.viDu
        : phanTu.giaTriViDu !== undefined
          ? [phanTu.giaTriViDu]
          : [];
    schemaOpenApi.example = viDuMang;
    return {
      schemaOpenApi,
      laBatBuoc,
      giaTriViDu: viDuMang,
    };
  }

  // 3. ZodEnum & ZodNativeEnum
  if (typeName === 'ZodEnum' || typeName === 'ZodNativeEnum') {
    const danhSachGiaTri =
      typeName === 'ZodEnum'
        ? def.values || []
        : Object.values(def.values || {}).filter(
            (v) => typeof v === 'string' || typeof v === 'number',
          );
    const viDu =
      giaTriMacDinh !== undefined
        ? giaTriMacDinh
        : goiY?.viDu !== undefined
          ? goiY.viDu
          : danhSachGiaTri[0];
    const schemaOpenApi: Record<string, any> = {
      type: typeof danhSachGiaTri[0] === 'number' ? 'number' : 'string',
      enum: danhSachGiaTri,
    };
    if (goiY?.moTa) {
      schemaOpenApi.description = goiY.moTa;
    }
    if (giaTriMacDinh !== undefined) {
      schemaOpenApi.default = giaTriMacDinh;
    }
    if (viDu !== undefined) {
      schemaOpenApi.example = viDu;
    }
    if (coTheNull) {
      schemaOpenApi.nullable = true;
    }
    return { schemaOpenApi, laBatBuoc, giaTriViDu: viDu };
  }

  // 4. ZodBoolean
  if (typeName === 'ZodBoolean') {
    const viDu =
      giaTriMacDinh !== undefined
        ? giaTriMacDinh
        : goiY?.viDu !== undefined
          ? goiY.viDu
          : true;
    const schemaOpenApi: Record<string, any> = {
      type: 'boolean',
      example: viDu,
    };
    if (goiY?.moTa) {
      schemaOpenApi.description = goiY.moTa;
    }
    if (giaTriMacDinh !== undefined) {
      schemaOpenApi.default = giaTriMacDinh;
    }
    if (coTheNull) {
      schemaOpenApi.nullable = true;
    }
    return { schemaOpenApi, laBatBuoc, giaTriViDu: viDu };
  }

  // 5. ZodNumber
  if (typeName === 'ZodNumber') {
    const checks: any[] = def.checks || [];
    const laSoNguyen = checks.some((c) => c.kind === 'int');
    const minCheck = checks.find((c) => c.kind === 'min');
    const maxCheck = checks.find((c) => c.kind === 'max');
    const viDu =
      giaTriMacDinh !== undefined
        ? giaTriMacDinh
        : goiY?.viDu !== undefined
          ? goiY.viDu
          : minCheck?.value !== undefined
            ? minCheck.value
            : 1;
    const schemaOpenApi: Record<string, any> = {
      type: laSoNguyen ? 'integer' : 'number',
      example: viDu,
    };
    if (minCheck?.value !== undefined) {
      schemaOpenApi.minimum = minCheck.value;
    }
    if (maxCheck?.value !== undefined) {
      schemaOpenApi.maximum = maxCheck.value;
    }
    if (goiY?.moTa) {
      schemaOpenApi.description = goiY.moTa;
    }
    if (giaTriMacDinh !== undefined) {
      schemaOpenApi.default = giaTriMacDinh;
    }
    if (coTheNull) {
      schemaOpenApi.nullable = true;
    }
    return { schemaOpenApi, laBatBuoc, giaTriViDu: viDu };
  }

  // 6. ZodRecord / ZodAny / ZodUnknown
  if (typeName === 'ZodRecord' || typeName === 'ZodAny' || typeName === 'ZodUnknown') {
    const schemaOpenApi: Record<string, any> = {
      type: 'object',
      additionalProperties: true,
    };
    if (goiY?.moTa) {
      schemaOpenApi.description = goiY.moTa;
    }
    return { schemaOpenApi, laBatBuoc, giaTriViDu: {} };
  }

  // 7. Mặc định: ZodString (và các kiểu chuỗi)
  const checks: any[] = def.checks || [];
  const laEmail = checks.some((c) => c.kind === 'email');
  const laUuid = checks.some((c) => c.kind === 'uuid');
  const laDatetime = checks.some((c) => c.kind === 'datetime');
  const minCheck = checks.find((c) => c.kind === 'min');
  const maxCheck = checks.find((c) => c.kind === 'max');

  let viDu: unknown =
    giaTriMacDinh !== undefined
      ? giaTriMacDinh
      : goiY?.viDu !== undefined
        ? goiY.viDu
        : undefined;

  if (viDu === undefined) {
    if (laEmail) {
      viDu = 'nguoidung@lms.edu.vn';
    } else if (laUuid || (tenTruong && tenTruong.startsWith('id'))) {
      viDu = '550e8400-e29b-41d4-a716-446655440000';
    } else if (laDatetime || (tenTruong && tenTruong.startsWith('ngay')) || (tenTruong && tenTruong.startsWith('thoiGian'))) {
      viDu = '2026-09-05T07:30:00.000Z';
    } else {
      viDu = 'Giá trị mẫu';
    }
  }

  const schemaOpenApi: Record<string, any> = {
    type: 'string',
    example: viDu,
  };
  if (laEmail) {
    schemaOpenApi.format = 'email';
  } else if (laUuid) {
    schemaOpenApi.format = 'uuid';
  } else if (laDatetime) {
    schemaOpenApi.format = 'date-time';
  }
  if (minCheck?.value !== undefined) {
    schemaOpenApi.minLength = minCheck.value;
  }
  if (maxCheck?.value !== undefined) {
    schemaOpenApi.maxLength = maxCheck.value;
  }
  if (goiY?.moTa) {
    schemaOpenApi.description = goiY.moTa;
  } else if (tenTruong && tenTruong.startsWith('id')) {
    schemaOpenApi.description = `Mã định danh UUID (${tenTruong})`;
  }
  if (giaTriMacDinh !== undefined) {
    schemaOpenApi.default = giaTriMacDinh;
  }
  if (coTheNull) {
    schemaOpenApi.nullable = true;
  }

  return { schemaOpenApi, laBatBuoc, giaTriViDu: viDu };
}

/**
 * Chuẩn hóa đường dẫn NestJS (:id) sang chuẩn OpenAPI ({id})
 */
function chuanHoaDuongDanOpenApi(
  tienToApi: string,
  duongDanController: string,
  duongDanMethod: string,
): string {
  const cacPhan = [tienToApi, duongDanController, duongDanMethod]
    .map((p) => String(p || '').replace(/^\/+|\/+$/g, ''))
    .filter(Boolean);
  const ghep = '/' + cacPhan.join('/');
  return ghep.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');
}

/**
 * Tự động quét seluruh Controller trong ứng dụng NestJS để trích xuất ZodSchema
 * từ `ZodValidationPipe` trên `@Body()` và `@Query()`, sau đó bổ sung đầy đủ
 * `requestBody` và `parameters` vào tài liệu Swagger OpenAPI 3.0.
 */
export function boSungZodVaoSwagger(
  app: INestApplication,
  taiLieuSwagger: OpenAPIObject,
  tienToApi: string,
): void {
  const modulesContainer = app.get(ModulesContainer);

  for (const moduleRef of modulesContainer.values()) {
    for (const controllerWrapper of moduleRef.controllers.values()) {
      const instance = controllerWrapper.instance;
      const metatype = controllerWrapper.metatype;
      if (!instance || !metatype) continue;

      const rawCtrlPath = Reflect.getMetadata(KHOA_DUONG_DAN, metatype) || '';
      const duongDanController = Array.isArray(rawCtrlPath)
        ? rawCtrlPath[0]
        : rawCtrlPath;

      const prototype = Object.getPrototypeOf(instance);
      const danhSachHam = Object.getOwnPropertyNames(prototype).filter(
        (ten) => ten !== 'constructor' && typeof prototype[ten] === 'function',
      );

      for (const tenHam of danhSachHam) {
        const methodRef = prototype[tenHam];
        const maPhuongThuc = Reflect.getMetadata(KHOA_PHUONG_THUC, methodRef);
        if (maPhuongThuc === undefined) continue;

        const httpMethod = BAN_DO_PHUONG_THUC_HTTP[maPhuongThuc];
        if (!httpMethod) continue;

        const rawMethodPath = Reflect.getMetadata(KHOA_DUONG_DAN, methodRef) || '';
        const duongDanMethod = Array.isArray(rawMethodPath)
          ? rawMethodPath[0]
          : rawMethodPath;

        const duongDanOpenApi = chuanHoaDuongDanOpenApi(
          tienToApi,
          duongDanController,
          duongDanMethod,
        );

        const pathItem = taiLieuSwagger.paths?.[duongDanOpenApi] as
          | Record<string, any>
          | undefined;
        const operation = pathItem?.[httpMethod];
        if (!operation) continue;

        const routeArgs =
          Reflect.getMetadata(KHOA_THAM_SO_ROUTE, metatype, tenHam) ||
          Reflect.getMetadata(KHOA_THAM_SO_ROUTE, instance, tenHam) ||
          {};

        let schemaBodyZod: Record<string, any> | null = null;
        const thuocTinhBodyDonLe: Record<string, any> = {};
        let coUploadedFile = false;

        for (const [khoaArg, thongTinArg] of Object.entries<any>(routeArgs)) {
          const tienToLoai = String(khoaArg).split(':')[0];
          const loaiThamSo = Number(tienToLoai);
          const danhSachPipe: any[] = thongTinArg?.pipes || [];
          const tenTruongDonLe =
            typeof thongTinArg?.data === 'string' ? thongTinArg.data : undefined;

          // Tìm ZodValidationPipe trong danh sách pipes của tham số
          const pipeZod = danhSachPipe.find(
            (p) => p && typeof p === 'object' && p.schema && p.schema._def,
          );

          // RouteParamtypes.BODY === 3
          if (loaiThamSo === 3) {
            if (pipeZod?.schema) {
              const ketQua = phanTichZodSchema(pipeZod.schema);
              schemaBodyZod = ketQua.schemaOpenApi;
            } else if (tenTruongDonLe) {
              const goiY = TU_DIEN_MO_TA_VA_VI_DU[tenTruongDonLe];
              thuocTinhBodyDonLe[tenTruongDonLe] = {
                type: 'string',
                description: goiY?.moTa || `Trường dữ liệu ${tenTruongDonLe}`,
                example: goiY?.viDu ?? 'Giá trị mẫu',
              };
            }
          }

          // RouteParamtypes.FILE === 8 (@UploadedFile)
          if (loaiThamSo === 8) {
            coUploadedFile = true;
          }

          // RouteParamtypes.QUERY === 4
          if (loaiThamSo === 4) {
            operation.parameters = Array.isArray(operation.parameters)
              ? operation.parameters
              : [];

            if (pipeZod?.schema) {
              const ketQuaQuery = phanTichZodSchema(pipeZod.schema);
              const thuocTinhQuery = ketQuaQuery.schemaOpenApi?.properties || {};
              const danhSachBatBuoc: string[] =
                ketQuaQuery.schemaOpenApi?.required || [];

              for (const [tenQuery, schemaThuocTinh] of Object.entries<any>(
                thuocTinhQuery,
              )) {
                const daTonTai = operation.parameters.find(
                  (p: any) => p.name === tenQuery && p.in === 'query',
                );
                const moTaQuery =
                  schemaThuocTinh.description ||
                  TU_DIEN_MO_TA_VA_VI_DU[tenQuery]?.moTa ||
                  `Tham số lọc/truy vấn ${tenQuery}`;

                if (daTonTai) {
                  daTonTai.required = danhSachBatBuoc.includes(tenQuery);
                  daTonTai.description = daTonTai.description || moTaQuery;
                  daTonTai.schema = schemaThuocTinh;
                } else {
                  operation.parameters.push({
                    name: tenQuery,
                    in: 'query',
                    required: danhSachBatBuoc.includes(tenQuery),
                    description: moTaQuery,
                    schema: schemaThuocTinh,
                  });
                }
              }
            } else if (tenTruongDonLe) {
              const daTonTai = operation.parameters.find(
                (p: any) => p.name === tenTruongDonLe && p.in === 'query',
              );
              const goiY = TU_DIEN_MO_TA_VA_VI_DU[tenTruongDonLe];
              if (daTonTai) {
                daTonTai.required = false;
                daTonTai.description =
                  daTonTai.description ||
                  goiY?.moTa ||
                  `Tham số truy vấn ${tenTruongDonLe}`;
              } else {
                operation.parameters.push({
                  name: tenTruongDonLe,
                  in: 'query',
                  required: false,
                  description:
                    goiY?.moTa || `Tham số truy vấn ${tenTruongDonLe} (tùy chọn)`,
                  schema: {
                    type: 'string',
                    example: goiY?.viDu ?? '',
                  },
                });
              }
            }
          }
        }

        // Gắn requestBody nếu route có @Body(ZodValidationPipe), @Body('field') hoặc @UploadedFile()
        if (coUploadedFile) {
          const propertiesMultipart: Record<string, any> = {
            tep: {
              type: 'string',
              format: 'binary',
              description: 'Tệp đính kèm tải lên từ máy tính',
            },
            ...thuocTinhBodyDonLe,
          };
          operation.requestBody = {
            required: true,
            description: 'Biểu mẫu tải lên tệp đính kèm (multipart/form-data)',
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: propertiesMultipart,
                },
              },
            },
          };
        } else if (schemaBodyZod) {
          operation.requestBody = {
            required: true,
            description: 'Dữ liệu JSON đầu vào (được kiểm duyệt qua Zod Schema)',
            content: {
              'application/json': {
                schema: schemaBodyZod,
              },
            },
          };
        } else if (Object.keys(thuocTinhBodyDonLe).length > 0) {
          operation.requestBody = {
            required: true,
            description: 'Dữ liệu JSON đầu vào',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: thuocTinhBodyDonLe,
                },
              },
            },
          };
        }
      }
    }
  }
}
