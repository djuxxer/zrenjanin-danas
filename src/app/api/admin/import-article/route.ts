import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { importArticleFromUrl } from '@/lib/import-article'
import { FetchError } from '@/lib/safe-fetch'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Jednostavno ograničenje: najviše 20 uvoza po korisniku u 10 minuta
const recent = new Map<string, number[]>()
const WINDOW_MS = 10 * 60 * 1000
const MAX_IMPORTS = 20

function allowed(userId: string): boolean {
  const now = Date.now()
  const hits = (recent.get(userId) ?? []).filter((t) => now - t < WINDOW_MS)
  if (hits.length >= MAX_IMPORTS) {
    recent.set(userId, hits)
    return false
  }
  hits.push(now)
  recent.set(userId, hits)
  return true
}

export async function POST(request: Request) {
  const supabase = await createClient()

  // Samo prijavljeni članovi redakcije
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sesija je istekla — uloguj se ponovo.' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (!profile || !['admin', 'novinar'].includes(profile.role)) {
    return NextResponse.json({ error: 'Nemaš dozvolu za uvoz vesti.' }, { status: 403 })
  }

  if (!allowed(user.id)) {
    return NextResponse.json({ error: 'Previše uvoza za kratko vreme. Pokušaj ponovo za nekoliko minuta.' }, { status: 429 })
  }

  let url: unknown
  try {
    ;({ url } = await request.json())
  } catch {
    return NextResponse.json({ error: 'Neispravan zahtev.' }, { status: 400 })
  }
  if (typeof url !== 'string' || !url.trim() || url.length > 2000) {
    return NextResponse.json({ error: 'Zalepi link vesti.' }, { status: 400 })
  }

  try {
    const result = await importArticleFromUrl(url, supabase)
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof FetchError) {
      return NextResponse.json({ error: err.message }, { status: 422 })
    }
    console.error('POST /api/admin/import-article failed:', err)
    return NextResponse.json({ error: 'Uvoz nije uspeo. Pokušaj ponovo ili kopiraj tekst ručno.' }, { status: 500 })
  }
}
