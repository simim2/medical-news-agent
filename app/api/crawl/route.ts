import { NextRequest, NextResponse } from 'next/server'
import { crawlAllSources } from '@/lib/crawlers'
import { summarizeArticle } from '@/lib/summarizer'
import { getAdminClient } from '@/lib/supabase'

// Vercel Pro: 300s / Hobby: 60s
export const maxDuration = 300

export async function GET(request: NextRequest) {
  // Auth: Vercel Cron sends Bearer CRON_SECRET, manual trigger uses ?secret=
  const authHeader = request.headers.get('authorization')
  const querySecret = request.nextUrl.searchParams.get('secret')
  const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`
  const isManual = querySecret === process.env.CRAWL_SECRET

  if (!isVercelCron && !isManual) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseAdmin = getAdminClient()
  const { articles, errors } = await crawlAllSources()

  let newCount = 0
  let skipped = 0
  let summarized = 0
  const MAX_SUMMARIES = 15 // throttle LLM calls per run

  for (const article of articles) {
    if (!article.url || !article.title) continue

    // Skip duplicates
    const { data: existing } = await supabaseAdmin
      .from('articles')
      .select('id')
      .eq('url', article.url)
      .maybeSingle()

    if (existing) {
      skipped++
      continue
    }

    let summary = ''
    let summary_ko = ''
    let tags: string[] = []

    if (summarized < MAX_SUMMARIES) {
      try {
        const result = await summarizeArticle(article.title, article.content)
        summary = result.summary_en
        summary_ko = result.summary_ko
        tags = result.tags
        summarized++
      } catch (err) {
        console.error('Summarization failed:', article.title, err)
      }
    }

    const { error } = await supabaseAdmin.from('articles').insert({
      source: article.source,
      title: article.title,
      url: article.url,
      published_at: article.published_at,
      summary: summary || null,
      summary_ko: summary_ko || null,
      original_content: article.content || null,
      tags,
    })

    if (!error) newCount++
  }

  return NextResponse.json({
    success: true,
    total: articles.length,
    new_count: newCount,
    skipped,
    summarized,
    errors,
  })
}
