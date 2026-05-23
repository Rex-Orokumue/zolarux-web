import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ZOLARUX_DOMAINS = ['zolarux.com.ng', 'zolarux.com', 'zolarux.vercel.app']
const TRUSTED_PLATFORMS = ['jumia.com', 'konga.com', 'paystack.com', 'flutterwave.com', 'apple.com', 'samsung.com', 'dell.com', 'hp.com', 'lenovo.com']
const CAUTION_PLATFORMS = ['jiji.ng', 'olx.com', 'facebook.com', 'instagram.com', 'twitter.com', 'x.com', 'tiktok.com']
const SHORTENERS = ['bit.ly', 'tinyurl', 'rb.gy', 'short.io', 'ow.ly', 'buff.ly', 'cutt.ly']
const SUSPICIOUS_TLDS = ['.xyz', '.top', '.club', '.online', '.site', '.tk', '.ml', '.ga', '.cf']

// ── Option A: Rule-based URL analysis (fallback) ─────────────────────────────
function ruleBasedAnalysis(url: string): {
  riskScore: number
  flags: string[]
  positives: string[]
  detectedCategory: string
} {
  const flags: string[] = []
  const positives: string[] = []
  let riskScore = 30
  const lower = url.toLowerCase()

  const GADGET_KEYWORDS = [
    'iphone', 'samsung', 'phone', 'laptop', 'macbook', 'airpods',
    'headphone', 'tablet', 'ipad', 'android', 'xiaomi', 'tecno',
    'infinix', 'itel', 'huawei', 'dell', 'hp', 'lenovo', 'asus',
    'accessories', 'charger', 'cable', 'earbuds', 'smartwatch',
    'gaming', 'console', 'ps5', 'xbox', 'nintendo', 'laptop',
  ]
  const detectedCategory = GADGET_KEYWORDS.find(k => lower.includes(k)) || 'gadget'

  if (ZOLARUX_DOMAINS.some(d => lower.includes(d))) {
    return { riskScore: 0, flags: [], positives: ['This is a Zolarux verified listing'], detectedCategory }
  }
  if (TRUSTED_PLATFORMS.some(p => lower.includes(p))) {
    positives.push('Link is from a well-known platform with buyer protection')
    riskScore -= 20
  } else if (CAUTION_PLATFORMS.some(p => lower.includes(p))) {
    riskScore += 20
    flags.push('This platform does not guarantee transactions — payments can happen off-platform')
  } else {
    riskScore += 25
    flags.push('Link is from an unfamiliar platform — verify legitimacy carefully')
  }
  if (lower.includes('wa.me') || lower.includes('t.me')) {
    riskScore += 30
    flags.push('Link leads to a messaging app — no transaction oversight possible')
  }
  if (SUSPICIOUS_TLDS.some(t => lower.includes(t))) {
    riskScore += 35
    flags.push('Domain uses a TLD commonly associated with scam websites')
  }
  if (SHORTENERS.some(s => lower.includes(s))) {
    riskScore += 25
    flags.push('URL is shortened — the actual destination is hidden')
  }
  if (lower.startsWith('https://')) {
    positives.push('Link uses HTTPS (secure connection)')
  } else {
    riskScore += 15
    flags.push('Link does not use HTTPS — connection is not encrypted')
  }

  return { riskScore: Math.max(0, Math.min(100, riskScore)), flags, positives, detectedCategory }
}

// ── Option A: Fetch page content for public URLs ──────────────────────────────
async function fetchPageContent(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Zolarux SafeCheck/1.0)',
        'Accept': 'text/html',
      },
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    const html = await res.text()
    // Strip tags, collapse whitespace, limit to 3000 chars
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3000)
    return text || null
  } catch {
    return null
  }
}

