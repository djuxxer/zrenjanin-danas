import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/hero-section'
import { TrendingSection, MostReadSection, CategoryGrid } from '@/components/home/trending-section'
import { NewsletterSection } from '@/components/home/widgets'
import { ArticleCard } from '@/components/article/article-card'
import {
  getNaslovnaVelika,
  getNaslovnaMala,
  getTrendingArticles,
  getMostReadArticles,
  getArticlesByCategory,
  getLatestArticles,
} from '@/lib/articles'
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: `${SITE_NAME} — Vesti iz Zrenjanina, Vojvodine i Srbije`,
  description: SITE_DESCRIPTION,
}

export default async function HomePage() {
  const [big, small, trending, mostRead, latest, drustvo, sport, ekonomija] = await Promise.all([
    getNaslovnaVelika(),
    getNaslovnaMala(),
    getTrendingArticles(6),
    getMostReadArticles(5),
    getLatestArticles(12),
    getArticlesByCategory('drustvo', 5),
    getArticlesByCategory('sport', 5),
    getArticlesByCategory('ekonomija', 5),
  ])

  return (
    <div>
      {/* Hero */}
      <HeroSection big={big} small={small} latest={latest} />

      {/* Main content + Sidebar */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Društvo section */}
            {drustvo.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-6 bg-brand-red rounded-full" />
                  <h2 className="font-headline font-bold text-xl">Društvo</h2>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                  <a href="/kategorija/drustvo" className="text-brand-red text-sm font-semibold hover:underline">
                    Sve vesti →
                  </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {drustvo.slice(0, 4).map((a) => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
              </section>
            )}

            {/* Economy section */}
            {ekonomija.length > 0 && (
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
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <TrendingSection articles={trending} />
            <MostReadSection articles={mostRead} />
            <NewsletterSection />
          </aside>
        </div>
      </div>

      {/* Sport section */}
      {sport.length > 0 && (
        <div className="bg-gray-100 dark:bg-gray-900 py-2">
          <CategoryGrid title="Sport" articles={sport} />
        </div>
      )}

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
