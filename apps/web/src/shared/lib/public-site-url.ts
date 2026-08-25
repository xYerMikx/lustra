export function publicSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.PUBLIC_SITE_URL?.trim() ||
    'https://lumira.by'

  return raw.replace(/\/$/, '')
}
