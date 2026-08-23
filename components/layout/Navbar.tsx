'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown, Shield, Smartphone, Scan, Flag, Link2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_LINKS } from '@/lib/constants'

const SAFETY_TOOLS = [
  { label: 'Check Vendor',    href: '/check-vendor',   icon: Shield,     desc: 'Verify a vendor identity' },
  { label: 'Check Device',    href: '/check-device',   icon: Smartphone, desc: 'Check if a device is stolen' },
  { label: 'Verify Original', href: '/check-original', icon: Scan,       desc: 'Spot clones and fakes' },
  { label: 'Report Stolen',   href: '/report-item',    icon: Flag,       desc: 'Flag a stolen gadget' },
  { label: 'Scan a Link',     href: '/scan-link',      icon: Link2,      desc: 'Check if a link is safe' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [safetyOpen, setSafetyOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-white border-b border-gray-100'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-primary transition-shadow">
              <span className="text-white font-display font-800 text-sm">Z</span>
            </div>
            <span className="font-display font-700 text-gray-900 text-lg tracking-tight">
              Zolarux
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3.5 py-2 rounded-lg text-sm font-medium transition-all',
                  isActive(link.href)
                    ? 'text-primary bg-primary-light'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Safety Tools Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setSafetyOpen(true)}
              onMouseLeave={() => setSafetyOpen(false)}
            >
              <button
                className={cn(
                  'flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-all',
                  safetyOpen ? 'text-primary bg-primary-light' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                Safety Tools
                <ChevronDown
                  size={14}
                  className={cn('transition-transform duration-200', safetyOpen && 'rotate-180')}
                />
              </button>

              {safetyOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[480px]">
                  <div className="bg-white rounded-2xl shadow-card-hover border border-gray-100 p-3 grid grid-cols-2 gap-1">
                    {SAFETY_TOOLS.map((tool) => {
                      const Icon = tool.icon
                      return (
                        <Link
                          key={tool.href}
                          href={tool.href}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-primary-light group transition-all"
                        >
                          <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                            <Icon size={15} className="text-primary group-hover:text-white transition-colors" />
                          </div>
                          <div>
                            <p className="text-sm font-600 text-gray-900 group-hover:text-primary transition-colors">
                              {tool.label}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{tool.desc}</p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/downloads"
              className="animate-nav-pulse inline-flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-full font-display font-700 text-sm hover:bg-accent-dark transition-all hover:scale-105 shadow-sm"
            >
              Get the App
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all',
                  isActive(link.href)
                    ? 'text-primary bg-primary-light'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-2 border-t border-gray-100">
              <p className="px-3 py-2 text-xs font-700 text-gray-400 uppercase tracking-wider">
                Safety Tools
              </p>
              {SAFETY_TOOLS.map((tool) => {
                const Icon = tool.icon
                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-primary-light hover:text-primary transition-all"
                  >
                    <Icon size={15} />
                    {tool.label}
                  </Link>
                )
              })}
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-2">
              <Link
                href="/login"
                className="block w-full text-center px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/downloads"
                className="block w-full text-center px-4 py-3 rounded-xl bg-accent text-white font-display font-700 text-sm hover:bg-accent-dark transition-all"
              >
                Get the App
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
