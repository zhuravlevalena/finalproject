import { z } from 'zod';

// Базовые схемы для вложенных объектов (избегаем циклических зависимостей)
const marketplaceRefSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  requirements: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const templateRefSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  marketplaceId: z.number().optional(),
  canvasData: z.record(z.unknown()).optional(),
  preview: z.string().optional(),
  isDefault: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const imageRefSchema = z.object({
  id: z.number(),
  userId: z.number(),
  url: z.string(),
  type: z.enum(['uploaded', 'generated']),
  originalName: z.string().optional(),
  prompt: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const productProfileRefSchema = z.object({
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

export const cardStatusSchema = z.enum(['draft', 'completed']);

export const productCardSchema = z.object({
  id: z.number(),
  userId: z.number(),
  marketplaceId: z.number().optional(),
  marketplace: marketplaceRefSchema.optional(),
  templateId: z.number().optional(),
  template: templateRefSchema.optional(),
  productProfileId: z.number().optional(),
  productProfile: productProfileRefSchema.optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  canvasData: z.record(z.unknown()).optional(),
  imageId: z.number().optional(),
  image: imageRefSchema.optional(),
  generatedImageId: z.number().optional(),
  generatedImage: imageRefSchema.optional(),
  status: cardStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createProductCardSchema = z.object({
  marketplaceId: z.number().optional(),
  templateId: z.number().optional(),
  productProfileId: z.number().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  canvasData: z.record(z.unknown()).optional(),
  imageId: z.number().optional(),
  generatedImageId: z.number().optional(),
  status: cardStatusSchema.optional().default('draft'),
});

export const updateProductCardSchema = createProductCardSchema.partial();

export type ProductCardSchema = z.infer<typeof productCardSchema>;
export type CardStatusSchema = z.infer<typeof cardStatusSchema>;
export type CreateProductCardSchema = z.infer<typeof createProductCardSchema>;
export type UpdateProductCardSchema = z.infer<typeof updateProductCardSchema>;
