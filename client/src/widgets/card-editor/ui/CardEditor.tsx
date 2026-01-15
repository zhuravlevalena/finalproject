import React, { useEffect, useRef, useState } from 'react';
import type { ProductCard } from '@/entities/productcard/model/productcard.types';
import type { Image } from '@/entities/image/model/image.types';

interface CardEditorProps {
  card?: ProductCard;
  onSave?: (canvasData: Record<string, unknown>) => void;
  initialImage?: Image;
}

export const CardEditor: React.FC<CardEditorProps> = ({
  card,
  onSave,
  initialImage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fabricLoaded, setFabricLoaded] = useState(false);
  const fabricRef = useRef<any>(null);

  // Загружаем fabric при монтировании компонента
  useEffect(() => {
    if (typeof window === 'undefined') return;

    import('fabric').then((fabricModule) => {
      // В fabric v5 используются именованные экспорты
      fabricRef.current = fabricModule;
      setFabricLoaded(true);
    }).catch((err) => {
      console.error('Failed to load fabric:', err);
      setError('Failed to load fabric.js library');
    });
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !fabricLoaded || !fabricRef.current) return;

    try {
      const { Canvas, FabricImage } = fabricRef.current;
      
      if (!Canvas) {
        throw new Error('Canvas class not found in fabric');
      }

      const canvas = new Canvas(canvasRef.current, {
        width: 1024,
        height: 1024,
        backgroundColor: '#ffffff',
      });

      fabricCanvasRef.current = canvas;

      // Загружаем сохраненные данные, если есть
      if (card?.canvasData) {
        canvas.loadFromJSON(card.canvasData, () => {
          canvas.renderAll();
        });
      } else if (initialImage) {
        // Загружаем изображение как фон
        const imageUrl = initialImage.url;
        if (imageUrl && FabricImage) {
          // Преобразуем относительный URL в абсолютный, если нужно
          const fullUrl = imageUrl.startsWith('http') 
            ? imageUrl 
            : `${window.location.origin}${imageUrl}`;
          
          FabricImage.fromURL(fullUrl, (img: any) => {
            if (img) {
              img.scaleToWidth(canvas.width!);
              img.scaleToHeight(canvas.height!);
              canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
            }
          }, { crossOrigin: 'anonymous' });
        }
      }

      return () => {
        canvas.dispose();
      };
    } catch (err) {
      console.error('Error initializing canvas:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize canvas');
    }
  }, [card, initialImage, fabricLoaded]);

  const handleAddText = () => {
    if (!fabricCanvasRef.current || !fabricRef.current) return;

    try {
      const { Textbox } = fabricRef.current;
      
      if (!Textbox) {
        throw new Error('Textbox class not found in fabric');
      }

      const text = new Textbox('Введите текст', {
        left: 100,
        top: 100,
        width: 300,
        fontSize: 24,
        fill: '#000000',
        fontFamily: 'Arial',
      });

      fabricCanvasRef.current.add(text);
      fabricCanvasRef.current.setActiveObject(text);
      fabricCanvasRef.current.renderAll();
    } catch (err) {
      console.error('Error adding text:', err);
      setError(err instanceof Error ? err.message : 'Failed to add text');
    }
  };

  const handleDeleteSelected = () => {
    if (!fabricCanvasRef.current) return;

    const activeObjects = fabricCanvasRef.current.getActiveObjects();
    activeObjects.forEach((obj) => {
      fabricCanvasRef.current?.remove(obj);
    });
    fabricCanvasRef.current.discardActiveObject();
    fabricCanvasRef.current.renderAll();
  };

  const handleSave = async () => {
    if (!fabricCanvasRef.current || !onSave) return;

    setIsLoading(true);
    try {
      const canvasData = fabricCanvasRef.current.toJSON();
      await onSave(canvasData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!fabricCanvasRef.current) return;

    const dataURL = fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 1,
    });

    const link = document.createElement('a');
    link.download = `card-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  };

  if (!fabricLoaded) {
    return (
      <div className="p-4 text-center">
        <p>Загрузка редактора...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-600">Ошибка: {error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Закрыть
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleAddText}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Добавить текст
        </button>
        <button
          onClick={handleDeleteSelected}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Удалить выбранное
        </button>
        {onSave && (
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </button>
        )}
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Экспорт PNG
        </button>
      </div>
      <div className="border border-gray-300 rounded-lg overflow-hidden inline-block">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
