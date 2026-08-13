import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { SkipThrottle, Throttle } from '@nestjs/throttler'
import {
  ForgotPasswordInputSchema,
  LoginInputSchema,
  RegisterInputSchema,
  ResetPasswordInputSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
} from '@lustra/contracts'
import type { FastifyReply, FastifyRequest } from 'fastify'

import type { AuthUser } from '@/common/auth/auth-user'
import { CurrentUser } from '@/common/auth/current-user.decorator'
import { JwtGuard } from '@/common/auth/jwt.guard'
import { Roles } from '@/common/auth/roles.decorator'
import { RolesGuard } from '@/common/auth/roles.guard'
import { ZodValidationPipe } from '@/common/auth/zod-validation.pipe'
import { GetMeUseCase } from '@/modules/auth/app/get-me.usecase'
import { LoginUseCase } from '@/modules/auth/app/login.usecase'
import { LogoutUseCase } from '@/modules/auth/app/logout.usecase'
import { RefreshTokensUseCase } from '@/modules/auth/app/refresh-tokens.usecase'
import { RegisterUseCase } from '@/modules/auth/app/register.usecase'
import { RequestPasswordResetUseCase } from '@/modules/auth/app/request-password-reset.usecase'
import { ResetPasswordUseCase } from '@/modules/auth/app/reset-password.usecase'
import { AuthCookieService } from '@/modules/auth/infra/auth-cookie.service'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshUseCase: RefreshTokensUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly getMeUseCase: GetMeUseCase,
    private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly cookies: AuthCookieService,
  ) {}

  @Post('register')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async register(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
    @Body(new ZodValidationPipe(RegisterInputSchema)) body: RegisterInput,
  ) {
    const result = await this.registerUseCase.execute(body, this.meta(request))
    this.cookies.setSession(reply, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    })

    return { user: result.user }
  }

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async login(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
    @Body(new ZodValidationPipe(LoginInputSchema)) body: LoginInput,
  ) {
    const result = await this.loginUseCase.execute(body, this.meta(request))
    this.cookies.setSession(reply, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    })

    return { user: result.user }
  }

  @Post('password/forgot')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  forgotPassword(
    @Body(new ZodValidationPipe(ForgotPasswordInputSchema)) body: ForgotPasswordInput,
  ) {

    return this.requestPasswordResetUseCase.execute(body)
  }

  @Post('password/reset')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  resetPassword(
    @Body(new ZodValidationPipe(ResetPasswordInputSchema)) body: ResetPasswordInput,
  ) {

    return this.resetPasswordUseCase.execute(body)
  }

  @Post('refresh')
  @HttpCode(200)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async refresh(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    this.cookies.assertCsrf(request)
    const result = await this.refreshUseCase.execute(
      this.cookies.readRefresh(request.cookies),
      this.meta(request),
    )
    this.cookies.setSession(reply, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    })

    return { user: result.user }
  }

  @Post('logout')
  @HttpCode(204)
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async logout(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    this.cookies.assertCsrf(request)
    await this.logoutUseCase.execute(this.cookies.readRefresh(request.cookies))
    this.cookies.clearSession(reply)
  }

  @Get('me')
  @SkipThrottle()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('client', 'master', 'admin')
  me(@CurrentUser() user: AuthUser) {
    return this.getMeUseCase.execute(user)
  }

  private meta(request: FastifyRequest) {
    return {
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    }
  }
}
