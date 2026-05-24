'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Package, ShoppingCart, Heart, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Dashboard',  href: '/buyer',          icon: Home },
  { label: 'My Orders',  href: '/buyer/orders',   icon: Package },
  { label: 'Cart',       href: '/buyer/cart',      icon: ShoppingCart, isCart: true },
  { label: 'Wishlist',   href: '/buyer/wishlist',  icon: Heart },
  { label: 'Profile',    href: '/buyer/profile',   icon: User },
]

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [cartCount, setCartCount] = useState<number>(0)
  const [userId, setUserId] = useState<string | null>(null)

  const fetchCartCount = async (uid: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('buyer_id', uid)
    if (!error && data) {
      const totalQty = data.reduce((sum, item) => sum + (item.quantity || 0), 0)
      setCartCount(totalQty)
    }
  }

  useEffect(() => {
    const supabase = createClient()
    
    // Check initial user
    const getInitialUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUserId(session.user.id)
        fetchCartCount(session.user.id)
      }
    }
    getInitialUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id)
      } else {
        setUserId(null)
        setCartCount(0)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!userId) {
      setCartCount(0)
      return
    }

    const fetchCount = () => fetchCartCount(userId)
    
    // Call immediately on mount/user change
    fetchCount()

    // Listen to local cart updates
    window.addEventListener('cart-updated', fetchCount)

    // Supabase realtime subscription
    const supabase = createClient()
    const channel = supabase
      .channel(`buyer-layout-cart-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `buyer_id=eq.${userId}`
        },
        () => {
          fetchCount()
        }
      )
      .subscribe()

    return () => {
      window.removeEventListener('cart-updated', fetchCount)
      supabase.removeChannel(channel)
    }
  }, [userId])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 gap-6">
        <aside className="w-48 shrink-0 hidden md:block">
          <nav className="space-y-1 sticky top-20">
            {NAV.map(({ label, href, icon: Icon, isCart }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-600 transition-all group",
                  isActive(href)
                    ? "text-primary bg-white shadow-card"
                    : "text-gray-600 hover:bg-white hover:text-primary hover:shadow-card"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={15} />
                  <span>{label}</span>
                </div>
                {isCart && cartCount > 0 && (
                  <span className="bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center animate-scale-up">
                    {cartCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-40">
        {NAV.map(({ label, href, icon: Icon, isCart }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-3 transition-colors relative",
              isActive(href) ? "text-primary" : "text-gray-400 hover:text-primary"
            )}
          >
            <Icon size={18} />
            <span className="text-xs font-600">{label}</span>
            {isCart && cartCount > 0 && (
              <span className="absolute top-2 right-[25%] bg-accent text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center animate-scale-up">
                {cartCount}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </>
  )
}
