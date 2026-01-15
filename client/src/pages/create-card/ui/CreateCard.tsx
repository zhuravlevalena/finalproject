import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { marketplaceService } from '@/entities/marketplace/api/marketplace.service';
import { templateService } from '@/entities/template/api/template.service';
import { imageService } from '@/entities/image/api/image.service';
import { productCardService } from '@/entities/productcard/api/productcard.service';
import { productProfileService } from '@/entities/productprofile/api/productprofile.service';
import { CardEditor } from '@/widgets/card-editor/ui/CardEditor';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Upload, Loader2, Sparkles } from 'lucide-react';

export default function CreateCard(): React.JSX.Element {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [selectedMarketplace, setSelectedMarketplace] = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImageData, setUploadedImageData] = useState<{ id: number; url: string } | null>(null);
  const [productType, setProductType] = useState('');
  const [canvasData, setCanvasData] = useState<Record<string, unknown> | null>(null);
  const [generatePrompt, setGeneratePrompt] = useState('');

  const { data: marketplaces } = useQuery({
    queryKey: ['marketplaces'],
    queryFn: () => marketplaceService.getAll(),
  });

  const { data: templates } = useQuery({
    queryKey: ['templates', selectedMarketplace],
    queryFn: () => templateService.getAll(selectedMarketplace || undefined),
    enabled: !!selectedMarketplace,
  });

  const uploadImageMutation = useMutation({
    mutationFn: (file: File) => imageService.upload(file),
    onSuccess: (data) => {
      setUploadedImageData({ id: data.id, url: data.url });
    },
  });

  const generateImageMutation = useMutation({
    mutationFn: (prompt: string) => imageService.generate(prompt),
    onSuccess: (data) => {
      setUploadedImageData({ id: data.id, url: data.url });
      setGeneratePrompt('');
    },
  });

  const createCardMutation = useMutation({
    mutationFn: (data: Parameters<typeof productCardService.create>[0]) =>
      productCardService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productCards'] });
      setLocation('/');
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      uploadImageMutation.mutate(file);
    }
  };

  const handleSave = async (canvasData: Record<string, unknown>) => {
    setCanvasData(canvasData);

    // Создаем или получаем профиль товара
    let profileId: number | undefined;
    if (productType) {
      const profile = await productProfileService.getOrCreate(productType);
      profileId = profile.id;
    }

    createCardMutation.mutate({
      marketplaceId: selectedMarketplace || undefined,
      templateId: selectedTemplate || undefined,
      productProfileId: profileId,
      imageId: uploadedImageData?.id,
      canvasData,
      status: 'draft',
    });
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
              initialImage={uploadedImageData ? { 
                id: uploadedImageData.id, 
                url: uploadedImageData.url, 
                userId: 0, 
                type: 'uploaded' as const, 
                createdAt: '', 
                updatedAt: '' 
              } : undefined}
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

              {selectedMarketplace && templates && (
                <div>
                  <label className="block text-sm font-medium mb-2">Шаблон</label>
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
                  {uploadImageMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </div>
                {uploadedImageData && (
                  <p className="text-sm text-green-600 mt-2">Изображение загружено</p>
                )}
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium mb-2">Сгенерировать изображение AI</label>
                <div className="space-y-2">
                  <textarea
                    value={generatePrompt}
                    onChange={(e) => setGeneratePrompt(e.target.value)}
                    placeholder="Опишите изображение, которое хотите сгенерировать..."
                    className="w-full p-2 border rounded min-h-[80px] resize-none"
                    rows={3}
                  />
                  <Button
                    onClick={() => {
                      if (generatePrompt.trim()) {
                        generateImageMutation.mutate(generatePrompt.trim());
                      }
                    }}
                    disabled={!generatePrompt.trim() || generateImageMutation.isPending}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    {generateImageMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Генерация...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Сгенерировать
                      </>
                    )}
                  </Button>
                  {generateImageMutation.isError && (
                    <p className="text-sm text-red-600">
                      Ошибка: {generateImageMutation.error instanceof Error ? generateImageMutation.error.message : 'Не удалось сгенерировать изображение'}
                    </p>
                  )}
                  {generateImageMutation.isSuccess && uploadedImageData && (
                    <p className="text-sm text-green-600">Изображение успешно сгенерировано!</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
