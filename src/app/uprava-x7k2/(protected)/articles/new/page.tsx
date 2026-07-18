'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Eye, Calendar, Image as ImageIcon, Tag, Search as SearchIcon, ChevronDown, AlertTriangle, CheckCircle2, XCircle, MinusCircle, Loader2 } from 'lucide-react'
import { CATEGORY_LABELS, type Category } from '@/types'
import { cn, createSlug } from '@/lib/utils'
import { calculateSeoScore, SEO_PUBLISH_THRESHOLD } from '@/lib/seo-score'
import { createClient } from '@/lib/supabase/client'
import { ImageUploadButton } from '@/components/admin/image-upload-button'
import { ImageGalleryPicker } from '@/components/admin/image-gallery-picker'
import { RichTextEditor } from '@/components/admin/rich-text-editor'

const EMPTY_FORM = {
  title: '',
  subtitle: '',
  content: '',
  excerpt: '',
  category: 'zrenjanin' as Category,
  image_url: '',
  image_alt: '',
  image_source: '',
  focus_keyphrase: '',
  seo_title: '',
  seo_description: '',
  tags: '',
  naslovna_velika: false,
  naslovna_mala: false,
  traka_gore: false,
  published: false,
  scheduled_at: '',
}

// Polja koja MORAJU biti popunjena pre nego što se vest može objaviti
const REQUIRED_FOR_PUBLISH: { key: keyof typeof EMPTY_FORM; label: string; tab: 'content' | 'seo' | 'settings' }[] = [
  { key: 'title', label: 'Naslov', tab: 'content' },
  { key: 'content', label: 'Sadržaj vesti', tab: 'content' },
  { key: 'excerpt', label: 'Kratak opis (excerpt)', tab: 'content' },
  { key: 'image_url', label: 'URL naslovne slike', tab: 'content' },
  { key: 'image_alt', label: 'Alt tekst slike', tab: 'content' },
  { key: 'image_source', label: 'Izvor slike', tab: 'content' },
  { key: 'focus_keyphrase', label: 'Ključna fraza (focus keyphrase)', tab: 'seo' },
  { key: 'seo_title', label: 'SEO naslov', tab: 'seo' },
  { key: 'seo_description', label: 'Meta description', tab: 'seo' },
]

