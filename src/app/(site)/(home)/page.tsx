import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/hero-section'
import { TrendingSection, MostReadSection, CategoryGrid } from '@/components/home/trending-section'
import { WeatherWidget, NewsletterSection, AdBanner } from '@/components/home/widgets'
import { ArticleCard } from '@/components/article/article-card'
import {
  getFeaturedArticles,
  getTrendingArticles,
  getMostReadArticles,
  getArticlesByCategory,
  getLatestArticles,
} from '@/lib/articles'
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/utils'

export const metadata: Metadata = {
  title: `${SITE_NAME} — Vesti iz Zrenjanina, Vojvodine i Srbije`,
  description: SITE_DESCRIPTION,
}

export default async function HomePage() {
  const [featured, trending, mostRead, latest, zrenjanin, sport, ekonomija] = await Promise.all([
    getFeaturedArticles(),
    getTrendingArticles(6),
    getMostReadArticles(5),
    getLatestArticles(12),
    getArticlesByCategory('zrenjanin', 5),
    getArticlesByCategory('sport', 5),
    getArticlesByCategory('ekonomija', 5),
  ])

  return (
    <div>
      {/* Hero */}
      <HeroSection featured={featured} latest={latest} />

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
                <a href="/kategorija/zrenjanin" className="text-brand-red text-sm font-semibold hover:underline">
                  Sve vesti →
                </a>
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
                <a href="/kategorija/ekonomija" className="text-brand-red text-sm font-semibold hover:underline">
                  Sve vesti →
                </a>
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
