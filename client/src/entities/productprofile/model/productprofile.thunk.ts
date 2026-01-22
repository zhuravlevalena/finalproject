import { createAsyncThunk } from '@reduxjs/toolkit';
import { productProfileService } from '../api/productprofile.service';
import type { ProductProfile } from './productprofile.types';

export const fetchProductProfilesThunk = createAsyncThunk(
  'productProfile/fetchAll',
  async (): Promise<ProductProfile[]> => productProfileService.getAll()
);

export const fetchProductProfileByIdThunk = createAsyncThunk(
  'productProfile/fetchById',
  async (id: number): Promise<ProductProfile> => productProfileService.getById(id)
);

export const getOrCreateProductProfileThunk = createAsyncThunk(
  'productProfile/getOrCreate',
  async (productType: string): Promise<ProductProfile> => productProfileService.getOrCreate(productType)
);

export const updateProductProfileThunk = createAsyncThunk(
  'productProfile/update',
  async ({ id, data }: { id: number; data: Partial<ProductProfile> }): Promise<ProductProfile> => 
    productProfileService.update(id, data)
);

export const deleteProductProfileThunk = createAsyncThunk(
  'productProfile/delete',
  async (id: number): Promise<number> => {
    await productProfileService.delete(id);
    return id;
  }
);