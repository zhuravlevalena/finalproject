import React, { useState, useEffect } from 'react';
import { cardVersionService } from '@/entities/cardversion/api/cardversion.service';
import type { CardVersion } from '@/entities/cardversion/model/cardversion.types';
import { useToast } from '@/shared/ui/toaster';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { 
  History, 
  RotateCcw, 
  GitCompare, 
  Loader2,
  Clock,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';

interface CardHistoryProps {
  cardId: number;
  onRestore?: (version: CardVersion) => void;
  onLoadVersion?: (version: CardVersion) => void;
}

export function CardHistory({ cardId, onRestore, onLoadVersion }: CardHistoryProps) {
  const { success, error: showError, info } = useToast();
  const [versions, setVersions] = useState<CardVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<number[]>([]);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    loadVersions();
  }, [cardId]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const data = await cardVersionService.getVersions(cardId);
      setVersions(data);
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (version: CardVersion) => {
    try {
      await cardVersionService.restoreVersion(version.id);
      await loadVersions();
      success(`Версия ${version.version} успешно восстановлена`);
      onRestore?.(version);
    } catch (err) {
      console.error('Error restoring version:', err);
      showError('Ошибка при восстановлении версии');
    }
  };

  const handleCompare = async () => {
    if (selectedVersions.length !== 2) {
      showError('Выберите ровно 2 версии для сравнения');
      return;
    }

    setComparing(true);
    try {
      const comparison = await cardVersionService.compareVersions(
        selectedVersions[0],
        selectedVersions[1]
      );
      // Открыть модальное окно с сравнением
      console.log('Comparison:', comparison);
      info(`Найдено различий: ${comparison.differences.length}`);
    } catch (err) {
      console.error('Error comparing versions:', err);
      showError('Ошибка при сравнении версий');
    } finally {
      setComparing(false);
      setSelectedVersions([]);
    }
  };

  const toggleVersionSelection = (versionId: number) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      } else if (prev.length < 2) {
        return [...prev, versionId];
      } else {
        return [prev[1], versionId];
      }
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          История изменений
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {selectedVersions.length === 2 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-700">
              Выбрано версий: {selectedVersions.length}
            </span>
            <Button
              size="sm"
              onClick={handleCompare}
              disabled={comparing}
              variant="outline"
            >
              <GitCompare className="h-4 w-4 mr-2" />
              Сравнить
            </Button>
          </div>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {versions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              История изменений пуста
            </p>
          ) : (
            versions.map((version) => (
              <div
                key={version.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedVersions.includes(version.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleVersionSelection(version.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">
                        Версия {version.version}
                      </span>
                      {version.changeDescription && (
                        <span className="text-xs text-muted-foreground">
                          {version.changeDescription}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(version.createdAt), 'dd MMM yyyy, HH:mm')}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLoadVersion?.(version);
                      }}
                      title="Загрузить для просмотра"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestore(version);
                      }}
                      title="Восстановить"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
