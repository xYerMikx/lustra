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

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
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
