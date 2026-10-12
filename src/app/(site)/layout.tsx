import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { BreakingTicker } from '@/components/layout/breaking-ticker'
import { CookieConsentAndAnalytics } from '@/components/providers/cookie-consent'
import { createClient } from '@/lib/supabase/server'
import { getTrakaGore, getLatestArticles } from '@/lib/articles'
import { getActiveLiveBlog } from '@/lib/live'
import Link from 'next/link'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: settings } = await supabase
    .from('site_settings')
    .select('analytics_id, fb_pixel, google_ads_id, facebook_url, instagram_url, twitter_url')
    .eq('id', 1)
    .maybeSingle()

  // Traka prikazuje stvarne vesti sa oznakom "Traka gore"; ako trenutno nema nijedne, prikazuje najnovije objavljene.
  const breaking = await getTrakaGore()
  const tickerArticles = breaking.length > 0 ? breaking : await getLatestArticles(5)
  const activeLive = await getActiveLiveBlog()

  return (
    <>
      {activeLive && (
        <Link
          href={`/uzivo/${activeLive.slug}`}
          className="block bg-red-600 hover:bg-red-700 text-white text-center text-sm font-bold px-4 py-2 transition-colors"
        >
          <span className="inline-flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            UŽIVO: {activeLive.title} →
          </span>
        </Link>
      )}
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
        googleAdsId={settings?.google_ads_id ?? null}
      />
    </>
  )
}
