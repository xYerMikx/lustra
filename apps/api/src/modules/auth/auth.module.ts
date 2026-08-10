import { Module } from '@nestjs/common'

import { JwtGuard } from '../../common/auth/jwt.guard'
import { JwtTokenService } from '../../common/auth/jwt-token.service'
import { RolesGuard } from '../../common/auth/roles.guard'
import { PrismaModule } from '../../common/prisma/prisma.module'
import { AuthController } from './api/auth.controller'
import { GetMeUseCase } from './app/get-me.usecase'
import { LoginUseCase } from './app/login.usecase'
import { LogoutUseCase } from './app/logout.usecase'
import { RefreshTokensUseCase } from './app/refresh-tokens.usecase'
import { RegisterUseCase } from './app/register.usecase'
import { AuthCookieService } from './infra/auth-cookie.service'
import { AuthUserRepository } from './infra/auth-user.repository'
import { PasswordHasher } from './infra/password-hasher'
import { RefreshSessionRepository } from './infra/refresh-session.repository'

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
