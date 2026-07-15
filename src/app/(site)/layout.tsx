import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { BreakingTicker } from '@/components/layout/breaking-ticker'
import { CookieConsentAndAnalytics } from '@/components/providers/cookie-consent'
import { createClient } from '@/lib/supabase/server'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: settings } = await supabase
    .from('site_settings')
    .select('analytics_id, fb_pixel')
    .eq('id', 1)
    .maybeSingle()

  return (
    <>
      <BreakingTicker />
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">{children}</main>
      <Footer />
      <CookieConsentAndAnalytics
        analyticsId={settings?.analytics_id ?? null}
        fbPixel={settings?.fb_pixel ?? null}
      />
    </>
  )
}
