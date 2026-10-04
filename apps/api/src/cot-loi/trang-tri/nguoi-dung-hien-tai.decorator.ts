import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PayloadJwt } from '@lms/chung';

export const NguoiDungHienTai = createParamDecorator(
  (truong: keyof PayloadJwt | undefined, ctx: ExecutionContext) => {
    const yeuCau = ctx.switchToHttp().getRequest();
    const nguoiDung = yeuCau.user as PayloadJwt;

    if (!nguoiDung) {
      return null;
    }

    return truong ? nguoiDung[truong] : nguoiDung;
  },
);
