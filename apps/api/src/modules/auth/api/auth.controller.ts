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
import { Throttle } from '@nestjs/throttler'
import {
  LoginInputSchema,
  RegisterInputSchema,
  type LoginInput,
  type RegisterInput,
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
import { AuthCookieService } from '@/modules/auth/infra/auth-cookie.service'

@Controller('auth')
@Throttle({ default: { limit: 10, ttl: 60_000 } })
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshUseCase: RefreshTokensUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly getMeUseCase: GetMeUseCase,
    private readonly cookies: AuthCookieService,
  ) {}

  @Post('register')
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

  @Post('refresh')
  @HttpCode(200)
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
  async logout(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    this.cookies.assertCsrf(request)
    await this.logoutUseCase.execute(this.cookies.readRefresh(request.cookies))
    this.cookies.clearSession(reply)
  }

  @Get('me')
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
