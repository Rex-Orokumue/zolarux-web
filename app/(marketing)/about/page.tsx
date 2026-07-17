import type { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Search, Truck, Wrench, CreditCard, Play, ArrowRight, MessageCircle } from 'lucide-react'
import PageHero from '@/components/layout/PageHero'

const TITLE = 'About Zolarux | Trusted Gadget Seller in Nigeria'
const DESCRIPTION = 'Zolarux is a trusted gadget retail business run by Rex Orokumue. 5 years. 100+ customers. Phones, laptops, and accessories with a full money-back guarantee.'

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    'trusted gadget seller Nigeria',
    'buy phones Nigeria',
    'Zolarux',
    'Rex Orokumue',
    'buy laptops Nigeria',
    'gadget seller guarantee',
    'UK used phones Nigeria',
  ],
  alternates: { canonical: '/about' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/about' },
  twitter: { title: TITLE, description: DESCRIPTION },
}

const TEAM = [
  {
    name: 'Rex Orokumue',
    role: 'Founder',
    bio: 'Rex handles sourcing, sales, and every customer relationship personally. Five years, 100+ customers, zero losses.',
    initial: 'R',
  },
  {
    name: 'Karen',
    role: 'Operations',
    bio: 'Coordinates logistics, supplier communication, and order fulfilment tracking.',
    initial: 'K',
  },
  {
    name: 'Precious',
    role: 'Customer Relations',
    bio: 'First point of contact for buyers. Makes sure every order is clear and every question gets answered.',
    initial: 'P',
  },
]

const VALUES = [
  { icon: Search,     title: 'Verify before payment clears', desc: "Rex confirms the item exists and matches your order before your money goes anywhere it can't come back from." },
  { icon: Truck,      title: 'Stay involved until delivery',  desc: "Rex doesn't hand off and disappear. Every order is tracked until you confirm it arrived correctly." },
  { icon: Wrench,     title: 'Fix problems, not excuses',     desc: 'When something goes wrong — and occasionally things do — the response is always action, not explanation.' },
  { icon: CreditCard, title: 'Payment plans when you need them', desc: "Can't pay the full amount at once? Pay in parts, collect your gadget when it's fully settled. WhatsApp Rex to arrange." },
]

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <PageHero
        imageUrl="https://images.unsplash.com/photo-1655720357872-ce227e4164ba?w=1600&q=70&auto=format&fit=crop"
        eyebrow="Our Story"
        title="Built on One Simple Promise"
        subtitle="Five years ago Rex started selling gadgets because he saw the same thing happening over and over — people losing money to sellers who disappeared, phones that arrived broken, orders that never came. His answer was simple: be the person who never lets that happen. That's still the answer today."
      />

      {/* How Zolarux Works + Stats */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-3xl font-800 text-gray-900 mb-6">
                How Zolarux Works
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Zolarux is a gadget retail business. Rex sources phones, laptops, and
                  accessories from verified suppliers and sells them directly to customers
                  across Nigeria. Every order is coordinated personally — from confirming
                  the item exists and is in the condition described, to tracking delivery
                  until it&apos;s in your hands. There is no middleman you can&apos;t reach.
                  There is no vendor you have to trust blindly. You deal with Rex, and Rex
                  deals with everything else.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { number: '100+',  label: 'Happy Customers' },
                { number: '5 Years', label: 'In Operation' },
                { number: 'Zero',  label: 'Losses. Ever.' },
                { number: '₦0',    label: 'Lost to Scams' },
              ].map((stat) => (
                <div key={stat.label} className="bg-surface rounded-2xl p-6 text-center border border-gray-100">
                  <p className="font-display text-4xl font-800 text-primary mb-2">{stat.number}</p>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Guarantee */}
      <section className="py-20 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-start gap-5 bg-white rounded-2xl p-8 border border-gray-100 shadow-card">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-primary">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-800 text-gray-900 mb-3">
                The Guarantee
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed">
                Every order comes with one unconditional rule: you get exactly what you
                ordered, or Rex sorts it. Wrong model, wrong condition, wrong spec — full
                refund or replacement, no arguments. This guarantee has held for five years
                across 100+ transactions. It is not a policy. It is how every single order
                works.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How We Operate */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-800 text-gray-900 mb-4">How We Operate</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              These are not marketing slogans. They are the rules we follow internally on every single transaction.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-surface rounded-2xl p-6 border border-gray-100 shadow-card">
                <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center mb-4">
                  <Icon size={18} className="text-primary" />
                </div>
                <h3 className="font-display font-700 text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About video */}
      <section className="py-16 bg-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-800 text-gray-900 mb-2">Meet Zolarux</h2>
            <p className="text-gray-500 text-sm">A short video about who we are and why we built this.</p>
          </div>
          <div className="relative rounded-3xl overflow-hidden bg-gray-900 shadow-card-hover" style={{ paddingBottom: '56.25%' }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-primary">
                <Play size={24} className="text-white ml-1" fill="white" />
              </div>
              <p className="text-gray-400 text-sm">About us video — coming soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-800 text-gray-900 mb-4">The People Behind Every Order</h2>
            <p className="text-gray-500 text-lg">Small team. Personal accountability on every transaction.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {TEAM.map((member) => (
              <div key={member.name} className="bg-surface rounded-2xl p-6 border border-gray-100 text-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                  <span className="font-display font-800 text-white text-xl">{member.initial}</span>
                </div>
                <h3 className="font-display font-700 text-gray-900">{member.name}</h3>
                <p className="text-primary text-sm font-600 mb-3">{member.role}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-3xl font-800 text-white mb-4">
            Ready to Order?
          </h2>
          <p className="text-white/70 mb-8">
            WhatsApp Rex directly and tell him what you&apos;re looking for. He&apos;ll confirm
            availability, show you the item, and take it from there.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="https://wa.me/2348120288390" target="_blank"
              className="inline-flex items-center gap-2 bg-white text-primary font-display font-700 px-7 py-4 rounded-xl hover:bg-gray-50 transition-all">
              <MessageCircle size={18} /> WhatsApp Rex
            </Link>
            <Link href="/listings"
              className="inline-flex items-center gap-2 bg-accent text-white font-display font-700 px-7 py-4 rounded-xl hover:bg-accent-dark transition-all">
              Browse Gadgets <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
