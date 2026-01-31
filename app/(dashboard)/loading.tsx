export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-12 bg-slate-200 rounded animate-pulse w-1/3" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="h-6 bg-slate-200 rounded animate-pulse w-1/2 mb-4" />
            <div className="h-4 bg-slate-200 rounded animate-pulse w-full mb-2" />
            <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}
