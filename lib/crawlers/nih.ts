import Parser from 'rss-parser'
import type { RawArticle } from '../types'

const parser = new Parser({ timeout: 10000 })

// NIH's main site blocks server-side access (403).
// Science Daily Health covers NIH-originated research news extensively.
const FALLBACK_URLS = [
  'https://www.nih.gov/feeds/rss/news.xml',
  'https://www.sciencedaily.com/rss/health_medicine.xml',
]

export async function crawlNIH(): Promise<RawArticle[]> {
  for (const url of FALLBACK_URLS) {
    try {
      const feed = await parser.parseURL(url)
      if (feed.items.length > 0) {
        const source = url.includes('nih.gov') ? 'NIH' : 'NIH/ScienceDaily'
        return feed.items.slice(0, 10).map((item) => ({
          source,
          title: item.title || '',
          url: item.link || '',
          published_at: item.pubDate || null,
          content: item.contentSnippet || item.summary || '',
        }))
      }
    } catch {
      continue
    }
  }
  return []
}
