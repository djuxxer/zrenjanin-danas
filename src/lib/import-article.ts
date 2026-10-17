import { parseHTML } from 'linkedom'
import { Readability } from '@mozilla/readability'
import sharp from 'sharp'
import type { SupabaseClient } from '@supabase/supabase-js'
import { sanitizeArticleContent } from '@/lib/sanitize-content'
import { safeFetch, FetchError } from '@/lib/safe-fetch'
import type { Category } from '@/types'

/**
 * Uvoz vesti sa tuđeg linka: izvuče naslov, tekst i glavnu sliku, očisti HTML
 * i prebaci sliku na naš storage. Novinar samo pregleda i objavljuje.
 */

export interface ImportedArticle {
  title: string
  excerpt: string
  content: string
  category: Category
  image_url: string
  image_alt: string
  image_source: string
  source_url: string
  source_name: string
  warnings: string[]
}

const MAX_HTML_BYTES = 3 * 1024 * 1024
const MAX_IMAGE_BYTES = 12 * 1024 * 1024

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function decodeBody(buffer: Buffer, contentType: string): string {
  let charset = /charset=([\w-]+)/i.exec(contentType)?.[1]
  if (!charset) {
    const head = buffer.subarray(0, 4096).toString('latin1')
    charset = /<meta[^>]+charset=["']?([\w-]+)/i.exec(head)?.[1]
  }
  try {
    return new TextDecoder((charset || 'utf-8').toLowerCase()).decode(buffer)
  } catch {
    return buffer.toString('utf-8')
  }
}

function absolutize(value: string | null | undefined, base: string): string | null {
  if (!value) return null
  const v = value.trim()
  if (!v || v.startsWith('#') || /^(javascript|data|mailto|tel):/i.test(v)) return null
  try {
    return new URL(v, base).toString()
  } catch {
    return null
  }
}

function firstSrcFromSrcset(srcset: string | null | undefined): string | null {
  if (!srcset) return null
  const first = srcset.split(',')[0]?.trim().split(/\s+/)[0]
  return first || null
}

// Skida nastavak tipa " | Naziv sajta" sa naslova
function cleanTitle(title: string, siteName: string, hostname: string): string {
  const t = title.replace(/\s+/g, ' ').trim()
  const parts = t.split(/\s+[|–—-]\s+/)
  if (parts.length < 2) return t
  const last = parts[parts.length - 1].toLowerCase()
  const hostWord = hostname.split('.')[0].toLowerCase()
  const looksLikeSite =
    (siteName && (last.includes(siteName.toLowerCase()) || siteName.toLowerCase().includes(last))) ||
    last.replace(/\s+/g, '').includes(hostWord)
  const rest = parts.slice(0, -1).join(' - ')
  return looksLikeSite && rest.length >= 15 ? rest : t
}

const CATEGORY_KEYWORDS: [Category, RegExp][] = [
  ['hronika', /policij|uhapš|hapš|nesre[ćc]|saobra[ćc]aj|po[žz]ar|ubist|ubij|krađ|pljačk|napad|izbod|povređen|poginu|vatrogas|hitna pomo|tu[žz]ilaštv|osumnji[čc]/i],
  ['sport', /fudbal|košark|odbojk|rukomet|teni|klub|utakmic|turnir|takmi[čc]enj|trener|liga |šampion|sportist|plivan|atletik|reprezentacij/i],
  ['kultura', /izložb|pozorišt|koncert|festival|bioskop|film|knjig|biblioteka|muzej|galerij|pesnik|književ|predstav|manifestacij|umetni/i],
  ['ekonomija', /plat[aeu]|cene|cena |investicij|fabrik|kompanij|preduze[ćc]|zaposl|nezaposl|poljoprivred|subvencij|budžet|inflacij|kredit|izvoz|uvoz|privred/i],
]

export function suggestCategory(text: string): Category {
  for (const [cat, rx] of CATEGORY_KEYWORDS) if (rx.test(text)) return cat
  return 'drustvo'
}

function truncateWords(text: string, max: number): string {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max)
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), 40)).replace(/[.,;:!?-]+$/, '') + '…'
}

