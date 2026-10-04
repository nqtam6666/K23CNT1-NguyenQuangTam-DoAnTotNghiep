import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PhanHoiChuan } from '@lms/chung';

@Injectable()
export class DinhDangPhanHoiInterceptor<T> implements NestInterceptor<T, PhanHoiChuan<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<PhanHoiChuan<T>> {
    return next.handle().pipe(
      map((duLieu) => {
        // Nếu kết quả đã được format sẵn thì giữ nguyên
        if (duLieu && typeof duLieu === 'object' && 'thanhCong' in duLieu && 'duLieu' in duLieu) {
          return duLieu;
        }

        return {
          thanhCong: true,
          duLieu,
          thoiGian: new Date().toISOString(),
        };
      }),
    );
  }
}
