import Parser from 'rss-parser'
import { load } from 'cheerio'
import type { RawArticle } from '../types'

const parser = new Parser({ timeout: 10000 })

const RSS_URLS = [
  'https://feeds.reuters.com/reuters/healthNews',
  'https://www.reutersagency.com/feed/?best-topics=health&post_type=best',
]

export async function crawlReuters(): Promise<RawArticle[]> {
  // Try RSS feeds first
  for (const url of RSS_URLS) {
    try {
      const feed = await parser.parseURL(url)
      if (feed.items.length > 0) {
        return feed.items.slice(0, 10).map((item) => ({
          source: 'Reuters Health',
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

  // Fallback: scrape Reuters health page
  const res = await fetch('https://www.reuters.com/business/healthcare-pharmaceuticals/', {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MedicalNewsBot/1.0; +https://medical-news-agent.vercel.app)' },
    signal: AbortSignal.timeout(10000),
  })
  const html = await res.text()
  const $ = load(html)
  const articles: RawArticle[] = []

  $('[data-testid="Heading"]').slice(0, 10).each((_, el) => {
    const anchor = $(el).find('a').first()
    const title = anchor.text().trim()
    const href = anchor.attr('href') || ''
    const url = href.startsWith('http') ? href : `https://www.reuters.com${href}`
    if (title && href) {
      articles.push({ source: 'Reuters Health', title, url, published_at: null, content: '' })
    }
  })

  return articles
}
