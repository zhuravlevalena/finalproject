import type { z } from 'zod';
import type { productProfileSchema } from './productprofile.schemas';

export type ProductProfile = z.infer<typeof productProfileSchema>;

export type ProductProfileState = {
  profiles: ProductProfile[];
  loading: boolean;
  error: string | null;
};
