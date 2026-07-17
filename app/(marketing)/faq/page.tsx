'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import JsonLd from '@/components/seo/JsonLd'
import { faqSchema } from '@/lib/seo'
import PageHero from '@/components/layout/PageHero'

const FAQ_SECTIONS = [
  {
    section: 'General',
    questions: [
      { q: 'What is Zolarux?', a: 'Zolarux is a trust infrastructure platform for social commerce in Nigeria. We sit between buyers and sellers, holding payment in escrow, verifying vendors and products, and only releasing funds when the buyer confirms satisfaction. Think of us as the safety layer for buying gadgets online.' },
      { q: 'Is Zolarux a marketplace?', a: 'Not exactly. We have verified listings, but we are not competing with Jumia or Konga. We are a trust and escrow service. You can bring your own transaction to us — if you find a vendor on WhatsApp or Instagram, we can still protect that deal through our escrow process.' },
      { q: 'How long has Zolarux been operating?', a: 'Zolarux has been operating for five years, processing over ₦2 million in protected transactions with a zero confirmed scam record.' },
      { q: 'Is Zolarux available outside Lagos?', a: 'Yes. Our escrow service is available nationwide. Deliveries are coordinated by vendors and monitored by us regardless of location. We have served customers across Lagos, Abuja, Port Harcourt, and other major cities.' },
      { q: 'Is Zolarux only for gadgets?', a: 'Currently yes. We are focused exclusively on gadgets — phones, laptops, accessories, and electronics. This focus allows us to build deep expertise in verification for this category. We plan to expand to other categories after establishing a strong reputation in gadgets.' },
      { q: 'How does Zolarux make money?', a: 'Zolarux charges buyers a small protection fee per transaction — ranging from ₦1,500 to ₦5,000 depending on the order value. Vendors pay nothing. This fee covers escrow management, verification, and dispute resolution.' },
      { q: 'Is there a mobile app?', a: 'Yes. The Zolarux Android app is available for download on our website. It allows you to browse listings, track orders, verify vendors, and check stolen devices. An iOS version is in development.' },
      { q: 'Can I trust Zolarux with my money?', a: 'Zolarux has processed over ₦2 million in transactions with a zero confirmed scam record over five years. Your money is held in a controlled escrow position — not given to the vendor — until you confirm satisfaction. If anything goes wrong, we investigate and refund from escrow.' },
    ],
  },
  {
    section: 'For Buyers',
    questions: [
      { q: 'How does escrow work exactly?', a: 'You pay Zolarux the full product price plus a small protection fee. We hold the money. The vendor is notified that payment is confirmed and proceeds to prepare the item. We verify the item before shipping is approved. After delivery, you inspect it and confirm. Only then do we release payment to the vendor. If there is a problem, your money stays frozen until the dispute is resolved.' },
      { q: 'What is the protection fee?', a: 'The protection fee is a flat amount based on your order value: ₦1,500 for orders up to ₦50,000 — ₦2,500 for ₦50,001–₦150,000 — ₦4,000 for ₦150,001–₦300,000 — and a flat ₦5,000 cap for any order above ₦300,000. This fee is non-refundable on completed transactions.' },
      { q: 'What happens if the vendor sends a fake product?', a: 'Our pre-shipment verification process is designed to catch this before it happens. We check serial numbers, run video inspections, and verify authenticity before any item ships. If a fake somehow passes through, raise a dispute immediately. We will freeze funds, investigate, and issue a full refund if the vendor is at fault.' },
      { q: 'How long does a transaction take?', a: 'From payment to delivery, most transactions complete within 1–5 business days depending on the vendor location and delivery logistics. Verification typically adds 2–12 hours before shipping is approved.' },
      { q: 'Can I use Zolarux for a vendor I found on Instagram?', a: 'Yes. If you found a vendor elsewhere and want Zolarux to protect the transaction, contact us on WhatsApp. We will verify the vendor, coordinate the transaction, and apply full escrow protection — even for off-platform vendors.' },
      { q: 'What if I change my mind after paying?', a: 'If the vendor has not yet shipped and verification has not been completed, we can process a cancellation minus the protection fee. Once the item has been shipped and confirmed delivered, we cannot process a refund for change of mind.' },
      { q: 'How do I confirm delivery?', a: 'Once your item arrives, inspect it carefully. If satisfied, send us a WhatsApp message confirming receipt. You can also tap "Confirm Receipt" in your buyer dashboard. Payment is then released to the vendor. If there is a problem, tap "Raise Dispute" instead.' },
      { q: 'What is the inspection window?', a: 'You have 24 hours from confirmed delivery to raise a dispute. After 24 hours without a dispute, the transaction is automatically considered complete and payment is released to the vendor.' },
      { q: 'Can I add multiple items to one order?', a: 'Yes. You can use the cart feature to add multiple items and check out in one payment. Orders with items from different vendors will create separate order records per vendor, but you pay once.' },
      { q: 'What is the wishlist for?', a: 'The wishlist lets you save items you want to buy later without committing to a purchase. You can move wishlist items to your cart when you are ready to buy.' },
      { q: 'Do I need an account to buy?', a: 'Yes. You need a Zolarux buyer account to place orders. Registration is free and takes under 2 minutes — just your email and a one-time code. Having an account lets you track all your orders in one place.' },
    ],
  },
  {
    section: 'For Vendors',
    questions: [
      { q: 'How do I become a verified vendor?', a: 'Fill out the vendor registration form on our website. The process involves submitting identity documents, business proof, and supplier information, followed by a short video verification call. The full process takes 24–72 hours.' },
      { q: 'What does the verification process cost?', a: 'Vendor verification is currently free. A subscription model for premium features is planned for the future but core verification will always be free.' },
      { q: 'How and when do I get paid?', a: 'You get paid after the buyer confirms delivery and satisfaction. Payment is released within 24 hours of buyer confirmation to your registered bank account. You receive the full product price — Zolarux charges the buyer the protection fee, not you.' },
      { q: 'What if a buyer raises a false dispute?', a: 'We investigate all disputes with evidence from both parties. If the dispute is unwarranted — the buyer received the correct item and is trying to get a refund unfairly — you will receive your full payment and the buyer account will be flagged.' },
      { q: 'Can I do dropshipping through Zolarux?', a: 'Yes. Zolarux supports a dropshipping model where you do not need capital upfront. The buyer pays us, we verify and pay your supplier directly, the supplier ships, and your profit margin is released after buyer confirmation. This eliminates capital barriers and protects all parties.' },
      { q: 'What happens if I violate vendor terms?', a: 'Minor violations result in a trust score reduction and a warning. Serious violations — such as sending fake products, providing false documentation, or attempting to transact off-platform — result in immediate suspension and public flagging in our vendor database.' },
      { q: 'How do I log in as a vendor?', a: 'Go to zolarux.com.ng/vendor/login. Enter your registered business email. You will receive a one-time login code. If this is your first login after being approved, go to /vendor/activate instead to set up your account.' },
      { q: 'Can I create and manage my listings from the website?', a: 'Yes. Once logged in to your vendor dashboard, go to Listings → Add New Listing. You can upload up to 5 product images, set pricing, add descriptions, and toggle listings active or inactive.' },
      { q: 'What is the trust score?', a: 'Every vendor has a trust score out of 100 calculated based on identity verification strength, transaction history, dispute record, and enforcement actions. A higher score increases buyer confidence and may unlock premium features in the future.' },
      { q: 'Can I sell outside of Zolarux while being a verified vendor?', a: 'Yes. Being a Zolarux vendor does not stop you from selling elsewhere. However, only transactions processed through Zolarux escrow carry the protection guarantee. Transactions you do outside the platform are not covered.' },
      { q: 'How do I update my business information?', a: 'Contact Zolarux via WhatsApp or email with your vendor ID. Profile updates require manual review to maintain the integrity of the verification record.' },
    ],
  },
  {
    section: 'Payments',
    questions: [
      { q: 'What payment methods do you accept?', a: 'We accept payments via Paystack, which supports debit cards (Mastercard, Visa, Verve), bank transfers, and USSD. All payments are processed securely — your card details are handled by Paystack and never stored by Zolarux.' },
      { q: 'Is my payment information safe?', a: 'Yes. Card processing is handled entirely by Paystack, a PCI-DSS compliant payment processor. Zolarux never sees or stores your card details. We only receive a confirmation and reference once payment succeeds.' },
      { q: 'What happens if my payment fails?', a: 'If your payment fails at checkout, no money is deducted and no order is created. Simply try again. If money was deducted but you did not receive a confirmation, contact us on WhatsApp immediately with your bank details and we will investigate.' },
      { q: 'Can I pay in instalments?', a: 'Not currently. All payments must be made in full at checkout. We are exploring a Buy Now Pay Later (BNPL) feature for the future.' },
      { q: 'What currency do you charge in?', a: 'All transactions are in Nigerian Naira (₦). We do not currently support foreign currency payments.' },
      { q: 'Do you charge any hidden fees?', a: 'No. The only fee you pay beyond the product price is the protection fee, which is clearly shown at checkout before you pay. There are no hidden charges.' },
    ],
  },
  {
    section: 'Safety Tools',
    questions: [
      { q: 'Is the vendor checker free to use?', a: 'Yes. Anyone can check a vendor status for free at any time, even without a Zolarux account. This is a public trust tool available at zolarux.com.ng/check-vendor.' },
      { q: 'How accurate is the stolen device checker?', a: 'The stolen device registry is only as complete as the reports submitted to it. We strongly encourage theft victims to report immediately. The absence of a record does not guarantee a device is clean — it means it has not been reported to us. Always combine the check with our originality verification.' },
      { q: 'What does the product link scanner do?', a: 'Paste any product link from Instagram, Jiji, WhatsApp, or any platform. Our system analyses the listing for scam patterns — suspicious pricing, vague descriptions, unverified sellers — and gives you a safety score. It also shows you matching verified listings on Zolarux if available.' },
      { q: 'How do I report a stolen device?', a: 'Go to zolarux.com.ng/report-item. Fill in your device details including IMEI or serial number. Once submitted, anyone who searches that IMEI or serial will be warned immediately. The report also helps law enforcement track stolen devices.' },
      { q: 'How do I verify if a phone is original or a clone?', a: 'Go to zolarux.com.ng/check-original. We provide six step-by-step verification methods including serial number checks against manufacturer databases, battery cycle count checks, BIOS verification, and benchmark tests. Each method is explained in plain language.' },
      { q: 'Can I check a vendor before buying from them outside Zolarux?', a: 'Yes. Go to zolarux.com.ng/check-vendor and enter their phone number, vendor ID, or business name. If they are Zolarux-verified, you will see their status and trust score. If they are flagged, you will see a warning immediately.' },
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
      <JsonLd data={faqSchema(FAQ_SECTIONS.flatMap((s) => s.questions))} />
      {/* Hero */}
      <PageHero
        imageUrl="https://images.unsplash.com/photo-1549086802-bb458f399f05?w=1600&q=70&auto=format&fit=crop"
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about how Zolarux works."
      />

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
              href="https://wa.me/2348120288390?text=Hi, I have a question about Zolarux"
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