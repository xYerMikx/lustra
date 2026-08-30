import {
  refreshAccessSession,
  shouldAttemptSessionRefresh,
} from '@/shared/api/session-refresh'
import { rememberRequestId } from '@/shared/lib/last-request-id'

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
  readonly requestId?: string

  constructor(status: number, body: ApiErrorBody['error']) {
    super(body.message)
    this.name = 'ApiError'
    this.status = status
    this.code = body.code
    this.details = body.details
    this.requestId = body.requestId

    rememberRequestId(body.requestId)
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333'
const CSRF_COOKIE = 'lumira_csrf'
const FALLBACK_ERROR: ApiErrorBody['error'] = {
  code: 'INTERNAL',
  message: 'Ошибка запроса',
}

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

function needsCsrf(method: string): boolean {
  const normalized = method.toUpperCase()

  return normalized !== 'GET' && normalized !== 'HEAD' && normalized !== 'OPTIONS'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (!isRecord(value) || !isRecord(value.error)) {
    return false
  }

  return typeof value.error.code === 'string' && typeof value.error.message === 'string'
}

function isBlobBody(body: BodyInit | null | undefined): body is Blob {
  return typeof Blob !== 'undefined' && body instanceof Blob
}

function isBinaryBody(body: BodyInit | null | undefined): boolean {
  if (!body) {
    return false
  }

  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    return true
  }

  return isBlobBody(body)
}

export async function readJsonBody(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export function toApiError(status: number, payload: unknown): ApiError {
  if (isApiErrorBody(payload)) {
    return new ApiError(status, payload.error)
  }

  return new ApiError(status, FALLBACK_ERROR)
}

async function rawApiFetch(
  path: string,
  init: RequestInit = {},
): Promise<{ response: Response; payload: unknown }> {
  const headers = new Headers(init.headers)

  if (init.body && !headers.has('Content-Type') && !isBinaryBody(init.body)) {
    headers.set('Content-Type', 'application/json')
  }

  if (isBlobBody(init.body) && !headers.has('Content-Type')) {
    headers.set('Content-Type', init.body.type || 'application/octet-stream')
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
    return { response, payload: null }
  }

  const payload = await readJsonBody(response)

  return { response, payload }
}

export async function apiFetch<T = void>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const first = await rawApiFetch(path, init)

  if (first.response.status === 204) {
    return undefined as T
  }

  if (first.response.ok) {
    return first.payload as T
  }

  if (shouldAttemptSessionRefresh(path, first.response.status, false)) {
    const refreshed = await refreshAccessSession()

    if (refreshed) {
      const retry = await rawApiFetch(path, init)

      if (retry.response.status === 204) {
        return undefined as T
      }

      if (retry.response.ok) {
        return retry.payload as T
      }

      throw toApiError(retry.response.status, retry.payload)
    }
  }

  throw toApiError(first.response.status, first.payload)
}
