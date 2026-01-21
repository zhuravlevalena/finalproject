import { useEffect, useMemo, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useAppDispatch, useAppSelector } from '@/shared/lib/hooks';
import { CardEditor } from '@/widgets/card-editor/ui/CardEditor';
import { layoutService } from '@/entities/layout/api/layout.service';
import { productCardService } from '@/entities/productcard/api/productcard.service';
import { fetchMarketplacesThunk } from '@/entities/marketplace/model/marketplace.thunk';
import type { LayoutSchema } from '@/entities/layout/model/layout.schemas';

// Поддерживаемые размеры canvas (формат width x height) для каждого маркетплейса
type CardSize = '900x1200' | '1200x1600' | '1500x2000' | '1200x1200';

const marketplaceCardSizes: Record<string, CardSize[]> = {
  // Вертикальное 3:4, не менее 700x900
  wildberries: ['900x1200', '1200x1600', '1500x2000'],
  // Ozon: вертикальное 3:4, от 200x200 до 4320x7680 — используем удобные пресеты
  ozon: ['900x1200', '1200x1600', '1500x2000'],
  // Яндекс.Маркет: 3:4 или 1:1
  'yandex-market': ['900x1200', '1200x1600', '1200x1200'],
};

const getAvailableSizes = (marketplaceSlug: string | null): CardSize[] => {
  if (!marketplaceSlug) return ['900x1200'];
  return marketplaceCardSizes[marketplaceSlug] || ['900x1200'];
};

const MARKETPLACE_RULES: Record<
  string,
  {
    title: string;
    general: string[];
    infographicAllowed?: string[];
    infographicForbidden: string[];
  }
> = {
  'yandex-market': {
    title: 'Яндекс.Маркет',
    general: [
      'Форматы: JPG, PNG, WEBP',
      'Соотношение сторон: 3:4 или 1:1',
      'Разрешение: не менее 300×300 пикселей',
      'Размер файла: не более 10 МБ',
    ],
    infographicAllowed: [
      'Инфографика используется в основном для цифровых товаров, которые невозможно сфотографировать.',
    ],
    infographicForbidden: [
      'Логотип магазина или маркетплейса (логотип бренда можно)',
      'Цены и скидки',
      'Реклама и контактные данные',
      'Информация о доставке',
      'Слова: «скидка», «цена», «с доставкой», «аналог», «подобный», «заменяющий», «хит», «лучший», «идеальный» и аналогичные',
      'Инфографика запрещена для некоторых категорий (лекарства, БАДы, витамины, ветеринарные препараты и др.)',
    ],
  },
  ozon: {
    title: 'Ozon',
    general: [
      'Форматы: JPEG, JPG, PNG, HEIC, WEBP',
      'Соотношение сторон: вертикальное 3:4',
      'Разрешение: одежда/обувь — минимум 900×1200 px; остальное — от 200×200 до 4320×7680 px',
      'Размер файла: не более 10 МБ',
    ],
    infographicAllowed: [
      'Характеристики и параметры товара',
      'Выгоды и преимущества товара',
      'Фирменные цвета и графические элементы бренда',
    ],
    infographicForbidden: [
      'Цены и скидки',
      'Контактные данные, ссылки на внешние ресурсы',
      'Призывы к действию (например, «купи сейчас», «успей»)',
    ],
  },
  wildberries: {
    title: 'Wildberries',
    general: [
      'Форматы: JPG, PNG, WEBP',
      'Соотношение сторон: вертикальное 3:4',
      'Разрешение: не менее 700×900 px, максимум по стороне — 8000 px',
      'Размер файла: не более 10 МБ',
    ],
    infographicAllowed: [],
    infographicForbidden: [
      'Цены и скидки',
      'QR-коды, ссылки на сторонние ресурсы',
      'Оценочные суждения: «хит», «лучший», «лидер продаж», «топ» и т.п.',
      'Количество проданных товаров (например, «продано уже 100 штук»)',
      'Призывы к действию (например, позвонить, сравнить, сделать покупку)',
    ],
  },
};

// Запрещённые слова/фразы для мягкой проверки текста по маркетплейсам
const MARKETPLACE_FORBIDDEN_PATTERNS: Record<string, string[]> = {
  'yandex-market': [
    'скидка',
    'скидки',
    'цена',
    'с доставкой',
    'аналог',
    'подобный',
    'заменяющий',
    'хит',
    'лучший',
    'идеальный',
  ],
  ozon: [
    'скидка',
    'скидки',
    'цена',
    'цены',
    'бесплатная доставка',
    'доставка бесплатно',
    'доставка в подарок',
    'купи',
    'купить сейчас',
    'успей',
    'только сегодня',
  ],
  wildberries: [
    'скидка',
    'скидки',
    'цена',
    'цены',
    'qr',
    'qr-код',
    'qr код',
    'ссылка',
    'http://',
    'https://',
    'www.',
    'хит',
    'лучший',
    'лидер продаж',
    'топ',
    'продано уже',
    'продано',
    'звони',
    'позвони',
    'оформите заказ',
    'сделай заказ',
  ],
};

