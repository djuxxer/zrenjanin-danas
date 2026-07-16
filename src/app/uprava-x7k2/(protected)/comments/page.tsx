'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, Trash2, Loader2, MessageSquare, ExternalLink } from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface CommentRow {
  id: string
  author_name: string
  author_email: string
  content: string
  approved: boolean
  created_at: string
  article_id: string
  article: { title: string; slug: string } | null
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<CommentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending')
  const [busyId, setBusyId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('comments')
      .select('id, author_name, author_email, content, approved, created_at, article_id, article:articles(title, slug)')
      .order('created_at', { ascending: false })
    setComments((data as unknown as CommentRow[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleApprove(id: string) {
    setBusyId(id)
    const supabase = createClient()
    const { error } = await supabase.from('comments').update({ approved: true }).eq('id', id)
    setBusyId(null)
    if (error) return alert('Greška: ' + error.message)
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, approved: true } : c)))
  }

  async function handleDelete(id: string) {
    if (!confirm('Obrisati ovaj komentar?')) return
    setBusyId(id)
    const supabase = createClient()
    const { error } = await supabase.from('comments').delete().eq('id', id)
    setBusyId(null)
    if (error) return alert('Greška: ' + error.message)
    setComments((prev) => prev.filter((c) => c.id !== id))
  }

  const filtered = comments.filter((c) => {
    if (filter === 'pending') return !c.approved
    if (filter === 'approved') return c.approved
    return true
  })

  const pendingCount = comments.filter((c) => !c.approved).length

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="font-headline font-black text-2xl text-gray-900 dark:text-white">Komentari</h1>
        <p className="text-gray-500 text-sm">{pendingCount} čeka odobrenje od ukupno {comments.length}</p>
      </div>

      <div className="flex gap-2">
        {(['pending', 'approved', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors',
              filter === f ? 'bg-brand-red text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            )}
          >
            {f === 'pending' ? 'Čeka odobrenje' : f === 'approved' ? 'Odobreni' : 'Svi'}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Nema komentara za ovaj filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((c) => (
              <div key={c.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{c.author_name}</span>
                      <span className="text-xs text-gray-400">{c.author_email}</span>
                      <span className="text-xs text-gray-400">· {timeAgo(c.created_at)}</span>
                      {!c.approved && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase">Čeka</span>
                      )}
                    </div>
                    {c.article && (
                      <Link
                        href={`/vest/${c.article.slug}`}
                        target="_blank"
                        className="text-xs text-brand-red hover:underline flex items-center gap-1 mt-0.5"
                      >
                        {c.article.title} <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!c.approved && (
                      <button
                        onClick={() => handleApprove(c.id)}
                        disabled={busyId === c.id}
                        className="p-1.5 hover:text-green-600 transition-colors rounded hover:bg-green-50 dark:hover:bg-green-950/20 disabled:opacity-50"
                        title="Odobri"
                      >
                        {busyId === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={busyId === c.id}
                      className="p-1.5 hover:text-red-600 transition-colors rounded hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-50"
                      title="Obriši"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{c.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
