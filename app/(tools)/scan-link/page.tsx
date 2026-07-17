'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Link2, Search, Shield, AlertTriangle, CheckCircle, XCircle, ShoppingBag, ArrowRight, MessageCircle, Zap, Bot } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types/product'

type RiskLevel = 'safe' | 'caution' | 'danger' | null

interface ScanResult {
  riskLevel: RiskLevel
  riskScore: number
  summary: string
  flags: string[]
  positives: string[]
  detectedCategory: string
  productName: string
  analysedBy: 'grok-ai' | 'rule-based' | 'zolarux'
  similarProducts: Product[]
}

const RISK_CONFIG = {
  safe:    { color: 'text-green-700', bg: 'bg-green-50',  border: 'border-green-200', headerBg: 'bg-green-600',  icon: CheckCircle,    label: 'Looks Safe' },
  caution: { color: 'text-amber-700', bg: 'bg-amber-50',  border: 'border-amber-200', headerBg: 'bg-amber-500',  icon: AlertTriangle,  label: 'Proceed with Caution' },
  danger:  { color: 'text-red-700',   bg: 'bg-red-50',    border: 'border-red-200',   headerBg: 'bg-red-600',    icon: XCircle,        label: 'High Risk — Do Not Pay' },
}

const ANALYSIS_BADGE: Record<string, { label: string; color: string }> = {
  'grok-ai':    { label: 'AI-powered analysis', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  'rule-based': { label: 'Pattern analysis',    color: 'bg-gray-100 text-gray-600 border-gray-200' },
  'zolarux':    { label: 'Zolarux verified',    color: 'bg-green-50 text-green-700 border-green-200' },
}

const COMMON_SCAM_PATTERNS = [
  { pattern: 'Price too good to be true',     desc: 'iPhone 14 for ₦80,000 when market price is ₦350,000+' },
  { pattern: 'Urgency pressure',              desc: '"Only 1 left", "Offer expires in 1 hour", "First 10 buyers only"' },
  { pattern: 'No return policy',              desc: '"All sales are final", "No refunds under any circumstances"' },
  { pattern: 'Vague product description',     desc: 'No specs, no condition details, no serial number info' },
  { pattern: 'Unverifiable vendor',           desc: 'No social media history, new account, no customer reviews' },
  { pattern: 'Off-platform payment pressure', desc: '"Pay directly to my account, not through the platform"' },
]

export default function ScanLinkPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')
  const [loadingMsg, setLoadingMsg] = useState('')

  const handleScan = async () => {
    const q = url.trim()
    if (!q) return
    if (!q.startsWith('http')) {
      setError('Please enter a valid URL starting with http:// or https://')
      return
    }

    setError('')
    setLoading(true)
    setResult(null)
    setLoadingMsg('Fetching page content...')

    const msgTimer = setTimeout(() => setLoadingMsg('Analysing with AI...'), 2500)
    const msgTimer2 = setTimeout(() => setLoadingMsg('Finding safe alternatives on Zolarux...'), 5000)

    try {
      const response = await fetch('/api/scan-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: q }),
      })

      if (!response.ok) throw new Error('Scan failed')
      const data = await response.json()
      setResult(data)
    } catch {
      setError('Failed to scan this link. The URL may be private or inaccessible. Try the WhatsApp option below.')
    } finally {
      clearTimeout(msgTimer)
      clearTimeout(msgTimer2)
      setLoading(false)
      setLoadingMsg('')
    }
  }

  const riskConfig = result?.riskLevel ? RISK_CONFIG[result.riskLevel] : null
  const analysisBadge = result?.analysedBy ? ANALYSIS_BADGE[result.analysedBy] : null

  return (
    <div>
      {/* Hero */}
      <section className="bg-gray-950 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Link2 size={26} className="text-accent" />
          </div>
          <h1 className="font-display text-4xl font-800 text-white mb-4">
            Scan a Product Link for Safety
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Found a gadget on Instagram, Jiji, or WhatsApp? Paste the link here.
            Our AI reads the listing and checks it for scam signals — then shows you
            safer verified alternatives on Zolarux.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['AI-powered', 'Reads actual listing', 'Nigerian scam patterns', 'Finds safe alternatives'].map(feat => (
              <span key={feat} className="bg-white/10 border border-white/15 text-white/70 text-xs px-3 py-1 rounded-full">
                ✓ {feat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Scanner */}
      <section className="py-12 bg-surface">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-8">
            <label className="block text-sm font-700 text-gray-700 mb-1.5">Product Link</label>
            <p className="text-xs text-gray-400 mb-3">
              Paste the full URL from Instagram, Jiji, Twitter, Facebook, or any website.
              Our AI will read the page and analyse the listing.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                placeholder="https://jiji.ng/lagos/phones/iphone-14..."
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <button
                onClick={handleScan}
                disabled={loading || !url.trim()}
                className="bg-primary text-white px-6 py-3 rounded-xl font-700 hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
              >
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scanning...</>
                  : <><Search size={16} /> Scan Link</>}
              </button>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Loading state with progressive messages */}
            {loading && (
              <div className="mt-6 text-center py-8">
                <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500 text-sm font-600">{loadingMsg || 'Scanning...'}</p>
                <p className="text-gray-400 text-xs mt-1">AI-powered analysis may take 5–10 seconds</p>
              </div>
            )}

            {/* Result */}
            {result && riskConfig && (
              <div className={`mt-6 rounded-2xl border ${riskConfig.border} overflow-hidden`}>
                {/* Result header */}
                <div className={`${riskConfig.headerBg} px-5 py-4`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <riskConfig.icon size={18} className="text-white" />
                      <span className="font-display font-700 text-white">{riskConfig.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {analysisBadge && (
                        <span className={`text-xs font-600 px-2.5 py-1 rounded-full border ${analysisBadge.color}`}>
                          <Bot size={10} className="inline mr-1" />
                          {analysisBadge.label}
                        </span>
                      )}
                      <div className="bg-white/20 px-3 py-1 rounded-full">
                        <span className="text-white text-xs font-700">Risk: {result.riskScore}/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Detected product */}
                  {result.productName && (
                    <div className="mt-3 bg-white/10 rounded-xl px-3 py-2">
                      <p className="text-white/60 text-xs">Detected product</p>
                      <p className="text-white font-700 text-sm">{result.productName}</p>
                    </div>
                  )}
                </div>

                <div className={`${riskConfig.bg} p-5 space-y-4`}>
                  {/* Summary */}
                  <p className={`${riskConfig.color} text-sm leading-relaxed`}>{result.summary}</p>

                  {/* Flags */}
                  {result.flags.length > 0 && (
                    <div>
                      <p className="text-xs font-700 text-gray-500 uppercase tracking-wider mb-2">Red Flags Detected</p>
                      <ul className="space-y-1.5">
                        {result.flags.map((flag, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                            <XCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
                            {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Positives */}
                  {result.positives.length > 0 && (
                    <div>
                      <p className="text-xs font-700 text-gray-500 uppercase tracking-wider mb-2">Positive Signals</p>
                      <ul className="space-y-1.5">
                        {result.positives.map((pos, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                            <CheckCircle size={13} className="text-green-500 shrink-0 mt-0.5" />
                            {pos}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Similar products */}
                {result.similarProducts.length > 0 && (
                  <div className="border-t border-gray-100 p-5 bg-white">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield size={15} className="text-primary" />
                      <p className="font-display font-700 text-gray-900 text-sm">
                        {result.productName
                          ? `Buy "${result.productName.split(' ').slice(0, 4).join(' ')}..." Safely on Zolarux`
                          : 'Buy This Safely on Zolarux Instead'}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {result.similarProducts.map((product) => (
                        <Link
                          key={product.id}
                          href={`/listings/${product.id}`}
                          className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-gray-100 hover:border-primary hover:bg-primary-light transition-all group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                            {product.main_image_url || product.image_url ? (
                              <img src={product.main_image_url || product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <ShoppingBag size={16} className="text-gray-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-700 text-gray-900 text-xs truncate group-hover:text-primary transition-colors">{product.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Shield size={9} className="text-green-500" />
                              <span className="text-green-600 text-xs font-600">Verified · Escrow</span>
                            </div>
                            <p className="text-primary text-xs font-700 mt-0.5">
                              {product.pricing_type === 'quote' ? 'Price on request' : formatPrice(product.price)}
                            </p>
                          </div>
                          <ArrowRight size={13} className="text-gray-400 group-hover:text-primary shrink-0 transition-colors" />
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="/listings"
                      className="mt-3 w-full flex items-center justify-center gap-2 text-primary text-sm font-700 py-2.5 border border-primary-100 rounded-xl hover:bg-primary-light transition-all"
                    >
                      See all verified listings <ArrowRight size={13} />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* WhatsApp fallback */}
            <div className="mt-6 bg-green-50 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-700 text-green-800 text-sm">Link not working or private?</p>
                <p className="text-green-600 text-xs">Describe the product on WhatsApp and we will check it manually.</p>
              </div>
              <Link
                href="https://wa.me/2348120288390?text=Hi, I want you to check if this product is safe to buy: "
                target="_blank"
                className="shrink-0 inline-flex items-center gap-1.5 bg-green-600 text-white text-xs font-700 px-3 py-2 rounded-lg hover:bg-green-700 transition-all"
              >
                <MessageCircle size={13} /> WhatsApp
              </Link>
            </div>
          </div>

          {/* Scam patterns education */}
          <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <h3 className="font-display font-700 text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              Common Nigerian Gadget Scam Patterns
            </h3>
            <div className="space-y-3">
              {COMMON_SCAM_PATTERNS.map(({ pattern, desc }) => (
                <div key={pattern} className="flex items-start gap-3">
                  <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-700 text-gray-800 text-sm">{pattern}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="mt-4 bg-primary-light rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Bot size={15} className="text-primary" />
              <p className="font-700 text-primary text-sm">How the AI analysis works</p>
            </div>
            <div className="space-y-2">
              {[
                'We fetch the actual page content from the URL you paste',
                'Grok AI reads the listing and identifies product name, price, and seller signals',
                'AI flags Nigerian scam patterns — fake urgency, unrealistic pricing, vague descriptions',
                'We search Zolarux for matching verified products so you can buy safely instead',
                'If the page cannot be fetched (private/Instagram), we fall back to URL pattern analysis',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-primary/80">
                  <span className="w-4 h-4 rounded-full bg-primary text-white font-800 flex items-center justify-center shrink-0 text-xs mt-0.5">{i + 1}</span>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}