type FabricLikeObject = {
  type?: string;
  text?: unknown;
  objects?: FabricLikeObject[];
  [key: string]: unknown;
};

// Мягкая проверка текста: ищем запрещённые слова в текстовых объектах canvasData
function collectTextWarnings(
  canvasData: { fabric?: Record<string, unknown>; [key: string]: unknown } | undefined,
  marketplaceSlug: string | null,
): string[] {
  if (!canvasData || !canvasData.fabric || !marketplaceSlug) return [];

  const patterns = MARKETPLACE_FORBIDDEN_PATTERNS[marketplaceSlug];
  if (!patterns || patterns.length === 0) return [];

  const fabricData = canvasData.fabric as { objects?: FabricLikeObject[] };
  const objects = fabricData.objects || [];

  const lowerPatterns = patterns.map((p) => p.toLowerCase());
  const warnings: string[] = [];

  const visitObject = (obj: FabricLikeObject) => {
    // Текстовые объекты
    if (obj.type === 'textbox' || obj.type === 'text' || obj.type === 'i-text') {
      const text = typeof obj.text === 'string' ? obj.text : '';
      const textLower = text.toLowerCase();
      const matched: string[] = [];
      lowerPatterns.forEach((pattern, idx) => {
        if (pattern && textLower.includes(pattern)) {
          matched.push(patterns[idx]);
        }
      });
      if (matched.length > 0) {
        const unique = Array.from(new Set(matched));
        warnings.push(
          `Текст "${text}" содержит потенциально запрещённые элементы: ${unique.join(', ')}`,
        );
      }
    }

    // Группы / вложенные объекты
    if (Array.isArray(obj.objects)) {
      obj.objects.forEach((child) => visitObject(child));
    }
  };

  objects.forEach((obj) => visitObject(obj));

  return warnings;
}

