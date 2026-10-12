import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublishedLiveBlogs } from '@/lib/live'
import { SITE_URL } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Uživo',
  description: 'Pratite najvažnije događaje uživo — izborni dan, izlaznost i rezultati.',
  alternates: { canonical: `${SITE_URL}/uzivo` },
}

export default async function LiveIndexPage() {
  const blogs = await getPublishedLiveBlogs()

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="font-headline font-black text-3xl mb-6 text-gray-900 dark:text-white">Uživo</h1>
      {blogs.length === 0 ? (
        <p className="text-gray-500">Trenutno nema aktivnih prenosa.</p>
      ) : (
        <ul className="space-y-4">
          {blogs.map((b) => (
            <li key={b.id}>
              <Link
                href={`/uzivo/${b.slug}`}
                className="block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:border-brand-red transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  {b.status === 'live' ? (
                    <span className="bg-red-600 text-white text-[11px] font-black tracking-widest px-2.5 py-0.5 rounded-full">
                      UŽIVO
                    </span>
                  ) : (
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-[11px] font-black tracking-widest px-2.5 py-0.5 rounded-full">
                      ZAVRŠENO
                    </span>
                  )}
                </div>
                <h2 className="font-headline font-bold text-xl text-gray-900 dark:text-white">{b.title}</h2>
                {b.description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{b.description}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
