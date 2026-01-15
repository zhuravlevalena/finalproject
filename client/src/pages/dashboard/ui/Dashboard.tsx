import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { productCardService } from '@/entities/productcard/api/productcard.service';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Plus } from 'lucide-react';

export default function Dashboard(): React.JSX.Element {
  const { data: cards, isLoading } = useQuery({
    queryKey: ['productCards'],
    queryFn: () => productCardService.getAll(),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Мои карточки</h1>
        <Link href="/create-card">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Создать карточку
          </Button>
        </Link>
      </div>

      {!cards || cards.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">У вас пока нет карточек</p>
          <Link href="/create-card">
            <Button>Создать первую карточку</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link key={card.id} href={`/card/${card.id}`}>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">
                    {card.title || 'Без названия'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {card.marketplace?.name || 'Без маркетплейса'}
                  </p>
                  <div className="flex justify-between items-center">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        card.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {card.status === 'completed' ? 'Завершена' : 'Черновик'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(card.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
