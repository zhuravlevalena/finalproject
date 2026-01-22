import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { productCardService } from '@/entities/productcard/api/productcard.service';
import { templateService } from '@/entities/template/api/template.service';
import { marketplaceService } from '@/entities/marketplace/api/marketplace.service';
import { productProfileService } from '@/entities/productprofile/api/productprofile.service';
import { layoutService } from '@/entities/layout/api/layout.service';
import type { ProductCard } from '@/entities/productcard/model/productcard.types';
import type { Template } from '@/entities/template/model/template.types';
import type { Marketplace } from '@/entities/marketplace/model/marketplace.types';
import type { ProductProfile } from '@/entities/productprofile/model/productprofile.types';
import type { LayoutSchema } from '@/entities/layout/model/layout.schemas';

type PageResult = {
  title: string;
  description: string;
  path: string;
  keywords: string[];
};

type SearchResult = {
  cards: ProductCard[];
  templates: Template[];
  marketplaces: Marketplace[];
  profiles: ProductProfile[];
  layouts: LayoutSchema[];
  pages: PageResult[];
};

// Статические страницы сайта для поиска
const staticPages: PageResult[] = [
  {
    title: 'Главная страница',
    description: 'Создавайте профессиональные карточки товаров для маркетплейсов',
    path: '/',
    keywords: ['главная', 'home', 'начало', 'карточки товаров', 'маркетплейсы'],
  },
  {
    title: 'Тарифы',
    description: 'Выберите подходящий тариф для создания карточек товаров',
    path: '/pricing',
    keywords: ['тарифы', 'pricing', 'цены', 'подписка', 'планы', 'стоимость'],
  },
  {
    title: 'Шаблоны',
    description: 'Просмотр и выбор шаблонов для карточек товаров',
    path: '/templates',
    keywords: ['шаблоны', 'templates', 'макеты', 'дизайн'],
  },
  {
    title: 'Мои карточки',
    description: 'Управление вашими карточками товаров',
    path: '/dashboard',
    keywords: ['дашборд', 'dashboard', 'мои карточки', 'управление'],
  },
  {
    title: 'Создать карточку',
    description: 'Создание новой карточки товара',
    path: '/create-card',
    keywords: ['создать', 'create', 'новая карточка', 'добавить'],
  },
  {
    title: 'Карточка AI',
    description: 'Создание карточки товара с помощью искусственного интеллекта',
    path: '/ai-card',
    keywords: ['ai', 'искусственный интеллект', 'нейросеть', 'автоматизация'],
  },
];

async function runSearch(query: string): Promise<SearchResult> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return { cards: [], templates: [], marketplaces: [], profiles: [], layouts: [], pages: [] };
  }

  const [cardsRes, templatesRes, marketplacesRes, profilesRes] = await Promise.allSettled([
    productCardService.getAll(),
    templateService.getAll(),
    marketplaceService.getAll(),
    productProfileService.getAll(),
  ]);

  // Поиск по карточкам товаров
  const cards: ProductCard[] =
    cardsRes.status === 'fulfilled'
      ? cardsRes.value.filter((card) => {
          const title = (card.title ?? '').toLowerCase();
          const marketplace = card.marketplace?.name?.toLowerCase() ?? '';
          const status = (card.status ?? '').toLowerCase();
          return title.includes(normalized) || marketplace.includes(normalized) || status.includes(normalized);
        })
      : [];

  // Поиск по шаблонам
  const templates: Template[] =
    templatesRes.status === 'fulfilled'
      ? templatesRes.value.filter((tpl) => {
          const name = tpl.name.toLowerCase();
          const description = (tpl.description ?? '').toLowerCase();
          return name.includes(normalized) || description.includes(normalized);
        })
      : [];

  // Поиск по маркетплейсам
  const marketplaces: Marketplace[] =
    marketplacesRes.status === 'fulfilled'
      ? marketplacesRes.value.filter((mp) => {
          const name = (mp.name ?? '').toLowerCase();
          const slug = (mp.slug ?? '').toLowerCase();
          const requirements = (mp.requirements ?? '').toLowerCase();
          return name.includes(normalized) || slug.includes(normalized) || requirements.includes(normalized);
        })
      : [];

  // Поиск по профилям товаров
  const profiles: ProductProfile[] =
    profilesRes.status === 'fulfilled'
      ? profilesRes.value.filter((profile) => {
          const productType = (profile.productType ?? '').toLowerCase();
          const style = (profile.style ?? '').toLowerCase();
          const targetAudience = (profile.targetAudience ?? '').toLowerCase();
          return (
            productType.includes(normalized) ||
            style.includes(normalized) ||
            targetAudience.includes(normalized)
          );
        })
      : [];

  // Поиск по макетам (через шаблоны)
  const layoutsPromises: Promise<LayoutSchema[]>[] = [];
  if (templatesRes.status === 'fulfilled') {
    for (const template of templatesRes.value) {
      layoutsPromises.push(
        layoutService.getLayoutsByTemplateId(template.id).catch(() => []),
      );
    }
  }

  const layoutsResults = await Promise.allSettled(layoutsPromises);
  const allLayouts: LayoutSchema[] = [];
  for (const result of layoutsResults) {
    if (result.status === 'fulfilled') {
      allLayouts.push(...result.value);
    }
  }

  const layouts: LayoutSchema[] = allLayouts.filter((layout) => {
    const name = (layout.name ?? '').toLowerCase();
    const description = (layout.description ?? '').toLowerCase();
    return name.includes(normalized) || description.includes(normalized);
  });

  // Поиск по статическим страницам
  const pages: PageResult[] = staticPages.filter((page) => {
    const title = page.title.toLowerCase();
    const description = page.description.toLowerCase();
    const keywords = page.keywords.join(' ').toLowerCase();
    return title.includes(normalized) || description.includes(normalized) || keywords.includes(normalized);
  });

  return { cards, templates, marketplaces, profiles, layouts, pages };
}

