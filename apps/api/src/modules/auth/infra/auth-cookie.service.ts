import { timingSafeEqual } from 'node:crypto'

import { Injectable } from '@nestjs/common'
import type { FastifyReply, FastifyRequest } from 'fastify'

import {
  ACCESS_COOKIE,
  ACCESS_TTL_SEC,
  CSRF_COOKIE,
  CSRF_HEADER,
  REFRESH_COOKIE,
  REFRESH_TTL_SEC,
} from '../../../common/auth/cookie.constants'
import { DomainError } from '../../../common/errors/domain-error'
import { generateCsrfToken } from '../domain/token-hash'

export type SessionCookies = {
  accessToken: string
  refreshToken: string
}

function safeEqualStrings(left: string, right: string): boolean {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  if (a.length !== b.length) {
    return false
  }
  return timingSafeEqual(a, b)
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

  /**
   * Double-submit CSRF: cookie `lustra_csrf` must match `X-CSRF-Token` header.
   * Required for cookie-authenticated mutations (refresh / logout).
   */
  assertCsrf(request: FastifyRequest): void {
    const cookieToken = request.cookies?.[CSRF_COOKIE]
    const headerRaw = request.headers[CSRF_HEADER]
    const headerToken = Array.isArray(headerRaw) ? headerRaw[0] : headerRaw

    if (
      typeof cookieToken !== 'string' ||
      cookieToken.length === 0 ||
      typeof headerToken !== 'string' ||
      headerToken.length === 0 ||
      !safeEqualStrings(cookieToken, headerToken)
    ) {
      throw new DomainError('FORBIDDEN', 'Недействительный CSRF-токен')
    }
  }
}
