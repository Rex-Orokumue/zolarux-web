import type { Metadata } from 'next'
import { Shield, Target, Eye, Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us',
  description: "Learn about Zolarux — Nigeria's trust infrastructure for gadget commerce.",
}

const TEAM = [
  {
    name: 'Rex Orokumue',
    role: 'Founder & CEO',
    bio: 'Software developer, educator, and entrepreneur. Rex built Zolarux from personal frustration with Nigerian social commerce scams into a structured trust platform that has protected over ₦2M in transactions.',
    initial: 'R',
  },
  {
    name: 'Karen',
    role: 'Operations',
    bio: 'Handles vendor verification, dispute resolution, and the day-to-day operational discipline that makes Zolarux reliable.',
    initial: 'K',
  },
  {
    name: 'Precious',
    role: 'Customer Relations',
    bio: 'First point of contact for buyers and vendors. Ensures every transaction is coordinated with clarity and care.',
    initial: 'P',
  },
]

const VALUES = [
  { icon: Shield, title: 'Trust Over Speed', desc: "We never rush a transaction. Verification takes time. That time protects you." },
  { icon: Target, title: 'Process Over Emotion', desc: "Every decision is evidence-based. We don't release funds on promises — only on confirmation." },
  { icon: Eye, title: 'Transparency Always', desc: "You know where your money is at every step. No hidden fees. No surprises." },
  { icon: Heart, title: 'Buyer Money is Sacred', desc: "This is our core internal principle. The moment your payment enters escrow, it is untouchable until you approve." },
]

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <span className="inline-block bg-white/15 text-white text-xs font-700 uppercase tracking-wider px-3 py-1.5 rounded-full mb-6">
              Our Story
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-800 text-white mb-6">
              We Exist Because Trust is Broken in Nigerian Commerce
            </h1>
            <p className="text-white/75 text-lg leading-relaxed">
              Zolarux was not built from a business idea. It was built from real pain —
              watching people lose money to fake gadgets, disappearing vendors, and
              undelivered orders on WhatsApp and Instagram every single day.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-3xl font-800 text-gray-900 mb-6">
                Five Years of Building Trust Infrastructure
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Social commerce in Nigeria is massive. Millions of people buy and sell
                  through WhatsApp, Instagram, and Facebook every day. The demand exists.
                  The problem has always been trust.
                </p>
                <p>
                  Buyers are afraid of scams. Vendors lose legitimate sales because
                  customers do not trust them enough to pay upfront. Both sides are losing.
                </p>
                <p>
                  Zolarux sits between both parties as a controlled transaction layer —
                  verifying vendors, holding funds in escrow, inspecting products,
                  monitoring fulfillment, and only releasing payment when the buyer confirms.
                </p>
                <p>
                  We have processed over <strong>₦2 million in protected transactions</strong>,
                  served <strong>100+ customers</strong>, and maintained a{' '}
                  <strong>zero confirmed scam record</strong> since inception.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { number: '₦2M+', label: 'Transactions Protected' },
                { number: '100+', label: 'Happy Customers' },
                { number: '5yrs', label: 'In Operation' },
                { number: '0',    label: 'Confirmed Scams' },
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

      {/* Values */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-800 text-gray-900 mb-4">Our Operating Philosophy</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              These are not marketing slogans. They are the rules we follow internally on every single transaction.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card">
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

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-800 text-gray-900 mb-4">The People Behind Every Transaction</h2>
            <p className="text-gray-500 text-lg">Small team. Deep commitment. Every transaction has a real human watching it.</p>
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
    </div>
  )
}
