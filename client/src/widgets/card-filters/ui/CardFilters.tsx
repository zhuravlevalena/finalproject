import React, { useState, useEffect } from 'react';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import type { Marketplace } from '@/entities/marketplace/model/marketplace.types';

export interface CardFiltersState {
  search: string;
  marketplaceId?: number;
  status?: 'draft' | 'completed';
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

interface CardFiltersProps {
  marketplaces?: Marketplace[];
  filters: CardFiltersState;
  onFiltersChange: (filters: CardFiltersState) => void;
}

export function CardFilters({ marketplaces = [], filters, onFiltersChange }: CardFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchValue, 500);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({
        ...filters,
        search: debouncedSearch,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleMarketplaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : undefined;
    onFiltersChange({
      ...filters,
      marketplaceId: value,
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'draft' | 'completed' | undefined;
    onFiltersChange({
      ...filters,
      status: value || undefined,
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split('-');
    onFiltersChange({
      ...filters,
      sortBy,
      sortOrder: sortOrder as 'ASC' | 'DESC',
    });
  };

  const clearFilters = () => {
    setSearchValue('');
    onFiltersChange({
      search: '',
      marketplaceId: undefined,
      status: undefined,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    });
  };

  const hasActiveFilters = 
    filters.search || 
    filters.marketplaceId || 
    filters.status ||
    filters.sortBy !== 'createdAt' ||
    filters.sortOrder !== 'DESC';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Поиск и фильтры
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Поиск */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Поиск по названию или описанию..."
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>

        {/* Фильтр по маркетплейсу */}
        <div>
          <label className="block text-sm font-medium mb-2">Маркетплейс</label>
          <select
            value={filters.marketplaceId || ''}
            onChange={handleMarketplaceChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary"
          >
            <option value="">Все маркетплейсы</option>
            {marketplaces.map((mp) => (
              <option key={mp.id} value={mp.id}>
                {mp.name}
              </option>
            ))}
          </select>
        </div>

        {/* Фильтр по статусу */}
        <div>
          <label className="block text-sm font-medium mb-2">Статус</label>
          <select
            value={filters.status || ''}
            onChange={handleStatusChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary"
          >
            <option value="">Все статусы</option>
            <option value="draft">Черновик</option>
            <option value="completed">Завершена</option>
          </select>
        </div>

        {/* Сортировка */}
        <div>
          <label className="block text-sm font-medium mb-2">Сортировка</label>
          <select
            value={`${filters.sortBy || 'createdAt'}-${filters.sortOrder || 'DESC'}`}
            onChange={handleSortChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary"
          >
            <option value="createdAt-DESC">Новые сначала</option>
            <option value="createdAt-ASC">Старые сначала</option>
            <option value="title-ASC">По названию (А-Я)</option>
            <option value="title-DESC">По названию (Я-А)</option>
          </select>
        </div>

        {/* Кнопка очистки фильтров */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full"
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Очистить фильтры
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
