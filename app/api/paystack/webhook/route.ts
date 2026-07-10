import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyPaystackSignature } from '@/lib/paystack/verify-signature'
import { sendSentinelXWebhook } from '@/lib/sentinelx/webhook'

export async function POST(request: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) {
    console.error('Paystack webhook — PAYSTACK_SECRET_KEY not configured')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const rawBody = await request.text()
  const signature = request.headers.get('x-paystack-signature')

  if (!verifyPaystackSignature(rawBody, signature, secret)) {
    console.error('Paystack webhook — signature mismatch')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Always ack 200 once the signature checks out — Paystack retries on non-2xx.
  // Only charge.success against a known SentinelX reference does anything.
  if (event.event !== 'charge.success') {
    return NextResponse.json({ received: true })
  }

  const reference = event.data?.reference
  if (!reference) {
    return NextResponse.json({ received: true })
  }

  const supabase = createAdminClient()
  const { data: order } = await supabase
    .from('sentinelx_orders')
    .select()
    .eq('paystack_reference', reference)
    .eq('status', 'initiated')
    .maybeSingle()

  if (!order) {
    // Not a SentinelX order (or already processed) — nothing to do.
    return NextResponse.json({ received: true })
  }

  const held_at = new Date().toISOString()
  const { error: updateError } = await supabase
    .from('sentinelx_orders')
    .update({ status: 'held', held_at })
    .eq('id', order.id)

  if (updateError) {
    console.error('Paystack webhook — failed to mark order held:', updateError.message, order.order_ref)
    return NextResponse.json({ received: true })
  }

  await sendSentinelXWebhook('payment_held', order.order_ref, {
    order_id: order.id,
    order_ref: order.order_ref,
    listing_id: order.listing_id,
    buyer_id: order.buyer_id,
    seller_id: order.seller_id,
    amount: order.amount,
    held_at,
  })

  return NextResponse.json({ received: true })
}
