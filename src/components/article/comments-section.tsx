'use client'

import { useState } from 'react'
import { MessageSquare, User, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { timeAgo } from '@/lib/utils'
import type { CommentData } from '@/lib/comments'

interface Props {
  articleId: string
  initialComments: CommentData[]
}

export function CommentsSection({ articleId, initialComments }: Props) {
  const [comments] = useState<CommentData[]>(initialComments)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [text, setText] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !text.trim()) return

    // Honeypot — botovi popune ovo skriveno polje, pravi ljudi ne vide da postoji
    if (honeypot.trim()) {
      setSubmitted(true)
      setName('')
      setEmail('')
      setText('')
      setTimeout(() => setSubmitted(false), 4000)
      return
    }

    setSubmitting(true)
    setError(null)

    const supabase = createClient()
    const { error: insertError } = await supabase.from('comments').insert({
      article_id: articleId,
      author_name: name.trim(),
      author_email: email.trim(),
      content: text.trim(),
    })

    setSubmitting(false)

    if (insertError) {
      setError('Došlo je do greške. Pokušajte ponovo.')
      return
    }

    setName('')
    setEmail('')
    setText('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <section className="border-t border-gray-200 dark:border-gray-800 pt-8">
      <h3 className="flex items-center gap-2 font-headline font-bold text-xl mb-6">
        <MessageSquare className="w-5 h-5 text-brand-red" />
        Komentari ({comments.length})
      </h3>

      {/* Add comment */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
        <h4 className="font-semibold text-sm mb-3">Ostavite komentar</h4>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Honeypot polje — sakriveno od ljudi, vidljivo botovima */}
          <input
            type="text"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Vaše ime"
              required
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:border-brand-red"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Vaš email (neće biti objavljen)"
              required
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:border-brand-red"
            />
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Napišite komentar..."
            required
            rows={3}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:border-brand-red resize-none"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">Komentari se objavljuju nakon moderacije.</p>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 btn-primary text-sm py-2 px-4 disabled:opacity-60"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Pošalji komentar
            </button>
          </div>
          {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}
          {submitted && (
            <p className="text-green-600 text-sm font-semibold">✓ Komentar je primljen, čeka moderaciju.</p>
          )}
        </form>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm">{comment.author_name}</span>
                <span className="text-xs text-gray-500">{timeAgo(comment.created_at)}</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{comment.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">Budi prvi koji će ostaviti komentar.</p>
        )}
      </div>
    </section>
  )
}
