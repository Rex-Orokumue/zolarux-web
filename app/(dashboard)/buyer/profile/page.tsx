'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Mail, Phone, Shield, CheckCircle, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function BuyerProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUser(user)

    const { data } = await supabase
      .from('buyers')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data)
      setName(data.full_name || '')
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!name.trim()) { setError('Name cannot be empty'); return }
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase
      .from('buyers')
      .upsert({ id: user.id, full_name: name.trim(), email: user.email })
    if (err) {
      setError('Failed to save. Please try again.')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
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
      <h1 className="font-display text-2xl font-800 text-gray-900">My Profile</h1>

      {/* Avatar */}
      <div className="bg-primary rounded-2xl p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <span className="font-display font-800 text-white text-2xl">
            {name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'B'}
          </span>
        </div>
        <div>
          <p className="font-display font-800 text-white text-lg">{name || 'Buyer'}</p>
          <p className="text-white/60 text-sm">{user?.email}</p>
        </div>
      </div>

      {/* Edit name */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
        <h3 className="font-display font-700 text-gray-900 mb-4">Profile Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-700 text-gray-700 mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-700 text-gray-700 mb-1.5">Email Address</label>
            <div className="flex items-center gap-2 border border-gray-100 bg-surface rounded-xl px-4 py-3">
              <Mail size={15} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-600">{user?.email}</span>
              <CheckCircle size={13} className="text-green-500 ml-auto shrink-0" />
            </div>
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed here. Contact support.</p>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary text-white font-display font-700 py-3.5 rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : saved ? (
              <><CheckCircle size={16} /> Saved!</>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>

      {/* Account details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card divide-y divide-gray-50">
        {[
          { label: 'Account Type', value: 'Buyer', icon: User },
          { label: 'Email', value: user?.email || '—', icon: Mail },
          { label: 'Member Since', value: user?.created_at ? formatDate(user.created_at) : '—', icon: Shield },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center justify-between px-5 py-3.5 gap-4">
            <div className="flex items-center gap-3">
              <Icon size={15} className="text-gray-400" />
              <p className="text-sm text-gray-500">{label}</p>
            </div>
            <p className="text-sm font-600 text-gray-900 text-right">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}