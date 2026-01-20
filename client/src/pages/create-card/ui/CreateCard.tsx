import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
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
  Sparkles,
  Palette,
  Layers,
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

  const { marketplaces } = useAppSelector((state) => state.marketplace);
  const { templates, loading: templatesLoading } = useAppSelector((state) => state.template);
  const { uploading: isUploadingImage } = useAppSelector((state) => state.image);

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
    saveCurrentSlideCanvas();
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
      imageId: updatedSlides[0]?.uploadedImage?.id,
      canvasData: {
        fabric: null,
        meta: {
          slideCount,
          cardSize,
          slides: slidesData,
        },
      },
      status: 'completed',
    };

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
      {/* Заголовок с анимацией */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-3">
          <motion.img
            src="/111.png"
            alt="Cardify"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-16 w-16 md:h-20 md:w-20 object-contain"
          />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Создать карточку товара
          </h1>
        </div>
        <p className="text-gray-600 text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Создайте привлекательную карточку товара с помощью нашего редактора
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Редактор */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-3"
        >
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            {/* Переключатель слайдов */}
            {slideCount > 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200/50 shadow-sm"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSlideChange(Math.max(0, currentSlideIndex - 1))}
                  disabled={currentSlideIndex === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm font-medium"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="text-sm">Предыдущий</span>
                </motion.button>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                    Слайд {currentSlideIndex + 1} из {slideCount}
                  </span>
                  <div className="flex gap-2">
                    {slides.map((_, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleSlideChange(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          index === currentSlideIndex
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg scale-125'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        title={`Слайд ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSlideChange(Math.min(slideCount - 1, currentSlideIndex + 1))}
                  disabled={currentSlideIndex === slideCount - 1}
                  className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-blue-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm font-medium"
                >
                  <span className="text-sm">Следующий</span>
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </motion.div>
            )}

            <CardEditor
              key={`slide-${currentSlideIndex}-${cardSize}`}
              ref={cardEditorRef}
              onSave={handleSave}
              initialImage={currentSlide.uploadedImage || undefined}
              backgroundImage={currentSlide.backgroundImage || undefined}
              cardSize={cardSize}
              slideCount={slideCount}
              card={currentSlide.canvasData ? { canvasData: currentSlide.canvasData } : undefined}
            />
          </Card>
        </motion.div>

        {/* Боковая панель */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <Card className="p-5 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 shadow-xl">
            {/* Табы */}
            <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('settings')}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all rounded-lg relative flex-1 whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
              >
                <Settings className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Настройки</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('images')}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all rounded-lg relative flex-1 whitespace-nowrap ${
                  activeTab === 'images'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Изображения</span>
              </motion.button>
            </div>

            {/* Контент табов */}
            <AnimatePresence mode="wait">
              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm font-semibold mb-2.5 text-gray-700 flex items-center gap-2">
                      <Layers className="h-4 w-4 text-blue-500" />
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
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm hover:shadow-md"
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
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label className="block text-sm font-semibold mb-2.5 text-gray-700 flex items-center gap-2">
                        <Palette className="h-4 w-4 text-purple-500" />
                        Шаблон
                      </label>
                      {templatesLoading ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500 p-3">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Загрузка шаблонов...
                        </div>
                      ) : (
                        <select
                          value={selectedTemplate || ''}
                          onChange={(e) =>
                            setSelectedTemplate(e.target.value ? Number(e.target.value) : null)
                          }
                          className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md"
                        >
                          <option value="">Выберите шаблон</option>
                          {templates.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold mb-2.5 text-gray-700">
                      Тип товара
                    </label>
                    <input
                      type="text"
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                      placeholder="Например: одежда, электроника..."
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm hover:shadow-md"
                    />
                  </div>

                  {selectedMarketplace && selectedMarketplaceSlug && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label className="block text-sm font-semibold mb-2.5 text-gray-700">
                        Размер карточки
                      </label>
                      <select
                        value={cardSize}
                        onChange={(e) => setCardSize(e.target.value as CardSize)}
                        className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm hover:shadow-md"
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
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        Размеры соответствуют требованиям маркетплейса
                      </p>
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold mb-2.5 text-gray-700">
                      Количество слайдов
                    </label>
                    <select
                      value={slideCount}
                      onChange={(e) => {
                        saveCurrentSlideCanvas();
                        const newCount = Number(e.target.value) as SlideCount;
                        setSlideCount(newCount);
                      }}
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm hover:shadow-md"
                    >
                      {[1, 2, 3, 4, 5].map((count) => (
                        <option key={count} value={count}>
                          {count} {count === 1 ? 'слайд' : count < 5 ? 'слайда' : 'слайдов'}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                      Создайте несколько слайдов для одной карточки
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'images' && (
                <motion.div
                  key="images"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50">
                    <p className="text-sm text-blue-700 font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Изображения для слайда {currentSlideIndex + 1}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2.5 text-gray-700">
                      Основное изображение
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Изображение будет добавлено на canvas как объект
                    </p>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <motion.label
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        htmlFor="image-upload"
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl cursor-pointer hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl font-semibold"
                      >
                        <Upload className="h-4 w-4" />
                        Загрузить изображение
                      </motion.label>
                      {isUploadingImage && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 py-2">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          Загрузка...
                        </div>
                      )}
                      {currentSlide.uploadedImage && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 relative shadow-sm"
                        >
                          <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                            title="Удалить изображение"
                          >
                            <X className="h-3.5 w-3.5 text-gray-600" />
                          </motion.button>
                          <p className="text-sm text-green-700 font-semibold mb-2 flex items-center gap-1">
                            <span className="text-green-500">✓</span> Изображение загружено
                          </p>
                          <img
                            src={currentSlide.uploadedImage.url}
                            alt="Preview"
                            className="w-full h-48 object-contain rounded-lg shadow-sm"
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2.5 text-gray-700">
                      Фон карточки
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Фон будет установлен как фоновое изображение
                    </p>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBackgroundUpload}
                        className="hidden"
                        id="background-upload"
                      />
                      <motion.label
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        htmlFor="background-upload"
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl cursor-pointer hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl font-semibold"
                      >
                        <ImageIcon className="h-4 w-4" />
                        Выбрать фон
                      </motion.label>
                      {isUploadingImage && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 py-2">
                          <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                          Загрузка...
                        </div>
                      )}
                      {currentSlide.backgroundImage && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-3 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 relative shadow-sm"
                        >
                          <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleRemoveBackground}
                            className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                            title="Удалить фон"
                          >
                            <X className="h-3.5 w-3.5 text-gray-600" />
                          </motion.button>
                          <p className="text-sm text-blue-700 font-semibold mb-2 flex items-center gap-1">
                            <span className="text-blue-500">✓</span> Фон загружен
                          </p>
                          <img
                            src={currentSlide.backgroundImage.url}
                            alt="Background preview"
                            className="w-full h-48 object-contain rounded-lg shadow-sm"
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
