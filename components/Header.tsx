export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow">
            ⚕
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">Medical News Agent</h1>
            <p className="text-xs text-slate-400">AI-powered health news · WHO · CDC · NIH · PubMed · more</p>
          </div>
        </div>
        <span className="hidden sm:block text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
          Auto-updates every 6h
        </span>
      </div>
    </header>
  )
}
