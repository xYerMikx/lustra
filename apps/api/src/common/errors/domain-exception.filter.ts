import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common'
import type { FastifyReply, FastifyRequest } from 'fastify'

import { DomainError } from './domain-error'
import { ErrorCode } from './error-codes'

interface ErrorBody {
  error: {
    code: string
    message: string
    details?: unknown
    requestId?: string
  }
}

/**
 * Глобальный фильтр: DomainError -> { error: {...} } с правильным HTTP-статусом;
 * HttpException Nest'а (guards/pipes) -> тот же конверт с кодом VALIDATION_FAILED/UNAUTHENTICATED/...;
 * всё остальное -> 500 INTERNAL без утечки деталей в проде.
 */
@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter')

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const reply = ctx.getResponse<FastifyReply>()
    const request = ctx.getRequest<FastifyRequest>()
    const requestId = (request.headers['x-request-id'] as string | undefined) ?? request.id

    const body = this.toBody(exception, requestId)
    const status = this.toStatus(exception)

    if (status >= 500) {
      this.logger.error({ err: exception, requestId }, 'Unhandled exception')
    }

    reply.status(status).send(body)
  }

  private toStatus(exception: unknown): number {
    if (exception instanceof DomainError) {
      return exception.httpStatus
    }
    if (exception instanceof HttpException) {
      return exception.getStatus()
    }
    return 500
  }

  private toBody(exception: unknown, requestId?: string): ErrorBody {
    if (exception instanceof DomainError) {
      return {
        error: {
          code: exception.code,
          message: exception.message,
          details: exception.details,
          requestId,
        },
      }
    }

    if (exception instanceof HttpException) {
      const response = exception.getResponse()
      const message =
        typeof response === 'string'
          ? response
          : ((response as { message?: string | string[] }).message ?? exception.message)
      return {
        error: {
          code: this.httpExceptionCode(exception),
          message: Array.isArray(message) ? message.join(', ') : message,
          details: typeof response === 'object' ? response : undefined,
          requestId,
        },
      }
    }

    return {
      error: {
        code: ErrorCode.INTERNAL,
        message: 'Внутренняя ошибка сервера',
        requestId,
      },
    }
  }

  private httpExceptionCode(exception: HttpException): ErrorCode {
    switch (exception.getStatus()) {
      case 400:
        return ErrorCode.VALIDATION_FAILED
      case 401:
        return ErrorCode.UNAUTHENTICATED
      case 403:
        return ErrorCode.FORBIDDEN
      case 404:
        return ErrorCode.NOT_FOUND
      case 429:
        return ErrorCode.RATE_LIMITED
      default:
        return ErrorCode.INTERNAL
    }
  }
}
