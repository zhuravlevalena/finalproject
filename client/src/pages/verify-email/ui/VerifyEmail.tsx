import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react';
import UserService from '@/entities/user/api/user.service';
import { useAppDispatch } from '@/shared/lib/hooks';
import { refreshThunk } from '@/entities/user/model/user.thunk';

export default function VerifyEmail(): React.JSX.Element {
  const [location, setLocation] = useLocation();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Используем window.location для получения query параметров из URL
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    
    if (!tokenParam) {
      setStatus('error');
      setMessage('Токен подтверждения не найден');
      return;
    }

    setToken(tokenParam);
    // Автоматически отправляем запрос на сервер при загрузке страницы
    verifyEmail(tokenParam);
  }, []);

  const verifyEmail = async (emailToken: string) => {
    try {
      console.log('Verifying email with token:', emailToken); // Для отладки
      const result = await UserService.verifyEmail(emailToken);
      console.log('Email verification result:', result); // Для отладки
      setStatus('success');
      setMessage(result.message || 'Email успешно подтвержден!');
      
      // Обновляем данные пользователя
      await dispatch(refreshThunk()).unwrap();
      
      // Перенаправляем на главную через 3 секунды
      setTimeout(() => {
        setLocation('/');
      }, 3000);
    } catch (error: any) {
      console.error('Email verification error:', error); // Для отладки
      setStatus('error');
      setMessage(
        error.response?.data?.error || 
        error.message || 
        'Не удалось подтвердить email. Токен может быть недействительным или истекшим.'
      );
    }
  };

  const handleResend = async () => {
    try {
      await UserService.resendVerificationEmail();
      setMessage('Письмо с подтверждением отправлено повторно. Проверьте вашу почту.');
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Не удалось отправить письмо повторно.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="h-6 w-6 animate-spin" />}
            {status === 'success' && <CheckCircle2 className="h-6 w-6 text-green-500" />}
            {status === 'error' && <XCircle className="h-6 w-6 text-red-500" />}
            {status === 'loading' && 'Подтверждение email...'}
            {status === 'success' && 'Email подтвержден!'}
            {status === 'error' && 'Ошибка подтверждения'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="text-center">
              <p className="text-muted-foreground">Пожалуйста, подождите...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <p className="text-lg font-medium">{message}</p>
              <p className="text-sm text-muted-foreground">
                Вы будете перенаправлены на главную страницу через несколько секунд...
              </p>
              <Button onClick={() => setLocation('/')} className="w-full" size="lg">
                Перейти на главную
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <p className="text-muted-foreground">{message}</p>
              <div className="space-y-2">
                <Button onClick={handleResend} variant="outline" className="w-full" size="lg">
                  <Mail className="w-4 h-4 mr-2" />
                  Отправить письмо повторно
                </Button>
                <Button onClick={() => setLocation('/login')} variant="ghost" className="w-full">
                  Вернуться к входу
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
