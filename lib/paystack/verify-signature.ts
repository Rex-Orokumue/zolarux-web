import { createHmac, timingSafeEqual } from 'crypto'

/** Verifies a Paystack webhook's x-paystack-signature header (HMAC-SHA512 over the raw body). */
export function verifyPaystackSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false

  const expected = createHmac('sha512', secret).update(rawBody).digest('hex')

  const expectedBuf = Buffer.from(expected, 'utf8')
  const signatureBuf = Buffer.from(signature, 'utf8')
  if (expectedBuf.length !== signatureBuf.length) return false

  return timingSafeEqual(expectedBuf, signatureBuf)
}
