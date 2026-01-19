import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useAppSelector, useAppDispatch } from '@/shared/lib/hooks';
import { fetchMarketplacesThunk } from '@/entities/marketplace/model/marketplace.thunk';
import { fetchTemplatesThunk } from '@/entities/template/model/template.thunk';
import { uploadImageThunk } from '@/entities/image/model/image.thunk';
import { createProductCardThunk } from '@/entities/productcard/model/productcard.thunk';
import { getOrCreateProductProfileThunk } from '@/entities/productprofile/model/productprofile.thunk';

import { Card } from '@/shared/ui/card';
import { Upload, Loader2, Image as ImageIcon, Settings, FileText, X, Plus } from 'lucide-react';
import type { CreateProductCardDto } from '@/entities/productcard/model/productcard.types';
import { CardEditor } from '@/widgets/card-editor/ui/CardEditor';

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

export default function CreateCard(): React.JSX.Element {
  const [, setLocation] = useLocation();
  const dispatch = useAppDispatch();
  const cardEditorRef = useRef<{
    addTextToCanvas?: (text: string, options?: { fontSize?: number; top?: number }) => void;
  } | null>(null);

  const [selectedMarketplace, setSelectedMarketplace] = useState<number | null>(null);
  const [selectedMarketplaceSlug, setSelectedMarketplaceSlug] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImageData, setUploadedImageData] = useState<{ id: number; url: string } | null>(
    null,
  );
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [backgroundImageData, setBackgroundImageData] = useState<{
    id: number;
    url: string;
  } | null>(null);
  const [productType, setProductType] = useState('');

  // Состояния для содержания карточки
  const [productTitle, setProductTitle] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productCharacteristics, setProductCharacteristics] = useState('');

  const [cardSize, setCardSize] = useState<CardSize>('1024x768');
  const [slideCount, setSlideCount] = useState<SlideCount>(1);
  const [activeTab, setActiveTab] = useState<'settings' | 'images' | 'content'>('settings');

  const { marketplaces, loading: marketplacesLoading } = useAppSelector(
    (state) => state.marketplace,
  );
  const { templates, loading: templatesLoading } = useAppSelector((state) => state.template);
  const { uploading: isUploadingImage } = useAppSelector((state) => state.image);
  const { creating: isCreatingCard } = useAppSelector((state) => state.productCard);

  useEffect(() => {
    void dispatch(fetchMarketplacesThunk());
  }, [dispatch]);

  useEffect(() => {
    if (selectedMarketplace) {
      void dispatch(fetchTemplatesThunk(selectedMarketplace));
      setSelectedTemplate(null); // Сбрасываем выбранный шаблон при смене маркетплейса
    } else {
      setSelectedTemplate(null);
    }
  }, [dispatch, selectedMarketplace]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const result = await dispatch(uploadImageThunk(file));
      if (uploadImageThunk.fulfilled.match(result)) {
        setUploadedImageData({ id: result.payload.id, url: result.payload.url });
      }
    }
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackgroundImage(file);
      const result = await dispatch(uploadImageThunk(file));
      if (uploadImageThunk.fulfilled.match(result)) {
        setBackgroundImageData({ id: result.payload.id, url: result.payload.url });
      }
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setUploadedImageData(null);
  };

  const handleRemoveBackground = () => {
    setBackgroundImage(null);
    setBackgroundImageData(null);
  };

  // Функция для добавления текста на canvas
  const handleAddContentToCanvas = () => {
    // Создаем единый текст из всех полей
    const contentParts: string[] = [];

    if (productTitle.trim()) {
      contentParts.push(productTitle.trim());
    }

    if (productDescription.trim()) {
      contentParts.push(`\n${productDescription.trim()}`);
    }

    if (productCharacteristics.trim()) {
      contentParts.push(`\n\nХарактеристики:\n${productCharacteristics.trim()}`);
    }

    if (contentParts.length === 0) {
      // eslint-disable-next-line no-alert
      alert('Заполните хотя бы одно поле для добавления на карточку');
      return;
    }

    const fullContent = contentParts.join('');

    // Добавляем текст на canvas через CardEditor
    // Для этого нужно будет добавить метод в CardEditor или использовать другой подход
    // Пока просто сохраняем в метаданные, а пользователь может добавить текст вручную
    // eslint-disable-next-line no-alert
    alert('Содержание сохранено. Вы можете добавить текст на карточку вручную через редактор.');
  };

  const handleSave = async (
    imageFile: File,
    canvasData?: { fabric?: Record<string, unknown>; meta?: Record<string, unknown> },
  ) => {
    let profileId: number | undefined;
    if (productType) {
      const result = await dispatch(getOrCreateProductProfileThunk(productType));
      if (getOrCreateProductProfileThunk.fulfilled.match(result)) {
        profileId = result.payload.id;
      }
    }

    // Формируем полное содержание карточки
    const cardContent = {
      title: productTitle,
      description: productDescription,
      characteristics: productCharacteristics,
    };

    const cardData: CreateProductCardDto = {
      marketplaceId: selectedMarketplace || undefined,
      templateId: selectedTemplate || undefined,
      productProfileId: profileId,
      imageId: uploadedImageData?.id,
      canvasData: {
        fabric: canvasData?.fabric || null, // Полный Fabric JSON для восстановления
        meta: {
          ...canvasData?.meta,
          cardContent,
          slideCount,
          cardSize,
          backgroundImageId: backgroundImageData?.id,
        },
      },
      status: 'completed',
    };

    // Передаем файл в thunk
    const result = await dispatch(createProductCardThunk({ data: cardData, imageFile }));
    if (createProductCardThunk.fulfilled.match(result)) {
      // Небольшая задержка для обновления списка карточек
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
            <CardEditor
              ref={cardEditorRef}
              onSave={handleSave}
              initialImage={
                uploadedImageData
                  ? { id: uploadedImageData.id, url: uploadedImageData.url }
                  : undefined
              }
              backgroundImage={
                backgroundImageData
                  ? { id: backgroundImageData.id, url: backgroundImageData.url }
                  : undefined
              }
              cardSize={cardSize}
              slideCount={slideCount}
            />
          </Card>
        </div>

        {/* Боковая панель настроек - 1 колонка */}
        <div className="space-y-4">
          <Card className="p-4">
            {/* Табы - исправлено выравнивание */}
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
              <button
                onClick={() => setActiveTab('content')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors relative whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'content' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className="h-4 w-4 flex-shrink-0" />
                <span>Содержание</span>
                {activeTab === 'content' && (
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

                      // Находим slug выбранного маркетплейса
                      const marketplace = marketplaces?.find((mp) => mp.id === marketplaceId);
                      const slug = marketplace?.slug || null;
                      setSelectedMarketplaceSlug(slug);

                      // Автоматически устанавливаем первый доступный размер для выбранного маркетплейса
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

                {/* Показываем селект размера только после выбора маркетплейса */}
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
                    onChange={(e) => setSlideCount(Number(e.target.value) as SlideCount)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {[1, 2, 3, 4, 5].map((count) => (
                      <option key={count} value={count}>
                        {count} {count === 1 ? 'слайд' : count < 5 ? 'слайда' : 'слайдов'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'images' && (
              <div className="space-y-6">
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
                    {uploadedImageData && (
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
                          src={uploadedImageData.url}
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
                    {backgroundImageData && (
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
                          src={backgroundImageData.url}
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

            {activeTab === 'content' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Название товара
                  </label>
                  <input
                    type="text"
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                    placeholder="Введите название товара"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Описание товара
                  </label>
                  <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Введите описание товара..."
                    rows={4}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">{productDescription.length} символов</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Характеристики товара
                  </label>
                  <textarea
                    value={productCharacteristics}
                    onChange={(e) => setProductCharacteristics(e.target.value)}
                    placeholder="Введите характеристики товара (каждая с новой строки):&#10;• Характеристика 1&#10;• Характеристика 2&#10;• Характеристика 3"
                    rows={6}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {productCharacteristics.length} символов
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <button
                    onClick={handleAddContentToCanvas}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Добавить на карточку</span>
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Содержание будет сохранено в метаданных карточки
                  </p>
                </div>

                {(productTitle || productDescription || productCharacteristics) && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setProductTitle('');
                        setProductDescription('');
                        setProductCharacteristics('');
                      }}
                      className="w-full text-sm text-red-600 hover:text-red-800 transition-colors py-2"
                    >
                      Очистить все поля
                    </button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
