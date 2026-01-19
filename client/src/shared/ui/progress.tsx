import React from 'react';
import { cn } from '@/shared/lib/utils';

type ProgressProps = {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
};

export function Progress({ 
  value, 
  max = 100, 
  className, 
  showLabel = false,
  label 
}: ProgressProps): React.JSX.Element {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{label || 'Загрузка...'}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden dark:bg-gray-700">
        <div
          className="bg-primary h-full transition-all duration-300 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
