import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAppDispatch } from '@/shared/lib/hooks';
import { setAccessToken } from '@/shared/api/axiosinstance';
import { refreshThunk } from '@/entities/user/model/user.thunk';
import { Loader2 } from 'lucide-react';

export default function AuthCallback(): React.JSX.Element {
  const [location, setLocation] = useLocation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      setLocation(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (token) {
      setAccessToken(token);
      dispatch(refreshThunk()).then(() => {
        setLocation('/dashboard');
      }).catch(() => {
        setLocation('/login?error=Failed to load user');
      });
    } else {
      setLocation('/login?error=No token received');
    }
  }, [location, setLocation, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Завершение входа...</p>
      </div>
    </div>
  );
}
