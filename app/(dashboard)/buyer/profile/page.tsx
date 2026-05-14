import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { User, Mail, Phone, Calendar, MessageCircle, Shield } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function BuyerProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get buyer profile
  const { data: profile } = await supabase
    .from('buyers')
    .select('*')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name || 'Buyer'
  const email = user.email || profile?.email || '—'
  const phone = user.phone || '—'
  const joinDate = user.created_at ? formatDate(user.created_at) : '—'

  return (
    <div className="space-y-5 pb-20 md:pb-6">
      <h1 className="font-display text-2xl font-800 text-gray-900">My Profile</h1>

      {/* Profile card */}
      <div className="bg-primary rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center">
            <span className="font-display font-800 text-2xl">
              {displayName[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="font-display font-700 text-lg">{displayName}</h2>
            <p className="text-white/60 text-sm">{email}</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card divide-y divide-gray-50">
        {[
          { label: 'Full Name', value: displayName, icon: User },
          { label: 'Email', value: email, icon: Mail },
          { label: 'Phone', value: phone, icon: Phone },
          { label: 'Member Since', value: joinDate, icon: Calendar },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-3 px-5 py-4">
            <div className="w-8 h-8 bg-surface rounded-lg flex items-center justify-center shrink-0">
              <Icon size={14} className="text-gray-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-sm font-600 text-gray-900 truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Contact support */}
      <div className="bg-surface rounded-2xl border border-gray-100 p-5 text-center">
        <Shield size={20} className="text-primary mx-auto mb-2" />
        <p className="font-700 text-gray-900 text-sm mb-1">Need to update your profile?</p>
        <p className="text-gray-400 text-xs mb-4">
          Contact Zolarux support to update your account information.
        </p>
        <Link
          href={`https://wa.me/2347063107314?text=Hi, I need to update my buyer profile. My email is: ${email}`}
          target="_blank"
          className="inline-flex items-center gap-2 bg-primary text-white text-sm font-700 px-4 py-2.5 rounded-xl hover:bg-primary-dark transition-all"
        >
          <MessageCircle size={14} /> Contact Support
        </Link>
      </div>
    </div>
  )
}