// ── Option B: Grok AI analysis ────────────────────────────────────────────────
async function grokAnalysis(url: string, pageContent: string | null): Promise<{
  riskScore: number
  flags: string[]
  positives: string[]
  detectedCategory: string
  productName: string
  summary: string
} | null> {
  const apiKey = process.env.GROK_API_KEY
  if (!apiKey) return null

  const context = pageContent
    ? `URL: ${url}\n\nPage content snippet:\n${pageContent}`
    : `URL: ${url}\n\nNote: Page content could not be fetched (private or blocked).`

  const prompt = `You are a Nigerian e-commerce safety analyst. Analyse this product listing and return ONLY valid JSON.

${context}

Analyse for scam signals common in Nigerian social commerce:
- Unrealistically low price for the product type
- Vague or missing product description
- Pressure tactics ("only today", "limited offer")
- Unverified seller / new account
- Payment requested outside platform
- Product condition misrepresented

Return this exact JSON structure (no markdown, no explanation, just the JSON):
{
  "productName": "extracted product name or empty string if unknown",
  "detectedCategory": "one of: phones, laptops, accessories, electronics, gaming, other",
  "riskScore": number between 0 and 100,
  "flags": ["array of specific red flags found, max 5"],
  "positives": ["array of positive signals found, max 3"],
  "summary": "2-3 sentence plain English summary of the safety assessment for a Nigerian buyer"
}`

  try {
    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-2-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.1,
      }),
    })

    if (!res.ok) {
      console.error('Grok API error:', res.status, await res.text())
      return null
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content?.trim()
    if (!content) return null

    // Strip markdown code fences if present
    const clean = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(clean)

    return {
      riskScore: Math.max(0, Math.min(100, Number(parsed.riskScore) || 30)),
      flags: Array.isArray(parsed.flags) ? parsed.flags.slice(0, 5) : [],
      positives: Array.isArray(parsed.positives) ? parsed.positives.slice(0, 3) : [],
      detectedCategory: parsed.detectedCategory || 'gadget',
      productName: parsed.productName || '',
      summary: parsed.summary || '',
    }
  } catch (e) {
    console.error('Grok parse error:', e)
    return null
  }
}

// ── Product matching ──────────────────────────────────────────────────────────
async function findSimilarProducts(productName: string, category: string) {
  const supabase = await createClient()

  // Try to match by product name first (most relevant)
  if (productName) {
    const keywords = productName.toLowerCase().split(' ').filter(w => w.length > 3)
    for (const keyword of keywords) {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`)
        .order('is_featured', { ascending: false })
        .limit(4)
      if (data && data.length > 0) return data
    }
  }

  // Fallback: match by category
  const { data: catData } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .ilike('category', `%${category.split(' ')[0]}%`)
    .order('is_featured', { ascending: false })
    .limit(4)
  if (catData && catData.length > 0) return catData

  // Final fallback: featured products
  const { data: featured } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(4)
  return featured || []
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const lower = url.toLowerCase()

    // Zolarux own domain — always safe, skip analysis
    if (ZOLARUX_DOMAINS.some(d => lower.includes(d))) {
      const products = await findSimilarProducts('', 'gadget')
      return NextResponse.json({
        riskLevel: 'safe',
        riskScore: 0,
        summary: 'This is a Zolarux verified listing. Your transaction is fully protected by escrow, vendor verification, and dispute resolution.',
        flags: [],
        positives: ['This is a Zolarux verified listing — maximum protection available'],
        detectedCategory: 'gadget',
        productName: '',
        analysedBy: 'zolarux',
        similarProducts: products,
      })
    }

    // Step 1: Try to fetch page content (Option A)
    const isPublicUrl = !lower.includes('wa.me') && !lower.includes('t.me') &&
      !lower.includes('instagram.com') && !lower.includes('tiktok.com')
    const pageContent = isPublicUrl ? await fetchPageContent(url) : null

    // Step 2: Try Grok analysis (Option B)
    const grokResult = await grokAnalysis(url, pageContent)

    let riskScore: number
    let flags: string[]
    let positives: string[]
    let detectedCategory: string
    let productName: string
    let summary: string
    let analysedBy: string

    if (grokResult) {
      // Grok succeeded — use AI analysis
      riskScore = grokResult.riskScore
      flags = grokResult.flags
      positives = grokResult.positives
      detectedCategory = grokResult.detectedCategory
      productName = grokResult.productName
      summary = grokResult.summary
      analysedBy = 'grok-ai'
    } else {
      // Grok failed — fall back to rule-based analysis
      const ruled = ruleBasedAnalysis(url)
      riskScore = ruled.riskScore
      flags = ruled.flags
      positives = ruled.positives
      detectedCategory = ruled.detectedCategory
      productName = ''
      analysedBy = 'rule-based'
      summary = riskScore < 25
        ? 'This link appears to be from a relatively trustworthy source. Always use Zolarux escrow for full payment protection.'
        : riskScore < 60
        ? 'This link has some risk signals. It may be legitimate, but we recommend buying from a verified Zolarux vendor instead.'
        : 'This link shows multiple high-risk signals. We strongly advise against sending any payment. See verified alternatives below.'
    }

    const riskLevel = riskScore < 25 ? 'safe' : riskScore < 60 ? 'caution' : 'danger'
    const similarProducts = await findSimilarProducts(productName, detectedCategory)

    return NextResponse.json({
      riskLevel,
      riskScore,
      summary,
      flags,
      positives,
      detectedCategory,
      productName,
      analysedBy,
      similarProducts,
    })

  } catch (error: any) {
    console.error('Scan link error:', error?.message || error)
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 })
  }
}