import { KhungXuong } from '../../../thanh-phan/khung-xuong';

export default function ThoiKhoaBieuLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <KhungXuong className="h-7 w-60" />
          <KhungXuong className="h-4 w-96" />
        </div>
        <div className="flex items-center gap-3">
          <KhungXuong className="h-9 w-40 rounded-lg" />
          <KhungXuong className="h-9 w-24 rounded-lg" />
        </div>
      </div>

      {/* Lưới lịch tuần khung xương */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-8 gap-3 pb-3 border-b border-slate-200">
          {Array.from({ length: 8 }).map((_, i) => (
            <KhungXuong key={i} className="h-6 w-full rounded" />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, r) => (
          <div key={r} className="grid grid-cols-8 gap-3 py-2 border-b border-slate-100 last:border-0">
            <KhungXuong className="h-12 w-full rounded bg-slate-100" />
            {Array.from({ length: 7 }).map((_, c) => (
              <KhungXuong
                key={c}
                className={`h-12 w-full rounded ${
                  (r + c) % 3 === 0 ? 'bg-indigo-100/60' : 'bg-slate-50'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
