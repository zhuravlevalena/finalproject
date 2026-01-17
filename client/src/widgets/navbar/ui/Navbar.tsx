import { useLocation } from 'wouter';
import { useAuth } from '@/shared/hooks/use-auth';
import { Button } from '@/shared/ui/button';
import { LogoutButton } from '@/features/auth/logout/ui/LogoutButton';

export function Navbar(): React.JSX.Element {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <button
          onClick={() => setLocation('/')}
          className="text-2xl font-bold text-primary cursor-pointer hover:opacity-80 transition-opacity"
        >
          AI-Ассистент
        </button>

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
    </nav>
  );
}
