import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAppSelector, useAppDispatch } from '@/shared/lib/hooks';
import { loginThunk, registerThunk, logoutThunk } from '@/entities/user/model/user.thunk';


export function useAuth(): React.JSX.Element  {
  const user = useAppSelector((state) => state.user.user);
  const isLoading = useAppSelector((state) => state.user.loading);
  const dispatch = useAppDispatch();

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const result = await dispatch(loginThunk(data));
      return result.payload;
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; password: string }) => {
      const result = await dispatch(registerThunk(data));
      return result.payload;
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await dispatch(logoutThunk());
    },
  });

  return {
    user,
    isLoading,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}

