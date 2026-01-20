import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { templateService } from '@/entities/template/api/template.service';
import type { TemplateSchema } from '@/entities/template/model/template.schemas';

export default function TemplateSelectionPage(): React.JSX.Element {
  const [, setLocation] = useLocation();
  const [marketplace, setMarketplace] = useState('');
  const [templates, setTemplates] = useState<TemplateSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const marketplaceParam = params.get('marketplace') ?? '';
    setMarketplace(marketplaceParam);

    // Загружаем шаблоны для маркетплейса
    const fetchTemplates = async (): Promise<void> => {
      try {
        setLoading(true);
        const data = await templateService.getAll();
        // Фильтруем по маркетплейсу, если указан
        const filtered = marketplaceParam
          ? data.filter((t) => t.marketplace?.slug === marketplaceParam)
          : data;
        setTemplates(filtered);
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError('Ошибка загрузки шаблонов');
      } finally {
        setLoading(false);
      }
    };

    void fetchTemplates();
  }, []);

  const handleTemplateSelect = (templateId: number): void => {
    setLocation(`/templates?templateId=${String(templateId)}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Загрузка шаблонов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={() => setLocation('/')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => window.history.back()}
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
        <h1 className="text-3xl font-bold text-gray-900">Выберите категорию шаблона</h1>
        <p className="text-gray-600 mt-2">
          Маркетплейс: <span className="font-semibold capitalize">{marketplace}</span>
        </p>
      </div>

      {/* Templates Grid */}
      {templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => handleTemplateSelect(template.id)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="text-white"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                    {template.name}
                  </h3>
                  {template.description && (
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {(template as unknown as { layouts?: unknown[] }).layouts?.length ?? 0} макетов
                  </p>
                </div>
                <svg
                  className="text-gray-400 group-hover:text-blue-600 transition-colors"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Шаблоны не найдены</p>
          <p className="text-gray-400 text-sm mt-2">
            Для этого маркетплейса пока нет доступных шаблонов
          </p>
        </div>
      )}
    </div>
  );
}
