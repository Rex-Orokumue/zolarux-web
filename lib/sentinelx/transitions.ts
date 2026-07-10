import type { SentinelXOrderStatus, SentinelXAction } from '@/types/sentinelx'

const ALLOWED_FROM: Record<SentinelXAction, SentinelXOrderStatus[]> = {
  release: ['held', 'disputed'],
  refund: ['held', 'disputed'],
  dispute: ['held'],
}

const RESULT_STATUS: Record<SentinelXAction, SentinelXOrderStatus> = {
  release: 'released',
  refund: 'refunded',
  dispute: 'disputed',
}

/** Returns the next status for an admin action, or null if the transition isn't allowed from the current status. */
export function nextStatus(
  current: SentinelXOrderStatus,
  action: SentinelXAction,
): SentinelXOrderStatus | null {
  if (!ALLOWED_FROM[action].includes(current)) return null
  return RESULT_STATUS[action]
}
