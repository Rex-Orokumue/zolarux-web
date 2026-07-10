import { NextRequest } from 'next/server'

export function verifySentinelXSecret(
  request: NextRequest,
): { ok: boolean; error?: string; status?: number } {
  const secret = process.env.SENTINELX_API_SECRET
  if (!secret) {
    return { ok: false, error: 'SentinelX integration not configured', status: 500 }
  }

  const authHeader = request.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token || token !== secret) {
    return { ok: false, error: 'Unauthorized', status: 401 }
  }

  return { ok: true }
}
