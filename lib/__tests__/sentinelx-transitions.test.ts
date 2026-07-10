import { describe, it, expect } from 'vitest'
import { nextStatus } from '@/lib/sentinelx/transitions'

describe('nextStatus', () => {
  it('allows release from held', () => {
    expect(nextStatus('held', 'release')).toBe('released')
  })
  it('allows release from disputed', () => {
    expect(nextStatus('disputed', 'release')).toBe('released')
  })
  it('allows refund from held', () => {
    expect(nextStatus('held', 'refund')).toBe('refunded')
  })
  it('allows refund from disputed', () => {
    expect(nextStatus('disputed', 'refund')).toBe('refunded')
  })
  it('allows dispute from held', () => {
    expect(nextStatus('held', 'dispute')).toBe('disputed')
  })
  it('rejects release from initiated', () => {
    expect(nextStatus('initiated', 'release')).toBeNull()
  })
  it('rejects refund from an already-released order', () => {
    expect(nextStatus('released', 'refund')).toBeNull()
  })
  it('rejects dispute from an already-disputed order', () => {
    expect(nextStatus('disputed', 'dispute')).toBeNull()
  })
})
