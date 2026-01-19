import axiosInstance from '@/shared/api/axiosinstance';
import type { ProductCard, CreateProductCardDto } from '../model/productcard.types';

export const productCardService = {
  getAll: async (): Promise<ProductCard[]> => {
    const response = await axiosInstance.get<ProductCard[]>('/product-cards');
    return response.data;
  },

  getById: async (id: number): Promise<ProductCard> => {
    const response = await axiosInstance.get<ProductCard>(`/product-cards/${id}`);
    return response.data;
  },

  create: async (data: CreateProductCardDto): Promise<ProductCard> => {
    const response = await axiosInstance.post<ProductCard>('/product-cards', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateProductCardDto>): Promise<ProductCard> => {
    const response = await axiosInstance.put<ProductCard>(`/product-cards/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/product-cards/${id}`);
  },
};
