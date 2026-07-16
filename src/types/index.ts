export type Category =
  | 'politika'
  | 'drustvo'
  | 'hronika'
  | 'sport'
  | 'kultura'
  | 'ekonomija'
  | 'zrenjanin'

export type UserRole = 'admin' | 'novinar'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  created_at: string
}

export interface Article {
  id: string
  slug: string
  title: string
  subtitle?: string
  content: string
  excerpt: string
  category: Category
  image_url: string
  image_alt: string
  author_id: string
  author?: User
  published: boolean
  published_at?: string
  scheduled_at?: string
  breaking: boolean
  featured: boolean
  trending: boolean
  views: number
  seo_title?: string
  seo_description?: string
  og_image?: string
  tags: string[]
  related_ids: string[]
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  article_id: string
  author_name: string
  author_email: string
  content: string
  approved: boolean
  created_at: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  active: boolean
  created_at: string
}

export type CategoryLabel = {
  [K in Category]: string
}

export const CATEGORY_LABELS: CategoryLabel = {
  politika: 'Politika',
  drustvo: 'Društvo',
  hronika: 'Hronika',
  sport: 'Sport',
  kultura: 'Kultura',
  ekonomija: 'Ekonomija',
  zrenjanin: 'Zrenjanin',
}

export const CATEGORY_COLORS: Record<Category, string> = {
  politika: 'bg-red-600',
  drustvo: 'bg-blue-600',
  hronika: 'bg-gray-700',
  sport: 'bg-green-600',
  kultura: 'bg-purple-600',
  ekonomija: 'bg-yellow-600',
  zrenjanin: 'bg-brand-red',
}
