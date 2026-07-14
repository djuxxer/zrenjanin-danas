'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PlusCircle, Edit, Trash2, Eye, Search, Filter, ChevronDown, Loader2 } from 'lucide-react'
import { CATEGORY_LABELS, CATEGORY_COLORS, type Category } from '@/types'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface ArticleRow {
  id: string
  slug: string
  title: string
  category: Category
  published: boolean
  breaking: boolean
  featured: boolean
  views: number
}

const STATUS_MAP = {
  objavljeno: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  nacrt: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
}

export default function AdminArticlesPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [articles, setArticles] = useState<ArticleRow[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function loadArticles() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('articles')
      .select('id, slug, title, category, published, breaking, featured, views')
      .order('created_at', { ascending: false })
    setArticles(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadArticles()
  }, [])

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Da li sigurno želiš da obrišeš vest "${title}"? Ova akcija je nepovratna.`)) return
    setDeletingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('articles').delete().eq('id', id)
    setDeletingId(null)
    if (error) {
      alert('Greška prilikom brisanja: ' + error.message)
      return
    }
    setArticles((prev) => prev.filter((a) => a.id !== id))
  }

  const filtered = articles.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'all' || a.category === categoryFilter
    return matchSearch && matchCat
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline font-black text-2xl text-gray-900 dark:text-white">Vesti</h1>
          <p className="text-gray-500 text-sm">{articles.length} ukupno vesti</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Nova vest
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Pretraži vesti..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-brand-red"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-9 pr-8 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-brand-red appearance-none"
          >
            <option value="all">Sve kategorije</option>
            {Object.entries(CATEGORY_LABELS).map(([slug, label]) => (
              <option key={slug} value={slug}>{label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Articles table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Naslov</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Kategorija</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Pregledi</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {article.breaking && (
                          <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase">Breaking</span>
                        )}
                        {article.featured && (
                          <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold uppercase">Featured</span>
                        )}
                        <span className="font-medium text-gray-900 dark:text-white line-clamp-1 max-w-xs">{article.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('category-badge text-[10px]', CATEGORY_COLORS[article.category])}>
                        {CATEGORY_LABELS[article.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', article.published ? STATUS_MAP.objavljeno : STATUS_MAP.nacrt)}>
                        {article.published ? 'objavljeno' : 'nacrt'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="flex items-center justify-end gap-1 text-gray-500">
                        <Eye className="w-3 h-3" />
                        {article.views.toLocaleString('sr-RS')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/vest/${article.slug}`}
                          target="_blank"
                          className="p-1.5 hover:text-blue-600 transition-colors rounded hover:bg-blue-50 dark:hover:bg-blue-950/20"
                          title="Pogledaj"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          className="p-1.5 hover:text-brand-red transition-colors rounded hover:bg-red-50 dark:hover:bg-red-950/20"
                          title="Uredi"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(article.id, article.title)}
                          disabled={deletingId === article.id}
                          className="p-1.5 hover:text-red-600 transition-colors rounded hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-50"
                          title="Obriši"
                        >
                          {deletingId === article.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Nema vesti koje odgovaraju filteru.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function FileText({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
}

