import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var __lumiraPrisma: PrismaClient | undefined
}

/**
 * Единственный экземпляр PrismaClient на процесс.
 * apps/api создаёт свой PrismaService поверх этого клиента (см. common/prisma),
 * чтобы прокидывать транзакционный клиент через AsyncLocalStorage.
 */
export const prisma: PrismaClient =
  globalThis.__lumiraPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalThis.__lumiraPrisma = prisma
}

export * from '@prisma/client'