async function rehostImage(
  imageUrl: string,
  supabase: SupabaseClient,
  warnings: string[]
): Promise<string | null> {
  try {
    const res = await safeFetch(imageUrl, { maxBytes: MAX_IMAGE_BYTES, accept: 'image/*', timeoutMs: 15_000 })
    const meta = await sharp(res.buffer, { limitInputPixels: 60_000_000 }).metadata()
    if (!meta.width || meta.width < 400) {
      warnings.push('Glavna slika sa te stranice je premala (verovatno logo), pa nije preuzeta. Dodaj sliku ručno.')
      return null
    }
    const out = await sharp(res.buffer, { limitInputPixels: 60_000_000 })
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer()

    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`
    const { error } = await supabase.storage
      .from('article-images')
      .upload(path, out, { contentType: 'image/webp', cacheControl: '3600', upsert: false })
    if (error) {
      warnings.push('Slika je pronađena, ali otpremanje nije uspelo. Dodaj sliku ručno.')
      return null
    }
    return supabase.storage.from('article-images').getPublicUrl(path).data.publicUrl
  } catch (e) {
    warnings.push(
      e instanceof FetchError
        ? `Slika nije preuzeta: ${e.message} Dodaj sliku ručno.`
        : 'Slika nije mogla da se obradi. Dodaj sliku ručno.'
    )
    return null
  }
}

export interface ExtractedArticle {
  title: string
  excerpt: string
  content: string
  category: Category
  imageCandidates: string[]
  siteName: string
}

/** Čista funkcija (bez mreže): iz HTML-a stranice izvlači naslov, tekst, opis i adrese slika. */
export function extractFromHtml(html: string, finalUrl: string): ExtractedArticle {
  const hostname = new URL(finalUrl).hostname.replace(/^www\./, '')
  const { document } = parseHTML(html)

  // ── metapodaci (pre nego što Readability menja dokument) ──
  const meta = (key: string): string =>
    (
      document.querySelector(`meta[property="${key}"]`)?.getAttribute('content') ||
      document.querySelector(`meta[name="${key}"]`)?.getAttribute('content') ||
      ''
    ).trim()

  const siteName = meta('og:site_name') || hostname
  const ogTitle = meta('og:title') || meta('twitter:title')
  const metaDescription = meta('og:description') || meta('description') || meta('twitter:description')
  const imageCandidates: string[] = []
  for (const key of ['og:image', 'og:image:url', 'twitter:image', 'twitter:image:src']) {
    const abs = absolutize(meta(key), finalUrl)
    if (abs && !imageCandidates.includes(abs)) imageCandidates.push(abs)
  }

  // ── apsolutni linkovi i slike pre ekstrakcije ──
  document.querySelectorAll('a[href]').forEach((a: Element) => {
    const abs = absolutize(a.getAttribute('href'), finalUrl)
    if (abs) a.setAttribute('href', abs)
    else a.removeAttribute('href')
  })
  document.querySelectorAll('img').forEach((img: Element) => {
    const src =
      img.getAttribute('src') ||
      img.getAttribute('data-src') ||
      img.getAttribute('data-lazy-src') ||
      firstSrcFromSrcset(img.getAttribute('srcset')) ||
      firstSrcFromSrcset(img.getAttribute('data-srcset'))
    const abs = absolutize(src, finalUrl)
    if (abs) img.setAttribute('src', abs)
  })

  const article = new Readability(document as unknown as Document, { charThreshold: 250 }).parse()
  if (!article || !article.content || (article.textContent ?? '').trim().length < 250) {
    throw new FetchError('Ne mogu da prepoznam tekst vesti na toj stranici. Kopiraj tekst ručno.')
  }

  // ── čišćenje sadržaja ──
  const { document: body } = parseHTML(`<!doctype html><html><body>${article.content}</body></html>`)

  if (imageCandidates.length === 0) {
    const firstImg = body.querySelector('img[src]')?.getAttribute('src')
    if (firstImg) imageCandidates.push(firstImg)
  }

  body
    .querySelectorAll('img, figure, picture, video, audio, iframe, svg, script, style, noscript, form, button, input, aside')
    .forEach((el: Element) => el.remove())

  const title = cleanTitle(ogTitle || article.title || '', siteName, hostname)
  if (!title) throw new FetchError('Ne mogu da pronađem naslov vesti na toj stranici.')

  // prvi podnaslov koji ponavlja naslov — viška je
  const firstHeading = body.querySelector('h1, h2, h3')
  if (firstHeading && firstHeading.textContent?.replace(/\s+/g, ' ').trim().toLowerCase() === title.toLowerCase()) {
    firstHeading.remove()
  }
  // prazni pasusi
  body.querySelectorAll('p').forEach((p: Element) => {
    if (!(p.textContent ?? '').replace(/\u00a0/g, ' ').trim()) p.remove()
  })

  let content = sanitizeArticleContent(body.body.innerHTML)
    .replace(/<\/?div[^>]*>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  if (content.replace(/<[^>]+>/g, '').trim().length < 200) {
    throw new FetchError('Izvučen tekst je prekratak. Kopiraj tekst ručno.')
  }

  const plain = body.body.textContent?.replace(/\s+/g, ' ').trim() ?? ''
  const excerpt = truncateWords(
    metaDescription.length >= 40 ? metaDescription : plain,
    metaDescription.length >= 40 ? 300 : 220
  )

  // navođenje izvora na dnu teksta
  content += `\n<p><em>Izvor: <a href="${escapeHtml(finalUrl)}">${escapeHtml(siteName)}</a></em></p>`

  return {
    title,
    excerpt,
    content,
    category: suggestCategory(`${title} ${plain.slice(0, 700)}`),
    imageCandidates,
    siteName,
  }
}

export async function importArticleFromUrl(rawUrl: string, supabase: SupabaseClient): Promise<ImportedArticle> {
  const warnings: string[] = []

  const page = await safeFetch(rawUrl, { maxBytes: MAX_HTML_BYTES, accept: 'text/html,application/xhtml+xml', timeoutMs: 15_000 })
  if (!/text\/html|application\/xhtml\+xml/.test(page.contentType)) {
    throw new FetchError('Ovaj link nije obična veb stranica (nije HTML).')
  }

  const extracted = extractFromHtml(decodeBody(page.buffer, page.contentType), page.finalUrl)

  // ── slika ──
  let image_url = ''
  for (const candidate of extracted.imageCandidates.slice(0, 2)) {
    const hosted = await rehostImage(candidate, supabase, warnings)
    if (hosted) {
      image_url = hosted
      warnings.length = 0 // upozorenja za neuspele kandidate više nisu važna
      break
    }
  }
  if (!image_url && extracted.imageCandidates.length === 0) {
    warnings.push('Na toj stranici nije pronađena glavna slika. Dodaj sliku ručno.')
  }

  return {
    title: extracted.title,
    excerpt: extracted.excerpt,
    content: extracted.content,
    category: extracted.category,
    image_url,
    image_alt: image_url ? extracted.title : '',
    image_source: image_url ? extracted.siteName : '',
    source_url: page.finalUrl,
    source_name: extracted.siteName,
    warnings: [...new Set(warnings)],
  }
}
