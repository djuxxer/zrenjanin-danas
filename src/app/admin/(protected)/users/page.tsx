'use client'

import { useEffect, useState } from 'react'
import { UserPlus, Edit, Trash2, Shield, User, Feather, Loader2, X } from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'
import type { UserRole } from '@/types'

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; icon: typeof Shield; desc: string }> = {
  admin: { label: 'Admin', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: Shield, desc: 'Pun pristup svim funkcijama' },
  urednik: { label: 'Urednik', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: User, desc: 'Odobrava i objavljuje vesti' },
  novinar: { label: 'Novinar', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Feather, desc: 'Kreira i uređuje vesti' },
}

interface AdminUser {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url: string | null
  articles: number
  last_sign_in_at: string | null
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('novinar')
  const [inviting, setInviting] = useState(false)
  const [inviteMessage, setInviteMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function loadUsers() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Greška pri učitavanju korisnika.')
      setUsers(data.users)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Greška pri učitavanju korisnika.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  async function handleInvite() {
    if (!inviteEmail.trim()) return
    setInviting(true)
    setInviteMessage(null)

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole, full_name: inviteName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Greška prilikom slanja pozivnice.')

      setInviteMessage({ type: 'success', text: `Pozivnica poslata na ${inviteEmail}.` })
      setInviteEmail('')
      setInviteName('')
      setInviteRole('novinar')
      await loadUsers()
    } catch (e) {
      setInviteMessage({ type: 'error', text: e instanceof Error ? e.message : 'Greška prilikom slanja pozivnice.' })
    } finally {
      setInviting(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Da li sigurno želiš da obrišeš korisnika "${name}"? Ova akcija je nepovratna.`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Greška prilikom brisanja.')
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Greška prilikom brisanja.')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleRoleChange(id: string, role: UserRole) {
    const prev = users
    setUsers((p) => p.map((u) => (u.id === id ? { ...u, role } : u)))
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setUsers(prev)
      alert('Greška prilikom izmene uloge.')
    }
  }

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline font-black text-2xl text-gray-900 dark:text-white">Korisnici</h1>
          <p className="text-gray-500 text-sm">{users.length} registrovanih korisnika</p>
        </div>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Pozovi korisnika
        </button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-brand-red/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">Pozovi novog korisnika</h3>
            <button onClick={() => setShowInvite(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {inviteMessage && (
            <div
              className={cn(
                'text-sm rounded-lg px-3 py-2 mb-3',
                inviteMessage.type === 'success'
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              )}
            >
              {inviteMessage.text}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Ime i prezime</label>
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Petar Petrović"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-brand-red"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Email adresa</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="ime@zrenjanindanas.rs"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-brand-red"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Uloga</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-brand-red"
              >
                {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
                  <option key={role} value={role}>{cfg.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInvite}
              disabled={inviting || !inviteEmail.trim()}
              className="flex items-center gap-2 btn-primary text-sm py-2 disabled:opacity-60"
            >
              {inviting && <Loader2 className="w-4 h-4 animate-spin" />}
              Pošalji pozivnicu
            </button>
            <button onClick={() => setShowInvite(false)} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">
              Otkaži
            </button>
          </div>
        </div>
      )}

      {/* Role legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Object.entries(ROLE_CONFIG).map(([role, cfg]) => {
          const Icon = cfg.icon
          return (
            <div key={role} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-gray-500" />
                <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', cfg.color)}>{cfg.label}</span>
              </div>
              <p className="text-xs text-gray-500">{cfg.desc}</p>
            </div>
          )
        })}
      </div>

      {/* Users table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-12 text-red-500 text-sm">{error}</div>
        )}

        {!loading && !error && (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {users.map((user) => {
              const roleConfig = ROLE_CONFIG[user.role]
              const RoleIcon = roleConfig.icon
              return (
                <div key={user.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{user.full_name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-1">
                    <RoleIcon className="w-3 h-3 text-gray-400" />
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border-0 cursor-pointer', roleConfig.color)}
                    >
                      {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
                        <option key={role} value={role}>{cfg.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="hidden md:block text-center">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{user.articles}</p>
                    <p className="text-xs text-gray-400">vesti</p>
                  </div>
                  <div className="hidden md:block">
                    <span className="text-xs text-gray-400">
                      {user.last_sign_in_at ? timeAgo(user.last_sign_in_at) : 'Nikad se nije ulogovao'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDelete(user.id, user.full_name)}
                      disabled={deletingId === user.id}
                      className="p-1.5 hover:text-red-600 transition-colors rounded hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-50"
                      title="Obriši"
                    >
                      {deletingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )
            })}
            {users.length === 0 && (
              <div className="text-center py-12 text-gray-500 text-sm">Nema registrovanih korisnika.</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
