import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NhaMayQuyenHan } from './nha-may-quyen-han.factory';
import { KHOA_QUYEN_HAN, YeuCauQuyenHan } from '../cot-loi/trang-tri/kiem-tra-quyen.decorator';
import { KHOA_CONG_KHAI } from '../cot-loi/trang-tri/cong-khai.decorator';
import { MaLoiNghiepVu, PayloadJwt } from '@lms/chung';

@Injectable()
export class PhanQuyenCaslGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly nhaMayQuyenHan: NhaMayQuyenHan,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const laCongKhai = this.reflector.getAllAndOverride<boolean>(KHOA_CONG_KHAI, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (laCongKhai) {
      return true;
    }

    const yeuCauQuyen = this.reflector.getAllAndOverride<YeuCauQuyenHan>(KHOA_QUYEN_HAN, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Nếu không yêu cầu quyền cụ thể thì mặc định cho phép khi đã qua AuthGuard
    if (!yeuCauQuyen) {
      return true;
    }

    const yeuCauHttp = context.switchToHttp().getRequest();
    const nguoiDung = yeuCauHttp.user as PayloadJwt;

    if (!nguoiDung) {
      throw new ForbiddenException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
        thongDiep: 'Không tìm thấy thông tin xác thực của người dùng',
      });
    }

    const khaNang = this.nhaMayQuyenHan.taoQuyenChoNguoiDung(nguoiDung);
    const duocPhep = khaNang.can(yeuCauQuyen.hanhDong, yeuCauQuyen.doiTuong);

    if (!duocPhep) {
      throw new ForbiddenException({
        thanhCong: false,
        maLoi: MaLoiNghiepVu.KHONG_CO_QUYEN_TRUY_CAP,
        thongDiep: `Bạn không có quyền ${yeuCauQuyen.hanhDong} trên tài nguyên ${yeuCauQuyen.doiTuong}`,
      });
    }

    return true;
  }
}
