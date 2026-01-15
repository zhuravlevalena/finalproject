import { createSlice } from '@reduxjs/toolkit';
import type { TemplateState } from './template.types';
import { fetchTemplatesThunk, fetchTemplateByIdThunk } from './template.thunk';

const initialState: TemplateState = {
  templates: [],
  loading: false,
  error: null,
};

const templateSlice = createSlice({
  name: 'template',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all templates
      .addCase(fetchTemplatesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplatesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload;
      })
      .addCase(fetchTemplatesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch templates';
      })
      // Fetch template by id
      .addCase(fetchTemplateByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplateByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.templates.findIndex((t) => t.id === action.payload.id);
        if (index === -1) {
          state.templates.push(action.payload);
        } else {
          state.templates[index] = action.payload;
        }
      })
      .addCase(fetchTemplateByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch template';
      });
  },
});

export default templateSlice.reducer;
