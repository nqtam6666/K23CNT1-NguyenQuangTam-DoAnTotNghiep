/**
 * Danh mục hành động phân quyền CASL
 * Tương ứng với các quyền cơ bản (CRUD) và nâng cao trong hệ thống LMS
 */
export enum HanhDong {
  QuanLy = 'manage', // Toàn quyền (CASL default)
  Doc = 'read',
  Tao = 'create',
  Sua = 'update',
  Xoa = 'delete',
  ChamDiem = 'grade',
  DiemDanh = 'attendance',
  ThamGia = 'join',
  Duyet = 'approve',
  XuatBaoCao = 'export',
}

export type LoaiHanhDong = `${HanhDong}`;
