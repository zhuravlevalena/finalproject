import { z } from 'zod';

export const productProfileSchema = z.object({
  id: z.number(),
  userId: z.number(),
  productType: z.string().optional(),
  style: z.string().optional(),
  targetAudience: z.string().optional(),
  colorPalette: z.record(z.unknown()).optional(),
  preferences: z.record(z.unknown()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createProductProfileSchema = z.object({
  productType: z.string().min(1, 'Тип товара обязателен'),
  style: z.string().optional(),
  targetAudience: z.string().optional(),
  colorPalette: z.record(z.unknown()).optional(),
  preferences: z.record(z.unknown()).optional(),
});

export const updateProductProfileSchema = createProductProfileSchema.partial();

export const getOrCreateProductProfileSchema = z.object({
  productType: z.string().min(1, 'Тип товара обязателен'),
});

export type ProductProfileSchema = z.infer<typeof productProfileSchema>;
export type CreateProductProfileSchema = z.infer<typeof createProductProfileSchema>;
export type UpdateProductProfileSchema = z.infer<typeof updateProductProfileSchema>;
export type GetOrCreateProductProfileSchema = z.infer<typeof getOrCreateProductProfileSchema>;
