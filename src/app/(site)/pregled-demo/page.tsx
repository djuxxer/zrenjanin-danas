import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/hero-section'
import { TrendingSection, MostReadSection, CategoryGrid } from '@/components/home/trending-section'
import { WeatherWidget, NewsletterSection, AdBanner } from '@/components/home/widgets'
import { ArticleCard } from '@/components/article/article-card'
import { demoNaslovnaVelika, demoNaslovnaMala, demoTrending, demoMostRead, demoLatest, demoByCategory } from '@/lib/demo-articles'

export const metadata: Metadata = {
  title: 'Pregled izgleda (demo) — Zrenjanin Danas',
  robots: { index: false, follow: false },
}

export default function DemoPreviewPage() {
  const big = demoNaslovnaVelika()
  const small = demoNaslovnaMala()
  const trending = demoTrending(6)
  const mostRead = demoMostRead(5)
  const latest = demoLatest(12)
  const zrenjanin = demoByCategory('zrenjanin', 5)
  const sport = demoByCategory('sport', 5)
  const ekonomija = demoByCategory('ekonomija', 5)

  return (
    <div>
      <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-center text-sm font-semibold py-2">
        Ovo je demo pregled izgleda sajta sa primerom sadržaja — nije povezan sa pravom bazom.
      </div>

      {/* Hero */}
      <HeroSection big={big} small={small} latest={latest} />

      {/* Ad banner */}
      <div className="container mx-auto px-4 mb-2">
        <AdBanner size="medium" />
      </div>

      {/* Main content + Sidebar */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Zrenjanin section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-brand-red rounded-full" />
                <h2 className="font-headline font-bold text-xl">Zrenjanin</h2>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {zrenjanin.slice(0, 4).map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
            </section>

            {/* Economy section */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-yellow-500 rounded-full" />
                <h2 className="font-headline font-bold text-xl">Ekonomija</h2>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
              </div>
              <div className="space-y-3">
                {ekonomija.map((a) => (
                  <ArticleCard key={a.id} article={a} variant="horizontal" />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <WeatherWidget />
            <TrendingSection articles={trending} />
            <AdBanner size="large" />
            <MostReadSection articles={mostRead} />
            <NewsletterSection />
          </aside>
        </div>
      </div>

      {/* Sport section */}
      <div className="bg-gray-100 dark:bg-gray-900 py-2">
        <CategoryGrid title="Sport" articles={sport} />
      </div>

      {/* Latest articles */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 bg-brand-red rounded-full" />
          <h2 className="font-headline font-bold text-xl">Najnovije vesti</h2>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {latest.slice(0, 8).map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      </section>
    </div>
  )
}
