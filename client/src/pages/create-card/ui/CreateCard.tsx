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
import { Button } from '@/shared/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import type { CreateProductCardDto } from '@/entities/productcard/model/productcard.types';

export default function CreateCard(): React.JSX.Element {
  const [, setLocation] = useLocation();
  const dispatch = useAppDispatch();

  const [selectedMarketplace, setSelectedMarketplace] = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImageData, setUploadedImageData] = useState<{ id: number; url: string } | null>(null);
  const [productType, setProductType] = useState('');
  const [canvasData, setCanvasData] = useState<Record<string, unknown> | null>(null);

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

  const handleSave = async (canvasData: Record<string, unknown>) => {
    setCanvasData(canvasData);

    // Создаем или получаем профиль товара
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
      canvasData,
      status: 'draft',
    };

    const result = await dispatch(createProductCardThunk(cardData));
    if (createProductCardThunk.fulfilled.match(result)) {
      setLocation('/');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Создать карточку товара</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Редактор карточки</h2>
            <CardEditor
              onSave={handleSave}
              initialImage={uploadedImageData ? { id: uploadedImageData.id, url: uploadedImageData.url, userId: 0, type: 'uploaded' as const, createdAt: '', updatedAt: '' } : undefined}
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Настройки</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Маркетплейс</label>
                <select
                  value={selectedMarketplace || ''}
                  onChange={(e) => setSelectedMarketplace(e.target.value ? Number(e.target.value) : null)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Выберите маркетплейс</option>
                  {marketplaces?.map((mp) => (
                    <option key={mp.id} value={mp.id}>
                      {mp.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedMarketplace && (
                <div>
                  <label className="block text-sm font-medium mb-2">Шаблон</label>
                  {templatesLoading ? (
                    <div className="text-sm text-muted-foreground">Загрузка шаблонов...</div>
                  ) : (
                    <select
                      value={selectedTemplate || ''}
                      onChange={(e) => setSelectedTemplate(e.target.value ? Number(e.target.value) : null)}
                      className="w-full p-2 border rounded"
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
                <label className="block text-sm font-medium mb-2">Тип товара</label>
                <input
                  type="text"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  placeholder="Например: одежда, электроника..."
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Изображения</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Загрузить фото</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded cursor-pointer hover:bg-primary/90"
                  >
                    <Upload className="h-4 w-4" />
                    Загрузить
                  </label>
                  {isUploadingImage && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </div>
                {uploadedImageData && (
                  <p className="text-sm text-green-600 mt-2">Изображение загружено</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
