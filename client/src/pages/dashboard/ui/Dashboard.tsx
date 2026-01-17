import React, { useEffect } from 'react';
import { Link } from 'wouter';
import { useAppSelector, useAppDispatch } from '@/shared/lib/hooks';
import { fetchProductCardsThunk } from '@/entities/productcard/model/productcard.thunk';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Plus } from 'lucide-react';

export default function Dashboard(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const { cards, loading: isLoading } = useAppSelector((state) => state.productCard);
  const { user, loading: isUserLoading } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (user && !isUserLoading) {
      dispatch(fetchProductCardsThunk());
    }
  }, [dispatch, user, isUserLoading]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center text-gray-700">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative z-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 drop-shadow-sm">Мои карточки</h1>
        <Link href="/create-card">
          <Button variant="default" size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Создать карточку
          </Button>
        </Link>
      </div>

      {!cards || cards.length === 0 ? (
        <div className="text-center py-16">
          <Card className="max-w-md mx-auto p-12">
            <p className="text-gray-700 mb-6 text-lg">У вас пока нет карточек</p>
            <Link href="/create-card">
              <Button variant="default" size="lg">Создать первую карточку</Button>
            </Link>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link key={card.id} href={`/edit-card/${String(card.id)}`}>
              <Card className="h-full">
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">
                    {card.title || 'Без названия'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {card.marketplace?.name || 'Без маркетплейса'}
                  </p>
                  <div className="flex justify-between items-center">
                    <span
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium backdrop-blur-sm ${
                        card.status === 'completed'
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      }`}
                    >
                      {card.status === 'completed' ? 'Завершена' : 'Черновик'}
                    </span>
                    <span className="text-xs text-gray-600">
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
