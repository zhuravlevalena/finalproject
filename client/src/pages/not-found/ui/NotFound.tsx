import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/shared/ui/button';

export default function NotFound(): React.JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="text-xl text-muted-foreground">Страница не найдена</p>
        <Link href="/">
          <Button>Вернуться на главную</Button>
        </Link>
      </div>
    </div>
  );
}

