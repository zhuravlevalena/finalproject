import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'wouter';
import { useAppSelector, useAppDispatch } from '@/shared/lib/hooks';
import { fetchProductCardsThunk } from '@/entities/productcard/model/productcard.thunk';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Plus, Eye } from 'lucide-react';
import { fabric } from 'fabric';

export default function Dashboard(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const { cards, loading: isLoading } = useAppSelector((state) => state.productCard);
  const { user, loading: isUserLoading } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (user && !isUserLoading) {
      void dispatch(fetchProductCardsThunk());
    }
  }, [dispatch, user, isUserLoading]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  const completedCount = cards.filter((c) => c.status === 'completed').length;
  const draftCount = cards.filter((c) => c.status !== 'completed').length;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Верхняя панель со статистикой */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Мои карточки</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Всего: <span className="font-semibold text-foreground">{cards.length}</span>
            </span>
            {completedCount > 0 && (
              <span>
                Завершено: <span className="font-semibold text-emerald-600">{completedCount}</span>
              </span>
            )}
            {draftCount > 0 && (
              <span>
                Черновики: <span className="font-semibold text-amber-600">{draftCount}</span>
              </span>
            )}
          </div>
        </div>
        <div className="sm:shrink-0">
          <Link href="/create-card">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Создать карточку
            </Button>
          </Link>
        </div>
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
                    slides?: {
                      canvasData?: {
                        fabric?: Record<string, unknown>;
                        meta?: Record<string, unknown>;
                      };
                    }[];
                    slideCount?: number;
                    cardSize?: string;
                  };
                }
              | null
              | undefined;
            const meta = canvasData?.meta;
            const slides = meta?.slides || [];
            const slideCount = meta?.slideCount || 1;
            const cardSize = meta?.cardSize || '1024x768';

            return (
              <CardSlideViewer
                key={card.id}
                card={card}
                slides={slides}
                slideCount={slideCount}
                cardSize={cardSize}
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
  cardSize,
}: {
  card: {
    id: number;
    title?: string;
    status: string;
    createdAt: string;
    marketplace?: { name?: string };
    generatedImage?: { url?: string };
  };
  slides: {
    canvasData?: {
      fabric?: Record<string, unknown>;
      meta?: Record<string, unknown>;
    };
  }[];
  slideCount: number;
  cardSize: string;
}): React.JSX.Element {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideImages, setSlideImages] = useState<Map<number, string>>(new Map());
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());

  // Функция для рендеринга слайда в изображение
  const renderSlideToImage = async (index: number): Promise<string | null> => {
    const slide = slides[index];

    // Если это первый слайд и есть generatedImage, используем его
    if (index === 0 && card.generatedImage?.url) {
      const url = card.generatedImage.url.startsWith('http')
        ? card.generatedImage.url
        : `${window.location.origin}${card.generatedImage.url}`;
      return url;
    }

    // Если нет данных canvas для этого слайда, возвращаем null
    if (!slide?.canvasData?.fabric) {
      return null;
    }

    // Проверяем, есть ли уже закэшированное изображение
    if (slideImages.has(index)) {
      return slideImages.get(index) || null;
    }

    try {
      // Создаем временный canvas
      const [width, height] = cardSize.split('x').map(Number);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const fabricCanvas = new fabric.Canvas(canvas, {
        width,
        height,
        backgroundColor: '#ffffff',
      });

      // Загружаем данные из fabric JSON
      await new Promise<void>((resolve, reject) => {
        fabricCanvas.loadFromJSON(
          slide.canvasData!.fabric!,
          () => {
            fabricCanvas.renderAll();
            resolve();
          },
          reject,
        );
      });

      // Конвертируем в data URL
      const dataURL = fabricCanvas.toDataURL({
        format: 'png',
        quality: 1,
      });

      // Очищаем canvas
      fabricCanvas.dispose();

      // Кэшируем изображение
      setSlideImages((prev) => {
        const newMap = new Map(prev);
        newMap.set(index, dataURL);
        return newMap;
      });

      return dataURL;
    } catch (error) {
      console.error(`Error rendering slide ${index}:`, error);
      return null;
    }
  };

  // Загружаем изображения для всех слайдов при монтировании
  useEffect(() => {
    const loadAllSlides = async () => {
      for (let i = 0; i < slideCount; i++) {
        const imageUrl = await renderSlideToImage(i);
        if (imageUrl) {
          setSlideImages((prev) => {
            const newMap = new Map(prev);
            newMap.set(i, imageUrl);
            return newMap;
          });
        }
      }
    };

    void loadAllSlides();
  }, [slideCount, slides, cardSize]);

  // Получаем изображение текущего слайда
  const getCurrentSlideImage = (): string | null => slideImages.get(currentSlideIndex) || null;

  const hasMultipleSlides = slideCount > 1;
  const currentImage = getCurrentSlideImage();

  return (
    <div className="relative">
      <Link href={`/edit-card/${String(card.id)}`}>
        <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
          {/* Показываем слайды */}
          {hasMultipleSlides ? (
            <div className="relative">
              {currentImage ? (
                <div className="relative">
                  <img
                    src={currentImage}
                    alt={`${card.title || 'Карточка товара'} - Слайд ${currentSlideIndex + 1}`}
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
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2 items-center bg-black/50 rounded-full px-3 py-1.5 z-10">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
                      }}
                      disabled={currentSlideIndex === 0}
                      className="text-white hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                      className="text-white hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  {/* Индикаторы слайдов */}
                  <div className="absolute top-2 left-2 flex gap-1 z-10">
                    {Array.from({ length: slideCount }).map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentSlideIndex ? 'bg-blue-500' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                  {/* Статус */}
                  <div className="absolute top-2 right-2 flex gap-2 z-10">
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
                  <p className="text-gray-400">Загрузка слайда {currentSlideIndex + 1}...</p>
                </div>
              )}
            </div>
          ) : (
            // Один слайд - обычное отображение
            <>
              {currentImage ? (
                <div className="relative">
                  <img
                    src={currentImage}
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
              {currentImage && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(currentImage, '_blank', 'noopener,noreferrer');
                  }}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Eye className="h-3 w-3" />
                  Просмотр
                </button>
              )}
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
}
