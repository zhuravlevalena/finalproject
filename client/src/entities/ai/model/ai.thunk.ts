import { createAsyncThunk } from '@reduxjs/toolkit';
import { aiService } from '../api/ai.service';

export const askAIThunk = createAsyncThunk(
  'ai/ask',
  async (query: string): Promise<string> => {
    return aiService.ask(query);
  }
);

