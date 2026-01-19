import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useRoute } from 'wouter';
import { productCardService } from '@/entities/productcard/api/productcard.service';
import { CardEditor } from '@/widgets/card-editor/ui/CardEditor';
import { useToast } from '@/shared/ui/toaster';
import { Skeleton } from '@/shared/ui/skeleton';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';

export default function EditCard(): React.JSX.Element {
  const [, params] = useRoute('/edit-card/:id');
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();
  const cardId = params?.id ? Number(params.id) : null;

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
      success('Карточка успешно сохранена');
      setLocation('/dashboard');
    },
    onError: () => {
      showError('Ошибка при сохранении карточки');
    },
  });

  const handleSave = async (
    imageFile: File,
    canvasData?: { fabric?: Record<string, unknown>; meta?: Record<string, unknown> },
  ) => {
    if (!cardId) return;

    // ПРАВИЛЬНО: передаем объект с canvasData и imageFile
    updateCardMutation.mutate({
      canvasData: {
        fabric: canvasData?.fabric || null,
        meta: canvasData?.meta || {},
      },
      imageFile,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton variant="text" className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <Skeleton variant="text" className="h-6 w-48 mb-4" />
              <Skeleton variant="rectangular" className="h-96 w-full rounded-lg" />
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="p-6">
              <Skeleton variant="text" className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                <Skeleton variant="text" className="h-4 w-full" />
                <Skeleton variant="text" className="h-4 w-3/4" />
                <Skeleton variant="text" className="h-4 w-1/2" />
              </div>
            </Card>
            <Card className="p-6">
              <Skeleton variant="text" className="h-6 w-40 mb-4" />
              <div className="space-y-2">
                <Skeleton variant="rectangular" className="h-16 w-full rounded" />
                <Skeleton variant="rectangular" className="h-16 w-full rounded" />
                <Skeleton variant="rectangular" className="h-16 w-full rounded" />
              </div>
            </Card>
          </div>
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
    <div className="container mx-auto px-4 py-8">
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
  );
}
