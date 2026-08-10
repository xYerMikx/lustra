import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import type { FastifyRequest } from 'fastify'

import type { AuthUser } from './auth-user'
import { ACCESS_COOKIE } from './cookie.constants'
import { JwtTokenService } from './jwt-token.service'

type AuthedRequest = FastifyRequest & { user?: AuthUser }

/**
 * Reads access JWT from httpOnly cookie or Authorization: Bearer.
 * Attaches AuthUser to the request when valid.
 */
@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly tokens: JwtTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthedRequest>()
    const raw = this.extractToken(request)
    if (!raw) {
      throw new UnauthorizedException('Требуется вход')
    }

    try {
      const payload = await this.tokens.verifyAccess(raw)
      request.user = {
        id: payload.sub,
        role: payload.role,
        email: payload.email,
      }
      return true
    } catch {
      throw new UnauthorizedException('Сессия истекла или недействительна')
    }
  }

  private extractToken(request: AuthedRequest): string | undefined {
    const cookieToken = request.cookies?.[ACCESS_COOKIE]
    if (typeof cookieToken === 'string' && cookieToken.length > 0) {
      return cookieToken
    }

    const header = request.headers.authorization
    if (typeof header === 'string' && header.startsWith('Bearer ')) {
      const bearer = header.slice('Bearer '.length).trim()
      if (bearer.length > 0) {
        return bearer
      }
    }

    return undefined
  }
}
