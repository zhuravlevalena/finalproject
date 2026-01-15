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
    <Button variant="outline" onClick={handleLogout} className="cursor-pointer">
      Выйти
    </Button>
  );
}
