import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, XCircle, Shield, MessageCircle, Mail, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Refund & Return Policy',
  description: 'Zolarux 100% Money-Back Guarantee. We hold funds in escrow until you inspect the item. Learn how our dispute resolution and return process works.',
}

const REFUND_PROCESS = [
  { step: '1', title: 'Report Issue', desc: 'Report the issue to Zolarux via WhatsApp or email within 48 hours of delivery.' },
  { step: '2', title: 'Funds Frozen', desc: 'We explicitly pause the transaction. The vendor does not receive the money.' },
  { step: '3', title: 'Investigation', desc: 'We review evidence (chat history, product photos). This typically takes 2–6 hours.' },
  { step: '4', title: 'Resolution', desc: 'If the claim is valid, Zolarux refunds you directly from the escrow account within 24 hours.' },
]

export default function RefundPolicyPage() {
  return (
    <div className="bg-surface min-h-screen">
      {/* Hero */}
      <section className="bg-primary py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={20} className="text-white/70" />
            <span className="text-white/70 text-sm font-600">100% Money Back Guarantee</span>
          </div>
          <h1 className="font-display text-4xl font-800 text-white mb-3">
            Refund & Return Policy
          </h1>
          <p className="text-white/75 text-lg leading-relaxed">
            Our Escrow system holds your funds. If the vendor fails to deliver,{' '}
            <strong className="text-white">we refund you instantly.</strong> No stories.
          </p>
          <p className="text-white/50 text-sm mt-4">Effective Date: August 2024</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-8 sm:p-10 space-y-10">

          {/* Intro */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
            <p className="text-green-800 text-sm leading-relaxed">
              Zolarux Escrow is designed to eliminate risk. Unlike other platforms where you pay the
              vendor directly, <strong>you pay Zolarux</strong>. We only release funds to the vendor
              after you confirm you are satisfied. This gives us the power to issue refunds without
              waiting for the vendor&apos;s permission.
            </p>
          </div>

          {/* Escrow protection scope */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
                <span className="font-display font-800 text-white text-sm">1</span>
              </div>
              <h2 className="font-display text-xl font-800 text-gray-900">Escrow Protection Scope</h2>
            </div>
            <div className="pl-11 space-y-3">
              <div className="flex items-start gap-3 bg-green-50 rounded-xl p-4">
                <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-700 text-green-800 text-sm">Full Refund</p>
                  <p className="text-green-700 text-xs mt-0.5">If you do not receive your order within the agreed timeline.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-green-50 rounded-xl p-4">
                <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-700 text-green-800 text-sm">Full Refund</p>
                  <p className="text-green-700 text-xs mt-0.5">If the item received is significantly different from the description (wrong color, wrong specs, damaged, fake).</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-4">
                <CheckCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-700 text-amber-800 text-sm">Partial Refund</p>
                  <p className="text-amber-700 text-xs mt-0.5">If you decide to keep an item that has minor flaws (negotiated with vendor and approved by Zolarux).</p>
                </div>
              </div>
            </div>
          </div>

          {/* Refund process */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
                <span className="font-display font-800 text-white text-sm">2</span>
              </div>
              <h2 className="font-display text-xl font-800 text-gray-900">The Refund Process</h2>
            </div>
            <div className="pl-11 space-y-3">
              {REFUND_PROCESS.map(({ step, title, desc }) => (
                <div key={step} className="flex items-start gap-3 bg-surface rounded-xl p-4">
                  <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-sm font-800 shrink-0">
                    {step}
                  </div>
                  <div>
                    <p className="font-display font-700 text-gray-900 text-sm">{title}</p>
                    <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Return shipping */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
                <span className="font-display font-800 text-white text-sm">3</span>
              </div>
              <h2 className="font-display text-xl font-800 text-gray-900">Return Shipping</h2>
            </div>
            <div className="pl-11 space-y-3 text-sm text-gray-600">
              <p>If a return is required, the product must be returned in its original condition.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <p className="font-700 text-green-800 text-sm mb-2">Vendor Pays Shipping If:</p>
                  <p className="text-green-700 text-xs leading-relaxed">The item sent was wrong, damaged, or defective.</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="font-700 text-blue-800 text-sm mb-2">Buyer Pays Shipping If:</p>
                  <p className="text-blue-700 text-xs leading-relaxed">The buyer simply changed their mind or ordered the wrong specification.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dropshipping */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
                <span className="font-display font-800 text-white text-sm">4</span>
              </div>
              <h2 className="font-display text-xl font-800 text-gray-900">Dropshipping & Liability</h2>
            </div>
            <div className="pl-11 space-y-3 text-sm text-gray-600 leading-relaxed">
              <p>Many vendors on Zolarux are Dropshippers — they fulfill orders via third-party suppliers.</p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="font-700 text-amber-800 mb-2">Important:</p>
                <p className="text-amber-700 text-sm">The Zolarux Vendor you transact with is 100% liable for the order. Even if their supplier made the mistake, the Zolarux Vendor must resolve it or face a refund deduction. We do not deal with third-party suppliers.</p>
              </div>
            </div>
          </div>

          {/* Non-refundable */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
                <span className="font-display font-800 text-white text-sm">5</span>
              </div>
              <h2 className="font-display text-xl font-800 text-gray-900">Non-Refundable Items</h2>
            </div>
            <div className="pl-11 space-y-2">
              {[
                'Perishable goods (food, flowers) unless spoiled on arrival',
                'Personalised or custom-made items, unless defective',
                'Digital goods (software, courses) once accessed or downloaded',
                'Items damaged by the buyer after delivery',
                'Escrow protection fee on successfully completed transactions',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-gray-600">
                  <XCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="border-t border-gray-100 pt-8">
            <h3 className="font-display text-xl font-800 text-gray-900 mb-2">Request a Refund Now</h3>
            <p className="text-gray-500 text-sm mb-6">
              Have an issue with an order? Don&apos;t panic. Your money is safe with Zolarux. Report it immediately.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="https://wa.me/2347063107314?text=I want to raise a dispute/refund request for order:"
                target="_blank"
                className="inline-flex items-center gap-2 bg-green-500 text-white font-700 px-5 py-3 rounded-xl hover:bg-green-600 transition-all text-sm"
              >
                <MessageCircle size={15} /> Open Refund Ticket
              </Link>
              <a
                href="mailto:zolaruxlimited@gmail.com"
                className="inline-flex items-center gap-2 border border-primary text-primary font-700 px-5 py-3 rounded-xl hover:bg-primary-light transition-all text-sm"
              >
                <Mail size={15} /> Email Disputes
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}