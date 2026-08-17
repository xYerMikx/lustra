/**
 * Bootstrap an admin user from env (never via public register).
 *
 *   ADMIN_BOOTSTRAP_EMAIL=admin@example.com \
 *   ADMIN_BOOTSTRAP_PASSWORD='at-least-8-chars' \
 *   pnpm --filter @lustra/api ensure-admin
 */
import { config as loadEnv } from 'dotenv'
import * as argon2 from 'argon2'
import { PrismaClient } from '@lustra/db'

loadEnv()

async function main() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD

  if (!email || !password) {
    console.log(
      'Skip ensure-admin: set ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD',
    )

    return
  }

  if (password.length < 8) {
    throw new Error('ADMIN_BOOTSTRAP_PASSWORD must be at least 8 characters')
  }

  const prisma = new PrismaClient()

  try {
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19_456,
      timeCost: 2,
      parallelism: 1,
    })

    const existing = await prisma.user.findUnique({ where: { email } })

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          role: 'admin',
          passwordHash,
          status: 'active',
          deletedAt: null,
        },
      })
      console.log(`Updated existing user to admin: ${email}`)

      return
    }

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: 'Admin',
        role: 'admin',
        notifySetting: { create: {} },
        consents: {
          create: [
            { kind: 'terms', version: 'terms-2026-07-01' },
            { kind: 'privacy', version: 'privacy-2026-07-01' },
          ],
        },
      },
    })
    console.log(`Created admin user: ${email}`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
