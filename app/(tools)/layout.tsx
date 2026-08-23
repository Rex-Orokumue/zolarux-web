import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
    </>
  )
}
