'use client'

const SOURCES = [
  'all',
  'WHO',
  'CDC',
  'NIH',
  'PubMed',
  'MedicalXpress',
  'Google News Health',
  'Reuters Health',
]

const SOURCE_COLORS: Record<string, string> = {
  all: 'from-slate-500 to-slate-600',
  WHO: 'from-blue-500 to-blue-600',
  CDC: 'from-red-500 to-red-600',
  NIH: 'from-green-500 to-green-600',
  PubMed: 'from-purple-500 to-purple-600',
  MedicalXpress: 'from-orange-500 to-orange-600',
  'Google News Health': 'from-yellow-500 to-yellow-600',
  'Reuters Health': 'from-pink-500 to-pink-600',
}

export default function NewsFilter({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (source: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {SOURCES.map((source) => {
        const isActive = selected === source
        const gradient = SOURCE_COLORS[source] || 'from-slate-500 to-slate-600'
        return (
          <button
            key={source}
            onClick={() => onSelect(source)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
              isActive
                ? `bg-gradient-to-r ${gradient} text-white shadow-md scale-105`
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {source === 'all' ? '📰 All Sources' : source}
          </button>
        )
      })}
    </div>
  )
}
