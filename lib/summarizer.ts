import OpenAI from 'openai'

// Lazy-initialize so missing env var doesn't crash at module load time (build)
function getClient() {
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || 'not-configured',
    defaultHeaders: {
      'HTTP-Referer': process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000',
      'X-Title': 'Medical News Agent',
    },
  })
}

export interface Summary {
  summary_en: string
  summary_ko: string
  tags: string[]
}

export async function summarizeArticle(
  title: string,
  content: string
): Promise<Summary> {
  const prompt = `You are a medical news expert. Analyze this article and respond in JSON only.

Title: ${title}
Content: ${content.slice(0, 2000)}

Return:
{
  "summary_en": "2-3 sentence English summary of the key medical findings",
  "summary_ko": "2-3문장 한국어 요약 (핵심 의학 정보 포함)",
  "tags": ["tag1", "tag2", "tag3"]
}`

  const response = await getClient().chat.completions.create({
    model: 'openrouter/auto',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    max_tokens: 600,
  })

  const raw = response.choices[0].message.content || '{}'
  const result = JSON.parse(raw)

  return {
    summary_en: result.summary_en || '',
    summary_ko: result.summary_ko || '',
    tags: Array.isArray(result.tags) ? result.tags.slice(0, 5) : [],
  }
}
