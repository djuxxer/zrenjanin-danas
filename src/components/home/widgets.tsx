'use client'

import { useState } from 'react'
import { Bell, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    // Honeypot — botovi popune ovo skriveno polje, pravi ljudi ne vide da postoji
    if (honeypot.trim()) {
      setSubmitted(true)
      setEmail('')
      return
    }

    setSubmitting(true)
    setError(null)

    const supabase = createClient()
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: email.trim() })

    setSubmitting(false)

    if (insertError) {
      setError(
        insertError.code === '23505'
          ? 'Ova email adresa je već prijavljena.'
          : 'Greška prilikom prijave. Pokušajte ponovo.'
      )
      return
    }

    setSubmitted(true)
    setEmail('')
  }

  return (
    <div className="bg-brand-red rounded-xl p-6 text-white">
      <div className="flex items-center gap-2 mb-2">
        <Bell className="w-5 h-5" />
        <h3 className="font-headline font-bold text-lg">Newsletter</h3>
      </div>
      <p className="text-sm opacity-90 mb-4">
        Budite prvi koji saznaju vesti. Prijavite se na naš dnevni newsletter.
      </p>
      {submitted ? (
        <div className="bg-white/20 rounded-lg p-3 text-center text-sm font-semibold">
          ✓ Uspešno ste se prijavili!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="text"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
          />
          {error && (
            <div className="bg-white/20 rounded-lg p-2 text-xs font-semibold">{error}</div>
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Vaša email adresa"
            required
            className="w-full px-4 py-2.5 rounded-lg bg-white/20 placeholder-white/60 text-white text-sm border border-white/30 focus:outline-none focus:border-white"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-white text-brand-red font-bold py-2.5 rounded-lg text-sm hover:bg-gray-100 transition-colors disabled:opacity-70"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Prijavi se besplatno
          </button>
        </form>
      )}
    </div>
  )
}

export function AdBanner({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const heights: Record<string, string> = {
    small: 'h-20',
    medium: 'h-32',
    large: 'h-48',
  }

  return (
    <div
      className={`${heights[size]} bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700`}
    >
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Reklama</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Oglasite se na Zrenjanin Danas</p>
      </div>
    </div>
  )
}
