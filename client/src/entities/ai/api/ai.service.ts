import axiosInstance from '@/shared/api/axiosinstance';
import type { Image } from '@/entities/image/model/image.types';

export type AIResponse = {
  response: string;
  image: Image;
};

export const aiService = {
  ask: async (query: string): Promise<AIResponse> => {
    const response = await axiosInstance.post<AIResponse>('/ai/ask', { query });
    return response.data;
  },
};

