import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useRoute } from 'wouter';
import { useAppDispatch } from '@/shared/lib/hooks';
import { productCardService } from '@/entities/productcard/api/productcard.service';
import { deleteProductCardThunk } from '@/entities/productcard/model/productcard.thunk';
import type { CardEditorRef } from '@/widgets/card-editor/ui/CardEditor';
import { CardEditor } from '@/widgets/card-editor/ui/CardEditor';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Loader2, Trash2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { imageService } from '@/entities/image/api/image.service';

type SlideData = {
  canvasData?: { fabric?: Record<string, unknown>; meta?: Record<string, unknown> };
  uploadedImage?: { id: number; url: string } | null;
  backgroundImage?: { id: number; url: string } | null;
};

export default function EditCard(): React.JSX.Element {
  const [, params] = useRoute('/edit-card/:id');
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const cardId = params?.id ? Number(params.id) : null;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const cardEditorRef = useRef<CardEditorRef | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slides, setSlides] = useState<SlideData[]>([
    {
      canvasData: undefined,
      uploadedImage: null,
      backgroundImage: null,
    },
  ]);

  const { data: card, isLoading } = useQuery({
    queryKey: ['productCard', cardId],
    queryFn: () => productCardService.getById(cardId!),
    enabled: !!cardId,
  });

  // Загружаем данные слайдов из карточки
  useEffect(() => {
    if (!card) return;

    const canvasData = card.canvasData as
      | {
          meta?: {
            slides?: {
              canvasData?: {
                fabric?: Record<string, unknown>;
                meta?: Record<string, unknown>;
              };
              imageId?: number;
              backgroundImageId?: number;
            }[];
            slideCount?: number;
            cardSize?: string;
          };
        }
      | null
      | undefined;

    const meta = canvasData?.meta;
    const slidesData = meta?.slides ?? [];
    const slideCount = meta?.slideCount ?? 1;

    // Инициализируем массив слайдов
    const loadedSlides: SlideData[] = [];

    const loadSlideData = async () => {
      for (let i = 0; i < slideCount; i++) {
        const slideData = slidesData[i];
        const slide: SlideData = {
          canvasData: slideData?.canvasData,
          uploadedImage: null,
          backgroundImage: null,
        };

        // Загружаем изображение слайда, если есть imageId
        if (slideData?.imageId) {
          try {
            const image = await imageService.getById(slideData.imageId);
            if (image) {
              slide.uploadedImage = {
                id: image.id,
                url: image.url.startsWith('http')
                  ? image.url
                  : `${window.location.origin}${image.url}`,
              };
            }
          } catch (error) {
            console.error(`Error loading image for slide ${i}:`, error);
          }
        } else if (i === 0 && card.imageId) {
          // Для первого слайда используем основное изображение карточки
          try {
            const image = await imageService.getById(card.imageId);
            if (image) {
              slide.uploadedImage = {
                id: image.id,
                url: image.url.startsWith('http')
                  ? image.url
                  : `${window.location.origin}${image.url}`,
              };
            }
          } catch (error) {
            console.error('Error loading main image:', error);
          }
        }

        // Загружаем фоновое изображение, если есть backgroundImageId
        if (slideData?.backgroundImageId) {
          try {
            const bgImage = await imageService.getById(slideData.backgroundImageId);
            if (bgImage) {
              slide.backgroundImage = {
                id: bgImage.id,
                url: bgImage.url.startsWith('http')
                  ? bgImage.url
                  : `${window.location.origin}${bgImage.url}`,
              };
            }
          } catch (error) {
            console.error(`Error loading background image for slide ${i}:`, error);
          }
        }

        loadedSlides.push(slide);
      }

      setSlides(loadedSlides);
    };

    void loadSlideData();
  }, [card]);

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
      setLocation('/dashboard');
    },
  });

  // Сохранение текущего слайда перед переключением
  const saveCurrentSlideCanvas = (): void => {
    if (!cardEditorRef.current?.getCanvasData) return;
    const canvasData = cardEditorRef.current.getCanvasData();
    if (canvasData) {
      setSlides((prev) => {
        const newSlides = [...prev];
        newSlides[currentSlideIndex] = {
          ...newSlides[currentSlideIndex],
          canvasData: {
            fabric: canvasData.fabric ?? null,
            meta: canvasData.meta ?? {},
          },
        };
        return newSlides;
      });
    }
  };

  // Обработчик переключения слайда
  const handleSlideChange = (newIndex: number): void => {
    if (newIndex === currentSlideIndex) return;
    saveCurrentSlideCanvas();
    setCurrentSlideIndex(newIndex);
  };

  const handleSave = async (
    imageFile: File,
    canvasData?: { fabric?: Record<string, unknown>; meta?: Record<string, unknown> },
  ): Promise<void> => {
    if (!cardId) return;

    // Сохраняем данные текущего слайда
    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex] = {
      ...updatedSlides[currentSlideIndex],
      canvasData: canvasData || updatedSlides[currentSlideIndex].canvasData,
    };
    setSlides(updatedSlides);

    // Извлекаем параметры из существующей карточки
    const existingCanvasData = card.canvasData as
      | {
          meta?: {
            slideCount?: number;
            cardSize?: string;
          };
        }
      | null
      | undefined;
    const meta = existingCanvasData?.meta;
    const slideCount = meta?.slideCount ?? slides.length;
    const cardSize = meta?.cardSize ?? '1024x768';

    // Создаем массив всех слайдов с их данными
    const slidesData = updatedSlides.map((slide, index) => ({
      canvasData: slide.canvasData ?? { fabric: undefined, meta: {} },
      imageId: slide.uploadedImage?.id,
      backgroundImageId: slide.backgroundImage?.id,
      slideIndex: index,
    }));

    updateCardMutation.mutate({
      canvasData: {
        fabric: undefined,
        meta: {
          slideCount,
          cardSize,
          slides: slidesData,
        },
      },
      imageFile,
    });
  };

  const handleDelete = async (): Promise<void> => {
    if (!cardId) return;

    setIsDeleting(true);
    try {
      const result = await dispatch(deleteProductCardThunk(cardId));
      if (deleteProductCardThunk.fulfilled.match(result)) {
        queryClient.invalidateQueries({ queryKey: ['productCards'] });
        setLocation('/dashboard');
      } else {
        // eslint-disable-next-line no-alert
        alert('Ошибка при удалении карточки');
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      // eslint-disable-next-line no-alert
      alert('Ошибка при удалении карточки');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
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

  // Извлекаем параметры из canvasData.meta
  const canvasData = card.canvasData as
    | {
        meta?: {
          slideCount?: number;
          cardSize?: string;
        };
      }
    | null
    | undefined;
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

  const currentSlide = slides[currentSlideIndex] ?? slides[0];
  const hasMultipleSlides = slideCount > 1;

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-6">Редактировать карточку</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Редактор карточки</h2>

              {/* Навигация по слайдам */}
              {hasMultipleSlides && (
                <div className="mb-4 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <Button
                    variant="outline"
                    onClick={() => handleSlideChange(Math.max(0, currentSlideIndex - 1))}
                    disabled={currentSlideIndex === 0}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Предыдущий
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      Слайд {currentSlideIndex + 1} из {slideCount}
                    </span>
                    <div className="flex gap-1">
                      {Array.from({ length: slideCount }).map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentSlideIndex ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleSlideChange(Math.min(slideCount - 1, currentSlideIndex + 1))
                    }
                    disabled={currentSlideIndex === slideCount - 1}
                    className="flex items-center gap-2"
                  >
                    Следующий
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <CardEditor
                key={`slide-${String(currentSlideIndex)}-${cardSize}`}
                ref={cardEditorRef}
                card={
                  currentSlide.canvasData
                    ? {
                        canvasData: currentSlide.canvasData,
                      }
                    : undefined
                }
                onSave={handleSave}
                initialImage={currentSlide.uploadedImage ?? undefined}
                backgroundImage={currentSlide.backgroundImage ?? undefined}
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
                    {card.marketplace?.name ?? 'Не указан'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Шаблон</p>
                  <p className="text-sm text-muted-foreground">
                    {card.template?.name ?? 'Не указан'}
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
                {hasMultipleSlides && (
                  <div>
                    <p className="text-sm font-medium">Количество слайдов</p>
                    <p className="text-sm text-muted-foreground">{slideCount}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Кнопка удаления внизу экрана */}
      <div className="border-t border-gray-200 bg-white py-4 mt-auto sticky bottom-0 z-50">
        <div className="container mx-auto px-4">
          {!showDeleteConfirm ? (
            <div className="flex justify-end">
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white"
              >
                <Trash2 className="h-4 w-4" />
                Удалить карточку товара
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">
                  Вы уверены, что хотите удалить эту карточку?
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Это действие нельзя отменить. Карточка будет удалена безвозвратно.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="border-gray-300"
                >
                  Отмена
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Удаление...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Удалить безвозвратно
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
