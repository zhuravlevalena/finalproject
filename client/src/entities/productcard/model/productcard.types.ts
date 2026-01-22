import type { z } from 'zod';
import type { cardStatusSchema, createProductCardSchema } from './productcard.schemas';
import type { Marketplace } from '@/entities/marketplace/model/marketplace.types';
import type { Template } from '@/entities/template/model/template.types';
import type { ProductProfile } from '@/entities/productprofile/model/productprofile.types';
import type { Image } from 'fabric/fabric-impl';

export type CardStatus = z.infer<typeof cardStatusSchema>;
export type ProductCard = {
  id: number;
  userId: number;
  marketplaceId?: number;
  marketplace?: Marketplace;
  templateId?: number;
  template?: Template;
  productProfileId?: number;
  productProfile?: ProductProfile;
  title?: string;
  description?: string;
  canvasData?: Record<string, unknown>; 
  imageId?: number;
  image?: Image;
  generatedImageId?: number;
  generatedImage?: Image;
  status: CardStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductCardDto = z.infer<typeof createProductCardSchema>;

export type ProductCardState = {
  cards: ProductCard[];
  loading: boolean;
  error: string | null;
  creating: boolean;
};
