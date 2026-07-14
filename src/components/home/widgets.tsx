'use client'

import { useState } from 'react'
import { Cloud, Sun, Droplets, Wind, Bell } from 'lucide-react'

export function WeatherWidget() {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-950 rounded-xl p-4 text-white">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-75">Zrenjanin</p>
          <div className="flex items-end gap-2 mt-1">
            <span className="font-headline font-black text-4xl leading-none">8°C</span>
            <span className="text-sm opacity-75 mb-1">oblačno</span>
          </div>
        </div>
        <Cloud className="w-12 h-12 opacity-80" />
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/20 text-xs">
        <div className="flex items-center gap-1 opacity-80">
          <Droplets className="w-3 h-3" />
          <span>Vlaga: 78%</span>
        </div>
        <div className="flex items-center gap-1 opacity-80">
          <Wind className="w-3 h-3" />
          <span>Vetar: 15 km/h</span>
        </div>
      </div>
    </div>
  )
}

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      setEmail('')
    }
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
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Vaša email adresa"
            required
            className="w-full px-4 py-2.5 rounded-lg bg-white/20 placeholder-white/60 text-white text-sm border border-white/30 focus:outline-none focus:border-white"
          />
          <button
            type="submit"
            className="w-full bg-white text-brand-red font-bold py-2.5 rounded-lg text-sm hover:bg-gray-100 transition-colors"
          >
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
        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Reklama</p>
        <p className="text-xs text-gray-400 mt-0.5">Oglasite se na Banatski Glas</p>
      </div>
    </div>
  )
}
