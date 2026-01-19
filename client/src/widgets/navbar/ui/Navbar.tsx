import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/shared/hooks/use-auth';
import { Button } from '@/shared/ui/button';
import { LogoutButton } from '@/features/auth/logout/ui/LogoutButton';
import { TemplateSelectorModal } from '@/features/template-selector/ui/TemplateSelectorModal';

export function Navbar(): React.JSX.Element {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <span className="text-2xl font-bold text-primary cursor-pointer hover:opacity-80 transition-opacity">
            AI-Ассистент
          </span>
        </Link>

        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <span className="text-muted-foreground">{user.name}</span>
              <Button
                variant="ghost"
                onClick={() => setLocation('/dashboard')}
                className="cursor-pointer"
              >
                Мои карточки
              </Button>
              <Button
                variant="ghost"
                onClick={() => setLocation('/create-card')}
                className="cursor-pointer"
              >
                Создать карточку
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsModalOpen(true)}
                className="cursor-pointer"
              >
                Шаблоны
              </Button>
              <LogoutButton />
            </>
          ) : (
            <>
              <a href="#examples" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                Примеры
              </a>
              <Button
                variant="outline"
                onClick={() => setLocation('/login')}
                className="cursor-pointer"
              >
                Войти
              </Button>
              <Button
                onClick={() => setLocation('/register')}
                className="cursor-pointer"
              >
                Создать аккаунт
              </Button>
            </>
          )}
        </div>
      </div>

      <TemplateSelectorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </nav>
  );
}
