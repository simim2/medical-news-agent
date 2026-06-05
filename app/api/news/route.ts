import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const source = searchParams.get('source') || 'all'
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
  const offset = (page - 1) * limit

  const supabase = getAdminClient()

  let query = supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (source !== 'all') {
    query = query.eq('source', source)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    articles: data ?? [],
    total: count ?? 0,
    page,
    limit,
    pages: Math.ceil((count ?? 0) / limit),
  })
}
