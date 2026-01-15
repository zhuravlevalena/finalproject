export interface ProductProfile {
  id: number;
  userId: number;
  productType?: string;
  style?: string;
  targetAudience?: string;
  colorPalette?: Record<string, unknown>;
  preferences?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
