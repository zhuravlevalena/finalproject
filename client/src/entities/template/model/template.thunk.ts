import { createAsyncThunk } from '@reduxjs/toolkit';
import { templateService } from '../api/template.service';
import type { Template } from './template.types';

export const fetchTemplatesThunk = createAsyncThunk(
  'template/fetchAll',
  async (marketplaceId?: number): Promise<Template[]> => templateService.getAll(marketplaceId)
);

export const fetchTemplateByIdThunk = createAsyncThunk(
  'template/fetchById',
  async (id: number): Promise<Template> => templateService.getById(id)
);
