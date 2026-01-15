import type { Marketplace } from '@/entities/marketplace/model/marketplace.types';

export interface Template {
  id: number;
  name: string;
  description?: string;
  marketplaceId?: number;
  marketplace?: Marketplace;
  canvasData?: Record<string, unknown>;
  preview?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
