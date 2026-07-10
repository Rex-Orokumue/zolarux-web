import { describe, it, expect } from 'vitest'
import { createHmac } from 'crypto'
import { verifyPaystackSignature } from '@/lib/paystack/verify-signature'

describe('verifyPaystackSignature', () => {
  const secret = 'sk_test_12345'
  const body = JSON.stringify({ event: 'charge.success', data: { reference: 'SNX-1' } })
  const validSignature = createHmac('sha512', secret).update(body).digest('hex')

  it('accepts a correctly signed payload', () => {
    expect(verifyPaystackSignature(body, validSignature, secret)).toBe(true)
  })

  it('rejects a tampered body', () => {
    const tampered = JSON.stringify({ event: 'charge.success', data: { reference: 'SNX-EVIL' } })
    expect(verifyPaystackSignature(tampered, validSignature, secret)).toBe(false)
  })

  it('rejects a missing signature header', () => {
    expect(verifyPaystackSignature(body, null, secret)).toBe(false)
  })

  it('rejects when secret is empty', () => {
    expect(verifyPaystackSignature(body, validSignature, '')).toBe(false)
  })
})
