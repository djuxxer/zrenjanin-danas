'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCw, Home } from 'lucide-react'

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-24 max-w-lg text-center">
      <div className="w-20 h-20 bg-gray-900 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="w-10 h-10 text-brand-red" />
      </div>
      <h1 className="font-headline font-black text-2xl mb-3">Nešto je pošlo po zlu</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Došlo je do neočekivane greške prilikom učitavanja stranice. Probaj ponovo, ili se vrati na naslovnu.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors"
        >
          <RotateCw className="w-4 h-4" />
          Pokušaj ponovo
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors"
        >
          <Home className="w-4 h-4" />
          Nazad na početnu
        </Link>
      </div>
    </div>
  )
}
