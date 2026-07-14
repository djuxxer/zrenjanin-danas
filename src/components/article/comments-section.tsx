'use client'

import { useState } from 'react'
import { MessageSquare, ThumbsUp, User } from 'lucide-react'

interface Comment {
  id: string
  author: string
  text: string
  time: string
  likes: number
}

const DEMO_COMMENTS: Comment[] = [
  { id: '1', author: 'Marko P.', text: 'Odlična vest! Konačno nešto pozitivno za naš grad.', time: 'pre 2 sata', likes: 12 },
  { id: '2', author: 'Jovana M.', text: 'Nadam se da će ovo stvarno biti realizovano ovaj put.', time: 'pre 4 sata', likes: 8 },
  { id: '3', author: 'Dragan V.', text: 'Zrenjanin zaslužuje više ovakvih ulaganja. Bravo!', time: 'pre 6 sati', likes: 5 },
]

export function CommentsSection({ articleId }: { articleId: string }) {
  const [comments, setComments] = useState<Comment[]>(DEMO_COMMENTS)
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && text.trim()) {
      const newComment: Comment = {
        id: Date.now().toString(),
        author: name.trim(),
        text: text.trim(),
        time: 'upravo sada',
        likes: 0,
      }
      setComments((prev) => [newComment, ...prev])
      setName('')
      setText('')
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    }
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
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Vaše ime"
            required
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:border-brand-red"
          />
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
            <button type="submit" className="btn-primary text-sm py-2 px-4">
              Pošalji komentar
            </button>
          </div>
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
                <span className="font-semibold text-sm">{comment.author}</span>
                <span className="text-xs text-gray-500">{comment.time}</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{comment.text}</p>
              <button className="flex items-center gap-1 mt-2 text-xs text-gray-500 hover:text-brand-red transition-colors">
                <ThumbsUp className="w-3 h-3" />
                {comment.likes}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
