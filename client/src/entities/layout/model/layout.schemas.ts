import { z } from 'zod';
import { templateSchema } from '@/entities/template/model/template.schemas';

export const layoutSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  templateId: z.number(),
  template: templateSchema.optional(),
  canvasData: z.record(z.unknown()).optional(),
  preview: z.string().optional(),
  isDefault: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createLayoutSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  templateId: z.number(),
  canvasData: z.record(z.unknown()).optional(),
  preview: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const updateLayoutSchema = createLayoutSchema.partial();

export type LayoutSchema = z.infer<typeof layoutSchema>;
export type CreateLayoutSchema = z.infer<typeof createLayoutSchema>;
export type UpdateLayoutSchema = z.infer<typeof updateLayoutSchema>;
