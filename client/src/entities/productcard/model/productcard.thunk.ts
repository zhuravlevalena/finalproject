import { createAsyncThunk } from '@reduxjs/toolkit';
import { productCardService } from '../api/productcard.service';
import type { ProductCard, CreateProductCardDto } from './productcard.types';

export const fetchProductCardsThunk = createAsyncThunk(
  'productCard/fetchAll',
  async (): Promise<ProductCard[]> => productCardService.getAll(),
);

export const fetchProductCardByIdThunk = createAsyncThunk(
  'productCard/fetchById',
  async (id: number): Promise<ProductCard> => productCardService.getById(id),
);

export const createProductCardThunk = createAsyncThunk(
  'productCard/create',
  async ({
    data,
    imageFile,
  }: {
    data: CreateProductCardDto;
    imageFile?: File;
  }): Promise<ProductCard> => productCardService.create(data, imageFile),
);

export const updateProductCardThunk = createAsyncThunk(
  'productCard/update',
  async ({
    id,
    data,
    imageFile,
  }: {
    id: number;
    data: Partial<CreateProductCardDto>;
    imageFile?: File;
  }): Promise<ProductCard> => productCardService.update(id, data, imageFile),
);

export const deleteProductCardThunk = createAsyncThunk(
  'productCard/delete',
  async (id: number): Promise<void> => {
    await productCardService.delete(id);
    return id;
  },
);
