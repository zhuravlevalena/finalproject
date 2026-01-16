import { useState } from 'react';
import { useLocation } from 'wouter';
import { X } from 'lucide-react';

type TemplateSelectorModalProps = {
  isOpen: boolean;
  onClose: () => void;
}

type Marketplace = 'ozon' | 'wildberries' | 'yandex';
type ImageFormat = 'square' | 'horizontal';

const marketplaceInfo = {
  ozon: {
    name: 'Ozon',
    requirements:
      'Минимальный размер изображения: 800x800px. Формат: JPG, PNG. Максимальный размер файла: 10MB.',
  },
  wildberries: {
    name: 'Wildberries',
    requirements:
      'Минимальный размер изображения: 900x1200px. Формат: JPG, PNG. Максимальный размер файла: 10MB.',
  },
  yandex: {
    name: 'Яндекс.Маркет',
    requirements:
      'Минимальный размер изображения: 600x600px. Формат: JPG, PNG. Максимальный размер файла: 5MB.',
  },
};

const formatSizes = {
  square: { width: 1200, height: 1200, label: 'Квадрат', description: 'Основное изображение' },
  horizontal: {
    width: 1200,
    height: 800,
    label: 'Горизонтальное',
    description: 'Дополнительное изображение',
  },
};

export function TemplateSelectorModal({
  isOpen,
  onClose,
}: TemplateSelectorModalProps): React.JSX.Element | null {
  const [selectedMarketplace, setSelectedMarketplace] = useState<Marketplace>('ozon');
  const [, setLocation] = useLocation();

  if (!isOpen) return null;

  const handleFormatSelect = (format: ImageFormat): void => {
    setLocation(`/templates?marketplace=${selectedMarketplace}&format=${format}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Выберите формат карточки</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Marketplace Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Маркетплейс</h3>
            <div className="flex gap-3">
              {(Object.keys(marketplaceInfo) as Marketplace[]).map((marketplace) => (
                <button
                  key={marketplace}
                  onClick={() => setSelectedMarketplace(marketplace)}
                  className={`px-6 py-2 rounded-lg border-2 transition-all ${
                    selectedMarketplace === marketplace
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {marketplaceInfo[marketplace].name}
                </button>
              ))}
            </div>
          </div>

          {/* Requirements Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-1">
              Требования {marketplaceInfo[selectedMarketplace].name}
            </h4>
            <p className="text-sm text-blue-700">
              {marketplaceInfo[selectedMarketplace].requirements}
            </p>
          </div>

          {/* Format Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Размер изображения</h3>
            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(formatSizes) as ImageFormat[]).map((format) => {
                const size = formatSizes[format];
                return (
                  <button
                    key={format}
                    onClick={() => handleFormatSelect(format)}
                    className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <div className="flex flex-col items-center gap-3">
                      {/* Visual representation */}
                      <div className="bg-gray-100 rounded flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <div
                          className="bg-gray-300 group-hover:bg-blue-300 transition-colors flex items-center justify-center"
                          style={{
                            width: format === 'square' ? '120px' : '160px',
                            height: format === 'square' ? '120px' : '107px',
                          }}
                        >
                          <svg
                            className="text-gray-400 group-hover:text-blue-400"
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">
                          {size.width}x{size.height}
                        </div>
                        <div className="font-semibold text-gray-900">{size.label}</div>
                        <div className="text-sm text-gray-600">{size.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
