import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { KHOA_CONG_KHAI } from '../../../cot-loi/trang-tri/cong-khai.decorator';
import { MaLoiNghiepVu } from '@lms/chung';

@Injectable()
export class XacThucJwtGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const laCongKhai = this.reflector.getAllAndOverride<boolean>(KHOA_CONG_KHAI, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (laCongKhai) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException({
          thanhCong: false,
          maLoi: MaLoiNghiepVu.XAC_THUC_THAT_BAI,
          thongDiep: 'Yêu cầu đăng nhập để truy cập tài nguyên này',
          chiTiet: info?.message,
        })
      );
    }
    return user;
  }
}
