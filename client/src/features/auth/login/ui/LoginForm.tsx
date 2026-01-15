import { loginFormSchema } from '@/entities/user/model/user.schemas';
import { loginThunk } from '@/entities/user/model/user.thunk';
import { useAppDispatch } from '@/shared/lib/hooks';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

export default function LoginForm(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        const zodError = error as { issues?: Array<{ path: string[]; message: string }> };
        if (zodError.issues) {
          const newErrors: Record<string, string> = {};
          zodError.issues.forEach((issue) => {
            const field = issue.path[0] as string;
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
        <p className="text-center text-sm text-muted-foreground">
          Войдите, чтобы начать играть
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={submitHandler} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="example@email.com"
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Введите пароль"
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>

          {errors.submit && (
            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
              {errors.submit}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading} size="lg">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Вход...
              </>
            ) : (
              'Войти в аккаунт'
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Нет аккаунта?{' '}
            <button
              type="button"
              onClick={() => setLocation('/register')}
              className="text-primary hover:underline font-medium"
            >
              Зарегистрироваться
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
