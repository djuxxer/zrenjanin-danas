import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Eye, Share2, Facebook, Twitter, Linkedin, ChevronRight } from 'lucide-react'
import { getArticleBySlug, getRelatedArticles, recordArticleView } from '@/lib/articles'
import { getApprovedComments } from '@/lib/comments'
import { embedRichContent } from '@/lib/embed-content'
import { sanitizeArticleContent } from '@/lib/sanitize-content'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types'
import { cn, formatDateTime, readingTime, SITE_NAME, SITE_URL } from '@/lib/utils'
import { ArticleCard } from '@/components/article/article-card'
import { CommentsSection } from '@/components/article/comments-section'
import { ReadingProgress } from '@/components/article/reading-progress'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ slug: string }>
}

// Vesti se renderuju dinamički po zahtevu (sadržaj se stalno menja preko Supabase-a),
// pa ne generišemo statičke putanje unapred pri build-u.
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return { title: 'Nije pronađeno' }

  const title = article.seo_title || article.title
  const description = article.seo_description || article.excerpt
  const ogImage = article.og_image || article.image_url

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${SITE_URL}/vest/${slug}`,
      siteName: SITE_NAME,
      publishedTime: article.published_at,
      authors: [article.author?.full_name || 'Redakcija'],
      images: [{ url: ogImage, width: 1200, height: 630, alt: article.image_alt }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: { canonical: `${SITE_URL}/vest/${slug}` },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) notFound()

  // Beleži pregled pre prikaza (brz upis, ne oslanjamo se na "fire and forget")
  await recordArticleView(article.id)
  article.views += 1

  const related = await getRelatedArticles(article)
  const comments = await getApprovedComments(article.id)

  const supabaseForSettings = await createClient()
  const { data: siteSettings } = await supabaseForSettings
    .from('site_settings')
    .select('facebook_url, instagram_url, twitter_url')
    .eq('id', 1)
    .maybeSingle()

  const sameAs = [siteSettings?.facebook_url, siteSettings?.instagram_url, siteSettings?.twitter_url].filter(
    (url): url is string => Boolean(url)
  )
  const categoryLabel = CATEGORY_LABELS[article.category]
  const categoryColor = CATEGORY_COLORS[article.category]
  const articleUrl = `${SITE_URL}/vest/${slug}`

  // JSON-LD schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    image: article.image_url,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: {
      '@type': 'Person',
      name: article.author?.full_name || 'Redakcija',
      ...(article.author_id ? { url: `${SITE_URL}/autor/${article.author_id}` } : {}),
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
      ...(sameAs.length > 0 ? { sameAs } : {}),
    },
    url: articleUrl,
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
  }

  // BreadcrumbList schema
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Početna', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: categoryLabel,
        item: `${SITE_URL}/kategorija/${article.category}`,
      },
      { '@type': 'ListItem', position: 3, name: article.title, item: articleUrl },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <ReadingProgress targetId="article-body" />

      <article className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-brand-red transition-colors">Početna</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/kategorija/${article.category}`} className="hover:text-brand-red transition-colors capitalize">
            {categoryLabel}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700 dark:text-gray-300 line-clamp-1">{article.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Article content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <header className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                {article.breaking && (
                  <span className="breaking-badge">HITNO</span>
                )}
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

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 pb-4 border-b border-gray-200 dark:border-gray-800">
                {article.author_id ? (
                  <Link
                    href={`/autor/${article.author_id}`}
                    className="font-semibold text-gray-700 dark:text-gray-200 hover:text-brand-red transition-colors"
                  >
                    {article.author?.full_name || 'Redakcija'}
                  </Link>
                ) : (
                  <span className="font-semibold text-gray-700 dark:text-gray-200">Redakcija</span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDateTime(article.published_at!)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {article.views.toLocaleString('sr-RS')} pregleda
                </span>
                <span>{readingTime(article.content)} min čitanja</span>
              </div>
            </header>

            {/* Hero image */}
            <figure className="mb-6">
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden">
                <Image
                  src={article.image_url}
                  alt={article.image_alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-cover"
                  priority
                />
              </div>
              <figcaption className="text-xs text-gray-500 mt-2 text-center italic">
                {article.image_alt}
              </figcaption>
            </figure>

            {/* Article body */}
            <div
              id="article-body"
              className="article-content mb-8"
              dangerouslySetInnerHTML={{ __html: embedRichContent(sanitizeArticleContent(article.content)) }}
            />

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                <span className="text-sm font-semibold text-gray-500">Tagovi:</span>
                {article.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/pretraga?q=${encodeURIComponent(tag)}`}
                    className="text-sm bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-brand-red px-3 py-1 rounded-full transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Share */}
            <div className="flex items-center gap-3 mb-8">
              <Share2 className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-500">Podelite:</span>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#1877F2] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#1465D2] transition-colors"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(article.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Twitter className="w-4 h-4" />X
              </a>
            </div>

            {/* Comments */}
            <CommentsSection articleId={article.id} initialComments={comments} />
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            {related.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 bg-brand-red rounded-full" />
                  <h3 className="font-bold text-sm uppercase tracking-wide">Povezane vesti</h3>
                </div>
                <div className="space-y-3">
                  {related.map((a) => (
                    <ArticleCard key={a.id} article={a} variant="horizontal" />
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </article>
    </>
  )
}
