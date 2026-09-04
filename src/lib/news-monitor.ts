export interface NewsMonitorItem {
  title: string
  link: string
  pubDate: string
  source: string
}

function decodeEntities(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

function extractTag(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return match ? decodeEntities(match[1]) : ''
}

/**
 * Povlači i parsira Google News RSS feed za zadati upit (npr. "zrenjanin").
 * Radi server-side (nema CORS ograničenja), i namerno prikazuje SAMO
 * naslov + izvor + link — nikad ne reprodukuje sadržaj članka (autorska prava).
 */
export async function fetchGoogleNewsMonitor(query: string, limit = 30): Promise<NewsMonitorItem[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=sr&gl=RS&ceid=RS:sr`

  try {
    const res = await fetch(url, {
      next: { revalidate: 900 }, // keširaj 15 min
      headers: {
        // Google poslednjih meseci strože blokira zahteve bez "pravog" User-Agent-a —
        // bez ovoga, server-side fetch (bez header-a) biva tretiran kao bot i odbijen.
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
    })
    if (!res.ok) {
      console.error(`Google News RSS vratio status ${res.status} za upit "${query}"`)
      return []
    }
    const xml = await res.text()

    const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/g) ?? []

    return itemBlocks.slice(0, limit).map((block) => {
      const rawTitle = extractTag(block, 'title')
      const link = extractTag(block, 'link')
      const pubDate = extractTag(block, 'pubDate')
      const sourceTag = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i)
      const source = sourceTag ? decodeEntities(sourceTag[1]) : ''

      // Google News naslovi obicno idu kao "Naslov - Izvor" - razdvoji ako izvor vec nije uhvacen
      let title = rawTitle
      if (!source && rawTitle.includes(' - ')) {
        const parts = rawTitle.split(' - ')
        title = parts.slice(0, -1).join(' - ')
      }

      return { title, link, pubDate, source }
    })
  } catch (err) {
    console.error('Greška prilikom povlačenja Google News RSS feed-a:', err)
    return []
  }
}
