import type { Metadata } from 'next'
import { Shield, Users, FileCheck, Mail } from 'lucide-react'
import { SITE_NAME } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'O nama',
  description: `Ko smo mi i kako radimo — uređivačka politika portala ${SITE_NAME}.`,
  robots: { index: true, follow: true },
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="font-headline font-black text-3xl mb-6">O nama</h1>

      <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none space-y-8">
        <section>
          <p className="text-lg leading-relaxed">
            {SITE_NAME} je nezavisni lokalni news portal posvećen izveštavanju o vestima iz Zrenjanina,
            Vojvodine i Srbije. Naš cilj je da građanima Zrenjanina pružimo pravovremene, tačne i relevantne
            informacije o dešavanjima u njihovoj sredini — od lokalne politike i infrastrukture, preko
            privrede, do sporta i kulture.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-brand-red" />
            <h2 className="font-headline font-bold text-xl m-0">Redakcija</h2>
          </div>
          <p>
            Naš tim čine novinari i urednici sa iskustvom u lokalnom izveštavanju. Svaki tekst objavljen na
            portalu potpisan je imenom autora — profile naših novinara možete pogledati klikom na njihovo ime
            ispod naslova svake vesti.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <FileCheck className="w-5 h-5 text-brand-red" />
            <h2 className="font-headline font-bold text-xl m-0">Uređivačka politika</h2>
          </div>
          <p>Rukovodimo se sledećim principima u svakodnevnom radu:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Proveravamo informacije iz najmanje dva nezavisna izvora pre objavljivanja, kad god je to moguće</li>
            <li>Jasno razdvajamo izveštavanje od mišljenja i komentara</li>
            <li>Ispravljamo greške čim ih uočimo ili nam budu prijavljene — vidi sekciju o ispravkama ispod</li>
            <li>Ne objavljujemo sponzorisan sadržaj bez jasne oznake da je reč o oglašavanju</li>
            <li>Poštujemo privatnost pojedinaca koji nisu javne ličnosti</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-brand-red" />
            <h2 className="font-headline font-bold text-xl m-0">Politika ispravki</h2>
          </div>
          <p>
            Trudimo se da svaka objavljena informacija bude tačna, ali greške su ljudske i mogu se desiti.
            Ukoliko primetite netačnost u nekom od naših tekstova, molimo vas da nas obavestite na{' '}
            <a href="mailto:redakcija@zrenjanindanas.rs" className="text-brand-red hover:underline">
              redakcija@zrenjanindanas.rs
            </a>. Greške ćemo ispraviti u najkraćem mogućem roku, a značajne izmene ćemo jasno naznačiti u
            samom tekstu.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-5 h-5 text-brand-red" />
            <h2 className="font-headline font-bold text-xl m-0">Kontakt</h2>
          </div>
          <p>
            Za sva pitanja, sugestije ili prijave grešaka, pišite nam na{' '}
            <a href="mailto:redakcija@zrenjanindanas.rs" className="text-brand-red hover:underline">
              redakcija@zrenjanindanas.rs
            </a>{' '}
            ili posetite našu{' '}
            <a href="/kontakt" className="text-brand-red hover:underline">
              kontakt stranicu
            </a>.
          </p>
        </section>
      </div>
    </div>
  )
}
