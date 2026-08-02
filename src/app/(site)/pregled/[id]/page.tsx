import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { AlertTriangle } from 'lucide-react'
import { getArticleByIdForPreview } from '@/lib/articles'
import { embedRichContent } from '@/lib/embed-content'
import { sanitizeArticleContent } from '@/lib/sanitize-content'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types'
import { cn, formatDateTime, readingTime } from '@/lib/utils'

interface Props {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const article = await getArticleByIdForPreview(id)
  return {
    title: article ? `Pregled: ${article.title}` : 'Pregled nije pronađen',
    // Namerno NIKAD ne indeksiraj — ovo je privatan link za pregled, ne javna stranica.
    robots: { index: false, follow: false, nocache: true },
  }
}

export default async function PreviewPage({ params }: Props) {
  const { id } = await params
  const article = await getArticleByIdForPreview(id)
  if (!article) notFound()

  const categoryLabel = CATEGORY_LABELS[article.category]
  const categoryColor = CATEGORY_COLORS[article.category]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Baner koji jasno oznacava da je ovo privatan pregled, ne prava stranica */}
      <div className="bg-amber-500 text-white text-sm font-semibold py-2.5 px-4 text-center flex items-center justify-center gap-2">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        {article.published
          ? 'Ovo je link za pregled — vest je već objavljena i vidljiva na sajtu.'
          : 'PREGLED — ova vest je JOŠ UVEK NACRT i nije objavljena. Ovaj link ne treba deliti javno.'}
      </div>

      <article className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-2 mb-3">
          <span className={cn('category-badge', categoryColor)}>{categoryLabel}</span>
        </div>

        <h1 className="font-headline font-black text-3xl md:text-4xl leading-tight mb-3 text-balance">
          {article.title}
        </h1>

        {article.subtitle && (
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            {article.subtitle}
          </p>
        )}

        <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            {article.author?.full_name || 'Redakcija'}
          </span>
          {article.published_at && <span>{formatDateTime(article.published_at)}</span>}
          <span>· {readingTime(article.content)} min čitanja</span>
        </div>

        {article.image_url && (
          <figure className="mb-6">
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <Image src={article.image_url} alt={article.image_alt} fill sizes="800px" className="object-cover" />
            </div>
            <figcaption className="text-xs text-gray-500 mt-2 text-center italic">
              {article.image_alt}
              {article.image_source && <span className="not-italic"> — Izvor: {article.image_source}</span>}
            </figcaption>
          </figure>
        )}

        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: embedRichContent(sanitizeArticleContent(article.content)) }}
        />
      </article>
    </div>
  )
}
