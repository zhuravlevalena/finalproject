import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { useAppSelector, useAppDispatch } from '@/shared/lib/hooks';
import {
  fetchProductCardsThunk,
  deleteProductCardThunk,
} from '@/entities/productcard/model/productcard.thunk';
import { fetchMarketplacesThunk } from '@/entities/marketplace/model/marketplace.thunk';
import { CardFilters, type CardFiltersState } from '@/widgets/card-filters/ui/CardFilters';
import { DeleteConfirmDialog } from '@/widgets/delete-confirm-dialog/ui/DeleteConfirmDialog';
import { useToast } from '@/shared/ui/toaster';
import { Skeleton } from '@/shared/ui/skeleton';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';

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
