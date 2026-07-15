'use client'

import { useState, useEffect } from 'react'
import { Cloud, Sun, CloudRain, CloudSnow, CloudFog, Droplets, Wind, Bell, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Zrenjanin koordinate
const LAT = 45.3778
const LON = 20.3897

// WMO weather code -> (opis, ikonica)
function weatherFromCode(code: number): { label: string; Icon: typeof Cloud } {
  if (code === 0) return { label: 'vedro', Icon: Sun }
  if ([1, 2, 3].includes(code)) return { label: 'oblačno', Icon: Cloud }
  if ([45, 48].includes(code)) return { label: 'magla', Icon: CloudFog }
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: 'kiša', Icon: CloudRain }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: 'sneg', Icon: CloudSnow }
  if ([95, 96, 99].includes(code)) return { label: 'grmljavina', Icon: CloudRain }
  return { label: 'promenljivo', Icon: Cloud }
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<{
    temp: number
    label: string
    humidity: number
    windSpeed: number
    Icon: typeof Cloud
  } | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadWeather() {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=Europe%2FBelgrade`
        )
        if (!res.ok) throw new Error()
        const data = await res.json()
        if (cancelled) return

        const { label, Icon } = weatherFromCode(data.current.weather_code)
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          label,
          humidity: Math.round(data.current.relative_humidity_2m),
          windSpeed: Math.round(data.current.wind_speed_10m),
          Icon,
        })
      } catch {
        if (!cancelled) setError(true)
      }
    }

    loadWeather()
    // Osveži na svakih 30 minuta dok je stranica otvorena
    const interval = setInterval(loadWeather, 30 * 60 * 1000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  if (error) {
    return (
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-950 rounded-xl p-4 text-white">
        <p className="text-xs opacity-75">Vremenska prognoza trenutno nije dostupna.</p>
      </div>
    )
  }

  if (!weather) {
    return (
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-950 rounded-xl p-4 text-white flex items-center justify-center h-[104px]">
        <Loader2 className="w-5 h-5 animate-spin opacity-75" />
      </div>
    )
  }

  const WeatherIcon = weather.Icon

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-950 rounded-xl p-4 text-white">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-75">Zrenjanin</p>
          <div className="flex items-end gap-2 mt-1">
            <span className="font-headline font-black text-4xl leading-none">{weather.temp}°C</span>
            <span className="text-sm opacity-75 mb-1">{weather.label}</span>
          </div>
        </div>
        <WeatherIcon className="w-12 h-12 opacity-80" />
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/20 text-xs">
        <div className="flex items-center gap-1 opacity-80">
          <Droplets className="w-3 h-3" />
          <span>Vlaga: {weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-1 opacity-80">
          <Wind className="w-3 h-3" />
          <span>Vetar: {weather.windSpeed} km/h</span>
        </div>
      </div>
    </div>
  )
}

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
        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Reklama</p>
        <p className="text-xs text-gray-400 mt-0.5">Oglasite se na Zrenjanin Danas</p>
      </div>
    </div>
  )
}
