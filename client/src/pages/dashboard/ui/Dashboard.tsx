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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* v0-style header */}
      <header className="border-b border-border/50 bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold tracking-tight">Мои карточки</h1>
              <p className="text-sm text-muted-foreground">AI-карточки для маркетплейсов</p>
            </div>

            <Link href="/create-card">
              <Button className="sm:w-auto w-full">
                <Plus className="mr-2 h-4 w-4" />
                Создать карточку
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* main content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">У вас пока нет карточек</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Создайте первую AI-карточку товара и начните наполнять каталог
            </p>
            <Link href="/create-card">
              <Button>Создать первую карточку</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => {
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
      </main>
    </div>
  );
}

/* ===========================
   CardSlideViewer — БЕЗ ИЗМЕНЕНИЙ
   =========================== */

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

  const renderSlideToImage = async (index: number): Promise<string | null> => {
    const slide = slides[index];

    if (index === 0 && card.generatedImage?.url) {
      return card.generatedImage.url.startsWith('http')
        ? card.generatedImage.url
        : `${window.location.origin}${card.generatedImage.url}`;
    }

    if (!slide?.canvasData?.fabric) return null;

    if (slideImages.has(index)) {
      return slideImages.get(index) || null;
    }

    try {
      const [width, height] = cardSize.split('x').map(Number);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const fabricCanvas = new fabric.Canvas(canvas, {
        width,
        height,
        backgroundColor: '#ffffff',
      });

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

      const dataURL = fabricCanvas.toDataURL({ format: 'png', quality: 1 });
      fabricCanvas.dispose();

      setSlideImages((prev) => {
        const next = new Map(prev);
        next.set(index, dataURL);
        return next;
      });

      return dataURL;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const load = async () => {
      for (let i = 0; i < slideCount; i++) {
        const img = await renderSlideToImage(i);
        if (img) {
          setSlideImages((prev) => {
            const next = new Map(prev);
            next.set(i, img);
            return next;
          });
        }
      }
    };
    void load();
  }, [slideCount, slides, cardSize]);

  const currentImage = slideImages.get(currentSlideIndex) || null;
  const hasMultipleSlides = slideCount > 1;

  return (
    <div className="relative">
      <Link href={`/edit-card/${String(card.id)}`}>
        <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
          {currentImage ? (
            <img
              src={currentImage}
              alt={card.title || 'Карточка товара'}
              className="w-full h-64 object-contain bg-gray-100"
            />
          ) : (
            <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
              <span className="text-muted-foreground">Нет изображения</span>
            </div>
          )}

          <div className="p-4">
            <h3 className="font-semibold text-lg mb-1">{card.title || 'Без названия'}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {card.marketplace?.name || 'Без маркетплейса'}
            </p>

            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {new Date(card.createdAt).toLocaleDateString()}
              </span>
              {currentImage && (
                <a
                  href={currentImage}
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
    </div>
  );
}
