import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { User, FileText } from 'lucide-react'
import Image from 'next/image'
import { getAuthorById } from '@/lib/authors'
import { getArticlesByAuthor } from '@/lib/articles'
import { ArticleCard } from '@/components/article/article-card'
import { SITE_NAME, SITE_URL } from '@/lib/utils'

interface Props {
  params: Promise<{ id: string }>
}

const ROLE_LABELS = {
  admin: 'Glavni i odgovorni urednik',
  urednik: 'Urednik',
  novinar: 'Novinar',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const author = await getAuthorById(id)
  if (!author) return { title: 'Autor nije pronađen' }

  return {
    title: author.full_name,
    description: author.bio || `Vesti i tekstovi autora ${author.full_name} na portalu ${SITE_NAME}.`,
    alternates: { canonical: `${SITE_URL}/autor/${id}` },
  }
}

export default async function AuthorPage({ params }: Props) {
  const { id } = await params
  const author = await getAuthorById(id)
  if (!author) notFound()

  const articles = await getArticlesByAuthor(id)

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      {/* Author header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-10 pb-8 border-b border-gray-200 dark:border-gray-800">
        {author.avatar_url ? (
          <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-4 border-white dark:border-gray-800 shadow">
            <Image src={author.avatar_url} alt={author.full_name} fill sizes="96px" className="object-cover" />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 border-4 border-white dark:border-gray-800 shadow">
            <User className="w-10 h-10 text-gray-400" />
          </div>
        )}
        <div className="text-center sm:text-left">
          <h1 className="font-headline font-black text-3xl text-gray-900 dark:text-white">{author.full_name}</h1>
          <p className="text-brand-red font-semibold text-sm mt-1">{ROLE_LABELS[author.role]}</p>
          {author.bio && (
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-3 leading-relaxed max-w-xl">{author.bio}</p>
          )}
          <p className="text-xs text-gray-400 mt-3 flex items-center justify-center sm:justify-start gap-1">
            <FileText className="w-3.5 h-3.5" />
            {articles.length} {articles.length === 1 ? 'objavljena tekst' : 'objavljenih tekstova'}
          </p>
        </div>
      </div>

      {/* Articles by this author */}
      <h2 className="font-headline font-bold text-xl mb-4">Tekstovi autora</h2>
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm py-8 text-center">Još uvek nema objavljenih tekstova.</p>
      )}
    </div>
  )
}
