import type { z } from 'zod';
import type { imageSchema, imageTypeSchema } from './image.schemas';

export type ImageType = z.infer<typeof imageTypeSchema>;
export type Image = z.infer<typeof imageSchema>;

export type ImageState = {
  images: Image[];
  loading: boolean;
  error: string | null;
  uploading: boolean;
};
