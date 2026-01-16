import { createSlice } from '@reduxjs/toolkit';
import type { MarketplaceState } from './marketplace.types';
import { fetchMarketplacesThunk, fetchMarketplaceByIdThunk } from './marketplace.thunk';

const initialState: MarketplaceState = {
  marketplaces: [],
  loading: false,
  error: null,
};

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
     
      .addCase(fetchMarketplacesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarketplacesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.marketplaces = action.payload;
      })
      .addCase(fetchMarketplacesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch marketplaces';
      })
      
      .addCase(fetchMarketplaceByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarketplaceByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.marketplaces.findIndex((mp) => mp.id === action.payload.id);
        if (index === -1) {
          state.marketplaces.push(action.payload);
        } else {
          state.marketplaces[index] = action.payload;
        }
      })
      .addCase(fetchMarketplaceByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch marketplace';
      });
  },
});

export default marketplaceSlice.reducer;
