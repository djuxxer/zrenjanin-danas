'use client'

import { useState } from 'react'
import { UserPlus, Edit, Trash2, Shield, User, Feather } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; icon: typeof Shield; desc: string }> = {
  admin: { label: 'Admin', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: Shield, desc: 'Pun pristup svim funkcijama' },
  urednik: { label: 'Urednik', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: User, desc: 'Odobrava i objavljuje vesti' },
  novinar: { label: 'Novinar', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Feather, desc: 'Kreira i uređuje vesti' },
}

const DEMO_USERS = [
  { id: '1', full_name: 'Nikola Jovanović', email: 'nikola@banatskiglas.rs', role: 'admin' as UserRole, articles: 45, lastActive: 'Aktivno' },
  { id: '2', full_name: 'Milica Petrović', email: 'milica@banatskiglas.rs', role: 'urednik' as UserRole, articles: 128, lastActive: 'pre 2h' },
  { id: '3', full_name: 'Stefan Nikolić', email: 'stefan@banatskiglas.rs', role: 'novinar' as UserRole, articles: 67, lastActive: 'pre 1 dan' },
  { id: '4', full_name: 'Ana Marković', email: 'ana@banatskiglas.rs', role: 'novinar' as UserRole, articles: 34, lastActive: 'pre 3 dana' },
  { id: '5', full_name: 'Dragan Ilić', email: 'dragan@banatskiglas.rs', role: 'novinar' as UserRole, articles: 19, lastActive: 'pre 1 nedelja' },
]

export default function AdminUsersPage() {
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('novinar')

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline font-black text-2xl text-gray-900 dark:text-white">Korisnici</h1>
          <p className="text-gray-500 text-sm">{DEMO_USERS.length} registrovanih korisnika</p>
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
          <h3 className="font-bold text-sm mb-4">Pozovi novog korisnika</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Email adresa</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="ime@banatskiglas.rs"
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
            <button className="btn-primary text-sm py-2">Pošalji pozivnicu</button>
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
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {DEMO_USERS.map((user) => {
            const roleConfig = ROLE_CONFIG[user.role]
            const RoleIcon = roleConfig.icon
            return (
              <div key={user.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {user.full_name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{user.full_name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  <RoleIcon className="w-3 h-3 text-gray-400" />
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', roleConfig.color)}>
                    {roleConfig.label}
                  </span>
                </div>
                <div className="hidden md:block text-center">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{user.articles}</p>
                  <p className="text-xs text-gray-400">vesti</p>
                </div>
                <div className="hidden md:block">
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    user.lastActive === 'Aktivno'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'text-gray-400'
                  )}>
                    {user.lastActive}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 hover:text-brand-red transition-colors rounded hover:bg-red-50 dark:hover:bg-red-950/20">
                    <Edit className="w-4 h-4" />
                  </button>
                  {user.role !== 'admin' && (
                    <button className="p-1.5 hover:text-red-600 transition-colors rounded hover:bg-red-50 dark:hover:bg-red-950/20">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
