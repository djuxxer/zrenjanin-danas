import type { Metadata } from 'next'
import { SITE_NAME } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Uslovi korišćenja',
  description: `Uslovi korišćenja portala ${SITE_NAME}.`,
  robots: { index: true, follow: true },
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="font-headline font-black text-3xl mb-2">Uslovi korišćenja</h1>
      <p className="text-sm text-gray-500 mb-8">Poslednje ažurirano: {new Date().toLocaleDateString('sr-RS')}</p>

      <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="font-headline font-bold text-xl mb-2">1. Prihvatanje uslova</h2>
          <p>
            Korišćenjem portala {SITE_NAME} prihvatate ove uslove korišćenja u celosti. Ukoliko se ne slažete
            sa bilo kojim delom ovih uslova, molimo vas da ne koristite naš sajt.
          </p>
        </section>

        <section>
          <h2 className="font-headline font-bold text-xl mb-2">2. Sadržaj i autorska prava</h2>
          <p>
            Svi tekstovi, fotografije i drugi materijali objavljeni na portalu {SITE_NAME} su vlasništvo
            redakcije ili se koriste uz odgovarajuću dozvolu/licencu. Zabranjeno je kopiranje, distribucija
            ili komercijalno korišćenje sadržaja bez prethodne pisane saglasnosti redakcije, osim u meri
            dozvoljenoj zakonom (npr. kratki citati uz navođenje izvora).
          </p>
        </section>

        <section>
          <h2 className="font-headline font-bold text-xl mb-2">3. Pravila za komentarisanje</h2>
          <p>Ostavljanjem komentara na portalu obavezujete se da nećete objavljivati sadržaj koji:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Sadrži govor mržnje, uvrede, pretnje ili diskriminaciju po bilo kom osnovu</li>
            <li>Je klevetnički, neistinit ili narušava ugled trećih lica</li>
            <li>Predstavlja spam, reklamiranje ili nepovezan sadržaj</li>
            <li>Krši autorska prava trećih lica</li>
            <li>Je u suprotnosti sa važećim zakonima Republike Srbije</li>
          </ul>
          <p className="mt-2">
            Redakcija zadržava pravo da bez prethodnog obaveštenja ukloni bilo koji komentar koji krši ova
            pravila, kao i da onemogući dalje komentarisanje korisnicima koji ih ponavljano krše. Svi
            komentari prolaze kroz moderaciju pre objavljivanja.
          </p>
        </section>

        <section>
          <h2 className="font-headline font-bold text-xl mb-2">4. Tačnost informacija</h2>
          <p>
            Redakcija ulaže razuman trud da objavljene informacije budu tačne i ažurne u trenutku
            objavljivanja. Ipak, ne garantujemo apsolutnu tačnost, potpunost ili ažurnost svih objavljenih
            sadržaja i ne snosimo odgovornost za eventualne štete nastale usled oslanjanja na te informacije.
          </p>
        </section>

        <section>
          <h2 className="font-headline font-bold text-xl mb-2">5. Newsletter</h2>
          <p>
            Prijavom na newsletter pristajete da primate periodične email poruke sa najnovijim vestima.
            Odjavu možete izvršiti u bilo kom trenutku putem linka koji se nalazi u svakom newsletter mejlu.
          </p>
        </section>

        <section>
          <h2 className="font-headline font-bold text-xl mb-2">6. Spoljašnji linkovi</h2>
          <p>
            Portal može sadržati linkove ka sajtovima trećih strana. Ne snosimo odgovornost za sadržaj,
            politiku privatnosti ili prakse tih sajtova.
          </p>
        </section>

        <section>
          <h2 className="font-headline font-bold text-xl mb-2">7. Izmene uslova</h2>
          <p>
            Zadržavamo pravo da izmenimo ove uslove korišćenja u bilo kom trenutku. Nastavak korišćenja
            portala nakon objavljivanja izmena smatra se prihvatanjem novih uslova.
          </p>
        </section>

        <section>
          <h2 className="font-headline font-bold text-xl mb-2">8. Kontakt</h2>
          <p>
            Za sva pitanja u vezi sa ovim uslovima korišćenja, kontaktirajte nas na{' '}
            <a href="mailto:redakcija@zrenjanindanas.com" className="text-brand-red hover:underline">
              redakcija@zrenjanindanas.com
            </a>.
          </p>
        </section>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300 mt-8">
          <strong>Napomena:</strong> Ovo je opšti template uslova korišćenja. Preporučuje se da ga pregleda
          pravnik pre konačnog objavljivanja, kako bi se osiguralo puno usklađivanje sa važećim propisima.
        </div>
      </div>
    </div>
  )
}
