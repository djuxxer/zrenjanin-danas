import Link from 'next/link'
import type { Article } from '@/types'

interface Props {
  articles: Article[]
}

export function BreakingTicker({ articles }: Props) {
  if (articles.length === 0) return null

  const items = [...articles, ...articles]

  return (
    <div className="bg-brand-red text-white py-2 overflow-hidden">
      <div className="flex items-center">
        <div className="flex-shrink-0 bg-white text-brand-red font-extrabold text-xs uppercase tracking-widest px-4 py-0.5 mr-4 z-10">
          UŽIVO
        </div>
        <div className="ticker-wrap flex-1">
          <div className="ticker-content text-sm font-medium">
            {items.map((article, i) => (
              <Link key={`${article.id}-${i}`} href={`/vest/${article.slug}`} className="mr-16 hover:underline">
                <span className="mr-2 opacity-60">▶</span>
                {article.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
