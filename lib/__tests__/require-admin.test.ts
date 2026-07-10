import { describe, it, expect, vi, afterEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  getUser: vi.fn(),
}))

import { getUser } from '@/lib/supabase/server'
import { requireAdminUser } from '@/lib/admin/require-admin'

describe('requireAdminUser', () => {
  const ORIGINAL_ENV = { ...process.env }

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
    vi.clearAllMocks()
  })

  it('returns null when ADMIN_EMAILS is unset', async () => {
    delete process.env.ADMIN_EMAILS
    vi.mocked(getUser).mockResolvedValue({ data: { user: { id: '1', email: 'ops@zolarux.com.ng' } } } as any)

    expect(await requireAdminUser()).toBeNull()
  })

  it('returns null when there is no session', async () => {
    process.env.ADMIN_EMAILS = 'ops@zolarux.com.ng'
    vi.mocked(getUser).mockResolvedValue({ data: { user: null } } as any)

    expect(await requireAdminUser()).toBeNull()
  })

  it('returns null when the user is not on the allowlist', async () => {
    process.env.ADMIN_EMAILS = 'ops@zolarux.com.ng'
    vi.mocked(getUser).mockResolvedValue({ data: { user: { id: '2', email: 'random@gmail.com' } } } as any)

    expect(await requireAdminUser()).toBeNull()
  })

  it('returns the user when their email is on the allowlist (case-insensitive)', async () => {
    process.env.ADMIN_EMAILS = 'Ops@Zolarux.com.ng, second@zolarux.com.ng'
    vi.mocked(getUser).mockResolvedValue({ data: { user: { id: '3', email: 'ops@zolarux.com.ng' } } } as any)

    expect(await requireAdminUser()).toEqual({ id: '3', email: 'ops@zolarux.com.ng' })
  })
})
