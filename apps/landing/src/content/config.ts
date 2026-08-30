import { defineCollection, z } from 'astro:content'

const faq = defineCollection({
  type: 'content',
  schema: z.object({
    question: z.string().min(1),
    order: z.number().int().nonnegative(),
  }),
})

const stepSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
})

const linkSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
})

const sections = defineCollection({
  type: 'data',
  schema: z
    .object({
      title: z.string().min(1).optional(),
      eyebrow: z.string().min(1).optional(),
      lead: z.string().min(1).optional(),
      brand: z.string().min(1).optional(),
      headline: z.string().min(1).optional(),
      primaryCta: z.string().min(1).optional(),
      secondaryCta: z.string().min(1).optional(),
      clientSteps: z.array(stepSchema).min(1).optional(),
      masterSteps: z.array(stepSchema).min(1).optional(),
      rows: z
        .array(
          z.object({
            criterion: z.string().min(1),
            direct: z.string().min(1),
            lumira: z.string().min(1),
          }),
        )
        .min(1)
        .optional(),
      categories: z.array(linkSchema).min(1).optional(),
      districts: z.array(linkSchema).min(1).optional(),
      works: z
        .array(
          z.object({
            label: z.string().min(1),
            tone: z.enum(['accent', 'gold', 'sage', 'clay', 'surface']),
          }),
        )
        .min(1)
        .optional(),
      benefits: z.array(stepSchema).min(1).optional(),
      closingTitle: z.string().min(1).optional(),
      closingLead: z.string().min(1).optional(),
      body: z.array(z.string().min(1)).min(1).optional(),
      emptyMessage: z.string().min(1).optional(),
    })
    .refine(
      (data) =>
        Boolean(
          data.title ||
            data.brand ||
            data.headline ||
            data.clientSteps ||
            data.works ||
            data.rows ||
            data.categories ||
            data.benefits ||
            data.body,
        ),
      { message: 'Section content must include at least one meaningful field' },
    ),
})

export const collections = { faq, sections }
