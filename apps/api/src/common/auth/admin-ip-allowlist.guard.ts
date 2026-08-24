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

function headerValue(
  headers: FastifyRequest['headers'],
  name: string,
): string | undefined {
  const raw = headers[name]

  if (Array.isArray(raw)) {
    return raw[0]
  }

  return raw
}

/**
 * Client IP behind Cloudflare → Railway.
 * Prefer CF-Connecting-IP, then first hop of X-Forwarded-For, then socket IP.
 */
export function resolveClientIp(request: FastifyRequest): string | null {
  const cfConnecting = headerValue(request.headers, 'cf-connecting-ip')

  if (cfConnecting) {
    return normalizeIp(cfConnecting)
  }

  const forwarded = headerValue(request.headers, 'x-forwarded-for')

  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()

    if (first) {
      return normalizeIp(first)
    }
  }

  const realIp = headerValue(request.headers, 'x-real-ip')

  if (realIp) {
    return normalizeIp(realIp)
  }

  return normalizeIp(request.ip)
}

function normalizeIp(ip: string | undefined): string | null {
  if (!ip) {
    return null
  }

  const trimmed = ip.trim()

  if (trimmed.startsWith('::ffff:')) {
    return trimmed.slice('::ffff:'.length)
  }

  return trimmed
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
    const ip = resolveClientIp(request)

    if (!ip || !allowlist.includes(ip)) {
      throw new ForbiddenException('Админ-доступ с этого IP запрещён')
    }

    return true
  }
}
