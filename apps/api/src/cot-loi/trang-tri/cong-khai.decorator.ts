import { SetMetadata } from '@nestjs/common';

export const KHOA_CONG_KHAI = 'la_cong_khai';
export const CongKhai = () => SetMetadata(KHOA_CONG_KHAI, true);
