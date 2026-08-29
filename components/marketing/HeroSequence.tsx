'use client'

import Link from 'next/link'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui'

interface HeroProduct {
  id: string
  name: string
  imageUrl: string | null
  price: string | null
}

export function HeroSequence({ product }: { product: HeroProduct | null }) {
  return (
    <section className="relative overflow-hidden bg-primary text-on-primary">
      <div className="pointer-events-none absolute inset-0 opacity-[0.14]">
        <div className="absolute -right-24 -top-24 h-[36rem] w-[36rem] rounded-pill bg-on-primary/30 blur-2xl" />
        <div className="absolute -bottom-32 -left-16 h-[24rem] w-[24rem] rounded-pill bg-action/40 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-32">
        <div>
          <p className="hero-rise mb-6 inline-flex items-center gap-2 rounded-pill border border-on-primary/20 bg-on-primary/10 px-3 py-1.5 font-body text-xs font-medium">
            <ShieldCheck size={13} />
            Guaranteed or refunded — every order
          </p>
          <h1
            className="hero-rise font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl xl:text-6xl"
            style={{ animationDelay: '80ms' }}
          >
            Buy the gadget.
            <br />
            Skip the gamble.
          </h1>
          <p
            className="hero-rise mt-5 max-w-lg font-body text-lg leading-relaxed text-on-primary/80"
            style={{ animationDelay: '160ms' }}
          >
            We source and inspect every phone, laptop and accessory before it ships. You check it on
            delivery. If it&apos;s not exactly as described, you get a full refund.
          </p>
          <div className="hero-rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: '240ms' }}>
            <Button asChild size="lg" variant="secondary">
              <Link href="/listings">
                Shop gadgets <ArrowRight size={18} />
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="text-on-primary hover:bg-on-primary/10">
              <Link href="/#the-guarantee">How the guarantee works</Link>
            </Button>
          </div>
        </div>

        {product && (
          <Link
            href={`/listings/${product.id}`}
            className="hero-rise group block overflow-hidden rounded-lg border border-on-primary/15 bg-on-primary/5 backdrop-blur-sm"
            style={{ animationDelay: '200ms' }}
          >
            <div className="aspect-[4/3] overflow-hidden bg-on-primary/10">
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </div>
            <div className="flex items-center justify-between gap-3 p-4">
              <span className="line-clamp-1 font-display text-sm font-bold">{product.name}</span>
              {product.price && (
                <span className="shrink-0 font-display text-sm font-extrabold [font-variant-numeric:tabular-nums]">
                  {product.price}
                </span>
              )}
            </div>
          </Link>
        )}
      </div>
    </section>
  )
}
