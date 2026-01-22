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
     
      .addCase(fetchProductCardsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductCardsThunk.fulfilled, (state, action) => ({
        ...state,
        loading: false,
        cards: action.payload,
      } as ProductCardState))
      .addCase(fetchProductCardsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch product cards';
      })
    
      .addCase(fetchProductCardByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductCardByIdThunk.fulfilled, (state, action) => {
        const index = state.cards.findIndex((card) => card.id === action.payload.id);
        if (index === -1) {
          return {
            ...state,
            loading: false,
            cards: [...state.cards, action.payload],
          } as ProductCardState;
        }
        return {
          ...state,
          loading: false,
          cards: state.cards.map((card, i) => (i === index ? action.payload : card)),
        } as ProductCardState;
      })
      .addCase(fetchProductCardByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch product card';
      })
      
      .addCase(createProductCardThunk.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createProductCardThunk.fulfilled, (state, action) => ({
        ...state,
        creating: false,
        cards: [...state.cards, action.payload],
      } as ProductCardState))
      .addCase(createProductCardThunk.rejected, (state, action) => {
        state.creating = false;
        state.error = action.error.message ?? 'Failed to create product card';
      })
     
      .addCase(updateProductCardThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductCardThunk.fulfilled, (state, action) => {
        const index = state.cards.findIndex((card) => card.id === action.payload.id);
        if (index !== -1) {
          return {
            ...state,
            loading: false,
            cards: state.cards.map((card, i) => (i === index ? action.payload : card)),
          } as ProductCardState;
        }
        return {
          ...state,
          loading: false,
        } as ProductCardState;
      })
      .addCase(updateProductCardThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to update product card';
      })
     
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
        state.error = action.error.message ?? 'Failed to delete product card';
      });
  },
});

export default productCardSlice.reducer;