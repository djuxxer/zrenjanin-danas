'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Eye, FileText, TrendingUp, Loader2, Trophy, ExternalLink, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CATEGORY_LABELS, CATEGORY_COLORS, type Category } from '@/types'
import { cn } from '@/lib/utils'

interface ArticleRow {
  id: string
  slug: string
  title: string
  category: Category
  views: number
  published: boolean
  author_id: string | null
  created_at: string
}

interface ProfileRow {
  id: string
  full_name: string
  role: 'admin' | 'novinar'
}

export default function AdminStatsPage() {
  const [articles, setArticles] = useState<ArticleRow[]>([])
  const [profiles, setProfiles] = useState<ProfileRow[]>([])
  const [viewsToday, setViewsToday] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const [rangeFrom, setRangeFrom] = useState('')
  const [rangeTo, setRangeTo] = useState('')
  const [rangeResult, setRangeResult] = useState<{ total: number; byArticle: { title: string; slug: string; views: number }[] } | null>(null)
  const [rangeLoading, setRangeLoading] = useState(false)
  const [rangeError, setRangeError] = useState<string | null>(null)

  async function loadRange() {
    if (!rangeFrom || !rangeTo) {
      setRangeError('Izaberi oba datuma (od i do).')
      return
    }
    setRangeError(null)
    setRangeLoading(true)
    const supabase = createClient()

    const fromISO = new Date(rangeFrom + 'T00:00:00').toISOString()
    const toISO = new Date(rangeTo + 'T23:59:59').toISOString()

    const { data, error } = await supabase
      .from('article_views')
      .select('article_id')
      .gte('viewed_at', fromISO)
      .lte('viewed_at', toISO)

    setRangeLoading(false)

    if (error) {
      setRangeError('Nemaš dozvolu da vidiš ove podatke, ili je došlo do greške.')
      return
    }

    const counts: Record<string, number> = {}
    for (const row of data ?? []) {
      counts[row.article_id] = (counts[row.article_id] ?? 0) + 1
    }

    const byArticle = Object.entries(counts)
      .map(([articleId, views]) => {
        const article = articles.find((a) => a.id === articleId)
        return { title: article?.title ?? '(obrisana vest)', slug: article?.slug ?? '', views }
      })
      .sort((a, b) => b.views - a.views)

    setRangeResult({ total: data?.length ?? 0, byArticle })
  }

  function exportRangeCsv() {
    if (!rangeResult) return
    const header = 'Naslov,Pregledi\n'
    const rows = rangeResult.byArticle.map((r) => `"${r.title.replace(/"/g, '""')}",${r.views}`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pregledi_${rangeFrom}_do_${rangeTo}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      const supabase = createClient()

      const [{ data: articleData }, { data: profileData }] = await Promise.all([
        supabase
          .from('articles')
          .select('id, slug, title, category, views, published, author_id, created_at')
          .is('deleted_at', null),
        supabase.from('profiles').select('id, full_name, role'),
      ])

      setArticles(articleData ?? [])
      setProfiles(profileData ?? [])

      // Pregledi danas — dostupno samo Admin/Urednik nalozima (RLS), vraća prazno za Novinare
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)
      const { count: todayCount, error: viewsError } = await supabase
        .from('article_views')
        .select('id', { count: 'exact', head: true })
        .gte('viewed_at', startOfDay.toISOString())

      setViewsToday(viewsError ? null : todayCount ?? 0)

      setLoading(false)
    }
    load()
  }, [])

  const publishedArticles = useMemo(() => articles.filter((a) => a.published), [articles])
  const totalViews = useMemo(() => publishedArticles.reduce((s, a) => s + a.views, 0), [publishedArticles])

  const topArticles = useMemo(
    () => [...publishedArticles].sort((a, b) => b.views - a.views).slice(0, 10),
    [publishedArticles]
  )

  const categoryStats = useMemo(() => {
    const map: Record<string, { count: number; views: number }> = {}
    for (const a of publishedArticles) {
      if (!map[a.category]) map[a.category] = { count: 0, views: 0 }
      map[a.category].count += 1
      map[a.category].views += a.views
    }
    return Object.entries(map)
      .map(([category, stats]) => ({ category: category as Category, ...stats }))
      .sort((a, b) => b.views - a.views)
  }, [publishedArticles])

  const journalistStats = useMemo(() => {
    const map: Record<string, { count: number; views: number }> = {}
    for (const a of articles) {
      if (!a.author_id) continue
      if (!map[a.author_id]) map[a.author_id] = { count: 0, views: 0 }
      map[a.author_id].count += 1
      map[a.author_id].views += a.views
    }
    return profiles
      .map((p) => ({
        ...p,
        articleCount: map[p.id]?.count ?? 0,
        totalViews: map[p.id]?.views ?? 0,
        avgViews: map[p.id]?.count ? Math.round((map[p.id]?.views ?? 0) / map[p.id].count) : 0,
      }))
      .sort((a, b) => b.totalViews - a.totalViews)
  }, [profiles, articles])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-headline font-black text-2xl text-gray-900 dark:text-white">Statistika</h1>
        <p className="text-gray-500 text-sm mt-0.5">Pregledi, top vesti i učinak novinara</p>
      </div>

      {/* Top summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 font-medium">Ukupno pregleda</span>
            <Eye className="w-4 h-4 text-gray-400" />
          </div>
          <p className="font-headline font-black text-2xl">{totalViews.toLocaleString('sr-RS')}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 font-medium">Objavljene vesti</span>
            <FileText className="w-4 h-4 text-gray-400" />
          </div>
          <p className="font-headline font-black text-2xl">{publishedArticles.length.toLocaleString('sr-RS')}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 font-medium">Pregledi danas</span>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          <p className="font-headline font-black text-2xl">
            {viewsToday !== null ? viewsToday.toLocaleString('sr-RS') : '—'}
          </p>
          {viewsToday === null && (
            <p className="text-xs text-gray-400 mt-1">Dostupno samo Admin/Urednik nalozima</p>
          )}
        </div>
      </div>

      {/* Pregledi za proizvoljan period */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="font-bold text-sm mb-1 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          Pregledi za period
        </h2>
        <p className="text-xs text-gray-500 mb-4">Izvuci ukupan broj pregleda i raspodelu po vestima za bilo koji vremenski period (npr. ceo mesec).</p>
        <div className="flex flex-col sm:flex-row items-end gap-3 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Od</label>
            <input
              type="date"
              value={rangeFrom}
              onChange={(e) => setRangeFrom(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-brand-red"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Do</label>
            <input
              type="date"
              value={rangeTo}
              onChange={(e) => setRangeTo(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-brand-red"
            />
          </div>
          <button
            onClick={loadRange}
            disabled={rangeLoading}
            className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {rangeLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Prikaži
          </button>
          {rangeResult && (
            <button
              onClick={exportRangeCsv}
              className="text-sm font-semibold text-brand-red hover:underline px-2 py-2"
            >
              Izvezi CSV
            </button>
          )}
        </div>

        {rangeError && <p className="text-sm text-red-600 mb-3">{rangeError}</p>}

        {rangeResult && (
          <div>
            <p className="text-sm font-semibold mb-3">
              Ukupno pregleda u periodu: <span className="text-brand-red">{rangeResult.total.toLocaleString('sr-RS')}</span>
            </p>
            {rangeResult.byArticle.length === 0 ? (
              <p className="text-sm text-gray-500">Nema pregleda u ovom periodu.</p>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-1">
                {rangeResult.byArticle.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 dark:border-gray-800">
                    <span className="line-clamp-1 flex-1">{r.title}</span>
                    <span className="font-semibold text-gray-500 flex-shrink-0 ml-3">{r.views.toLocaleString('sr-RS')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Journalist performance */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-gray-400" />
          <h2 className="font-bold text-sm uppercase tracking-wide text-gray-500">Učinak novinara</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-2.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Novinar</th>
                <th className="text-right px-4 py-2.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Vesti</th>
                <th className="text-right px-4 py-2.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Ukupno pregleda</th>
                <th className="text-right px-4 py-2.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Prosek po vesti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {journalistStats.map((j, i) => (
                <tr key={j.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {i === 0 && j.totalViews > 0 && <span title="Najbolji učinak">🏆</span>}
                      <span className="font-medium text-gray-900 dark:text-white">{j.full_name}</span>
                      <span className="text-xs text-gray-400 capitalize">({j.role})</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">{j.articleCount}</td>
                  <td className="px-4 py-3 text-right font-semibold">{j.totalViews.toLocaleString('sr-RS')}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{j.avgViews.toLocaleString('sr-RS')}</td>
                </tr>
              ))}
              {journalistStats.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500 text-sm">
                    Nema podataka.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top articles */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-bold text-sm uppercase tracking-wide text-gray-500">Top 10 najčitanijih</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {topArticles.map((a, i) => (
              <Link
                key={a.id}
                href={`/vest/${a.slug}`}
                target="_blank"
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <span className="text-xs font-bold text-gray-400 w-4 flex-shrink-0">{i + 1}</span>
                <span className="flex-1 text-sm text-gray-900 dark:text-white line-clamp-1">{a.title}</span>
                <span className="text-xs text-gray-500 flex items-center gap-1 flex-shrink-0">
                  <Eye className="w-3 h-3" />{a.views.toLocaleString('sr-RS')}
                </span>
                <ExternalLink className="w-3 h-3 text-gray-300 flex-shrink-0" />
              </Link>
            ))}
            {topArticles.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">Nema podataka.</div>
            )}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-bold text-sm uppercase tracking-wide text-gray-500">Po kategorijama</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {categoryStats.map((c) => (
              <div key={c.category} className="flex items-center gap-3 px-5 py-3">
                <span className={cn('category-badge text-[10px]', CATEGORY_COLORS[c.category])}>
                  {CATEGORY_LABELS[c.category]}
                </span>
                <span className="flex-1 text-xs text-gray-500">{c.count} vesti</span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Eye className="w-3 h-3" />{c.views.toLocaleString('sr-RS')}
                </span>
              </div>
            ))}
            {categoryStats.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">Nema podataka.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
