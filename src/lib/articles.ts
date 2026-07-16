import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { createHash } from 'crypto'
import type { Article, Category, User } from '@/types'

type ArticleRow = {
  id: string
  slug: string
  title: string
  subtitle: string | null
  content: string
  excerpt: string
  category: Category
  image_url: string
  image_alt: string
  author_id: string | null
  published: boolean
  published_at: string | null
  scheduled_at: string | null
  breaking: boolean
  featured: boolean
  trending: boolean
  views: number
  seo_title: string | null
  seo_description: string | null
  og_image: string | null
  tags: string[] | null
  related_ids: string[] | null
  created_at: string
  updated_at: string
  author: {
    id: string
    full_name: string
    avatar_url: string | null
    role: User['role']
  } | null
}

function mapArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    content: row.content,
    excerpt: row.excerpt,
    category: row.category,
    image_url: row.image_url,
    image_alt: row.image_alt,
    author_id: row.author_id ?? '',
    author: row.author
      ? {
          id: row.author.id,
          email: '',
          full_name: row.author.full_name,
          role: row.author.role,
          avatar_url: row.author.avatar_url ?? undefined,
          created_at: row.created_at,
        }
      : undefined,
    published: row.published,
    published_at: row.published_at ?? undefined,
    scheduled_at: row.scheduled_at ?? undefined,
    breaking: row.breaking,
    featured: row.featured,
    trending: row.trending,
    views: row.views,
    seo_title: row.seo_title ?? undefined,
    seo_description: row.seo_description ?? undefined,
    og_image: row.og_image ?? undefined,
    tags: row.tags ?? [],
    related_ids: row.related_ids ?? [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

const ARTICLE_SELECT = `
  id, slug, title, subtitle, content, excerpt, category, image_url, image_alt,
  author_id, published, published_at, scheduled_at, breaking, featured, trending,
  views, seo_title, seo_description, og_image, tags, related_ids, created_at, updated_at,
  author:profiles ( id, full_name, avatar_url, role )
`

export async function getAllArticles(): Promise<Article[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('published', true)
    .order('published_at', { ascending: false })

  if (error || !data) return []
  return (data as unknown as ArticleRow[]).map(mapArticle)
}

export async function getFeaturedArticles(): Promise<Article[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('published', true)
    .eq('featured', true)
    .order('published_at', { ascending: false })
    .limit(5)

  if (error || !data) return []
  return (data as unknown as ArticleRow[]).map(mapArticle)
}

export async function getBreakingArticles(): Promise<Article[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('published', true)
    .eq('breaking', true)
    .order('published_at', { ascending: false })

  if (error || !data) return []
  return (data as unknown as ArticleRow[]).map(mapArticle)
}

export async function getTrendingArticles(limit = 6): Promise<Article[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('published', true)
    .eq('trending', true)
    .order('views', { ascending: false })
    .limit(limit)

  if (error || !data) return []
  return (data as unknown as ArticleRow[]).map(mapArticle)
}

export async function getMostReadArticles(limit = 5): Promise<Article[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('published', true)
    .order('views', { ascending: false })
    .limit(limit)

  if (error || !data) return []
  return (data as unknown as ArticleRow[]).map(mapArticle)
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (error || !data) return undefined
  return mapArticle(data as unknown as ArticleRow)
}

export async function getArticlesByCategory(category: Category, limit?: number): Promise<Article[]> {
  const supabase = await createClient()
  let query = supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('published', true)
    .eq('category', category)
    .order('published_at', { ascending: false })

  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error || !data) return []
  return (data as unknown as ArticleRow[]).map(mapArticle)
}

export async function getRelatedArticles(article: Article, limit = 3): Promise<Article[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('published', true)
    .eq('category', article.category)
    .neq('id', article.id)
    .order('views', { ascending: false })
    .limit(limit)

  if (error || !data) return []
  return (data as unknown as ArticleRow[]).map(mapArticle)
}

export async function searchArticles(query: string): Promise<Article[]> {
  const supabase = await createClient()

  // Bezbednosna mera: karakteri koji imaju posebno značenje u PostgREST filter
  // sintaksi (,()."*) se uklanjaju iz korisničkog unosa pre ubacivanja u .or() filter,
  // da niko ne bi mogao da ubaci dodatne/izmenjene filter uslove kroz pretragu.
  const safeQuery = query.replace(/[,()."'*]/g, '').trim()
  if (!safeQuery) return []

  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('published', true)
    .or(`title.ilike.%${safeQuery}%,excerpt.ilike.%${safeQuery}%`)
    .order('published_at', { ascending: false })

  if (error || !data) return []
  return (data as unknown as ArticleRow[]).map(mapArticle)
}

export async function getLatestArticles(limit = 10): Promise<Article[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []
  return (data as unknown as ArticleRow[]).map(mapArticle)
}

export async function getArticlesByAuthor(authorId: string): Promise<Article[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('published', true)
    .eq('author_id', authorId)
    .order('published_at', { ascending: false })

  if (error || !data) return []
  return (data as unknown as ArticleRow[]).map(mapArticle)
}

/**
 * Beleži pregled vesti (uveća views + upisuje red u article_views za analitiku).
 * IP adresa se hešuje pre snimanja — ne čuvamo je u čitljivom obliku.
 * Radi preko RPC funkcije (increment_article_views) koja bezbedno zaobilazi RLS
 * samo za ovu jednu, kontrolisanu operaciju.
 */
export async function recordArticleView(articleId: string): Promise<void> {
  try {
    const supabase = await createClient()
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'
    const ipHash = createHash('sha256').update(ip).digest('hex')

    await supabase.rpc('increment_article_views', {
      p_article_id: articleId,
      p_ip_hash: ipHash,
      p_user_agent: userAgent,
    })
  } catch {
    // Brojanje pregleda ne sme da obori prikaz vesti ako nešto pođe po zlu
  }
}
