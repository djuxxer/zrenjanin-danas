import { getLatestArticles } from '@/lib/articles'
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from '@/lib/utils'

export async function GET() {
  const articles = await getLatestArticles(20)

  const rssItems = articles
    .map(
      (article) => `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${SITE_URL}/vest/${article.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/vest/${article.slug}</guid>
      <description><![CDATA[${article.excerpt}]]></description>
      <pubDate>${new Date(article.published_at!).toUTCString()}</pubDate>
      <category>${article.category}</category>
      <enclosure url="${article.image_url}" type="image/jpeg" length="0" />
    </item>`
    )
    .join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>sr-RS</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/api/rss" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
