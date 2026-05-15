import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Shield, ShoppingBag, Package, User, LogOut, Home, ShoppingCart, Heart } from 'lucide-react'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check if vendor or buyer
  const { data: vendor } = await supabase
    .from('vendors')
    .select('vendor_id, business_name, status')
    .eq('email', user.email ?? '')
    .single()

  const isVendor = !!vendor

  const NAV = isVendor ? [
    { label: 'Dashboard',  href: '/vendor',          icon: Home },
    { label: 'Listings',   href: '/vendor/listings', icon: ShoppingBag },
    { label: 'Orders',     href: '/vendor/orders',   icon: Package },
    { label: 'Profile',    href: '/vendor/profile',  icon: User },
  ] : [
    { label: 'Dashboard',  href: '/buyer',           icon: Home },
    { label: 'My Orders',  href: '/buyer/orders',    icon: Package },
    { label: 'Cart',       href: '/buyer/cart',      icon: ShoppingCart },
    { label: 'Wishlist',   href: '/buyer/wishlist',  icon: Heart },
    { label: 'Profile',    href: '/buyer/profile',   icon: User },
  ]

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
            {isVendor && vendor && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                <Shield size={11} className="text-green-600" />
                <span className="text-green-700 text-xs font-700">Verified Vendor</span>
              </div>
            )}
            <span className="text-gray-500 text-xs hidden sm:block">
              {user.phone}
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

      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 gap-6">
        {/* Sidebar */}
        <aside className="w-48 shrink-0 hidden md:block">
          <nav className="space-y-1 sticky top-20">
            {NAV.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-600 text-gray-600 hover:bg-white hover:text-primary hover:shadow-card transition-all"
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-40">
        {NAV.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-400 hover:text-primary transition-colors"
          >
            <Icon size={18} />
            <span className="text-xs font-600">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}