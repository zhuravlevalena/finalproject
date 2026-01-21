import { createAsyncThunk } from '@reduxjs/toolkit';
import { aiService, type AIResponse } from '../api/ai.service';

export const askAIThunk = createAsyncThunk(
  'ai/ask',
  async (query: string): Promise<AIResponse> => {
    return aiService.ask(query);
  }
);

