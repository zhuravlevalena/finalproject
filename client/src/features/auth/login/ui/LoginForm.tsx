import { loginFormSchema } from '@/entities/user/model/user.schemas';
import { loginThunk } from '@/entities/user/model/user.thunk';
import { useAppDispatch } from '@/shared/lib/hooks';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import UserService from '@/entities/user/api/user.service';
import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginForm(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Автофокус на первое поле при открытии формы
    emailRef.current?.focus();
  }, []);

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const data = Object.fromEntries(new FormData(e.currentTarget));
      const validated = loginFormSchema.parse(data);
      await dispatch(loginThunk(validated)).unwrap();
      setLocation('/');
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'issues' in error) {
        const zodError = error as { issues?: { path: string[]; message: string }[] };
        if (zodError.issues) {
          const newErrors: Record<string, string> = {};
          zodError.issues.forEach((issue) => {
            const field = issue.path[0];
            newErrors[field] = issue.message;
          });
          setErrors(newErrors);
          return;
        }
      }

      const serverError = error as {
        message?: string;
        error?: string;
        response?: { data?: { message?: string; error?: string } };
      };

      const errorMessage =
        serverError.message ||
        serverError.error ||
        serverError.response?.data?.message ||
        serverError.response?.data?.error ||
        'Произошла ошибка при входе. Попробуйте еще раз.';

      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Вход в аккаунт</CardTitle>
        <p className="text-center text-sm text-gray-600">Войдите, чтобы начать играть</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={submitHandler} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Email
            </label>
            <input
              ref={emailRef}
              id="email"
              name="email"
              type="email"
              required
              autoComplete="off"
              onFocus={(e) => {
                // Предотвращаем автозаполнение при программном фокусе
                const target = e.target as HTMLInputElement;
                if (target.value === '') {
                  target.setAttribute('readonly', 'readonly');
                  setTimeout(() => {
                    target.removeAttribute('readonly');
                  }, 0);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  passwordRef.current?.focus();
                } else if (e.key === 'Tab' && !e.shiftKey) {
                  e.preventDefault();
                  passwordRef.current?.focus();
                }
              }}
              className="flex h-12 w-full rounded-2xl border border-white/40 organic-input px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300"
              placeholder="example@email.com"
            />
            {errors.email && <p className="text-sm text-red-300">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium leading-none text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Пароль
            </label>
            <div className="relative">
              <input
                ref={passwordRef}
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="off"
                onFocus={(e) => {
                  // Предотвращаем автозаполнение при программном фокусе
                  const target = e.target as HTMLInputElement;
                  if (target.value === '') {
                    target.setAttribute('readonly', 'readonly');
                    setTimeout(() => {
                      target.removeAttribute('readonly');
                    }, 0);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    submitButtonRef.current?.click();
                  } else if (e.key === 'Tab' && !e.shiftKey) {
                    e.preventDefault();
                    submitButtonRef.current?.focus();
                  } else if (e.key === 'Tab' && e.shiftKey) {
                    e.preventDefault();
                    emailRef.current?.focus();
                  }
                }}
                className="flex h-12 w-full rounded-2xl border border-border/50 organic-input px-4 py-3 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300"
                placeholder="Введите пароль"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>

              {errors.submit && (
                <div className="p-3 text-sm text-red-300 bg-red-500/20 backdrop-blur-sm rounded-2xl border border-red-400/30">
                  {errors.submit}
                </div>
              )}

          <Button 
            ref={submitButtonRef}
            type="submit" 
            variant="default"
            className="w-full" 
            disabled={isLoading} 
            size="lg"
            onKeyDown={(e) => {
              if (e.key === 'Tab' && e.shiftKey) {
                e.preventDefault();
                passwordRef.current?.focus();
              }
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Вход...
              </>
            ) : (
              'Войти в аккаунт'
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Или</span>
            </div>
          </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => UserService.googleAuth()}
                disabled={isLoading}
              >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Войти через Google
          </Button>

          <div className="text-center text-sm text-gray-600">
            Нет аккаунта?{' '}
            <button
              type="button"
              onClick={() => setLocation('/register')}
              className="text-purple-600 hover:text-purple-700 underline font-medium"
            >
              Зарегистрироваться
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}