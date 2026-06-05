import Parser from 'rss-parser'
import type { RawArticle } from '../types'

const parser = new Parser({ timeout: 10000 })

export async function crawlNIH(): Promise<RawArticle[]> {
  const feed = await parser.parseURL('https://www.nih.gov/feeds/rss/news.xml')
  return feed.items.slice(0, 10).map((item) => ({
    source: 'NIH',
    title: item.title || '',
    url: item.link || '',
    published_at: item.pubDate || null,
    content: item.contentSnippet || item.summary || '',
  }))
}
