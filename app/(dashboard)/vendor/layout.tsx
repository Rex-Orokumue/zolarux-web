'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Package, User, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Dashboard',  href: '/vendor',          icon: Home },
  { label: 'Listings',   href: '/vendor/listings', icon: ShoppingBag },
  { label: 'Orders',     href: '/vendor/orders',   icon: Package },
  { label: 'Profile',    href: '/vendor/profile',  icon: User },
]

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const checkVendorStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: vendor } = await supabase
          .from('vendors')
          .select('status, is_verified')
          .eq('auth_user_id', session.user.id)
          .single()
        
        const status = vendor?.status || ''
        const verified = vendor?.is_verified || status === 'Verified' || status === 'verified'
        setIsVerified(verified)
      }
    }

    checkVendorStatus()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        checkVendorStatus()
      } else {
        setIsVerified(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const isActive = (href: string) => href === '/vendor' ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 gap-6">
        <aside className="w-48 shrink-0 hidden md:block">
          <nav className="space-y-1 sticky top-20">
            {isVerified && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2 mb-3">
                <Shield size={12} className="text-green-600" />
                <span className="text-green-700 text-xs font-700">Verified Vendor</span>
              </div>
            )}
            {NAV.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-600 transition-all",
                  isActive(href)
                    ? "text-primary bg-white shadow-card font-700"
                    : "text-gray-600 hover:bg-white hover:text-primary hover:shadow-card"
                )}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-40">
        {NAV.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-3 transition-colors",
              isActive(href) ? "text-primary font-700" : "text-gray-400 hover:text-primary"
            )}
          >
            <Icon size={18} />
            <span className="text-xs font-600">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
