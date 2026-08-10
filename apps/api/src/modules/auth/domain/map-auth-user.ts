import type { AuthUserView, MasterProfileStatus, UserRole } from '@lustra/contracts'

type UserRow = {
  id: string
  email: string
  firstName: string
  lastName: string | null
  role: UserRole
  emailVerified: boolean
  telegram: { id: string } | null
  masterProfile: { status: MasterProfileStatus } | null
}

export function toAuthUserView(user: UserRow): AuthUserView {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    emailVerified: user.emailVerified,
    telegramLinked: Boolean(user.telegram),
    profileStatus: user.masterProfile?.status ?? null,
  }
}
