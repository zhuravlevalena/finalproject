import axiosInstance from '@/shared/api/axiosinstance';

export type AIResponse = {
  response: string;
};

export const aiService = {
  ask: async (query: string): Promise<string> => {
    const response = await axiosInstance.post<AIResponse>('/ai/ask', { query });
    return response.data.response;
  },
};

