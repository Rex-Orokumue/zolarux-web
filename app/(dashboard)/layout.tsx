import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Shield, ShoppingBag, Package, User, LogOut, Home, ShoppingCart, Heart } from 'lucide-react'

const BUYER_NAV = [
  { label: 'Dashboard',  href: '/buyer',           icon: Home },
  { label: 'My Orders',  href: '/buyer/orders',    icon: Package },
  { label: 'Cart',       href: '/buyer/cart',       icon: ShoppingCart },
  { label: 'Wishlist',   href: '/buyer/wishlist',  icon: Heart },
  { label: 'Profile',    href: '/buyer/profile',   icon: User },
]

const VENDOR_NAV = [
  { label: 'Dashboard',  href: '/vendor',          icon: Home },
  { label: 'Listings',   href: '/vendor/listings', icon: ShoppingBag },
  { label: 'Orders',     href: '/vendor/orders',   icon: Package },
  { label: 'Profile',    href: '/vendor/profile',  icon: User },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // We render BOTH navs but only show the correct one using CSS
  // driven by vendor/buyer sub-layouts that set a data attribute.
  // Since we can't reliably get the path in a shared layout,
  // we pass both configs down and let the child layouts handle it.

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-display font-800 text-xs">Z</span>
            </div>
            <span className="font-display font-700 text-gray-900 text-sm">Zolarux</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-xs hidden sm:block">
              {user.email}
            </span>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-50"
              >
                <LogOut size={13} />
                <span className="hidden sm:block">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {children}
    </div>
  )
}