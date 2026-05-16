import type { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Mail, MessageCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Zolarux collects, uses, and protects your personal and financial data. We are committed to transparency and security in social commerce.',
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

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
      <p>{children}</p>
    </div>
  )
}

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-surface min-h-screen">
      {/* Hero */}
      <section className="bg-primary py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={20} className="text-white/70" />
            <span className="text-white/70 text-sm font-600">Secure & Transparent Data Practices</span>
          </div>
          <h1 className="font-display text-4xl font-800 text-white mb-3">Privacy Policy</h1>
          <p className="text-white/70">
            Your trust is our foundation. Learn how we protect your information.
          </p>
          <p className="text-white/50 text-sm mt-3">Last updated: August 2024</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-8 sm:p-10 space-y-10">

          {/* Intro */}
          <div className="bg-primary-light border border-primary-100 rounded-2xl p-5">
            <p className="text-primary text-sm leading-relaxed">
              At Zolarux, we&apos;re building Nigeria&apos;s most trusted marketplace. We understand the
              frustration of online scams, which is why we&apos;ve built an ecosystem that prioritizes
              security and transparency. This Privacy Policy explains how we collect, use, and protect
              your information when you use our platform — including our website and WhatsApp-integrated
              services for escrow protection, verification, and dispute resolution.
            </p>
          </div>

          <Section number="1" title="Information We Collect">
            <h3 className="font-700 text-gray-800">User Information</h3>
            <div className="space-y-2">
              <Bullet>Name, email address, phone number (WhatsApp), and delivery location</Bullet>
              <Bullet>Payment confirmation details (receipts) sent via our secure forms or chat</Bullet>
            </div>
            <h3 className="font-700 text-gray-800 mt-4">Vendor Verification Data</h3>
            <p>For sellers applying for trusted status:</p>
            <div className="space-y-2">
              <Bullet><strong>Identity:</strong> Valid Government ID (NIN, Passport, or Voter&apos;s Card) and live facial verification</Bullet>
              <Bullet><strong>Business:</strong> Registration certificates (CAC/SMEDAN) if applicable</Bullet>
              <Bullet><strong>References:</strong> Guarantor contact details for background checks</Bullet>
              <Bullet><strong>Operations:</strong> Proof of stock/inventory (photos/videos)</Bullet>
            </div>
          </Section>

          <Section number="2" title="How We Use Your Data">
            <div className="space-y-4">
              <div className="bg-surface rounded-xl p-4">
                <p className="font-700 text-gray-800 mb-1">Escrow Services</p>
                <p>To reconcile payments and ensure funds are only released when delivery is confirmed.</p>
              </div>
              <div className="bg-surface rounded-xl p-4">
                <p className="font-700 text-gray-800 mb-1">Fraud Prevention</p>
                <p>To calculate Trust Scores for vendors and flag suspicious transaction patterns.</p>
              </div>
              <div className="bg-surface rounded-xl p-4">
                <p className="font-700 text-gray-800 mb-1">Dispute Resolution</p>
                <p>To review evidence (chat logs, delivery receipts) during disagreements between buyers and sellers.</p>
              </div>
              <div className="bg-surface rounded-xl p-4">
                <p className="font-700 text-gray-800 mb-1">Credit Assessment</p>
                <p>To determine eligibility for BNPL or vendor micro-loans based on transaction history.</p>
              </div>
            </div>
          </Section>

          <Section number="3" title="Third Parties & Platforms">
            <p>We never sell your personal information. However, Zolarux operates as a digital-first platform utilising specific third-party tools:</p>
            <div className="space-y-3 mt-2">
              <Bullet><strong>WhatsApp (Meta):</strong> Our primary communication and support channel. By using our services, you acknowledge that data shared via chat is processed by Meta&apos;s infrastructure.</Bullet>
              <Bullet><strong>Cloud Storage:</strong> Vendor verification documents (IDs, photos) are stored securely on encrypted cloud servers.</Bullet>
              <Bullet><strong>Email Services:</strong> Used for automated notifications regarding application status and transaction receipts.</Bullet>
              <Bullet><strong>Paystack:</strong> Payment processing. Your card details are handled directly by Paystack and are never stored by Zolarux.</Bullet>
            </div>
          </Section>

          <Section number="4" title="Data Retention">
            <div className="space-y-2">
              <Bullet>Transaction records: Kept for 7 years for financial compliance and audit purposes.</Bullet>
              <Bullet>Verification documents: Retained as long as the vendor remains active on the platform, plus 2 years post-deactivation.</Bullet>
              <Bullet>Account data: Retained until you request deletion, subject to legal obligations.</Bullet>
            </div>
          </Section>

          <Section number="5" title="Your Rights">
            <div className="space-y-2">
              <Bullet>Request access to the personal data we hold about you.</Bullet>
              <Bullet>Request correction of inaccurate data.</Bullet>
              <Bullet>Request deletion of your account and associated data (subject to legal retention requirements).</Bullet>
              <Bullet>Object to processing of your data for certain purposes.</Bullet>
            </div>
            <p className="mt-3">To exercise any of these rights, contact us via the details below.</p>
          </Section>

          {/* Contact */}
          <div className="border-t border-gray-100 pt-8">
            <h3 className="font-display font-700 text-gray-900 mb-5">Questions About Your Privacy?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Mail, label: 'Email Us', value: 'privacy@zolarux.com.ng', href: 'mailto:privacy@zolarux.com.ng' },
                { icon: MessageCircle, label: 'WhatsApp Support', value: '+234 706 310 7314', href: 'https://wa.me/2347063107314' },
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