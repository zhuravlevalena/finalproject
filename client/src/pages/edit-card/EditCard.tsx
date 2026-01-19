import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useRoute } from 'wouter';
import { productCardService } from '@/entities/productcard/api/productcard.service';
import { CardEditor } from '@/widgets/card-editor/ui/CardEditor';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Loader2 } from 'lucide-react';

export default function EditCard(): React.JSX.Element {
  const [, params] = useRoute('/edit-card/:id');
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
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
      setLocation('/dashboard');
    },
  });

  const handleSave = async (canvasData: Record<string, unknown>) => {
    if (!cardId) return;
    updateCardMutation.mutate({ canvasData });
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Редактировать карточку</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Редактор карточки</h2>
            <CardEditor card={card} onSave={handleSave} initialImage={card.image} />
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
