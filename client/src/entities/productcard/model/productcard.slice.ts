import { createSlice } from '@reduxjs/toolkit';
import type { ProductCardState } from './productcard.types';
import {
  fetchProductCardsThunk,
  fetchProductCardByIdThunk,
  createProductCardThunk,
  updateProductCardThunk,
  deleteProductCardThunk,
} from './productcard.thunk';

const initialState: ProductCardState = {
  cards: [],
  loading: false,
  error: null,
  creating: false,
};

const productCardSlice = createSlice({
  name: 'productCard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all cards
      .addCase(fetchProductCardsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductCardsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.cards = action.payload;
      })
      .addCase(fetchProductCardsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch product cards';
      })
      // Fetch card by id
      .addCase(fetchProductCardByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductCardByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.cards.findIndex((card) => card.id === action.payload.id);
        if (index === -1) {
          state.cards.push(action.payload);
        } else {
          state.cards[index] = action.payload;
        }
      })
      .addCase(fetchProductCardByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch product card';
      })
      // Create card
      .addCase(createProductCardThunk.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createProductCardThunk.fulfilled, (state, action) => {
        state.creating = false;
        state.cards.push(action.payload);
      })
      .addCase(createProductCardThunk.rejected, (state, action) => {
        state.creating = false;
        state.error = action.error.message || 'Failed to create product card';
      })
      // Update card
      .addCase(updateProductCardThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductCardThunk.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.cards.findIndex((card) => card.id === action.payload.id);
        if (index !== -1) {
          state.cards[index] = action.payload;
        }
      })
      .addCase(updateProductCardThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update product card';
      })
      // Delete card
      .addCase(deleteProductCardThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProductCardThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.cards = state.cards.filter((card) => card.id !== action.payload);
      })
      .addCase(deleteProductCardThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete product card';
      });
  },
});

export default productCardSlice.reducer;
