import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateOrderRef, calculateProtectionFee } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      product_id,
      product_name,
      vendor_id,
      vendor_name,
      amount,
      delivery_address,
      buyer_name,
      paystack_reference,
    } = body

    // Validate required fields
    if (!product_id || !product_name || !vendor_id || !amount || !delivery_address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const protection_fee = calculateProtectionFee(amount)
    const total_amount = amount + protection_fee
    const order_ref = generateOrderRef()

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_ref,
        product_id,
        product_name,
        vendor_id,
        vendor_name,
        buyer_id: user.id,
        buyer_email: user.email || '',
        buyer_name: buyer_name || 'Buyer',
        buyer_phone: user.phone || '',
        amount,
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
      console.error('Order creation error:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Notify admin via admin_notifications table (triggers real-time in admin app)
    await supabase
      .from('admin_notifications')
      .insert({
        title: 'New Order Received',
        message: `${buyer_name || 'A buyer'} placed an order for "${product_name}" — ₦${amount.toLocaleString()}. Ref: ${order_ref}`,
        type: 'new_order',
        is_read: false,
        order_ref,
        created_at: new Date().toISOString(),
      })

    return NextResponse.json({ success: true, order })

  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}