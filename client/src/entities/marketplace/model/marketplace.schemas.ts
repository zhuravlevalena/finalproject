import { z } from 'zod';

export const marketplaceSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  requirements: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type MarketplaceSchema = z.infer<typeof marketplaceSchema>;
