import { createAsyncThunk } from '@reduxjs/toolkit';
import { marketplaceService } from '../api/marketplace.service';
import type { Marketplace } from './marketplace.types';

export const fetchMarketplacesThunk = createAsyncThunk(
  'marketplace/fetchAll',
  async (): Promise<Marketplace[]> => {
    return marketplaceService.getAll();
  }
);

export const fetchMarketplaceByIdThunk = createAsyncThunk(
  'marketplace/fetchById',
  async (id: number): Promise<Marketplace> => {
    return marketplaceService.getById(id);
  }
);
