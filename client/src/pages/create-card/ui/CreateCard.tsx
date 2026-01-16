import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAppSelector, useAppDispatch } from '@/shared/lib/hooks';
import { fetchMarketplacesThunk } from '@/entities/marketplace/model/marketplace.thunk';
import { fetchTemplatesThunk } from '@/entities/template/model/template.thunk';
import { uploadImageThunk } from '@/entities/image/model/image.thunk';
import { createProductCardThunk } from '@/entities/productcard/model/productcard.thunk';
import { getOrCreateProductProfileThunk } from '@/entities/productprofile/model/productprofile.thunk';
import { CardEditor } from '@/widgets/card-editor/ui/CardEditor';
import { Card } from '@/shared/ui/card';
import { Upload, Loader2, Image as ImageIcon, Settings, FileText, X } from 'lucide-react';
import type { CreateProductCardDto } from '@/entities/productcard/model/productcard.types';

type CardSize = '800x600' | '1024x768' | '1200x900' | '1920x1080';
type SlideCount = 1 | 2 | 3 | 4 | 5;

export default function CreateCard(): React.JSX.Element {
  const [, setLocation] = useLocation();
  const dispatch = useAppDispatch();

  const [selectedMarketplace, setSelectedMarketplace] = useState<number | null>(null);
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
  const [cardContent, setCardContent] = useState('');
  const [cardSize, setCardSize] = useState<CardSize>('1024x768');
  const [slideCount, setSlideCount] = useState<SlideCount>(1);
  const [activeTab, setActiveTab] = useState<'settings' | 'images' | 'content'>('settings');

  const { marketplaces, loading: marketplacesLoading } = useAppSelector((state) => state.marketplace);
  const { templates, loading: templatesLoading } = useAppSelector((state) => state.template);
  const { uploading: isUploadingImage } = useAppSelector((state) => state.image);
  const { creating: isCreatingCard } = useAppSelector((state) => state.productCard);

  useEffect(() => {
    dispatch(fetchMarketplacesThunk());
  }, [dispatch]);

  useEffect(() => {
    if (selectedMarketplace) {
      dispatch(fetchTemplatesThunk(selectedMarketplace));
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

  const handleSave = async (canvasData: Record<string, unknown>) => {
    let profileId: number | undefined;
    if (productType) {
      const result = await dispatch(getOrCreateProductProfileThunk(productType));
      if (getOrCreateProductProfileThunk.fulfilled.match(result)) {
        profileId = result.payload.id;
      }
    }

    const cardData: CreateProductCardDto = {
      marketplaceId: selectedMarketplace || undefined,
      templateId: selectedTemplate || undefined,
      productProfileId: profileId,
      imageId: uploadedImageData?.id,
      canvasData: {
        ...canvasData,
        cardContent,
        slideCount,
        cardSize,
        backgroundImageId: backgroundImageData?.id,
      },
      status: 'draft',
    };

    const result = await dispatch(createProductCardThunk(cardData));
    if (createProductCardThunk.fulfilled.match(result)) {
      setLocation('/');
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
              onSave={handleSave}
              initialImage={uploadedImageData ? { id: uploadedImageData.id, url: uploadedImageData.url } : undefined}
              backgroundImage={backgroundImageData ? { id: backgroundImageData.id, url: backgroundImageData.url } : undefined}
              cardSize={cardSize}
              slideCount={slideCount}
            />
          </Card>
        </div>

        {/* Боковая панель настроек - 1 колонка */}
        <div className="space-y-4">
          <Card className="p-4">
            {/* Табы */}
            <div className="flex gap-1 mb-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors relative ${
                  activeTab === 'settings' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Настройки</span>
                {activeTab === 'settings' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('images')}
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors relative ${
                  activeTab === 'images' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Изображения</span>
                {activeTab === 'images' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors relative ${
                  activeTab === 'content' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Содержание</span>
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
                    onChange={(e) =>
                      setSelectedMarketplace(e.target.value ? Number(e.target.value) : null)
                    }
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

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Размер карточки
                  </label>
                  <select
                    value={cardSize}
                    onChange={(e) => setCardSize(e.target.value as CardSize)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {sizeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </option>
                    ))}
                  </select>
                </div>

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
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Содержание карточки
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Введите описание, характеристики и особенности товара
                </p>
                <textarea
                  value={cardContent}
                  onChange={(e) => setCardContent(e.target.value)}
                  placeholder="Например:&#10;&#10;• Характеристика 1&#10;• Характеристика 2&#10;• Характеристика 3&#10;&#10;Особенности товара..."
                  rows={14}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">{cardContent.length} символов</p>
                  {cardContent.length > 0 && (
                    <button
                      onClick={() => setCardContent('')}
                      className="text-xs text-red-600 hover:text-red-800 transition-colors"
                    >
                      Очистить
                    </button>
  
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
