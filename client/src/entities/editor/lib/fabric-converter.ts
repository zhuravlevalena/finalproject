import type { CanvasElement, CanvasElementType } from '../model/editor.schemas';
import type { fabric } from 'fabric';

type FabricJsonObject = {
  name?: string;
  type?: string;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  zIndex?: number;
  selectable?: boolean;
  evented?: boolean;
  originX?: string;
  originY?: string;
  text?: string;
  src?: string;
  fill?: string | fabric.Pattern | fabric.Gradient;
  stroke?: string | fabric.Pattern | fabric.Gradient;
  strokeWidth?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  textAlign?: string;
  radius?: number;
  [key: string]: unknown;
};


type FabricCanvasJson = {
  version?: string;
  objects?: FabricJsonObject[];
  background?: string;
  backgroundImage?: Record<string, unknown>;
};


type CanvasConfig = {
  backgroundColor?: string;
  width?: number;
  height?: number;
};

export function fabricObjectToElement(obj: fabric.Object): CanvasElement {
  const baseElement: CanvasElement = {
    id: obj.name ?? `element-${String(Date.now())}-${String(Math.random())}`,
    type: (obj.type ?? 'text') as CanvasElementType,
    left: obj.left ?? 0,
    top: obj.top ?? 0,
    width: obj.width ?? undefined,
    height: obj.height ?? undefined,
    scaleX: obj.scaleX ?? undefined,
    scaleY: obj.scaleY ?? undefined,
    angle: obj.angle ?? undefined,
    zIndex: (obj as fabric.Object & { zIndex?: number }).zIndex ?? undefined,
    selectable: obj.selectable ?? undefined,
    evented: obj.evented ?? undefined,
  };

  
  if (obj.type === 'textbox' || obj.type === 'text' || obj.type === 'i-text') {
    const textObj = obj as fabric.Textbox | fabric.IText | fabric.Text;
    baseElement.text = textObj.text ?? undefined;
    baseElement.fontSize = textObj.fontSize ?? undefined;
    baseElement.fontFamily = textObj.fontFamily ?? undefined;
    baseElement.fontWeight = typeof textObj.fontWeight === 'string' ? textObj.fontWeight : String(textObj.fontWeight ?? 'normal');
    baseElement.fontStyle = textObj.fontStyle ?? undefined;
    baseElement.fill = typeof textObj.fill === 'string' ? textObj.fill : undefined;
    baseElement.textAlign = textObj.textAlign ?? undefined;
  }

 
  if (obj.type === 'image') {
    const imgObj = obj as fabric.Image;
    const src = imgObj.getSrc();
   
    if (typeof src === 'string') {
      baseElement.src = src;
    } else {
     
      baseElement.src = undefined;
    }
  }

  
  if (obj.type === 'rect' || obj.type === 'circle') {
    baseElement.fill = typeof obj.fill === 'string' ? obj.fill : undefined;
    baseElement.stroke = typeof obj.stroke === 'string' ? obj.stroke : undefined;
    baseElement.strokeWidth = obj.strokeWidth ?? undefined;
  }

  if (obj.type === 'circle') {
    const circleObj = obj as fabric.Circle;
    baseElement.radius = circleObj.radius ?? undefined;
  }

  return baseElement;
}


