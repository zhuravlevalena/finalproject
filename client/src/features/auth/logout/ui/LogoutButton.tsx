import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/shared/hooks/use-auth';
import { Button } from '@/shared/ui/button';

export function LogoutButton(): React.JSX.Element {
  const { logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async (): Promise<void> => {
    await logout();
    setLocation('/');
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      className="w-full border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-200 dark:hover:bg-red-900/30"
    >
      Выйти
    </Button>
  );
}
