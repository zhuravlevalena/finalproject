import { useLocation } from 'wouter';
import { useEffect, useState, useRef } from 'react';
import { fabric } from 'fabric';
import { layoutService } from '@/entities/layout/api/layout.service';
import type { LayoutSchema } from '@/entities/layout/model/layout.schemas';

export default function TemplatesPage(): React.JSX.Element {
  const [, setLocation] = useLocation();
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [layouts, setLayouts] = useState<LayoutSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layoutPreviews, setLayoutPreviews] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const templateIdParam = params.get('templateId');

    if (!templateIdParam) {
      setError('Template ID не указан');
      setLoading(false);
      return;
    }

    const id = parseInt(templateIdParam, 10);
    setTemplateId(id);

    // Загружаем макеты для шаблона
    const fetchLayouts = async (): Promise<void> => {
      try {
        setLoading(true);
        const data = await layoutService.getLayoutsByTemplateId(id);
        setLayouts(data);
      } catch (err) {
        console.error('Error fetching layouts:', err);
        setError('Ошибка загрузки макетов');
      } finally {
        setLoading(false);
      }
    };

    void fetchLayouts();
  }, []);

  // Рендерим превью для каждого макета из canvasData
  useEffect(() => {
    const renderPreviews = async (): Promise<void> => {
      const previews = new Map<number, string>();

      for (const layout of layouts) {
        if (!layout.canvasData) continue;

        try {
          // Парсим canvasData
          let canvasData: { version?: string; objects?: unknown[] } | null = null;
          if (typeof layout.canvasData === 'string') {
            canvasData = JSON.parse(layout.canvasData);
          } else if (typeof layout.canvasData === 'object') {
            canvasData = layout.canvasData as { version?: string; objects?: unknown[] };
          }

          if (!canvasData || !canvasData.objects) continue;

          // Создаем временный canvas для рендеринга
          const canvas = document.createElement('canvas');
          canvas.width = 900;
          canvas.height = 1200;

          const fabricCanvas = new fabric.Canvas(canvas, {
            width: 900,
            height: 1200,
            backgroundColor: '#ffffff',
          });

          // Загружаем данные из fabric JSON
          await new Promise<void>((resolve, reject) => {
            fabricCanvas.loadFromJSON(
              canvasData,
              () => {
                fabricCanvas.renderAll();
                resolve();
              },
              reject,
            );
          });

          // Конвертируем в data URL для превью (уменьшенный размер)
          const dataURL = fabricCanvas.toDataURL({
            format: 'png',
            quality: 0.8,
            multiplier: 0.3, // Уменьшаем для превью
          });

          previews.set(layout.id, dataURL);
          fabricCanvas.dispose();
        } catch (err) {
          console.error(`Error rendering preview for layout ${layout.id}:`, err);
        }
      }

      setLayoutPreviews(previews);
    };

    if (layouts.length > 0) {
      void renderPreviews();
    }
  }, [layouts]);

  const handleLayoutSelect = (layoutId: number): void => {
    setLocation(`/layout-editor/${layoutId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Загрузка макетов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={() => setLocation('/')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => window.history.back()}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
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
          Назад
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Выберите макет</h1>
        <p className="text-gray-600 mt-2">Выберите готовый макет для редактирования</p>
      </div>

      {/* Layouts Grid */}
      {layouts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {layouts.map((layout) => (
            <div
              key={layout.id}
              className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => handleLayoutSelect(layout.id)}
            >
              <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative">
                {layoutPreviews.has(layout.id) ? (
                  <img
                    src={layoutPreviews.get(layout.id)!}
                    alt={layout.name}
                    className="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform"
                  />
                ) : layout.preview ? (
                  <img
                    src={layout.preview}
                    alt={layout.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <svg
                      className="text-gray-400"
                      width="80"
                      height="80"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
                {!layoutPreviews.has(layout.id) && layout.canvasData && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50">
                    <div className="text-xs text-gray-500">Загрузка превью...</div>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {layout.name}
                </h3>
                {layout.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{layout.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Макеты не найдены</p>
          <p className="text-gray-400 text-sm mt-2">Для этого шаблона пока нет доступных макетов</p>
        </div>
      )}
    </div>
  );
}
