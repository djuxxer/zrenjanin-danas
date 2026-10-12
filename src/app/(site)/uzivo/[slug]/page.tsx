import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getLiveBundleBySlug } from '@/lib/live'
import { LiveView } from '@/components/live/live-view'
import { SITE_NAME, SITE_URL, truncate } from '@/lib/utils'

interface Props {
  params: Promise<{ slug: string }>
}

// Podaci se stalno menjaju tokom prenosa — nema keširanja
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const bundle = await getLiveBundleBySlug(slug)
  if (!bundle) return { title: 'Nije pronađeno' }

  const { blog } = bundle
  const description = blog.description || `Pratite uživo: ${blog.title}`
  return {
    title: `${blog.title} — UŽIVO`,
    description,
    openGraph: {
      title: blog.title,
      description,
      type: 'article',
      url: `${SITE_URL}/uzivo/${slug}`,
      siteName: SITE_NAME,
      publishedTime: blog.created_at,
      modifiedTime: blog.updated_at,
    },
    twitter: { card: 'summary_large_image', title: blog.title, description },
    alternates: { canonical: `${SITE_URL}/uzivo/${slug}` },
  }
}

export default async function LiveBlogPage({ params }: Props) {
  const { slug } = await params
  const bundle = await getLiveBundleBySlug(slug)
  if (!bundle) notFound()

  const { blog, entries } = bundle
  const url = `${SITE_URL}/uzivo/${slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LiveBlogPosting',
    headline: blog.title,
    description: blog.description || blog.title,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    coverageStartTime: blog.created_at,
    ...(blog.ended_at ? { coverageEndTime: blog.ended_at } : {}),
    datePublished: blog.created_at,
    dateModified: blog.updated_at,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    liveBlogUpdate: entries.slice(0, 50).map((e) => ({
      '@type': 'BlogPosting',
      headline: e.title || truncate(e.body.replace(/\s+/g, ' '), 100),
      datePublished: e.created_at,
      dateModified: e.updated_at,
      articleBody: e.body,
      ...(e.image_url ? { image: e.image_url } : {}),
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4" aria-label="Putanja">
          <Link href="/" className="hover:text-brand-red">Početna</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/uzivo" className="hover:text-brand-red">Uživo</Link>
        </nav>
        <LiveView initial={bundle} />
      </div>
    </>
  )
}
