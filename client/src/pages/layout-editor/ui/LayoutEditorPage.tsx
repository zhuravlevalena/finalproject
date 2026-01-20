import { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { CardEditor } from '@/widgets/card-editor/ui/CardEditor';
import { layoutService } from '@/entities/layout/api/layout.service';
import { productCardService } from '@/entities/productcard/api/productcard.service';
import type { LayoutSchema } from '@/entities/layout/model/layout.schemas';

export default function LayoutEditorPage(): React.JSX.Element {
  const [, params] = useRoute('/layout-editor/:id');
  const [, setLocation] = useLocation();
  const [layout, setLayout] = useState<LayoutSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) return;

    const fetchLayout = async (): Promise<void> => {
      try {
        setLoading(true);
        const data = await layoutService.getLayoutById(parseInt(params.id, 10));
        setLayout(data);
      } catch (err) {
        console.error('Error fetching layout:', err);
        setError('Ошибка загрузки макета');
      } finally {
        setLoading(false);
      }
    };

    void fetchLayout();
  }, [params?.id]);

  const handleSave = async (
    imageFile: File,
    canvasData?: { fabric?: Record<string, unknown>; meta?: Record<string, unknown> },
  ): Promise<void> => {
    try {
      if (!layout) return;

      // Создаем новую карточку на основе макета
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('title', `Карточка из макета: ${layout.name}`);

      if (layout.template?.marketplaceId) {
        formData.append('marketplaceId', String(layout.template.marketplaceId));
      }

      if (layout.templateId) {
        formData.append('templateId', String(layout.templateId));
      }

      if (canvasData) {
        formData.append('canvasData', JSON.stringify(canvasData));
      }

      const newCard = await productCardService.create(formData);

      // eslint-disable-next-line no-alert
      alert('Карточка успешно создана!');
      setLocation(`/edit-card/${newCard.id}`);
    } catch (err) {
      console.error('Error saving card:', err);
      // eslint-disable-next-line no-alert
      alert('Ошибка при сохранении карточки');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <p className="text-gray-500 text-lg">Загрузка макета...</p>
      </div>
    );
  }

  if (error || !layout) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error || 'Макет не найден'}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  // Определяем размер canvas на основе маркетплейса
  const getCanvasSize = (): string => {
    // Формат 3:4 для всех маркетплейсов
    return '900x1200';
  };

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 break-words">{layout.name}</h1>
              <p className="text-sm text-gray-600">
                {layout.template?.marketplace?.name || 'Редактор макета'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <CardEditor
          onSave={handleSave}
          cardSize={getCanvasSize()}
          slideCount={1}
          card={{
            canvasData: layout.canvasData as {
              fabric?: Record<string, unknown>;
              meta?: Record<string, unknown>;
            },
          }}
        />
      </div>
    </div>
  );
}
