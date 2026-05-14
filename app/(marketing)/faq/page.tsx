'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const FAQ_SECTIONS = [
  {
    section: 'General',
    questions: [
      {
        q: 'What is Zolarux?',
        a: 'Zolarux is a trust infrastructure platform for social commerce in Nigeria. We sit between buyers and sellers, holding payment in escrow, verifying vendors and products, and only releasing funds when the buyer confirms satisfaction. Think of us as the safety layer for buying gadgets online.',
      },
      {
        q: 'Is Zolarux a marketplace?',
        a: 'Not exactly. We have verified listings, but we are not competing with Jumia or Konga. We are a trust and escrow service. You can bring your own transaction to us — if you find a vendor on WhatsApp or Instagram, we can still protect that deal through our escrow process.',
      },
      {
        q: 'How long has Zolarux been operating?',
        a: 'Zolarux has been operating for five years, processing over ₦2 million in protected transactions with a zero confirmed scam record.',
      },
      {
        q: 'Is Zolarux available outside Lagos?',
        a: 'Yes. Our escrow service is available nationwide. Deliveries are coordinated by vendors and monitored by us regardless of location. We have served customers across Lagos, Abuja, Port Harcourt, and other major cities.',
      },
    ],
  },
  {
    section: 'For Buyers',
    questions: [
      {
        q: 'How does escrow work exactly?',
        a: 'You pay Zolarux the full product price plus a small protection fee. We hold the money. The vendor is notified that payment is confirmed and proceeds to prepare the item. We verify the item before shipping is approved. After delivery, you inspect it and confirm. Only then do we release payment to the vendor. If there is a problem, your money stays frozen until the dispute is resolved.',
      },
      {
        q: 'What is the protection fee?',
        a: 'The protection fee ranges from ₦2,000 to ₦5,000 depending on transaction value. For transactions above ₦300,000, contact us for a custom fee. This fee is non-refundable except in cases where Zolarux is at fault.',
      },
      {
        q: 'What happens if the vendor sends a fake product?',
        a: 'Our pre-shipment verification process is designed to catch this before it happens. If a fake product somehow passes through, raise a dispute immediately. We will freeze funds, investigate with evidence from both parties, and issue a full refund if the vendor is found at fault.',
      },
      {
        q: 'How long does a transaction take?',
        a: 'From payment to delivery, most transactions complete within 1–5 business days depending on the vendor\'s location and delivery logistics. Verification typically adds 2–12 hours before shipping is approved.',
      },
      {
        q: 'Can I use Zolarux for a vendor I found on Instagram?',
        a: 'Yes. If you have found a vendor elsewhere and want Zolarux to protect the transaction, contact us on WhatsApp. We will verify the vendor, coordinate the transaction, and apply full escrow protection — even for off-platform vendors.',
      },
      {
        q: 'What if I change my mind after paying?',
        a: 'If the vendor has not yet shipped the item and verification has not been completed, we can process a cancellation minus the protection fee. Once the item has been shipped and confirmed delivered, we cannot process a refund for change of mind.',
      },
    ],
  },
  {
    section: 'For Vendors',
    questions: [
      {
        q: 'How do I become a verified vendor?',
        a: 'Fill out the vendor registration form on our website. The process involves submitting identity documents, business proof, and supplier information, followed by a short video verification call. The full process takes 24–72 hours.',
      },
      {
        q: 'What does the verification process cost?',
        a: 'Vendor verification is currently free for early-stage vendors. A subscription model for premium features is planned for the future.',
      },
      {
        q: 'How and when do I get paid?',
        a: 'You get paid after the buyer confirms delivery and satisfaction. Payment is released within 24 hours of buyer confirmation to your registered bank account.',
      },
      {
        q: 'What if a buyer raises a false dispute?',
        a: 'We investigate all disputes with evidence from both parties. If the dispute is found to be unwarranted — for example, the buyer received the correct item and is trying to get a refund unfairly — you will receive your full payment and the buyer\'s account will be flagged.',
      },
      {
        q: 'Can I do dropshipping through Zolarux?',
        a: 'Yes. Zolarux supports a dropshipping model where you do not need capital. The buyer pays us, we verify and pay your supplier directly, the supplier ships, and your profit margin is released after buyer confirmation. This eliminates capital barriers and protects all parties.',
      },
      {
        q: 'What happens if I violate vendor terms?',
        a: 'Minor violations result in a trust score reduction and a warning. Serious violations — such as sending fake products, providing false documentation, or attempting to transact off-platform — result in immediate suspension and public flagging in our vendor database.',
      },
    ],
  },
  {
    section: 'Safety Tools',
    questions: [
      {
        q: 'Is the vendor checker free to use?',
        a: 'Yes. Anyone can check a vendor\'s status for free at any time, even without a Zolarux account. This is a public trust tool.',
      },
      {
        q: 'How accurate is the stolen device checker?',
        a: 'The stolen device registry is only as complete as the reports submitted to it. We strongly encourage theft victims to report immediately. The absence of a record does not guarantee a device is clean — it means it has not been reported to us.',
      },
      {
        q: 'What does the product link scanner do?',
        a: 'Paste any product link from Instagram, Jiji, WhatsApp, or any other platform. Our system analyses the listing for known scam patterns — suspicious pricing, vague descriptions, unverified sellers — and gives you a safety score. It also suggests matching verified listings on Zolarux if available.',
      },
    ],
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left hover:text-primary transition-colors"
      >
        <span className="font-display font-700 text-gray-900 text-sm sm:text-base leading-snug">
          {question}
        </span>
        <ChevronDown
          size={18}
          className={cn('text-gray-400 shrink-0 mt-0.5 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="pb-5">
          <p className="text-gray-600 text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  const [activeSection, setActiveSection] = useState('General')

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-display text-4xl font-800 text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-white/70 text-lg">
            Everything you need to know about how Zolarux works.
          </p>
        </div>
      </section>

      {/* Section tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-none">
            {FAQ_SECTIONS.map(({ section }) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={cn(
                  'shrink-0 px-4 py-2 rounded-full text-sm font-600 transition-all',
                  activeSection === section
                    ? 'bg-primary text-white'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                {section}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ content */}
      <section className="py-16 bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {FAQ_SECTIONS.filter(s => s.section === activeSection).map(({ section, questions }) => (
            <div key={section} className="bg-white rounded-3xl border border-gray-100 shadow-card px-6 sm:px-8">
              {questions.map(({ q, a }) => (
                <FAQItem key={q} question={q} answer={a} />
              ))}
            </div>
          ))}

          {/* Still have questions */}
          <div className="mt-10 bg-primary rounded-3xl p-8 text-center">
            <h3 className="font-display text-xl font-800 text-white mb-3">
              Still have a question?
            </h3>
            <p className="text-white/70 mb-6 text-sm">
              Our team is available on WhatsApp. We typically respond within minutes during business hours.
            </p>
            <Link
              href="https://wa.me/2347063107314?text=Hi, I have a question about Zolarux"
              target="_blank"
              className="inline-flex items-center gap-2 bg-white text-primary font-display font-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all"
            >
              <MessageCircle size={16} />
              Chat on WhatsApp
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}