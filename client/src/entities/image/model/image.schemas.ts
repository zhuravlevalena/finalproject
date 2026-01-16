import { z } from 'zod';

export const imageTypeSchema = z.enum(['uploaded', 'generated']);

export const imageSchema = z.object({
  id: z.number(),
  userId: z.number(),
  url: z.string().url('Некорректный URL'),
  type: imageTypeSchema,
  originalName: z.string().optional(),
  prompt: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const uploadImageSchema = z.object({
  image: z.instanceof(File, { message: 'Файл обязателен' }),
});

export const createImageSchema = z.object({
  url: z.string().url('Некорректный URL'),
  type: imageTypeSchema,
  originalName: z.string().optional(),
  prompt: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type ImageSchema = z.infer<typeof imageSchema>;
export type ImageTypeSchema = z.infer<typeof imageTypeSchema>;
export type UploadImageSchema = z.infer<typeof uploadImageSchema>;
export type CreateImageSchema = z.infer<typeof createImageSchema>;
