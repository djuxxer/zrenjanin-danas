'use client'

import { useEffect, useRef, useState } from 'react'
import { Pin, RefreshCw, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { fetchLiveBundle, type LiveBundle } from '@/lib/live-shared'
import { TurnoutChart, ResultsChart } from '@/components/live/charts'
import { cn } from '@/lib/utils'

const TZ = 'Europe/Belgrade'

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('sr-Latn-RS', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function fmtDay(iso: string): string {
  return new Date(iso).toLocaleDateString('sr-Latn-RS', {
    timeZone: TZ,
    day: 'numeric',
    month: 'long',
  })
}

const POLL_MS = 20_000

export function LiveView({ initial }: { initial: LiveBundle }) {
  const [bundle, setBundle] = useState<LiveBundle>(initial)
  const [refreshedAt, setRefreshedAt] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set())
  const knownIds = useRef<Set<string>>(new Set(initial.entries.map((e) => e.id)))

  const isLive = bundle.blog.status === 'live'

  useEffect(() => {
    if (!isLive) return
    const supabase = createClient()
    let cancelled = false

    async function refresh() {
      if (document.hidden) return
      try {
        const next = await fetchLiveBundle(supabase, initial.blog.id)
        if (cancelled || !next) return
        const newOnes = next.entries.filter((e) => !knownIds.current.has(e.id)).map((e) => e.id)
        if (newOnes.length > 0) {
          newOnes.forEach((id) => knownIds.current.add(id))
          setFreshIds(new Set(newOnes))
          setTimeout(() => setFreshIds(new Set()), 6000)
        }
        setBundle(next)
        setFailed(false)
        setRefreshedAt(new Date().toISOString())
      } catch {
        if (!cancelled) setFailed(true)
      }
    }

    const timer = setInterval(refresh, POLL_MS)
    const onVisible = () => {
      if (!document.hidden) refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [isLive, initial.blog.id])

  const { blog, entries, turnout, results } = bundle
  const lastTurnout = turnout[turnout.length - 1]

  return (
    <div className="space-y-6">
      {/* Zaglavlje */}
      <header className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-7">
        <div className="flex items-center gap-3 mb-3">
          {isLive ? (
            <span className="inline-flex items-center gap-2 bg-red-600 text-white text-xs font-black tracking-widest px-3 py-1 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              UŽIVO
            </span>
          ) : (
            <span className="inline-flex items-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-black tracking-widest px-3 py-1 rounded-full">
              PRENOS ZAVRŠEN
            </span>
          )}
          {isLive && (
            <span className="text-xs text-gray-500 flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3" />
              Stranica se sama osvežava
              {refreshedAt && <span suppressHydrationWarning>· {fmtTime(refreshedAt)}</span>}
            </span>
          )}
        </div>
        <h1 className="font-headline font-black text-2xl sm:text-4xl text-gray-900 dark:text-white leading-tight">
          {blog.title}
        </h1>
        {blog.description && (
          <p className="mt-3 text-gray-600 dark:text-gray-300 text-base sm:text-lg">{blog.description}</p>
        )}
        {failed && (
          <p className="mt-3 text-xs text-amber-600 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Osvežavanje trenutno ne uspeva, pokušavamo ponovo…
          </p>
        )}
      </header>

      {/* Grafikoni */}
      {(turnout.length > 0 || results.length > 0) && (
        <div className={cn('grid gap-6', turnout.length > 0 && results.length > 0 ? 'lg:grid-cols-2' : '')}>
          {turnout.length > 0 && (
            <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
              <div className="flex items-baseline justify-between gap-3 mb-3">
                <h2 className="font-headline font-black text-xl text-gray-900 dark:text-white">
                  {blog.turnout_title}
                </h2>
                {lastTurnout && (
                  <span className="text-right">
                    <span className="block text-3xl font-black text-brand-red dark:text-brand-red-accent leading-none">
                      {String(lastTurnout.percent).replace('.', ',')}%
                    </span>
                    <span className="text-xs text-gray-500">u {lastTurnout.label}</span>
                  </span>
                )}
              </div>
              <TurnoutChart points={turnout} />
            </section>
          )}

          {results.length > 0 && (
            <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
              <h2 className="font-headline font-black text-xl text-gray-900 dark:text-white">
                {blog.results_title}
              </h2>
              {blog.results_note && (
                <p className="text-xs text-gray-500 mb-4 mt-0.5">{blog.results_note}</p>
              )}
              {!blog.results_note && <div className="mb-4" />}
              <ResultsChart results={results} />
            </section>
          )}
        </div>
      )}

      {/* Feed */}
      <section>
        <h2 className="font-headline font-black text-xl text-gray-900 dark:text-white mb-4">
          Najnovije informacije
        </h2>
        {entries.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center text-gray-500 text-sm">
            Prve informacije stižu uskoro.
          </div>
        ) : (
          <ol className="space-y-4">
            {entries.map((e) => (
              <li
                key={e.id}
                id={`objava-${e.id}`}
                className={cn(
                  'bg-white dark:bg-gray-900 rounded-2xl border p-5 flex gap-4',
                  e.kind === 'important'
                    ? 'border-l-4 border-l-red-600 border-gray-200 dark:border-gray-800'
                    : 'border-gray-200 dark:border-gray-800',
                  freshIds.has(e.id) && 'animate-fade-in ring-2 ring-brand-red-accent'
                )}
              >
                <div className="w-14 flex-shrink-0 text-center">
                  <div className="font-black text-lg text-brand-red dark:text-brand-red-accent tabular-nums leading-none">
                    {fmtTime(e.created_at)}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">{fmtDay(e.created_at)}</div>
                </div>
                <div className="min-w-0 flex-1">
                  {(e.pinned || e.kind === 'important') && (
                    <div className="flex items-center gap-2 mb-1 text-[11px] font-black uppercase tracking-wider">
                      {e.kind === 'important' && <span className="text-red-600">Važno</span>}
                      {e.pinned && (
                        <span className="text-gray-500 flex items-center gap-1">
                          <Pin className="w-3 h-3" /> Prikačeno
                        </span>
                      )}
                    </div>
                  )}
                  {e.title && (
                    <h3 className="font-headline font-bold text-lg text-gray-900 dark:text-white leading-snug mb-1">
                      {e.title}
                    </h3>
                  )}
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">
                    {e.body}
                  </p>
                  {e.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={e.image_url}
                      alt={e.title || 'Fotografija uz objavu'}
                      loading="lazy"
                      className="mt-3 rounded-xl w-full max-h-[480px] object-cover"
                    />
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}
