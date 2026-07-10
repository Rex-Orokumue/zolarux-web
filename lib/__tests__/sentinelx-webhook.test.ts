import { describe, it, expect, vi, afterEach } from 'vitest'
import { sendSentinelXWebhook } from '@/lib/sentinelx/webhook'

describe('sendSentinelXWebhook', () => {
  const ORIGINAL_ENV = { ...process.env }

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
    vi.unstubAllGlobals()
  })

  it('returns ok:false without calling fetch when unconfigured', async () => {
    delete process.env.SENTINELX_WEBHOOK_URL
    delete process.env.SENTINELX_API_SECRET
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    const result = await sendSentinelXWebhook('payment_held', 'SNX-1', {})
    expect(result.ok).toBe(false)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('posts the event with a bearer-secret header', async () => {
    process.env.SENTINELX_WEBHOOK_URL = 'https://sentinelx.example/webhooks/zolarux'
    process.env.SENTINELX_API_SECRET = 'shared-secret'
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    vi.stubGlobal('fetch', fetchSpy)

    const result = await sendSentinelXWebhook('delivery_confirmed', 'SNX-2', { seller_id: 'abc' })

    expect(result.ok).toBe(true)
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('https://sentinelx.example/webhooks/zolarux')
    expect(init.headers.Authorization).toBe('Bearer shared-secret')
    const body = JSON.parse(init.body)
    expect(body.event).toBe('delivery_confirmed')
    expect(body.order_ref).toBe('SNX-2')
    expect(body.data.seller_id).toBe('abc')
  })

  it('returns ok:false when SentinelX responds non-2xx', async () => {
    process.env.SENTINELX_WEBHOOK_URL = 'https://sentinelx.example/webhooks/zolarux'
    process.env.SENTINELX_API_SECRET = 'shared-secret'
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))

    const result = await sendSentinelXWebhook('order_refunded', 'SNX-3', {})
    expect(result.ok).toBe(false)
  })

  it('returns ok:false when fetch throws', async () => {
    process.env.SENTINELX_WEBHOOK_URL = 'https://sentinelx.example/webhooks/zolarux'
    process.env.SENTINELX_API_SECRET = 'shared-secret'
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    const result = await sendSentinelXWebhook('payment_held', 'SNX-4', {})
    expect(result.ok).toBe(false)
    expect(result.error).toBe('network down')
  })
})
