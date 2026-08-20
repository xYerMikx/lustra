import { randomUUID } from 'node:crypto'

import { DRAFT_MASTER_PROFILE_ID } from '../ids'
import { apiError, toAuthUserView, type E2eUser, type MockWorld } from './types'
import {
  asRecord,
  clearSessionCookies,
  csrfOk,
  needsCsrf,
  sessionCookie,
  sessionUserId,
  type MockRequest,
  type MockResponse,
} from './http'

export type HandlerResult = {
  response: MockResponse
  cookies?: string[]
}

function currentUser(world: MockWorld, request: MockRequest): E2eUser | null {
  const userId = sessionUserId(request)

  if (!userId) {
    return null
  }

  return world.users.find((item) => item.id === userId) ?? null
}

function requireUser(
  world: MockWorld,
  request: MockRequest,
  role?: E2eUser['role'],
): HandlerResult | { user: E2eUser } {
  if (needsCsrf(request.method, request.pathname) && !csrfOk(request)) {
    return { response: apiError(403, 'FORBIDDEN', 'Недействительный CSRF-токен') }
  }

  const user = currentUser(world, request)

  if (!user) {
    return {
      response: apiError(401, 'UNAUTHENTICATED', 'Нужна авторизация'),
    }
  }

  if (role && user.role !== role) {
    return { response: apiError(403, 'FORBIDDEN', 'Недостаточно прав') }
  }

  return { user }
}

export function handleAuth(
  world: MockWorld,
  request: MockRequest,
): HandlerResult | null {
  const { method, pathname } = request

  if (method === 'POST' && pathname === '/auth/register') {
    const body = asRecord(request.body)
    const email = String(body.email ?? '').toLowerCase()
    const existing = world.users.find((item) => item.email === email)

    if (existing) {
      return {
        response: apiError(400, 'VALIDATION_FAILED', 'Email уже зарегистрирован', {
          fieldErrors: { email: ['Email уже зарегистрирован'] },
        }),
      }
    }

    const role = body.role === 'master' ? 'master' : 'client'
    const user: E2eUser = {
      id: randomUUID(),
      email,
      password: String(body.password ?? ''),
      firstName: String(body.firstName ?? ''),
      lastName: null,
      role,
      emailVerified: false,
      telegramLinked: false,
      profileStatus: role === 'master' ? 'draft' : null,
    }

    world.users.push(user)

    if (role === 'master') {
      world.profiles.push({
        id: randomUUID(),
        slug: `master-${user.id.slice(0, 8)}`,
        displayName: user.firstName,
        headline: null,
        bio: null,
        status: 'draft',
        experienceSince: null,
        languages: null,
        primaryLocation: null,
        contact: null,
      })
    }

    return {
      response: { status: 201, body: { user: toAuthUserView(user) } },
      cookies: sessionCookie(user.id),
    }
  }

  if (method === 'POST' && pathname === '/auth/login') {
    const body = asRecord(request.body)
    const email = String(body.email ?? '').toLowerCase()
    const password = String(body.password ?? '')
    const user = world.users.find((item) => item.email === email)

    if (!user || user.password !== password) {
      return {
        response: apiError(401, 'UNAUTHENTICATED', 'Неверный email или пароль'),
      }
    }

    return {
      response: { status: 200, body: { user: toAuthUserView(user) } },
      cookies: sessionCookie(user.id),
    }
  }

  if (method === 'POST' && pathname === '/auth/password/forgot') {
    const email = String(asRecord(request.body).email ?? '').toLowerCase()
    const user = world.users.find((item) => item.email === email)

    if (user) {
      const token = `e2e-reset-${user.id}`
      world.resetTokens.set(token, user.id)
    }

    return { response: { status: 200, body: { ok: true } } }
  }

  if (method === 'POST' && pathname === '/auth/password/reset') {
    const body = asRecord(request.body)
    const token = String(body.token ?? '')
    const password = String(body.password ?? '')
    const userId = world.resetTokens.get(token)

    if (!userId) {
      return {
        response: apiError(400, 'VALIDATION_FAILED', 'Ссылка недействительна или устарела'),
      }
    }

    const user = world.users.find((item) => item.id === userId)

    if (user) {
      user.password = password
    }

    world.resetTokens.delete(token)

    return { response: { status: 200, body: { ok: true } } }
  }

  if (method === 'POST' && pathname === '/auth/email/verify') {
    const token = String(asRecord(request.body).token ?? '')
    const user = world.users.find((item) => item.id === token.replace('e2e-verify-', ''))

    if (user) {
      user.emailVerified = true
    }

    return { response: { status: 200, body: { ok: true } } }
  }

  if (method === 'POST' && pathname === '/auth/logout') {
    const guarded = requireUser(world, request)

    if ('response' in guarded) {
      return guarded
    }

    return {
      response: { status: 204 },
      cookies: clearSessionCookies(),
    }
  }

  if (method === 'POST' && pathname === '/auth/refresh') {
    const guarded = requireUser(world, request)

    if ('response' in guarded) {
      return guarded
    }

    return {
      response: {
        status: 200,
        body: { user: toAuthUserView(guarded.user) },
      },
      cookies: sessionCookie(guarded.user.id),
    }
  }

  if (method === 'GET' && pathname === '/auth/me') {
    const user = currentUser(world, request)

    if (!user) {
      return {
        response: apiError(401, 'UNAUTHENTICATED', 'Нужна авторизация'),
      }
    }

    return { response: { status: 200, body: toAuthUserView(user) } }
  }

  return null
}

export function handleE2eAdmin(
  world: MockWorld,
  request: MockRequest,
): HandlerResult | null {
  if (request.method === 'POST' && request.pathname === '/__e2e/reset') {
    return { response: { status: 204 } }
  }

  if (request.method === 'GET' && request.pathname === '/__e2e/reset-token') {
    const email = request.searchParams.get('email')?.toLowerCase() ?? ''
    const user = world.users.find((item) => item.email === email)
    const token = [...world.resetTokens.entries()].find((entry) => entry[1] === user?.id)

    return {
      response: {
        status: 200,
        body: { token: token?.[0] ?? null, draftProfileId: DRAFT_MASTER_PROFILE_ID },
      },
    }
  }

  if (request.method === 'GET' && request.pathname === '/health') {
    return {
      response: { status: 200, body: { status: 'ok', ts: new Date().toISOString() } },
    }
  }

  return null
}

export { requireUser, currentUser }
