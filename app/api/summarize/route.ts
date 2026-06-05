import { NextRequest, NextResponse } from 'next/server'
import { summarizeArticle } from '@/lib/summarizer'
import { getAdminClient } from '@/lib/supabase'

export const maxDuration = 300

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const querySecret = request.nextUrl.searchParams.get('secret')
  const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`
  const isManual = querySecret === process.env.CRAWL_SECRET

  if (!isVercelCron && !isManual) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20')
  const supabaseAdmin = getAdminClient()

  // Fetch articles without summaries
  const { data: articles, error } = await supabaseAdmin
    .from('articles')
    .select('id, title, original_content, source')
    .is('summary', null)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let done = 0
  let failed = 0

  for (const article of articles ?? []) {
    try {
      const result = await summarizeArticle(
        article.title,
        article.original_content || article.title
      )

      await supabaseAdmin
        .from('articles')
        .update({
          summary: result.summary_en,
          summary_ko: result.summary_ko,
          tags: result.tags,
        })
        .eq('id', article.id)

      done++
    } catch (err) {
      console.error(`Summarize failed for [${article.id}]:`, err)
      failed++
    }
  }

  return NextResponse.json({
    success: true,
    processed: (articles ?? []).length,
    done,
    failed,
  })
}
