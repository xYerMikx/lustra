import type { MetadataRoute } from 'next'

const SITE_HOST = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  process.env.PUBLIC_SITE_URL?.trim() ||
  'https://lumira.by'
).replace(/\/$/, '')

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/app/', '/admin/', '/api/'],
      },
    ],
    host: SITE_HOST,
  }
}
