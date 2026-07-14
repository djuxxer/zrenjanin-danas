import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getArticlesByCategory } from '@/lib/articles'
import { CATEGORY_LABELS, CATEGORY_COLORS, type Category } from '@/types'
import { cn } from '@/lib/utils'
import { ArticleCard } from '@/components/article/article-card'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return Object.keys(CATEGORY_LABELS).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (!(slug in CATEGORY_LABELS)) return { title: 'Kategorija nije pronađena' }
  const label = CATEGORY_LABELS[slug as Category]
  return {
    title: `${label} — Zrenjanin Danas`,
    description: `Sve vesti iz kategorije ${label} na portalu Zrenjanin Danas.`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  if (!(slug in CATEGORY_LABELS)) notFound()

  const category = slug as Category
  const articles = getArticlesByCategory(category)
  const label = CATEGORY_LABELS[category]
  const color = CATEGORY_COLORS[category]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className={cn('category-badge text-base px-4 py-2', color)}>{label}</span>
        </div>
        <h1 className="font-headline font-black text-4xl">{label}</h1>
        <p className="text-gray-500 mt-1">{articles.length} vesti u ovoj kategoriji</p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl">Nema vesti u ovoj kategoriji.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, i) => (
            <ArticleCard key={article.id} article={article} priority={i < 3} />
          ))}
        </div>
      )}
    </div>
  )
}
