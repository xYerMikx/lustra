import { Injectable } from '@nestjs/common'
import type { FastifyReply } from 'fastify'

import {
  ACCESS_COOKIE,
  ACCESS_TTL_SEC,
  CSRF_COOKIE,
  REFRESH_COOKIE,
  REFRESH_TTL_SEC,
} from '../../../common/auth/cookie.constants'
import { generateCsrfToken } from '../domain/token-hash'

export type SessionCookies = {
  accessToken: string
  refreshToken: string
}

@Injectable()
export class AuthCookieService {
  setSession(reply: FastifyReply, tokens: SessionCookies): void {
    const secure = process.env.NODE_ENV === 'production'
    const domain = process.env.COOKIE_DOMAIN || undefined
    const common = {
      path: '/',
      sameSite: 'lax' as const,
      secure,
      domain,
    }

    reply.setCookie(ACCESS_COOKIE, tokens.accessToken, {
      ...common,
      httpOnly: true,
      maxAge: ACCESS_TTL_SEC,
    })
    reply.setCookie(REFRESH_COOKIE, tokens.refreshToken, {
      ...common,
      httpOnly: true,
      maxAge: REFRESH_TTL_SEC,
    })
    reply.setCookie(CSRF_COOKIE, generateCsrfToken(), {
      ...common,
      httpOnly: false,
      maxAge: REFRESH_TTL_SEC,
    })
  }

  clearSession(reply: FastifyReply): void {
    const secure = process.env.NODE_ENV === 'production'
    const domain = process.env.COOKIE_DOMAIN || undefined
    const clear = {
      path: '/',
      sameSite: 'lax' as const,
      secure,
      domain,
    }
    reply.clearCookie(ACCESS_COOKIE, clear)
    reply.clearCookie(REFRESH_COOKIE, clear)
    reply.clearCookie(CSRF_COOKIE, clear)
  }

  readRefresh(cookies: Record<string, string | undefined> | undefined): string | undefined {
    const value = cookies?.[REFRESH_COOKIE]
    if (typeof value === 'string' && value.length > 0) {
      return value
    }
    return undefined
  }
}
