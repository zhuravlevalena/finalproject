import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { fabric } from 'fabric';
import { layoutService } from '@/entities/layout/api/layout.service';
import type { LayoutSchema } from '@/entities/layout/model/layout.schemas';

export default function TemplatesPage(): React.JSX.Element {
  const [, setLocation] = useLocation();
  const [layouts, setLayouts] = useState<LayoutSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layoutPreviews, setLayoutPreviews] = useState<Map<number, string>>(new Map());
  const [previewsRendered, setPreviewsRendered] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const templateIdParam = params.get('templateId');

    if (!templateIdParam) {
      setError('Template ID не указан');
      setLoading(false);
      return;
    }

    // Загружаем макеты для шаблона
    const fetchLayouts = async (): Promise<void> => {
      try {
        setLoading(true);
        const data = await layoutService.getLayoutsByTemplateId(parseInt(templateIdParam, 10));
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

  // Рендерим превью для макетов из canvasData
  useEffect(() => {
    const renderPreviews = async (): Promise<void> => {
      const previews = new Map<number, string>();

      console.log(`[TemplatesPage] Starting to render previews for ${layouts.length} layouts`);

      for (const layout of layouts) {
        // Рендерим превью из canvasData для всех макетов, у которых есть canvasData
        if (!layout.canvasData) {
          console.log(`[TemplatesPage] Skipping layout ${layout.id} (${layout.name}) - no canvasData`);
          continue;
        }

        console.log(`[TemplatesPage] Rendering preview for layout ${layout.id} (${layout.name})`);

        try {
          // Парсим canvasData
          let canvasData: { version?: string; objects?: unknown[] } | null = null;
          if (typeof layout.canvasData === 'string') {
            canvasData = JSON.parse(layout.canvasData);
          } else if (typeof layout.canvasData === 'object') {
            canvasData = layout.canvasData as { version?: string; objects?: unknown[] };
          }

          if (!canvasData || !canvasData.objects || !Array.isArray(canvasData.objects)) {
            console.warn(`[TemplatesPage] Layout ${layout.id} has invalid canvasData structure`);
            continue;
          }

          console.log(`[TemplatesPage] Layout ${layout.id} has ${canvasData.objects.length} objects`);

          // Преобразуем пути к изображениям в полные URL и добавляем crossOrigin для CORS
          const processedObjects = canvasData.objects.map((obj: unknown) => {
            if (typeof obj === 'object' && obj !== null) {
              const imageObj = obj as { type?: string; src?: string; crossOrigin?: string };
              if (imageObj.type === 'image' && imageObj.src) {
                let imageSrc = imageObj.src;
                if (imageSrc.startsWith('/')) {
                  imageSrc = `http://localhost:3000${imageSrc}`;
                }
                // Устанавливаем crossOrigin для избежания SecurityError при toDataURL
                return { ...imageObj, src: imageSrc, crossOrigin: 'anonymous' };
              }
            }
            return obj;
          });

          const processedCanvasData = {
            ...canvasData,
            objects: processedObjects,
          };

          // Создаем временный canvas для рендеринга
          const canvas = document.createElement('canvas');
          canvas.width = 900;
          canvas.height = 1200;

          // Проверяем, что canvas создан правильно
          if (!canvas || !canvas.getContext) {
            console.warn(`Could not create canvas for layout ${layout.id}`);
            continue;
          }

          const fabricCanvas = new fabric.Canvas(canvas, {
            width: 900,
            height: 1200,
            backgroundColor: '#ffffff',
          });

          // Проверяем, что fabricCanvas создан правильно
          if (!fabricCanvas?.getElement?.()) {
            console.warn(`Could not create fabric canvas for layout ${layout.id}`);
            continue;
          }

          // Используем fabric.util.enlivenObjects для правильной загрузки изображений
          await new Promise<void>((resolve) => {
            fabric.util.enlivenObjects(
              processedCanvasData.objects,
              async (enlivenedObjects: fabric.Object[]) => {
                try {
                  // Очищаем canvas и добавляем загруженные объекты
                  fabricCanvas.clear();
                  enlivenedObjects.forEach((obj: fabric.Object) => {
                    // Устанавливаем crossOrigin для изображений
                    if (obj.type === 'image') {
                      const img = obj as fabric.Image;
                      const element = img.getElement();
                      if (element) {
                        element.crossOrigin = 'anonymous';
                      }
                    }
                    fabricCanvas.add(obj);
                  });
                  fabricCanvas.renderAll();

                  // Ждем загрузки всех изображений
                  const images = fabricCanvas.getObjects('image') as fabric.Image[];
                  
                  if (images.length > 0) {
                    await Promise.all(
                      images.map(
                        (img) =>
                          new Promise<void>((imgResolve) => {
                            const element = img.getElement();
                            if (element) {
                              // Устанавливаем crossOrigin для избежания SecurityError
                              if (!element.crossOrigin) {
                                element.crossOrigin = 'anonymous';
                              }
                              const imgEl = element instanceof HTMLImageElement ? element : null;
                              if (imgEl?.complete && imgEl.naturalWidth > 0) {
                                imgResolve();
                              } else if (imgEl) {
                                const onLoad = (): void => {
                                  imgEl.removeEventListener('load', onLoad);
                                  imgEl.removeEventListener('error', onError);
                                  imgResolve();
                                };
                                const onError = (): void => {
                                  imgEl.removeEventListener('load', onLoad);
                                  imgEl.removeEventListener('error', onError);
                                  imgResolve();
                                };
                                imgEl.addEventListener('load', onLoad);
                                imgEl.addEventListener('error', onError);
                                setTimeout(() => {
                                  imgEl.removeEventListener('load', onLoad);
                                  imgEl.removeEventListener('error', onError);
                                  imgResolve();
                                }, 5000);
                              } else {
                                imgResolve();
                              }
                            } else {
                              imgResolve();
                            }
                          }),
                      ),
                    );
                  }

                  // Проверяем, что canvas все еще валиден перед рендерингом
                  if (fabricCanvas.getElement?.() && fabricCanvas.getContext()) {
                    fabricCanvas.renderAll();
                    
                    // Конвертируем в data URL
                    const dataURL = fabricCanvas.toDataURL({
                      format: 'png',
                      quality: 0.8,
                      multiplier: 0.3,
                    });
                    
                    previews.set(layout.id, dataURL);
                    console.log(`[TemplatesPage] Successfully rendered preview for layout ${layout.id} (${layout.name})`);
                  } else {
                    console.warn(`[TemplatesPage] Canvas invalid for layout ${layout.id} before rendering`);
                  }
                } catch (renderErr) {
                  console.warn(`Error rendering layout ${layout.id}:`, renderErr);
                } finally {
                  // Безопасная очистка offscreen canvas
                  try {
                    fabricCanvas.clear();
                  } catch (cleanupErr) {
                    // Игнорируем ошибки очистки
                  }
                  resolve();
                }
              },
              'fabric',
            );
          });
        } catch (err) {
          console.warn(`Could not render preview for layout ${layout.id}:`, err);
        }
      }

      setLayoutPreviews(previews);
      setPreviewsRendered(true);
      console.log(
        `[TemplatesPage] Finished rendering previews. Generated ${previews.size} previews`,
      );
    };

    if (layouts.length > 0) {
      setPreviewsRendered(false);
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
                {/* 1. Если есть успешное превью из canvasData – показываем его */}
                {layoutPreviews.has(layout.id) && (
                  <img
                    src={layoutPreviews.get(layout.id)!}
                    alt={layout.name}
                    className="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform"
                  />
                )}

                {/* 2. Если превью ещё рендерятся и для этого макета есть canvasData, но нет готового превью – показываем спиннер */}
                {!previewsRendered && !layoutPreviews.has(layout.id) && layout.canvasData && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-xs text-gray-500">Загрузка превью...</div>
                  </div>
                )}

                {/* 3. Когда все рендеры завершены, но для макета нет canvas-превью – показываем плейсхолдер
                      (не показываем layout.preview для макетов с canvasData) */}
                {previewsRendered && !layoutPreviews.has(layout.id) && !layout.canvasData && (
                  <div className="preview-placeholder absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
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
