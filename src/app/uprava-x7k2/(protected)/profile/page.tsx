'use client'

import { useEffect, useState } from 'react'
import { Save, Loader2, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ImageUploadButton } from '@/components/admin/image-upload-button'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  novinar: 'Novinar',
}

export default function MyProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('novinar')
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      setUserId(user.id)
      setEmail(user.email ?? '')

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, bio, avatar_url, role')
        .eq('id', user.id)
        .maybeSingle()

      if (profile) {
        setFullName(profile.full_name ?? '')
        setBio(profile.bio ?? '')
        setAvatarUrl(profile.avatar_url ?? '')
        setRole(profile.role ?? 'novinar')
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    if (!userId) return
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { error: saveError } = await supabase
      .from('profiles')
      .update({ full_name: fullName, bio, avatar_url: avatarUrl || null })
      .eq('id', userId)

    setSaving(false)

    if (saveError) {
      setError('Greška: ' + saveError.message)
      return
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="font-headline font-black text-2xl text-gray-900 dark:text-white">Moj profil</h1>
        <p className="text-gray-500 text-sm">Ovi podaci se prikazuju javno na tvojoj autor stranici i uz svaku tvoju vest.</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-red-700 dark:text-red-400 text-sm font-semibold">
          {error}
        </div>
      )}
      {saved && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 text-green-700 dark:text-green-400 text-sm font-semibold">
          ✓ Profil je uspešno sačuvan!
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={fullName} className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 dark:border-gray-800" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <User className="w-7 h-7 text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-semibold text-sm">{email}</p>
            <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full font-bold uppercase">
              {ROLE_LABELS[role] ?? role}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">Ime i prezime</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-brand-red"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">Kratka biografija</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Par rečenica o sebi — obrazovanje, iskustvo, oblast interesovanja..."
            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-brand-red resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">Profilna slika</label>
          <div className="flex items-center gap-3">
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="URL slike..."
              className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-brand-red"
            />
          </div>
          <div className="mt-2 max-w-xs">
            <ImageUploadButton onUploaded={setAvatarUrl} />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Sačuvaj profil
        </button>
      </div>
    </div>
  )
}
