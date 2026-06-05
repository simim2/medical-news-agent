import type { RawArticle } from '../types'
import { crawlWHO } from './who'
import { crawlCDC } from './cdc'
import { crawlNIH } from './nih'
import { crawlPubMed } from './pubmed'
import { crawlMedicalXpress } from './medicalxpress'
import { crawlGoogleNews } from './google-news'
import { crawlReuters } from './reuters'

export type { RawArticle }

export interface CrawlSource {
  name: string
  fn: () => Promise<RawArticle[]>
}

const SOURCES: CrawlSource[] = [
  { name: 'WHO', fn: crawlWHO },
  { name: 'CDC', fn: crawlCDC },
  { name: 'NIH', fn: crawlNIH },
  { name: 'PubMed', fn: crawlPubMed },
  { name: 'MedicalXpress', fn: crawlMedicalXpress },
  { name: 'Google News Health', fn: crawlGoogleNews },
  { name: 'Reuters Health', fn: crawlReuters },
]

export async function crawlAllSources(): Promise<{
  articles: RawArticle[]
  errors: string[]
}> {
  const results = await Promise.allSettled(SOURCES.map((s) => s.fn()))
  const articles: RawArticle[] = []
  const errors: string[] = []

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      articles.push(...result.value)
    } else {
      const msg = `${SOURCES[i].name}: ${result.reason?.message || 'unknown error'}`
      errors.push(msg)
      console.error(`Crawler error — ${msg}`)
    }
  })

  return { articles, errors }
}
