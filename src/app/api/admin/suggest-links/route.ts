import { NextResponse } from 'next/server'
import { suggestRelatedByTitle } from '@/lib/articles'

export async function POST(request: Request) {
  try {
    const { title, excludeId } = await request.json()
    if (!title || typeof title !== 'string') {
      return NextResponse.json({ articles: [] })
    }

    const articles = await suggestRelatedByTitle(title, excludeId)
    return NextResponse.json({
      articles: articles.map((a) => ({ id: a.id, title: a.title, slug: a.slug })),
    })
  } catch (err) {
    console.error('POST /api/admin/suggest-links failed:', err)
    return NextResponse.json({ articles: [] })
  }
}
