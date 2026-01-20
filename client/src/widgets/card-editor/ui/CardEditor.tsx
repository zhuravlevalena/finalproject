import React, {
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
  ) => void;
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

export type CardEditorRef = {
  addTextElements?: (
    texts: { text: string; fontSize?: number; top?: number; left?: number }[],
  ) => void;
};

export const CardEditor = forwardRef<CardEditorRef, CardEditorProps>(
  ({ onSave, initialImage, backgroundImage, cardSize, card }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
    const [history, setHistory] = useState<{ undo: string[]; redo: string[] }>({
      undo: [],
      redo: [],
    });
    const [zoom, setZoom] = useState(100);
    const [isLoading, setIsLoading] = useState(false);

    const [textProps, setTextProps] = useState({
      fontSize: 24,
      fontFamily: 'Arial',
      fill: '#000000',
      textAlign: 'left' as 'left' | 'center' | 'right' | 'justify',
      fontWeight: 'normal' as 'normal' | 'bold',
      fontStyle: 'normal' as 'normal' | 'italic',
    });


    const saveHistory = useCallback(() => {
      if (!fabricCanvasRef.current) return;
      try {
        const json = fabricCanvasRef.current.toJSON();
        setHistory((prev) => ({
          undo: [...prev.undo, JSON.stringify(json)].slice(-50),
          redo: [],
        }));
      } catch (error) {
        // Логируем, но не роняем весь редактор, если Fabric не может сериализовать объект
        // Это особенно важно для макетов, загруженных из сидов, где структура может отличаться
        // eslint-disable-next-line no-console
        console.error('Error saving canvas history:', error);
      }
    }, []);


    const updateSelectedObject = useCallback(() => {
      if (!fabricCanvasRef.current) return;
      const activeObject = fabricCanvasRef.current.getActiveObject();
      setSelectedObject(activeObject);

      if (activeObject?.type === 'textbox') {
        const textObj = activeObject as fabric.Textbox;
        setTextProps({
          fontSize: textObj.fontSize ?? 24,
          fontFamily: textObj.fontFamily ?? 'Arial',
          fill: (textObj.fill as string) ?? '#000000',
          textAlign: (textObj.textAlign as 'left' | 'center' | 'right' | 'justify') || 'left',
          fontWeight: textObj.fontWeight === 'bold' ? 'bold' : 'normal',
          fontStyle: textObj.fontStyle === 'italic' ? 'italic' : 'normal',
        });
      }
    }, []);

    const loadFromHistory = useCallback(
      (jsonString: string) => {
        if (!fabricCanvasRef.current) return;
        fabricCanvasRef.current.loadFromJSON(jsonString, () => {
          fabricCanvasRef.current?.renderAll();
          updateSelectedObject();
        });
      },
      [updateSelectedObject],
    );

    const addTextElements = useCallback(
      (texts: { text: string; fontSize?: number; top?: number; left?: number }[]) => {
        if (!fabricCanvasRef.current) return;

        texts.forEach(({ text, fontSize = 24, top = 50, left = 50 }) => {
          const textbox = new fabric.Textbox(text, {
            left,
            top,
            width: fabricCanvasRef.current!.getWidth() - left * 2, 
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

          fabricCanvasRef.current!.add(textbox);
        });

        fabricCanvasRef.current.renderAll();
        saveHistory();
      },
      [textProps.fontFamily, textProps.fill, saveHistory],
    );

    useImperativeHandle(
      ref,
      () => ({
        addTextElements,
      }),
      [addTextElements],
    );

   
    useEffect(() => {
      if (!canvasRef.current) return;

      const [width, height] = cardSize.split('x').map(Number);

      const canvas = new fabric.Canvas(canvasRef.current, {
        width,
        height,
        backgroundColor: '#ffffff',
        preserveObjectStacking: true,
      });

     
      if (card?.canvasData && typeof card.canvasData === 'object' && 'fabric' in card.canvasData) {
        const canvasData = card.canvasData as { fabric?: Record<string, unknown> };
        const fabricData = canvasData.fabric;
        if (fabricData) {
          try {
            canvas.loadFromJSON(fabricData, () => {
              // Убеждаемся, что все объекты (кроме фона) редактируемы
              canvas.getObjects().forEach((obj) => {
                // Пропускаем фоновые объекты
                if (obj === canvas.backgroundImage || obj === canvas.backgroundVpt) {
                  return;
                }
                // Устанавливаем правильные настройки для редактирования
                obj.set({
                  selectable: true,
                  evented: true,
                });
                // Для текстовых объектов также включаем редактирование и инициализируем styles
                if (obj.type === 'textbox' || obj.type === 'text' || obj.type === 'i-text') {
                  const textObj = obj as fabric.Textbox | fabric.IText | fabric.Text;
                  obj.set('editable', true);
                  // Инициализируем styles, если их нет или они некорректны
                  if (!textObj.styles || !Array.isArray(textObj.styles)) {
                    textObj.styles = {};
                  }
                  // Убеждаемся, что для каждой строки есть массив стилей
                  const textLines = textObj.text?.split('\n') || [];
                  textLines.forEach((line, index) => {
                    if (!textObj.styles[index]) {
                      textObj.styles[index] = {};
                    }
                  });
                }
              });
              canvas.renderAll();
              saveHistory();
            });
          } catch (err) {
            console.error('Error loading canvas data:', err);
          }
        }
      }

    
      canvas.on('object:added', () => {
        saveHistory();
        updateSelectedObject();
      });
      canvas.on('object:modified', () => {
        saveHistory();
        updateSelectedObject();
      });
      canvas.on('object:removed', () => {
        saveHistory();
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

      // События редактирования текста
      // options.target - текущий текстовый объект
      canvas.on('text:changed', () => {
        saveHistory();
        updateSelectedObject();
      });

      canvas.on('editing:entered', (options) => {
        const target = options?.target as fabric.Textbox | fabric.IText | fabric.Text | undefined;
        if (target && (target.type === 'textbox' || target.type === 'text' || target.type === 'i-text')) {
          // Исправляем проблему с styles для предотвращения ошибки removeStyleFromTo
          // Инициализируем styles как объект, если его нет
          if (!target.styles || typeof target.styles !== 'object') {
            // @ts-expect-error styles есть у текстовых объектов fabric
            target.styles = {};
          }
          // Убеждаемся, что для каждой строки есть объект стилей
          const textLines = target.text?.split('\n') || [];
          textLines.forEach((line, index) => {
            // @ts-expect-error styles есть у текстовых объектов fabric
            if (!target.styles[index]) {
              // @ts-expect-error styles есть у текстовых объектов fabric
              target.styles[index] = {};
            }
            // Убеждаемся, что для каждого символа есть объект стилей
            for (let i = 0; i <= line.length; i++) {
              // @ts-expect-error styles есть у текстовых объектов fabric
              if (!target.styles[index][i]) {
                // @ts-expect-error styles есть у текстовых объектов fabric
                target.styles[index][i] = {};
              }
            }
          });
        }
      });

      canvas.on('editing:exited', (options) => {
        const target = options?.target as fabric.Textbox | undefined;
        if (target) {
          // После выхода из режима редактирования фиксируем состояние в истории
          saveHistory();
          updateSelectedObject();
        }
      });

      // Обработчик клавиатуры для удаления объектов (Delete/Backspace)
      const handleKeyDown = (e: KeyboardEvent): void => {
        // Пропускаем, если пользователь редактирует текст в input/textarea
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
          activeObjects.forEach((obj) => {
            // Не удаляем фоновые объекты
            if (obj !== canvas.backgroundImage && obj !== canvas.backgroundVpt) {
              canvas.remove(obj);
            }
          });
          canvas.discardActiveObject();
          canvas.renderAll();
          setSelectedObject(null);
          saveHistory();
        }
      };

      // Добавляем обработчик клавиатуры
      window.addEventListener('keydown', handleKeyDown);

      fabricCanvasRef.current = canvas;
      saveHistory();

      return () => {
        // Удаляем обработчик клавиатуры
        window.removeEventListener('keydown', handleKeyDown);
        canvas.dispose();
        fabricCanvasRef.current = null;
      };
    }, [cardSize, saveHistory, updateSelectedObject, card]);

    
    useEffect(() => {
      if (!backgroundImage || !fabricCanvasRef.current) return;

      fabric.Image.fromURL(
        backgroundImage.url,
        (img) => {
          const canvas = fabricCanvasRef.current!;
          const scale = Math.min(canvas.getWidth() / img.width!, canvas.getHeight() / img.height!);
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

    useEffect(() => {
      if (!initialImage || !fabricCanvasRef.current || backgroundImage) return;

      fabric.Image.fromURL(
        initialImage.url,
        (img) => {
          const canvas = fabricCanvasRef.current!;
          const maxWidth = canvas.getWidth() * 0.7;
          const maxHeight = canvas.getHeight() * 0.7;
          const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!, 1);

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
              if (!fabricCanvasRef.current ?? !img) {
                console.error('Failed to load image or canvas not available');
                return;
              }
              

              const canvas = fabricCanvasRef.current;
              if (!canvas) return;
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
          // eslint-disable-next-line no-alert
          alert(
            `Ошибка при загрузке изображения: ${
              error instanceof Error ? error.message : 'Неизвестная ошибка'
            }`,
          );
        }
      };
      input.click();
    };

    const handleDelete = (): void => {
      if (!fabricCanvasRef.current) return;
      const activeObjects = fabricCanvasRef.current.getActiveObjects();
      if (activeObjects.length === 0) return;
      
      activeObjects.forEach((obj) => {
        // Не удаляем фоновые объекты
        if (obj !== fabricCanvasRef.current?.backgroundImage && obj !== fabricCanvasRef.current?.backgroundVpt) {
          fabricCanvasRef.current?.remove(obj);
        }
      });
      fabricCanvasRef.current.discardActiveObject();
      fabricCanvasRef.current.renderAll();
      setSelectedObject(null);
      saveHistory(); // Сохраняем историю после удаления
    };

    const handleDuplicate = (): void => {
      if (!fabricCanvasRef.current || !selectedObject) return;

      selectedObject.clone((cloned: fabric.Object) => {
        cloned.set({
          left: (cloned.left ?? 0) + 20,
          top: (cloned.top ?? 0) + 20,
        });
        fabricCanvasRef.current!.add(cloned);
        fabricCanvasRef.current!.setActiveObject(cloned);
        fabricCanvasRef.current!.renderAll();
        updateSelectedObject();
      });
    };

    const handleUndo = (): void => {
      if (!fabricCanvasRef.current || history.undo.length < 2) return;
      const current = JSON.stringify(fabricCanvasRef.current.toJSON());
      setHistory((prev) => ({
        undo: prev.undo.slice(0, -1),
        redo: [current, ...prev.redo],
      }));
      loadFromHistory(history.undo[history.undo.length - 2]);
    };

    const handleRedo = (): void => {
      if (!fabricCanvasRef.current || history.redo.length === 0) return;
      const current = JSON.stringify(fabricCanvasRef.current.toJSON());
      setHistory((prev) => ({
        undo: [...prev.undo, current],
        redo: prev.redo.slice(1),
      }));
      loadFromHistory(history.redo[0]);
    };

    const updateTextProperty = (property: string, value: string | number): void => {
      if (!fabricCanvasRef.current || selectedObject?.type !== 'textbox') return;

      const textObj = selectedObject as fabric.Textbox;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      textObj.set(property as any, value);
      fabricCanvasRef.current.renderAll();
      updateSelectedObject();
    };

    const handleFontSizeChange = (delta: number): void => {
      if (selectedObject?.type !== 'textbox') return;
      const textObj = selectedObject as fabric.Textbox;
      const newSize = Math.max(8, Math.min(200, (textObj.fontSize ?? 24) + delta));
      updateTextProperty('fontSize', newSize);
    };

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

        // 2. Получаем полный Fabric JSON для восстановления карточки
        let fabricJson: Record<string, unknown> | null = null;
        try {
          fabricJson = fabricCanvasRef.current.toJSON();
        } catch (jsonError) {
          // Если Fabric не может корректно сериализовать объект (частая проблема с textbox/styles),
          // не роняем весь поток сохранения — просто логируем и продолжаем без fabric JSON.
          // В этом случае карточка сохранится как готовое изображение, а не редактируемый макет.
          // eslint-disable-next-line no-console
          console.error('Error serializing canvas to JSON:', jsonError);
        }

        const meta = {
          width: fabricCanvasRef.current.getWidth(),
          height: fabricCanvasRef.current.getHeight(),
          objectsCount: fabricCanvasRef.current.getObjects().length,
        };

        onSave(file, {
          fabric: fabricJson || undefined, // Полный JSON для восстановления (если доступен)
          meta,
        });
      } catch (error) {
        console.error('Error saving canvas:', error);
        // eslint-disable-next-line no-alert
        alert('Ошибка при сохранении карточки');
      } finally {
        setIsLoading(false);
      }
    };
    const handleZoom = (delta: number): void => {
      const newZoom = Math.max(25, Math.min(200, zoom + delta));
      setZoom(newZoom);
      if (fabricCanvasRef.current && canvasRef.current) {
        const scale = newZoom / 100;
        canvasRef.current.style.transform = `scale(${String(scale)})`;
        canvasRef.current.style.transformOrigin = 'top left';
      }
    };

    const isTextSelected = selectedObject?.type === 'textbox';
    const isImageSelected = selectedObject?.type === 'image';

    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 p-3 bg-gray-50 border-b border-gray-200 flex-wrap">
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

        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          <div className="flex-1 flex items-center justify-center p-4 bg-gray-100 overflow-auto">
            <div
              className="bg-white shadow-lg rounded-lg p-2"
              style={{ transform: `scale(${String(zoom / 100)})` }}

            >
              <canvas ref={canvasRef} />
            </div>
          </div>

          {selectedObject && (
            <div className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l border-gray-200 p-4 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Редактирование</h3>

              {isTextSelected && (
                <div className="space-y-4">
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

                  <div>
                    <label className="block text-sm font-medium mb-2">Цвет текста</label>
                    <input
                      type="color"
                      value={textProps.fill}
                      onChange={(e) => updateTextProperty('fill', e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                    />
                  </div>

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
              )}

              {isImageSelected && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Поворот</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (selectedObject && fabricCanvasRef.current) {
                            const currentAngle = selectedObject.angle ?? 0;
                            selectedObject.set('angle', (currentAngle - 15) % 360);
                            fabricCanvasRef.current.renderAll();
                          }
                        }}
                        className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        <RotateCw className="h-4 w-4 rotate-180" />
                      </button>
                      <span className="flex-1 text-center text-sm">
                        {Math.round(selectedObject?.angle ?? 0)}°
                      </span>
                      <button
                        onClick={() => {
                          if (selectedObject && fabricCanvasRef.current) {
                            const currentAngle = selectedObject.angle ?? 0;
                            selectedObject.set('angle', (currentAngle + 15) % 360);
                            fabricCanvasRef.current.renderAll();
                          }
                        }}
                        className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        <RotateCw className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">
                      Используйте углы для изменения размера, центр для перемещения
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  {selectedObject.type === 'textbox' && 'Дважды кликните для редактирования текста'}
                  {selectedObject.type === 'image' &&
                    'Перетащите для перемещения, углы для масштабирования'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

CardEditor.displayName = 'CardEditor';
