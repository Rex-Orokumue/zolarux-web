'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShoppingBag, Package, TrendingUp, Shield,
  AlertTriangle, CheckCircle, ArrowRight, Plus, RefreshCw,
  Smartphone, Link2, BarChart2
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Order } from '@/types/order'
import ReferralWidget from '@/components/dashboard/ReferralWidget'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RevenuePoint { date: string; revenue: number }
interface StatusPoint  { name: string; value: number; color: string }
interface TopListing   { name: string; orders: number }

interface AnalyticsData {
  revenueByDay:   RevenuePoint[]
  ordersByStatus: StatusPoint[]
  topListings:    TopListing[]
  totalRevenue:   number
  avgOrderValue:  number
}

const STATUS_COLORS: Record<string, string> = {
  pending:                        '#F59E0B',
  'pre-shipment verification':    '#6366F1',
  'in transit':                   '#3B82F6',
  'awaiting buyer confirmation':  '#8B5CF6',
  completed:                      '#10B981',
  cancelled:                      '#6B7280',
  disputed:                       '#EF4444',
  'dispute closed':               '#F97316',
}

// ─── Chart sub-components ─────────────────────────────────────────────────────

function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const formatK = (v: number) =>
    v >= 1000 ? `₦${(v / 1000).toFixed(0)}k` : `₦${v}`

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-gray-950 text-white text-xs px-3 py-2 rounded-xl shadow-lg">
        <p className="text-gray-400 mb-0.5">{label}</p>
        <p className="font-700 text-primary">{formatPrice(payload[0].value)}</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF', fontFamily: 'Open Sans' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
        <YAxis tickFormatter={formatK} tick={{ fontSize: 10, fill: '#9CA3AF', fontFamily: 'Open Sans' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }} />
        <Line type="monotone" dataKey="revenue" stroke="#4064D7" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#4064D7', strokeWidth: 0 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

