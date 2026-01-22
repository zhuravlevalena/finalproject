import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fabric } from 'fabric';
import { templateService } from '@/entities/template/api/template.service';
import type { TemplateSchema } from '@/entities/template/model/template.schemas';
import type { LayoutSchema } from '@/entities/layout/model/layout.schemas';

type TemplateSelectorModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function TemplateSelectorModal({
  isOpen,
  onClose,
}: TemplateSelectorModalProps): React.JSX.Element | null {
  const [, setLocation] = useLocation();
  const [templates, setTemplates] = useState<TemplateSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'universal' | 'categories'>('universal');
  const [layoutPreviews, setLayoutPreviews] = useState<Map<number, string>>(new Map());
  const [previewsRendered, setPreviewsRendered] = useState(false);

  // Загружаем шаблоны при открытии модалки
  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen]);

  const handleTemplateSelect = (templateId: number): void => {
    setLocation(`/templates?templateId=${String(templateId)}`);
    onClose();
  };

  const handleLayoutSelect = (layoutId: number): void => {
    setLocation(`/layout-editor/${layoutId}`);
    onClose();
  };

  // Готовим данные для вкладок
  const { universalLayouts, categoryTemplates } = useMemo(() => {
    if (!templates.length) {
      return { universalLayouts: [] as LayoutSchema[], categoryTemplates: [] as TemplateSchema[] };
    }

    const marketplaceTemplates = templates;
    const defaultTemplate = marketplaceTemplates.find((t) => t.isDefault);
    const universal = (defaultTemplate?.layouts as LayoutSchema[] | undefined) ?? [];

    // Фильтруем категории и убираем дубликаты по названию
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
      if (!isOpen || activeTab !== 'universal' || universalLayouts.length === 0) {
        setPreviewsRendered(true);
        return;
      }

      const previews = new Map<number, string>();

      for (const layout of universalLayouts) {
        if (!layout.canvasData) continue;

        try {
          let canvasData: { version?: string; objects?: unknown[] } | null = null;
          if (typeof layout.canvasData === 'string') {
            canvasData = JSON.parse(layout.canvasData);
          } else if (typeof layout.canvasData === 'object') {
            canvasData = layout.canvasData as { version?: string; objects?: unknown[] };
          }

          if (!canvasData || !canvasData.objects || !Array.isArray(canvasData.objects)) continue;

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

          const canvas = document.createElement('canvas');
          canvas.width = 900;
          canvas.height = 1200;

          if (!canvas || !canvas.getContext) continue;

          const fabricCanvas = new fabric.Canvas(canvas, {
            width: 900,
            height: 1200,
            backgroundColor: '#ffffff',
          });

          if (!fabricCanvas || !fabricCanvas.lowerCanvasEl) continue;

          await new Promise<void>((resolve) => {
            fabric.util.enlivenObjects(
              processedCanvasData.objects,
              async (enlivenedObjects) => {
                try {
                  fabricCanvas.clear();
                  enlivenedObjects.forEach((obj) => {
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

                              if (element.complete && element.naturalWidth > 0) {
                                imgResolve();
                              } else {
                                const onLoad = (): void => {
                                  element.removeEventListener('load', onLoad);
                                  element.removeEventListener('error', onError);
                                  imgResolve();
                                };
                                const onError = (): void => {
                                  element.removeEventListener('load', onLoad);
                                  element.removeEventListener('error', onError);
                                  imgResolve();
                                };
                                element.addEventListener('load', onLoad);
                                element.addEventListener('error', onError);
                                setTimeout(() => {
                                  element.removeEventListener('load', onLoad);
                                  element.removeEventListener('error', onError);
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

                  if (fabricCanvas.lowerCanvasEl && fabricCanvas.getContext()) {
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
                    // ignore
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
    };

    if (isOpen && universalLayouts.length > 0 && activeTab === 'universal') {
      void renderPreviews();
    } else {
      setPreviewsRendered(true);
    }
  }, [universalLayouts, activeTab, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
          >
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Шаблоны макетов</h2>
            <p className="text-sm text-gray-600 mt-1">
              Выберите универсальный макет или макет по категории. Маркетплейс можно будет настроить на следующем шаге.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-4 sm:px-6">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              className={`whitespace-nowrap py-3 px-1 border-b-2 text-sm font-medium ${
                activeTab === 'universal'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('universal')}
            >
              Универсальные макеты
            </button>
            <button
              className={`whitespace-nowrap py-3 px-1 border-b-2 text-sm font-medium ${
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Загрузка шаблонов...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">{error}</p>
            </div>
          ) : activeTab === 'universal' ? (
            universalLayouts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {universalLayouts.map((layout) => (
                  <div
                    key={layout.id}
                    className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group bg-white"
                    onClick={() => handleLayoutSelect(layout.id)}
                  >
                    <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative">
                      {layoutPreviews.has(layout.id) ? (
                        <img
                          src={layoutPreviews.get(layout.id)!}
                          alt={layout.name}
                          className="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform"
                        />
                      ) : layout.canvasData ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <div className="text-xs text-gray-500">Загрузка превью...</div>
                        </div>
                      ) : layout.preview ? (
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
                        />
                      ) : (
                        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                          <svg
                            className="text-gray-400"
                            width="60"
                            height="60"
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
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                        {layout.name}
                      </h3>
                      {layout.description && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{layout.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Универсальные макеты не найдены</p>
              </div>
            )
          ) : categoryTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryTemplates.map((template) => {
                const layoutCount = (template.layouts as LayoutSchema[] | undefined)?.length || 0;
                return (
                  <div
                    key={template.id}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group bg-white"
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                        <svg
                          className="text-white"
                          width="24"
                          height="24"
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
                        <h3 className="font-semibold text-base text-gray-900 group-hover:text-blue-600 transition-colors">
                          {template.name}
                        </h3>
                        {template.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{template.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500 font-medium">
                            {layoutCount} {layoutCount === 1 ? 'макет' : layoutCount < 5 ? 'макета' : 'макетов'}
                          </span>
                        </div>
                      </div>
                      <svg
                        className="flex-shrink-0 text-gray-400 group-hover:text-blue-600 transition-colors mt-1"
                        width="16"
                        height="16"
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
            </div>
          )}
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
