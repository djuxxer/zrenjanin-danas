import { MetadataRoute } from 'next'
import { getAllArticles } from '@/lib/articles'
import { CATEGORY_LABELS } from '@/types'
import { SITE_URL } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getAllArticles()
  const categories = Object.keys(CATEGORY_LABELS)

  const articleUrls: MetadataRoute.Sitemap = articles.map((article) => {
    const updated = article.updated_at ? new Date(article.updated_at) : new Date()
    return {
      url: `${SITE_URL}/vest/${article.slug}`,
      lastModified: isNaN(updated.getTime()) ? new Date() : updated,
      changeFrequency: 'daily',
      priority: article.naslovna_velika ? 0.9 : 0.7,
    }
  })

  const categoryUrls: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/kategorija/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'hourly',
    priority: 0.8,
  }))

  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'always', priority: 1 },
    { url: `${SITE_URL}/o-nama`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/impresum`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/kontakt`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
    { url: `${SITE_URL}/oglasavanje`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/privatnost`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/uslovi`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ...categoryUrls,
    ...articleUrls,
  ]
}
