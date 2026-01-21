import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/shared/hooks/use-auth';
import { Button } from '@/shared/ui/button';
import { LogoutButton } from '@/features/auth/logout/ui/LogoutButton';
import { TemplateSelectorModal } from '@/features/template-selector/ui/TemplateSelectorModal';
import { useAppDispatch, useAppSelector } from '@/shared/lib/hooks';
import {
  setModalOpen,
  setMobileMenuOpen,
  setDarkMode,
  setSearchOpen,
  setSearchValue,
} from '../model/navbar.slice';

type NavItem = {
  label: string;
  path?: string;
  onClick?: () => void;
  requiresAuth?: boolean;
};

export function Navbar(): React.JSX.Element {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const dispatch = useAppDispatch();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const isModalOpen = useAppSelector(
    (state) => (state as { navbar?: { isModalOpen: boolean } }).navbar?.isModalOpen ?? false,
  );
  const isMobileMenuOpen = useAppSelector(
    (state) =>
      (state as { navbar?: { isMobileMenuOpen: boolean } }).navbar?.isMobileMenuOpen ?? false,
  );
  const isDarkMode = useAppSelector(
    (state) => (state as { navbar?: { isDarkMode: boolean } }).navbar?.isDarkMode ?? false,
  );
  const searchOpen = useAppSelector(
    (state) => (state as { navbar?: { searchOpen: boolean } }).navbar?.searchOpen ?? false,
  );
  const searchValue = useAppSelector(
    (state) => (state as { navbar?: { searchValue: string } }).navbar?.searchValue ?? '',
  );

  useEffect(() => {
    // Поиск доступен только авторизованным — на выходе закрываем и очищаем
    if (!user) {
      dispatch(setSearchOpen(false));
      dispatch(setSearchValue(''));
    }
  }, [user, dispatch]);

  // Поиск больше не анимируется/не раскрывается — держим флаг закрытым
  useEffect(() => {
    if (searchOpen) {
      dispatch(setSearchOpen(false));
    }
  }, [searchOpen, dispatch]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Закрытие dropdown при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  const isActive = (path?: string): boolean => path === location;

  const authNavItems: NavItem[] = [
    { label: 'Мои карточки', path: '/dashboard', requiresAuth: true },
    { label: 'Создать карточку', path: '/create-card', requiresAuth: true },
    { label: 'Карточка AI', path: '/ai-card', requiresAuth: true },
    { label: 'Шаблоны', onClick: () => dispatch(setModalOpen(true)), requiresAuth: true },
    { label: 'Тарифы', path: '/pricing' },
  ];

  const guestNavItems: NavItem[] = [
    { label: 'Войти в аккаунт', path: '/login' },
    { label: 'Создать аккаунт', path: '/register' },
    { label: 'Тарифы', path: '/pricing' },
  ];

  const handleNavClick = (item: NavItem): void => {
    if (item.onClick) {
      item.onClick();
      return;
    }
    if (item.path) {
      setLocation(item.path);
    }
  };

  const renderNavItem = (item: NavItem): React.JSX.Element => {
    const active = isActive(item.path);
    return (
      <Button
        key={item.label}
        variant="ghost"
        onClick={() => handleNavClick(item)}
        className={`relative group px-3 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
          active
            ? 'bg-gradient-to-r from-sky-500/80 to-emerald-500/80 text-white shadow-lg shadow-sky-500/40'
            : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
        }`}
      >
        <span className="relative inline-flex items-center">
          <span>{item.label}</span>
          <span
            className={`pointer-events-none absolute inset-x-1 -bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 origin-left transform transition-transform duration-200 ${
              active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`}
          />
        </span>
      </Button>
    );
  };

  const userInitial = (user?.name ?? user?.email ?? 'U').charAt(0).toUpperCase();

  const handleSearchSubmit = (): void => {
    const trimmed = searchValue.trim();
    if (!trimmed) return;
    setLocation(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleProfileClick = (path: string): void => {
    window.location.href = `${window.location.origin}${path}`;
  };

  return (
    <nav className="relative z-50 border-b border-white/10 bg-card/70 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center gap-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              window.location.href = `${window.location.origin}/`;
            }}
            className="relative text-2xl font-bold text-primary  hover:opacity-90 transition-all duration-200"
          >
            <span className="relative inline-block text-glow">
              Cardify
              <span className="pointer-events-none absolute inset-x-0 -bottom-1 h-[3px] rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-sky-500 opacity-60 blur-[2px]" />
            </span>
          </button>

          <button
            type="button"
            aria-label="Переключить тему"
            onClick={() => dispatch(setDarkMode(!isDarkMode))}
            className="hidden md:inline-flex h-9 w-16 items-center rounded-full bg-white/10 border border-white/20 px-1 transition-colors relative overflow-hidden"
          >
            <span
              className={`absolute h-7 w-7 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                isDarkMode ? 'translate-x-7' : 'translate-x-0'
              }`}
            />

            <span className="relative z-10 flex w-full justify-between text-[11px] font-medium text-white/80 px-1">
              <span>☀️</span>
              <span>🌙</span>
            </span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user && (
            <div className="relative flex items-center w-56 px-3 rounded-full border border-white/15 bg-background/60 backdrop-blur-lg">
              <button
                type="button"
                aria-label="Поиск"
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                onClick={() => {
                  handleSearchSubmit();
                }}
              >
                <span className="material-icons text-white/80 text-base"></span>
              </button>
              <input
                type="text"
                value={searchValue}
                onChange={(event) => dispatch(setSearchValue(event.target.value))}
                placeholder="Поиск..."
                className="ml-2 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleSearchSubmit();
                  }
                }}
              />
            </div>
          )}

          {(user ? authNavItems : guestNavItems).map((item) => renderNavItem(item))}

          {user && (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((open) => !open)}
                className="flex items-center gap-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 px-3 py-1.5 transition-all duration-200 relative z-10"
              >
                <span className="h-8 w-8 rounded-full bg-gradient-to-tr from-sky-500 to-emerald-500 flex items-center justify-center text-xs font-semibold text-white shadow-md">
                  {userInitial}
                </span>
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl py-2 text-sm nav-slide-in z-[100]">
                  <div className="px-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Вошли как</p>
                    <p className="text-sm font-medium truncate text-gray-900 dark:text-white">{user.name}</p>
                  </div>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer relative z-10 text-gray-900 dark:text-white"
                    onClick={() => handleProfileClick('/dashboard')}
                  >
                    Профиль
                  </button>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer relative z-10 text-gray-900 dark:text-white"
                    onClick={() => handleProfileClick('/settings')}
                  >
                    Настройки
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2 px-3">
                    <LogoutButton />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-full border border-white/25 bg-card/70 hover:bg-white/10  transition-colors"
          aria-label="Открыть меню"
          onClick={() => dispatch(setMobileMenuOpen(!isMobileMenuOpen))}
        >
          <span className="text-lg leading-none text-foreground">☰</span>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-card/90 backdrop-blur-2xl nav-slide-in">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-2">
            {user ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-8 w-8 rounded-full bg-gradient-to-tr from-sky-500 to-emerald-500 flex items-center justify-center text-xs font-semibold text-white shadow-md">
                      {userInitial}
                    </span>
                    <span className="text-sm text-muted-foreground truncate">{user.name}</span>
                  </div>
                </div>

                {authNavItems.map((item) => (
                  <Button
                    key={item.label}
                    variant="ghost"
                    onClick={() => {
                      handleNavClick(item);
                      dispatch(setMobileMenuOpen(false));
                    }}
                    className="justify-start "
                  >
                    {item.label}
                  </Button>
                ))}

                <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-2">
                  <button
                    type="button"
                    onClick={() => dispatch(setDarkMode(!isDarkMode))}
                    className="flex items-center gap-2 text-xs text-muted-foreground "
                  >
                    <span>{isDarkMode ? 'Тёмная тема' : 'Светлая тема'}</span>
                  </button>
                  <LogoutButton />
                </div>
              </>
            ) : (
              <>
                {guestNavItems.map((item) => (
                  <Button
                    key={item.label}
                    variant="ghost"
                    onClick={() => {
                      handleNavClick(item);
                      dispatch(setMobileMenuOpen(false));
                    }}
                    className="justify-start "
                  >
                    {item.label}
                  </Button>
                ))}

                <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-2">
                  <button
                    type="button"
                    onClick={() => dispatch(setDarkMode(!isDarkMode))}
                    className="flex items-center gap-2 text-xs text-muted-foreground "
                  >
                    <span>{isDarkMode ? 'Тёмная тема' : 'Светлая тема'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <TemplateSelectorModal isOpen={isModalOpen} onClose={() => dispatch(setModalOpen(false))} />
    </nav>
  );
}
