import { getUser } from '@/lib/supabase/server'

export interface AdminUser {
  id: string
  email: string
}

/** Returns the current user if their email is on the ADMIN_EMAILS allowlist, else null. */
export async function requireAdminUser(): Promise<AdminUser | null> {
  const allowlist = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  if (allowlist.length === 0) return null

  const { data: { user } } = await getUser()
  if (!user?.email) return null

  if (!allowlist.includes(user.email.toLowerCase())) return null

  return { id: user.id, email: user.email }
}
