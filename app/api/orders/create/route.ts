import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { generateOrderRef, calculateProtectionFee } from '@/lib/utils'

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
      amount,
      delivery_address,
      buyer_name,
      buyer_email,
      buyer_id,
      paystack_reference,
    } = body

    // Validate required fields
    if (!product_name || !vendor_id || !amount || !delivery_address) {
      const missing = [
        !product_name && 'product_name',
        !vendor_id && 'vendor_id',
        !amount && 'amount',
        !delivery_address && 'delivery_address',
      ].filter(Boolean)
      console.error('Order validation failed — missing fields:', missing, 'Body:', JSON.stringify({ product_name, vendor_id, amount, delivery_address: delivery_address?.slice?.(0, 20) }))
      return NextResponse.json({ error: `Missing required fields: ${missing.join(', ')}` }, { status: 400 })
    }

    // Validate amount is a positive number within a reasonable range
    const numAmount = Number(amount)
    if (!Number.isFinite(numAmount) || numAmount <= 0 || numAmount > 50_000_000) {
      console.error('Order validation failed — invalid amount:', amount)
      return NextResponse.json({ error: 'Invalid order amount' }, { status: 400 })
    }

    // Validate delivery address (minimum 3 chars — e.g. "Aja" is valid)
    const cleanAddress = String(delivery_address).trim().slice(0, 500)
    if (cleanAddress.length < 3) {
      console.error('Order validation failed — address too short:', cleanAddress)
      return NextResponse.json({ error: 'Delivery address is too short' }, { status: 400 })
    }

    // Validate paystack reference format — allow alphanumeric, dashes, underscores, dots, tildes
    if (paystack_reference && !/^[a-zA-Z0-9_.~-]{5,200}$/.test(String(paystack_reference))) {
      console.error('Order validation failed — bad paystack ref:', paystack_reference)
      return NextResponse.json({ error: 'Invalid payment reference format' }, { status: 400 })
    }

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

    // Use admin client to bypass RLS — payment already verified
    const supabase = createAdminClient()
    const protection_fee = calculateProtectionFee(Number(amount))
    const total_amount = Number(amount) + protection_fee
    const order_ref = generateOrderRef()

    // Create the order
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
        amount: Number(amount),
        protection_fee,
        total_amount,
        delivery_address,
        status: 'pending',
        paystack_reference: paystack_reference || null,
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
        message: `${resolvedBuyerName} placed an order for "${product_name}" — ₦${Number(amount).toLocaleString()}. Ref: ${order_ref}`,
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