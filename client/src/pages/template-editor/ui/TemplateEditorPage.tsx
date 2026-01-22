import { useEffect, useRef, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { fabric } from 'fabric';

export default function TemplateEditorPage(): React.JSX.Element {
  const [, params] = useRoute('/template-editor/:id');
  const [, setLocation] = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

   
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 800,
      backgroundColor: '#ffffff',
    });

    fabricCanvasRef.current = canvas;

    
    // eslint-disable-next-line no-use-before-define
    loadTemplate(canvas, params?.id ?? '1');

    // Обработчик выбора объекта
    canvas.on('selection:created', (e) => {
      setSelectedObject(e.selected?.[0] ?? null);
    });

    canvas.on('selection:updated', (e) => {
      setSelectedObject(e.selected?.[0] ?? null);
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    // eslint-disable-next-line consistent-return
    return () => {
      canvas.dispose();
    };
  }, [params?.id]);

  const loadTemplate = (canvas: fabric.Canvas): void => {
    // Моковый шаблон с несколькими слоями

    // Фоновый прямоугольник
    const background = new fabric.Rect({
      left: 0,
      top: 0,
      width: 800,
      height: 800,
      fill: '#f3f4f6',
      selectable: false,
    });
    canvas.add(background);

    // Цветной акцент
    const accent = new fabric.Rect({
      left: 50,
      top: 50,
      width: 700,
      height: 200,
      fill: '#4F46E5',
      rx: 10,
      ry: 10,
    });
    canvas.add(accent);

    // Заголовок
    const title = new fabric.Textbox('Название товара', {
      left: 100,
      top: 100,
      width: 600,
      fontSize: 48,
      fill: '#ffffff',
      fontWeight: 'bold',
      fontFamily: 'Arial',
    });
    canvas.add(title);

    // Область для изображения товара
    const productImagePlaceholder = new fabric.Rect({
      left: 150,
      top: 300,
      width: 500,
      height: 400,
      fill: '#e5e7eb',
      stroke: '#9ca3af',
      strokeWidth: 2,
      strokeDashArray: [10, 5],
      rx: 10,
      ry: 10,
    });
    canvas.add(productImagePlaceholder);

    // Текст-подсказка
    const placeholder = new fabric.Text('Перетащите изображение сюда', {
      left: 400,
      top: 500,
      fontSize: 20,
      fill: '#9ca3af',
      originX: 'center',
      originY: 'center',
      selectable: false,
    });
    canvas.add(placeholder);

    canvas.renderAll();
  };

  const addText = (): void => {
    if (!fabricCanvasRef.current) return;

    const text = new fabric.Textbox('Новый текст', {
      left: 100,
      top: 100,
      width: 200,
      fontSize: 24,
      fill: '#000000',
    });

    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
  };

  const addRectangle = (): void => {
    if (!fabricCanvasRef.current) return;

    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 100,
      fill: '#4F46E5',
      rx: 5,
      ry: 5,
    });

    fabricCanvasRef.current.add(rect);
    fabricCanvasRef.current.setActiveObject(rect);
    fabricCanvasRef.current.renderAll();
  };

  const deleteSelected = (): void => {
    if (!fabricCanvasRef.current || !selectedObject) return;

    fabricCanvasRef.current.remove(selectedObject);
    fabricCanvasRef.current.renderAll();
    setSelectedObject(null);
  };

  const exportImage = (): void => {
    if (!fabricCanvasRef.current) return;

    const dataURL = fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 1,
    });

    // Скачивание изображения
    const link = document.createElement('a');
    link.download = `template-${params?.id ?? 'export'}.png`;
    link.href = dataURL;
    link.click();
  };

  return (
    <div className="h-full flex">
      {/* Sidebar - Tools */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 space-y-4">
        <button
          onClick={() => setLocation('/templates')}
          className="w-full text-left text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-6"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          К шаблонам
        </button>

        <h2 className="text-lg font-bold text-gray-900">Инструменты</h2>

        <button
          onClick={addText}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Добавить текст
        </button>

        <button
          onClick={addRectangle}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Добавить фигуру
        </button>

        {selectedObject && (
          <button
            onClick={deleteSelected}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Удалить выбранное
          </button>
        )}

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={exportImage}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Экспортировать
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center bg-gray-100 p-8">
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
          <canvas ref={canvasRef} />
        </div>
      </div>

      {/* Properties Panel */}
      {selectedObject && (
        <div className="w-64 bg-gray-50 border-l border-gray-200 p-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Свойства</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип объекта</label>
              <p className="text-sm text-gray-600">{selectedObject.type}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
