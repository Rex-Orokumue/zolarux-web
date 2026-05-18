import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/layout/FloatingActions'
import PageLoader from '@/components/layout/PageLoader'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageLoader />
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
      <FloatingActions />
    </>
  )
}