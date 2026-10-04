import { KhungXuong } from '../../../thanh-phan/khung-xuong';

export default function CaiDatLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <KhungXuong className="h-7 w-60" />
          <KhungXuong className="h-4 w-96" />
        </div>
        <KhungXuong className="h-10 w-36 rounded-lg" />
      </div>

      {/* Tabs / Nhóm cấu hình */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <KhungXuong key={i} className="h-9 w-28 rounded-lg" />
        ))}
      </div>

      {/* Danh sách trường cài đặt */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-2 pb-5 border-b border-slate-100 last:border-0 last:pb-0">
            <div className="flex items-center justify-between">
              <KhungXuong className="h-4 w-48" />
              <KhungXuong className="h-3 w-24" />
            </div>
            <KhungXuong className="h-10 w-full rounded-lg" />
            <KhungXuong className="h-3 w-72" />
          </div>
        ))}
      </div>
    </div>
  );
}
