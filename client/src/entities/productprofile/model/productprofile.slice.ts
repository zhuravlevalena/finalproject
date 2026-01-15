import { createSlice } from '@reduxjs/toolkit';
import type { ProductProfileState } from './productprofile.types';
import {
  fetchProductProfilesThunk,
  fetchProductProfileByIdThunk,
  getOrCreateProductProfileThunk,
  updateProductProfileThunk,
  deleteProductProfileThunk,
} from './productprofile.thunk';

const initialState: ProductProfileState = {
  profiles: [],
  loading: false,
  error: null,
};

const productProfileSlice = createSlice({
  name: 'productProfile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all profiles
      .addCase(fetchProductProfilesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductProfilesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profiles = action.payload;
      })
      .addCase(fetchProductProfilesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch product profiles';
      })
      // Fetch profile by id
      .addCase(fetchProductProfileByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductProfileByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.profiles.findIndex((profile) => profile.id === action.payload.id);
        if (index === -1) {
          state.profiles.push(action.payload);
        } else {
          state.profiles[index] = action.payload;
        }
      })
      .addCase(fetchProductProfileByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch product profile';
      })
      // Get or create profile
      .addCase(getOrCreateProductProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrCreateProductProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.profiles.findIndex((profile) => profile.id === action.payload.id);
        if (index === -1) {
          state.profiles.push(action.payload);
        } else {
          state.profiles[index] = action.payload;
        }
      })
      .addCase(getOrCreateProductProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get or create product profile';
      })
      // Update profile
      .addCase(updateProductProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.profiles.findIndex((profile) => profile.id === action.payload.id);
        if (index !== -1) {
          state.profiles[index] = action.payload;
        }
      })
      .addCase(updateProductProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update product profile';
      })
      // Delete profile
      .addCase(deleteProductProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProductProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profiles = state.profiles.filter((profile) => profile.id !== action.payload);
      })
      .addCase(deleteProductProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete product profile';
      });
  },
});

export default productProfileSlice.reducer;
