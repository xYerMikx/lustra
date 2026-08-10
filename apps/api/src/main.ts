import { config as loadEnv } from 'dotenv'
import 'reflect-metadata'

loadEnv()

import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify'
import { Logger } from 'nestjs-pino'

import { AppModule } from '@/app.module'
import { isProduction } from '@/common/env/is-production'
import { DomainExceptionFilter } from '@/common/errors/domain-exception.filter'

async function bootstrap() {
  const adapter = new FastifyAdapter({ trustProxy: true })

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, {
    bufferLogs: true,
  })

  app.useLogger(app.get(Logger))
  app.useGlobalFilters(new DomainExceptionFilter())

  const corsOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  if (corsOrigins.length === 0 && isProduction) {
    throw new Error('CORS_ORIGINS is required in production (comma-separated allowlist)')
  }

  await app.register(fastifyHelmet, {
    contentSecurityPolicy: false,
  })
  await app.register(fastifyCors, {
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
  })
  await app.register(fastifyCookie)

  app.enableShutdownHooks()

  const port = Number(process.env.PORT ?? 3333)
  await app.listen(port, '0.0.0.0')
  // eslint-disable-next-line no-console
  console.log(`Lustra API listening on http://0.0.0.0:${port}`)
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Fatal error during bootstrap', error)
  process.exitCode = 1
})
