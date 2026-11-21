import { existsSync } from 'fs';
import { join, resolve } from 'path';

/**
 * Trả về danh sách các thư mục `uploads` khả dụng trong monorepo
 * (bao gồm thư mục làm việc hiện tại, thư mục gốc repository nếu chạy qua Turbo, hoặc apps/api/uploads).
 */
export function layCacThuMucTaiLen(): string[] {
  const cacThuMuc = [
    join(process.cwd(), 'uploads'),
    join(process.cwd(), 'apps', 'api', 'uploads'),
    resolve(process.cwd(), '..', '..', 'uploads'),
    resolve(process.cwd(), '..', 'uploads'),
  ];
  return Array.from(new Set(cacThuMuc));
}

/**
 * Tìm đường dẫn tệp vật lý tồn tại trên ổ đĩa cho URL `/uploads/...`.
 */
export function timTepTaiLenTonTai(duongDanTuongDoi: string): string | null {
  const duongDanSach = duongDanTuongDoi.replace(/^\/+/, '');
  const phanCon = duongDanSach.replace(/^uploads\/?/i, '');
  if (!phanCon || phanCon.includes('..')) {
    return null;
  }

  for (const thuMucUploads of layCacThuMucTaiLen()) {
    const duongDanDayDu = join(thuMucUploads, phanCon);
    if (existsSync(duongDanDayDu)) {
      return duongDanDayDu;
    }
  }
  return null;
}
