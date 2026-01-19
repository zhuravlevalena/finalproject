import axiosInstance from '@/shared/api/axiosinstance';
import type { CardVersion, VersionComparison } from '../model/cardversion.types';

export const cardVersionService = {
  getVersions: async (cardId: number): Promise<CardVersion[]> => {
    const response = await axiosInstance.get<CardVersion[]>(
      `/card-versions/card/${cardId}`
    );
    return response.data;
  },

  getVersion: async (versionId: number): Promise<CardVersion> => {
    const response = await axiosInstance.get<CardVersion>(
      `/card-versions/${versionId}`
    );
    return response.data;
  },

  createVersion: async (
    cardId: number,
    data: {
      canvasData: Record<string, unknown>;
      title?: string;
      description?: string;
      changeDescription?: string;
    }
  ): Promise<CardVersion> => {
    const response = await axiosInstance.post<CardVersion>(
      `/card-versions/card/${cardId}`,
      data
    );
    return response.data;
  },

  restoreVersion: async (versionId: number): Promise<CardVersion> => {
    const response = await axiosInstance.post<CardVersion>(
      `/card-versions/${versionId}/restore`
    );
    return response.data;
  },

  compareVersions: async (
    versionId1: number,
    versionId2: number
  ): Promise<VersionComparison> => {
    const response = await axiosInstance.get<VersionComparison>(
      `/card-versions/compare?versionId1=${versionId1}&versionId2=${versionId2}`
    );
    return response.data;
  },

  autoSave: async (
    cardId: number,
    canvasData: Record<string, unknown>
  ): Promise<{ success: boolean; version?: CardVersion }> => {
    const response = await axiosInstance.post<{ success: boolean; version?: CardVersion }>(
      `/card-versions/card/${cardId}/autosave`,
      { canvasData }
    );
    return response.data;
  },
};
