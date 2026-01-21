import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/shared/lib/hooks';
import { askAIThunk } from '@/entities/ai/model/ai.thunk';
import { clearResponse } from '@/entities/ai/model/ai.slice';

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Карточка AI</h1>
        <p className="text-gray-600">
          Сгенерируйте картинку с помощью ии для Вашей карточки товара
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Описание товара
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Опишите товар, который хотите создать карточку для. Например: 'Создай карточку для смартфона iPhone 15 с описанием характеристик'"
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
                const value = typeof response === 'string' ? response.trim() : '';
                const isImageUrl =
                  typeof value === 'string' &&
                  !!value &&
                  (value.startsWith('/img/') ||
                    value.includes('/img/') ||
                    value.match(/\.(png|jpg|jpeg|gif|webp)$/i));

                // eslint-disable-next-line no-console
                console.log('AI response value:', value, 'Is image URL:', isImageUrl);

                if (isImageUrl) {
                  return (
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={value}
                        alt="Сгенерированное изображение"
                        className="max-w-full max-h-96 w-auto rounded shadow-md bg-white border border-gray-200"
                        onError={(e) => {
                          // eslint-disable-next-line no-console
                          console.error('Ошибка загрузки изображения по URL:', value);
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <p className="text-xs text-gray-500 break-all">{value}</p>
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

      <div className="mt-6">
        <Button
          variant="outline"
          onClick={() => setLocation('/create-card')}
          className="w-full"
        >
          Перейти к обычному созданию карточки
        </Button>
      </div>
    </div>
  );
}

