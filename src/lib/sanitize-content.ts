import sanitizeHtml from 'sanitize-html'

/**
 * Čisti HTML sadržaj vesti pre prikaza na sajtu — sprečava stored XSS napade.
 * Novinari unose "HTML format" teksta kroz plain textarea u adminu; bez ovog
 * koraka, bilo ko sa pristupom novinarskom nalogu mogao bi da ubaci <script>
 * ili event-handler atribute (onerror, onclick...) koji bi se izvršili kod
 * SVAKOG posetioca koji pročita tu vest.
 *
 * Dozvoljeni su samo bezbedni tagovi za formatiranje teksta (p, h2, strong,
 * liste, linkovi, slike, blockquote). Script/style/iframe/event-handleri se
 * uklanjaju. YouTube/Instagram iframe embed-ovi se dodaju POSLE ovog koraka
 * (u embed-content.ts), preko sopstvenog, kontrolisanog koda — ne dolaze od
 * korisničkog unosa, pa ne prolaze kroz ovu proveru.
 */
export function sanitizeArticleContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
      'h2', 'h3', 'h4',
      'ul', 'ol', 'li',
      'a', 'img',
      'blockquote', 'figure', 'figcaption',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'style', 'width', 'height'],
      '*': ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    // Force safe rel/target on all links da se spreči "tabnabbing"
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer nofollow', target: '_blank' }),
    },
  })
}
