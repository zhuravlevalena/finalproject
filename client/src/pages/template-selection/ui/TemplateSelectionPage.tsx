import { useLocation } from 'wouter';
import { useEffect, useMemo, useState } from 'react';
import { fabric } from 'fabric';
import { templateService } from '@/entities/template/api/template.service';
import type { TemplateSchema } from '@/entities/template/model/template.schemas';
import type { LayoutSchema } from '@/entities/layout/model/layout.schemas';

export default function TemplateSelectionPage(): React.JSX.Element {
  const [, setLocation] = useLocation();
  const [templates, setTemplates] = useState<TemplateSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'universal' | 'categories'>('universal');
  const [layoutPreviews, setLayoutPreviews] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    // Загружаем все шаблоны (универсальный набор макетов, без выбора маркетплейса)
    const fetchTemplates = async (): Promise<void> => {
      try {
        setLoading(true);
        const data = await templateService.getAll();
        setTemplates(data);
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError('Ошибка загрузки шаблонов');
      } finally {
        setLoading(false);
      }
    };

    void fetchTemplates();
  }, []);

  const handleTemplateSelect = (templateId: number): void => {
    setLocation(`/templates?templateId=${templateId}`);
  };

  const handleLayoutSelect = (layoutId: number): void => {
    setLocation(`/layout-editor/${layoutId}`);
  };

  // Готовим данные для вкладок
  const { universalLayouts, categoryTemplates } = useMemo(() => {
    if (!templates.length) {
      return { universalLayouts: [] as LayoutSchema[], categoryTemplates: [] as TemplateSchema[] };
    }

    // Все шаблоны текущего маркетплейса (если фильтрация не произошла по какой-то причине)
    const marketplaceTemplates = templates;

    const defaultTemplate = marketplaceTemplates.find((t) => t.isDefault);
    const universal = (defaultTemplate?.layouts as LayoutSchema[] | undefined) ?? [];

    // Фильтруем категории и убираем дубликаты по названию
    // Берем только первую категорию с уникальным названием
    const categoryMap = new Map<string, TemplateSchema>();
    marketplaceTemplates
      .filter((t) => !t.isDefault)
      .forEach((template) => {
        if (!categoryMap.has(template.name)) {
          categoryMap.set(template.name, template);
        }
      });

    const categories = Array.from(categoryMap.values());

    return { universalLayouts: universal, categoryTemplates: categories };
  }, [templates]);

  // Рендерим превью для универсальных макетов из canvasData
  useEffect(() => {
    const renderPreviews = async (): Promise<void> => {
      if (activeTab !== 'universal' || universalLayouts.length === 0) {
        return;
      }

      const previews = new Map<number, string>();

      for (const layout of universalLayouts) {
        if (!layout.canvasData) continue;

        try {
          // Парсим canvasData
          let canvasData: { version?: string; objects?: unknown[] } | null = null;
          if (typeof layout.canvasData === 'string') {
            canvasData = JSON.parse(layout.canvasData);
          } else if (typeof layout.canvasData === 'object') {
            canvasData = layout.canvasData as { version?: string; objects?: unknown[] };
          }

          if (!canvasData || !canvasData.objects || !Array.isArray(canvasData.objects)) continue;

          // Преобразуем пути к изображениям в полные URL и добавляем crossOrigin для CORS
          const processedObjects = canvasData.objects.map((obj: unknown) => {
            if (typeof obj === 'object' && obj !== null) {
              const imageObj = obj as { type?: string; src?: string; crossOrigin?: string };
              if (imageObj.type === 'image' && imageObj.src) {
                let imageSrc = imageObj.src;
                if (imageSrc.startsWith('/')) {
                  imageSrc = `http://localhost:3000${imageSrc}`;
                }
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

          if (!canvas || !canvas.getContext) continue;

          const fabricCanvas = new fabric.Canvas(canvas, {
            width: 900,
            height: 1200,
            backgroundColor: '#ffffff',
          });

          if (!fabricCanvas?.getElement?.()) continue;

          // Используем fabric.util.enlivenObjects для правильной загрузки изображений
          await new Promise<void>((resolve) => {
            fabric.util.enlivenObjects(
              processedCanvasData.objects,
              async (enlivenedObjects: fabric.Object[]) => {
                try {
                  fabricCanvas.clear();
                  enlivenedObjects.forEach((obj: fabric.Object) => {
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
                              }
                            } else {
                              imgResolve();
                            }
                          }),
                      ),
                    );
                  }

                  if (fabricCanvas.getElement?.() && fabricCanvas.getContext()) {
                    fabricCanvas.renderAll();
                    
                    const dataURL = fabricCanvas.toDataURL({
                      format: 'png',
                      quality: 0.8,
                      multiplier: 0.3,
                    });
                    
                    previews.set(layout.id, dataURL);
                  }
                } catch (renderErr) {
                  console.warn(`Error rendering layout ${layout.id}:`, renderErr);
                } finally {
                  try {
                    fabricCanvas.clear();
                  } catch {
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
    };

    if (universalLayouts.length > 0 && activeTab === 'universal') {
      void renderPreviews();
    }
  }, [universalLayouts, activeTab]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Загрузка шаблонов...</p>
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
      <div className="mb-6">
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
        <h1 className="text-3xl font-bold text-gray-900">Шаблоны макетов</h1>
        <p className="text-gray-600 mt-2">
          Выберите универсальный макет или макет по категории, затем настройте маркетплейс на
          следующем шаге.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            className={`whitespace-nowrap py-2 px-1 border-b-2 text-sm font-medium ${
              activeTab === 'universal'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('universal')}
          >
            Универсальные макеты
          </button>
          <button
            className={`whitespace-nowrap py-2 px-1 border-b-2 text-sm font-medium ${
              activeTab === 'categories'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('categories')}
          >
            По категориям
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'universal' ? (
        // Универсальные макеты (из дефолтного шаблона)
        universalLayouts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {universalLayouts.map((layout) => (
              <div
                key={layout.id}
                className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group bg-white"
                onClick={() => handleLayoutSelect(layout.id)}
              >
                <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative">
                  {/* Приоритет: сначала срендеренный из canvasData, потом preview, потом плейсхолдер */}
                  {layoutPreviews.has(layout.id) ? (
                    <img
                      src={layoutPreviews.get(layout.id)!}
                      alt={layout.name}
                      className="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform"
                    />
                  ) : layout.canvasData ? (
                    // Если есть canvasData, но превью еще не готово - показываем только спиннер
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <div className="text-xs text-gray-500">Загрузка превью...</div>
                    </div>
                  ) : layout.preview ? (
                    // Fallback: показываем preview только если нет canvasData
                    <img
                      src={
                        layout.preview.startsWith('http')
                          ? layout.preview
                          : layout.preview.startsWith('/')
                          ? layout.preview
                          : `${window.location.origin}${layout.preview}`
                      }
                      alt={layout.name}
                      className="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const placeholder = parent.querySelector(
                            '.preview-placeholder',
                          ) as HTMLElement;
                          if (placeholder) {
                            placeholder.style.display = 'flex';
                          }
                        }
                      }}
                    />
                  ) : null}

                  {/* Плейсхолдер, если нет ни canvasData, ни preview */}
                  {!layoutPreviews.has(layout.id) && !layout.canvasData && !layout.preview && (
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
            <p className="text-gray-500 text-lg">Универсальные макеты не найдены</p>
            <p className="text-gray-400 text-sm mt-2">
              Для этого маркетплейса пока нет универсальных макетов
            </p>
          </div>
        )
      ) : // Вкладка "По категориям"
      templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryTemplates.map((template) => {
            const layoutCount = (template.layouts as LayoutSchema[] | undefined)?.length || 0;
            return (
              <div
                key={template.id}
                className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group bg-white"
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg
                      className="text-white"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <path d="M3 9h18M9 21V9" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                        {template.name}
                      </h3>
                    </div>
                    {template.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{template.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        </svg>
                        <span className="font-medium">{layoutCount}</span>
                        <span>
                          {layoutCount === 1
                            ? 'макет'
                            : layoutCount < 5
                              ? 'макета'
                              : 'макетов'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <svg
                    className="flex-shrink-0 text-gray-400 group-hover:text-blue-600 transition-colors mt-1"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Шаблоны не найдены</p>
          <p className="text-gray-400 text-sm mt-2">
            Для этого маркетплейса пока нет доступных шаблонов
          </p>
        </div>
      )}
    </div>
  );
}
