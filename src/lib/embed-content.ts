/**
 * Pretvara YouTube i Instagram linkove u sadržaju vesti (kad su na svom redu,
 * bilo kao goli link bilo kao <a> tag) u prave embed plejere.
 *
 * Preporuka za novinare: link nalepiti u svoj pasus/red, ne usred rečenice,
 * da bi automatski prepoznavanje radilo pouzdano.
 */

const YOUTUBE_ID = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
const INSTAGRAM_ID = /instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/
const TWITTER_STATUS = /(?:twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/(\d+)/

function youtubeEmbedHtml(id: string): string {
  return `<div class="video-embed" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:1.5rem 0;border-radius:0.75rem;background:#000;"><iframe src="https://www.youtube.com/embed/${id}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy" title="YouTube video"></iframe></div>`
}

function instagramEmbedHtml(id: string): string {
  return `<div class="instagram-embed" style="margin:1.5rem 0;display:flex;justify-content:center;"><iframe src="https://www.instagram.com/p/${id}/embed" width="400" height="480" style="border:none;border-radius:0.75rem;max-width:100%;" scrolling="no" loading="lazy" title="Instagram objava"></iframe></div>`
}

// X/Twitter zahteva njihov zvanicni "blockquote + widgets.js" format da bi se
// prikazala prava kartica (slika/video, ime autora, itd.) — sam iframe nije
// dovoljan kao kod YouTube/Instagram. Skript se ucitava SAMO jednom po strani,
// bez obzira koliko tvitova ima u tekstu (dodaje se na kraju, jednom).
function twitterEmbedHtml(url: string): string {
  return `<blockquote class="twitter-tweet"><a href="${url}"></a></blockquote>`
}

const TWITTER_WIDGETS_SCRIPT = '<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>'

export function embedRichContent(html: string): string {
  let result = html
  let hasTwitterEmbed = false

  // 1) <p> koji sadrži SAMO <a href="...youtube...">...</a>
  result = result.replace(
    /<p>\s*<a[^>]*href="([^"]*(?:youtube\.com\/watch\?v=|youtu\.be\/)[^"]*)"[^>]*>[\s\S]*?<\/a>\s*<\/p>/gi,
    (match, href) => {
      const idMatch = href.match(YOUTUBE_ID)
      return idMatch ? youtubeEmbedHtml(idMatch[1]) : match
    }
  )

  // 2) <p> koji sadrži SAMO goli YouTube link (bez <a> taga)
  result = result.replace(
    /<p>\s*(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[^\s<]+)\s*<\/p>/gi,
    (match, url) => {
      const idMatch = url.match(YOUTUBE_ID)
      return idMatch ? youtubeEmbedHtml(idMatch[1]) : match
    }
  )

  // 3) <p> koji sadrži SAMO <a href="...instagram.com/p ili /reel...">...</a>
  result = result.replace(
    /<p>\s*<a[^>]*href="([^"]*instagram\.com\/(?:p|reel)\/[^"]*)"[^>]*>[\s\S]*?<\/a>\s*<\/p>/gi,
    (match, href) => {
      const idMatch = href.match(INSTAGRAM_ID)
      return idMatch ? instagramEmbedHtml(idMatch[1]) : match
    }
  )

  // 4) <p> koji sadrži SAMO goli Instagram link (bez <a> taga)
  result = result.replace(
    /<p>\s*(https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel)\/[^\s<]+)\s*<\/p>/gi,
    (match, url) => {
      const idMatch = url.match(INSTAGRAM_ID)
      return idMatch ? instagramEmbedHtml(idMatch[1]) : match
    }
  )

  // 5) <p> koji sadrži SAMO <a href="...x.com/.../status/...">...</a> (ili twitter.com)
  result = result.replace(
    /<p>\s*<a[^>]*href="([^"]*(?:twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/\d+[^"]*)"[^>]*>[\s\S]*?<\/a>\s*<\/p>/gi,
    (match, href) => {
      if (!TWITTER_STATUS.test(href)) return match
      hasTwitterEmbed = true
      return twitterEmbedHtml(href)
    }
  )

  // 6) <p> koji sadrži SAMO goli x.com/twitter.com link (bez <a> taga)
  result = result.replace(
    /<p>\s*(https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/\d+[^\s<]*)\s*<\/p>/gi,
    (match, url) => {
      if (!TWITTER_STATUS.test(url)) return match
      hasTwitterEmbed = true
      return twitterEmbedHtml(url)
    }
  )

  if (hasTwitterEmbed) {
    result += TWITTER_WIDGETS_SCRIPT
  }

  return result
}
