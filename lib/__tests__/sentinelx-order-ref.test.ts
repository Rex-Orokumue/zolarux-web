import { describe, it, expect } from 'vitest'
import { generateSentinelXOrderRef } from '@/lib/utils'

describe('generateSentinelXOrderRef', () => {
  it('is prefixed with SNX-', () => {
    expect(generateSentinelXOrderRef()).toMatch(/^SNX-/)
  })

  it('produces unique refs across calls', () => {
    const a = generateSentinelXOrderRef()
    const b = generateSentinelXOrderRef()
    expect(a).not.toBe(b)
  })
})
