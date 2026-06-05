'use client'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import type { Article } from '@/lib/types'

const SOURCE_BADGE: Record<string, string> = {
  WHO: 'bg-blue-100 text-blue-700 border-blue-200',
  CDC: 'bg-red-100 text-red-700 border-red-200',
  NIH: 'bg-green-100 text-green-700 border-green-200',
  PubMed: 'bg-purple-100 text-purple-700 border-purple-200',
  MedicalXpress: 'bg-orange-100 text-orange-700 border-orange-200',
  'Google News Health': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Reuters Health': 'bg-pink-100 text-pink-700 border-pink-200',
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
  } catch {
    return ''
  }
}

export default function NewsCard({ article }: { article: Article }) {
  const [lang, setLang] = useState<'en' | 'ko'>('en')
  const badge = SOURCE_BADGE[article.source] || 'bg-slate-100 text-slate-700 border-slate-200'
  const ago = timeAgo(article.published_at) || timeAgo(article.created_at)
  const summary = lang === 'en' ? article.summary : article.summary_ko
  const hasBoth = article.summary && article.summary_ko

  return (
    <article className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-3 hover:shadow-lg hover:border-slate-300 transition-all duration-200 group">
      {/* Source + Time */}
      <div className="flex items-center justify-between gap-2">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badge}`}>
          {article.source}
        </span>
        {ago && <span className="text-xs text-slate-400 shrink-0">{ago}</span>}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
        <a href={article.url} target="_blank" rel="noopener noreferrer">
          {article.title}
        </a>
      </h3>

      {/* AI Summary */}
      {summary && (
        <div className="bg-slate-50 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">🤖 AI Summary</span>
            {hasBoth && (
              <div className="ml-auto flex rounded-lg overflow-hidden border border-slate-200">
                <button
                  onClick={() => setLang('en')}
                  className={`text-xs px-2 py-0.5 transition-colors ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLang('ko')}
                  className={`text-xs px-2 py-0.5 transition-colors ${lang === 'ko' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  한
                </button>
              </div>
            )}
          </div>
          <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Link */}
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto text-xs text-blue-500 hover:text-blue-700 font-medium inline-flex items-center gap-1 transition-colors"
      >
        Read full article →
      </a>
    </article>
  )
}
