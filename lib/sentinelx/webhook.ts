import type { SentinelXWebhookEvent, SentinelXWebhookPayload } from '@/types/sentinelx'

/** Fire-and-forget POST to SentinelX. Never throws — logs and returns ok:false on failure. */
export async function sendSentinelXWebhook(
  event: SentinelXWebhookEvent,
  orderRef: string,
  data: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  const url = process.env.SENTINELX_WEBHOOK_URL
  const secret = process.env.SENTINELX_API_SECRET

  if (!url || !secret) {
    console.error('SentinelX webhook not sent — missing SENTINELX_WEBHOOK_URL or SENTINELX_API_SECRET')
    return { ok: false, error: 'SentinelX webhook not configured' }
  }

  const payload: SentinelXWebhookPayload = {
    event,
    order_ref: orderRef,
    data,
    sent_at: new Date().toISOString(),
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      console.error(`SentinelX webhook ${event} failed — status ${res.status}`, orderRef)
      return { ok: false, error: `SentinelX responded ${res.status}` }
    }

    return { ok: true }
  } catch (err: any) {
    console.error(`SentinelX webhook ${event} threw`, orderRef, err?.message)
    return { ok: false, error: err?.message || 'Network error' }
  }
}
