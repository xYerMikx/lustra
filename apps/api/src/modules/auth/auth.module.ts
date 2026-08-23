import { Module } from '@nestjs/common'

import { JwtGuard } from '@/common/auth/jwt.guard'
import { JwtTokenService } from '@/common/auth/jwt-token.service'
import { RolesGuard } from '@/common/auth/roles.guard'
import { PrismaModule } from '@/common/prisma/prisma.module'
import { AuthController } from '@/modules/auth/api/auth.controller'
import { GetMeUseCase } from '@/modules/auth/app/get-me.usecase'
import { LoginUseCase } from '@/modules/auth/app/login.usecase'
import { LogoutUseCase } from '@/modules/auth/app/logout.usecase'
import { MAILER } from '@/modules/auth/app/mailer.port'
import { RefreshTokensUseCase } from '@/modules/auth/app/refresh-tokens.usecase'
import { RegisterUseCase } from '@/modules/auth/app/register.usecase'
import { RequestPasswordResetUseCase } from '@/modules/auth/app/request-password-reset.usecase'
import { ResetPasswordUseCase } from '@/modules/auth/app/reset-password.usecase'
import { SendEmailVerifyUseCase } from '@/modules/auth/app/send-email-verify.usecase'
import { VerifyEmailUseCase } from '@/modules/auth/app/verify-email.usecase'
import { AuthCookieService } from '@/modules/auth/infra/auth-cookie.service'
import { AuthTokenRepository } from '@/modules/auth/infra/auth-token.repository'
import { AuthUserRepository } from '@/modules/auth/infra/auth-user.repository'
import { createMailerFromEnv } from '@/modules/auth/infra/create-mailer'
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
    AuthTokenRepository,
    RefreshSessionRepository,
    {
      provide: MAILER,
      useFactory: createMailerFromEnv,
    },
    RegisterUseCase,
    LoginUseCase,
    RefreshTokensUseCase,
    LogoutUseCase,
    GetMeUseCase,
    RequestPasswordResetUseCase,
    ResetPasswordUseCase,
    SendEmailVerifyUseCase,
    VerifyEmailUseCase,
  ],
  exports: [
    JwtTokenService,
    JwtGuard,
    RolesGuard,
    AuthUserRepository,
    AuthTokenRepository,
  ],
})
export class AuthModule {}
