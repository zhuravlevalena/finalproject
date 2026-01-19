import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { AlertTriangle } from 'lucide-react';

type DeleteConfirmDialogProps = {
  isOpen: boolean;
  cardTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteConfirmDialog({
  isOpen,
  cardTitle,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps): React.JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 shadow-xl bg-white">
        <CardHeader className="bg-white">
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Подтверждение удаления
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 bg-white">
          <p className="text-gray-700">Вы действительно хотите удалить карточку товара?</p>
          {cardTitle && (
            <p className="text-sm text-gray-500 font-medium">&ldquo;{cardTitle}&rdquo;</p>
          )}
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={onCancel} className="min-w-[100px]">
              Нет
            </Button>
            <Button variant="outline" onClick={onConfirm} className="min-w-[100px]">
              Да
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
