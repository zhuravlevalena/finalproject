import { registerFormSchema } from '@/entities/user/model/user.schemas';
import { registerThunk, refreshThunk } from '@/entities/user/model/user.thunk';
import { useAppDispatch } from '@/shared/lib/hooks';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Loader2, Eye, EyeOff, Mail } from 'lucide-react';

export default function RegisterForm(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [registeredEmail, setRegisteredEmail] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isResendingCode, setIsResendingCode] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      if (step === 'register') {
        const data = Object.fromEntries(new FormData(e.currentTarget));
        const validated = registerFormSchema.parse(data);

        await dispatch(registerThunk(validated)).unwrap();
        setRegisteredEmail(validated.email);
        setStep('verify');
        setIsLoading(false);
        setTimeout(() => {
          codeRef.current?.focus();
        }, 100);
      } else {
        const code = verificationCode.trim();
        if (code.length !== 6) {
          setErrors({ code: 'Код должен содержать 6 цифр' });
          return;
        }

        const UserService = (await import('@/entities/user/api/user.service')).default;
        await UserService.verifyEmailCode(registeredEmail, code);

        await dispatch(refreshThunk()).unwrap();
        setLocation('/');
      }
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
        response?: { status?: number; data?: { message?: string; error?: string } };
      };

      const backendMessage =
        serverError.response?.data?.message ??
        serverError.response?.data?.error ??
        serverError.error;

      const errorMessageLower = backendMessage?.toLowerCase() ?? '';

      const isDuplicateEmail =
        serverError.response?.status === 409 ||
        serverError.response?.status === 400 ||
        errorMessageLower.includes('taken') ||
        errorMessageLower.includes('already') ||
        errorMessageLower.includes('exist') ||
        errorMessageLower.includes('уже зарегистрирован') ||
        errorMessageLower.includes('уже существует');

      if (isDuplicateEmail) {
        setErrors({
          email: 'Пользователь с таким email уже зарегистрирован',
          submit:
            'Пользователь с таким email уже зарегистрирован. Используйте вход или восстановление пароля.',
        });
        setIsLoading(false);
        return;
      }

      if (serverError.response?.status === 400) {
        const filteredMessage =
          backendMessage && !errorMessageLower.includes('request failed')
            ? backendMessage
            : 'Некорректные данные для регистрации. Проверьте email и пароль.';
        setErrors({ submit: filteredMessage });
        setIsLoading(false);
        return;
      }

      const errorMessage =
        backendMessage ??
        (step === 'register'
          ? 'Пользователь с таким email уже зарегистрирован. Используйте вход или восстановление пароля.'
          : 'Неверный код подтверждения. Попробуйте еще раз.');

      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async (): Promise<void> => {
    if (!registeredEmail) return;

    setIsResendingCode(true);
    setErrors({});

    try {
      const UserService = (await import('@/entities/user/api/user.service')).default;
      await UserService.resendVerificationCode(registeredEmail);
      setErrors({ submit: 'Код подтверждения отправлен повторно. Проверьте вашу почту.' });
      setVerificationCode('');
      setTimeout(() => {
        codeRef.current?.focus();
      }, 100);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Ошибка',
      });
    } finally {
      setIsResendingCode(false);
    }
  };

  const renderSubmitLabel = (): React.ReactNode => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {step === 'register' ? 'Создание аккаунта...' : 'Подтверждение...'}
        </>
      );
    }

    if (step === 'register') {
      return 'Создать аккаунт';
    }

    return 'Подтвердить email';
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center dark:text-white">
          {step === 'register' ? 'Создать аккаунт' : 'Подтверждение email'}
        </CardTitle>
        <p className="text-center text-sm text-gray-600 dark:text-gray-300">
          {step === 'register'
            ? 'Заполните форму, чтобы войти в личный кабинет'
            : `На ваш email ${registeredEmail} отправлен код подтверждения. Введите его ниже.`}
        </p>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={submitHandler} className="space-y-4">
          {errors.submit && (
            <div
              role="alert"
              aria-live="assertive"
              className="p-3 text-sm rounded-2xl border bg-red-100 text-red-800 border-red-300 dark:bg-red-900/70 dark:text-red-100 dark:border-red-700"
            >
              {errors.submit}
            </div>
          )}
          {step === 'register' && (
            <>
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium leading-none text-gray-700 dark:text-gray-200 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Имя
                </label>
                <input
                  ref={nameRef}
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="off"
                  onFocus={(e) => {
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
                      emailRef.current?.focus();
                    } else if (e.key === 'Tab' && !e.shiftKey) {
                      e.preventDefault();
                      emailRef.current?.focus();
                    }
                  }}
                  className="flex h-12 w-full rounded-2xl border border-white/40 organic-input px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 dark:placeholder:text-gray-400 text-gray-800 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300"
                  placeholder="Введите ваше имя"
                />
                {errors.name && <p className="text-sm text-red-300">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none text-gray-700 dark:text-gray-200 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
                    } else if (e.key === 'Tab' && e.shiftKey) {
                      e.preventDefault();
                      nameRef.current?.focus();
                    }
                  }}
                  className="flex h-12 w-full rounded-2xl border border-white/40 organic-input px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 dark:placeholder:text-gray-400 text-gray-800 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300"
                  placeholder="example@email.com"
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium leading-none text-gray-700 dark:text-gray-200 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
                        formRef.current?.requestSubmit();
                      } else if (e.key === 'Tab' && !e.shiftKey) {
                        e.preventDefault();
                        submitButtonRef.current?.focus();
                      } else if (e.key === 'Tab' && e.shiftKey) {
                        e.preventDefault();
                        emailRef.current?.focus();
                      }
                    }}
                    className="flex h-12 w-full rounded-2xl border border-border/50 organic-input px-4 py-3 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground dark:placeholder:text-gray-400 text-gray-800 dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300"
                    placeholder="Введите пароль"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>
            </>
          )}

          {step === 'verify' && (
            <div className="space-y-4">
              <div className="p-4 glass border border-purple-200/50 rounded-2xl">
                <p className="text-sm text-gray-700 text-center">
                  <Mail className="w-4 h-4 inline mr-2 text-purple-600" />
                  Код подтверждения отправлен на{' '}
                  <strong className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
                    {registeredEmail}
                  </strong>
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="code"
                  className="text-sm font-medium leading-none text-gray-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Введите код подтверждения
                </label>
                <input
                  ref={codeRef}
                  id="code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setVerificationCode(value);
                    setErrors({});
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      formRef.current?.requestSubmit();
                    }
                  }}
                  className="flex h-16 w-full rounded-3xl border-2 border-purple-300/50 organic-input px-4 py-2 text-center text-3xl font-mono tracking-[0.5em] ring-offset-background text-gray-800 dark:text-white dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300"
                  placeholder="000000"
                  autoFocus
                />
                {errors.code && <p className="text-sm text-red-300">{errors.code}</p>}
                <p className="text-xs text-gray-600 text-center">Введите 6-значный код из письма</p>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResendingCode}
                  className="text-sm text-purple-600 hover:text-purple-700 underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResendingCode ? (
                    <>
                      <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 inline mr-2" />
                      Отправить код повторно
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="relative">
            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={isLoading || (step === 'verify' && verificationCode.length !== 6)}
              size="lg"
              onKeyDown={(e) => {
                if (e.key === 'Tab' && e.shiftKey) {
                  e.preventDefault();
                  if (step === 'register') {
                    passwordRef.current?.focus();
                  } else {
                    codeRef.current?.focus();
                  }
                }
              }}
            >
              {renderSubmitLabel()}
            </Button>
            <button
              ref={submitButtonRef}
              type="submit"
              className="absolute opacity-0 pointer-events-none"
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>

          <div className="text-center text-sm text-gray-600">
            Уже есть аккаунт?{' '}
            <button
              type="button"
              onClick={() => setLocation('/login')}
              className="text-purple-600 hover:text-purple-700 underline font-medium"
            >
              Войти
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}