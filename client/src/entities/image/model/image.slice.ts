import { createSlice } from '@reduxjs/toolkit';
import type { ImageState } from './image.types';
import { fetchImagesThunk, fetchImageByIdThunk, uploadImageThunk, deleteImageThunk } from './image.thunk';

const initialState: ImageState = {
  images: [],
  loading: false,
  error: null,
  uploading: false,
};

const imageSlice = createSlice({
  name: 'image',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
    
      .addCase(fetchImagesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchImagesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.images = action.payload;
      })
      .addCase(fetchImagesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch images';
      })
     
      .addCase(fetchImageByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchImageByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.images.findIndex((img) => img.id === action.payload.id);
        if (index === -1) {
          state.images.push(action.payload);
        } else {
          state.images[index] = action.payload;
        }
      })
      .addCase(fetchImageByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch image';
      })
     
      .addCase(uploadImageThunk.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadImageThunk.fulfilled, (state, action) => {
        state.uploading = false;
        state.images.push(action.payload);
      })
      .addCase(uploadImageThunk.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.error.message ?? 'Failed to upload image';
      })
    
      .addCase(deleteImageThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
            .addCase(deleteImageThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.images = state.images.filter((img) => img.id !== action.payload);
      })
      .addCase(deleteImageThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to delete image';
      });
  },
});

export default imageSlice.reducer;
