import { MetadataRoute } from 'next'
import { getAllArticles } from '@/lib/articles'
import { CATEGORY_LABELS } from '@/types'
import { SITE_URL } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getAllArticles()
  const categories = Object.keys(CATEGORY_LABELS)

  const articleUrls: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}/vest/${article.slug}`,
    lastModified: new Date(article.updated_at),
    changeFrequency: 'daily',
    priority: article.featured ? 0.9 : 0.7,
  }))

  const categoryUrls: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/kategorija/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'hourly',
    priority: 0.8,
  }))

  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'always', priority: 1 },
    { url: `${SITE_URL}/privatnost`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/uslovi`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ...categoryUrls,
    ...articleUrls,
  ]
}
