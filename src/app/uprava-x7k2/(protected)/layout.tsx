'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart2,
  PlusCircle,
  Bell,
  MessageSquare,
  UserCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/uprava-x7k2/dashboard', icon: LayoutDashboard },
  { label: 'Sve vesti', href: '/uprava-x7k2/articles', icon: FileText },
  { label: 'Nova vest', href: '/uprava-x7k2/articles/new', icon: PlusCircle },
  { label: 'Korisnici', href: '/uprava-x7k2/users', icon: Users },
  { label: 'Komentari', href: '/uprava-x7k2/comments', icon: MessageSquare },
  { label: 'Statistika', href: '/uprava-x7k2/stats', icon: BarChart2 },
  { label: 'Podešavanja', href: '/uprava-x7k2/settings', icon: Settings },
  { label: 'Moj profil', href: '/uprava-x7k2/profile', icon: UserCircle },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null)
    })
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/uprava-x7k2/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-gray-900 text-gray-100 flex flex-col transition-all duration-300',
          sidebarOpen ? 'w-60' : 'w-16'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 h-16">
          {sidebarOpen && (
            <Link href="/uprava-x7k2/dashboard" className="font-headline font-black text-white text-lg leading-tight">
              ZD<span className="text-brand-red">•</span>Admin
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors ml-auto"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium',
                      active
                        ? 'bg-brand-red text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    )}
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User */}
        <div className="border-t border-gray-800 p-4">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center font-bold text-sm text-white">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">Admin</p>
                <p className="text-xs text-gray-400 truncate">{userEmail ?? '...'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 hover:text-brand-red transition-colors"
                title="Odjavi se"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="p-1.5 hover:text-brand-red transition-colors mx-auto block"
              title="Odjavi se"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300',
          sidebarOpen ? 'ml-60' : 'ml-16'
        )}
      >
        {/* Top bar */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-40">
          <h1 className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wide">
            CMS Panel
          </h1>
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:text-brand-red transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-brand-red rounded-full" />
            </button>
            <Link
              href="/"
              target="_blank"
              className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              Pogledaj sajt →
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
