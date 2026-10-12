import type { SupabaseClient } from '@supabase/supabase-js'

// Tipovi i funkcije za "Uživo" prenos — bezbedno za import i na serveru i u browseru
// (ne uvlači next/headers).

export interface LiveBlog {
  id: string
  slug: string
  title: string
  description: string
  status: 'live' | 'ended'
  published: boolean
  turnout_title: string
  results_title: string
  results_note: string | null
  created_at: string
  updated_at: string
  ended_at: string | null
}

export interface LiveEntry {
  id: string
  blog_id: string
  kind: 'update' | 'important'
  title: string | null
  body: string
  image_url: string | null
  pinned: boolean
  created_at: string
  updated_at: string
}

export interface LiveTurnoutPoint {
  id: string
  blog_id: string
  label: string
  sort_order: number
  percent: number
  compare_percent: number | null
}

export interface LiveResult {
  id: string
  blog_id: string
  name: string
  color: string
  percent: number
  votes: number | null
  seats: number | null
  sort_order: number
}

export interface LiveBundle {
  blog: LiveBlog
  entries: LiveEntry[]
  turnout: LiveTurnoutPoint[]
  results: LiveResult[]
}

const toNum = (v: unknown): number => (v === null || v === undefined ? 0 : Number(v))
const toNumOrNull = (v: unknown): number | null =>
  v === null || v === undefined ? null : Number(v)

export function normalizeTurnout(rows: LiveTurnoutPoint[]): LiveTurnoutPoint[] {
  return rows
    .map((r) => ({
      ...r,
      percent: toNum(r.percent),
      compare_percent: toNumOrNull(r.compare_percent),
    }))
    .sort((a, b) => a.sort_order - b.sort_order)
}

export function normalizeResults(rows: LiveResult[]): LiveResult[] {
  return rows
    .map((r) => ({
      ...r,
      percent: toNum(r.percent),
      votes: toNumOrNull(r.votes),
      seats: toNumOrNull(r.seats),
    }))
    .sort((a, b) => b.percent - a.percent || a.sort_order - b.sort_order)
}

export function sortEntries(rows: LiveEntry[]): LiveEntry[] {
  // Prikačene objave idu prve, ostale od najnovije ka najstarijoj
  return [...rows].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

/** Učitava sve podatke jednog prenosa. Radi sa bilo kojim Supabase klijentom (server ili browser). */
export async function fetchLiveBundle(
  supabase: SupabaseClient,
  blogId: string
): Promise<LiveBundle | null> {
  const [blogRes, entriesRes, turnoutRes, resultsRes] = await Promise.all([
    supabase.from('live_blogs').select('*').eq('id', blogId).maybeSingle(),
    supabase.from('live_entries').select('*').eq('blog_id', blogId),
    supabase.from('live_turnout').select('*').eq('blog_id', blogId),
    supabase.from('live_results').select('*').eq('blog_id', blogId),
  ])

  if (!blogRes.data) return null

  return {
    blog: blogRes.data as LiveBlog,
    entries: sortEntries((entriesRes.data ?? []) as LiveEntry[]),
    turnout: normalizeTurnout((turnoutRes.data ?? []) as LiveTurnoutPoint[]),
    results: normalizeResults((resultsRes.data ?? []) as LiveResult[]),
  }
}

/** "12:00" -> 720 (minuti od ponoći), za redosled na grafikonu. Vraća null ako format nije vreme. */
export function labelToMinutes(label: string): number | null {
  const m = label.trim().match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(?:h|č|časova)?$/i)
  if (!m) return null
  const h = Number(m[1])
  const min = m[2] ? Number(m[2]) : 0
  if (h > 23 || min > 59) return null
  return h * 60 + min
}
