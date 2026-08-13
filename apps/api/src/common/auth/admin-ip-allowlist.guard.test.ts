import { ForbiddenException } from '@nestjs/common'
import { describe, expect, it, afterEach } from 'vitest'

import { AdminIpAllowlistGuard } from '@/common/auth/admin-ip-allowlist.guard'

function fakeContext(ip: string) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ ip }),
    }),
  } as never
}

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

    expect(guard.canActivate(fakeContext('127.0.0.1'))).toBe(true)
  })

  it('denies all in production when allowlist empty', () => {
    process.env.NODE_ENV = 'production'
    delete process.env.ADMIN_IP_ALLOWLIST

    const guard = new AdminIpAllowlistGuard()

    expect(() => guard.canActivate(fakeContext('127.0.0.1'))).toThrow(
      ForbiddenException,
    )
  })

  it('allows only listed IPs when allowlist set', () => {
    process.env.NODE_ENV = 'development'
    process.env.ADMIN_IP_ALLOWLIST = '127.0.0.1,10.0.0.2'

    const guard = new AdminIpAllowlistGuard()

    expect(guard.canActivate(fakeContext('127.0.0.1'))).toBe(true)
    expect(() => guard.canActivate(fakeContext('8.8.8.8'))).toThrow(
      ForbiddenException,
    )
  })
})
