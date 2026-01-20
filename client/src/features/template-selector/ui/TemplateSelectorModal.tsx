import { useState } from 'react';
import { useLocation } from 'wouter';
import { X } from 'lucide-react';

type TemplateSelectorModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type Marketplace = 'ozon' | 'wildberries' | 'yandex';

const marketplaceInfo = {
  ozon: {
    name: 'Ozon',
    formats: 'JPEG, JPG, PNG, HEIC, WEBP',
    resolution: 'Одежда: минимум 900×1200 px. Остальное: 200×200 до 4320×7680 px',
    aspectRatio: 'Вертикальное 3:4',
    maxSize: '10 МБ',
    minResolution: '900×1200',
  },
  wildberries: {
    name: 'Wildberries',
    formats: 'JPG, PNG, WEBP',
    resolution: 'Минимум 700×900 px (макс. сторона до 8000 px)',
    aspectRatio: 'Вертикальное 3:4',
    maxSize: '10 МБ',
    minResolution: '700×900',
  },
  yandex: {
    name: 'Яндекс.Маркет',
    formats: 'JPG, PNG, WEBP',
    resolution: 'Минимум 300×300 px',
    aspectRatio: '3:4 или 1:1',
    maxSize: '10 МБ',
    minResolution: '300×300',
  },
};

export function TemplateSelectorModal({
  isOpen,
  onClose,
}: TemplateSelectorModalProps): React.JSX.Element | null {
  const [selectedMarketplace, setSelectedMarketplace] = useState<Marketplace>('ozon');
  const [, setLocation] = useLocation();

  if (!isOpen) return null;

  const handleContinue = (): void => {
    setLocation(`/template-selection?marketplace=${selectedMarketplace}`);
    onClose();
  };

  const info = marketplaceInfo[selectedMarketplace];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Выберите маркетплейс</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Marketplace Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Маркетплейс</h3>
            <div className="flex flex-wrap gap-3">
              {(Object.keys(marketplaceInfo) as Marketplace[]).map((marketplace) => (
                <button
                  key={marketplace}
                  onClick={() => setSelectedMarketplace(marketplace)}
                  className={`px-6 py-3 rounded-lg border-2 transition-all ${
                    selectedMarketplace === marketplace
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  } w-full sm:w-auto`}
                >
                  {marketplaceInfo[marketplace].name}
                </button>
              ))}
            </div>
          </div>

          {/* Requirements Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
            <h4 className="font-semibold text-blue-900 mb-3 text-lg">Требования {info.name}</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex">
                <span className="font-medium w-40">Форматы:</span>
                <span>{info.formats}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-40">Разрешение:</span>
                <span>{info.resolution}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-40">Соотношение сторон:</span>
                <span>{info.aspectRatio}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-40">Макс. размер:</span>
                <span>{info.maxSize}</span>
              </div>
            </div>
          </div>

          {/* Visual Preview */}
          <div className="flex justify-center py-4">
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-6 inline-block">
                <div
                  className="bg-gradient-to-br from-blue-400 to-blue-600 rounded shadow-lg flex items-center justify-center"
                  style={{
                    width: '180px',
                    height: '240px',
                  }}
                >
                  <svg
                    className="text-white/80"
                    width="60"
                    height="60"
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
              <p className="text-sm text-gray-600 mt-3">Формат 3:4 • {info.minResolution} px</p>
            </div>
          </div>

          {/* Continue Button */}
          <div className="pt-2">
            <button
              onClick={handleContinue}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Выбрать шаблон
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
