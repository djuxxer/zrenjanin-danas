import Link from 'next/link'
import Image from 'next/image'
import { TrendingUp, BarChart2, Flame } from 'lucide-react'
import type { Article } from '@/types'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types'
import { cn, timeAgo } from '@/lib/utils'
import { ArticleCard } from '@/components/article/article-card'

interface TrendingSectionProps {
  articles: Article[]
}

export function TrendingSection({ articles }: TrendingSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="bg-brand-red px-4 py-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-white" />
        <h2 className="text-white font-bold text-sm uppercase tracking-widest">Trending</h2>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {articles.slice(0, 6).map((article, i) => (
          <Link
            key={article.id}
            href={`/vest/${article.slug}`}
            className="group flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <span className="font-headline font-black text-3xl text-gray-200 dark:text-gray-700 leading-none w-8 flex-shrink-0 pt-1">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <span className={cn('category-badge text-[10px] mb-1', CATEGORY_COLORS[article.category])}>
                {CATEGORY_LABELS[article.category]}
              </span>
              <h3 className="font-headline font-semibold text-sm leading-snug line-clamp-2 group-hover:text-brand-red transition-colors">
                {article.title}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <Flame className="w-3 h-3 text-brand-red" />
                <span className="text-xs text-gray-500">{article.views.toLocaleString('sr-RS')} pregleda</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

interface MostReadProps {
  articles: Article[]
}

export function MostReadSection({ articles }: MostReadProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="bg-gray-900 dark:bg-gray-800 px-4 py-3 flex items-center gap-2">
        <BarChart2 className="w-4 h-4 text-white" />
        <h2 className="text-white font-bold text-sm uppercase tracking-widest">Najčitanije</h2>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {articles.slice(0, 5).map((article, i) => (
          <Link
            key={article.id}
            href={`/vest/${article.slug}`}
            className="group flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <span className="font-headline font-black text-2xl text-brand-red leading-none w-7 flex-shrink-0 pt-1">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="font-headline font-semibold text-sm leading-snug line-clamp-2 group-hover:text-brand-red transition-colors">
                {article.title}
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(article.published_at!)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

interface CategoryGridProps {
  title: string
  articles: Article[]
}

export function CategoryGrid({ title, articles }: CategoryGridProps) {
  if (!articles.length) return null
  const [first, ...rest] = articles

  return (
    <section className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-6 bg-brand-red rounded-full" />
        <h2 className="font-headline font-bold text-xl">{title}</h2>
        <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <ArticleCard article={first} />
        </div>
        <div className="lg:col-span-2 space-y-3">
          {rest.slice(0, 4).map((article) => (
            <ArticleCard key={article.id} article={article} variant="horizontal" />
          ))}
        </div>
      </div>
    </section>
  )
}
