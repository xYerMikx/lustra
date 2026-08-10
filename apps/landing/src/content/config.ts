import { defineCollection, z } from 'astro:content'

const faq = defineCollection({
  type: 'content',
  schema: z.object({
    question: z.string(),
    order: z.number(),
  }),
})

const sections = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string().optional(),
    eyebrow: z.string().optional(),
    lead: z.string().optional(),
    brand: z.string().optional(),
    headline: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    clientSteps: z
      .array(
        z.object({
          title: z.string(),
          body: z.string(),
        }),
      )
      .optional(),
    masterSteps: z
      .array(
        z.object({
          title: z.string(),
          body: z.string(),
        }),
      )
      .optional(),
    rows: z
      .array(
        z.object({
          criterion: z.string(),
          direct: z.string(),
          lustra: z.string(),
        }),
      )
      .optional(),
    categories: z
      .array(
        z.object({
          name: z.string(),
          slug: z.string(),
        }),
      )
      .optional(),
    districts: z
      .array(
        z.object({
          name: z.string(),
          slug: z.string(),
        }),
      )
      .optional(),
    works: z
      .array(
        z.object({
          label: z.string(),
          tone: z.enum(['accent', 'gold', 'sage', 'clay', 'surface']),
        }),
      )
      .optional(),
    benefits: z
      .array(
        z.object({
          title: z.string(),
          body: z.string(),
        }),
      )
      .optional(),
    body: z.array(z.string()).optional(),
  }),
})

export const collections = { faq, sections }
