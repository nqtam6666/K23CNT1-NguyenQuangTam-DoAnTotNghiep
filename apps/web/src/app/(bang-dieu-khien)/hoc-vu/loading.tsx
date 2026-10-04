import { KhungXuong, KhungXuongThe } from '../../../thanh-phan/khung-xuong';

export default function HocVuLoading() {
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

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-4">
        <KhungXuong className="h-9 w-28 rounded-t" />
        <KhungXuong className="h-9 w-28 rounded-t" />
        <KhungXuong className="h-9 w-28 rounded-t" />
      </div>

      {/* Lưới các khối học vụ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <KhungXuong className="w-10 h-10 rounded-lg" />
                <div className="space-y-1.5">
                  <KhungXuong className="h-4 w-32" />
                  <KhungXuong className="h-3 w-20" />
                </div>
              </div>
              <KhungXuong className="h-8 w-24 rounded-md" />
            </div>
            <div className="space-y-2">
              <KhungXuong className="h-3 w-28" />
              <KhungXuong className="h-10 w-full rounded-lg" />
              <KhungXuong className="h-10 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
