import Link from 'next/link'
import { ExternalLink, Newspaper, RefreshCw } from 'lucide-react'
import { fetchGoogleNewsMonitor } from '@/lib/news-monitor'
import { timeAgo } from '@/lib/utils'

export const metadata = {
  title: 'Pratimo — Zrenjanin Danas Admin',
}

export default async function MonitoringPage() {
  const items = await fetchGoogleNewsMonitor('zrenjanin')

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline font-black text-2xl text-gray-900 dark:text-white flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-brand-red" />
            Pratimo
          </h1>
          <p className="text-gray-500 text-sm">
            Šta drugi trenutno pišu o Zrenjaninu — Google News pretraga, ažurira se svakih 15 minuta.
          </p>
        </div>
        <button
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-brand-red transition-colors"
          title="Osveži stranicu za najnovije rezultate"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {items.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">
            Trenutno nema rezultata (ili je Google News feed privremeno nedostupan).
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.map((item, i) => (
              <Link
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    {item.source && <span className="font-semibold">{item.source}</span>}
                    {item.pubDate && (
                      <>
                        <span>·</span>
                        <span>{timeAgo(item.pubDate)}</span>
                      </>
                    )}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Napomena: prikazujemo samo naslove i linkove ka originalnim izvorima (ne kopiramo sadržaj).
        Rezultati dolaze direktno sa Google News-a i mogu kasniti nekoliko sati do par dana za sveže vesti.
      </p>
    </div>
  )
}
