import { KhungXuong, KhungXuongBang } from '../../../thanh-phan/khung-xuong';

export default function NguoiDungLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <KhungXuong className="h-7 w-60" />
          <KhungXuong className="h-4 w-96" />
        </div>
        <KhungXuong className="h-10 w-44 rounded-lg" />
      </div>

      {/* Tìm kiếm & Lọc */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-4">
        <KhungXuong className="h-10 flex-1 w-full rounded-lg" />
        <KhungXuong className="h-10 w-full sm:w-60 rounded-lg" />
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <KhungXuongBang soDong={6} soCot={5} />
      </div>
    </div>
  );
}
