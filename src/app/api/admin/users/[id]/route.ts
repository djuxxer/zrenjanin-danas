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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const guard = await requireAdmin()
    if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

    const { id } = await params
    const { role, password } = await request.json()

    if (!role && !password) {
      return NextResponse.json({ error: 'Uloga ili lozinka su obavezni.' }, { status: 400 })
    }

    const admin = createAdminClient()

    if (role) {
      // Bezbednosna mera: niko ne sme da bude unapređen u Admin ulogu kroz UI/API —
      // to je namerno moguće samo direktno kroz bazu.
      if (role === 'admin') {
        return NextResponse.json(
          { error: 'Unapređenje u Admin ulogu nije dozvoljeno kroz admin panel — samo direktno kroz bazu.' },
          { status: 403 }
        )
      }

      const { error } = await admin.from('profiles').update({ role }).eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ error: 'Lozinka mora imati bar 6 karaktera.' }, { status: 400 })
      }
      // Admin ručno postavlja novu lozinku — ne šalje se nikakav email (nema SMTP-a još uvek).
      const { error } = await admin.auth.admin.updateUserById(id, { password })
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PATCH /api/admin/users/[id] failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Neočekivana greška na serveru.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const guard = await requireAdmin()
    if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status })

    const { id } = await params

    if ('user' in guard && guard.user.id === id) {
      return NextResponse.json({ error: 'Ne možeš obrisati sopstveni nalog.' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { error } = await admin.auth.admin.deleteUser(id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/admin/users/[id] failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Neočekivana greška na serveru.' },
      { status: 500 }
    )
  }
}
