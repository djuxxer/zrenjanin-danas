'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Eye, FileText, Users, TrendingUp, PlusCircle, Edit, Trash2, AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CATEGORY_LABELS, type Category } from '@/types'

interface ArticleRow {
  id: string
  slug: string
  title: string
  category: Category
  views: number
  published: boolean
  breaking: boolean
  created_at: string
}

export default function AdminDashboard() {
  const [articles, setArticles] = useState<ArticleRow[]>([])
  const [userCount, setUserCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const supabase = createClient()

    const [{ data: articleData }, usersRes] = await Promise.all([
      supabase
        .from('articles')
        .select('id, slug, title, category, views, published, breaking, created_at')
        .order('created_at', { ascending: false }),
      fetch('/api/uprava-x7k2/users').then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ])

    setArticles(articleData ?? [])
    setUserCount(usersRes?.users?.length ?? null)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Obrisati vest "${title}"?`)) return
    setDeletingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('articles').delete().eq('id', id)
    setDeletingId(null)
    if (error) return alert('Greška: ' + error.message)
    setArticles((prev) => prev.filter((a) => a.id !== id))
  }

  const totalViews = articles.reduce((sum, a) => sum + a.views, 0)
  const trendingCount = articles.filter((a) => a.published).length
  const breakingArticles = articles.filter((a) => a.breaking && a.published)
  const recent = articles.slice(0, 5)

  const STATS = [
    { label: 'Ukupno vesti', value: articles.length.toLocaleString('sr-RS'), icon: FileText, color: 'bg-blue-500' },
    { label: 'Ukupno pregleda', value: totalViews.toLocaleString('sr-RS'), icon: Eye, color: 'bg-green-500' },
    { label: 'Korisnici', value: userCount !== null ? userCount.toLocaleString('sr-RS') : '—', icon: Users, color: 'bg-purple-500' },
    { label: 'Objavljene vesti', value: trendingCount.toLocaleString('sr-RS'), icon: TrendingUp, color: 'bg-orange-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline font-black text-2xl text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Pregled portala Zrenjanin Danas</p>
        </div>
        <Link
          href="/uprava-x7k2/articles/new"
          className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Nova vest
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
                    <div className={`${stat.color} p-2 rounded-lg`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="font-headline font-black text-2xl text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              )
            })}
          </div>

          {/* Breaking news alert */}
          {breakingArticles.length > 0 && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-brand-red flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-sm text-red-800 dark:text-red-200">
                  {breakingArticles.length} {breakingArticles.length === 1 ? 'aktivna BREAKING vest' : 'aktivne BREAKING vesti'}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 truncate">
                  {breakingArticles.map((a) => a.title).join(' • ')}
                </p>
              </div>
              <Link href="/uprava-x7k2/articles" className="ml-auto text-xs text-brand-red font-semibold hover:underline flex-shrink-0">
                Upravljaj →
              </Link>
            </div>
          )}

          {/* Recent articles */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="font-bold text-sm uppercase tracking-wide text-gray-500">Nedavne vesti</h2>
              <Link href="/uprava-x7k2/articles" className="text-xs text-brand-red font-semibold hover:underline">
                Sve vesti
              </Link>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {recent.map((article) => (
                <div key={article.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">{article.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">{CATEGORY_LABELS[article.category]}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Eye className="w-3 h-3" />{article.views.toLocaleString('sr-RS')}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      article.published
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    }`}
                  >
                    {article.published ? 'objavljeno' : 'nacrt'}
                  </span>
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/uprava-x7k2/articles/${article.id}/edit`}
                      className="p-1.5 hover:text-brand-red transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(article.id, article.title)}
                      disabled={deletingId === article.id}
                      className="p-1.5 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-50"
                    >
                      {deletingId === article.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
              {recent.length === 0 && (
                <div className="text-center py-12 text-gray-500 text-sm">Još uvek nema vesti.</div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Statistika i učinak novinara', href: '/uprava-x7k2/stats', desc: 'Pregledi kroz vreme, top vesti, učinak po novinaru' },
              { label: 'Komentari', href: '/uprava-x7k2/comments', desc: 'Odobri ili obriši komentare čitalaca' },
              { label: 'Podešavanja', href: '/uprava-x7k2/settings', desc: 'Osnovna podešavanja portala' },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:border-brand-red transition-colors group"
              >
                <h3 className="font-semibold text-sm group-hover:text-brand-red transition-colors">{action.label}</h3>
                <p className="text-xs text-gray-500 mt-1">{action.desc}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
