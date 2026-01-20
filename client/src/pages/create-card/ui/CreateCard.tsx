import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useAppSelector, useAppDispatch } from '@/shared/lib/hooks';
import { fetchMarketplacesThunk } from '@/entities/marketplace/model/marketplace.thunk';
import { fetchTemplatesThunk } from '@/entities/template/model/template.thunk';
import { uploadImageThunk } from '@/entities/image/model/image.thunk';
import { createProductCardThunk } from '@/entities/productcard/model/productcard.thunk';
import { getOrCreateProductProfileThunk } from '@/entities/productprofile/model/productprofile.thunk';

import { Card } from '@/shared/ui/card';
import {
  Upload,
  Loader2,
  Image as ImageIcon,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import type { CreateProductCardDto } from '@/entities/productcard/model/productcard.types';
import { CardEditor, type CardEditorRef } from '@/widgets/card-editor/ui/CardEditor';

type CardSize = '800x600' | '1024x768' | '1200x900' | '1920x1080';
type SlideCount = 1 | 2 | 3 | 4 | 5;

// Маппинг размеров карточек для каждого маркетплейса
const marketplaceCardSizes: Record<string, CardSize[]> = {
  wildberries: ['800x600', '1024x768', '1200x900'],
  ozon: ['1024x768', '1200x900', '1920x1080'],
  'yandex-market': ['800x600', '1024x768', '1200x900', '1920x1080'],
};

// Функция для получения доступных размеров по маркетплейсу
const getAvailableSizes = (marketplaceSlug: string | null): CardSize[] => {
  if (!marketplaceSlug) return [];
  return marketplaceCardSizes[marketplaceSlug] || ['1024x768'];
};

// Тип для данных слайда
type SlideData = {
  canvasData?: { fabric?: Record<string, unknown>; meta?: Record<string, unknown> };
  uploadedImage?: { id: number; url: string } | null;
  backgroundImage?: { id: number; url: string } | null;
};

export default function CreateCard(): React.JSX.Element {
  const [, setLocation] = useLocation();
  const dispatch = useAppDispatch();
  const cardEditorRef = useRef<CardEditorRef | null>(null);

  const [selectedMarketplace, setSelectedMarketplace] = useState<number | null>(null);
  const [selectedMarketplaceSlug, setSelectedMarketplaceSlug] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [productType, setProductType] = useState('');
  const [cardSize, setCardSize] = useState<CardSize>('1024x768');
  const [slideCount, setSlideCount] = useState<SlideCount>(1);
  const [activeTab, setActiveTab] = useState<'settings' | 'images'>('settings');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Массив данных для каждого слайда
  const [slides, setSlides] = useState<SlideData[]>([
    {
      canvasData: undefined,
      uploadedImage: null,
      backgroundImage: null,
    },
  ]);

  const { marketplaces, loading: marketplacesLoading } = useAppSelector(
    (state) => state.marketplace,
  );
  const { templates, loading: templatesLoading } = useAppSelector((state) => state.template);
  const { uploading: isUploadingImage } = useAppSelector((state) => state.image);
  const { creating: isCreatingCard } = useAppSelector((state) => state.productCard);

  // Обновляем массив слайдов при изменении slideCount
  useEffect(() => {
    setSlides((prev) => {
      const newSlides = [...prev];
      while (newSlides.length < slideCount) {
        newSlides.push({
          canvasData: undefined,
          uploadedImage: null,
          backgroundImage: null,
        });
      }
      while (newSlides.length > slideCount) {
        newSlides.pop();
      }
      return newSlides;
    });
    // Если текущий слайд больше количества слайдов, переключаемся на последний
    if (currentSlideIndex >= slideCount) {
      setCurrentSlideIndex(Math.max(0, slideCount - 1));
    }
  }, [slideCount]);

  useEffect(() => {
    void dispatch(fetchMarketplacesThunk());
  }, [dispatch]);

  useEffect(() => {
    if (selectedMarketplace) {
      void dispatch(fetchTemplatesThunk(selectedMarketplace));
      setSelectedTemplate(null);
    } else {
      setSelectedTemplate(null);
    }
  }, [dispatch, selectedMarketplace]);

  // Функция для сохранения текущего состояния canvas перед переключением слайда
  const saveCurrentSlideCanvas = () => {
    if (!cardEditorRef.current?.getCanvasData) return;

    const canvasData = cardEditorRef.current.getCanvasData();
    if (canvasData) {
      setSlides((prev) => {
        const newSlides = [...prev];
        newSlides[currentSlideIndex] = {
          ...newSlides[currentSlideIndex],
          canvasData: {
            fabric: canvasData.fabric || null,
            meta: canvasData.meta || {},
          },
        };
        return newSlides;
      });
    }
  };

  // Обработчик переключения слайда
  const handleSlideChange = (newIndex: number) => {
    if (newIndex === currentSlideIndex) return;

    // Сохраняем текущий слайд перед переключением
    saveCurrentSlideCanvas();

    // Переключаемся на новый слайд
    setCurrentSlideIndex(newIndex);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const result = await dispatch(uploadImageThunk(file));
      if (uploadImageThunk.fulfilled.match(result)) {
        const imageData = { id: result.payload.id, url: result.payload.url };
        setSlides((prev) => {
          const newSlides = [...prev];
          newSlides[currentSlideIndex] = {
            ...newSlides[currentSlideIndex],
            uploadedImage: imageData,
          };
          return newSlides;
        });
      }
    }
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const result = await dispatch(uploadImageThunk(file));
      if (uploadImageThunk.fulfilled.match(result)) {
        const imageData = { id: result.payload.id, url: result.payload.url };
        setSlides((prev) => {
          const newSlides = [...prev];
          newSlides[currentSlideIndex] = {
            ...newSlides[currentSlideIndex],
            backgroundImage: imageData,
          };
          return newSlides;
        });
      }
    }
  };

  const handleRemoveImage = () => {
    setSlides((prev) => {
      const newSlides = [...prev];
      newSlides[currentSlideIndex] = {
        ...newSlides[currentSlideIndex],
        uploadedImage: null,
      };
      return newSlides;
    });
  };

  const handleRemoveBackground = () => {
    setSlides((prev) => {
      const newSlides = [...prev];
      newSlides[currentSlideIndex] = {
        ...newSlides[currentSlideIndex],
        backgroundImage: null,
      };
      return newSlides;
    });
  };

  const handleSave = async (
    imageFile: File,
    canvasData?: { fabric?: Record<string, unknown>; meta?: Record<string, unknown> },
  ) => {
    // Сохраняем данные текущего слайда перед сохранением
    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex] = {
      ...updatedSlides[currentSlideIndex],
      canvasData: canvasData || updatedSlides[currentSlideIndex].canvasData,
    };
    setSlides(updatedSlides);

    let profileId: number | undefined;
    if (productType) {
      const result = await dispatch(getOrCreateProductProfileThunk(productType));
      if (getOrCreateProductProfileThunk.fulfilled.match(result)) {
        profileId = result.payload.id;
      }
    }

    // Создаем массив всех слайдов с их данными
    const slidesData = updatedSlides.map((slide, index) => ({
      canvasData: slide.canvasData || { fabric: null, meta: {} },
      imageId: slide.uploadedImage?.id,
      backgroundImageId: slide.backgroundImage?.id,
      slideIndex: index,
    }));

    const cardData: CreateProductCardDto = {
      marketplaceId: selectedMarketplace || undefined,
      templateId: selectedTemplate || undefined,
      productProfileId: profileId,
      imageId: updatedSlides[0]?.uploadedImage?.id, // Основное изображение - первый слайд
      canvasData: {
        fabric: null, // Будет храниться в slides
        meta: {
          slideCount,
          cardSize,
          slides: slidesData, // Массив всех слайдов
        },
      },
      status: 'completed',
    };

    // Сохраняем первый слайд как основное изображение
    const result = await dispatch(createProductCardThunk({ data: cardData, imageFile }));
    if (createProductCardThunk.fulfilled.match(result)) {
      setTimeout(() => {
        setLocation('/dashboard');
      }, 100);
    }
  };

  const sizeOptions: { value: CardSize; label: string; description: string }[] = [
    { value: '800x600', label: '800 × 600', description: 'Стандартный' },
    { value: '1024x768', label: '1024 × 768', description: 'Рекомендуемый' },
    { value: '1200x900', label: '1200 × 900', description: 'Широкий' },
    { value: '1920x1080', label: '1920 × 1080', description: 'Full HD' },
  ];

  const currentSlide = slides[currentSlideIndex] || slides[0];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Создать карточку товара</h1>
        <p className="text-gray-600">
          Создайте привлекательную карточку товара с помощью нашего редактора
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Редактор - занимает 3 колонки */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            {/* Переключатель слайдов */}
            {slideCount > 1 && (
              <div className="mb-4 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <button
                  onClick={() => handleSlideChange(Math.max(0, currentSlideIndex - 1))}
                  disabled={currentSlideIndex === 0}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="text-sm">Предыдущий</span>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Слайд {currentSlideIndex + 1} из {slideCount}
                  </span>
                  <div className="flex gap-1">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handleSlideChange(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentSlideIndex
                            ? 'bg-blue-600'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        title={`Слайд ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleSlideChange(Math.min(slideCount - 1, currentSlideIndex + 1))}
                  disabled={currentSlideIndex === slideCount - 1}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="text-sm">Следующий</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* CardEditor с key для пересоздания при смене слайда */}
            <CardEditor
              key={`slide-${currentSlideIndex}-${cardSize}`} // Пересоздаем при смене слайда или размера
              ref={cardEditorRef}
              onSave={handleSave}
              initialImage={currentSlide.uploadedImage || undefined}
              backgroundImage={currentSlide.backgroundImage || undefined}
              cardSize={cardSize}
              slideCount={slideCount}
              card={currentSlide.canvasData ? { canvasData: currentSlide.canvasData } : undefined}
            />
          </Card>
        </div>

        {/* Боковая панель настроек - 1 колонка */}
        <div className="space-y-4">
          <Card className="p-4">
            {/* Табы */}
            <div className="flex gap-1 mb-4 border-b border-gray-200 overflow-x-auto">
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'settings' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Settings className="h-4 w-4 flex-shrink-0" />
                <span>Настройки</span>
                {activeTab === 'settings' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('images')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'images' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ImageIcon className="h-4 w-4 flex-shrink-0" />
                <span>Изображения</span>
                {activeTab === 'images' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            </div>

            {/* Контент табов */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Маркетплейс
                  </label>
                  <select
                    value={selectedMarketplace || ''}
                    onChange={(e) => {
                      const marketplaceId = e.target.value ? Number(e.target.value) : null;
                      setSelectedMarketplace(marketplaceId);

                      const marketplace = marketplaces?.find((mp) => mp.id === marketplaceId);
                      const slug = marketplace?.slug || null;
                      setSelectedMarketplaceSlug(slug);

                      if (slug) {
                        const availableSizes = getAvailableSizes(slug);
                        if (availableSizes.length > 0) {
                          setCardSize(availableSizes[0]);
                        }
                      }
                    }}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Выберите маркетплейс</option>
                    {marketplaces?.map((mp) => (
                      <option key={mp.id} value={mp.id}>
                        {mp.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedMarketplace && templates && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Шаблон</label>
                    {templatesLoading ? (
                      <div className="text-sm text-muted-foreground">Загрузка шаблонов...</div>
                    ) : (
                      <select
                        value={selectedTemplate || ''}
                        onChange={(e) =>
                          setSelectedTemplate(e.target.value ? Number(e.target.value) : null)
                        }
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">Выберите шаблон</option>
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Тип товара</label>
                  <input
                    type="text"
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    placeholder="Например: одежда, электроника..."
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                {selectedMarketplace && selectedMarketplaceSlug && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Размер карточки
                    </label>
                    <select
                      value={cardSize}
                      onChange={(e) => setCardSize(e.target.value as CardSize)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      {getAvailableSizes(selectedMarketplaceSlug).map((size) => {
                        const option = sizeOptions.find((opt) => opt.value === size);
                        return option ? (
                          <option key={option.value} value={option.value}>
                            {option.label} - {option.description}
                          </option>
                        ) : null;
                      })}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Размеры соответствуют требованиям выбранного маркетплейса
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Количество слайдов
                  </label>
                  <select
                    value={slideCount}
                    onChange={(e) => {
                      // Сохраняем текущий слайд перед изменением количества
                      saveCurrentSlideCanvas();
                      const newCount = Number(e.target.value) as SlideCount;
                      setSlideCount(newCount);
                    }}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {[1, 2, 3, 4, 5].map((count) => (
                      <option key={count} value={count}>
                        {count} {count === 1 ? 'слайд' : count < 5 ? 'слайда' : 'слайдов'}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Вы можете создать несколько слайдов для одной карточки
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'images' && (
              <div className="space-y-6">
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 font-medium">
                    Изображения для слайда {currentSlideIndex + 1}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Основное изображение
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Изображение будет добавлено на canvas как объект, который можно перемещать и
                    редактировать
                  </p>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 transition-colors shadow-sm"
                    >
                      <Upload className="h-4 w-4" />
                      Загрузить изображение
                    </label>
                    {isUploadingImage && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Загрузка...
                      </div>
                    )}
                    {currentSlide.uploadedImage && (
                      <div className="mt-3 p-4 bg-green-50 rounded-lg border border-green-200 relative">
                        <button
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors"
                          title="Удалить изображение"
                        >
                          <X className="h-3 w-3 text-gray-600" />
                        </button>
                        <p className="text-sm text-green-700 font-medium mb-2">
                          ✓ Изображение загружено
                        </p>
                        <img
                          src={currentSlide.uploadedImage.url}
                          alt="Preview"
                          className="w-full h-48 object-contain rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Фон карточки
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Фон будет установлен как фоновое изображение. Поверх него можно добавлять текст
                    и другие элементы
                  </p>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBackgroundUpload}
                      className="hidden"
                      id="background-upload"
                    />
                    <label
                      htmlFor="background-upload"
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors shadow-sm"
                    >
                      <ImageIcon className="h-4 w-4" />
                      Выбрать фон
                    </label>
                    {isUploadingImage && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 py-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Загрузка...
                      </div>
                    )}
                    {currentSlide.backgroundImage && (
                      <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200 relative">
                        <button
                          onClick={handleRemoveBackground}
                          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors"
                          title="Удалить фон"
                        >
                          <X className="h-3 w-3 text-gray-600" />
                        </button>
                        <p className="text-sm text-blue-700 font-medium mb-2">✓ Фон загружен</p>
                        <img
                          src={currentSlide.backgroundImage.url}
                          alt="Background preview"
                          className="w-full h-48 object-contain rounded"
                        />
                        <p className="text-xs text-blue-600 mt-2">
                          Фон автоматически установлен на canvas
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
