import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/utils'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Napomena: admin ruta namerno NIJE ovde navedena — robots.txt je javno
        // čitljiv fajl i njegovo navođenje bi otkrilo putanju botovima koji ga skeniraju.
        // Stranica je već zaštićena pravim login-om, to je dovoljna zaštita.
        disallow: ['/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
