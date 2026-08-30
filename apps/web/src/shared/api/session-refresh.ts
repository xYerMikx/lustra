const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333'
const CSRF_COOKIE = 'lumira_csrf'
const CSRF_HEADER = 'X-CSRF-Token'

const NO_REFRESH_PATHS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
])

/**
 * Dedupes concurrent refresh calls (header + Require* + Strict Mode can
 * fire several 401s at once). Without this, rotating refresh tokens race and
 * the whole session family gets revoked.
 */
let refreshInFlight: Promise<boolean> | null = null

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') {
    return undefined
  }

  const prefix = `${name}=`
  const match = document.cookie.split('; ').find((row) => row.startsWith(prefix))

  if (!match) {
    return undefined
  }

  return decodeURIComponent(match.slice(prefix.length))
}

function pathOnly(path: string): string {
  const q = path.indexOf('?')

  if (q === -1) {
    return path
  }

  return path.slice(0, q)
}

export function shouldAttemptSessionRefresh(
  path: string,
  status: number,
  alreadyRetried: boolean,
): boolean {
  if (alreadyRetried || status !== 401) {
    return false
  }

  return !NO_REFRESH_PATHS.has(pathOnly(path))
}

async function postRefresh(): Promise<boolean> {
  const headers = new Headers({
    Accept: 'application/json',
  })
  const csrf = readCookie(CSRF_COOKIE)

  if (csrf) {
    headers.set(CSRF_HEADER, csrf)
  }

  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers,
    credentials: 'include',
  })

  return response.ok
}

export function refreshAccessSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = postRefresh().finally(() => {
      refreshInFlight = null
    })
  }

  return refreshInFlight
}
