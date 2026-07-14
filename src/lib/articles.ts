import { DEMO_ARTICLES } from '@/lib/demo-data'
import type { Article, Category } from '@/types'

let articleCache: Article[] | null = null

function getArticles(): Article[] {
  if (articleCache) return articleCache
  articleCache = DEMO_ARTICLES.map((a, i) => ({
    ...a,
    id: `demo-${i + 1}`,
    author_id: 'demo-author',
    author: {
      id: 'demo-author',
      email: 'redakcija@banatskiglas.rs',
      full_name: 'Redakcija Banatski Glas',
      role: 'novinar' as const,
      created_at: new Date().toISOString(),
    },
    created_at: a.published_at || new Date().toISOString(),
    updated_at: a.published_at || new Date().toISOString(),
  }))
  return articleCache
}

export function getAllArticles(): Article[] {
  return getArticles().filter((a) => a.published)
}

export function getFeaturedArticles(): Article[] {
  return getArticles().filter((a) => a.published && a.featured).slice(0, 5)
}

export function getBreakingArticles(): Article[] {
  return getArticles().filter((a) => a.published && a.breaking)
}

export function getTrendingArticles(limit = 6): Article[] {
  return getArticles()
    .filter((a) => a.published && a.trending)
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
}

export function getMostReadArticles(limit = 5): Article[] {
  return getArticles()
    .filter((a) => a.published)
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
}

export function getArticleBySlug(slug: string): Article | undefined {
  return getArticles().find((a) => a.slug === slug && a.published)
}

export function getArticlesByCategory(category: Category, limit?: number): Article[] {
  const filtered = getArticles()
    .filter((a) => a.published && a.category === category)
    .sort((a, b) => new Date(b.published_at!).getTime() - new Date(a.published_at!).getTime())
  return limit ? filtered.slice(0, limit) : filtered
}

export function getRelatedArticles(article: Article, limit = 3): Article[] {
  return getArticles()
    .filter(
      (a) =>
        a.published &&
        a.id !== article.id &&
        (a.category === article.category ||
          a.tags.some((t) => article.tags.includes(t)))
    )
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
}

export function searchArticles(query: string): Article[] {
  const q = query.toLowerCase()
  return getArticles().filter(
    (a) =>
      a.published &&
      (a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)))
  )
}

export function getLatestArticles(limit = 10): Article[] {
  return getArticles()
    .filter((a) => a.published)
    .sort((a, b) => new Date(b.published_at!).getTime() - new Date(a.published_at!).getTime())
    .slice(0, limit)
}
