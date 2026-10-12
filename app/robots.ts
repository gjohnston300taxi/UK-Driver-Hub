import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// Google reads this at https://www.ukdriverhub.org/robots.txt
// It says which parts of the site search engines should skip.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/signin', '/signup', '/onboarding', '/profile', '/reset-password'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
