'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Shield } from 'lucide-react'

export default function RefPage() {
  const router = useRouter()
  const params = useParams()
  const code   = params?.code as string | undefined

  useEffect(() => {
    if (code && /^ZLX[A-Z0-9]{5}$/.test(code)) {
      router.replace(`/register?ref=${code}`)
    } else {
      router.replace('/register')
    }
  }, [code, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface gap-4">
      <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
        <Shield size={22} className="text-white" />
      </div>
      <p className="text-gray-500 text-sm">Taking you to Zolarux…</p>
      <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )
}