import { getSite } from '@/lib/site-config'

export default function robots() {
  const BASE_URL = getSite().url

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/',
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
