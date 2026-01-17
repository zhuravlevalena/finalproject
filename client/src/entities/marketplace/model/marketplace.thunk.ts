import { createAsyncThunk } from '@reduxjs/toolkit';
import { marketplaceService } from '../api/marketplace.service';
import type { Marketplace } from './marketplace.types';

export const fetchMarketplacesThunk = createAsyncThunk(
  'marketplace/fetchAll',
  async (): Promise<Marketplace[]> => marketplaceService.getAll()
);

export const fetchMarketplaceByIdThunk = createAsyncThunk(
  'marketplace/fetchById',
  async (id: number): Promise<Marketplace> => marketplaceService.getById(id)
);
