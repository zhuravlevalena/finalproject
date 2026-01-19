import { createAsyncThunk } from '@reduxjs/toolkit';
import { productCardService, type ProductCardFilters } from '../api/productcard.service';
import type { ProductCard, CreateProductCardDto } from './productcard.types';

export const fetchProductCardsThunk = createAsyncThunk(
  'productCard/fetchAll',
  async (filters?: ProductCardFilters): Promise<ProductCard[]> => productCardService.getAll(filters)
);

export const fetchProductCardByIdThunk = createAsyncThunk(
  'productCard/fetchById',
  async (id: number): Promise<ProductCard> => productCardService.getById(id)
);

export const createProductCardThunk = createAsyncThunk(
  'productCard/create',
  async (data: CreateProductCardDto): Promise<ProductCard> => productCardService.create(data)
);

export const updateProductCardThunk = createAsyncThunk(
  'productCard/update',
  async ({ id, data }: { id: number; data: Partial<CreateProductCardDto> }): Promise<ProductCard> => productCardService.update(id, data)
);

export const deleteProductCardThunk = createAsyncThunk(
  'productCard/delete',
  async (id: number): Promise<void> => {
    await productCardService.delete(id);
    return id;
  }
);
