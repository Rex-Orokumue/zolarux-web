import type { Metadata } from 'next'
import { CheckCircle, XCircle, Mail, Phone, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read the terms governing the use of Zolarux. Understand our escrow rules, vendor obligations, buyer protection policies, and dispute resolution process.',
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <span className="font-display font-800 text-white text-sm">{number}</span>
        </div>
        <h2 className="font-display text-xl font-800 text-gray-900">{title}</h2>
      </div>
      <div className="pl-11 space-y-3 text-gray-600 text-sm leading-relaxed">
        {children}
      </div>
    </div>
  )
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5" />
      <p>{children}</p>
    </div>
  )
}

function Cross({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <XCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
      <p>{children}</p>
    </div>
  )
}

export default function TermsPage() {
  return (
    <div className="bg-surface min-h-screen">
      {/* Hero */}
      <section className="bg-gray-950 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={20} className="text-white/50" />
            <span className="text-white/50 text-sm font-600">Platform Rules & Agreement</span>
          </div>
          <h1 className="font-display text-4xl font-800 text-white mb-3">Terms of Service</h1>
          <p className="text-gray-400">Zero fees for vendors. Complete protection for buyers.</p>
          <p className="text-gray-500 text-sm mt-3">Effective Date: August 2024</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-8 sm:p-10 space-y-10">

          {/* Intro */}
          <div className="bg-surface border border-gray-100 rounded-2xl p-5">
            <p className="text-gray-600 text-sm leading-relaxed">
              Welcome to Zolarux. These Terms constitute a legally binding agreement between you
              (&ldquo;User&rdquo;, &ldquo;Vendor&rdquo;, or &ldquo;Buyer&rdquo;) and Zolarux Limited regarding your use of our
              website and escrow services. By registering, selling, or buying on Zolarux, you agree
              that we act as a <strong>neutral third-party escrow agent</strong>. We hold funds to ensure
              transaction security but do not take ownership of goods.
            </p>
          </div>

          <Section number="1" title="Escrow & Fee Structure">
            <div className="space-y-4">
              <div className="bg-primary-light rounded-xl p-4">
                <p className="font-700 text-primary mb-1">Funds Holding</p>
                <p className="text-primary/80">All payments are held in Zolarux&apos;s escrow account until the Buyer confirms delivery satisfaction or the inspection period (24 hours) expires.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="font-700 text-blue-800 text-xs uppercase tracking-wider mb-2">Buyer Fees</p>
                  <p className="font-display font-800 text-blue-900 text-lg">₦1,500 – ₦5,000</p>
                  <p className="text-blue-700 text-xs mt-1">Flat fee based on transaction value. Capped at ₦5,000 regardless of order size.</p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <p className="font-700 text-green-800 text-xs uppercase tracking-wider mb-2">Vendor Fees</p>
                  <p className="font-display font-800 text-green-900 text-2xl">₦0</p>
                  <p className="text-green-700 text-xs mt-1">Vendors pay zero fees. You receive the full agreed item price.</p>
                </div>
              </div>
              <div>
                <p className="font-700 text-gray-800 mb-2">Payout Triggers</p>
                <p>Funds are released to the Vendor strictly when: (a) Buyer confirms receipt, OR (b) 24 hours pass after proof of delivery without a dispute.</p>
              </div>
            </div>
          </Section>

          <Section number="2" title="Vendor Obligations">
            <div className="space-y-2">
              <Check><strong>Accurate Representation:</strong> You must deliver items exactly as described in images and text.</Check>
              <Check><strong>Dropshipping Liability:</strong> If you are a dropshipper, YOU are liable for your supplier&apos;s errors. Zolarux holds you responsible for refunds, not your supplier.</Check>
              <Check><strong>Proof of Shipping:</strong> You must provide a valid waybill or delivery evidence to trigger the escrow timer.</Check>
              <Check><strong>Return Policy:</strong> You must honor the return policy stated in your profile. Minimum requirement: 48-hour return window for defective items.</Check>
              <Check><strong>Pre-shipment Evidence:</strong> You must submit date-stamped photos or live video of every item before shipping is approved by Zolarux.</Check>
            </div>
          </Section>

          <Section number="3" title="Buyer Responsibilities">
            <div className="space-y-2">
              <Check><strong>Prompt Inspection:</strong> You must inspect goods within 24 hours of delivery. Failure to report issues within this window implies satisfaction.</Check>
              <Check><strong>Return Condition:</strong> If returning an item, it must be unused, in original packaging, and in the same condition received.</Check>
              <Check><strong>Payment Fee:</strong> The buyer acknowledges the protection fee (₦1,500–₦5,000 depending on order value) is non-refundable in successful transactions — it covers the escrow service cost.</Check>
              <Check><strong>Honest Disputes:</strong> Filing a fraudulent dispute is a violation of these Terms and may result in account suspension.</Check>
            </div>
          </Section>

          <Section number="4" title="Dispute Resolution">
            <p>In the event of a disagreement, Zolarux acts as the final arbitrator.</p>
            <div className="space-y-3 mt-2">
              {[
                { step: '1', title: 'Evidence Submission', desc: 'Both parties must submit chat logs, photos, and waybills within 48 hours of dispute being raised.' },
                { step: '2', title: 'Investigation', desc: "Zolarux reviews all evidence objectively. The investigation typically takes 2–6 hours." },
                { step: '3', title: 'Final Decision', desc: "Zolarux's decision is final and binding based on the evidence provided. No appeals." },
                { step: '4', title: 'Refund or Release', desc: 'If vendor is at fault, buyer is refunded from escrow. If buyer is at fault, vendor is paid in full.' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex items-start gap-3 bg-surface rounded-xl p-4">
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-800 shrink-0">{step}</div>
                  <div>
                    <p className="font-700 text-gray-800 text-sm">{title}</p>
                    <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section number="5" title="Prohibited Items">
            <p>You may not list, buy, or facilitate the sale of:</p>
            <div className="space-y-2 mt-2">
              <Cross>Illegal drugs or controlled substances</Cross>
              <Cross>Weapons, explosives, or ammunition</Cross>
              <Cross>Stolen property of any kind</Cross>
              <Cross>Adult or pornographic content</Cross>
              <Cross>Cryptocurrency or forex investment schemes</Cross>
              <Cross>Counterfeit or fake luxury goods</Cross>
              <Cross>Items that infringe on intellectual property rights</Cross>
            </div>
          </Section>

          <Section number="6" title="Account Termination">
            <p>Zolarux reserves the right to suspend or permanently ban any account that:</p>
            <div className="space-y-2 mt-2">
              <Cross>Attempts to transact outside the Zolarux escrow system</Cross>
              <Cross>Files false or fraudulent disputes</Cross>
              <Cross>Provides fake or falsified verification documents</Cross>
              <Cross>Engages in harassment of buyers, vendors, or Zolarux staff</Cross>
              <Cross>Repeatedly violates these Terms after warnings</Cross>
            </div>
          </Section>

          {/* Footer note */}
          <div className="border-t border-gray-100 pt-8">
            <p className="text-gray-400 text-xs text-center mb-6">
              By using Zolarux, you agree to these Terms of Service. Zolarux reserves the right to
              modify these terms with 30 days&apos; notice.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Mail, label: 'Email Us', value: 'zolaruxlimited@gmail.com', href: 'mailto:zolaruxlimited@gmail.com' },
                { icon: Phone, label: 'Call Us', value: '+234 706 310 7314', href: 'tel:+2347063107314' },
                { icon: Shield, label: 'Office', value: 'Oleh, Delta State, Nigeria', href: null },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="bg-surface rounded-2xl p-4 text-center">
                  <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Icon size={15} className="text-primary" />
                  </div>
                  <p className="font-700 text-gray-900 text-xs mb-1">{label}</p>
                  {href ? (
                    <a href={href} className="text-primary text-xs hover:underline">{value}</a>
                  ) : (
                    <p className="text-gray-500 text-xs">{value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}