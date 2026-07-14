import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { BreakingTicker } from '@/components/layout/breaking-ticker'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreakingTicker />
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">{children}</main>
      <Footer />
    </>
  )
}
