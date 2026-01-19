import type { z } from 'zod';
import type { marketplaceSchema } from './marketplace.schemas';

export type Marketplace = z.infer<typeof marketplaceSchema>;

export type MarketplaceState = {
  marketplaces: Marketplace[];
  loading: boolean;
  error: string | null;
};
