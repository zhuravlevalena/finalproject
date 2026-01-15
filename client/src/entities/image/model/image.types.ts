export type ImageType = 'uploaded' | 'generated';

export interface Image {
  id: number;
  userId: number;
  url: string;
  type: ImageType;
  originalName?: string;
  prompt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
