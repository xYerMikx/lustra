import { isProduction } from '@/common/env/is-production'

export function publicAppUrl(): string {
  const raw = process.env.PUBLIC_APP_URL?.trim()

  if (raw) {
    return raw.replace(/\/$/, '')
  }

  if (isProduction) {
    throw new Error('PUBLIC_APP_URL is required in production')
  }

  return 'http://localhost:3000'
}
