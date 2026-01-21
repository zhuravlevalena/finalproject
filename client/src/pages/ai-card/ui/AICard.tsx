import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Sparkles, Loader2, Trash2, Edit } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/shared/lib/hooks';
import { askAIThunk } from '@/entities/ai/model/ai.thunk';
import { clearResponse } from '@/entities/ai/model/ai.slice';
import { deleteImageThunk } from '@/entities/image/model/image.thunk';
import { motion } from 'framer-motion';

export default function AICard(): React.JSX.Element {
  const [, setLocation] = useLocation();
  const dispatch = useAppDispatch();
  const [prompt, setPrompt] = useState('');

  const { response, loading, error } = useAppSelector((state) => state.ai);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      return;
    }

    dispatch(clearResponse());
    const resultAction = await dispatch(askAIThunk(prompt));
    // Логируем ответ для отладки, чтобы видеть, что именно приходит (URL или текст)
    if (askAIThunk.fulfilled.match(resultAction)) {
      // eslint-disable-next-line no-console
      console.log('AI response:', resultAction.payload);
    } else {
      // eslint-disable-next-line no-console
      console.error('AI error:', resultAction.error);
    }
  };

  const handleDelete = async () => {
    if (!response?.image?.id) return;
    
    try {
      await dispatch(deleteImageThunk(response.image.id));
      dispatch(clearResponse());
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Ошибка при удалении изображения:', error);
    }
  };

  const handleEdit = () => {
    if (!response?.image) return;
    
    // Переходим в CreateCard и передаем изображение через URL параметры
    setLocation(`/create-card?imageId=${response.image.id}&imageUrl=${encodeURIComponent(response.image.url)}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Карточка AI</h1>
        <p className="text-gray-600">
          Сгенерируйте картинку с помощью ии для Вашей карточки товара
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Левая боковая панель с картинкой */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-1"
        >
          <Card className="p-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 shadow-xl">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Информация</h3>
              <div className="overflow-hidden rounded-lg shadow-lg">
                <img
                  src="/красивый фон.jpg"
                  alt="Красивый фон"
                  className="w-full h-auto object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-sm text-gray-600">
                Используйте AI для создания уникальных карточек товаров
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Правая основная область с формой и результатом */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-3 flex flex-col gap-6"
        >
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Описание товара
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Опишите товар, для которого хотите сгенерировать картинку"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
                  rows={6}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || loading}
                className="w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Генерация...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Сгенерировать карточку
                  </>
                )}
              </Button>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {response && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
                  <h3 className="text-sm font-medium text-green-800 mb-2">Результат:</h3>
                  {(() => {
                    const imageUrl = response.response || response.image?.url || '';
                    const isImageUrl =
                      typeof imageUrl === 'string' &&
                      !!imageUrl &&
                      (imageUrl.startsWith('/img/') ||
                        imageUrl.includes('/img/') ||
                        imageUrl.match(/\.(png|jpg|jpeg|gif|webp)$/i));

                    // eslint-disable-next-line no-console
                    console.log('AI response imageUrl:', imageUrl, 'Is image URL:', isImageUrl);

                    if (isImageUrl && response.image) {
                      return (
                        <div className="flex flex-col items-center gap-3">
                          <img
                            src={imageUrl}
                            alt="Сгенерированное изображение"
                            className="max-w-full max-h-96 w-auto rounded shadow-md bg-white border border-gray-200"
                            onError={(e) => {
                              // eslint-disable-next-line no-console
                              console.error('Ошибка загрузки изображения по URL:', imageUrl);
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          <div className="flex gap-2 w-full justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleEdit}
                              className="flex items-center gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Редактировать
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleDelete}
                              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Удалить
                            </Button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="text-sm text-green-700 whitespace-pre-wrap break-words">
                        {typeof response === 'string' ? response : JSON.stringify(response)}
                      </div>
                    );
                  })()}
                </div>
              )}

              {loading && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <p className="text-sm text-blue-600">Генерация карточки...</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div className="mt-2">
            <Button
              variant="outline"
              onClick={() => setLocation('/create-card')}
              className="w-full"
            >
              Перейти к обычному созданию карточки
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
