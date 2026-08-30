import { RegisterRoleSchema, type RegisterRole } from '@lumira/contracts'

export function parseRegisterRole(value: string | null): RegisterRole {
  const parsed = RegisterRoleSchema.safeParse(value)

  if (!parsed.success) {
    return 'client'
  }

  return parsed.data
}
