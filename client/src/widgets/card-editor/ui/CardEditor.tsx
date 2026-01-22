import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { fabric } from 'fabric';
import {
  Type,
  Image as ImageIcon,
  Trash2,
  Download,
  Save,
  Undo,
  Redo,
  Copy,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Plus,
  RotateCw,
} from 'lucide-react';
import { imageService } from '@/entities/image/api/image.service';

type CardEditorProps = {
  onSave: (
    imageFile: File,
    canvasData?: { fabric?: Record<string, unknown>; meta?: Record<string, unknown> },
  ) => void | Promise<void>;
  initialImage?: {
    id: number;
    url: string;
  };
  backgroundImage?: {
    id: number;
    url: string;
  };
  cardSize: string;
  slideCount: number;
  card?: {
    canvasData?: {
      fabric?: Record<string, unknown>;
      meta?: Record<string, unknown>;
    };
    generatedImage?: {
      url: string;
    };
  };
};

// Тип для ref методов
export type CardEditorRef = {
  addTextElements?: (
    texts: { text: string; fontSize?: number; top?: number; left?: number }[],
  ) => void;
  getCanvasData?: () => { fabric?: Record<string, unknown>; meta?: Record<string, unknown> } | null;
};

export const CardEditor = forwardRef<CardEditorRef, CardEditorProps>(
  ({ onSave, initialImage, backgroundImage, cardSize, card }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const isRestoringRef = useRef(false);
    const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
    const [history, setHistory] = useState<{ undo: string[]; redo: string[] }>({
      undo: [],
      redo: [],
    });
    const [zoom, setZoom] = useState(100);
    const [isLoading, setIsLoading] = useState(false);

    // Текстовые свойства для панели редактирования
    const [textProps, setTextProps] = useState({
      fontSize: 24,
      fontFamily: 'Arial',
      fill: '#000000',
      textAlign: 'left' as 'left' | 'center' | 'right' | 'justify',
      fontWeight: 'normal' as 'normal' | 'bold',
      fontStyle: 'normal' as 'normal' | 'italic',
    });

    // Сохранение истории
    const saveHistory = useCallback(() => {
      if (!fabricCanvasRef.current) return;
      try {
        const json = fabricCanvasRef.current.toJSON();
        setHistory((prev) => ({
          undo: [...prev.undo, JSON.stringify(json)].slice(-50),
          redo: [],
        }));
      } catch (error) {
        console.error('Error saving canvas history:', error);
      }
    }, []);

    // Обновление выбранного объекта
    const updateSelectedObject = useCallback(() => {
      if (!fabricCanvasRef.current) return;
      const activeObject = fabricCanvasRef.current.getActiveObject();
      setSelectedObject(activeObject);

      if (
        activeObject?.type === 'textbox' ||
        activeObject?.type === 'text' ||
        activeObject?.type === 'i-text'
      ) {
        const textObj = activeObject as fabric.Textbox | fabric.IText | fabric.Text;
        setTextProps({
          fontSize: textObj.fontSize ?? 24,
          fontFamily: textObj.fontFamily ?? 'Arial',
          fill: typeof textObj.fill === 'string' ? textObj.fill : '#000000',
          textAlign: (typeof textObj.textAlign === 'string' ? textObj.textAlign : 'left') as 'left' | 'center' | 'right' | 'justify',
          fontWeight: textObj.fontWeight === 'bold' ? 'bold' : 'normal',
          fontStyle: textObj.fontStyle === 'italic' ? 'italic' : 'normal',
        });
      }
    }, []);

    // Загрузка состояния из истории
    const loadFromHistory = useCallback(
      (jsonString: string) => {
        if (!fabricCanvasRef.current) return;
        isRestoringRef.current = true;
        fabricCanvasRef.current.loadFromJSON(jsonString, () => {
          fabricCanvasRef.current?.renderAll();
          updateSelectedObject();
          isRestoringRef.current = false;
        });
      },
      [updateSelectedObject],
    );

    // Метод для добавления текстовых элементов на canvas
    const addTextElements = useCallback(
      (texts: { text: string; fontSize?: number; top?: number; left?: number }[]) => {
        if (!fabricCanvasRef.current) return;

        const canvas = fabricCanvasRef.current;
        texts.forEach(({ text, fontSize = 24, top = 50, left = 50 }) => {
          const textbox = new fabric.Textbox(text, {
            left,
            top,
            width: canvas.getWidth() - left * 2, // Ширина с отступами
            fontSize,
            fontFamily: textProps.fontFamily,
            fill: textProps.fill,
            textAlign: 'left' as const,
            fontWeight: 'normal' as const,
            fontStyle: 'normal' as const,
            editable: true,
            selectable: true,
            evented: true,
            splitByGrapheme: true,
          });

          canvas.add(textbox);
        });

        fabricCanvasRef.current.renderAll();
        saveHistory();
      },
      [textProps.fontFamily, textProps.fill, saveHistory],
    );

    const getCanvasData = useCallback((): {
      fabric?: Record<string, unknown>;
      meta?: Record<string, unknown>;
    } | null => {
      if (!fabricCanvasRef.current) return null;
      const fabricJson = fabricCanvasRef.current.toJSON();
      const meta = {
        width: fabricCanvasRef.current.getWidth(),
        height: fabricCanvasRef.current.getHeight(),
        objectsCount: fabricCanvasRef.current.getObjects().length,
      };
      return {
        fabric: fabricJson,
        meta,
      };
    }, []);

    // Экспортируем методы через ref
    useImperativeHandle(
      ref,
      () => ({
        addTextElements,
        getCanvasData,
      }),
      [addTextElements, getCanvasData],
    );

    // Инициализация canvas
    useEffect(() => {
      if (!canvasRef.current) return;

      const [width, height] = cardSize.split('x').map(Number);

      const canvas = new fabric.Canvas(canvasRef.current, {
        width,
        height,
        backgroundColor: '#ffffff',
        preserveObjectStacking: true,
      });
      setHistory({
        undo: [JSON.stringify(canvas.toJSON())],
        redo: [],
      });

      // Загружаем сохраненные данные, если есть
<<<<<<< HEAD
      if (card?.canvasData && typeof card.canvasData === 'object' && 'fabric' in card.canvasData) {
        const canvasData = card.canvasData as {
          fabric?: Record<string, unknown>;
          meta?: { cardSize?: string; [key: string]: unknown };
        };
        const fabricData = canvasData.fabric;
        if (fabricData) {
          try {
            const sourceSize = canvasData.meta?.cardSize || '900x1200';
=======
      if (card?.canvasData) {
        let fabricData: Record<string, unknown> | null = null;
        let meta: { cardSize?: string; [key: string]: unknown } | undefined;
        
        // Проверяем разные форматы данных
        if (typeof card.canvasData === 'object' && 'fabric' in card.canvasData) {
          // Формат: { fabric: {...}, meta: {...} }
          const canvasData = card.canvasData as {
            fabric?: Record<string, unknown>;
            meta?: { cardSize?: string; [key: string]: unknown };
          };
          fabricData = canvasData.fabric ?? null;
          meta = canvasData.meta;
        } else if (typeof card.canvasData === 'object' && ('version' in card.canvasData || 'objects' in card.canvasData)) {
          // Формат напрямую из сидера: { version, objects }
          fabricData = card.canvasData as Record<string, unknown>;
        }
        
        console.log('🔍 Loading canvas data:', { fabricData, cardCanvasData: card.canvasData, hasFabric: !!fabricData });
        
        if (fabricData) {
          try {
            // Определяем исходный размер макета
            const sourceSize = meta?.cardSize ?? '900x1200';
>>>>>>> main
            const [sourceWidth, sourceHeight] = sourceSize.split('x').map(Number);
            const [targetWidth, targetHeight] = cardSize.split('x').map(Number);

            const scaleX = targetWidth / sourceWidth;
            const scaleY = targetHeight / sourceHeight;

            canvas.loadFromJSON(fabricData, () => {
              if (scaleX !== 1 || scaleY !== 1) {
                const bgImage = canvas.backgroundImage;
                const bgVpt = canvas.backgroundVpt;
                canvas.getObjects().forEach((obj) => {
                  // Пропускаем фоновые объекты (если они есть и являются объектами)
                  if (bgImage && typeof bgImage === 'object' && obj === bgImage) {
                    return;
                  }
                  if (bgVpt && typeof bgVpt === 'object' && obj === bgVpt) {
                    return;
                  }

                  if (obj.left !== undefined) {
                    obj.set('left', (obj.left ?? 0) * scaleX);
                  }
                  if (obj.top !== undefined) {
                    obj.set('top', (obj.top ?? 0) * scaleY);
                  }

                  if (obj.width !== undefined) {
                    obj.set('width', (obj.width ?? 0) * scaleX);
                  }
                  if (obj.height !== undefined) {
                    obj.set('height', (obj.height ?? 0) * scaleY);
                  }

                  if (obj.type === 'circle' && 'radius' in obj) {
                    const circle = obj as fabric.Circle;
                    const avgScale = (scaleX + scaleY) / 2; // Для кругов используем средний масштаб
                    circle.set('radius', (circle.radius ?? 0) * avgScale);
                  }

                  if (obj.type === 'textbox' || obj.type === 'text' || obj.type === 'i-text') {
                    const textObj = obj as fabric.Textbox | fabric.IText | fabric.Text;
                    const avgScale = (scaleX + scaleY) / 2;
                    const updates: Record<string, unknown> = {};
                    if (textObj.fontSize) {
                      updates.fontSize = textObj.fontSize * avgScale;
                    }
                    if (textObj.width !== undefined) {
                      updates.width = (textObj.width ?? 0) * scaleX;
                    }
                    if (Object.keys(updates).length > 0) {
                      textObj.set(updates);
                    }
                  }

                  if (obj.strokeWidth !== undefined && obj.strokeWidth > 0) {
                    const avgScale = (scaleX + scaleY) / 2;
                    obj.set('strokeWidth', obj.strokeWidth * avgScale);
                  }

                  if (obj.type === 'line') {
                    const line = obj as fabric.Line;
                    if (line.x1 !== undefined) line.set('x1', line.x1 * scaleX);
                    if (line.y1 !== undefined) line.set('y1', line.y1 * scaleY);
                    if (line.x2 !== undefined) line.set('x2', line.x2 * scaleX);
                    if (line.y2 !== undefined) line.set('y2', line.y2 * scaleY);
                  }

                  if (obj.type === 'rect') {
                    const rect = obj as fabric.Rect;
                    if (rect.rx !== undefined && rect.rx > 0) {
                      rect.set('rx', rect.rx * scaleX);
                    }
                    if (rect.ry !== undefined && rect.ry > 0) {
                      rect.set('ry', rect.ry * scaleY);
                    }
                  }

                  obj.setCoords();
                });
              }

              // Убеждаемся, что все объекты (кроме фона) редактируемы
              const bgImage2 = canvas.backgroundImage;
              const bgVpt2 = canvas.backgroundVpt;
              canvas.getObjects().forEach((obj) => {
                // Пропускаем фоновые объекты (если они есть и являются объектами)
                if (bgImage2 && typeof bgImage2 === 'object' && obj === bgImage2) {
                  return;
                }
                if (bgVpt2 && typeof bgVpt2 === 'object' && obj === bgVpt2) {
                  return;
                }
                obj.set({
                  selectable: true,
                  evented: true,
                });
                  // Для текстовых объектов (textbox, text, i-text) включаем редактирование и инициализируем styles
                if (obj.type === 'textbox' || obj.type === 'text' || obj.type === 'i-text') {
                  const textObj = obj as fabric.Textbox | fabric.IText | fabric.Text;
                  textObj.set({ editable: true });
                  // Инициализируем styles, если их нет или они некорректны
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
                  if (!(textObj as any).styles || typeof (textObj as any).styles !== 'object') {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
                    (textObj as any).styles = {};
                  }
                  // Убеждаемся, что для каждой строки есть массив стилей
                  const textLines = textObj.text?.split('\n') ?? [];
                  textLines.forEach((_line, index) => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
                    if (!(textObj as any).styles[index]) {
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
                      (textObj as any).styles[index] = {};
                    }
                  });
                }
              });
              canvas.renderAll();
              setHistory({
                undo: [JSON.stringify(canvas.toJSON())],
                redo: [],
              });
            });
          } catch (err) {
            console.error('Error loading canvas data:', err);
          }
        }
      }

      // События canvas
      const historySafe = (): void => {
        if (isRestoringRef.current) return;
        saveHistory();
      };

      canvas.on('object:added', () => {
        historySafe();
        updateSelectedObject();
      });
      canvas.on('object:modified', () => {
        historySafe();
        updateSelectedObject();
      });
      canvas.on('object:removed', () => {
        historySafe();
        updateSelectedObject();
      });
      canvas.on('selection:created', updateSelectedObject);
      canvas.on('selection:updated', updateSelectedObject);
      canvas.on('selection:cleared', () => {
        setSelectedObject(null);
      });
      canvas.on('object:moving', updateSelectedObject);
      canvas.on('object:scaling', updateSelectedObject);
      canvas.on('object:rotating', updateSelectedObject);

      canvas.on('text:changed', () => {
        historySafe();
        updateSelectedObject();
      });

      canvas.on('editing:entered', (options) => {
        const target = options.target as fabric.Textbox | fabric.IText | fabric.Text | undefined;
        if (target && (target.type === 'textbox' || target.type === 'text' || target.type === 'i-text')) {
          // Исправляем проблему с styles для предотвращения ошибки removeStyleFromTo
          // Инициализируем styles как объект, если его нет
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
          if (!(target as any).styles || typeof (target as any).styles !== 'object') {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
            (target as any).styles = {};
          }
          // Убеждаемся, что для каждой строки есть объект стилей
          const textLines = target.text?.split('\n') ?? [];
          textLines.forEach((_line, index) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
            if (!(target as any).styles[index]) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
              (target as any).styles[index] = {};
            }
            // Убеждаемся, что для каждого символа есть объект стилей
            const lineLength = _line.length;
            for (let i = 0; i <= lineLength; i++) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
              if (!(target as any).styles[index][i]) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
                (target as any).styles[index][i] = {};
              }
            }
          });
        }
      });

      canvas.on('editing:exited', (options) => {
        const target = options.target as fabric.Textbox | undefined;
        if (target) {
          saveHistory();
          updateSelectedObject();
        }
      });

      const handleKeyDown = (e: KeyboardEvent): void => {
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          (e.target as HTMLElement).isContentEditable
        ) {
          return;
        }

        if ((e.key === 'Delete' || e.key === 'Backspace') && canvas.getActiveObject()) {
          e.preventDefault();
          const activeObjects = canvas.getActiveObjects();
          const bgImage3 = canvas.backgroundImage;
          const bgVpt3 = canvas.backgroundVpt;
          activeObjects.forEach((obj) => {
            // Не удаляем фоновые объекты (если они есть и являются объектами)
            if (bgImage3 && typeof bgImage3 === 'object' && obj === bgImage3) {
              return;
            }
            if (bgVpt3 && typeof bgVpt3 === 'object' && obj === bgVpt3) {
              return;
            }
            canvas.remove(obj);
          });
          canvas.discardActiveObject();
          canvas.renderAll();
          setSelectedObject(null);
          saveHistory();
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      fabricCanvasRef.current = canvas;
      saveHistory();

<<<<<<< HEAD
      return () => {
=======
      // eslint-disable-next-line consistent-return
      return (): void => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', handleResize);
        // Удаляем обработчик клавиатуры
>>>>>>> main
        window.removeEventListener('keydown', handleKeyDown);
        canvas.dispose();
        fabricCanvasRef.current = null;
      };
    }, [cardSize, saveHistory, updateSelectedObject, card]);

    useEffect(() => {
      const c = fabricCanvasRef.current;
      if (!c) return;
      c.calcOffset();
      c.renderAll();
    }, [zoom]);

    // Установка фона
    useEffect(() => {
      if (!backgroundImage || !fabricCanvasRef.current) return;

      fabric.Image.fromURL(
        backgroundImage.url,
        (img) => {
          const canvas = fabricCanvasRef.current;
          if (!canvas || !img.width || !img.height) return;
          const scale = Math.min(canvas.getWidth() / img.width, canvas.getHeight() / img.height);
          img.scale(scale);
          canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
            scaleX: scale,
            scaleY: scale,
          });
          saveHistory();
        },
        { crossOrigin: 'anonymous' },
      );
    }, [backgroundImage, saveHistory]);

    // Добавление основного изображения
    useEffect(() => {
      if (!initialImage || !fabricCanvasRef.current || backgroundImage) return;

      fabric.Image.fromURL(
        initialImage.url,
        (img) => {
          const canvas = fabricCanvasRef.current;
          if (!canvas || !img.width || !img.height) return;
          const maxWidth = canvas.getWidth() * 0.7;
          const maxHeight = canvas.getHeight() * 0.7;
          const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);

          img.set({
            left: canvas.getWidth() / 2,
            top: canvas.getHeight() / 2,
            originX: 'center',
            originY: 'center',
            scaleX: scale,
            scaleY: scale,
            selectable: true,
            evented: true,
          });

          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
          saveHistory();
        },
        { crossOrigin: 'anonymous' },
      );
    }, [initialImage, backgroundImage, saveHistory]);

    // Добавление текста
    const handleAddText = (): void => {
      if (!fabricCanvasRef.current) return;

      const text = new fabric.Textbox('Введите текст', {
        left: fabricCanvasRef.current.getWidth() / 2 - 100,
        top: fabricCanvasRef.current.getHeight() / 2 - 15,
        width: 200,
        fontSize: textProps.fontSize,
        fontFamily: textProps.fontFamily,
        fill: textProps.fill,
        textAlign: textProps.textAlign,
        fontWeight: textProps.fontWeight,
        fontStyle: textProps.fontStyle,
        editable: true,
        selectable: true,
        evented: true,
      });

      fabricCanvasRef.current.add(text);
      fabricCanvasRef.current.setActiveObject(text);
      fabricCanvasRef.current.renderAll();
      updateSelectedObject();
    };

    // Добавление изображения
    const handleAddImage = (): void => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file || !fabricCanvasRef.current) return;

        try {
          const uploadedImage = await imageService.upload(file);

          let imageUrl = uploadedImage.url;
          if (!imageUrl.startsWith('http')) {
            imageUrl = `${window.location.origin}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
          }

          console.log('Loading image from URL:', imageUrl);

          fabric.Image.fromURL(
            imageUrl,
            (img) => {
              if (!fabricCanvasRef.current) {
                console.error('Canvas not available');
                return;
              }

              const canvas = fabricCanvasRef.current;
              const imgWidth = img.width ?? 1;
              const imgHeight = img.height ?? 1;
              const maxWidth = canvas.getWidth() * 0.6;
              const maxHeight = canvas.getHeight() * 0.6;
              const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight, 1);
              img.set({
                left: canvas.getWidth() / 2,
                top: canvas.getHeight() / 2,
                originX: 'center',
                originY: 'center',
                scaleX: scale,
                scaleY: scale,
                selectable: true,
                evented: true,
              });

              canvas.add(img);
              canvas.setActiveObject(img);
              canvas.renderAll();
              updateSelectedObject();
              saveHistory();
            },
            { crossOrigin: 'anonymous' },
          );
        } catch (error) {
          console.error('Error uploading image:', error);
          alert(
            `Ошибка при загрузке изображения: ${
              error instanceof Error ? error.message : 'Неизвестная ошибка'
            }`,
          );
        }
      };
      input.click();
    };

    // Удаление выбранного объекта
    const handleDelete = (): void => {
      if (!fabricCanvasRef.current) return;
      const activeObjects = fabricCanvasRef.current.getActiveObjects();
      if (activeObjects.length === 0) return;
      
      const canvas = fabricCanvasRef.current;
      const bgImage4 = canvas.backgroundImage;
      const bgVpt4 = canvas.backgroundVpt;
      activeObjects.forEach((obj) => {
        // Не удаляем фоновые объекты (если они есть и являются объектами)
        if (bgImage4 && typeof bgImage4 === 'object' && obj === bgImage4) {
          return;
        }
        if (bgVpt4 && typeof bgVpt4 === 'object' && obj === bgVpt4) {
          return;
        }
        canvas.remove(obj);
      });
      fabricCanvasRef.current.discardActiveObject();
      fabricCanvasRef.current.renderAll();
      setSelectedObject(null);
      saveHistory();
    };

    // Дублирование объекта
    const handleDuplicate = (): void => {
      if (!fabricCanvasRef.current || !selectedObject) return;

      const canvas = fabricCanvasRef.current;
      selectedObject.clone((cloned: fabric.Object) => {
        cloned.set({
          left: (cloned.left ?? 0) + 20,
          top: (cloned.top ?? 0) + 20,
        });
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.renderAll();
        updateSelectedObject();
      });
    };

    // Undo
    const handleUndo = (): void => {
      if (!fabricCanvasRef.current) return;
      setHistory((prev) => {
        if (prev.undo.length < 2) return prev;
        const current = JSON.stringify(fabricCanvasRef.current!.toJSON());
        const target = prev.undo[prev.undo.length - 2];
        setTimeout(() => loadFromHistory(target), 0);
        return {
          undo: prev.undo.slice(0, -1),
          redo: [current, ...prev.redo],
        };
      });
    };

    // Redo
    const handleRedo = (): void => {
      if (!fabricCanvasRef.current) return;
      setHistory((prev) => {
        if (prev.redo.length === 0) return prev;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const current = JSON.stringify(fabricCanvasRef.current!.toJSON());
        const target = prev.redo[0];
        setTimeout(() => loadFromHistory(target), 0);
        return {
          undo: [...prev.undo, current],
          redo: prev.redo.slice(1),
        };
      });
    };

    // Обновление текстовых свойств
    const updateTextProperty = (property: string, value: string | number): void => {
      if (!fabricCanvasRef.current || !selectedObject) return;
      const t = selectedObject.type;
      if (t !== 'textbox' && t !== 'text' && t !== 'i-text') return;

      const textObj = selectedObject as fabric.Textbox | fabric.IText | fabric.Text;
      textObj.set({ [property]: value });
      fabricCanvasRef.current.renderAll();
      updateSelectedObject();
    };

    // Изменение размера шрифта
    const handleFontSizeChange = (delta: number): void => {
      if (!selectedObject) return;
      const t = selectedObject.type;
      if (t !== 'textbox' && t !== 'text' && t !== 'i-text') return;
      const textObj = selectedObject as fabric.Textbox | fabric.IText | fabric.Text;
      const newSize = Math.max(8, Math.min(200, (textObj.fontSize ?? 24) + delta));
      updateTextProperty('fontSize', newSize);
    };

    // Экспорт
    const handleExport = (): void => {
      if (!fabricCanvasRef.current) return;
      const dataURL = fabricCanvasRef.current.toDataURL({
        format: 'png',
        quality: 1,
      });
      const link = document.createElement('a');
      const timestamp = String(Date.now());
      link.download = `card-${timestamp}.png`;
      link.href = dataURL;
      link.click();
    };

    // Сохранение
    const handleSave = async (): Promise<void> => {
      if (!fabricCanvasRef.current) return;
      setIsLoading(true);
      try {
        const dataURL = fabricCanvasRef.current.toDataURL({
          format: 'png',
          quality: 1,
          multiplier: 1,
        });

        const response = await fetch(dataURL);
        const blob = await response.blob();
        const timestamp = String(Date.now());
        const file = new File([blob], `card-${timestamp}.png`, { type: 'image/png' });

        let fabricJson: Record<string, unknown> | null = null;
        try {
          fabricJson = fabricCanvasRef.current.toJSON();
        } catch (jsonError) {
          console.error('Error serializing canvas to JSON:', jsonError);
        }

        const meta = {
          width: fabricCanvasRef.current.getWidth(),
          height: fabricCanvasRef.current.getHeight(),
          cardSize,
          objectsCount: fabricCanvasRef.current.getObjects().length,
        };

        await Promise.resolve(
          onSave(file, {
            fabric: fabricJson ?? undefined, // Полный JSON для восстановления (если доступен)
            meta,
          }),
        );
      } catch (error) {
        console.error('Error saving canvas:', error);
        alert('Ошибка при сохранении карточки');
      } finally {
        setIsLoading(false);
      }
    };

    // Изменение масштаба
    const handleZoom = (delta: number): void => {
      setZoom((z) => Math.max(25, Math.min(200, z + delta)));
    };

    const isTextSelected = Boolean(
      selectedObject &&
      (selectedObject.type === 'textbox' ||
        selectedObject.type === 'text' ||
        selectedObject.type === 'i-text'),
    );
    const isImageSelected = selectedObject?.type === 'image';

    return (
      <div className="flex flex-col h-full">
        {/* Верхняя панель инструментов */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 border-b border-gray-200 flex-wrap">
          {/* Размер карточки */}
          <div className="flex items-center gap-2 border-r pr-2 mr-2">
            <span className="text-sm font-medium text-gray-700">Размер:</span>
            <span className="text-sm text-gray-600">{cardSize}</span>
          </div>

          {/* Группа добавления */}
          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            <button
              onClick={handleAddText}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Добавить текст"
            >
              <Type className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Текст</span>
            </button>
            <button
              onClick={handleAddImage}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Добавить изображение"
            >
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Изображение</span>
            </button>
          </div>

          {/* Группа истории */}
          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            <button
              onClick={handleUndo}
              disabled={history.undo.length < 2}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Отменить"
            >
              <Undo className="h-4 w-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={history.redo.length === 0}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Повторить"
            >
              <Redo className="h-4 w-4" />
            </button>
          </div>

          {/* Группа действий */}
          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            <button
              onClick={handleDuplicate}
              disabled={!selectedObject}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Дублировать"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={!selectedObject}
              className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-red-600"
              title="Удалить"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Масштаб */}
          <div className="flex items-center gap-2 border-r pr-2 mr-2">
            <button
              onClick={() => handleZoom(-10)}
              className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-sm font-medium min-w-[3rem] text-center">{zoom}%</span>
            <button
              onClick={() => handleZoom(10)}
              className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Сохранение и экспорт */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">
                {isLoading ? 'Сохранение...' : 'Сохранить'}
              </span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Скачать</span>
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Canvas область - теперь занимает всю ширину */}
          <div className="flex-1 flex items-start justify-start p-4 bg-gray-100 overflow-auto min-h-0 w-full">
            <div
              className="bg-white shadow-lg rounded-lg p-2 inline-block"
              style={{
                transform: `scale(${String(zoom / 100)})`,
                transformOrigin: 'top left',
              }}
            >
<<<<<<< HEAD
              <canvas ref={canvasRef} />
=======
              {/* Визуальные разметки границ карточки */}
              {(() => {
                const [width, height] = cardSize.split('x').map(Number);
                return (
                  <>
                    {/* Рамка вокруг canvas */}
                    <div
                      className="absolute inset-0 border-4 border-blue-500 border-dashed pointer-events-none"
                      style={{
                        width: `${String(width + 16)}px`, // +16 для padding
                        height: `${String(height + 16)}px`,
                        margin: '-8px',
                      }}
                    />
                    {/* Размеры по краям */}
                    {/* Верхний край */}
                    <div
                      className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-b pointer-events-none"
                      style={{ marginTop: '-8px' }}
                    >
                      {String(width)}px
                    </div>
                    {/* Правый край */}
                    <div
                      className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-l pointer-events-none whitespace-nowrap"
                      style={{ marginRight: '-8px' }}
                    >
                      {String(height)}px
                    </div>
                    {/* Нижний край */}
                    <div
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-t pointer-events-none"
                      style={{ marginBottom: '-8px' }}
                    >
                      {String(width)}px
                    </div>
                    {/* Левый край */}
                    <div
                      className="absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-r pointer-events-none whitespace-nowrap"
                      style={{ marginLeft: '-8px' }}
                    >
                      {String(height)}px
                    </div>
                    {/* Угловые метки */}
                    {/* Верхний левый угол */}
                    <div
                      className="absolute top-0 left-0 bg-blue-500 w-3 h-3 pointer-events-none"
                      style={{ marginTop: '-8px', marginLeft: '-8px' }}
                    />
                    {/* Верхний правый угол */}
                    <div
                      className="absolute top-0 right-0 bg-blue-500 w-3 h-3 pointer-events-none"
                      style={{ marginTop: '-8px', marginRight: '-8px' }}
                    />
                    {/* Нижний левый угол */}
                    <div
                      className="absolute bottom-0 left-0 bg-blue-500 w-3 h-3 pointer-events-none"
                      style={{ marginBottom: '-8px', marginLeft: '-8px' }}
                    />
                    {/* Нижний правый угол */}
                    <div
                      className="absolute bottom-0 right-0 bg-blue-500 w-3 h-3 pointer-events-none"
                      style={{ marginBottom: '-8px', marginRight: '-8px' }}
                    />
                  </>
                );
              })()}
              {/* Canvas с белым фоном и тенью */}
              <div className="bg-white shadow-lg rounded-lg p-2 inline-block">
                <canvas ref={canvasRef} />
              </div>
>>>>>>> main
            </div>
          </div>

          {/* Правая панель свойств - показывается только когда выбран объект */}
          {selectedObject && (
            <div className="w-80 flex-shrink-0 bg-white border-l border-gray-200 p-4 overflow-y-auto">
              <>
                <h3 className="text-lg font-semibold mb-4">Редактирование</h3>

                {/* Редактирование текста */}
                {isTextSelected && (
                  <div className="space-y-4">
                    {/* Размер шрифта */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Размер шрифта</label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleFontSizeChange(-2)}
                          className="p-1.5 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <input
                          type="number"
                          value={textProps.fontSize}
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10) || 24;
                            updateTextProperty('fontSize', Math.max(8, Math.min(200, value)));
                          }}
                          className="flex-1 p-2 border border-gray-300 rounded text-center"
                          min="8"
                          max="200"
                        />
                        <button
                          onClick={() => handleFontSizeChange(2)}
                          className="p-1.5 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Шрифт */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Шрифт</label>
                      <select
                        value={textProps.fontFamily}
                        onChange={(e) => updateTextProperty('fontFamily', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Impact">Impact</option>
                        <option value="Comic Sans MS">Comic Sans MS</option>
                      </select>
                    </div>

                    {/* Цвет текста */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Цвет текста</label>
                      <input
                        type="color"
                        value={textProps.fill}
                        onChange={(e) => updateTextProperty('fill', e.target.value)}
                        className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                      />
                    </div>

                    {/* Стили текста */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Стиль</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const newWeight = textProps.fontWeight === 'bold' ? 'normal' : 'bold';
                            updateTextProperty('fontWeight', newWeight);
                          }}
                          className={`flex-1 p-2 border rounded ${
                            textProps.fontWeight === 'bold'
                              ? 'bg-blue-500 text-white'
                              : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          <Bold className="h-4 w-4 mx-auto" />
                        </button>
                        <button
                          onClick={() => {
                            const newStyle = textProps.fontStyle === 'italic' ? 'normal' : 'italic';
                            updateTextProperty('fontStyle', newStyle);
                          }}
                          className={`flex-1 p-2 border rounded ${
                            textProps.fontStyle === 'italic'
                              ? 'bg-blue-500 text-white'
                              : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          <Italic className="h-4 w-4 mx-auto" />
                        </button>
                      </div>
                    </div>

                    {/* Выравнивание */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Выравнивание</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateTextProperty('textAlign', 'left')}
                          className={`flex-1 p-2 border rounded ${
                            textProps.textAlign === 'left'
                              ? 'bg-blue-500 text-white'
                              : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          <AlignLeft className="h-4 w-4 mx-auto" />
                        </button>
                        <button
                          onClick={() => updateTextProperty('textAlign', 'center')}
                          className={`flex-1 p-2 border rounded ${
                            textProps.textAlign === 'center'
                              ? 'bg-blue-500 text-white'
                              : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          <AlignCenter className="h-4 w-4 mx-auto" />
                        </button>
                        <button
                          onClick={() => updateTextProperty('textAlign', 'right')}
                          className={`flex-1 p-2 border rounded ${
                            textProps.textAlign === 'right'
                              ? 'bg-blue-500 text-white'
                              : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          <AlignRight className="h-4 w-4 mx-auto" />
                        </button>
                      </div>
                    </div>
                  </div>
<<<<<<< HEAD
                )}

                {/* Редактирование изображения */}
                {isImageSelected && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Поворот</label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (selectedObject && fabricCanvasRef.current) {
                              const currentAngle = selectedObject.angle || 0;
                              selectedObject.set('angle', (currentAngle - 15) % 360);
                              fabricCanvasRef.current.renderAll();
                            }
                          }}
                          className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          <RotateCw className="h-4 w-4 rotate-180" />
                        </button>
                        <span className="flex-1 text-center text-sm">
                          {Math.round(selectedObject?.angle || 0)}°
                        </span>
                        <button
                          onClick={() => {
                            if (selectedObject && fabricCanvasRef.current) {
                              const currentAngle = selectedObject.angle || 0;
                              selectedObject.set('angle', (currentAngle + 15) % 360);
                              fabricCanvasRef.current.renderAll();
                            }
                          }}
                          className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          <RotateCw className="h-4 w-4" />
                        </button>
                      </div>
=======
                </div>
              )}

              {/* Редактирование изображения */}
              {isImageSelected && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Поворот</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (!fabricCanvasRef.current) return;
                          const currentAngle = selectedObject.angle ?? 0;
                          selectedObject.set({ angle: (currentAngle - 15) % 360 });
                          fabricCanvasRef.current.renderAll();
                          updateSelectedObject();
                        }}
                        className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        <RotateCw className="h-4 w-4 rotate-180" />
                      </button>
                      <span className="flex-1 text-center text-sm">
                        {Math.round(selectedObject.angle ?? 0)}°
                      </span>
                      <button
                        onClick={() => {
                          if (!fabricCanvasRef.current) return;
                          const currentAngle = selectedObject.angle ?? 0;
                          selectedObject.set({ angle: (currentAngle + 15) % 360 });
                          fabricCanvasRef.current.renderAll();
                          updateSelectedObject();
                        }}
                        className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        <RotateCw className="h-4 w-4" />
                      </button>
>>>>>>> main
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">
                        Используйте углы для изменения размера, центр для перемещения
                      </p>
                    </div>
                  </div>
                )}