export default function SearchPage(): React.JSX.Element {
  const search =
    typeof window !== 'undefined'
      ? window.location.search
      : '';
  const params = new URLSearchParams(search);
  const qParam = params.get('q') ?? '';
  const query = qParam.trim();

  const { data, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => runSearch(query),
    enabled: query.length > 0,
  });

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-4">Поиск</h1>
        <p className="text-muted-foreground">Введите запрос в строке поиска вверху страницы.</p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="container mx-auto px-4 py-10">
        <p className="text-muted-foreground">Ищем “{query}”...</p>
      </div>
    );
  }

  const { cards, templates, marketplaces, profiles, layouts, pages } = data;
  const nothingFound =
    cards.length === 0 &&
    templates.length === 0 &&
    marketplaces.length === 0 &&
    profiles.length === 0 &&
    layouts.length === 0 &&
    pages.length === 0;

  const totalResults =
    cards.length + templates.length + marketplaces.length + profiles.length + layouts.length + pages.length;

  return (
    <div className="container mx-auto px-4 py-10 space-y-10">
      <header>
        <h1 className="text-2xl font-bold mb-2">Результаты поиска</h1>
        <p className="text-muted-foreground">
          Запрос: <span className="font-semibold">“{query}”</span>
          {totalResults > 0 && (
            <span className="ml-2">
              ({totalResults} {totalResults === 1 ? 'результат' : totalResults < 5 ? 'результата' : 'результатов'})
            </span>
          )}
        </p>
      </header>

      {nothingFound && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg mb-2">Ничего не найдено</p>
          <p className="text-sm text-muted-foreground">Попробуйте изменить запрос или использовать другие ключевые слова.</p>
        </div>
      )}

      {pages.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Страницы сайта</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pages.map((page, idx) => (
              <a
                key={idx}
                href={page.path}
                className="block rounded-xl border border-border bg-card p-4 hover:border-primary hover:shadow-lg transition-all duration-200"
              >
                <h3 className="font-semibold mb-1">{page.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{page.description}</p>
              </a>
            ))}
          </div>
        </section>
      )}

      {cards.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Карточки товаров ({cards.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => (
              <a
                key={card.id}
                href={`/edit-card/${card.id}`}
                className="block rounded-xl border border-border bg-card p-4 hover:border-primary hover:shadow-lg transition-all duration-200"
              >
                <h3 className="font-semibold mb-1 line-clamp-2">
                  {card.title || 'Без названия'}
                </h3>
                <p className="text-xs text-muted-foreground mb-1">
                  {card.marketplace?.name || 'Маркетплейс не указан'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Статус:{' '}
                  <span className="font-medium">
                    {card.status === 'completed' ? 'Завершена' : 'Черновик'}
                  </span>
                </p>
              </a>
            ))}
          </div>
        </section>
      )}

      {templates.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Шаблоны ({templates.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="rounded-xl border border-border bg-card p-4 hover:border-primary hover:shadow-lg transition-all duration-200"
              >
                <h3 className="font-semibold mb-1 line-clamp-2">{tpl.name}</h3>
                {tpl.description ? (
                  <p className="text-sm text-muted-foreground line-clamp-3">{tpl.description}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Описание отсутствует</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {layouts.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Макеты ({layouts.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {layouts.map((layout) => (
              <a
                key={layout.id}
                href={`/layout-editor/${layout.id}`}
                className="block rounded-xl border border-border bg-card p-4 hover:border-primary hover:shadow-lg transition-all duration-200"
              >
                <h3 className="font-semibold mb-1 line-clamp-2">{layout.name}</h3>
                {layout.description ? (
                  <p className="text-sm text-muted-foreground line-clamp-3">{layout.description}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Описание отсутствует</p>
                )}
                {layout.template && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Шаблон: {layout.template.name}
                  </p>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      {marketplaces.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Маркетплейсы ({marketplaces.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketplaces.map((mp) => (
              <div
                key={mp.id}
                className="rounded-xl border border-border bg-card p-4 hover:border-primary hover:shadow-lg transition-all duration-200"
              >
                <h3 className="font-semibold mb-1">{mp.name}</h3>
                <p className="text-xs text-muted-foreground mb-1">Slug: {mp.slug}</p>
                {mp.requirements && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{mp.requirements}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {profiles.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Профили товаров ({profiles.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="rounded-xl border border-border bg-card p-4 hover:border-primary hover:shadow-lg transition-all duration-200"
              >
                {profile.productType && (
                  <h3 className="font-semibold mb-1">Тип: {profile.productType}</h3>
                )}
                {profile.style && (
                  <p className="text-sm text-muted-foreground mb-1">Стиль: {profile.style}</p>
                )}
                {profile.targetAudience && (
                  <p className="text-sm text-muted-foreground">Аудитория: {profile.targetAudience}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

