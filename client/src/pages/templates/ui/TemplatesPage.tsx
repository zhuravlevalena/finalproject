import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';

type Template = {
  id: string;
  name: string;
  preview: string;
  marketplace: string;
};

// Моковые данные для демонстрации
const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Минималистичный',
    preview: 'https://via.placeholder.com/600x800/4F46E5/FFFFFF?text=Template+1',
    marketplace: 'ozon',
  },
  {
    id: '2',
    name: 'Яркий акцент',
    preview: 'https://via.placeholder.com/600x800/EC4899/FFFFFF?text=Template+2',
    marketplace: 'ozon',
  },
  {
    id: '3',
    name: 'Премиум',
    preview: 'https://via.placeholder.com/600x800/10B981/FFFFFF?text=Template+3',
    marketplace: 'ozon',
  },
  {
    id: '4',
    name: 'Современный',
    preview: 'https://via.placeholder.com/600x800/F59E0B/FFFFFF?text=Template+4',
    marketplace: 'wildberries',
  },
  {
    id: '5',
    name: 'Элегантный',
    preview: 'https://via.placeholder.com/600x800/8B5CF6/FFFFFF?text=Template+5',
    marketplace: 'wildberries',
  },
  {
    id: '6',
    name: 'Классический',
    preview: 'https://via.placeholder.com/600x800/06B6D4/FFFFFF?text=Template+6',
    marketplace: 'yandex',
  },
];

export default function TemplatesPage(): React.JSX.Element {
  const [, setLocation] = useLocation();
  const [marketplace, setMarketplace] = useState('');
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);

  useEffect(() => {
    // Парсим query параметры
    const params = new URLSearchParams(window.location.search);
    const marketplaceParam = params.get('marketplace') ?? '';
    setMarketplace(marketplaceParam);

    // Фильтруем шаблоны
    const filtered = mockTemplates.filter((t) => t.marketplace === marketplaceParam);
    setFilteredTemplates(filtered);
  }, []);

  const handleTemplateSelect = (templateId: string): void => {
    setLocation(`/template-editor/${templateId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => setLocation('/')}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Назад
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Выберите шаблон</h1>
        <p className="text-gray-600 mt-2">
          Маркетплейс: <span className="font-semibold capitalize">{marketplace}</span>
        </p>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => handleTemplateSelect(template.id)}
            >
              <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                <img
                  src={template.preview}
                  alt={template.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {template.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Шаблоны не найдены</p>
        </div>
      )}
    </div>
  );
}
