import React from 'react';
import { useAuth } from '@/shared/hooks/use-auth';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { useLocation } from 'wouter';
import { Loader2, Sparkles } from 'lucide-react';

// Примеры красивых карточек товаров
const exampleCards = [
  {
    id: 1,
    title: 'Премиум беспроводные наушники',
    marketplace: 'Wildberries',
    image: '🎧',
    description: 'Высококачественные наушники с активным шумоподавлением и батареей на 30 часов',
    price: '8 990₽',
    rating: 4.8,
  },
  {
    id: 2,
    title: 'Умные часы с GPS',
    marketplace: 'Ozon',
    image: '⌚',
    description: 'Фитнес-трекер с мониторингом здоровья, GPS и водонепроницаемостью',
    price: '12 500₽',
    rating: 4.9,
  },
  {
    id: 3,
    title: 'Смартфон премиум класса',
    marketplace: 'Яндекс.Маркет',
    image: '📱',
    description: 'Флагманский смартфон с камерой 108 МП и процессором последнего поколения',
    price: '89 990₽',
    rating: 4.7,
  },
  {
    id: 4,
    title: 'Электросамокат для города',
    marketplace: 'Wildberries',
    image: '🛴',
    description: 'Компактный электросамокат с пробегом 30 км и складной конструкцией',
    price: '25 000₽',
    rating: 4.6,
  },
  {
    id: 5,
    title: 'Умная колонка с голосовым помощником',
    marketplace: 'Ozon',
    image: '🔊',
    description: 'Беспроводная колонка с премиум звуком и интеграцией умного дома',
    price: '15 990₽',
    rating: 4.8,
  },
  {
    id: 6,
    title: 'Беспроводная клавиатура',
    marketplace: 'Яндекс.Маркет',
    image: '⌨️',
    description: 'Эргономичная механическая клавиатура с подсветкой RGB',
    price: '6 500₽',
    rating: 4.5,
  },
];

export default function Home(): React.JSX.Element {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Создавайте профессиональные карточки товаров
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            С помощью искусственного интеллекта создавайте привлекательные карточки товаров для маркетплейсов за минуты
          </p>
          <Button size="lg" onClick={() => setLocation('/register')}>
            <Sparkles className="mr-2 h-5 w-5" />
            Начать бесплатно
          </Button>
        </section>

        {/* Examples Section */}
        <section id="examples" className="container mx-auto px-4 py-16">
          <h3 className="text-3xl font-bold text-center mb-12">
            Примеры карточек товаров
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exampleCards.map((card) => (
              <Card key={card.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="text-6xl text-center mb-4">{card.image}</div>
                  <div className="mb-2">
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {card.marketplace}
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold mb-2">{card.title}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{card.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">{card.price}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">{card.rating}</span>
                      <span className="text-yellow-500">⭐</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <Card className="max-w-2xl mx-auto p-12">
            <h3 className="text-2xl font-bold mb-4">Готовы создать свою первую карточку?</h3>
            <p className="text-muted-foreground mb-6">
              Присоединяйтесь к сотням продавцов, которые уже используют наш сервис
            </p>
            <Button size="lg" onClick={() => setLocation('/register')}>
              Создать аккаунт
            </Button>
          </Card>
        </section>
      </div>
    );
  }

  // Контент для зарегистрированных пользователей
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Добро пожаловать, {user.name}!
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Создавайте привлекательные карточки товаров для маркетплейсов за минуты
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => setLocation('/dashboard')}>
            <Sparkles className="mr-2 h-5 w-5" />
            Мои карточки
          </Button>
          <Button size="lg" variant="outline" onClick={() => setLocation('/create-card')}>
            Создать новую карточку
          </Button>
        </div>
      </section>

      {/* Examples Section */}
      <section id="examples" className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">
          Примеры карточек товаров
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exampleCards.map((card) => (
            <Card key={card.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="text-6xl text-center mb-4">{card.image}</div>
                <div className="mb-2">
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                    {card.marketplace}
                  </span>
                </div>
                <h4 className="text-lg font-semibold mb-2">{card.title}</h4>
                <p className="text-sm text-muted-foreground mb-4">{card.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">{card.price}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">{card.rating}</span>
                    <span className="text-yellow-500">⭐</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
