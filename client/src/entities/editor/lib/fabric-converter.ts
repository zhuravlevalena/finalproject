import type { CanvasElement } from '../model/editor.schemas';
import type { fabric } from 'fabric';

/**
 * Конвертирует Fabric.js объект в наш типизированный CanvasElement
 */
export function fabricObjectToElement(obj: fabric.Object): CanvasElement {
  const baseElement: CanvasElement = {
    id: obj.name || `element-${Date.now()}-${Math.random()}`,
    type: obj.type as any,
    left: obj.left || 0,
    top: obj.top || 0,
    width: obj.width,
    height: obj.height,
    scaleX: obj.scaleX,
    scaleY: obj.scaleY,
    angle: obj.angle,
    zIndex: obj.zIndex,
    selectable: obj.selectable,
    evented: obj.evented,
  };

  // Специфичные поля для текста
  if (obj.type === 'textbox' || obj.type === 'text') {
    const textObj = obj as fabric.Textbox;
    baseElement.text = textObj.text;
    baseElement.fontSize = textObj.fontSize;
    baseElement.fontFamily = textObj.fontFamily;
    baseElement.fontWeight = textObj.fontWeight as string;
    baseElement.fontStyle = textObj.fontStyle;
    baseElement.fill = textObj.fill as string;
    baseElement.textAlign = textObj.textAlign;
  }

  // Специфичные поля для изображений
  if (obj.type === 'image') {
    const imgObj = obj as fabric.Image;
    baseElement.src = imgObj.getSrc();
  }

  // Специфичные поля для фигур
  if (obj.type === 'rect' || obj.type === 'circle') {
    baseElement.fill = obj.fill as string;
    baseElement.stroke = obj.stroke as string;
    baseElement.strokeWidth = obj.strokeWidth;
  }

  if (obj.type === 'circle') {
    const circleObj = obj as fabric.Circle;
    baseElement.radius = circleObj.radius;
  }

  return baseElement;
}

/**
 * Конвертирует Fabric.js canvas JSON в массив наших элементов
 */
export function fabricCanvasToElements(fabricJson: any): CanvasElement[] {
  if (!fabricJson || !fabricJson.objects) {
    return [];
  }

  return fabricJson.objects.map((obj: any, index: number) => {
    return {
      id: obj.name || `element-${index}`,
      type: obj.type,
      left: obj.left || 0,
      top: obj.top || 0,
      width: obj.width,
      height: obj.height,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      angle: obj.angle,
      rotation: obj.angle,
      zIndex: index,
      text: obj.text,
      content: obj.text || obj.src,
      src: obj.src,
      fill: obj.fill,
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth,
      fontSize: obj.fontSize,
      fontFamily: obj.fontFamily,
      fontWeight: obj.fontWeight,
      fontStyle: obj.fontStyle,
      textAlign: obj.textAlign,
      radius: obj.radius,
      selectable: obj.selectable !== false,
      evented: obj.evented !== false,
      originX: obj.originX,
      originY: obj.originY,
    };
  });
}

/**
 * Конвертирует наш CanvasElement обратно в Fabric.js формат
 */
export function elementToFabricObject(element: CanvasElement): any {
  const baseObj: any = {
    name: element.id,
    type: element.type,
    left: element.left,
    top: element.top,
    width: element.width,
    height: element.height,
    scaleX: element.scaleX || 1,
    scaleY: element.scaleY || 1,
    angle: element.angle || element.rotation || 0,
    selectable: element.selectable !== false,
    evented: element.evented !== false,
    originX: element.originX || 'left',
    originY: element.originY || 'top',
  };

  // Текстовые поля
  if (element.type === 'textbox' || element.type === 'text') {
    baseObj.text = element.text || element.content || '';
    baseObj.fontSize = element.fontSize || element.styles?.fontSize || 24;
    baseObj.fontFamily = element.fontFamily || element.styles?.fontFamily || 'Arial';
    baseObj.fontWeight = element.fontWeight || element.styles?.fontWeight || 'normal';
    baseObj.fontStyle = element.fontStyle || element.styles?.fontStyle || 'normal';
    baseObj.fill = element.fill || element.styles?.fill || element.styles?.color || '#000000';
    baseObj.textAlign = element.textAlign || element.styles?.textAlign || 'left';
  }

  // Изображения
  if (element.type === 'image') {
    baseObj.src = element.src || element.content;
  }

  // Фигуры
  if (element.type === 'rect' || element.type === 'circle' || element.type === 'shape') {
    baseObj.fill =
      element.fill || element.styles?.fill || element.styles?.backgroundColor || '#cccccc';
    baseObj.stroke = element.stroke || element.styles?.stroke;
    baseObj.strokeWidth = element.strokeWidth || element.styles?.strokeWidth || 0;
  }

  if (element.type === 'circle') {
    baseObj.radius = element.radius || 50;
  }

  return baseObj;
}

/**
 * Конвертирует массив наших элементов в Fabric.js canvas JSON
 */
export function elementsToFabricCanvas(elements: CanvasElement[], canvasConfig?: any): any {
  return {
    version: '5.3.0',
    objects: elements.map(elementToFabricObject),
    background: canvasConfig?.backgroundColor || '#ffffff',
  };
}
