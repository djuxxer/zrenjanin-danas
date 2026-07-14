import { DEMO_ARTICLES } from '@/lib/demo-data'
import type { Article, Category } from '@/types'

let cache: Article[] | null = null

function getDemoArticlesFull(): Article[] {
  if (cache) return cache
  cache = DEMO_ARTICLES.map((a, i) => ({
    ...a,
    id: `demo-${i + 1}`,
    author_id: 'demo-author',
    author: {
      id: 'demo-author',
      email: 'redakcija@zrenjanindanas.rs',
      full_name: 'Redakcija Zrenjanin Danas',
      role: 'novinar' as const,
      created_at: new Date().toISOString(),
    },
    created_at: a.published_at || new Date().toISOString(),
    updated_at: a.published_at || new Date().toISOString(),
  }))
  return cache
}

export function demoFeatured(): Article[] {
  return getDemoArticlesFull().filter((a) => a.published && a.featured).slice(0, 5)
}

export function demoTrending(limit = 6): Article[] {
  return getDemoArticlesFull()
    .filter((a) => a.published && a.trending)
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
}

export function demoMostRead(limit = 5): Article[] {
  return getDemoArticlesFull()
    .filter((a) => a.published)
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
}

export function demoLatest(limit = 12): Article[] {
  return getDemoArticlesFull()
    .filter((a) => a.published)
    .sort((a, b) => new Date(b.published_at!).getTime() - new Date(a.published_at!).getTime())
    .slice(0, limit)
}

export function demoByCategory(category: Category, limit?: number): Article[] {
  const filtered = getDemoArticlesFull()
    .filter((a) => a.published && a.category === category)
    .sort((a, b) => new Date(b.published_at!).getTime() - new Date(a.published_at!).getTime())
  return limit ? filtered.slice(0, limit) : filtered
}
