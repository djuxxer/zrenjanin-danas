'use client'

import { useState } from 'react'
import { Save, Globe, Bell, Palette, Database, Shield } from 'lucide-react'

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false)
  const [siteName, setSiteName] = useState('Zrenjanin Danas')
  const [siteUrl, setSiteUrl] = useState('https://zrenjanindanas.rs')
  const [contactEmail, setContactEmail] = useState('redakcija@zrenjanindanas.rs')
  const [analyticsId, setAnalyticsId] = useState('G-XXXXXXXXXX')
  const [fbPixel, setFbPixel] = useState('')
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [commentsEnabled, setCommentsEnabled] = useState(true)
  const [newsletterEnabled, setNewsletterEnabled] = useState(true)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const Section = ({ title, icon: Icon, children }: { title: string; icon: typeof Globe; children: React.ReactNode }) => (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
        <Icon className="w-4 h-4 text-brand-red" />
        <h2 className="font-bold text-sm">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  )

  const inputClass = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-brand-red"

  const Toggle = ({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <div
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors ${value ? 'bg-brand-red' : 'bg-gray-200 dark:bg-gray-700'}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </div>
    </div>
  )

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline font-black text-2xl text-gray-900 dark:text-white">Podešavanja</h1>
          <p className="text-gray-500 text-sm">Konfiguracija portala</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors"
        >
          <Save className="w-4 h-4" />
          Sačuvaj sve
        </button>
      </div>

      {saved && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 text-green-700 dark:text-green-400 text-sm font-semibold">
          ✓ Podešavanja su uspešno sačuvana!
        </div>
      )}

      <Section title="Opšte podešavanja" icon={Globe}>
        <Field label="Naziv sajta">
          <input type="text" value={siteName} onChange={e => setSiteName(e.target.value)} className={inputClass} />
        </Field>
        <Field label="URL sajta">
          <input type="url" value={siteUrl} onChange={e => setSiteUrl(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Email redakcije">
          <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Tagline / Moto">
          <input type="text" defaultValue="Najnovije vesti iz Zrenjanina, Vojvodine i Srbije" className={inputClass} />
        </Field>
      </Section>

      <Section title="Analitika i tracking" icon={Globe}>
        <Field label="Google Analytics ID">
          <input type="text" value={analyticsId} onChange={e => setAnalyticsId(e.target.value)} placeholder="G-XXXXXXXXXX" className={inputClass} />
        </Field>
        <Field label="Facebook Pixel ID">
          <input type="text" value={fbPixel} onChange={e => setFbPixel(e.target.value)} placeholder="123456789012345" className={inputClass} />
        </Field>
      </Section>

      <Section title="Funkcionalnosti" icon={Palette}>
        <div className="space-y-3">
          <Toggle value={commentsEnabled} onChange={setCommentsEnabled} label="Komentari ispod vesti" />
          <Toggle value={newsletterEnabled} onChange={setNewsletterEnabled} label="Newsletter widget" />
          <Toggle value={maintenanceMode} onChange={setMaintenanceMode} label="Maintenance mode" />
        </div>
        {maintenanceMode && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-700 dark:text-amber-400">
            ⚠️ Maintenance mode je aktivan — sajt nije dostupan korisnicima!
          </div>
        )}
      </Section>

      <Section title="Supabase baza podataka" icon={Database}>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2 text-sm font-mono">
          <p className="text-gray-500 text-xs uppercase tracking-wide font-sans font-bold mb-2">Environment varijable</p>
          <p><span className="text-brand-red">NEXT_PUBLIC_SUPABASE_URL</span>=<span className="text-green-600">https://xxx.supabase.co</span></p>
          <p><span className="text-brand-red">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>=<span className="text-green-600">eyJ...</span></p>
          <p><span className="text-brand-red">SUPABASE_SERVICE_ROLE_KEY</span>=<span className="text-green-600">eyJ...</span></p>
        </div>
        <p className="text-xs text-gray-500">Podešavanja baze se vrše kroz .env.local fajl ili Vercel dashboard.</p>
      </Section>

      <Section title="Bezbednost" icon={Shield}>
        <Field label="Lozinka za admin panel">
          <input type="password" placeholder="••••••••••••" className={inputClass} />
        </Field>
        <button className="text-sm text-brand-red hover:underline font-semibold">
          Promena lozinke →
        </button>
      </Section>
    </div>
  )
}
