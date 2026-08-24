import { z } from 'zod'

export const TelegramLinkStartResponseSchema = z.object({
  deepLink: z.string().url(),
})
export type TelegramLinkStartResponse = z.infer<
  typeof TelegramLinkStartResponseSchema
>
