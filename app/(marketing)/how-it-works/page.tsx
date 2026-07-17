import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Search, Lock, ClipboardCheck, Truck, ThumbsUp,
  AlertTriangle, ArrowRight, MessageCircle,
  CheckCircle, Scale, Wrench, Play
} from 'lucide-react'
import PageHero from '@/components/layout/PageHero'
import Image from 'next/image'

const TITLE = 'How It Works | Zolarux'
const DESCRIPTION = 'See exactly how buying from Zolarux works — from WhatsApp inquiry to delivery. Every order is guaranteed or your money back.'

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    'how to buy gadgets Nigeria',
    'safe gadget purchase Nigeria',
    'buy phone online Nigeria',
    'Zolarux how it works',
  ],
  alternates: { canonical: '/how-it-works' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: '/how-it-works' },
  twitter: { title: TITLE, description: DESCRIPTION },
}

const STEPS = [
  {
    number: '01',
    icon: Search,
    title: 'Tell Rex What You Need',
    color: 'bg-blue-500',
    details: [
      "WhatsApp Rex on 08120288390 with the gadget you're looking for",
      'Specify the model, storage, colour, and condition you want',
      'Rex confirms availability immediately',
      'No payment at this stage — confirm first, pay after',
    ],
    whyItMatters: 'You only pay for something that has been confirmed to exist in the right condition. No surprises.',
  },
  {
    number: '02',
    icon: ClipboardCheck,
    title: 'Rex Verifies the Item',
    color: 'bg-primary',
    details: [
      'Rex contacts the supplier and requests video or photos of the specific item',
      'Condition, specs, and accessories are confirmed against your order',
      'Rex checks what you need to know — battery health, screen condition, IMEI',
      'You see evidence of the item before you pay',
    ],
    whyItMatters: "You are not paying based on a listing description. You're paying based on confirmed evidence of the exact item.",
  },
  {
    number: '03',
    icon: Lock,
    title: 'Make Payment',
    color: 'bg-amber-500',
    details: [
      'Pay the confirmed amount via bank transfer',
      'Need a payment plan? Pay in instalments — item is reserved and released when fully settled',
      'Rex confirms receipt before anything moves',
      'Full payment records kept for every transaction',
    ],
    whyItMatters: 'Your money goes to Rex directly — a real person with a five-year track record, not an anonymous vendor.',
  },
  {
    number: '04',
    icon: Truck,
    title: 'Rex Coordinates Delivery',
    color: 'bg-green-500',
    details: [
      'Rex arranges dispatch with the supplier once payment is confirmed',
      'You receive tracking information or delivery timeline',
      'Rex monitors the delivery and stays involved until it reaches you',
      "If anything is delayed, Rex follows up — you don't have to chase",
    ],
    whyItMatters: "Non-delivery is the most common gadget scam in Nigeria. Rex stays on top of every delivery so you don't have to.",
  },
  {
    number: '05',
    icon: ThumbsUp,
    title: "You Confirm, Everyone's Happy",
    color: 'bg-purple-500',
    details: [
      'Item arrives — inspect it immediately',
      "If it's exactly what you ordered, that's the end of the process",
      'If anything is wrong — wrong model, wrong condition, missing accessories — tell Rex immediately',
      'Rex will arrange a replacement or a full refund. No arguments.',
    ],
    whyItMatters: 'The guarantee is real. It has held for five years. It holds on your order too.',
  },
]

const PRINCIPLES = [
  { icon: MessageCircle, title: 'You always know where things stand', text: 'Rex keeps you updated at every stage. No ghosting, no vague responses.' },
  { icon: Scale,          title: 'Evidence before everything',         text: 'Rex verifies the item before you pay. What you pay for is what you get.' },
  { icon: Wrench,         title: 'Problems get fixed, not explained',  text: 'If something goes wrong, the response is action. Not a policy document.' },
  { icon: CheckCircle,    title: 'Five years of doing this',           text: '100+ orders. Zero losses. The track record speaks for itself.' },
]

