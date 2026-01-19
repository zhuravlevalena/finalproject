import type { z } from 'zod';
import type { templateSchema } from './template.schemas';

export type Template = z.infer<typeof templateSchema>;

export type TemplateState = {
  templates: Template[];
  loading: boolean;
  error: string | null;
};
