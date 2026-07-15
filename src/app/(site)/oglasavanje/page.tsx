import type { Metadata } from 'next'
import { TrendingUp, Users, Target, Mail } from 'lucide-react'
import { SITE_NAME } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Oglašavanje',
  description: `Oglašavajte se na portalu ${SITE_NAME} i dosegnite čitaoce iz Zrenjanina i Vojvodine.`,
  robots: { index: true, follow: true },
}

const REASONS = [
  {
    icon: Users,
    title: 'Lokalna publika',
    desc: 'Dosežite čitaoce koji žive i rade u Zrenjaninu i okolini — direktno relevantnu ciljnu grupu za lokalni biznis.',
  },
  {
    icon: Target,
    title: 'Kontekstualno oglašavanje',
    desc: 'Vaš oglas se prikazuje uz kvalitetan, relevantan sadržaj kojem čitaoci veruju.',
  },
  {
    icon: TrendingUp,
    title: 'Merljivi rezultati',
    desc: 'Redovni izveštaji o broju prikaza i klikova na vaš oglas, transparentno i bez skrivenih troškova.',
  },
]

export default function AdvertisingPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="font-headline font-black text-3xl mb-2">Oglašavanje</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-10 text-lg">
        Predstavite svoj biznis hiljadama čitalaca iz Zrenjanina i Vojvodine svakog dana.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {REASONS.map((reason) => {
          const Icon = reason.icon
          return (
            <div key={reason.title} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <Icon className="w-6 h-6 text-brand-red mb-3" />
              <h3 className="font-bold text-sm mb-1">{reason.title}</h3>
              <p className="text-xs text-gray-500">{reason.desc}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
        <h2 className="font-headline font-bold text-xl mb-3">Formati oglašavanja</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-300 mb-6">
          <li>Bannere na naslovnoj strani i unutar kategorija</li>
          <li>Sponzorisane vesti (jasno označene kao takve)</li>
          <li>Oglasi u newsletter-u</li>
          <li>Pakete po meri za dugoročnu saradnju</li>
        </ul>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Mail className="w-5 h-5 text-brand-red flex-shrink-0" />
          <p className="text-sm">
            Za cenovnik i dostupne termine, pišite nam na{' '}
            <a href="mailto:redakcija@zrenjanindanas.rs" className="text-brand-red hover:underline font-semibold">
              redakcija@zrenjanindanas.rs
            </a>{' '}
            sa naznakom &ldquo;Oglašavanje&rdquo;.
          </p>
        </div>
      </div>
    </div>
  )
}
