/**
 * Public URLs for cross-app links (landing → web).
 * Set PUBLIC_APP_URL per environment (local / staging / prod).
 */
const APP_URL = String(import.meta.env.PUBLIC_APP_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  '',
)

export function getAppUrl(path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  
  return `${APP_URL}${normalized}`
}
