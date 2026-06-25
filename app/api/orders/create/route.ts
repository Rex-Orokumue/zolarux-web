import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { generateOrderRef, calculateProtectionFee } from '@/lib/utils'

/** Verify a Paystack reference and return the transaction amount (in Naira). */
async function verifyPaystackReference(
  reference: string,
): Promise<{ verified: boolean; amountNaira: number; error?: string }> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) return { verified: false, amountNaira: 0, error: 'Payment service not configured' }

  try {
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' } },
    )
    const data = await res.json()
    if (!res.ok || !data.status) return { verified: false, amountNaira: 0, error: 'Paystack verification failed' }

    const tx = data.data
    if (tx.status !== 'success') return { verified: false, amountNaira: 0, error: `Transaction status: ${tx.status}` }

    return { verified: true, amountNaira: tx.amount / 100 } // Paystack returns kobo
  } catch (err: any) {
    return { verified: false, amountNaira: 0, error: err?.message || 'Verification request failed' }
  }
}

export async function POST(request: NextRequest) {
  // Rate limit: 20 orders per minute per IP
  const { rateLimit, getClientIp } = await import('@/lib/rate-limit')
  const ip = getClientIp(request.headers)
  const { limited, resetIn } = rateLimit(`orders-create:${ip}`, 20, 60_000)
  if (limited) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(resetIn / 1000)) } }
    )
  }

  try {
    const body = await request.json()
    const {
      product_id,
      product_name,
      vendor_id,
      vendor_name,
      delivery_address,
      buyer_name,
      buyer_email,
      buyer_id,
      paystack_reference,
    } = body

    // paystack_reference is now required — no reference means no verified payment
    if (!paystack_reference) {
      return NextResponse.json({ error: 'Payment reference is required' }, { status: 400 })
    }

    // Validate paystack reference format — alphanumeric, dashes, underscores, dots, tildes
    if (!/^[a-zA-Z0-9_.~-]{5,200}$/.test(String(paystack_reference))) {
      console.error('Order validation failed — bad paystack ref:', paystack_reference)
      return NextResponse.json({ error: 'Invalid payment reference format' }, { status: 400 })
    }

    // Validate required fields (amount comes from Paystack, not the client)
    if (!product_name || !vendor_id || !delivery_address) {
      const missing = [
        !product_name && 'product_name',
        !vendor_id && 'vendor_id',
        !delivery_address && 'delivery_address',
      ].filter(Boolean)
      console.error('Order validation failed — missing fields:', missing)
      return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 })
    }

    // Validate delivery address (minimum 3 chars)
    const cleanAddress = String(delivery_address).trim().slice(0, 500)
    if (cleanAddress.length < 3) {
      return NextResponse.json({ error: 'Delivery address is too short' }, { status: 400 })
    }

    // ── SECURITY: Re-verify payment with Paystack server-side ────────────────
    // We never trust the amount from the client. The verified amount from
    // Paystack is the source of truth for what was actually paid.
    const { verified, amountNaira, error: verifyError } = await verifyPaystackReference(
      String(paystack_reference),
    )
    if (!verified) {
      console.error('Order rejected — Paystack verification failed:', verifyError, 'ref:', paystack_reference)
      return NextResponse.json(
        { error: verifyError || 'Payment could not be verified. Contact support.' },
        { status: 402 },
      )
    }

    if (!Number.isFinite(amountNaira) || amountNaira <= 0 || amountNaira > 50_000_000) {
      console.error('Order rejected — verified amount out of range:', amountNaira)
      return NextResponse.json({ error: 'Verified payment amount is invalid' }, { status: 400 })
    }
    // ────────────────────────────────────────────────────────────────────────

    // Try to get authenticated user — but don't block if session missing
    let resolvedBuyerEmail = buyer_email || ''
    let resolvedBuyerId = buyer_id || ''
    let resolvedBuyerName = buyer_name || 'Buyer'

    try {
      const serverClient = await createClient()
      const { data: { user } } = await serverClient.auth.getUser()
      if (user) {
        resolvedBuyerEmail = user.email || buyer_email || ''
        resolvedBuyerId = user.id || buyer_id || ''
      }
    } catch (e) {
      console.warn('Could not get session from server client — using body values')
    }

    // Use admin client to bypass RLS — payment verified above
    const supabase = createAdminClient()
    const protection_fee = calculateProtectionFee(amountNaira)
    const total_amount = amountNaira + protection_fee
    const order_ref = generateOrderRef()

    // Create the order using the Paystack-verified amount
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_ref,
        product_id: product_id || null,
        product_name,
        vendor_id,
        vendor_name,
        buyer_id: resolvedBuyerId || null,
        buyer_email: resolvedBuyerEmail,
        buyer_name: resolvedBuyerName,
        buyer_phone: '',
        amount: amountNaira,
        protection_fee,
        total_amount,
        delivery_address: cleanAddress,
        status: 'pending',
        paystack_reference,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError.message, orderError.details)
      return NextResponse.json(
        { error: 'Failed to create order', details: orderError.message },
        { status: 500 }
      )
    }

    // Notify admin
    await supabase
      .from('admin_notifications')
      .insert({
        title: 'New Order Received',
        message: `${resolvedBuyerName} placed an order for "${product_name}" — ₦${amountNaira.toLocaleString()}. Ref: ${order_ref}`,
        type: 'new_order',
        is_read: false,
        order_ref,
        created_at: new Date().toISOString(),
      })

    return NextResponse.json({ success: true, order })

  } catch (error: any) {
    console.error('Order creation error:', error?.message || error)
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 })
  }
}