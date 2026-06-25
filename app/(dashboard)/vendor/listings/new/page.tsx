'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Shield, Upload, X, Plus, Loader2, CheckCircle, Image as ImageIcon, ArrowLeft, Video as VideoIcon } from 'lucide-react'
import Link from 'next/link'
import { VENDOR_CATEGORIES } from '@/lib/constants'

type PricingType = 'fixed' | 'quote'

interface FormData {
  name: string
  description: string
  price: string
  pricing_type: PricingType
  category: string
  is_featured: boolean
}

const INITIAL_FORM: FormData = {
  name: '',
  description: '',
  price: '',
  pricing_type: 'fixed',
  category: '',
  is_featured: false,
}

const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
const selectClass = `${inputClass} bg-white`

export default function NewListingPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [videos, setVideos] = useState<File[]>([])
  const [videoPreviews, setVideoPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const update = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }))
    }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Max 5 images
    const combined = [...images, ...files].slice(0, 5)
    setImages(combined)

    // Generate previews
    combined.forEach((file, i) => {
      if (imagePreviews[i]) return // already has preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => {
          const updated = [...prev]
          updated[i] = e.target?.result as string
          return updated
        })
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const MAX_VIDEO_BYTES = 100 * 1024 * 1024 // 100MB

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const tooBig = files.find(f => f.size > MAX_VIDEO_BYTES)
    if (tooBig) { setError('Each video must be 50MB or smaller'); return }

    // Max 2 videos
    const combined = [...videos, ...files].slice(0, 2)
    setVideos(combined)
    setVideoPreviews(combined.map(f => URL.createObjectURL(f)))
  }

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index))
    setVideoPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const uploadVideos = async (vendorId: string): Promise<string[]> => {
    const supabase = createClient()
    const urls: string[] = []

    for (let i = 0; i < videos.length; i++) {
      const file = videos[i]
      const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4'
      const fileName = `${vendorId}/videos/${Date.now()}_${i}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('product-videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'video/mp4',
        })

      if (uploadError) {
        console.error(`Upload error for video ${i + 1}:`, uploadError)
        throw new Error(`Video ${i + 1} upload failed: ${uploadError.message}`)
      }

      const { data } = supabase.storage
        .from('product-videos')
        .getPublicUrl(fileName)

      urls.push(data.publicUrl)
    }

    return urls
  }

  const uploadImages = async (vendorId: string): Promise<string[]> => {
    const supabase = createClient()
    const urls: string[] = []

    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${vendorId}/${Date.now()}_${i}.${ext}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'image/jpeg',
        })

      if (uploadError) {
        console.error(`Upload error for image ${i + 1}:`, uploadError)
        throw new Error(`Image ${i + 1} upload failed: ${uploadError.message}`)
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      urls.push(data.publicUrl)
      setUploadProgress(Math.round(((i + 1) / images.length) * 100))
    }

    return urls
  }

  const handleSubmit = async () => {
    setError('')

    if (!form.name.trim()) { setError('Product name is required'); return }
    if (!form.category) { setError('Select a category'); return }
    if (form.pricing_type === 'fixed' && !form.price) { setError('Enter a price'); return }
    if (images.length === 0) { setError('Add at least one product image'); return }

    setSaving(true)
    setUploading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not logged in'); setSaving(false); return }

      // Get vendor record
      const { data: vendor } = await supabase
        .from('vendors')
        .select('vendor_id, business_name')
        .eq('auth_user_id', user.id)
        .single()

      if (!vendor) { setError('Vendor account not found'); setSaving(false); return }

      // Upload images to Supabase Storage
      const imageUrls = await uploadImages(user.id)

      if (imageUrls.length === 0) {
        throw new Error('Image upload failed. Please try again.')
      }

      // Upload videos (optional)
      const videoUrls = videos.length > 0 ? await uploadVideos(user.id) : []
      setUploading(false)

      // Insert product
      const { error: insertError } = await supabase
        .from('products')
        .insert({
          name: form.name.trim(),
          description: form.description.trim() || null,
          price: form.pricing_type === 'fixed' ? parseFloat(form.price) : 0,
          pricing_type: form.pricing_type,
          category: form.category,
          vendor_id: vendor.vendor_id,
          vendor_name: vendor.business_name,
          image_url: imageUrls[0],
          main_image_url: imageUrls[0],
          image_urls: imageUrls,
          video_urls: videoUrls,
          is_active: true,
          is_featured: form.is_featured,
          created_at: new Date().toISOString(),
        })

      if (insertError) {
        setError(`Failed to save listing: ${insertError.message}`)
        setSaving(false)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/vendor/listings'), 2000)

    } catch (e: any) {
      setError(e?.message || 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
      setUploading(false)
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={30} className="text-green-600" />
          </div>
          <h2 className="font-display text-xl font-800 text-gray-900 mb-2">Listing Created!</h2>
          <p className="text-gray-500 text-sm">Redirecting to your listings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      <div className="flex items-center gap-3">
        <Link href="/vendor/listings" className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <ArrowLeft size={15} className="text-gray-600" />
        </Link>
        <h1 className="font-display text-2xl font-800 text-gray-900">Add New Listing</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Product info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-4">
            <h3 className="font-display font-700 text-gray-900">Product Information</h3>

            <div>
              <label className="block text-sm font-700 text-gray-700 mb-1.5">Product Name *</label>
              <input type="text" value={form.name} onChange={update('name')}
                placeholder="e.g. iPhone 14 Pro Max 256GB Deep Purple" className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-700 text-gray-700 mb-1.5">Category *</label>
              <select value={form.category} onChange={update('category')} className={selectClass}>
                <option value="">Select a category</option>
                {VENDOR_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-700 text-gray-700 mb-1.5">Description</label>
              <textarea value={form.description} onChange={update('description')}
                placeholder="Describe the product condition, specs, what's included..."
                rows={4} className={`${inputClass} resize-none`} />
            </div>

            <div>
              <label className="block text-sm font-700 text-gray-700 mb-2">Pricing Type *</label>
              <div className="grid grid-cols-2 gap-3">
                {(['fixed', 'quote'] as PricingType[]).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, pricing_type: type }))}
                    className={`py-3 rounded-xl border text-sm font-700 transition-all ${
                      form.pricing_type === type
                        ? 'bg-primary border-primary text-white'
                        : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {type === 'fixed' ? 'Fixed Price' : 'Price on Request'}
                  </button>
                ))}
              </div>
            </div>

            {form.pricing_type === 'fixed' && (
              <div>
                <label className="block text-sm font-700 text-gray-700 mb-1.5">Price (₦) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-600">₦</span>
                  <input type="number" value={form.price} onChange={update('price')}
                    placeholder="0.00" className={`${inputClass} pl-8`} min="0" />
                </div>
              </div>
            )}
          </div>

          {/* Image upload */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <h3 className="font-display font-700 text-gray-900 mb-1">Product Images *</h3>
            <p className="text-gray-400 text-xs mb-4">Upload up to 5 images. First image is the main display image. Max 5MB each.</p>

            {/* Upload area */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= 5}
              className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-primary hover:bg-primary-light transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload size={24} className="text-gray-400 mx-auto mb-2" />
              <p className="font-700 text-gray-600 text-sm">Click to upload images</p>
              <p className="text-gray-400 text-xs mt-1">PNG, JPG, WEBP — max 5MB each</p>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              multiple
              className="hidden"
              onChange={handleImageSelect}
            />

            {/* Image previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                {imagePreviews.map((preview, i) => (
                  <div key={i} className="relative aspect-square">
                    <img
                      src={preview}
                      alt={`Preview ${i + 1}`}
                      className="w-full h-full object-cover rounded-xl border border-gray-100"
                    />
                    {i === 0 && (
                      <div className="absolute bottom-1 left-1 bg-primary text-white text-xs font-700 px-1.5 py-0.5 rounded-md">
                        Main
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center hover:border-primary hover:bg-primary-light transition-all"
                  >
                    <Plus size={20} className="text-gray-400" />
                  </button>
                )}
              </div>
            )}

          </div>

          {/* Video upload */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <h3 className="font-display font-700 text-gray-900 mb-1">Product Videos</h3>
            <p className="text-gray-400 text-xs mb-4">Optional. Upload up to 2 videos showcasing the product. MP4/MOV/WEBM/3GP/MKV — max 100MB each.</p>

            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              disabled={videos.length >= 2}
              className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-primary hover:bg-primary-light transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <VideoIcon size={24} className="text-gray-400 mx-auto mb-2" />
              <p className="font-700 text-gray-600 text-sm">Click to upload videos</p>
              <p className="text-gray-400 text-xs mt-1">MP4, MOV, WEBM, 3GP, MKV — max 100MB each</p>
            </button>

            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/*"
              multiple
              className="hidden"
              onChange={handleVideoSelect}
            />

            {videoPreviews.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {videoPreviews.map((preview, i) => (
                  <div key={i} className="relative">
                    <video
                      src={preview}
                      controls
                      className="w-full rounded-xl border border-gray-100 bg-black"
                    />
                    <button
                      type="button"
                      onClick={() => removeVideo(i)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload progress */}
            {uploading && (
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Uploading images...</span>
                  <span className="text-primary font-700">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Featured toggle */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-display font-700 text-gray-900 text-sm">Featured Listing</p>
                <p className="text-gray-400 text-xs mt-0.5">Appears at the top of search results</p>
              </div>
              <div
                onClick={() => setForm(prev => ({ ...prev, is_featured: !prev.is_featured }))}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  form.is_featured ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all ${
                  form.is_featured ? 'left-6' : 'left-0.5'
                }`} />
              </div>
            </label>
          </div>

          {/* Trust note */}
          <div className="bg-primary-light rounded-2xl p-4 flex items-start gap-2">
            <Shield size={14} className="text-primary shrink-0 mt-0.5" />
            <p className="text-primary text-xs leading-relaxed">
              Every listing is reviewed by Zolarux before going live. Ensure your
              images and description accurately represent the item.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full bg-primary text-white font-display font-700 py-4 rounded-2xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-primary"
          >
            {saving ? (
              <><Loader2 size={18} className="animate-spin" />
                {uploading ? `Uploading... ${uploadProgress}%` : 'Saving...'}</>
            ) : (
              <><ImageIcon size={18} /> Publish Listing</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}