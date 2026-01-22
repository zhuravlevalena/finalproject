import axiosInstance from '@/shared/api/axiosinstance';
import type { ProductProfile } from '../model/productprofile.types';

export const productProfileService = {
  getAll: async (): Promise<ProductProfile[]> => {
    const response = await axiosInstance.get<ProductProfile[]>('/product-profiles');
    return response.data;
  },

  getById: async (id: number): Promise<ProductProfile> => {
    const response = await axiosInstance.get<ProductProfile>(`/product-profiles/${id.toString()}`);
    return response.data;
  },

  getOrCreate: async (productType: string): Promise<ProductProfile> => {
    const response = await axiosInstance.post<ProductProfile>('/product-profiles/get-or-create', { productType });
    return response.data;
  },

  update: async (id: number, data: Partial<ProductProfile>): Promise<ProductProfile> => {
    const response = await axiosInstance.put<ProductProfile>(`/product-profiles/${id.toString()}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/product-profiles/${id.toString()}`);
  },
};