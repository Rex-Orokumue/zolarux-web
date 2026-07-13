import { NextResponse } from 'next/server'
import { requireAdminUser } from '@/lib/admin/require-admin'

export async function GET() {
  const admin = await requireAdminUser()
  return NextResponse.json({ isAdmin: !!admin })
}
