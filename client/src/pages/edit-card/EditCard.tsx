import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useRoute } from 'wouter';
import { useAppDispatch } from '@/shared/lib/hooks';
import { productCardService } from '@/entities/productcard/api/productcard.service';
import { deleteProductCardThunk } from '@/entities/productcard/model/productcard.thunk';
import { CardEditor } from '@/widgets/card-editor/ui/CardEditor';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Loader2, Trash2, AlertTriangle, X } from 'lucide-react';

export default function EditCard(): React.JSX.Element {
  const [, params] = useRoute('/edit-card/:id');
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const cardId = params?.id ? Number(params.id) : null;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: card, isLoading } = useQuery({
    queryKey: ['productCard', cardId],
    queryFn: () => productCardService.getById(cardId!),
    enabled: !!cardId,
  });

  const updateCardMutation = useMutation({
    mutationFn: ({
      canvasData,
      imageFile,
    }: {
      canvasData: Record<string, unknown>;
      imageFile?: File;
    }) => productCardService.update(cardId!, { canvasData }, imageFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCards'] });
      queryClient.invalidateQueries({ queryKey: ['productCard', cardId] });
      setLocation('/dashboard');
    },
  });

  const handleSave = async (
    imageFile: File,
    canvasData?: { fabric?: Record<string, unknown>; meta?: Record<string, unknown> },
  ) => {
    if (!cardId) return;

    updateCardMutation.mutate({
      canvasData: {
        fabric: canvasData?.fabric || null,
        meta: canvasData?.meta || {},
      },
      imageFile,
    });
  };

  const handleDelete = async () => {
    if (!cardId) return;

    setIsDeleting(true);
    try {
      const result = await dispatch(deleteProductCardThunk(cardId));
      if (deleteProductCardThunk.fulfilled.match(result)) {
        queryClient.invalidateQueries({ queryKey: ['productCards'] });
        setLocation('/dashboard');
      } else {
        // eslint-disable-next-line no-alert
        alert('Ошибка при удалении карточки');
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      // eslint-disable-next-line no-alert
      alert('Ошибка при удалении карточки');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-4">Загрузка карточки...</p>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600">Карточка не найдена</p>
          <Button onClick={() => setLocation('/dashboard')} className="mt-4">
            Вернуться к списку
          </Button>
        </div>
      </div>
    );
  }

  // Извлекаем параметры из canvasData.meta с проверками безопасности
  const canvasData =
    (card.canvasData as
      | { meta?: Record<string, unknown>; fabric?: Record<string, unknown> }
      | null
      | undefined) || undefined;
  const meta = canvasData?.meta;

  // Безопасное извлечение cardSize
  let cardSize = '1024x768';
  if (meta && typeof meta === 'object' && 'cardSize' in meta && typeof meta.cardSize === 'string') {
    cardSize = meta.cardSize;
  }

  // Безопасное извлечение slideCount
  let slideCount = 1;
  if (
    meta &&
    typeof meta === 'object' &&
    'slideCount' in meta &&
    typeof meta.slideCount === 'number'
  ) {
    slideCount = meta.slideCount;
  }

  // Преобразуем image в нужный формат с проверками
  let initialImage: { id: number; url: string } | undefined;
  if (card.image) {
    const imageData = card.image as unknown as { id?: number; url?: string };
    if (imageData?.id && imageData?.url) {
      initialImage = { id: imageData.id, url: imageData.url };
    } else if (card.imageId) {
      initialImage = { id: card.imageId, url: '' };
    }
  } else if (card.imageId) {
    initialImage = { id: card.imageId, url: '' };
  }

  // Получаем backgroundImage из meta, если есть ID
  let backgroundImage: { id: number; url: string } | undefined;
  if (
    meta &&
    typeof meta === 'object' &&
    'backgroundImageId' in meta &&
    typeof meta.backgroundImageId === 'number'
  ) {
    const { backgroundImageId } = meta;
    if (card.image) {
      const imageData = card.image as unknown as { url?: string };
      if (imageData?.url) {
        backgroundImage = { id: backgroundImageId, url: imageData.url };
      }
    }
  }

  // Преобразуем card в нужный формат для CardEditor
  let generatedImageUrl: string | undefined;
  if (card.generatedImage) {
    const generatedImageData = card.generatedImage as unknown as { url?: string };
    generatedImageUrl = generatedImageData?.url;
  }

  const cardForEditor = {
    canvasData,
    generatedImage: generatedImageUrl ? { url: generatedImageUrl } : undefined,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-6">Редактировать карточку</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Редактор карточки</h2>
              <CardEditor
                card={cardForEditor}
                onSave={handleSave}
                initialImage={initialImage}
                backgroundImage={backgroundImage}
                cardSize={cardSize}
                slideCount={slideCount}
              />
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Информация</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Маркетплейс</p>
                  <p className="text-sm text-muted-foreground">
                    {card.marketplace?.name || 'Не указан'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Шаблон</p>
                  <p className="text-sm text-muted-foreground">
                    {card.template?.name || 'Не указан'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Статус</p>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      card.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {card.status === 'completed' ? 'Завершена' : 'Черновик'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Кнопка удаления внизу экрана */}
      <div className="border-t border-gray-200 bg-white py-4 mt-auto sticky bottom-0 z-50">
        <div className="container mx-auto px-4">
          {!showDeleteConfirm ? (
            <div className="flex justify-end">
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white"
              >
                <Trash2 className="h-4 w-4" />
                Удалить карточку товара
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">
                  Вы уверены, что хотите удалить эту карточку?
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Это действие нельзя отменить. Карточка будет удалена безвозвратно.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="border-gray-300"
                >
                  Отмена
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Удаление...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Удалить безвозвратно
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
