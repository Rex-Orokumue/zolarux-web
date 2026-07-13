import type { SentinelXOrderStatus } from '@/types/sentinelx'

const FILTERABLE_STATUSES: SentinelXOrderStatus[] = ['initiated', 'held', 'released', 'refunded', 'disputed']

export function parseStatusFilter(status: string | undefined): SentinelXOrderStatus | undefined {
  if (!status) return undefined
  return (FILTERABLE_STATUSES as string[]).includes(status) ? (status as SentinelXOrderStatus) : undefined
}

export function sanitizeSearch(q: string | undefined): string {
  return (q || '').replace(/[%,)]/g, '').trim()
}

export function parsePage(page: string | undefined): number {
  const parsed = parseInt(page || '1', 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

export function buildSentinelXHref(params: { status?: string; q?: string; page?: number }): string {
  const search = new URLSearchParams()
  if (params.status) search.set('status', params.status)
  if (params.q) search.set('q', params.q)
  if (params.page && params.page > 1) search.set('page', String(params.page))
  const qs = search.toString()
  return `/admin/sentinelx${qs ? `?${qs}` : ''}`
}
