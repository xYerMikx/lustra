import { ForbiddenException, type ExecutionContext } from '@nestjs/common'
import type { FastifyRequest } from 'fastify'
import { describe, expect, it, afterEach } from 'vitest'

import {
  AdminIpAllowlistGuard,
  resolveClientIp,
} from '@/common/auth/admin-ip-allowlist.guard'

function fakeRequest(input: {
  ip?: string
  headers?: Record<string, string | string[] | undefined>
}): FastifyRequest {
  return {
    ip: input.ip ?? '127.0.0.1',
    headers: input.headers ?? {},
  } as unknown as FastifyRequest
}

function fakeContext(request: {
  ip?: string
  headers?: Record<string, string | string[] | undefined>
}): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => fakeRequest(request),
    }),
  } as unknown as ExecutionContext
}

describe('resolveClientIp', () => {
  it('prefers CF-Connecting-IP over X-Forwarded-For', () => {
    expect(
      resolveClientIp(
        fakeRequest({
          ip: '10.0.0.1',
          headers: {
            'cf-connecting-ip': '203.0.113.10',
            'x-forwarded-for': '198.51.100.1, 10.0.0.1',
          },
        }),
      ),
    ).toBe('203.0.113.10')
  })

  it('uses first X-Forwarded-For hop when CF header missing', () => {
    expect(
      resolveClientIp(
        fakeRequest({
          ip: '10.0.0.1',
          headers: {
            'x-forwarded-for': '203.0.113.20, 10.0.0.1',
          },
        }),
      ),
    ).toBe('203.0.113.20')
  })

  it('strips IPv4-mapped IPv6 prefix', () => {
    expect(
      resolveClientIp(
        fakeRequest({
          ip: '::ffff:203.0.113.30',
          headers: {},
        }),
      ),
    ).toBe('203.0.113.30')
  })
})

describe('AdminIpAllowlistGuard', () => {
  const originalEnv = process.env.ADMIN_IP_ALLOWLIST
  const originalNodeEnv = process.env.NODE_ENV

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.ADMIN_IP_ALLOWLIST
    } else {
      process.env.ADMIN_IP_ALLOWLIST = originalEnv
    }

    process.env.NODE_ENV = originalNodeEnv
  })

  it('allows any IP in non-prod when allowlist empty', () => {
    process.env.NODE_ENV = 'development'
    delete process.env.ADMIN_IP_ALLOWLIST

    const guard = new AdminIpAllowlistGuard()

    expect(guard.canActivate(fakeContext({ ip: '127.0.0.1' }))).toBe(true)
  })

  it('denies all in production when allowlist empty', () => {
    process.env.NODE_ENV = 'production'
    delete process.env.ADMIN_IP_ALLOWLIST

    const guard = new AdminIpAllowlistGuard()

    expect(() => guard.canActivate(fakeContext({ ip: '127.0.0.1' }))).toThrow(
      ForbiddenException,
    )
  })

  it('allows listed client IP from Cloudflare header', () => {
    process.env.NODE_ENV = 'production'
    process.env.ADMIN_IP_ALLOWLIST = '203.0.113.10,10.0.0.2'

    const guard = new AdminIpAllowlistGuard()

    expect(
      guard.canActivate(
        fakeContext({
          ip: '10.0.0.1',
          headers: { 'cf-connecting-ip': '203.0.113.10' },
        }),
      ),
    ).toBe(true)
  })

  it('denies when client IP not in allowlist', () => {
    process.env.NODE_ENV = 'production'
    process.env.ADMIN_IP_ALLOWLIST = '203.0.113.10'

    const guard = new AdminIpAllowlistGuard()

    expect(() =>
      guard.canActivate(
        fakeContext({
          ip: '10.0.0.1',
          headers: { 'cf-connecting-ip': '8.8.8.8' },
        }),
      ),
    ).toThrow(ForbiddenException)
  })
})
