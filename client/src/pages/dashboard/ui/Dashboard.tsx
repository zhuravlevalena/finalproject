import React, { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAppSelector, useAppDispatch } from '@/shared/lib/hooks';
import {
  fetchProductCardsThunk,
  deleteProductCardThunk,
} from '@/entities/productcard/model/productcard.thunk';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Plus, Eye, Trash2, Edit } from 'lucide-react';

export default function Dashboard(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const [, setLocation] = useLocation();
  const { cards, loading: isLoading } = useAppSelector((state) => state.productCard);
  const { user, loading: isUserLoading } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (user && !isUserLoading) {
      void dispatch(fetchProductCardsThunk());
    }
  }, [dispatch, user, isUserLoading]);

  const handleDelete = async (e: React.MouseEvent, cardId: number) => {
    e.preventDefault();
    e.stopPropagation();
    // eslint-disable-next-line no-alert
    if (confirm('Вы уверены, что хотите удалить эту карточку?')) {
      const result = await dispatch(deleteProductCardThunk(cardId));
      if (deleteProductCardThunk.fulfilled.match(result)) {
        void dispatch(fetchProductCardsThunk());
      }
    }
  };

  const handleEdit = (e: React.MouseEvent, cardId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setLocation(`/edit-card/${String(cardId)}`);
  };

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

      {cards.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">У вас пока нет карточек</p>
          <Link href="/create-card">
            <Button>Создать первую карточку</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div key={card.id} className="relative">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Показываем готовое изображение карточки */}
                {card.generatedImage?.url ? (
                  <div className="relative">
                    <img
                      src={
                        card.generatedImage.url.startsWith('http')
                          ? card.generatedImage.url
                          : `${window.location.origin}${card.generatedImage.url}`
                      }
                      alt={card.title || 'Карточка товара'}
                      className="w-full h-64 object-contain bg-gray-100"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML =
                            '<div class="w-full h-64 bg-gray-100 flex items-center justify-center"><p class="text-gray-400">Ошибка загрузки изображения</p></div>';
                        }
                      }}
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
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
                ) : (
                  <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-400">Нет изображения</p>
                  </div>
                )}

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{card.title || 'Без названия'}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {card.marketplace?.name || 'Без маркетплейса'}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {new Date(card.createdAt).toLocaleDateString()}
                    </span>
                    {card.generatedImage?.url && (
                      <a
                        href={
                          card.generatedImage.url.startsWith('http')
                            ? card.generatedImage.url
                            : `${window.location.origin}${card.generatedImage.url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-3 w-3" />
                        Просмотр
                      </a>
                    )}
                  </div>
                </div>
              </Card>
              
              {/* Кнопка редактирования */}
              <button
                onClick={(e) => handleEdit(e, card.id)}
                className="absolute top-2 right-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg z-10"
                title="Редактировать карточку"
              >
                <Edit className="h-4 w-4" />
              </button>
              
              {/* Кнопка удаления */}
              <button
                onClick={(e) => handleDelete(e, card.id)}
                className="absolute top-2 left-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg z-10"
                title="Удалить карточку"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
