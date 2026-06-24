import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const guides = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    eyebrow: z.string(),
    order: z.number(),
    icon: z.string(),
    readingTime: z.string(),
    updated: z.string(),
    keywords: z.array(z.string()).default([]),
    ctaLabel: z.string().default('Audit your Cursor setup'),
    ctaHref: z.string().default('/tools/config-analyzer'),
    faqs: z
      .array(
        z.object({
          q: z.string(),
          a: z.string(),
        }),
      )
      .default([]),
  }),
});

export const collections = { guides };