<<<<<<< HEAD
=======

              {/* Изменение цвета для объектов с заливкой */}
              {hasFill && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium mb-2">Цвет заливки</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={(() => {
                          const { fill } = selectedObject;
                          if (fill && typeof fill === 'string') {
                            return fill.startsWith('#') ? fill : `#${fill}`;
                          }
                          return '#000000';
                        })()}
                        onChange={(e) => updateFillColor(e.target.value)}
                        className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                      />
                    </div>
                    {selectedObject.fill && typeof selectedObject.fill === 'string' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Текущий: {selectedObject.fill}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Изменение цвета обводки для объектов с обводкой */}
              {hasStroke && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium mb-2">Цвет обводки</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={(() => {
                          const { stroke } = selectedObject;
                          if (stroke && typeof stroke === 'string') {
                            return stroke.startsWith('#') ? stroke : `#${stroke}`;
                          }
                          return '#000000';
                        })()}
                        onChange={(e) => updateStrokeColor(e.target.value)}
                        className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                        disabled={!selectedObject.strokeWidth || selectedObject.strokeWidth === 0}
                      />
                    </div>
                    {selectedObject.stroke && typeof selectedObject.stroke === 'string' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Текущий: {selectedObject.stroke}
                      </p>
                    )}
                    {(!selectedObject.strokeWidth || selectedObject.strokeWidth === 0) && (
                      <p className="text-xs text-gray-400 mt-1">
                        Установите толщину обводки для изменения цвета
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Изменение радиуса скругления для прямоугольников */}
              {selectedObject.type === 'rect' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Радиус скругления углов
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={Math.round((selectedObject as fabric.Rect).rx ?? 0)}
                        onChange={(e) => updateCornerRadius(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {Math.round((selectedObject as fabric.Rect).rx ?? 0)}px
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Используйте ползунок для изменения радиуса скругления
                    </p>
                  </div>
                </div>
              )}

              
>>>>>>> main

                {/* Общие свойства */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    {selectedObject.type === 'textbox' &&
                      'Дважды кликните для редактирования текста'}
                    {(selectedObject.type === 'text' || selectedObject.type === 'i-text') &&
                      'Дважды кликните для редактирования текста'}
                    {selectedObject.type === 'image' &&
                      'Перетащите для перемещения, углы для масштабирования'}
                  </p>
                </div>
              </>
            </div>
          )}
        </div>
      </div>
    );
  },
);

CardEditor.displayName = 'CardEditor';
