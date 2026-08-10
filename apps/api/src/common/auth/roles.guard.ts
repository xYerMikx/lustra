import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { UserRole } from '@lustra/contracts'
import type { FastifyRequest } from 'fastify'

import type { AuthUser } from '@/common/auth/auth-user'
import { ROLES_KEY } from '@/common/auth/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!roles || roles.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest<FastifyRequest & { user?: AuthUser }>()
    const user = request.user

    if (!user) {
      throw new ForbiddenException('Доступ запрещён')
    }

    if (!roles.includes(user.role)) {
      throw new ForbiddenException('Недостаточно прав')
    }

    return true
  }
}
