import axiosInstance from '@/shared/api/axiosinstance';
import type { LayoutSchema } from '../model/layout.schemas';

export const layoutService = {
  async getLayoutsByTemplateId(templateId: number): Promise<LayoutSchema[]> {
    const response = await axiosInstance.get(`/layouts/template/${templateId}`);
    return response.data;
  },

  async getLayoutById(id: number): Promise<LayoutSchema> {
    const response = await axiosInstance.get(`/layouts/${id}`);
    return response.data;
  },

  async createLayout(data: Partial<LayoutSchema>): Promise<LayoutSchema> {
    const response = await axiosInstance.post('/layouts', data);
    return response.data;
  },

  async updateLayout(id: number, data: Partial<LayoutSchema>): Promise<LayoutSchema> {
    const response = await axiosInstance.put(`/layouts/${id}`, data);
    return response.data;
  },

  async deleteLayout(id: number): Promise<void> {
    await axiosInstance.delete(`/layouts/${id}`);
  },
};