export function fabricCanvasToElements(fabricJson: FabricCanvasJson | null | undefined): CanvasElement[] {
 if (!Array.isArray(fabricJson?.objects)) {
    return [];
  }

  return fabricJson.objects.map((obj: FabricJsonObject, index: number): CanvasElement => {
    const element: CanvasElement = {
      id: obj.name ?? `element-${index.toString()}`,
      type: (obj.type ?? 'text') as CanvasElementType,
      left: obj.left ?? 0,
      top: obj.top ?? 0,
      width: obj.width ?? undefined,
      height: obj.height ?? undefined,
      scaleX: obj.scaleX ?? undefined,
      scaleY: obj.scaleY ?? undefined,
      angle: obj.angle ?? undefined,
      rotation: obj.angle ?? undefined,
      zIndex: obj.zIndex ?? index,
      selectable: obj.selectable ?? true,
      evented: obj.evented ?? true,
      originX: obj.originX ?? undefined,
      originY: obj.originY ?? undefined,
    };

   
    if (obj.text !== undefined) {
      element.text = obj.text;
      element.content = obj.text;
    }

    if (obj.src !== undefined) {
      element.src = obj.src;
      element.content = (typeof obj.content === 'string' ? obj.content : undefined) ?? obj.src;
    }

   
    if (obj.fill !== undefined) {
      element.fill = typeof obj.fill === 'string' ? obj.fill : undefined;
    }
    if (obj.stroke !== undefined) {
      element.stroke = typeof obj.stroke === 'string' ? obj.stroke : undefined;
    }
    if (obj.strokeWidth !== undefined) {
      element.strokeWidth = obj.strokeWidth;
    }

   
    if (obj.fontSize !== undefined) {
      element.fontSize = obj.fontSize;
    }
    if (obj.fontFamily !== undefined) {
      element.fontFamily = obj.fontFamily;
    }
    if (obj.fontWeight !== undefined) {
      element.fontWeight = typeof obj.fontWeight === 'string' ? obj.fontWeight : String(obj.fontWeight);
    }
    if (obj.fontStyle !== undefined) {
      element.fontStyle = obj.fontStyle;
    }
    if (obj.textAlign !== undefined) {
      element.textAlign = obj.textAlign;
    }

   
    if (obj.radius !== undefined) {
      element.radius = obj.radius;
    }

    return element;
  });
}

export function elementToFabricObject(element: CanvasElement): FabricJsonObject {
  const baseObj: FabricJsonObject = {
    name: element.id,
    type: element.type,
    left: element.left,
    top: element.top,
    width: element.width ?? undefined,
    height: element.height ?? undefined,
    scaleX: element.scaleX ?? 1,
    scaleY: element.scaleY ?? 1,
    angle: element.angle ?? element.rotation ?? 0,
    selectable: element.selectable ?? true,
    evented: element.evented ?? true,
    originX: element.originX ?? 'left',
    originY: element.originY ?? 'top',
  };

  
  if (element.type === 'textbox' || element.type === 'text') {
    baseObj.text = element.text ?? element.content ?? '';
    baseObj.fontSize = element.fontSize ?? element.styles?.fontSize ?? 24;
    baseObj.fontFamily = element.fontFamily ?? element.styles?.fontFamily ?? 'Arial';
    baseObj.fontWeight = element.fontWeight ?? element.styles?.fontWeight ?? 'normal';
    baseObj.fontStyle = element.fontStyle ?? element.styles?.fontStyle ?? 'normal';
    
    const fillValue = element.fill ?? element.styles?.fill ?? element.styles?.color ?? '#000000';
    baseObj.fill = typeof fillValue === 'string' ? fillValue : '#000000';
    
    baseObj.textAlign = element.textAlign ?? element.styles?.textAlign ?? 'left';
  }

  
  if (element.type === 'image') {
    baseObj.src = element.src ?? element.content ?? undefined;
  }

  
  if (element.type === 'rect' || element.type === 'circle' || element.type === 'shape') {
    const fillValue = element.fill ?? element.styles?.fill ?? element.styles?.backgroundColor ?? '#cccccc';
    baseObj.fill = typeof fillValue === 'string' ? fillValue : '#cccccc';
    
    const strokeValue = element.stroke ?? element.styles?.stroke;
    baseObj.stroke = typeof strokeValue === 'string' ? strokeValue : undefined;
    
    baseObj.strokeWidth = element.strokeWidth ?? element.styles?.strokeWidth ?? 0;
  }

  if (element.type === 'circle') {
    baseObj.radius = element.radius ?? 50;
  }

  return baseObj;
}

export function elementsToFabricCanvas(elements: CanvasElement[], canvasConfig?: CanvasConfig): FabricCanvasJson {
  return {
    version: '5.3.0',
    objects: elements.map(elementToFabricObject),
    background: canvasConfig?.backgroundColor ?? '#ffffff',
  };
}