import type { Metadata } from 'next'
import { searchArticles } from '@/lib/articles'
import { ArticleCard } from '@/components/article/article-card'
import { Search } from 'lucide-react'

interface Props {
  searchParams: Promise<{ q?: string }>
}

export const metadata: Metadata = {
  title: 'Pretraga — Zrenjanin Danas',
  description: 'Pretražite sve vesti na portalu Zrenjanin Danas.',
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim() || ''
  const results = query ? await searchArticles(query) : []

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-headline font-black text-3xl mb-6 flex items-center gap-3">
        <Search className="w-7 h-7 text-brand-red" />
        {query ? `Rezultati za: "${query}"` : 'Pretraga'}
      </h1>

      {query && (
        <p className="text-gray-500 mb-6">
          Pronađeno {results.length} {results.length === 1 ? 'rezultat' : 'rezultata'}
        </p>
      )}

      {!query && (
        <div className="text-center py-20 text-gray-500">
          <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>Koristite pretragu u navigaciji da pronađete vesti.</p>
        </div>
      )}

      {query && results.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl">Nisu pronađene vesti za "{query}".</p>
          <p className="mt-2">Pokušajte sa drugačijim pojmom.</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}