function StatusDonut({ data }: { data: StatusPoint[] }) {
  const [active, setActive] = useState<number | null>(null)

  const CustomTooltip = ({ active: a, payload }: any) => {
    if (!a || !payload?.length) return null
    return (
      <div className="bg-gray-950 text-white text-xs px-3 py-2 rounded-xl shadow-lg">
        <p className="font-700" style={{ color: payload[0].payload.color }}>{payload[0].name}</p>
        <p className="text-gray-300">{payload[0].value} order{payload[0].value !== 1 ? 's' : ''}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value"
            onMouseEnter={(_, i) => setActive(i)} onMouseLeave={() => setActive(null)}>
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={entry.color} opacity={active === null || active === i ? 1 : 0.4} style={{ transition: 'opacity 0.2s', cursor: 'pointer' }} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-1">
        {data.map((s) => (
          <div key={s.name} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-xs text-gray-500 capitalize">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TopListingsBar({ data }: { data: TopListing[] }) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-gray-950 text-white text-xs px-3 py-2 rounded-xl shadow-lg">
        <p className="text-gray-300">{payload[0].value} order{payload[0].value !== 1 ? 's' : ''}</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(data.length * 44, 160)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 0, bottom: 0 }} barCategoryGap="30%">
        <XAxis type="number" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: '#374151', fontFamily: 'Open Sans' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F3F4F6' }} />
        <Bar dataKey="orders" radius={[0, 6, 6, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === 0 ? '#FF6600' : '#4064D7'} opacity={1 - i * 0.12} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function VendorDashboardPage() {
  const [loading, setLoading]                       = useState(true)
  const [refreshing, setRefreshing]                 = useState(false)
  const [user, setUser]                             = useState<any>(null)
  const [vendor, setVendor]                         = useState<any>(null)
  const [orders, setOrders]                         = useState<Order[]>([])
  const [listingsCount, setListingsCount]           = useState(0)
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0)
  const [completedOrdersCount, setCompletedOrdersCount] = useState(0)
  const [totalEarned, setTotalEarned]               = useState(0)
  const [analytics, setAnalytics]                   = useState<AnalyticsData | null>(null)

  const fetchDashboardData = async (userId: string, silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)

    const supabase = createClient()

    try {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('*')
        .eq('auth_user_id', userId)
        .single()

      if (vendorData) {
        setVendor(vendorData)

        const { data: recentOrdersData } = await supabase
          .from('orders')
          .select('*')
          .eq('vendor_id', vendorData.vendor_id)
          .order('created_at', { ascending: false })
          .limit(5)
        const fetchedOrders = (recentOrdersData as Order[]) || []
        setOrders(fetchedOrders)

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data: allOrdersData } = await supabase
          .from('orders')
          .select('id, amount, status, created_at, product_id')
          .eq('vendor_id', vendorData.vendor_id)
        const allOrders = allOrdersData || []

        const { count: countListings } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('vendor_id', vendorData.vendor_id)
          .eq('is_active', true)
        setListingsCount(countListings ?? 0)

        const pending   = allOrders.filter(o => ['pending', 'confirmed', 'in_transit'].includes(o.status))
        const completed = allOrders.filter(o => o.status === 'completed')
        setPendingOrdersCount(pending.length)
        setCompletedOrdersCount(completed.length)
        const revenue = completed.reduce((s, o) => s + (o.amount ?? 0), 0)
        setTotalEarned(revenue)

        // Revenue by day
        const recentCompleted = allOrders.filter(o =>
          o.status === 'completed' && new Date(o.created_at) >= thirtyDaysAgo
        )
        const revenueMap: Record<string, number> = {}
        for (let i = 29; i >= 0; i--) {
          const d = new Date(); d.setDate(d.getDate() - i)
          const key = d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })
          revenueMap[key] = 0
        }
        recentCompleted.forEach(o => {
          const key = new Date(o.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })
          if (key in revenueMap) revenueMap[key] = (revenueMap[key] ?? 0) + (o.amount ?? 0)
        })
        const revenueByDay: RevenuePoint[] = Object.entries(revenueMap).map(([date, revenue]) => ({ date, revenue }))

        // Orders by status
        const statusCount: Record<string, number> = {}
        allOrders.forEach(o => { const s = o.status || 'unknown'; statusCount[s] = (statusCount[s] ?? 0) + 1 })
        const ordersByStatus: StatusPoint[] = Object.entries(statusCount)
          .map(([name, value]) => ({ name, value, color: STATUS_COLORS[name] ?? '#9CA3AF' }))
          .sort((a, b) => b.value - a.value)

        // Top 5 listings
        const productOrderCount: Record<string, number> = {}
        allOrders.forEach(o => {
          if (o.product_id) productOrderCount[o.product_id] = (productOrderCount[o.product_id] ?? 0) + 1
        })
        const topProductIds = Object.entries(productOrderCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id]) => id)

        let topListings: TopListing[] = []
        if (topProductIds.length > 0) {
          const { data: productsData } = await supabase.from('products').select('id, name').in('id', topProductIds)
          topListings = topProductIds.map(id => {
            const product = productsData?.find(p => p.id === id)
            const name = product?.name ?? `Product ${id.slice(0, 6)}`
            return { name: name.length > 18 ? name.slice(0, 16) + '…' : name, orders: productOrderCount[id] }
          })
        }

        const avgOrderValue = completed.length > 0 ? revenue / completed.length : 0
        setAnalytics({ revenueByDay, ordersByStatus, topListings, totalRevenue: revenue, avgOrderValue })
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

  const handleRefresh = () => { if (user) fetchDashboardData(user.id, true) }

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
        <p className="text-gray-500 text-sm mb-6">Your account is not linked to a verified vendor profile.</p>
        <Link href="/register/vendor" className="inline-flex items-center gap-2 bg-primary text-white font-700 px-5 py-3 rounded-xl hover:bg-primary-dark transition-all">
          Apply as Vendor <ArrowRight size={15} />
        </Link>
      </div>
    )
  }

  const isVerifiedStatus = vendor.is_verified || vendor.status?.toLowerCase() === 'verified'

  return (
    <div className="space-y-6 pb-20 md:pb-6">

      {/* Vendor Header */}
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
            <button onClick={handleRefresh} disabled={refreshing}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all disabled:opacity-50 text-white">
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

      {/* Analytics */}
      {analytics && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart2 size={16} className="text-primary" />
            <h2 className="font-display font-700 text-gray-900">Analytics</h2>
            <span className="text-xs text-gray-400 ml-1">Last 30 days</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-primary rounded-2xl p-4 text-white">
              <p className="text-xs font-600 mb-1 opacity-70">Total Revenue</p>
              <p className="font-display font-800 text-xl">{formatPrice(analytics.totalRevenue)}</p>
              <p className="text-xs opacity-60 mt-0.5">from completed orders</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-card">
              <p className="text-gray-400 text-xs font-600 mb-1">Avg. Order Value</p>
              <p className="font-display font-800 text-xl text-gray-900">{formatPrice(analytics.avgOrderValue)}</p>
              <p className="text-xs text-gray-400 mt-0.5">per completed order</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
            <h3 className="font-display font-700 text-gray-900 text-sm mb-1">Revenue (30 days)</h3>
            <p className="text-gray-400 text-xs mb-4">Completed order revenue by day</p>
            {analytics.revenueByDay.every(d => d.revenue === 0) ? (
              <div className="h-[200px] flex flex-col items-center justify-center text-center">
                <TrendingUp size={24} className="text-gray-200 mb-2" />
                <p className="text-gray-400 text-sm">No completed revenue in last 30 days</p>
              </div>
            ) : (
              <RevenueChart data={analytics.revenueByDay} />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h3 className="font-display font-700 text-gray-900 text-sm mb-1">Orders by Status</h3>
              <p className="text-gray-400 text-xs mb-4">All-time breakdown</p>
              {analytics.ordersByStatus.length === 0 ? (
                <div className="h-[180px] flex items-center justify-center">
                  <p className="text-gray-400 text-sm">No orders yet</p>
                </div>
              ) : (
                <StatusDonut data={analytics.ordersByStatus} />
              )}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h3 className="font-display font-700 text-gray-900 text-sm mb-1">Top Listings</h3>
              <p className="text-gray-400 text-xs mb-4">By total order count</p>
              {analytics.topListings.length === 0 ? (
                <div className="h-[160px] flex items-center justify-center">
                  <p className="text-gray-400 text-sm">No listings with orders yet</p>
                </div>
              ) : (
                <TopListingsBar data={analytics.topListings} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Referral Widget */}
      {user && vendor && (
        <ReferralWidget userId={user.id} userType="vendor" />
      )}

      {/* Recent Orders */}
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
                  <span className={`text-xs font-700 ${order.status === 'completed' ? 'text-green-600' : order.status === 'disputed' ? 'text-red-500' : 'text-amber-600'}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
        <h2 className="font-display font-700 text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add New Listing',    href: '/vendor/listings/new', icon: Plus,       color: 'bg-primary text-white',          primary: true },
            { label: 'View Listings',      href: '/vendor/listings',     icon: ShoppingBag,color: 'bg-primary-light text-primary' },
            { label: 'View Orders',        href: '/vendor/orders',       icon: Package,    color: 'bg-amber-50 text-amber-600' },
            { label: 'Edit Profile',       href: '/vendor/profile',      icon: Shield,     color: 'bg-green-50 text-green-600' },
            { label: 'Check Stolen Status',href: '/check-device',        icon: Smartphone, color: 'bg-red-50 text-red-600' },
            { label: 'Scan Product Link',  href: '/scan-link',           icon: Link2,      color: 'bg-orange-50 text-orange-600' },
            { label: 'Check a Vendor',     href: '/check-vendor',        icon: Shield,     color: 'bg-blue-50 text-blue-600' },
          ].map(({ label, href, icon: Icon, color, primary }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-2.5 p-3.5 rounded-xl border transition-all group ${
                primary ? 'bg-primary border-primary text-white hover:bg-primary-dark' : 'bg-surface border-gray-100 hover:border-primary hover:bg-primary-light hover:shadow-card'
              }`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${primary ? 'bg-white/20' : color}`}>
                <Icon size={15} className={primary ? 'text-white' : ''} />
              </div>
              <span className={`font-600 text-xs sm:text-sm ${primary ? 'text-white' : 'text-gray-700 group-hover:text-primary transition-colors'}`}>{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}