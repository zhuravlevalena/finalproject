import { useEffect, useMemo, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/shared/lib/hooks';
import { CardEditor } from '@/widgets/card-editor/ui/CardEditor';
import { layoutService } from '@/entities/layout/api/layout.service';
import { productCardService } from '@/entities/productcard/api/productcard.service';
import { fetchMarketplacesThunk } from '@/entities/marketplace/model/marketplace.thunk';
import type { LayoutSchema } from '@/entities/layout/model/layout.schemas';
import { Card } from '@/shared/ui/card';
import { Settings, Sparkles, Layers, AlertTriangle, Ruler } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'settings' | 'rules'>('settings');

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
    const initialMarketplace =
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
  const canvasData = useMemo(() => {
    const data = getCanvasData();
    console.log('📦 LayoutEditorPage canvasData:', { data, layout: layout?.canvasData });
    return data;
  }, [layout, cardSize]);
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
      {/* Заголовок с анимацией */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
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
          </motion.button>
          <motion.img
            src="/111.png"
            alt="Cardify"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-16 w-16 md:h-20 md:w-20 object-contain"
          />
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {layout.name}
            </h1>
            <p className="text-gray-600 text-lg flex items-center gap-2 mt-1 flex-wrap">
              <Sparkles className="h-5 w-5 text-purple-500" />
              {layout.description || 'Редактор макета'} •{' '}
              {currentMarketplace?.name ||
                layout.template?.marketplace?.name ||
                'Маркетплейс не выбран'}
              {cardSize && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold border-2 border-blue-300"
                >
                  <Ruler className="h-4 w-4" />
                  {cardSize.replace('x', ' × ')} px
                </motion.span>
              )}
            </p>
          </div>
        </div>
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
            {/* Индикатор размера карточки */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4 flex items-center justify-between pb-4 border-b border-gray-200"
            >
              <div className="flex items-center gap-2">
                <Ruler className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Размер карточки:</span>
                <motion.span
                  key={cardSize}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold text-base shadow-md"
                >
                  {cardSize.replace('x', ' × ')} px
                </motion.span>
              </div>
              <div className="text-xs text-gray-500">
                {(() => {
                  const [width, height] = cardSize.split('x').map(Number);
                  const ratio = (width / height).toFixed(2);
                  return `Соотношение: ${ratio}:1`;
                })()}
              </div>
            </motion.div>
            <div className="h-[600px] flex flex-col">
              <CardEditor
                onSave={handleSave}
                cardSize={getCanvasSize()}
                slideCount={1}
                card={{
                  canvasData,
                }}
              />
            </div>
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
                onClick={() => setActiveTab('rules')}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all rounded-lg relative flex-1 whitespace-nowrap ${
                  activeTab === 'rules'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Правила</span>
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
                  {/* Предупреждения */}
                  {textWarnings.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 shadow-sm"
                    >
                      <p className="font-semibold text-orange-800 mb-2 text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Предупреждения:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-xs text-orange-700">
                        {textWarnings.map((warning, idx) => (
                          <li key={idx}>{warning}</li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold mb-2.5 text-gray-700 flex items-center gap-2">
                      <Layers className="h-4 w-4 text-blue-500" />
                      Маркетплейс
                    </label>
                    <select
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

                  {selectedMarketplaceId && selectedMarketplaceSlug && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label className="block text-sm font-semibold mb-2.5 text-gray-700">
                        Размер макета
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {getAvailableSizes(selectedMarketplaceSlug).map((size) => (
                          <motion.button
                            key={size}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => setCardSize(size)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium border-2 transition-all ${
                              cardSize === size
                                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md'
                                : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            {size.replace('x', ' × ')}
                          </motion.button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        Размеры соответствуют требованиям маркетплейса
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {activeTab === 'rules' && currentRules && (
                <motion.div
                  key="rules"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 text-xs"
                >
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                      Основные требования: {currentRules.title}
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 pl-2">
                      {currentRules.general.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {currentRules.infographicAllowed && currentRules.infographicAllowed.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2">Инфографика — что можно:</h4>
                      <ul className="list-disc list-inside space-y-1 text-green-600 pl-2">
                        {currentRules.infographicAllowed.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-red-700 mb-2">Инфографика — что нельзя:</h4>
                    <ul className="list-disc list-inside space-y-1 text-red-600 pl-2">
                      {currentRules.infographicForbidden.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}

              {activeTab === 'rules' && !currentRules && (
                <motion.div
                  key="rules-empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-center py-8 text-gray-500 text-sm"
                >
                  <p>Выберите маркетплейс, чтобы увидеть правила</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
