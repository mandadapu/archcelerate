export default function DiagnosisLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="h-8 bg-slate-200 rounded animate-pulse w-1/3" />
        <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2" />
      </div>
      <div className="h-2 bg-slate-200 rounded animate-pulse" />
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <div className="h-6 bg-slate-200 rounded animate-pulse w-3/4 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-12 bg-slate-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
