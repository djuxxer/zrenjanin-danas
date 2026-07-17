import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { BreakingTicker } from '@/components/layout/breaking-ticker'
import { CookieConsentAndAnalytics } from '@/components/providers/cookie-consent'
import { createClient } from '@/lib/supabase/server'
import { getTrakaGore, getLatestArticles } from '@/lib/articles'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: settings } = await supabase
    .from('site_settings')
    .select('analytics_id, fb_pixel, facebook_url, instagram_url, twitter_url')
    .eq('id', 1)
    .maybeSingle()

  // Traka prikazuje stvarne vesti sa oznakom "Traka gore"; ako trenutno nema nijedne, prikazuje najnovije objavljene.
  const breaking = await getTrakaGore()
  const tickerArticles = breaking.length > 0 ? breaking : await getLatestArticles(6)

  return (
    <>
      <BreakingTicker articles={tickerArticles} />
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">{children}</main>
      <Footer
        facebookUrl={settings?.facebook_url ?? null}
        instagramUrl={settings?.instagram_url ?? null}
        twitterUrl={settings?.twitter_url ?? null}
      />
      <CookieConsentAndAnalytics
        analyticsId={settings?.analytics_id ?? null}
        fbPixel={settings?.fb_pixel ?? null}
      />
    </>
  )
}
