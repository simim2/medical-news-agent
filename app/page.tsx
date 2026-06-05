'use client'
import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/Header'
import NewsCard from '@/components/NewsCard'
import NewsFilter from '@/components/NewsFilter'
import type { Article } from '@/lib/types'

const SOURCES_LIST = [
  'WHO', 'CDC', 'NIH', 'PubMed',
  'MedicalXpress', 'Google News Health', 'Reuters Health',
]

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
      <div className="flex gap-2 mb-3">
        <div className="h-6 bg-slate-200 rounded-full w-20" />
        <div className="h-6 bg-slate-100 rounded-full w-16 ml-auto" />
      </div>
      <div className="h-5 bg-slate-200 rounded w-full mb-2" />
      <div className="h-5 bg-slate-200 rounded w-3/4 mb-4" />
      <div className="bg-slate-50 rounded-xl p-3 space-y-2">
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-5/6" />
        <div className="h-3 bg-slate-200 rounded w-4/6" />
      </div>
    </div>
  )
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [crawling, setCrawling] = useState(false)
  const [source, setSource] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [crawlSecret, setCrawlSecret] = useState('')
  const [crawlMsg, setCrawlMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const fetchNews = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '21',
        ...(source !== 'all' && { source }),
      })
      const res = await fetch(`/api/news?${params}`)
      const data = await res.json()
      setArticles(data.articles ?? [])
      setTotal(data.total ?? 0)
      setPages(data.pages ?? 1)
    } catch {
      setArticles([])
    } finally {
      setLoading(false)
    }
  }, [page, source])

  useEffect(() => { fetchNews() }, [fetchNews])

  const handleSourceChange = (s: string) => {
    setSource(s)
    setPage(1)
  }

  const handleCrawl = async () => {
    if (!crawlSecret) return setCrawlMsg({ type: 'err', text: 'Enter CRAWL_SECRET first.' })
    setCrawling(true)
    setCrawlMsg(null)
    try {
      const res = await fetch(`/api/crawl?secret=${encodeURIComponent(crawlSecret)}`)
      const data = await res.json()
      if (data.success) {
        setCrawlMsg({ type: 'ok', text: `Done! +${data.new_count} new, ${data.skipped} skipped, ${data.summarized} summarized` })
        fetchNews()
      } else {
        setCrawlMsg({ type: 'err', text: data.error || 'Crawl failed' })
      }
    } catch {
      setCrawlMsg({ type: 'err', text: 'Network error' })
    } finally {
      setCrawling(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Stats + Crawl */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Latest Medical News</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              {loading ? '...' : `${total.toLocaleString()} articles collected from ${SOURCES_LIST.length} sources`}
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="CRAWL_SECRET"
                value={crawlSecret}
                onChange={(e) => setCrawlSecret(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCrawl()}
                className="border border-slate-300 rounded-xl px-3 py-2 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleCrawl}
                disabled={crawling}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                {crawling ? (
                  <span className="flex items-center gap-1.5">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                    </svg>
                    Crawling…
                  </span>
                ) : '🔄 Crawl Now'}
              </button>
            </div>
            {crawlMsg && (
              <p className={`text-xs px-3 py-1.5 rounded-lg ${crawlMsg.type === 'ok' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {crawlMsg.text}
              </p>
            )}
          </div>
        </div>

        {/* Source Filter */}
        <NewsFilter selected={source} onSelect={handleSourceChange} />

        {/* Articles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
            <div className="text-5xl mb-4">🏥</div>
            <p className="text-slate-600 font-semibold text-lg mb-2">No articles yet</p>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              Enter your <code className="bg-slate-100 px-1 rounded">CRAWL_SECRET</code> and click
              {' '}<strong>Crawl Now</strong> to fetch the latest medical news.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && !loading && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              ← Previous
            </button>
            <span className="text-sm text-slate-500">
              Page <strong>{page}</strong> of <strong>{pages}</strong>
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
