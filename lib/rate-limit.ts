/**
 * In-memory rate limiter for API routes.
 *
 * Uses a sliding window approach with automatic cleanup.
 * For single-instance deployments (Vercel, single Node process).
 * For multi-instance production, swap to Redis-backed (@upstash/ratelimit).
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 60 seconds
let cleanupTimer: ReturnType<typeof setInterval> | null = null
function ensureCleanup() {
  if (cleanupTimer) return
  cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key)
    }
    // If store is empty, stop the timer
    if (store.size === 0 && cleanupTimer) {
      clearInterval(cleanupTimer)
      cleanupTimer = null
    }
  }, 60_000)
  // Don't keep the process alive just for cleanup
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref()
  }
}

/**
 * Check if a request is rate limited.
 *
 * @param identifier - Unique key (e.g. IP address, user ID)
 * @param maxRequests - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns { limited, remaining, resetIn }
 */
export function rateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { limited: boolean; remaining: number; resetIn: number } {
  ensureCleanup()

  const now = Date.now()
  const key = identifier
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    // First request or window expired — start fresh
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { limited: false, remaining: maxRequests - 1, resetIn: windowMs }
  }

  // Within the window
  entry.count++
  const remaining = Math.max(0, maxRequests - entry.count)
  const resetIn = entry.resetAt - now

  if (entry.count > maxRequests) {
    return { limited: true, remaining: 0, resetIn }
  }

  return { limited: false, remaining, resetIn }
}

/**
 * Extract client IP from Next.js request headers.
 * Works on Vercel, Cloudflare, and local dev.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    'unknown'
  )
}
