import axiosInstance from '@/shared/api/axiosinstance';
import type { Image } from '../model/image.types';

export const imageService = {
  getAll: async (): Promise<Image[]> => {
    const response = await axiosInstance.get<Image[]>('/images');
    return response.data;
  },

  getById: async (id: number): Promise<Image> => {
    const response = await axiosInstance.get<Image>(`/images/${id}`);
    return response.data;
  },

  upload: async (file: File): Promise<Image> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await axiosInstance.post<Image>('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/images/${id}`);
  },
};
