import { requireUser, type HandlerResult } from './auth-handlers'
import { apiError, type MockWorld } from './types'
import type { MockRequest } from './http'

export function handleTelegram(
  world: MockWorld,
  request: MockRequest,
): HandlerResult | null {
  const { method, pathname } = request

  if (method === 'POST' && pathname === '/telegram/link/start') {
    const gated = requireUser(world, request)

    if ('response' in gated) {
      return gated
    }

    return {
      response: {
        status: 200,
        body: { deepLink: 'https://t.me/lumira_bot?start=e2e-nonce' },
      },
    }
  }

  if (method === 'DELETE' && pathname === '/telegram/link') {
    const gated = requireUser(world, request)

    if ('response' in gated) {
      return gated
    }

    gated.user.telegramLinked = false

    return { response: { status: 200, body: { ok: true } } }
  }

  if (method === 'POST' && pathname.startsWith('/telegram/probe/')) {
    const gated = requireUser(world, request)

    if ('response' in gated) {
      return gated
    }

    return { response: { status: 200, body: { ok: true } } }
  }

  return null
}

