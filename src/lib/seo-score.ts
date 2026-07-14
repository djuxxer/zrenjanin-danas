export type SeoCheckStatus = 'good' | 'ok' | 'bad'

export interface SeoCheck {
  id: string
  label: string
  status: SeoCheckStatus
}

export interface SeoScoreInput {
  focus_keyphrase: string
  title: string
  seo_title: string
  seo_description: string
  content: string
  excerpt: string
  image_alt: string
}

export interface SeoScoreResult {
  score: number
  checks: SeoCheck[]
  color: 'red' | 'orange' | 'green'
  label: string
}

const STRIP_HTML = /<[^>]+>/g

/**
 * Yoast-stil SEO provera. Vraća ocenu 0-100 i listu pojedinačnih provera.
 * Ocena 80+ = zeleno (spremno za objavu), 50-79 = narandžasto, <50 = crveno.
 */
export function calculateSeoScore(input: SeoScoreInput): SeoScoreResult {
  const kp = input.focus_keyphrase.trim().toLowerCase()
  const checks: SeoCheck[] = []

  const seoTitle = (input.seo_title || input.title).toLowerCase()
  const seoDesc = input.seo_description.toLowerCase()
  const plainContent = input.content.replace(STRIP_HTML, ' ').replace(/\s+/g, ' ').trim().toLowerCase()
  const wordCount = plainContent.length > 0 ? plainContent.split(' ').filter(Boolean).length : 0

  if (!kp) {
    checks.push({ id: 'keyphrase', label: 'Unesite ključnu frazu (focus keyphrase)', status: 'bad' })
    return { score: 0, checks, color: 'red', label: 'Nedovoljno' }
  }

  checks.push({ id: 'keyphrase', label: 'Ključna fraza je uneta', status: 'good' })

  checks.push({
    id: 'title',
    label: 'Ključna fraza se nalazi u SEO naslovu',
    status: seoTitle.includes(kp) ? 'good' : 'bad',
  })

  checks.push({
    id: 'description',
    label: 'Ključna fraza se nalazi u meta opisu',
    status: seoDesc.includes(kp) ? 'good' : 'bad',
  })

  checks.push({
    id: 'content',
    label: 'Ključna fraza se pojavljuje u tekstu vesti',
    status: plainContent.includes(kp) ? 'good' : 'bad',
  })

  const intro = plainContent.slice(0, 300)
  checks.push({
    id: 'intro',
    label: 'Ključna fraza se pojavljuje na početku teksta',
    status: intro.includes(kp) ? 'good' : 'ok',
  })

  let density = 0
  if (kp && wordCount > 0) {
    const kpWordCount = kp.split(' ').filter(Boolean).length
    const occurrences = plainContent.split(kp).length - 1
    density = (occurrences * kpWordCount * 100) / wordCount
  }
  checks.push({
    id: 'density',
    label: `Gustina ključne fraze u tekstu (${density.toFixed(1)}%, preporuka 0.5–3%)`,
    status: density >= 0.5 && density <= 3 ? 'good' : density > 0 ? 'ok' : 'bad',
  })

  checks.push({
    id: 'title-length',
    label: 'Dužina SEO naslova (preporuka 50-60 karaktera)',
    status: seoTitle.length >= 40 && seoTitle.length <= 60 ? 'good' : seoTitle.length > 0 ? 'ok' : 'bad',
  })

  checks.push({
    id: 'desc-length',
    label: 'Dužina meta opisa (preporuka 120-160 karaktera)',
    status: seoDesc.length >= 120 && seoDesc.length <= 160 ? 'good' : seoDesc.length > 0 ? 'ok' : 'bad',
  })

  checks.push({
    id: 'content-length',
    label: `Dužina teksta vesti (${wordCount} reči, preporuka 300+)`,
    status: wordCount >= 300 ? 'good' : wordCount >= 150 ? 'ok' : 'bad',
  })

  checks.push({
    id: 'alt',
    label: 'Ključna fraza se nalazi u alt tekstu slike',
    status: input.image_alt.toLowerCase().includes(kp) ? 'good' : 'bad',
  })

  checks.push({
    id: 'excerpt',
    label: 'Kratak opis (excerpt) je unet',
    status: input.excerpt.trim().length > 0 ? 'good' : 'bad',
  })

  const points = checks.reduce(
    (sum, c) => sum + (c.status === 'good' ? 1 : c.status === 'ok' ? 0.5 : 0),
    0
  )
  const score = Math.round((points / checks.length) * 100)

  const color = score >= 80 ? 'green' : score >= 50 ? 'orange' : 'red'
  const label = score >= 80 ? 'Odlično' : score >= 50 ? 'Može bolje' : 'Nedovoljno'

  return { score, checks, color, label }
}

export const SEO_PUBLISH_THRESHOLD = 80
