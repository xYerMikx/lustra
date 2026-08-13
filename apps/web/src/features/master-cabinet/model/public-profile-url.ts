export function buildPublicProfilePath(slug: string): string {
  return `/m/${slug}`
}

export function buildPublicProfileUrl(slug: string, origin: string): string {
  const base = origin.replace(/\/$/, '')

  return `${base}${buildPublicProfilePath(slug)}`
}

export function buildQrProfileUrl(slug: string, origin: string): string {
  const url = new URL(buildPublicProfileUrl(slug, origin))
  url.searchParams.set('utm_source', 'qr')

  return url.toString()
}
