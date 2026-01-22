import axiosInstance from '@/shared/api/axiosinstance';
import type { ProductCard, CreateProductCardDto } from '../model/productcard.types';

export const productCardService = {
  getAll: async (): Promise<ProductCard[]> => {
    const response = await axiosInstance.get<ProductCard[]>('/product-cards');
    return response.data;
  },

  getById: async (id: number): Promise<ProductCard> => {
    const response = await axiosInstance.get<ProductCard>(`/product-cards/${id.toString()}`);
    return response.data;
  },

  create: async (data: CreateProductCardDto, imageFile?: File): Promise<ProductCard> => {
    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);

      Object.keys(data).forEach((key) => {
        const value = data[key as keyof CreateProductCardDto];
        if (value !== undefined) {
          if (key === 'canvasData' && typeof value === 'object') {
           
            formData.append(key, JSON.stringify(value));
          } else if (typeof value === 'string' || typeof value === 'number') {
            formData.append(key, String(value));
          } else if (typeof value === 'object') {
            
            formData.append(key, JSON.stringify(value));
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
        if (value !== undefined) {
          if (key === 'canvasData' && typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else if (typeof value === 'string' || typeof value === 'number') {
            formData.append(key, String(value));
          } else if (typeof value === 'object') {
           
            formData.append(key, JSON.stringify(value));
          }
        }
      });

      const response = await axiosInstance.put<ProductCard>(`/product-cards/${id.toString()}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }
    const response = await axiosInstance.put<ProductCard>(`/product-cards/${id.toString()}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/product-cards/${id.toString()}`);
  },
};