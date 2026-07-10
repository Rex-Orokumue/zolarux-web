import { redirect } from 'next/navigation'
import Link from 'next/link'
import { requireAdminUser } from '@/lib/admin/require-admin'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminUser()
  if (!admin) redirect('/')

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/admin/sentinelx" className="font-display font-700 text-gray-900 text-sm">
            Zolarux Admin
          </Link>
          <span className="text-gray-500 text-xs">{admin.email}</span>
        </div>
      </header>
      {children}
    </div>
  )
}
