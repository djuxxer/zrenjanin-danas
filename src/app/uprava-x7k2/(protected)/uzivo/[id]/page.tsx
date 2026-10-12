'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  Radio,
  Loader2,
  Pin,
  Trash2,
  Pencil,
  ExternalLink,
  Plus,
  Save,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  fetchLiveBundle,
  labelToMinutes,
  type LiveBundle,
  type LiveEntry,
  type LiveResult,
} from '@/lib/live-shared'
import { ImageUploadButton } from '@/components/admin/image-upload-button'
import { TurnoutChart, ResultsChart } from '@/components/live/charts'
import { cn, SITE_URL } from '@/lib/utils'

const inputClass =
  'w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-brand-red'
const labelClass = 'block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5'
const btnPrimary =
  'flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-60'
const cardClass = 'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5'

type Tab = 'objave' | 'izlaznost' | 'rezultati' | 'podesavanja'

const STANDARD_TIMES = ['07:00', '09:00', '12:00', '17:00', '20:00']
const PALETTE = ['#0F2A5C', '#C8102E', '#2E7D32', '#F9A825', '#6A1B9A', '#00897B', '#EF6C00', '#546E7A']

function parseNum(v: string): number | null {
  const t = v.trim().replace(',', '.')
  if (t === '') return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('sr-Latn-RS', {
    timeZone: 'Europe/Belgrade',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

interface ResultRow {
  key: string
  id?: string
  name: string
  color: string
  percent: string
  votes: string
  seats: string
}

function resultToRow(r: LiveResult): ResultRow {
  return {
    key: r.id,
    id: r.id,
    name: r.name,
    color: r.color,
    percent: String(r.percent),
    votes: r.votes === null ? '' : String(r.votes),
    seats: r.seats === null ? '' : String(r.seats),
  }
}

export default function AdminLiveEditorPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [bundle, setBundle] = useState<LiveBundle | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('objave')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const flash = useCallback((msg: string) => {
    setNotice(msg)
    setTimeout(() => setNotice(null), 2500)
  }, [])

  const reload = useCallback(async () => {
    const supabase = createClient()
    const next = await fetchLiveBundle(supabase, id)
    setBundle(next)
    return next
  }, [id])

  useEffect(() => {
    reload().then(() => setLoading(false))
  }, [reload])

  // Označi da je prenos izmenjen (za dateModified u schema markup-u)
  async function touch() {
    const supabase = createClient()
    await supabase.from('live_blogs').update({ updated_at: new Date().toISOString() }).eq('id', id)
  }

  // ── Objave ──────────────────────────────────────────────
  const [eTitle, setETitle] = useState('')
  const [eBody, setEBody] = useState('')
  const [eImage, setEImage] = useState('')
  const [eImportant, setEImportant] = useState(false)
  const [ePinned, setEPinned] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')
  const [editTitle, setEditTitle] = useState('')

  async function addEntry() {
    if (!eBody.trim()) {
      setError('Unesi tekst objave.')
      return
    }
    setBusy(true)
    setError(null)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { error: err } = await supabase.from('live_entries').insert({
      blog_id: id,
      kind: eImportant ? 'important' : 'update',
      title: eTitle.trim() || null,
      body: eBody.trim(),
      image_url: eImage.trim() || null,
      pinned: ePinned,
      author_id: user?.id ?? null,
    })
    if (err) {
      setError(err.message)
    } else {
      setETitle('')
      setEBody('')
      setEImage('')
      setEImportant(false)
      setEPinned(false)
      await touch()
      await reload()
      flash('Objava je dodata.')
    }
    setBusy(false)
  }

  async function updateEntry(entry: LiveEntry, patch: Partial<LiveEntry>) {
    const supabase = createClient()
    const { error: err } = await supabase
      .from('live_entries')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', entry.id)
    if (err) setError(err.message)
    else {
      await touch()
      await reload()
    }
  }

  async function deleteEntry(entry: LiveEntry) {
    if (!window.confirm('Obrisati ovu objavu?')) return
    const supabase = createClient()
    const { error: err } = await supabase.from('live_entries').delete().eq('id', entry.id)
    if (err) setError(err.message)
    else {
      await touch()
      await reload()
    }
  }

  // ── Izlaznost ───────────────────────────────────────────
  const [tLabel, setTLabel] = useState('')
  const [tPercent, setTPercent] = useState('')
  const [tCompare, setTCompare] = useState('')

  async function saveTurnout() {
    const label = tLabel.trim()
    const percent = parseNum(tPercent)
    const compare = parseNum(tCompare)
    if (!label) return setError('Unesi vreme (npr. 12:00).')
    if (percent === null || percent < 0 || percent > 100) return setError('Izlaznost mora biti broj od 0 do 100.')
    if (compare !== null && (compare < 0 || compare > 100)) return setError('Poređenje mora biti broj od 0 do 100.')

    setBusy(true)
    setError(null)
    const supabase = createClient()
    const existing = bundle?.turnout ?? []
    const minutes = labelToMinutes(label)
    const maxOrder = existing.reduce((m, p) => Math.max(m, p.sort_order), 0)
    const sort_order = minutes !== null ? minutes : maxOrder + 1

    const { error: err } = await supabase.from('live_turnout').upsert(
      { blog_id: id, label, sort_order, percent, compare_percent: compare },
      { onConflict: 'blog_id,label' }
    )
    if (err) setError(err.message)
    else {
      setTLabel('')
      setTPercent('')
      setTCompare('')
      await touch()
      await reload()
      flash('Izlaznost je sačuvana.')
    }
    setBusy(false)
  }

  async function deleteTurnout(pointId: string) {
    const supabase = createClient()
    const { error: err } = await supabase.from('live_turnout').delete().eq('id', pointId)
    if (err) setError(err.message)
    else {
      await touch()
      await reload()
    }
  }

  // ── Rezultati ───────────────────────────────────────────
  const [rows, setRows] = useState<ResultRow[]>([])
  const [resultsNote, setResultsNote] = useState('')
  const [resultsInit, setResultsInit] = useState(false)

  useEffect(() => {
    if (bundle && !resultsInit) {
      setRows(bundle.results.map(resultToRow))
      setResultsNote(bundle.blog.results_note ?? '')
      setResultsInit(true)
    }
  }, [bundle, resultsInit])

  function updateRow(key: string, patch: Partial<ResultRow>) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  }

  function addRow() {
    setRows((rs) => [
      ...rs,
      {
        key: `new-${Date.now()}-${rs.length}`,
        name: '',
        color: PALETTE[rs.length % PALETTE.length],
        percent: '',
        votes: '',
        seats: '',
      },
    ])
  }

  async function saveResults() {
    // Validacija
    for (const r of rows) {
      if (!r.name.trim()) return setError('Svaka lista mora imati naziv.')
      const p = parseNum(r.percent)
      if (p === null || p < 0 || p > 100) return setError(`"${r.name}": procenat mora biti od 0 do 100.`)
      const v = parseNum(r.votes)
      if (v !== null && (v < 0 || !Number.isInteger(v))) return setError(`"${r.name}": broj glasova mora biti ceo broj.`)
      const s = parseNum(r.seats)
      if (s !== null && (s < 0 || !Number.isInteger(s))) return setError(`"${r.name}": broj mandata mora biti ceo broj.`)
    }

    setBusy(true)
    setError(null)
    const supabase = createClient()

    const keptIds = rows.filter((r) => r.id).map((r) => r.id as string)
    const toDelete = (bundle?.results ?? []).map((r) => r.id).filter((rid) => !keptIds.includes(rid))

    const payload = (r: ResultRow, i: number) => ({
      blog_id: id,
      name: r.name.trim(),
      color: r.color,
      percent: parseNum(r.percent) ?? 0,
      votes: parseNum(r.votes),
      seats: parseNum(r.seats),
      sort_order: i,
    })

    const existingRows = rows.map((r, i) => ({ r, i })).filter(({ r }) => r.id)
    const newRows = rows.map((r, i) => ({ r, i })).filter(({ r }) => !r.id)

    let err: { message: string } | null = null

    if (toDelete.length > 0) {
      const res = await supabase.from('live_results').delete().in('id', toDelete)
      err = res.error
    }
    if (!err && existingRows.length > 0) {
      const res = await supabase
        .from('live_results')
        .upsert(existingRows.map(({ r, i }) => ({ id: r.id, ...payload(r, i) })))
      err = res.error
    }
    if (!err && newRows.length > 0) {
      const res = await supabase.from('live_results').insert(newRows.map(({ r, i }) => payload(r, i)))
      err = res.error
    }
    if (!err) {
      const res = await supabase
        .from('live_blogs')
        .update({ results_note: resultsNote.trim() || null, updated_at: new Date().toISOString() })
        .eq('id', id)
      err = res.error
    }

    if (err) {
      setError(err.message)
    } else {
      const next = await reload()
      if (next) setRows(next.results.map(resultToRow))
      flash('Rezultati su sačuvani.')
    }
    setBusy(false)
  }

  // ── Podešavanja ─────────────────────────────────────────
  const [sTitle, setSTitle] = useState('')
  const [sDesc, setSDesc] = useState('')
  const [sTurnoutTitle, setSTurnoutTitle] = useState('')
  const [sResultsTitle, setSResultsTitle] = useState('')
  const [settingsInit, setSettingsInit] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (bundle && !settingsInit) {
      setSTitle(bundle.blog.title)
      setSDesc(bundle.blog.description)
      setSTurnoutTitle(bundle.blog.turnout_title)
      setSResultsTitle(bundle.blog.results_title)
      setSettingsInit(true)
    }
  }, [bundle, settingsInit])

  async function saveSettings(extra: Record<string, unknown> = {}, okMsg = 'Podešavanja su sačuvana.') {
    if (!sTitle.trim()) return setError('Naslov ne sme biti prazan.')
    setBusy(true)
    setError(null)
    const supabase = createClient()
    const { error: err } = await supabase
      .from('live_blogs')
      .update({
        title: sTitle.trim(),
        description: sDesc.trim(),
        turnout_title: sTurnoutTitle.trim() || 'Izlaznost birača',
        results_title: sResultsTitle.trim() || 'Rezultati',
        updated_at: new Date().toISOString(),
        ...extra,
      })
      .eq('id', id)
    if (err) setError(err.message)
    else {
      await reload()
      flash(okMsg)
    }
    setBusy(false)
  }

  async function deleteBlog() {
    if (!bundle) return
    if (!window.confirm('TRAJNO obrisati ceo prenos sa svim objavama, izlaznošću i rezultatima?')) return
    const supabase = createClient()
    const { error: err } = await supabase.from('live_blogs').delete().eq('id', id)
    if (err) return setError(err.message)
    router.push('/uprava-x7k2/uzivo')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!bundle) {
    return (
      <div className="max-w-xl space-y-3">
        <p className="text-gray-600">Prenos nije pronađen.</p>
        <Link href="/uprava-x7k2/uzivo" className="text-brand-red font-semibold text-sm">
          ← Nazad na listu
        </Link>
      </div>
    )
  }

  const { blog, entries, turnout } = bundle
  const publicUrl = `${SITE_URL}/uzivo/${blog.slug}`
  const isLive = blog.status === 'live'

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'objave', label: 'Objave', count: entries.length },
    { key: 'izlaznost', label: 'Izlaznost', count: turnout.length },
    { key: 'rezultati', label: 'Rezultati', count: bundle.results.length },
    { key: 'podesavanja', label: 'Podešavanja' },
  ]

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Zaglavlje */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href="/uprava-x7k2/uzivo" className="text-xs text-gray-500 hover:text-brand-red">
            ← Svi prenosi
          </Link>
          <h1 className="font-headline font-black text-xl sm:text-2xl text-gray-900 dark:text-white flex items-center gap-2 mt-1">
            <Radio className="w-5 h-5 text-brand-red flex-shrink-0" />
            <span className="truncate">{blog.title}</span>
          </h1>
          <p className="text-xs mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={cn('font-bold', isLive ? 'text-red-600' : 'text-gray-500')}>
              {isLive ? '● UŽIVO' : 'završeno'}
            </span>
            <span className={blog.published ? 'text-green-600 font-semibold' : 'text-amber-600 font-semibold'}>
              {blog.published ? 'objavljeno' : 'SKICA — javnost ne vidi'}
            </span>
          </p>
        </div>
        {blog.published && (
          <Link
            href={`/uzivo/${blog.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap"
          >
            Pogledaj <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {!blog.published && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-amber-800 dark:text-amber-300 text-sm flex gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            Prenos je još skica. Unosi mogu da se pripremaju, ali ništa nije javno dok u tabu{' '}
            <strong>Podešavanja</strong> ne klikneš „Objavi".
          </span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-red-700 dark:text-red-400 text-sm font-semibold flex justify-between gap-3">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-xs underline flex-shrink-0">
            zatvori
          </button>
        </div>
      )}
      {notice && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 text-green-700 dark:text-green-400 text-sm font-semibold">
          ✓ {notice}
        </div>
      )}

      {/* Tabovi */}
      <div className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-800">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors',
              tab === t.key
                ? 'border-brand-red text-brand-red'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            )}
          >
            {t.label}
            {t.count !== undefined && <span className="ml-1.5 text-xs text-gray-400">({t.count})</span>}
          </button>
        ))}
      </div>

      {/* ───── OBJAVE ───── */}
      {tab === 'objave' && (
        <div className="space-y-4">
          <div className={cn(cardClass, 'space-y-3')}>
            <div>
              <label className={labelClass}>Naslov (opciono)</label>
              <input className={inputClass} value={eTitle} onChange={(e) => setETitle(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Tekst objave</label>
              <textarea
                className={inputClass}
                rows={4}
                value={eBody}
                onChange={(e) => setEBody(e.target.value)}
                placeholder="Šta se dešava…"
              />
            </div>
            <div>
              <label className={labelClass}>Fotografija (opciono)</label>
              <div className="flex flex-wrap items-center gap-2">
                <ImageUploadButton onUploaded={(url) => setEImage(url)} />
                {eImage && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={eImage} alt="" className="h-12 w-12 rounded object-cover" />
                    <button onClick={() => setEImage('')} className="text-xs text-red-600 underline">
                      ukloni
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={eImportant}
                  onChange={(e) => setEImportant(e.target.checked)}
                  className="w-4 h-4 accent-brand-red"
                />
                Označi kao <strong>VAŽNO</strong>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={ePinned}
                  onChange={(e) => setEPinned(e.target.checked)}
                  className="w-4 h-4 accent-brand-red"
                />
                Prikači na vrh
              </label>
            </div>
            <button onClick={addEntry} disabled={busy} className={btnPrimary}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Objavi
            </button>
          </div>

          <div className={cn(cardClass, 'p-0 divide-y divide-gray-100 dark:divide-gray-800')}>
            {entries.length === 0 && (
              <p className="text-center text-sm text-gray-500 py-10">Još nema objava.</p>
            )}
            {entries.map((e) => (
              <div key={e.id} className="p-4 flex gap-3">
                <div className="text-sm font-black text-brand-red tabular-nums w-12 flex-shrink-0">
                  {fmtTime(e.created_at)}
                </div>
                <div className="flex-1 min-w-0">
                  {editingId === e.id ? (
                    <div className="space-y-2">
                      <input
                        className={inputClass}
                        value={editTitle}
                        onChange={(ev) => setEditTitle(ev.target.value)}
                        placeholder="Naslov"
                      />
                      <textarea
                        className={inputClass}
                        rows={4}
                        value={editBody}
                        onChange={(ev) => setEditBody(ev.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            if (!editBody.trim()) return setError('Tekst ne sme biti prazan.')
                            await updateEntry(e, { title: editTitle.trim() || null, body: editBody.trim() })
                            setEditingId(null)
                          }}
                          className="text-xs bg-brand-red text-white px-3 py-1.5 rounded-lg font-semibold"
                        >
                          Sačuvaj
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-xs text-gray-500 underline">
                          Otkaži
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-black uppercase mb-0.5">
                        {e.kind === 'important' && <span className="text-red-600">Važno</span>}
                        {e.pinned && (
                          <span className="text-gray-500 flex items-center gap-1">
                            <Pin className="w-3 h-3" /> Prikačeno
                          </span>
                        )}
                      </div>
                      {e.title && <p className="font-bold text-sm text-gray-900 dark:text-white">{e.title}</p>}
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line break-words">
                        {e.body}
                      </p>
                      {e.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={e.image_url} alt="" className="mt-2 h-20 rounded object-cover" />
                      )}
                    </>
                  )}
                </div>
                {editingId !== e.id && (
                  <div className="flex flex-col sm:flex-row gap-1 flex-shrink-0">
                    <button
                      title={e.pinned ? 'Otkači' : 'Prikači'}
                      onClick={() => updateEntry(e, { pinned: !e.pinned })}
                      className={cn('p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800', e.pinned && 'text-brand-red')}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      title="Izmeni"
                      onClick={() => {
                        setEditingId(e.id)
                        setEditBody(e.body)
                        setEditTitle(e.title ?? '')
                      }}
                      className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      title="Obriši"
                      onClick={() => deleteEntry(e)}
                      className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───── IZLAZNOST ───── */}
      {tab === 'izlaznost' && (
        <div className="space-y-4">
          <div className={cn(cardClass, 'space-y-3')}>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Unesi izlaznost za određeni sat. Ako za isto vreme uneseš ponovo, vrednost se <strong>ažurira</strong>.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {STANDARD_TIMES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTLabel(t)}
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-full border',
                    tLabel === t
                      ? 'bg-brand-red text-white border-brand-red'
                      : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-brand-red'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Vreme</label>
                <input
                  className={inputClass}
                  value={tLabel}
                  onChange={(e) => setTLabel(e.target.value)}
                  placeholder="12:00"
                />
              </div>
              <div>
                <label className={labelClass}>Izlaznost %</label>
                <input
                  className={inputClass}
                  inputMode="decimal"
                  value={tPercent}
                  onChange={(e) => setTPercent(e.target.value)}
                  placeholder="34,5"
                />
              </div>
              <div>
                <label className={labelClass}>Prošli izbori %</label>
                <input
                  className={inputClass}
                  inputMode="decimal"
                  value={tCompare}
                  onChange={(e) => setTCompare(e.target.value)}
                  placeholder="opciono"
                />
              </div>
            </div>
            <button onClick={saveTurnout} disabled={busy} className={btnPrimary}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Sačuvaj izlaznost
            </button>
          </div>

          {turnout.length > 0 && (
            <>
              <div className={cardClass}>
                <p className="text-xs font-bold uppercase text-gray-500 mb-2">Pregled grafikona</p>
                <TurnoutChart points={turnout} />
              </div>
              <div className={cn(cardClass, 'p-0 divide-y divide-gray-100 dark:divide-gray-800')}>
                {turnout.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                    <span className="font-black w-16 tabular-nums">{p.label}</span>
                    <span className="flex-1">
                      <strong>{String(p.percent).replace('.', ',')}%</strong>
                      {p.compare_percent !== null && (
                        <span className="text-gray-500 text-xs ml-2">
                          (prošli: {String(p.compare_percent).replace('.', ',')}%)
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => {
                        setTLabel(p.label)
                        setTPercent(String(p.percent))
                        setTCompare(p.compare_percent === null ? '' : String(p.compare_percent))
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Izmeni"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTurnout(p.id)}
                      className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                      title="Obriši"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ───── REZULTATI ───── */}
      {tab === 'rezultati' && (
        <div className="space-y-4">
          <div className={cn(cardClass, 'space-y-4')}>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Dodaj liste/kandidate i upiši procenat. Glasovi i mandati su opcioni. Na sajtu se sortiraju od najvećeg
              procenta.
            </p>

            {rows.map((r) => (
              <div
                key={r.key}
                className="grid grid-cols-12 gap-2 items-end border-b border-gray-100 dark:border-gray-800 pb-3"
              >
                <div className="col-span-12 sm:col-span-5">
                  <label className={labelClass}>Naziv liste</label>
                  <input
                    className={inputClass}
                    value={r.name}
                    onChange={(e) => updateRow(r.key, { name: e.target.value })}
                  />
                </div>
                <div className="col-span-3 sm:col-span-1">
                  <label className={labelClass}>Boja</label>
                  <input
                    type="color"
                    value={r.color}
                    onChange={(e) => updateRow(r.key, { color: e.target.value })}
                    className="w-full h-[42px] rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent cursor-pointer"
                  />
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <label className={labelClass}>%</label>
                  <input
                    className={inputClass}
                    inputMode="decimal"
                    value={r.percent}
                    onChange={(e) => updateRow(r.key, { percent: e.target.value })}
                  />
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <label className={labelClass}>Glasovi</label>
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    value={r.votes}
                    onChange={(e) => updateRow(r.key, { votes: e.target.value })}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className={labelClass}>Mand.</label>
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    value={r.seats}
                    onChange={(e) => updateRow(r.key, { seats: e.target.value })}
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}
                    className="p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                    title="Ukloni listu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={addRow}
              className="flex items-center gap-1.5 text-sm text-brand-red font-semibold hover:underline"
            >
              <Plus className="w-4 h-4" /> Dodaj listu
            </button>

            <div>
              <label className={labelClass}>Napomena ispod naslova (opciono)</label>
              <input
                className={inputClass}
                value={resultsNote}
                onChange={(e) => setResultsNote(e.target.value)}
                placeholder="Obrađeno 45% biračkih mesta · preliminarni rezultati"
              />
            </div>

            <button onClick={saveResults} disabled={busy} className={btnPrimary}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Sačuvaj rezultate
            </button>
          </div>

          {bundle.results.length > 0 && (
            <div className={cardClass}>
              <p className="text-xs font-bold uppercase text-gray-500 mb-3">Pregled (kako izgleda na sajtu)</p>
              <ResultsChart results={bundle.results} />
            </div>
          )}
        </div>
      )}

      {/* ───── PODEŠAVANJA ───── */}
      {tab === 'podesavanja' && (
        <div className="space-y-4">
          <div className={cn(cardClass, 'space-y-4')}>
            <div>
              <label className={labelClass}>Naslov</label>
              <input className={inputClass} value={sTitle} onChange={(e) => setSTitle(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Opis</label>
              <textarea className={inputClass} rows={3} value={sDesc} onChange={(e) => setSDesc(e.target.value)} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Naslov grafikona izlaznosti</label>
                <input
                  className={inputClass}
                  value={sTurnoutTitle}
                  onChange={(e) => setSTurnoutTitle(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Naslov rezultata</label>
                <input
                  className={inputClass}
                  value={sResultsTitle}
                  onChange={(e) => setSResultsTitle(e.target.value)}
                />
              </div>
            </div>
            <button onClick={() => saveSettings()} disabled={busy} className={btnPrimary}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Sačuvaj podešavanja
            </button>
          </div>

          <div className={cn(cardClass, 'space-y-3')}>
            <p className="text-xs font-bold uppercase text-gray-500">Javna adresa</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2.5 break-all">
                {publicUrl}
              </code>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(publicUrl)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  } catch {
                    setError('Kopiranje nije uspelo — označi adresu i kopiraj ručno.')
                  }
                }}
                className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Kopiraj"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className={cn(cardClass, 'space-y-3')}>
            <p className="text-xs font-bold uppercase text-gray-500">Status i objava</p>
            <div className="flex flex-wrap gap-2">
              {blog.published ? (
                <button
                  onClick={() => saveSettings({ published: false }, 'Prenos je sklonjen sa sajta (skica).')}
                  disabled={busy}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Skloni sa sajta
                </button>
              ) : (
                <button
                  onClick={() => saveSettings({ published: true }, 'Prenos je objavljen!')}
                  disabled={busy}
                  className={btnPrimary}
                >
                  Objavi na sajtu
                </button>
              )}
              {isLive ? (
                <button
                  onClick={() => {
                    if (window.confirm('Završiti prenos? Stranica će prestati da se osvežava, a traka „UŽIVO“ nestaje sa sajta.'))
                      saveSettings({ status: 'ended', ended_at: new Date().toISOString() }, 'Prenos je završen.')
                  }}
                  disabled={busy}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-gray-800 text-white hover:bg-gray-700"
                >
                  Završi prenos
                </button>
              ) : (
                <button
                  onClick={() => saveSettings({ status: 'live', ended_at: null }, 'Prenos je ponovo UŽIVO.')}
                  disabled={busy}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Vrati u „UŽIVO“
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Dok je prenos objavljen i „UŽIVO“, na vrhu cele stranice prikazuje se crvena traka sa linkom ka njemu.
            </p>
          </div>

          <div className="rounded-xl border border-red-200 dark:border-red-900 p-5">
            <p className="text-xs font-bold uppercase text-red-600 mb-2">Opasna zona</p>
            <button
              onClick={deleteBlog}
              className="flex items-center gap-2 text-sm text-red-600 font-semibold hover:underline"
            >
              <Trash2 className="w-4 h-4" /> Trajno obriši ceo prenos
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
