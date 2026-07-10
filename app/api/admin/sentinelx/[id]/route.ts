import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminUser } from '@/lib/admin/require-admin'
import { nextStatus } from '@/lib/sentinelx/transitions'
import type { SentinelXAction } from '@/types/sentinelx'
import { sendSentinelXWebhook } from '@/lib/sentinelx/webhook'

const VALID_ACTIONS: SentinelXAction[] = ['release', 'refund', 'dispute']

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const action: SentinelXAction = body?.action
  if (!VALID_ACTIONS.includes(action)) {
    return NextResponse.json({ error: `action must be one of: ${VALID_ACTIONS.join(', ')}` }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data: order } = await supabase.from('sentinelx_orders').select().eq('id', id).maybeSingle()
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const updatedStatus = nextStatus(order.status, action)
  if (!updatedStatus) {
    return NextResponse.json({ error: `Cannot ${action} an order in status "${order.status}"` }, { status: 409 })
  }

  const resolved_at = action === 'dispute' ? null : new Date().toISOString()
  const { data: updated, error: updateError } = await supabase
    .from('sentinelx_orders')
    .update({ status: updatedStatus, ...(resolved_at ? { resolved_at } : {}) })
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    console.error('Admin SentinelX action failed:', updateError.message, id)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }

  if (action === 'release') {
    await sendSentinelXWebhook('delivery_confirmed', order.order_ref, {
      order_id: order.id,
      order_ref: order.order_ref,
      seller_id: order.seller_id,
      amount: order.amount,
    })
  } else if (action === 'refund') {
    await sendSentinelXWebhook('order_refunded', order.order_ref, {
      order_id: order.id,
      order_ref: order.order_ref,
      buyer_id: order.buyer_id,
      amount: order.amount,
    })
  }

  return NextResponse.json({ success: true, order: updated })
}
