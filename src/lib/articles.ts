import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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
  image_source: string | null
  author_id: string | null
  published: boolean
  published_at: string | null
  scheduled_at: string | null
  naslovna_velika: boolean
  naslovna_mala: boolean
  traka_gore: boolean
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
    image_source: row.image_source ?? undefined,
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
    naslovna_velika: row.naslovna_velika,
    naslovna_mala: row.naslovna_mala,
    traka_gore: row.traka_gore,
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
  id, slug, title, subtitle, content, excerpt, category, image_url, image_alt, image_source,
  author_id, published, published_at, scheduled_at, naslovna_velika, naslovna_mala, traka_gore,
  views, seo_title, seo_description, og_image, tags, related_ids, created_at, updated_at,
  author:profiles!articles_author_id_fkey ( id, full_name, avatar_url, role )
`

export async function getAllArticles(): Promise<Article[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('published', true)
    .is('deleted_at', null)
    .order('published_at', { ascending: false })

  if (error || !data) return []
  return (data as unknown as ArticleRow[]).map(mapArticle)
}

/**
 * Vesti objavljene u poslednja 48 sata — koristi se ISKLJUČIVO za Google News
 * sitemap, koji po Google-ovim pravilima sme da sadrži samo vesti iz tog
 * vremenskog okvira (stariji članci se moraju ukloniti iz news sitemap-a,
 * regularni sitemap i dalje nosi sve vesti bez vremenskog ograničenja).
 */
export async function getRecentArticlesForNewsSitemap(): Promise<Article[]> {
  const supabase = await createClient()
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('published', true)
    .is('deleted_at', null)
    .gte('published_at', twoDaysAgo)
    .order('published_at', { ascending: false })

  if (error || !data) return []
  return (data as unknown as ArticleRow[]).map(mapArticle)
}

export async function getNaslovnaVelika(): Promise<Article[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('published', true)
    .is('deleted_at', null)
    .eq('naslovna_velika', true)
    .order('published_at', { ascending: false })
    .limit(3)

  if (error || !data) return []
  return (data as unknown as ArticleRow[]).map(mapArticle)
}

export async function getNaslovnaMala(): Promise<Article[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('published', true)
    .is('deleted_at', null)
    .eq('naslovna_mala', true)
    .order('published_at', { ascending: false })
    .limit(4)

  if (error || !data) return []
  return (data as unknown as ArticleRow[]).map(mapArticle)
}

export async function getTrakaGore(): Promise<Article[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('published', true)
    .is('deleted_at', null)
    .eq('traka_gore', true)
    .order('published_at', { ascending: false })
    .limit(5)

  if (error || !data) return []
  return (data as unknown as ArticleRow[]).map(mapArticle)
}

// "Popularno" ide isključivo po pravim pregledima (views), bez ručne oznake —
// ne postoji vise "trending" flag, ovo je stvarna popularnost.
export async function getTrendingArticles(limit = 6): Promise<Article[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('published', true)
    .is('deleted_at', null)
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
    .is('deleted_at', null)
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
    .is('deleted_at', null)
    .maybeSingle()

  if (error || !data) return undefined
  return mapArticle(data as unknown as ArticleRow)
}

/**
 * Dohvata vest po ID-u za PREGLED, bez obzira na status objave (nacrt ili objavljena).
 * Koristi se isključivo za privatne "link za pregled" — ID (UUID) je dovoljno
 * nepogodiv da služi kao neformalan pristupni ključ, ne pojavljuje se nigde
 * javno (sitemap, liste, pretraga) dok vest zvanično ne bude objavljena.
 * I dalje se poštuje meko brisanje — obrisana vest se ne može pregledati.
 *
 * Namerno koristi admin klijent (bypass RLS) SAMO za ovaj jedan, precizan upit
 * po tačnom ID-u — ne dodajemo šire RLS pravilo koje bi inače dozvolilo bilo
 * kome da direktnim API pozivom (mimo naše stranice) vidi SVE nacrte odjednom.
 */
export async function getArticleByIdForPreview(id: string): Promise<Article | undefined> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('id', id)
    .is('deleted_at', null)
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
    .is('deleted_at', null)
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
    .is('deleted_at', null)
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
    .is('deleted_at', null)
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
    .is('deleted_at', null)
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
    .is('deleted_at', null)
    .eq('author_id', authorId)
    .order('published_at', { ascending: false })

  if (error || !data) return []
  return (data as unknown as ArticleRow[]).map(mapArticle)
}

// Poznati botovi/crawleri koji ne treba da se broje kao pregledi vesti —
// SEO alati, AI asistenti, i botovi za generisanje "preview" prikaza kad se
// link deli na drustvenim mrezama (Facebook, itd.)
const BOT_PATTERNS = [
  'bot', 'crawl', 'spider', 'slurp', 'facebookexternalhit', 'whatsapp',
  'telegrambot', 'discordbot', 'linkedinbot', 'pinterest', 'redditbot',
  'mj12bot', 'ahrefsbot', 'semrushbot', 'seranking', 'dotbot', 'petalbot',
  'gptbot', 'claudebot', 'claude-searchbot', 'perplexitybot', 'anthropic',
  'ccbot', 'bytespider', 'yandex', 'baiduspider', 'googlebot',
  'headlesschrome', 'phantomjs', 'puppeteer', 'playwright',
]

function isLikelyBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase()
  // Golo "Google" (bez "bot") se takodje javlja kod nekih Google servisa/pregleda linkova
  if (ua === 'google' || ua.trim() === '') return true
  return BOT_PATTERNS.some((pattern) => ua.includes(pattern))
}

/**
 * Beleži pregled vesti (uveća views + upisuje red u article_views za analitiku).
 * IP adresa se hešuje pre snimanja — ne čuvamo je u čitljivom obliku.
 * Radi preko RPC funkcije (increment_article_views) koja bezbedno zaobilazi RLS
 * samo za ovu jednu, kontrolisanu operaciju.
 *
 * Poznati botovi/crawleri se PRESKAČU — ne uvećavaju broj pregleda, da statistika
 * odražava stvarne čitaoce, ne SEO alate i "preview" botove drustvenih mreza.
 */
export async function recordArticleView(articleId: string): Promise<void> {
  try {
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || 'unknown'

    if (isLikelyBot(userAgent)) return

    const supabase = await createClient()
    // Cloudflare salje pravu IP adresu posetioca u 'cf-connecting-ip' —
    // 'x-forwarded-for' iza Cloudflare-a moze da sadrzi promenljivu edge IP
    // adresu (razlicitu iz zahteva u zahtev), sto bi pokvarilo dedup po IP-ju.
    const ip =
      headersList.get('cf-connecting-ip') ||
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown'
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
