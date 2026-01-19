import axiosInstance from '@/shared/api/axiosinstance';
import type { ProductCard, CreateProductCardDto } from '../model/productcard.types';

export interface ProductCardFilters {
  search?: string;
  marketplaceId?: number;
  status?: 'draft' | 'completed';
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const productCardService = {
  getAll: async (filters?: ProductCardFilters): Promise<ProductCard[]> => {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.marketplaceId) params.append('marketplaceId', String(filters.marketplaceId));
      if (filters.status) params.append('status', filters.status);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    }
    
    const url = params.toString() 
      ? `/product-cards?${params.toString()}` 
      : '/product-cards';
    
    const response = await axiosInstance.get<ProductCard[]>(url);
    return response.data;
  },

  getById: async (id: number): Promise<ProductCard> => {
    const response = await axiosInstance.get<ProductCard>(`/product-cards/${id}`);
    return response.data;
  },

  create: async (data: CreateProductCardDto, imageFile?: File): Promise<ProductCard> => {
    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);

      Object.keys(data).forEach((key) => {
        const value = data[key as keyof CreateProductCardDto];
        if (value !== undefined && value !== null) {
          if (key === 'canvasData' && typeof value === 'object') {
            // Сохраняем как JSON строку
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const response = await axiosInstance.post<ProductCard>('/product-cards', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }
    const response = await axiosInstance.post<ProductCard>('/product-cards', data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<CreateProductCardDto>,
    imageFile?: File,
  ): Promise<ProductCard> => {
    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);

      Object.keys(data).forEach((key) => {
        const value = data[key as keyof CreateProductCardDto];
        if (value !== undefined && value !== null) {
          if (key === 'canvasData' && typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const response = await axiosInstance.put<ProductCard>(`/product-cards/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }
    const response = await axiosInstance.put<ProductCard>(`/product-cards/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/product-cards/${id}`);
  },
};
