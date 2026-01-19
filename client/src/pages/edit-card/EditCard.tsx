import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useRoute } from 'wouter';
import { productCardService } from '@/entities/productcard/api/productcard.service';
import { CardEditor } from '@/widgets/card-editor/ui/CardEditor';
import { CardHistory } from '@/widgets/card-history/ui/CardHistory';
import type { CardVersion } from '@/entities/cardversion/model/cardversion.types';
import { useToast } from '@/shared/ui/toaster';
import { Skeleton } from '@/shared/ui/skeleton';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Loader2 } from 'lucide-react';

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
    mutationFn: (data: { canvasData: Record<string, unknown> }) =>
      productCardService.update(cardId!, { canvasData: data.canvasData }),
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

  const [selectedVersion, setSelectedVersion] = useState<CardVersion | null>(null);

  const handleSave = async (canvasData: Record<string, unknown>) => {
    if (!cardId) return;
    updateCardMutation.mutate({ canvasData });
  };

  const handleLoadVersion = (version: CardVersion) => {
    setSelectedVersion(version);
    // Версия будет загружена в CardEditor через prop
  };

  const handleRestore = (version: CardVersion) => {
    // Обновить карточку после восстановления
    queryClient.invalidateQueries({ queryKey: ['productCard', cardId] });
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Редактировать карточку</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Редактор карточки</h2>
            <CardEditor 
              card={card} 
              onSave={handleSave} 
              initialImage={card.image}
              cardSize={card.canvasData?.cardSize as string || '1024x768'}
              slideCount={(card.canvasData?.slideCount as number) || 1}
              autoSaveEnabled={true}
              versionToLoad={selectedVersion ? { canvasData: selectedVersion.canvasData } : undefined}
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

          {cardId && (
            <CardHistory 
              cardId={cardId} 
              onRestore={handleRestore}
              onLoadVersion={handleLoadVersion}
            />
          )}
        </div>
      </div>
    </div>
  );
}
