'use client'

import { useEffect, useState } from 'react'
import { Link2, Check } from 'lucide-react'

interface Suggestion {
  id: string
  title: string
  slug: string
}

interface Props {
  title: string
  excludeId?: string
  onHasLinkChange?: (hasSuggestions: boolean) => void
}

/**
 * Predlaže postojeće vesti za interno linkovanje, na osnovu ključnih reči iz
 * naslova koji se trenutno piše. Novinar klikne "Kopiraj link" i nalepi ga
 * kroz dugme "Link" u editoru teksta.
 */
export function InternalLinkSuggestions({ title, excludeId }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  useEffect(() => {
    if (!title || title.trim().length < 6) {
      setSuggestions([])
      return
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch('/api/admin/suggest-links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, excludeId }),
        })
        const data = await res.json()
        setSuggestions(data.articles ?? [])
      } catch {
        setSuggestions([])
      }
    }, 700)

    return () => clearTimeout(timeout)
  }, [title, excludeId])

  function copyLink(slug: string) {
    navigator.clipboard.writeText(`/vest/${slug}`)
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 1500)
  }

  if (suggestions.length === 0) return null

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-1.5">
        <Link2 className="w-3.5 h-3.5" />
        Predloženi interni linkovi
      </p>
      <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">
        Vesti sa sličnim rečima u naslovu — kopiraj link i ubaci ga kroz dugme "Link" u tekstu.
      </p>
      <div className="space-y-1.5">
        {suggestions.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-2 bg-white dark:bg-gray-900 rounded-lg px-3 py-2">
            <span className="text-sm text-gray-700 dark:text-gray-200 line-clamp-1">{s.title}</span>
            <button
              type="button"
              onClick={() => copyLink(s.slug)}
              className="flex-shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-1"
            >
              {copiedSlug === s.slug ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Kopirano
                </>
              ) : (
                'Kopiraj link'
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
