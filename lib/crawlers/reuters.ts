import Parser from 'rss-parser'
import type { RawArticle } from '../types'

const parser = new Parser({ timeout: 10000 })

// Reuters removed public RSS feeds. Fallback chain:
// 1. Reuters legacy feeds (may return if restored)
// 2. The Lancet — world's leading medical journal, similar authority
const RSS_CHAIN = [
  { url: 'https://feeds.reuters.com/reuters/healthNews', source: 'Reuters Health' },
  { url: 'https://www.reutersagency.com/feed/?best-topics=health&post_type=best', source: 'Reuters Health' },
  { url: 'https://www.thelancet.com/rssfeed/lancet_online.xml', source: 'Reuters/Lancet' },
]

export async function crawlReuters(): Promise<RawArticle[]> {
  for (const { url, source } of RSS_CHAIN) {
    try {
      const feed = await parser.parseURL(url)
      if (feed.items.length > 0) {
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
