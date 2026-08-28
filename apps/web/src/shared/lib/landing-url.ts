import { publicSiteUrl } from '@/shared/lib/public-site-url'

export function landingUrl(path = '/'): string {
  const base = publicSiteUrl()

  if (path === '/' || path === '') {
    return `${base}/`
  }

  const withLead = path.startsWith('/') ? path : `/${path}`
  const withTrail = withLead.endsWith('/') ? withLead : `${withLead}/`

  return `${base}${withTrail}`
}
