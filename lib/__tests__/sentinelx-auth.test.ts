import { describe, it, expect, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { verifySentinelXSecret } from '@/lib/sentinelx/auth'

function reqWithAuth(header: string | null) {
  const headers = new Headers()
  if (header !== null) headers.set('authorization', header)
  return new NextRequest('http://localhost/api/sentinelx/escrow/initiate', { headers })
}

describe('verifySentinelXSecret', () => {
  const ORIGINAL = process.env.SENTINELX_API_SECRET

  afterEach(() => {
    process.env.SENTINELX_API_SECRET = ORIGINAL
  })

  it('rejects when secret is not configured', () => {
    delete process.env.SENTINELX_API_SECRET
    const result = verifySentinelXSecret(reqWithAuth('Bearer whatever'))
    expect(result.ok).toBe(false)
    expect(result.status).toBe(500)
  })

  it('rejects a missing Authorization header', () => {
    process.env.SENTINELX_API_SECRET = 'top-secret'
    const result = verifySentinelXSecret(reqWithAuth(null))
    expect(result.ok).toBe(false)
    expect(result.status).toBe(401)
  })

  it('rejects a mismatched token', () => {
    process.env.SENTINELX_API_SECRET = 'top-secret'
    const result = verifySentinelXSecret(reqWithAuth('Bearer wrong-token'))
    expect(result.ok).toBe(false)
    expect(result.status).toBe(401)
  })

  it('accepts a matching bearer token', () => {
    process.env.SENTINELX_API_SECRET = 'top-secret'
    const result = verifySentinelXSecret(reqWithAuth('Bearer top-secret'))
    expect(result.ok).toBe(true)
  })
})
