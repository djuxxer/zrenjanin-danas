'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { Search, Menu, X, Sun, Moon, Tv2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORY_LABELS } from '@/types'
import { useWeather } from '@/lib/use-weather'

const categories = Object.entries(CATEGORY_LABELS)

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { weather } = useWeather()

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/pretraga?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-md shadow-md'
          : 'bg-white dark:bg-gray-950 shadow-sm'
      )}
    >
      {/* Top bar */}
      <div className="bg-gray-900 dark:bg-black text-gray-300 text-xs py-1.5">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span id="live-time" className="tabular-nums" suppressHydrationWarning>
              {new Date().toLocaleString('sr-RS', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            {weather && (
              <span className="hidden sm:flex items-center gap-1.5 border-l border-gray-700 pl-4">
                <weather.Icon className="w-3.5 h-3.5" />
                {weather.temp}°C, {weather.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-white transition-colors flex items-center gap-1">
              <Tv2 className="w-3 h-3" />
              <span>LIVE</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Logo bar */}
      <div className="border-b border-gray-100 dark:border-gray-800 py-3">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-10 h-12 flex-shrink-0">
              <Image src="/logo-icon.png" alt="Zrenjanin Danas logo" fill className="object-contain dark:hidden" priority />
              <Image src="/logo-icon-dark.png" alt="Zrenjanin Danas logo" fill className="object-contain hidden dark:block" priority />
            </div>
            <div className="leading-tight">
              <span className="block font-headline font-black text-2xl text-gray-900 dark:text-white tracking-tight">
                ZRENJANIN
              </span>
              <span className="block text-brand-red dark:text-brand-red-accent font-bold text-sm tracking-[0.3em] uppercase -mt-1">
                DANAS
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:text-brand-red transition-colors"
              aria-label="Pretraga"
            >
              {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>

            {/* Dark mode */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 hover:text-brand-red transition-colors"
                aria-label="Promeni temu"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}

            {/* Mobile menu */}
            <button
              className="lg:hidden p-2 hover:text-brand-red transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Meni"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Search bar — pun red, ne gura ostatak header-a na malim ekranima */}
      {searchOpen && (
        <div className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 py-3">
          <div className="container mx-auto px-4">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pretražite vesti..."
                className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:border-brand-red"
              />
              <button
                type="submit"
                className="flex-shrink-0 bg-brand-red hover:bg-brand-red-dark text-white p-2.5 rounded-lg transition-colors"
                aria-label="Pretraži"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Nav links */}
      <nav className="hidden lg:block border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-0">
            <li>
              <Link
                href="/"
                className="block px-4 py-3 text-sm font-bold uppercase tracking-wide hover:text-brand-red hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                Početna
              </Link>
            </li>
            {categories.map(([slug, label]) => (
              <li key={slug}>
                <Link
                  href={`/kategorija/${slug}`}
                  className="block px-4 py-3 text-sm font-semibold uppercase tracking-wide hover:text-brand-red hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            <li>
              <Link href="/" onClick={() => setMobileOpen(false)} className="block px-4 py-3 font-bold">
                Početna
              </Link>
            </li>
            {categories.map(([slug, label]) => (
              <li key={slug}>
                <Link
                  href={`/kategorija/${slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 font-semibold"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}
