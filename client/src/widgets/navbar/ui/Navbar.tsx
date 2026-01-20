import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/shared/hooks/use-auth';
import { Button } from '@/shared/ui/button';
import { LogoutButton } from '@/features/auth/logout/ui/LogoutButton';

export function Navbar(): React.JSX.Element {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center gap-3">
        <button
          onClick={() => setLocation('/')}
          className="text-2xl font-bold text-primary cursor-pointer hover:opacity-80 transition-opacity"
        >
          AI-Ассистент
        </button>

        <div className="hidden md:flex gap-4 items-center">
          {user ? (
            <>
              <span className="text-muted-foreground max-w-[14rem] truncate">{user.name}</span>
              <Button variant="ghost" onClick={() => setLocation('/dashboard')} className="cursor-pointer">
                Мои карточки
              </Button>
              <Button variant="ghost" onClick={() => setLocation('/create-card')} className="cursor-pointer">
                Создать карточку
              </Button>
              <Button variant="ghost" onClick={() => setLocation('/ai-card')} className="cursor-pointer">
                Карточка AI
              </Button>
              <Button variant="ghost" onClick={() => setLocation('/template-selection')} className="cursor-pointer">
                Шаблоны
              </Button>
              <Button variant="ghost" onClick={() => setLocation('/pricing')} className="cursor-pointer">
                Тарифы
              </Button>
              <LogoutButton />
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setLocation('/login')} className="cursor-pointer">
                Войти в аккаунт
              </Button>
              <Button variant="ghost" onClick={() => setLocation('/register')} className="cursor-pointer">
                Создать аккаунт
              </Button>
              <Button variant="ghost" onClick={() => setLocation('/pricing')} className="cursor-pointer">
                Тарифы
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-md border border-border hover:bg-secondary transition-colors"
          aria-label="Открыть меню"
          onClick={() => setIsMobileMenuOpen((v) => !v)}
        >
          <span className="text-lg leading-none">☰</span>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-2">
            {user ? (
              <>
                <div className="text-sm text-muted-foreground truncate">{user.name}</div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setLocation('/dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  Мои карточки
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setLocation('/create-card');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  Создать карточку
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setLocation('/ai-card');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  Карточка AI
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setLocation('/template-selection');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  Шаблоны
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setLocation('/pricing');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  Тарифы
                </Button>
                <div className="pt-2">
                  <LogoutButton />
                </div>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setLocation('/login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  Войти в аккаунт
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setLocation('/register');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  Создать аккаунт
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setLocation('/pricing');
                    setIsMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  Тарифы
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
