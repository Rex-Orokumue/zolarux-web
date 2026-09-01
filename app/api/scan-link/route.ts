import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/types/product'

const ZOLARUX_DOMAINS = ['zolarux.com.ng', 'zolarux.com', 'zolarux.vercel.app']
const TRUSTED_PLATFORMS = [
  'jumia.com', 'konga.com', 'paystack.com', 'flutterwave.com',
  'apple.com', 'samsung.com', 'dell.com', 'hp.com', 'lenovo.com',
]
const CAUTION_PLATFORMS = [
  'jiji.ng', 'olx.com', 'facebook.com', 'instagram.com', 'twitter.com', 'x.com', 'tiktok.com',
]
const SHORTENERS = ['bit.ly', 'tinyurl', 'rb.gy', 'short.io', 'ow.ly', 'buff.ly', 'cutt.ly']
const SUSPICIOUS_TLDS = ['.xyz', '.top', '.club', '.online', '.site', '.tk', '.ml', '.ga', '.cf']

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
    'iphone', 'samsung', 'phone', 'laptop', 'macbook', 'airpods', 'headphone', 'tablet',
    'ipad', 'android', 'xiaomi', 'tecno', 'infinix', 'itel', 'huawei', 'dell', 'hp',
    'lenovo', 'asus', 'accessories', 'charger', 'cable', 'earbuds', 'smartwatch', 'gaming',
    'console', 'ps5', 'xbox', 'nintendo',
  ]
  const detectedCategory = GADGET_KEYWORDS.find((k) => lower.includes(k)) || 'gadget'

  if (ZOLARUX_DOMAINS.some((d) => lower.includes(d))) {
    return {
      riskScore: 0,
      flags: [],
      positives: ['This is a Zolarux listing — guaranteed or refunded'],
      detectedCategory,
    }
  }
  if (TRUSTED_PLATFORMS.some((p) => lower.includes(p))) {
    positives.push('Link is from a well-known platform with buyer protection')
    riskScore -= 20
  } else if (CAUTION_PLATFORMS.some((p) => lower.includes(p))) {
    riskScore += 20
    flags.push('This is a social platform — payments happen off-platform with no protection')
  } else {
    riskScore += 25
    flags.push('Unfamiliar platform — verify it carefully before sending money')
  }
  if (lower.includes('wa.me') || lower.includes('t.me')) {
    riskScore += 30
    flags.push('Link goes straight to a messaging app — no oversight on the sale')
  }
  if (SUSPICIOUS_TLDS.some((t) => lower.includes(t))) {
    riskScore += 35
    flags.push('Domain uses a TLD commonly seen on scam sites')
  }
  if (SHORTENERS.some((s) => lower.includes(s))) {
    riskScore += 25
    flags.push('URL is shortened — the real destination is hidden')
  }
  if (lower.startsWith('https://')) {
    positives.push('Uses HTTPS (secure connection)')
  } else {
    riskScore += 15
    flags.push('Not HTTPS — the connection is not encrypted')
  }
  return { riskScore: Math.max(0, Math.min(100, riskScore)), flags, positives, detectedCategory }
}

function isPrivateUrl(urlStr: string): boolean {
  try {
    const p = new URL(urlStr)
    const h = p.hostname.toLowerCase()
    return (
      h === 'localhost' ||
      h === '0.0.0.0' ||
      h.startsWith('127.') ||
      h.startsWith('10.') ||
      h.startsWith('192.168.') ||
      h.startsWith('172.') ||
      h === '169.254.169.254' ||
      h.endsWith('.local') ||
      h.endsWith('.internal') ||
      p.protocol === 'file:' ||
      p.protocol === 'ftp:'
    )
  } catch {
    return true
  }
}

function isValidScanUrl(url: string): boolean {
  if (url.length > 2048) return false
  try {
    const p = new URL(url)
    return p.protocol === 'http:' || p.protocol === 'https:'
  } catch {
    return false
  }
}

async function fetchPageContent(url: string): Promise<string | null> {
  if (isPrivateUrl(url)) return null
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Zolarux SafeCheck/1.0)',
        Accept: 'text/html',
      },
    })
    clearTimeout(t)
    if (!res.ok) return null
    if (res.url && isPrivateUrl(res.url)) return null
    const html = await res.text()
    return (
      html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 3000) || null
    )
  } catch {
    return null
  }
}

