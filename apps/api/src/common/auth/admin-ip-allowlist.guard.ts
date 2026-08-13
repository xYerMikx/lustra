import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import type { FastifyRequest } from 'fastify'

function parseAllowlist(raw: string | undefined): string[] {
  if (!raw) {
    return []
  }

  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

/**
 * Fail-closed IP gate for /admin routes.
 * - Production + empty ADMIN_IP_ALLOWLIST → deny all
 * - Non-prod + empty allowlist → allow (local Docker)
 * - Non-empty allowlist → only listed IPs
 */
@Injectable()
export class AdminIpAllowlistGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const allowlist = parseAllowlist(process.env.ADMIN_IP_ALLOWLIST)
    const production = process.env.NODE_ENV === 'production'

    if (allowlist.length === 0) {
      if (production) {
        throw new ForbiddenException('Админ-доступ закрыт')
      }

      return true
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>()
    const ip = normalizeIp(request.ip)

    if (!ip || !allowlist.includes(ip)) {
      throw new ForbiddenException('Админ-доступ с этого IP запрещён')
    }

    return true
  }
}

function normalizeIp(ip: string | undefined): string | null {
  if (!ip) {
    return null
  }

  if (ip.startsWith('::ffff:')) {
    return ip.slice('::ffff:'.length)
  }

  return ip
}
