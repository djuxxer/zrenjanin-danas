import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Niste ulogovani.', status: 401 as const }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') {
    return { error: 'Samo Admin nalozi mogu da upravljaju korisnicima.', status: 403 as const }
  }

  return { user }
}

export async function GET() {
  try {
    const guard = await requireAdmin()
    if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

    const admin = createAdminClient()

    const [{ data: authUsers, error: authError }, { data: profiles, error: profilesError }, { data: articleCounts }] =
      await Promise.all([
        admin.auth.admin.listUsers({ perPage: 1000 }),
        admin.from('profiles').select('id, full_name, role, avatar_url'),
        admin.from('articles').select('author_id'),
      ])

    if (authError || profilesError) {
      return NextResponse.json(
        { error: authError?.message || profilesError?.message || 'Greška pri učitavanju korisnika.' },
        { status: 500 }
      )
    }

    const countsByAuthor: Record<string, number> = {}
    for (const row of articleCounts ?? []) {
      if (row.author_id) countsByAuthor[row.author_id] = (countsByAuthor[row.author_id] ?? 0) + 1
    }

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

    const users = (authUsers?.users ?? []).map((u) => {
      const profile = profileMap.get(u.id)
      return {
        id: u.id,
        email: u.email ?? '',
        full_name: profile?.full_name ?? u.email?.split('@')[0] ?? 'Bez imena',
        role: profile?.role ?? 'novinar',
        avatar_url: profile?.avatar_url ?? null,
        articles: countsByAuthor[u.id] ?? 0,
        last_sign_in_at: u.last_sign_in_at ?? null,
        created_at: u.created_at,
      }
    })

    return NextResponse.json({ users })
  } catch (err) {
    console.error('GET /api/admin/users failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Neočekivana greška na serveru.' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const guard = await requireAdmin()
    if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

    const { email, password, role, full_name } = await request.json()

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Email, lozinka i uloga su obavezni.' }, { status: 400 })
    }

    // Bezbednosna mera: Admin nalog se ne sme praviti kroz UI/API, samo direktno kroz bazu —
    // ovo važi čak i ako neko pokuša da zaobiđe padajući meni i pošalje zahtev direktno.
    if (role === 'admin') {
      return NextResponse.json(
        { error: 'Admin nalog se ne može kreirati kroz admin panel — samo direktno kroz bazu.' },
        { status: 403 }
      )
    }

    const admin = createAdminClient()

    // Nalog se pravi direktno, sa lozinkom koju je Admin uneo — NE šalje se nikakav email.
    // Admin ručno prosledi email/lozinku novinaru (telefonom, lično, itd.)
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name || email.split('@')[0], role },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Trigger u bazi (003_auto_create_profile.sql) automatski pravi profil red,
    // ali eksplicitno ga ažuriramo za slučaj da trigger nije pokrenut / da postavimo tačnu ulogu.
    if (data.user) {
      await admin
        .from('profiles')
        .upsert({ id: data.user.id, full_name: full_name || email.split('@')[0], role }, { onConflict: 'id' })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('POST /api/admin/users failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Neočekivana greška na serveru.' },
      { status: 500 }
    )
  }
}
