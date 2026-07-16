'use client'

import { useEffect, useState } from 'react'
import { Save, Globe, Palette, Database, Shield, Loader2, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Globe; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
        <Icon className="w-4 h-4 text-brand-red" />
        <h2 className="font-bold text-sm">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
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
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [siteName, setSiteName] = useState('')
  const [siteUrl, setSiteUrl] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [tagline, setTagline] = useState('')
  const [analyticsId, setAnalyticsId] = useState('')
  const [fbPixel, setFbPixel] = useState('')
  const [facebookUrl, setFacebookUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [twitterUrl, setTwitterUrl] = useState('')
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [commentsEnabled, setCommentsEnabled] = useState(true)
  const [newsletterEnabled, setNewsletterEnabled] = useState(true)

  const [subscriberCount, setSubscriberCount] = useState<number | null>(null)

  const [newPassword, setNewPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ data: settings }, { count }] = await Promise.all([
        supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
        supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
      ])

      if (settings) {
        setSiteName(settings.site_name ?? '')
        setSiteUrl(settings.site_url ?? '')
        setContactEmail(settings.contact_email ?? '')
        setTagline(settings.tagline ?? '')
        setAnalyticsId(settings.analytics_id ?? '')
        setFbPixel(settings.fb_pixel ?? '')
        setFacebookUrl(settings.facebook_url ?? '')
        setInstagramUrl(settings.instagram_url ?? '')
        setTwitterUrl(settings.twitter_url ?? '')
        setMaintenanceMode(settings.maintenance_mode ?? false)
        setCommentsEnabled(settings.comments_enabled ?? true)
        setNewsletterEnabled(settings.newsletter_enabled ?? true)
      }
      setSubscriberCount(count ?? null)
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { error: saveError } = await supabase
      .from('site_settings')
      .update({
        site_name: siteName,
        site_url: siteUrl,
        contact_email: contactEmail,
        tagline,
        analytics_id: analyticsId,
        fb_pixel: fbPixel,
        facebook_url: facebookUrl,
        instagram_url: instagramUrl,
        twitter_url: twitterUrl,
        maintenance_mode: maintenanceMode,
        comments_enabled: commentsEnabled,
        newsletter_enabled: newsletterEnabled,
      })
      .eq('id', 1)

    setSaving(false)

    if (saveError) {
      setError(
        saveError.message.includes('policy')
          ? 'Samo Admin nalozi mogu da menjaju podešavanja.'
          : `Greška: ${saveError.message}`
      )
      return
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function handlePasswordChange() {
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Lozinka mora imati bar 6 karaktera.' })
      return
    }

    setPasswordSaving(true)
    setPasswordMessage(null)

    const supabase = createClient()
    const { error: pwError } = await supabase.auth.updateUser({ password: newPassword })

    setPasswordSaving(false)

    if (pwError) {
      setPasswordMessage({ type: 'error', text: pwError.message })
      return
    }

    setNewPassword('')
    setPasswordMessage({ type: 'success', text: 'Lozinka je uspešno promenjena.' })
  }

  const inputClass = "w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-brand-red"

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline font-black text-2xl text-gray-900 dark:text-white">Podešavanja</h1>
          <p className="text-gray-500 text-sm">Konfiguracija portala</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Sačuvaj sve
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-red-700 dark:text-red-400 text-sm font-semibold">
          {error}
        </div>
      )}

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
          <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Najnovije vesti iz Zrenjanina, Vojvodine i Srbije" className={inputClass} />
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

      <Section title="Društvene mreže" icon={Globe}>
        <p className="text-xs text-gray-400 -mt-2">
          Ovi linkovi se koriste u schema markup-u (sameAs) kako bi Google povezao portal kao prepoznatljiv entitet — poboljšava E-E-A-T signale.
        </p>
        <Field label="Facebook stranica">
          <input type="url" value={facebookUrl} onChange={e => setFacebookUrl(e.target.value)} placeholder="https://facebook.com/zrenjanindanas" className={inputClass} />
        </Field>
        <Field label="Instagram profil">
          <input type="url" value={instagramUrl} onChange={e => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/zrenjanindanas" className={inputClass} />
        </Field>
        <Field label="Twitter/X profil">
          <input type="url" value={twitterUrl} onChange={e => setTwitterUrl(e.target.value)} placeholder="https://x.com/zrenjanindanas" className={inputClass} />
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
            ⚠️ Napomena: ovaj prekidač trenutno samo čuva vrednost u bazi — sajt još uvek ne proverava ovo polje da bi stvarno blokirao pristup. Javi ako želiš da to i stvarno zaživi.
          </div>
        )}
      </Section>

      <Section title="Newsletter pretplatnici" icon={Mail}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-300">Aktivnih pretplatnika</span>
          <span className="font-headline font-black text-2xl">{subscriberCount ?? '—'}</span>
        </div>
        <p className="text-xs text-gray-400">
          Puna lista i izvoz pretplatnika mogu se dodati kasnije ako zatreba slanje newsletter kampanja.
        </p>
      </Section>

      <Section title="Supabase baza podataka" icon={Database}>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2 text-sm font-mono">
          <p className="text-gray-500 text-xs uppercase tracking-wide font-sans font-bold mb-2">Environment varijable (samo za referencu, ne menjaju se ovde)</p>
          <p><span className="text-brand-red">NEXT_PUBLIC_SUPABASE_URL</span>=<span className="text-green-600">{process.env.NEXT_PUBLIC_SUPABASE_URL ? '••• podešeno •••' : 'nije podešeno'}</span></p>
        </div>
        <p className="text-xs text-gray-500">Podešavanja konekcije sa bazom se menjaju kroz Environment tab na Render-u, ne ovde.</p>
      </Section>

      <Section title="Bezbednost" icon={Shield}>
        {passwordMessage && (
          <div
            className={`text-sm rounded-lg px-3 py-2 ${
              passwordMessage.type === 'success'
                ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            }`}
          >
            {passwordMessage.text}
          </div>
        )}
        <Field label="Nova lozinka (za tvoj nalog)">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••••••"
            className={inputClass}
          />
        </Field>
        <button
          onClick={handlePasswordChange}
          disabled={passwordSaving || !newPassword}
          className="flex items-center gap-2 text-sm text-brand-red hover:underline font-semibold disabled:opacity-60"
        >
          {passwordSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          Promeni lozinku →
        </button>
      </Section>
    </div>
  )
}
