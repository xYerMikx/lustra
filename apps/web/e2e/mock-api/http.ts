import type { IncomingMessage, ServerResponse } from 'node:http'

export type BinaryBody = {
  kind: 'binary'
  contentType: string
  bytes: Buffer
}

export type MockRequest = {
  method: string
  pathname: string
  searchParams: URLSearchParams
  cookies: Record<string, string>
  csrfHeader: string | undefined
  idempotencyKey: string | undefined
  body: unknown
}

export type MockResponse = {
  status: number
  body?: unknown
}

const CSRF_SKIP = new Set([
  'POST /auth/register',
  'POST /auth/login',
  'POST /auth/password/forgot',
  'POST /auth/password/reset',
  'POST /auth/email/verify',
])

export function parseCookies(header: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {}

  if (!header) {
    return cookies
  }

  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=')

    if (!name) {
      continue
    }

    cookies[name] = decodeURIComponent(rest.join('='))
  }

  return cookies
}

export function isBinaryBody(value: unknown): value is BinaryBody {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  return (value as BinaryBody).kind === 'binary'
}

function isBinaryContentType(contentType: string): boolean {
  return (
    contentType.startsWith('image/') || contentType === 'application/octet-stream'
  )
}

export async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  if (chunks.length === 0) {
    return null
  }

  const bytes = Buffer.concat(chunks)
  const contentType = String(req.headers['content-type'] ?? '')
    .split(';')[0]
    ?.trim()
    .toLowerCase() ?? ''

  if (isBinaryContentType(contentType)) {
    return {
      kind: 'binary',
      contentType,
      bytes,
    }
  }

  const raw = bytes.toString('utf8')

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function writeCors(req: IncomingMessage, res: ServerResponse): void {
  const origin = req.headers.origin ?? 'http://127.0.0.1:3100'

  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, X-CSRF-Token, Idempotency-Key',
  )
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  )
}

export function sessionCookie(userId: string): string[] {
  const csrf = `csrf-${userId}`

  return [
    `lustra_access=e2e.${userId}; Path=/; HttpOnly; SameSite=Lax`,
    `lustra_refresh=e2e-refresh.${userId}; Path=/; HttpOnly; SameSite=Lax`,
    `lustra_csrf=${csrf}; Path=/; SameSite=Lax`,
  ]
}

export function clearSessionCookies(): string[] {
  return [
    'lustra_access=; Path=/; Max-Age=0; SameSite=Lax',
    'lustra_refresh=; Path=/; Max-Age=0; SameSite=Lax',
    'lustra_csrf=; Path=/; Max-Age=0; SameSite=Lax',
  ]
}

export function needsCsrf(method: string, pathname: string): boolean {
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return false
  }

  return !CSRF_SKIP.has(`${method} ${pathname}`)
}

export function csrfOk(request: MockRequest): boolean {
  const cookieToken = request.cookies.lustra_csrf
  const headerToken = request.csrfHeader

  return Boolean(
    cookieToken && headerToken && cookieToken === headerToken,
  )
}

export function sessionUserId(request: MockRequest): string | null {
  const token = request.cookies.lustra_access

  if (!token?.startsWith('e2e.')) {
    return null
  }

  return token.slice('e2e.'.length)
}

export function sendBytes(
  res: ServerResponse,
  bytes: Buffer,
  contentType: string,
  status = 200,
): void {
  res.statusCode = status
  res.setHeader('Content-Type', contentType)
  res.setHeader('Cache-Control', 'no-store')
  res.end(bytes)
}

export function sendJson(
  res: ServerResponse,
  response: MockResponse,
  extraCookies?: string[],
): void {
  if (extraCookies && extraCookies.length > 0) {
    res.setHeader('Set-Cookie', extraCookies)
  }

  if (response.body === undefined) {
    res.statusCode = response.status
    res.end()

    return
  }

  res.statusCode = response.status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(response.body))
}

export function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value === 'object' && value !== null) {
    return value as Record<string, unknown>
  }

  return {}
}
