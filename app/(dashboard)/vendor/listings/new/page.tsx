'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, X, Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { VENDOR_CATEGORIES } from '@/lib/constants'

const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
const selectClass = `${inputClass} bg-white`

export default function NewListingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')

  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    pricing_type: 'fixed',
    condition: 'new',
    brand: '',
  })

  const update = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }))
    }

  const addImageUrl = () => {
    if (!newImageUrl.trim()) return
    if (imageUrls.length >= 6) { setError('Maximum 6 images allowed'); return }
    setImageUrls(prev => [...prev, newImageUrl.trim()])
    setNewImageUrl('')
  }

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.name.trim()) { setError('Product name is required'); return }
    if (!form.category) { setError('Select a category'); return }
    if (!form.description.trim()) { setError('Description is required'); return }
    if (form.pricing_type === 'fixed' && (!form.price || Number(form.price) <= 0)) {
      setError('Enter a valid price'); return
    }

    setLoading(true)
    try {
      const supabase = createClient()

      // Get vendor record for the current authenticated user
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) { setError('Not signed in'); setLoading(false); return }

      const { data: vendor } = await supabase
        .from('vendors')
        .select('vendor_id, business_name')
        .eq('auth_user_id', user.id)
        .single()

      if (!vendor) { setError('Vendor profile not found'); setLoading(false); return }

      // Insert product directly — RLS allows vendors to insert their own products
      const { error: insertError } = await supabase
        .from('products')
        .insert({
          name: form.name.trim(),
          category: form.category.trim(),
          description: form.description.trim(),
          price: form.pricing_type === 'fixed' ? Number(form.price) : null,
          pricing_type: form.pricing_type,
          condition: form.condition,
          brand: form.brand?.trim() || null,
          image_urls: imageUrls,
          main_image_url: imageUrls[0] || null,
          vendor_id: vendor.vendor_id,
          vendor_name: vendor.business_name,
          is_active: true,
          is_verified: true,
        })

      if (insertError) {
        throw new Error(insertError.message)
      }

      router.push('/vendor/listings')
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      <div className="flex items-center gap-3">
        <Link
          href="/vendor/listings"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={16} className="text-gray-600" />
        </Link>
        <h1 className="font-display text-2xl font-800 text-gray-900">Add New Listing</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-5">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-700 text-gray-700 mb-1.5">
            Product Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={update('name')}
            placeholder="e.g. iPhone 15 Pro Max 256GB"
            className={inputClass}
          />
        </div>

        {/* Category + Condition */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-700 text-gray-700 mb-1.5">
              Category <span className="text-red-400">*</span>
            </label>
            <select value={form.category} onChange={update('category')} className={selectClass}>
              <option value="">Select a category</option>
              {VENDOR_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-700 text-gray-700 mb-1.5">Condition</label>
            <select value={form.condition} onChange={update('condition')} className={selectClass}>
              <option value="new">Brand New</option>
              <option value="used">Used / Pre-owned</option>
              <option value="refurbished">Refurbished</option>
            </select>
          </div>
        </div>

        {/* Brand */}
        <div>
          <label className="block text-sm font-700 text-gray-700 mb-1.5">Brand</label>
          <input
            type="text"
            value={form.brand}
            onChange={update('brand')}
            placeholder="e.g. Apple, Samsung, Sony"
            className={inputClass}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-700 text-gray-700 mb-1.5">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            value={form.description}
            onChange={update('description')}
            placeholder="Describe the product — specs, features, included accessories..."
            rows={4}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-700 text-gray-700 mb-1.5">Pricing Type</label>
            <select value={form.pricing_type} onChange={update('pricing_type')} className={selectClass}>
              <option value="fixed">Fixed Price</option>
              <option value="quote">Price on Request</option>
            </select>
          </div>
          {form.pricing_type === 'fixed' && (
            <div>
              <label className="block text-sm font-700 text-gray-700 mb-1.5">
                Price (₦) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={form.price}
                onChange={update('price')}
                placeholder="0"
                min="0"
                className={inputClass}
              />
            </div>
          )}
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-700 text-gray-700 mb-1.5">
            Product Images (paste URL)
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
              placeholder="https://example.com/image.jpg"
              className={`${inputClass} flex-1`}
            />
            <button
              onClick={addImageUrl}
              type="button"
              className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-700 hover:bg-primary-dark transition-all shrink-0"
            >
              <Plus size={15} />
            </button>
          </div>
          {imageUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden bg-surface aspect-square group">
                  <img src={url} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 bg-primary text-white text-[10px] font-700 px-2 py-0.5 rounded-full">
                      Main
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2">First image will be the main product image. Max 6 images.</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Link
            href="/vendor/listings"
            className="px-5 py-3 border border-gray-200 text-gray-600 font-700 rounded-xl hover:bg-gray-50 transition-all text-sm"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-primary text-white font-display font-700 py-3 rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Adding...</>
            ) : (
              <><CheckCircle size={16} /> Add Listing</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
