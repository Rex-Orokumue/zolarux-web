'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Heart, CreditCard, Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types/product'

interface Props {
  product: Product
  protectionFee: number
  isLoggedIn: boolean
  userEmail: string
  userId: string
}

export default function ListingActions({ product, protectionFee, isLoggedIn, userEmail, userId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<'cart' | 'wishlist' | 'pay' | null>(null)
  const [cartAdded, setCartAdded] = useState(false)
  const [wishlistAdded, setWishlistAdded] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [buyerName, setBuyerName] = useState('')
  const [showCheckoutForm, setShowCheckoutForm] = useState(false)
  const [error, setError] = useState('')

  const totalAmount = product.price + protectionFee

  const handleAddToCart = async () => {
    if (!isLoggedIn) { router.push('/login'); return }
    setLoading('cart')
    try {
      const supabase = createClient()
      // Check if already in cart
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('buyer_id', userId)
        .eq('product_id', product.id)
        .single()

      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + 1 })
          .eq('id', existing.id)
      } else {
        const imageUrl = product.main_image_url || product.image_url || product.image_urls?.[0] || ''
        await supabase.from('cart_items').insert({
          buyer_id: userId,
          product_id: product.id,
          product_name: product.name,
          product_image: imageUrl,
          vendor_id: product.vendor_id,
          vendor_name: product.vendor_name,
          price: product.price,
          pricing_type: product.pricing_type,
          quantity: 1,
          added_at: new Date().toISOString(),
        })
      }
      setCartAdded(true)
      setTimeout(() => setCartAdded(false), 3000)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(null)
    }
  }

  const handleAddToWishlist = async () => {
    if (!isLoggedIn) { router.push('/login'); return }
    setLoading('wishlist')
    try {
      const supabase = createClient()
      const { data: existing } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('buyer_id', userId)
        .eq('product_id', product.id)
        .single()

      if (!existing) {
        const imageUrl = product.main_image_url || product.image_url || product.image_urls?.[0] || ''
        await supabase.from('wishlist_items').insert({
          buyer_id: userId,
          product_id: product.id,
          product_name: product.name,
          product_image: imageUrl,
          vendor_id: product.vendor_id,
          vendor_name: product.vendor_name,
          price: product.price,
          pricing_type: product.pricing_type,
          added_at: new Date().toISOString(),
        })
      }
      setWishlistAdded(true)
      setTimeout(() => setWishlistAdded(false), 3000)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(null)
    }
  }

  const handlePaymentSuccess = (response: any) => {
    // Called from Paystack callback — must not be async itself
    fetch('/api/paystack/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: response.reference }),
    })
      .then(async res => {
        const text = await res.text()
        try {
          return JSON.parse(text)
        } catch (e) {
          throw new Error('Invalid response from verification server')
        }
      })
      .then(verifyData => {
        if (verifyData.error) throw new Error(verifyData.error)
        if (!verifyData.verified) throw new Error('Payment not verified')
        
        return fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_id: product.id,
            product_name: product.name,
            vendor_id: product.vendor_id,
            vendor_name: product.vendor_name,
            amount: product.price,
            delivery_address: deliveryAddress,
            buyer_name: buyerName,
            paystack_reference: response.reference,
          }),
        })
          .then(async res => {
            const text = await res.text()
            try {
              return JSON.parse(text)
            } catch (e) {
              throw new Error('Invalid response from order creation server')
            }
          })
          .then(orderData => {
            if (!orderData.success) {
              throw new Error(orderData.error || 'Failed to create order')
            }
            router.push(`/buyer/orders?ref=${orderData.order.order_ref}&success=true`)
          })
      })
      .catch((err) => {
        console.error('Checkout error:', err)
        setError(`Payment received but order creation failed (${err.message}). Contact support with reference: ` + response.reference)
      })
      .finally(() => {
        setLoading(null)
      })
  }

  const handlePayNow = async () => {
    if (!isLoggedIn) { router.push('/login'); return }
    setError('')

    if (!showCheckoutForm) {
      setShowCheckoutForm(true)
      return
    }

    if (!deliveryAddress.trim()) {
      setError('Please enter your delivery address')
      return
    }
    if (!buyerName.trim()) {
      setError('Please enter your full name')
      return
    }

    setLoading('pay')

    try {
      // Load Paystack inline script
      const PaystackPop = (window as any).PaystackPop

      if (!PaystackPop) {
        // Load script dynamically
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://js.paystack.co/v1/inline.js'
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Failed to load Paystack'))
          document.head.appendChild(script)
        })
      }

      const handler = (window as any).PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_d645f64a3f39a5e0e997616562ae17f6567be254',
        email: userEmail,
        amount: totalAmount * 100, // Convert to kobo
        currency: 'NGN',
        ref: `ZLX-${Date.now()}`,
        metadata: {
          product_id: product.id,
          product_name: product.name,
          vendor_id: product.vendor_id,
          vendor_name: product.vendor_name,
          buyer_name: buyerName,
          delivery_address: deliveryAddress,
          protection_fee: protectionFee,
        },
        callback: function(response: any) {
          handlePaymentSuccess(response)
        },
        onClose: function() {
          setLoading(null)
        },
      })

      handler.openIframe()

    } catch (err) {
      console.error(err)
      setError('Failed to initialize payment. Please try again.')
      setLoading(null)
    }
  }

  if (product.pricing_type === 'quote') {
    return (
      <div className="space-y-3">
        <a
          href={`https://wa.me/2347063107314?text=${encodeURIComponent(`Hi, I want to get a price quote for "${product.name}" on Zolarux`)}`}
          target="_blank"
          className="flex items-center justify-center gap-2 w-full bg-primary text-white font-display font-700 py-4 rounded-2xl hover:bg-primary-dark transition-all shadow-primary"
        >
          Request Price Quote
        </a>
        <button
          onClick={handleAddToWishlist}
          disabled={loading === 'wishlist'}
          className="flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-600 font-600 py-3 rounded-xl hover:bg-gray-50 transition-all"
        >
          {wishlistAdded ? <><CheckCircle size={16} className="text-green-500" /> Saved to Wishlist</> :
            loading === 'wishlist' ? <Loader2 size={16} className="animate-spin" /> :
            <><Heart size={16} /> Save to Wishlist</>}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Checkout form */}
      {showCheckoutForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <h3 className="font-display font-700 text-gray-900 text-sm">Delivery Details</h3>
          <div>
            <label className="block text-xs font-700 text-gray-600 mb-1">Full Name *</label>
            <input
              type="text"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              placeholder="Your full name"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-700 text-gray-600 mb-1">Delivery Address *</label>
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Street address, city, state"
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
      )}

      {/* Buy Now button */}
      <button
        onClick={handlePayNow}
        disabled={loading === 'pay'}
        className="flex items-center justify-center gap-2 w-full bg-primary text-white font-display font-700 py-4 rounded-2xl hover:bg-primary-dark transition-all shadow-primary hover:shadow-primary-lg disabled:opacity-60"
      >
        {loading === 'pay' ? (
          <><Loader2 size={18} className="animate-spin" /> Processing...</>
        ) : showCheckoutForm ? (
          <><CreditCard size={18} /> Pay {formatPrice(totalAmount)} Securely</>
        ) : (
          <><CreditCard size={18} /> Buy Now — {formatPrice(totalAmount)}</>
        )}
      </button>

      {showCheckoutForm && (
        <button
          onClick={() => setShowCheckoutForm(false)}
          className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Cancel
        </button>
      )}

      {/* Cart + Wishlist */}
      {!showCheckoutForm && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleAddToCart}
            disabled={loading === 'cart'}
            className="flex items-center justify-center gap-2 border border-primary-100 bg-primary-light text-primary font-700 py-3 rounded-xl hover:bg-primary hover:text-white transition-all text-sm"
          >
            {cartAdded ? <><CheckCircle size={15} /> Added!</> :
              loading === 'cart' ? <Loader2 size={15} className="animate-spin" /> :
              <><ShoppingCart size={15} /> Add to Cart</>}
          </button>
          <button
            onClick={handleAddToWishlist}
            disabled={loading === 'wishlist'}
            className="flex items-center justify-center gap-2 border border-gray-200 text-gray-600 font-700 py-3 rounded-xl hover:bg-gray-50 transition-all text-sm"
          >
            {wishlistAdded ? <><CheckCircle size={15} className="text-green-500" /> Saved!</> :
              loading === 'wishlist' ? <Loader2 size={15} className="animate-spin" /> :
              <><Heart size={15} /> Wishlist</>}
          </button>
        </div>
      )}
    </div>
  )
}