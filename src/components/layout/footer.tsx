import Link from 'next/link'
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react'
import { CATEGORY_LABELS } from '@/types'

interface Props {
  facebookUrl?: string | null
  instagramUrl?: string | null
  twitterUrl?: string | null
}

export function Footer({ facebookUrl, instagramUrl, twitterUrl }: Props) {
  const categories = Object.entries(CATEGORY_LABELS)
  const hasSocialLinks = facebookUrl || instagramUrl || twitterUrl

  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300">
      {/* Main footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-brand-red rounded flex items-center justify-center">
                <span className="text-white font-headline font-black text-xl">Z</span>
              </div>
              <div>
                <span className="block font-headline font-black text-xl text-white">ZRENJANIN</span>
                <span className="block text-brand-red font-bold text-xs tracking-[0.3em] uppercase -mt-1">DANAS</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Najnovije vesti iz Zrenjanina, Vojvodine i Srbije. Politika, ekonomija, sport, kultura i hronika.
            </p>
            {hasSocialLinks && (
              <div className="flex items-center gap-3">
                {facebookUrl && (
                  <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="p-2 rounded-full bg-gray-800 hover:bg-brand-red transition-colors">
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {twitterUrl && (
                  <a href={twitterUrl} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="p-2 rounded-full bg-gray-800 hover:bg-brand-red transition-colors">
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {instagramUrl && (
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-2 rounded-full bg-gray-800 hover:bg-brand-red transition-colors">
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 pb-2 border-b border-gray-700">
              Kategorije
            </h3>
            <ul className="space-y-2">
              {categories.map(([slug, label]) => (
                <li key={slug}>
                  <Link
                    href={`/kategorija/${slug}`}
                    className="text-sm hover:text-brand-red transition-colors flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-brand-red"></span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 pb-2 border-b border-gray-700">
              Korisni linkovi
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'O nama', href: '/o-nama' },
                { label: 'Kontakt', href: '/kontakt' },
                { label: 'Oglašavanje', href: '/oglasavanje' },
                { label: 'Politika privatnosti', href: '/privatnost' },
                { label: 'Uslovi korišćenja', href: '/uslovi' },
                { label: 'Impresum', href: '/impresum' },
                { label: 'RSS', href: '/api/rss' },
                { label: 'Sitemap', href: '/sitemap.xml' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-brand-red transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 pb-2 border-b border-gray-700">
              Kontakt
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-red flex-shrink-0" />
                <a href="mailto:redakcija@zrenjanindanas.com" className="hover:text-white transition-colors text-xs">
                  redakcija@zrenjanindanas.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 py-4">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} Zrenjanin Danas. Sva prava zadržana.</span>
          <span>Odgovorno novinarstvo za bolji Zrenjanin</span>
        </div>
      </div>
    </footer>
  )
}
