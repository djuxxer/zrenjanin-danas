import { getRecentArticlesForNewsSitemap } from '@/lib/articles'
import { SITE_URL, SITE_NAME } from '@/lib/utils'

export const dynamic = 'force-dynamic'

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Poseban sitemap SAMO za Google News — odvojen od regularnog sitemap.xml.
 * Po Google-ovim pravilima sme da sadrži isključivo vesti objavljene u
 * poslednja 48 sata (getRecentArticlesForNewsSitemap already filtrira ovo).
 * Google News od 2024. ne radi na principu "prijavi se i čekaj odobrenje" —
 * ovaj sitemap je jedan od kontinuiranih tehničkih signala koje Google
 * automatski čita da odluči da li i koliko da prikazuje sadržaj u News.
 */
export async function GET() {
  const articles = await getRecentArticlesForNewsSitemap()

  const urls = articles
    .map(
      (article) => `  <url>
    <loc>${SITE_URL}/vest/${article.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(SITE_NAME)}</news:name>
        <news:language>sr</news:language>
      </news:publication>
      <news:publication_date>${article.published_at}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
    </news:news>
  </url>`
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
