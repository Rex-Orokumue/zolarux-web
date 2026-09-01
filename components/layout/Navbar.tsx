'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, ChevronDown, MessageCircle, Smartphone, ScanSearch, Flag, Link2 } from 'lucide-react'
import { cn, buildWhatsAppUrl } from '@/lib/utils'
import { NAV_LINKS, SHOP_MENU, SAFETY_TOOLS } from '@/lib/constants'

const TOOL_ICON = { smartphone: Smartphone, 'scan-search': ScanSearch, flag: Flag, link: Link2 } as const
import {
  Button,
  IconButton,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  ThemeToggle,
} from '@/components/ui'

const emptySubscribe = () => () => {}
function useMounted() {
  return React.useSyncExternalStore(emptySubscribe, () => true, () => false)
}

const WA_HREF = buildWhatsAppUrl("Hi Zolarux, I'd like to order a gadget.")

export default function Navbar() {
  const pathname = usePathname()
  const mounted = useMounted()

  // Close the mobile sheet on route change — render-time adjustment, no effect setState.
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [prevPath, setPrevPath] = React.useState(pathname)
  if (pathname !== prevPath) {
    setPrevPath(pathname)
    if (sheetOpen) setSheetOpen(false)
  }

  const isHome = pathname === '/'

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 h-16 border-b transition-micro',
        mounted && isHome
          ? 'border-transparent bg-background/70 backdrop-blur-md'
          : 'border-line bg-surface-raised/90 backdrop-blur-md'
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-display text-sm font-extrabold text-on-primary">
            Z
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-ink">Zolarux</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-1 rounded-md px-3.5 py-2 font-body text-sm font-medium text-ink-soft transition-micro hover:bg-primary-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                Shop <ChevronDown size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-56">
              {SHOP_MENU.map((item) => (
                <DropdownMenuItem key={item.href}>
                  <Link href={item.href} className="w-full">
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3.5 py-2 font-body text-sm font-medium text-ink-soft transition-micro hover:bg-primary-soft hover:text-ink"
            >
              {link.label}
            </Link>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-1 rounded-md px-3.5 py-2 font-body text-sm font-medium text-ink-soft transition-micro hover:bg-primary-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                Safety tools <ChevronDown size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-72">
              {SAFETY_TOOLS.map((tool) => {
                const Icon = TOOL_ICON[tool.icon]
                return (
                  <DropdownMenuItem key={tool.href}>
                    <Link href={tool.href} className="flex w-full items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                        <Icon size={14} />
                      </span>
                      <span>
                        <span className="block font-medium text-ink">{tool.label}</span>
                        <span className="block font-body text-xs text-ink-soft">{tool.desc}</span>
                      </span>
                    </Link>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-md px-3 py-2 font-body text-sm font-medium text-ink-soft transition-micro hover:bg-primary-soft hover:text-ink"
          >
            Sign in
          </Link>
          <Button asChild size="sm">
            <a href={WA_HREF} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={15} />
              Order on WhatsApp
            </a>
          </Button>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <IconButton label="Open menu" variant="ghost">
                <Menu size={20} />
              </IconButton>
            </SheetTrigger>
            <SheetContent side="right" title="Menu">
              <nav className="flex flex-col gap-1">
                <p className="px-1 pt-2 font-body text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  Shop
                </p>
                {SHOP_MENU.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link href={item.href} className="rounded-md px-1 py-2.5 font-body text-sm text-ink">
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
                <p className="px-1 pt-4 font-body text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  More
                </p>
                {NAV_LINKS.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link href={link.href} className="rounded-md px-1 py-2.5 font-body text-sm text-ink">
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
                <p className="px-1 pt-4 font-body text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  Safety tools
                </p>
                {SAFETY_TOOLS.map((tool) => (
                  <SheetClose asChild key={tool.href}>
                    <Link href={tool.href} className="rounded-md px-1 py-2.5 font-body text-sm text-ink">
                      {tool.label}
                    </Link>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Link href="/login" className="rounded-md px-1 py-2.5 font-body text-sm text-ink">
                    Sign in
                  </Link>
                </SheetClose>
                <Button asChild className="mt-4">
                  <a href={WA_HREF} target="_blank" rel="noopener noreferrer">
                    <MessageCircle size={16} />
                    Order on WhatsApp
                  </a>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
