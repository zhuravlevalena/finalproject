import React from 'react';
import { useAuth } from '@/shared/hooks/use-auth';
import { Button } from '@/shared/ui/button';
import { Loader2, Sparkles, Star } from 'lucide-react';
import { motion } from 'framer-motion';

// Моковые карточки товаров с полной информацией
const previewCards = [
  {
    title: 'Беспроводные наушники Sony WH-1000XM5',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    price: '24 990 ₽',
    oldPrice: '29 990 ₽',
    rating: 4.8,
    reviews: 1247,
    description: 'Наушники с активным шумоподавлением. 30 часов работы без подзарядки.',
    characteristics: [
      'Активное шумоподавление',
      '30 часов работы',
      'Быстрая зарядка 3 мин = 3 часа',
      'Bluetooth 5.2',
    ],
    marketplace: 'Wildberries',
  },
  {
    title: 'Минималистичная настольная лампа',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    price: '3 490 ₽',
    rating: 4.6,
    reviews: 892,
    description: 'LED лампа с регулируемой яркостью. Три режима освещения для комфорта.',
    characteristics: [
      'LED подсветка',
      'Регулировка яркости',
      '3 режима освещения',
      'Сенсорное управление',
    ],
    marketplace: 'Ozon',
  },
  {
    title: 'Солнцезащитные очки Ray-Ban',
    imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80',
    price: '25 990 ₽',
    oldPrice: '37 990 ₽',
    rating: 4.7,
    reviews: 634,
    description: 'Классические очки с защитой от UV. Поляризованные линзы для комфорта.',
    characteristics: [
      'Защита от UV-солнечных лучей',
      'POLAROID',
      'Регулируемый ремень',
      'Водоотталкивающая пропитка',
    ],
    marketplace: 'Wildberries',
  },
  {
    title: 'Умные часы Apple Watch Series 9',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    price: '39 990 ₽',
    rating: 4.9,
    reviews: 2156,
    description: 'Фитнес-трекер с GPS и мониторингом здоровья. Водонепроницаемость до 50 метров.',
    characteristics: [
      'GPS и ГЛОНАСС',
      'Мониторинг здоровья 24/7',
      'Водонепроницаемость 50м',
      'До 18 часов работы',
    ],
    marketplace: 'Яндекс.Маркет',
  },
  {
    title: 'Керамический набор кружек',
    imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80',
    price: '1 290 ₽',
    rating: 4.5,
    reviews: 423,
    description: 'Набор из 4 кружек ручной работы. Объем 350 мл, подходит для посудомойки.',
    characteristics: ['Набор 4 шт', 'Ручная работа', 'Объем 350 мл', 'Подходит для посудомойки'],
    marketplace: 'Ozon',
  },
  {
    title: 'Портативный Power Bank 20000 mAh',
    imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&q=80',
    price: '2 490 ₽',
    oldPrice: '3 290 ₽',
    rating: 4.7,
    reviews: 1856,
    description: 'Внешний аккумулятор с быстрой зарядкой USB-C. Поддержка беспроводной зарядки.',
    characteristics: [
      'Емкость 20000 mAh',
      'Быстрая зарядка USB-C',
      'Беспроводная зарядка',
      '2 USB порта',
    ],
    marketplace: 'Wildberries',
  },
];

export default function Home(): React.JSX.Element {
  const { isLoading: isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0" />

      <div className="relative z-10 max-w-6xl text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-6xl md:text-8xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-black to-black/50 mb-4 tracking-tighter drop-shadow-2xl">
            Cardify
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Создавайте профессиональные карточки товаров для маркетплейсов
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center relative z-10"
        >
          <Button
            size="lg"
            className="text-lg px-8 py-6 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 cursor-pointer"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Начать работу
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {previewCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
              whileHover={{
                y: -8,
                scale: 1.02,
                transition: { duration: 0.3, ease: 'easeOut' },
              }}
              className="group rounded-xl overflow-hidden bg-white border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              {/* Изображение товара */}
              <div className="relative h-64 overflow-hidden bg-gray-100">
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Бейдж маркетплейса */}
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded text-xs font-medium text-gray-700">
                    {card.marketplace}
                  </span>
                </div>
              </div>

              {/* Информация о товаре */}
              <div className="p-4 space-y-2">
                {/* Название товара */}
                <h3 className="text-base font-semibold text-gray-900 line-clamp-2">{card.title}</h3>

                {/* Рейтинг и отзывы */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-900">{card.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500">({card.reviews} отзывов)</span>
                </div>

                {/* Описание */}
                <p className="text-sm text-gray-600 line-clamp-2 leading-tight">
                  {card.description}
                </p>

                {/* Характеристики */}
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-gray-700">Основные характеристики:</p>
                  <ul className="space-y-0.5">
                    {card.characteristics.slice(0, 2).map((char, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-start gap-1.5">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>{char}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Цена */}
                <div className="flex items-baseline gap-2 pt-1.5 border-t border-gray-100">
                  {card.oldPrice && (
                    <span className="text-sm text-gray-400 line-through">{card.oldPrice}</span>
                  )}
                  <span className="text-xl font-bold text-gray-900">{card.price}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
