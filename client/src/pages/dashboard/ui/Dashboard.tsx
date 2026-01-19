import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useAppSelector, useAppDispatch } from '@/shared/lib/hooks';
import {
  fetchProductCardsThunk,
  deleteProductCardThunk,
} from '@/entities/productcard/model/productcard.thunk';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Plus, Eye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Dashboard(): React.JSX.Element {
  const dispatch = useAppDispatch();
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
          {cards.map((card) => {
            // Извлекаем данные о слайдах из canvasData.meta
            const canvasData = card.canvasData as
              | {
                  meta?: {
                    slides?: { canvasData?: { fabric?: Record<string, unknown> } }[];
                    slideCount?: number;
                  };
                }
              | null
              | undefined;
            const meta = canvasData?.meta;
            const slides = meta?.slides || [];
            const slideCount = meta?.slideCount || 1;

            return (
              <CardSlideViewer
                key={card.id}
                card={card}
                slides={slides}
                slideCount={slideCount}
                onDelete={handleDelete}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// Компонент для отображения карточки со слайдами
function CardSlideViewer({
  card,
  slides,
  slideCount,
  onDelete,
}: {
  card: {
    id: number;
    title?: string;
    status: string;
    createdAt: string;
    marketplace?: { name?: string };
    generatedImage?: { url?: string };
  };
  slides: { canvasData?: { fabric?: Record<string, unknown> } }[];
  slideCount: number;
  onDelete: (e: React.MouseEvent, cardId: number) => void;
}): React.JSX.Element {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Генерируем изображения из canvas данных (упрощенная версия)
  // В реальности нужно будет рендерить canvas в изображение
  const getSlideImage = (index: number): string | null => {
    if (card.generatedImage?.url) {
      return card.generatedImage.url.startsWith('http')
        ? card.generatedImage.url
        : `${window.location.origin}${card.generatedImage.url}`;
    }
    return null;
  };

  const hasMultipleSlides = slideCount > 1;

  return (
    <div className="relative">
      <Link href={`/edit-card/${String(card.id)}`}>
        <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
          {/* Показываем слайды */}
          {hasMultipleSlides ? (
            <div className="relative">
              {getSlideImage(currentSlideIndex) ? (
                <div className="relative">
                  <img
                    src={getSlideImage(currentSlideIndex) || ''}
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
                  {/* Навигация по слайдам */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2 items-center bg-black/50 rounded-full px-3 py-1.5">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
                      }}
                      disabled={currentSlideIndex === 0}
                      className="text-white hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-white text-xs mx-2">
                      {currentSlideIndex + 1} / {slideCount}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentSlideIndex(Math.min(slideCount - 1, currentSlideIndex + 1));
                      }}
                      disabled={currentSlideIndex === slideCount - 1}
                      className="text-white hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  {/* Индикаторы слайдов */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {Array.from({ length: slideCount }).map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentSlideIndex ? 'bg-blue-500' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-400">Нет изображения</p>
                </div>
              )}
            </div>
          ) : (
            // Один слайд - обычное отображение
            <>
              {getSlideImage(0) ? (
                <div className="relative">
                  <img
                    src={getSlideImage(0) || ''}
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
            </>
          )}

          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">{card.title || 'Без названия'}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {card.marketplace?.name || 'Без маркетплейса'}
            </p>
            {hasMultipleSlides && (
              <p className="text-xs text-blue-600 mb-2">
                {slideCount} {slideCount === 1 ? 'слайд' : slideCount < 5 ? 'слайда' : 'слайдов'}
              </p>
            )}
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {new Date(card.createdAt).toLocaleDateString()}
              </span>
              {getSlideImage(0) && (
                <a
                  href={getSlideImage(0) || '#'}
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
        onClick={(e) => onDelete(e, card.id)}
        className="absolute top-2 left-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg z-10"
        title="Удалить карточку"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
