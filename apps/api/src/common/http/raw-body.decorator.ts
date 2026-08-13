import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import type { FastifyRequest } from 'fastify'

export const RawBody = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Buffer => {
    const request = context.switchToHttp().getRequest<FastifyRequest>()
    const body = request.body

    if (!Buffer.isBuffer(body)) {
      return Buffer.alloc(0)
    }

    return body
  },
)
