import type { Metadata } from 'next'
import { Mail, Clock } from 'lucide-react'
import { SITE_NAME } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Kontakt',
  description: `Kontakt podaci redakcije portala ${SITE_NAME}.`,
  robots: { index: true, follow: true },
}

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="font-headline font-black text-3xl mb-2">Kontakt</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Imate vest, sugestiju ili primedbu? Slobodno nas kontaktirajte.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-5">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-brand-red flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Email redakcije</p>
              <a href="mailto:redakcija@zrenjanindanas.com" className="text-gray-600 dark:text-gray-300 text-sm hover:text-brand-red transition-colors">
                redakcija@zrenjanindanas.com
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-brand-red flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Radno vreme redakcije</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Ponedeljak – petak, 08:00 – 16:00</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 space-y-4">
          <h2 className="font-headline font-bold text-lg">Imate vest za nas?</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Ukoliko imate informaciju, dojavu ili predlog teme o kojoj bismo trebalo da izveštavamo, pišite
            nam direktno na email redakcije. Svaku dojavu proveravamo pre eventualnog objavljivanja, a vaš
            identitet čuvamo u tajnosti ukoliko to zatražite.
          </p>
          <h2 className="font-headline font-bold text-lg pt-2">Primetili ste grešku?</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Javite nam se na isti email — pogledajte i našu{' '}
            <a href="/o-nama" className="text-brand-red hover:underline">
              politiku ispravki
            </a>.
          </p>
        </div>
      </div>
    </div>
  )
}
