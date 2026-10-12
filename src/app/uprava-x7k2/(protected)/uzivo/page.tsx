'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Radio, PlusCircle, Loader2, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { LiveBlog } from '@/lib/live-shared'

export default function AdminLiveListPage() {
  const [blogs, setBlogs] = useState<LiveBlog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('live_blogs')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) {
        setError(
          error.message.includes('live_blogs')
            ? 'Tabela za "Uživo" ne postoji — pokreni SQL migraciju 020_live_blog.sql u Supabase SQL Editoru.'
            : error.message
        )
      }
      setBlogs((data ?? []) as LiveBlog[])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-headline font-black text-2xl text-gray-900 dark:text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-brand-red" />
            Uživo prenosi
          </h1>
          <p className="text-gray-500 text-sm">Izborni dan i drugi događaji — objave, izlaznost po satima i rezultati.</p>
        </div>
        <Link
          href="/uprava-x7k2/uzivo/new"
          className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          Novi prenos
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-red-700 dark:text-red-400 text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">Još nema nijednog prenosa.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {blogs.map((b) => (
              <div key={b.id} className="flex items-center gap-3 px-5 py-4">
                <Link href={`/uprava-x7k2/uzivo/${b.id}`} className="flex-1 min-w-0 hover:text-brand-red">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{b.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    /uzivo/{b.slug} ·{' '}
                    <span className={b.status === 'live' ? 'text-red-600 font-bold' : ''}>
                      {b.status === 'live' ? 'UŽIVO' : 'završeno'}
                    </span>{' '}
                    · {b.published ? 'objavljeno' : 'NIJE objavljeno (skica)'}
                  </p>
                </Link>
                {b.published && (
                  <Link
                    href={`/uzivo/${b.slug}`}
                    target="_blank"
                    className="text-gray-400 hover:text-brand-red"
                    title="Otvori javnu stranicu"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
