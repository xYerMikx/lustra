import { z } from 'zod'

/** Roles selectable at registration (admin is never self-assigned). */
export const RegisterRoleSchema = z.enum(['client', 'master'])
export type RegisterRole = z.infer<typeof RegisterRoleSchema>

export const UserRoleSchema = z.enum(['client', 'master', 'admin'])
export type UserRole = z.infer<typeof UserRoleSchema>

export const MasterProfileStatusSchema = z.enum([
  'draft',
  'pending_review',
  'published',
  'hidden',
  'banned',
])
export type MasterProfileStatus = z.infer<typeof MasterProfileStatusSchema>

const EmailSchema = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((value) => value.toLowerCase())

export const RegisterInputSchema = z
  .object({
    email: EmailSchema,
    password: z.string().min(8, 'Пароль не короче 8 символов').max(128),
    firstName: z.string().trim().min(1).max(80),
    role: RegisterRoleSchema,
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'Нужно принять условия использования' }),
    }),
  })
  .strict()
export type RegisterInput = z.infer<typeof RegisterInputSchema>

export const LoginInputSchema = z
  .object({
    email: EmailSchema,
    password: z.string().min(1).max(128),
  })
  .strict()
export type LoginInput = z.infer<typeof LoginInputSchema>

export const AuthUserViewSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  role: UserRoleSchema,
  emailVerified: z.boolean(),
  telegramLinked: z.boolean(),
  profileStatus: MasterProfileStatusSchema.nullable(),
})
export type AuthUserView = z.infer<typeof AuthUserViewSchema>

/** Session endpoints set httpOnly cookies; body returns the public user view. */
export const AuthSessionResponseSchema = z.object({
  user: AuthUserViewSchema,
})
export type AuthSessionResponse = z.infer<typeof AuthSessionResponseSchema>

export const MeResponseSchema = AuthUserViewSchema
export type MeResponse = z.infer<typeof MeResponseSchema>
