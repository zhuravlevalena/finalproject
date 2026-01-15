import type { Marketplace } from '@/entities/marketplace/model/marketplace.types';
import type { Template } from '@/entities/template/model/template.types';
import type { ProductProfile } from '@/entities/productprofile/model/productprofile.types';
import type { Image } from '@/entities/image/model/image.types';

export type CardStatus = 'draft' | 'completed';

export interface ProductCard {
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
}

export interface CreateProductCardDto {
  marketplaceId?: number;
  templateId?: number;
  productProfileId?: number;
  title?: string;
  description?: string;
  canvasData?: Record<string, unknown>;
  imageId?: number;
  generatedImageId?: number;
  status?: CardStatus;
}