async function grokAnalysis(url: string, pageContent: string | null) {
  const apiKey = process.env.GROK_API_KEY
  if (!apiKey) return null
  const context = pageContent
    ? `URL: ${url}\n\nPage snippet:\n${pageContent}`
    : `URL: ${url}\n\n(Page content unavailable.)`
  const prompt = `You are a Nigerian e-commerce safety analyst. Return ONLY valid JSON.\n\n${context}\n\nAssess scam signals (low price, vague description, pressure tactics, off-platform payment, misrepresented condition). Return exactly:\n{"productName":"","detectedCategory":"one of phones|laptops|accessories|electronics|gaming|other","riskScore":0,"flags":["max 5"],"positives":["max 3"],"summary":"2-3 sentences for a Nigerian buyer"}`
  try {
    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'grok-2-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.1,
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const content = data.choices?.[0]?.message?.content?.trim()
    if (!content) return null
    const parsed = JSON.parse(
      content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    )
    return {
      riskScore: Math.max(0, Math.min(100, Number(parsed.riskScore) || 30)),
      flags: Array.isArray(parsed.flags) ? parsed.flags.slice(0, 5) : [],
      positives: Array.isArray(parsed.positives) ? parsed.positives.slice(0, 3) : [],
      detectedCategory: parsed.detectedCategory || 'gadget',
      productName: parsed.productName || '',
      summary: parsed.summary || '',
    }
  } catch {
    return null
  }
}

async function findSimilarProducts(productName: string, category: string): Promise<Product[]> {
  const supabase = await createClient()
  if (productName) {
    for (const kw of productName.toLowerCase().split(' ').filter((w) => w.length > 3)) {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${kw}%,description.ilike.%${kw}%`)
        .order('is_featured', { ascending: false })
        .limit(4)
      if (data && data.length > 0) return data as Product[]
    }
  }
  const { data: cat } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .ilike('category', `%${category.split(' ')[0]}%`)
    .order('is_featured', { ascending: false })
    .limit(4)
  if (cat && cat.length > 0) return cat as Product[]
  const { data: feat } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(4)
  return (feat as Product[]) || []
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }
    if (!isValidScanUrl(url)) {
      return NextResponse.json({ error: 'Enter a valid http:// or https:// URL.' }, { status: 400 })
    }
    if (isPrivateUrl(url)) {
      return NextResponse.json(
        { error: 'That URL points to a private network and cannot be scanned.' },
        { status: 400 }
      )
    }

    const lower = url.toLowerCase()
    if (ZOLARUX_DOMAINS.some((d) => lower.includes(d))) {
      return NextResponse.json({
        riskLevel: 'safe',
        riskScore: 0,
        summary:
          'This is a Zolarux listing. Every unit is inspected before dispatch and every order is guaranteed or refunded.',
        flags: [],
        positives: ['This is a Zolarux listing — guaranteed or refunded'],
        detectedCategory: 'gadget',
        analysedBy: 'zolarux',
        similarProducts: await findSimilarProducts('', 'gadget'),
      })
    }

    const isPublic = !['wa.me', 't.me', 'instagram.com', 'tiktok.com'].some((d) => lower.includes(d))
    const pageContent = isPublic ? await fetchPageContent(url) : null
    const grok = await grokAnalysis(url, pageContent)

    let riskScore: number
    let flags: string[]
    let positives: string[]
    let detectedCategory: string
    let productName: string
    let summary: string
    let analysedBy: string

    if (grok) {
      riskScore = grok.riskScore
      flags = grok.flags
      positives = grok.positives
      detectedCategory = grok.detectedCategory
      productName = grok.productName
      summary = grok.summary
      analysedBy = 'grok-ai'
    } else {
      const r = ruleBasedAnalysis(url)
      riskScore = r.riskScore
      flags = r.flags
      positives = r.positives
      detectedCategory = r.detectedCategory
      productName = ''
      analysedBy = 'rule-based'
      summary =
        riskScore < 25
          ? 'This link looks like it comes from a relatively trustworthy source. Still, only pay for a gadget you have been able to inspect.'
          : riskScore < 60
          ? 'This link has some risk signals. It might be fine, but consider buying from Zolarux instead — guaranteed or refunded.'
          : 'This link shows several high-risk signals. We strongly advise against sending any payment. See safer options below.'
    }

    const riskLevel = riskScore < 25 ? 'safe' : riskScore < 60 ? 'caution' : 'danger'
    return NextResponse.json({
      riskLevel,
      riskScore,
      summary,
      flags,
      positives,
      detectedCategory,
      analysedBy,
      similarProducts: await findSimilarProducts(productName, detectedCategory),
    })
  } catch (e) {
    console.error('scan-link error:', e)
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 })
  }
}
