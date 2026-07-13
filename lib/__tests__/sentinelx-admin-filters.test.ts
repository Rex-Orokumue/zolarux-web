import { describe, it, expect } from 'vitest'
import { parseStatusFilter, sanitizeSearch, parsePage, buildSentinelXHref } from '@/lib/sentinelx/admin-filters'

describe('parseStatusFilter', () => {
  it('returns the status when it is a valid SentinelXOrderStatus', () => {
    expect(parseStatusFilter('held')).toBe('held')
  })
  it('returns undefined for an invalid status', () => {
    expect(parseStatusFilter('bogus')).toBeUndefined()
  })
  it('returns undefined when status is undefined', () => {
    expect(parseStatusFilter(undefined)).toBeUndefined()
  })
})

describe('sanitizeSearch', () => {
  it('trims whitespace', () => {
    expect(sanitizeSearch('  order123  ')).toBe('order123')
  })
  it('strips %, comma, and ) characters', () => {
    expect(sanitizeSearch('abc%,)def')).toBe('abcdef')
  })
  it('returns empty string when q is undefined', () => {
    expect(sanitizeSearch(undefined)).toBe('')
  })
})

describe('parsePage', () => {
  it('defaults to 1 when page is undefined', () => {
    expect(parsePage(undefined)).toBe(1)
  })
  it('parses a valid positive integer string', () => {
    expect(parsePage('3')).toBe(3)
  })
  it('clamps to 1 for zero or negative values', () => {
    expect(parsePage('0')).toBe(1)
    expect(parsePage('-5')).toBe(1)
  })
  it('clamps to 1 for non-numeric input', () => {
    expect(parsePage('abc')).toBe(1)
  })
})

describe('buildSentinelXHref', () => {
  it('returns the base path with no params', () => {
    expect(buildSentinelXHref({})).toBe('/admin/sentinelx')
  })
  it('includes status when provided', () => {
    expect(buildSentinelXHref({ status: 'held' })).toBe('/admin/sentinelx?status=held')
  })
  it('includes q when provided', () => {
    expect(buildSentinelXHref({ q: 'order123' })).toBe('/admin/sentinelx?q=order123')
  })
  it('omits page when it is 1', () => {
    expect(buildSentinelXHref({ page: 1 })).toBe('/admin/sentinelx')
  })
  it('includes page when greater than 1', () => {
    expect(buildSentinelXHref({ page: 2 })).toBe('/admin/sentinelx?page=2')
  })
  it('combines status, q, and page', () => {
    expect(buildSentinelXHref({ status: 'disputed', q: 'foo', page: 3 })).toBe(
      '/admin/sentinelx?status=disputed&q=foo&page=3'
    )
  })
})
