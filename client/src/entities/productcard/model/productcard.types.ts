import type { z } from 'zod';
import type {
  productCardSchema,
  cardStatusSchema,
  createProductCardSchema,
} from './productcard.schemas';

export type CardStatus = z.infer<typeof cardStatusSchema>;
export type ProductCard = z.infer<typeof productCardSchema>;
export type CreateProductCardDto = z.infer<typeof createProductCardSchema>;

export type ProductCardState = {
  cards: ProductCard[];
  loading: boolean;
  error: string | null;
  creating: boolean;
};
