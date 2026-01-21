import type { AIResponse } from '../api/ai.service';

export type AIState = {
  response: AIResponse | null;
  loading: boolean;
  error: string | null;
};

