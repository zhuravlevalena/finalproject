import { z } from 'zod';

export const canvasElementTypeSchema = z.enum([
  'text',
  'image',
  'shape',
  'product-image',
  'price',
  'button',
  'textbox',
  'rect',
  'circle',
]);

export const elementStylesSchema = z.object({
  fontSize: z.number().optional(),
  fontWeight: z.string().optional(),
  fontFamily: z.string().optional(),
  fontStyle: z.string().optional(),
  color: z.string().optional(),
  fill: z.string().optional(),
  backgroundColor: z.string().optional(),
  stroke: z.string().optional(),
  strokeWidth: z.number().optional(),
  textAlign: z.enum(['left', 'center', 'right', 'justify']).optional(),
  opacity: z.number().optional(),
});

export const elementConstraintsSchema = z.object({
  lockAspectRatio: z.boolean().optional(),
  minWidth: z.number().optional(),
  minHeight: z.number().optional(),
  maxWidth: z.number().optional(),
  maxHeight: z.number().optional(),
  locked: z.boolean().optional(),
});

export const canvasElementSchema = z.object({
  id: z.string(),
  type: canvasElementTypeSchema,
  left: z.number(),
  top: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  scaleX: z.number().optional(),
  scaleY: z.number().optional(),
  angle: z.number().optional(),
  rotation: z.number().optional(),
  zIndex: z.number().optional(),
  content: z.string().optional(),
  text: z.string().optional(),
  src: z.string().optional(),
  styles: elementStylesSchema.optional(),
  constraints: elementConstraintsSchema.optional(),
  selectable: z.boolean().optional(),
  evented: z.boolean().optional(),

  originX: z.string().optional(),
  originY: z.string().optional(),
  fill: z.string().optional(),
  stroke: z.string().optional(),
  strokeWidth: z.number().optional(),
  radius: z.number().optional(),
  fontSize: z.number().optional(),
  fontFamily: z.string().optional(),
  fontWeight: z.string().optional(),
  fontStyle: z.string().optional(),
  textAlign: z.string().optional(),
});

export const canvasConfigSchema = z.object({
  width: z.number(),
  height: z.number(),
  backgroundColor: z.string().optional(),
  backgroundImage: z.string().optional(),
});

export const fabricCanvasDataSchema = z.object({
  version: z.string().optional(),
  objects: z.array(z.record(z.string(), z.unknown())),
  background: z.string().optional(),
  backgroundImage: z.record(z.string(), z.unknown()).optional(),
});

export const layoutCanvasDataSchema = z.object({
  fabric: fabricCanvasDataSchema.optional(),
  elements: z.array(canvasElementSchema).optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export const editorHistorySchema = z.object({
  past: z.array(z.array(canvasElementSchema)),
  future: z.array(z.array(canvasElementSchema)),
});

export const editorStateSchema = z.object({
  currentLayoutId: z.number().nullable(),
  elements: z.array(canvasElementSchema),
  selectedElementId: z.string().nullable(),
  history: editorHistorySchema,
  canvas: canvasConfigSchema,
  zoom: z.number().default(100),
  isDirty: z.boolean().default(false),
});

export type CanvasElementType = z.infer<typeof canvasElementTypeSchema>;
export type ElementStyles = z.infer<typeof elementStylesSchema>;
export type ElementConstraints = z.infer<typeof elementConstraintsSchema>;
export type CanvasElement = z.infer<typeof canvasElementSchema>;
export type CanvasConfig = z.infer<typeof canvasConfigSchema>;
export type FabricCanvasData = z.infer<typeof fabricCanvasDataSchema>;
export type LayoutCanvasData = z.infer<typeof layoutCanvasDataSchema>;
export type EditorHistory = z.infer<typeof editorHistorySchema>;
export type EditorState = z.infer<typeof editorStateSchema>;
