import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { useAppSelector, useAppDispatch } from '@/shared/lib/hooks';
import {
  fetchProductCardsThunk,
  deleteProductCardThunk,
} from '@/entities/productcard/model/productcard.thunk';
<<<<<<< HEAD
import { fetchMarketplacesThunk } from '@/entities/marketplace/model/marketplace.thunk';
import { CardFilters, type CardFiltersState } from '@/widgets/card-filters/ui/CardFilters';
import { DeleteConfirmDialog } from '@/widgets/delete-confirm-dialog/ui/DeleteConfirmDialog';
import { useToast } from '@/shared/ui/toaster';
import { Skeleton } from '@/shared/ui/skeleton';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
=======
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Plus, Eye, Trash2 } from 'lucide-react';
>>>>>>> main

export default function Dashboard(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const [, setLocation] = useLocation();
  const toast = useToast();
  const { cards, loading: isLoading } = useAppSelector((state) => state.productCard);
  const { marketplaces } = useAppSelector((state) => state.marketplace);
  const { user, loading: isUserLoading } = useAppSelector((state) => state.user);

  const [filters, setFilters] = useState<CardFiltersState>({
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    cardId: number | null;
    cardTitle: string;
  }>({
    isOpen: false,
    cardId: null,
    cardTitle: '',
  });

  // Стабилизируем объект filters для предотвращения бесконечных запросов
  const filtersString = useMemo(
    () => JSON.stringify(filters),
    [filters.search, filters.marketplaceId, filters.status, filters.sortBy, filters.sortOrder],
  );

  useEffect(() => {
    if (user && !isUserLoading) {
<<<<<<< HEAD
      void dispatch(fetchMarketplacesThunk());
    }
  }, [dispatch, user, isUserLoading]);

  useEffect(() => {
    if (user && !isUserLoading) {
      void dispatch(fetchProductCardsThunk(filters));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, user, isUserLoading, filtersString]);

  const handleDeleteClick = (cardId: number, cardTitle: string): void => {
    setDeleteDialog({
      isOpen: true,
      cardId,
      cardTitle: cardTitle || 'Без названия',
    });
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!deleteDialog.cardId) return;

    try {
      await dispatch(deleteProductCardThunk(deleteDialog.cardId)).unwrap();
      // Обновляем список карточек после удаления
      void dispatch(fetchProductCardsThunk(filters));
      toast.success('Карточка успешно удалена');
      setDeleteDialog({ isOpen: false, cardId: null, cardTitle: '' });
    } catch (err) {
      console.error('Ошибка при удалении карточки:', err);
      toast.error('Не удалось удалить карточку');
      setDeleteDialog({ isOpen: false, cardId: null, cardTitle: '' });
    }
  };

  const handleDeleteCancel = (): void => {
    setDeleteDialog({ isOpen: false, cardId: null, cardTitle: '' });
  };

  const handleEdit = (cardId: number): void => {
    setLocation(`/edit-card/${String(cardId)}`);
  };

  // Компонент скелетона карточки
  function CardSkeleton(): React.JSX.Element {
    return (
      <Card className="h-full relative">
        <div className="p-6 pb-16">
          <Skeleton variant="text" className="h-6 w-3/4 mb-3" />
          <Skeleton variant="text" className="h-4 w-1/2 mb-4" />
          <div className="flex justify-between items-center">
            <Skeleton variant="rectangular" className="h-6 w-20" />
            <Skeleton variant="text" className="h-4 w-24" />
          </div>
        </div>
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Skeleton variant="circular" className="h-9 w-9" />
          <Skeleton variant="circular" className="h-9 w-9" />
        </div>
      </Card>
    );
  }

=======
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

>>>>>>> main
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <Skeleton variant="text" className="h-10 w-48" />
          <Skeleton variant="rectangular" className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1">
            <Skeleton variant="rectangular" className="h-96 rounded-lg" />
          </div>
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }, (_, i) => (
                <CardSkeleton key={`skeleton-${String(i)}`} />
              ))}
            </div>
          </div>
        </div>
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

<<<<<<< HEAD
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1">
          <CardFilters marketplaces={marketplaces} filters={filters} onFiltersChange={setFilters} />
        </div>
        <div className="lg:col-span-3">
          {cards.length === 0 ? (
            <div className="text-center py-16">
              <Card className="max-w-md mx-auto p-12">
                <p className="text-gray-700 mb-6 text-lg">У вас пока нет карточек</p>
                <Link href="/create-card">
                  <Button variant="default" size="lg">
                    Создать первую карточку
                  </Button>
                </Link>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => (
                <Card
                  key={card.id}
                  className="h-full relative group hover:shadow-lg transition-shadow"
                >
                  <div className="p-6 pb-16">
                    <h3 className="font-semibold text-lg mb-3 text-gray-800">
                      {card.title ?? 'Без названия'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {card.marketplace?.name ?? 'Без маркетплейса'}
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

                  {/* Кнопки действий */}
                  <div className="absolute bottom-4 right-4 flex gap-2 items-center pointer-events-none">
                    {/* Кнопка редактирования */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(card.id);
                      }}
                      className="h-9 w-9 p-0 bg-white hover:bg-blue-50 shadow-md hover:shadow-lg transition-all pointer-events-auto rounded-full border border-blue-200"
                      title="Редактировать"
                    >
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </Button>

                    {/* Кнопка удаления */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(card.id, card.title ?? '');
                      }}
                      className="h-9 w-9 p-0 bg-white hover:bg-red-50 shadow-md hover:shadow-lg transition-all pointer-events-auto rounded-full border border-red-200"
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
=======
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
              <Link href={`/edit-card/${String(card.id)}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
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
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="h-3 w-3" />
                          Просмотр
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
              <button
                onClick={(e) => handleDelete(e, card.id)}
                className="absolute top-2 left-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg z-10"
                title="Удалить карточку"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
>>>>>>> main
        </div>
      </div>

      {/* Модальное окно подтверждения удаления */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        cardTitle={deleteDialog.cardTitle}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
