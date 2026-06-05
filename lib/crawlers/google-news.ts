import Parser from 'rss-parser'
import type { RawArticle } from '../types'

const parser = new Parser({ timeout: 10000 })

// Google News Health topic RSS feed
const GOOGLE_HEALTH_RSS =
  'https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNR3QwTlRFU0FtVnVLQUFQAQ?hl=en-US&gl=US&ceid=US:en'

export async function crawlGoogleNews(): Promise<RawArticle[]> {
  const feed = await parser.parseURL(GOOGLE_HEALTH_RSS)
  return feed.items.slice(0, 10).map((item) => ({
    source: 'Google News Health',
    title: item.title || '',
    url: item.link || '',
    published_at: item.pubDate || null,
    content: item.contentSnippet || item.summary || '',
  }))
}
