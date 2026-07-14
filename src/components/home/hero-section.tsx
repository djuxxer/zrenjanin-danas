import Link from 'next/link'
import { ArticleCard } from '@/components/article/article-card'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types'
import { cn, timeAgo } from '@/lib/utils'
import type { Article } from '@/types'

interface HeroSectionProps {
  featured: Article[]
  latest: Article[]
}

export function HeroSection({ featured, latest }: HeroSectionProps) {
  const [main, ...secondary] = featured
  const sideCards = (secondary.length > 0 ? secondary : latest.filter((a) => a.id !== main?.id)).slice(0, 2)
  const sideLatest = latest.filter((a) => a.id !== main?.id && !sideCards.find((s) => s.id === a.id)).slice(0, 3)

  if (!main) return null

  return (
    <section className="container mx-auto px-4 py-6">
      {/* Hero row — fixed height so both columns are equal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[520px]">

        {/* Main hero */}
        <Link
          href={`/vest/${main.slug}`}
          className="lg:col-span-2 group relative rounded-xl overflow-hidden block h-full"
        >
          <img
            src={main.image_url}
            alt={main.image_alt}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            {main.breaking && (
              <span className="breaking-badge inline-block mb-3">BREAKING</span>
            )}
            <span className={cn('category-badge mb-3 inline-block', CATEGORY_COLORS[main.category])}>
              {CATEGORY_LABELS[main.category]}
            </span>
            <h2 className="text-white font-headline font-bold text-2xl md:text-4xl leading-tight mb-2 group-hover:text-red-200 transition-colors">
              {main.title}
            </h2>
            {main.subtitle && (
              <p className="text-gray-200 text-sm md:text-base line-clamp-2 mb-2">{main.subtitle}</p>
            )}
            <p className="text-gray-400 text-xs">{timeAgo(main.published_at!)}</p>
          </div>
        </Link>

        {/* Side column — two cards, each exactly half the height */}
        <div className="flex flex-col gap-4 h-full">
          {sideCards.map((article) => (
            <Link
              key={article.id}
              href={`/vest/${article.slug}`}
              className="group relative rounded-xl overflow-hidden block h-1/2"
            >
              <img
                src={article.image_url}
                alt={article.image_alt}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className={cn('category-badge text-[10px] mb-1.5 inline-block', CATEGORY_COLORS[article.category])}>
                  {CATEGORY_LABELS[article.category]}
                </span>
                <h3 className="text-white font-headline font-bold text-sm leading-snug line-clamp-3 group-hover:text-red-200 transition-colors">
                  {article.title}
                </h3>
                <p className="text-gray-400 text-xs mt-1">{timeAgo(article.published_at!)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Second row */}
      {sideLatest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {sideLatest.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </section>
  )
}
