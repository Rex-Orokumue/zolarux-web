'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShoppingBag, Package, TrendingUp, Shield,
  AlertTriangle, CheckCircle, ArrowRight, Plus, RefreshCw,
  Smartphone, Link2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Order } from '@/types/order'

export default function VendorDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [vendor, setVendor] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [listingsCount, setListingsCount] = useState(0)
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0)
  const [completedOrdersCount, setCompletedOrdersCount] = useState(0)
  const [totalEarned, setTotalEarned] = useState(0)

  const fetchDashboardData = async (userId: string, silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)

    const supabase = createClient()

    try {
      // 1. Get vendor record by auth user ID
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('*')
        .eq('auth_user_id', userId)
        .single()

      if (vendorData) {
        setVendor(vendorData)

        // 2. Get recent orders for this vendor
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .eq('vendor_id', vendorData.vendor_id)
          .order('created_at', { ascending: false })
          .limit(5)
        const fetchedOrders = (ordersData as Order[]) || []
        setOrders(fetchedOrders)

        // 3. Get active listings count
        const { count: countListings } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('vendor_id', vendorData.vendor_id)
          .eq('is_active', true)
        setListingsCount(countListings ?? 0)

        // Calculate stats
        const pending = fetchedOrders.filter(o => ['pending', 'confirmed', 'in_transit'].includes(o.status))
        setPendingOrdersCount(pending.length)

        const completed = fetchedOrders.filter(o => o.status === 'completed')
        setCompletedOrdersCount(completed.length)

        setTotalEarned(completed.reduce((sum, o) => sum + o.amount, 0))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const supabase = createClient()
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        fetchDashboardData(session.user.id)
      }
    }
    loadSession()
  }, [])

  const handleRefresh = () => {
    if (user) {
      fetchDashboardData(user.id, true)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw size={24} className="animate-spin text-primary" />
        <p className="text-gray-400 text-sm mt-3">Loading dashboard data...</p>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 text-center animate-fade-up">
        <AlertTriangle size={28} className="text-amber-500 mx-auto mb-4" />
        <h2 className="font-display text-xl font-800 text-gray-900 mb-2">Vendor Profile Not Found</h2>
        <p className="text-gray-500 text-sm mb-6">
          Your account is not linked to a verified vendor profile.
          Apply to become a vendor or contact us for support.
        </p>
        <Link href="/register/vendor" className="inline-flex items-center gap-2 bg-primary text-white font-700 px-5 py-3 rounded-xl hover:bg-primary-dark transition-all">
          Apply as Vendor <ArrowRight size={15} />
        </Link>
      </div>
    )
  }

  const isVerifiedStatus = vendor.is_verified || vendor.status?.toLowerCase() === 'verified'

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Vendor Header Card with Silent Refresh */}
      <div className="bg-gray-950 rounded-2xl p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <span className="font-display font-800 text-white">{vendor.business_name?.[0]}</span>
            </div>
            <div>
              <h1 className="font-display text-xl font-800 text-white">{vendor.business_name}</h1>
              <p className="text-gray-400 text-xs font-mono">{vendor.vendor_id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isVerifiedStatus ? (
              <div className="flex items-center gap-1.5 bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1.5 shrink-0">
                <Shield size={12} className="text-green-400" />
                <span className="text-green-400 text-xs font-700">Verified</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1.5 shrink-0">
                <AlertTriangle size={12} className="text-amber-400" />
                <span className="text-amber-400 text-xs font-700">{vendor.status}</span>
              </div>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all disabled:opacity-50 text-white"
              title="Refresh Data"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active Listings',  value: listingsCount,           icon: ShoppingBag,  color: 'text-primary bg-primary-light' },
          { label: 'Pending Orders',   value: pendingOrdersCount,       icon: Package,      color: 'text-amber-600 bg-amber-50' },
          { label: 'Completed Orders', value: completedOrdersCount,     icon: CheckCircle,  color: 'text-green-600 bg-green-50' },
          { label: 'Total Earned',     value: formatPrice(totalEarned), icon: TrendingUp,   color: 'text-purple-600 bg-purple-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-card">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}>
              <Icon size={15} />
            </div>
            <p className="font-display font-800 text-gray-900 text-sm">{value}</p>
            <p className="text-gray-400 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h2 className="font-display font-700 text-gray-900">Recent Orders</h2>
          <Link href="/vendor/orders" className="text-xs text-primary font-700 hover:underline flex items-center gap-1">
            View all <ArrowRight size={11} />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-10 text-center">
            <Package size={24} className="text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No orders yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map((order) => (
              <div key={order.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-700 text-gray-900 text-sm truncate">{order.product_name}</p>
                  <p className="text-xs text-gray-400 font-mono">{order.order_ref} · {formatDate(order.created_at)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-700 text-gray-900 text-sm">{formatPrice(order.amount)}</p>
                  <span className={`text-xs font-700 ${
                    order.status === 'completed' ? 'text-green-600' :
                    order.status === 'disputed' ? 'text-red-500' :
                    'text-amber-600'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions with safety tools */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
        <h2 className="font-display font-700 text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add New Listing',  href: '/vendor/listings/new', icon: Plus,         color: 'bg-primary text-white', primary: true },
            { label: 'View Listings',    href: '/vendor/listings',     icon: ShoppingBag,  color: 'bg-primary-light text-primary' },
            { label: 'View Orders',      href: '/vendor/orders',       icon: Package,      color: 'bg-amber-50 text-amber-600' },
            { label: 'Edit Profile',     href: '/vendor/profile',      icon: Shield,       color: 'bg-green-50 text-green-600' },
            { label: 'Check Stolen Status',href: '/check-device',      icon: Smartphone,   color: 'bg-red-50 text-red-600' },
            { label: 'Scan Product Link',  href: '/scan-link',         icon: Link2,        color: 'bg-orange-50 text-orange-600' },
            { label: 'Check a Vendor',   href: '/check-vendor',        icon: Shield,       color: 'bg-blue-50 text-blue-600' },
          ].map(({ label, href, icon: Icon, color, primary }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 p-3.5 rounded-xl border transition-all group ${
                primary
                  ? 'bg-primary border-primary text-white hover:bg-primary-dark'
                  : 'bg-surface border-gray-100 hover:border-primary hover:bg-primary-light hover:shadow-card'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${primary ? 'bg-white/20' : color}`}>
                <Icon size={15} className={primary ? 'text-white' : ''} />
              </div>
              <span className={`font-600 text-xs sm:text-sm ${primary ? 'text-white' : 'text-gray-700 group-hover:text-primary transition-colors'}`}>
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}