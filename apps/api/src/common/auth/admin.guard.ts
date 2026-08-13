import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import type { FastifyRequest } from 'fastify'

import type { AuthUser } from '@/common/auth/auth-user'
import { PrismaService } from '@/common/prisma/prisma.service'

type AuthedRequest = FastifyRequest & { user?: AuthUser }

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthedRequest>()
    const currentUser = request.user

    if (!currentUser) {
      throw new UnauthorizedException('Требуется вход')
    }

    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        deletedAt: true,
      },
    })

    if (!user || user.deletedAt || user.status !== 'active') {
      throw new UnauthorizedException('Сессия недействительна')
    }

    if (user.role !== 'admin') {
      throw new ForbiddenException('Недостаточно прав')
    }

    request.user = {
      id: user.id,
      role: 'admin',
      email: user.email,
    }

    return true
  }
}
