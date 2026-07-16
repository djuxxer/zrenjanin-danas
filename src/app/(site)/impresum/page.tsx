import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Impresum',
  description: `Impresum portala ${SITE_NAME}.`,
  robots: { index: true, follow: true },
}

export default function ImpresumPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="font-headline font-black text-3xl mb-6">Impresum</h1>

      <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="font-headline font-bold text-lg mb-2">Naziv portala</h2>
          <p>{SITE_NAME}</p>
        </section>

        <section>
          <h2 className="font-headline font-bold text-lg mb-2">Status</h2>
          <p>
            {SITE_NAME} je nezavisna novinarska inicijativa koja izveštava o vestima iz Zrenjanina, Vojvodine
            i Srbije. Portal trenutno <strong>nije registrovan kao medij u Registru medija</strong> koji vodi
            Agencija za privredne registre (APR).
          </p>
        </section>

        <section>
          <h2 className="font-headline font-bold text-lg mb-2">Odgovorna redakcija</h2>
          <p>
            Za sadržaj objavljen na portalu odgovara redakcija {SITE_NAME}. Kontakt za sva pitanja, primedbe,
            zahteve za ispravku ili uklanjanje sadržaja:{' '}
            <a href="mailto:redakcija@zrenjanindanas.rs" className="text-brand-red hover:underline">
              redakcija@zrenjanindanas.rs
            </a>
          </p>
        </section>

        <section>
          <h2 className="font-headline font-bold text-lg mb-2">Osnovan</h2>
          <p>2026. godine</p>
        </section>

        <section>
          <h2 className="font-headline font-bold text-lg mb-2">Autorska prava</h2>
          <p>
            Svi tekstovi i fotografije objavljeni na portalu {SITE_NAME}, ukoliko nije drugačije naznačeno,
            vlasništvo su redakcije. Za uslove korišćenja sadržaja, pogledajte našu{' '}
            <a href="/uslovi" className="text-brand-red hover:underline">
              stranicu Uslovi korišćenja
            </a>.
          </p>
        </section>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300 mt-8">
          <strong>Napomena:</strong> Ovaj impresum je informativnog karaktera. Portal trenutno posluje kao
          neregistrovana novinarska inicijativa, ne kao pravno lice. Opšti propisi o odgovornosti za objavljeni
          sadržaj (uključujući zaštitu od klevete i uvrede) primenjuju se bez obzira na status registracije.
          Preporučuje se konsultacija sa pravnikom ukoliko se planira formalna registracija medija.
        </div>
      </div>
    </div>
  )
}