export default function NewArticlePage() {
  const router = useRouter()
  const [form, setForm] = useState(EMPTY_FORM)
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'settings'>('content')
  const [saved, setSaved] = useState<'published' | 'draft' | null>(null)
  const [saving, setSaving] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)

  const set = (key: keyof typeof EMPTY_FORM, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const seo = useMemo(() => calculateSeoScore(form), [form])

  const handleSave = async (publish: boolean) => {
    if (publish) {
      const missing = REQUIRED_FOR_PUBLISH.filter((f) => !String(form[f.key]).trim())

      if (missing.length > 0) {
        setPublishError(
          `Za objavu vesti moraš popuniti: ${missing.map((f) => f.label).join(', ')}.`
        )
        setActiveTab(missing[0].tab)
        return
      }

      if (seo.score < SEO_PUBLISH_THRESHOLD) {
        setPublishError(
          `SEO ocena je ${seo.score}% — potrebno je najmanje ${SEO_PUBLISH_THRESHOLD}% da bi vest mogla da se objavi. Proveri SEO tab i popravi označene stavke.`
        )
        setActiveTab('seo')
        return
      }
    } else if (!form.title.trim()) {
      setPublishError('Unesi bar naslov da bi sačuvao nacrt.')
      setActiveTab('content')
      return
    }

    setPublishError(null)
    setSaving(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setSaving(false)
      setPublishError('Sesija je istekla — uloguj se ponovo.')
      return
    }

    const slug = createSlug(form.title)
    const tagsArray = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const { error } = await supabase.from('articles').insert({
      slug,
      title: form.title,
      subtitle: form.subtitle || null,
      content: form.content,
      excerpt: form.excerpt,
      category: form.category,
      image_url: form.image_url,
      image_alt: form.image_alt,
      image_source: form.image_source || null,
      author_id: user.id,
      published: publish,
      published_at: publish ? new Date().toISOString() : null,
      scheduled_at: form.scheduled_at || null,
      naslovna_velika: form.naslovna_velika,
      naslovna_mala: form.naslovna_mala,
      traka_gore: form.traka_gore,
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
      focus_keyphrase: form.focus_keyphrase || null,
      tags: tagsArray,
    })

    setSaving(false)

    if (error) {
      setPublishError(
        error.code === '23505'
          ? 'Vest sa ovim naslovom (istim URL-om) već postoji. Izmeni naslov malo pa probaj ponovo.'
          : `Greška prilikom čuvanja: ${error.message}`
      )
      return
    }

    setSaved(publish ? 'published' : 'draft')
    setTimeout(() => {
      router.push('/uprava-x7k2/articles')
    }, 1200)
  }

  const seoTitleLen = (form.seo_title || form.title).length
  const seoDescLen = form.seo_description.length

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline font-black text-2xl text-gray-900 dark:text-white">Nova vest</h1>
          <p className="text-gray-500 text-sm">Kreirajte i objavite novu vest</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Sačuvaj nacrt
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Objavi
          </button>
        </div>
      </div>

      {publishError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-red-700 dark:text-red-400 text-sm font-semibold flex items-start gap-2">
          <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{publishError}</span>
        </div>
      )}

      {saved && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 text-green-700 dark:text-green-400 text-sm font-semibold flex items-center gap-2">
          ✓ Vest je uspešno {saved === 'published' ? 'objavljena' : 'sačuvana kao nacrt'}!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Naslov *</label>
            <textarea
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Unesite naslov vesti..."
              rows={2}
              className="w-full font-headline font-bold text-xl border-0 focus:outline-none resize-none bg-transparent placeholder-gray-300 dark:placeholder-gray-600 leading-snug"
            />
            <div className="border-t border-gray-100 dark:border-gray-800 pt-3 mt-3">
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Podnaslov</label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => set('subtitle', e.target.value)}
                placeholder="Opcionalni podnaslov..."
                className="w-full border-0 focus:outline-none bg-transparent text-gray-600 dark:text-gray-300 placeholder-gray-300 dark:placeholder-gray-600 text-sm"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="flex border-b border-gray-100 dark:border-gray-800">
              {(['content', 'seo', 'settings'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-5 py-3 text-sm font-semibold transition-colors capitalize',
                    activeTab === tab
                      ? 'text-brand-red border-b-2 border-brand-red bg-red-50/50 dark:bg-red-950/10'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  )}
                >
                  {tab === 'content' ? 'Sadržaj' : tab === 'seo' ? 'SEO' : 'Podešavanja'}
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === 'content' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                      Sadržaj vesti *
                    </label>
                    <RichTextEditor value={form.content} onChange={(html) => set('content', html)} />
                    <p className="text-xs text-gray-400 mt-1">Vizuelno = piši/uređuj kao u Word-u. Kod = ručna izmena HTML-a. Lepljenje teksta se automatski deli u pasuse.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                      Kratak opis (excerpt) *
                    </label>
                    <textarea
                      value={form.excerpt}
                      onChange={(e) => set('excerpt', e.target.value)}
                      placeholder="Kratki opis vesti koji se prikazuje na listingima..."
                      rows={3}
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-brand-red resize-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-4">
                  {/* SEO score summary */}
                  <div
                    className={cn(
                      'rounded-xl p-4 border flex items-center gap-4',
                      seo.color === 'green' && 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
                      seo.color === 'orange' && 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
                      seo.color === 'red' && 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    )}
                  >
                    <div
                      className={cn(
                        'w-14 h-14 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0',
                        seo.color === 'green' && 'bg-green-600 text-white',
                        seo.color === 'orange' && 'bg-amber-500 text-white',
                        seo.color === 'red' && 'bg-red-600 text-white'
                      )}
                    >
                      {seo.score}%
                    </div>
                    <div>
                      <p
                        className={cn(
                          'font-bold text-sm',
                          seo.color === 'green' && 'text-green-700 dark:text-green-400',
                          seo.color === 'orange' && 'text-amber-700 dark:text-amber-400',
                          seo.color === 'red' && 'text-red-700 dark:text-red-400'
                        )}
                      >
                        SEO ocena: {seo.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Potrebno je najmanje {SEO_PUBLISH_THRESHOLD}% da bi vest mogla da se objavi.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                      Ključna fraza (focus keyphrase) *
                    </label>
                    <input
                      type="text"
                      value={form.focus_keyphrase}
                      onChange={(e) => set('focus_keyphrase', e.target.value)}
                      placeholder="npr. Zrenjanin infrastruktura"
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-brand-red"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Glavna fraza po kojoj želiš da se ova vest nalazi na Google-u. Koristi je u naslovu, opisu i tekstu.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                      SEO Naslov *
                    </label>
                    <input
                      type="text"
                      value={form.seo_title}
                      onChange={(e) => set('seo_title', e.target.value)}
                      placeholder={form.title || 'SEO naslov (preporuka: 50-60 karaktera)'}
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-brand-red"
                    />
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-gray-400">Preporuka: 50-60 karaktera za Google</p>
                      <span className={cn('text-xs font-mono', seoTitleLen > 60 ? 'text-red-500' : seoTitleLen > 50 ? 'text-green-600' : 'text-gray-400')}>
                        {seoTitleLen}/60
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                      Meta Description *
                    </label>
                    <textarea
                      value={form.seo_description}
                      onChange={(e) => set('seo_description', e.target.value)}
                      placeholder="Opis koji se prikazuje u Google rezultatima (preporuka: 150-160 karaktera)..."
                      rows={3}
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-brand-red resize-none"
                    />
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-gray-400">Preporuka: 150-160 karaktera</p>
                      <span className={cn('text-xs font-mono', seoDescLen > 160 ? 'text-red-500' : seoDescLen > 140 ? 'text-green-600' : 'text-gray-400')}>
                        {seoDescLen}/160
                      </span>
                    </div>
                  </div>

                  {/* SERP preview */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Google pregled</p>
                    <div className="space-y-1">
                      <p className="text-xs text-green-700 dark:text-green-500">zrenjanindanas.com › vest › {form.title ? form.title.toLowerCase().replace(/\s+/g, '-').slice(0, 30) : 'naslov-vesti'}</p>
                      <p className="text-blue-700 dark:text-blue-400 font-medium text-base line-clamp-1">
                        {form.seo_title || form.title || 'SEO naslov vesti | Zrenjanin Danas'}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                        {form.seo_description || form.excerpt || 'Meta opis će se prikazati ovde u Google rezultatima pretrage.'}
                      </p>
                    </div>
                  </div>

                  {/* SEO checklist */}
                  <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">SEO analiza</p>
                    <ul className="space-y-2">
                      {seo.checks.map((check) => (
                        <li key={check.id} className="flex items-start gap-2 text-sm">
                          {check.status === 'good' && <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />}
                          {check.status === 'ok' && <MinusCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />}
                          {check.status === 'bad' && <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />}
                          <span
                            className={cn(
                              check.status === 'good' && 'text-gray-600 dark:text-gray-300',
                              check.status === 'ok' && 'text-amber-700 dark:text-amber-400',
                              check.status === 'bad' && 'text-red-600 dark:text-red-400'
                            )}
                          >
                            {check.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Tagovi</label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={form.tags}
                        onChange={(e) => set('tags', e.target.value)}
                        placeholder="Zrenjanin, Vojvodina, infrastruktura (razdvojite zarezom)"
                        className="w-full pl-9 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-brand-red"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Zakazana objava</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="datetime-local"
                        value={form.scheduled_at}
                        onChange={(e) => set('scheduled_at', e.target.value)}
                        className="w-full pl-9 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-brand-red"
                      />
                    </div>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex gap-2 text-sm text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Zakazana objava je aktivna samo u produkciji sa Supabase backend-om.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* SEO score — always visible */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500">SEO ocena</h3>
              <SearchIcon className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center font-black text-sm text-white flex-shrink-0',
                  seo.color === 'green' && 'bg-green-600',
                  seo.color === 'orange' && 'bg-amber-500',
                  seo.color === 'red' && 'bg-red-600'
                )}
              >
                {seo.score}%
              </div>
              <div className="min-w-0">
                <p
                  className={cn(
                    'text-sm font-bold truncate',
                    seo.color === 'green' && 'text-green-700 dark:text-green-400',
                    seo.color === 'orange' && 'text-amber-700 dark:text-amber-400',
                    seo.color === 'red' && 'text-red-700 dark:text-red-400'
                  )}
                >
                  {seo.label}
                </p>
                <p className="text-xs text-gray-400">Prag za objavu: {SEO_PUBLISH_THRESHOLD}%</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('seo')}
              className="w-full mt-3 text-xs font-semibold text-brand-red hover:underline text-left"
            >
              Pogledaj SEO analizu →
            </button>
          </div>

          {/* Publish controls */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-3">Oznake</h3>
            <div className="space-y-2">
              {[
                { key: 'naslovna_velika', label: 'Naslovna velika', color: 'text-red-600' },
                { key: 'naslovna_mala', label: 'Naslovna mala', color: 'text-yellow-600' },
                { key: 'traka_gore', label: 'Traka gore', color: 'text-orange-600' },
              ].map(({ key, label, color }) => (
                <label key={key} className="flex items-center justify-between cursor-pointer group">
                  <span className={cn('text-sm font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors', form[key as keyof typeof form] ? color : 'text-gray-500')}>
                    {label}
                  </span>
                  <div
                    onClick={() => set(key as keyof typeof EMPTY_FORM, !form[key as keyof typeof form])}
                    className={cn(
                      'relative w-10 h-5 rounded-full transition-colors cursor-pointer',
                      form[key as keyof typeof form] ? 'bg-brand-red' : 'bg-gray-200 dark:bg-gray-700'
                    )}
                  >
                    <div className={cn(
                      'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                      form[key as keyof typeof form] ? 'translate-x-5' : 'translate-x-0.5'
                    )} />
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-3">Kategorija *</h3>
            <div className="relative">
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-brand-red appearance-none pr-8"
              >
                {Object.entries(CATEGORY_LABELS).map(([slug, label]) => (
                  <option key={slug} value={slug}>{label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Image */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <h3 className="font-bold text-sm uppercase tracking-wide text-gray-500 mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Naslovna slika
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">URL slike *</label>
                <input
                  type="url"
                  value={form.image_url}
                  onChange={(e) => set('image_url', e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-brand-red"
                />
              </div>
              <ImageUploadButton onUploaded={(url) => set('image_url', url)} />
              <div className="mt-2">
                <ImageGalleryPicker onSelect={(url) => set('image_url', url)} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Alt tekst (SEO) *</label>
                <input
                  type="text"
                  value={form.image_alt}
                  onChange={(e) => set('image_alt', e.target.value)}
                  placeholder="Opis slike za pretraživače..."
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-brand-red"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Izvor slike *</label>
                <input
                  type="text"
                  value={form.image_source}
                  onChange={(e) => set('image_source', e.target.value)}
                  placeholder="npr. Unsplash, Redakcija, ime fotografa..."
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-brand-red"
                />
              </div>
              {form.image_url && (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.image_url} alt={form.image_alt} className="w-full h-full object-cover" />
                </div>
              )}
              {!form.image_url && (
                <div className="aspect-video rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-40" />
                    <p className="text-xs">Pregled slike</p>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-400">
                Preporučene slike:{' '}
                <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline">
                  Unsplash
                </a>
                {' '}· Za Google Discover: min. 1200px širina, format 16:9 (npr. 1200×675px)
              </p>
            </div>
          </div>

          {/* Save buttons */}
          <div className="space-y-2">
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white py-3 rounded-lg font-bold text-sm transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Objavi vest
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-lg font-bold text-sm transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Sačuvaj kao nacrt
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
