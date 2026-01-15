import axiosInstance from '@/shared/api/axiosinstance';
import type { Marketplace } from '../model/marketplace.types';

export const marketplaceService = {
  getAll: async (): Promise<Marketplace[]> => {
    const response = await axiosInstance.get<Marketplace[]>('/marketplaces');
    return response.data;
  },

  getById: async (id: number): Promise<Marketplace> => {
    const response = await axiosInstance.get<Marketplace>(`/marketplaces/${id}`);
    return response.data;
  },
};
