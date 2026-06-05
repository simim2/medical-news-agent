import Parser from 'rss-parser'
import type { RawArticle } from '../types'

const parser = new Parser({ timeout: 10000 })

// CDC press releases RSS
const CDC_RSS_URLS = [
  'https://tools.cdc.gov/api/v2/resources/media/132608.rss',
  'https://www.cdc.gov/media/releases/rss.xml',
]

export async function crawlCDC(): Promise<RawArticle[]> {
  for (const url of CDC_RSS_URLS) {
    try {
      const feed = await parser.parseURL(url)
      return feed.items.slice(0, 10).map((item) => ({
        source: 'CDC',
        title: item.title || '',
        url: item.link || '',
        published_at: item.pubDate || null,
        content: item.contentSnippet || item.summary || '',
      }))
    } catch {
      continue
    }
  }
  return []
}
