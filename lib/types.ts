export interface RawArticle {
  source: string
  title: string
  url: string
  published_at: string | null
  content: string
}

export interface Article {
  id: string
  source: string
  title: string
  url: string
  published_at: string | null
  summary: string | null
  summary_ko: string | null
  original_content: string | null
  tags: string[] | null
  created_at: string
}

export interface CrawlResult {
  success: boolean
  total: number
  new_count: number
  skipped: number
  errors: string[]
}
