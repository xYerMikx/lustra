import { Injectable } from '@nestjs/common'
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import type { UserRole } from '@lustra/contracts'

import { ACCESS_TTL_SEC } from '../../common/auth/cookie.constants'

export type AccessTokenPayload = {
  sub: string
  role: UserRole
  email: string
}

function resolveAccessSecret(): Uint8Array {
  const secret = process.env.JWT_ACCESS_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_ACCESS_SECRET is required in production')
    }
    return new TextEncoder().encode('dev-access-secret-change-me')
  }
  return new TextEncoder().encode(secret)
}

@Injectable()
export class JwtTokenService {
  private readonly accessSecret: Uint8Array

  constructor() {
    this.accessSecret = resolveAccessSecret()
  }

  async signAccess(payload: AccessTokenPayload): Promise<string> {
    return new SignJWT({
      role: payload.role,
      email: payload.email,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(payload.sub)
      .setIssuedAt()
      .setExpirationTime(`${ACCESS_TTL_SEC}s`)
      .sign(this.accessSecret)
  }

  async verifyAccess(token: string): Promise<AccessTokenPayload> {
    const { payload } = await jwtVerify(token, this.accessSecret)
    return this.toAccessPayload(payload)
  }

  private toAccessPayload(payload: JWTPayload): AccessTokenPayload {
    const sub = payload.sub
    const role = payload.role
    const email = payload.email
    if (typeof sub !== 'string' || typeof role !== 'string' || typeof email !== 'string') {
      throw new Error('Invalid access token payload')
    }
    if (role !== 'client' && role !== 'master' && role !== 'admin') {
      throw new Error('Invalid role in access token')
    }
    return { sub, role, email }
  }
}
