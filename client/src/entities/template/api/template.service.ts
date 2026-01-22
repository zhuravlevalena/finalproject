import axiosInstance from '@/shared/api/axiosinstance';
import type { Template } from '../model/template.types';

export const templateService = {
  getAll: async (marketplaceId?: number): Promise<Template[]> => {
    const params = marketplaceId ? { marketplaceId } : {};
    const response = await axiosInstance.get<Template[]>('/templates', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Template> => {
    const response = await axiosInstance.get<Template>(`/templates/${id.toString()}`);
    return response.data;
  },
};