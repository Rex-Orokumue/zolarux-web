'use client'

import { useEffect, useRef, useState } from 'react'
import { Share2, Link2, Check, MessageCircle } from 'lucide-react'

interface Props {
  title: string
  /** Path or absolute URL of the product page */
  url: string
}

export default function ShareButton({ title, url }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState(url)
  const ref = useRef<HTMLDivElement>(null)

  // Resolve to an absolute URL on the client (so share links work anywhere)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(url.startsWith('http') ? url : `${window.location.origin}${url}`)
    }
  }, [url])

  // Close the menu on outside click
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const shareText = `Check out "${title}" on Zolarux`

  const handleClick = async () => {
    // Use the native share sheet when available (mobile)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url: shareUrl })
        return
      } catch {
        // user cancelled or unsupported — fall back to menu
      }
    }
    setOpen(o => !o)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  const enc = encodeURIComponent
  const links = [
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${enc(`${shareText} ${shareUrl}`)}`,
      icon: <MessageCircle size={15} className="text-green-600" />,
    },
    {
      label: 'X (Twitter)',
      href: `https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(shareUrl)}`,
      icon: <span className="font-700 text-gray-900 text-sm leading-none">𝕏</span>,
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}`,
      icon: <span className="font-800 text-[#1877F2] text-sm leading-none">f</span>,
    },
  ]

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-2 border border-gray-200 text-gray-600 text-sm font-600 px-3.5 py-2 rounded-xl hover:bg-gray-50 transition-all"
        aria-label="Share this product"
      >
        <Share2 size={15} /> Share
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-100 shadow-card-hover p-1.5 z-50">
          {links.map(l => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm font-600 text-gray-700"
            >
              <span className="w-5 flex justify-center">{l.icon}</span>
              {l.label}
            </a>
          ))}
          <button
            type="button"
            onClick={copyLink}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm font-600 text-gray-700"
          >
            <span className="w-5 flex justify-center">
              {copied ? <Check size={15} className="text-green-500" /> : <Link2 size={15} className="text-gray-500" />}
            </span>
            {copied ? 'Link copied!' : 'Copy link'}
          </button>
        </div>
      )}
    </div>
  )
}
