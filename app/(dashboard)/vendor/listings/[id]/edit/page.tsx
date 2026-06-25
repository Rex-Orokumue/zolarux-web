'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Upload, X, Plus, Loader2, CheckCircle, Trash2, AlertTriangle, Video as VideoIcon } from 'lucide-react'
import Link from 'next/link'
import { VENDOR_CATEGORIES } from '@/lib/constants'
import { formatPrice } from '@/lib/utils'

type PricingType = 'fixed' | 'quote'

const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
const selectClass = `${inputClass} bg-white`

export default function EditListingPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const [vendorId, setVendorId] = useState('')
  const [userId, setUserId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [pricingType, setPricingType] = useState<PricingType>('fixed')
  const [category, setCategory] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [existingVideos, setExistingVideos] = useState<string[]>([])
  const [newVideos, setNewVideos] = useState<File[]>([])
  const [newVideoPreviews, setNewVideoPreviews] = useState<string[]>([])

  const MAX_VIDEO_BYTES = 100 * 1024 * 1024 // 100MB

  useEffect(() => {
    loadProduct()
  }, [productId])

  const loadProduct = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setUserId(user.id)

    const { data: vendor } = await supabase
      .from('vendors')
      .select('vendor_id')
      .eq('auth_user_id', user.id)
      .single()

    if (!vendor) { router.push('/vendor'); return }
    setVendorId(vendor.vendor_id)

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('vendor_id', vendor.vendor_id)
      .single()

    if (error || !product) { router.push('/vendor/listings'); return }

    setName(product.name || '')
    setDescription(product.description || '')
    setPrice(product.price?.toString() || '')
    setPricingType(product.pricing_type || 'fixed')
    setCategory(product.category || '')
    setIsFeatured(product.is_featured || false)
    setIsActive(product.is_active !== false)
    setExistingImages(product.image_urls || (product.image_url ? [product.image_url] : []))
    setExistingVideos(product.video_urls || [])
    setLoading(false)
  }

  const handleNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const totalImages = existingImages.length + newImages.length + files.length
    if (totalImages > 5) {
      setError('Maximum 5 images allowed total')
      return
    }
    const combined = [...newImages, ...files]
    setNewImages(combined)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => setNewPreviews(prev => [...prev, e.target?.result as string])
      reader.readAsDataURL(file)
    })
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
    setNewPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleNewVideos = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    const tooBig = files.find(f => f.size > MAX_VIDEO_BYTES)
    if (tooBig) { setError('Each video must be 100MB or smaller'); return }
    const total = existingVideos.length + newVideos.length + files.length
    if (total > 2) { setError('Maximum 2 videos allowed total'); return }
    setNewVideos(prev => [...prev, ...files])
    setNewVideoPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
  }

  const removeExistingVideo = (index: number) => {
    setExistingVideos(prev => prev.filter((_, i) => i !== index))
  }

  const removeNewVideo = (index: number) => {
    setNewVideos(prev => prev.filter((_, i) => i !== index))
    setNewVideoPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const uploadNewVideos = async (): Promise<string[]> => {
    if (newVideos.length === 0) return []
    const supabase = createClient()
    const urls: string[] = []
    for (let i = 0; i < newVideos.length; i++) {
      const file = newVideos[i]
      const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4'
      const fileName = `${userId}/videos/${Date.now()}_edit_${i}.${ext}`
      const { error } = await supabase.storage.from('product-videos').upload(fileName, file, {
        cacheControl: '3600', upsert: false, contentType: file.type || 'video/mp4',
      })
      if (error) {
        console.error(`Upload error for video ${i + 1}:`, error)
        throw new Error(`Failed to upload video ${i + 1}: ${error.message}`)
      }
      const { data } = supabase.storage.from('product-videos').getPublicUrl(fileName)
      urls.push(data.publicUrl)
    }
    return urls
  }

  const uploadNewImages = async (): Promise<string[]> => {
    if (newImages.length === 0) return []
    const supabase = createClient()
    const urls: string[] = []
    for (let i = 0; i < newImages.length; i++) {
      const file = newImages[i]
      const ext = file.name.split('.').pop() || 'jpg'
      const fileName = `${userId}/${Date.now()}_edit_${i}.${ext}`
      const { error } = await supabase.storage.from('product-images').upload(fileName, file, {
        cacheControl: '3600', upsert: false, contentType: file.type || 'image/jpeg',
      })
      if (error) {
        console.error(`Upload error for image ${i + 1}:`, error)
        throw new Error(`Failed to upload image ${i + 1}: ${error.message}`)
      }
      
      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
      urls.push(data.publicUrl)
      
      setUploadProgress(Math.round(((i + 1) / newImages.length) * 100))
    }
    return urls
  }

  const handleSave = async () => {
    setError('')
    if (!name.trim()) { setError('Product name is required'); return }
    if (!category) { setError('Select a category'); return }
    if (pricingType === 'fixed' && !price) { setError('Enter a price'); return }
    const totalImages = existingImages.length + newImages.length
    const totalVideos = existingVideos.length + newVideos.length
    if (totalImages === 0 && totalVideos === 0) { setError('Add at least one image or video'); return }

    setSaving(true)
    if (newImages.length > 0 || newVideos.length > 0) setUploading(true)

    try {
      const newUrls = await uploadNewImages()
      const newVideoUrls = await uploadNewVideos()
      setUploading(false)
      const allImages = [...existingImages, ...newUrls]
      const allVideos = [...existingVideos, ...newVideoUrls]

      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('products')
        .update({
          name: name.trim(),
          description: description.trim() || null,
          price: pricingType === 'fixed' ? parseFloat(price) : 0,
          pricing_type: pricingType,
          category,
          is_featured: isFeatured,
          is_active: isActive,
          image_url: allImages[0] || null,
          main_image_url: allImages[0] || null,
          image_urls: allImages,
          video_urls: allVideos,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId)

      if (updateError) { setError(updateError.message); setSaving(false); return }
      setSuccess(true)
      setTimeout(() => router.push('/vendor/listings'), 1500)
    } catch (e: any) {
      setError(e?.message || 'Something went wrong')
    } finally {
      setSaving(false)
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('products').update({ is_active: false }).eq('id', productId)
    router.push('/vendor/listings')
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={24} className="animate-spin text-primary" />
    </div>
  )

  if (success) return (
    <div className="flex items-center justify-center py-20 text-center">
      <div>
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={30} className="text-green-600" />
        </div>
        <h2 className="font-display text-xl font-800 text-gray-900 mb-2">Listing Updated!</h2>
        <p className="text-gray-500 text-sm">Redirecting...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/vendor/listings" className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <ArrowLeft size={15} className="text-gray-600" />
          </Link>
          <h1 className="font-display text-2xl font-800 text-gray-900">Edit Listing</h1>
        </div>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-2 text-red-500 text-sm font-700 hover:bg-red-50 px-3 py-2 rounded-xl transition-all"
        >
          <Trash2 size={14} /> Deactivate
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <p className="font-700 text-red-800 mb-2">Deactivate this listing?</p>
          <p className="text-red-600 text-sm mb-4">The listing will be hidden from buyers but not permanently deleted.</p>
          <div className="flex gap-3">
            <button onClick={handleDelete} disabled={deleting}
              className="flex items-center gap-2 bg-red-600 text-white font-700 px-4 py-2.5 rounded-xl hover:bg-red-700 transition-all text-sm disabled:opacity-60">
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Yes, Deactivate
            </button>
            <button onClick={() => setShowDeleteConfirm(false)}
              className="border border-gray-200 text-gray-600 font-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Product info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 space-y-4">
            <h3 className="font-display font-700 text-gray-900">Product Information</h3>
            <div>
              <label className="block text-sm font-700 text-gray-700 mb-1.5">Product Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Product name" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-700 text-gray-700 mb-1.5">Category *</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className={selectClass}>
                <option value="">Select a category</option>
                {VENDOR_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-700 text-gray-700 mb-1.5">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                rows={4} className={`${inputClass} resize-none`} />
            </div>
            <div>
              <label className="block text-sm font-700 text-gray-700 mb-2">Pricing Type</label>
              <div className="grid grid-cols-2 gap-3">
                {(['fixed', 'quote'] as PricingType[]).map(type => (
                  <button key={type} type="button" onClick={() => setPricingType(type)}
                    className={`py-3 rounded-xl border text-sm font-700 transition-all ${
                      pricingType === type ? 'bg-primary border-primary text-white' : 'border-gray-200 text-gray-600 hover:border-primary'
                    }`}>
                    {type === 'fixed' ? 'Fixed Price' : 'Price on Request'}
                  </button>
                ))}
              </div>
            </div>
            {pricingType === 'fixed' && (
              <div>
                <label className="block text-sm font-700 text-gray-700 mb-1.5">Price (₦) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-600">₦</span>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    className={`${inputClass} pl-8`} min="0" />
                </div>
              </div>
            )}
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <h3 className="font-display font-700 text-gray-900 mb-1">Product Images</h3>
            <p className="text-gray-400 text-xs mb-4">Up to 5 images total. First image is the main display image.</p>

            {/* Existing images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-700 text-gray-500 uppercase tracking-wider mb-2">Current Images</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {existingImages.map((url, i) => (
                    <div key={i} className="relative aspect-square">
                      <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover rounded-xl border border-gray-100" />
                      {i === 0 && <div className="absolute bottom-1 left-1 bg-primary text-white text-xs font-700 px-1.5 py-0.5 rounded-md">Main</div>}
                      <button onClick={() => removeExistingImage(i)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New images */}
            {newPreviews.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-700 text-gray-500 uppercase tracking-wider mb-2">New Images (not yet saved)</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {newPreviews.map((preview, i) => (
                    <div key={i} className="relative aspect-square">
                      <img src={preview} alt={`New ${i + 1}`} className="w-full h-full object-cover rounded-xl border border-blue-200 ring-2 ring-blue-200" />
                      <button onClick={() => removeNewImage(i)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload more */}
            {(existingImages.length + newImages.length) < 5 && (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary hover:bg-primary-light transition-all">
                <Upload size={20} className="text-gray-400 mx-auto mb-1" />
                <p className="text-sm font-700 text-gray-600">Add more images</p>
                <p className="text-gray-400 text-xs mt-0.5">{5 - existingImages.length - newImages.length} slots remaining</p>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleNewImages} />

            {uploading && (
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Uploading...</span>
                  <span className="text-primary font-700">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Videos */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <h3 className="font-display font-700 text-gray-900 mb-1">Product Videos</h3>
            <p className="text-gray-400 text-xs mb-4">Optional. Up to 2 videos. MP4/MOV/WEBM/3GP/MKV — max 100MB each.</p>

            {existingVideos.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-700 text-gray-500 uppercase tracking-wider mb-2">Current Videos</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {existingVideos.map((url, i) => (
                    <div key={i} className="relative">
                      <video src={url} controls className="w-full rounded-xl border border-gray-100 bg-black" />
                      <button onClick={() => removeExistingVideo(i)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {newVideoPreviews.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-700 text-gray-500 uppercase tracking-wider mb-2">New Videos (not yet saved)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {newVideoPreviews.map((preview, i) => (
                    <div key={i} className="relative">
                      <video src={preview} controls className="w-full rounded-xl border border-blue-200 ring-2 ring-blue-200 bg-black" />
                      <button onClick={() => removeNewVideo(i)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(existingVideos.length + newVideos.length) < 2 && (
              <button type="button" onClick={() => videoInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary hover:bg-primary-light transition-all">
                <VideoIcon size={20} className="text-gray-400 mx-auto mb-1" />
                <p className="text-sm font-700 text-gray-600">Add a video</p>
                <p className="text-gray-400 text-xs mt-0.5">{2 - existingVideos.length - newVideos.length} slot(s) remaining</p>
              </button>
            )}
            <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime,video/*" multiple className="hidden" onChange={handleNewVideos} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 space-y-4">
            <h3 className="font-display font-700 text-gray-900 text-sm">Listing Settings</h3>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-700 text-gray-800 text-sm">Active</p>
                <p className="text-gray-400 text-xs">Visible to buyers</p>
              </div>
              <div onClick={() => setIsActive(!isActive)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${isActive ? 'bg-primary' : 'bg-gray-200'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all ${isActive ? 'left-6' : 'left-0.5'}`} />
              </div>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-700 text-gray-800 text-sm">Featured</p>
                <p className="text-gray-400 text-xs">Appears at the top</p>
              </div>
              <div onClick={() => setIsFeatured(!isFeatured)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${isFeatured ? 'bg-accent' : 'bg-gray-200'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all ${isFeatured ? 'left-6' : 'left-0.5'}`} />
              </div>
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button onClick={handleSave} disabled={saving}
            className="w-full bg-primary text-white font-display font-700 py-4 rounded-2xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-primary">
            {saving
              ? <><Loader2 size={18} className="animate-spin" /> {uploading ? `Uploading ${uploadProgress}%` : 'Saving...'}</>
              : <><CheckCircle size={18} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  )
}