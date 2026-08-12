export function buildPublicProfilePath(slug: string): string {
  return `/m/${slug}`
}

export function buildPublicProfileUrl(slug: string, origin: string): string {
  const base = origin.replace(/\/$/, '')

  return `${base}${buildPublicProfilePath(slug)}`
}
