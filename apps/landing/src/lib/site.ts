/**
 * Public URLs for cross-app links (landing → web).
 * Set PUBLIC_APP_URL per environment (local / staging / prod).
 * Production builds fail without it so localhost never ships in static HTML.
 */
const rawAppUrl = import.meta.env.PUBLIC_APP_URL

if (!rawAppUrl) {
  if (import.meta.env.PROD) {
    throw new Error(
      'PUBLIC_APP_URL is required for production builds (set in apps/landing/.env or CI).',
    )
  }
}

const APP_URL = String(rawAppUrl ?? 'http://localhost:3000').replace(/\/$/, '')

export function getAppUrl(path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`

  return `${APP_URL}${normalized}`
}

export const DEFAULT_OG_PATH = '/og.svg'
