import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import type { FastifyRequest } from 'fastify'

import { isProduction } from '@/common/env/is-production'

function parseAllowlist(raw: string | undefined): string[] {
  if (!raw) {
    return []
  }

  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

@Injectable()
export class AdminIpAllowlistGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const allowlist = parseAllowlist(process.env.ADMIN_IP_ALLOWLIST)

    if (allowlist.length === 0) {
      if (isProduction) {
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
