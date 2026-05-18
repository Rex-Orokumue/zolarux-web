import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ZOLARUX_DOMAINS = ['zolarux.com.ng', 'zolarux.com', 'zolarux.vercel.app']

const TRUSTED_PLATFORMS = [
  'jumia.com', 'konga.com', 'paystack.com', 'flutterwave.com',
  'apple.com', 'samsung.com', 'dell.com', 'hp.com', 'lenovo.com',
]

const CAUTION_PLATFORMS = [
  'jiji.ng', 'olx.com', 'facebook.com', 'instagram.com',
  'twitter.com', 'x.com', 'tiktok.com',
]

const GADGET_KEYWORDS = [
  'iphone', 'samsung', 'phone', 'laptop', 'macbook', 'airpods',
  'headphone', 'tablet', 'ipad', 'android', 'xiaomi', 'tecno',
  'infinix', 'itel', 'huawei', 'dell', 'hp', 'lenovo', 'asus',
  'accessories', 'charger', 'cable', 'earbuds', 'smartwatch',
  'gaming', 'console', 'ps5', 'xbox', 'nintendo',
]

function analyseUrl(url: string): {
  riskScore: number
  flags: string[]
  positives: string[]
  detectedCategory: string
} {
  const flags: string[] = []
  const positives: string[] = []
  let riskScore = 30 // base score
  const lowerUrl = url.toLowerCase()

  // Detect product category from URL
  const detectedCategory = GADGET_KEYWORDS.find(k => lowerUrl.includes(k)) || 'gadget'

  // Zolarux own domains — always safe
  if (ZOLARUX_DOMAINS.some(d => lowerUrl.includes(d))) {
    positives.push('This is a Zolarux verified listing — maximum protection available')
    riskScore = 0
    return { riskScore, flags, positives, detectedCategory }
  }

  // Trusted platforms
  if (TRUSTED_PLATFORMS.some(p => lowerUrl.includes(p))) {
    positives.push('Link is from a well-known platform with buyer protection')
    riskScore -= 20
  } else if (CAUTION_PLATFORMS.some(p => lowerUrl.includes(p))) {
    riskScore += 20
    flags.push('This platform does not guarantee transactions — payments can happen off-platform')
  } else {
    riskScore += 25
    flags.push('Link is from an unfamiliar platform — verify legitimacy carefully')
  }

  // WhatsApp / Telegram direct links
  if (lowerUrl.includes('wa.me') || lowerUrl.includes('t.me') || lowerUrl.includes('whatsapp')) {
    riskScore += 30
    flags.push('Link leads directly to a messaging app — no transaction oversight possible')
  }

  // Suspicious TLDs
  const suspiciousTlds = ['.xyz', '.top', '.club', '.online', '.site', '.tk', '.ml', '.ga', '.cf']
  if (suspiciousTlds.some(tld => lowerUrl.includes(tld))) {
    riskScore += 35
    flags.push('Domain uses a TLD commonly associated with scam websites')
  }

  // URL shorteners
  const shorteners = ['bit.ly', 'tinyurl', 'rb.gy', 'short.io', 'ow.ly', 'buff.ly', 'cutt.ly']
  if (shorteners.some(s => lowerUrl.includes(s))) {
    riskScore += 25
    flags.push('URL is shortened — the actual destination is hidden')
  }

  // HTTPS check
  if (lowerUrl.startsWith('https://')) {
    positives.push('Link uses HTTPS (secure connection)')
  } else {
    riskScore += 15
    flags.push('Link does not use HTTPS — connection is not encrypted')
  }

  // Cap score
  riskScore = Math.max(0, Math.min(100, riskScore))

  return { riskScore, flags, positives, detectedCategory }
}

function getRiskLevel(score: number): 'safe' | 'caution' | 'danger' {
  if (score < 25) return 'safe'
  if (score < 60) return 'caution'
  return 'danger'
}

function getSummary(riskLevel: string, url: string): string {
  if (ZOLARUX_DOMAINS.some(d => url.toLowerCase().includes(d))) {
    return 'This is a Zolarux listing. Your transaction is fully protected by escrow, vendor verification, and dispute resolution.'
  }
  if (riskLevel === 'safe') return 'This link appears to be from a relatively trustworthy source. However, always use Zolarux escrow for full payment protection.'
  if (riskLevel === 'caution') return 'This link has some risk signals. It may be legitimate, but we recommend buying from a verified Zolarux vendor instead for guaranteed protection.'
  return 'This link shows multiple high-risk signals. We strongly advise against sending any payment. See verified alternatives below.'
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const { riskScore, flags, positives, detectedCategory } = analyseUrl(url)
    const riskLevel = getRiskLevel(riskScore)
    const summary = getSummary(riskLevel, url)

    // Fetch similar products matching detected category
    const supabase = await createClient()
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .ilike('category', `%${detectedCategory.split(' ')[0]}%`)
      .order('is_featured', { ascending: false })
      .limit(4)

    // If no category match, fallback to featured products
    let finalProducts = products || []
    if (finalProducts.length === 0) {
      const { data: featured } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(4)
      finalProducts = featured || []
    }

    return NextResponse.json({
      riskLevel,
      riskScore,
      summary,
      flags,
      positives,
      detectedCategory,
      similarProducts: finalProducts,
    })
  } catch (error) {
    console.error('Scan link error:', error)
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 })
  }
}