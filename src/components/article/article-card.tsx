import Link from 'next/link'
import Image from 'next/image'
import { Clock, Eye } from 'lucide-react'
import type { Article } from '@/types'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types'
import { cn, timeAgo, readingTime } from '@/lib/utils'

interface ArticleCardProps {
  article: Article
  variant?: 'default' | 'large' | 'horizontal' | 'minimal'
  className?: string
  priority?: boolean
}

export function ArticleCard({ article, variant = 'default', className, priority = false }: ArticleCardProps) {
  const categoryLabel = CATEGORY_LABELS[article.category]
  const categoryColor = CATEGORY_COLORS[article.category]

  if (variant === 'large') {
    return (
      <Link href={`/vest/${article.slug}`} className={cn('group relative block rounded-xl overflow-hidden', className)}>
        <div className="relative aspect-[16/9] md:aspect-[21/9]">
          <Image
            src={article.image_url}
            alt={article.image_alt}
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <span className={cn('category-badge mb-3 inline-block', categoryColor)}>
            {categoryLabel}
          </span>
          <h2 className="text-white font-headline font-bold text-2xl md:text-4xl leading-tight mb-2 text-balance group-hover:text-red-200 transition-colors">
            {article.title}
          </h2>
          {article.subtitle && (
            <p className="text-gray-200 text-sm md:text-base line-clamp-2 mb-3">{article.subtitle}</p>
          )}
          <div className="flex items-center gap-4 text-gray-300 text-xs">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(article.published_at!)}</span>
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views.toLocaleString('sr-RS')}</span>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === 'horizontal') {
    return (
      <Link
        href={`/vest/${article.slug}`}
        className={cn('group flex gap-3 items-start hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg p-2 -mx-2 transition-colors', className)}
      >
        <div className="relative w-20 h-16 flex-shrink-0 rounded-md overflow-hidden">
          <Image
            src={article.image_url}
            alt={article.image_alt}
            fill
            sizes="80px"
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <div className="flex-1 min-w-0">
          <span className={cn('category-badge text-[10px] mb-1', categoryColor)}>{categoryLabel}</span>
          <h3 className="font-headline font-semibold text-sm leading-snug line-clamp-2 group-hover:text-brand-red transition-colors">
            {article.title}
          </h3>
          <span className="text-xs text-gray-600 dark:text-gray-400">{timeAgo(article.published_at!)}</span>
        </div>
      </Link>
    )
  }

  if (variant === 'minimal') {
    return (
      <Link
        href={`/vest/${article.slug}`}
        className={cn('group block border-b border-gray-100 dark:border-gray-800 pb-3 last:border-0 last:pb-0', className)}
      >
        <span className={cn('category-badge text-[10px] mb-1', categoryColor)}>{categoryLabel}</span>
        <h3 className="font-headline font-semibold text-sm leading-snug group-hover:text-brand-red transition-colors">
          {article.title}
        </h3>
        <span className="text-xs text-gray-600 dark:text-gray-400">{timeAgo(article.published_at!)}</span>
      </Link>
    )
  }

  // Default card
  return (
    <Link href={`/vest/${article.slug}`} className={cn('group block card-hover rounded-xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm', className)}>
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={article.image_url}
          alt={article.image_alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={priority}
        />
        <span className={cn('absolute bottom-2 left-2 category-badge', categoryColor)}>
          {categoryLabel}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-headline font-bold text-base leading-snug mb-2 group-hover:text-brand-red transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{article.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(article.published_at!)}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />{readingTime(article.content)} min čitanja
          </span>
        </div>
      </div>
    </Link>
  )
}
