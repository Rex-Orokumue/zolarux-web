'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, calculateProtectionFee } from '@/lib/utils'
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, ArrowRight, Loader2, ShoppingBag } from 'lucide-react'
import type { CartItem } from '@/types/order'

export default function CartPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)
  const [checkingOut, setCheckingOut] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [buyerName, setBuyerName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) { router.push('/login'); return }

    setUserEmail(user.email || '')
    setUserId(user.id)

    // Load buyer profile for name
    const { data: profile } = await supabase
      .from('buyers')
      .select('full_name')
      .eq('id', user.id)
      .single()
    if (profile?.full_name) setBuyerName(profile.full_name)

    const { data } = await supabase
      .from('cart_items')
      .select('*')
      .eq('buyer_id', user.id)
      .order('added_at', { ascending: false })

    setItems((data as CartItem[]) || [])
    setLoading(false)
  }

  const removeItem = async (id: string) => {
    setRemoving(id)
    const supabase = createClient()
    await supabase.from('cart_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
    setRemoving(null)
  }

  const updateQuantity = async (id: string, delta: number) => {
    const item = items.find(i => i.id === id)
    if (!item) return
    const newQty = item.quantity + delta
    if (newQty < 1) { removeItem(id); return }

    const supabase = createClient()
    await supabase.from('cart_items').update({ quantity: newQty }).eq('id', id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: newQty } : i))
  }

  const fixedItems = items.filter(i => i.pricing_type === 'fixed')
  const subtotal = fixedItems.reduce((sum, i) => sum + (i.price * i.quantity), 0)
  const protectionFee = fixedItems.length > 0 ? calculateProtectionFee(subtotal) : 0
  const total = subtotal + protectionFee

  const handleCheckout = async () => {
    setError('')
    if (!deliveryAddress.trim()) { setError('Enter your delivery address'); return }
    if (!buyerName.trim()) { setError('Enter your full name'); return }
    if (fixedItems.length === 0) { setError('No priced items in cart'); return }

    setCheckingOut(true)

    try {
      // Load Paystack
      if (!(window as any).PaystackPop) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://js.paystack.co/v1/inline.js'
          script.onload = () => resolve()
          script.onerror = reject
          document.head.appendChild(script)
        })
      }

      const handleCartPaymentSuccess = (response: any) => {
        fetch('/api/paystack/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference: response.reference }),
        })
          .then(res => res.json())
          .then(verifyData => {
            if (!verifyData.verified) throw new Error('Payment not verified')

            // Create one order per vendor
            const vendorGroups = fixedItems.reduce((acc, item) => {
              if (!acc[item.vendor_id]) acc[item.vendor_id] = { vendor_name: item.vendor_name, items: [] as CartItem[] }
              acc[item.vendor_id].items.push(item)
              return acc
            }, {} as Record<string, { vendor_name: string; items: CartItem[] }>)

            const orderPromises = Object.entries(vendorGroups).map(([vendorId, group]) => {
              const orderAmount = group.items.reduce((sum, i) => sum + (i.price * i.quantity), 0)
              const productNames = group.items.map(i => `${i.product_name} x${i.quantity}`).join(', ')
              return fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  product_id: group.items[0].product_id,
                  product_name: productNames,
                  vendor_id: vendorId,
                  vendor_name: group.vendor_name,
                  amount: orderAmount,
                  delivery_address: deliveryAddress,
                  buyer_name: buyerName,
                  buyer_email: userEmail,
                  buyer_id: userId,
                  paystack_reference: response.reference,
                }),
              })
                .then(res => res.json())
                .then(data => {
                  if (!data.success) {
                    console.error('Order creation failed:', data.error, data.details)
                  }
                  return data
                })
            })

            return Promise.all(orderPromises)
          })
          .then(async (results) => {
            const allSucceeded = results && results.every((r: any) => r?.success)
            if (!allSucceeded) {
              console.warn('Some orders may have failed:', results)
            }
            // Clear cart regardless — payment was taken
            const supabase = createClient()
            await supabase.from('cart_items').delete().eq('buyer_id', userId)
            setItems([])
            router.push('/buyer/orders?success=true')
          })
          .catch(() => {
            setError('Payment received but order creation failed. Contact support with: ' + response.reference)
          })
          .finally(() => {
            setCheckingOut(false)
          })
      }

      const handler = (window as any).PaystackPop.setup({
        key: 'pk_test_d645f64a3f39a5e0e997616562ae17f6567be254',
        email: userEmail,
        amount: total * 100,
        currency: 'NGN',
        ref: `ZLX-CART-${Date.now()}`,
        metadata: {
          cart: true,
          item_count: fixedItems.length,
          buyer_name: buyerName,
          delivery_address: deliveryAddress,
        },
        callback: function(response: any) {
          handleCartPaymentSuccess(response)
        },
        onClose: function() {
          setCheckingOut(false)
        },
      })

      handler.openIframe()
    } catch (err) {
      setError('Failed to initialize payment. Please try again.')
      setCheckingOut(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-800 text-gray-900">My Cart</h1>
        <span className="text-sm text-gray-400">{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card py-16 text-center">
          <ShoppingBag size={32} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-display font-700 text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-400 text-sm mb-6">Browse verified listings and add items to your cart</p>
          <Link href="/listings" className="inline-flex items-center gap-2 bg-primary text-white font-700 px-5 py-3 rounded-xl hover:bg-primary-dark transition-all">
            Browse Listings <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-card p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface shrink-0">
                  {item.product_image ? (
                    <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag size={20} className="text-gray-300" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-700 text-gray-900 text-sm truncate">{item.product_name}</p>
                  <p className="text-gray-400 text-xs mb-2">{item.vendor_name}</p>
                  {item.pricing_type === 'quote' ? (
                    <span className="text-primary text-sm font-700">Price on request</span>
                  ) : (
                    <span className="text-gray-900 font-700 text-sm">{formatPrice(item.price)}</span>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {item.pricing_type === 'fixed' && (
                    <div className="flex items-center gap-1.5 bg-surface rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-primary transition-colors"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="text-sm font-700 text-gray-900 w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-primary transition-colors"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={removing === item.id}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    {removing === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h3 className="font-display font-700 text-gray-900 mb-4">Order Summary</h3>

              {fixedItems.length > 0 && (
                <div className="space-y-2.5 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-600 text-gray-700">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Protection fee</span>
                    <span className="font-600 text-primary">{formatPrice(protectionFee)}</span>
                  </div>
                  <div className="flex justify-between font-700 pt-2.5 border-t border-gray-100">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">{formatPrice(total)}</span>
                  </div>
                </div>
              )}

              {/* Delivery form */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-700 text-gray-600 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-700 text-gray-600 mb-1">Delivery Address *</label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Street, city, state"
                    rows={2}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

              <button
                onClick={handleCheckout}
                disabled={checkingOut || fixedItems.length === 0}
                className="w-full bg-primary text-white font-display font-700 py-3.5 rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {checkingOut ? (
                  <><Loader2 size={16} className="animate-spin" /> Processing...</>
                ) : (
                  <><CreditCard size={16} /> Pay {formatPrice(total)} Securely</>
                )}
              </button>

              {items.some(i => i.pricing_type === 'quote') && (
                <p className="text-xs text-amber-600 text-center mt-3">
                  Quote items are not included in payment. Contact us on WhatsApp for those.
                </p>
              )}
            </div>

            <Link
              href="/listings"
              className="block text-center text-sm text-primary font-700 hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}