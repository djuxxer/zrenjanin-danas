import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Politika privatnosti',
  description: `Politika privatnosti portala ${SITE_NAME} — kako prikupljamo, koristimo i štitimo vaše podatke.`,
  robots: { index: true, follow: true },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="font-headline font-black text-3xl mb-2">Politika privatnosti</h1>
      <p className="text-sm text-gray-500 mb-8">Poslednje ažurirano: {new Date().toLocaleDateString('sr-RS')}</p>

      <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="font-headline font-bold text-xl mb-2">1. Ko smo mi</h2>
          <p>
            {SITE_NAME} je lokalni news portal koji izveštava o vestima iz Zrenjanina, Vojvodine i Srbije.
            Za sva pitanja u vezi sa ovom politikom privatnosti možete nas kontaktirati na{' '}
            <a href="mailto:redakcija@zrenjanindanas.com" className="text-brand-red hover:underline">
              redakcija@zrenjanindanas.com
            </a>.
          </p>
        </section>

        <section>
          <h2 className="font-headline font-bold text-xl mb-2">2. Koje podatke prikupljamo</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Komentari:</strong> ime i email adresa koje unesete prilikom ostavljanja komentara. Email adresa se ne prikazuje javno.</li>
            <li><strong>Newsletter prijava:</strong> email adresa koju dobrovoljno ostavite radi primanja našeg newsletter-a.</li>
            <li><strong>Podaci o korišćenju:</strong> osnovni podaci o poseti (koje stranice posećujete, koliko dugo, tip uređaja) radi razumevanja čitanosti i unapređenja sadržaja.</li>
            <li><strong>Kolačići (cookies):</strong> koristimo kolačiće za analitiku i, ukoliko date saglasnost, za marketinške svrhe (detaljnije u sekciji 5).</li>
          </ul>
        </section>

        <section>
          <h2 className="font-headline font-bold text-xl mb-2">3. Svrha obrade podataka</h2>
          <p>Podatke koristimo isključivo u sledeće svrhe:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Omogućavanje funkcionalnosti komentarisanja i moderacije komentara</li>
            <li>Slanje newsletter-a onima koji su se dobrovoljno prijavili</li>
            <li>Razumevanje čitanosti sadržaja i unapređenje portala</li>
            <li>Sprečavanje zloupotrebe (spam, lažni nalozi)</li>
          </ul>
          <p className="mt-2">Vaše podatke ne prodajemo trećim licima niti ih koristimo u svrhe koje niste odobrili.</p>
        </section>

        <section>
          <h2 className="font-headline font-bold text-xl mb-2">4. Čuvanje podataka</h2>
          <p>
            Podaci se čuvaju u bezbednoj bazi podataka (Supabase) sve dok su nam potrebni za navedene svrhe,
            ili dok ne zatražite njihovo brisanje. Komentare i newsletter prijave možete u svakom trenutku
            zatražiti da obrišemo slanjem zahteva na email naveden u sekciji 1.
          </p>
        </section>

        <section>
          <h2 className="font-headline font-bold text-xl mb-2">5. Kolačići (cookies)</h2>
          <p>
            Koristimo kolačiće za osnovnu analitiku posete (npr. Google Analytics) i, ukoliko je uključeno,
            marketinške alate (npr. Facebook Pixel). Prilikom prve posete sajtu možete prihvatiti ili odbiti
            korišćenje ovih kolačića putem banera koji se prikazuje na dnu ekrana. Odbijanje ne utiče na vašu
            mogućnost čitanja sadržaja portala.
          </p>
        </section>

        <section>
          <h2 className="font-headline font-bold text-xl mb-2">6. Vaša prava</h2>
          <p>U skladu sa Zakonom o zaštiti podataka o ličnosti Republike Srbije, imate pravo da:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Zatražite uvid u podatke koje o vama čuvamo</li>
            <li>Zatražite ispravku netačnih podataka</li>
            <li>Zatražite brisanje vaših podataka</li>
            <li>Povučete saglasnost za korišćenje kolačića u bilo kom trenutku</li>
          </ul>
        </section>

        <section>
          <h2 className="font-headline font-bold text-xl mb-2">7. Izmene ove politike</h2>
          <p>
            Zadržavamo pravo da povremeno ažuriramo ovu politiku privatnosti. Datum poslednje izmene se
            nalazi na vrhu ove stranice. Značajne izmene ćemo istaći na naslovnoj strani portala.
          </p>
        </section>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300 mt-8">
          <strong>Napomena:</strong> Ovo je opšti template politike privatnosti. Preporučuje se da ga pregleda
          pravnik pre konačnog objavljivanja, kako bi se osiguralo puno usklađivanje sa važećim propisima.
        </div>
      </div>
    </div>
  )
}
