export type ApiErrorBody = {
  error: {
    code: string
    message: string
    details?: unknown
    requestId?: string
  }
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: unknown

  constructor(status: number, body: ApiErrorBody['error']) {
    super(body.message)
    this.name = 'ApiError'
    this.status = status
    this.code = body.code
    this.details = body.details
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333'
const CSRF_COOKIE = 'lustra_csrf'

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') {
    return undefined
  }

  const prefix = `${name}=`
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(prefix))

  if (!match) {
    return undefined
  }

  return decodeURIComponent(match.slice(prefix.length))
}

function needsCsrf(method: string): boolean {
  const normalized = method.toUpperCase()
  return normalized !== 'GET' && normalized !== 'HEAD' && normalized !== 'OPTIONS'
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const method = init.method ?? 'GET'
  if (needsCsrf(method) && !headers.has('X-CSRF-Token')) {
    const csrf = readCookie(CSRF_COOKIE)
    if (csrf) {
      headers.set('X-CSRF-Token', csrf)
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  })

  if (response.status === 204) {
    return undefined as T
  }

  const payload = (await response.json().catch(() => null)) as
    | T
    | ApiErrorBody
    | null

  if (!response.ok) {
    const errorBody =
      payload && typeof payload === 'object' && 'error' in payload
        ? (payload as ApiErrorBody).error
        : { code: 'INTERNAL', message: 'Ошибка запроса' }
    throw new ApiError(response.status, errorBody)
  }

  return payload as T
}
