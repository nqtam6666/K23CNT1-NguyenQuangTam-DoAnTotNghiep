import { KhungXuong, KhungXuongThe } from '../../../thanh-phan/khung-xuong';

export default function LopHocPhanLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <KhungXuong className="h-7 w-64" />
          <KhungXuong className="h-4 w-96" />
        </div>
        <KhungXuong className="h-10 w-40 rounded-lg" />
      </div>

      {/* Tìm kiếm */}
      <div className="w-full sm:w-96">
        <KhungXuong className="h-10 w-full rounded-lg" />
      </div>

      {/* Lưới thẻ lớp học phần */}
      <KhungXuongThe soLuong={6} />
    </div>
  );
}
