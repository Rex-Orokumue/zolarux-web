import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifySentinelXSecret } from '@/lib/sentinelx/auth'
import { generateSentinelXOrderRef } from '@/lib/utils'

const MAX_AMOUNT_KOBO = 5_000_000_000 // ₦50,000,000 cap — mirrors orders/create's existing cap

export async function POST(request: NextRequest) {
  const { rateLimit, getClientIp } = await import('@/lib/rate-limit')
  const ip = getClientIp(request.headers)
  const { limited, resetIn } = rateLimit(`sentinelx-initiate:${ip}`, 30, 60_000)
  if (limited) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(resetIn / 1000)) } },
    )
  }

  const auth = verifySentinelXSecret(request)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { buyer_id, seller_id, listing_id, listing_title, amount, return_url } = body

  const missing = [
    !buyer_id && 'buyer_id',
    !seller_id && 'seller_id',
    !listing_id && 'listing_id',
    !listing_title && 'listing_title',
    amount == null && 'amount',
  ].filter(Boolean)
  if (missing.length > 0) {
    return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 })
  }

  if (!Number.isInteger(amount) || amount <= 0 || amount > MAX_AMOUNT_KOBO) {
    return NextResponse.json({ error: 'amount must be a positive integer (kobo) within range' }, { status: 400 })
  }

  const paystackSecret = process.env.PAYSTACK_SECRET_KEY
  if (!paystackSecret) {
    return NextResponse.json({ error: 'Payment service not configured' }, { status: 500 })
  }

  const order_ref = generateSentinelXOrderRef()

  // Paystack requires an email on every transaction. SentinelX only sends a buyer ID,
  // so we synthesize a stable placeholder — it's never actually delivered to.
  const placeholderEmail = `sentinelx-buyer-${buyer_id}@zolarux.com.ng`

  let authorizationUrl: string
  try {
    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: placeholderEmail,
        amount,
        reference: order_ref,
        metadata: { source: 'sentinelx', order_ref, listing_id, buyer_id, seller_id },
        ...(return_url ? { callback_url: return_url } : {}),
      }),
    })
    const paystackData = await paystackRes.json()
    if (!paystackRes.ok || !paystackData.status) {
      console.error('SentinelX initiate — Paystack init failed:', paystackData)
      return NextResponse.json({ error: 'Could not create payment link' }, { status: 502 })
    }
    authorizationUrl = paystackData.data.authorization_url
  } catch (err: any) {
    console.error('SentinelX initiate — Paystack request threw:', err?.message)
    return NextResponse.json({ error: 'Payment service unavailable' }, { status: 502 })
  }

  const supabase = createAdminClient()
  const { data: order, error: insertError } = await supabase
    .from('sentinelx_orders')
    .insert({
      order_ref,
      listing_id: String(listing_id),
      listing_title: String(listing_title),
      buyer_id: String(buyer_id),
      seller_id: String(seller_id),
      amount,
      paystack_reference: order_ref,
      status: 'initiated',
    })
    .select()
    .single()

  if (insertError) {
    console.error('SentinelX initiate — insert failed:', insertError.message)
    return NextResponse.json({ error: 'Failed to create escrow order' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    order_id: order.id,
    order_ref: order.order_ref,
    payment_link: authorizationUrl,
  })
}
