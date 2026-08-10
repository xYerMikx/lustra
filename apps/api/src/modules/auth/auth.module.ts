import { Module } from '@nestjs/common'

import { JwtGuard } from '@/common/auth/jwt.guard'
import { JwtTokenService } from '@/common/auth/jwt-token.service'
import { RolesGuard } from '@/common/auth/roles.guard'
import { PrismaModule } from '@/common/prisma/prisma.module'
import { AuthController } from '@/modules/auth/api/auth.controller'
import { GetMeUseCase } from '@/modules/auth/app/get-me.usecase'
import { LoginUseCase } from '@/modules/auth/app/login.usecase'
import { LogoutUseCase } from '@/modules/auth/app/logout.usecase'
import { RefreshTokensUseCase } from '@/modules/auth/app/refresh-tokens.usecase'
import { RegisterUseCase } from '@/modules/auth/app/register.usecase'
import { AuthCookieService } from '@/modules/auth/infra/auth-cookie.service'
import { AuthUserRepository } from '@/modules/auth/infra/auth-user.repository'
import { PasswordHasher } from '@/modules/auth/infra/password-hasher'
import { RefreshSessionRepository } from '@/modules/auth/infra/refresh-session.repository'

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [
    JwtTokenService,
    JwtGuard,
    RolesGuard,
    AuthCookieService,
    PasswordHasher,
    AuthUserRepository,
    RefreshSessionRepository,
    RegisterUseCase,
    LoginUseCase,
    RefreshTokensUseCase,
    LogoutUseCase,
    GetMeUseCase,
  ],
  exports: [JwtTokenService, JwtGuard, RolesGuard],
})
export class AuthModule {}
