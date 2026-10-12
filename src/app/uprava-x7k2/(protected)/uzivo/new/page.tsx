'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Radio } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createSlug } from '@/lib/utils'

const inputClass =
  'w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-brand-red'

export default function NewLiveBlogPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    if (!title.trim()) {
      setError('Unesi naslov prenosa.')
      return
    }
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const baseSlug = createSlug(title) || 'uzivo'

    // Ako slug već postoji, dodaj sufiks
    for (let attempt = 0; attempt < 5; attempt++) {
      const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`
      const { data, error: insertError } = await supabase
        .from('live_blogs')
        .insert({
          slug,
          title: title.trim(),
          description: description.trim(),
          status: 'live',
          published: false,
          created_by: user?.id ?? null,
        })
        .select('id')
        .single()

      if (!insertError && data) {
        router.push(`/uprava-x7k2/uzivo/${data.id}`)
        return
      }
      if (insertError && !insertError.message.includes('duplicate')) {
        setError(
          insertError.message.includes('live_blogs')
            ? 'Tabela za "Uživo" ne postoji — pokreni SQL migraciju 020_live_blog.sql u Supabase SQL Editoru.'
            : insertError.message
        )
        setSaving(false)
        return
      }
    }
    setError('Ne mogu da napravim jedinstven URL — promeni naslov.')
    setSaving(false)
  }

  return (
    <div className="space-y-5 max-w-xl">
      <h1 className="font-headline font-black text-2xl text-gray-900 dark:text-white flex items-center gap-2">
        <Radio className="w-6 h-6 text-brand-red" />
        Novi uživo prenos
      </h1>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-red-700 dark:text-red-400 text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">Naslov</label>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Izbori u Zrenjaninu: izlaznost i rezultati UŽIVO"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
            Kratak opis (opciono)
          </label>
          <textarea
            className={inputClass}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Pratimo izlaznost, rezultate i dešavanja na biračkim mestima."
          />
        </div>
        <p className="text-xs text-gray-500">
          Prenos se pravi kao <strong>skica</strong> — neće biti vidljiv javnosti dok ga ne objaviš u podešavanjima.
        </p>
        <button
          onClick={handleCreate}
          disabled={saving}
          className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-60"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Napravi prenos
        </button>
      </div>
    </div>
  )
}