export default function HowItWorksPage() {
  return (
    <div>
      {/* Hero */}
      <PageHero
        imageUrl="https://images.unsplash.com/photo-1573167101669-476636b96cea?w=1600&q=70&auto=format&fit=crop"
        eyebrow="The Process"
        title="Simple from Start to Finish"
        subtitle="Every order follows the same process. Every order comes with the same guarantee. Here's exactly what happens."
      />

      {/* Image band */}
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-display text-3xl font-800 text-gray-900 mb-4">
                Simple. Direct. Guaranteed.
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed">
                You tell Rex what you want. He confirms it&apos;s available and sends you
                proof. You pay, and he handles everything until it&apos;s in your hands.
              </p>
            </div>
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-card order-first lg:order-last">
              <Image
                src="https://images.unsplash.com/photo-1573164713712-03790a178651?w=1000&q=70&auto=format&fit=crop"
                alt="A buyer shopping for gadgets online with confidence"
                fill
                sizes="(max-width:1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Detailed steps */}
      <section className="py-20 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-800 text-gray-900 mb-4">
              The Five-Step Order Flow
            </h2>
            <p className="text-gray-500 text-lg">
              Every step exists for a specific reason. None are skipped.
            </p>
          </div>

          <div className="space-y-6">
            {STEPS.map(({ number, icon: Icon, title, color, details, whyItMatters }) => (
              <div key={number} className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
                {/* Step header */}
                <div className={`${color} px-6 py-5 flex items-center gap-4`}>
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Icon size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-xs font-700 tracking-wider">STEP {number}</p>
                    <h3 className="font-display font-700 text-white text-lg">{title}</h3>
                  </div>
                </div>

                {/* Step body */}
                <div className="p-6">
                  <ul className="space-y-2.5 mb-5">
                    {details.map((d, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                        <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" />
                        {d}
                      </li>
                    ))}
                  </ul>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <p className="text-xs font-700 text-amber-700 uppercase tracking-wider mb-1">
                      Why This Step Matters
                    </p>
                    <p className="text-amber-800 text-sm leading-relaxed">{whyItMatters}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What happens if something is wrong */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h2 className="font-display text-3xl font-800 text-gray-900 mb-4">
              What Happens If Something Is Wrong
            </h2>
          </div>
          <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto text-center">
            It&apos;s simple. You contact Rex, describe the problem, and provide evidence — a
            photo or video of what arrived. Rex investigates with the supplier and resolves
            it. Either the correct item is sent or you receive a full refund. There is no
            complicated claims process. There is no waiting weeks for a decision. Rex
            handles it directly.
          </p>
        </div>
      </section>

      {/* Video */}
      <section className="py-16 bg-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-800 text-gray-900 mb-2">Watch How Zolarux Works</h2>
            <p className="text-gray-500 text-sm">A complete walkthrough of the order process from inquiry to delivery.</p>
          </div>
          <div className="relative rounded-3xl overflow-hidden bg-gray-900 shadow-card-hover" style={{ paddingBottom: '56.25%' }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-primary">
                <Play size={24} className="text-white ml-1" fill="white" />
              </div>
              <p className="text-gray-400 text-sm">How it works video — coming soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Operating principles */}
      <section className="py-16 bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-2xl font-800 text-white text-center mb-8">
            Our Operating Principles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PRINCIPLES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                <Icon size={16} className="text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-600 text-sm mb-1">{title}</p>
                  <p className="text-gray-400 text-sm">{text}</p>
                </div>
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
            WhatsApp Rex and tell him what you&apos;re looking for.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="https://wa.me/2348120288390"
              target="_blank"
              className="inline-flex items-center gap-2 bg-white text-primary font-display font-700 px-7 py-4 rounded-xl hover:bg-gray-50 transition-all"
            >
              <MessageCircle size={18} /> WhatsApp Rex
            </Link>
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 bg-accent text-white font-display font-700 px-7 py-4 rounded-xl hover:bg-accent-dark transition-all"
            >
              Browse Gadgets <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
