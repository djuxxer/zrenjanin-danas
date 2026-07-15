import Link from 'next/link'
import { Home, Search } from 'lucide-react'
import { SITE_NAME } from '@/lib/utils'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-lg text-center">
      <div className="w-20 h-20 bg-brand-red rounded-2xl flex items-center justify-center mx-auto mb-6">
        <span className="text-white font-headline font-black text-4xl">404</span>
      </div>
      <h1 className="font-headline font-black text-3xl mb-3">Stranica nije pronađena</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Vest ili stranica koju tražite ne postoji, ili je uklonjena. Proverite link, ili se vratite na
        naslovnu stranicu portala {SITE_NAME}.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors"
        >
          <Home className="w-4 h-4" />
          Nazad na početnu
        </Link>
        <Link
          href="/pretraga"
          className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors"
        >
          <Search className="w-4 h-4" />
          Pretraži vesti
        </Link>
      </div>
    </div>
  )
}
