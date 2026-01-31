export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow">
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded animate-pulse w-1/2" />
            <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
            <div className="space-y-3 pt-4">
              <div className="h-10 bg-slate-200 rounded animate-pulse" />
              <div className="h-10 bg-slate-200 rounded animate-pulse" />
              <div className="h-10 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
