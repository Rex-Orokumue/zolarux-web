import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Risk scoring logic — runs server-side without exposing API keys
function analyseUrl(url: string): {
  riskScore: number
  flags: string[]
  positives: string[]
} {
  const flags: string[] = []
  const positives: string[] = []
  let riskScore = 0

  const lowerUrl = url.toLowerCase()

  // Known safer platforms
  const trustedPlatforms = ['jumia.com', 'konga.com', 'paystack.com', 'flutterwave.com']
  const cautionPlatforms = ['jiji.ng', 'olx.com', 'facebook.com', 'instagram.com', 'twitter.com', 'x.com']

  const isTrusted = trustedPlatforms.some(p => lowerUrl.includes(p))
  const isCaution = cautionPlatforms.some(p => lowerUrl.includes(p))

  if (isTrusted) {
    positives.push('Link is from a well-known Nigerian e-commerce platform')
    riskScore -= 20
  } else if (isCaution) {
    riskScore += 20
    flags.push('This platform does not have built-in buyer protection — transactions can happen off-platform')
  } else {
    riskScore += 30
    flags.push('Link is from an unfamiliar platform — verify legitimacy carefully')
  }

  // WhatsApp or Telegram deep links
  if (lowerUrl.includes('wa.me') || lowerUrl.includes('t.me')) {
    riskScore += 25
    flags.push('Link leads directly to a private messaging app — no transaction oversight possible')
  }

  // Suspicious TLDs
  const suspiciousTlds = ['.xyz', '.top', '.club', '.online', '.site', '.tk', '.ml', '.ga', '.cf']
  if (suspiciousTlds.some(tld => lowerUrl.includes(tld))) {
    riskScore += 35
    flags.push('Domain uses a low-cost TLD commonly associated with scam websites')
  }

  // URL shorteners
  const shorteners = ['bit.ly', 'tinyurl', 'rb.gy', 'short.io', 'ow.ly', 'buff.ly']
  if (shorteners.some(s => lowerUrl.includes(s))) {
    riskScore += 20
    flags.push('URL has been shortened — the actual destination is hidden')
  }

  // Positive signals
  if (lowerUrl.includes('https://')) {
    positives.push('Link uses HTTPS (secure connection)')
  } else {
    riskScore += 15
    flags.push('Link does not use HTTPS — connection is not secure')
  }

  // Cap score at 0-100
  riskScore = Math.max(0, Math.min(100, riskScore + 30)) // base risk of 30 for unknown

  return { riskScore, flags, positives }
}

function getRiskLevel(score: number): 'safe' | 'caution' | 'danger' {
  if (score < 35) return 'safe'
  if (score < 65) return 'caution'
  return 'danger'
}

function getSummary(riskLevel: string, flags: string[], positives: string[]): string {
  if (riskLevel === 'safe') {
    return 'This link appears to be from a relatively trustworthy source. However, always use Zolarux escrow for any payment to guarantee your protection.'
  }
  if (riskLevel === 'caution') {
    return `This link has ${flags.length} potential concern${flags.length !== 1 ? 's' : ''}. It may be legitimate, but we recommend extra verification before paying. Consider buying a similar product through Zolarux instead.`
  }
  return `This link shows multiple high-risk signals. We strongly advise against sending any payment to this vendor. Check the verified listings below for a safe alternative.`
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Analyse the URL
    const { riskScore, flags, positives } = analyseUrl(url)
    const riskLevel = getRiskLevel(riskScore)
    const summary = getSummary(riskLevel, flags, positives)

    // Fetch similar products from Supabase
    const supabase = await createClient()
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .limit(4)
      .order('is_featured', { ascending: false })

    return NextResponse.json({
      riskLevel,
      riskScore,
      summary,
      flags,
      positives,
      similarProducts: products || [],
    })
  } catch (error) {
    console.error('Scan link error:', error)
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 })
  }
}