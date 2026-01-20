import { createSlice } from '@reduxjs/toolkit';
import type { AIState } from './ai.types';
import { askAIThunk } from './ai.thunk';

const initialState: AIState = {
  response: null,
  loading: false,
  error: null,
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearResponse: (state) => {
      state.response = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(askAIThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.response = null;
      })
      .addCase(askAIThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.response = action.payload;
      })
      .addCase(askAIThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get AI response';
      });
  },
});

export const { clearResponse } = aiSlice.actions;
export default aiSlice.reducer;

