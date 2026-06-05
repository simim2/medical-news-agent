import type { RawArticle } from '../types'

interface ESearchResult {
  esearchresult: { idlist: string[] }
}

interface ESummaryItem {
  uid: string
  title: string
  pubdate: string
  source: string
  authors: Array<{ name: string }>
}

interface ESummaryResult {
  result: Record<string, ESummaryItem>
}

// Search recent disease/epidemic/infectious disease articles from last 14 days
export async function crawlPubMed(): Promise<RawArticle[]> {
  const searchUrl =
    'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi' +
    '?db=pubmed&retmax=10&sort=pub+date' +
    '&term=(disease+outbreak[Title]+OR+epidemic[Title]+OR+infectious+disease[Title]+OR+pandemic[Title])' +
    '&datetype=pdat&reldate=14&retmode=json'

  const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(10000) })
  const searchData: ESearchResult = await searchRes.json()
  const ids = searchData.esearchresult?.idlist || []

  if (ids.length === 0) return []

  const summaryUrl =
    `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi` +
    `?db=pubmed&id=${ids.join(',')}&retmode=json`

  const summaryRes = await fetch(summaryUrl, { signal: AbortSignal.timeout(10000) })
  const summaryData: ESummaryResult = await summaryRes.json()

  return Object.values(summaryData.result || {})
    .filter((item) => item.uid && item.title)
    .map((item) => ({
      source: 'PubMed',
      title: item.title,
      url: `https://pubmed.ncbi.nlm.nih.gov/${item.uid}/`,
      published_at: item.pubdate || null,
      content: [item.source, item.authors?.map((a) => a.name).join(', ')]
        .filter(Boolean)
        .join(' — '),
    }))
}
