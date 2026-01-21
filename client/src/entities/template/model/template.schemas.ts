import { z } from 'zod';
import type { LayoutSchema } from '@/entities/layout/model/layout.schemas';

// Базовая схема для marketplace (избегаем циклических зависимостей)
const marketplaceRefSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  requirements: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const templateSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  marketplaceId: z.number().optional(),
  marketplace: marketplaceRefSchema.optional(),
  canvasData: z.record(z.unknown()).optional(),
  preview: z.string().optional(),
  isDefault: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  // Связанные макеты (для удобства на фронте)
  // Используем z.any() + типизацию через TemplateSchema, чтобы избежать циклической зависимости в zod
  layouts: z.any().optional(),
});

export const createTemplateSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  marketplaceId: z.number().optional(),
  canvasData: z.record(z.unknown()).optional(),
  preview: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const updateTemplateSchema = createTemplateSchema.partial();

export type TemplateSchema = z.infer<typeof templateSchema>;
export type CreateTemplateSchema = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateSchema = z.infer<typeof updateTemplateSchema>;