export default function LayoutEditorPage(): React.JSX.Element {
  const [, params] = useRoute('/layout-editor/:id');
  const [, setLocation] = useLocation();
  const dispatch = useAppDispatch();
  const { marketplaces } = useAppSelector((state) => state.marketplace);

  const [layout, setLayout] = useState<LayoutSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedMarketplaceId, setSelectedMarketplaceId] = useState<number | null>(null);
  const [selectedMarketplaceSlug, setSelectedMarketplaceSlug] = useState<string | null>(null);
  const [cardSize, setCardSize] = useState<CardSize>('900x1200');

  useEffect(() => {
    if (!params?.id) return;

    const fetchLayout = async (): Promise<void> => {
      try {
        setLoading(true);
        const data = await layoutService.getLayoutById(parseInt(params.id, 10));
        setLayout(data);
      } catch (err) {
        console.error('Error fetching layout:', err);
        setError('Ошибка загрузки макета');
      } finally {
        setLoading(false);
      }
    };

    void fetchLayout();
  }, [params?.id]);

  // Загружаем маркетплейсы
  useEffect(() => {
    void dispatch(fetchMarketplacesThunk());
  }, [dispatch]);

  // Инициализация выбранного маркетплейса и размера после загрузки layout и marketplaces
  useEffect(() => {
    if (!layout || !marketplaces?.length) return;

    const templateMarketplaceId = layout.template?.marketplaceId ?? null;
    const initialMarketplace: Marketplace | undefined =
      (templateMarketplaceId && marketplaces.find((m) => m.id === templateMarketplaceId)) ||
      marketplaces[0];

    if (initialMarketplace) {
      setSelectedMarketplaceId(initialMarketplace.id);
      setSelectedMarketplaceSlug(initialMarketplace.slug);
      const sizes = getAvailableSizes(initialMarketplace.slug);
      setCardSize(sizes[0] || '900x1200');
    }
  }, [layout, marketplaces]);

  const handleSave = async (
    imageFile: File,
    canvasData?: { fabric?: Record<string, unknown>; meta?: Record<string, unknown> },
  ): Promise<void> => {
    try {
      if (!layout) return;

      // Нормализуем canvasData в формат слайдов (совместимость с EditCard)
      const normalizedCanvasData = canvasData
        ? {
            fabric: canvasData.fabric ?? null,
            meta: {
              ...(canvasData.meta ?? {}),
              cardSize: canvasData.meta?.cardSize ?? cardSize,
              slideCount: 1,
              slides: [
                {
                  slideIndex: 0,
                  canvasData: {
                    fabric: canvasData.fabric ?? null,
                    meta: canvasData.meta ?? {},
                  },
                },
              ],
            },
          }
        : undefined;

      // Создаем новую карточку на основе макета
      const cardData = {
        title: `Карточка из макета: ${layout.name}`,
        marketplaceId: selectedMarketplaceId ?? layout.template?.marketplaceId,
        templateId: layout.templateId,
        canvasData: normalizedCanvasData,
        status: 'completed' as const,
      };

      const newCard = await productCardService.create(cardData, imageFile);

      // После создания ведём пользователя на страницу "Мои карточки",
      // где новая карточка появится в списке
      setLocation('/dashboard');
    } catch (err) {
      console.error('Error saving card:', err);
    }
  };

  // Определяем размер canvas на основе выбранного маркетплейса
  const getCanvasSize = (): string => {
    return cardSize;
  };

  // Парсим canvasData и правильно структурируем для CardEditor
  const getCanvasData = () => {
    if (!layout?.canvasData) return undefined;

    try {
      let parsedData: Record<string, unknown>;

      // Если canvasData это строка - парсим её
      if (typeof layout.canvasData === 'string') {
        parsedData = JSON.parse(layout.canvasData);
      } else {
        parsedData = layout.canvasData as Record<string, unknown>;
      }

      // Структура из сидера: { version, objects }
      // CardEditor ожидает: { fabric: { version, objects }, meta: {} }
      // Если уже есть структура с fabric - используем её, иначе оборачиваем
      if (parsedData.fabric) {
        // Уже правильная структура
        return parsedData as {
          fabric?: Record<string, unknown>;
          meta?: Record<string, unknown>;
        };
      } else {
        // Оборачиваем в структуру fabric
        return {
          fabric: parsedData,
          meta: {
            cardSize: getCanvasSize(),
            slideCount: 1,
            source: 'layout',
            layoutId: layout?.id,
          },
        };
      }
    } catch (err) {
      console.error('❌ Error parsing canvasData:', err);
      return undefined;
    }
  };

  const currentMarketplace = marketplaces?.find((m) => m.id === selectedMarketplaceId);
  const currentRules =
    currentMarketplace && MARKETPLACE_RULES[currentMarketplace.slug]
      ? MARKETPLACE_RULES[currentMarketplace.slug]
      : null;

  // Подготовим данные один раз, чтобы не парсить при каждом рендере
  const canvasData = useMemo(() => getCanvasData(), [layout, cardSize]);
  const textWarnings = useMemo(
    () => collectTextWarnings(canvasData, selectedMarketplaceSlug),
    [canvasData, selectedMarketplaceSlug],
  );

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <p className="text-gray-500 text-lg">Загрузка макета...</p>
      </div>
    );
  }

  if (error || !layout) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error || 'Макет не найден'}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Заголовок */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={() => window.history.back()}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{layout.name}</h1>
            <p className="text-gray-600 mt-1">
              {layout.description || 'Редактор макета'} •{' '}
              {currentMarketplace?.name ||
                layout.template?.marketplace?.name ||
                'Маркетплейс не выбран'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Редактор */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <CardEditor
              onSave={handleSave}
              cardSize={getCanvasSize()}
              slideCount={1}
              card={{
                canvasData,
              }}
            />
          </div>
        </div>

        {/* Боковая панель */}
        <div className="space-y-4">
          {/* Предупреждения */}
          {textWarnings.length > 0 && (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 shadow-md">
              <p className="font-semibold text-orange-800 mb-2 text-sm">⚠️ Предупреждения:</p>
              <ul className="list-disc list-inside space-y-1 text-xs text-orange-700">
                {textWarnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Настройки маркетплейса */}
          <div className="bg-white rounded-lg shadow-lg p-5 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Настройки</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Маркетплейс</label>
                <select
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedMarketplaceId ?? ''}
                  onChange={(e) => {
                    const id = e.target.value ? Number(e.target.value) : null;
                    setSelectedMarketplaceId(id);
                    const mp = marketplaces?.find((m) => m.id === id) || null;
                    const slug = mp?.slug ?? null;
                    setSelectedMarketplaceSlug(slug);
                    const sizes = getAvailableSizes(slug);
                    setCardSize(sizes[0] || '900x1200');
                  }}
                >
                  <option value="">Не выбран</option>
                  {marketplaces?.map((mp) => (
                    <option key={mp.id} value={mp.id}>
                      {mp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Размер макета
                </label>
                <div className="flex flex-wrap gap-2">
                  {getAvailableSizes(selectedMarketplaceSlug).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setCardSize(size)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border-2 transition-all ${
                        cardSize === size
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {size.replace('x', ' × ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Требования маркетплейса */}
          {currentRules && (
            <div className="bg-white rounded-lg shadow-lg p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Требования {currentRules.title}</h3>

              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Основные требования:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {currentRules.general.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                {currentRules.infographicAllowed && currentRules.infographicAllowed.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">Инфографика — что можно:</h4>
                    <ul className="list-disc list-inside space-y-1 text-green-600">
                      {currentRules.infographicAllowed.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-red-700 mb-2">Инфографика — что нельзя:</h4>
                  <ul className="list-disc list-inside space-y-1 text-red-600">
                    {currentRules.infographicForbidden.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
